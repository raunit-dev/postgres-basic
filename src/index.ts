require('dotenv').config()
import { Client } from 'pg'

import express from 'express'
import bcrypt from 'bcrypt'

const app = express()
app.use(express.json())


app.post('/signup', async (req:any, res:any) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered', user: result.rows[0] });
    } catch (err) {
        console.error('Error signing up:', err);
        res.status(500).json({ error: 'Error registering user' });
    }
});


app.post('/signin', async (req:any, res:any) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await client.query('SELECT id, username, email, password FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({ message: 'Sign-in successful', user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        console.error('Error signing in:', err);
        res.status(500).json({ error: 'Error during sign-in' });
    }
});


app.post('/users', async (req, res) => {
    const { username, email, password, city, country, street, pincode } = req.body;

    try {
        await client.query('BEGIN');
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password with salt

        const insertQueryUsers = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id";
        const values = [username, email, hashedPassword];
        const result = await client.query(insertQueryUsers, values);
        const userId = result.rows[0].id;

        const insertQeuryAddress = "INSERT INTO addresses (userId, city, country, street, pincode) VALUES ($1,$2,$3,$4,$5)";
        const valueAdd = [userId, city, country, street, pincode];
        const addresp = await client.query(insertQeuryAddress, valueAdd);

        await client.query('COMMIT');

        console.log('Users adn address inserted successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error during user registration:', err);
        res.status(500).json({ error: 'Error registering user' });
    }
})

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) { // did we find the user with these id 
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Error fetching user' });
    }
})

app.get('/users/:id/address', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query(
            'SELECT city, country, street, pincode, created_at FROM addresses WHERE user_id = $1',
            [id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Address not found for user' });
        }
    } catch (err) {
        console.error('Error fetching address:', err);
        res.status(500).json({ error: 'Error fetching address' });
    }
});

app.get('/users/:id/details', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                u.id, u.username, u.email, u.created_at,
                a.city, a.country, a.street, a.pincode, a.created_at AS address_created_at
            FROM users u
            INNER JOIN addresses a ON u.id = a.user_id
            WHERE u.id = $1
        `;

        const result = await client.query(query, [id]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User or address not found' });
        }
    } catch (err) {
        console.error('Error fetching user details with address:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



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

async function createAddressTable() {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS addresses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            city VARCHAR(100) NOT NULL,
            street VARCHAR(255) NOT NULL,
            pincode VARCHAR(20) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );`
        )
        console.log('Addresses table created or already exits.');
    } catch (err) {
        console.error('Error creating Addresses table:', err);
    }
}

async function main() {
    await client.connect();
    await createUsersTable();
    await createAddressTable();

    app.listen(3000, () => {
        console.log('Server listening on port 3000');
    });
}

main();