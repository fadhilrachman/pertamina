<script setup lang="ts">
import { computed, onBeforeMount, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { Bar, Doughnut } from "vue-chartjs";
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
import { useDashboardStore } from "~/store/dashboard/dashboard-store";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import {
  IconsCube,
  IconsDatabase,
  IconsWarehouse,
  IconsInfo,
} from "#components";

definePageMeta({
  auth: true,
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

const dashboardStore = useDashboardStore();
const facilitiesStore = useFacilitiesStore();
const { dataOverview, dataStockDistribution, dataTopMovingSku } =
  storeToRefs(dashboardStore);
const { data: dataFacilities } = storeToRefs(facilitiesStore);

const selectedFacilityId = ref<string | "">("");

onMounted(() => {
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
  const facility_id = selectedFacilityId.value || undefined;
  dashboardStore.getDataDashboardOverview({});
  dashboardStore.getDataDashboardStockDistribution({ facility_id });
  dashboardStore.getDataDashboardTopMovingSku({ facility_id });
});

watch(selectedFacilityId, (newVal) => {
  const facility_id = newVal || undefined;
  if (newVal == "") {
    dashboardStore.getDataDashboardOverview({});
  } else {
    dashboardStore.getDataDashboardOverview({ facility_id });
  }
  console.log(facility_id);
  dashboardStore.getDataDashboardStockDistribution({ facility_id });
  dashboardStore.getDataDashboardTopMovingSku({ facility_id });
});
// watch(
//   () => selectedFacilityId.value,
//   (next) => {
//     const facility_id = next || undefined;
//     dashboardStore.getDataDashboardOverview({ facility_id });
//     dashboardStore.getDataDashboardStockDistribution({ facility_id });
//     dashboardStore.getDataDashboardTopMovingSku({ facility_id });
//   }
// );

const facilitiesOptions = computed(
  () =>
    dataFacilities.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const stockInOutData = computed(() => {
  const throughput = dataOverview.value?.data?.throughput_overview;
  const inbound = throughput?.inbound_qty ?? 0;
  const outbound = throughput?.outbound_qty ?? 0;

  return {
    labels: ["Total"],
    datasets: [
      {
        label: "Stock In",
        backgroundColor: "#22c55e",
        borderColor: "#16a34a",
        borderWidth: 1,
        data: [inbound],
      },
      {
        label: "Stock Out",
        backgroundColor: "#ef4444",
        borderColor: "#b91c1c",
        borderWidth: 1,
        data: [outbound],
      },
    ],
  };
});

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

const stockBalanceData = computed(() => {
  const distribution = dataStockDistribution.value;
  const labels =
    distribution?.data?.warehouses?.map((item) => item.facility_name) || [];
  const quantities =
    distribution?.data?.warehouses?.map((item) => item.total_qty || 0) || [];

  const palette = ["#2563eb", "#22c55e", "#facc15", "#f97316", "#a855f7"];
  const colors =
    labels.length > 0
      ? labels.map((_, idx) => palette[idx % palette.length])
      : palette;

  return {
    labels: labels.length ? labels : ["No data"],
    datasets: [
      {
        label: "On-hand Quantity",
        data: labels.length ? quantities : [1],
        backgroundColor: colors.slice(0, labels.length || 1),
        borderWidth: 1,
      },
    ],
  };
});

const stockBalanceOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
};

const summaryCards = computed(() => {
  const overview = dataOverview.value.data;

  return [
    {
      title: "Total SKU",
      value: overview ? String(overview.total_skus ?? 0) : "-",
      icon: IconsCube,
      iconBgClass: "bg-blue-50",
      iconClass: "stroke-blue-600",
    },
    {
      title: "Total On-hand Quantity",
      value: overview ? String(overview.total_on_hand_quantity ?? 0) : "-",
      icon: IconsDatabase,
      iconBgClass: "bg-emerald-50",
      iconClass: "stroke-emerald-600",
    },
    {
      title: "Active Warehouses",
      value: overview ? String(overview.active_warehouses ?? 0) : "-",
      icon: IconsWarehouse,
      iconBgClass: "bg-amber-50",
      iconClass: "stroke-amber-600",
    },
    {
      title: "Low-stock Alerts",
      value: overview ? String(overview.low_stock_alerts ?? 0) : "-",
      icon: IconsInfo,
      iconBgClass: "bg-rose-50",
      iconClass: "stroke-rose-600",
    },
  ];
});

const topMovingSkus = computed(() => {
  const list = dataTopMovingSku.value.data || [];
  const sorted = [...list].sort(
    (a, b) => (b.net_movement ?? 0) - (a.net_movement ?? 0)
  );

  return sorted.slice(0, 5).map((item) => ({
    name: `${item.sku_code} - ${item.sku_name}`,
    qty: item.net_movement ?? 0,
  }));
});

const maxTopSkuQty = computed(() => {
  const items = topMovingSkus.value;
  if (!items.length) return 1;
  return Math.max(...items.map((item) => item.qty || 0)) || 1;
});
</script>

<template>
  <main class="space-y-6">
    <header class="flex items-end justify-between">
      <GeneralTitle
        class="space-y-1"
        title="Dashboard"
        subtitle="Overview of your inventory operations"
      />
      <div class="min-w-[240px] space-y-1">
        <label class="mb-1.5 text-sm font-[600] text-gray-700">
          Facilities
        </label>
        <GeneralDropdownSearch
          v-model="selectedFacilityId"
          :options="facilitiesOptions"
          placeholder="All Facilities"
        />
      </div>
    </header>

    <!-- Summary cards -->
    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="card in summaryCards"
        :key="card.title"
        class="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs font-medium text-gray-500">
              {{ card.title }}
            </p>
            <p class="mt-2 text-2xl font-semibold text-gray-900">
              {{ card.value }}
            </p>
          </div>
          <div
            class="h-10 w-10 rounded-xl flex items-center justify-center"
            :class="card.iconBgClass"
          >
            <component :is="card.icon" size="20" :class="card.iconClass" />
          </div>
        </div>
      </div>
    </section>

    <!-- Charts row -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">
            Throughput Overview
          </h2>
          <span class="text-xs text-gray-400">Last 3 days</span>
        </div>
        <div class="h-72">
          <Bar :data="stockInOutData" :options="stockInOutOptions" />
        </div>
        <div class="mt-4 flex items-center justify-center gap-6 text-xs">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500" />
            <span class="text-gray-600">Stock In</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-rose-500" />
            <span class="text-gray-600">Stock Out</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">
            Stock Distribution per Warehouse
          </h2>
          <span class="text-xs text-gray-400">Current allocation</span>
        </div>
        <div class="h-72 flex items-center justify-center">
          <Doughnut :data="stockBalanceData" :options="stockBalanceOptions" />
        </div>
      </div>
    </section>

    <!-- Top moving SKUs -->
    <section class="bg-white rounded-xl p-5 shadow-sm space-y-4">
      <div class="flex items-center">
        <h2 class="text-base font-semibold text-gray-900">Top Moving SKUs</h2>
        <!-- <span class="text-xs text-gray-400">Last 7 days</span> -->
      </div>

      <div class="space-y-3">
        <div
          v-for="(item, index) in topMovingSkus"
          :key="item.name"
          class="flex items-center gap-4"
        >
          <div
            class="flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-xs font-semibold text-blue-700"
          >
            {{ index + 1 }}
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between text-sm">
              <p class="font-semibold text-gray-900 truncate">
                {{ item.name }}
              </p>
              <p class="text-xs text-gray-500">{{ item.qty }} units</p>
            </div>
            <div
              class="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"
            >
              <div
                class="h-full rounded-full bg-blue-500"
                :style="{ width: `${(item.qty / maxTopSkuQty) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
