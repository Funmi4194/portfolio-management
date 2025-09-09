CREATE TABLE IF NOT EXISTS positions (
    id CHAR(36) PRIMARY KEY,  
    portfolio_id VARCHAR NOT NULL,
    symbol VARCHAR NOT NULL,
    quantity NUMERIC(18, 8) NOT NULL,
    avg_buy_price NUMERIC(18, 8) NOT NULL,
    current_price NUMERIC(18, 8),
    unrealized_pnl NUMERIC(18, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_portfolio_id_symbol_positions'
    ) THEN
        ALTER TABLE positions
        ADD CONSTRAINT unique_portfolio_id_symbol_positions UNIQUE (portfolio_id, symbol);
    END IF;
END$$;

