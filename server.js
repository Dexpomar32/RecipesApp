const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { initializeDatabase } = require('./db');

const app = express();
const port = 3000;
const SECRET_KEY = 'supersecretkey';

const db = initializeDatabase();

app.use(express.json());
app.use(cors());

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Uploads folder created: ${uploadsDir}`);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// API ENDPOINTS

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed: users.username')) {
                    return res.status(409).json({ message: 'User with this username already exists.' });
                }
                return res.status(500).json({ message: 'Error registering user.', error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Server error.', error: err.message });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login successful!', token: token, username: user.username });
    });
});

app.get('/api/recipes', (req, res) => {
    const query = `
        SELECT r.id, r.title, r.short_description, r.image_url, u.username
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching recipes.', error: err.message });
        }
        res.json(rows);
    });
});

app.get('/api/recipes/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT r.*, u.username
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
    `;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching recipe.', error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Recipe not found.' });
        }
        res.json(row);
    });
});

app.post('/api/recipes', authenticateToken, upload.single('image'), (req, res) => {
    const { title, short_description, ingredients, instructions } = req.body;
    const user_id = req.user.id;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !ingredients || !instructions) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        return res.status(400).json({ message: 'Title, ingredients, and instructions are required.' });
    }

    db.run(
        `INSERT INTO recipes (title, short_description, image_url, ingredients, instructions, user_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [title, short_description, image_url, ingredients, instructions, user_id],
        function(err) {
            if (err) {
                if (req.file) {
                    fs.unlink(req.file.path, (unlinkErr) => {
                        if (unlinkErr) console.error('Error deleting file after DB error:', unlinkErr);
                    });
                }
                return res.status(500).json({ message: 'Error creating recipe.', error: err.message });
            }
            res.status(201).json({ message: 'Recipe created successfully!', id: this.lastID, image_url: image_url });
        }
    );
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Frontend available via http://localhost:${port}/index.html`);
});