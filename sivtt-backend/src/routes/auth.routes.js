import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validator.js';
import { loginSchema, refreshTokenSchema } from '../validators/auth.validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(authController.refresh));
router.post('/logout', validate(refreshTokenSchema), asyncHandler(authController.logout));

export default router;