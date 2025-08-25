"use server";

import { desc, sql as drizzleSql, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  users as usersTable,
  customers as customersTable,
  invoices as invoicesTable,
} from "@/db/schema";
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  User,
  Revenue,
} from "./definitions";
import { formatCurrency } from "./utils";

import { unstable_noStore as noStore } from "next/cache";

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
        paid: drizzleSql`SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)`,
        pending: drizzleSql`SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END)`,
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
      .leftJoin(customersTable, eq(invoicesTable.customerId, customersTable.id))
      .where(
        or(
          ilike(sql`cast(${invoicesTable.amount} as text)`, query),
          ilike(sql`cast(${invoicesTable.date} as text)`, query),
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
    const count = (
      await db.execute(sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `)
    ).rows as { count: bigint }[];

    const totalPages = Math.ceil(Number(count[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = (
      await db.execute(sql`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id}::uuid;
    `)
    ).rows;

    const invoice = (data as InvoiceForm[]).map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  noStore();

  try {
    const data = (
      await db.execute(sql`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `)
    ).rows;

    const customers = data as CustomerField[];
    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  noStore();

  try {
    const data = await db.execute(sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `);

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending as number),
      total_paid: formatCurrency(customer.total_paid as number),
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
