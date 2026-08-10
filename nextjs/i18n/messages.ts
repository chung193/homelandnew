import type { Locale } from './config';

type Messages = {
    siteTitle: string;
    siteDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    totalLabel: string;
    listAriaLabel: string;
    loadErrorTitle: string;
    loadErrorDetail: string;
    loadErrorHint: string;
    contact: string;
    updating: string;
    noDescription: string;
    priceLabel: string;
    areaLabel: string;
    locationLabel: string;
    statusLabel: string;
    idLabel: string;
    emptyState: string;
    viewDetail: string;
    bookNow: string;
    backToList: string;
    propertyDetailTitle: string;
    propertyNotFound: string;
    amenitiesTitle: string;
    noAmenities: string;
    photosTitle: string;
    themeLight: string;
    themeDark: string;
    themeNight: string;
    themeSystem: string;
    listingSale: string;
    listingRent: string;
    loadingMore: string;
    allLoaded: string;
    retryLoadMore: string;
    loginTitle: string;
    registerTitle: string;
    emailLabel: string;
    passwordLabel: string;
    passwordConfirmLabel: string;
    nameLabel: string;
    loginAction: string;
    registerAction: string;
    loginWithGoogle: string;
    createAccountAction: string;
    alreadyHaveAccount: string;
    notHaveAccount: string;
    loginFailed: string;
    registerFailed: string;
    verifyEmailNotice: string;
    bookingRequiresLogin: string;
    searchPlaceholder: string;
    searchProvinceLabel: string;
    searchCityLabel: string;
    searchPropertyTypeLabel: string;
    searchButton: string;
    searchResetButton: string;
    searchAllOption: string;
    searchSelectProvinceFirst: string;
    activeFiltersLabel: string;
    unitDisplay: (unit: string) => string;
};

