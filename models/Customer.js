const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  generalInfo: { type: String }, // Új mező az általános információknak
});

module.exports = mongoose.model('Customer', customerSchema);