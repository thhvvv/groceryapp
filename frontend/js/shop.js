// Shop page logic

async function loadProducts() {
    try {
        const products = await ProductAPI.getAll();
        renderProducts(products);
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="empty-state">No products available</p>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">${product.image || '📦'}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-category">${product.category || 'Other'}</p>
            <div class="product-info">
                <span class="product-price">${formatCurrency(product.price)}</span>
                <span class="product-stock ${product.stock < 10 ? 'low' : ''} ${product.stock === 0 ? 'out' : ''}">
                    Stock: ${product.stock}
                </span>
            </div>
            <button 
                class="btn btn-primary btn-lg" 
                onclick="addToCart(${product.id})"
                ${product.stock === 0 ? 'disabled' : ''}
            >
                ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `).join('');
}

async function addToCart(productId) {
    try {
        const products = await ProductAPI.getAll();
        const product = products.find(p => p.id === productId);
        
        if (!product || product.stock === 0) {
            showNotification('Product not available', 'error');
            return;
        }

        await CartAPI.add(product);
        showNotification('Added to cart!');
        updateCartBadge();
    } catch (error) {
        console.error('Failed to add to cart:', error);
    }
}