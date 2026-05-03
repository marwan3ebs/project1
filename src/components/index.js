import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <TouchableOpacity style={styles.ghostButton} onPress={onAction} activeOpacity={0.78}>
          <Text style={styles.ghostButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function MetricCard({ label, value, detail, tone = 'teal' }) {
  return (
    <View style={[styles.metricCard, styles[`metric_${tone}`]]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {detail ? <Text style={styles.metricDetail}>{detail}</Text> : null}
    </View>
  );
}

export function Pill({ label, tone = 'slate' }) {
  return (
    <View style={[styles.pill, styles[`pill_${tone}`]]}>
      <Text style={[styles.pillText, styles[`pillText_${tone}`]]}>{label}</Text>
    </View>
  );
}

export function SegmentedControl({ label, options, value, onChange }) {
  return (
    <View style={styles.controlBlock}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <View style={styles.segmentWrap}>
        {options.map((option) => {
          const active = option.value === value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}) {
  return (
    <View style={styles.controlBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={String(value ?? '')}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea]}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

export function PrimaryButton({ label, onPress, tone = 'primary', disabled = false }) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[`button_${tone}`], disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.82}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ProgressBar({ value, color = '#0f766e' }) {
  const width = `${Math.max(0, Math.min(100, value))}%`;

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width, backgroundColor: color }]} />
    </View>
  );
}

export function EmptyState({ title, body }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
    </View>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 3,
  },
  ghostButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '800',
  },
  metricCard: {
    flex: 1,
    minWidth: 146,
    minHeight: 104,
    borderRadius: 8,
    borderWidth: 1,
    padding: 13,
    justifyContent: 'space-between',
  },
  metric_teal: {
    backgroundColor: '#ecfeff',
    borderColor: '#99f6e4',
  },
  metric_amber: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  metric_rose: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  metric_slate: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  metricLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: '#0f172a',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 10,
  },
  metricDetail: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  pill_slate: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  pill_teal: {
    backgroundColor: '#ccfbf1',
    borderColor: '#5eead4',
  },
  pill_warning: {
    backgroundColor: '#ffedd5',
    borderColor: '#fdba74',
  },
  pill_danger: {
    backgroundColor: '#ffe4e6',
    borderColor: '#fda4af',
  },
  pill_calm: {
    backgroundColor: '#e0f2fe',
    borderColor: '#7dd3fc',
  },
  pill_green: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pillText_slate: {
    color: '#334155',
  },
  pillText_teal: {
    color: '#0f766e',
  },
  pillText_warning: {
    color: '#9a3412',
  },
  pillText_danger: {
    color: '#be123c',
  },
  pillText_calm: {
    color: '#0369a1',
  },
  pillText_green: {
    color: '#166534',
  },
  controlBlock: {
    marginBottom: 12,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  textArea: {
    minHeight: 78,
    textAlignVertical: 'top',
  },
  segmentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segment: {
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  segmentActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  segmentText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  button: {
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  button_primary: {
    backgroundColor: '#0f766e',
  },
  button_dark: {
    backgroundColor: '#0f172a',
  },
  button_amber: {
    backgroundColor: '#c2410c',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  empty: {
    minHeight: 112,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  emptyTitle: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 15,
  },
  emptyBody: {
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
};
