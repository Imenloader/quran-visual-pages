import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleFirestoreError, OperationType, auth } from '../firebase';

vi.mock('../firebase', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    auth: {
      currentUser: {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
        isAnonymous: false,
        tenantId: 'test-tenant',
        providerData: [
          {
            providerId: 'google.com',
            displayName: 'Test User',
            email: 'test@example.com',
            photoURL: 'https://example.com/photo.jpg'
          }
        ]
      }
    }
  };
});

describe('handleFirestoreError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should redact sensitive information in the error info', () => {
    const error = new Error('Test Firestore Error');
    const operationType = OperationType.CREATE;
    const path = 'test/path';

    try {
      handleFirestoreError(error, operationType, path);
    } catch (e: any) {
      const errInfo = JSON.parse(e.message);

      expect(errInfo.authInfo.userId).toBe('test-uid');
      expect(errInfo.authInfo.email).toBe('[REDACTED]');
      expect(errInfo.authInfo.providerInfo[0].displayName).toBe('[REDACTED]');
      expect(errInfo.authInfo.providerInfo[0].email).toBe('[REDACTED]');
      expect(errInfo.authInfo.providerInfo[0].photoUrl).toBe('[REDACTED]');

      expect(errInfo.error).toBe('Test Firestore Error');
      expect(errInfo.operationType).toBe(OperationType.CREATE);
      expect(errInfo.path).toBe('test/path');
    }

    expect(console.error).toHaveBeenCalled();
    const consoleArgs = (console.error as any).mock.calls[0];
    expect(consoleArgs[0]).toBe('Firestore Error: ');
    const loggedInfo = JSON.parse(consoleArgs[1]);
    expect(loggedInfo.authInfo.email).toBe('[REDACTED]');
  });
});
