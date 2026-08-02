import { api } from './client'

export const reportsApi = {
  getKpiMetrics: () => api.get('/reports/kpi'),
  getCoursePerformance: () => api.get('/reports/course-performance'),
  exportReport: () => api.get('/reports/export'),
}
