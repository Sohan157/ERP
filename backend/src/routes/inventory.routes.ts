import { Router } from "express";
import { Role } from "@prisma/client";

import { requireAuth } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";

import {
  inventory,
  addStock,
  movements,
} from "../controllers/inventory.controller";

const router = Router();

router.use(requireAuth);

// View inventory
router.get(
  "/",
  inventory
);

// View stock movement history
router.get(
  "/movements",
  movements
);

// Adjust stock
router.post(
  "/:productId/stock",
  allowRoles(
    Role.ADMIN,
    Role.WAREHOUSE
  ),
  addStock
);

export default router;