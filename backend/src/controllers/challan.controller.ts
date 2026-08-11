import { Response } from "express";
import { Prisma } from "@prisma/client";

import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/prisma";
import { challanSchema } from "../validators/challan.validator";

// =====================================================
// ERROR HANDLER
// =====================================================

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

function getErrorStatus(error: unknown): number {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      // Record not found
      case "P2025":
        return 404;

      // Unique constraint violation
      case "P2002":
        return 409;

      // Foreign key constraint violation
      case "P2003":
        return 400;

      default:
        return 400;
    }
  }

  return 400;
}

// =====================================================
// LIST CHALLANS
// =====================================================

export async function listChallans(
  req: AuthRequest,
  res: Response
) {
  try {
    const data = await prisma.challan.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            businessName: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },

        items: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 100,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("List challans error:", error);

    return res.status(getErrorStatus(error)).json({
      success: false,
      message: getErrorMessage(error) || "Failed to load challans",
    });
  }
}

// =====================================================
// GET SINGLE CHALLAN
// =====================================================

export async function getChallan(
  req: AuthRequest,
  res: Response
) {
  try {
    const challanId = Number(req.params.id);

    if (!Number.isInteger(challanId) || challanId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    const data = await prisma.challan.findUnique({
      where: {
        id: challanId,
      },

      include: {
        customer: true,

        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },

        items: true,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("Get challan error:", error);

    return res.status(getErrorStatus(error)).json({
      success: false,
      message: getErrorMessage(error) || "Failed to get challan",
    });
  }
}

// =====================================================
// CREATE CHALLAN
// =====================================================
//
// Creates a DRAFT challan.
//
// IMPORTANT:
// Stock is NOT deducted here.
//
// Stock is deducted only when the challan
// is CONFIRMED.
// =====================================================

export async function createChallan(
  req: AuthRequest,
  res: Response
) {
  try {
    const input = challanSchema.parse(req.body);

    // -------------------------------------------------
    // Check customer
    // -------------------------------------------------

    const customer = await prisma.customer.findUnique({
      where: {
        id: input.customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // -------------------------------------------------
    // Prevent duplicate products
    // -------------------------------------------------

    const productIds = input.items.map(
      (item) => item.productId
    );

    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "The same product cannot be added more than once",
      });
    }

    // -------------------------------------------------
    // Load products
    // -------------------------------------------------

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== uniqueProductIds.size) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected products do not exist",
      });
    }

    // -------------------------------------------------
    // Product map
    // -------------------------------------------------

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    // -------------------------------------------------
    // Calculate totals
    // -------------------------------------------------

    const totalQuantity = input.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const totalAmount = input.items.reduce(
      (sum, item) => {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error(
            `Product ${item.productId} not found`
          );
        }

        return (
          sum +
          Number(product.unitPrice) *
            item.quantity
        );
      },
      0
    );

    // -------------------------------------------------
    // Create challan inside transaction
    // -------------------------------------------------

    const challan = await prisma.$transaction(
      async (tx) => {
        const temporaryNumber =
          `TEMP-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)}`;

        const created = await tx.challan.create({
          data: {
            challanNumber: temporaryNumber,

            customerId: input.customerId,

            totalQuantity,

            totalAmount,

            createdById: req.user!.id,

            status: "DRAFT",

            items: {
              create: input.items.map((item) => {
                const product =
                  productMap.get(item.productId);

                if (!product) {
                  throw new Error(
                    `Product ${item.productId} not found`
                  );
                }

                return {
                  productId: product.id,

                  productName: product.name,

                  sku: product.sku,

                  unitPrice: product.unitPrice,

                  quantity: item.quantity,
                };
              }),
            },
          },

          include: {
            customer: true,
            items: true,
          },
        });

        const challanNumber =
          `CH-${String(created.id).padStart(5, "0")}`;

        return tx.challan.update({
          where: {
            id: created.id,
          },

          data: {
            challanNumber,
          },

          include: {
            customer: true,
            items: true,
          },
        });
      }
    );

    return res.status(201).json({
      success: true,
      data: challan,
    });
  } catch (error: unknown) {
    console.error("Create challan error:", error);

    return res.status(getErrorStatus(error)).json({
      success: false,
      message:
        getErrorMessage(error) ||
        "Failed to create challan",
    });
  }
}

// =====================================================
// CONFIRM CHALLAN
// =====================================================
//
// DRAFT
//   ↓
// CONFIRMED
//
// Stock is deducted here.
// =====================================================

