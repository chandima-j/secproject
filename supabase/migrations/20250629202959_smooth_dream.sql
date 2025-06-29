-- Fresh Bonds Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('guest', 'farmer', 'admin')),
    location VARCHAR(255),
    farm_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image VARCHAR(500),
    farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    farmer_name VARCHAR(255) NOT NULL,
    farmer_location VARCHAR(255) NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    harvest_date DATE NOT NULL,
    organic BOOLEAN DEFAULT false,
    quantity VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users with hashed passwords
-- Passwords: farmer123 for farmers, admin123 for admin
INSERT INTO users (name, email, password_hash, role, location, farm_name) VALUES
('Sarah Thompson', 'sarah@greenvalleys.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'farmer', 'Sonoma County, CA', 'Green Valley Organic Farm'),
('Michael Chen', 'admin@freshbonds.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, NULL),
('John Doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'farmer', 'Napa Valley, CA', 'Sunrise Farm')
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category, image, farmer_id, farmer_name, farmer_location, in_stock, is_visible, harvest_date, organic, quantity, unit) VALUES
('Organic Heirloom Tomatoes', 'Fresh, juicy heirloom tomatoes grown using organic methods. Perfect for salads, sandwiches, or cooking.', 6.99, 'Vegetables', 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800', 1, 'Sarah Thompson', 'Sonoma County, CA', true, true, '2025-01-15', true, '2', 'lbs'),
('Fresh Organic Eggs', 'Farm-fresh eggs from free-range chickens. Rich, golden yolks and superior taste.', 8.50, 'Dairy & Eggs', 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800', 1, 'Sarah Thompson', 'Sonoma County, CA', true, true, '2025-01-16', true, '12', 'count'),
('Crisp Lettuce Mix', 'A delightful mix of fresh lettuce varieties. Perfect for salads and sandwiches.', 4.25, 'Vegetables', 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg?auto=compress&cs=tinysrgb&w=800', 1, 'Sarah Thompson', 'Sonoma County, CA', true, true, '2025-01-14', true, '1', 'head'),
('Sweet Strawberries', 'Juicy, sweet strawberries picked at peak ripeness. Perfect for eating fresh or desserts.', 7.99, 'Fruits', 'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg?auto=compress&cs=tinysrgb&w=800', 1, 'Sarah Thompson', 'Sonoma County, CA', true, true, '2025-01-15', true, '1', 'pint'),
('Artisan Honey', 'Pure, raw honey harvested from our own beehives. Complex floral flavor, unfiltered and unpasteurized.', 12.99, 'Pantry', 'https://images.pexels.com/photos/316908/pexels-photo-316908.jpeg?auto=compress&cs=tinysrgb&w=800', 1, 'Sarah Thompson', 'Sonoma County, CA', true, false, '2025-01-05', true, '12', 'oz')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_visible ON products(is_visible);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);