package models

import (
	"time"
)

type DailyExpense struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"not null;index:idx_user_id"`
	Amount      float64   `json:"amount" gorm:"type:decimal(10,2);not null"`
	Description string    `json:"description" gorm:"type:text"`
	ExpenseDate time.Time `json:"expense_date" gorm:"type:date;not null;index:idx_expense_date"`
	CategoryID  *uint     `json:"category_id" gorm:"index:idx_category_id"`
	Category    *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID;constraint:OnDelete:SET NULL"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (DailyExpense) TableName() string {
	return "daily_expenses"
}
