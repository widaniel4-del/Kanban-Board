export type TaskStatus = "todo" | "in_progress" | "in_review" | "done"
export type TaskPriority = "low" | "normal" | "high"

export type Task = {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date?: string | null
  user_id: string
  created_at: string
  updated_at?: string | null
}

export type TeamMember = {
  id: string
  user_id: string
  name: string
  avatar_url?: string | null
  color: string
  created_at: string
}

export type Comment = {
  id: string
  task_id: string
  user_id: string
  body: string
  created_at: string
}

export type ActivityLog = {
  id: string
  task_id: string
  user_id: string
  action: string
  details?: string | null
  created_at: string
}

export type Label = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export type TaskAssignee = {
  id: string
  task_id: string
  member_id: string
  user_id: string
  created_at: string
}

export type TaskLabel = {
  id: string
  task_id: string
  label_id: string
  user_id: string
  created_at: string
}