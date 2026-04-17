export default function LoadingBoard() {
  return (
    <div className="board">
      {Array.from({ length: 4 }).map((_, columnIndex) => (
        <div key={columnIndex} className="column">
          <div className="column-header">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-pill" />
          </div>

          <div className="task-list">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <div key={cardIndex} className="task-card skeleton-card">
                <div className="skeleton skeleton-line large" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}