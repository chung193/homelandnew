export function addIndex(array) {
    return array.map((item, index) => ({
        ...item,
        index: index + 1, // Thêm số thứ tự, bắt đầu từ 1
    }));
}

export function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD')                     // tách dấu ra khỏi ký tự
        .replace(/[\u0300-\u036f]/g, '')      // xóa các dấu (accent)
        .replace(/đ/g, 'd')                   // chuyển đ -> d
        .replace(/[^a-z0-9\s-]/g, '')         // xóa ký tự đặc biệt
        .replace(/\s+/g, '-')                 // thay khoảng trắng bằng dấu -
        .replace(/-+/g, '-')                  // loại bỏ dấu - thừa
        .replace(/^-+|-+$/g, '');             // xóa - ở đầu và cuối
}


export function dataToFormData(data) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
            formData.append(key, value);
        } else if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
        } else if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });
    return formData;
}

export const formatToCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}







