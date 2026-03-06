import { Router } from 'express';
import { miCuenta } from '../controllers/mi-cuenta.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/', miCuenta);

export default router;
