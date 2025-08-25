import { Suspense } from "react";

import { Metadata } from "next";

import Table from "@/app/ui/customers/table";
import { lusitana } from "@/app/ui/fonts";
import Search from "@/app/ui/search";
import { CustomersTableSkeleton } from "@/app/ui/skeletons";
import { fetchCustomersPages } from "@/app/lib/data";
import Pagination from "@/app/ui/pagination";
import { CreateCustomer } from "@/app/ui/customers/buttons";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<
    | {
        query?: string;
        page?: string;
      }
    | undefined
  >;
}) {
  const awaitedSearchParams = await searchParams;
  const query = awaitedSearchParams?.query || "";
  const currentPage = Number(awaitedSearchParams?.page) || 1;
  const totalPages = await fetchCustomersPages(query);

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Customers
      </h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search customers..." />
        <CreateCustomer />
      </div>

      <Suspense key={query + currentPage} fallback={<CustomersTableSkeleton />}>
        <Table currentPage={currentPage} query={query} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
