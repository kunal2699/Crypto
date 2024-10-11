const express = require('express');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const cron = require('node-cron');

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

// Function to fetch cryptocurrency data using node-fetch
async function fetchCryptoData() {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cmatic-network%2Cethereum&vs_currencies=usd&include_market_cap=true&include_24hr_change=true';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': 'CG-CmEHvjcDtwMQqAX9yGiQAk26'
        }
    };

    try {
        const res = await fetch(url, options);
        const data = await res.json();
        console.log(data);
        const cryptos = [
            {
                name: "Bitcoin",
                price_usd: data.bitcoin.usd,
                market_cap_usd: data.bitcoin.usd_market_cap,
                change_24h: data.bitcoin.usd_24h_change
            },
            {
                name: "Matic",
                price_usd: data['matic-network'].usd,
                market_cap_usd: data['matic-network'].usd_market_cap,
                change_24h: data['matic-network'].usd_24h_change
            },
            {
                name: "Ethereum",
                price_usd: data.ethereum.usd,
                market_cap_usd: data.ethereum.usd_market_cap,
                change_24h: data.ethereum.usd_24h_change
            }
        ];
        await Crypto.insertMany(cryptos);
        console.log('Data fetched and updated successfully in MongoDB');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
// Schedule the task to run every 2 hours
cron.schedule('0 */2 * * *', fetchCryptoData);
fetchCryptoData();
// Define a simple route
app.get('/', (req, res) => {
    res.send('Crypto Data Fetching Service is Running');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
