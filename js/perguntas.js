// ============================================================
// PESQUISA COM A LIDERANÇA — 1B
// Fonte única das perguntas. Editar aqui, nada de texto no código.
//
// Tipos:
//   conteudo      → slide informativo (sem resposta)
//   unica         → uma opção
//   multipla      → várias opções (max = limite; exclusivas = desmarcam as outras)
//   escala_grade  → vários itens avaliados de min a max (+ opção "não sei")
//   aberta        → texto livre (longa: true = textarea)
//   nuvem         → N palavras curtas (vira nuvem no telão)
//
// mostrarSe: { pergunta: "id", opcoes: [...] } → só aparece se a pessoa
//            marcou uma dessas opções na pergunta indicada.
// obrigatoria: fechadas = true por padrão; abertas = false por padrão.
// ============================================================

const FREQUENCIA = [
  "Culto de Sábado – 19h",
  "Domingo – Culto das 10h",
  "Domingo – Culto das 17h",
  "Domingo – Culto das 19h",
  "Manhã de Oração – Seg a Sex, às 07h",
  "Viva Vida – Quinta-feira, às 14h",
  "Cesta de Bênçãos – Sexta-feira, às 15h",
];

const IDENTIFICACAO = (fase, comOutro) => [
  {
    id: `${fase}_01`, numero: 1, secao: "Identificação", tipo: "unica",
    pergunta: "Tempo como membro da igreja",
    opcoes: ["Até 5 anos", "6 a 15 anos", "16 a 30 anos", "Mais de 30 anos"],
  },
  {
    id: `${fase}_02`, numero: 2, secao: "Identificação", tipo: "unica",
    pergunta: "Faixa etária",
    opcoes: ["Até 29 anos", "30 a 44 anos", "45 a 59 anos", "60 anos ou mais"],
  },
  {
    id: `${fase}_03`, numero: 3, secao: "Identificação", tipo: "unica",
    pergunta: "Envolvimento nas Redes de Cuidado",
    opcoes: [
      "Não participo de PGM",
      "Membro de PGM",
      "Líder ou Auxiliar de PGM",
      "Supervisor, Coordenador ou Pastor de PGMs",
    ],
  },
  {
    id: `${fase}_04`, numero: 4, secao: "Identificação", tipo: "multipla",
    pergunta: "Frequência",
    instrucao: "Assinale mais de um se for o caso.",
    opcoes: comOutro ? [...FREQUENCIA, "Outro"] : [...FREQUENCIA],
  },
];

const ESCALA_CONCORDANCIA = {
  1: "Discordo totalmente",
  2: "Discordo",
  3: "Nem concordo nem discordo",
  4: "Concordo",
  5: "Concordo totalmente",
};

const ESCALA_SATISFACAO = {
  1: "Muito insatisfeito",
  2: "Insatisfeito",
  3: "Nem satisfeito nem insatisfeito",
  4: "Satisfeito",
  5: "Muito satisfeito",
};

