import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../utils/prisma";

export async function dashboard(
  _req: AuthRequest,
  res: Response
) {
  try {
    // =====================================================
    // DATE RANGE
    // =====================================================

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // =====================================================
    // DATABASE QUERIES
    // =====================================================

    const [
      // Customers
      customers,
      activeCustomers,
      leadCustomers,
      inactiveCustomers,

      // Products
      products,
      allProducts,

      // Challans
      challans,
      draftChallans,
      confirmedChallans,
      cancelledChallans,

      // Sales
      confirmedSales,
      todaySales,

      // Recent challans
      recentChallans,

      // Follow-ups
      todayFollowUps,
      upcomingFollowUps,
      overdueFollowUps,

      // Recent customers
      recentCustomers
    ] = await Promise.all([

      // ===================================================
      // CUSTOMERS
      // ===================================================

      prisma.customer.count(),

      prisma.customer.count({
        where: {
          status: "ACTIVE"
        }
      }),

      prisma.customer.count({
        where: {
          status: "LEAD"
        }
      }),

      prisma.customer.count({
        where: {
          status: "INACTIVE"
        }
      }),

      // ===================================================
      // PRODUCTS
      // ===================================================

      prisma.product.count(),

      prisma.product.findMany({
        orderBy: {
          currentStock: "asc"
        }
      }),

      // ===================================================
      // CHALLANS
      // ===================================================

      prisma.challan.count(),

      prisma.challan.count({
        where: {
          status: "DRAFT"
        }
      }),

      prisma.challan.count({
        where: {
          status: "CONFIRMED"
        }
      }),

      prisma.challan.count({
        where: {
          status: "CANCELLED"
        }
      }),

      // ===================================================
      // TOTAL CONFIRMED SALES
      // ===================================================

      prisma.challan.aggregate({
        where: {
          status: "CONFIRMED"
        },
        _sum: {
          totalAmount: true
        }
      }),

      // ===================================================
      // TODAY'S SALES
      // ===================================================

      prisma.challan.aggregate({
        where: {
          status: "CONFIRMED",
          createdAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        },
        _sum: {
          totalAmount: true
        }
      }),

      // ===================================================
      // RECENT CHALLANS
      // ===================================================

      prisma.challan.findMany({
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              businessName: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      }),

      // ===================================================
      // TODAY'S FOLLOW-UPS
      // ===================================================

      prisma.followUp.findMany({
        where: {
          followUpDate: {
            gte: startOfToday,
            lte: endOfToday
          }
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              businessName: true,
              mobile: true
            }
          }
        },
        orderBy: {
          followUpDate: "asc"
        },
        take: 20
      }),

      // ===================================================
      // UPCOMING FOLLOW-UPS
      // ===================================================

      prisma.followUp.findMany({
        where: {
          followUpDate: {
            gt: endOfToday
          }
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              businessName: true,
              mobile: true
            }
          }
        },
        orderBy: {
          followUpDate: "asc"
        },
        take: 20
      }),

      // ===================================================
      // OVERDUE FOLLOW-UPS
      // ===================================================

      prisma.followUp.findMany({
        where: {
          followUpDate: {
            lt: startOfToday
          }
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              businessName: true,
              mobile: true
            }
          }
        },
        orderBy: {
          followUpDate: "desc"
        },
        take: 20
      }),

      // ===================================================
      // RECENT CUSTOMERS
      // ===================================================

      prisma.customer.findMany({
        orderBy: {
          createdAt: "desc"
        },
        take: 5,
        select: {
          id: true,
          name: true,
          businessName: true,
          type: true,
          status: true,
          mobile: true,
          createdAt: true
        }
      })
    ]);

    // =====================================================
    // LOW STOCK PRODUCTS
    // =====================================================

    const lowStockProducts = allProducts
      .filter(
        product =>
          product.currentStock <= product.minStock
      )
      .slice(0, 10);

    const lowStock = lowStockProducts.length;

    // =====================================================
    // SALES AMOUNTS
    // =====================================================

    const totalSalesAmount =
      Number(
        confirmedSales._sum.totalAmount ?? 0
      );

    const todaySalesAmount =
      Number(
        todaySales._sum.totalAmount ?? 0
      );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.json({
      success: true,

      data: {
        // -----------------------------------------------
        // CUSTOMER STATISTICS
        // -----------------------------------------------

        customers,
        activeCustomers,
        leadCustomers,
        inactiveCustomers,

        // -----------------------------------------------
        // PRODUCT STATISTICS
        // -----------------------------------------------

        products,
        lowStock,
        lowStockProducts,

        // -----------------------------------------------
        // CHALLAN STATISTICS
        // -----------------------------------------------

        challans,
        draftChallans,
        confirmedChallans,
        cancelledChallans,

        // -----------------------------------------------
        // SALES STATISTICS
        // -----------------------------------------------

        totalSalesAmount,
        todaySalesAmount,

        // -----------------------------------------------
        // RECENT CHALLANS
        // -----------------------------------------------

        recentChallans,

        // -----------------------------------------------
        // FOLLOW-UP STATISTICS
        // -----------------------------------------------

        todayFollowUps: todayFollowUps.length,
        upcomingFollowUps: upcomingFollowUps.length,
        overdueFollowUps: overdueFollowUps.length,

        // -----------------------------------------------
        // FOLLOW-UP RECORDS
        // -----------------------------------------------

        todayFollowUpList: todayFollowUps,
        upcomingFollowUpList: upcomingFollowUps,
        overdueFollowUpList: overdueFollowUps,

        // -----------------------------------------------
        // RECENT CUSTOMERS
        // -----------------------------------------------

        recentCustomers
      }
    });

  } catch (error: any) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to load dashboard"
    });
  }
}