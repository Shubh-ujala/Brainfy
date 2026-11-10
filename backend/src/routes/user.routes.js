import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/auth.validator.js';
import {
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/user.controller.js';

const router = Router();

// All user routes require authentication
router.use(protect);

router.get('/me', getMe);
router.patch('/me', updateProfileValidator, validate, updateProfile);
router.patch('/change-password', changePasswordValidator, validate, changePassword);
router.delete('/me', deleteAccount);

export default router;

