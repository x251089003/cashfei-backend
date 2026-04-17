const mongoose = require('mongoose');

const productClickSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  product: { type: String, required: true },
  url: { type: String, required: true },
  ip: String,
  userAgent: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProductClick', productClickSchema);
