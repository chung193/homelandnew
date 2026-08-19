export type AccountTab='profile'|'password';

export default function AccountTabs({activeTab,onChange}:{activeTab:AccountTab;onChange:(tab:AccountTab)=>void}) {
    return <div className="account-tabs grid grid-cols-2 gap-1 rounded-xl border p-1" role="tablist" aria-label="Quản lý tài khoản">
        {([['profile','Thông tin cá nhân'],['password','Đổi mật khẩu']] as const).map(([tab,label])=><button key={tab} type="button" role="tab" aria-selected={activeTab===tab} className={`account-tab rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4 ${activeTab===tab?'account-tab-active':''}`} onClick={()=>onChange(tab)}>{label}</button>)}
    </div>;
}
