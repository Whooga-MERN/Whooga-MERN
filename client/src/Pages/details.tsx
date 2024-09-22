("use client");

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { useState } from "react";

export default function details() {
  return (
    <>
      <Header />

      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          {/* Product details */}
          <div className="lg:max-w-lg lg:self-end">
            <div className="mt-4 ml-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Eagle
              </h1>
              <p className="pt-2 text-2xl font-bold">tag Number: #12345</p>
            </div>

            <section aria-labelledby="information-heading" className="mt-4">
              <div className="mt-8 space-y-2 text-xl font-bold text-gray-500 ml-8">
                <p>created at: 12/12/2000</p>
                <p>tag Number: #12345</p>
                <p>tag Number: #12345</p>
              </div>
            </section>
          </div>

          <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center sm:pt-10">
            <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg">
              <img alt={"eagle"} src={"/eagle.jpg"} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
