import { useDroppable } from "@dnd-kit/core"
import type { Task, TaskStatus } from "../types/task"
import TaskCard from "./TaskCard"

type ColumnProps = {
  id: TaskStatus
  title: string
  tasks: Task[]
}

export default function Column({ id, title, tasks }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className={`column ${isOver ? "column-over" : ""}`}>
      <div className="column-header">
        <h2>{title}</h2>
        <span className="count">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          No tasks yet — create your first task 🚀
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}