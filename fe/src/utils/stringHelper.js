/**
 * Generate slug from text
 * @param {string} text - Text to generate slug from
 * @returns {string} - Generated slug
 */
export const generateSlug = (text) => {
    if (!text) return '';

    return text
        .toLowerCase()
        .trim()
        // Remove Vietnamese diacritics
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Replace spaces and special characters with hyphens
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
