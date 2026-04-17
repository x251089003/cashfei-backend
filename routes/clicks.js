const express = require('express');
const ProductClick = require('../models/ProductClick');
const router = express.Router();

// POST /api/clicks — Record a product click
router.post('/', async (req, res) => {
  try {
    const { applicationId, product, url } = req.body;
    if (!product || !url) {
      return res.status(400).json({ error: 'product and url are required' });
    }
    const click = await ProductClick.create({
      applicationId: applicationId || null,
      product,
      url,
      ip: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json({ id: click._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/clicks — List clicks with optional filters
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.applicationId) filter.applicationId = req.query.applicationId;
    const clicks = await ProductClick.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('applicationId', 'firstName lastName email phone referenceNumber');
    res.json(clicks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clicks/stats — Click stats per product
router.get('/stats', async (req, res) => {
  try {
    const stats = await ProductClick.aggregate([
      { $group: { _id: '$product', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const total = stats.reduce((s, i) => s + i.count, 0);
    res.json({ total, byProduct: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
