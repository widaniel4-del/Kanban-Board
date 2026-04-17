import type { Label, TaskPriority, TeamMember } from "../types/task"

type FilterBarProps = {
  searchQuery: string
  setSearchQuery: (value: string) => void
  priorityFilter: "all" | TaskPriority
  setPriorityFilter: (value: "all" | TaskPriority) => void
  assigneeFilter: string
  setAssigneeFilter: (value: string) => void
  labelFilter: string
  setLabelFilter: (value: string) => void
  teamMembers: TeamMember[]
  labels: Label[]
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  assigneeFilter,
  setAssigneeFilter,
  labelFilter,
  setLabelFilter,
  teamMembers,
  labels,
}: FilterBarProps) {
  return (
    <section className="filter-bar">
      <input
        type="text"
        className="input"
        placeholder="Search tasks"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <select
        className="input"
        value={priorityFilter}
        onChange={(e) =>
          setPriorityFilter(e.target.value as "all" | TaskPriority)
        }
      >
        <option value="all">All priorities</option>
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>

      <select
        className="input"
        value={assigneeFilter}
        onChange={(e) => setAssigneeFilter(e.target.value)}
      >
        <option value="all">All assignees</option>
        {teamMembers.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>

      <select
        className="input"
        value={labelFilter}
        onChange={(e) => setLabelFilter(e.target.value)}
      >
        <option value="all">All labels</option>
        {labels.map((label) => (
          <option key={label.id} value={label.id}>
            {label.name}
          </option>
        ))}
      </select>
    </section>
  )
}