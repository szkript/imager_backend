const express = require('express');
const router = express.Router();
const Image = require('../models/imageModel');

router.post('/upload', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const newImage = new Image({
      filename: `${Date.now()}.png`,
      contentType: 'image/png',
      imageBase64,
    });

    await newImage.save();
    res.status(201).json({ message: 'Image saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const images = await Image.find({});
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
