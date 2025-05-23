import { Router } from 'express';
import { liveblocksAuth, readLeaf } from '../controllers/leafController';

const leafRouter: Router = Router();

leafRouter.get('/:leafId', readLeaf);
leafRouter.post('/liveblocks-auth', liveblocksAuth);

export default leafRouter;
