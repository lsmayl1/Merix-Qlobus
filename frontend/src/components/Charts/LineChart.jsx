import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const LineChart = ({ data, valueKey = "revenue" }) => {
  // Eğer veri yoksa boş array ata
  const labels = data ? data.map((item) => item.date) : [];
  const dataPoints = data ? data.map((item) => item[valueKey]) : [];

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Satış Miktarı",
        data: dataPoints,
        borderColor: "rgba(0, 0, 0)",
        backgroundColor: "rgba(251, 176, 16)",
        tension: 0.4,
      },
    ],
  };

  const dataLength = dataPoints.length;

  const options = {
    responsive: true, // Ekran boyutuna göre uyumlu olmasını sağlar
    maintainAspectRatio: false, // Grafik boyutunu korur
    plugins: {
      legend: {
        display: false, // Legend'ı gizler
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `Satış: ${tooltipItem.raw}`; // Tooltip formatı
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: false, // X ekseninin başlığı
        },
        grid: {
          display: false, // Izgaraları gizler
        },
        offset: true, // X ekseninin daha düzgün hizalanması için ekledik
        ticks: {
          callback: function (value, index) {
            // Veri sayısı kadar etiket gösteriyoruz
            if (index < dataLength) {
              return labels[index]; // Sadece veri sayısına kadar etiket gösteriyoruz
            }
            return ""; // Geriye kalanları boş bırakıyoruz
          },
        },
      },
      y: {
        title: {
          display: false, // Y ekseninin başlığı
        },
        position: "right", // Y eksenini sağa alır
        grid: {
          display: false, // Izgaraları gizler
        },
      },
    },
  };

  return (
    <div className=" h-128 w-full ">
      <Line
        data={chartData}
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
        options={options}
      />
    </div>
  );
};
