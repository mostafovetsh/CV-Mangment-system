// In production (Render), use relative path since backend serves frontend
// In development, use localhost with proxy from package.json
const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

// Fetch all CVs with optional filters
export const fetchCVs = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
    });
    const url = `${API_URL}/cvs${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch CVs');
    return res.json();
};

// Upload a CV
export const uploadCV = async (formData) => {
    const res = await fetch(`${API_URL}/cvs/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
};

// Delete a CV
export const deleteCV = async (id) => {
    const res = await fetch(`${API_URL}/cvs/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
};

// Update a CV
export const updateCV = async (id, data) => {
    const res = await fetch(`${API_URL}/cvs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
};

// Fetch all folders
export const fetchFolders = async () => {
    const res = await fetch(`${API_URL}/folders`);
    if (!res.ok) throw new Error('Failed to fetch folders');
    return res.json();
};

// Add a new folder
export const addFolder = async (folderName) => {
    const res = await fetch(`${API_URL}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName }),
    });
    if (!res.ok) throw new Error('Failed to add folder');
    return res.json();
};

// Delete a folder
export const deleteFolder = async (folderName) => {
    const res = await fetch(`${API_URL}/folders/${folderName}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete folder');
    return res.json();
};

// Fetch system stats
export const fetchStats = async () => {
    const res = await fetch(`${API_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};

// Fetch system configuration
export const fetchConfig = async () => {
    const res = await fetch(`${API_URL}/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
};

// Get file URL for preview/download
export const getFileUrl = (fileName) => {
    return `${API_URL.replace('/api', '')}/uploads/${fileName}`;
};

// Bulk update CVs
export const bulkUpdateCVs = async (ids, updates) => {
    const res = await fetch(`${API_URL}/cvs/bulk-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, updates }),
    });
    if (!res.ok) throw new Error('Bulk update failed');
    return res.json();
};

// Bulk delete CVs
export const bulkDeleteCVs = async (ids) => {
    const res = await fetch(`${API_URL}/cvs/bulk-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Bulk delete failed');
    return res.json();
};

// Bulk move CVs to a folder
export const bulkMoveCVs = async (ids, folder) => {
    const res = await fetch(`${API_URL}/cvs/bulk-move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, folder }),
    });
    if (!res.ok) throw new Error('Bulk move failed');
    return res.json();
};

// Advanced search
export const searchCVs = async (searchParams) => {
    const res = await fetch(`${API_URL}/cvs/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
};

// Parse CV file
export const parseCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/cvs/parse`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error('Parse failed');
    return res.json();
};

// Login
export const login = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
};

// Fetch reports
export const fetchReports = async () => {
    const res = await fetch(`${API_URL}/reports/summary`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
};

// Fetch CVs by folder
export const fetchCVsByFolder = async () => {
    const res = await fetch(`${API_URL}/reports/by-folder`);
    if (!res.ok) throw new Error('Failed to fetch CVs by folder');
    return res.json();
};

// Fetch CVs by date range
export const fetchCVsByDateRange = async (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await fetch(`${API_URL}/reports/by-date-range?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch CVs by date range');
    return res.json();
};
