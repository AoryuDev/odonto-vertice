import { Eyebrow } from '@/components/ui/eyebrow'
import { FaqList, type Faq } from '@/components/site/faq-list'

const FAQS: readonly Faq[] = [
  {
    question: 'Vocês atendem convênio?',
    answer:
      'Sim. Atendemos os principais planos odontológicos de Goiânia. Informe o nome do seu plano no agendamento: a recepção confirma a cobertura antes da consulta e avisa se algum procedimento precisar de autorização.',
  },
  {
    question: 'Por que o site não mostra valores?',
    answer:
      'As normas do Conselho Federal de Odontologia não permitem anunciar preços de tratamentos. Além disso, o custo depende do plano de tratamento, que você recebe por escrito depois da avaliação.',
  },
  {
    question: 'Como funciona o agendamento pelo site?',
    answer:
      'Você escolhe o tratamento, o dentista (ou qualquer um disponível) e um horário livre. A confirmação chega por e-mail na hora, com um link para remarcar ou cancelar sem precisar ligar.',
  },
  {
    question: 'Posso remarcar ou cancelar?',
    answer:
      'Pode, pelo link do e-mail de confirmação, até duas horas antes do horário. Depois disso, ligue para a recepção para liberarmos o horário.',
  },
  {
    question: 'Vocês atendem crianças?',
    answer:
      'A Dra. Helena atende crianças a partir de seis anos para prevenção, limpeza e restaurações. Para bebês e crianças menores, indicamos um odontopediatra de confiança.',
  },
  {
    question: 'E se eu estiver com dor agora?',
    answer:
      'Agende uma urgência pelo site: os horários livres do dia aparecem na hora. Se não houver vaga, ligue para a recepção que tentamos um encaixe.',
  },
]

export function FaqSection() {
  return (
    <section id="duvidas" className="container-page py-20 md:py-28">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Eyebrow>Dúvidas</Eyebrow>
          <h2 className="mt-5 text-title text-ink">Perguntas que a recepção mais ouve.</h2>
        </div>
        <div className="md:col-span-8">
          <FaqList items={FAQS} />
        </div>
      </div>
    </section>
  )
}

export { FAQS }
