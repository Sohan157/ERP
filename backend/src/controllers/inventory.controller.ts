import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/prisma";
import { stockSchema } from "../validators/product.validator";

export async function inventory(
  _req: AuthRequest,
  res: Response
) {
  const products =
    await prisma.product.findMany({
      orderBy: {
        name: "asc"
      }
    });

  res.json({
    success: true,
    data: products.map((p) => ({
      ...p,
      lowStock:
        p.currentStock <= p.minStock
    }))
  });
}

export async function addStock(
  req: AuthRequest,
  res: Response
) {
  const input =
    stockSchema.parse(req.body);

  const productId =
    Number(req.params.productId);

  if (!Number.isInteger(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  try {
    const result =
      await prisma.$transaction(
        async (tx) => {
          const product =
            await tx.product.findUnique({
              where: {
                id: productId
              }
            });

          if (!product) {
            throw new Error(
              "Product not found"
            );
          }

          if (
            input.quantity <= 0
          ) {
            throw new Error(
              "Quantity must be greater than 0"
            );
          }

          if (
            input.type === "OUT" &&
            product.currentStock <
              input.quantity
          ) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available stock: ${product.currentStock}`
            );
          }

          const nextStock =
            input.type === "IN"
              ? product.currentStock +
                input.quantity
              : product.currentStock -
                input.quantity;

          const updated =
            await tx.product.update({
              where: {
                id: productId
              },
              data: {
                currentStock:
                  nextStock
              }
            });

          const movement =
            await tx.stockMovement.create({
              data: {
                productId,
                quantity:
                  input.quantity,
                type: input.type,
                reason:
                  input.reason,
                createdById:
                  req.user!.id
              }
            });

          return {
            updated,
            movement
          };
        }
      );

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to update stock"
    });
  }
}

export async function movements(
  _req: AuthRequest,
  res: Response
) {
  const data =
    await prisma.stockMovement.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },

        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      },

      orderBy: {
        createdAt: "desc"
      },

      take: 100
    });

  res.json({
    success: true,
    data
  });
}