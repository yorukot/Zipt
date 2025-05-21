-- Convert url_analytics table to TimescaleDB hypertable
SELECT create_hypertable(
        'url_analytics',
        'created_at',
        if_not_exists => TRUE
    );

-- Create continuous aggregate view for 2-minute click counts
CREATE MATERIALIZED VIEW url_analytics_2min WITH (timescaledb.continuous) AS
SELECT url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    time_bucket(INTERVAL '2 minutes', created_at) AS bucket_2min,
    COUNT(*) AS total_clicks
FROM url_analytics
GROUP BY url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    bucket_2min;

-- Create continuous aggregate view for hourly click counts
CREATE MATERIALIZED VIEW url_analytics_hourlies WITH (timescaledb.continuous) AS
SELECT url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    time_bucket(INTERVAL '1 hour', created_at) AS bucket_hour,
    COUNT(*) AS total_clicks
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
CREATE MATERIALIZED VIEW url_analytics_dailies WITH (timescaledb.continuous) AS
SELECT url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    time_bucket(INTERVAL '1 day', created_at) AS bucket_day,
    COUNT(*) AS total_clicks
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
CREATE MATERIALIZED VIEW url_analytics_monthlies WITH (timescaledb.continuous) AS
SELECT url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    time_bucket(INTERVAL '1 month', created_at) AS bucket_month,
    COUNT(*) AS total_clicks
FROM url_analytics
GROUP BY url_id,
    referrer,
    country,
    city,
    device,
    browser,
    os,
    bucket_month;

-- Add policy for 2-minute aggregates
SELECT add_continuous_aggregate_policy(
        'url_analytics_2min',
        start_offset => INTERVAL '6 hours',
        end_offset => INTERVAL '2 minutes',
        schedule_interval => INTERVAL '30 seconds'
    );

-- Set retention policies for continuous aggregates
SELECT add_continuous_aggregate_policy(
        'url_analytics_hourlies',
        start_offset => INTERVAL '7 days',
        end_offset => INTERVAL '1 hour',
        schedule_interval => INTERVAL '10 minutes'
    );

SELECT add_continuous_aggregate_policy(
    'url_analytics_dailies',
    start_offset => INTERVAL '14 days',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '10 minutes'
);

SELECT add_continuous_aggregate_policy(
    'url_analytics_monthlies',
    start_offset => INTERVAL '1 years',
    end_offset => INTERVAL '1 month',
    schedule_interval => INTERVAL '1 day'
);

-- Set data retention policies
-- 2-minute data retention: 24 hours
SELECT add_retention_policy('url_analytics_2min', INTERVAL '24 hours');
-- Hourly data retention: 14 days
SELECT add_retention_policy('url_analytics_hourlies', INTERVAL '14 days');
-- Daily data retention: 365 days
SELECT add_retention_policy('url_analytics_dailies', INTERVAL '365 days');
-- Monthly data retention: 100 years
SELECT add_retention_policy('url_analytics_monthlies', INTERVAL '100 years');