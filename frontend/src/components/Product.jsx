import { useEffect } from "react";
import ProductCard from "./ProductCard";
import useProductStore from "../store/productStore";
import useCategoryStore from "../store/categoryStore";

export default function Product() {
    const handleAddToCart = (product) => {
        console.log("Added to cart:", product);
    };

    const getProducts = useProductStore((state) => state.getProducts);
    const products = useProductStore((state) => state.products);
    const activeCategory = useCategoryStore((state) => state.activeCategory);

    useEffect(() => {
        (async () => {
            await getProducts();
            console.log(products)
        })()
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h2 className="text-3xl font-bold text-[rgb(221,3,3)] mb-8 text-center">
                Our Products
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products?.map((prod, idx) => (
                    (activeCategory === "All" || activeCategory === prod?.category?._id) && (
                        <ProductCard
                            key={idx}
                            product={prod}
                            onAddToCart={handleAddToCart}
                        />
                    )
                ))}
            </div>
        </div>
    );
}
