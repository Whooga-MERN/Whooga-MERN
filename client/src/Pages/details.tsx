("use client");

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { useLocation } from "react-router-dom";

//  object with attribute and data
interface DetailsState {
  attributes: string[];
  tagData: Record<string, string>;
}

export default function Details() {
  const location = useLocation();
  // Safely access the state object
  const state = location.state as DetailsState | undefined;

  // error
  if (!state || !state.attributes || !state.tagData) {
    return <div>Error: No data available</div>;
  }

  const { attributes, tagData } = state;

  return (
    <>
      <Header />

      <div className="">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          {/* Product details */}
          <div className="lg:max-w-lg lg:self-end">
            <div className="mt-16 ml-20">
              {/* first attribute */}
              {attributes[0] && (
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                  {tagData[attributes[0]]}
                </h1>
              )}

              {/* second attribute */}
              {attributes[1] && (
                <p className="pt-2 text-2xl font-bold">
                  {tagData[attributes[1]]}
                </p>
              )}
            </div>

            <section aria-labelledby="information-heading" className="mt-4">
              {/* remaining attribute */}
              <div className="mt-10 space-y-2 text-xl font-bold text-gray-500 dark:text-gray-400 ml-20">
                {attributes
                  .slice(2)
                  .filter((attribute) => attribute !== "image")
                  .map(
                    (attribute) =>
                      tagData[attribute] && (
                        <p key={attribute}>
                          {attribute === "createAt" ? "Created At" : attribute}:{" "}
                          {tagData[attribute]}
                        </p>
                      )
                  )}
              </div>
            </section>
          </div>

          {tagData.image && (
            <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center sm:pt-10">
              <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg">
                <img alt={tagData[attributes[0]]} src={tagData.image} />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
