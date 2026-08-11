import { Router } from "express";
import { Role } from "@prisma/client";

import { requireAuth } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";

import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
} from "../controllers/product.controller";

const router = Router();

router.use(requireAuth);

// View products
router.get("/", listProducts);

// View single product
router.get("/:id", getProduct);

// Create product
router.post(
  "/",
  allowRoles(
    Role.ADMIN,
    Role.WAREHOUSE
  ),
  createProduct
);

// Update product
router.put(
  "/:id",
  allowRoles(
    Role.ADMIN,
    Role.WAREHOUSE
  ),
  updateProduct
);

export default router;