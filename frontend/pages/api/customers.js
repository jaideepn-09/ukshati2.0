// pages/api/customers.js
import mysql from "mysql2/promise";

export default async function handler(req, res) {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // GET all customers
    if (req.method === "GET") {
      const [rows] = await connection.execute(
        "SELECT cid, cname, cphone, alternate_phone, status, remark FROM customer"
      );
      return res.status(200).json({ customers: rows });
    }

    // POST new customer
    if (req.method === "POST") {
      const { cname, cphone, alternate_phone, status, remark } = req.body;

      if (!cname?.trim() || !cphone?.trim()) {
        return res.status(400).json({ error: "Name and phone are required" });
      }

      const [result] = await connection.execute(
        `INSERT INTO customer 
         (cname, cphone, alternate_phone, status, remark) 
         VALUES (?, ?, ?, ?, ?)`,
        [cname, cphone, alternate_phone || null, status || "lead", remark || null]
      );

      const [newCustomer] = await connection.execute(
        "SELECT * FROM customer WHERE cid = ?",
        [result.insertId]
      );

      return res.status(201).json(newCustomer[0]);
    }

    // PUT update customer
    if (req.method === "PUT") {
      const { cid } = req.query;
      const updates = req.body;

      if (!cid) return res.status(400).json({ error: "Customer ID is required" });

      const [existing] = await connection.execute(
        "SELECT * FROM customer WHERE cid = ?",
        [cid]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const merged = { ...existing[0], ...updates };

      await connection.execute(
        `UPDATE customer 
         SET cname = ?, cphone = ?, alternate_phone = ?, status = ?, remark = ? 
         WHERE cid = ?`,
        [
          merged.cname,
          merged.cphone,
          merged.alternate_phone || null,
          merged.status || "lead",
          merged.remark || null,
          cid,
        ]
      );

      return res.status(200).json({ message: "Customer updated", customer: merged });
    }

    // DELETE customer
    if (req.method === "DELETE") {
      const { cid } = req.query;

      if (!cid) return res.status(400).json({ error: "Customer ID is required" });

      const [existing] = await connection.execute(
        "SELECT * FROM customer WHERE cid = ?",
        [cid]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }

      await connection.execute("DELETE FROM customer WHERE cid = ?", [cid]);

      return res.status(200).json({ message: "Customer deleted successfully" });
    }

    // Method not allowed
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.end();
  }
}
