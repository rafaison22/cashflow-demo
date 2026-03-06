import { Router } from 'express';
import { listar, registrarRetiro, diferencia, editarSocio } from '../controllers/socios.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/',           listar);
router.get('/diferencia', diferencia);
router.post('/retiro',    registrarRetiro);
router.put('/:id',        editarSocio);

export default router;
