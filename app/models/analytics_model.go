package models

import (
	"time"

	db "github.com/yorukot/zipt/pkg/database"
)

func init() {
	db.GetDB().AutoMigrate(&URLAnalytics{})
	db.GetDB().AutoMigrate(&URLReferrer{})
	db.GetDB().AutoMigrate(&URLEngagement{})
	db.GetDB().AutoMigrate(&URLCountryAnalytics{})
}

// URLReferrer tracks referrers separately to optimize storage
type URLReferrer struct {
	ID         uint64    `json:"id" gorm:"primary_key"`
	URLID      uint64    `json:"url_id" gorm:"index;not null"`
	Referrer   string    `json:"referrer" gorm:"index"`
	Country    string    `json:"country" gorm:"size:2;index"` // ISO country code (2 characters)
	ClickCount int64     `json:"click_count" gorm:"default:0"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// URLCountryAnalytics tracks visitors by country
type URLCountryAnalytics struct {
	ID         uint64    `json:"id" gorm:"primary_key"`
	URLID      uint64    `json:"url_id" gorm:"index;not null"`
	Country    string    `json:"country" gorm:"size:2;index"` // ISO country code (2 characters)
	ClickCount int64     `json:"click_count" gorm:"default:0"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// URLAnalytics stores analytics data for URL clicks
type URLAnalytics struct {
	ID         uint64    `json:"id" gorm:"primary_key"`
	URLID      uint64    `json:"url_id" gorm:"index;not null"`
	ClickCount int64     `json:"click_count" gorm:"default:0"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// URLEngagement tracks the total click count every hour
type URLEngagement struct {
	ID         uint64    `json:"id" gorm:"primary_key"`
	URLID      uint64    `json:"url_id" gorm:"index;not null"`
	Engagement int64     `json:"engagement" gorm:"default:0"`
	TimeStart  time.Time `json:"time_start"`
	TimeEnd    time.Time `json:"time_end"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
