package models

import (
	"time"
)

type Category struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"not null;index:idx_user_id"`
	Name        string    `json:"name" gorm:"size:100;not null"`
	Description string    `json:"description" gorm:"type:text"`
	Color       string    `json:"color" gorm:"size:7;default:#3B82F6"`
	Icon        string    `json:"icon" gorm:"size:50;default:receipt"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Category) TableName() string {
	return "categories"
}
