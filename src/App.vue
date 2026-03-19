<script setup>
import { computed, ref } from 'vue'
import * as XLSX from 'xlsx'

const baseTemplates = [
  { id: 1, name: 'Отчет по участникам акции (постоянная акция)' },
  { id: 2, name: 'Отчет по дням проведения акции (постоянная акция)' },
  { id: 10, name: 'Отчет по регистрациям / пересечениям' },
  { id: 11, name: 'Отчет по контрольным метрикам акции' },
]

const templates = [
  ...baseTemplates,
  ...Array.from({ length: 20 }, (_, index) => index + 1)
    .filter((id) => !baseTemplates.some((item) => item.id === id))
    .map((id) => ({ id, name: `Шаблон ${id} (Для теста прокрутки содержимого)` })),
].sort((a, b) => a.id - b.id)

const baseCampaigns = [
  { id: 1, name: 'Москва 2030', startDate: '21.07.2025', endDate: '21.07.2025' },
  {
    id: 2,
    name: 'Сказочный поезд 2026',
    startDate: '24.11.2025',
    endDate: '14.01.2026',
  },
  {
    id: 10,
    name: 'Сказочный поезд 2026 окончание',
    startDate: '14.01.2026',
    endDate: '15.01.2026',
  },
  {
    id: 11,
    name: 'Москва 2030 окончание',
    startDate: '14.09.2025',
    endDate: '15.09.2025',
  },
]

const campaigns = [
  ...baseCampaigns,
  ...Array.from({ length: 20 }, (_, index) => index + 1)
    .filter((id) => !baseCampaigns.some((item) => item.id === id))
    .map((id) => {
      const day = String((id % 28) + 1).padStart(2, '0')
      const month = String((id % 12) + 1).padStart(2, '0')
      const nextDay = String(((id + 3) % 28) + 1).padStart(2, '0')

      return {
        id,
        name: `Акция ${id} (Для теста прокрутки содержимого)`,
        startDate: `${day}.${month}.2026`,
        endDate: `${nextDay}.${month}.2026`,
      }
    }),
].sort((a, b) => a.id - b.id)

const selectedTemplateId = ref(null)
const selectedCampaignId = ref(null)
const isExporting = ref(false)

const templateSearch = ref('')
const campaignSearch = ref('')

const selectedTemplate = computed(() =>
  templates.find((item) => item.id === selectedTemplateId.value),
)

const selectedCampaign = computed(() =>
  campaigns.find((item) => item.id === selectedCampaignId.value),
)

const filteredTemplates = computed(() => {
  const query = templateSearch.value.trim().toLowerCase()
  if (!query) return templates

  return templates.filter((item) => {
    return String(item.id).includes(query) || item.name.toLowerCase().includes(query)
  })
})

const filteredCampaigns = computed(() => {
  const query = campaignSearch.value.trim().toLowerCase()
  if (!query) return campaigns

  return campaigns.filter((item) => {
    return (
      String(item.id).includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.startDate.includes(query) ||
      item.endDate.includes(query)
    )
  })
})

