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
    bookingSectionTitle: string;
    bookingStartDateLabel: string;
    bookingEndDateLabel: string;
    bookingNoteLabel: string;
    bookingCheckAvailability: string;
    bookingSubmitAction: string;
    bookingOnlyForRent: string;
    bookingPickDates: string;
    bookingAvailabilityReady: string;
    bookingAvailabilityTaken: string;
    bookingSuccess: string;
    bookingFailed: string;
    bookingNightsLabel: string;
    bookingTotalLabel: string;
    ownerBookingsTitle: string;
    ownerBookingsSubtitle: string;
    ownerBookingsOpenAction: string;
    ownerBookingsEmpty: string;
    ownerBookingsPendingOnlyHint: string;
    ownerApproveAction: string;
    ownerRejectAction: string;
    ownerActionSuccess: string;
    ownerActionFailed: string;
    ownerForbidden: string;
    bookingCustomerLabel: string;
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
        siteTitle: 'Trang chủ bất động sản',
        siteDescription: 'Khám phá các tin bất động sản mới nhất đã được xác thực.',
        heroTitle: 'Tin đăng mới nhất',
        heroSubtitle: '',
        totalLabel: 'Tổng số',
        listAriaLabel: 'Danh sách bất động sản',
        loadErrorTitle: 'Không tải được dữ liệu',
        loadErrorDetail: 'Không thể tải danh sách bất động sản.',
        loadErrorHint: 'Vui lòng thử tải lại trang sau ít phút.',
        contact: 'Liên hệ',
        updating: 'Đang cập nhật',
        noDescription: 'Chưa có mô tả chi tiết.',
        priceLabel: 'Giá',
        areaLabel: 'Diện tích',
        locationLabel: 'Vị trí',
        statusLabel: 'Trạng thái',
        idLabel: 'ID',
        emptyState: 'Chưa có bất động sản nào để hiển thị.',
        viewDetail: 'Xem chi tiết',
        bookNow: 'Đặt ngay',
        backToList: 'Quay lại danh sách',
        propertyDetailTitle: 'Chi tiết bất động sản',
        propertyNotFound: 'Không tìm thấy bất động sản.',
        amenitiesTitle: 'Tiện ích',
        noAmenities: 'Chưa có tiện ích được cập nhật.',
        photosTitle: 'Hình ảnh',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeNight: 'Night',
        themeSystem: 'System',
        listingSale: 'Bán',
        listingRent: 'Cho thuê',
        loadingMore: 'Đang tải thêm dữ liệu...',
        allLoaded: 'Đã tải hết danh sách bất động sản.',
        retryLoadMore: 'Thử tải lại',
        loginTitle: 'Đăng nhập khách hàng',
        registerTitle: 'Tạo tài khoản khách hàng',
        emailLabel: 'Email',
        passwordLabel: 'Mật khẩu',
        passwordConfirmLabel: 'Xác nhận mật khẩu',
        nameLabel: 'Họ và tên',
        loginAction: 'Đăng nhập',
        registerAction: 'Tạo tài khoản',
        loginWithGoogle: 'Đăng nhập bằng Google',
        createAccountAction: 'Tạo tài khoản mới',
        alreadyHaveAccount: 'Đã có tài khoản? Đăng nhập',
        notHaveAccount: 'Chưa có tài khoản? Tạo tài khoản',
        loginFailed: 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.',
        registerFailed: 'Tạo tài khoản thất bại. Vui lòng thử lại.',
        verifyEmailNotice: 'Tài khoản đã được tạo. Vui lòng xác thực email trước khi đăng nhập.',
        bookingRequiresLogin: 'Cần đăng nhập để đặt thuê.',
        bookingSectionTitle: 'Đặt lịch thuê',
        bookingStartDateLabel: 'Từ ngày',
        bookingEndDateLabel: 'Đến ngày',
        bookingNoteLabel: 'Ghi chú',
        bookingCheckAvailability: 'Kiểm tra lịch trống',
        bookingSubmitAction: 'Gửi yêu cầu đặt thuê',
        bookingOnlyForRent: 'Bất động sản này không thuộc danh mục cho thuê.',
        bookingPickDates: 'Vui lòng chọn khoảng ngày hợp lệ để đặt lịch.',
        bookingAvailabilityReady: 'Khoảng ngày đã chọn hiện còn trống.',
        bookingAvailabilityTaken: 'Khoảng ngày đã chọn đã có lịch đặt.',
        bookingSuccess: 'Đặt lịch thành công. Chủ nhà sẽ liên hệ xác nhận.',
        bookingFailed: 'Đặt lịch thất bại. Vui lòng thử lại.',
        bookingNightsLabel: 'Số đêm',
        bookingTotalLabel: 'Tạm tính',
        ownerBookingsTitle: 'Yêu cầu thuê của chủ nhà',
        ownerBookingsSubtitle: 'Danh sách yêu cầu thuê đối với các bất động sản bạn đã đăng.',
        ownerBookingsOpenAction: 'Quản lý yêu cầu thuê',
        ownerBookingsEmpty: 'Chưa có yêu cầu thuê nào cho bất động sản của bạn.',
        ownerBookingsPendingOnlyHint: 'Chỉ yêu cầu đang chờ mới có thể được duyệt hoặc từ chối.',
        ownerApproveAction: 'Duyệt',
        ownerRejectAction: 'Từ chối',
        ownerActionSuccess: 'Cập nhật yêu cầu thuê thành công.',
        ownerActionFailed: 'Cập nhật yêu cầu thuê thất bại.',
        ownerForbidden: 'Bạn không có quyền thao tác với yêu cầu thuê này.',
        bookingCustomerLabel: 'Khách đặt thuê',
        searchPlaceholder: 'Nhập từ khóa tìm kiếm bất động sản...',
        searchProvinceLabel: 'Tỉnh/Thành phố',
        searchCityLabel: 'Phường/Xã',
        searchPropertyTypeLabel: 'Loại bất động sản',
        searchButton: 'Tìm kiếm',
        searchResetButton: 'Đặt lại',
        searchAllOption: 'Tất cả',
        searchSelectProvinceFirst: 'Chọn tỉnh/thành phố trước',
        activeFiltersLabel: 'Đang lọc theo',
        unitDisplay: (unit: string) => `VND/${unit === 'month' ? 'tháng' : unit === 'day' ? 'ngày' : unit === 'night' ? 'đêm' : unit}`,
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
        bookingSectionTitle: 'Book this property',
        bookingStartDateLabel: 'From date',
        bookingEndDateLabel: 'To date',
        bookingNoteLabel: 'Note',
        bookingCheckAvailability: 'Check availability',
        bookingSubmitAction: 'Submit booking request',
        bookingOnlyForRent: 'This property is not listed for rent.',
        bookingPickDates: 'Pick a valid date range to continue.',
        bookingAvailabilityReady: 'Selected date range is available.',
        bookingAvailabilityTaken: 'Selected date range is unavailable.',
        bookingSuccess: 'Booking request submitted successfully.',
        bookingFailed: 'Failed to submit booking request. Please try again.',
        bookingNightsLabel: 'Nights',
        bookingTotalLabel: 'Estimated total',
        ownerBookingsTitle: 'Owner booking inbox',
        ownerBookingsSubtitle: 'Review booking requests for properties you listed.',
        ownerBookingsOpenAction: 'Manage owner bookings',
        ownerBookingsEmpty: 'There are no bookings for your properties yet.',
        ownerBookingsPendingOnlyHint: 'Only pending bookings can be approved or rejected.',
        ownerApproveAction: 'Approve',
        ownerRejectAction: 'Reject',
        ownerActionSuccess: 'Booking status updated.',
        ownerActionFailed: 'Failed to update booking status.',
        ownerForbidden: 'You are not allowed to update this booking.',
        bookingCustomerLabel: 'Customer',
        searchPlaceholder: 'Type keywords to find properties...',
        searchProvinceLabel: 'Province/City',
        searchCityLabel: 'Ward/Commune',
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