const dictionaries: Record<Locale, Messages> = {
    vi: {
        siteTitle: 'Trang chu bat dong san',
        siteDescription: 'Danh sach bat dong san dang hoat dong duoc render phia server.',
        heroTitle: 'Homelend Client',
        heroSubtitle: 'Trang chu render phia server voi du lieu bat dong san tu backend.',
        totalLabel: 'Tong so',
        listAriaLabel: 'Danh sach bat dong san',
        loadErrorTitle: 'Khong tai duoc du lieu',
        loadErrorDetail: 'Khong the tai danh sach bat dong san.',
        loadErrorHint: 'Kiem tra backend API va bien moi truong BE_API_URL/NEXT_PUBLIC_BE_API_URL.',
        contact: 'Lien he',
        updating: 'Dang cap nhat',
        noDescription: 'Chua co mo ta chi tiet.',
        priceLabel: 'Gia',
        areaLabel: 'Dien tich',
        locationLabel: 'Vi tri',
        statusLabel: 'Trang thai',
        idLabel: 'ID',
        emptyState: 'Chua co bat dong san nao de hien thi.',
        viewDetail: 'Xem chi tiet',
        bookNow: 'Dat ngay',
        backToList: 'Quay lai danh sach',
        propertyDetailTitle: 'Chi tiet bat dong san',
        propertyNotFound: 'Khong tim thay bat dong san.',
        amenitiesTitle: 'Tien ich',
        noAmenities: 'Chua co tien ich duoc cap nhat.',
        photosTitle: 'Hinh anh',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeNight: 'Night',
        themeSystem: 'System',
        listingSale: 'Ban',
        listingRent: 'Cho thue',
        loadingMore: 'Dang tai them du lieu...',
        allLoaded: 'Da tai het danh sach bat dong san.',
        retryLoadMore: 'Thu tai lai',
        loginTitle: 'Dang nhap khach hang',
        registerTitle: 'Tao tai khoan khach hang',
        emailLabel: 'Email',
        passwordLabel: 'Mat khau',
        passwordConfirmLabel: 'Xac nhan mat khau',
        nameLabel: 'Ho va ten',
        loginAction: 'Dang nhap',
        registerAction: 'Tao tai khoan',
        loginWithGoogle: 'Dang nhap bang Google',
        createAccountAction: 'Tao tai khoan moi',
        alreadyHaveAccount: 'Da co tai khoan? Dang nhap',
        notHaveAccount: 'Chua co tai khoan? Tao tai khoan',
        loginFailed: 'Dang nhap that bai. Vui long kiem tra thong tin.',
        registerFailed: 'Tao tai khoan that bai. Vui long thu lai.',
        verifyEmailNotice: 'Tai khoan da tao. Vui long xac thuc email truoc khi dang nhap.',
        bookingRequiresLogin: 'Can dang nhap de dat ngay.',
        searchPlaceholder: 'Nhap tu khoa tim kiem bat dong san...',
        searchProvinceLabel: 'Tinh/Thanh pho',
        searchCityLabel: 'Thanh pho/Quan huyen',
        searchPropertyTypeLabel: 'Loai bat dong san',
        searchButton: 'Tim kiem',
        searchResetButton: 'Dat lai',
        searchAllOption: 'Tat ca',
        searchSelectProvinceFirst: 'Chon tinh/thanh pho truoc',
        activeFiltersLabel: 'Dang loc theo',
        unitDisplay: (unit: string) => `VND/${unit}`,
    },
    en: {
        siteTitle: 'Property Home',
        siteDescription: 'Server-rendered list of active properties from the backend.',
        heroTitle: 'Homelend Client',
        heroSubtitle: 'Server-rendered homepage with property data from the backend API.',
        totalLabel: 'Total',
        listAriaLabel: 'Property list',
        loadErrorTitle: 'Failed to load data',
        loadErrorDetail: 'Unable to fetch the property list.',
        loadErrorHint: 'Check backend API and BE_API_URL/NEXT_PUBLIC_BE_API_URL environment variables.',
        contact: 'Contact us',
        updating: 'Updating',
        noDescription: 'No detailed description available yet.',
        priceLabel: 'Price',
        areaLabel: 'Area',
        locationLabel: 'Location',
        statusLabel: 'Status',
        idLabel: 'ID',
        emptyState: 'No properties available to display yet.',
        viewDetail: 'View details',
        bookNow: 'Book now',
        backToList: 'Back to list',
        propertyDetailTitle: 'Property details',
        propertyNotFound: 'Property not found.',
        amenitiesTitle: 'Amenities',
        noAmenities: 'Amenities are not available yet.',
        photosTitle: 'Photos',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeNight: 'Night',
        themeSystem: 'System',
        listingSale: 'For sale',
        listingRent: 'For rent',
        loadingMore: 'Loading more properties...',
        allLoaded: 'All properties have been loaded.',
        retryLoadMore: 'Retry',
        loginTitle: 'Customer login',
        registerTitle: 'Create customer account',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        passwordConfirmLabel: 'Confirm password',
        nameLabel: 'Full name',
        loginAction: 'Login',
        registerAction: 'Create account',
        loginWithGoogle: 'Continue with Google',
        createAccountAction: 'Create a new account',
        alreadyHaveAccount: 'Already have an account? Login',
        notHaveAccount: 'No account yet? Create one',
        loginFailed: 'Login failed. Please check your credentials.',
        registerFailed: 'Registration failed. Please try again.',
        verifyEmailNotice: 'Account created. Please verify your email before login.',
        bookingRequiresLogin: 'Login is required before booking.',
        searchPlaceholder: 'Type keywords to find properties...',
        searchProvinceLabel: 'Province/City',
        searchCityLabel: 'City/District',
        searchPropertyTypeLabel: 'Property type',
        searchButton: 'Search',
        searchResetButton: 'Reset',
        searchAllOption: 'All',
        searchSelectProvinceFirst: 'Select a province first',
        activeFiltersLabel: 'Filtering by',
        unitDisplay: (unit: string) => `VND/${unit}`,
    },
};

export function getMessages(locale: Locale): Messages {
    return dictionaries[locale];
}
