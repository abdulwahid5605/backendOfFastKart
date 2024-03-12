const { Client } = require("pg");

const connectDatabase = () => {
  const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "password",
    database: "postgres",
  });

  client.connect((err, client, done) => {
    if (err) {
      console.error("Error connecting to PostgreSQL:", err);
      return;
    }
    console.log("PostgreSQL is successfully connected");

    // done();
  });
};

module.exports = connectDatabase;
