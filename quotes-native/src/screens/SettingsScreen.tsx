/**
 * SettingsScreen
 * User preferences UI: timer interval, sound, haptic toggles
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { usePreferences } from '../hooks/usePreferences';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Colors';
import { DesktopSettings } from '../components/desktop/DesktopSettings';
import { KeyboardShortcut, NotificationPosition } from '@quotes/shared-modules';

const INTERVAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export function SettingsScreen() {
  const {
    preferences,
    updateTimerInterval,
    toggleSound,
    toggleHaptic,
    resetPreferences,
  } = usePreferences();

  const [autoLaunchEnabled, setAutoLaunchEnabled] = React.useState(false);

  const handleIntervalChange = async (seconds: number) => {
    await updateTimerInterval(seconds);
  };

  const handleNotificationPositionChange = async (position: NotificationPosition) => {
    // TODO: Implement preference update for notification position
    console.log('Notification position changed:', position);
  };

  const handleKeyboardShortcutChange = async (
    type: 'showQuote' | 'nextQuote',
    shortcut: KeyboardShortcut
  ) => {
    // TODO: Implement preference update for keyboard shortcuts
    console.log('Keyboard shortcut changed:', type, shortcut);
  };

  const handleAutoLaunchToggle = async () => {
    setAutoLaunchEnabled(!autoLaunchEnabled);
    // TODO: Implement auto-launch configuration
    console.log('Auto-launch toggled:', !autoLaunchEnabled);
  };

  const handleReset = async () => {
    Alert.alert(
      'Reset Settings',
      'Reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetPreferences();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </View>

        {/* Timer Interval Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timer Interval</Text>
          <Text style={styles.sectionDescription}>
            How often quotes change during auto-rotation
          </Text>
          <View style={styles.intervalGrid}>
            {INTERVAL_OPTIONS.map((seconds) => (
              <TouchableOpacity
                key={seconds}
                style={[
                  styles.intervalOption,
                  preferences.timerInterval === seconds && styles.intervalOptionActive,
                ]}
                onPress={() => handleIntervalChange(seconds)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.intervalText,
                    preferences.timerInterval === seconds && styles.intervalTextActive,
                  ]}
                >
                  {seconds}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sound Notifications</Text>
              <Text style={styles.settingDescription}>
                Play notification sound when quotes change
              </Text>
            </View>
            <Switch
              value={preferences.soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={preferences.soundEnabled ? Colors.primary : Colors.textLight}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </View>

        {/* Haptic Section */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>
                Vibrate when interacting with quotes
              </Text>
            </View>
            <Switch
              value={preferences.hapticEnabled}
              onValueChange={toggleHaptic}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={preferences.hapticEnabled ? Colors.primary : Colors.textLight}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </View>

        {/* Desktop-Specific Settings */}
        {(Platform.OS === 'windows' || Platform.OS === 'macos') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Desktop Settings</Text>
            <DesktopSettings
              notificationPosition={preferences.notificationPosition}
              keyboardShortcuts={preferences.keyboardShortcuts}
              autoLaunchEnabled={autoLaunchEnabled}
              onNotificationPositionChange={handleNotificationPositionChange}
              onKeyboardShortcutChange={handleKeyboardShortcutChange}
              onAutoLaunchToggle={handleAutoLaunchToggle}
            />
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{preferences.favorites.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{preferences.readingHistory.length}</Text>
              <Text style={styles.statLabel}>Viewed</Text>
            </View>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Buddhist Quotes v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 QPS Software</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  intervalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  intervalOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 70,
    alignItems: 'center',
  },
  intervalOptionActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  intervalText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  intervalTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  resetButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  appInfo: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    gap: 4,
  },
  appInfoText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
