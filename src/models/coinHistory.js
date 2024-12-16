const mongoose = require('mongoose')
const CoinHistorySchema = new mongoose.Schema({
    coinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coin', required: true },
    price: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CoinHistory', CoinHistorySchema);
