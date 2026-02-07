-- Sample data for testing the Expense Manager application

-- Insert sample categories
INSERT INTO categories (name, description, color, icon) VALUES
('Food & Dining', 'Groceries, restaurants, and food delivery', '#10B981', '🍔'),
('Transportation', 'Gas, public transport, parking', '#3B82F6', '🚗'),
('Entertainment', 'Movies, games, subscriptions', '#8B5CF6', '🎮'),
('Shopping', 'Clothes, electronics, and other purchases', '#EC4899', '🛍️'),
('Utilities', 'Electricity, water, internet', '#F59E0B', '💡'),
('Healthcare', 'Medical expenses, pharmacy', '#EF4444', '⚕️'),
('Education', 'Books, courses, tuition', '#14B8A6', '📚'),
('Personal Care', 'Haircuts, gym, beauty', '#F97316', '💅');

-- Insert sample expenses for current month
INSERT INTO daily_expenses (amount, description, expense_date, category_id) VALUES
(45.50, 'Grocery shopping at Walmart', '2026-02-01', 1),
(12.00, 'Lunch at cafe', '2026-02-01', 1),
(30.00, 'Gas for car', '2026-02-02', 2),
(15.99, 'Netflix subscription', '2026-02-03', 3),
(89.99, 'New running shoes', '2026-02-04', 4),
(120.00, 'Electricity bill', '2026-02-05', 5),
(25.00, 'Pharmacy - vitamins', '2026-02-05', 6),
(18.50, 'Dinner with friends', '2026-02-06', 1),
(50.00, 'Online course', '2026-02-06', 7),
(35.00, 'Gym membership', '2026-02-07', 8);

-- Insert sample monthly plans for current month
INSERT INTO monthly_plans (month, year, category_id, planned_amount) VALUES
(2, 2026, 1, 500.00),
(2, 2026, 2, 200.00),
(2, 2026, 3, 100.00),
(2, 2026, 4, 300.00),
(2, 2026, 5, 150.00),
(2, 2026, 6, 100.00),
(2, 2026, 7, 150.00),
(2, 2026, 8, 80.00);

-- Insert expenses for previous month (for comparison)
INSERT INTO daily_expenses (amount, description, expense_date, category_id) VALUES
(52.30, 'Grocery shopping', '2026-01-15', 1),
(28.00, 'Restaurant dinner', '2026-01-16', 1),
(35.00, 'Gas', '2026-01-17', 2),
(99.00, 'New headphones', '2026-01-18', 4),
(110.00, 'Electricity bill', '2026-01-19', 5),
(40.00, 'Doctor visit', '2026-01-20', 6);
