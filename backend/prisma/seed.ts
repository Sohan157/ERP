import {
  PrismaClient,
  Role,
  CustomerStatus,
  CustomerType,
} from "@prisma/client";

import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // =====================================================
  // DEFAULT PASSWORD
  // =====================================================

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // =====================================================
  // USERS
  // =====================================================

  const users = [
    {
      name: "Admin User",
      email: "admin@example.com",
      role: Role.ADMIN,
    },
    {
      name: "Sales User",
      email: "sales@example.com",
      role: Role.SALES,
    },
    {
      name: "Warehouse User",
      email: "warehouse@example.com",
      role: Role.WAREHOUSE,
    },
    {
      name: "Accounts User",
      email: "accounts@example.com",
      role: Role.ACCOUNTS,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },

      update: {
        name: user.name,
        role: user.role,
        passwordHash,
      },

      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash,
      },
    });
  }

  // =====================================================
  // GET ADMIN
  // =====================================================

  const admin = await prisma.user.findUniqueOrThrow({
    where: {
      email: "admin@example.com",
    },
  });

  // =====================================================
  // CUSTOMERS
  // =====================================================

  const customerCount = await prisma.customer.count();

  if (customerCount === 0) {
    await prisma.customer.createMany({
      data: [
        {
          name: "Rahul Sharma",
          mobile: "9876543210",
          email: "rahul@abctraders.com",
          businessName: "ABC Traders",
          gstNumber: "29ABCDE1234F1Z5",
          type: CustomerType.WHOLESALE,
          address: "Bengaluru, Karnataka",
          status: CustomerStatus.ACTIVE,
          createdById: admin.id,
        },
        {
          name: "Suresh Kumar",
          mobile: "9988776655",
          email: "suresh@xyzstores.com",
          businessName: "XYZ Stores",
          type: CustomerType.RETAIL,
          address: "Mysuru, Karnataka",
          status: CustomerStatus.LEAD,
          createdById: admin.id,
        },
      ],
    });
  }

  // =====================================================
  // PRODUCTS
  // =====================================================

  const productCount = await prisma.product.count();

  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: "27-inch Monitor",
          sku: "MON-001",
          category: "Monitors",
          unitPrice: 12500,
          currentStock: 25,
          minStock: 5,
          warehouseLocation: "A-01",
        },
        {
          name: "Mechanical Keyboard",
          sku: "KEY-001",
          category: "Accessories",
          unitPrice: 3500,
          currentStock: 8,
          minStock: 10,
          warehouseLocation: "A-02",
        },
        {
          name: "Wireless Mouse",
          sku: "MOU-001",
          category: "Accessories",
          unitPrice: 1200,
          currentStock: 40,
          minStock: 10,
          warehouseLocation: "A-03",
        },
      ],
    });
  }

  // =====================================================
  // COMPLETE
  // =====================================================

  console.log("=================================");
  console.log("Seed complete.");
  console.log("=================================");
  console.log("Demo users:");
  console.log("admin@example.com");
  console.log("sales@example.com");
  console.log("warehouse@example.com");
  console.log("accounts@example.com");
  console.log("---------------------------------");
  console.log("Password for all users:");
  console.log("Password123!");
  console.log("=================================");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });