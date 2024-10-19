import React, { useContext, useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Collection } from "../Types/Collection";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import fetchJWT from "../fetchJWT";

const tags = [
  {
    id: 1,
    title: "eagle",
    image: "/eagle.jpg",
    createAt: "03/12/24",
    tagNum: "#55988",
    createdBy: "This person",
    color: ["purple", "blue", "grey"],
  },
  {
    id: 2,
    title: "psycho",
    image: "/psycho.jpg",
    createAt: "3/06/24",
    tagNum: "#55927",
    createdBy: "That person",
    color: ["red", "black", "white"],
  },
  {
    id: 3,
    title: "shawshank",
    image: "/shawshank.jpg",
    createAt: "02/28/24",
    tagNum: "#55881",
    createdBy: "Those person",
    color: ["brown", "black", "orange"],
  },
  {
    id: 4,
    title: "golddog",
    image: "/golddog.jpg",
    createAt: "03/04/24",
    tagNum: "#55915",
    createdBy: "This group",
    color: ["yellow", "purple", "pink"],
  },
  {
    id: 5,
    title: "Bear",
    image: "/bear.jpg",
    createAt: "03/12/24",
    tagNum: "#55996",
    createdBy: "That group",
    color: ["red", "brown", "black"],
  },
  {
    id: 6,
    title: "Ghostbusters",
    image: "/ghostbusters.jpg",
    createAt: "02/03/24",
    tagNum: "#55697",
    createdBy: "Those groups",
    color: ["red", "green", "white"],
  },
  {
    id: 7,
    title: "braveheart",
    image: "/braveheart.jpg",
    createAt: "03/12/24",
    tagNum: "#55994",
    createdBy: "me",
    color: ["blue", "black", "white"],
  },
  {
    id: 8,
    title: "tiny toon",
    image: "/tinytoon.jpg",
    createAt: "03/07/24",
    tagNum: "#55958",
    createdBy: "He",
    color: ["red", "yellow", "purple", "blue"],
  },
  {
    id: 9,
    title: "alien invasion club",
    image: "/alienclub.jpg",
    createAt: "03/06/24",
    tagNum: "#55949",
    createdBy: "She",
    color: ["green", "yellow", "red"],
  },
  {
    id: 10,
    title: "lisboa portugal train 28",
    image: "/lisboaportugal28.jpg",
    createAt: "03/05/24",
    tagNum: "#55917",
    createdBy: "Them",
    color: ["brown", "blue", "yellow"],
  },
  {
    id: 11,
    title: "galactic wars",
    image: "/galacticwars.jpg",
    createAt: "03/15/24",
    tagNum: "#55928",
    createdBy: "A Rebel",
    color: ["black", "grey", "red"],
  },
  {
    id: 12,
    title: "mountain explorer",
    image: "/mountainexplorer.jpg",
    createAt: "03/18/24",
    tagNum: "#55935",
    createdBy: "Adventurer",
    color: ["green", "blue", "brown"],
  },
  {
    id: 13,
    title: "sunset paradise",
    image: "/sunsetparadise.jpg",
    createAt: "03/20/24",
    tagNum: "#55945",
    createdBy: "Nature Lover",
    color: ["orange", "yellow", "pink"],
  },
  {
    id: 14,
    title: "ocean depths",
    image: "/oceandepths.jpg",
    createAt: "03/22/24",
    tagNum: "#55955",
    createdBy: "Deep Diver",
    color: ["blue", "aqua", "black"],
  },
  {
    id: 15,
    title: "cyberpunk city",
    image: "/cyberpunkcity.jpg",
    createAt: "03/25/24",
    tagNum: "#55967",
    createdBy: "Tech Guru",
    color: ["purple", "pink", "neon green"],
  },
  {
    id: 16,
    title: "ancient ruins",
    image: "/ancientruins.jpg",
    createAt: "03/28/24",
    tagNum: "#55974",
    createdBy: "Archaeologist",
    color: ["brown", "grey", "beige"],
  },
  {
    id: 17,
    title: "skylight dreams",
    image: "/skylightdreams.jpg",
    createAt: "03/30/24",
    tagNum: "#55981",
    createdBy: "Astronomer",
    color: ["blue", "purple", "white"],
  },
  {
    id: 18,
    title: "desert wanderer",
    image: "/desertwanderer.jpg",
    createAt: "04/01/24",
    tagNum: "#55989",
    createdBy: "Nomad",
    color: ["yellow", "brown", "red"],
  },
  {
    id: 19,
    title: "jungle adventure",
    image: "/jungleadventure.jpg",
    createAt: "04/03/24",
    tagNum: "#55995",
    createdBy: "Explorer",
    color: ["green", "brown", "orange"],
  },
  {
    id: 20,
    title: "northern lights",
    image: "/northernlights.jpg",
    createAt: "04/05/24",
    tagNum: "#56001",
    createdBy: "Aurora Chaser",
    color: ["green", "purple", "blue"],
  },
  {
    id: 21,
    title: "forest guardian",
    image: "/forestguardian.jpg",
    createAt: "04/08/24",
    tagNum: "#56012",
    createdBy: "Wildlife Protector",
    color: ["green", "brown", "gold"],
  },
  {
    id: 22,
    title: "volcano eruption",
    image: "/volcanoeruption.jpg",
    createAt: "04/10/24",
    tagNum: "#56018",
    createdBy: "Geologist",
    color: ["red", "orange", "black"],
  },
  {
    id: 23,
    title: "mystic cavern",
    image: "/mysticcavern.jpg",
    createAt: "04/12/24",
    tagNum: "#56023",
    createdBy: "Cave Explorer",
    color: ["purple", "blue", "grey"],
  },
  {
    id: 24,
    title: "windy hills",
    image: "/windyhills.jpg",
    createAt: "04/14/24",
    tagNum: "#56035",
    createdBy: "Hill Climber",
    color: ["green", "blue", "white"],
  },
  {
    id: 25,
    title: "urban skyline",
    image: "/urbanskyline.jpg",
    createAt: "04/16/24",
    tagNum: "#56048",
    createdBy: "City Planner",
    color: ["grey", "blue", "yellow"],
  },
  {
    id: 26,
    title: "mysterious forest",
    image: "/mysteriousforest.jpg",
    createAt: "04/18/24",
    tagNum: "#56056",
    createdBy: "Wanderer",
    color: ["green", "black", "dark brown"],
  },
  {
    id: 27,
    title: "glacial expedition",
    image: "/glacialexpedition.jpg",
    createAt: "04/20/24",
    tagNum: "#56062",
    createdBy: "Polar Explorer",
    color: ["white", "blue", "grey"],
  },
  {
    id: 28,
    title: "retro arcade",
    image: "/retroarcade.jpg",
    createAt: "04/22/24",
    tagNum: "#56071",
    createdBy: "Gamer",
    color: ["neon green", "pink", "black"],
  },
  {
    id: 29,
    title: "golden desert",
    image: "/goldendesert.jpg",
    createAt: "04/24/24",
    tagNum: "#56085",
    createdBy: "Desert Traveler",
    color: ["gold", "yellow", "orange"],
  },
  {
    id: 30,
    title: "crystal caves",
    image: "/crystalcaves.jpg",
    createAt: "04/26/24",
    tagNum: "#56094",
    createdBy: "Gem Hunter",
    color: ["purple", "blue", "white"],
  },
  {
    id: 31,
    title: "zen garden",
    image: "/zengarden.jpg",
    createAt: "04/28/24",
    tagNum: "#56105",
    createdBy: "Meditation Master",
    color: ["green", "white", "brown"],
  },
  {
    id: 32,
    title: "robot revolution",
    image: "/robotrevolution.jpg",
    createAt: "04/30/24",
    tagNum: "#56116",
    createdBy: "Engineer",
    color: ["silver", "blue", "red"],
  },
  {
    id: 33,
    title: "enchanted castle",
    image: "/enchantedcastle.jpg",
    createAt: "05/02/24",
    tagNum: "#56125",
    createdBy: "Storyteller",
    color: ["purple", "gold", "white"],
  },
  {
    id: 34,
    title: "haunted mansion",
    image: "/hauntedmansion.jpg",
    createAt: "05/04/24",
    tagNum: "#56137",
    createdBy: "Ghost Hunter",
    color: ["black", "grey", "blue"],
  },
  {
    id: 35,
    title: "deep space",
    image: "/deepspace.jpg",
    createAt: "05/06/24",
    tagNum: "#56142",
    createdBy: "Astronaut",
    color: ["black", "blue", "silver"],
  },
  {
    id: 36,
    title: "sahara adventure",
    image: "/saharaadventure.jpg",
    createAt: "05/08/24",
    tagNum: "#56154",
    createdBy: "Explorer",
    color: ["sand", "brown", "yellow"],
  },
  {
    id: 37,
    title: "hidden waterfall",
    image: "/hiddenwaterfall.jpg",
    createAt: "05/10/24",
    tagNum: "#56161",
    createdBy: "Nature Lover",
    color: ["blue", "green", "white"],
  },
  {
    id: 38,
    title: "alien landscape",
    image: "/alienlandscape.jpg",
    createAt: "05/12/24",
    tagNum: "#56176",
    createdBy: "Sci-Fi Fan",
    color: ["green", "purple", "blue"],
  },
  {
    id: 39,
    title: "frozen tundra",
    image: "/frozentundra.jpg",
    createAt: "05/14/24",
    tagNum: "#56185",
    createdBy: "Ice Explorer",
    color: ["white", "blue", "grey"],
  },
  {
    id: 40,
    title: "victorian steampunk",
    image: "/victoriansteampunk.jpg",
    createAt: "05/16/24",
    tagNum: "#56198",
    createdBy: "Inventor",
    color: ["brown", "gold", "black"],
  },
];

