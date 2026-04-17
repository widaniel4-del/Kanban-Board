import { useDroppable } from "@dnd-kit/core"
import type {
  Label,
  Task,
  TaskAssignee,
  TaskLabel,
  TaskStatus,
  TeamMember,
} from "../types/task"
import TaskCard from "./TaskCard"

type BoardColumnProps = {
  id: TaskStatus
  title: string
  tasks: Task[]
  teamMembers: TeamMember[]
  labels: Label[]
  taskAssignees: TaskAssignee[]
  taskLabels: TaskLabel[]
  onSelectTask: (task: Task) => void
}

export default function BoardColumn({
  id,
  title,
  tasks,
  teamMembers,
  labels,
  taskAssignees,
  taskLabels,
  onSelectTask,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className={`column ${isOver ? "column-over" : ""}`}>
      <div className="column-header">
        <h2>{title}</h2>
        <span className="count">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">Drop a task here</div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              teamMembers={teamMembers}
              labels={labels}
              taskAssignees={taskAssignees}
              taskLabels={taskLabels}
              onClick={() => onSelectTask(task)}
            />
          ))}
        </div>
      )}
    </div>
  )
}