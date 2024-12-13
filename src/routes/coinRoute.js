// Function define API
const express = require('express')
const router = express.Router();
const {fetchAndSaveCoinData,getAllCoin,getCoinDataAfterFetch}= require('../Controller/coinController');

//Route get data from CoinmarketCap and Save to DB

router.get('/fetch-and-save',fetchAndSaveCoinData);

// Route get list coin from database

router.get('/list',getCoinDataAfterFetch)

module.exports = router;
