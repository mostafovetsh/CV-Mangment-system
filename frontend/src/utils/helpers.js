/**
 * Utility helper functions for the CV Management System
 */

/**
 * Format a date string to Arabic locale
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date in Arabic
 */
export const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ar-EG");
};

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Get status color based on status value
 * @param {string} status - Status value
 * @param {Array} statusConfig - Status configuration array
 * @returns {string} Color hex code
 */
export const getStatusColor = (status, statusConfig) => {
    const statusObj = statusConfig.find(s => s.value === status);
    return statusObj ? statusObj.color : '#4299e1';
};

/**
 * Filter CVs based on search criteria
 * @param {Array} cvs - Array of CV objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered CVs
 */
export const filterCVs = (cvs, filters) => {
    return cvs.filter(cv => {
        if (filters.name && !cv.candidateName.toLowerCase().includes(filters.name.toLowerCase())) {
            return false;
        }
        if (filters.folder && cv.folder !== filters.folder) {
            return false;
        }
        if (filters.status && cv.status !== filters.status) {
            return false;
        }
        if (filters.age && cv.age !== parseInt(filters.age)) {
            return false;
        }
        return true;
    });
};

/**
 * Calculate statistics from CV array
 * @param {Array} cvs - Array of CV objects
 * @returns {Object} Statistics object
 */
export const calculateStats = (cvs) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    return {
        total: cvs.length,
        old: cvs.filter(cv => new Date(cv.uploadDate) < thirtyDaysAgo).length,
        byStatus: cvs.reduce((acc, cv) => {
            acc[cv.status] = (acc[cv.status] || 0) + 1;
            return acc;
        }, {}),
        byFolder: cvs.reduce((acc, cv) => {
            acc[cv.folder] = (acc[cv.folder] || 0) + 1;
            return acc;
        }, {})
    };
};
