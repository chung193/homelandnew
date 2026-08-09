import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainCard from '@components/MainCard';
import MetaData from '@components/MetaData';
import { useGlobalContext } from '@providers/GlobalProvider';
import PropertyAddModal from './PropertyAddModal';
import { storage } from './PropertyServices';

const PropertyCreatePage = () => {
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();
    const { showLoading, hideLoading, showNotification } = useGlobalContext();

    const handleSubmit = (data) => {
        showLoading();
        storage(data)
            .then(() => {
                showNotification('Thêm tài sản thành công', 'success');
                navigate('/dashboard/property');
            })
            .catch((err) => showNotification(err.response?.data?.message || err.message, 'error'))
            .finally(hideLoading);
    };

    return (
        <MainCard
            pageTitle={t('pages.property.addProperty')}
            pageDescription={t('pages.property.description')}
            breadcrumbs={[
                { label: t('home'), path: '/dashboard' },
                { label: t('pages.property.title'), path: '/dashboard/property' },
                { label: t('pages.property.addProperty'), path: '/dashboard/property/create' },
            ]}
        >
            <MetaData title="Create Property" description="Create property page" />
            <PropertyAddModal onSubmit={handleSubmit} onClose={() => navigate('/dashboard/property')} showFullCreateButton={false} />
        </MainCard>
    );
};

export default PropertyCreatePage;
