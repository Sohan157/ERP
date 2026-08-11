import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/prisma";
import {
  customerSchema,
  followUpSchema,
} from "../validators/customer.validator";

// =====================================================
// LIST CUSTOMERS / SEARCH CUSTOMERS
// =====================================================
export async function listCustomers(
  req: AuthRequest,
  res: Response
) {
  try {
    const page = Math.max(
      Number(req.query.page ?? 1),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit ?? 10),
        1
      ),
      100
    );

    const search = String(
      req.query.search ?? ""
    ).trim();

    const status = req.query.status as
      | "LEAD"
      | "ACTIVE"
      | "INACTIVE"
      | undefined;

    const where = {
      ...(status
        ? {
            status,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                },
              },
              {
                businessName: {
                  contains: search,
                },
              },
              {
                mobile: {
                  contains: search,
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        skip: (page - 1) * limit,

        take: limit,
      }),

      prisma.customer.count({
        where,
      }),
    ]);

    return res.json({
      success: true,

      data,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error(
      "List customers error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to load customers",
    });
  }
}

// =====================================================
// GET SINGLE CUSTOMER
// =====================================================
export async function getCustomer(
  req: AuthRequest,
  res: Response
) {
  try {
    const customer =
      await prisma.customer.findUnique({
        where: {
          id: Number(req.params.id),
        },

        include: {
          followUps: {
            orderBy: {
              createdAt: "desc",
            },

            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.error(
      "Get customer error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to get customer",
    });
  }
}

// =====================================================
// CREATE CUSTOMER
// =====================================================
export async function createCustomer(
  req: AuthRequest,
  res: Response
) {
  try {
    const input =
      customerSchema.parse(req.body);

    const customer =
      await prisma.customer.create({
        data: {
          ...input,

          followUpDate:
            input.followUpDate
              ? new Date(
                  input.followUpDate
                )
              : undefined,

          createdById: req.user!.id,
        },
      });

    return res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.error(
      "Create customer error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to create customer",
    });
  }
}

// =====================================================
// UPDATE CUSTOMER
// =====================================================
export async function updateCustomer(
  req: AuthRequest,
  res: Response
) {
  try {
    const input =
      customerSchema
        .partial()
        .parse(req.body);

    const customer =
      await prisma.customer.update({
        where: {
          id: Number(req.params.id),
        },

        data: {
          ...input,

          followUpDate:
            input.followUpDate
              ? new Date(
                  input.followUpDate
                )
              : undefined,
        },
      });

    return res.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.error(
      "Update customer error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to update customer",
    });
  }
}

// =====================================================
// DELETE CUSTOMER
// =====================================================
export async function deleteCustomer(
  req: AuthRequest,
  res: Response
) {
  try {
    await prisma.customer.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    return res.json({
      success: true,
      message: "Customer deleted",
    });
  } catch (error: any) {
    console.error(
      "Delete customer error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to delete customer",
    });
  }
}

// =====================================================
// ADD FOLLOW-UP
// =====================================================
export async function addFollowUp(
  req: AuthRequest,
  res: Response
) {
  try {
    const input =
      followUpSchema.parse(req.body);

    const customerId =
      Number(req.params.id);

    // Check whether customer exists
    const customer =
      await prisma.customer.findUnique({
        where: {
          id: customerId,
        },
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const followUp =
      await prisma.followUp.create({
        data: {
          customerId,

          createdById: req.user!.id,

          note: input.note,

          followUpDate:
            input.followUpDate
              ? new Date(
                  input.followUpDate
                )
              : new Date(),

          status: "PENDING",
        },

        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

    // Keep customer's main follow-up date synchronized
    await prisma.customer.update({
      where: {
        id: customerId,
      },

      data: {
        followUpDate:
          input.followUpDate
            ? new Date(
                input.followUpDate
              )
            : new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      data: followUp,
    });
  } catch (error: any) {
    console.error(
      "Add follow-up error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to add follow-up",
    });
  }
}

// =====================================================
// COMPLETE FOLLOW-UP
// =====================================================
export async function completeFollowUp(
  req: AuthRequest,
  res: Response
) {
  try {
    const followUpId =
      Number(req.params.followUpId);

    if (
      !Number.isInteger(followUpId) ||
      followUpId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID",
      });
    }

    const followUp =
      await prisma.followUp.findUnique({
        where: {
          id: followUpId,
        },
      });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    if (followUp.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message:
          "Follow-up is already completed",
      });
    }

    const updatedFollowUp =
      await prisma.followUp.update({
        where: {
          id: followUpId,
        },

        data: {
          status: "COMPLETED",
        },

        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },

          customer: {
            select: {
              id: true,
              name: true,
              businessName: true,
              mobile: true,
            },
          },
        },
      });

    return res.json({
      success: true,
      message:
        "Follow-up completed successfully",
      data: updatedFollowUp,
    });
  } catch (error: any) {
    console.error(
      "Complete follow-up error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to complete follow-up",
    });
  }
}

// =====================================================
// UPDATE / RESCHEDULE FOLLOW-UP
// =====================================================
export async function updateFollowUp(
  req: AuthRequest,
  res: Response
) {
  try {
    const followUpId =
      Number(req.params.followUpId);

    if (
      !Number.isInteger(followUpId) ||
      followUpId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID",
      });
    }

    const input =
      followUpSchema
        .partial()
        .parse(req.body);

    const followUp =
      await prisma.followUp.findUnique({
        where: {
          id: followUpId,
        },
      });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    // IMPORTANT:
    // followUpDate can be string OR null.
    // Only create a Date when a real value exists.
    const newFollowUpDate =
      input.followUpDate
        ? new Date(input.followUpDate)
        : undefined;

    const updatedFollowUp =
      await prisma.followUp.update({
        where: {
          id: followUpId,
        },

        data: {
          ...(input.note !== undefined
            ? {
                note: input.note,
              }
            : {}),

          ...(newFollowUpDate
            ? {
                followUpDate:
                  newFollowUpDate,
              }
            : {}),
        },

        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },

          customer: {
            select: {
              id: true,
              name: true,
              businessName: true,
              mobile: true,
            },
          },
        },
      });

    // Keep customer's main follow-up date synchronized
    if (newFollowUpDate) {
      await prisma.customer.update({
        where: {
          id: followUp.customerId,
        },

        data: {
          followUpDate:
            newFollowUpDate,
        },
      });
    }

    return res.json({
      success: true,
      message:
        "Follow-up updated successfully",
      data: updatedFollowUp,
    });
  } catch (error: any) {
    console.error(
      "Update follow-up error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to update follow-up",
    });
  }
}

// =====================================================
// DELETE FOLLOW-UP
// =====================================================
export async function deleteFollowUp(
  req: AuthRequest,
  res: Response
) {
  try {
    const followUpId =
      Number(req.params.followUpId);

    if (
      !Number.isInteger(followUpId) ||
      followUpId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID",
      });
    }

    const followUp =
      await prisma.followUp.findUnique({
        where: {
          id: followUpId,
        },
      });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    await prisma.followUp.delete({
      where: {
        id: followUpId,
      },
    });

    return res.json({
      success: true,
      message:
        "Follow-up deleted successfully",
    });
  } catch (error: any) {
    console.error(
      "Delete follow-up error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to delete follow-up",
    });
  }
}