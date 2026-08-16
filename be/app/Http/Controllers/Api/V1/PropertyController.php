<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\PropertyStoreRequest;
use App\Http\Requests\Api\V1\PropertyUpdateRequest;
use App\Http\Resources\Api\Property\PropertyResource;
use App\Services\Contracts\PropertyServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class PropertyController extends BaseApiController
{
    public function __construct(protected readonly PropertyServiceInterface $propertyService) {}

    public function index(): JsonResponse
    {
        $properties = $this->propertyService->getFilteredProperties(request(), 15);

        return $this->successResponse(PropertyResource::collection($properties));
    }

    public function all(): JsonResponse
    {
        $properties = $this->propertyService->getProperties();

        return $this->successResponse(PropertyResource::collection($properties));
    }

    public function show(int $id): JsonResponse
    {
        $property = $this->propertyService->getPropertyById($id);
        $property->load(['propertyType', 'amenities', 'user.detail']);

        return $this->successResponse(new PropertyResource($property));
    }

    public function store(PropertyStoreRequest $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isAdmin() && (! $user->isIdentityVerified() || $user->ownerApplication?->status !== 'approved')) {
            return $this->forbiddenResponse('An approved property owner account is required.');
        }

        $property = DB::transaction(function () use ($request, $user) {
            $data = $request->validated();
            if (isset($data['description'])) {
                $purifierConfig = \HTMLPurifier_Config::createDefault();
                $purifierConfig->set('HTML.Allowed', 'p,br,strong,b,em,i,u,h2,ul,ol,li,blockquote');
                $data['description'] = (new \HTMLPurifier($purifierConfig))->purify($data['description']);
            }
            $data['user_id'] = $user->id;
            $data['status'] = 'pending';
            $data['is_active'] = false;
            $fee = $user->isAdmin() ? 0 : (int) config('momo.posting_fee');

            if ($fee > 0) {
                /** @var User $lockedUser */
                $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);
                if ((int) $lockedUser->test_posting_credits > 0) {
                    $lockedUser->decrement('test_posting_credits');
                    $fee = 0;
                } elseif ((int) $lockedUser->wallet_balance < $fee) {
                    abort(422, 'Insufficient wallet balance.');
                } else {
                    $lockedUser->decrement('wallet_balance', $fee);
                    $lockedUser->refresh();
                    WalletTransaction::query()->create([
                        'user_id'=>$lockedUser->id,'type'=>'posting_fee','amount'=>-$fee,
                        'balance_after'=>$lockedUser->wallet_balance,'status'=>'paid','provider'=>'wallet','paid_at'=>now(),
                    ]);
                }
            }
            $data['posting_fee'] = $fee;
            return $this->propertyService->createProperty($data);
        });

        return $this->createdResponse(new PropertyResource($property));
    }

    public function update(PropertyUpdateRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();
        if (isset($data['description'])) {
            $purifierConfig = \HTMLPurifier_Config::createDefault();
            $purifierConfig->set('HTML.Allowed', 'p,br,strong,b,em,i,u,h2,ul,ol,li,blockquote');
            $data['description'] = (new \HTMLPurifier($purifierConfig))->purify($data['description']);
        }
        $property = $this->propertyService->updateProperty($id, $data);

        return $this->successResponse(new PropertyResource($property));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->propertyService->deleteProperty($id);

        return $this->noContentResponse();
    }

    public function active(): JsonResponse
    {
        $properties = $this->propertyService->getActiveProperties();

        return $this->successResponse(PropertyResource::collection($properties));
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:properties,id'],
        ]);

        $count = $this->propertyService->deleteProperties($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} properties successfully",
        ]);
    }
}
