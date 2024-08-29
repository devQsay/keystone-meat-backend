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

// GET all orders
router.get("/", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const result = await client.query("SELECT * FROM orders");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

// GET order by id
router.get("/:id", async (req, res) => {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    const id = req.params.id;
    const result = await client.query("SELECT * FROM orders WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.end();
  }
});

module.exports = router;
