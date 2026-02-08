import React from 'react';
import './BankAccountCard.css';

const BankAccountCard = ({ account, onEdit, onDelete }) => {
  const getCurrencyLabel = (currency) => {
    const code = (currency || 'USD').toUpperCase();
    return code === 'SAR' || code === 'SR' ? 'SR' : code;
  };

  const accountType = account.account_type || 'Account';
  const accountTypeClass = accountType.toLowerCase().replace(/\s+/g, '-');

  const handleEdit = () => {
    onEdit(account);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${account.account_name}?`)) {
      onDelete(account.id);
    }
  };

  return (
    <div className="bank-account-card">
      <div className="card-header">
        <div className="card-title-section">
          <span className="card-icon" style={{ fontSize: '24px' }}>{account.icon || '🏦'}</span>
          <div className="card-title-info">
            <h3 className="card-title">{account.account_name}</h3>
            <p className="card-bank">{account.bank_name}</p>
          </div>
        </div>
        <span className={`account-type ${accountTypeClass}`}>
          {accountType}
        </span>
      </div>

      <div className="card-content">
        <div className="balance-section">
          <span className="balance-label">Balance</span>
          <span className="balance-amount">
            {getCurrencyLabel(account.currency)} {Number(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {account.account_number && (
          <div className="account-number">
            Account: {account.account_number}
          </div>
        )}

        {account.notes && (
          <div className="notes">
            {account.notes}
          </div>
        )}

        <div className="account-status">
          {account.is_active ? (
            <span className="status-active">Active</span>
          ) : (
            <span className="status-inactive">Inactive</span>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button className="btn-edit" onClick={handleEdit} title="Edit account">
          ✎
        </button>
        <button className="btn-delete" onClick={handleDelete} title="Delete account">
          🗑
        </button>
      </div>
    </div>
  );
};

export default BankAccountCard;
