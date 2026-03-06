import { Router } from 'express';
import { listar, crear, cambiarPassword, toggleActivo } from '../controllers/usuarios.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/',              listar);
router.post('/',             crear);
router.put('/:id/password',  cambiarPassword);
router.put('/:id/toggle',    toggleActivo);

export default router;
