Using Nodejs and Mongodb
Fetch.js : Implement a background job that will fetch the current price in USD, market cap in USD and 24 hour change of 3 cryptocurrencies: Bitcoin, Matic, and Ethereum and store it in a database. This job should run once every 2 hours.
Latest_data.js: Implement an API /stats, that will return the latest data about the requested cryptocurrency.
Query params:
{
	coin: `bitcoin` // Could be one of the above 3 coins
}
Deviation.js: Implement an API, /deviation, that will return the standard deviation of the price of the requested cryptocurrency for the last 100 records stored by the background service in the database.
For example, consider the database only has 3 records for bitcoin, each with a price of 40000, 45000, 50000 respectively. Then the result should return 4082.48.
Query params:
{
	coin: `bitcoin` // Could be one of the above 3 coins
}
