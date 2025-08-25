"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { signIn } from "@/auth";

import { db } from "@/db";
import { customers, invoices } from "@/db/schema";

const CustomerFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  imageUrl: z.string(),
});

const CreateCustomer = CustomerFormSchema.omit({ id: true });
const UpdateCustomer = CustomerFormSchema.omit({ id: true });

const InvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string("Please select a customer."),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], "Please select an invoice status."),
  date: z.string(),
});

const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function createCustomer(prevState: State, formData: FormData) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    imageUrl: formData.get("imageUrl"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: z.treeifyError(validatedFields.error).properties,
      message: "Missing fields. Failed to create customer.",
    };
  }

  const { name, email, imageUrl } = validatedFields.data;

  try {
    await db.insert(customers).values({ name, email, imageUrl });
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error: failed to create customer",
    };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function updateCustomer(
  id: string,
  prevState: State,
  formData: FormData,
) {
  console.log(formData);
  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    imageUrl: formData.get("imageUrl"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: z.treeifyError(validatedFields.error).properties,
      message: "Missing fields. Failed to update customer.",
    };
  }

  const { name, email, imageUrl } = validatedFields.data;

  try {
    console.log("Updating...");
    await db
      .update(customers)
      .set({ name, email, imageUrl })
      .where(eq(customers.id, id));
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error: failed to update customer",
    };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function deleteCustomer(id: string) {
  try {
    await db.delete(customers).where(eq(customers.id, id));
    revalidatePath("/dashboard/customers");
    return { message: "Deleted customer" };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error: failed to delete customer",
    };
  }
}

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: z.treeifyError(validatedFields.error).properties,
      message: "Missing fields. Failed to create invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await db
      .insert(invoices)
      .values({ customerId, amount: amountInCents, status, date });
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error: failed to create invoice",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: z.treeifyError(validatedFields.error).properties,
      message: "Missing fields. Failed to update invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;

  try {
    await db
      .update(invoices)
      .set({ customerId, amount: amountInCents, status })
      .where(eq(invoices.id, id));
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error: failed to update invoice",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await db.delete(invoices).where(eq(invoices.id, id));
    revalidatePath("/dashboard/invoices");
    return { message: "Deleted invoice" };
  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Database error: failed to delete invoice",
    };
  }
}
