const express = require("express");
const router = express.Router();
const { Client } = require("pg");
require("dotenv").config();

const dbConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

// GET all customers
router.get("/", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query("SELECT * FROM customers");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// GET customer by ID
router.get("/:id", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query("SELECT * FROM customers WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// POST create a new customer
router.post("/", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const { name, email, phone } = req.body;
    const result = await client.query(
      "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
      [name, email, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// PUT update a customer by ID
router.put("/:id", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const { name, email, phone } = req.body;
    const result = await client.query(
      "UPDATE customers SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *",
      [name, email, phone, req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// DELETE a customer by ID
router.delete("/:id", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query(
      "DELETE FROM customers WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.json({ message: "Customer deleted successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

module.exports = router;
