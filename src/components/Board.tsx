import type {
  Label,
  Task,
  TaskAssignee,
  TaskLabel,
  TaskStatus,
  TeamMember,
} from "../types/task"
import BoardColumn from "./Column"

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
]

type BoardProps = {
  tasks: Task[]
  teamMembers: TeamMember[]
  labels: Label[]
  taskAssignees: TaskAssignee[]
  taskLabels: TaskLabel[]
  onSelectTask: (task: Task) => void
}

export default function Board({
  tasks,
  teamMembers,
  labels,
  taskAssignees,
  taskLabels,
  onSelectTask,
}: BoardProps) {
  return (
    <div className="board">
      {columns.map((col) => (
        <BoardColumn
          key={col.id}
          id={col.id}
          title={col.title}
          tasks={tasks.filter((task) => task.status === col.id)}
          teamMembers={teamMembers}
          labels={labels}
          taskAssignees={taskAssignees}
          taskLabels={taskLabels}
          onSelectTask={onSelectTask}
        />
      ))}
    </div>
  )
}