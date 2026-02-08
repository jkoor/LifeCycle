import { PrismaClient } from "../generated/prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // 1. Ensure a user exists
  // Try to find an existing user or create a demo one
  let user = await prisma.user.findFirst()

  if (!user) {
    console.log("Creating new demo user...")
    user = await prisma.user.create({
      data: {
        name: "Demo User",
        email: "demo@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      },
    })
  } else {
    console.log(`Using existing user: ${user.email} (${user.id})`)
  }

  // 2. Create Categories
  const categoriesData = [
    { name: "Pantry", icon: "utensils", color: "#EF4444" },
    { name: "Electronics", icon: "laptop", color: "#3B82F6" },
    { name: "Bathroom", icon: "bath", color: "#10B981" },
    { name: "Storage", icon: "box", color: "#F59E0B" },
  ]

  const categories = []
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: cat.name,
        },
      },
      update: {},
      create: {
        ...cat,
        userId: user.id,
      },
    })
    categories.push(upserted)
  }
  console.log(`✅ Upserted ${categories.length} categories`)

  // 3. Create Tags
  const tagsData = ["Urgent", "Stock Up", "Daily Use", "Expensive"]
  const tags = []
  for (const name of tagsData) {
    const upserted = await prisma.tag.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name,
        },
      },
      update: {},
      create: {
        name,
        userId: user.id,
      },
    })
    tags.push(upserted)
  }
  console.log(`✅ Upserted ${tags.length} tags`)

  // 4. Create Items
  const itemsData = [
    {
      name: "AA Batteries",
      stock: 0,
      categoryName: "Electronics",
      tagNames: ["Stock Up"],
      notifyAdvanceDays: 7,
      price: 15.99,
      brand: "Duracell",
    },
    {
      name: "Toothpaste",
      stock: 2,
      categoryName: "Bathroom",
      tagNames: ["Daily Use"],
      lifespanDays: 30,
      price: 4.5,
      brand: "Colgate",
    },
    {
      name: "Pasta Sauce",
      stock: 5,
      categoryName: "Pantry",
      tagNames: [],
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // +60 days
      price: 3.99,
      brand: "Barilla",
    },
    {
      name: "Laptop Charger",
      stock: 1,
      categoryName: "Electronics",
      tagNames: ["Expensive"],
      note: "Backup charger for travel",
      price: 49.99,
      brand: "Apple",
    },
    {
      name: "Shampoo",
      stock: 1,
      categoryName: "Bathroom",
      tagNames: ["Daily Use"],
      lifespanDays: 45,
      price: 8.99,
      brand: "Head & Shoulders",
      image:
        "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
  ]

  for (const item of itemsData) {
    const category = categories.find((c) => c.name === item.categoryName)
    if (!category) continue

    await prisma.item.create({
      data: {
        name: item.name,
        stock: item.stock,
        notifyAdvanceDays: item.notifyAdvanceDays,
        price: item.price,
        brand: item.brand,
        note: item.note,
        lifespanDays: item.lifespanDays,
        expirationDate: item.expirationDate,
        image: item.image,
        user: { connect: { id: user.id } },
        category: { connect: { id: category.id } },
        tags: {
          connect: item.tagNames?.map((t) => ({
            userId_name: { userId: user.id, name: t },
          })),
        },
      },
    })
  }

  console.log(`✅ Created ${itemsData.length} demo items`)
  console.log("🌱 Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
