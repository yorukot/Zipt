-- Convert url_analytics table to TimescaleDB hypertable
SELECT create_hypertable(
        'url_analytics',
        'bucket_time',
        if_not_exists => TRUE
    );

-- Create continuous aggregate view for hourly click counts
CREATE MATERIALIZED VIEW url_analytics_hourly WITH (timescaledb.continuous) AS
SELECT url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    time_bucket(INTERVAL '1 hour', bucket_time) AS bucket_hour,
    SUM(click_count) AS total_clicks
FROM url_analytics
GROUP BY url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    bucket_hour;

-- Create continuous aggregate view for daily click counts
CREATE MATERIALIZED VIEW url_analytics_daily WITH (timescaledb.continuous) AS
SELECT url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    time_bucket(INTERVAL '1 day', bucket_time) AS bucket_day,
    SUM(click_count) AS total_clicks
FROM url_analytics
GROUP BY url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    bucket_day;

-- Create continuous aggregate view for monthly click counts
CREATE MATERIALIZED VIEW url_analytics_monthly WITH (timescaledb.continuous) AS
SELECT url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    time_bucket(INTERVAL '1 month', bucket_time) AS bucket_month,
    SUM(click_count) AS total_clicks
FROM url_analytics
GROUP BY url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    bucket_month;

-- Set retention policies for continuous aggregates
SELECT add_continuous_aggregate_policy(
        'url_analytics_hourly',
        start_offset => INTERVAL '7 days',
        end_offset => INTERVAL '1 hour',
        schedule_interval => INTERVAL '1 hour'
    );

-- Set data retention policies
SELECT add_retention_policy('url_analytics', INTERVAL '12 hours');
-- Hourly data retention: 14 days
SELECT add_retention_policy('url_analytics_hourly', INTERVAL '14 days');
-- Daily data retention: 365 days
SELECT add_retention_policy('url_analytics_daily', INTERVAL '365 days');
-- Monthly data retention: 100 years
SELECT add_retention_policy('url_analytics_monthly', INTERVAL '100 years');