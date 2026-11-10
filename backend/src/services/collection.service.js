import Collection from '../models/Collection.js';
import Link from '../models/Link.js';
import ApiError from '../utils/ApiError.js';

// ─────────────────────────────────────────────────────────
// Create Collection
// ─────────────────────────────────────────────────────────
export const createCollection = async (userId, { name, description, color }) => {
  const collection = await Collection.create({
    user: userId,
    name: name.trim(),
    description: description?.trim() || '',
    color: color?.trim() || '#3b82f6',
  });

  return collection;
};

// ─────────────────────────────────────────────────────────
// Get All Collections (with link count)
// ─────────────────────────────────────────────────────────
export const getCollections = async (userId) => {
  const collections = await Collection.find({ user: userId }).sort({ createdAt: -1 });

  // Attach link count to each collection in parallel
  const collectionsWithCount = await Promise.all(
    collections.map(async (col) => {
      const linkCount = await Link.countDocuments({
        collection: col._id,
        user: userId,
        isDeleted: false,
      });
      return { ...col.toJSON(), linkCount };
    })
  );

  return collectionsWithCount;
};

// ─────────────────────────────────────────────────────────
// Get Collection by ID
// ─────────────────────────────────────────────────────────
export const getCollectionById = async (userId, collectionId) => {
  const collection = await Collection.findOne({ _id: collectionId, user: userId });

  if (!collection) {
    throw ApiError.notFound('Collection not found.');
  }

  const linkCount = await Link.countDocuments({
    collection: collectionId,
    user: userId,
    isDeleted: false,
  });

  return { ...collection.toJSON(), linkCount };
};

// ─────────────────────────────────────────────────────────
// Update Collection
// ─────────────────────────────────────────────────────────
export const updateCollection = async (userId, collectionId, updateData) => {
  const collection = await Collection.findOneAndUpdate(
    { _id: collectionId, user: userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!collection) {
    throw ApiError.notFound(
      'Collection not found or you do not have permission to update it.'
    );
  }

  return collection;
};

// ─────────────────────────────────────────────────────────
// Delete Collection
// Links in this collection are NOT deleted — their collection field is set to null.
// ─────────────────────────────────────────────────────────
export const deleteCollection = async (userId, collectionId) => {
  const collection = await Collection.findOne({ _id: collectionId, user: userId });

  if (!collection) {
    throw ApiError.notFound(
      'Collection not found or you do not have permission to delete it.'
    );
  }

  // Disassociate links from this collection (do NOT delete the links)
  await Link.updateMany(
    { collection: collectionId, user: userId },
    { $set: { collection: null } }
  );

  await collection.deleteOne();

  return { message: 'Collection deleted. Associated links have been unassigned.' };
};

// ─────────────────────────────────────────────────────────
// Get Links in Collection
// ─────────────────────────────────────────────────────────
export const getCollectionLinks = async (userId, collectionId, queryParams = {}) => {
  // Verify ownership first
  const collection = await Collection.findOne({ _id: collectionId, user: userId });
  if (!collection) {
    throw ApiError.notFound('Collection not found.');
  }

  const { sort = 'newest', page = 1, limit = 20 } = queryParams;

  const sortMap = {
    oldest: { createdAt: 1 },
    title_asc: { title: 1 },
    title_desc: { title: -1 },
    newest: { createdAt: -1 },
  };

  const sortObj = sortMap[sort] || { createdAt: -1 };
  const skip = (Number(page) - 1) * Number(limit);

  const filter = {
    collection: collectionId,
    user: userId,
    isDeleted: false,
  };

  const [links, total] = await Promise.all([
    Link.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
    Link.countDocuments(filter),
  ]);

  return {
    collection,
    links,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
      hasPrevPage: Number(page) > 1,
    },
  };
};

