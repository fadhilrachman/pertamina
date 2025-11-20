<script setup lang="ts">
import { onBeforeMount } from "vue";
import { Bar, Line, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";
import { usePageStore } from "~/store/page";

definePageMeta({
  auth: false,
});

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

const $page = usePageStore();
onBeforeMount(() => {
  $page.setTitle("Dashboard");
});

const stockInOutData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Stock In",
      backgroundColor: "#3b82f6",
      borderColor: "#3b82f6",
      borderWidth: 1,
      data: [120, 90, 140, 110, 160, 130, 100],
    },
    {
      label: "Stock Out",
      backgroundColor: "#f97316",
      borderColor: "#f97316",
      borderWidth: 1,
      data: [80, 100, 120, 90, 130, 140, 110],
    },
  ],
};

const stockInOutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
    },
  },
};

const stockBalanceData = {
  labels: ["Raw Material", "Finished Goods", "Spare Parts", "Others"],
  datasets: [
    {
      label: "Stock Balance",
      data: [3500, 2800, 1200, 600],
      backgroundColor: ["#6366f1", "#22c55e", "#f97316", "#a855f7"],
      borderWidth: 1,
    },
  ],
};

const stockBalanceOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
};

const dailyTransactionData = {
  labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
  datasets: [
    {
      label: "Transactions",
      data: [45, 60, 52, 70, 65, 80, 75],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.15)",
      tension: 0.3,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: "#10b981",
    },
  ],
};

const dailyTransactionOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
    },
  },
};

const topProductData = {
  labels: ["Diesel Oil", "Drill Bit", "Mud Chemical", "Casing Pipe", "Grease"],
  datasets: [
    {
      label: "Qty Moved",
      data: [520, 480, 450, 430, 390],
      backgroundColor: "#0ea5e9",
      borderColor: "#0284c7",
      borderWidth: 1,
    },
  ],
};

const topProductOptions = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      beginAtZero: true,
    },
    y: {
      grid: { display: false },
    },
  },
};
</script>

<template>
  <main class="space-y-6">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p class="text-gray-500">
          Warehouse performance overview and key stock metrics
        </p>
      </div>
    </header>

    <section class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-5 shadow-sm h-80">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">
            Stock Transaction In-Out
          </h2>
          <span class="text-xs text-gray-400">Last 7 days</span>
        </div>
        <div class="h-64">
          <Bar :data="stockInOutData" :options="stockInOutOptions" />
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm h-80">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">Stock Balance</h2>
          <span class="text-xs text-gray-400">By category</span>
        </div>
        <div class="h-64">
          <Doughnut :data="stockBalanceData" :options="stockBalanceOptions" />
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm h-80">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">
            Daily Transaction
          </h2>
          <span class="text-xs text-gray-400">Last 7 days</span>
        </div>
        <div class="h-64">
          <Line
            :data="dailyTransactionData"
            :options="dailyTransactionOptions"
          />
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm h-80">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">
            Top 5 Product Fast Moving
          </h2>
          <span class="text-xs text-gray-400">By quantity moved</span>
        </div>
        <div class="h-64">
          <Bar :data="topProductData" :options="topProductOptions" />
        </div>
      </div>
    </section>
  </main>
</template>
