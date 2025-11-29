from flask import Flask, jsonify, request
from flask_cors import CORS
from database import init_db, get_db, dict_from_row
import datetime

app = Flask(__name__)
CORS(app)

# Initialize database on first run
init_db()

# ========== PRODUCT ROUTES ==========

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products"""
    conn = get_db()
    products = conn.execute('SELECT * FROM products ORDER BY name').fetchall()
    conn.close()
    return jsonify([dict_from_row(p) for p in products])

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product"""
    conn = get_db()
    product = conn.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
    conn.close()
    if product:
        return jsonify(dict_from_row(product))
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/products', methods=['POST'])
def create_product():
    """Create new product"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO products (name, category, price, stock, image) VALUES (?, ?, ?, ?, ?)',
        (data['name'], data.get('category', 'Other'), data['price'], data['stock'], data.get('image', '📦'))
    )
    product_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'id': product_id, 'message': 'Product created'}), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update product"""
    data = request.json
    conn = get_db()
    conn.execute(
        'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, image = ? WHERE id = ?',
        (data['name'], data['category'], data['price'], data['stock'], data['image'], product_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Product updated'})

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete product"""
    conn = get_db()
    conn.execute('DELETE FROM products WHERE id = ?', (product_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Product deleted'})

# ========== ORDER ROUTES ==========

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders with items"""
    conn = get_db()
    orders = conn.execute('SELECT * FROM orders ORDER BY created_at DESC').fetchall()
    
    result = []
    for order in orders:
        order_dict = dict_from_row(order)
        items = conn.execute('''
            SELECT oi.*, p.name, p.image 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        ''', (order['id'],)).fetchall()
        order_dict['items'] = [dict_from_row(item) for item in items]
        result.append(order_dict)
    
    conn.close()
    return jsonify(result)

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create new order"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    # Create order
    cursor.execute(
        'INSERT INTO orders (total, status) VALUES (?, ?)',
        (data['total'], 'Pending')
    )
    order_id = cursor.lastrowid
    
    # Add order items and update stock
    for item in data['items']:
        cursor.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            (order_id, item['id'], item['quantity'], item['price'])
        )
        cursor.execute(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            (item['quantity'], item['id'])
        )
    
    conn.commit()
    conn.close()
    return jsonify({'id': order_id, 'message': 'Order created'}), 201

@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status"""
    data = request.json
    conn = get_db()
    conn.execute('UPDATE orders SET status = ? WHERE id = ?', (data['status'], order_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Order status updated'})

# ========== CART ROUTES (Simple in-memory for demo) ==========
# In production, you'd use sessions or database

carts = {}  # Simple in-memory cart storage

@app.route('/api/cart', methods=['GET'])
def get_cart():
    """Get cart items"""
    session_id = request.headers.get('Session-ID', 'default')
    cart = carts.get(session_id, [])
    return jsonify(cart)

@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    """Add item to cart"""
    session_id = request.headers.get('Session-ID', 'default')
    data = request.json
    
    if session_id not in carts:
        carts[session_id] = []
    
    # Check if product already in cart
    for item in carts[session_id]:
        if item['id'] == data['id']:
            item['quantity'] += 1
            return jsonify({'message': 'Quantity updated'})
    
    # Add new item
    carts[session_id].append({**data, 'quantity': 1})
    return jsonify({'message': 'Item added to cart'})

@app.route('/api/cart/<int:product_id>', methods=['PUT'])
def update_cart_item(product_id):
    """Update cart item quantity"""
    session_id = request.headers.get('Session-ID', 'default')
    data = request.json
    
    for item in carts.get(session_id, []):
        if item['id'] == product_id:
            item['quantity'] = data['quantity']
            return jsonify({'message': 'Cart updated'})
    
    return jsonify({'error': 'Item not found'}), 404

@app.route('/api/cart/<int:product_id>', methods=['DELETE'])
def remove_from_cart(product_id):
    """Remove item from cart"""
    session_id = request.headers.get('Session-ID', 'default')
    
    if session_id in carts:
        carts[session_id] = [item for item in carts[session_id] if item['id'] != product_id]
    
    return jsonify({'message': 'Item removed'})

@app.route('/api/cart/clear', methods=['POST'])
def clear_cart():
    """Clear cart after order"""
    session_id = request.headers.get('Session-ID', 'default')
    if session_id in carts:
        carts[session_id] = []
    return jsonify({'message': 'Cart cleared'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)