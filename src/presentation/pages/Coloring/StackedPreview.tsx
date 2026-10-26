import { useBlobUrl } from './coloringAssets'

interface StackedPreviewProps {
  lineUrl: string | null
  colorBlob?: Blob | null
  width: number
  height: number
  alt: string
}

export default function StackedPreview({
  lineUrl,
  colorBlob = null,
  width,
  height,
  alt,
}: StackedPreviewProps) {
  const colorUrl = useBlobUrl(colorBlob)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${width} / ${height}`,
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      {colorUrl && (
        <img
          src={colorUrl}
          alt=""
          draggable={false}
          className="no-native-img-gestures"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      )}
      {lineUrl && (
        <img
          src={lineUrl}
          alt={alt}
          draggable={false}
          className="no-native-img-gestures"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            mixBlendMode: 'multiply',
          }}
        />
      )}
    </div>
  )
}
