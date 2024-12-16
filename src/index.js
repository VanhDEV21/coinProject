const express = require('express');
const mongoose = require('mongoose')
const coinRoutes = require('./routes/coinRoute')
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://vanhspmax:kwtipzJDhhHjWbFb@productioncluster.23sze.mongodb.net/myCoindatabase?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true , connectTimeoutMS: 30000, socketTimeoutMS: 45000,serverSelectionTimeoutMS: 5000 })
.then(()=>console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error: '))


// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
 // Đảm bảo server có thể phục vụ các file tĩnh

// Routes
app.use('/api/coins', coinRoutes);

app.listen(port,()=>{
    console.log('Server is running on port '+ port);
})