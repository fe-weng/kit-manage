export default function PetCollectionPage() {
  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 24px)',
        paddingBottom: '24px',
        paddingLeft: '20px',
        paddingRight: '20px',
      }}
    >
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
        宠物图鉴
      </h1>
    </div>
  )
}
