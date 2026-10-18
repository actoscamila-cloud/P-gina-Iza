
/**
 * Removes undefined values from an object recursively to prevent Firestore errors.
 */
export const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }

  const sanitized: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined) {
      sanitized[key] = sanitizeForFirestore(value);
    }
  });
  return sanitized;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

import { auth } from '../firebase';

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };

  const isQuotaExceeded = /quota/i.test(errMessage) || /RESOURCE_EXHAUSTED/i.test(errMessage);

  if (isQuotaExceeded) {
    console.warn(`[Firestore Quota Exceeded] Operation: ${operationType} on ${path}:`, errMessage);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('roones:firestore-quota-exceeded', { detail: errInfo }));
      window.dispatchEvent(new CustomEvent('vertus:firestore-quota-exceeded', { detail: errInfo }));
    }
    return;
  }

  console.error('Firestore Error details:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
