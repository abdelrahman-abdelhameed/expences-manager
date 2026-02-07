package models

import (
	"time"
)

type MonthlyPlan struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id" gorm:"not null;uniqueIndex:idx_user_month_category"`
	Month         int       `json:"month" gorm:"not null;uniqueIndex:idx_user_month_category;index:idx_year_month"`
	Year          int       `json:"year" gorm:"not null;uniqueIndex:idx_user_month_category;index:idx_year_month"`
	CategoryID    *uint     `json:"category_id" gorm:"uniqueIndex:idx_user_month_category"`
	Category      *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID;constraint:OnDelete:CASCADE"`
	PlannedAmount float64   `json:"planned_amount" gorm:"type:decimal(10,2);not null"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (MonthlyPlan) TableName() string {
	return "monthly_plans"
}
