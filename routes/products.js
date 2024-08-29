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

router.get("/:id", async (req, res) => {
  const productId = parseInt(req.params.id); // Extract the ID from the URL parameters
  // Input validation (optional):
  if (isNaN(productId) || productId < 1) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  try {
    const client = new Client(dbConfig);
    await client.connect();

    const query = "SELECT * FROM products WHERE id = $1";
    const result = await client.query(query, [productId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(result.rows[0]); // Return the single product object
    }
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Error fetching product" });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  const { name, price } = req.body; // Assuming product has name and price fields
  try {
    const client = new Client(dbConfig);
    await client.connect();
    const query =
      "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *";
    const result = await client.query(query, [name, price]);
    res.status(201).json(result.rows[0]); // Return the created product
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Error creating product" });
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price } = req.body; // Assuming product has name and price fields
  try {
    const client = new Client(dbConfig);
    await client.connect();
    const query =
      "UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *";
    const result = await client.query(query, [name, price, productId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(result.rows[0]); // Return the updated product
    }
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Error updating product" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  try {
    const client = new Client(dbConfig);
    await client.connect();
    const query = "DELETE FROM products WHERE id = $1";
    const result = await client.query(query, [productId]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.status(204).send(); // No content to send back
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Error deleting product" });
  }
});

module.exports = router;
