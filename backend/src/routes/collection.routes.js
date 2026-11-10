import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { validateObjectId } from '../middleware/validate.middleware.js';
import {
  createCollectionValidator,
  updateCollectionValidator,
} from '../validators/collection.validator.js';
import {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  getCollectionLinks,
} from '../controllers/collection.controller.js';

const router = Router();

// All collection routes require authentication
router.use(protect);

router.post('/', createCollectionValidator, validate, createCollection);
router.get('/', getCollections);
router.get('/:id', validateObjectId('id'), getCollectionById);
router.patch('/:id', validateObjectId('id'), updateCollectionValidator, validate, updateCollection);
router.put('/:id', validateObjectId('id'), updateCollectionValidator, validate, updateCollection);
router.delete('/:id', validateObjectId('id'), deleteCollection);
router.get('/:id/links', validateObjectId('id'), getCollectionLinks);

export default router;

