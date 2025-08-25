import Image from "next/image";
import { fetchFilteredCustomers } from "@/app/lib/data";
import { DeleteCustomer, UpdateCustomer } from "./buttons";

export default async function CustomersTable({
  currentPage,
  query,
}: {
  currentPage: number;
  query: string;
}) {
  const customers = await fetchFilteredCustomers(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              {customers?.map((customer) => (
                <div
                  key={customer.id}
                  className="mb-2 w-full rounded-md bg-white p-4"
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="mb-2 flex items-center">
                        <div className="flex items-center gap-3">
                          <Image
                            src={customer.imageUrl}
                            className="rounded-full"
                            alt={`${customer.name}'s profile picture`}
                            width={28}
                            height={28}
                          />
                          <p>{customer.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between border-b py-5">
                    <div className="flex w-1/2 flex-col">
                      <p className="text-xs">Pending</p>
                      <p className="font-medium">{customer.totalPending}</p>
                    </div>
                    <div className="flex w-1/2 flex-col">
                      <p className="text-xs">Paid</p>
                      <p className="font-medium">{customer.totalPaid}</p>
                    </div>
                  </div>
                  <div className="pt-4 text-sm">
                    <p>{customer.totalInvoices} invoices</p>
                  </div>
                </div>
              ))}
            </div>
            <table className="hidden min-w-full rounded-md text-gray-900 md:table">
              <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    E-mail
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Total Invoices
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Total Pending
                  </th>
                  <th scope="col" className="px-4 py-5 font-medium">
                    Total Paid
                  </th>
                  <th scope="col" className="relative py-3 pr-3 pl-6">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
                {customers.map((customer) => (
                  <tr key={customer.id} className="group">
                    <td className="bg-white py-5 pr-3 pl-4 text-sm whitespace-nowrap text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                      <div className="flex items-center gap-3">
                        <Image
                          src={customer.imageUrl}
                          className="rounded-full"
                          alt={`${customer.name}'s profile picture`}
                          width={28}
                          height={28}
                        />
                        <p>{customer.name}</p>
                      </div>
                    </td>
                    <td className="bg-white px-4 py-5 text-sm whitespace-nowrap">
                      {customer.email}
                    </td>
                    <td className="bg-white px-4 py-5 text-sm whitespace-nowrap">
                      {customer.totalInvoices}
                    </td>
                    <td className="bg-white px-4 py-5 text-sm whitespace-nowrap">
                      {customer.totalPending}
                    </td>
                    <td className="bg-white px-4 py-5 text-sm whitespace-nowrap group-first-of-type:rounded-md group-last-of-type:rounded-md">
                      {customer.totalPaid}
                    </td>
                    <td className="py-3 pr-3 pl-6 whitespace-nowrap">
                      <div className="flex justify-end gap-3">
                        <UpdateCustomer id={customer.id} />
                        <DeleteCustomer id={customer.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
