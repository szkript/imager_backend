const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
}, { timestamps: true }); // Ez automatikusan hozzáadja a `createdAt` és `updatedAt` mezőket

module.exports = mongoose.model('Topic', topicSchema);
