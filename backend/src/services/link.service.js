import Link from '../models/Link.js';
import Collection from '../models/Collection.js';
import ApiError from '../utils/ApiError.js';

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/**
 * Builds a sort object for MongoDB from a query string param.
 */
const buildSortObject = (sort) => {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'title_asc':
      return { title: 1 };
    case 'title_desc':
      return { title: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

/**
 * Verifies a collection belongs to the requesting user.
 * Throws if not found or not owned.
 */
const assertCollectionOwnership = async (collectionId, userId) => {
  const col = await Collection.findOne({ _id: collectionId, user: userId });
  if (!col) {
    throw ApiError.notFound(
      'Collection not found or you do not have permission to use it.'
    );
  }
};

// ─────────────────────────────────────────────────────────
// Create Link
// ─────────────────────────────────────────────────────────
export const createLink = async (userId, data) => {
  const { url, description, platform, tags } = data;
  const colId = data.collection || data.collectionId;

  // Derive a title from URL if omitted or blank
  let finalTitle = (data.title || '').trim();
  if (!finalTitle && url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, '');
      const path = parsed.pathname !== '/' ? parsed.pathname : '';
      finalTitle = `${host}${path}`.slice(0, 200);
    } catch {
      finalTitle = url.slice(0, 200);
    }
  }

  // If a collection is specified, verify ownership
  if (colId && colId !== 'none') {
    await assertCollectionOwnership(colId, userId);
  }

  const link = await Link.create({
    user: userId,
    title: finalTitle || 'Saved Resource',
    url,
    description: description || '',
    platform,
    collection: colId && colId !== 'none' ? colId : null,
    tags: Array.isArray(tags) ? tags : [],
  });

  return link;
};

// ─────────────────────────────────────────────────────────
// Get Links (with search, filter, sort, pagination)
// ─────────────────────────────────────────────────────────
export const getLinks = async (userId, queryParams = {}) => {
  const {
    search,
    platform,
    collection,
    tags,
    sort = 'newest',
    page = 1,
    limit = 20,
  } = queryParams;

  const filter = {
    user: userId,
    isDeleted: false,
  };

  // Text search
  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  // Platform filter
  if (platform) {
    filter.platform = platform;
  }

  // Collection filter
  if (collection) {
    filter.collection = collection;
  }

  // Tags filter (all provided tags must be present)
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    filter.tags = { $all: tagArray };
  }

  const sortObj = buildSortObject(sort);
  const skip = (Number(page) - 1) * Number(limit);

  const [links, total] = await Promise.all([
    Link.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .populate('collection', 'name color'),
    Link.countDocuments(filter),
  ]);

  return {
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

// ─────────────────────────────────────────────────────────
// Get Link by ID (ownership enforced)
// ─────────────────────────────────────────────────────────
export const getLinkById = async (userId, linkId) => {
  const link = await Link.findOne({
    _id: linkId,
    user: userId,
    isDeleted: false,
  }).populate('collection', 'name color');

  if (!link) {
    throw ApiError.notFound('Link not found.');
  }

  return link;
};

// ─────────────────────────────────────────────────────────
// Update Link
// ─────────────────────────────────────────────────────────
export const updateLink = async (userId, linkId, updateData) => {
  const colId = updateData.collection !== undefined ? updateData.collection : updateData.collectionId;
  const dataToUpdate = { ...updateData };

  if (colId !== undefined) {
    if (colId && colId !== 'none') {
      await assertCollectionOwnership(colId, userId);
      dataToUpdate.collection = colId;
    } else {
      dataToUpdate.collection = null;
    }
    delete dataToUpdate.collectionId;
  }

  const link = await Link.findOneAndUpdate(
    { _id: linkId, user: userId, isDeleted: false },
    { $set: dataToUpdate },
    { new: true, runValidators: true }
  ).populate('collection', 'name color');

  if (!link) {
    throw ApiError.notFound('Link not found or you do not have permission to update it.');
  }

  return link;
};

// ─────────────────────────────────────────────────────────
// Soft Delete
// ─────────────────────────────────────────────────────────
export const softDeleteLink = async (userId, linkId) => {
  const link = await Link.findOneAndUpdate(
    { _id: linkId, user: userId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );

  if (!link) {
    throw ApiError.notFound('Link not found or already deleted.');
  }

  return link;
};

// ─────────────────────────────────────────────────────────
// Toggle Favorite
// ─────────────────────────────────────────────────────────
export const toggleFavorite = async (userId, linkId) => {
  const link = await Link.findOne({ _id: linkId, user: userId, isDeleted: false });

  if (!link) {
    throw ApiError.notFound('Link not found.');
  }

  link.isFavorite = !link.isFavorite;
  await link.save();

  return link;
};

// ─────────────────────────────────────────────────────────
// Get Favorites
// ─────────────────────────────────────────────────────────
export const getFavorites = async (userId) => {
  const links = await Link.find({
    user: userId,
    isDeleted: false,
    isFavorite: true,
  })
    .sort({ createdAt: -1 })
    .populate('collection', 'name color');

  return links;
};

// ─────────────────────────────────────────────────────────
// Get Recent Links
// ─────────────────────────────────────────────────────────
export const getRecentLinks = async (userId, limit = 10) => {
  const links = await Link.find({ user: userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('collection', 'name color');

  return links;
};

// ─────────────────────────────────────────────────────────
// Get Trash
// ─────────────────────────────────────────────────────────
export const getTrashedLinks = async (userId) => {
  const links = await Link.find({ user: userId, isDeleted: true })
    .sort({ deletedAt: -1 })
    .populate('collection', 'name color');

  return links;
};

// ─────────────────────────────────────────────────────────
// Restore from Trash
// ─────────────────────────────────────────────────────────
export const restoreLink = async (userId, linkId) => {
  const link = await Link.findOneAndUpdate(
    { _id: linkId, user: userId, isDeleted: true },
    { $set: { isDeleted: false, deletedAt: null } },
    { new: true }
  );

  if (!link) {
    throw ApiError.notFound('Link not found in trash.');
  }

  return link;
};

// ─────────────────────────────────────────────────────────
// Permanent Delete
// ─────────────────────────────────────────────────────────
export const permanentDeleteLink = async (userId, linkId) => {
  const link = await Link.findOneAndDelete({ _id: linkId, user: userId });

  if (!link) {
    throw ApiError.notFound('Link not found or already permanently deleted.');
  }

  return { message: 'Link permanently deleted.' };
};

