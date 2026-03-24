import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    color: "#6366F1",
    description: "Latest developments in AI systems, models, and capabilities",
  },
  {
    name: "Research",
    slug: "research",
    color: "#10B981",
    description: "Academic and industry AI research breakthroughs",
  },
  {
    name: "Industry",
    slug: "industry",
    color: "#F59E0B",
    description: "Business news, funding, and enterprise AI adoption",
  },
  {
    name: "Products",
    slug: "products",
    color: "#3B82F6",
    description: "New AI-powered products and feature launches",
  },
  {
    name: "Policy",
    slug: "policy",
    color: "#EF4444",
    description: "AI regulation, ethics, and governance",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@agentnews.com" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@agentnews.com",
      username: "admin",
      name: "AgentNews Editor",
      password: hashedPassword,
      role: "ADMIN",
      bio: "Chief Editor at AgentNews. Covering AI and its advancements.",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Create AI-focused categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    console.log(`✅ Category: ${cat.name}`);
  }

  console.log("\n🎉 Seed complete! Articles will be sourced automatically by AgentBot.");
  console.log("   Admin login: admin@agentnews.com / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
