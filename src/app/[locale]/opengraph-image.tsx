import { OG_SIZE, renderOgImage } from '../og-template'

export const alt = 'Odonto Vértice — clínica odontológica no Setor Bueno, Goiânia'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return renderOgImage({
    eyebrow: 'Clínica odontológica',
    title: 'Clínica geral, ortodontia e implantes no Setor Bueno.',
  })
}
