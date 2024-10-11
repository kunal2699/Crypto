const express = require('express');
const mongoose = require('mongoose');

// Initialize Express
const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/crypto_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Define a schema for cryptocurrency data
const cryptoSchema = new mongoose.Schema({
    name: String,
    price_usd: Number,
    market_cap_usd: Number,
    change_24h: Number,
    timestamp: { type: Date, default: Date.now }
});

// Create a model for cryptocurrency data
const Crypto = mongoose.model('Crypto', cryptoSchema);

// Define the `/stats` API route
app.get('/stats', async (req, res) => {
    const coin = req.query.coin;

    // Check if the coin parameter is valid (bitcoin, ethereum, or matic)
    const validCoins = ['bitcoin', 'ethereum', 'matic'];
    if (!validCoins.includes(coin)) {
        return res.status(400).json({ error: 'Invalid coin parameter. Valid options: bitcoin, ethereum, matic' });
    }

    try {
        // Find the latest data for the requested cryptocurrency
        const cryptoData = await Crypto.findOne({ name: coin.charAt(0).toUpperCase() + coin.slice(1) }).sort({ timestamp: -1 });

        // If no data is found, return an error
        if (!cryptoData) {
            return res.status(404).json({ error: 'No data found for the requested coin' });
        }

        // Return the latest data in the required format
        res.json({
            price_us: cryptoData.price_usd,
            marketCap: cryptoData.market_cap_usd,
            "24hChange": cryptoData.change_24h
        });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Define a simple route for health check
app.get('/', (req, res) => {
    res.send('Crypto Data Retrieval Service is Running');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
