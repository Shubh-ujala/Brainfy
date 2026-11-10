import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Link must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    platform: {
      type: String,
      enum: ['YouTube', 'Twitter/X', 'Twitter', 'GitHub', 'LinkedIn', 'Medium', 'Website', 'Other'],
      default: 'Other',
    },
    collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      default: null,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
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

// Auto-fill title from URL if omitted or empty
linkSchema.pre('validate', function (next) {
  if (!this.title || !this.title.trim()) {
    if (this.url) {
      try {
        const u = new URL(this.url);
        const host = u.hostname.replace(/^www\./, '');
        const path = u.pathname !== '/' ? u.pathname : '';
        this.title = `${host}${path}`.slice(0, 200);
      } catch {
        this.title = this.url.slice(0, 200);
      }
    } else {
      this.title = 'Saved Resource';
    }
  }
  next();
});

// Auto-detect platform from URL if platform is 'Other' or not specified
linkSchema.pre('save', function (next) {
  if (this.isModified('url') && (!this.platform || this.platform === 'Other')) {
    const lower = (this.url || '').toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      this.platform = 'YouTube';
    } else if (lower.includes('twitter.com') || lower.includes('x.com')) {
      this.platform = 'Twitter/X';
    } else if (lower.includes('github.com')) {
      this.platform = 'GitHub';
    } else if (lower.includes('linkedin.com')) {
      this.platform = 'LinkedIn';
    } else if (lower.includes('medium.com')) {
      this.platform = 'Medium';
    } else {
      this.platform = 'Website';
    }
  }
  next();
});

// Compound indexes for optimal query execution
linkSchema.index({ user: 1, isDeleted: 1, createdAt: -1 });
linkSchema.index({ user: 1, isDeleted: 1, isFavorite: 1 });
linkSchema.index({ user: 1, isDeleted: 1, collection: 1 });
linkSchema.index({ user: 1, tags: 1 });

// Text search index for title, URL, description
linkSchema.index(
  { title: 'text', url: 'text', description: 'text' },
  { weights: { title: 10, url: 5, description: 1 } }
);

const Link = mongoose.model('Link', linkSchema);

export default Link;
