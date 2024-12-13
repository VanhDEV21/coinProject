const mongoose = require('mongoose');
const validator = require('validator');

const CoinSchema = new mongoose.Schema({
    nameCoin: {
        type: String,
        required: true,
    },
    currentPrice: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Current price must be positive');
            }
        },
    },
    change_5min: {
        type: Number,
        default: null, // Giá trị mặc định
    },
    change_1h: {
        type: Number,
        default: null, // Giá trị mặc định
    },
    change_24h: {
        type: Number,
        default: null, // Giá trị mặc định
    },
    Volume_24h: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Volume 24h must be positive');
            }
        },
    },
    calledAt: {
        type: Date,
        default: Date.now,
    },
    history: [
        {
            price: Number,
            timestamp: Date,
        },
    ], // Lưu trữ lịch sử giá theo timestamp
});

module.exports = mongoose.model('Coin', CoinSchema);

