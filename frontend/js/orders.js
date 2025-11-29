// Orders page logic

let allOrders = [];

async function loadOrders() {
    try {
        allOrders = await OrderAPI.getAll();
        renderOrders();
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    const ordersEmpty = document.getElementById('ordersEmpty');
    
    if (allOrders.length === 0) {
        ordersList.style.display = 'none';
        ordersEmpty.style.display = 'block';
        return;
    }

    ordersEmpty.style.display = 'none';
    ordersList.style.display = 'flex';

    ordersList.innerHTML = allOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p class="order-date">${formatDate(order.created_at)}</p>
                </div>
                <select 
                    class="status-select" 
                    onchange="updateOrderStatus(${order.id}, this.value)"
                    value="${order.status}"
                >
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                    <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>🔄 Processing</option>
                    <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>✅ Completed</option>
                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
                </select>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span class="order-item-name">${item.image} ${item.name} × ${item.quantity}</span>
                        <span class="order-item-price">${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <span class="order-total-label">Total:</span>
                <span class="order-total-value">${formatCurrency(order.total)}</span>
            </div>
        </div>
    `).join('');
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await OrderAPI.updateStatus(orderId, newStatus);
        showNotification('Order status updated!');
        await loadOrders();
    } catch (error) {
        console.error('Failed to update order status:', error);
    }
}