export async function confirmChallan(
  req: AuthRequest,
  res: Response
) {
  try {
    const challanId = Number(req.params.id);

    // -------------------------------------------------
    // Validate ID
    // -------------------------------------------------

    if (
      !Number.isInteger(challanId) ||
      challanId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    // -------------------------------------------------
    // Transaction
    // -------------------------------------------------

    const result = await prisma.$transaction(
      async (tx) => {
        // ---------------------------------------------
        // Get challan
        // ---------------------------------------------

        const challan =
          await tx.challan.findUnique({
            where: {
              id: challanId,
            },

            include: {
              items: true,
            },
          });

        if (!challan) {
          const error = new Error(
            "Challan not found"
          );

          (error as any).statusCode = 404;

          throw error;
        }

        // ---------------------------------------------
        // Only DRAFT can be confirmed
        // ---------------------------------------------

        if (challan.status !== "DRAFT") {
          const error = new Error(
            `Only draft challans can be confirmed. Current status: ${challan.status}`
          );

          (error as any).statusCode = 400;

          throw error;
        }

        // ---------------------------------------------
        // Make sure challan has products
        // ---------------------------------------------

        if (challan.items.length === 0) {
          const error = new Error(
            "Cannot confirm an empty challan"
          );

          (error as any).statusCode = 400;

          throw error;
        }

        // ---------------------------------------------
        // Validate products and stock
        // ---------------------------------------------

        for (const item of challan.items) {
          const product =
            await tx.product.findUnique({
              where: {
                id: item.productId,
              },
            });

          if (!product) {
            const error = new Error(
              `Product ${item.productName} no longer exists`
            );

            (error as any).statusCode = 400;

            throw error;
          }

          if (item.quantity <= 0) {
            const error = new Error(
              `Invalid quantity for ${item.productName}`
            );

            (error as any).statusCode = 400;

            throw error;
          }

          if (
            product.currentStock <
            item.quantity
          ) {
            const error = new Error(
              `Insufficient stock for ${item.productName}. Available: ${product.currentStock}, required: ${item.quantity}`
            );

            (error as any).statusCode = 400;

            throw error;
          }
        }

        // ---------------------------------------------
        // Deduct stock
        // ---------------------------------------------

        for (const item of challan.items) {
          const product =
            await tx.product.findUniqueOrThrow({
              where: {
                id: item.productId,
              },
            });

          const newStock =
            product.currentStock -
            item.quantity;

          await tx.product.update({
            where: {
              id: item.productId,
            },

            data: {
              currentStock: newStock,
            },
          });

          // -------------------------------------------
          // Create stock movement
          // -------------------------------------------

          await tx.stockMovement.create({
            data: {
              productId: item.productId,

              quantity: -item.quantity,

              type: "OUT",

              reason:
                `Sales Challan ${challan.challanNumber}`,

              createdById: req.user!.id,
            },
          });
        }

        // ---------------------------------------------
        // Mark challan confirmed
        // ---------------------------------------------

        return tx.challan.update({
          where: {
            id: challanId,
          },

          data: {
            status: "CONFIRMED",
          },

          include: {
            customer: true,

            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },

            items: true,
          },
        });
      }
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error(
      "Confirm challan error:",
      error
    );

    return res.status(
      error?.statusCode ||
        getErrorStatus(error)
    ).json({
      success: false,
      message:
        getErrorMessage(error) ||
        "Failed to confirm challan",
    });
  }
}

// =====================================================
// CANCEL CHALLAN
// =====================================================
//
// Only DRAFT challans can be cancelled.
// =====================================================

export async function cancelChallan(
  req: AuthRequest,
  res: Response
) {
  try {
    const challanId = Number(req.params.id);

    // -------------------------------------------------
    // Validate ID
    // -------------------------------------------------

    if (
      !Number.isInteger(challanId) ||
      challanId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid challan ID",
      });
    }

    // -------------------------------------------------
    // Find challan
    // -------------------------------------------------

    const challan =
      await prisma.challan.findUnique({
        where: {
          id: challanId,
        },
      });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    // -------------------------------------------------
    // Only DRAFT can be cancelled
    // -------------------------------------------------

    if (challan.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message:
          "Only draft challans can be cancelled",
      });
    }

    // -------------------------------------------------
    // Cancel
    // -------------------------------------------------

    const data =
      await prisma.challan.update({
        where: {
          id: challan.id,
        },

        data: {
          status: "CANCELLED",
        },
      });

    return res.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error(
      "Cancel challan error:",
      error
    );

    return res.status(getErrorStatus(error)).json({
      success: false,
      message:
        getErrorMessage(error) ||
        "Failed to cancel challan",
    });
  }
}