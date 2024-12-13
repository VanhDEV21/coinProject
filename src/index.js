const express = require('express');
const mongoose = require('mongoose')
const coinRoutes = require('./routes/coinRoute')
const app = express();
const port = process.env.PORT || 3000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/myCoindatabase';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error: '))


// Middleware
app.use(express.json());
// Routes
app.use('/api/coins', coinRoutes);

app.listen(port,()=>{
    console.log('Server is running on port '+ port);
})