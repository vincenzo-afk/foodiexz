import { useStore } from "../store/useStore";
import { Bell, X, CheckCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

export function NotificationPanel() {
  const { notifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = getUnreadCount();
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'order': return '🍔';
      default: return 'ℹ️';
    }
  };
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2>Notifications</h2>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center p-6">
                    <div>
                      <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No notifications yet</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          markNotificationAsRead(notification.id);
                          if (notification.link) {
                            setIsOpen(false);
                          }
                        }}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-orange-50/50' : ''
                        } ${notification.link ? 'cursor-pointer' : ''}`}
                      >
                        {notification.link ? (
                          <Link to={notification.link}>
                            <NotificationContent notification={notification} getIcon={getNotificationIcon} />
                          </Link>
                        ) : (
                          <NotificationContent notification={notification} getIcon={getNotificationIcon} />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NotificationContent({ notification, getIcon }: any) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl flex-shrink-0">{getIcon(notification.type)}</span>
      <div className="flex-1">
        <h3 className="mb-1">{notification.title}</h3>
        <p className="text-gray-600 mb-1">{notification.message}</p>
        <p className="text-gray-400">
          {new Date(notification.createdAt).toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
          })}
        </p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
