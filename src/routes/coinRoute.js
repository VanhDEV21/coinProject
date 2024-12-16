const express = require('express');
const router = express.Router();
const { fetchAndSaveCoinData, getAllCoin } = require('../Controller/coinController');

// Route để lấy và lưu dữ liệu từ CoinMarketCap vào cơ sở dữ liệu
router.get('/fetch-and-save', async (req, res) => {
    try {
        await fetchAndSaveCoinData(); // Gọi hàm lấy và lưu dữ liệu
        res.status(200).json({ message: 'Coin data fetched and saved successfully!' });
    } catch (error) {
        console.error('Error fetching and saving coin data:', error);
        res.status(500).json({
            message: 'Error fetching and saving coin data',
            error: error.message || 'Internal server error',
        });
    }
});

// Route để lấy danh sách coin từ cơ sở dữ liệu
router.get('/list', async (req, res) => {
    try {
        const coins = await getAllCoin(); // Gọi hàm lấy danh sách coin
        if (!coins || coins.length === 0) {
            return res.status(404).json({ message: 'No coin data found in the database.' });
        }
        res.status(200).json(coins); // Trả về danh sách coin
    } catch (error) {
        console.error('Error fetching coins from database:', error);
        res.status(500).json({
            message: 'Error fetching coins from database',
            error: error.message || 'Internal server error',
        });
    }
});

module.exports = router;