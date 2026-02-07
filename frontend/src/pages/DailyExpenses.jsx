import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import ExpenseCard from '../components/ExpenseCard';
import './DailyExpenses.css';

export default function DailyExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filters, setFilters] = useState({
        start_date: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
        category_id: '',
    });

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        expense_date: format(new Date(), 'yyyy-MM-dd'),
        category_id: '',
    });

    useEffect(() => {
        loadCategories();
        loadExpenses();
    }, [filters]);

    const loadCategories = async () => {
        try {
            const response = await categoryService.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;
            if (filters.category_id) params.category_id = filters.category_id;

            const response = await expenseService.getAll(params);
            setExpenses(response.data);
        } catch (error) {
            console.error('Failed to load expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount),
                category_id: formData.category_id ? parseInt(formData.category_id) : null,
                expense_date: new Date(formData.expense_date).toISOString(),
            };

            if (editingExpense) {
                await expenseService.update(editingExpense.id, data);
            } else {
                await expenseService.create(data);
            }

            resetForm();
            loadExpenses();
        } catch (error) {
            console.error('Failed to save expense:', error);
            alert('Failed to save expense');
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            amount: expense.amount,
            description: expense.description || '',
            expense_date: format(new Date(expense.expense_date), 'yyyy-MM-dd'),
            category_id: expense.category_id || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            await expenseService.delete(id);
            loadExpenses();
        } catch (error) {
            console.error('Failed to delete expense:', error);
            alert('Failed to delete expense');
        }
    };

    const resetForm = () => {
        setFormData({
            amount: '',
            description: '',
            expense_date: format(new Date(), 'yyyy-MM-dd'),
            category_id: '',
        });
        setEditingExpense(null);
        setShowForm(false);
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="daily-expenses">
            <div className="page-header">
                <div>
                    <h1>Daily Expenses</h1>
                    <p className="page-subtitle">Track and manage your daily spending</p>
                </div>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Expense'}
                </button>
            </div>

            {showForm && (
                <div className="expense-form card animate-fade-in">
                    <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Amount *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label>Date *</label>
                                <input
                                    type="date"
                                    value={formData.expense_date}
                                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                placeholder="Add notes about this expense..."
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingExpense ? 'Update Expense' : 'Add Expense'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="filters-section card">
                <h3>Filters</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={filters.category_id}
                            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                        >
                            <option value="">All categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="filter-summary">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">${totalExpenses.toFixed(2)}</span>
                    <span className="total-count">({expenses.length} expenses)</span>
                </div>
            </div>

            <div className="expenses-grid">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading expenses...</p>
                    </div>
                ) : expenses.length > 0 ? (
                    expenses.map(expense => (
                        <ExpenseCard
                            key={expense.id}
                            expense={expense}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="empty-state card">
                        <p>No expenses found for the selected period</p>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            Add Your First Expense
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
