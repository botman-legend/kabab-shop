'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // for navigation

// Create an Axios instance with baseURL from env
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g. https://botman-production.up.railway.app
});

export default function CartPage() {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  // Initial fetch
  useEffect(() => {
    if (session?.user?.email) {
      api.get(`/cart/view?client_email=${session.user.email}`)
        .then(res => {
          setCartItems(res.data.cart);
          setTotal(res.data.total);
        })
        .catch(err => console.error("Cart fetch error:", err));
    }
  }, [session]);

  // Auto-recalculate total whenever cartItems changes
  useEffect(() => {
    const newTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    setTotal(newTotal);
  }, [cartItems]);

  const handleDelete = async (id) => {
    try {
      await api.post(`/cart/clear_item`, {
        client_email: session.user.email,
        product_id: id,
      });
      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleQuantityChange = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await api.post(`/cart/update_qty`, {
        client_email: session.user.email,
        product_id: id,
        qty: newQty,
      });
      setCartItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, qty: newQty } : item
        )
      );
    } catch (err) {
      console.error("Quantity update error:", err);
    }
  };

  return (
    <div className="p-6">
      <h2>Your Cart</h2>
      <ul>
        {cartItems.map(item => (
          <li key={item.id} className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <strong>{item.product}</strong> — {item.details}  
              <div>Price: {item.price}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleQuantityChange(item.id, item.qty - 1)}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => handleQuantityChange(item.id, item.qty + 1)}>+</button>
            </div>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => handleDelete(item.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 font-bold">Total: {total}</div>
      {cartItems.length > 0 && (
        <button
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => router.push("/checkout")} // navigate to checkout page
        >
          Complete Purchase
        </button>
      )}
    </div>
  );
}
