// server/routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // For password hashing
const dbConfig = require("../config");
const { Client } = require("pg");

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

module.exports = router;
