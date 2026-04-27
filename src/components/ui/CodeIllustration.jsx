export default function CodeIllustration({ codeKey }) {
  const images = {
    constituicao: '/illustrations/constituicao.png',
    codigoPenal:  '/illustrations/codigoPenal.png',
    codigoCivil:  '/illustrations/codigoCivil.png',
    clt:          '/illustrations/clt.png',
    eca:          '/illustrations/eca.png',
    cdc:          '/illustrations/cdc.png',
  }

  const src = images[codeKey]
  if (!src) return null

  return (
    <div className="w-full overflow-hidden rounded-xl"
      style={{ height: '120px' }}>
      <img
        src={src}
        alt={codeKey}
        className="w-full h-full object-cover"
        style={{ objectPosition: 'center' }}
      />
    </div>
  )
}
