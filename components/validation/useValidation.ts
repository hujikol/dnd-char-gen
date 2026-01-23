'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ValidationResult, CharacterForValidation, AbilityScores } from '@/lib/rules/types';
import { 
  validateCharacter, 
  validateAbilityScoreChange,
  validateMulticlassAddition,
  createEmptyValidationResult 
} from '@/lib/rules';

interface UseValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
}

/**
 * Hook for real-time character validation
 */
export function useCharacterValidation(
  character: CharacterForValidation | null,
  options: UseValidationOptions = {}
) {
  const { debounceMs = 300, validateOnMount = true } = options;
  const [result, setResult] = useState<ValidationResult>(createEmptyValidationResult());
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(() => {
    if (!character) {
      setResult(createEmptyValidationResult());
      return;
    }

    setIsValidating(true);
    
    // Use setTimeout for debouncing
    const timeoutId = setTimeout(() => {
      const validationResult = validateCharacter(character);
      setResult(validationResult);
      setIsValidating(false);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      setIsValidating(false);
    };
  }, [character, debounceMs]);

  useEffect(() => {
    if (validateOnMount || character) {
      return validate();
    }
  }, [validate, validateOnMount, character]);

  return {
    result,
    isValidating,
    isValid: result.isValid,
    errors: result.errors,
    warnings: result.warnings,
    revalidate: validate,
  };
}

/**
 * Hook for ability score validation
 */
export function useAbilityScoreValidation(
  abilityScores: AbilityScores,
  method: 'point-buy' | 'standard-array' | 'manual',
  currentClasses?: string[]
) {
  const [result, setResult] = useState<ValidationResult>(createEmptyValidationResult());

  useEffect(() => {
    const validationResult = validateAbilityScoreChange(
      abilityScores,
      method,
      currentClasses
    );
    setResult(validationResult);
  }, [abilityScores, method, currentClasses]);

  return {
    result,
    isValid: result.isValid,
    errors: result.errors,
    warnings: result.warnings,
    hasErrors: result.errors.length > 0,
    hasWarnings: result.warnings.length > 0,
  };
}

/**
 * Hook for multiclass validation
 */
export function useMulticlassValidation(
  character: CharacterForValidation | null,
  targetClass: string | null
) {
  const [result, setResult] = useState<ValidationResult>(createEmptyValidationResult());
  const [canMulticlass, setCanMulticlass] = useState(true);

  useEffect(() => {
    if (!character || !targetClass) {
      setResult(createEmptyValidationResult());
      setCanMulticlass(true);
      return;
    }

    const validationResult = validateMulticlassAddition(character, targetClass);
    setResult(validationResult);
    setCanMulticlass(validationResult.isValid);
  }, [character, targetClass]);

  return {
    result,
    canMulticlass,
    errors: result.errors,
    warnings: result.warnings,
  };
}

/**
 * Hook for field-level validation with error tracking
 */
export function useFieldValidation() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, ValidationResult>>({});

  const setFieldResult = useCallback((fieldName: string, result: ValidationResult) => {
    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: result,
    }));
  }, []);

  const clearFieldResult = useCallback((fieldName: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const hasAnyErrors = Object.values(fieldErrors).some((r) => !r.isValid);
  
  const getAllErrors = useCallback(() => {
    return Object.entries(fieldErrors).flatMap(([field, result]) =>
      result.errors.map((error) => ({ ...error, field }))
    );
  }, [fieldErrors]);

  return {
    fieldErrors,
    setFieldResult,
    clearFieldResult,
    hasAnyErrors,
    getAllErrors,
  };
}
