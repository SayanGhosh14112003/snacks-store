import React, { useEffect, useState } from "react";
import useCategoryStore from "../store/categoryStore";

// Random category names
// const categories = ["Chips", "Cookies", "Sweets", "Drinks", "Nuts", "Bakery"];

// Optional brand palette colors
const colors = [
  "bg-[rgb(250,177,47)]",
  "bg-[rgb(250,129,47)]",
  "bg-[rgb(221,3,3)]",
  "bg-[rgb(255,200,150)]",
  "bg-[rgb(255,220,180)]",
];

export default function Category() {
  const categories=useCategoryStore((state)=>state.categories)
  const setActive=useCategoryStore((state)=>state.setActive)
  const activeCategory=useCategoryStore((state)=>state.activeCategory)
  const getCategories=useCategoryStore((state)=>state.getCategories)
  useEffect(()=>{
    (async()=>{
        await getCategories()
        console.log(categories);
    })()
  },[])
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-[rgb(221,3,3)] mb-6 text-center">
        Filter by Category
      </h2>

      <div className="flex flex-wrap justify-center gap-4">
        {/* All option */}
        <button
          onClick={() => setActive("All")}
          className={`px-6 py-2 rounded-full font-semibold text-white transition-all duration-300
            ${activeCategory === "All" ? "bg-[rgb(173,69,0)] scale-105 ring-2 ring-[rgb(60,30,10)]" : "bg-[rgb(173,69,0)] hover:scale-105"}
          `}
        >
          All
        </button>

        {/* Other categories */}
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActive(cat?._id)}
            className={`px-6 py-2 rounded-full font-semibold text-white transition-all duration-300
              ${colors[idx % colors.length]} 
              ${activeCategory === cat?._id ? "scale-105 ring-2 ring-[rgb(60,30,10)]" : "hover:scale-105"}
            `}
          >
            {cat?.title}
          </button>
        ))}
      </div>
    </div>
  );
}