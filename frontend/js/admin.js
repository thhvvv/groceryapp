// Admin page logic

let allProducts = [];

async function loadAdminProducts() {
    try {
        allProducts = await ProductAPI.getAll();
        renderAdminProducts();
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

function renderAdminProducts() {
    const tbody = document.getElementById('productsTableBody');
    
    if (allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = allProducts.map(product => `
        <tr>
            <td>
                <div class="table-product-info">
                    <span class="table-product-icon">${product.image || '📦'}</span>
                    <span class="table-product-name">${product.name}</span>
                </div>
            </td>
            <td>${product.category || 'Other'}</td>
            <td class="text-right">${formatCurrency(product.price)}</td>
            <td class="text-right">
                <span class="${product.stock < 10 ? 'product-stock low' : 'product-stock'}">
                    ${product.stock}
                </span>
            </td>
            <td class="text-right">
                <div class="table-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editProduct(${product.id})">✏️ Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleAddProduct(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value || 'Other',
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value || '📦'
    };

    if (!formData.name || !formData.price || !formData.stock) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        await ProductAPI.create(formData);
        showNotification('Product added successfully!');
        document.getElementById('addProductForm').reset();
        await loadAdminProducts();
        await loadProducts(); // Refresh shop view
    } catch (error) {
        console.error('Failed to add product:', error);
    }
}

async function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const name = prompt('Product Name:', product.name);
    if (!name) return;

    const category = prompt('Category:', product.category);
    const price = parseFloat(prompt('Price:', product.price));
    const stock = parseInt(prompt('Stock:', product.stock));
    const image = prompt('Emoji/Icon:', product.image);

    if (isNaN(price) || isNaN(stock)) {
        showNotification('Invalid price or stock', 'error');
        return;
    }

    try {
        await ProductAPI.update(productId, {
            name,
            category: category || 'Other',
            price,
            stock,
            image: image || '📦'
        });
        showNotification('Product updated successfully!');
        await loadAdminProducts();
        await loadProducts();
    } catch (error) {
        console.error('Failed to update product:', error);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        await ProductAPI.delete(productId);
        showNotification('Product deleted successfully!');
        await loadAdminProducts();
        await loadProducts();
    } catch (error) {
        console.error('Failed to delete product:', error);
    }
}