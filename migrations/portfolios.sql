CREATE TABLE IF NOT EXISTS portfolios (
    id CHAR(36) PRIMARY KEY,  
    user_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    base_currency VARCHAR(10) NOT NULL,
    total_value NUMERIC(18, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_user_id_portfolios'
    ) THEN
        ALTER TABLE portfolios
        ADD CONSTRAINT unique_user_id_portfolios UNIQUE (user_id);
    END IF;
END$$;

