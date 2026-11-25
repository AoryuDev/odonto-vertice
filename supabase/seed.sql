insert into public.dentists
  (id, slug, full_name, specialty, cro_registration, photo_key, is_technical_lead, sort_order)
values
  ('0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0001', 'helena-prado', 'Helena Prado Sato', 'general_dentistry', 'CRO-GO 11482', 'helena-prado', true, 1),
  ('0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0002', 'rafael-tavares', 'Rafael Mendes Tavares', 'orthodontics', 'CRO-GO 13907', 'rafael-tavares', false, 2),
  ('0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0003', 'camila-arantes', 'Camila Borges Arantes', 'implantology', 'CRO-GO 12655', 'camila-arantes', false, 3);

insert into public.dentist_translations (dentist_id, locale, display_name, headline, bio, education)
values
  (
    '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0001',
    'pt',
    'Dra. Helena Prado',
    'Clínica geral e prevenção. É quem recebe a maioria dos pacientes na primeira consulta e acompanha famílias inteiras.',
    array[
      'Helena atende em Goiânia há quinze anos. Faz a maior parte das primeiras avaliações da clínica e coordena o plano de tratamento quando o caso envolve mais de um especialista.',
      'No consultório, mostra na tela o que está vendo pela câmera intraoral e deixa o paciente decidir o ritmo do tratamento. Atende adultos e crianças a partir de seis anos.'
    ],
    array[
      'Graduação em Odontologia',
      'Especialização em Dentística Restauradora',
      'Atualização em Odontopediatria'
    ]
  ),
  (
    '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0001',
    'en',
    'Dr. Helena Prado',
    'General and preventive dentistry. She sees most patients at their first visit and looks after whole families.',
    array[
      'Helena has been practicing in Goiânia for fifteen years. She does most of the clinic’s first exams and coordinates the treatment plan when a case involves more than one specialist.',
      'In the chair, she shows you on screen what the intraoral camera is picking up and lets you set the pace of treatment. She sees adults and children from age six.'
    ],
    array[
      'Degree in Dentistry',
      'Specialization in Restorative Dentistry',
      'Continuing education in Pediatric Dentistry'
    ]
  ),
  (
    '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0002',
    'pt',
    'Dr. Rafael Tavares',
    'Ortodontista. Acompanha aparelhos fixos e alinhadores de adolescentes e adultos, com planos divididos em etapas claras.',
    array[
      'Rafael passou alguns anos na clínica geral antes de se especializar em ortodontia, e isso aparece no planejamento: antes de mover qualquer dente, confere gengiva, restaurações e mordida.',
      'Atende muitos adultos que adiaram o aparelho por anos. Prefere explicar cada fase com antecedência, para que o paciente saiba o que vai acontecer em cada manutenção.'
    ],
    array[
      'Graduação em Odontologia',
      'Especialização em Ortodontia',
      'Certificação em alinhadores ortodônticos'
    ]
  ),
  (
    '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0002',
    'en',
    'Dr. Rafael Tavares',
    'Orthodontist. Looks after braces and clear aligners for teens and adults, with plans broken into clear stages.',
    array[
      'Rafael spent a few years in general dentistry before specializing in orthodontics, and it shows in his planning: before moving a single tooth, he checks your gums, fillings and bite.',
      'He sees many adults who put off braces for years. He likes to explain each stage ahead of time, so you know exactly what will happen at every adjustment.'
    ],
    array[
      'Degree in Dentistry',
      'Specialization in Orthodontics',
      'Certified in clear aligner therapy'
    ]
  ),
  (
    '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0003',
    'pt',
    'Dra. Camila Arantes',
    'Implantodontista. Planeja reabilitações com implantes e próteses, do exame de imagem até a prótese final.',
    array[
      'Camila trabalha com implantes há mais de dez anos e planeja cada cirurgia a partir da tomografia, o que encurta o procedimento e o pós-operatório.',
      'Para ela, uma boa avaliação de implante é aquela em que o paciente entende por que o tratamento é indicado, ou por que ainda não é. Também atende clareamento e urgências.'
    ],
    array[
      'Graduação em Odontologia',
      'Especialização em Implantodontia',
      'Mestrado em Clínica Odontológica'
    ]
  ),
  (
    '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0003',
    'en',
    'Dr. Camila Arantes',
    'Implant dentist. Plans implant and prosthetic treatment from the first scan to the final crown.',
    array[
      'Camila has worked with implants for over ten years and plans every surgery from a CT scan, which makes both the procedure and the recovery shorter.',
      'For her, a good implant consultation is one where you understand why treatment is recommended, or why it isn’t yet. She also handles whitening and emergencies.'
    ],
    array[
      'Degree in Dentistry',
      'Specialization in Implant Dentistry',
      'Master’s in Clinical Dentistry'
    ]
  );

insert into public.treatments (id, slug, duration_minutes, photo_key, is_urgent, sort_order)
values
  ('5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0001', 'avaliacao', 30, 'avaliacao', false, 1),
  ('5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0002', 'limpeza', 45, 'limpeza', false, 2),
  ('5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0003', 'restauracao', 60, 'restauracao', false, 3),
  ('5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0004', 'clareamento', 60, 'clareamento', false, 4),
  ('5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0005', 'manutencao-de-aparelho', 30, 'manutencao-de-aparelho', false, 5),
  ('5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0006', 'avaliacao-de-implante', 45, 'avaliacao-de-implante', false, 6),
  ('5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0007', 'urgencia', 30, 'urgencia', true, 7);

