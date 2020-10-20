const express = require('express');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;

// Initialize server
const app = express();

// Initialize database
connectDB();

// Initialize middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
