const getSourceLabel = (source) => {
    if (source === 'self_registered') {
        return 'Khách tự đăng ký';
    }

    if (source === 'admin_created') {
        return 'Tài khoản nội bộ';
    }

    return null;
};

const getPresetLabel = (preset) => {
    if (preset === 'unverified') {
        return 'Chưa xác thực email';
    }

    if (preset === 'inactive') {
        return 'Đang bị khóa';
    }

    return null;
};

export const getBreadcrumbs = (t, source = null, preset = null) => [
    {
        label: t('home'),
        path: '#',
    },
    {
        label: getPresetLabel(preset) || getSourceLabel(source) || t('pages.user.title'),
        path: '#',
    },
];
