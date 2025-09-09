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