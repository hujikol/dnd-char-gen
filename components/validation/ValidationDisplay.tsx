'use client';

import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ValidationResult, ValidationError, ValidationSeverity } from '@/lib/rules/types';
import {
    getSeverityColorClass,
    getSeverityBgClass,
    getValidationSummary,
    groupErrorsByField,
} from '@/lib/rules/validation-feedback';

interface ValidationAlertProps {
    result: ValidationResult;
    showAllErrors?: boolean;
    maxErrors?: number;
    className?: string;
}

// Icon component based on severity
function SeverityIcon({ severity, className = "h-4 w-4" }: { severity: ValidationSeverity; className?: string }) {
    switch (severity) {
        case 'error':
            return <AlertCircle className={className} />;
        case 'warning':
            return <AlertTriangle className={className} />;
        case 'info':
            return <Info className={className} />;
        default:
            return <Info className={className} />;
    }
}

/**
 * Display validation errors as an alert
 */
export function ValidationAlert({
    result,
    showAllErrors = true,
    maxErrors = 5,
    className = ''
}: ValidationAlertProps) {
    const summary = getValidationSummary(result);

    // No errors or warnings to show
    if (result.isValid && result.warnings.length === 0) {
        return null;
    }

    const allItems = [...result.errors, ...result.warnings];
    const displayItems = showAllErrors ? allItems.slice(0, maxErrors) : [allItems[0]];
    const hiddenCount = allItems.length - displayItems.length;

    // Determine alert variant
    const variant = !result.isValid ? 'destructive' : 'default';
    const highestSeverity: ValidationSeverity = !result.isValid ? 'error' : 'warning';

    return (
        <Alert variant={variant} className={className}>
            <SeverityIcon severity={highestSeverity} className="h-4 w-4" />
            <AlertTitle className="font-heading">
                {!result.isValid ? 'Validation Errors' : 'Warnings'}
            </AlertTitle>
            <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                    {displayItems.map((item, index) => (
                        <li key={`${item.code}-${index}`} className="text-sm">
                            {item.message}
                            {item.suggestion && (
                                <span className="text-muted-foreground ml-1">
                                    ({item.suggestion})
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
                {hiddenCount > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                        And {hiddenCount} more issue{hiddenCount > 1 ? 's' : ''}...
                    </p>
                )}
            </AlertDescription>
        </Alert>
    );
}

interface ValidationBadgeProps {
    result: ValidationResult;
    className?: string;
}

/**
 * Compact validation status badge
 */
export function ValidationBadge({ result, className = '' }: ValidationBadgeProps) {
    const summary = getValidationSummary(result);

    if (result.isValid && result.warnings.length === 0) {
        return (
            <span className={`inline-flex items-center gap-1 text-xs text-green-500 ${className}`}>
                <CheckCircle className="h-3 w-3" />
                Valid
            </span>
        );
    }

    const highestSeverity: ValidationSeverity = !result.isValid ? 'error' : 'warning';
    const colorClass = getSeverityColorClass(highestSeverity);

    return (
        <span className={`inline-flex items-center gap-1 text-xs ${colorClass} ${className}`}>
            <SeverityIcon severity={highestSeverity} className="h-3 w-3" />
            {summary.summaryText}
        </span>
    );
}

interface FieldValidationProps {
    fieldName: string;
    result: ValidationResult;
    className?: string;
}

/**
 * Inline field validation indicator
 */
export function FieldValidation({ fieldName, result, className = '' }: FieldValidationProps) {
    const grouped = groupErrorsByField(result);
    const fieldErrors = grouped[fieldName] || [];

    if (fieldErrors.length === 0) {
        return null;
    }

    const highestSeverity = fieldErrors.find(e => e.severity === 'error')?.severity
        || fieldErrors[0]?.severity
        || 'info';
    const colorClass = getSeverityColorClass(highestSeverity);

    return (
        <div className={`text-sm ${colorClass} ${className}`}>
            {fieldErrors.map((error, i) => (
                <p key={i} className="flex items-start gap-1">
                    <SeverityIcon severity={error.severity} className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error.message}</span>
                </p>
            ))}
        </div>
    );
}

interface ValidationPanelProps {
    result: ValidationResult;
    title?: string;
    className?: string;
}

/**
 * Full validation panel with grouped errors
 */
export function ValidationPanel({ result, title, className = '' }: ValidationPanelProps) {
    const summary = getValidationSummary(result);
    const grouped = groupErrorsByField(result);
    const fieldNames = Object.keys(grouped);

    if (fieldNames.length === 0) {
        return (
            <div className={`p-4 rounded-lg border bg-green-500/10 border-green-500/30 ${className}`}>
                <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-heading font-bold">
                        {title || 'Validation'}: All checks passed!
                    </span>
                </div>
            </div>
        );
    }

    const bgClass = !result.isValid
        ? 'bg-destructive/10 border-destructive/30'
        : 'bg-yellow-500/10 border-yellow-500/30';

    return (
        <div className={`p-4 rounded-lg border ${bgClass} ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <SeverityIcon
                    severity={!result.isValid ? 'error' : 'warning'}
                    className="h-5 w-5"
                />
                <span className="font-heading font-bold">
                    {title || 'Validation'}: {summary.summaryText}
                </span>
            </div>

            <div className="space-y-3">
                {fieldNames.map((fieldName) => (
                    <div key={fieldName}>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                            {fieldName.replace('abilityScores.', '').replace('.', ' ')}
                        </p>
                        {grouped[fieldName].map((error, i) => (
                            <div
                                key={i}
                                className={`text-sm flex items-start gap-2 ${getSeverityColorClass(error.severity)}`}
                            >
                                <SeverityIcon severity={error.severity} className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>
                                    <span>{error.message}</span>
                                    {error.suggestion && (
                                        <span className="block text-muted-foreground text-xs mt-0.5">
                                            Tip: {error.suggestion}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
