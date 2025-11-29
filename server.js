require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const cliqRoutes = require('./src/cliqRoutes');
const adminRoutes = require('./src/adminRoutes');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'src/public')));

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/accuassist';
mongoose.connect(MONGO, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err=> console.error('MongoDB connection error', err));

app.use('/api/cliq', cliqRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req,res)=> res.send({ ok:true, now: new Date() }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`AccuAssist listening on ${PORT}`));