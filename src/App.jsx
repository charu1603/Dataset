import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({});
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 50;

  useEffect(() => {
    fetch("/data/data.txt")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.trim().split("\n");
        const headers = lines[0].split(",");
        const parsed = lines.slice(1).map((line) => {
          const parts = line.split(",");
          return {
            Date: parts[0],
            SKU: parts[1],
            "Unit Price": parseFloat(parts[2]),
            Quantity: parseInt(parts[3]),
            "Total Price": parseFloat(parts[4]),
          };
        });
        setData(parsed);
        analyzeData(parsed);
      });
  }, []);

  const analyzeData = (entries) => {
    const stats = {};

    entries.forEach((entry) => {
      const month = entry.Date.slice(0, 7);
      if (!stats[month]) {
        stats[month] = {
          totalSales: 0,
          itemCount: {},
          itemRevenue: {},
        };
      }

      const { SKU, Quantity, "Total Price": total } = entry;

      stats[month].totalSales += total;

      // Quantity count
      stats[month].itemCount[SKU] =
        (stats[month].itemCount[SKU] || 0) + Quantity;

      // Revenue count
      stats[month].itemRevenue[SKU] =
        (stats[month].itemRevenue[SKU] || 0) + total;
    });

    const finalStats = {};

    for (const month in stats) {
      const monthData = stats[month];
      const itemCounts = monthData.itemCount;
      const itemRevenues = monthData.itemRevenue;

      const mostPopularItem = Object.entries(itemCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];
      const topRevenueItem = Object.entries(itemRevenues).sort(
        (a, b) => b[1] - a[1]
      )[0];

      const ordersOfPopular = entries
        .filter((e) => e.Date.startsWith(month) && e.SKU === mostPopularItem[0])
        .map((e) => e.Quantity);

      const minOrders = Math.min(...ordersOfPopular);
      const maxOrders = Math.max(...ordersOfPopular);
      const avgOrders = (
        ordersOfPopular.reduce((sum, q) => sum + q, 0) / ordersOfPopular.length
      ).toFixed(2);

      finalStats[month] = {
        totalSales: monthData.totalSales,
        mostPopularItem: mostPopularItem[0],
        mostPopularQty: mostPopularItem[1],
        topRevenueItem: topRevenueItem[0],
        topRevenue: topRevenueItem[1],
        minOrders,
        maxOrders,
        avgOrders,
      };
    }

    setMonthlyStats(finalStats);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedData = data.slice(startIndex, endIndex);

const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="p-6 space-y-10">
      {/* ANALYSIS TABLE */}
      <div className="bg-blue-100 p-5 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">
          📊 Monthly Analysis
        </h2>
        <table className="w-full border-collapse border border-blue-400 text-blue-900">
          <thead className="bg-blue-300 text-left">
            <tr>
              <th className="p-2 border border-blue-400">Month</th>
              <th className="p-2 border border-blue-400">Total Sales</th>
              <th className="p-2 border border-blue-400">Most Popular Item</th>
              <th className="p-2 border border-blue-400">Top Revenue Item</th>
              <th className="p-2 border border-blue-400">Min Orders</th>
              <th className="p-2 border border-blue-400">Max Orders</th>
              <th className="p-2 border border-blue-400">Avg Orders</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(monthlyStats).map(([month, stats]) => (
              <tr key={month}>
                <td className="p-2 border border-blue-400">{month}</td>
                <td className="p-2 border border-blue-400">
                  {stats.totalSales}
                </td>
                <td className="p-2 border border-blue-400">
                  {stats.mostPopularItem}
                </td>
                <td className="p-2 border border-blue-400">
                  {stats.topRevenueItem}
                </td>
                <td className="p-2 border border-blue-400">
                  {stats.minOrders}
                </td>
                <td className="p-2 border border-blue-400">
                  {stats.maxOrders}
                </td>
                <td className="p-2 border border-blue-400">
                  {stats.avgOrders}
                </td>
              </tr>
            ))}
            <tr className="bg-blue-200 font-bold">
              <td className="p-2 border border-blue-400">Total</td>
              <td className="p-2 border border-blue-400">
                {Object.values(monthlyStats)
                  .reduce((acc, cur) => acc + cur.totalSales, 0)
                  .toFixed(2)}
              </td>
              <td className="p-2 border border-blue-400" colSpan={5}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* RAW DATA TABLE */}
      <div className="bg-green-100 p-5 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-green-800">📄 Raw Data</h2>
        <table className="w-full border-collapse border border-green-400 text-green-900">
          <thead className="bg-green-300 text-left">
            <tr>
              <th className="p-2 border border-green-400">Date</th>
              <th className="p-2 border border-green-400">Item</th>
              <th className="p-2 border border-green-400">Unit Price</th>
              <th className="p-2 border border-green-400">Quantity</th>
              <th className="p-2 border border-green-400">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((entry, idx) => (

              <tr key={idx}>
                <td className="p-2 border border-green-400">{entry.Date}</td>
                <td className="p-2 border border-green-400">{entry.SKU}</td>
                <td className="p-2 border border-green-400">
                  {entry["Unit Price"]}
                </td>
                <td className="p-2 border border-green-400">
                  {entry.Quantity}
                </td>
                <td className="p-2 border border-green-400">
                  {entry["Total Price"]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center mt-4 space-x-4">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
  >
    Prev
  </button>
  <span className="font-semibold text-green-800">
    Page {currentPage} of {totalPages}
  </span>
  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
  >
    Next
  </button>
</div>

    </div>
  );
}

export default App;
