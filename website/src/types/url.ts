// URL Types - Interfaces matching the backend Go models

// Request types
export interface CreateUrlRequest {
  original_url: string;
  custom_slug?: string;
  expires_at?: string; // ISO date string
}

export interface CreateUrlResponse {
  status: string;
  message: string;
  code: string | null;
  result: {
    short_code: string;
    original_url: string;
    short_url: string;
    expires_at?: string;
    created_at: string;
  };
}

// URL Model
export interface Url {
  id: string;
  original_url: string;
  short_code: string;
  click_count: number;
  created_at: string;
  updated_at?: string;
  expires_at?: string;
  user_id?: string;
}

// URL Listing Response
export interface ListUrlsResponse {
  status: string;
  message: string;
  code: string | null;
  result: {
    urls: Url[];
  };
}

// Analytics Types
export interface UrlReferrer {
  id: number;
  url_id: number;
  referrer: string;
  country: string; // ISO country code (2 characters)
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface UrlCountryAnalytics {
  id: number;
  url_id: number;
  country: string; // ISO country code (2 characters)
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface UrlAnalytics {
  url: Url;
  analytics: {
    total_clicks: number;
    browsers: Array<{browser: string; count: number}>;
    devices: Array<{device: string; count: number}>;
    referrers: Array<{referrer: string; count: number}>;
    countries: Array<{country: string; count: number}>;
  };
}

export interface UrlEngagement {
  id: number;
  url_id: number;
  engagement: number;
  time_start: string;
  time_end: string;
  created_at: string;
  updated_at: string;
}

// Analytics Summary Types for API Response
export interface BrowserSummary {
  browser: string;
  count: number;
}

export interface DeviceSummary {
  device: string;
  count: number;
}

export interface ReferrerSummary {
  referrer: string;
  count: number;
}

export interface CountrySummary {
  country: string;
  count: number;
}

// Full Analytics Response
export interface UrlAnalyticsResponse {
  status: string;
  message: string;
  code: string | null;
  data: UrlAnalytics;
}
