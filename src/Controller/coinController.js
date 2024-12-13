const axios = require('axios');
const Coin = require('../models/coins');
const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');
const API_KEY = '73feb218-7d95-459b-a40b-5f726d5c9c01';
const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

const TELEGRAM_API_TOKEN = '7874188970:AAFoFq2W-kyNBGglvATakEuXXOmgEk5Nw38';  // Thay bằng token bot của bạn
const TELEGRAM_CHAT_ID = '6486451651';  // Thay bằng chat ID của nhóm Telegram


const bot = new TelegramBot(TELEGRAM_API_TOKEN, { polling: true });
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

        const data = response.data.data;

        for (const coin of data) {
            // Giữ giá với tối đa 8 chữ số sau dấu phẩy
            const currentPrice = parseFloat(coin.quote.USD.price.toFixed(8)); 
            const volume24h = coin.quote.USD.volume_24h
                ? parseFloat(coin.quote.USD.volume_24h.toFixed(2))
                : 0;

            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

            const existingCoin = await Coin.findOne({ nameCoin: coin.name });

            let change_5min = null;
            let change_1h = null;
            let change_24h = null;

            // Lấy phần thập phân của giá coin
            const decimalPart = currentPrice.toString().split('.')[1] || '0';  // Lấy phần thập phân hoặc mặc định '0'

            console.log(`Decimal part of ${coin.name}:`, decimalPart);  // In ra phần thập phân của coin

            if (existingCoin) {
                // Lấy giá lịch sử tại các mốc thời gian
                const price5minAgo = existingCoin.history.find(
                    (entry) => entry.timestamp >= fiveMinutesAgo
                )?.price;
            
                const price1hAgo = existingCoin.history.find(
                    (entry) => entry.timestamp >= oneHourAgo
                )?.price;
            
                const price24hAgo = existingCoin.history.find(
                    (entry) => entry.timestamp >= oneDayAgo
                )?.price;
            
                // Tính toán phần trăm thay đổi trong 5 phút
                if (price5minAgo) {
                    change_5min = (((currentPrice - price5minAgo) / price5minAgo) * 100).toFixed(2);
                }
                
                // Kiểm tra nếu có giá trị lịch sử 1h
                if (price1hAgo) {
                    change_1h = (((currentPrice - price1hAgo) / price1hAgo) * 100).toFixed(2);
                } else {
                    // Nếu không đủ 1 giờ dữ liệu, set change_1h = 0
                    change_1h = 0;
                }
                
                // Kiểm tra nếu có giá trị lịch sử 24h
                if (price24hAgo) {
                    change_24h = (((currentPrice - price24hAgo) / price24hAgo) * 100).toFixed(2);
                } else {
                    // Nếu không đủ 24 giờ dữ liệu, set change_24h = 0
                    change_24h = 0;
                }
            
                // Lưu giá trị lịch sử hiện tại
                existingCoin.history.push({ price: currentPrice, timestamp: now });
            
                // Chỉ lưu lịch sử tối đa 1 ngày
                existingCoin.history = existingCoin.history.filter(
                    (entry) => entry.timestamp >= oneDayAgo
                );
            
                // Cập nhật các trường
                existingCoin.currentPrice = currentPrice;
                existingCoin.change_5min = change_5min || existingCoin.change_5min;
                existingCoin.change_1h = change_1h || existingCoin.change_1h;
                existingCoin.change_24h = change_24h || existingCoin.change_24h;
                existingCoin.Volume_24h = volume24h;
                existingCoin.calledAt = now;
                existingCoin.decimalPart = decimalPart;  // Lưu phần thập phân vào database
            
                await existingCoin.save();
            } else {
                // Nếu không tồn tại coin trong database, tạo mới
                const newCoin = new Coin({
                    nameCoin: coin.name,
                    currentPrice,
                    change_5min: null, // Không có lịch sử để tính
                    change_1h: null, // Không có lịch sử để tính
                    change_24h: null, // Không có lịch sử để tính
                    Volume_24h: volume24h,
                    calledAt: now,
                    history: [{ price: currentPrice, timestamp: now }],
                    decimalPart: decimalPart, // Lưu phần thập phân vào database
                });
                await newCoin.save();
            }
        }

        console.log('Data saved successfully!');
    } catch (error) {
        console.error('Detailed error:', error);

        console.error('Error fetching data for top coins:', error.message);
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

// Function to send top 10 coins to Telegram
const sendMessageToTelegram = async () => {
    try {
        const topCoins = await fetchTop10Coins();

        if (topCoins && topCoins.length > 0) {
            let message = "📊 **Top 10 Coins with Largest Price Change in the Last Hour** 📊\n\n";

            topCoins.forEach((coin, index) => {
                message += `${index + 1}. 📉 ${coin.nameCoin} - Price: $${coin.currentPrice} USD - Change: ${coin.change_1h}%\n`;
            });

            // Gửi tin nhắn vào nhóm Telegram
            bot.sendMessage(TELEGRAM_CHAT_ID, message);
        } else {
            bot.sendMessage(TELEGRAM_CHAT_ID, "No significant price changes in the last hour.");
        }
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
    }
};

// Function to get all coins from database
const getAllCoin = async () => {
    try {
        const coinData = await Coin.find(); // Lấy danh sách coin từ DB
        console.log('Coin data:', coinData); // Kiểm tra giá trị coinData

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


cron.schedule('0 * * * *', sendMessageToTelegram);
// Run fetchAndSaveCoinData immediately on program start
fetchAndSaveCoinData();
// Schedule fetchAndSaveCoinData every 5 minutes
setInterval(fetchAndSaveCoinData, 300000); // 5 phút = 300000 ms

module.exports = {
    fetchAndSaveCoinData,
    getAllCoin,
    getCoinDataAfterFetch
};
