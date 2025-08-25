"use client";

import { useActionState } from "react";

import Link from "next/link";

import { Customer } from "@/app/lib/definitions";
import { Button } from "@/app/ui/button";
import { updateCustomer } from "@/app/lib/actions";

export default function EditCustomerForm({ customer }: { customer: Customer }) {
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);

  const initialState = { message: null, errors: {} };
  const [state, formAction] = useActionState(
    updateCustomerWithId,
    initialState,
  );

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={customer.name}
              aria-describedby="name-error"
            />
          </div>
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name &&
              state.errors.name.errors.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>

      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer E-mail */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            E-mail
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={customer.email}
              aria-describedby="email-error"
            />
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.errors.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>

      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer image URL */}
        <div className="mb-4">
          <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium">
            Profile icon URL
          </label>
          <div className="relative">
            <input
              id="image-url"
              name="imageUrl"
              type="text"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={customer.imageUrl}
              aria-describedby="image-url-error"
            />
          </div>
          <div id="image-url-error" aria-live="polite" aria-atomic="true">
            {state.errors?.imageUrl &&
              state.errors.imageUrl.errors.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>
      {state.message && (
        <div className="bg-gray-50 px-10 py-4">
          <p className="text-red-600">{state.message}</p>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Customer</Button>
      </div>
    </form>
  );
}
