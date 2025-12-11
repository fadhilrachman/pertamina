<script setup lang="ts">
import {
  computed,
  onBeforeMount,
  onMounted,
  ref,
  watch,
} from "vue";
import { storeToRefs } from "pinia";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import moment from "moment";
import { usePageStore } from "~/store/page";
import { useSuperadminDashboardStore } from "~/store/superadmin/dashboard-store";
import { useSuperadminCompanyStore } from "~/store/superadmin/company-store";
import type { CompanyType } from "~/types/company-type";
import {
  IconsBuilding,
  IconsDashboard,
  IconsTransactions,
  IconsUser,
} from "#components";

definePageMeta({
  auth: true,
});

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const $page = usePageStore();
onBeforeMount(() => {
  $page.setTitle("Superadmin Dashboard");
});

const dashboardStore = useSuperadminDashboardStore();
const companyStore = useSuperadminCompanyStore();

const { dataDashboard, loadingDashboard } = storeToRefs(dashboardStore);
const { data: companyData } = storeToRefs(companyStore);

const selectedCompanyId = ref<string | "">("");
const dateFrom = ref<string>(
  moment().subtract(6, "days").format("YYYY-MM-DD")
);
const dateTo = ref<string>(moment().format("YYYY-MM-DD"));

const companyOptions = computed(
  () =>
    companyData.value?.data?.data?.map((item: CompanyType) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const fetchDashboard = () => {
  dashboardStore.getDashboard({
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
    company_id: selectedCompanyId.value || undefined,
  });
};

onMounted(() => {
  companyStore.getDataCompanies({ page: 1, limit: 1000, search: "" });
  fetchDashboard();
});

watch([selectedCompanyId, dateFrom, dateTo], () => {
  fetchDashboard();
});

const summaryCards = computed(() => {
  const overview = dataDashboard.value.data;

  return [
    {
      title: "Total Companies",
      value: overview ? String(overview.total_companies ?? 0) : "-",
      icon: IconsBuilding,
      iconBgClass: "bg-blue-50",
      iconClass: "stroke-blue-600",
    },
    {
      title: "Total Users",
      value: overview ? String(overview.total_users ?? 0) : "-",
      icon: IconsUser,
      iconBgClass: "bg-emerald-50",
      iconClass: "stroke-emerald-600",
    },
  ];
});

const dailyChartData = computed(() => {
  const overview = dataDashboard.value.data;
  const rows = overview?.daily_transactions ?? [];

  if (!rows.length) {
    return {
      labels: [] as string[],
      datasets: [] as any[],
    };
  }

  const dates = Array.from(new Set(rows.map((r) => r.date))).sort();
  const labels = dates.map((d) =>
    moment(d).isValid() ? moment(d).format("DD MMM YYYY") : d
  );
  const companies = Array.from(
    new Set(rows.map((r) => r.company_name || "Unknown"))
  );

  const palette = ["#2563eb", "#22c55e", "#f97316", "#a855f7", "#e11d48"];

  const datasets = companies.map((company, idx) => {
    const color = palette[idx % palette.length];
    return {
      label: company,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      data: dates.map((d) => {
        const found = rows.find(
          (r) => (r.company_name || "Unknown") === company && r.date === d
        );
        return found?.count ?? 0;
      }),
    };
  });

  return {
    labels,
    datasets,
  };
});

const dailyChartOptions = {
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

const companyTransactions = computed(
  () => dataDashboard.value.data?.company_transactions || []
);
</script>

<template>
  <main class="space-y-6">
    <header class="flex items-end justify-between">
      <GeneralTitle
        class="space-y-1"
        title="Superadmin Dashboard"
        subtitle="System-wide overview across all companies"
      />
      <div class="flex gap-4 items-end">
        <div class="min-w-[220px] space-y-1">
          <label class="mb-1.5 text-sm font-[600] text-gray-700">
            Company
          </label>
          <GeneralDropdownSearch
            v-model="selectedCompanyId"
            :options="companyOptions"
            placeholder="All Companies"
          />
        </div>
        <div class="space-y-1">
          <label class="mb-1.5 text-sm font-[600] text-gray-700">
            Date From
          </label>
          <input
            v-model="dateFrom"
            type="date"
            class="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div class="space-y-1">
          <label class="mb-1.5 text-sm font-[600] text-gray-700">
            Date To
          </label>
          <input
            v-model="dateTo"
            type="date"
            class="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
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
            class="flex h-10 w-10 items-center justify-center rounded-full"
            :class="card.iconBgClass"
          >
            <component
              :is="card.icon"
              size="20"
              class="stroke-[1.5]"
              :class="card.iconClass"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Charts & tables -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
      <!-- Daily transactions -->
      <div
        class="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <IconsTransactions size="18" class="stroke-blue-600" />
            <h2 class="text-sm font-semibold text-gray-900">
              Daily Transactions
            </h2>
          </div>
          <p class="text-xs text-gray-500">
            Grouped by company and date
          </p>
        </div>

        <div class="h-64">
          <Bar
            v-if="dailyChartData.labels.length"
            :data="dailyChartData"
            :options="dailyChartOptions"
          />
          <div
            v-else
            class="flex h-full items-center justify-center text-sm text-gray-500"
          >
            No transaction data for selected filters
          </div>
        </div>
      </div>

      <!-- Transactions by company -->
      <div
        class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <IconsDashboard size="18" class="stroke-emerald-600" />
            <h2 class="text-sm font-semibold text-gray-900">
              Transactions by Company
            </h2>
          </div>
        </div>

        <div class="overflow-auto">
          <table class="min-w-full text-xs text-left text-gray-600">
            <thead>
              <tr class="border-b border-gray-100 text-[11px] uppercase">
                <th class="px-2 py-2 font-semibold text-gray-500">
                  Company
                </th>
                <th class="px-2 py-2 font-semibold text-gray-500">
                  In (Count)
                </th>
                <th class="px-2 py-2 font-semibold text-gray-500">
                  In (Qty)
                </th>
                <th class="px-2 py-2 font-semibold text-gray-500">
                  Out (Count)
                </th>
                <th class="px-2 py-2 font-semibold text-gray-500">
                  Out (Qty)
                </th>
                <th class="px-2 py-2 font-semibold text-gray-500">
                  Adjust (Count)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in companyTransactions"
                :key="row.company_id"
                class="border-b border-gray-50 last:border-0"
              >
                <td class="px-2 py-1.5 font-medium text-gray-800">
                  {{ row.company_name }}
                </td>
                <td class="px-2 py-1.5">
                  {{ row.total_in ?? 0 }}
                </td>
                <td class="px-2 py-1.5">
                  {{ row.total_in_qty ?? 0 }}
                </td>
                <td class="px-2 py-1.5">
                  {{ row.total_out ?? 0 }}
                </td>
                <td class="px-2 py-1.5">
                  {{ row.total_out_qty ?? 0 }}
                </td>
                <td class="px-2 py-1.5">
                  {{ row.total_adjust ?? 0 }}
                </td>
              </tr>
              <tr v-if="!companyTransactions.length">
                <td
                  colspan="6"
                  class="px-2 py-4 text-center text-xs text-gray-500"
                >
                  No company transaction summary for selected filters
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
</template>
