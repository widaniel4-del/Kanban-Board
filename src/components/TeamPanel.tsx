import { useState } from "react"
import type { Label, TeamMember } from "../types/task"

type TeamPanelProps = {
  teamMembers: TeamMember[]
  labels: Label[]
  onCreateMember: (name: string, color: string) => void
  onCreateLabel: (name: string, color: string) => void
}

export default function TeamPanel({
  teamMembers,
  labels,
  onCreateMember,
  onCreateLabel,
}: TeamPanelProps) {
  const [memberName, setMemberName] = useState("")
  const [memberColor, setMemberColor] = useState("#6c63ff")

  const [labelName, setLabelName] = useState("")
  const [labelColor, setLabelColor] = useState("#f59e0b")

  function handleMemberSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!memberName.trim()) return

    onCreateMember(memberName, memberColor)
    setMemberName("")
    setMemberColor("#6c63ff")
  }

  function handleLabelSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!labelName.trim()) return

    onCreateLabel(labelName, labelColor)
    setLabelName("")
    setLabelColor("#f59e0b")
  }

  return (
    <section className="team-panels">
      <div className="panel-card">
        <h2 className="panel-title">Team Members</h2>

        <form className="panel-form" onSubmit={handleMemberSubmit}>
          <input
            type="text"
            className="panel-input"
            placeholder="Add team member"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
          />

          <input
            type="color"
            className="panel-color"
            value={memberColor}
            onChange={(e) => setMemberColor(e.target.value)}
            aria-label="Choose member color"
          />

          <button type="submit" className="panel-button">
            Add
          </button>
        </form>

        <div className="chip-list">
          {teamMembers.map((member) => (
            <div key={member.id} className="member-chip">
              <span
                className="member-avatar"
                style={{ backgroundColor: member.avatar_color || "#6c63ff" }}
              >
                {member.name.charAt(0).toUpperCase()}
              </span>
              <span className="member-name">{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-card">
        <h2 className="panel-title">Labels</h2>

        <form className="panel-form" onSubmit={handleLabelSubmit}>
          <input
            type="text"
            className="panel-input"
            placeholder="Add label"
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
          />

          <input
            type="color"
            className="panel-color"
            value={labelColor}
            onChange={(e) => setLabelColor(e.target.value)}
            aria-label="Choose label color"
          />

          <button type="submit" className="panel-button">
            Add
          </button>
        </form>

        <div className="chip-list">
          {labels.map((label) => (
            <span
              key={label.id}
              className="label-chip"
              style={{ backgroundColor: label.color || "#f59e0b" }}
            >
              {label.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}