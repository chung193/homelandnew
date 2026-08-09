import { useTranslation } from 'react-i18next';
import MetaData from '@components/MetaData';
import { useSearchParams } from "react-router-dom";
import UserDetail from './UserDetail';
import UserTable from './UserTable';

const User = () => {
    const { t } = useTranslation('dashboard');

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    return (
        <>
            <MetaData
                title={t('pages.user.title')}
                description={t('pages.user.title')}
            />
            {id && <UserDetail id={id} />}
            {!id && <UserTable />}
        </>
    );
};

export default User;
