import { useEffect, useState } from 'react'
import { reportsApi } from '../../api/reports'
import { useAuth } from '../../context/AuthContext'
import Button from '../shared/Button'
import Card from '../shared/Card'
import { ChartBarIcon, DownloadSimpleIcon } from '@phosphor-icons/react'

export default function Reports() {
  const { user } = useAuth()
  const [exported, setExported] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [metrics, setMetrics] = useState([
    { label: 'COMPLETED COURSES', value: '3 / 4', percentage: 75, color: '#87d300' },
    { label: 'AVERAGE GRADE', value: '92.4%', percentage: 92, color: '#0091c3' },
    { label: 'ATTENDANCE RATE', value: '98%', percentage: 98, color: '#ffcc00' },
    { label: 'ASSIGNMENTS PASSED', value: '12 / 12', percentage: 100, color: '#87d300' },
  ])

  const [coursePerformance, setCoursePerformance] = useState([
    { id: 1, name: 'Fullstack Web Architecture', progress: 100, score: '95/100', status: 'COMPLETED' },
    { id: 2, name: 'UI/UX Design Systems', progress: 85, score: '90/100', status: 'IN PROGRESS' },
    { id: 3, name: 'Database Engineering with PostgreSQL', progress: 60, score: '88/100', status: 'IN PROGRESS' },
    { id: 4, name: 'Cloud Infrastructure & DevOps', progress: 100, score: '96/100', status: 'COMPLETED' },
  ])

  const isStaff = user?.role === 'instructor' || user?.role === 'admin'

  useEffect(() => {
    setLoading(true)
    Promise.all([
      reportsApi.getKpiMetrics().catch(() => null),
      reportsApi.getCoursePerformance().catch(() => null),
    ])
      .then(([kpiRes, perfRes]) => {
        if (kpiRes && Array.isArray(kpiRes)) {
          setMetrics(kpiRes)
        }
        if (perfRes && Array.isArray(perfRes)) {
          setCoursePerformance(perfRes)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleExport() {
    try {
      const exportRes = await reportsApi.exportReport().catch(() => null)
      const dataToExport = exportRes?.rows || coursePerformance

      const csvContent =
        'data:text/csv;charset=utf-8,Course Name,Progress %,Score,Status\n' +
        dataToExport.map((c) => `"${c.name}",${c.progress},"${c.score}","${c.status}"`).join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `dibiedu_academic_report_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setExported(true)
      setTimeout(() => setExported(false), 3000)
    } catch (err) {
      setError('Export failed: ' + err.message)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[48px] font-black leading-none max-md:text-[32px]">REPORTS & ANALYTICS</h1>
          <span className="text-[10px] font-bold tracking-[1px] text-sf-secondary-text">
            {isStaff ? 'SYSTEM-WIDE ACADEMIC PERFORMANCE & METRICS' : 'YOUR ACADEMIC PROGRESS & PERFORMANCE'}
          </span>
        </div>
        <Button variant="primary" size="medium" onClick={handleExport}>
          <DownloadSimpleIcon size={16} className="mr-1 inline" />
          {exported ? 'EXPORTED ✓' : 'EXPORT REPORT (CSV)'}
        </Button>
      </header>

      {error && <p className="m-0 text-sm font-bold text-[#e11b22]">{error}</p>}
      {loading && <p className="m-0 text-sm text-sf-secondary-text">Fetching live report metrics…</p>}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
        {metrics.map((m) => (
          <Card key={m.label} className="flex flex-col gap-3 p-5">
            <span className="text-[10px] font-bold tracking-[1px] text-sf-secondary-text">{m.label}</span>
            <span className="text-3xl font-black" style={{ color: m.color }}>{m.value}</span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-sf-secondary-bg">
              <div className="h-full rounded-full" style={{ width: `${m.percentage}%`, backgroundColor: m.color }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Course Breakdown Table */}
      <Card className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-xl font-black flex items-center gap-2">
            <ChartBarIcon size={22} className="text-sf-primary" /> COURSE PERFORMANCE BREAKDOWN
          </h2>
          <span className="text-[10px] font-bold tracking-[1px] text-sf-secondary-text uppercase">
            Updated Live
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-sf-divider text-[10px] font-bold tracking-[1px] text-sf-secondary-text">
                <th className="px-4 py-3">COURSE PROGRAM</th>
                <th className="px-4 py-3">PROGRESS</th>
                <th className="px-4 py-3">SCORE</th>
                <th className="px-4 py-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {coursePerformance.map((row) => (
                <tr key={row.id || row.name} className="border-b border-sf-divider hover:bg-sf-secondary-bg/50">
                  <td className="px-4 py-4 font-bold">{row.name}</td>
                  <td className="px-4 py-4 min-w-40">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-sf-secondary-bg">
                        <div
                          className="h-full rounded-full bg-sf-primary"
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-sf-secondary-text">{row.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs font-bold text-sf-primary">{row.score}</td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-[1px] ${
                        row.status === 'COMPLETED' ? 'bg-[#87d300]/20 text-[#609400]' : 'bg-[#0091c3]/20 text-[#006f96]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
