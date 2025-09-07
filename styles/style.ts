import { StyleSheet } from 'react-native';

export const Colors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  error: '#ef4444',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  border: '#e2e8f0',
};

export const Typography = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
    color: Colors.secondary,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    margin: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  textButton: {
    color: Colors.card,
    fontWeight: '600',
  },
});