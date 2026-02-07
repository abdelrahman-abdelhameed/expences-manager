import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { reportService } from '../services/reportService';
import { expenseService } from '../services/expenseService';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [yearlyTrends, setYearlyTrends] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [reportRes, trendsRes, expensesRes] = await Promise.all([
                reportService.getMonthlyReport(currentYear, currentMonth),
                reportService.getYearlyTrends(currentYear),
                expenseService.getAll({
                    start_date: format(new Date(currentYear, currentMonth - 1, 1), 'yyyy-MM-dd'),
                    end_date: format(new Date(currentYear, currentMonth, 0), 'yyyy-MM-dd')
                })
            ]);

            setMonthlyReport(reportRes.data);
            setYearlyTrends(trendsRes.data);
            setRecentExpenses(expensesRes.data.slice(0, 5));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const trendChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Monthly Expenses',
                data: yearlyTrends.map(t => t.total_expenses),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const categoryChartData = monthlyReport && monthlyReport.by_category && monthlyReport.by_category.length > 0 ? {
        labels: monthlyReport.by_category.map(c => c.category_name),
        datasets: [
            {
                data: monthlyReport.by_category.map(c => c.total_amount),
                backgroundColor: monthlyReport.by_category.map(c => c.category_color || '#3B82F6'),
                borderWidth: 0,
            },
        ],
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#cbd5e1',
                },
            },
        },
        scales: {
            y: {
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
            },
            x: {
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#cbd5e1',
                    padding: 15,
                },
            },
        },
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p className="dashboard-subtitle">
                    {format(currentDate, 'MMMM yyyy')} Overview
                </p>
            </div>

            <div className="stats-grid grid grid-4">
                <StatCard
                    title="Total Expenses"
                    value={`$${monthlyReport?.total_expenses.toFixed(2) || '0.00'}`}
                    icon="💰"
                    color="primary"
                />
                <StatCard
                    title="Planned Budget"
                    value={`$${monthlyReport?.total_planned.toFixed(2) || '0.00'}`}
                    icon="📊"
                    color="success"
                />
                <StatCard
                    title="Transactions"
                    value={monthlyReport?.expense_count || 0}
                    icon="📝"
                    color="warning"
                />
                <StatCard
                    title="Remaining"
                    value={`$${((monthlyReport?.total_planned || 0) - (monthlyReport?.total_expenses || 0)).toFixed(2)}`}
                    icon="💵"
                    color={monthlyReport && monthlyReport.total_expenses > monthlyReport.total_planned ? 'error' : 'success'}
                />
            </div>

            <div className="charts-grid grid grid-2">
                <ChartCard title="Yearly Expense Trends">
                    <div style={{ height: '300px' }}>
                        <Line data={trendChartData} options={chartOptions} />
                    </div>
                </ChartCard>

                {categoryChartData && (
                    <ChartCard title="Expenses by Category">
                        <div style={{ height: '300px' }}>
                            <Doughnut data={categoryChartData} options={doughnutOptions} />
                        </div>
                    </ChartCard>
                )}
            </div>

            <div className="recent-expenses card">
                <div className="card-header">
                    <h3 className="card-title">Recent Expenses</h3>
                </div>
                <div className="expenses-list">
                    {recentExpenses.length > 0 ? (
                        recentExpenses.map(expense => (
                            <div key={expense.id} className="expense-item">
                                <div className="expense-item-info">
                                    <span className="expense-item-category" style={{ color: expense.category?.color }}>
                                        {expense.category?.name || 'Uncategorized'}
                                    </span>
                                    <span className="expense-item-date">
                                        {format(new Date(expense.expense_date), 'MMM dd')}
                                    </span>
                                    {expense.description && (
                                        <span className="expense-item-description">{expense.description}</span>
                                    )}
                                </div>
                                <div className="expense-item-amount">
                                    ${expense.amount.toFixed(2)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data">No expenses this month</p>
                    )}
                </div>
            </div>
        </div>
    );
}
