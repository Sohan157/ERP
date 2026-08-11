import { Router } from "express";
import { Role } from "@prisma/client";

import { requireAuth } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";

import {
  listChallans,
  getChallan,
  createChallan,
  confirmChallan,
  cancelChallan,
} from "../controllers/challan.controller";

const router = Router();

// =====================================================
// AUTHENTICATION
// =====================================================

router.use(requireAuth);

// =====================================================
// LIST CHALLANS
// =====================================================

router.get(
  "/",
  listChallans
);

// =====================================================
// GET SINGLE CHALLAN
// =====================================================

router.get(
  "/:id",
  getChallan
);

// =====================================================
// CREATE CHALLAN
// ADMIN + SALES
// =====================================================

router.post(
  "/",
  allowRoles(
    Role.ADMIN,
    Role.SALES
  ),
  createChallan
);

// =====================================================
// CONFIRM CHALLAN
// ADMIN + SALES
// =====================================================

router.post(
  "/:id/confirm",
  allowRoles(
    Role.ADMIN,
    Role.SALES
  ),
  confirmChallan
);

// =====================================================
// CANCEL CHALLAN
// ADMIN + SALES
// =====================================================

router.post(
  "/:id/cancel",
  allowRoles(
    Role.ADMIN,
    Role.SALES
  ),
  cancelChallan
);

export default router;