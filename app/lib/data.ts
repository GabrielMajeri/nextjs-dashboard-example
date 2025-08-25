"use server";

import { Column, desc, sql, eq, ilike, or, asc, count } from "drizzle-orm";
import { db } from "@/db";
import {
  users as usersTable,
  customers as customersTable,
  invoices as invoicesTable,
} from "@/db/schema";
import {
  CustomerField,
  InvoiceForm,
  InvoicesTable,
  User,
  Revenue,
  CustomersTableType,
} from "./definitions";
import { formatCurrency } from "./utils";

function castAsText(column: Column) {
  return sql`cast(${column} as text)`;
}

export async function fetchRevenue() {
  try {
    const data: Revenue[] = await db.query.revenue.findMany();
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await db.query.invoices.findMany({
      columns: { id: true, amount: true },
      with: {
        customer: {
          columns: {
            name: true,
            imageUrl: true,
            email: true,
          },
        },
      },
      orderBy: [desc(invoicesTable.date)],
      limit: 5,
    });

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = db.$count(invoicesTable);
    const customerCountPromise = db.$count(customersTable);
    const invoiceStatusPromise = db
      .select({
        paid: sql`SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)`,
        pending: sql`SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END)`,
      })
      .from(invoicesTable)
      .limit(1);

    const data = (await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ])) as [number, number, { paid: number; pending: number }[]];

    const numberOfInvoices = data[0];
    const numberOfCustomers = data[1];
    const totalPaidInvoices = formatCurrency(data[2][0].paid);
    const totalPendingInvoices = formatCurrency(data[2][0].pending);

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    query = `%${query}%`;
    const invoices = await db
      .select({
        id: invoicesTable.id,
        amount: invoicesTable.amount,
        date: invoicesTable.date,
        status: invoicesTable.status,
        customer: {
          name: customersTable.name,
          email: customersTable.email,
          imageUrl: customersTable.imageUrl,
        },
      })
      .from(invoicesTable)
      .innerJoin(
        customersTable,
        eq(invoicesTable.customerId, customersTable.id),
      )
      .where(
        or(
          ilike(castAsText(invoicesTable.amount), query),
          ilike(castAsText(invoicesTable.date), query),
          ilike(invoicesTable.status, query),
          ilike(customersTable.name, query),
          ilike(customersTable.email, query),
        ),
      )
      .orderBy(desc(invoicesTable.date))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    return invoices as InvoicesTable[];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    query = `%${query}%`;
    const count = (
      await db
        .select({ count: sql`COUNT(*)`.mapWith(Number) })
        .from(invoicesTable)
        .innerJoin(
          customersTable,
          eq(invoicesTable.customerId, customersTable.id),
        )
        .where(
          or(
            ilike(customersTable.name, query),
            ilike(customersTable.email, query),
            ilike(castAsText(invoicesTable.amount), query),
            ilike(castAsText(invoicesTable.date), query),
            ilike(invoicesTable.status, query),
          ),
        )
    )[0].count;

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoiceData = await db.query.invoices.findFirst({
      where: eq(invoicesTable.id, id),
    });

    if (!invoiceData) {
      throw "not found";
    }

    const invoice: InvoiceForm = {
      ...invoiceData,
      status: invoiceData.status as "paid" | "pending",
      // Convert amount from cents to dollars
      amount: invoiceData.amount / 100,
    };

    return invoice;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const data = await db.query.customers.findMany({
      columns: { id: true, name: true },
      orderBy: asc(customersTable.name),
    });

    const customers = data as CustomerField[];
    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    query = `%${query}%`;
    const customersData: CustomersTableType[] = await db
      .select({
        id: customersTable.id,
        name: customersTable.name,
        email: customersTable.email,
        imageUrl: customersTable.imageUrl,
        totalInvoices: count(invoicesTable.id),
        totalPending:
          sql`SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END)`.mapWith(
            Number,
          ),
        totalPaid:
          sql`SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END)`.mapWith(
            Number,
          ),
      })
      .from(customersTable)
      .leftJoin(invoicesTable, eq(customersTable.id, invoicesTable.customerId))
      .where(
        or(
          ilike(customersTable.name, query),
          ilike(customersTable.email, query),
        ),
      )
      .groupBy(
        customersTable.id,
        customersTable.name,
        customersTable.email,
        customersTable.imageUrl,
      )
      .orderBy(asc(customersTable.name));

    const customers = customersData.map((customer) => ({
      ...customer,
      totalPending: formatCurrency(customer.totalPending),
      totalPaid: formatCurrency(customer.totalPaid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

export async function getUser(email: string) {
  try {
    const user: User | undefined = await db.query.users.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user) {
      throw "not found";
    }
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}
