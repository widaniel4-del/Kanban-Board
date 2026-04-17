type ToastProps = {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: ToastProps) {
  if (!message) return null

  return (
    <div className="toast">
      <span>{message}</span>
      <button type="button" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}