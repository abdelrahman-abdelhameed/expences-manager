package models

import "time"

type BankAccountTransaction struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id" gorm:"not null;index:idx_user_id"`
	BankAccountID uint      `json:"bank_account_id" gorm:"not null;index:idx_bank_account_id"`
	Type          string    `json:"type" gorm:"size:10;not null"` // credit or debit
	Amount        float64   `json:"amount" gorm:"type:decimal(10,2);not null"`
	Description   string    `json:"description" gorm:"type:text"`
	CreatedAt     time.Time `json:"created_at"`
}

func (BankAccountTransaction) TableName() string {
	return "bank_account_transactions"
}
