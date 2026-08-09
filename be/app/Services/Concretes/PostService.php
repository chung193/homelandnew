<?php

namespace App\Services\Concretes;

use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Repositories\Post\Contracts\PostRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\PostServiceInterface;
use DateTime;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\DTO\PostStatsDTO;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use SimpleXMLElement;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PostService extends BaseService implements PostServiceInterface
{
    public function __construct(protected PostRepositoryInterface $postRepository)
    {
        $this->setRepository($postRepository);
    }

    public function getPosts(): Collection
    {
        return $this->repository->getFiltered();
    }

    public function getAllPosts(): Collection
    {
        return $this->repository->all();
    }

    public function getFilteredPosts(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        $posts = $this->repository->paginateFiltered($perPage);
        $posts->getCollection()->load(['user', 'category', 'tags'])->loadCount('comments');

        $posts->each(function ($post) {
            $post->avatar = $post->getFirstMediaUrl('cover', 'preview');
        });

        return $posts;
    }

    public function getPostById(int $id): ?Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Post not found');
        }
    }

    public function createPost(array $data): Model
    {
        $featuredMediaId = $data['featured_media_id'] ?? null;
        unset($data['featured_media_id']);

        $tagInputs = $data['tags'] ?? [];
        unset($data['tags']);

        $post = $this->repository->create($data);
        $this->syncFeaturedMedia($post, $featuredMediaId);
        $this->syncPostTags($post, is_array($tagInputs) ? $tagInputs : []);

        return $post->load(['user', 'category', 'tags']);
    }

    public function updatePost(int $id, array $data): Model
    {
        try {
            $hasFeaturedMedia = array_key_exists('featured_media_id', $data);
            $featuredMediaId = $data['featured_media_id'] ?? null;
            unset($data['featured_media_id']);

            $tagInputs = $data['tags'] ?? null;
            unset($data['tags']);

            $post = $this->repository->update($id, $data);
            if ($hasFeaturedMedia) {
                $this->syncFeaturedMedia($post, $featuredMediaId);
            }
            if (is_array($tagInputs)) {
                $this->syncPostTags($post, $tagInputs);
            }

            return $post->load(['user', 'category', 'tags']);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Post not found');
        }
    }

    public function deletePost(int $id): bool
    {
        try {
            $this->repository->delete($id);

            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Post not found');
        }
    }

    public function getActivePosts(): Collection
    {
        return $this->postRepository->getActivePosts();
    }

    public function deletePosts(array $ids): int
    {
        try {
            $count = $this->postRepository->bulkDelete($ids);
            if ($count === 0) {
                abort(404, 'posts not found');
            }
            return $count;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Post not found');
        }
    }

    public function getPostsCount(): PostStatsDTO
    {
        $total = $this->repository->count();
        $draft = $this->repository->count(['status' => 'draft']);
        $published = $this->repository->count(['status' => 'published']);
        $pending = $this->repository->count(['status' => 'pending']);
        $archived = $this->repository->count(['status' => 'archived']);

        return new PostStatsDTO(
            $total,
            $draft,
            $published,
            $pending,
            $archived
        );
    }

    public function importWordpressXml(UploadedFile $file, int $userId, array $options = []): array
    {
        $defaultStatus = (string) ($options['default_status'] ?? 'draft');
        $defaultType = (string) ($options['default_type'] ?? 'article');
        $skipExisting = (bool) ($options['skip_existing'] ?? true);
        $allowComments = (bool) ($options['allow_comments'] ?? true);
        $featured = (bool) ($options['featured'] ?? false);

        $xml = $this->loadWordpressXml($file->getRealPath());
        $channel = $xml->channel;

        if (!$channel) {
            throw new RuntimeException('Invalid WordPress XML: missing channel element');
        }

        $contentNs = $channel->getNamespaces(true)['content'] ?? null;
        $wpNs = $channel->getNamespaces(true)['wp'] ?? null;

        if (!$contentNs || !$wpNs) {
            throw new RuntimeException('Invalid WordPress XML: missing content/wp namespace');
        }

        $items = $channel->item ?? [];
        $stats = [
            'total_items' => 0,
            'post_items' => 0,
            'imported' => 0,
            'skipped' => 0,
            'errors' => [],
            'created_post_ids' => [],
        ];

        DB::beginTransaction();

        try {
            foreach ($items as $item) {
                $stats['total_items']++;
                $wp = $item->children($wpNs);
                $content = $item->children($contentNs);

                $postType = (string) ($wp->post_type ?? '');
                if ($postType !== 'post') {
                    continue;
                }

                $stats['post_items']++;

                $title = trim((string) ($item->title ?? ''));
                $slugCandidate = trim((string) ($wp->post_name ?? ''));
                $slugBase = $slugCandidate !== '' ? $slugCandidate : Str::slug($title);

                if ($slugBase === '') {
                    $stats['skipped']++;
                    $stats['errors'][] = [
                        'reason' => 'missing_title_and_slug',
                        'title' => $title,
                    ];
                    continue;
                }

                if ($skipExisting && Post::where('slug', $slugBase)->exists()) {
                    $stats['skipped']++;
                    continue;
                }

                $categoryId = $this->resolveOrCreateCategoryId($item);
                $name = $title !== '' ? $title : 'Untitled post';
                $rawContent = (string) ($content->encoded ?? '');
                $rawExcerpt = trim((string) ($item->description ?? ''));
                $excerpt = $rawExcerpt === '' ? trim((string) ($content->encoded ?? '')) : $rawExcerpt;
                $status = $this->mapWordpressStatus((string) ($wp->status ?? ''), $defaultStatus);
                $publishedAt = $this->resolvePublishedAt((string) ($wp->post_date_gmt ?? ''), (string) ($wp->post_date ?? ''));
                $slug = $this->ensureUniquePostSlug($slugBase);

                $post = $this->repository->create([
                    'name' => $name,
                    'slug' => $slug,
                    'description' => Str::limit(strip_tags($excerpt), 1000),
                    'content' => $rawContent !== '' ? $rawContent : $excerpt,
                    'category_id' => $categoryId ?: null,
                    'user_id' => $userId,
                    'status' => $status,
                    'type' => $defaultType,
                    'views' => 0,
                    'published_at' => $publishedAt,
                    'featured' => $featured,
                    'allow_comments' => $allowComments,
                ]);

                $stats['imported']++;
                $stats['created_post_ids'][] = $post->id;
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        return $stats;
    }

    private function loadWordpressXml(?string $path): SimpleXMLElement
    {
        if (!$path || !is_file($path)) {
            throw new RuntimeException('Import file not found');
        }

        $previous = libxml_use_internal_errors(true);
        $xml = simplexml_load_file($path);
        $errors = libxml_get_errors();
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if ($xml === false) {
            $firstError = $errors[0]->message ?? 'Malformed XML';
            throw new RuntimeException('Cannot parse XML: ' . trim($firstError));
        }

        return $xml;
    }

    private function resolveOrCreateCategoryId(SimpleXMLElement $item): ?int
    {
        foreach ($item->category ?? [] as $node) {
            $attributes = $node->attributes();
            $domain = (string) ($attributes['domain'] ?? '');
            if ($domain !== 'category') {
                continue;
            }

            $name = trim((string) $node);
            if ($name === '') {
                continue;
            }

            $nicename = trim((string) ($attributes['nicename'] ?? ''));
            $slugBase = $nicename !== '' ? Str::slug($nicename) : Str::slug($name);
            $slug = $this->ensureUniqueCategorySlug($slugBase);

            $category = Category::firstOrCreate(
                ['name' => $name],
                [
                    'slug' => $slug,
                    'description' => null,
                    'is_active' => true,
                    'sort_order' => 0,
                ]
            );

            $resolvedId = is_numeric($category->id) ? (int) $category->id : 0;
            if ($resolvedId > 0) {
                return $resolvedId;
            }

            $fallback = Category::query()->where('name', $name)->value('id');
            if (is_numeric($fallback) && (int) $fallback > 0) {
                return (int) $fallback;
            }

            return null;
        }

        return null;
    }

    private function ensureUniquePostSlug(string $base): string
    {
        $slug = Str::slug($base);
        if ($slug === '') {
            $slug = 'post';
        }

        $originalSlug = $slug;
        $i = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $i;
            $i++;
        }

        return $slug;
    }

    private function ensureUniqueCategorySlug(string $base): string
    {
        $slug = Str::slug($base);
        if ($slug === '') {
            $slug = 'category';
        }

        $existingBySlug = Category::where('slug', $slug)->first();
        if (!$existingBySlug) {
            return $slug;
        }

        $originalSlug = $slug;
        $i = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $i;
            $i++;
        }

        return $slug;
    }

    private function mapWordpressStatus(string $wordpressStatus, string $defaultStatus): string
    {
        return match ($wordpressStatus) {
            'publish' => 'published',
            'draft', 'auto-draft' => 'draft',
            'pending' => 'pending',
            default => $defaultStatus,
        };
    }

    private function resolvePublishedAt(string $postDateGmt, string $postDate): ?string
    {
        $candidate = trim($postDateGmt) !== '' ? trim($postDateGmt) : trim($postDate);
        if ($candidate === '' || $candidate === '0000-00-00 00:00:00') {
            return null;
        }

        try {
            return (new DateTime($candidate))->format('Y-m-d H:i:s');
        } catch (\Throwable) {
            return null;
        }
    }

    private function syncPostTags(Model $post, array $tagInputs): void
    {
        $tagIds = [];

        foreach ($tagInputs as $input) {
            if (is_int($input) || ctype_digit((string) $input)) {
                $tagId = (int) $input;
                if ($tagId > 0) {
                    $tagIds[] = $tagId;
                }
                continue;
            }

            $rawName = trim((string) $input);
            if ($rawName === '') {
                continue;
            }

            $slug = Str::slug($rawName);
            if ($slug === '') {
                $slug = 'tag-' . substr(md5($rawName), 0, 12);
            }

            $tag = Tag::query()->firstOrCreate(
                ['slug' => $slug],
                ['name' => $rawName]
            );

            $tagIds[] = (int) $tag->id;
        }

        $post->tags()->sync(array_values(array_unique($tagIds)));
    }

    private function syncFeaturedMedia(Model $post, ?int $mediaId): void
    {
        $post->clearMediaCollection('cover');

        if (!$mediaId) {
            return;
        }

        $sourceMedia = Media::query()->find($mediaId);
        if (!$sourceMedia) {
            return;
        }

        $sourceMedia->copy($post, 'cover');
    }
}
