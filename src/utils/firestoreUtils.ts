/**
 * =========================================================================
 * FIRESTORE UTILITIES: UNDEFINED FIELD PURGER
 * =========================================================================
 * 
 * Firestore's setDoc(), addDoc(), and updateDoc() strictly reject objects containing
 * fields whose value is `undefined` (Error: Unsupported field value: undefined).
 * 
 * This utility recursively removes all `undefined` fields from objects and arrays
 * before they are passed to Firestore.
 * 
 * CRITICAL GUARANTEE:
 * Valid falsy values such as:
 *   - false
 *   - 0
 *   - "" (empty string)
 *   - null
 * are STRICTLY PRESERVED. Only actual `undefined` keys and values are omitted.
 */

export function removeUndefinedFields<T>(value: T): T {
  // If the root value is undefined, return undefined
  if (value === undefined) {
    return undefined as unknown as T;
  }

  // Primitive values (string, number, boolean, bigint, symbol) or null
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Preserve Date instances
  if (value instanceof Date) {
    return value;
  }

  // Preserve Firestore FieldValue or special internal objects if present
  if ('_methodName' in (value as any) || '_delegate' in (value as any)) {
    return value;
  }

  // Handle Arrays: recursively clean elements and filter out pure undefined items
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => removeUndefinedFields(item)) as unknown as T;
  }

  // Handle Plain Objects: omit keys whose value is undefined, recurse on nested objects
  const cleaned: Record<string, any> = {};

  for (const [key, val] of Object.entries(value)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object') {
        cleaned[key] = removeUndefinedFields(val);
      } else {
        cleaned[key] = val;
      }
    }
  }

  return cleaned as T;
}
