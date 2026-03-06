import { Router } from 'express';
import { login, me } from '../controllers/auth.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/me', verificarToken, me);

export default router;
