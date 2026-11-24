import type { StaticImageData } from 'next/image'
import type { Messages } from '@/i18n/messages'
import clinicRoom from '@/assets/photos/clinic-room.jpg'
import consultation from '@/assets/photos/consultation.jpg'
import dentistCamila from '@/assets/photos/dentist-camila.jpg'
import dentistHelena from '@/assets/photos/dentist-helena.jpg'
import dentistRafael from '@/assets/photos/dentist-rafael.jpg'
import heroSmile from '@/assets/photos/hero-smile.jpg'
import reception from '@/assets/photos/reception.jpg'
import treatmentBraces from '@/assets/photos/treatment-braces.jpg'
import treatmentCleaning from '@/assets/photos/treatment-cleaning.jpg'
import treatmentImplant from '@/assets/photos/treatment-implant.jpg'
import treatmentRestoration from '@/assets/photos/treatment-restoration.jpg'
import treatmentUrgent from '@/assets/photos/treatment-urgent.jpg'
import treatmentWhitening from '@/assets/photos/treatment-whitening.jpg'

export type PhotoAltKey = keyof Messages['photoAlt']

export type Photo = {
  readonly src: StaticImageData
  readonly altKey: PhotoAltKey
  readonly credit: { readonly name: string; readonly handle: string; readonly url: string }
}

function unsplash(name: string, handle: string, url: string): Photo['credit'] {
  return { name, handle, url }
}

export const photos = {
  hero: {
    src: heroSmile,
    altKey: 'hero',
    credit: unsplash(
      'Lesly Juarez',
      'jblesly',
      'https://unsplash.com/photos/long-black-haired-woman-smiling-close-up-photography-1AhGNGKuhR0',
    ),
  },
  clinicRoom: {
    src: clinicRoom,
    altKey: 'clinicRoom',
    credit: unsplash(
      'Benyamin Bohlouli',
      'benyamin_bohlouli',
      'https://unsplash.com/photos/modern-dental-office-with-chair-and-equipment-e7MJLM5VGjY',
    ),
  },
  consultation: {
    src: consultation,
    altKey: 'consultation',
    credit: unsplash(
      'Caroline LM',
      'carocaro1987',
      'https://unsplash.com/photos/man-in-white-dress-shirt-holding-black-pen--m-4tYmtLlI',
    ),
  },
  reception: {
    src: reception,
    altKey: 'reception',
    credit: unsplash(
      'Caroline Badran',
      '___atmos',
      'https://unsplash.com/photos/woman-sitting-in-a-modern-waiting-room-reading-jH05wxjmAWE',
    ),
  },
  'treatment:avaliacao': {
    src: consultation,
    altKey: 'treatmentEvaluation',
    credit: unsplash(
      'Caroline LM',
      'carocaro1987',
      'https://unsplash.com/photos/man-in-white-dress-shirt-holding-black-pen--m-4tYmtLlI',
    ),
  },
  'treatment:limpeza': {
    src: treatmentCleaning,
    altKey: 'treatmentCleaning',
    credit: unsplash(
      'Caroline LM',
      'carocaro1987',
      'https://unsplash.com/photos/dental-exam-with-mirror-and-tool-8BkF0sTC6Uo',
    ),
  },
  'treatment:restauracao': {
    src: treatmentRestoration,
    altKey: 'treatmentRestoration',
    credit: unsplash(
      'Caroline LM',
      'carocaro1987',
      'https://unsplash.com/photos/dental-mirror-and-explorer-tool-ux18C551ghI',
    ),
  },
  'treatment:clareamento': {
    src: treatmentWhitening,
    altKey: 'treatmentWhitening',
    credit: unsplash(
      'Nolan Manning',
      'nolanrmanning',
      'https://unsplash.com/photos/smiling-woman-at-wooden-table-Ll9YOG20UFI',
    ),
  },
  'treatment:manutencao-de-aparelho': {
    src: treatmentBraces,
    altKey: 'treatmentBraces',
    credit: unsplash(
      'Atikah Akhtar',
      'atikahakhtar',
      'https://unsplash.com/photos/person-with-silver-teeth-braces-hKaYlAF1nDw',
    ),
  },
  'treatment:avaliacao-de-implante': {
    src: treatmentImplant,
    altKey: 'treatmentImplant',
    credit: unsplash(
      'Katarzyna Zygnerska',
      'katasha',
      'https://unsplash.com/photos/gloved-hand-holding-a-dental-implant-and-crown-eHwRLpfHSKY',
    ),
  },
  'treatment:urgencia': {
    src: treatmentUrgent,
    altKey: 'treatmentUrgent',
    credit: unsplash(
      'D Dental Office',
      'ddentalof1',
      'https://unsplash.com/photos/dentist-examining-teeth-in-dental-office-BiknMFl7iOw',
    ),
  },
  'dentist:helena-prado': {
    src: dentistHelena,
    altKey: 'dentistHelena',
    credit: unsplash(
      'Christina @ wocintechchat.com',
      'wocintechchat',
      'https://unsplash.com/photos/woman-on-focus-photography-SJvDxw0azqw',
    ),
  },
  'dentist:rafael-tavares': {
    src: dentistRafael,
    altKey: 'dentistRafael',
    credit: unsplash(
      'Willian Souza',
      'willsouzabr',
      'https://unsplash.com/photos/man-in-black-zip-up-jacket-p5BoBF0XJUA',
    ),
  },
  'dentist:camila-arantes': {
    src: dentistCamila,
    altKey: 'dentistCamila',
    credit: unsplash(
      'Jonathan Borba',
      'jonathanborba',
      'https://unsplash.com/photos/woman-in-black-long-sleeve-shirt-sitting-on-white-couch-n1B6ftPB5Eg',
    ),
  },
} as const satisfies Record<string, Photo>

export type PhotoKey = keyof typeof photos

export function treatmentPhoto(photoKey: string): Photo {
  return (photos as Record<string, Photo>)[`treatment:${photoKey}`] ?? photos.clinicRoom
}

export function dentistPhoto(photoKey: string): Photo {
  return (photos as Record<string, Photo>)[`dentist:${photoKey}`] ?? photos.clinicRoom
}

export function uniquePhotoCredits(): Photo[] {
  const seen = new Set<string>()
  return Object.values(photos).filter((photo: Photo) => {
    if (seen.has(photo.credit.url)) return false
    seen.add(photo.credit.url)
    return true
  })
}
