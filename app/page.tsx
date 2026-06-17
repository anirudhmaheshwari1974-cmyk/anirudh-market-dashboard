"use client";

import { useEffect, useState } from "react";

type Stock = {
  symbol: string;
  price: number;
};

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [stocks, setStocks] = useState<Stock[]>([
    { symbol: "AAPL", price: 0 },
    { symbol: "MSFT", price: 0 },
    { symbol: "NVDA", price: 0 },
    { symbol: "GOOGL", price: 0 },
    { symbol: "TSLA", price: 0 },
  ]);

  const [newStock, setNewStock] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("watchlist");

    if (saved) {
      try {
        setStocks(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "watchlist",
      JSON.stringify(stocks)
    );
  }, [stocks]);

  const fetchPrices = async () => {
    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const response = await fetch(
              `/api/stock?symbol=${stock.symbol}`
            );

            const data = await response.json();

            if (data.price) {
              return {
                symbol: stock.symbol,
                price: Number(data.price),
              };
            }

            return stock;
          } catch {
            return stock;
          }
        })
      );

      setStocks(updatedStocks);

      setLastUpdated(
        new Date().toLocaleTimeString()
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPrices();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const addStock = async () => {
    const symbol = newStock
      .trim()
      .toUpperCase();

    if (!symbol) return;

    if (
      stocks.some(
        (stock) => stock.symbol === symbol
      )
    ) {
      setNewStock("");
      return;
    }

    try {
      const response = await fetch(
        `/api/stock?symbol=${symbol}`
      );

      const data = await response.json();

      setStocks([
        ...stocks,
        {
          symbol,
          price: Number(data.price) || 0,
        },
      ]);
    } catch {
      setStocks([
        ...stocks,
        {
          symbol,
          price: 0,
        },
      ]);
    }

    setNewStock("");
  };

  const removeStock = (
    symbol: string
  ) => {
    setStocks(
      stocks.filter(
        (stock) =>
          stock.symbol !== symbol
      )
    );
  };

  const portfolioValue = stocks.reduce(
    (sum, stock) =>
      sum + stock.price,
    0
  );

  const cardStyle = darkMode
    ? "bg-gray-900 border-gray-800 text-white"
    : "bg-white border-gray-300 text-black shadow-lg";

  return (
    <main
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-black text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto p-6">

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">

          <div>
            <h1 className="text-5xl font-bold">
              BLOOMBERG TERMINAL LITE
            </h1>

            <p className="text-gray-400 mt-2">
              Personal Market Dashboard
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
              className="border px-4 py-2 rounded-lg"
            >
              {darkMode
                ? "☀ Light"
                : "🌙 Dark"}
            </button>

            <button
              onClick={() =>
                setAutoRefresh(
                  !autoRefresh
                )
              }
              className={`px-4 py-2 rounded-lg font-semibold ${
                autoRefresh
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {autoRefresh
                ? "🟢 Auto Refresh ON"
                : "🔴 Auto Refresh OFF"}
            </button>

            <button
              onClick={fetchPrices}
              className="bg-blue-600 px-4 py-2 rounded-lg text-white"
            >
              🔄 Refresh Now
            </button>

          </div>
        </div>

        <div className="mb-8 text-gray-400">
          Last Updated:{" "}
          {lastUpdated || "Never"}
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div
            className={`rounded-2xl p-5 border ${cardStyle}`}
          >
            <p className="text-sm opacity-70">
              PORTFOLIO VALUE
            </p>

            <h2 className="text-3xl font-bold mt-2">
              $
              {portfolioValue.toFixed(
                2
              )}
            </h2>

            <p className="mt-2 opacity-70">
              {stocks.length} Holdings
            </p>
          </div>

          <div
            className={`rounded-2xl p-5 border ${cardStyle}`}
          >
            <p className="text-sm opacity-70">
              S&P 500
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Connected
            </h2>
          </div>

          <div
            className={`rounded-2xl p-5 border ${cardStyle}`}
          >
            <p className="text-sm opacity-70">
              NASDAQ
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Connected
            </h2>
          </div>

          <div
            className={`rounded-2xl p-5 border ${cardStyle}`}
          >
            <p className="text-sm opacity-70">
              DOW JONES
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Connected
            </h2>
          </div>

        </div>

        <div
          className={`rounded-2xl border p-6 mb-8 ${cardStyle}`}
        >
          <h2 className="text-2xl font-bold mb-4">
            Add Symbol
          </h2>

          <div className="flex flex-wrap gap-3">

            <input
              value={newStock}
              onChange={(e) =>
                setNewStock(
                  e.target.value
                )
              }
              placeholder="META, AMD, NFLX..."
              className={`px-4 py-2 rounded-lg w-80 border ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-black border-gray-300"
              }`}
            />

            <button
              onClick={addStock}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Add Stock
            </button>

          </div>
        </div>

        <div
          className={`rounded-2xl border overflow-hidden ${cardStyle}`}
        >

          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold">
              Watchlist
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr>
                  <th className="p-4 text-left">
                    Symbol
                  </th>

                  <th className="p-4 text-left">
                    Price
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {stocks.map(
                  (stock) => (
                    <tr
                      key={
                        stock.symbol
                      }
                      className="border-t border-gray-700"
                    >
                      <td className="p-4 font-semibold">
                        {
                          stock.symbol
                        }
                      </td>

                      <td className="p-4">
                        {stock.price >
                        0
                          ? `$${stock.price.toFixed(
                              2
                            )}`
                          : "Loading..."}
                      </td>

                      <td className="p-4">
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                          LIVE
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() =>
                            removeStock(
                              stock.symbol
                            )
                          }
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </main>
  );
}