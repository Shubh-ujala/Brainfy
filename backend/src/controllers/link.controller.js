import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as linkService from '../services/link.service.js';

// ─────────────────────────────────────────────────────────
// POST /api/links
// ─────────────────────────────────────────────────────────
export const createLink = asyncHandler(async (req, res) => {
  const link = await linkService.createLink(req.user._id, req.body);

  return new ApiResponse(201, { link }, 'Link created successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// GET /api/links
// ─────────────────────────────────────────────────────────
export const getLinks = asyncHandler(async (req, res) => {
  const { links, pagination } = await linkService.getLinks(req.user._id, req.query);

  const response = new ApiResponse(200, { links }, 'Links fetched successfully.');
  response.pagination = pagination;
  return response.send(res);
});

// ─────────────────────────────────────────────────────────
// GET /api/links/favorites  (must be before /:id)
// ─────────────────────────────────────────────────────────
export const getFavorites = asyncHandler(async (req, res) => {
  const links = await linkService.getFavorites(req.user._id);

  return new ApiResponse(200, { links }, 'Favorite links fetched successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// GET /api/links/recent
// ─────────────────────────────────────────────────────────
export const getRecentLinks = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const links = await linkService.getRecentLinks(req.user._id, limit);

  return new ApiResponse(200, { links }, 'Recent links fetched successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// GET /api/links/trash
// ─────────────────────────────────────────────────────────
export const getTrashedLinks = asyncHandler(async (req, res) => {
  const links = await linkService.getTrashedLinks(req.user._id);

  return new ApiResponse(200, { links }, 'Trash fetched successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// GET /api/links/:id
// ─────────────────────────────────────────────────────────
export const getLinkById = asyncHandler(async (req, res) => {
  const link = await linkService.getLinkById(req.user._id, req.params.id);

  return new ApiResponse(200, { link }, 'Link fetched successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// PATCH /api/links/:id
// ─────────────────────────────────────────────────────────
export const updateLink = asyncHandler(async (req, res) => {
  const link = await linkService.updateLink(req.user._id, req.params.id, req.body);

  return new ApiResponse(200, { link }, 'Link updated successfully.').send(res);
});

// ─────────────────────────────────────────────────────────
// DELETE /api/links/:id  (soft delete)
// ─────────────────────────────────────────────────────────
export const deleteLink = asyncHandler(async (req, res) => {
  await linkService.softDeleteLink(req.user._id, req.params.id);

  return new ApiResponse(200, null, 'Link moved to trash.').send(res);
});

// ─────────────────────────────────────────────────────────
// PATCH /api/links/:id/favorite
// ─────────────────────────────────────────────────────────
export const toggleFavorite = asyncHandler(async (req, res) => {
  const link = await linkService.toggleFavorite(req.user._id, req.params.id);

  const msg = link.isFavorite
    ? 'Link added to favorites.'
    : 'Link removed from favorites.';

  return new ApiResponse(200, { link }, msg).send(res);
});

// ─────────────────────────────────────────────────────────
// PATCH /api/links/:id/restore
// ─────────────────────────────────────────────────────────
export const restoreLink = asyncHandler(async (req, res) => {
  const link = await linkService.restoreLink(req.user._id, req.params.id);

  return new ApiResponse(200, { link }, 'Link restored from trash.').send(res);
});

// ─────────────────────────────────────────────────────────
// DELETE /api/links/:id/permanent
// ─────────────────────────────────────────────────────────
export const permanentDeleteLink = asyncHandler(async (req, res) => {
  await linkService.permanentDeleteLink(req.user._id, req.params.id);

  return new ApiResponse(200, null, 'Link permanently deleted.').send(res);
});

