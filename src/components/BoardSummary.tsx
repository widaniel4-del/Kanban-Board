import { isBefore } from "date-fns/isBefore"
import type { Task } from "../types/task"
import { startOfDay } from "date-fns/startOfDay"

type BoardSummaryProps = {
  tasks: Task[]
}

export default function BoardSummary({ tasks }: BoardSummaryProps) {
  const total = tasks.length
  const completed = tasks.filter((task) => task.status === "done").length
  const overdue = tasks.filter(
    (task) =>
      task.due_date &&
      task.status !== "done" &&
      isBefore(new Date(task.due_date), startOfDay(new Date()))
  ).length

  return (
    <section className="summary-grid">
      <div className="summary-card">
        <span>Total Tasks</span>
        <strong>{total}</strong>
      </div>
      <div className="summary-card">
        <span>Completed</span>
        <strong>{completed}</strong>
      </div>
      <div className="summary-card">
        <span>Overdue</span>
        <strong>{overdue}</strong>
      </div>
    </section>
  )
}