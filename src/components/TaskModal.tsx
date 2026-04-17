import { useState } from "react"
import type { TaskPriority, TaskStatus } from "../types/task"

type TaskModalProps = {
  open: boolean
  onClose: () => void
  onCreate: (values: {
    title: string
    description: string
    priority: TaskPriority
    due_date: string
    status: TaskStatus
  }) => Promise<void>
}

export default function TaskModal({ open, onClose, onCreate }: TaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("normal")
  const [dueDate, setDueDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)

    await onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate,
      status: "todo",
    })

    setSubmitting(false)
    setTitle("")
    setDescription("")
    setPriority("normal")
    setDueDate("")
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Create task</h2>
            <p>Add a task to your board</p>
          </div>
          <button className="modal-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            className="input input-title"
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="textarea"
            placeholder="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="task-form-row">
            <select
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="low">Low priority</option>
              <option value="normal">Normal priority</option>
              <option value="high">High priority</option>
            </select>

            <input
              className="input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="create-button" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}