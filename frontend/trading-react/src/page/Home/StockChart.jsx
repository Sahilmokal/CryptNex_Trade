import { fetchMarketChart } from "@/State/Coin/Action";
import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";

/** time buttons */
const timeSeries = [
  { keyword: "DIGITAL_CURRENCY_DAILY", label: "1 day", value: 1 },
  { keyword: "DIGITAL_CURRENCY_WEEKLY", label: "1 week", value: 7 },
  { keyword: "DIGITAL_CURRENCY_MONTHLY", label: "1 month", value: 30 },
];

/** helper to normalize many API shapes to Apex-friendly data */
function normalizeMarketPoints(raw) {
  if (!raw) return [];

  // Case A: already array of points -> [ [ts, val], ... ] or [{x,y}, ...]
  if (Array.isArray(raw)) {
    return raw
      .map((p) => {
        if (Array.isArray(p) && p.length >= 2) {
          const t = Number(p[0]);
          const ts = t < 1e12 ? t * 1000 : t;
          return [ts, Number(p[1])];
        }
        if (p && typeof p === "object") {
          const x = p.x ?? p.time ?? p.timestamp ?? p.t;
          const y = p.y ?? p.price ?? p.value ?? p.close ?? p[1];
          if (x == null || y == null) return null;
          const tx = Number(x);
          const ts = tx < 1e12 ? tx * 1000 : tx;
          return { x: ts, y: Number(y) };
        }
        return null;
      })
      .filter(Boolean);
  }

  // Case B: object-of-dates (AlphaVantage style or keyed by date)
  if (typeof raw === "object") {
    // try to find time-series nested key (AlphaVantage-like)
    const tsKey = Object.keys(raw).find((k) =>
      /time series|digital_currency|marketchart/i.test(k)
    );
    if (tsKey && typeof raw[tsKey] === "object") {
      const obj = raw[tsKey];
      return Object.entries(obj)
        .map(([dateStr, vals]) => {
          const ts = Date.parse(dateStr);
          const close =
            vals?.["4b. close (USD)"] ??
            vals?.["4. close"] ??
            vals?.close ??
            vals?.price ??
            Object.values(vals)[0];
          if (isNaN(ts) || close == null) return null;
          return [ts, Number(close)];
        })
        .filter(Boolean)
        .sort((a, b) => a[0] - b[0]);
    }

    // object where keys are date strings -> { "2025-11-24": value, ... }
    const keys = Object.keys(raw);
    if (keys.length && keys.every((k) => !isNaN(Date.parse(k)))) {
      return keys
        .map((k) => {
          const ts = Date.parse(k);
          const v = raw[k];
          return [ts, Number(v)];
        })
        .filter((p) => !isNaN(p[0]) && !isNaN(p[1]))
        .sort((a, b) => a[0] - b[0]);
    }

    // numeric-timestamp keys -> { "1630000000": "123.4" }
    if (keys.length && keys.every((k) => /^\d{9,}$/.test(k))) {
      return keys
        .map((k) => {
          const t = Number(k);
          const ts = t < 1e12 ? t * 1000 : t;
          const v = raw[k];
          return [ts, Number(v)];
        })
        .filter((p) => !isNaN(p[0]) && !isNaN(p[1]))
        .sort((a, b) => a[0] - b[0]);
    }
  }

  return [];
}

const StockChart = ({ coinId }) => {
  const dispatch = useDispatch();
  const coin = useSelector((s) => s.coin);

  const [selected, setSelected] = useState(timeSeries[1]); // weekly default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch when coinId or timeframe changes
  useEffect(() => {
    if (!coinId) return;

    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      setError("Not authenticated. Please login.");
      return;
    }

    setLoading(true);
    setError(null);

    // NOTE: fetchMarketChart should attach Authorization header:
    // headers.Authorization = `Bearer ${jwt}`
    // Example of thunk (if you need to update it, do so in src/State/Coin/Action.js)
    dispatch(fetchMarketChart({ coinId, days: selected.value, jwt }))
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error("fetchMarketChart failed:", err);

        // prefer server message if present
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message ?? err?.message;

        if (status === 401 || status === 403) {
          setError("Session expired or unauthorized. Please login again.");
        } else if (status === 500 && /invalid token/i.test(String(serverMsg))) {
          setError("Server rejected token (invalid). Please login again.");
        } else {
          setError(serverMsg || "Failed to fetch market data.");
        }
      });
  }, [dispatch, coinId, selected]);

  // debug: print what API returned
  useEffect(() => {
    console.log("marketChart raw:", coin?.marketChart);
  }, [coin?.marketChart]);

  // Build displayed series for Apex
  const displayedSeries = useMemo(() => {
    // raw could be coin.marketChart.data OR coin.marketChart
    const raw = coin?.marketChart?.data ?? coin?.marketChart ?? null;
    const normalized = normalizeMarketPoints(raw);

    // desired count: for 1 day show last 24 (hourly) else last N days
    const desiredCount = selected?.value === 1 ? 24 : selected?.value ?? normalized.length;
    const data = normalized.slice(-desiredCount);

    return [
      {
        name: coin?.marketChart?.symbol ?? coinId ?? "price",
        data,
      },
    ];
  }, [coin?.marketChart, selected, coinId]);

  const hasData = (displayedSeries?.[0]?.data ?? []).length > 0;

  const options = {
    chart: {
      id: "area-datetime",
      type: "area",
      height: 350,
      zoom: { autoScaleYaxis: true },
      toolbar: { show: true },
    },
    dataLabels: { enabled: false },
    xaxis: { type: "datetime", tickAmount: 6 },
    tooltip: { theme: "dark", x: { format: "dd MMM yyyy HH:mm" } },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 100] } },
    grid: { borderColor: "#47535E", strokeDashArray: 4, show: true },
    markers: { size: 0 },
  };

  return (
    <div>
      <div className="flex space-x-3 mb-4">
        {timeSeries.map((item) => {
          const active = item.keyword === selected.keyword;
          return (
            <button
              key={item.keyword}
              onClick={() => {
                setSelected(item);
                setError(null);
              }}
              className={`px-3 py-1 rounded-md border transition ${
                active ? "bg-blue-600 text-white border-blue-600" : "bg-transparent text-gray-300 border-gray-700 hover:bg-gray-800"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div id="chart-timelines" className="min-h-[20rem]">
        {loading && <div className="p-6 text-gray-400">Loading chart…</div>}

        {!loading && error && (
          <div className="p-4 text-red-300 bg-red-900/5 rounded">{error}</div>
        )}

        {!loading && !error && hasData && (
          <ReactApexChart options={options} series={displayedSeries} type="area" height={350} />
        )}

        {!loading && !error && !hasData && (
          <div className="h-80 flex items-center justify-center text-gray-400">
            No data to display
          </div>
        )}
      </div>
    </div>
  );
};

export default StockChart;
