import { Router } from 'express';
import { listar, obtener, transferir, crear } from '../controllers/cajas.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/',          listar);
router.get('/:id',       obtener);
router.post('/',         crear);
router.post('/transferir', transferir);

export default router;
