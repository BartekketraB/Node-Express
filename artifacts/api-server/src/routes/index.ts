import { Router, type IRouter } from "express";
import healthRouter from "./health";
import createPlaceRouter from "./createPlace";

const router: IRouter = Router();

router.use(healthRouter);
router.use(createPlaceRouter);

export default router;
