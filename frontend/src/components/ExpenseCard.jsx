import { format } from 'date-fns';
import './ExpenseCard.css';

export default function ExpenseCard({ expense, onEdit, onDelete }) {
    return (
        <div className="expense-card card">
            <div className="expense-card-header">
                <div className="expense-info">
                    <div
                        className="expense-category-badge"
                        style={{
                            backgroundColor: expense.category?.color + '20',
                            color: expense.category?.color || 'var(--primary-400)'
                        }}
                    >
                        {expense.category?.name || 'Uncategorized'}
                    </div>
                    <div className="expense-date">
                        {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                    </div>
                </div>
                <div className="expense-amount">
                    ${expense.amount.toFixed(2)}
                </div>
            </div>
            {expense.description && (
                <div className="expense-description">
                    {expense.description}
                </div>
            )}
            <div className="expense-actions">
                <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => onEdit(expense)}
                >
                    Edit
                </button>
                <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(expense.id)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
