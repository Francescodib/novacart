import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
   console.log("🌱 Seeding database...");

   // Crea utente di test
   const hashedPassword = await bcrypt.hash("password123", 10);

   const user = await prisma.user.upsert({
      where: { email: "test@novacart.com" },
      update: {},
      create: {
         email: "test@novacart.com",
         password: hashedPassword,
         name: "Test User",
      },
   });

   console.log("✅ Utente di test creato:");
   console.log("   Email: test@novacart.com");
   console.log("   Password: password123");
   console.log("   ID:", user.id);

   // Crea alcune notifiche di test per questo utente
   const notifications = await prisma.notification.createMany({
      data: [
         {
            userId: user.id,
            type: "ORDER_SHIPPED",
            title: "📦 Ordine spedito",
            message: "Il tuo ordine #12345 è stato spedito e arriverà presto!",
            actionUrl: "/orders/12345",
            read: false,
         },
         {
            userId: user.id,
            type: "PROMOTION",
            title: "🎉 Sconto 20%",
            message: "Approfitta dello sconto del 20% su tutti i prodotti tech!",
            actionUrl: "/promotions",
            read: false,
         },
         {
            userId: user.id,
            type: "ORDER_DELIVERED",
            title: "✅ Ordine consegnato",
            message: "Il tuo ordine #12340 è stato consegnato con successo.",
            actionUrl: "/orders/12340",
            read: true,
         },
      ],
   });

   console.log(`✅ ${notifications.count} notifiche di test create`);

   console.log("\n🎯 Puoi ora accedere con:");
   console.log("   Email: test@novacart.com");
   console.log("   Password: password123");
}

main()
   .catch((e) => {
      console.error("❌ Errore durante il seed:", e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
