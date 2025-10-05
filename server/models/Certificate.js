const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  serialNumber: {
    type: String,
    unique: true,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  verificationUrl: {
    type: String,
    required: true
  },
  pdfUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Generate unique serial number before saving
certificateSchema.pre('save', function(next) {
  if (!this.serialNumber) {
    const data = `${this.student}-${this.course}-${Date.now()}`;
    this.serialNumber = crypto.createHash('sha256').update(data).digest('hex').substring(0, 16).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
