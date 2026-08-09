<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\User;
use App\Models\Post;
use App\Models\Page;
use App\Models\Comment;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class StatisticsController extends BaseApiController
{
    /**
     * Get dashboard statistics
     */
    public function dashboard(): JsonResponse
    {
        try {
            $now = Carbon::now();
            $lastMonth = $now->copy()->subMonth();
            $lastYear = $now->copy()->subYear();

            // Total counts
            $totalUsers = User::count();
            $totalPosts = Post::count();
            $totalPages = Page::count();
            $totalComments = Comment::count();
            $totalCategories = Category::count();
            $totalTags = Tag::count();

            // This month stats
            $usersThisMonth = User::whereBetween('created_at', [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth()
            ])->count();

            $postsThisMonth = Post::whereBetween('created_at', [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth()
            ])->count();

            $commentsThisMonth = Comment::whereBetween('created_at', [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth()
            ])->count();

            // Last month stats
            $usersLastMonth = User::whereBetween('created_at', [
                $lastMonth->copy()->startOfMonth(),
                $lastMonth->copy()->endOfMonth()
            ])->count();

            $postsLastMonth = Post::whereBetween('created_at', [
                $lastMonth->copy()->startOfMonth(),
                $lastMonth->copy()->endOfMonth()
            ])->count();

            $commentsLastMonth = Comment::whereBetween('created_at', [
                $lastMonth->copy()->startOfMonth(),
                $lastMonth->copy()->endOfMonth()
            ])->count();

            // Calculate trends
            $usersTrend = $usersLastMonth > 0
                ? (($usersThisMonth - $usersLastMonth) / $usersLastMonth * 100)
                : 0;

            $postsTrend = $postsLastMonth > 0
                ? (($postsThisMonth - $postsLastMonth) / $postsLastMonth * 100)
                : 0;

            $commentsTrend = $commentsLastMonth > 0
                ? (($commentsThisMonth - $commentsLastMonth) / $commentsLastMonth * 100)
                : 0;

            // Active users
            $activeUsers = User::where('is_active', true)->count();
            $inactiveUsers = User::where('is_active', false)->count();

            // Posts by status
            $publishedPosts = Post::where('status', 'published')->count();
            $draftPosts = Post::where('status', 'draft')->count();

            // Comments by status
            $approvedComments = Comment::where('is_approved', true)->count();
            $pendingComments = Comment::where('is_approved', false)->count();

            // Posts by category
            $postsByCategory = Category::withCount('posts')
                ->orderByDesc('posts_count')
                ->limit(5)
                ->get()
                ->map(fn($cat) => [
                    'name' => $cat->name,
                    'count' => $cat->posts_count
                ]);

            // Users by role
            $usersByRole = \DB::table('model_has_roles')
                ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->where('model_has_roles.model_type', User::class)
                ->select('roles.name', \DB::raw('count(*) as count'))
                ->groupBy('roles.name')
                ->get()
                ->map(fn($role) => [
                    'name' => $role->name,
                    'count' => $role->count
                ]);

            // Recent activity
            $recentUsers = User::latest('created_at')
                ->limit(5)
                ->get(['id', 'name', 'email', 'is_active', 'created_at']);

            $recentPosts = Post::with('category')
                ->latest('created_at')
                ->limit(5)
                ->get(['id', 'name', 'category_id', 'status', 'created_at']);

            $recentComments = Comment::with('commentable')
                ->latest('created_at')
                ->limit(5)
                ->get(['id', 'body', 'commentable_id', 'commentable_type', 'is_approved', 'created_at']);

            return $this->successResponse([
                'summary' => [
                    [
                        'title' => 'Total Users',
                        'value' => $totalUsers,
                        'trend' => round($usersTrend, 2),
                        'icon' => 'Users',
                        'color' => 'primary'
                    ],
                    [
                        'title' => 'Total Posts',
                        'value' => $totalPosts,
                        'trend' => round($postsTrend, 2),
                        'icon' => 'FileText',
                        'color' => 'success'
                    ],
                    [
                        'title' => 'Total Comments',
                        'value' => $totalComments,
                        'trend' => round($commentsTrend, 2),
                        'icon' => 'MessageSquare',
                        'color' => 'warning'
                    ],
                    [
                        'title' => 'Total Pages',
                        'value' => $totalPages,
                        'trend' => 0,
                        'icon' => 'FileCode',
                        'color' => 'info'
                    ]
                ],
                'details' => [
                    'users' => [
                        'total' => $totalUsers,
                        'active' => $activeUsers,
                        'inactive' => $inactiveUsers,
                        'thisMonth' => $usersThisMonth,
                        'lastMonth' => $usersLastMonth,
                    ],
                    'posts' => [
                        'total' => $totalPosts,
                        'published' => $publishedPosts,
                        'draft' => $draftPosts,
                        'thisMonth' => $postsThisMonth,
                        'lastMonth' => $postsLastMonth,
                    ],
                    'comments' => [
                        'total' => $totalComments,
                        'approved' => $approvedComments,
                        'pending' => $pendingComments,
                        'thisMonth' => $commentsThisMonth,
                        'lastMonth' => $commentsLastMonth,
                    ],
                    'categories' => $totalCategories,
                    'tags' => $totalTags,
                ],
                'charts' => [
                    'postsByCategory' => $postsByCategory,
                    'usersByRole' => $usersByRole,
                ],
                'recentActivity' => [
                    'users' => $recentUsers,
                    'posts' => $recentPosts,
                    'comments' => $recentComments,
                ]
            ]);
        } catch (\Exception $e) {
            return $this->errorMessage($e->getMessage(), 500);
        }
    }

    /**
     * Get monthly trends
     */
    public function monthlyTrends(): JsonResponse
    {
        try {
            $months = [];
            $userCounts = [];
            $postCounts = [];
            $commentCounts = [];

            for ($i = 11; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $monthKey = $date->format('M Y');
                $months[] = $monthKey;

                $users = User::whereBetween('created_at', [
                    $date->copy()->startOfMonth(),
                    $date->copy()->endOfMonth()
                ])->count();

                $posts = Post::whereBetween('created_at', [
                    $date->copy()->startOfMonth(),
                    $date->copy()->endOfMonth()
                ])->count();

                $comments = Comment::whereBetween('created_at', [
                    $date->copy()->startOfMonth(),
                    $date->copy()->endOfMonth()
                ])->count();

                $userCounts[] = $users;
                $postCounts[] = $posts;
                $commentCounts[] = $comments;
            }

            return $this->successResponse([
                'labels' => $months,
                'datasets' => [
                    [
                        'label' => 'Users',
                        'data' => $userCounts,
                        'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                        'borderColor' => 'rgb(59, 130, 246)',
                        'tension' => 0.4,
                    ],
                    [
                        'label' => 'Posts',
                        'data' => $postCounts,
                        'backgroundColor' => 'rgba(34, 197, 94, 0.1)',
                        'borderColor' => 'rgb(34, 197, 94)',
                        'tension' => 0.4,
                    ],
                    [
                        'label' => 'Comments',
                        'data' => $commentCounts,
                        'backgroundColor' => 'rgba(251, 146, 60, 0.1)',
                        'borderColor' => 'rgb(251, 146, 60)',
                        'tension' => 0.4,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return $this->errorMessage($e->getMessage(), 500);
        }
    }
}
