import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import type { Task, TaskStatus } from "../types/task"
import BoardColumn from "./Column"

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
]

type BoardProps = {
  tasksByStatus: Record<TaskStatus, Task[]>
  onDragEnd: (event: DragEndEvent) => void
}

export default function Board({ tasksByStatus, onDragEnd }: BoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="board">
        {columns.map((col) => (
          <BoardColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasksByStatus[col.id]}
          />
        ))}
      </div>
    </DndContext>
  )
}