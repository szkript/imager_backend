const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  categories: [{
    category: String,
    text: String
  }],
  generalInfo: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);