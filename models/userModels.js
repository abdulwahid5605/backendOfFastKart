const userSchema = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL CHECK (LENGTH(name) <= 30 AND LENGTH(name) >= 4),
    email VARCHAR NOT NULL UNIQUE CHECK (POSITION('@' IN email) > 0 AND POSITION('.' IN REVERSE(email)) > POSITION('@' IN email)),
    password VARCHAR NOT NULL CHECK (LENGTH(password) >= 8),
    avatar_public_id VARCHAR NOT NULL,
    avatar_url VARCHAR NOT NULL,
    role VARCHAR DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_password_token VARCHAR,
    reset_password_expire TIMESTAMP
);`;
module.exports = userSchema;
