import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '../../i18n/config';

export default function SiteFooter({ locale }: { locale: Locale }) {
    const vi = locale === 'vi';
    return <footer className="site-footer mt-auto border-t">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 md:px-8">
            <div><Link href={`/${locale}`} aria-label="Homelend"><Image src="/logo.png" alt="Homelend" width={144} height={36} className="h-9 w-auto object-contain" /></Link><p className="mt-3 max-w-sm text-sm leading-6 opacity-75">{vi?'Nền tảng tìm kiếm, mua bán và cho thuê bất động sản đáng tin cậy.':'A trusted platform for finding, buying, and renting property.'}</p></div>
            <div><h2 className="text-sm font-semibold uppercase tracking-wide">{vi?'Liên kết':'Quick links'}</h2><nav className="mt-3 flex flex-col items-start gap-2 text-sm" aria-label={vi?'Liên kết cuối trang':'Footer links'}><Link className="footer-link" href={`/${locale}`}>{vi?'Trang chủ':'Home'}</Link><Link className="footer-link" href={`/${locale}/blog`}>Blog</Link><Link className="footer-link" href={`/${locale}/customer/account`}>{vi?'Tài khoản của tôi':'My account'}</Link><Link className="footer-link" href={`/${locale}/owner/properties/create`}>{vi?'Đăng tin bất động sản':'Post a property'}</Link></nav></div>
            <div><h2 className="text-sm font-semibold uppercase tracking-wide">{vi?'Liên hệ':'Contact'}</h2><address className="mt-3 flex flex-col gap-2 text-sm not-italic opacity-80"><span>Homelend</span><a className="footer-link" href="tel:+84900000000">0900 000 000</a><a className="footer-link" href="mailto:support@homelend.vn">support@homelend.vn</a><span>{vi?'Việt Nam':'Vietnam'}</span></address></div>
        </div><div className="border-t px-4 py-4 text-center text-xs opacity-65">© {new Date().getFullYear()} Homelend. {vi?'Bảo lưu mọi quyền.':'All rights reserved.'}</div>
    </footer>;
}
