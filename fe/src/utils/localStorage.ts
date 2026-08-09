if (localStorage) {
    console.log('Trình duyệt hỗ trợ localStorage')
} else {
    console.error('Trình duyệt không hỗ trợ localStorage')
}

export const setItem = (key, data) => {
    localStorage.setItem(key, data)
}

export const getItem = (key) => {
    return localStorage.getItem(key)
}

export const removeItem = (key) => {
    localStorage.removeItem(key)
}

export const clear = () => {
    localStorage.clear()
}