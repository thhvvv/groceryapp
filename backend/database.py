import sqlite3
import os

DATABASE = 'grocery.db'

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with tables and sample data"""
    if os.path.exists(DATABASE):
        return
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total REAL NOT NULL,
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    ''')
    
    # Insert sample data
    sample_products = [
        ('Fresh Milk', 'Dairy', 3.99, 50, '🥛'),
        ('Whole Wheat Bread', 'Bakery', 2.49, 30, '🍞'),
        ('Organic Eggs', 'Dairy', 4.99, 40, '🥚'),
        ('Fresh Tomatoes', 'Produce', 1.99, 60, '🍅'),
        ('Bananas', 'Produce', 0.99, 80, '🍌'),
        ('Chicken Breast', 'Meat', 7.99, 25, '🍗'),
        ('Cheddar Cheese', 'Dairy', 5.49, 35, '🧀'),
        ('Orange Juice', 'Beverages', 4.29, 45, '🍊'),
    ]
    
    cursor.executemany(
        'INSERT INTO products (name, category, price, stock, image) VALUES (?, ?, ?, ?, ?)',
        sample_products
    )
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

def dict_from_row(row):
    """Convert sqlite3.Row to dictionary"""
    return dict(zip(row.keys(), row))