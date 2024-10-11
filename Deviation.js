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

// Utility function to calculate standard deviation
function calculateStandardDeviation(prices) {
    const n = prices.length;
    const mean = prices.reduce((a, b) => a + b, 0) / n;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    return Math.sqrt(variance);
}

// Define the `/deviation` API route
app.get('/deviation', async (req, res) => {
    const coin = req.query.coin;

    // Check if the coin parameter is valid (bitcoin, ethereum, or matic)
    const validCoins = ['bitcoin', 'ethereum', 'matic'];
    if (!validCoins.includes(coin)) {
        return res.status(400).json({ error: 'Invalid coin parameter. Valid options: bitcoin, ethereum, matic' });
    }

    try {
        // Retrieve the last 100 records for the requested cryptocurrency
        const cryptoData = await Crypto.find({ name: coin.charAt(0).toUpperCase() + coin.slice(1) })
            .sort({ timestamp: -1 })
            .limit(100);

        // Check if we have enough data
        if (cryptoData.length < 2) {
            return res.status(404).json({ error: 'Not enough data to calculate standard deviation' });
        }

        // Extract prices from the records
        const prices = cryptoData.map(record => record.price_usd);

        // Calculate the standard deviation of the prices
        const deviation = calculateStandardDeviation(prices);

        // Return the result
        res.json({ deviation: parseFloat(deviation.toFixed(2)) });
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
