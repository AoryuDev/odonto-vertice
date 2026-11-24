insert into public.dentists
  (id, slug, full_name, display_name, specialty, cro_registration, headline, bio, education, photo_key, is_technical_lead, sort_order)
values
  (
    '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0001',
    'helena-prado',
    'Helena Prado Sato',
    'Dra. Helena Prado',
    'general_dentistry',
    'CRO-GO 11482',
    'Clínica geral e prevenção. É quem recebe a maioria dos pacientes na primeira consulta e acompanha famílias inteiras.',
    array[
      'Helena atende em Goiânia há quinze anos. Faz a maior parte das primeiras avaliações da clínica e coordena o plano de tratamento quando o caso envolve mais de um especialista.',
      'No consultório, mostra na tela o que está vendo pela câmera intraoral e deixa o paciente decidir o ritmo do tratamento. Atende adultos e crianças a partir de seis anos.'
    ],
    array[
      'Graduação em Odontologia',
      'Especialização em Dentística Restauradora',
      'Atualização em Odontopediatria'
    ],
    'helena-prado',
    true,
    1
  ),
  (
    '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0002',
    'rafael-tavares',
    'Rafael Mendes Tavares',
    'Dr. Rafael Tavares',
    'orthodontics',
    'CRO-GO 13907',
    'Ortodontista. Acompanha aparelhos fixos e alinhadores de adolescentes e adultos, com planos divididos em etapas claras.',
    array[
      'Rafael passou alguns anos na clínica geral antes de se especializar em ortodontia, e isso aparece no planejamento: antes de mover qualquer dente, confere gengiva, restaurações e mordida.',
      'Atende muitos adultos que adiaram o aparelho por anos. Prefere explicar cada fase com antecedência, para que o paciente saiba o que vai acontecer em cada manutenção.'
    ],
    array[
      'Graduação em Odontologia',
      'Especialização em Ortodontia',
      'Certificação em alinhadores ortodônticos'
    ],
    'rafael-tavares',
    false,
    2
  ),
  (
    '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0003',
    'camila-arantes',
    'Camila Borges Arantes',
    'Dra. Camila Arantes',
    'implantology',
    'CRO-GO 12655',
    'Implantodontista. Planeja reabilitações com implantes e próteses, do exame de imagem até a prótese final.',
    array[
      'Camila trabalha com implantes há mais de dez anos e planeja cada cirurgia a partir da tomografia, o que encurta o procedimento e o pós-operatório.',
      'Para ela, uma boa avaliação de implante é aquela em que o paciente entende por que o tratamento é indicado, ou por que ainda não é. Também atende clareamento e urgências.'
    ],
    array[
      'Graduação em Odontologia',
      'Especialização em Implantodontia',
      'Mestrado em Clínica Odontológica'
    ],
    'camila-arantes',
    false,
    3
  );

insert into public.treatments (id, slug, name, duration_minutes, summary, content, photo_key, is_urgent, sort_order)
values
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0001',
    'avaliacao',
    'Avaliação',
    30,
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
    }$json$::jsonb,
    'avaliacao',
    false,
    1
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0002',
    'limpeza',
    'Limpeza',
    45,
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
    }$json$::jsonb,
    'limpeza',
    false,
    2
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0003',
    'restauracao',
    'Restauração',
    60,
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
    }$json$::jsonb,
    'restauracao',
    false,
    3
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0004',
    'clareamento',
    'Clareamento',
    60,
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
    }$json$::jsonb,
    'clareamento',
    false,
    4
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0005',
    'manutencao-de-aparelho',
    'Manutenção de aparelho',
    30,
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
    }$json$::jsonb,
    'manutencao-de-aparelho',
    false,
    5
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0006',
    'avaliacao-de-implante',
    'Avaliação de implante',
    45,
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
    }$json$::jsonb,
    'avaliacao-de-implante',
    false,
    6
  ),
  (
    '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0007',
    'urgencia',
    'Urgência',
    30,
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
    }$json$::jsonb,
    'urgencia',
    true,
    7
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
            payment_method, insurance_provider, manage_token_hash, source
          ) values (
            v_schedule.dentist_id,
            v_treatment.id,
            v_patient_ids[1 + v_seed % array_length(v_patient_ids, 1)],
            tstzrange(v_starts, v_ends, '[)'),
            v_status,
            case when v_seed % 3 = 0 then 'insurance'::public.payment_method else 'private' end,
            case when v_seed % 3 = 0 then (array['OdontoCerrado', 'Plano Sorriso Centro-Oeste', 'Dental Vida', 'Uniodonto Planalto'])[1 + v_seed % 4] end,
            extensions.digest(extensions.gen_random_bytes(32), 'sha256'),
            case when v_seed % 4 = 0 then 'reception'::public.appointment_source else 'website' end
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
