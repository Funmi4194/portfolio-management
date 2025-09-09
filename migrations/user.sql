CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,            -- UUID, 36 characters
    email VARCHAR(255) NOT NULL UNIQUE,    -- Unique email
    password VARCHAR(255) NOT NULL,       -- Store hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
