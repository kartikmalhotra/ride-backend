const { pool } = require('../config/db');

async function createUser(name, phone, role = 'rider') {
  try {
    const query = `
      INSERT INTO users (name, phone, role)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, phone, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

async function getUserByPhone(phone) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

module.exports = { createUser, getUserByPhone };
