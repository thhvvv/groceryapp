// API configuration and functions

const API_BASE_URL = 'http://localhost:5000/api';
const SESSION_ID = getSessionId();

// Generic API call function
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Session-ID': SESSION_ID
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showNotification('An error occurred. Please try again.', 'error');
        throw error;
    }
}

// Product API calls
const ProductAPI = {
    getAll: () => apiCall('/products'),
    getOne: (id) => apiCall(`/products/${id}`),
    create: (data) => apiCall('/products', 'POST', data),
    update: (id, data) => apiCall(`/products/${id}`, 'PUT', data),
    delete: (id) => apiCall(`/products/${id}`, 'DELETE')
};

// Order API calls
const OrderAPI = {
    getAll: () => apiCall('/orders'),
    create: (data) => apiCall('/orders', 'POST', data),
    updateStatus: (id, status) => apiCall(`/orders/${id}/status`, 'PUT', { status })
};

// Cart API calls
const CartAPI = {
    getAll: () => apiCall('/cart'),
    add: (product) => apiCall('/cart', 'POST', product),
    update: (id, quantity) => apiCall(`/cart/${id}`, 'PUT', { quantity }),
    remove: (id) => apiCall(`/cart/${id}`, 'DELETE'),
    clear: () => apiCall('/cart/clear', 'POST')
};