const PESQUISAS = {
  // ==========================================================
  fase1: {
    id: "fase1",
    rotulo: "Fase 1",
    titulo: "O Futuro da Primeira Batista",
    lema: "Uma igreja apaixonada por Deus e por pessoas",
    encerramento: "Obrigado por contribuir com discernimento e sinceridade.",
    perguntas: [
      {
        id: "fase1_intro", tipo: "conteudo",
        titulo: "Pesquisa com a Liderança",
        texto: "Querido líder, queremos ouvir o seu coração sobre o futuro da nossa igreja. Não há respostas certas ou erradas. Responda com sinceridade e em espírito de oração.",
        rodape: "Tempo estimado: 10 minutos.",
      },

      ...IDENTIFICACAO("fase1", true),
      {
        id: "fase1_04b", tipo: "aberta", secao: "Identificação",
        pergunta: "Se marcou Outro, qual?",
        mostrarSe: { pergunta: "fase1_04", opcoes: ["Outro"] },
      },

      // ---------- Visão de futuro ----------
      {
        id: "fase1_05", numero: 5, secao: "Visão de futuro", tipo: "aberta", longa: true,
        pergunta: "Quando você pensa na Primeira Batista daqui a 10 anos, o que você vê?",
      },
      {
        id: "fase1_06", numero: 6, secao: "Visão de futuro", tipo: "nuvem", qtd: 3,
        pergunta: "Três palavras que deveriam definir nossa Igreja no futuro:",
      },
      {
        // DECISÃO PENDENTE: o docx diz "três maiores prioridades" no título
        // e "Escolha até dois" na instrução. Padrão adotado: até dois.
        id: "fase1_07", numero: 7, secao: "Visão de futuro", tipo: "multipla", max: 2,
        pergunta: "Em termos de investimento em estrutura, quais devem ser as maiores prioridades da igreja nos próximos 10 a 15 anos?",
        instrucao: "Escolha até dois.",
        opcoes: [
          "Reformar a Sede",
          "Adquirir propriedades próximas à Sede",
          "Adquirir propriedade que possibilite o crescimento e expansão da Igreja",
          "Estar presente em novas regiões da cidade",
          "Construir um centro de retiros, encontros e formação",
          "Fortalecer a sustentabilidade financeira",
          "Outra",
        ],
      },
      {
        id: "fase1_07b", tipo: "aberta", secao: "Visão de futuro",
        pergunta: "Se marcou Outra, qual?",
        mostrarSe: { pergunta: "fase1_07", opcoes: ["Outra"] },
      },
      {
        id: "fase1_08", numero: 8, secao: "Visão de futuro", tipo: "aberta", longa: true,
        pergunta: "Qual é o maior desafio da igreja para as próximas décadas?",
      },
      {
        id: "fase1_09", numero: 9, secao: "Visão de futuro", tipo: "unica",
        pergunta: "Daqui a 10 anos, a igreja terá:",
        opcoes: [
          "Menos membros que hoje",
          "Número semelhante",
          "Até 50% a mais de membros",
          "Mais de 50% a mais de membros",
        ],
      },
      {
        id: "fase1_10", numero: 10, secao: "Visão de futuro", tipo: "unica",
        pergunta: "Qual modelo de igreja você considera mais adequado ao futuro?",
        opcoes: [
          "Uma sede central forte, que concentre a igreja",
          "Uma sede central com campus em várias regiões da cidade",
          "Uma rede de igrejas locais, com a sede como apoio",
          "Sem opinião formada",
        ],
      },
      {
        id: "fase1_11", numero: 11, secao: "Visão de futuro", tipo: "escala_grade",
        pergunta: "Avalie as afirmações abaixo",
        min: 1, max: 5, rotulos: ESCALA_CONCORDANCIA, naoSei: "Não sei avaliar",
        itens: [
          "A localização atual da sede favorece nossa missão.",
          "Uma presença em outra região da cidade pode ampliar nosso alcance.",
          "Devemos priorizar o crescimento, mesmo com maior esforço financeiro.",
          "Devemos priorizar decisões financeiramente conservadoras.",
          "Retiros e encontros devem ocupar lugar mais importante em nossa estratégia.",
          "A igreja está preparada para um grande projeto estrutural.",
        ],
      },
      {
        id: "fase1_12", numero: 12, secao: "Visão de futuro", tipo: "aberta", longa: true,
        pergunta: "Se a igreja pudesse fazer um investimento estrutural relevante, onde você aplicaria primeiro? Por quê?",
      },

      // ---------- Estrutura do seu ministério ----------
      {
        id: "fase1_13", numero: 13, secao: "Estrutura do seu ministério", tipo: "unica",
        pergunta: "Quantos retiros, acampamentos ou encontros fora da sede o seu ministério realiza por ano?",
        opcoes: ["Nenhum", "1", "2", "3 ou mais"],
      },
      {
        id: "fase1_14", numero: 14, secao: "Estrutura do seu ministério", tipo: "aberta", longa: true,
        pergunta: "Onde eles acontecem, o espaço é alugado e qual a maior dificuldade para realizá-los?",
      },
      {
        id: "fase1_15", numero: 15, secao: "Estrutura do seu ministério", tipo: "aberta", longa: true,
        pergunta: "Para um funcionamento adequado do ministério que você está envolvido, qual estrutura física necessária?",
      },

      // ---------- Nossas instalações atuais ----------
      {
        id: "fase1_16", numero: 16, secao: "Nossas instalações atuais", tipo: "escala_grade",
        pergunta: "Como você avalia a sede em cada aspecto?",
        min: 1, max: 5, rotulos: ESCALA_SATISFACAO, naoSei: "Não sei avaliar",
        itens: [
          "Capacidade e conforto do templo",
          "Estacionamento e facilidade de acesso",
          "Acessibilidade",
          "Espaço para crianças",
          "Espaço com estrutura adicional para adolescentes e jovens",
          "Salas de ensino e reuniões",
          "Acolhimento de visitantes",
          "Segurança e circulação de pessoas",
          "Condições para expansão das atividades",
          "Espaço para Voluntários",
        ],
      },
      {
        id: "fase1_17", numero: 17, secao: "Nossas instalações atuais", tipo: "unica",
        pergunta: "A estrutura atual atenderá adequadamente a igreja pelos próximos 10 anos?",
        opcoes: [
          "Sim",
          "Sim, desde que sejam feitas melhorias",
          "Provavelmente não",
          "Não",
          "Não sei avaliar",
        ],
      },
      {
        id: "fase1_18", numero: 18, secao: "Nossas instalações atuais", tipo: "aberta", longa: true,
        pergunta: "Quais são as três limitações físicas que mais prejudicam o trabalho da igreja hoje?",
      },
      {
        id: "fase1_19", numero: 19, secao: "Nossas instalações atuais", tipo: "aberta", longa: true,
        pergunta: "Que melhorias na sede atual deveriam ser prioritárias?",
      },
      {
        id: "fase1_20", numero: 20, secao: "Nossas instalações atuais", tipo: "aberta", longa: true,
        pergunta: "Sobre a questão de estrutura e funcionamento da Igreja, há algum tópico que você deseja incluir?",
      },
    ],
  },

  // ==========================================================
  fase2: {
    id: "fase2",
    rotulo: "Fase 2",
    titulo: "Decisão Patrimonial",
    lema: "",
    encerramento: "“Se o Senhor não edificar a casa, em vão trabalham os que a edificam.” (Salmos 127.1)",
    perguntas: [
      {
        id: "fase2_intro", tipo: "conteudo",
        titulo: "Pesquisa com a Liderança",
        texto: "Querido líder, obrigado por participar da primeira fase. Agora apresentamos uma decisão concreta que a igreja está avaliando. Ainda não há decisão tomada. Esta pesquisa não é voto em assembleia nem compromisso de contribuição financeira; a decisão final cabe à Assembleia.",
        destaque: "Ainda não há decisão tomada.",
        rodape: "Tempo estimado: 15 minutos.",
      },

      ...IDENTIFICACAO("fase2", false),

      // ---------- O cenário ----------
      {
        id: "fase2_cenario", tipo: "conteudo", secao: "O cenário",
        titulo: "O cenário",
        texto: "A igreja possui uma área de aproximadamente 100 hectares, avaliada em cerca de R$ 5 milhões. A proposta em estudo é vendê-la e reinvestir em um novo local. Há três opções.",
        tabela: {
          colunas: ["", "Área atual", "Opção A — Retiros", "Opção B — Nova Sede", "Opção C — Nova Sede / Piraputanga"],
          linhas: [
            ["Tamanho", "100 ha", "≈ 10 ha", "≈ 12.000 m² (1,2 ha)", "Tudo da Opção B + 11 ha do ACAMBAPI"],
            ["Localização", "—", "Próxima à área urbana; baixa previsão de crescimento", "Região de maior expansão da cidade", "Tudo da Opção B + ACAMBAPI: 114 km da 1B"],
            ["Vocação", "—", "Retiros, acampamentos e encontros", "Futura sede ou campus da igreja", "Tudo da Opção B + retiros, acampamentos e encontros"],
            ["Valor estimado", "≈ R$ 5 mi (venda)", "≈ R$ 6 mi (avaliação) · a proprietária pede R$ 8 mi", "≈ R$ 12 mi (avaliação) · o proprietário pede R$ 15 mi", "Tudo da Opção B + aluguel de R$ 5.000,00 mensais"],
            ["Recurso a captar", "—", "≈ R$ 1 a 3 mi só para o terreno", "≈ R$ 7 mi só para o terreno", "Tudo da Opção B + ≈ R$ 1 mi para melhorias na estrutura"],
            ["Custos futuros", "—", "Estrutura e manutenção dos retiros", "Construção da nova sede", "Construção da nova sede + estrutura e manutenção dos retiros"],
          ],
        },
        rodape: "Valores e características dependem de verificações técnicas e jurídicas.",
      },
      {
        id: "fase2_05", numero: 5, secao: "O cenário", tipo: "unica",
        pergunta: "Você conhece a área de 100 ha?",
        opcoes: ["Já visitei", "Sei que existe, mas não conheço", "Não sabia que a igreja a possuía"],
      },
      {
        id: "fase2_06", numero: 6, secao: "O cenário", tipo: "unica",
        pergunta: "Sobre vender a área de 100 ha:",
        opcoes: ["Concordo", "Concordo com ressalvas", "Discordo", "Não sei"],
      },
      {
        id: "fase2_06b", tipo: "aberta", secao: "O cenário", longa: true,
        pergunta: "Quais ressalvas? / Por quê?",
        mostrarSe: { pergunta: "fase2_06", opcoes: ["Concordo com ressalvas", "Não sei"] },
      },
      {
        id: "fase2_07", numero: 7, secao: "O cenário", tipo: "unica",
        pergunta: "Qual opção está mais alinhada ao futuro da igreja?",
        opcoes: [
          "Certamente Opção A (Área de Retiros)",
          "Tendendo para Opção A (Área de Retiros)",
          "Certamente Opção B (Nova Sede)",
          "Tendendo para Opção B (Nova Sede)",
          "Certamente Opção C (Nova Sede / Assumir Piraputanga)",
          "Tendendo para Opção C (Nova Sede / Assumir Piraputanga)",
          "Indeciso",
          "Nenhuma das três",
        ],
      },
      {
        id: "fase2_08", numero: 8, secao: "O cenário", tipo: "unica",
        pergunta: "Qual fator mais pesou na sua escolha?",
        opcoes: [
          "Viabilidade financeira",
          "Potencial de crescimento",
          "Missão e visão",
          "Necessidade das instalações atuais",
          "Risco envolvido",
          "Outro",
        ],
      },
      {
        id: "fase2_08b", tipo: "aberta", secao: "O cenário",
        pergunta: "Se marcou Outro, qual?",
        mostrarSe: { pergunta: "fase2_08", opcoes: ["Outro"] },
      },
      {
        id: "fase2_09", numero: 9, secao: "O cenário", tipo: "unica",
        pergunta: "Qual deve ser a prioridade estratégica da igreja neste momento?",
        opcoes: [
          "Adquirir uma área para retiros e encontros",
          "Preparar a mudança da sede em região de expansão",
          "Melhorar primeiro as instalações atuais",
          "Preservar recursos e aguardar",
          "Sem opinião formada",
        ],
      },
      {
        id: "fase2_10", numero: 10, secao: "O cenário", tipo: "unica",
        pergunta: "Se houvesse recursos para apenas um grande projeto nos próximos 5 anos, qual deveria ser?",
        opcoes: [
          "Nova sede",
          "Área de retiros",
          "Reforma e ampliação da sede atual",
          "Novos campus e congregações",
          "Outro",
        ],
      },
      {
        id: "fase2_10b", tipo: "aberta", secao: "O cenário",
        pergunta: "Se marcou Outro, qual?",
        mostrarSe: { pergunta: "fase2_10", opcoes: ["Outro"] },
      },
      {
        id: "fase2_11", numero: 11, secao: "O cenário", tipo: "aberta", longa: true,
        pergunta: "Existe outro caminho, risco ou oportunidade que deveria ser considerado? (ex.: manter a área, vender parte, outra região)",
      },

      // ---------- Opção A ----------
      {
        id: "fase2_12", numero: 12, secao: "Sobre a Opção A — Retiros", tipo: "multipla", max: 2,
        pergunta: "Quais benefícios você considera mais relevantes?",
        instrucao: "Escolha até dois.",
        opcoes: [
          "Retiros e encontros da igreja",
          "Formação de líderes",
          "Programação de crianças, adolescentes e jovens",
          "Convívio entre famílias e ministérios",
          "Desenvolvimento do projeto por etapas",
          "Não vejo benefício suficiente",
        ],
        exclusivas: ["Não vejo benefício suficiente"],
      },
      {
        id: "fase2_13", numero: 13, secao: "Sobre a Opção A — Retiros", tipo: "unica",
        pergunta: "Com que frequência o seu ministério usaria a área?",
        opcoes: ["Não usaria", "1 a 2 vezes ao ano", "3 a 5 vezes ao ano", "Mais de 5 vezes ao ano"],
      },
      {
        id: "fase2_14", numero: 14, secao: "Sobre a Opção A — Retiros", tipo: "unica",
        pergunta: "Uma área de retiros deveria ser:",
        opcoes: [
          "Mantida pelo orçamento da igreja",
          "Autossustentável, com locação a outras igrejas e eventos",
          "Uma combinação das duas coisas",
          "Não sei",
        ],
      },

      // ---------- Opção B ----------
      {
        id: "fase2_15", numero: 15, secao: "Sobre a Opção B — Nova Sede", tipo: "multipla", max: 2,
        pergunta: "Quais benefícios você considera mais relevantes?",
        instrucao: "Escolha até dois.",
        opcoes: [
          "Localização para o crescimento futuro",
          "Possibilidade de uma sede planejada (área de cultos, salas anexas, auditórios auxiliares, estacionamento, etc.)",
          "Alcance de novas regiões e famílias",
          "Ampliação dos espaços de culto e ministérios",
          "Visibilidade e presença na cidade",
          "Não vejo benefício suficiente",
        ],
        exclusivas: ["Não vejo benefício suficiente"],
      },
      {
        id: "fase2_16", numero: 16, secao: "Sobre a Opção B — Nova Sede", tipo: "unica",
        pergunta: "Se a igreja ocupasse a área da Opção B, o que fazer com o prédio atual?",
        opcoes: [
          "Vender para financiar a nova sede",
          "Manter como campus central da igreja",
          "Destinar a outro uso (ação social, escola, formação)",
          "Não concordo com a mudança",
        ],
      },
      {
        id: "fase2_17", numero: 17, secao: "Sobre a Opção B — Nova Sede", tipo: "unica",
        pergunta: "Se a sede fosse para uma região de expansão, você e sua família continuariam frequentando com a mesma regularidade?",
        opcoes: ["Sim", "Provavelmente sim", "Provavelmente não", "Não"],
      },
      {
        id: "fase2_18", numero: 18, secao: "Sobre a Opção C — Nova Sede / Piraputanga", tipo: "aberta", longa: true,
        pergunta: "Em relação ao COMBO apresentado na OPÇÃO C (NOVA SEDE E PIRAPUTANGA), qual sua opinião?",
      },

      // ---------- Viabilidade ----------
      {
        id: "fase2_19", numero: 19, secao: "Viabilidade e condições", tipo: "multipla", max: 3,
        pergunta: "Quais preocupações merecem mais atenção antes de qualquer decisão?",
        instrucao: "Escolha até três.",
        opcoes: [
          "Valor da compra",
          "Custo de construção e manutenção",
          "Empréstimo ou endividamento",
          "Impacto sobre missões, ministérios e cuidado pastoral",
          "Tamanho e possibilidade de expansão da área",
          "Segurança, acesso, trânsito e estacionamento",
          "Adequação legal e técnica do terreno",
          "Prazo para gerar benefícios",
          "Uso da sede atual durante a transição",
          "Possível perda de membros",
          "Cenário político-econômico do país",
        ],
      },
      {
        id: "fase2_20", numero: 20, secao: "Viabilidade e condições", tipo: "unica",
        pergunta: "Sobre financiamento para viabilizar o projeto:",
        opcoes: [
          "Somente com recursos próprios e campanhas destinadas",
          "Financiamento de até 5 anos",
          "Financiamento de até 10 anos",
          "Financiamento acima de 10 anos",
        ],
      },
      {
        id: "fase2_21", numero: 21, secao: "Viabilidade e condições", tipo: "multipla", max: 3,
        pergunta: "Quais condições são essenciais antes da igreja assumir o projeto?",
        instrucao: "Escolha até três.",
        opcoes: [
          "Alinhamento à missão e à visão",
          "Estudos técnicos sobre terreno, acesso e construção",
          "Orçamento completo e transparente",
          "Execução por etapas",
          "Limite claro de endividamento",
          "Preservação dos investimentos em ministérios e missões",
          "Ampla participação da igreja na decisão",
        ],
      },
      {
        id: "fase2_22", numero: 22, secao: "Viabilidade e condições", tipo: "unica",
        pergunta: "Você se sente suficientemente informado para opinar?",
        opcoes: ["Sim", "Parcialmente", "Não"],
      },
      {
        id: "fase2_22b", tipo: "aberta", secao: "Viabilidade e condições", longa: true,
        pergunta: "Que informações faltam?",
        mostrarSe: { pergunta: "fase2_22", opcoes: ["Parcialmente", "Não"] },
      },

      // ---------- Participação pessoal ----------
      {
        id: "fase2_23", numero: 23, secao: "Participação pessoal", tipo: "multipla",
        pergunta: "Se o projeto for aprovado, de que forma você participaria?",
        instrucao: "Marque quantas quiser.",
        opcoes: [
          "Oração e mobilização",
          "Reuniões de planejamento",
          "Conhecimento profissional",
          "Engajamento no projeto",
          "Campanhas de arrecadação",
          "Contribuição financeira, conforme minhas possibilidades",
          "Ainda não sei",
          "Sem disponibilidade neste momento",
        ],
        exclusivas: ["Ainda não sei", "Sem disponibilidade neste momento"],
      },
      {
        id: "fase2_23b", tipo: "aberta", secao: "Participação pessoal",
        pergunta: "Qual a sua área de conhecimento profissional?",
        mostrarSe: { pergunta: "fase2_23", opcoes: ["Conhecimento profissional"] },
      },
      {
        id: "fase2_24", numero: 24, secao: "Participação pessoal", tipo: "unica",
        pergunta: "Sobre contribuir financeiramente para o Projeto (além de Dízimos e OMF), você irá contribuir:",
        opcoes: [
          "Sim, regularmente, conforme minhas possibilidades",
          "Sim, com uma contribuição pontual",
          "Talvez, após conhecer o projeto e o orçamento",
          "Não tenho condições neste momento",
          "Prefiro não responder",
        ],
      },
      {
        id: "fase2_25", numero: 25, secao: "Participação pessoal", tipo: "unica",
        pergunta: "As pessoas que você lidera se engajariam no projeto?",
        opcoes: ["Muito", "Moderadamente", "Pouco", "Não sei"],
      },

      // ---------- Palavra final ----------
      {
        // No docx aparece como 27 (não existe 26). Renumerado para 26.
        id: "fase2_26", numero: 26, secao: "Palavra final", tipo: "aberta", longa: true,
        pergunta: "Há algo que o Colégio Pastoral precisa considerar antes desta decisão?",
      },
    ],
  },
};

// Carregar com <script src="js/perguntas.js"></script> antes do app.
window.PESQUISAS = PESQUISAS;
