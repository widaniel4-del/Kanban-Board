import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
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

function isTaskOverdue(task: Task) {
  if (!task.due_date) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(task.due_date)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate < today
}

export default function TaskCard({
  task,
  onClick,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  }

  const overdue = isTaskOverdue(task)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? "task-card-dragging" : ""}`}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <h3>{task.title}</h3>

      <div className="task-meta">
        <span className={`priority priority-${task.priority}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>

        {task.due_date && (
          <span className={`due-date-pill ${overdue ? "overdue" : "due-soon"}`}>
            {overdue ? "Overdue" : "Due"}
          </span>
        )}
      </div>
    </div>
  )
}