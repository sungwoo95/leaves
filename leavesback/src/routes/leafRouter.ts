import { Router } from 'express';
import { readLeaf } from '../controllers/leafController';

const leafRouter: Router = Router();

leafRouter.get('/:leafId', readLeaf);
//leafRouter.post("/createleaf", createleaf);

export default leafRouter;
