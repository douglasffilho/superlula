// Níveis e Fases do Super Lula World (1980–2026)

export const THEMES = {
  fabrica: {
    name: 'Fábrica do ABC',
    sky: ['#5a6b7c', '#8a9ba8'],
    top: '#707a88',
    fill: '#454c55',
    dot: '#343a42',
    brick: '#6b5048',
    block: '#50485a',
    plat: '#a0a8b4',
    music: 'fabrica'
  },
  brasilia: {
    name: 'Esplanada dos Ministérios',
    sky: ['#4fb2ff', '#ffe9b0'],
    top: '#e8edf2',
    fill: '#8ca0b8',
    dot: '#728499',
    brick: '#b85c38',
    block: '#8a6a50',
    plat: '#f0b44a',
    music: 'title'
  },
  praia: {
    name: 'Litoral do Guarujá',
    sky: ['#4aa8ff', '#ffd9a0'],
    top: '#f6de94',
    fill: '#d9b060',
    dot: '#c49a4c',
    brick: '#d9844a',
    block: '#b98a50',
    plat: '#8a5a30',
    liquid: '#1f78d0',
    liq2: '#5fb2ff',
    music: 'praia'
  },
  sitio: {
    name: 'Sítio Santa Bárbara',
    sky: ['#4a90a4', '#c2f0d8'],
    top: '#48b84e',
    fill: '#6b4c2b',
    dot: '#54391e',
    brick: '#8a5030',
    block: '#704838',
    plat: '#e0a050',
    liquid: '#1b6aa8',
    liq2: '#409ad8',
    music: 'overworld'
  },
  curitiba: {
    name: 'Superintendência de Curitiba',
    sky: ['#384252', '#728096'],
    top: '#4a5568',
    fill: '#2d3748',
    dot: '#1a202c',
    brick: '#584860',
    block: '#443850',
    plat: '#8090a8',
    music: 'curitiba'
  },
  eleicao: {
    name: 'Frente Ampla 2022',
    sky: ['#e86048', '#f8c878'],
    top: '#c83030',
    fill: '#802020',
    dot: '#601414',
    brick: '#c85030',
    block: '#a04028',
    plat: '#f0c030',
    music: 'title'
  },
  planalto: {
    name: 'Rampa do Planalto',
    sky: ['#5c94fc', '#5c94fc'], // NES Classic SMB 1-1 Sky!
    top: '#c84418',
    fill: '#c84418',
    dot: '#000000',
    brick: '#b84418',
    block: '#d89848',
    plat: '#fcbc74',
    music: 'overworld'
  }
};

// Map node coordinates for the 7 stages (336x192 viewport)
export const MAP_NODES = [
  [36, 126],  // 1: ABC 1980
  [78, 100],  // 2: Mensalão 2005
  [120, 132], // 3: Triplex 2016
  [162, 94],  // 4: Atibaia 2016
  [204, 126], // 5: Curitiba 2018
  [248, 92],  // 6: Frente Ampla 2022
  [294, 60]   // 7: Planalto 2023-2026
];

