"use client";

import { useEffect, useState } from "react";

type Stock = {
  symbol: string;
  price: number;
  change: number;
};

const defaultStocks: Stock[] = [
  { symbol: "RELIANCE", price: 3021.5, change: 1.21 },
  { symbol: "TCS", price: 4105.75, change: -0.37 },
  { symbol: "INFY", price: 1665.3, change: 0.79 },
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [stocks, setStocks] = useState<Stock[]>(defaultStocks);
  const [newStock, setNewStock] = useState("");

  // Load saved watchlist
  useEffect(() => {
    const savedStocks = localStorage.getItem("watchlist");

    if (savedStocks) {
      try {
        setStocks(JSON.parse(savedStocks));
      } catch {
        console.log("Failed to load watchlist");
      }
    }
  }, []);

  // Save watchlist whenever it changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(stocks));
  }, [stocks]);

  // Simulate live updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((stock) => ({
          ...stock,
          price: Number(
            (stock.price + (Math.random() - 0.5) * 10).toFixed(2)
          ),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const addStock = () => {
    const symbol = newStock.trim().toUpperCase();

    if (!symbol) return;

    if (stocks.some((s) => s.symbol === symbol)) {
      setNewStock("");
      return;
    }

    setStocks([
      ...stocks,
      {
        symbol,
        price: 1000,
        change: 0,
      },
    ]);

    setNewStock("");
  };

  const removeStock = (symbol: string) => {
    setStocks(stocks.filter((s) => s.symbol !== symbol));
  };

  return (
    <main
      className={`min-h-screen p-8 transition-all ${
        darkMode
          ? "bg-black text-white"
          : "bg-white text-black"
      }`}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          📈 Market Dashboard
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="border px-4 py-2 rounded-lg"
        >
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="border rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold">
            NIFTY 50
          </h2>

          <p className="text-3xl font-bold">
            24,850.20
          </p>

          <p className="text-green-500">
            +145.30 (+0.59%)
          </p>
        </div>

        <div className="border rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold">
            SENSEX
          </h2>

          <p className="text-3xl font-bold">
            81,320.55
          </p>

          <p className="text-red-500">
            -120.40 (-0.15%)
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          placeholder="RELIANCE"
          className="border rounded px-3 py-2 bg-white text-black"
        />

        <button
          onClick={addStock}
          className="bg-blue-600 px-4 py-2 rounded text-white"
        >
          Add
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Symbol</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">% Change</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.symbol}>
              <td className="border p-2">
                {stock.symbol}
              </td>

              <td className="border p-2">
                ₹{stock.price}
              </td>

              <td
                className={`border p-2 ${
                  stock.change >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {stock.change}%
              </td>

              <td className="border p-2">
                <button
                  onClick={() =>
                    removeStock(stock.symbol)
                  }
                  className="bg-red-600 px-2 py-1 rounded text-white"
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}