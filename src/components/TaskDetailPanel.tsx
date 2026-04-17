import { useMemo, useState } from "react"
import type {
  ActivityLog,
  Comment,
  Label,
  Task,
  TaskAssignee,
  TaskLabel,
  TeamMember,
} from "../types/task"

type TaskDetailPanelProps = {
  task: Task | null
  comments: Comment[]
  activityLogs: ActivityLog[]
  teamMembers: TeamMember[]
  labels: Label[]
  taskAssignees: TaskAssignee[]
  taskLabels: TaskLabel[]
  onClose: () => void
  onAddComment: (taskId: string, body: string) => Promise<void>
  onAssignMember: (taskId: string, memberId: string) => Promise<void>
  onAssignLabel: (taskId: string, labelId: string) => Promise<void>
}

export default function TaskDetailPanel({
  task,
  comments,
  activityLogs,
  teamMembers,
  labels,
  taskAssignees,
  taskLabels,
  onClose,
  onAddComment,
  onAssignMember,
  onAssignLabel,
}: TaskDetailPanelProps) {
  const [commentBody, setCommentBody] = useState("")
  const [selectedMember, setSelectedMember] = useState("all")
  const [selectedLabel, setSelectedLabel] = useState("all")

  const taskComments = useMemo(
    () => comments.filter((comment) => comment.task_id === task?.id),
    [comments, task]
  )

  const taskActivity = useMemo(
    () => activityLogs.filter((item) => item.task_id === task?.id),
    [activityLogs, task]
  )

  const currentMemberIds = useMemo(
    () =>
      taskAssignees
        .filter((item) => item.task_id === task?.id)
        .map((item) => item.member_id),
    [taskAssignees, task]
  )

  const currentLabelIds = useMemo(
    () =>
      taskLabels
        .filter((item) => item.task_id === task?.id)
        .map((item) => item.label_id),
    [taskLabels, task]
  )

  const currentMembers = teamMembers.filter((m) => currentMemberIds.includes(m.id))
  const currentLabels = labels.filter((l) => currentLabelIds.includes(l.id))

  if (!task) return null

  return (
    <aside className="task-detail-panel">
      <div className="task-detail-header">
        <div>
          <h2>{task.title}</h2>
          <p>{task.description || "No description added yet."}</p>
        </div>
        <button className="secondary-button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="detail-section">
        <h3>Assignees</h3>
        <div className="chip-list">
          {currentMembers.map((member) => (
            <div key={member.id} className="member-chip">
              <span
                className="assignee-avatar"
                style={{ backgroundColor: member.color }}
              >
                {member.name.charAt(0).toUpperCase()}
              </span>
              <span>{member.name}</span>
            </div>
          ))}
        </div>

        <div className="detail-row">
          <select
            className="input"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
          >
            <option value="all">Assign team member</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>

          <button
            className="secondary-button"
            onClick={async () => {
              if (selectedMember !== "all") {
                await onAssignMember(task.id, selectedMember)
                setSelectedMember("all")
              }
            }}
          >
            Assign
          </button>
        </div>
      </div>

      <div className="detail-section">
        <h3>Labels</h3>
        <div className="chip-list">
          {currentLabels.map((label) => (
            <span
              key={label.id}
              className="task-label"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>

        <div className="detail-row">
          <select
            className="input"
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
          >
            <option value="all">Add label</option>
            {labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>

          <button
            className="secondary-button"
            onClick={async () => {
              if (selectedLabel !== "all") {
                await onAssignLabel(task.id, selectedLabel)
                setSelectedLabel("all")
              }
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="detail-section">
        <h3>Comments</h3>

        <div className="comment-list">
          {taskComments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <p>{comment.body}</p>
              <small>{new Date(comment.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>

        <form
          className="detail-form"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!commentBody.trim()) return
            await onAddComment(task.id, commentBody)
            setCommentBody("")
          }}
        >
          <textarea
            className="textarea"
            placeholder="Write a comment"
            rows={3}
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
          />
          <button className="create-button" type="submit">
            Add Comment
          </button>
        </form>
      </div>

      <div className="detail-section">
        <h3>Activity</h3>

        <div className="activity-list">
          {taskActivity.map((item) => (
            <div key={item.id} className="activity-item">
              <p>{item.details || item.action}</p>
              <small>{new Date(item.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}