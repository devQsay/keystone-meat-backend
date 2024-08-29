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

// GET all order items
router.get("/", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query("SELECT * FROM order_items");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// GET a single order item by ID
router.get("/:id", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query(
      "SELECT * FROM order_items WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Order item not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// POST a new order item
router.post("/", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query(
      "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [req.body.order_id, req.body.product_id, req.body.quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// PUT (update) an existing order item
router.put("/:id", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query(
      "UPDATE order_items SET order_id = $1, product_id = $2, quantity = $3 WHERE id = $4 RETURNING *",
      [req.body.order_id, req.body.product_id, req.body.quantity, req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Order item not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// DELETE an order item
router.delete("/:id", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query(
      "DELETE FROM order_items WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Order item not found" });
    } else {
      res.json({ message: "Order item deleted" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

module.exports = router;
