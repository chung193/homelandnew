export type WalletSummary = { balance:number; posting_fee:number; test_posting_credits:number };
export type WalletResponse = { data?:Partial<WalletSummary> };
export function canPostProperty(wallet?:Partial<WalletSummary>):boolean {
    return Boolean(wallet)&&((wallet?.test_posting_credits??0)>0||(wallet?.balance??0)>=(wallet?.posting_fee??Number.MAX_SAFE_INTEGER));
}
