"use client";
import { useState } from "react";
import Image from "next/image";

export default function LoadMore({ initialProducts, query }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;

    try {
      const res = await fetch(`/api/search?query=${query}&page=${nextPage}`);
      const data = await res.json();

      // ✅ Append new products
      setProducts(prev => [...prev, ...data.products]);
      setPage(nextPage);
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ✅ Render product cards */}
      {products.map((p, idx) => (
        <div key={idx} className="product-card">
          <Image
            src={p.image}
            alt={p.product}
            width={200}   // set an explicit width
            height={200}  // set an explicit height
            priority      // optional: improves LCP for above-the-fold images
          />
          <h3>{p.product}</h3>
          <p>{p.details}</p>
          <p>EGP {p.price}</p>
          <button onClick={() => addToCart(p)}>Add to Cart</button>
        </div>
      ))}

      {/* ✅ Render ONE Load More button after products */}
      {products.length > 0 && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load More Products"}
        </button>
      )}
    </div>
  );
}
