import { Router } from 'express';
import { listar } from '../controllers/auditoria.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/', listar);

export default router;
