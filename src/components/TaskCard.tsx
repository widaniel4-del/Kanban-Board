import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import {
  differenceInCalendarDays,
  isBefore,
  startOfDay,
  format,
} from "date-fns"
import type {
  Label,
  Task,
  TaskAssignee,
  TaskLabel,
  TeamMember,
} from "../types/task"

type TaskCardProps = {
  task: Task
  teamMembers: TeamMember[]
  labels: Label[]
  taskAssignees: TaskAssignee[]
  taskLabels: TaskLabel[]
  onClick: () => void
}

function getDueState(dueDate?: string | null) {
  if (!dueDate) return "none"

  const today = startOfDay(new Date())
  const due = startOfDay(new Date(dueDate))
  const diff = differenceInCalendarDays(due, today)

  if (isBefore(due, today)) return "overdue"
  if (diff <= 2) return "soon"
  return "normal"
}

export default function TaskCard({
  task,
  teamMembers,
  labels,
  taskAssignees,
  taskLabels,
  onClick,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.55 : 1,
  }

  const taskMemberIds = taskAssignees
    .filter((item) => item.task_id === task.id)
    .map((item) => item.member_id)

  const taskMembers = teamMembers.filter((member) =>
    taskMemberIds.includes(member.id)
  )

  const taskLabelIds = taskLabels
    .filter((item) => item.task_id === task.id)
    .map((item) => item.label_id)

  const taskCardLabels = labels.filter((label) => taskLabelIds.includes(label.id))

  const dueState = getDueState(task.due_date)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? "task-card-dragging" : ""}`}
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
      <h3>{task.title}</h3>

      {task.description && <p className="task-description">{task.description}</p>}

      {taskCardLabels.length > 0 && (
        <div className="label-row">
          {taskCardLabels.map((label) => (
            <span
              key={label.id}
              className="task-label"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="task-meta">
        <span className={`priority priority-${task.priority}`}>
          {task.priority}
        </span>

        {task.due_date && (
          <span className={`due-badge due-${dueState}`}>
            {dueState === "overdue"
              ? "Overdue"
              : dueState === "soon"
                ? "Due Soon"
                : format(new Date(task.due_date), "MMM d")}
          </span>
        )}
      </div>

      {taskMembers.length > 0 && (
        <div className="assignee-row">
          {taskMembers.map((member) => (
            <div
              key={member.id}
              className="assignee-avatar"
              style={{ backgroundColor: member.color }}
              title={member.name}
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}