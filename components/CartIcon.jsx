'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function CartIcon({ clientEmail, cartVersion }) {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (clientEmail) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/cart/view?client_email=${clientEmail}`)
        .then(res => {
          setCount(res.data.count);
          setTotal(res.data.total);
        })
        .catch(err => console.error("Cart fetch error:", err));
    }
  }, [clientEmail, cartVersion]); // refresh when cartVersion changes

  return (
    <Link href="/cart" className="cart-icon">
      🛒 <span>{count}</span> | 💵 <span>{total}</span>
    </Link>
  );
}
