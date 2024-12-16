const express = require('express');
const mongoose = require('mongoose')
const coinRoutes = require('./routes/coinRoute')
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://vanhspmax:kwtipzJDhhHjWbFb@productioncluster.23sze.mongodb.net/myCoindatabase?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI, { useNewUrlParser: true,
     useUnifiedTopology: true , 
     connectTimeoutMS: 60000, 
     serverSelectionTimeoutMS: 60000,
     autoIndex: false,})
.then(()=>console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error: '))

const axios = require('axios');

axios.get('https://api.ipify.org?format=json')
  .then(response => {
    console.log("Render's public IP:", response.data.ip);
  })
  .catch(error => {
    console.error("Error getting IP:", error);
  });


// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
 // Đảm bảo server có thể phục vụ các file tĩnh

// Routes
app.use('/api/coins', coinRoutes);

app.listen(port,()=>{
    console.log('Server is running on port '+ port);
})