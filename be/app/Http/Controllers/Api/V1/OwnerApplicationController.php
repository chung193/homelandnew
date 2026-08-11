<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\OwnerApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OwnerApplicationController extends BaseApiController
{
    public function show(Request $request): JsonResponse
    {
        return $this->successResponse($request->user()->ownerApplication);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'identity_front' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'identity_back' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'ownership_document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);
        $user = $request->user();
        $existing = OwnerApplication::query()->where('user_id', $user->id)->first();
        if ($existing?->status === 'approved') return $this->validationErrorResponse('Owner account is already approved.');

        $directory = "owner-applications/{$user->id}";
        if ($existing) {
            Storage::disk('local')->delete(array_filter([$existing->identity_front_path, $existing->identity_back_path, $existing->ownership_document_path]));
        }
        $application = OwnerApplication::query()->updateOrCreate(['user_id' => $user->id], [
            'status' => 'pending',
            'identity_front_path' => $request->file('identity_front')->store($directory, 'local'),
            'identity_back_path' => $request->file('identity_back')?->store($directory, 'local'),
            'ownership_document_path' => $request->file('ownership_document')->store($directory, 'local'),
            'note' => $data['note'] ?? null, 'rejection_reason' => null, 'reviewed_by' => null, 'reviewed_at' => null,
        ]);
        return $this->successResponse($application);
    }

    public function index(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) return $this->forbiddenResponse();
        $data = $request->validate(['status'=>['nullable','in:pending,approved,rejected'],'per_page'=>['nullable','integer','min:1','max:100']]);
        $applications = OwnerApplication::query()->with('user:id,name,email')
            ->when($data['status'] ?? null, fn($query,$status)=>$query->where('status',$status))
            ->latest()->paginate((int)($data['per_page'] ?? 20))->withQueryString();
        $counts = OwnerApplication::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return response()->json([
            'data' => $applications,
            'status_counts' => [
                'total' => (int) $counts->sum(),
                'pending' => (int) ($counts['pending'] ?? 0),
                'approved' => (int) ($counts['approved'] ?? 0),
                'rejected' => (int) ($counts['rejected'] ?? 0),
            ],
        ]);
    }

    public function adminShow(Request $request, OwnerApplication $application): JsonResponse
    {
        if (! $request->user()->isAdmin()) return $this->forbiddenResponse();
        return $this->successResponse($application->load(['user:id,name,email,account_type,wallet_balance,test_posting_credits', 'user.detail']));
    }

    public function review(Request $request, OwnerApplication $application): JsonResponse
    {
        if (! $request->user()->isAdmin()) return $this->forbiddenResponse();
        $data = $request->validate(['status' => ['required', 'in:approved,rejected'], 'rejection_reason' => ['nullable','string','max:2000']]);
        if ($data['status'] === 'rejected' && empty($data['rejection_reason'])) return $this->validationErrorResponse('Rejection reason is required.');

        DB::transaction(function () use ($application, $request, $data) {
            $application->update(['status'=>$data['status'],'rejection_reason'=>$data['rejection_reason'] ?? null,'reviewed_by'=>$request->user()->id,'reviewed_at'=>now()]);
            if ($data['status'] === 'approved') {
                $application->user()->update(['account_type' => 'property_owner']);
                $application->user->syncRoles(['property_owner']);
            }
        });
        return $this->successResponse($application->fresh('user:id,name,email,account_type'));
    }

    public function document(Request $request, OwnerApplication $application, string $type)
    {
        if (! $request->user()->isAdmin()) abort(403);
        $field = match ($type) {
            'identity-front' => 'identity_front_path',
            'identity-back' => 'identity_back_path',
            'ownership' => 'ownership_document_path',
            default => abort(404),
        };
        $path = $application->{$field};
        abort_unless($path && Storage::disk('local')->exists($path), 404);
        return Storage::disk('local')->download($path);
    }

    public function setTestPostingCredits(Request $request, OwnerApplication $application): JsonResponse
    {
        if (! $request->user()->isAdmin()) return $this->forbiddenResponse();
        if ($application->status !== 'approved') return $this->validationErrorResponse('Only approved owner accounts can receive test posting credits.');
        $data = $request->validate(['credits' => ['required', 'integer', 'min:0', 'max:1000']]);
        $application->user()->update(['test_posting_credits' => $data['credits']]);
        return $this->successResponse(['test_posting_credits' => (int) $data['credits']]);
    }
}
