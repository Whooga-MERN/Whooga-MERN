("use client");

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { useLocation } from "react-router-dom";

interface DetailsState {
  itemData: {
    attributes: { name: string; value: string }[];
    image: string;
  };
}

export default function Details() {
  const location = useLocation();
  const state = location.state as DetailsState | undefined;

  if (!state || !state.itemData || !state.itemData.attributes) {
    return <div>Error: No data available</div>;
  }

  const { itemData } = state;
  const { attributes, image } = itemData;
  const imageUrl =
    attributes.find((attribute) => attribute.name === "image")?.value ||
    "/placeholder.jpg";
  console.log("image: ", imageUrl);

  return (
    <>
      <Header />

      <div className="">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          {/* Product details */}
          <div className="lg:max-w-lg lg:self-end">
            <div className="mt-16 ml-20">
              {/* First attribute */}
              {attributes[0] && (
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                  {attributes[0].value.toUpperCase()}
                </h1>
              )}

              {/* Second attribute */}
              {attributes[1] && (
                <p className="pt-2 text-2xl font-bold">{attributes[1].value}</p>
              )}
            </div>

            <section aria-labelledby="information-heading" className="mt-4">
              {/* Remaining attributes */}
              <div className="mt-10 space-y-2 text-xl font-bold text-gray-500 dark:text-gray-400 ml-20">
                {attributes
                  .slice(2)
                  .filter((attribute) => attribute.name !== "image")
                  .map((attribute) => (
                    <p key={attribute.name}>
                      {attribute.name === "createAt"
                        ? "Created At"
                        : attribute.name}
                      : {attribute.value}
                    </p>
                  ))}
              </div>
            </section>
          </div>

          {/* Display Image */}
          <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center sm:pt-10">
            <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg">
              <img alt={attributes[0]?.value} src={imageUrl} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
