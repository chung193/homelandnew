// Get full media URL by prepending backend upload URL if path is relative
export const getMediaUrl = (path) => {
    if (!path) return '';

    // If already a full URL, return as is
    if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
        return path;
    }

    // If it's a relative path, prepend the backend upload URL
    // For admin dashboard, assume uploads are at /uploads/
    const uploadUrl = `${window.location.origin}/uploads/`;

    // Remove leading slash if path has one
    const cleanPath = typeof path === 'string' && path.startsWith('/') ? path.substring(1) : path;

    return `${uploadUrl}${cleanPath}`;
};
