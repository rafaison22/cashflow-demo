import { Router } from 'express';
import { listar, crear, editar } from '../controllers/claves.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/',    listar);
router.post('/',   crear);
router.put('/:id', editar);

export default router;
