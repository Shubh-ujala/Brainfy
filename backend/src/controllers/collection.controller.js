import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as collectionService from '../services/collection.service.js';

// ─────────────────────────────────────────────────────────
// POST /api/collections
// ─────────────────────────────────────────────────────────
export const createCollection = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;

  const collection = await collectionService.createCollection(req.user._id, {
    name,
    description,
    color,
  });

  return new ApiResponse(201, { collection }, 'Collection created successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// GET /api/collections
// ─────────────────────────────────────────────────────────
export const getCollections = asyncHandler(async (req, res) => {
  const collections = await collectionService.getCollections(req.user._id);

  return new ApiResponse(200, { collections }, 'Collections fetched successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// GET /api/collections/:id
// ─────────────────────────────────────────────────────────
export const getCollectionById = asyncHandler(async (req, res) => {
  const collection = await collectionService.getCollectionById(
    req.user._id,
    req.params.id
  );

  return new ApiResponse(200, { collection }, 'Collection fetched successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// PATCH /api/collections/:id
// ─────────────────────────────────────────────────────────
export const updateCollection = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;

  const collection = await collectionService.updateCollection(
    req.user._id,
    req.params.id,
    { name, description, color }
  );

  return new ApiResponse(200, { collection }, 'Collection updated successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// DELETE /api/collections/:id
// ─────────────────────────────────────────────────────────
export const deleteCollection = asyncHandler(async (req, res) => {
  const result = await collectionService.deleteCollection(req.user._id, req.params.id);

  return new ApiResponse(200, null, result.message).send(res);
});

// ─────────────────────────────────────────────────────────
// GET /api/collections/:id/links
// ─────────────────────────────────────────────────────────
export const getCollectionLinks = asyncHandler(async (req, res) => {
  const { collection, links, pagination } = await collectionService.getCollectionLinks(
    req.user._id,
    req.params.id,
    req.query
  );

  const response = new ApiResponse(
    200,
    { collection, links },
    'Collection links fetched successfully.'
  );
  response.pagination = pagination;
  return response.send(res);
});

