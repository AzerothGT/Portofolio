import { useEffect, useState } from 'react'
import { assignmentsApi } from '../../api/assignments'
import { useAuth } from '../../context/AuthContext'
import Button from '../shared/Button'
import Card from '../shared/Card'
import Modal from '../shared/Modal'
import TextField from '../shared/TextField'
import { CheckCircleIcon, ClockIcon, PlusIcon } from '@phosphor-icons/react'

export default function Assignments() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modals state
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  // Forms
  const [submissionText, setSubmissionText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [createForm, setCreateForm] = useState({
    title: '',
    course_title: '',
    due_date: '',
    max_points: 100,
    instructions: '',
  })
  const [creating, setCreating] = useState(false)

  function load() {
    setLoading(true)
    assignmentsApi
      .list()
      .then((data) => setAssignments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedAssignment) return
    setSubmitting(true)
    try {
      await assignmentsApi.submit(selectedAssignment.id, { content: submissionText })
      setShowSubmitModal(false)
      setSubmissionText('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    try {
      await assignmentsApi.create(createForm)
      setShowCreateModal(false)
      setCreateForm({ title: '', course_title: '', due_date: '', max_points: 100, instructions: '' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const isStaff = user?.role === 'instructor' || user?.role === 'admin'

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[48px] font-black leading-none max-md:text-[32px]">ASSIGNMENTS</h1>
          <span className="text-[10px] font-bold tracking-[1px] text-sf-secondary-text">
            ACADEMIC COURSEWORK & SUBMISSIONS
          </span>
        </div>
        {isStaff && (
          <Button variant="primary" size="medium" onClick={() => setShowCreateModal(true)}>
            <PlusIcon size={16} className="mr-1 inline" /> CREATE ASSIGNMENT
          </Button>
        )}
      </header>

      {error && <p className="m-0 text-sm font-bold text-[#e11b22]">{error}</p>}
      {loading && <p className="m-0 text-sm text-sf-secondary-text">Loading coursework…</p>}

      {!loading && assignments.length === 0 && (
        <p className="m-0 text-sm text-sf-secondary-text">No assignments found.</p>
      )}

      {!loading && assignments.length > 0 && (
        <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          {assignments.map((item) => {
            const isDone = item.status === 'SUBMITTED' || item.status === 'GRADED'
            return (
              <Card
                key={item.id}
                onClick={() => {
                  setSelectedAssignment(item)
                  setSubmissionText(item.submission || '')
                  setShowSubmitModal(true)
                }}
                className="flex flex-col justify-between gap-4 p-6 cursor-pointer hover:border-sf-primary transition"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[1px] text-sf-primary">
                      {item.course_title || 'General Course'}
                    </span>
                    <span
                      className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold tracking-[1px] ${
                        isDone ? 'bg-[#87d300]/20 text-[#609400]' : 'bg-[#ffcc00]/20 text-[#a38200]'
                      }`}
                    >
                      {isDone ? <CheckCircleIcon size={14} /> : <ClockIcon size={14} />}
                      {item.status}
                    </span>
                  </div>

                  <h3 className="m-0 text-lg font-black">{item.title}</h3>
                  <p className="m-0 text-xs text-sf-secondary-text leading-relaxed">{item.instructions}</p>
                </div>

                <div className="flex items-center justify-between border-t border-sf-divider pt-4 text-xs">
                  <div className="flex items-center gap-4 text-sf-secondary-text">
                    <span>Due: <strong>{item.due_date}</strong></span>
                    <span>Max: <strong>{item.max_points} PTS</strong></span>
                    {item.grade != null && (
                      <span className="font-black text-sf-primary">Grade: {item.grade}/{item.max_points}</span>
                    )}
                  </div>

                  {!isStaff && (
                    <Button
                      variant={isDone ? 'ghost' : 'primary'}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedAssignment(item)
                        setSubmissionText(item.submission || '')
                        setShowSubmitModal(true)
                      }}
                    >
                      {isDone ? 'VIEW SUBMISSION' : 'SUBMIT WORK'}
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Submit Assignment Modal */}
      <Modal open={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="SUBMIT ASSIGNMENT">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="m-0 text-xs font-bold text-sf-secondary-text">{selectedAssignment?.title}</p>
          <TextField
            label="SUBMISSION WORK / LINK / CONTENT"
            as="textarea"
            placeholder="Paste your assignment repository link, Google Docs link, or written answer here..."
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="medium" type="button" onClick={() => setShowSubmitModal(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="medium" type="submit" disabled={submitting}>
              {submitting ? 'SUBMITTING...' : 'CONFIRM SUBMISSION'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Assignment Modal (Staff) */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="CREATE ASSIGNMENT">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <TextField
            label="ASSIGNMENT TITLE"
            placeholder="e.g. Final Project Prototype"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            required
          />
          <TextField
            label="COURSE TITLE"
            placeholder="e.g. Fullstack Web Development"
            value={createForm.course_title}
            onChange={(e) => setCreateForm({ ...createForm, course_title: e.target.value })}
            required
          />
          <div className="flex gap-4">
            <TextField
              label="DUE DATE"
              type="date"
              className="flex-1"
              value={createForm.due_date}
              onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
              required
            />
            <TextField
              label="MAX POINTS"
              type="number"
              className="w-32"
              value={createForm.max_points}
              onChange={(e) => setCreateForm({ ...createForm, max_points: Number(e.target.value) })}
            />
          </div>
          <TextField
            label="INSTRUCTIONS"
            as="textarea"
            placeholder="Detailed submission guidelines and criteria..."
            value={createForm.instructions}
            onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="medium" type="button" onClick={() => setShowCreateModal(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="medium" type="submit" disabled={creating}>
              {creating ? 'CREATING...' : 'PUBLISH ASSIGNMENT'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
