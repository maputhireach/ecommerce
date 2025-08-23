import { useEffect, useState } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import type { Notification } from '../contexts/NotificationContext'

export default function NotificationPopup() {
  const { notifications, removeNotification } = useNotifications()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (notifications.length > 0) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [notifications])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return 'ℹ'
    }
  }

  const getNotificationStyles = (type: Notification['type']) => {
    const baseStyles = 'notification-popup'
    switch (type) {
      case 'success':
        return `${baseStyles} notification-popup--success`
      case 'error':
        return `${baseStyles} notification-popup--error`
      case 'warning':
        return `${baseStyles} notification-popup--warning`
      case 'info':
        return `${baseStyles} notification-popup--info`
      default:
        return baseStyles
    }
  }

  if (!isVisible || notifications.length === 0) return null

  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationStyles(notification.type)}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-icon">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="notification-content">
            <h4 className="notification-title">{notification.title}</h4>
            <p className="notification-message">{notification.message}</p>
          </div>
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation()
              removeNotification(notification.id)
            }}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
