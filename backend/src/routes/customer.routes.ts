import { Router } from "express";
import { Role } from "@prisma/client";

import { requireAuth } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";

import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addFollowUp,
  completeFollowUp,
  updateFollowUp,
  deleteFollowUp,
} from "../controllers/customer.controller";

const router = Router();

// =====================================================
// AUTHENTICATION
// =====================================================

router.use(requireAuth);

// =====================================================
// CUSTOMER ROUTES
// =====================================================

// List customers / search customers
router.get(
  "/",
  listCustomers
);

// Get single customer + follow-up history
router.get(
  "/:id",
  getCustomer
);

// Create customer
router.post(
  "/",
  allowRoles(
    Role.ADMIN,
    Role.SALES
  ),
  createCustomer
);

// Update customer
router.put(
  "/:id",
  allowRoles(
    Role.ADMIN,
    Role.SALES
  ),
  updateCustomer
);

// Delete customer
router.delete(
  "/:id",
  allowRoles(
    Role.ADMIN
  ),
  deleteCustomer
);

// =====================================================
// FOLLOW-UP ROUTES
// =====================================================

// Add follow-up
router.post(
  "/:id/followups",
  allowRoles(
    Role.ADMIN,
    Role.SALES
  ),
  addFollowUp
);

// Complete follow-up
router.patch(
  "/followups/:followUpId/complete",
  allowRoles(
    Role.ADMIN,
    Role.SALES
  ),
  completeFollowUp
);

// Update / reschedule follow-up
router.patch(
  "/followups/:followUpId",
  allowRoles(
    Role.ADMIN,
    Role.SALES
  ),
  updateFollowUp
);

// Delete follow-up
router.delete(
  "/followups/:followUpId",
  allowRoles(
    Role.ADMIN,
    Role.SALES
  ),
  deleteFollowUp
);

export default router;