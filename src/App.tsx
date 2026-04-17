import "./App.css"
import { useEffect, useMemo, useState } from "react"
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { ensureGuestSession, supabase } from "./lib/supabase"
import type { Task, TaskPriority, TaskStatus } from "./types/task"

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
]

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [creating, setCreating] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("normal")
  const [dueDate, setDueDate] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )

  useEffect(() => {
    async function initializeApp() {
      try {
        setLoading(true)
        setErrorMessage("")

        const signedIn = await ensureGuestSession()

        if (!signedIn) {
          setErrorMessage("Guest sign-in is not enabled in Supabase.")
          return
        }

        await fetchTasks()
      } catch (error) {
        console.error("App initialization failed:", error)
        setErrorMessage("App failed to load.")
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tasks:", error.message)
      setErrorMessage(`Could not load tasks: ${error.message}`)
      return
    }

    setTasks((data ?? []) as Task[])
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setErrorMessage("Task title is required.")
      return
    }

    setCreating(true)
    setErrorMessage("")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setErrorMessage("Could not identify guest user.")
      setCreating(false)
      return
    }

    const newTask = {
      title: title.trim(),
      description: description.trim() || null,
      status: "todo" as TaskStatus,
      priority,
      due_date: dueDate || null,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert(newTask)
      .select()
      .single()

    if (error) {
      console.error("Error creating task:", error.message)
      setErrorMessage(`Could not create task: ${error.message}`)
      setCreating(false)
      return
    }

    setTasks((prev) => [data as Task, ...prev])
    setTitle("")
    setDescription("")
    setPriority("normal")
    setDueDate("")
    setCreating(false)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const taskId = String(active.id)
    const newStatus = String(over.id) as TaskStatus

    const existingTask = tasks.find((task) => task.id === taskId)
    if (!existingTask) return
    if (existingTask.status === newStatus) return

    const previousTasks = tasks

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId)

    if (error) {
      console.error("Error updating task status:", error.message)
      setErrorMessage(`Could not move task: ${error.message}`)
      setTasks(previousTasks)
    }
  }

  async function handleClearDoneTasks() {
    setErrorMessage("")

    const doneTasks = tasks.filter((task) => task.status === "done")
    if (doneTasks.length === 0) return

    const confirmed = window.confirm(
      `Delete ${doneTasks.length} completed task${doneTasks.length === 1 ? "" : "s"}?`
    )

    if (!confirmed) return

    const doneTaskIds = doneTasks.map((task) => task.id)
    const previousTasks = tasks

    setTasks((prev) => prev.filter((task) => task.status !== "done"))

    const { error } = await supabase
      .from("tasks")
      .delete()
      .in("id", doneTaskIds)

    if (error) {
      console.error("Error deleting done tasks:", error.message)
      setErrorMessage(`Could not delete done tasks: ${error.message}`)
      setTasks(previousTasks)
    }
  }

  const groupedTasks = useMemo(() => {
    return columns.reduce<Record<TaskStatus, Task[]>>(
      (acc, col) => {
        acc[col.id] = tasks.filter((task) => task.status === col.id)
        return acc
      },
      {
        todo: [],
        in_progress: [],
        in_review: [],
        done: [],
      }
    )
  }, [tasks])

  return (
    <div className="app-shell">
      <div className="app">
        <header className="header">
          <div>
            <h1>Board of Tasks</h1>
            <p>Plan out your work and be flexible</p>
          </div>

          <button
            type="button"
            className="clear-done-button"
            onClick={handleClearDoneTasks}
            disabled={!tasks.some((task) => task.status === "done")}
          >
            Clear Done
          </button>
        </header>

        <section className="composer-section">
          <form className="task-form" onSubmit={handleCreateTask}>
            <div className="task-form-top">
              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-title"
              />
            </div>

            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              rows={3}
            />

            <div className="task-form-row">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="input"
              >
                <option value="low">Low priority</option>
                <option value="normal">Normal priority</option>
                <option value="high">High priority</option>
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
              />

              <button type="submit" className="create-button" disabled={creating}>
                {creating ? "Creating..." : "Add Task"}
              </button>
            </div>
          </form>
        </section>

        {loading && <div className="status-message">Loading board...</div>}

        {!loading && errorMessage && (
          <div className="status-message error">{errorMessage}</div>
        )}

        {!loading && (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="board">
              {columns.map((col) => (
                <BoardColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  tasks={groupedTasks[col.id]}
                />
              ))}
            </div>
          </DndContext>
        )}
      </div>
    </div>
  )
}

type BoardColumnProps = {
  id: TaskStatus
  title: string
  tasks: Task[]
}

function BoardColumn({ id, title, tasks }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

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
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}

type TaskCardProps = {
  task: Task
}

function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.55 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? "task-card-dragging" : ""}`}
      {...listeners}
      {...attributes}
    >
      <h3>{task.title}</h3>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className={`priority priority-${task.priority}`}>
          {task.priority}
        </span>

        {task.due_date && <span className="due-date">{task.due_date}</span>}
      </div>
    </div>
  )
}

export default App