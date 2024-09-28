const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  filename: String,
  contentType: String,
  imageBase64: String
});

module.exports = mongoose.model('Image', ImageSchema);
