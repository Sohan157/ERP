import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/prisma";
import { productSchema } from "../validators/product.validator";

export async function listProducts(
  req: AuthRequest,
  res: Response
) {
  const page = Math.max(
    Number(req.query.page ?? 1),
    1
  );

  const limit = Math.min(
    Math.max(Number(req.query.limit ?? 20), 1),
    100
  );

  const search = String(
    req.query.search ?? ""
  );

  const where = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const
            }
          },
          {
            sku: {
              contains: search,
              mode: "insensitive" as const
            }
          },
          {
            category: {
              contains: search,
              mode: "insensitive" as const
            }
          }
        ]
      }
    : {};

  const [data, total] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          createdAt: "desc"
        },
        skip: (page - 1) * limit,
        take: limit
      }),

      prisma.product.count({
        where
      })
    ]);

  res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}

export async function getProduct(
  req: AuthRequest,
  res: Response
) {
  const product =
    await prisma.product.findUnique({
      where: {
        id: Number(req.params.id)
      }
    });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  res.json({
    success: true,
    data: product
  });
}

export async function createProduct(
  req: AuthRequest,
  res: Response
) {
  const input = productSchema.parse(
    req.body
  );

  const product =
    await prisma.$transaction(
      async (tx) => {
        const created =
          await tx.product.create({
            data: input
          });

        // Record initial stock as an IN movement.
        if (
          created.currentStock > 0
        ) {
          await tx.stockMovement.create({
            data: {
              productId: created.id,
              quantity:
                created.currentStock,
              type: "IN",
              reason:
                "Initial stock",
              createdById:
                req.user!.id
            }
          });
        }

        return created;
      }
    );

  res.status(201).json({
    success: true,
    data: product
  });
}

export async function updateProduct(
  req: AuthRequest,
  res: Response
) {
  const input =
    productSchema.partial().parse(
      req.body
    );

  // Stock must only be changed through
  // the inventory endpoint.
  const {
    currentStock,
    ...safeInput
  } = input;

  const product =
    await prisma.product.update({
      where: {
        id: Number(req.params.id)
      },
      data: safeInput
    });

  res.json({
    success: true,
    data: product
  });
}