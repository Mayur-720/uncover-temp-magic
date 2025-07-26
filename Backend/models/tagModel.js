
const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 50
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  postCount: {
    type: Number,
    default: 0
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['confession', 'crush', 'controversy', 'government', 'danger', 'lifestyle', 'work', 'relationship', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

// Index for trending queries
tagSchema.index({ trendingScore: -1 });
tagSchema.index({ postCount: -1 });
tagSchema.index({ name: 1 });

module.exports = mongoose.model('Tag', tagSchema);
