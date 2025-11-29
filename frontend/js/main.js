// Main application logic

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🛒 FreshMart Grocery App initialized!');
    
    // Initialize navigation
    setupNavigation();
    
    // Load initial data
    await loadProducts();
    await updateCartBadge();
    
    // Setup event listeners
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
});

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    
    navButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetView = button.dataset.view;
            
            // Update active states
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target view
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(`${targetView}View`).classList.add('active');
            
            // Load data for the view
            switch(targetView) {
                case 'shop':
                    await loadProducts();
                    break;
                case 'cart':
                    await loadCart();
                    break;
                case 'admin':
                    await loadAdminProducts();
                    break;
                case 'orders':
                    await loadOrders();
                    break;
            }
        });
    });
}

// Make functions globally accessible
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;