// src/components/SchedulePicker.js

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/UserContext';
import { TIME_SLOTS } from '../utils/constants';
import { validateScheduleDate, formatScheduledTime } from '../utils/validators';

/**
 * SchedulePicker Component
 * 
 * Allows users to select a date and time for scheduling posts.
 * Provides quick-select time slots and custom date/time picker.
 * 
 * @param {Object} props
 * @param {Date} props.selectedDate - Currently selected date/time
 * @param {function} props.onDateChange - Callback when date changes
 * @param {function} props.onConfirm - Callback when user confirms selection
 * @param {string} props.error - Error message to display
 */
const SchedulePicker = ({
  selectedDate,
  onDateChange,
  onConfirm,
  error = null,
}) => {
  const { theme, isDarkMode } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');

  // Initialize with tomorrow 9AM if no date provided
  const initialDate = useMemo(() => {
    if (selectedDate) return new Date(selectedDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }, []);

  const [internalDate, setInternalDate] = useState(initialDate);

  /**
   * Get next 7 days for quick selection
   */
  const nextDays = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label;
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else {
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
      }
      
      days.push({
        date,
        label,
        dayNum: date.getDate(),
        isSelected: internalDate.toDateString() === date.toDateString(),
      });
    }
    
    return days;
  }, [internalDate]);

  /**
   * Handle quick day selection
   */
  const handleDaySelect = (date) => {
    const newDate = new Date(date);
    newDate.setHours(internalDate.getHours(), internalDate.getMinutes(), 0, 0);
    setInternalDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  /**
   * Handle quick time slot selection
   */
  const handleTimeSlotSelect = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(internalDate);
    newDate.setHours(hours, minutes, 0, 0);
    setInternalDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  /**
   * Handle date picker change
   */
  const handleDateTimeChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }

    if (date) {
      const newDate = new Date(internalDate);
      
      if (pickerMode === 'date') {
        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      } else {
        newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
      }
      
      setInternalDate(newDate);
      if (onDateChange) onDateChange(newDate);

      // On Android, show time picker after date picker
      if (Platform.OS === 'android' && pickerMode === 'date') {
        setTimeout(() => {
          setPickerMode('time');
          setShowTimePicker(true);
        }, 100);
      }
    }
  };

  /**
   * Open date picker
   */
  const openDatePicker = () => {
    setPickerMode('date');
    if (Platform.OS === 'ios') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  /**
   * Open time picker
   */
  const openTimePicker = () => {
    setPickerMode('time');
    if (Platform.OS === 'ios') {
      setShowTimePicker(true);
    } else {
      setShowTimePicker(true);
    }
  };

  /**
   * Get validation state
   */
  const validation = validateScheduleDate(internalDate);

  /**
   * Check if time slot is selected
   */
  const isTimeSlotSelected = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (
      internalDate.getHours() === hours &&
      internalDate.getMinutes() === minutes
    );
  };

  return (
    <View style={styles.container}>
      {/* Day Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Select Day</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {nextDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDaySelect(day.date)}
              style={[
                styles.dayButton,
                day.isSelected && styles.dayButtonSelected,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayLabel,
                  day.isSelected && styles.dayLabelSelected,
                ]}
              >
                {day.label}
              </Text>
              <Text
                style={[
                  styles.dayNum,
                  day.isSelected && styles.dayNumSelected,
                ]}
              >
                {day.dayNum}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Custom date button */}
          <TouchableOpacity
            onPress={openDatePicker}
            style={styles.customDateButton}
            activeOpacity={0.7}
          >
            <Text style={styles.customDateIcon}>📅</Text>
            <Text style={styles.customDateText}>Other</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Time Slots */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Select Time</Text>
        <View style={styles.timeSlotsGrid}>
          {TIME_SLOTS.map((slot) => {
            const isSelected = isTimeSlotSelected(slot.time);
            return (
              <TouchableOpacity
                key={slot.time}
                onPress={() => handleTimeSlotSelect(slot.time)}
                style={[
                  styles.timeSlot,
                  isSelected && styles.timeSlotSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeSlotLabel,
                    isSelected && styles.timeSlotLabelSelected,
                  ]}
                >
                  {slot.label}
                </Text>
                <Text
                  style={[
                    styles.timeSlotTime,
                    isSelected && styles.timeSlotTimeSelected,
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Custom time button */}
        <TouchableOpacity
          onPress={openTimePicker}
          style={styles.customTimeButton}
          activeOpacity={0.7}
        >
          <Text style={styles.customTimeText}>⏰ Choose custom time</Text>
        </TouchableOpacity>
      </View>

      {/* Selected datetime display */}
      <View style={styles.selectedDisplay}>
        <Text style={styles.selectedLabel}>Scheduled for:</Text>
        <Text style={styles.selectedValue}>
          {formatScheduledTime(internalDate)}
        </Text>
      </View>

      {/* Error message */}
      {(error || !validation.isValid) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || validation.error}
          </Text>
        </View>
      )}

      {/* Confirm button */}
      {onConfirm && (
        <TouchableOpacity
          onPress={() => onConfirm(internalDate)}
          style={[
            styles.confirmButton,
            !validation.isValid && styles.confirmButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={!validation.isValid}
        >
          <Text style={styles.confirmButtonText}>Confirm Schedule</Text>
        </TouchableOpacity>
      )}

      {/* Date/Time Pickers */}
      {(showDatePicker || showTimePicker) && (
        <DateTimePicker
          value={internalDate}
          mode={pickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateTimeChange}
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
          themeVariant={isDarkMode ? 'dark' : 'light'}
        />
      )}
    </View>
  );
};

const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    // Sections
    section: {
      marginBottom: 24,
    },
    sectionLabel: {
      fontSize: 11,
      color: theme.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 12,
    },

    // Day selection
    daysRow: {
      flexDirection: 'row',
      gap: 10,
      paddingRight: 20,
    },
    dayButton: {
      width: 60,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: 'center',
    },
    dayButtonSelected: {
      backgroundColor: theme.primaryGlow,
      borderColor: theme.primary,
    },
    dayLabel: {
      fontSize: 11,
      color: theme.textMuted,
      marginBottom: 4,
    },
    dayLabelSelected: {
      color: theme.primary,
      fontWeight: '600',
    },
    dayNum: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
    },
    dayNumSelected: {
      color: theme.primary,
    },
    customDateButton: {
      width: 60,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: 'center',
      borderStyle: 'dashed',
    },
    customDateIcon: {
      fontSize: 16,
      marginBottom: 4,
    },
    customDateText: {
      fontSize: 11,
      color: theme.textMuted,
    },

    // Time slots
    timeSlotsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    timeSlot: {
      width: '48%',
      padding: 14,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.border,
    },
    timeSlotSelected: {
      backgroundColor: theme.accentGlow,
      borderColor: theme.accent,
    },
    timeSlotLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    timeSlotLabelSelected: {
      color: theme.accent,
    },
    timeSlotTime: {
      fontSize: 12,
      color: theme.textMuted,
    },
    timeSlotTimeSelected: {
      color: theme.accent,
    },
    customTimeButton: {
      marginTop: 12,
      padding: 12,
      alignItems: 'center',
    },
    customTimeText: {
      fontSize: 13,
      color: theme.primary,
      fontWeight: '500',
    },

    // Selected display
    selectedDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backgroundColor: theme.surfaceElevated,
      borderRadius: 14,
      marginBottom: 16,
    },
    selectedLabel: {
      fontSize: 13,
      color: theme.textMuted,
      marginRight: 8,
    },
    selectedValue: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },

    // Error
    errorContainer: {
      padding: 12,
      backgroundColor: `${theme.danger}15`,
      borderRadius: 10,
      marginBottom: 16,
    },
    errorText: {
      fontSize: 12,
      color: theme.danger,
      textAlign: 'center',
    },

    // Confirm button
    confirmButton: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.accent,
      alignItems: 'center',
    },
    confirmButtonDisabled: {
      opacity: 0.5,
    },
    confirmButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
    },
  });

export default SchedulePicker;