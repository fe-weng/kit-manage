const recoveryBlobs = new Map<string, Blob>()

export function templateRecoveryKey(templateId: string): string {
  return `template:${templateId}`
}

export function draftRecoveryKey(draftId: string): string {
  return `draft:${draftId}`
}

export function readRecoveryBlob(key: string): Blob | null {
  return recoveryBlobs.get(key) ?? null
}

export function writeRecoveryBlob(key: string, blob: Blob): void {
  recoveryBlobs.set(key, blob)
}

export function clearRecoveryBlob(key: string): void {
  recoveryBlobs.delete(key)
}
