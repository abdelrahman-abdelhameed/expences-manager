import { useState, useEffect } from 'react';
import { monthlyPlanService } from '../services/monthlyPlanService';
import { categoryService } from '../services/categoryService';
import { reportService } from '../services/reportService';
import './MonthlyPlan.css';

export default function MonthlyPlan() {
    const [plans, setPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        category_id: '',
        planned_amount: '',
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadPlans();
        loadReport();
    }, [selectedYear, selectedMonth]);

    const loadCategories = async () => {
        try {
            const response = await categoryService.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadPlans = async () => {
        try {
            setLoading(true);
            const response = await monthlyPlanService.getByYearMonth(selectedYear, selectedMonth);
            setPlans(response.data);
        } catch (error) {
            console.error('Failed to load plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadReport = async () => {
        try {
            const response = await reportService.getMonthlyReport(selectedYear, selectedMonth);
            setMonthlyReport(response.data);
        } catch (error) {
            console.error('Failed to load report:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                year: selectedYear,
                month: selectedMonth,
                category_id: parseInt(formData.category_id),
                planned_amount: parseFloat(formData.planned_amount),
            };

            await monthlyPlanService.create(data);
            resetForm();
            loadPlans();
        } catch (error) {
            console.error('Failed to create plan:', error);
            alert('Failed to create plan');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        try {
            await monthlyPlanService.delete(id);
            loadPlans();
        } catch (error) {
            console.error('Failed to delete plan:', error);
        }
    };

    const resetForm = () => {
        setFormData({ category_id: '', planned_amount: '' });
        setShowForm(false);
    };

    const getActualAmount = (categoryId) => {
        if (!monthlyReport || !monthlyReport.by_category) return 0;
        const categoryData = monthlyReport.by_category.find(c => c.category_id === categoryId);
        return categoryData ? categoryData.total_amount : 0;
    };

    const getProgressPercentage = (planned, actual) => {
        if (planned === 0) return 0;
        return Math.min((actual / planned) * 100, 100);
    };

    const totalPlanned = plans.reduce((sum, plan) => sum + plan.planned_amount, 0);
    const totalActual = monthlyReport?.total_expenses || 0;

    return (
        <div className="monthly-plan">
            <div className="page-header">
                <div>
                    <h1>Monthly Budget Plan</h1>
                    <p className="page-subtitle">Set and track your monthly spending goals</p>
                </div>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Budget'}
                </button>
            </div>

            <div className="month-selector card">
                <div className="form-row">
                    <div className="form-group">
                        <label>Year</label>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                            {[2024, 2025, 2026, 2027].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Month</label>
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <option key={month} value={month}>
                                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="budget-summary">
                    <div className="summary-item">
                        <span className="summary-label">Planned:</span>
                        <span className="summary-value planned">${totalPlanned.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Actual:</span>
                        <span className="summary-value actual">${totalActual.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Remaining:</span>
                        <span className={`summary-value ${totalActual > totalPlanned ? 'over' : 'under'}`}>
                            ${(totalPlanned - totalActual).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="plan-form card animate-fade-in">
                    <h3>Add Budget Plan</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Planned Amount *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.planned_amount}
                                    onChange={(e) => setFormData({ ...formData, planned_amount: e.target.value })}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Add Budget</button>
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="plans-list">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading budget plans...</p>
                    </div>
                ) : plans.length > 0 ? (
                    plans.map(plan => {
                        const actual = getActualAmount(plan.category_id);
                        const progress = getProgressPercentage(plan.planned_amount, actual);
                        const isOverBudget = actual > plan.planned_amount;

                        return (
                            <div key={plan.id} className="plan-card card">
                                <div className="plan-header">
                                    <div className="plan-category">
                                        <div
                                            className="category-dot"
                                            style={{ backgroundColor: plan.category?.color }}
                                        />
                                        <h4>{plan.category?.name}</h4>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(plan.id)}
                                    >
                                        Delete
                                    </button>
                                </div>

                                <div className="plan-amounts">
                                    <div className="amount-item">
                                        <span className="amount-label">Planned</span>
                                        <span className="amount-value">${plan.planned_amount.toFixed(2)}</span>
                                    </div>
                                    <div className="amount-item">
                                        <span className="amount-label">Actual</span>
                                        <span className="amount-value">${actual.toFixed(2)}</span>
                                    </div>
                                    <div className="amount-item">
                                        <span className="amount-label">Remaining</span>
                                        <span className={`amount-value ${isOverBudget ? 'over' : ''}`}>
                                            ${(plan.planned_amount - actual).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className={`progress-fill ${isOverBudget ? 'over-budget' : ''}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="progress-text">
                                    {progress.toFixed(0)}% {isOverBudget && '(Over Budget!)'}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state card">
                        <p>No budget plans for this month</p>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            Create Your First Budget Plan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
