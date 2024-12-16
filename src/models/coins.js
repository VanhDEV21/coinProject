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
    change_5min: { type: Number, default: null },
    change_1h: { type: Number, default: null },
    change_24h: { type: Number, default: null },
    Volume_24h: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Volume 24h must be positive');
            }
        },
    },
    calledAt: { type: Date, default: () => new Date().toISOString() },
    history: {
        type: [
            {
                price: Number,
                timestamp: Date,
            },
        ],
        default: [], // Đảm bảo khởi tạo mảng rỗng nếu không có dữ liệu
    },
});

module.exports = mongoose.model('Coin', CoinSchema);

