import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- Seed Users ---
  const adminPin = await bcrypt.hash('1234', 10);
  const managerPin = await bcrypt.hash('1111', 10);
  const serverPin = await bcrypt.hash('2222', 10);
  const kitchenPin = await bcrypt.hash('3333', 10);

  const users = [
    { name: 'Admin', role: 'ADMIN', pinHash: adminPin },
    { name: 'Manager 1', role: 'MANAGER', pinHash: managerPin },
    { name: 'Serveur 1', role: 'SERVER', pinHash: serverPin },
    { name: 'Chef', role: 'KITCHEN', pinHash: kitchenPin },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: u,
    });
  }
  console.log(`Seeded ${users.length} users.`);

  // --- Seed Categories ---
  const categoryStarter = await prisma.category.create({ data: { name: 'Entrées' } });
  const categoryMain = await prisma.category.create({ data: { name: 'Plats' } });
  const categoryDessert = await prisma.category.create({ data: { name: 'Desserts' } });
  const categoryDrinks = await prisma.category.create({ data: { name: 'Boissons' } });
  console.log(`Seeded categories.`);

  // --- Seed Products & Modifiers ---
  const burger = await prisma.product.create({
    data: {
      name: 'Burger Classique',
      price: 12.5,
      categoryId: categoryMain.id,
      modifierGroups: {
        create: [
          {
            name: 'Cuisson',
            minSelections: 1,
            maxSelections: 1,
            options: {
              create: [
                { name: 'Saignant', price: 0 },
                { name: 'À point', price: 0 },
                { name: 'Bien cuit', price: 0 },
              ]
            }
          },
          {
            name: 'Suppléments',
            minSelections: 0,
            maxSelections: 3,
            options: {
              create: [
                { name: 'Cheddar', price: 1.5 },
                { name: 'Bacon', price: 2.0 },
              ]
            }
          }
        ]
      }
    }
  });
  console.log(`Seeded product: ${burger.name}`);

  // --- Seed Tables ---
  const tables = [
    { label: '1', capacity: 2, status: 'available' },
    { label: '2', capacity: 4, status: 'available' },
    { label: '3', capacity: 6, status: 'available' },
    { label: '10', capacity: 8, status: 'available' },
  ];

  for (const t of tables) {
    await prisma.table.create({ data: t });
  }
  console.log(`Seeded tables.`);

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
