import { Router } from 'express';
import { listar, crear, obtener, resumen } from '../controllers/movimientos.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/resumen', resumen);
router.get('/',        listar);
router.get('/:id',     obtener);
router.post('/',       crear);

export default router;
