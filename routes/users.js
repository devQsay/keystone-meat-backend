// server/routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // For password hashing
const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config(); // Load environment variables from .env file

// Database connection (replace with your actual credentials)
const dbConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

// GET /api/users
router.get("/", async (req, res) => {
  try {
    const client = new Client(dbConfig);
    await client.connect();
    const result = await client.query("SELECT id, username FROM users"); // Don't return password hashes
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// POST /api/users
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    const saltRounds = 10; // Choose an appropriate number of rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const client = new Client(dbConfig);
    await client.connect();
    const result = await client.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id;",
      [username, hashedPassword]
    );

    res.status(201).json({ userId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating user" });
  }
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const client = new Client(dbConfig);
    await client.connect();
    const result = await client.query(
      "SELECT id, username FROM users WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user" });
  }
});

// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  try {
    const { username, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const client = new Client(dbConfig);
    await client.connect();
    const result = await client.query(
      "UPDATE users SET username = $1, password_hash = $2 WHERE id = $3 RETURNING id;",
      [username, hashedPassword, req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json({ userId: result.rows[0].id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating user" });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const client = new Client(dbConfig);
    await client.connect();
    const result = await client.query(
      "DELETE FROM users WHERE id = $1 RETURNING id;",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json({ userId: result.rows[0].id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting user" });
  }
});

module.exports = router;