const collections: Collection[] = [
  {
    name: "Pathtags",
    id: 1,
    image_url: "/bear.jpg",
    description:
      "Pathtags are a type of geocaching swag that are small and lightweight. They are usually made of metal and have a unique design on them. Pathtags are often traded between geocachers and are a fun way to collect souvenirs from different caches.",
    newListing: true,
  },
  {
    name: "Shoes",
    id: 2,
    image_url: "/shoes.jpg",
    description:
      "Shoes are a type of footwear that are typically worn on the feet.",
    newListing: false,
  },
  {
    name: "Cat Mugs",
    id: 5,
    image_url: "/catmug.jpg",
    description: "ur mom",
    newListing: false,
  },
  {
    name: "Pokemon Cards",
    id: 4,
    image_url: "/pokemon.jpg",
    description: "ur mom",
    newListing: true,
  },
  {
    name: "Snowglobes",
    id: 3,
    image_url: "/snowglobe.jpg",
    description:
      "Snowglobes are a type of souvenir that are often sold in gift shops.",
    newListing: true,
  },
  {
    name: "ur mom",
    id: 6,
    image_url: "/psycho.jpg",
    description: "ur mom",
    newListing: false,
  },
];

function Wishlist() {
  const [user, setUser] = useState<any>(null);
  const [JWT, setJWT] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isUserFetched, setIsUserFetched] = useState(false);
  const [isTokenFetched, setIsTokenFetched] = useState(false);
  const [isUserIdFetched, setIsUserIdFetched] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [filledHeartIds, setFilledHeartIds] = useState<number[]>([]);
  const [customAttributes, setCustomAttributes] = useState<string[]>([
    "name",
    "Color",
    "Plated",
  ]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const user = await fetchUserLoginDetails();
        setUser(user || "");
        setIsUserFetched(true);
      } catch (error) {
        console.error("Error Fetching User");
      }
    };
    fetchUserDetails();

    const fetchToken = async () => {
      try {
        const token = await fetchJWT();
        setJWT(token || "");
        setIsTokenFetched(true);
      } catch (error) {
        console.error("Error fetching JWT");
      }
    };
    fetchToken();
    //console.log(JWT);
  }, []);

  useEffect(() => {
    if (isUserFetched && isTokenFetched && user && JWT) {
      const getUserId = async () => {
        const params = {
          user_email: user.loginId,
        };

        const response = await fetch(
          "http://localhost:3000/user/?user_email=" + user.loginId,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
        const data = await response.json();
        setUserId(data[0].user_id);
        setIsUserIdFetched(true);
      };
      getUserId();
    }
  }, [isUserFetched, isTokenFetched, user, JWT]);

  useEffect(() => {
    // fetch collections
    if (isUserIdFetched && userId) {
      // console.log("in fetch collections ", userId);
      const fetchCollections = async () => {
        const response = await fetch(
          "http://localhost:3000/collection/user/" + userId,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
        const data = await response.json();
        // console.log("collections as data: ", data);
        // console.log("1st collection:", data[0].collection_pic);

        setCollections(
          data.map((col: any) => {
            return {
              name: col.name,
              id: col.collection_id,
              collectionUniverseId: col.collection_universe_id,
              image_url: col.collection_pic,
              description: "",
              newListing: false,
              customAttributes: col.custom_attributes,
              favoriteAttributes: col.favorite_attributes,
              hiddenAttributes: col.hidden_attributes,
            };
          })
        );

        //console.log("Collections as collection:", collections);
      };

      fetchCollections();
    }
  }, [isUserIdFetched, userId, JWT]);

  const handleHeartClick = (tagId: number) => {
    setFilledHeartIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // ------------------ fetch wishlist items ----------------------
  useEffect(() => {
    // collection id that get passed in wishlist
    const collectionIds = JSON.parse(
      localStorage.getItem("collectionIds") || "[]"
    );
    console.log("Collection IDs:", collectionIds);
  }, []);

  const [wishlistedItems, setWishlistedItems] = useState<any[]>([]);

  const fetchWishlistedItems = async (collectionIds: number[]) => {
    try {
      // fetch items for each collections
      const promises = collectionIds.map(async (id) => {
        const response = await fetch(
          `http://localhost:3000/wishlist/wishlisted-collectables/${id}`
        );

        // if no wishlist items, return empty array
        if (!response.ok) {
          return { collectionId: id, items: [] };
        }

        const data = await response.json();
        return { collectionId: id, items: data.length > 0 ? data : [] };
      });

      const results = await Promise.all(promises);
      setWishlistedItems(results);
      console.log("Wishlisted Items:", results);
    } catch (error) {
      console.error("Error fetching wishlisted items:", error);
    }
  };

  useEffect(() => {
    const collectionIds = JSON.parse(
      localStorage.getItem("collectionIds") || "[]"
    );

    // when there is collection, try fetch wishlist
    if (collectionIds.length > 0) {
      fetchWishlistedItems(collectionIds);
    }
  }, []);

  return (
    <>
      <Header />
      <h2 className="px-20 pt-14 font-manrope font-bold text-4xl text-center">
        New Items For You:
      </h2>

      <div className="w-full px-16">
        <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
          {tags.map((item) => (
            <div key={item.id}>
              <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                <div className="h-22 w-30">
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      className="text-2xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                      onClick={() => handleHeartClick(item.id)}
                    >
                      {filledHeartIds.includes(item.id) ? (
                        <FaHeart color="red" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                  </div>
                  {/* <img
                          src={
                            tags.find(
                              (attr: any) => attr.name === "image"
                            )?.value || "/placeholder.jpg"
                          }
                          alt={
                            item.attributes.find(
                              (attr: any) => attr.name === "name"
                            )?.value || "No Name"
                          }
                          width={400}
                          height={400}
                          className="rounded-md shadow-sm object-cover pt-3"
                          onClick={() => handleOpenModal(item)}
                        /> */}
                </div>

                <div className="space-y-1 p-4">
                  {customAttributes
                    .slice(0, 3)
                    .map((attribute: any, index: number) => (
                      <p
                        key={attribute.slug}
                        className={
                          index === 0
                            ? "mt-4 text-lg font-bold pl-4 uppercase truncate"
                            : "text-md font-semibold pl-4 capitalize truncate"
                        }
                      >
                        {`${attribute.value}`}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Wishlist;
