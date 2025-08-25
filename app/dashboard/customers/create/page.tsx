import { Metadata } from "next";
import Form from "@/app/ui/customers/create-form";
import Breadcrumbs from "@/app/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "New customer",
};

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Customers", href: "/dashboard/customers" },
          {
            label: "Create Customer",
            href: "/dashboard/customers/create",
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
