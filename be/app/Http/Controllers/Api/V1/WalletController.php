<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class WalletController extends BaseApiController
{
    public function show(Request $request): JsonResponse
    {
        return $this->successResponse(['balance'=>(int)$request->user()->wallet_balance,'posting_fee'=>config('momo.posting_fee'),'test_posting_credits'=>(int)$request->user()->test_posting_credits,'transactions'=>WalletTransaction::where('user_id',$request->user()->id)->latest()->limit(20)->get()]);
    }

    public function createMomoPayment(Request $request): JsonResponse
    {
        $data = $request->validate(['amount' => ['required','integer','min:10000','max:50000000']]);
        foreach (['partner_code','access_key','secret_key','ipn_url','redirect_url'] as $key) if (!config("momo.$key")) return $this->errorResponse('MoMo is not configured.', 503);
        $orderId = 'TOPUP_' . now()->format('YmdHis') . '_' . Str::upper(Str::random(8));
        $requestId = (string) Str::uuid();
        $extraData = base64_encode(json_encode(['user_id'=>$request->user()->id], JSON_THROW_ON_ERROR));
        $orderInfo = 'Nap tien tai khoan Homeland';
        $raw = 'accessKey='.config('momo.access_key').'&amount='.$data['amount'].'&extraData='.$extraData.'&ipnUrl='.config('momo.ipn_url').'&orderId='.$orderId.'&orderInfo='.$orderInfo.'&partnerCode='.config('momo.partner_code').'&redirectUrl='.config('momo.redirect_url').'&requestId='.$requestId.'&requestType=captureWallet';
        $payload = ['partnerCode'=>config('momo.partner_code'),'partnerName'=>'Homeland','storeId'=>'Homeland','requestId'=>$requestId,'amount'=>$data['amount'],'orderId'=>$orderId,'orderInfo'=>$orderInfo,'redirectUrl'=>config('momo.redirect_url'),'ipnUrl'=>config('momo.ipn_url'),'lang'=>'vi','requestType'=>'captureWallet','autoCapture'=>true,'extraData'=>$extraData,'signature'=>hash_hmac('sha256',$raw,config('momo.secret_key'))];
        $transaction = WalletTransaction::create(['user_id'=>$request->user()->id,'type'=>'topup','amount'=>$data['amount'],'status'=>'pending','provider'=>'momo','order_id'=>$orderId,'request_id'=>$requestId]);
        $response = Http::timeout(35)->post(config('momo.endpoint'), $payload);
        $body = $response->json();
        if (! $response->successful() || ($body['resultCode'] ?? -1) !== 0) { $transaction->update(['status'=>'failed','metadata'=>$body]); return $this->errorResponse($body['message'] ?? 'Could not create MoMo payment.', 422); }
        return $this->successResponse(['pay_url'=>$body['payUrl'] ?? null,'order_id'=>$orderId]);
    }

    public function momoIpn(Request $request): JsonResponse
    {
        $data = $request->all();
        $keys = ['accessKey','amount','extraData','message','orderId','orderInfo','orderType','partnerCode','payType','requestId','responseTime','resultCode','transId'];
        $values = array_merge($data, ['accessKey'=>config('momo.access_key')]);
        $raw = collect($keys)->map(fn($key) => $key.'='.($values[$key] ?? ''))->implode('&');
        if (!isset($data['signature']) || !hash_equals(hash_hmac('sha256',$raw,config('momo.secret_key')), $data['signature'])) return response()->json(['message'=>'Invalid signature'], 400);
        $transaction = WalletTransaction::where('order_id',$data['orderId'] ?? '')->first();
        if (!$transaction || (int)$transaction->amount !== (int)($data['amount'] ?? 0)) return response()->json(['message'=>'Invalid transaction'], 400);
        if ((int)($data['resultCode'] ?? -1) !== 0) { $transaction->update(['status'=>'failed','metadata'=>$data]); return response()->json(['message'=>'received']); }
        DB::transaction(function () use ($transaction, $data) {
            $locked = WalletTransaction::lockForUpdate()->find($transaction->id);
            if ($locked->status === 'paid') return;
            $user = User::lockForUpdate()->findOrFail($locked->user_id);
            $user->increment('wallet_balance', (int)$locked->amount); $user->refresh();
            $locked->update(['status'=>'paid','balance_after'=>$user->wallet_balance,'provider_transaction_id'=>(string)($data['transId'] ?? ''),'metadata'=>$data,'paid_at'=>now()]);
        });
        return response()->json(['message'=>'received']);
    }
}
