<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\OwnerApplication;
use App\Models\AccountType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OwnerApplicationController extends BaseApiController
{
    public function show(Request $request): JsonResponse
    {
        $applications = $request->user()->ownerApplications()->latest()->get();
        return $this->successResponse([
            'application' => $applications->first(),
            'applications' => $applications,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'owner_type' => ['required', 'string', 'exists:account_types,code'],
            'tax_code' => ['nullable', 'required_if:owner_type,company', 'string', 'max:50', 'regex:/^[0-9-]+$/'],
            'company_name' => ['nullable', 'required_if:owner_type,company', 'string', 'max:255'],
            'company_address' => ['nullable', 'required_if:owner_type,company', 'string', 'max:500'],
            'legal_representative' => ['nullable', 'required_if:owner_type,company', 'string', 'max:255'],
            'ownership_document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);
        $user = $request->user();
        if (! $user->isIdentityVerified()) return $this->forbiddenResponse('Bạn cần xác minh CCCD trước khi đăng tin bất động sản.');
        $ownerType = AccountType::query()->where('code', $data['owner_type'])->where('is_active', true)->first();
        if (! $ownerType || $ownerType->code === 'individual') return $this->validationErrorResponse('Vui lòng chọn hộ kinh doanh, môi giới hoặc công ty.');
        $existing = OwnerApplication::query()->where('user_id', $user->id)->where('owner_type', $ownerType->code)->first();
        if ($existing?->status === 'approved') return $this->validationErrorResponse('Owner account is already approved.');

        $directory = "owner-applications/{$user->id}";
        if ($existing) {
            Storage::disk('local')->delete(array_filter([$existing->ownership_document_path]));
        }
        $application = OwnerApplication::query()->updateOrCreate(['user_id' => $user->id, 'owner_type' => $ownerType->code], [
            'tax_code' => $data['tax_code'] ?? null,
            'company_name' => $data['company_name'] ?? null,
            'company_address' => $data['company_address'] ?? null,
            'legal_representative' => $data['legal_representative'] ?? null,
            'status' => 'pending',
            'ownership_document_path' => $request->file('ownership_document')->store($directory, 'local'),
            'note' => $data['note'] ?? null, 'rejection_reason' => null, 'reviewed_by' => null, 'reviewed_at' => null,
        ]);
        return $this->successResponse($application);
    }

    public function index(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) return $this->forbiddenResponse();
        $data = $request->validate(['status'=>['nullable','in:pending,approved,rejected'],'per_page'=>['nullable','integer','min:1','max:100']]);
        $applications = OwnerApplication::query()->with(['user:id,name,email', 'user.detail'])
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
                $application->user->assignRole('property_owner');
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
        if (! $path && in_array($type, ['identity-front', 'identity-back'], true)) {
            $verification = $application->user?->identityVerification;
            $path = $type === 'identity-front' ? $verification?->identity_front_path : $verification?->identity_back_path;
        }
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
