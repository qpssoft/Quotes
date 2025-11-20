using Microsoft.ReactNative.Managed;
using System;

namespace QuotesNative
{
    [ReactModule]
    internal sealed class SystemTrayModule
    {
        [ReactMethod]
        public void ShowTrayIcon(string iconPath, string tooltip)
        {
            // Placeholder for system tray icon
            // In UWP this is limited, works better in packaged desktop app
            // TODO: Implement using Windows.UI.Notifications or Win32 NotifyIcon
        }

        [ReactMethod]
        public void HideTrayIcon()
        {
            // Placeholder
        }

        [ReactMethod]
        public void ShowNotification(string title, string message)
        {
            // Placeholder for toast notifications
            // TODO: Implement using Windows.UI.Notifications.ToastNotificationManager
        }
    }
}
