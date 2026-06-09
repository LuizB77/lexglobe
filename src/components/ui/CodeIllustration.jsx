export default function CodeIllustration({ codeKey }) {
  const images = {
    // Brazil
    constituicao:  '/illustrations/constituicao.png',
    codigoPenal:   '/illustrations/codigoPenal.png',
    codigoCivil:   '/illustrations/codigoCivil.png',
    clt:           '/illustrations/clt.png',
    eca:           '/illustrations/eca.png',
    cdc:           '/illustrations/cdc.png',
    // Portugal
    constituicaoPT:      '/illustrations/constituicaoPT.png',
    codigoPenalPT:       '/illustrations/codigoPenalPT.png',
    codigoCivilPT:       '/illustrations/codigoCivilPT.png',
    codigoTrabalho:      '/illustrations/codigoTrabalhoPT.png',
    codigoProcessoPenal: '/illustrations/codigoProcessoPenal.png',
    codigoProcessoCivil: '/illustrations/codigoProcessoCivil.png',
    codigoComercial:     '/illustrations/codigoComercial.png',
    codigoEstrada:       '/illustrations/codigoEstrada.png',
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
        onError={e => {
          e.target.style.display = 'none'
        }}
      />
    </div>
  )
}
