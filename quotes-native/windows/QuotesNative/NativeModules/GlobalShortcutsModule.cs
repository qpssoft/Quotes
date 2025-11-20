using Microsoft.ReactNative.Managed;
using System;
using Windows.UI.Core;
using Windows.System;

namespace QuotesNative
{
    [ReactModule]
    internal sealed class GlobalShortcutsModule
    {
        [ReactMethod]
        public void RegisterShortcut(string shortcutId, int vKey, bool ctrl, bool shift, bool alt)
        {
            // In UWP, global keyboard shortcuts are limited
            // For now, this is a placeholder for when running as desktop app
            // TODO: Implement using Windows.UI.Input.KeyboardAccelerator or Win32 RegisterHotKey
        }

        [ReactMethod]
        public void UnregisterShortcut(string shortcutId)
        {
            // Placeholder
        }
    }
}
