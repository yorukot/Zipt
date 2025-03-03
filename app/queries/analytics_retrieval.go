package queries

import (
	"errors"

	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"gorm.io/gorm"
)

// AnalyticsSummary represents a summary of URL analytics data
type AnalyticsSummary struct {
	TotalClicks      int64              `json:"total_clicks"`
	ReferrerStats    []ReferrerStat     `json:"referrer_stats"`
	CountryStats     []CountryStat      `json:"country_stats"`
	HourlyEngagement []EngagementPeriod `json:"hourly_engagement"`
}

// ReferrerStat represents statistics for a specific referrer
type ReferrerStat struct {
	Referrer   string  `json:"referrer"`
	ClickCount int64   `json:"click_count"`
	Percentage float64 `json:"percentage"`
}

// CountryStat represents statistics for a specific country
type CountryStat struct {
	Country    string  `json:"country"`
	ClickCount int64   `json:"click_count"`
	Percentage float64 `json:"percentage"`
}

// EngagementPeriod represents engagement during a specific time period
type EngagementPeriod struct {
	TimeStart  string `json:"time_start"`
	TimeEnd    string `json:"time_end"`
	Engagement int64  `json:"engagement"`
}

// URLSummary represents basic data about a URL for listing purposes
type URLSummary struct {
	ID          uint64 `json:"id"`
	ShortCode   string `json:"short_code"`
	OriginalURL string `json:"original_url"`
	ClickCount  int64  `json:"click_count"`
	CreatedAt   string `json:"created_at"`
	ExpiresAt   string `json:"expires_at,omitempty"`
}

// GetAnalyticsSummaryByURLID retrieves a summary of analytics data for a URL
func GetAnalyticsSummaryByURLID(urlID uint64) (*AnalyticsSummary, error) {
	database := db.GetDB()
	summary := &AnalyticsSummary{
		ReferrerStats:    []ReferrerStat{},
		CountryStats:     []CountryStat{},
		HourlyEngagement: []EngagementPeriod{},
	}

	// Get total clicks
	var urlAnalytics models.URLAnalytics
	result := database.Where("url_id = ?", urlID).First(&urlAnalytics)
	if result.Error == nil {
		summary.TotalClicks = urlAnalytics.ClickCount
	} else if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// If error is not "record not found", return it
		// This happens when the URL exists but has no analytics yet
		return nil, result.Error
	}

	// Get referrer stats
	var referrers []models.URLReferrer
	database.Where("url_id = ?", urlID).Order("click_count DESC").Limit(10).Find(&referrers)

	// Calculate percentages for referrers
	for _, ref := range referrers {
		percentage := 0.0
		if summary.TotalClicks > 0 {
			percentage = float64(ref.ClickCount) / float64(summary.TotalClicks) * 100
		}

		summary.ReferrerStats = append(summary.ReferrerStats, ReferrerStat{
			Referrer:   ref.Referrer,
			ClickCount: ref.ClickCount,
			Percentage: percentage,
		})
	}

	// Get country stats
	var countries []models.URLCountryAnalytics
	database.Where("url_id = ?", urlID).Order("click_count DESC").Limit(10).Find(&countries)

	// Calculate percentages for countries
	for _, country := range countries {
		percentage := 0.0
		if summary.TotalClicks > 0 {
			percentage = float64(country.ClickCount) / float64(summary.TotalClicks) * 100
		}

		summary.CountryStats = append(summary.CountryStats, CountryStat{
			Country:    country.Country,
			ClickCount: country.ClickCount,
			Percentage: percentage,
		})
	}

	// Get hourly engagement data
	var engagements []models.URLEngagement
	database.Where("url_id = ?", urlID).Order("time_start DESC").Limit(24).Find(&engagements)

	for _, engagement := range engagements {
		summary.HourlyEngagement = append(summary.HourlyEngagement, EngagementPeriod{
			TimeStart:  engagement.TimeStart.Format("2006-01-02 15:04:05"),
			TimeEnd:    engagement.TimeEnd.Format("2006-01-02 15:04:05"),
			Engagement: engagement.Engagement,
		})
	}

	return summary, nil
}

// GetUserURLSummaries retrieves summarized data for all URLs created by a specific user
func GetUserURLSummaries(userID uint64) ([]URLSummary, error) {
	database := db.GetDB()
	var urls []models.URL
	var summaries []URLSummary

	// Get all URLs created by this user with their analytics
	result := database.
		Select("urls.*, COALESCE(url_analytics.click_count, 0) as click_count").
		Joins("LEFT JOIN url_analytics ON urls.id = url_analytics.url_id").
		Where("urls.user_id = ?", userID).
		Order("urls.created_at DESC").
		Find(&urls)
	if result.Error != nil {
		return nil, result.Error
	}

	// Build the summary for each URL
	for _, url := range urls {
		summary := URLSummary{
			ID:          url.ID,
			ShortCode:   url.ShortCode,
			OriginalURL: url.OriginalURL,
			CreatedAt:   url.CreatedAt.Format("2006-01-02 15:04:05"),
			ClickCount:  url.ClickCount,
		}

		if url.ExpiresAt != nil {
			summary.ExpiresAt = url.ExpiresAt.Format("2006-01-02 15:04:05")
		}

		summaries = append(summaries, summary)
	}

	return summaries, nil
}
