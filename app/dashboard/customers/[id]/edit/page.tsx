import { Metadata } from "next";
import { notFound } from "next/navigation";

import Form from "@/app/ui/customers/edit-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import { fetchCustomerById } from "@/app/lib/data";

export const metadata: Metadata = {
  title: "Edit customer",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const customer = await fetchCustomerById(id);
  if (!customer) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Customers", href: "/dashboard/customers" },
          {
            label: "Edit Customer",
            href: `/dashboard/customers/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form customer={customer} />
    </main>
  );
}
