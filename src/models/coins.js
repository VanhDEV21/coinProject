// constructure of coin
const mongoose = require('mongoose')
const validator = require('validator')

const CoinSchema = new mongoose.Schema({
    nameCoin:{
        type: String,
        require: true
    },
    currentPrice: {
        type: Number,
        require: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Current price is alway positive')
            }
        }
    },
    Volume_24h: {
        type: Number,
        require: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Volume 24h is alway positive')
            }
        }
    },
    calledAt: {             // Thời điểm lưu dữ liệu
        type: Date,
        default: Date.now
      }
})

module.exports = mongoose.model('Coin',CoinSchema)