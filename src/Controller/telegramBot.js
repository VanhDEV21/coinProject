// telegramBot.js
const TelegramBot = require('node-telegram-bot-api');

// Thay bằng token bot của bạn
const TOKEN = '7874188970:AAFowIaDYQTvsTO2ZqQN0ONHDby_PayT_zs'; 
const bot = new TelegramBot(TOKEN, { polling: false });  // Không sử dụng polling ở đây vì bạn đã thiết lập webhook

module.exports = bot;
