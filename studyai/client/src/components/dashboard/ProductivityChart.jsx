// src/components/dashboard/ProductivityChart.jsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e2433",
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      titleColor: "#f1f5f9",
      bodyColor: "#94a3b8",
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "#64748b", font: { size: 11 } },
      border: { color: "rgba(255,255,255,0.06)" },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "#64748b", font: { size: 11 } },
      border: { color: "rgba(255,255,255,0.06)" },
    },
  },
};

export const StudyHoursChart = ({ data = [] }) => {
  const labels = data.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });
  const values = data.map((d) => d.hours);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Study Hours",
        data: values,
        backgroundColor: "rgba(99,102,241,0.25)",
        borderColor: "#6366f1",
        borderWidth: 2,
        borderRadius: 6,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#6366f1",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="h-48">
      <Line
        data={chartData}
        options={{
          ...chartDefaults,
          plugins: {
            ...chartDefaults.plugins,
            tooltip: {
              ...chartDefaults.plugins.tooltip,
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y.toFixed(1)} hrs`,
              },
            },
          },
        }}
      />
    </div>
  );
};

export const TaskCompletionChart = ({ data = {} }) => {
  const chartData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [data.completed || 0, (data.total || 0) - (data.completed || 0)],
        backgroundColor: ["rgba(16,185,129,0.8)", "rgba(255,255,255,0.08)"],
        borderColor: ["#10b981", "rgba(255,255,255,0.12)"],
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="h-48">
      <Bar data={chartData} options={{ ...chartDefaults }} />
    </div>
  );
};

export const FocusScoreChart = ({ sessions = [] }) => {
  const last7 = sessions.slice(0, 7).reverse();
  const labels = last7.map((_, i) => `Session ${i + 1}`);
  const scores = last7.map((s) => s.focusScore || 70);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Focus Score",
        data: scores,
        backgroundColor: "rgba(139,92,246,0.2)",
        borderColor: "#8b5cf6",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#8b5cf6",
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="h-48">
      <Line
        data={chartData}
        options={{
          ...chartDefaults,
          scales: {
            ...chartDefaults.scales,
            y: { ...chartDefaults.scales.y, min: 0, max: 100 },
          },
        }}
      />
    </div>
  );
};
