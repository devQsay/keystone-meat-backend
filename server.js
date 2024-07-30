const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { Client } = require("pg");

const productsRouter = require("./routes/products"); //import products router
const usersRouter = require("./routes/users"); //import users router
const authRouter = require("./routes/auth"); //import auth router

// Create an Express router
const router = express.Router();

dotenv.config(); // Load environment variables from .env file

const app = express();

const port = process.env.PORT || 2342; // Get port from environment or use 5000 as default

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection (replace with your actual credentials)
const dbConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

const client = new Client(dbConfig);
client.connect();

// Dummy route - not actually in production.
app.get("/api/animals", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM animals");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching animals");
  }
});

//Mounts the products router on the endpoint
app.use("/api/products", productsRouter);

//Mounts the users router on the endpoint
app.use("/api/users", usersRouter);

//Mounts the auth router on the endpoint
app.use("/api/auth", authRouter);

// Add more routes as needed

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
