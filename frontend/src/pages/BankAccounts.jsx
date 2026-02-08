import React, { useState, useEffect } from 'react';
import { bankAccountService } from '../services/bankAccountService';
import BankAccountCard from '../components/BankAccountCard';
import BankAccountForm from '../components/BankAccountForm';
import './BankAccounts.css';

const BankAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);

  const getCurrencyLabel = (currency) => {
    const code = (currency || 'USD').toUpperCase();
    return code === 'SAR' || code === 'SR' ? 'SR' : code;
  };

  const getSummaryCurrency = () => {
    const currencies = Array.from(
      new Set(accounts.map((account) => (account.currency || 'USD').toUpperCase()))
    );
    if (currencies.length === 1) {
      return currencies[0];
    }
    return 'MULTI';
  };

  const calculateTotalBalance = () => {
    const total = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
    setTotalBalance(total);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    calculateTotalBalance();
  }, [accounts]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await bankAccountService.getAll();
      setAccounts(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError('Failed to load bank accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await bankAccountService.delete(id);
      setAccounts(accounts.filter((acc) => acc.id !== id));
    } catch (err) {
      console.error('Error deleting bank account:', err);
      alert('Failed to delete account');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingAccount) {
        // Update existing account
        const response = await bankAccountService.update(editingAccount.id, formData);
        setAccounts(
          accounts.map((acc) => (acc.id === editingAccount.id ? response.data : acc))
        );
      } else {
        // Create new account
        const response = await bankAccountService.create(formData);
        setAccounts([...accounts, response.data]);
      }
      setShowForm(false);
      setEditingAccount(null);
    } catch (err) {
      console.error('Error saving bank account:', err);
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      alert(apiMessage || 'Failed to save account');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  return (
    <div className="bank-accounts-page">
      <div className="page-header">
        <h1>Bank Accounts</h1>
        <button className="btn-primary" onClick={handleAddNew}>
          + Add Bank Account
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <BankAccountForm
            account={editingAccount}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {loading ? (
        <div className="loading">Loading bank accounts...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : accounts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏦</div>
          <h3>No Bank Accounts Yet</h3>
          <p>Start by adding your first bank account to track your finances.</p>
          <button className="btn-secondary" onClick={handleAddNew}>
            Add Your First Account
          </button>
        </div>
      ) : (
        <>
          <div className="summary-section">
            <div className="summary-card">
              <span className="summary-label">Total Balance</span>
              <span className="summary-amount">
                {getCurrencyLabel(getSummaryCurrency())} {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="summary-count">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="account-stats">
              <div className="stat-item">
                <span className="stat-label">Active</span>
                <span className="stat-value">{accounts.filter((a) => a.is_active).length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Inactive</span>
                <span className="stat-value">{accounts.filter((a) => !a.is_active).length}</span>
              </div>
            </div>
          </div>

          <div className="accounts-list">
            <h2>Your Accounts</h2>
            {accounts.map((account) => (
              <BankAccountCard
                key={account.id}
                account={account}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BankAccounts;
