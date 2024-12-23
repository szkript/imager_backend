const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const Topic = require('../models/Topic');
const mammoth = require('mammoth');  // Mammoth.js importálása



router.put('/:id', async (req, res) => {
  try {
    const { text, imageBase64, fileBase64, fileName, topicName, customer } = req.body;
    
    const updateData = {
      text,
      imageBase64,
      fileBase64,
      fileName
    };

    const updatedEntry = await Entry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('topic');
    
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Új bejegyzés hozzáadása (fájlokkal)
router.post('/', async (req, res) => {
  const { customer, text, imageBase64, fileBase64, fileName, topicName } = req.body;

  try {
    let topic = await Topic.findOne({ name: topicName, customer });

    if (!topic) {
      topic = new Topic({ name: topicName, customer });
      await topic.save();
    }

    const newEntry = new Entry({
      customer,
      text,
      imageBase64,
      fileBase64,
      fileName,  // Fájlnév elmentése
      topic: topic._id,
    });

    await newEntry.save();

    const savedEntry = await Entry.findById(newEntry._id).populate('topic');
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(500).json({ message: 'Error adding entry' });
  }
});

// Új topic hozzáadása
router.post('/topics', async (req, res) => {
  const { name, customerId } = req.body;

  try {
    const newTopic = new Topic({
      name,
      customer: customerId,
    });

    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (error) {
    res.status(500).json({ message: 'Error adding topic' });
  }
});

// Bejegyzések lekérdezése adott ügyfélhez (topiktól függetlenül)
router.get('/customer/:customerId', async (req, res) => {
  try {
    const entries = await Entry.find({ customer: req.params.customerId })
      .populate('topic') // A topik részletek betöltése
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entries' });
  }
});

// Bejegyzések lekérdezése adott ügyfélhez és topikhoz
router.get('/customer/:customerId/topic/:topicId', async (req, res) => {
  try {
    const entries = await Entry.find({ customer: req.params.customerId, topic: req.params.topicId })
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entries' });
  }
});

// Word fájl HTML formátumba konvertálása és visszaküldése
router.post('/convert-word', async (req, res) => {
  const { fileBase64 } = req.body;

  try {
    const arrayBuffer = Buffer.from(fileBase64.split(',')[1], 'base64'); // Base64 dekódolása
    const result = await mammoth.convertToHtml({ buffer: arrayBuffer }); // Mammoth.js konverzió

    res.status(200).json({ htmlContent: result.value });
  } catch (error) {
    res.status(500).json({ message: 'Error converting Word file to HTML' });
  }
});

// Összes topik listázása
router.get('/topics', async (req, res) => {
  try {
    const topics = await Topic.find({});
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching topics' });
  }
});

// Összes topik lekérdezése adott ügyfélhez
router.get('/topics/customer/:customerId', async (req, res) => {
  try {
    const topics = await Topic.find({ customer: req.params.customerId }).sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching topics' });
  }
});

module.exports = router;

router.delete('/:id', async (req, res) => {
  try {
    await Entry.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
