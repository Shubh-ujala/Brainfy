import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collection must belong to a user'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      minlength: [1, 'Collection name cannot be empty'],
      maxlength: [60, 'Collection name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '#3b82f6',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent duplicate collection names for the same user
collectionSchema.index({ user: 1, name: 1 }, { unique: true });

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;

