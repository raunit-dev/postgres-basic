require('dotenv').config() 
import { Client } from 'pg'

import express from 'express'
import bcrypt from 'bcrypt'

const app = express()
app.use(express.json())

app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password with salt

    const insertQuery = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *";
    const values = [username, email, hashedPassword];
    const result = await client.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error during user registration:', err);
    res.status(500).json({ error: 'Error registering user' });
  }
})

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Error fetching user' });
    }
})

const client = new Client({
  connectionString: process.env.DATABASE_URL
})

async function createUsersTable() {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `)
        console.log('Users table created or already exists.')
    } catch (err) {
        console.error('Error creating users table:', err);
    }
}

async function main() {
    await client.connect();
    await createUsersTable();

    app.listen(3000, () => {
        console.log('Server listening on port 3000');
    });
}

main();