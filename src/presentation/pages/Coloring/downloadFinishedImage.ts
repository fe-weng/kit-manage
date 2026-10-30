export function finishedDownloadName(createdAt: number): string {
  const date = new Date(createdAt)
  const pad = (value: number) => String(value).padStart(2, '0')
  const stamp = [
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`,
  ].join('-')
  return `涂色成品-${stamp}.png`
}

function isShareCancel(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

function canShareFile(file: File): boolean {
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false
  try {
    return navigator.canShare({ files: [file] })
  } catch {
    return false
  }
}

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

/** 优先系统分享，便于 iPad 存到文件或照片。不能分享时下载原始 PNG，不重新采样。 */
export async function shareOrDownloadFinishedImage(blob: Blob, createdAt: number): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], finishedDownloadName(createdAt), { type: 'image/png' })
  if (canShareFile(file)) {
    try {
      await navigator.share({ files: [file], title: '涂色成品' })
      return 'shared'
    } catch (err) {
      if (isShareCancel(err)) throw err
    }
  }
  downloadFile(file)
  return 'downloaded'
}
