import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { reportService } from '../services/reportService';
import ChartCard from '../components/ChartCard';
import './MonthComparison.css';

export default function MonthComparison() {
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [monthInput, setMonthInput] = useState('');

    const handleAddMonth = () => {
        if (monthInput && !selectedMonths.includes(monthInput)) {
            setSelectedMonths([...selectedMonths, monthInput]);
            setMonthInput('');
        }
    };

    const handleRemoveMonth = (month) => {
        setSelectedMonths(selectedMonths.filter(m => m !== month));
    };

    const handleCompare = async () => {
        if (selectedMonths.length < 2) {
            alert('Please select at least 2 months to compare');
            return;
        }

        try {
            setLoading(true);
            const response = await reportService.getMonthComparison(selectedMonths);
            setComparisonData(response.data);
        } catch (error) {
            console.error('Failed to load comparison:', error);
            alert('Failed to load comparison data');
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: comparisonData.map(d => `${d.year}-${String(d.month).padStart(2, '0')}`),
        datasets: [
            {
                label: 'Total Expenses',
                data: comparisonData.map(d => d.total_expenses),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
        ],
    };

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

    return (
        <div className="month-comparison">
            <div className="page-header">
                <div>
                    <h1>Month Comparison</h1>
                    <p className="page-subtitle">Compare expenses across different months</p>
                </div>
            </div>

            <div className="comparison-controls card">
                <h3>Select Months to Compare</h3>
                <div className="month-input-group">
                    <input
                        type="month"
                        value={monthInput}
                        onChange={(e) => setMonthInput(e.target.value)}
                        placeholder="YYYY-MM"
                    />
                    <button className="btn btn-primary" onClick={handleAddMonth}>
                        Add Month
                    </button>
                </div>

                <div className="selected-months">
                    {selectedMonths.map(month => (
                        <div key={month} className="month-tag">
                            <span>{month}</span>
                            <button onClick={() => handleRemoveMonth(month)}>×</button>
                        </div>
                    ))}
                </div>

                {selectedMonths.length >= 2 && (
                    <button
                        className="btn btn-success btn-lg"
                        onClick={handleCompare}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Compare Months'}
                    </button>
                )}
            </div>

            {comparisonData.length > 0 && (
                <>
                    <ChartCard title="Expense Comparison">
                        <div style={{ height: '400px' }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </ChartCard>

                    <div className="comparison-table card">
                        <h3>Detailed Comparison</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Total Expenses</th>
                                    <th>Transactions</th>
                                    <th>Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonData.map((data, index) => {
                                    const prevData = index > 0 ? comparisonData[index - 1] : null;
                                    const change = prevData
                                        ? ((data.total_expenses - prevData.total_expenses) / prevData.total_expenses * 100)
                                        : 0;

                                    return (
                                        <tr key={`${data.year}-${data.month}`}>
                                            <td>{data.year}-{String(data.month).padStart(2, '0')}</td>
                                            <td>${data.total_expenses.toFixed(2)}</td>
                                            <td>{data.expense_count}</td>
                                            <td className={change > 0 ? 'negative' : 'positive'}>
                                                {index > 0 ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
