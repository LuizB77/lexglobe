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
    // Spain
    constitucionES:       '/illustrations/constitucionES.png',
    codigoPenalES:        '/illustrations/codigoPenalES.png',
    codigoCivilES:        '/illustrations/codigoCivilES.png',
    estatutoTrabajadores: '/illustrations/estatutoTrabajadores.png',
    // USA
    usConstitution:        '/illustrations/usConstitution.png',
    title18Criminal:       '/illustrations/title18Criminal.png',
    title42CivilRights:    '/illustrations/title42CivilRights.png',
    title29Labor:          '/illustrations/title29Labor.png',
    title26Tax:            '/illustrations/title26Tax.png',
    title15Commerce:       '/illustrations/title15Commerce.png',
    title8Immigration:     '/illustrations/title8Immigration.png',
    title20Education:      '/illustrations/title20Education.png',
    title31Finance:        '/illustrations/title31Finance.png',
    title49Transportation: '/illustrations/title49Transportation.png',
  }

  const src = images[codeKey]
  if (!src) return null

  return (
    <div className="w-full overflow-hidden rounded-xl"
      style={{ height: '100px' }}>
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
