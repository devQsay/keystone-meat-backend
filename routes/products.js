// routes/products.js
const express = require("express");
const router = express.Router();
const { Client } = require("pg"); // assuming you're using 'pg' to connect to PostgreSQL
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

// Database connection (replace with your actual credentials)
const dbConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const client = new Client(dbConfig);
    await client.connect();
    const result = await client.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching products" });
  }
});

module.exports = router;