const canExport = computed(() => Boolean(selectedTemplate.value && selectedCampaign.value))
const isExportDisabled = computed(() => !canExport.value || isExporting.value)

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function exportXlsx() {
  if (!canExport.value || isExporting.value) return

  isExporting.value = true
  try {
    const now = new Date()
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(now.getDate()).padStart(2, '0')}`

    const reportData = [
      {
        'ID шаблона': selectedTemplate.value.id,
        Шаблон: selectedTemplate.value.name,
        'ID акции': selectedCampaign.value.id,
        Акция: selectedCampaign.value.name,
        'Дата начала': selectedCampaign.value.startDate,
        'Дата окончания': selectedCampaign.value.endDate,
        'Дата выгрузки': ts,
      },
    ]

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(reportData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчет')

    const fileName = `report_template-${selectedTemplate.value.id}_campaign-${selectedCampaign.value.id}_${ts}.xlsx`
    await wait(1000)
    XLSX.writeFile(workbook, fileName)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <v-app>
    <div class="layout-shell">
      <aside class="left-block" />
      <header class="top-block" />

      <main class="content-wrap">
        <div class="content-inner">
          <div class="breadcrumbs-row">
            <v-icon size="16" color="grey-darken-1" icon="mdi-chart-bar" />
            <span class="breadcrumbs-label">Сводная аналитика</span>
          </div>

          <div class="work-grid">
            <aside class="analytics-menu">
              <div class="menu-logo" aria-hidden="true">
                <span class="dot dot-1" />
                <span class="dot dot-2" />
                <span class="dot dot-3" />
                <span class="dot dot-4" />
                <span class="dot dot-5" />
                <span class="dot dot-6" />
                <span class="dot dot-7" />
                <span class="dot dot-8" />
              </div>

              <nav class="menu-list">
                <a class="menu-item" href="#">РЕГИСТРАЦИИ / ПЕРЕСЕЧЕНИЕ</a>
                <a class="menu-item" href="#">ДЕЙСТВИЯ</a>
                <a class="menu-item" href="#">ГОРОДСКИЕ БАЛЛЫ</a>
                <a class="menu-item" href="#">МОНИТОР КОНТРОЛЯ МЕТРИК</a>
                <a class="menu-item" href="#">ПОКАЗАТЕЛИ ДАШБОРД</a>
                <a class="menu-item" href="#">ЖУРНАЛ АКТИВНОСТЕЙ</a>
                <a class="menu-item active" href="#">ОТЧЁТЫ ПО АКЦИЯМ</a>
                <a class="menu-item" href="#">СПЕЦОТЧЕТ</a>
              </nav>
            </aside>

          <section class="report-pane">
            <div class="report-grid">
              <div class="export-bar">
                <div class="export-grid">
                  <v-text-field
                    :model-value="selectedTemplate?.name || 'Шаблон не выбран'"
                    label="Шаблон"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-file-document-outline"
                    readonly
                    hide-details
                  />
                  <v-text-field
                    :model-value="selectedCampaign?.name || 'Акция не выбрана'"
                    label="Акция"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-bullhorn-outline"
                    readonly
                    hide-details
                  />
                  <v-btn
                    color="secondary"
                    size="large"
                    append-icon="mdi-file-excel"
                    :disabled="isExportDisabled"
                    :loading="isExporting"
                    @click="exportXlsx"
                  >
                    Экспорт в XLSX
                  </v-btn>
                </div>
              </div>

              <v-card class="panel-card section-card" variant="flat" rounded="lg">
                <v-card-text class="section-content">
                  <div class="section-title">Шаблон отчета</div>
                  <v-text-field
                    v-model="templateSearch"
                    density="comfortable"
                    variant="outlined"
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Поиск по шаблонам"
                    hide-details
                    class="mb-4"
                  />
                  <div class="table-wrap">
                    <v-table density="comfortable" fixed-header height="360">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Наименование шаблона</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in filteredTemplates"
                          :key="item.id"
                          class="clickable-row"
                          :class="{ 'selected-row': selectedTemplateId === item.id }"
                          @click="selectedTemplateId = item.id"
                        >
                          <td>{{ item.id }}</td>
                          <td>{{ item.name }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>
                </v-card-text>
              </v-card>

              <v-card class="panel-card section-card" variant="flat" rounded="lg">
                <v-card-text class="section-content">
                  <div class="section-title">Акция</div>
                  <v-text-field
                    v-model="campaignSearch"
                    density="comfortable"
                    variant="outlined"
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Поиск по акциям"
                    hide-details
                    class="mb-4"
                  />
                  <div class="table-wrap">
                    <v-table density="comfortable" fixed-header height="360">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Наименование</th>
                          <th>Дата начала</th>
                          <th>Дата окончания</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in filteredCampaigns"
                          :key="item.id"
                          class="clickable-row"
                          :class="{ 'selected-row': selectedCampaignId === item.id }"
                          @click="selectedCampaignId = item.id"
                        >
                          <td>{{ item.id }}</td>
                          <td>{{ item.name }}</td>
                          <td>{{ item.startDate }}</td>
                          <td>{{ item.endDate }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </section>
          </div>
        </div>
      </main>
    </div>
  </v-app>
</template>
