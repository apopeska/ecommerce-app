require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// =========================
// GET /
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API is running"
  });
});

// =========================
// GET /api/products
// =========================

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      error: "Database error"
    });
  }
});

// =========================
// POST /api/orders
// =========================

app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();

  try {
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "User ID and cart items are required"
      });
    }

    const userResult = await client.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    await client.query("BEGIN");

    let totalPrice = 0;

    for (const item of items) {
      if (
        !item.productId ||
        !item.quantity ||
        item.quantity <= 0
      ) {
        throw new Error("Invalid order item");
      }

      const productResult = await client.query(
        "SELECT id, price FROM products WHERE id = $1",
        [item.productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error(
          `Product ${item.productId} not found`
        );
      }

      const price = Number(productResult.rows[0].price);

      totalPrice += price * item.quantity;
    }

    const orderResult = await client.query(
      `INSERT INTO orders
       (user_id, total_price, status)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, total_price, status, created_at`,
      [
        userId,
        totalPrice,
        "pending"
      ]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const productResult = await client.query(
        "SELECT price FROM products WHERE id = $1",
        [item.productId]
      );

      const price = productResult.rows[0].price;

      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [
          order.id,
          item.productId,
          item.quantity,
          price
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created successfully",
      order
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Order error:", error);

    res.status(500).json({
      error: "Failed to create order"
    });

  } finally {
    client.release();
  }
});

// =========================
// GET /api/orders
// =========================

app.get("/api/orders", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        o.id,
        o.user_id,
        o.total_price,
        o.status,
        o.created_at,
        u.name AS user_name,
        u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Orders database error:", error);

    res.status(500).json({
      error: "Database error"
    });
  }
});

// =========================
// GET /api/orders/:id
// =========================

app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `SELECT
        o.id,
        o.user_id,
        o.total_price,
        o.status,
        o.created_at,
        u.name AS user_name,
        u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name AS product_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [id]
    );

    res.json({
      order,
      items: itemsResult.rows
    });

  } catch (error) {
    console.error("Order details error:", error);

    res.status(500).json({
      error: "Database error"
    });
  }
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});