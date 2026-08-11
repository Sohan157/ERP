import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { dashboard } from "../controllers/dashboard.controller";

const router = Router();
router.use(requireAuth);
router.get("/", dashboard);
export default router;
