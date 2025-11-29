// Cart page logic

let cartItems = [];

async function loadCart() {
    try {
        cartItems = await CartAPI.getAll();
        renderCart();
        updateCartBadge();
    } catch (error) {
        console.error('Failed to load cart:', error);
    }
}

function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cartItems.length === 0) {
        cartItemsEl.style.display = 'none';
        cartEmpty.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
    }

    cartEmpty.style.display = 'none';
    cartItemsEl.style.display = 'flex';
    cartSummary.style.display = 'block';

    cartItemsEl.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-image">${item.image || '📦'}</div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${formatCurrency(item.price)} each</p>
                </div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <span class="cart-item-price">${formatCurrency(item.price * item.quantity)}</span>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
        </div>
    `).join('');

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = formatCurrency(total);
}

async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    try {
        await CartAPI.update(productId, newQuantity);
        await loadCart();
    } catch (error) {
        console.error('Failed to update quantity:', error);
    }
}

async function removeFromCart(productId) {
    if (!confirm('Remove this item from cart?')) return;

    try {
        await CartAPI.remove(productId);
        await loadCart();
        showNotification('Item removed from cart');
    } catch (error) {
        console.error('Failed to remove item:', error);
    }
}

async function checkout() {
    if (cartItems.length === 0) {
        showNotification('Cart is empty', 'error');
        return;
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        await OrderAPI.create({
            items: cartItems,
            total: total
        });
        
        await CartAPI.clear();
        cartItems = [];
        renderCart();
        updateCartBadge();
        
        showNotification('Order placed successfully!');
        
        // Switch to orders view
        setTimeout(() => {
            document.querySelector('[data-view="orders"]').click();
        }, 1000);
    } catch (error) {
        console.error('Failed to place order:', error);
    }
}

async function updateCartBadge() {
    try {
        const cart = await CartAPI.getAll();
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartBadge').textContent = count;
    } catch (error) {
        console.error('Failed to update cart badge:', error);
    }
}