insert into public.treatment_translations (treatment_id, locale, name, summary, content)
values
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0001',
    'pt',
    'Avaliação',
    'Primeira consulta para examinar dentes, gengiva e mordida, ouvir o que incomoda e montar um plano de tratamento por escrito.',
    $json${
      "intro": [
        "Na avaliação, o dentista examina dentes, gengiva, mordida e articulação, e conversa com você sobre o que incomoda — e sobre o que ainda não incomoda, mas merece atenção.",
        "Se for preciso, pedimos radiografias. Você sai com um plano dividido por prioridade, explicado sem termos técnicos, e decide com calma por onde começar."
      ],
      "forWhom": [
        "Quem está há mais de um ano sem ir ao dentista",
        "Quem sente sensibilidade, sangramento na gengiva ou dor ao mastigar",
        "Famílias que querem acompanhar a saúde bucal das crianças",
        "Quem quer uma segunda opinião sobre um tratamento indicado em outro lugar"
      ],
      "steps": [
        { "title": "Conversa inicial", "body": "Histórico de saúde, medicamentos em uso e o motivo da consulta." },
        { "title": "Exame clínico", "body": "Dentes, gengiva, mucosa, mordida e articulação temporomandibular." },
        { "title": "Plano de tratamento", "body": "Prioridades, número estimado de sessões e cuidados de casa, entregues por escrito." }
      ],
      "preparation": [
        "Traga a lista dos medicamentos que você usa e exames recentes, se tiver.",
        "Se for usar convênio, leve a carteirinha e um documento com foto."
      ],
      "aftercare": [
        "O plano fica com você. Se surgir dúvida em casa, ligue para a recepção e repassamos com o dentista."
      ],
      "faqs": [
        { "question": "A avaliação dói?", "answer": "Não. É um exame visual, com instrumentos delicados. Se houver uma área sensível, o dentista avisa antes de tocar." },
        { "question": "Preciso fazer radiografia?", "answer": "Só quando o exame clínico não basta para fechar o diagnóstico. Nesse caso, explicamos o motivo antes de pedir." }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0001',
    'en',
    'Dental exam',
    'A first visit to check your teeth, gums and bite, listen to what’s bothering you and put together a written treatment plan.',
    $json${
      "intro": [
        "At your exam, the dentist checks your teeth, gums, bite and jaw joint, and talks with you about what’s bothering you — and about anything that isn’t bothering you yet but deserves attention.",
        "If needed, we take X-rays. You leave with a plan sorted by priority, explained without jargon, and you decide in your own time where to start."
      ],
      "forWhom": [
        "Anyone who hasn’t seen a dentist in over a year",
        "Anyone with sensitivity, bleeding gums or pain when chewing",
        "Families who want to keep an eye on their children’s oral health",
        "Anyone looking for a second opinion on treatment recommended elsewhere"
      ],
      "steps": [
        {
          "title": "Getting to know you",
          "body": "Your health history, current medications and what brings you in."
        },
        {
          "title": "Clinical exam",
          "body": "Teeth, gums, soft tissue, bite and jaw joint (TMJ)."
        },
        {
          "title": "Treatment plan",
          "body": "Priorities, an estimated number of sessions and home care, all in writing."
        }
      ],
      "preparation": [
        "Bring a list of the medications you take and any recent test results, if you have them.",
        "If you’re using insurance, bring your plan card and a photo ID."
      ],
      "aftercare": [
        "The plan is yours to keep. If a question comes up at home, call our front desk and we’ll go over it with the dentist."
      ],
      "faqs": [
        {
          "question": "Does the exam hurt?",
          "answer": "No. It’s a visual exam with gentle instruments. If an area is sensitive, the dentist will tell you before touching it."
        },
        {
          "question": "Will I need X-rays?",
          "answer": "Only when the clinical exam isn’t enough to reach a diagnosis. If so, we’ll explain why before taking them."
        }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0002',
    'pt',
    'Limpeza',
    'Remoção de tártaro e placa, polimento e ajuste da escovação. É a consulta que evita a maior parte dos tratamentos maiores.',
    $json${
      "intro": [
        "A limpeza profissional remove o tártaro que a escova e o fio não alcançam, principalmente atrás dos dentes da frente e rente à gengiva.",
        "Aproveitamos a consulta para procurar cáries no começo e sinais de inflamação na gengiva. Para a maioria das pessoas, o ideal é voltar a cada seis meses."
      ],
      "forWhom": [
        "Quem nota a gengiva sangrando ao escovar ou passar fio",
        "Quem tem mau hálito que não melhora com a escovação",
        "Quem usa aparelho ou tem implantes e precisa de manutenção periódica",
        "Gestantes, com liberação do obstetra"
      ],
      "steps": [
        { "title": "Raspagem", "body": "Remoção do tártaro com ultrassom e instrumentos manuais." },
        { "title": "Polimento", "body": "Pasta profilática para tirar manchas leves de café, chá e vinho." },
        { "title": "Orientação", "body": "Ajuste da técnica de escovação e indicação de escova e fio para o seu caso." }
      ],
      "preparation": [
        "Escove os dentes normalmente antes de vir. Não é preciso jejum."
      ],
      "aftercare": [
        "Uma leve sensibilidade nas primeiras horas é normal e passa sozinha.",
        "Evite café, chá preto e vinho tinto nas duas horas seguintes ao polimento."
      ],
      "faqs": [
        { "question": "A limpeza desgasta o esmalte?", "answer": "Não. O ultrassom remove o tártaro, que fica por cima do esmalte, sem desgastar o dente." },
        { "question": "O convênio cobre a limpeza?", "answer": "A maioria dos planos odontológicos cobre. A recepção confirma a cobertura do seu plano antes do atendimento." }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0002',
    'en',
    'Cleaning',
    'Tartar and plaque removal, polishing and a brushing check-in. It’s the visit that prevents most bigger treatments.',
    $json${
      "intro": [
        "A professional cleaning removes the tartar your toothbrush and floss can’t reach, especially behind the front teeth and along the gumline.",
        "We also use the visit to look for early cavities and signs of gum inflammation. For most people, coming back every six months is ideal."
      ],
      "forWhom": [
        "Anyone whose gums bleed when brushing or flossing",
        "Anyone with bad breath that brushing doesn’t fix",
        "People with braces or implants who need regular maintenance",
        "Pregnant patients, with their obstetrician’s approval"
      ],
      "steps": [
        {
          "title": "Scaling",
          "body": "Tartar removal with ultrasonic and hand instruments."
        },
        {
          "title": "Polishing",
          "body": "Prophy paste to lift light stains from coffee, tea and wine."
        },
        {
          "title": "Coaching",
          "body": "Fine-tuning your brushing technique and recommending a brush and floss that suit your mouth."
        }
      ],
      "preparation": [
        "Brush your teeth as usual before you come. No need to fast."
      ],
      "aftercare": [
        "Slight sensitivity in the first few hours is normal and goes away on its own.",
        "Avoid coffee, black tea and red wine for two hours after polishing."
      ],
      "faqs": [
        {
          "question": "Does a cleaning wear down enamel?",
          "answer": "No. The ultrasonic scaler removes tartar, which sits on top of the enamel, without wearing the tooth down."
        },
        {
          "question": "Does insurance cover cleanings?",
          "answer": "Most dental plans do. Our front desk confirms your plan’s coverage before the visit."
        }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0003',
    'pt',
    'Restauração',
    'Tratamento de cáries e reparo de dentes lascados com resina na cor do dente, preservando o máximo de estrutura saudável.',
    $json${
      "intro": [
        "Quando a cárie é tratada cedo, a restauração é pequena e rápida. Removemos só o tecido comprometido e reconstruímos o dente com resina composta, na tonalidade do seu esmalte.",
        "Também substituímos restaurações antigas que estejam com infiltração, fratura ou desgaste, sempre que houver indicação clínica."
      ],
      "forWhom": [
        "Cáries identificadas na avaliação ou na radiografia",
        "Dentes lascados ou com pequenas fraturas",
        "Restaurações antigas com infiltração, manchas nas bordas ou desgaste"
      ],
      "steps": [
        { "title": "Anestesia local", "body": "Um anestésico em gel vem antes, para a picada quase não ser sentida." },
        { "title": "Remoção da cárie", "body": "Isolamento do dente e limpeza cuidadosa da área afetada." },
        { "title": "Reconstrução", "body": "Resina aplicada em camadas, modelada e polida para encaixar na sua mordida." }
      ],
      "preparation": [
        "Faça uma refeição leve antes; depois da anestesia é melhor esperar para comer."
      ],
      "aftercare": [
        "Espere o efeito da anestesia passar antes de comer, para não morder a bochecha.",
        "Se a mordida parecer alta depois de um ou dois dias, volte para um ajuste rápido."
      ],
      "faqs": [
        { "question": "Quanto tempo dura uma restauração de resina?", "answer": "Com boa higiene e revisões periódicas, muitos anos. Bruxismo e alimentação muito ácida reduzem essa durabilidade." },
        { "question": "Dá para restaurar mais de um dente na mesma consulta?", "answer": "Sim, quando estão do mesmo lado da boca. O dentista organiza isso no plano de tratamento." }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0003',
    'en',
    'Filling',
    'Treating cavities and repairing chipped teeth with tooth-colored resin, keeping as much healthy tooth as possible.',
    $json${
      "intro": [
        "When a cavity is caught early, the filling is small and quick. We remove only the damaged tissue and rebuild the tooth with composite resin matched to your enamel.",
        "We also replace old fillings that are leaking, cracked or worn down whenever there’s a clinical reason to."
      ],
      "forWhom": [
        "Cavities found during an exam or on an X-ray",
        "Chipped teeth or small fractures",
        "Old fillings with leaks, stained edges or wear"
      ],
      "steps": [
        {
          "title": "Local anesthetic",
          "body": "A numbing gel goes on first, so you barely feel the injection."
        },
        {
          "title": "Removing the decay",
          "body": "The tooth is isolated and the affected area carefully cleaned."
        },
        {
          "title": "Rebuilding",
          "body": "Resin applied in layers, then shaped and polished to fit your bite."
        }
      ],
      "preparation": [
        "Have a light meal beforehand; after the anesthetic it’s best to wait before eating."
      ],
      "aftercare": [
        "Wait for the numbness to wear off before eating, so you don’t bite your cheek.",
        "If your bite feels high after a day or two, come back for a quick adjustment."
      ],
      "faqs": [
        {
          "question": "How long does a resin filling last?",
          "answer": "With good hygiene and regular check-ups, many years. Teeth grinding and a very acidic diet shorten that."
        },
        {
          "question": "Can you fill more than one tooth in the same visit?",
          "answer": "Yes, when they’re on the same side of the mouth. The dentist plans this in your treatment plan."
        }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0004',
    'pt',
    'Clareamento',
    'Clareamento supervisionado, com moldeira feita sob medida e acompanhamento da sensibilidade em cada etapa.',
    $json${
      "intro": [
        "Antes de clarear, conferimos se dentes e gengiva estão saudáveis. Restaurações e coroas nos dentes da frente mudam o plano, porque resina e porcelana não clareiam.",
        "Trabalhamos com clareamento caseiro supervisionado, com moldeiras feitas a partir do molde da sua boca, e com sessões no consultório quando o caso pede. O objetivo é um tom natural, que combine com o seu rosto."
      ],
      "forWhom": [
        "Dentes amarelados pelo tempo, café, chá ou cigarro",
        "Quem vai fazer restaurações na frente e quer definir a cor antes",
        "Adultos com gengiva saudável e sem cáries ativas"
      ],
      "steps": [
        { "title": "Registro da cor", "body": "Fotografia e escala de cor para acompanhar a evolução." },
        { "title": "Moldagem", "body": "Moldeiras individuais, finas e confortáveis para usar em casa." },
        { "title": "Acompanhamento", "body": "Retornos para medir o avanço e ajustar o gel se houver sensibilidade." }
      ],
      "preparation": [
        "Se fez limpeza há mais de seis meses, faremos uma antes de começar."
      ],
      "aftercare": [
        "Durante o clareamento, reduza café, chá preto, vinho tinto, açaí e molhos escuros.",
        "Sensibilidade leve é comum. Avise a clínica se ela atrapalhar o dia a dia."
      ],
      "faqs": [
        { "question": "Clareamento enfraquece os dentes?", "answer": "Não, quando feito com acompanhamento e na concentração indicada. O gel age no pigmento, sem remover esmalte." },
        { "question": "Quanto tempo dura o resultado?", "answer": "Em geral, de um a três anos, dependendo da alimentação. Uma manutenção curta com a mesma moldeira recupera a cor." }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0004',
    'en',
    'Whitening',
    'Dentist-supervised whitening with custom-made trays and a sensitivity check at every step.',
    $json${
      "intro": [
        "Before whitening, we make sure your teeth and gums are healthy. Fillings and crowns on the front teeth change the plan, because resin and porcelain don’t whiten.",
        "We offer supervised at-home whitening with trays made from impressions of your mouth, plus in-office sessions when your case calls for it. The goal is a natural shade that suits your face."
      ],
      "forWhom": [
        "Teeth yellowed by time, coffee, tea or smoking",
        "Anyone getting front fillings who wants to set the shade first",
        "Adults with healthy gums and no active cavities"
      ],
      "steps": [
        {
          "title": "Recording your shade",
          "body": "Photos and a shade guide to track your progress."
        },
        {
          "title": "Impressions",
          "body": "Thin, comfortable custom trays to wear at home."
        },
        {
          "title": "Follow-up",
          "body": "Check-ins to measure progress and adjust the gel if you feel sensitivity."
        }
      ],
      "preparation": [
        "If your last cleaning was more than six months ago, we’ll do one before we start."
      ],
      "aftercare": [
        "While whitening, cut back on coffee, black tea, red wine, açaí and dark sauces.",
        "Mild sensitivity is common. Let us know if it gets in the way of your day."
      ],
      "faqs": [
        {
          "question": "Does whitening weaken teeth?",
          "answer": "No, not when it’s supervised and the right concentration is used. The gel works on the pigment without removing enamel."
        },
        {
          "question": "How long do the results last?",
          "answer": "Usually one to three years, depending on your diet. A short touch-up with the same trays brings the shade back."
        }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0005',
    'pt',
    'Manutenção de aparelho',
    'Ajuste periódico do aparelho, troca de borrachas e conferência do plano ortodôntico com o mesmo profissional do início ao fim.',
    $json${
      "intro": [
        "Na manutenção, o ortodontista ajusta fios e elásticos para que os dentes continuem se movendo na direção planejada. Faltar a essas consultas é o que mais atrasa um tratamento.",
        "Também atendemos quem começou o tratamento em outra clínica, depois de avaliar a documentação e o planejamento existente."
      ],
      "forWhom": [
        "Pacientes com aparelho fixo metálico ou estético",
        "Usuários de alinhadores que precisam de acompanhamento",
        "Quem começou o tratamento em outra clínica e quer dar continuidade"
      ],
      "steps": [
        { "title": "Conferência", "body": "Bráquetes soltos, higiene e evolução desde a última consulta." },
        { "title": "Ajuste", "body": "Troca de fio, ligaduras ou elásticos conforme a fase do tratamento." },
        { "title": "Orientação", "body": "Como usar os elásticos em casa e o que evitar comer até o próximo retorno." }
      ],
      "preparation": [
        "Escove os dentes e o aparelho com cuidado antes da consulta."
      ],
      "aftercare": [
        "Um incômodo nos dois primeiros dias depois do ajuste é esperado.",
        "Se um bráquete soltar ou um fio machucar, marque uma urgência em vez de esperar a próxima manutenção."
      ],
      "faqs": [
        { "question": "De quanto em quanto tempo é a manutenção?", "answer": "Normalmente a cada 30 a 45 dias. O ortodontista define o intervalo conforme a fase do tratamento." },
        { "question": "Posso fazer a manutenção aqui se coloquei o aparelho em outro lugar?", "answer": "Sim. Na primeira consulta avaliamos o caso e pedimos a documentação ortodôntica, se você tiver." }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0005',
    'en',
    'Braces adjustment',
    'Regular adjustments, new elastics and a check on your orthodontic plan, with the same orthodontist from start to finish.',
    $json${
      "intro": [
        "At each adjustment, the orthodontist fine-tunes wires and elastics so your teeth keep moving in the planned direction. Missing these visits is the main thing that slows treatment down.",
        "We also see patients who started treatment at another practice, once we’ve reviewed their records and existing plan."
      ],
      "forWhom": [
        "Patients with metal or clear braces",
        "Aligner patients who need regular check-ins",
        "Anyone who started treatment elsewhere and wants to continue it here"
      ],
      "steps": [
        {
          "title": "Check",
          "body": "Loose brackets, hygiene and progress since your last visit."
        },
        {
          "title": "Adjustment",
          "body": "A new wire, ties or elastics, depending on your treatment stage."
        },
        {
          "title": "Guidance",
          "body": "How to wear your elastics at home and what to avoid eating until your next visit."
        }
      ],
      "preparation": [
        "Brush your teeth and braces carefully before your appointment."
      ],
      "aftercare": [
        "Some soreness in the first two days after an adjustment is expected.",
        "If a bracket comes loose or a wire is poking you, book an emergency visit rather than waiting for your next adjustment."
      ],
      "faqs": [
        {
          "question": "How often are adjustments?",
          "answer": "Usually every 30 to 45 days. The orthodontist sets the interval based on your treatment stage."
        },
        {
          "question": "Can I have my adjustments here if I got my braces somewhere else?",
          "answer": "Yes. At your first visit we assess your case and ask for your orthodontic records, if you have them."
        }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0006',
    'pt',
    'Avaliação de implante',
    'Consulta com a implantodontista para avaliar osso, gengiva e saúde geral antes de indicar implante, prótese ou outra alternativa.',
    $json${
      "intro": [
        "Nem toda falta de dente se resolve com implante, e nem todo implante pode ser feito de imediato. Nesta consulta avaliamos o osso, a gengiva, a mordida e condições como diabetes e uso de anticoagulantes.",
        "Quando o implante é indicado, pedimos uma tomografia e explicamos as etapas, o tempo de cicatrização e o tipo de prótese que vai por cima. Quando não é, apresentamos as alternativas."
      ],
      "forWhom": [
        "Quem perdeu um ou mais dentes",
        "Quem usa prótese removível e quer mais firmeza para mastigar",
        "Quem tem um dente sem possibilidade de tratamento e quer planejar a substituição"
      ],
      "steps": [
        { "title": "Histórico de saúde", "body": "Doenças, medicamentos e hábitos que influenciam a cicatrização." },
        { "title": "Exame clínico", "body": "Região do implante, dentes vizinhos e mordida." },
        { "title": "Planejamento", "body": "Pedido de tomografia e explicação das etapas e dos prazos." }
      ],
      "preparation": [
        "Traga exames de sangue recentes e tomografias anteriores, se tiver.",
        "Avise se usa anticoagulante, bifosfonato ou insulina."
      ],
      "aftercare": [
        "Com a tomografia em mãos, marcamos o retorno para fechar o planejamento cirúrgico."
      ],
      "faqs": [
        { "question": "Quem tem diabetes pode colocar implante?", "answer": "Em muitos casos, sim, com a glicemia controlada e acompanhamento médico. A avaliação define se é o momento." },
        { "question": "Quanto tempo leva o tratamento completo?", "answer": "Depende do osso disponível. Em média, de três a seis meses entre a cirurgia e a prótese definitiva." }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0006',
    'en',
    'Implant consultation',
    'A visit with our implant dentist to assess bone, gums and overall health before recommending an implant, a denture or another option.',
    $json${
      "intro": [
        "Not every missing tooth is best replaced with an implant, and not every implant can be placed right away. At this visit we assess your bone, gums and bite, along with conditions such as diabetes and blood thinner use.",
        "When an implant is the right call, we order a CT scan and walk you through the stages, the healing time and the type of crown or denture that goes on top. When it isn’t, we go over the alternatives."
      ],
      "forWhom": [
        "Anyone who has lost one or more teeth",
        "Denture wearers who want a firmer bite",
        "Anyone with a tooth that can’t be saved who wants to plan its replacement"
      ],
      "steps": [
        {
          "title": "Health history",
          "body": "Conditions, medications and habits that affect healing."
        },
        {
          "title": "Clinical exam",
          "body": "The implant site, the neighboring teeth and your bite."
        },
        {
          "title": "Planning",
          "body": "A CT scan request and a clear explanation of the stages and timeline."
        }
      ],
      "preparation": [
        "Bring recent blood work and any previous CT scans, if you have them.",
        "Let us know if you take blood thinners, bisphosphonates or insulin."
      ],
      "aftercare": [
        "Once you have your CT scan, we’ll book a follow-up to finalize the surgical plan."
      ],
      "faqs": [
        {
          "question": "Can people with diabetes get implants?",
          "answer": "In many cases, yes, with well-controlled blood sugar and medical follow-up. The consultation tells us whether now is the right time."
        },
        {
          "question": "How long does the whole treatment take?",
          "answer": "It depends on how much bone is available. On average, three to six months between surgery and the final crown."
        }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0007',
    'pt',
    'Urgência',
    'Atendimento no mesmo dia, conforme a agenda, para dor forte, inchaço, dente quebrado ou restauração que caiu.',
    $json${
      "intro": [
        "Na urgência, o objetivo é aliviar a dor e controlar o problema. Fazemos o diagnóstico, o procedimento necessário naquele momento e já agendamos o tratamento definitivo.",
        "Se você está com o rosto muito inchado, febre ou dificuldade para engolir ou respirar, procure um pronto-socorro imediatamente."
      ],
      "forWhom": [
        "Dor de dente forte ou latejante",
        "Dente quebrado ou restauração que caiu",
        "Inchaço na gengiva",
        "Bráquete solto ou fio de aparelho machucando"
      ],
      "steps": [
        { "title": "Triagem", "body": "Onde dói, desde quando e o que piora ou alivia." },
        { "title": "Alívio", "body": "Drenagem, curativo, ajuste ou restauração provisória, conforme o caso." },
        { "title": "Próximo passo", "body": "Agendamento do tratamento definitivo e orientação de medicação, se necessário." }
      ],
      "preparation": [
        "Anote os remédios que já tomou para a dor e em que horário."
      ],
      "aftercare": [
        "Tome apenas os medicamentos indicados pelo dentista.",
        "Se a dor voltar forte ou surgir inchaço, ligue para a clínica."
      ],
      "faqs": [
        { "question": "Vocês atendem urgência fora do horário?", "answer": "Não temos plantão noturno. Fora do horário de funcionamento, procure um pronto-socorro odontológico." },
        { "question": "Preciso já ser paciente da clínica?", "answer": "Não. Atendemos urgências de novos pacientes nos horários livres do dia." }
      ]
    }$json$::jsonb
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0007',
    'en',
    'Emergency visit',
    'Same-day care, subject to availability, for severe pain, swelling, a broken tooth or a filling that fell out.',
    $json${
      "intro": [
        "At an emergency visit, the goal is to relieve the pain and get the problem under control. We diagnose it, do what’s needed right then and book the definitive treatment.",
        "If your face is very swollen, or you have a fever or trouble swallowing or breathing, go to an emergency room right away."
      ],
      "forWhom": [
        "Severe or throbbing toothache",
        "A broken tooth or a filling that fell out",
        "Swollen gums",
        "A loose bracket or a braces wire that’s hurting you"
      ],
      "steps": [
        {
          "title": "Triage",
          "body": "Where it hurts, since when, and what makes it better or worse."
        },
        {
          "title": "Relief",
          "body": "Drainage, a dressing, an adjustment or a temporary filling, depending on the case."
        },
        {
          "title": "Next step",
          "body": "Booking the definitive treatment and guidance on medication, if needed."
        }
      ],
      "preparation": [
        "Write down any pain medication you’ve already taken and when."
      ],
      "aftercare": [
        "Take only the medication your dentist recommends.",
        "If the pain comes back strongly or swelling appears, call the clinic."
      ],
      "faqs": [
        {
          "question": "Do you see emergencies after hours?",
          "answer": "We don’t have an overnight service. Outside our opening hours, please go to a dental emergency room."
        },
        {
          "question": "Do I need to be an existing patient?",
          "answer": "No. We see new patients for emergencies in the day’s open slots."
        }
      ]
    }$json$::jsonb
  );

insert into public.dentist_treatments (dentist_id, treatment_id)
select d.id, t.id
from public.dentists d
join public.treatments t on (d.slug, t.slug) in (
  ('helena-prado', 'avaliacao'),
  ('helena-prado', 'limpeza'),
  ('helena-prado', 'restauracao'),
  ('helena-prado', 'clareamento'),
  ('helena-prado', 'urgencia'),
  ('rafael-tavares', 'avaliacao'),
  ('rafael-tavares', 'manutencao-de-aparelho'),
  ('camila-arantes', 'avaliacao'),
  ('camila-arantes', 'avaliacao-de-implante'),
  ('camila-arantes', 'clareamento'),
  ('camila-arantes', 'urgencia')
);

insert into public.weekly_schedules (dentist_id, weekday, starts_at, ends_at, lunch_starts_at, lunch_ends_at)
select d.id, s.weekday, s.starts_at, s.ends_at, s.lunch_starts_at, s.lunch_ends_at
from public.dentists d
join (
  values
    ('helena-prado', 1, time '08:00', time '18:00', time '12:00', time '13:30'),
    ('helena-prado', 2, time '08:00', time '18:00', time '12:00', time '13:30'),
    ('helena-prado', 3, time '08:00', time '18:00', time '12:00', time '13:30'),
    ('helena-prado', 4, time '08:00', time '18:00', time '12:00', time '13:30'),
    ('helena-prado', 5, time '08:00', time '18:00', time '12:00', time '13:30'),
    ('helena-prado', 6, time '08:00', time '12:00', null, null),
    ('rafael-tavares', 2, time '08:30', time '18:30', time '12:30', time '14:00'),
    ('rafael-tavares', 4, time '08:30', time '18:30', time '12:30', time '14:00'),
    ('rafael-tavares', 6, time '08:00', time '12:00', null, null),
    ('camila-arantes', 1, time '09:00', time '18:00', time '12:30', time '14:00'),
    ('camila-arantes', 3, time '09:00', time '18:00', time '12:30', time '14:00'),
    ('camila-arantes', 5, time '09:00', time '18:00', time '12:30', time '14:00')
) as s (slug, weekday, starts_at, ends_at, lunch_starts_at, lunch_ends_at) on s.slug = d.slug;

insert into public.holidays (date, name) values
  ('2026-01-01', 'Confraternização Universal'),
  ('2026-02-16', 'Carnaval'),
  ('2026-02-17', 'Carnaval'),
  ('2026-04-03', 'Sexta-feira Santa'),
  ('2026-04-21', 'Tiradentes'),
  ('2026-05-01', 'Dia do Trabalho'),
  ('2026-05-24', 'Nossa Senhora Auxiliadora, padroeira de Goiânia'),
  ('2026-06-04', 'Corpus Christi'),
  ('2026-09-07', 'Independência do Brasil'),
  ('2026-10-12', 'Nossa Senhora Aparecida'),
  ('2026-10-24', 'Aniversário de Goiânia'),
  ('2026-11-02', 'Finados'),
  ('2026-11-15', 'Proclamação da República'),
  ('2026-11-20', 'Dia da Consciência Negra'),
  ('2026-12-24', 'Recesso de Natal'),
  ('2026-12-25', 'Natal'),
  ('2026-12-31', 'Recesso de Ano-Novo'),
  ('2027-01-01', 'Confraternização Universal'),
  ('2027-02-08', 'Carnaval'),
  ('2027-02-09', 'Carnaval'),
  ('2027-03-26', 'Sexta-feira Santa'),
  ('2027-04-21', 'Tiradentes'),
  ('2027-05-01', 'Dia do Trabalho'),
  ('2027-05-24', 'Nossa Senhora Auxiliadora, padroeira de Goiânia'),
  ('2027-05-27', 'Corpus Christi'),
  ('2027-09-07', 'Independência do Brasil'),
  ('2027-10-12', 'Nossa Senhora Aparecida'),
  ('2027-10-24', 'Aniversário de Goiânia'),
  ('2027-11-02', 'Finados'),
  ('2027-11-15', 'Proclamação da República'),
  ('2027-11-20', 'Dia da Consciência Negra'),
  ('2027-12-24', 'Recesso de Natal'),
  ('2027-12-25', 'Natal'),
  ('2027-12-31', 'Recesso de Ano-Novo');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
select
  '00000000-0000-0000-0000-000000000000',
  u.id,
  'authenticated',
  'authenticated',
  u.email,
  extensions.crypt('vertice-demo-2026', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', u.full_name),
  now(),
  now(),
  '', '', '', ''
from (
  values
    ('9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0001'::uuid, 'recepcao@odontovertice.example', 'Juliana Ferreira'),
    ('9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0002'::uuid, 'helena@odontovertice.example', 'Helena Prado Sato'),
    ('9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0003'::uuid, 'rafael@odontovertice.example', 'Rafael Mendes Tavares'),
    ('9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0004'::uuid, 'camila@odontovertice.example', 'Camila Borges Arantes')
) as u (id, email, full_name);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.email like '%@odontovertice.example';

insert into public.staff_profiles (user_id, full_name, role, dentist_id) values
  ('9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0001', 'Juliana Ferreira', 'reception', null),
  ('9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0002', 'Helena Prado Sato', 'dentist', '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0001'),
  ('9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0003', 'Rafael Mendes Tavares', 'dentist', '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0002'),
  ('9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0004', 'Camila Borges Arantes', 'dentist', '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0003');

insert into public.patients (full_name, email, phone) values
  ('Mariana Lopes Ribeiro', 'mariana.ribeiro@example.com', '+5562991234501'),
  ('Eduardo Nunes Costa', 'eduardo.costa@example.com', '+5562991234502'),
  ('Beatriz Alves Moreira', 'beatriz.moreira@example.com', '+5562991234503'),
  ('Thiago Carvalho Lima', 'thiago.lima@example.com', '+5562991234504'),
  ('Fernanda Rocha Pires', 'fernanda.pires@example.com', '+5562991234505'),
  ('Gustavo Henrique Dias', 'gustavo.dias@example.com', '+5562991234506'),
  ('Larissa Campos Teixeira', 'larissa.teixeira@example.com', '+5562991234507'),
  ('Rodrigo Martins Freitas', 'rodrigo.freitas@example.com', '+5562991234508'),
  ('Patrícia Gomes Barbosa', 'patricia.barbosa@example.com', '+5562991234509'),
  ('André Luiz Fonseca', 'andre.fonseca@example.com', '+5562991234510'),
  ('Camila Rezende Souza', 'camila.souza@example.com', '+5562991234511'),
  ('Lucas Peixoto Andrade', 'lucas.andrade@example.com', '+5562991234512'),
  ('Renata Siqueira Melo', 'renata.melo@example.com', '+5562991234513'),
  ('Vinícius Araújo Prado', 'vinicius.prado@example.com', '+5562991234514');

insert into public.schedule_blocks (dentist_id, period, reason, created_by)
select d.id,
  tstzrange(
    (b.day + b.starts_at) at time zone 'America/Sao_Paulo',
    (b.day + b.ends_at) at time zone 'America/Sao_Paulo',
    '[)'
  ),
  b.reason,
  '9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0001'
from public.dentists d
join (
  select 'rafael-tavares' as slug,
    (date_trunc('week', (now() at time zone 'America/Sao_Paulo')::date + 7)::date + 5) as day,
    time '08:00' as starts_at, time '12:00' as ends_at,
    'Congresso de ortodontia' as reason
  union all
  select 'helena-prado',
    (date_trunc('week', (now() at time zone 'America/Sao_Paulo')::date + 7)::date + 2),
    time '14:00', time '18:00',
    'Curso de atualização'
) b on b.slug = d.slug;

do $$
declare
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_day date;
  v_schedule record;
  v_cursor time;
  v_window_end time;
  v_treatment record;
  v_patient_ids uuid[];
  v_starts timestamptz;
  v_ends timestamptz;
  v_seed int;
  v_status public.appointment_status;
begin
  select array_agg(id order by email) into v_patient_ids from public.patients;

  for v_day in select generate_series(v_today - 14, v_today + 21, interval '1 day')::date loop
    continue when exists (select 1 from public.holidays h where h.date = v_day);

    for v_schedule in
      select ws.*, d.slug
      from public.weekly_schedules ws
      join public.dentists d on d.id = ws.dentist_id
      where ws.weekday = extract(dow from v_day)
    loop
      v_cursor := v_schedule.starts_at;

      while v_cursor < v_schedule.ends_at loop
        v_window_end := case
          when v_schedule.lunch_starts_at is not null and v_cursor < v_schedule.lunch_starts_at
            then v_schedule.lunch_starts_at
          else v_schedule.ends_at
        end;

        if v_schedule.lunch_starts_at is not null
          and v_cursor >= v_schedule.lunch_starts_at
          and v_cursor < v_schedule.lunch_ends_at then
          v_cursor := v_schedule.lunch_ends_at;
          continue;
        end if;

        v_seed := abs(hashtext(v_schedule.slug || v_day::text || v_cursor::text));

        select t.id, t.duration_minutes into v_treatment
        from public.treatments t
        join public.dentist_treatments dt on dt.treatment_id = t.id and dt.dentist_id = v_schedule.dentist_id
        order by abs(hashtext(t.slug || v_seed::text))
        limit 1;

        v_starts := (v_day + v_cursor) at time zone 'America/Sao_Paulo';
        v_ends := v_starts + make_interval(mins => v_treatment.duration_minutes);

        if v_seed % 100 < 38
          and v_cursor + make_interval(mins => v_treatment.duration_minutes) <= v_window_end
          and not exists (
            select 1 from public.schedule_blocks b
            where b.dentist_id = v_schedule.dentist_id
              and b.period && tstzrange(v_starts, v_ends, '[)')
          )
          and (v_starts > now() + interval '3 hours' or v_ends < now()) then

          v_status := case
            when v_ends < now() and v_seed % 17 = 0 then 'no_show'
            when v_ends < now() then 'completed'
            else 'scheduled'
          end;

          insert into public.appointments (
            dentist_id, treatment_id, patient_id, period, status,
            payment_method, insurance_provider, manage_token_hash, source, locale
          ) values (
            v_schedule.dentist_id,
            v_treatment.id,
            v_patient_ids[1 + v_seed % array_length(v_patient_ids, 1)],
            tstzrange(v_starts, v_ends, '[)'),
            v_status,
            case when v_seed % 3 = 0 then 'insurance'::public.payment_method else 'private' end,
            case when v_seed % 3 = 0 then (array['OdontoCerrado', 'Plano Sorriso Centro-Oeste', 'Dental Vida', 'Uniodonto Planalto'])[1 + v_seed % 4] end,
            extensions.digest(extensions.gen_random_bytes(32), 'sha256'),
            case when v_seed % 4 = 0 then 'reception'::public.appointment_source else 'website' end,
            case when v_seed % 7 = 0 then 'en'::public.app_locale else 'pt' end
          );

          v_cursor := v_cursor + make_interval(mins => v_treatment.duration_minutes);
        else
          v_cursor := v_cursor + interval '30 minutes';
        end if;
      end loop;
    end loop;
  end loop;
end;
$$;
