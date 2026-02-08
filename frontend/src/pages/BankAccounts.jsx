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
  const [transactionAccount, setTransactionAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    type: 'credit',
    description: '',
  });
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);

  const getCurrencyLabel = (currency) => {
    const code = (currency || 'SAR').toUpperCase();
    return code === 'SAR' || code === 'SR' ? 'SR' : code;
  };

  const getSummaryCurrency = () => {
    const currencies = Array.from(
      new Set(accounts.map((account) => (account.currency || 'SAR').toUpperCase()))
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

  const openTransactions = async (account) => {
    setTransactionAccount(account);
    setTransactionsError(null);
    setTransactionForm({ amount: '', type: 'credit', description: '' });
    await loadTransactions(account.id);
  };

  const closeTransactions = () => {
    setTransactionAccount(null);
    setTransactions([]);
    setTransactionsError(null);
  };

  const loadTransactions = async (accountId) => {
    try {
      setTransactionsLoading(true);
      const response = await bankAccountService.getTransactions(accountId, 50);
      setTransactions(response.data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactionsError('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!transactionAccount) {
      return;
    }
    const amountValue = Number(transactionForm.amount);
    if (!amountValue || amountValue <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      const response = await bankAccountService.addTransaction(transactionAccount.id, {
        amount: amountValue,
        type: transactionForm.type,
        description: transactionForm.description,
      });
      const createdTransaction = response.data?.transaction;
      const updatedBalance = response.data?.balance;

      if (createdTransaction) {
        setTransactions((prev) => [createdTransaction, ...prev]);
      }
      if (typeof updatedBalance === 'number') {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === transactionAccount.id ? { ...acc, balance: updatedBalance } : acc
          )
        );
        setTransactionAccount((prev) =>
          prev ? { ...prev, balance: updatedBalance } : prev
        );
      }
      setTransactionForm({ amount: '', type: transactionForm.type, description: '' });
    } catch (err) {
      console.error('Error adding transaction:', err);
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      alert(apiMessage || 'Failed to add transaction');
    }
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
                onTransactions={openTransactions}
              />
            ))}
          </div>

          {transactionAccount && (
            <div className="transactions-panel">
              <div className="transactions-header">
                <div>
                  <h3>Transactions: {transactionAccount.account_name}</h3>
                  <span className="transactions-balance">
                    {getCurrencyLabel(transactionAccount.currency)} {Number(transactionAccount.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <button className="btn-secondary" onClick={closeTransactions}>Close</button>
              </div>

              <form className="transactions-form" onSubmit={handleTransactionSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="transaction_amount">Amount *</label>
                    <input
                      id="transaction_amount"
                      type="number"
                      name="amount"
                      value={transactionForm.amount}
                      onChange={handleTransactionChange}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="transaction_type">Type *</label>
                    <select
                      id="transaction_type"
                      name="type"
                      value={transactionForm.type}
                      onChange={handleTransactionChange}
                    >
                      <option value="credit">Add Money</option>
                      <option value="debit">Subtract Money</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="transaction_description">Description</label>
                  <input
                    id="transaction_description"
                    type="text"
                    name="description"
                    value={transactionForm.description}
                    onChange={handleTransactionChange}
                    placeholder="e.g., Salary, ATM withdrawal"
                  />
                </div>
                <div className="transactions-actions">
                  <button type="submit" className="btn-primary">Save Transaction</button>
                </div>
              </form>

              <div className="transactions-list">
                <h4>Recent Transactions</h4>
                {transactionsLoading ? (
                  <div className="loading">Loading transactions...</div>
                ) : transactionsError ? (
                  <div className="error">{transactionsError}</div>
                ) : transactions.length === 0 ? (
                  <div className="empty-state">No transactions yet.</div>
                ) : (
                  <ul>
                    {transactions.map((tx) => (
                      <li key={tx.id} className={tx.type === 'debit' ? 'tx-debit' : 'tx-credit'}>
                        <div>
                          <span className="tx-type">{tx.type === 'debit' ? 'Subtract' : 'Add'}</span>
                          {tx.description && <span className="tx-desc">{tx.description}</span>}
                        </div>
                        <span className="tx-amount">
                          {tx.type === 'debit' ? '-' : '+'}{getCurrencyLabel(transactionAccount.currency)} {Number(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BankAccounts;
