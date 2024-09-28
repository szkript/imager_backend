// models/Entry.js
const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  text: { type: String, required: true },
  imageBase64: { type: String },
  fileBase64: { type: String },
  fileName: { type: String }, // Eredeti fájlnév
  createdAt: { type: Date, default: Date.now },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
});


module.exports = mongoose.model('Entry', entrySchema);
