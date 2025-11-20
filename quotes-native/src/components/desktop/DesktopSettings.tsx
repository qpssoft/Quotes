/**
 * Desktop Settings Extension
 * Additional settings for desktop platforms (Windows/macOS)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { NotificationPosition, KeyboardShortcut } from '@quotes/shared-modules';
import { Colors, Typography, Spacing } from '../../constants/Colors';

export interface DesktopSettingsProps {
  notificationPosition: NotificationPosition;
  keyboardShortcuts: {
    showQuote: KeyboardShortcut;
    nextQuote: KeyboardShortcut;
  };
  autoLaunchEnabled: boolean;
  onNotificationPositionChange: (position: NotificationPosition) => void;
  onKeyboardShortcutChange: (type: 'showQuote' | 'nextQuote', shortcut: KeyboardShortcut) => void;
  onAutoLaunchToggle: () => void;
}

const NOTIFICATION_POSITIONS = [
  { value: NotificationPosition.TopLeft, label: 'Top Left' },
  { value: NotificationPosition.TopCenter, label: 'Top Center' },
  { value: NotificationPosition.TopRight, label: 'Top Right' },
  { value: NotificationPosition.MiddleLeft, label: 'Middle Left' },
  { value: NotificationPosition.MiddleCenter, label: 'Center' },
  { value: NotificationPosition.MiddleRight, label: 'Middle Right' },
  { value: NotificationPosition.BottomLeft, label: 'Bottom Left' },
  { value: NotificationPosition.BottomCenter, label: 'Bottom Center' },
  { value: NotificationPosition.BottomRight, label: 'Bottom Right' },
];

const SHOW_QUOTE_SHORTCUTS = [
  { value: KeyboardShortcut.ShowQuote_CtrlC, label: 'Ctrl+C' },
  { value: KeyboardShortcut.ShowQuote_CtrlX, label: 'Ctrl+X' },
];

const NEXT_QUOTE_SHORTCUTS = [
  { value: KeyboardShortcut.NextQuote_CtrlV, label: 'Ctrl+V' },
  { value: KeyboardShortcut.NextQuote_CtrlN, label: 'Ctrl+N' },
];

export function DesktopSettings({
  notificationPosition,
  keyboardShortcuts,
  autoLaunchEnabled,
  onNotificationPositionChange,
  onKeyboardShortcutChange,
  onAutoLaunchToggle,
}: DesktopSettingsProps): React.ReactElement {
  return (
    <ScrollView style={styles.container}>
      {/* Notification Position */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Position</Text>
        <Text style={styles.sectionDescription}>
          Choose where quote notifications appear on your screen
        </Text>
        <View style={styles.grid}>
          {NOTIFICATION_POSITIONS.map((position) => (
            <TouchableOpacity
              key={position.value}
              style={[
                styles.gridItem,
                notificationPosition === position.value && styles.gridItemSelected,
              ]}
              onPress={() => onNotificationPositionChange(position.value)}
            >
              <Text
                style={[
                  styles.gridItemText,
                  notificationPosition === position.value && styles.gridItemTextSelected,
                ]}
              >
                {position.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Keyboard Shortcuts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Keyboard Shortcuts</Text>
        
        {/* Show Quote Shortcut */}
        <View style={styles.shortcutSection}>
          <Text style={styles.shortcutLabel}>Show Quote</Text>
          <View style={styles.shortcutButtons}>
            {SHOW_QUOTE_SHORTCUTS.map((shortcut) => (
              <TouchableOpacity
                key={shortcut.value}
                style={[
                  styles.shortcutButton,
                  keyboardShortcuts.showQuote === shortcut.value && styles.shortcutButtonSelected,
                ]}
                onPress={() => onKeyboardShortcutChange('showQuote', shortcut.value)}
              >
                <Text
                  style={[
                    styles.shortcutButtonText,
                    keyboardShortcuts.showQuote === shortcut.value && styles.shortcutButtonTextSelected,
                  ]}
                >
                  {shortcut.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Next Quote Shortcut */}
        <View style={styles.shortcutSection}>
          <Text style={styles.shortcutLabel}>Next Quote</Text>
          <View style={styles.shortcutButtons}>
            {NEXT_QUOTE_SHORTCUTS.map((shortcut) => (
              <TouchableOpacity
                key={shortcut.value}
                style={[
                  styles.shortcutButton,
                  keyboardShortcuts.nextQuote === shortcut.value && styles.shortcutButtonSelected,
                ]}
                onPress={() => onKeyboardShortcutChange('nextQuote', shortcut.value)}
              >
                <Text
                  style={[
                    styles.shortcutButtonText,
                    keyboardShortcuts.nextQuote === shortcut.value && styles.shortcutButtonTextSelected,
                  ]}
                >
                  {shortcut.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Auto-Launch */}
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.sectionTitle}>Launch at Startup</Text>
            <Text style={styles.sectionDescription}>
              Automatically start Buddhist Quotes when you log in
            </Text>
          </View>
          <Switch
            value={autoLaunchEnabled}
            onValueChange={onAutoLaunchToggle}
            trackColor={{ false: Colors.border, true: Colors.primary}}
            thumbColor={autoLaunchEnabled ? Colors.primaryLight : Colors.textLight}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold as any,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  gridItem: {
    flex: 0,
    minWidth: '30%',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  gridItemSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  gridItemText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    fontWeight: Typography.weights.medium as any,
  },
  gridItemTextSelected: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold as any,
  },
  shortcutSection: {
    marginBottom: Spacing.md,
  },
  shortcutLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium as any,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  shortcutButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shortcutButton: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  shortcutButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accentDark,
  },
  shortcutButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
    fontWeight: Typography.weights.medium as any,
  },
  shortcutButtonTextSelected: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold as any,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
});
