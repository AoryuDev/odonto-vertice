export const clinic = {
  name: 'Odonto Vértice',
  legalNote: 'Clínica fictícia criada como projeto de portfólio.',
  address: {
    street: 'Rua T-55, 930, sala 704',
    neighborhood: 'Setor Bueno',
    city: 'Goiânia',
    state: 'GO',
    postalCode: '74215-170',
    country: 'BR',
  },
  geo: { latitude: -16.7068, longitude: -49.2712 },
  phone: { display: '(62) 3920-4815', e164: '+556239204815' },
  whatsapp: { display: '(62) 99418-2730', e164: '+5562994182730' },
  email: 'contato@odontovertice.example',
  parking: 'Estacionamento conveniado no térreo do edifício.',
} as const

export function formatAddressLine(): string {
  const { street, neighborhood, city, state } = clinic.address
  return `${street} — ${neighborhood}, ${city} — ${state}`
}

export function directionsUrl(): string {
  const { latitude, longitude } = clinic.geo
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
}

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${clinic.whatsapp.e164.replace('+', '')}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
