const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Entry = require('../models/Entry'); // Importáljuk az Entry modellt

// Keresés ügyfél nevében és a bejegyzésekben
router.get('/search', async (req, res) => {
  const searchTerm = req.query.q;
  try {
    const results = await Customer.aggregate([
      {
        $lookup: {
          from: 'entries', // Kapcsolat a bejegyzésekkel
          localField: '_id',
          foreignField: 'customer',
          as: 'entries',
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } }, // Ügyfél névben keresés
            { 'entries.text': { $regex: searchTerm, $options: 'i' } }, // Bejegyzés szövegében keresés
          ],
        },
      },
    ]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error searching customers and entries' });
  }
});
// Új ügyfél felvétele
router.post('/', async (req, res) => {
  const { name } = req.body;

  try {
    const newCustomer = new Customer({ name });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ügyfelek listázása
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Egyedi ügyfél lekérdezése
router.get('/:customerId', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer' });
  }
});

// Ügyfél általános információinak frissítése
router.put('/:customerId/generalInfo', async (req, res) => {
  const { generalInfo } = req.body;
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      { generalInfo },
      { new: true }
    );
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating general information' });
  }
});

// Ügyfél általános információinak törlése
router.delete('/:customerId/generalInfo', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      { generalInfo: '' }, // Az általános információk törlése (üresre állítjuk)
      { new: true }
    );
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting general information' });
  }
});

// Ügyfél és kapcsolódó bejegyzések törlése ID alapján
router.delete('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    // Töröljük az ügyfelet
    const customerResult = await Customer.deleteOne({ _id: customerId });

    if (customerResult.deletedCount === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Töröljük a kapcsolódó bejegyzéseket
    await Entry.deleteMany({ customer: customerId });

    res.status(200).json({ message: 'Customer and associated entries deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer and entries:', error);
    res.status(500).json({ message: 'Error deleting customer and entries' });
  }
});

module.exports = router;
