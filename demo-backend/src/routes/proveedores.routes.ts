import { Router } from 'express';
import { listar, crear, registrarTransferencia, registrarEfectivo } from '../controllers/proveedores.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/',              listar);
router.post('/',             crear);
router.post('/transferencia', registrarTransferencia);
router.post('/efectivo',      registrarEfectivo);

export default router;
