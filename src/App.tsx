import "./App.css"
import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { ensureGuestSession, supabase } from "./lib/supabase"
import type {
  ActivityLog,
  Comment,
  Label,
  Task,
  TaskAssignee,
  TaskLabel,
  TaskPriority,
  TaskStatus,
  TeamMember,
} from "./types/task"
import BoardSummary from "./components/BoardSummary"
import FilterBar from "./components/FilterBar"
import TeamPanel from "./components/TeamPanel"
import TaskDetailPanel from "./components/TaskDetailPanel"
import BoardColumn from "./components/Column"

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
]

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [taskAssignees, setTaskAssignees] = useState<TaskAssignee[]>([])
  const [taskLabels, setTaskLabels] = useState<TaskLabel[]>([])

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("normal")
  const [dueDate, setDueDate] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [labelFilter, setLabelFilter] = useState("all")

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

        await fetchBoardData()
      } catch (error) {
        console.error(error)
        setErrorMessage("App failed to load.")
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  async function fetchBoardData() {
    const [
      tasksRes,
      membersRes,
      commentsRes,
      activityRes,
      labelsRes,
      assigneesRes,
      taskLabelsRes,
    ] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase.from("comments").select("*").order("created_at", { ascending: true }),
      supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("labels").select("*").order("created_at", { ascending: true }),
      supabase.from("task_assignees").select("*"),
      supabase.from("task_labels").select("*"),
    ])

    if (
      tasksRes.error ||
      membersRes.error ||
      commentsRes.error ||
      activityRes.error ||
      labelsRes.error ||
      assigneesRes.error ||
      taskLabelsRes.error
    ) {
      throw new Error("Failed to load board data.")
    }

    setTasks((tasksRes.data ?? []) as Task[])
    setTeamMembers((membersRes.data ?? []) as TeamMember[])
    setComments((commentsRes.data ?? []) as Comment[])
    setActivityLogs((activityRes.data ?? []) as ActivityLog[])
    setLabels((labelsRes.data ?? []) as Label[])
    setTaskAssignees((assigneesRes.data ?? []) as TaskAssignee[])
    setTaskLabels((taskLabelsRes.data ?? []) as TaskLabel[])
  }

  async function logActivity(taskId: string, action: string, details: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("activity_logs")
      .insert({
        task_id: taskId,
        action,
        details,
        user_id: user.id,
      })
      .select()
      .single()

    if (!error && data) {
      setActivityLogs((prev) => [data as ActivityLog, ...prev])
    }
  }

  async function handleCreateTask(e: FormEvent) {
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

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        status: "todo",
        priority,
        due_date: dueDate || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error(error.message)
      setErrorMessage(`Could not create task: ${error.message}`)
      setCreating(false)
      return
    }

    setTasks((prev) => [data as Task, ...prev])
    await logActivity((data as Task).id, "create", "Created task")

    setTitle("")
    setDescription("")
    setPriority("normal")
    setDueDate("")
    setCreating(false)
  }

  async function handleCreateMember(name: string, color: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !name.trim()) return

    const { data, error } = await supabase
      .from("team_members")
      .insert({
        name: name.trim(),
        color,
        user_id: user.id,
      })
      .select()
      .single()

    if (!error && data) {
      setTeamMembers((prev) => [...prev, data as TeamMember])
    }
  }

  async function handleCreateLabel(name: string, color: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !name.trim()) return

    const { data, error } = await supabase
      .from("labels")
      .insert({
        name: name.trim(),
        color,
        user_id: user.id,
      })
      .select()
      .single()

    if (!error && data) {
      setLabels((prev) => [...prev, data as Label])
    }
  }

  async function handleAddComment(taskId: string, body: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !body.trim()) return

    const { data, error } = await supabase
      .from("comments")
      .insert({
        task_id: taskId,
        body: body.trim(),
        user_id: user.id,
      })
      .select()
      .single()

    if (!error && data) {
      setComments((prev) => [...prev, data as Comment])
      await logActivity(taskId, "comment", "Added a comment")
    }
  }

  async function handleAssignMember(taskId: string, memberId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const alreadyAssigned = taskAssignees.some(
      (item) => item.task_id === taskId && item.member_id === memberId
    )

    if (alreadyAssigned) return

    const { data, error } = await supabase
      .from("task_assignees")
      .insert({
        task_id: taskId,
        member_id: memberId,
        user_id: user.id,
      })
      .select()
      .single()

    if (!error && data) {
      setTaskAssignees((prev) => [...prev, data as TaskAssignee])
      await logActivity(taskId, "assignment", "Assigned a team member")
    }
  }

  async function handleAssignLabel(taskId: string, labelId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const alreadyAssigned = taskLabels.some(
      (item) => item.task_id === taskId && item.label_id === labelId
    )

    if (alreadyAssigned) return

    const { data, error } = await supabase
      .from("task_labels")
      .insert({
        task_id: taskId,
        label_id: labelId,
        user_id: user.id,
      })
      .select()
      .single()

    if (!error && data) {
      setTaskLabels((prev) => [...prev, data as TaskLabel])
      await logActivity(taskId, "label", "Added a label")
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const taskId = String(active.id)
    const newStatus = String(over.id) as TaskStatus

    const existingTask = tasks.find((task) => task.id === taskId)
    if (!existingTask) return
    if (existingTask.status === newStatus) return

    const oldStatus = existingTask.status
    const previousTasks = tasks

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", taskId)

    if (error) {
      console.error(error.message)
      setErrorMessage(`Could not move task: ${error.message}`)
      setTasks(previousTasks)
      return
    }

    await logActivity(taskId, "status_change", `Moved from ${oldStatus} → ${newStatus}`)
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

    const { error } = await supabase.from("tasks").delete().in("id", doneTaskIds)

    if (error) {
      setErrorMessage(`Could not delete done tasks: ${error.message}`)
      setTasks(previousTasks)
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter

      const taskMemberIds = taskAssignees
        .filter((item) => item.task_id === task.id)
        .map((item) => item.member_id)

      const matchesAssignee =
        assigneeFilter === "all" || taskMemberIds.includes(assigneeFilter)

      const taskLabelIds = taskLabels
        .filter((item) => item.task_id === task.id)
        .map((item) => item.label_id)

      const matchesLabel =
        labelFilter === "all" || taskLabelIds.includes(labelFilter)

      return matchesSearch && matchesPriority && matchesAssignee && matchesLabel
    })
  }, [tasks, searchQuery, priorityFilter, assigneeFilter, labelFilter, taskAssignees, taskLabels])

  const groupedTasks = useMemo(() => {
    return columns.reduce<Record<TaskStatus, Task[]>>(
      (acc, col) => {
        acc[col.id] = filteredTasks.filter((task) => task.status === col.id)
        return acc
      },
      {
        todo: [],
        in_progress: [],
        in_review: [],
        done: [],
      }
    )
  }, [filteredTasks])

  return (
    <div className="app-shell">
      <div className="app">
        <header className="header">
          <div>
            <h1>Sunset Flow</h1>
            <p>Organize your work at golden hour 🌅</p>
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

        <BoardSummary tasks={filteredTasks} />

        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          labelFilter={labelFilter}
          setLabelFilter={setLabelFilter}
          teamMembers={teamMembers}
          labels={labels}
        />

        <TeamPanel
          teamMembers={teamMembers}
          labels={labels}
          onCreateMember={handleCreateMember}
          onCreateLabel={handleCreateLabel}
        />

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
                  teamMembers={teamMembers}
                  labels={labels}
                  taskAssignees={taskAssignees}
                  taskLabels={taskLabels}
                  onSelectTask={setSelectedTask}
                />
              ))}
            </div>
          </DndContext>
        )}

        <TaskDetailPanel
          task={selectedTask}
          comments={comments}
          activityLogs={activityLogs}
          teamMembers={teamMembers}
          labels={labels}
          taskAssignees={taskAssignees}
          taskLabels={taskLabels}
          onClose={() => setSelectedTask(null)}
          onAddComment={handleAddComment}
          onAssignMember={handleAssignMember}
          onAssignLabel={handleAssignLabel}
        />
      </div>
    </div>
  )
}

export default App