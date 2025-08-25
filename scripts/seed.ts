import bcrypt from "bcrypt";

import {
  invoices,
  customers,
  revenue,
  users,
} from "@/app/lib/placeholder-data.js";
import { db } from "@/db";
import {
  users as usersTable,
  invoices as invoicesTable,
  customers as customersTable,
  revenue as revenueTable,
} from "@/db/schema";

async function seedUsers() {
  try {
    // Insert data into the "users" table
    const insertedUsers = await db
      .insert(usersTable)
      .values(
        await Promise.all(
          users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return {
              ...user,
              password: hashedPassword,
            };
          }),
        ),
      )
      .returning({ id: usersTable.id })
      .onConflictDoNothing({ target: usersTable.id });

    console.log(`Seeded ${insertedUsers.length} users`);
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

async function seedInvoices() {
  try {
    // Insert data into the "invoices" table
    const insertedInvoices = await db
      .insert(invoicesTable)
      .values(
        invoices.map((invoice) => ({
          customerId: invoice.customer_id,
          amount: invoice.amount,
          status: invoice.status,
          date: invoice.date,
        })),
      )
      .returning({ id: invoicesTable.id });

    console.log(`Seeded ${insertedInvoices.length} invoices`);
  } catch (error) {
    console.error("Error seeding invoices:", error);
    throw error;
  }
}

async function seedCustomers() {
  try {
    // Insert data into the "customers" table
    const insertedCustomers = await db
      .insert(customersTable)
      .values(
        customers.map((customer) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          imageUrl: customer.image_url,
        })),
      )
      .returning({ id: customersTable.id })
      .onConflictDoNothing({ target: customersTable.id });

    console.log(`Seeded ${insertedCustomers.length} customers`);
  } catch (error) {
    console.error("Error seeding customers:", error);
    throw error;
  }
}

async function seedRevenue() {
  try {
    // Insert data into the "revenue" table
    const insertedRevenue = await db
      .insert(revenueTable)
      .values(revenue)
      .returning({ month: revenueTable.month })
      .onConflictDoNothing({ target: revenueTable.month });

    console.log(`Seeded ${insertedRevenue.length} revenue`);
  } catch (error) {
    console.error("Error seeding revenue:", error);
    throw error;
  }
}

async function main() {
  await seedUsers();
  await seedCustomers();
  await seedInvoices();
  await seedRevenue();
}

main().catch((err) => {
  console.error(
    "An error occurred while attempting to seed the database:",
    err,
  );
});
