import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  highlights: [{
    text: String,
    color: String,
    position: {
      start: Number,
      end: Number
    }
  }],
  drawings: [{
    canvasData: String,
    position: {
      x: Number,
      y: Number
    }
  }],
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  episode: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Note', noteSchema);