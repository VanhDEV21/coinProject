const axios = require('axios');
const Coin = require('../models/coins');
const cron = require('node-cron');
const CoinHistory = require('../models/coinHistory');
const TelegramBot = require('node-telegram-bot-api');
const bot = require('./telegramBot');
const API_KEY = '73feb218-7d95-459b-a40b-5f726d5c9c01';
const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

const TELEGRAM_CHAT_ID = '-4737590717';  // Thay bằng chat ID của nhóm Telegram

// Function fetch data from CoinMarketCap and save to database
const fetchAndSaveCoinData = async () => {
    try {
        const response = await axios.get(url, {
            headers: {
                'X-CMC_PRO_API_KEY': API_KEY,
            },
            params: {
                start: 1,
                limit: 20,
                convert: 'USD',
            },
        });

        const data = response.data.data;
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        for (const coin of data) {
            try {
                const currentPrice = parseFloat(coin.quote.USD.price.toFixed(8));
                const volume24h = coin.quote.USD.volume_24h
                    ? parseFloat(coin.quote.USD.volume_24h.toFixed(2))
                    : 0;

                const existingCoin = await Coin.findOne({ nameCoin: coin.name },'nameCoin currentPrice change_5min change_1h change_24h history');

                if (existingCoin) {
                   // Kiểm tra và khởi tạo nếu không có history
                    if (!existingCoin.history) {
                        existingCoin.history = [];
                    }

                    // Lấy giá lịch sử
                    const price5minAgo = existingCoin.history.find((entry) => entry.timestamp >= fiveMinutesAgo)?.price;
                    const price1hAgo = existingCoin.history.find((entry) => entry.timestamp >= oneHourAgo)?.price;
                    const price24hAgo = existingCoin.history.find((entry) => entry.timestamp >= oneDayAgo)?.price;

                    // Tính thay đổi giá
                    const change_5min = price5minAgo ? (((currentPrice - price5minAgo) / price5minAgo) * 100).toFixed(2) : "0.00";
                    const change_1h = price1hAgo ? (((currentPrice - price1hAgo) / price1hAgo) * 100).toFixed(2) : "0.00";
                    const change_24h = price24hAgo ? (((currentPrice - price24hAgo) / price24hAgo) * 100).toFixed(2) : "0.00";

                    // Cập nhật lịch sử giá
                    existingCoin.history.push({ price: currentPrice, timestamp: now });
                    existingCoin.history = existingCoin.history.filter(
                        (entry) => entry.timestamp >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    );

                    // Cập nhật thông tin coin
                    existingCoin.currentPrice = currentPrice;
                    existingCoin.change_5min = change_5min;
                    existingCoin.change_1h = change_1h;
                    existingCoin.change_24h = change_24h;
                    existingCoin.Volume_24h = volume24h;
                    existingCoin.calledAt = now;

                    await existingCoin.save();
                } else {
                    // Tạo coin mới
                    const newCoin = new Coin({
                        nameCoin: coin.name,
                        currentPrice,
                        change_5min: null,
                        change_1h: null,
                        change_24h: null,
                        Volume_24h: volume24h,
                        calledAt: now,
                        history: [{ price: currentPrice, timestamp: now }],
                    });

                    await newCoin.save();
                }
            } catch (coinError) {
                console.error(`Error processing coin ${coin.name}:`, coinError.message);
            }
        }

        console.log('Data saved successfully!');
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
};
const fetchTop10Coins = async () => {
    try {
        const coins = await Coin.find();

        if (!coins || coins.length === 0) {
            console.log('No coins found');
            return;
        }

        // Sắp xếp các đồng coin theo sự thay đổi giá lớn nhất trong 1 giờ
        const sortedCoins = coins.sort((a, b) => Math.abs(b.change_1h) - Math.abs(a.change_1h));

        // Lấy 10 đồng coin có sự thay đổi lớn nhất
        const top10Coins = sortedCoins.slice(0, 10);
        return top10Coins;
    } catch (error) {
        console.error('Error fetching coins from database:', error);
    }
};


// Function to get all coins from database
const getAllCoin = async () => {
    try {
        const coinData = await Coin.find(); // Lấy danh sách coin từ DB
        // console.log('Coin data:', coinData); // Kiểm tra giá trị coinData

        if (!coinData || coinData.length === 0) {
            throw new Error('No coins found in the database');
        }

        return coinData;
    } catch (error) {
        console.error('Error fetching coins from database:', error);
        throw new Error('Error fetching coins from database');
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

// Function to send message to Telegram group
const sendMessageToTelegram = async () => {
    try {
        const topCoins = await fetchTop10Coins();

        if (topCoins && topCoins.length > 0) {
            let message = "📊 *Top 10 Coins with Largest Price Change in the Last Hour* 📊\n\n";

            topCoins.forEach((coin, index) => {
                message += `${index + 1}. 📉 *${coin.nameCoin}* - Price: $${coin.currentPrice} USD - Change: ${coin.change_1h}%\n`;
            });

            // Gửi tin nhắn vào Telegram với định dạng Markdown
            await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: "Markdown" });
        } else {
            await bot.sendMessage(TELEGRAM_CHAT_ID, "No significant price changes in the last hour.");
        }
    } catch (error) {
        console.error('Error sending message to Telegram:', error.message);
    }
};


cron.schedule('0 * * * *', sendMessageToTelegram);

// Cron job để fetch dữ liệu mỗi 5 phút
cron.schedule('*/5 * * * *', fetchAndSaveCoinData);

// Chạy hàm ngay khi khởi động chương trình
fetchAndSaveCoinData();

module.exports = {
    fetchAndSaveCoinData,
    getAllCoin,
    getCoinDataAfterFetch
};
