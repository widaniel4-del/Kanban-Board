import { useState } from "react"
import type { Label, TeamMember } from "../types/task"

type TeamPanelProps = {
  teamMembers: TeamMember[]
  labels: Label[]
  onCreateMember: (name: string, color: string) => Promise<void>
  onCreateLabel: (name: string, color: string) => Promise<void>
}

export default function TeamPanel({
  teamMembers,
  labels,
  onCreateMember,
  onCreateLabel,
}: TeamPanelProps) {
  const [memberName, setMemberName] = useState("")
  const [memberColor, setMemberColor] = useState("#6366f1")
  const [labelName, setLabelName] = useState("")
  const [labelColor, setLabelColor] = useState("#f59e0b")

  return (
    <section className="side-panel-grid">
      <div className="side-panel-card">
        <h3>Team Members</h3>

        <form
          className="mini-form"
          onSubmit={async (e) => {
            e.preventDefault()
            await onCreateMember(memberName, memberColor)
            setMemberName("")
            setMemberColor("#6366f1")
          }}
        >
          <input
            className="input"
            type="text"
            placeholder="Add team member"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
          />
          <input
            className="color-input"
            type="color"
            value={memberColor}
            onChange={(e) => setMemberColor(e.target.value)}
          />
          <button className="secondary-button" type="submit">
            Add
          </button>
        </form>

        <div className="chip-list">
          {teamMembers.map((member) => (
            <div key={member.id} className="member-chip">
              <span
                className="assignee-avatar"
                style={{ backgroundColor: member.color }}
              >
                {member.name.charAt(0).toUpperCase()}
              </span>
              <span>{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="side-panel-card">
        <h3>Labels</h3>

        <form
          className="mini-form"
          onSubmit={async (e) => {
            e.preventDefault()
            await onCreateLabel(labelName, labelColor)
            setLabelName("")
            setLabelColor("#f59e0b")
          }}
        >
          <input
            className="input"
            type="text"
            placeholder="Add label"
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
          />
          <input
            className="color-input"
            type="color"
            value={labelColor}
            onChange={(e) => setLabelColor(e.target.value)}
          />
          <button className="secondary-button" type="submit">
            Add
          </button>
        </form>

        <div className="chip-list">
          {labels.map((label) => (
            <span
              key={label.id}
              className="task-label"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}