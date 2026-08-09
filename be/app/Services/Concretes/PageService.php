<?php

namespace App\Services\Concretes;

use App\Repositories\Page\Contracts\PageRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\PageServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PageService extends BaseService implements PageServiceInterface
{
    public function __construct(protected PageRepositoryInterface $pageRepository)
    {
        $this->setRepository($pageRepository);
    }

    public function getPages(): Collection
    {
        return $this->repository->getFiltered();
    }

    public function getAllPages(): Collection
    {
        return $this->repository->all();
    }

    public function getFilteredPages(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        $pages = $this->repository->paginateFiltered($perPage);
        $pages->getCollection()->load('user')->loadCount('comments');

        $pages->each(function ($page) {
            $page->avatar = $page->getFirstMediaUrl('cover', 'preview');
        });

        return $pages;
    }

    public function getPageById(int $id): ?Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Page not found');
        }
    }

    public function createPage(array $data): Model
    {
        $featuredMediaId = $data['featured_media_id'] ?? null;
        unset($data['featured_media_id']);

        $page = $this->repository->create($data);
        $this->syncFeaturedMedia($page, $featuredMediaId);

        return $page;
    }

    public function updatePage(int $id, array $data): Model
    {
        try {
            $hasFeaturedMedia = array_key_exists('featured_media_id', $data);
            $featuredMediaId = $data['featured_media_id'] ?? null;
            unset($data['featured_media_id']);

            $page = $this->repository->update($id, $data);
            if ($hasFeaturedMedia) {
                $this->syncFeaturedMedia($page, $featuredMediaId);
            }

            return $page;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Page not found');
        }
    }

    public function deletePage(int $id): bool
    {
        try {
            $this->repository->delete($id);

            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Page not found');
        }
    }

    public function deletePages(array $ids): int
    {
        try {
            $count = $this->pageRepository->bulkDelete($ids);
            if ($count === 0) {
                abort(404, 'pages not found');
            }
            return $count;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Page not found');
        }
    }

    public function getActivePages(): Collection
    {
        return $this->pageRepository->getActivePages();
    }

    private function syncFeaturedMedia(Model $page, ?int $mediaId): void
    {
        $page->clearMediaCollection('cover');

        if (!$mediaId) {
            return;
        }

        $sourceMedia = Media::query()->find($mediaId);
        if (!$sourceMedia) {
            return;
        }

        $sourceMedia->copy($page, 'cover');
    }
}
