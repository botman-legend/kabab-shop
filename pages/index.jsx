'use client';
import { signIn, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import CartIcon from "../components/CartIcon";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [cartVersion, setCartVersion] = useState(0);
  const [visibleCounts, setVisibleCounts] = useState({});
  const [productCounts, setProductCounts] = useState({});

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const newHistory = [...chatHistory, { role: "user", content: chatInput }];
    setChatHistory(newHistory);
    setChatInput("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat-bot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          // ❌ remove X-Frontend-Host, Railway strips it
        },
        body: JSON.stringify({
          message: chatInput,
          hostname: window.location.hostname   // ✅ send hostname in JSON body
        })
      });

      const data = await res.json();

      if (data.reply?.products && Array.isArray(data.reply.products)) {
        const batchId = Date.now();
        const botMessages = data.reply.products.map(p => ({
          role: "bot",
          batchId,
          product: p.product,
          details: p.details,
          price: p.price,
          image: p.image,
          cartLink: p.cartLink,
          onAdd: async () => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                client_email: session?.user?.email,
                product: p.product,
                details: p.details,
                link: p.link,
                price: p.price,
                qty: 1,
                hostname: window.location.hostname   // ✅ include here too
              })
            });


            setCartVersion(v => v + 1);
            setProductCounts(prev => ({
              ...prev,
              [p.product]: (prev[p.product] || 0) + 1
            }));
          }
        }));

        setChatHistory([...newHistory, ...botMessages]);
        setVisibleCounts(prev => ({ ...prev, [batchId]: 5 }));
      } else {
        const lastAIMessage = data?.reply?.content ?? "No responses received";
        setChatHistory([...newHistory, { role: "bot", content: String(lastAIMessage) }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatHistory([...newHistory, { role: "bot", content: "⚠️ Error contacting server" }]);
    }
  };

  const handleLoadMore = (batchId) => {
    setVisibleCounts(prev => ({
      ...prev,
      [batchId]: (prev[batchId] || 5) + 5
    }));
  };

  const latestBatchId = Math.max(0, ...chatHistory.filter(m => m.batchId).map(m => m.batchId));

  return (
    <div style={{ backgroundColor: "#ffffff", color: "black" }}>
      {!session ? (
        <button
          onClick={() => signIn("google")}
          style={{ width: "680px", height: "500px", borderRadius: "12px", backgroundColor: "#01811d", color: "white" }}
        >
          Sign in
        </button>
      ) : (
        <div style={{ width: "380px", borderRadius: "20px", marginBottom: "20px" }}>
          <h1>
            Welcome, {session.user.name}
            <CartIcon clientEmail={session.user.email} cartVersion={cartVersion} />
          </h1>

          {/* Chat window */}
          <div style={{ display: "flex", flexDirection: "column", overflowY: "auto", maxHeight: "400px", marginBottom: "10px" }}>
            {chatHistory.map((msg, idx) => {
              if (msg.role === "user") {
                return (
                  <div key={idx} style={{ marginTop: "10px", backgroundColor: "#031425", color: "white", borderRadius: "12px", padding: "8px" }}>
                    {msg.content}
                  </div>
                );
              }

              if (msg.role === "bot" && msg.product) {
                const count = visibleCounts[msg.batchId] || 0;
                const indexInBatch = chatHistory.filter(m => m.batchId === msg.batchId).indexOf(msg);
                if (indexInBatch >= count) return null;
                return (
                  <div key={idx} style={{ marginTop: "10px", backgroundColor: "#000000", color: "white", borderRadius: "20px", padding: "8px" }}>
                    <div style={{ backgroundColor: "#fff", width: "340px", border: "2px solid #051124", borderRadius: "20px", padding: "10px" }}>
                      <strong>{msg.product}</strong>
                      {msg.details && <div style={{ color: "#333" }}>{msg.details}</div>}
                      {msg.price && <div style={{ color: "#006400" }}>EGP {msg.price}</div>}
                      {msg.image && (
                        <Image
                          src={msg.image}
                          alt={msg.product}
                          width={400}
                          height={200}
                          style={{ objectFit: "contain" }}
                        />
                      )}
                      {msg.cartLink && (
                        <div style={{ position: "relative" }}>
                          <button
                            onClick={msg.onAdd}
                            style={{ width: "90px", height: "37px", borderRadius: "12px", backgroundColor: "#FFD700", color: "black" }}
                          >
                            Add to Cart
                          </button>
                          {productCounts[msg.product] > 0 && (
                            <span style={{
                              position: "absolute", top: "-8px", right: "-8px",
                              backgroundColor: "red", color: "white", borderRadius: "50%",
                              padding: "4px 8px", fontSize: "12px", fontWeight: "bold"
                            }}>
                              {productCounts[msg.product]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} style={{ marginTop: "10px", backgroundColor: "#000000", color: "white", borderRadius: "12px", padding: "8px" }}>
                  {msg.content}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input bar */}
          <form onSubmit={handleChatSubmit} style={{
            display: "flex", alignItems: "center", width: "360px",
            border: "2px solid #011d0d", borderRadius: "35px", backgroundColor: "#031425", overflow: "hidden"
          }}>
            {latestBatchId > 0 &&
              chatHistory.filter(m => m.batchId === latestBatchId).length > (visibleCounts[latestBatchId] || 0) && (
                <button
                  type="button"
                  onClick={() => handleLoadMore(latestBatchId)}
                  style={{ width: "70px", height: "70px", backgroundColor: "#0066cc", border: "none", borderRight: "2px solid #011d0d", color: "white", fontSize: "14px" }}
                >
                  More+
                </button>
              )}

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about any products..."
              style={{ flexGrow: 1, height: "70px", fontSize: "14px", border: "none", outline: "none", paddingLeft: "12px", backgroundColor: "#031425", color: "#fbfcfd" }}
            />

            <button
              type="submit"
              style={{ width: "70px", height: "70px", backgroundColor: "#01811d", border: "none", borderLeft: "2px solid #011d0d", color: "white", fontSize: "14px" }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
