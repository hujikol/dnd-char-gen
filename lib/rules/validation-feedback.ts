/**
 * Validation Error Feedback System
 * UI components and hooks for displaying validation errors
 */

import type { ValidationResult, ValidationError, ValidationSeverity } from './types';

/**
 * Group errors by field for easier UI rendering
 */
export function groupErrorsByField(
  result: ValidationResult
): Record<string, ValidationError[]> {
  const grouped: Record<string, ValidationError[]> = {};
  
  const allItems = [...result.errors, ...result.warnings];
  
  for (const item of allItems) {
    const field = item.field || 'general';
    if (!grouped[field]) {
      grouped[field] = [];
    }
    grouped[field].push(item);
  }
  
  return grouped;
}

/**
 * Get the highest severity from a list of validation errors
 */
export function getHighestSeverity(errors: ValidationError[]): ValidationSeverity | null {
  if (errors.length === 0) return null;
  
  const hasError = errors.some((e) => e.severity === 'error');
  if (hasError) return 'error';
  
  const hasWarning = errors.some((e) => e.severity === 'warning');
  if (hasWarning) return 'warning';
  
  return 'info';
}

/**
 * Format a validation error for display
 */
export function formatValidationError(error: ValidationError): string {
  let message = error.message;
  if (error.suggestion) {
    message += ` (${error.suggestion})`;
  }
  return message;
}

/**
 * Get icon name for a severity level (for use with Lucide icons)
 */
export function getSeverityIcon(severity: ValidationSeverity): string {
  switch (severity) {
    case 'error':
      return 'XCircle';
    case 'warning':
      return 'AlertTriangle';
    case 'info':
      return 'Info';
    default:
      return 'Info';
  }
}

/**
 * Get CSS class for a severity level
 */
export function getSeverityColorClass(severity: ValidationSeverity): string {
  switch (severity) {
    case 'error':
      return 'text-destructive';
    case 'warning':
      return 'text-yellow-500';
    case 'info':
      return 'text-blue-500';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Get background CSS class for a severity level
 */
export function getSeverityBgClass(severity: ValidationSeverity): string {
  switch (severity) {
    case 'error':
      return 'bg-destructive/10 border-destructive/50';
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/50';
    case 'info':
      return 'bg-blue-500/10 border-blue-500/50';
    default:
      return 'bg-muted/10 border-muted/50';
  }
}

/**
 * Create a summary of validation results
 */
export function getValidationSummary(result: ValidationResult): {
  errorCount: number;
  warningCount: number;
  infoCount: number;
  summaryText: string;
  isValid: boolean;
} {
  const errorCount = result.errors.length;
  const warningCount = result.warnings.filter((w) => w.severity === 'warning').length;
  const infoCount = result.warnings.filter((w) => w.severity === 'info').length;
  
  let summaryText = '';
  
  if (errorCount > 0) {
    summaryText = `${errorCount} error${errorCount > 1 ? 's' : ''}`;
  }
  
  if (warningCount > 0) {
    if (summaryText) summaryText += ', ';
    summaryText += `${warningCount} warning${warningCount > 1 ? 's' : ''}`;
  }
  
  if (!summaryText) {
    summaryText = infoCount > 0 ? `${infoCount} note${infoCount > 1 ? 's' : ''}` : 'Valid';
  }
  
  return {
    errorCount,
    warningCount,
    infoCount,
    summaryText,
    isValid: result.isValid,
  };
}

/**
 * Merge multiple validation results
 */
export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];
  
  for (const result of results) {
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Filter validation errors by severity
 */
export function filterBySeverity(
  result: ValidationResult,
  severity: ValidationSeverity
): ValidationError[] {
  const allItems = [...result.errors, ...result.warnings];
  return allItems.filter((item) => item.severity === severity);
}

/**
 * Check if a specific field has errors
 */
export function hasFieldError(result: ValidationResult, fieldName: string): boolean {
  return result.errors.some((e) => e.field === fieldName);
}

/**
 * Check if a specific field has warnings
 */
export function hasFieldWarning(result: ValidationResult, fieldName: string): boolean {
  return result.warnings.some((w) => w.field === fieldName);
}

/**
 * Get errors for a specific field
 */
export function getFieldErrors(result: ValidationResult, fieldName: string): ValidationError[] {
  return [...result.errors, ...result.warnings].filter((e) => e.field === fieldName);
}

/**
 * Create an empty validation result (valid)
 */
export function createEmptyValidationResult(): ValidationResult {
  return {
    isValid: true,
    errors: [],
    warnings: [],
  };
}

/**
 * Create a validation result with a single error
 */
export function createErrorResult(
  code: string,
  message: string,
  field?: string,
  suggestion?: string
): ValidationResult {
  return {
    isValid: false,
    errors: [{
      code,
      message,
      severity: 'error',
      field,
      suggestion,
    }],
    warnings: [],
  };
}

/**
 * Create a validation result with a single warning
 */
export function createWarningResult(
  code: string,
  message: string,
  field?: string,
  suggestion?: string
): ValidationResult {
  return {
    isValid: true,
    errors: [],
    warnings: [{
      code,
      message,
      severity: 'warning',
      field,
      suggestion,
    }],
  };
}

/**
 * Toast notification content for validation errors
 */
export interface ValidationToast {
  title: string;
  description: string;
  variant: 'default' | 'destructive';
}

/**
 * Create toast notification content from validation result
 */
export function createValidationToast(result: ValidationResult): ValidationToast | null {
  if (result.isValid && result.warnings.length === 0) {
    return null;
  }
  
  if (!result.isValid) {
    const firstError = result.errors[0];
    return {
      title: 'Validation Error',
      description: firstError?.message || 'Please fix the errors before continuing',
      variant: 'destructive',
    };
  }
  
  // Only warnings
  const firstWarning = result.warnings[0];
  return {
    title: 'Warning',
    description: firstWarning?.message || 'Please review the warnings',
    variant: 'default',
  };
}
