import { hashPassword } from "@repo/auth";
import { USER_ROLES } from "@repo/constants";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Computers" },
    { id: 3, name: "Accessories" },
    { id: 4, name: "Smart Home" },
    { id: 5, name: "Audio" },
    { id: 6, name: "Gaming" },
    { id: 7, name: "Mobiles" },
    { id: 8, name: "Wearables" },
    { id: 9, name: "Office" },
    { id: 10, name: "Storage" },
    { id: 11, name: "Networking" },
    { id: 12, name: "Photography" },
  ] as const;

  const products = [
    {
      id: 1,
      name: "Laptop Pro 14",
      description: "14-inch professional laptop",
      price: 1499,
      stock: 18,
      categoryId: 2,
    },
    {
      id: 2,
      name: "Laptop Air 13",
      description: "Lightweight 13-inch laptop",
      price: 999,
      stock: 25,
      categoryId: 2,
    },
    {
      id: 3,
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse",
      price: 29,
      stock: 120,
      categoryId: 3,
    },
    {
      id: 4,
      name: "Mechanical Keyboard",
      description: "RGB mechanical keyboard",
      price: 89,
      stock: 70,
      categoryId: 3,
    },
    {
      id: 5,
      name: "Smart Speaker",
      description: "Voice assistant speaker",
      price: 79,
      stock: 60,
      categoryId: 4,
    },
    {
      id: 6,
      name: "Smart Bulb Pack",
      description: "Pack of 4 Wi-Fi smart bulbs",
      price: 45,
      stock: 110,
      categoryId: 4,
    },
    {
      id: 7,
      name: "Noise Cancelling Headphones",
      description: "Over-ear wireless headphones",
      price: 199,
      stock: 40,
      categoryId: 5,
    },
    {
      id: 8,
      name: "Bluetooth Earbuds",
      description: "True wireless earbuds",
      price: 69,
      stock: 95,
      categoryId: 5,
    },
    {
      id: 9,
      name: "Gaming Console",
      description: "Next-gen gaming console",
      price: 499,
      stock: 22,
      categoryId: 6,
    },
    {
      id: 10,
      name: "Gaming Controller",
      description: "Wireless game controller",
      price: 59,
      stock: 80,
      categoryId: 6,
    },
    {
      id: 11,
      name: "Smartphone X",
      description: "Flagship smartphone",
      price: 899,
      stock: 36,
      categoryId: 7,
    },
    {
      id: 12,
      name: "Smartphone Lite",
      description: "Budget smartphone",
      price: 299,
      stock: 75,
      categoryId: 7,
    },
    {
      id: 13,
      name: "Fitness Band",
      description: "Daily activity tracker",
      price: 49,
      stock: 130,
      categoryId: 8,
    },
    {
      id: 14,
      name: "Smartwatch S",
      description: "Smartwatch with GPS",
      price: 229,
      stock: 42,
      categoryId: 8,
    },
    {
      id: 15,
      name: "Office Chair",
      description: "Adjustable ergonomic chair",
      price: 159,
      stock: 28,
      categoryId: 9,
    },
    {
      id: 16,
      name: "Standing Desk",
      description: "Height-adjustable desk",
      price: 349,
      stock: 19,
      categoryId: 9,
    },
    {
      id: 17,
      name: "External SSD 1TB",
      description: "Portable high-speed SSD",
      price: 119,
      stock: 64,
      categoryId: 10,
    },
    {
      id: 18,
      name: "MicroSD Card 256GB",
      description: "UHS-I microSD card",
      price: 39,
      stock: 140,
      categoryId: 10,
    },
    {
      id: 19,
      name: "Wi-Fi 6 Router",
      description: "Dual-band Wi-Fi 6 router",
      price: 129,
      stock: 48,
      categoryId: 11,
    },
    {
      id: 20,
      name: "Mirrorless Camera",
      description: "24MP mirrorless camera",
      price: 1099,
      stock: 14,
      categoryId: 12,
    },
  ] as const;

  const password = await hashPassword("admin123");
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password,
      role: USER_ROLES.ADMIN,
    },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { name: category.name },
      create: { id: category.id, name: category.name },
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
      },
    });
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
