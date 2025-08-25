// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Drizzle.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
};

export type Invoice = {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: "pending" | "paid";
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
  amount: string;
};

export type InvoicesTable = {
  id: string;
  date: string;
  amount: number;
  status: "pending" | "paid";
  customer: {
    name: string;
    email: string;
    imageUrl: string;
  };
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  totalInvoices: number;
  totalPending: number;
  totalPaid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  totalInvoices: number;
  totalPending: string;
  totalPaid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customerId: string;
  amount: number;
  status: "pending" | "paid";
};
