import { useEffect, useMemo, useState } from "react"
import type { DragEndEvent } from "@dnd-kit/core"
import { ensureGuestSession, supabase } from "../lib/supabase"
import type { Task, TaskPriority, TaskStatus } from "../types/task"

const initialGrouped: Record<TaskStatus, Task[]> = {
  todo: [],
  in_progress: [],
  in_review: [],
  done: [],
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let mounted = true

    async function initialize() {
      try {
        setLoading(true)
        setErrorMessage("")

        const signedIn = await ensureGuestSession()
        if (!signedIn) {
          if (mounted) setErrorMessage("Guest sign-in is not enabled in Supabase.")
          return
        }

        await fetchTasks()
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initialize()

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        async () => {
          await fetchTasks()
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error.message)
      setErrorMessage(`Could not load tasks: ${error.message}`)
      return
    }

    setTasks((data ?? []) as Task[])
  }

  async function createTask(values: {
    title: string
    description: string
    priority: TaskPriority
    due_date: string
    status: TaskStatus
  }) {
    setErrorMessage("")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setErrorMessage("Could not identify guest user.")
      return
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: values.title,
        description: values.description || null,
        priority: values.priority,
        due_date: values.due_date || null,
        status: values.status,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error(error.message)
      setErrorMessage(`Could not create task: ${error.message}`)
      return
    }

    setTasks((prev) => [data as Task, ...prev])
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const taskId = String(active.id)
    const newStatus = String(over.id) as TaskStatus

    const existingTask = tasks.find((task) => task.id === taskId)
    if (!existingTask || existingTask.status === newStatus) return

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
      setErrorMessage(`Could not move task: ${error.message}`)
      setTasks(previousTasks)
    }
  }

  async function clearDoneTasks() {
    const doneTasks = tasks.filter((task) => task.status === "done")
    if (doneTasks.length === 0) return

    const ids = doneTasks.map((task) => task.id)
    const previousTasks = tasks

    setTasks((prev) => prev.filter((task) => task.status !== "done"))

    const { error } = await supabase.from("tasks").delete().in("id", ids)

    if (error) {
      setErrorMessage(`Could not delete done tasks: ${error.message}`)
      setTasks(previousTasks)
    }
  }

  const groupedTasks = useMemo(() => {
    return tasks.reduce<Record<TaskStatus, Task[]>>((acc, task) => {
      acc[task.status].push(task)
      return acc
    }, { ...initialGrouped })
  }, [tasks])

  return {
    tasks,
    groupedTasks,
    loading,
    errorMessage,
    setErrorMessage,
    createTask,
    handleDragEnd,
    clearDoneTasks,
  }
}