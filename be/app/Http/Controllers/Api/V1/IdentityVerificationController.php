<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Api\BaseApiController;
use App\Models\IdentityVerification;
use App\Models\AccountType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class IdentityVerificationController extends BaseApiController {
    public function show(Request $request):JsonResponse {
        $verification=$request->user()->identityVerification;
        return $this->successResponse(['status'=>$request->user()->isIdentityVerified()?'approved':($verification?->status??'unsubmitted'),'verification_type'=>$verification?->verification_type,'tax_code'=>$verification?->tax_code,'rejection_reason'=>$verification?->rejection_reason]);
    }
    public function store(Request $request):JsonResponse {
        $base=$request->validate(['verification_type'=>['required','in:individual']]);
        $type=AccountType::query()->where('code','individual')->where('is_active',true)->first();
        if(!$type)return $this->validationErrorResponse('Loại tài khoản không hoạt động.');
        $data=$request->validate([
            'verification_type'=>['required','string'],
            'identity_front'=>[$type->document_kind==='identity'?'required':'nullable','file','mimes:jpg,jpeg,png,pdf','max:5120'],
            'identity_back'=>[$type->requires_back_side?'required':'nullable','file','mimes:jpg,jpeg,png,pdf','max:5120'],
            'supporting_document'=>[$type->document_kind==='supporting'?'required':'nullable','file','mimes:jpg,jpeg,png,pdf','max:10240'],
            'tax_code'=>[$type->requires_tax_code?'required':'nullable','string','max:50','regex:/^[0-9-]+$/'],
        ]);
        $user=$request->user();
        $existing=$user->identityVerification; if($existing)Storage::disk('local')->delete(array_filter([$existing->identity_front_path,$existing->identity_back_path,$existing->supporting_document_path]));
        $directory="identity-verifications/{$user->id}";
        $item=IdentityVerification::query()->updateOrCreate(['user_id'=>$user->id],[
            'verification_type'=>$data['verification_type'],
            'identity_front_path'=>$request->file('identity_front')?->store($directory,'local'),'identity_back_path'=>$request->file('identity_back')?->store($directory,'local'),
            'supporting_document_path'=>$request->file('supporting_document')?->store($directory,'local'),'tax_code'=>$data['tax_code']??null,
            'status'=>'pending','rejection_reason'=>null,'reviewed_by'=>null,'reviewed_at'=>null,
        ]);
        return $this->successResponse($item);
    }
    public function index(Request $request):JsonResponse {
        if(!$request->user()->isAdmin())return $this->forbiddenResponse();
        return $this->successResponse(IdentityVerification::query()->with(['user:id,name,email','accountType'])->latest()->paginate(20));
    }
    public function review(Request $request,IdentityVerification $verification):JsonResponse {
        if(!$request->user()->isAdmin())return $this->forbiddenResponse();
        $data=$request->validate(['status'=>['required','in:approved,rejected'],'rejection_reason'=>['nullable','string','max:2000']]);
        if($data['status']==='rejected'&&blank($data['rejection_reason']??null))return $this->validationErrorResponse('Vui lòng nhập lý do từ chối.');
        $verification->update(['status'=>$data['status'],'rejection_reason'=>$data['rejection_reason']??null,'reviewed_by'=>$request->user()->id,'reviewed_at'=>now()]);
        return $this->successResponse($verification);
    }
    public function document(Request $request,IdentityVerification $verification,string $side) {
        if(!$request->user()->isAdmin())abort(403);$field=match($side){'front'=>'identity_front_path','back'=>'identity_back_path','supporting'=>'supporting_document_path',default=>abort(404)};$path=$verification->{$field};
        abort_unless($path && Storage::disk('local')->exists($path),404);return Storage::disk('local')->download($path);
    }
}
