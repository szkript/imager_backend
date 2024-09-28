const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/images', require('./routes/imageRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/entries', require('./routes/entryRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