export const LEVELS = [
  {
    id: 'fabrica',
    name: 'O Metalúrgico do ABC',
    year: '1980',
    w: 156,
    theme: 'fabrica',
    intro: {
      tag: 'Missão',
      title: 'Fase 1 · O Metalúrgico do ABC',
      body: 'São Bernardo do Campo, 1980. O Estádio de Vila Euclides está lotado na greve geral dos metalúrgicos. O DOPS e a polícia do regime cercam o estádio. Sua missão é recolher os megafones e mobilizar a categoria sem ser preso. Pressione Z para pular e bata nos blocos com a cabeça para libertar o mapa do Brasil e itens!'
    },
    outro: {
      body: 'Em abril de 1980, Lula liderou a greve de mais de 300 mil metalúrgicos do ABC contra o arrocho salarial. Enquadrado na Lei de Segurança Nacional pela Ditadura Militar, passou 31 dias preso no DOPS até ser libertado.',
      note: 'Fato histórico marcante da redemocratização. Lula foi posteriormente anistiado.',
      src: ['folha1980', 'cpdoc_fgv']
    },
    death: {
      head: 'Enquadrado!',
      sub: 'Os agentes do DOPS interceptaram a assembleia.'
    },
    make(builder) {
      builder.g(0, 36);
      builder.coin(8, 7, 3);
      builder.t(12, 6, '?');
      builder.t(13, 6, 'B');
      builder.t(14, 6, '?');
      builder.e('dops', 18, 9, { vx: -0.45 });
      builder.e('dops', 24, 9, { vx: -0.45 });
      builder.g(40, 80);
      builder.p(44, 7, 4);
      builder.coin(44, 6, 4);
      builder.t(52, 6, '?');
      builder.e('dops', 56, 9, { vx: -0.45 });
      builder.e('dops', 62, 9, { vx: -0.45 });
      builder.g(85, 120);
      builder.stairs(88, 3, 1);
      builder.stairs(96, 3, -1);
      builder.coin(92, 5, 2);
      builder.t(102, 6, '?');
      builder.e('dops', 106, 9, { vx: -0.45 });
      builder.g(125, 155);
      builder.coin(128, 7, 4);
      builder.goal(142);
    }
  },

  {
    id: 'mensalao',
    name: 'As Malas do Mensalão',
    year: '2005',
    w: 168,
    theme: 'brasilia',
    intro: {
      tag: 'Crise Política',
      title: 'Fase 2 · As Malas do Mensalão',
      body: 'Brasília, 2005. Estourou o escândalo da mesada no Congresso Nacional. A CPI dos Correios investiga cada votação e os repórteres estão em todos os corredores. Sua missão é garantir os votos no plenário desviando dos fiscais da CPI e das malas voadoras. Segure X para correr rápido!'
    },
    outro: {
      body: 'O escândalo do Mensalão (Ação Penal 470 do STF) abalou o primeiro mandato. Na época, Lula foi à televisão pedir desculpas à população, declarando: "Eu não tenho nenhuma vergonha de dizer ao povo brasileiro que nós temos que pedir desculpas". Ele não figurou entre os réus condenados.',
      note: 'O caso foi o maior julgamento político da história recente do STF até então.',
      src: ['stf_ap470', 'g1_mensalao', 'folha_mensalao']
    },
    death: {
      head: 'Convocado para depor!',
      sub: 'A CPI achou que você sabia de tudo.'
    },
    make(builder) {
      builder.g(0, 28);
      builder.coin(6, 8, 4);
      builder.t(10, 6, '?');
      builder.t(11, 6, 'B');
      builder.t(12, 6, '?');
      builder.e('fiscal', 16, 9, { vx: -0.5 });
      builder.e('fiscal', 22, 9, { vx: -0.5 });
      builder.g(32, 68);
      builder.p(36, 7, 5);
      builder.coin(36, 6, 5);
      builder.t(46, 6, '?');
      builder.e('fiscal', 52, 9, { vx: -0.5 });
      builder.g(72, 110);
      builder.p(78, 7, 6, 'B');
      builder.t(80, 7, '?');
      builder.coin(78, 6, 6);
      builder.e('fiscal', 88, 9, { vx: -0.5 });
      builder.e('fiscal', 94, 9, { vx: -0.5 });
      builder.g(115, 146);
      builder.stairs(118, 4, 1);
      builder.coin(122, 5, 3);
      builder.e('fiscal', 130, 9, { vx: -0.5 });
      builder.g(150, 167);
      builder.coin(152, 8, 4);
      builder.goal(158);
    }
  },

  {
    id: 'triplex',
    name: 'O Mistério do Triplex',
    year: '2016',
    w: 168,
    theme: 'praia',
    intro: {
      tag: 'Operação Lava Jato',
      title: 'Fase 3 · O Mistério do Triplex',
      body: 'Guarujá, litoral de São Paulo. O apartamento 164-A do condomínio Solaris virou o centro do noticiário nacional. Suba os andares do edifício, desvie dos fiscais e engenheiros da OAS com plantas baixas, e colete as notas para chegar ao topo!'
    },
    outro: {
      body: 'Em 2017, Lula foi condenado pelo juiz Sergio Moro por suposta propina oculta na reforma do triplex. Em 2021, o STF anulou todas as decisões da 13ª Vara de Curitiba e reconheceu a suspeição de Moro, encerrando em definitivo o processo sem condenação.',
      note: 'O caso do Triplex prescreveu na Justiça Federal de Brasília após as decisões do STF.',
      src: ['stf_suspeicao', 'g1_triplex', 'bbc_anulacao']
    },
    death: {
      head: 'Intimação na praia!',
      sub: 'Os fiscais acharam a chave do elevador privativo.'
    },
    make(builder) {
      builder.g(0, 30);
      builder.t(10, 6, '?');
      builder.t(11, 6, '?');
      builder.coin(14, 8, 4);
      builder.e('juiz', 18, 9, { vx: -0.45 });
      builder.g(34, 72);
      builder.p(38, 7, 4);
      builder.coin(38, 6, 4);
      builder.p(48, 5, 4);
      builder.coin(48, 4, 4);
      builder.e('juiz', 58, 9, { vx: -0.45 });
      builder.g(76, 114);
      builder.p(80, 7, 5);
      builder.t(82, 7, '?');
      builder.p(92, 5, 4);
      builder.coin(92, 4, 4);
      builder.e('juiz', 100, 9, { vx: -0.45 });
      builder.g(118, 167);
      builder.stairs(122, 4, 1);
      builder.stairs(130, 4, -1);
      builder.coin(126, 4, 3);
      builder.goal(154);
    }
  },

  {
    id: 'atibaia',
    name: 'Os Pedalinhos de Atibaia',
    year: '2016',
    w: 168,
    theme: 'sitio',
    intro: {
      tag: 'Lago do Sítio',
      title: 'Fase 4 · Os Pedalinhos de Atibaia',
      body: 'Sítio Santa Bárbara, em Atibaia. Para atravessar a propriedade até a saída, você precisará pular sobre os famosos pedalinhos em forma de cisne no lago! Cuidado: não caia na água profunda. Colete os mapas do Brasil e desvie dos fiscais com pranchetas!'
    },
    outro: {
      body: 'A acusação alegava reformas no sítio pagas por empreiteiras em propriedade frequentada pelo ex-presidente. Em 2021, o STF estendeu a incompetência da Justiça de Curitiba ao caso do sítio, anulando a condenação.',
      note: 'Os dois pedalinhos de cisne levavam os nomes dos netos de Lula.',
      src: ['folha_atibaia', 'estadao_sitio', 'conjur_atibaia']
    },
    death: {
      head: 'Caiu no lago!',
      sub: 'O pedalinho de cisne virou e você afundou com as notas.'
    },
    make(builder) {
      builder.g(0, 24);
      builder.coin(6, 8, 4);
      builder.t(10, 6, '?');
      builder.e('fiscal', 15, 9, { vx: -0.45 });
      // Water gaps with pedalinho boats acting as stepping stones!
      builder.p(28, 8, 3, 'X');
      builder.coin(28, 6, 3);
      builder.p(36, 7, 3, 'X');
      builder.coin(36, 5, 3);
      builder.p(44, 8, 3, 'X');
      builder.g(50, 78);
      builder.t(54, 6, '?');
      builder.t(55, 6, 'B');
      builder.coin(58, 8, 4);
      builder.e('fiscal', 64, 9, { vx: -0.45 });
      // Second lake section
      builder.p(82, 8, 3, 'X');
      builder.coin(82, 6, 3);
      builder.p(90, 7, 4, 'X');
      builder.coin(90, 5, 4);
      builder.p(98, 8, 3, 'X');
      builder.g(104, 138);
      builder.stairs(108, 4, 1);
      builder.stairs(116, 4, -1);
      builder.coin(112, 5, 2);
      builder.e('fiscal', 124, 9, { vx: -0.45 });
      builder.g(142, 167);
      builder.coin(146, 8, 4);
      builder.goal(156);
    }
  },

  {
    id: 'curitiba',
    name: 'A Vigília e a Anulação',
    year: '2018–2021',
    w: 168,
    theme: 'curitiba',
    intro: {
      tag: '580 Dias',
      title: 'Fase 5 · A Vigília e a Anulação',
      body: 'Curitiba, 580 dias de prisão política. Do lado de fora, a vigília entoa: "Bom dia, Presidente Lula!". Para abrir a porta da cela e derrubar as grades, você precisa recolher os Habeas Corpus e decisões do Supremo Tribunal Federal. Cada decisão estampa "ANULADO" e quebra um obstáculo!'
    },
    outro: {
      body: 'Em 2021, o STF julgou o ex-juiz Sergio Moro parcial no caso do Triplex e o Plenário anulou todas as ações contra Lula em Curitiba. Livre e com os direitos políticos plenamente restabelecidos, Lula voltou a ser elegível para disputar a Presidência da República.',
      note: 'A decisão foi confirmada pelo plenário do Supremo Tribunal Federal por 7 votos a 4.',
      src: ['stf_fachin', 'bbc_moro_parcial', 'g1_plenario_stf']
    },
    death: {
      head: 'Pedido negado!',
      sub: 'O recurso foi rejeitado em Curitiba. Tente de novo!'
    },
    make(builder) {
      builder.g(0, 32);
      builder.coin(8, 8, 4);
      builder.t(12, 6, '?');
      builder.t(13, 6, 'B');
      builder.e('juiz', 18, 9, { vx: -0.45 });
      builder.g(36, 74);
      builder.p(40, 7, 4);
      builder.coin(40, 6, 4);
      builder.t(48, 6, '?');
      builder.e('juiz', 54, 9, { vx: -0.45 });
      builder.g(78, 116);
      builder.p(82, 7, 5);
      builder.t(84, 7, '?');
      builder.coin(82, 6, 5);
      builder.e('juiz', 92, 9, { vx: -0.45 });
      builder.g(120, 167);
      builder.stairs(124, 4, 1);
      builder.stairs(132, 4, -1);
      builder.coin(128, 5, 3);
      builder.goal(154);
    }
  },

  {
    id: 'eleicao',
    name: 'A Frente Ampla do Chuchu',
    year: '2022',
    w: 172,
    theme: 'eleicao',
    intro: {
      tag: 'Eleição Histórica',
      title: 'Fase 6 · A Frente Ampla do Chuchu',
      body: 'Eleições de 2022. Para vencer a polarização e o bolsonarismo, Lula formou a histórica chapa da Frente Ampla com o ex-governador Geraldo Alckmin ("O Chuchu"). O caminho está cheio de coxinhas e patos amarelos da Fiesp quicando! Aperte X para arremessar picolés de chuchu que neutralizam os adversários!'
    },
    outro: {
      body: 'Em 30 de outubro de 2022, Lula foi eleito presidente pela 3ª vez com 60,3 milhões de votos (50,90%) contra Jair Bolsonaro (49,10%). A ampla aliança que reuniu antigos adversários foi considerada a chave para a vitória no segundo turno.',
      note: 'Lula tornou-se a primeira pessoa na história do Brasil a ser eleita presidente três vezes por voto popular direto.',
      src: ['tse_2022', 'bbc_eleicao2022', 'poder360_frente']
    },
    death: {
      head: 'Voto impresso!',
      sub: 'Um pato da Fiesp te acertou em cheio na contagem de votos.'
    },
    make(builder) {
      builder.g(0, 30);
      builder.coin(6, 8, 4);
      builder.t(10, 6, '?');
      builder.t(11, 6, 'B');
      builder.t(12, 6, '?');
      builder.e('coxinha', 16, 9, { vx: -0.45 });
      builder.e('pato', 22, 9, { vx: -0.5 });
      builder.g(34, 74);
      builder.p(38, 7, 5);
      builder.coin(38, 6, 5);
      builder.t(46, 6, '?');
      builder.e('coxinha', 52, 9, { vx: -0.45 });
      builder.e('pato', 58, 9, { vx: -0.5 });
      builder.g(78, 120);
      builder.p(82, 7, 6);
      builder.t(84, 7, '?');
      builder.coin(82, 6, 6);
      builder.e('coxinha', 92, 9, { vx: -0.45 });
      builder.e('pato', 98, 9, { vx: -0.5 });
      builder.g(124, 171);
      builder.stairs(128, 4, 1);
      builder.stairs(136, 4, -1);
      builder.coin(132, 5, 3);
      builder.goal(158);
    }
  },

  {
    id: 'planalto',
    name: 'A Picanha e o Mastro do Planalto',
    year: '2023–2026',
    w: 180,
    theme: 'planalto',
    intro: {
      tag: 'A Grande Final',
      title: 'Fase 7 · A Picanha e o Mastro do Planalto',
      body: 'Rampa do Palácio do Planalto! O visual clássico do Super Mario World 1-1 brasileiro! Sua missão é colocar a picanha de volta na mesa do trabalhador, acertar os blocos com o mapa verde do Brasil para ganhar 10 pontos de esperança, subir no mastro e alcançar a Bandeira do Brasil hasteada no topo do castelo!'
    },
    outro: {
      body: 'Em 1º de janeiro de 2023, Lula subiu a rampa do Palácio do Planalto acompanhado de líderes populares e do cacique Raoni Metuktire, recebendo a faixa presidencial do povo brasileiro. O terceiro mandato trabalha com temas de combate à fome, política externa ativa e reindustrialização verde.',
      note: 'Fim de jogo! Você zerou Super Lula World! Parabéns, companheiro!',
      src: ['g1_posse2023', 'ibge_inflacao', 'folha_terceiro_governo']
    },
    death: {
      head: 'Taxa de juros alta!',
      sub: 'O Banco Central subiu a Selic e a picanha ficou cara demais.'
    },
    make(builder) {
      // Classic NES Super Mario Bros 1-1 structure with Brazil flair!
      builder.g(0, 32);
      builder.coin(8, 8, 4);
      builder.t(12, 6, '?'); // Contains Brasil map!
      builder.t(14, 6, 'B');
      builder.t(16, 6, '?'); // Contains Picanha!
      builder.e('coxinha', 20, 9, { vx: -0.45 });
      builder.e('coxinha', 26, 9, { vx: -0.45 });

      // First pipe & platform
      builder.g(36, 80);
      builder.p(40, 7, 4);
      builder.coin(40, 6, 4);
      builder.t(48, 6, '?');
      builder.t(49, 6, 'B');
      builder.t(50, 6, '?');
      builder.e('pato', 56, 9, { vx: -0.5 });
      builder.e('coxinha', 62, 9, { vx: -0.45 });
      builder.e('pato', 68, 9, { vx: -0.5 });

      // Middle bridge & stairs
      builder.g(84, 126);
      builder.p(90, 7, 5);
      builder.t(92, 7, '?');
      builder.coin(90, 6, 5);
      builder.stairs(98, 4, 1);
      builder.stairs(106, 4, -1);
      builder.coin(102, 5, 2);
      builder.e('pato', 114, 9, { vx: -0.5 });
      builder.e('coxinha', 118, 9, { vx: -0.45 });

      // Final staircase leading up to flagpole & castle, exactly as in user's image!
      builder.g(130, 179);
      builder.stairs(134, 4, 1);
      builder.p(142, 6, 4, 'B');
      builder.t(144, 6, '?');
      builder.coin(142, 5, 4);
      builder.stairs(150, 8, 1); // 8-step high staircase!
      builder.goal(164); // Flagpole at 164, castle right after at 168-175!
    }
  }
];

