import { Router } from 'express';
import { listar, crear, metricas } from '../controllers/subempresas.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/metricas', metricas);
router.get('/',         listar);
router.post('/',        crear);

export default router;
