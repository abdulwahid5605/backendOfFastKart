const productSchema = `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    ratings INTEGER DEFAULT 0,
    category TEXT NOT NULL,
    no_of_reviews INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 1
  );
`;

module.exports = productSchema;
