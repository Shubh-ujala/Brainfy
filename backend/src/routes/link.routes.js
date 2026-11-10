import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { validateObjectId } from '../middleware/validate.middleware.js';
import {
  createLinkValidator,
  updateLinkValidator,
  getLinkQueryValidator,
} from '../validators/link.validator.js';
import {
  createLink,
  getLinks,
  getFavorites,
  getRecentLinks,
  getTrashedLinks,
  getLinkById,
  updateLink,
  deleteLink,
  toggleFavorite,
  restoreLink,
  permanentDeleteLink,
} from '../controllers/link.controller.js';

const router = Router();

// All link routes require authentication
router.use(protect);

// ─── Static sub-routes (must be BEFORE /:id to avoid param conflict) ────────
router.get('/favorites', getFavorites);
router.get('/recent', getRecentLinks);
router.get('/trash', getTrashedLinks);

// ─── Collection-level CRUD ───────────────────────────────────────────────────
router.post('/', createLinkValidator, validate, createLink);
router.get('/', getLinkQueryValidator, validate, getLinks);

// ─── Single link operations ──────────────────────────────────────────────────
router.get('/:id', validateObjectId('id'), getLinkById);
router.patch('/:id', validateObjectId('id'), updateLinkValidator, validate, updateLink);
router.put('/:id', validateObjectId('id'), updateLinkValidator, validate, updateLink);
router.delete('/:id', validateObjectId('id'), deleteLink);

// ─── Link sub-actions ────────────────────────────────────────────────────────
router.patch('/:id/favorite', validateObjectId('id'), toggleFavorite);
router.patch('/:id/restore', validateObjectId('id'), restoreLink);
router.delete('/:id/permanent', validateObjectId('id'), permanentDeleteLink);

export default router;

