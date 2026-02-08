import React, { useState } from 'react';
import './BankAccountForm.css';

const BankAccountForm = ({ account, onSubmit, onCancel }) => {
  const getInitialFormData = () => ({
    account_name: account?.account_name || '',
    bank_name: account?.bank_name || '',
    account_type: account?.account_type || 'Checking',
    account_number: account?.account_number || '',
    balance: account?.balance || 0,
    currency: account?.currency || 'USD',
    color: account?.color || '#3B82F6',
    icon: account?.icon || '🏦',
    notes: account?.notes || '',
    is_active: account?.is_active !== false,
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.account_name || !formData.bank_name || !formData.account_number) {
      alert('Please fill in all required fields');
      return;
    }
    const balanceValue = formData.balance === '' || formData.balance === null
      ? 0
      : Number(formData.balance);
    const payload = {
      ...formData,
      account_name: formData.account_name.trim(),
      bank_name: formData.bank_name.trim(),
      account_number: formData.account_number.trim(),
      account_type: formData.account_type.trim(),
      currency: (formData.currency || 'USD').toUpperCase(),
      balance: Number.isNaN(balanceValue) ? 0 : balanceValue,
    };
    onSubmit(payload);
  };

  const accountTypes = ['Checking', 'Savings', 'Credit Card', 'Investment', 'Money Market', 'CD'];
  const currencies = [
    { value: 'SAR', label: 'SAR (SR)' },
    { value: 'USD', label: 'USD' },
   
  ];

  return (
    <form className="bank-account-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="account_name">Account Name *</label>
        <input
          id="account_name"
          type="text"
          name="account_name"
          value={formData.account_name}
          onChange={handleChange}
          placeholder="e.g., My Checking Account"
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="bank_name">Bank Name *</label>
        <input
          id="bank_name"
          type="text"
          name="bank_name"
          value={formData.bank_name}
          onChange={handleChange}
          placeholder="e.g., Chase Bank"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="account_type">Account Type *</label>
          <select
            id="account_type"
            name="account_type"
            value={formData.account_type}
            onChange={handleChange}
            required
          >
            {accountTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
          >
            {currencies.map((curr) => (
              <option key={curr.value} value={curr.value}>
                {curr.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="balance">Balance</label>
          <input
            id="balance"
            type="number"
            name="balance"
            value={formData.balance}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="account_number">Account Number</label>
          <input
            id="account_number"
            type="text"
            name="account_number"
            value={formData.account_number}
            onChange={handleChange}
            placeholder="Last 4 digits (required)"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="color">Color</label>
          <div className="color-input-wrapper">
            <input
              id="color"
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
            <span className="color-value">{formData.color}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="icon">Icon</label>
          <input
            id="icon"
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="e.g., 🏦"
            maxLength="2"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes about this account"
          rows="3"
        />
      </div>

      <div className="form-group checkbox">
        <input
          id="is_active"
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
        />
        <label htmlFor="is_active">Active Account</label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit">
          {account ? 'Update Account' : 'Create Account'}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BankAccountForm;
