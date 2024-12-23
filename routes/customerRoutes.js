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
          from: 'entries',
          localField: '_id',
          foreignField: 'customer',
          as: 'entries',
        },
      },
      {
        $lookup: {
          from: 'topics',
          localField: '_id',
          foreignField: 'customer',
          as: 'topics',
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { 'entries.text': { $regex: searchTerm, $options: 'i' } },
            { 'entries.topicName': { $regex: searchTerm, $options: 'i' } },
            { 'topics.name': { $regex: searchTerm, $options: 'i' } },
            { generalInfo: { $regex: searchTerm, $options: 'i' } },
          ],
        },
      },
    ]);

    const updatedResults = results.map((result) => {
      let matchType = 'customer';
      if (result.generalInfo && result.generalInfo.match(new RegExp(searchTerm, 'i'))) {
        matchType = 'generalInfo';
      } else if (result.entries.some((entry) => entry.text.match(new RegExp(searchTerm, 'i')))) {
        matchType = 'entries';
      } else if (result.topics.some((topic) => topic.name.match(new RegExp(searchTerm, 'i')))) {
        matchType = 'topic';
      }
      return { ...result, matchType };
    });

    res.json(updatedResults);
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

// Update customer's general info with category
router.put('/:customerId/generalInfo', async (req, res) => {
  const { generalInfo, category } = req.body;
  try {
    const customer = await Customer.findById(req.params.customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Initialize categories array if it doesn't exist
    if (!customer.categories) {
      customer.categories = [];
    }

    // Check if category already exists
    const existingCategoryIndex = customer.categories.findIndex(
      cat => cat.category === category
    );

    if (existingCategoryIndex !== -1) {
      // Update existing category
      customer.categories[existingCategoryIndex].text = generalInfo;
    } else {
      // Add new category
      customer.categories.push({ category, text: generalInfo });
    }

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating general information' });
  }
});
// Delete specific category from general info
router.delete('/:customerId/generalInfo/:category', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.categories = customer.categories.filter(
      cat => cat.category !== req.params.category
    );

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
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
