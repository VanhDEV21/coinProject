const axios = require('axios');
const Coin = require('../models/coins');
const cron = require('node-cron');
const API_KEY = '73feb218-7d95-459b-a40b-5f726d5c9c01';
const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

// Function fetch data from CoinMarketCap and save to database
const fetchAndSaveCoinData = async () => { 
    try {
        const response = await axios.get(url, {
            headers: {
                'X-CMC_PRO_API_KEY': API_KEY,
            },
            params: {
                start: 1,
                limit: 10,
                convert: 'USD',
            },
        });
        console.log('API Response:', response.data);
        const data = response.data.data;

        // Save data to MongoDB
        const savedData = [];
        for (const coin of data) {
            const crypto = {
                nameCoin: coin.name,
                currentPrice: coin.quote.USD.price.toFixed(2),
                Volume24h: coin.quote.USD.volume_24h.toFixed(2),
                calledAt: new Date().toLocaleString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true,  // Hiển thị AM/PM
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                }),
            };

            // Save or Update (upsert)
            const savedCoin= await Coin.findOneAndUpdate(
                { nameCoin: crypto.nameCoin }, // Điều kiện để tìm
                crypto, // Dữ liệu để update
                { upsert: true, new: true } // Tùy chọn: upsert nếu không tồn tại
            );
            if (savedCoin) {
                savedData.push(savedCoin);  // Lưu coin vừa cập nhật vào mảng savedData
            }
        }

        console.log('Data saved successfully!');
        return savedData;
    } catch (error) {
        console.error('Error fetching data for top coins:', error.message);
    }
};

// Function to get all coins from database
const getAllCoin = async (req, res) => {
    try {
        const coinData = await Coin.find();
        res.status(200).json(coinData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
};
// Function to handle the fetch and save process and return result
const getCoinDataAfterFetch = async (req, res) => {
    try {
        const data = await fetchAndSaveCoinData(); // Gọi hàm fetch và save data
        res.status(200).json({ message: 'Data saved and fetched successfully!', data: data });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching and saving data', error: error.message });
    }
};

// Run fetchAndSaveCoinData immediately on program start
fetchAndSaveCoinData();
// Schedule fetchAndSaveCoinData every 5 minutes
setInterval(fetchAndSaveCoinData, 300000); // 5 phút = 300000 ms

module.exports = {
    fetchAndSaveCoinData,
    getAllCoin,
    getCoinDataAfterFetch
};
