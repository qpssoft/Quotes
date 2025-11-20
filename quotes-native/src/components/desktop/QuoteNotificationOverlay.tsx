/**
 * Quote Notification Overlay
 * Desktop-specific overlay component for displaying quotes in configured screen position
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { Quote, NotificationPosition } from '@quotes/shared-modules';
import { Colors, Typography, Spacing } from '../../constants/Colors';

export interface QuoteNotificationProps {
  quote: Quote | null;
  position: NotificationPosition;
  visible: boolean;
  duration?: number; // milliseconds to show
  onHide?: () => void;
}

export function QuoteNotificationOverlay({
  quote,
  position,
  visible,
  duration = 5000,
  onHide,
}: QuoteNotificationProps): React.ReactElement | null {
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Calculate position based on NotificationPosition
  const getPositionStyle = (): any => {
    const { width, height } = Dimensions.get('window');
    const overlayWidth = Math.min(600, width * 0.4);
    const overlayHeight = 200;
    const padding = 20;

    switch (position) {
      case NotificationPosition.TopLeft:
        return { top: padding, left: padding };
      case NotificationPosition.TopCenter:
        return { top: padding, left: (width - overlayWidth) / 2 };
      case NotificationPosition.TopRight:
        return { top: padding, right: padding };
      case NotificationPosition.MiddleLeft:
        return { top: (height - overlayHeight) / 2, left: padding };
      case NotificationPosition.MiddleCenter:
        return { top: (height - overlayHeight) / 2, left: (width - overlayWidth) / 2 };
      case NotificationPosition.MiddleRight:
        return { top: (height - overlayHeight) / 2, right: padding };
      case NotificationPosition.BottomLeft:
        return { bottom: padding, left: padding };
      case NotificationPosition.BottomCenter:
        return { bottom: padding, left: (width - overlayWidth) / 2 };
      case NotificationPosition.BottomRight:
      default:
        return { bottom: padding, right: padding };
    }
  };

  useEffect(() => {
    if (visible && quote) {
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, quote, duration, opacity, onHide]);

  if (!quote || !visible) {
    return null;
  }

  // Don't show on mobile platforms
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        getPositionStyle(),
        { opacity },
      ]}
      pointerEvents="none" // Allow clicks to pass through
    >
      <View style={styles.card}>
        <Text style={styles.content}>{quote.content}</Text>
        {quote.author && (
          <Text style={styles.author}>— {quote.author}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    maxWidth: 600,
    minWidth: 400,
    zIndex: 9999,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    fontSize: Typography.sizes.xl, // Desktop: larger font
    lineHeight: Typography.lineHeights.relaxed,
    color: Colors.text,
    marginBottom: Spacing.md,
    fontWeight: Typography.weights.medium as any,
  },
  author: {
    fontSize: Typography.sizes.lg,
    lineHeight: Typography.lineHeights.normal,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
    fontWeight: Typography.weights.regular as any,
  },
});
