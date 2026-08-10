import { useTranslation } from 'react-i18next';
import MetaData from '@components/MetaData';
import { useSearchParams } from "react-router-dom";
import UserDetail from './UserDetail';
import UserTable from './UserTable';

const getPageTitle = (source, t) => {
    if (source === 'self_registered') {
        return 'Khách tự đăng ký';
    }

    if (source === 'admin_created') {
        return 'Tài khoản nội bộ';
    }

    return t('pages.user.title');
};

const getPresetTitle = (preset) => {
    if (preset === 'unverified') {
        return 'Chưa xác thực email';
    }

    if (preset === 'inactive') {
        return 'Đang bị khóa';
    }

    return null;
};

const resolvePageTitle = (source, preset, t) => {
    return getPresetTitle(preset) || getPageTitle(source, t);
};

const User = () => {
    const { t } = useTranslation('dashboard');

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const source = searchParams.get("source");
    const preset = searchParams.get("preset");
    const pageTitle = resolvePageTitle(source, preset, t);

    return (
        <>
            <MetaData
                title={pageTitle}
                description={pageTitle}
            />
            {id && <UserDetail id={id} />}
            {!id && <UserTable />}
        </>
    );
};

export default User;
