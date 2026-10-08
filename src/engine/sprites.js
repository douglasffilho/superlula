// Pixel art sprite engine & ASCII matrix rasterizer

// Standard 14-color palette
export const PALETTE = {
  k: '#1a1020', // Outline/Black
  w: '#f8f8fa', // White (hair/beard/stars)
  W: '#cfcfe0', // Light silver hair shade
  s: '#f2b98f', // Skin tone
  S: '#cf8e68', // Skin shadow
  r: '#d32f2f', // Red (PT/Lula)
  R: '#991b1b', // Dark red
  y: '#ffd21f', // Gold / Yellow
  Y: '#fff480', // Light yellow
  g: '#169c3c', // Green (Brazil flag / grass)
  G: '#0e6d28', // Dark green
  b: '#2449c9', // Blue (globe / denim)
  B: '#162d85', // Dark blue
  m: '#8b4513', // Brown (brick/shoes)
  M: '#5c2a07', // Dark brown
  c: '#80c040', // Light green / chuchu
  o: '#ff8c00', // Orange (coxinha)
  p: '#ffb6c1'  // Pink
};

// Rasterize ASCII pixel matrix to an HTMLCanvasElement
export function rasterizeMatrix(matrix, palette = PALETTE, flipX = false) {
  const height = matrix.length;
  const width = matrix[0] ? matrix[0].length : 0;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  for (let y = 0; y < height; y++) {
    const row = matrix[y];
    for (let x = 0; x < width; x++) {
      const char = row[x];
      if (char && char !== '.' && char !== ' ' && palette[char]) {
        ctx.fillStyle = palette[char];
        const destX = flipX ? width - 1 - x : x;
        ctx.fillRect(destX, y, 1, 1);
      }
    }
  }
  return canvas;
}

// LULA SPRITE (14 wide, 20 high)
const LULA_HEAD_BODY = [
  '....kwwwwwk...', // 0 hair top
  '...kwwwwwwwk..', // 1
  '..kwwwwwwwwwk.', // 2 hair sides
  '..kwwsssssswk.', // 3 forehead
  '..kwksswksswk.', // 4 eyes
  '..kwksswksswk.', // 5
  '..kwwwwwwwwk..', // 6 mustache
  '..kswwwswwwk..', // 7 mouth
  '..kswwwwwwwk..', // 8 full white beard
  '...kwwwwwwk...', // 9 beard chin
  '...krrrrrrk...', // 10 red collar
  '..kryyggryyyk.', // 11 red shirt + sash
  '.kryyyyygyyyk.', // 12 sash across chest
  '.kssryygyyssk.', // 13 hands + sash
  '.kssryyyyyssk.', // 14
  '..kkrrrrrrkk..'  // 15 waist
];

// DILMA SPRITE (14 wide, 20 high)
const DILMA_HEAD_BODY = [
  '....kmmmmmk...',
  '...kmmmmmmmk..',
  '..kmmmmmmmmmk.',
  '..kmmssssssmk.',
  '..kmksswkssmk.',
  '..kmksswkssmk.',
  '..kssssssssk..',
  '..kssprrsssk..', // red lips
  '..kssssssssk..',
  '...kssssssk...',
  '...krrrrrrk...', // red blazer
  '..kryyyyyyrk..', // pearl necklace
  '.krrrrrrrrrrk.',
  '.kssrrrrrrssk.',
  '.kssrrrrrrssk.',
  '..kkrrrrrrkk..'
];

// ALCKMIN (CHUCHU) SPRITE
const ALCKMIN_HEAD_BODY = [
  '....ksssssk...', // bald top
  '...ksssssssk..',
  '..kWWsssssWWk.', // grey side hair
  '..kWWsssssWWk.',
  '..kwbksswbkswk', // glasses
  '..kwbksswbkswk',
  '..kssssssssk..',
  '..kssSSSSssk..',
  '..kssssssssk..',
  '...kssssssk...',
  '...kcccccck...', // chuchu green / grey suit
  '..kccbbbbcck..', // blue tie
  '.kccccbbcccck.',
  '.kssccbbccssk.',
  '.kssccccccssk.',
  '..kkcccccckk..'
];

const LEGS = {
  stand: [
    '...kbbbbbbk...',
    '...kbbkkbbk...',
    '...kww..wwk...',
    '..kkkk..kkkk..'
  ],
  walk: [
    '...kbbbbbbk...',
    '..kbbk..kbbk..',
    '..kwwk..kwwk..',
    '.kkkk....kkkk.'
  ],
  jump: [
    '..kbbbbbbbbk..',
    '.kbbk....kbbk.',
    '.kwwk....kwwk.',
    'kkkk......kkkk'
  ],
  pole: [
    '....kbbbbk....',
    '....kbbbbk....',
    '....kwwk......',
    '...kkkk.......'
  ]
};

// GREEN BRAZIL MAP COLLECTIBLE (12x12)
export const BRASIL_MAP_MATRIX = [
  '..kggggggk..',
  '.kggggggggk.',
  'kggggggggggk',
  'kggggggggggk',
  '.kgggggggggk',
  '..kggggggggk',
  '...kggggggk.',
  '....kggggk..',
  '.....kggk...',
  '......kgk...',
  '.......kk...'
];

// BRAZILIAN FLAG (20x14)
export const BRASIL_FLAG_MATRIX = [
  'gggggggggggggggggggg',
  'gggggggggggggggggggg',
  'gggggggyyyyggggggggg',
  'gggggyyyyyyyyggggggg',
  'gggyyyyybbbyyyyggggg',
  'ggyyyyybbwbbbyyyyggg',
  'gyyyyybbbbwwbbyyyygg',
  'gyyyyybbwwwwbbyyyygg',
  'ggyyyyybbbbbyyyygggg',
  'gggyyyyybbbyyyyggggg',
  'gggggyyyyyyyyggggggg',
  'gggggggyyyyggggggggg',
  'gggggggggggggggggggg',
  'gggggggggggggggggggg'
];

// PICANHA POWER-UP (14x10)
export const PICANHA_MATRIX = [
  '..kwwwwwwwwk..', // white fat layer
  '.kwwwwwwwwwwk.',
  'kwwrrrrrrrrrrk', // red juicy meat
  'kwrrrrrrrrrrrk',
  'krrrrrrRRrrrrk',
  'krrrrrRRRRrrrk',
  '.krrrrrrrrrrk.',
  '..krrrrrrrrk..',
  '...krrrrrrk...',
  '....kkkkkk....'
];

// COXINHA ENEMY (12x12)
export const COXINHA_MATRIX = [
  '.....kk.....',
  '....koook...',
  '...koooook..',
  '..koooooook.',
  '..kokoookok.', // eyes
  '.koooooooook',
  '.koooooooook',
  '.koooooooook',
  '..koooooook.',
  '...kkkkkkk..',
  '..kmmk.kmmk.', // feet
  '.kkkk...kkkk'
];

// PATO DA FIESP ENEMY (14x12)
export const PATO_MATRIX = [
  '.....kyyyyk...',
  '....kyyyyyyk..',
  '..kkooyykyyk..', // beak and eye
  '.koooyyyyyyyk.',
  '..kkoyyyyyyyk.',
  '....kyyyyyyyk.',
  '..kyyyyyyyyyyk',
  '.kyyyyyyyyyyyk',
  '.kyyyyyyyyyyyk',
  '..kyyyyyyyyyk.',
  '...koookoook..', // orange feet
  '..kkkk.kkkk...'
];

// DOPS / POLICE ENEMY (14x16)
export const DOPS_MATRIX = [
  '....kkkkkk....',
  '...kBBBBBBk...', // cap
  '..kBBBBBBBBk..',
  '..kssssssssk..',
  '..kskssksksk..', // eyes
  '..kssssssssk..',
  '...kssssssk...',
  '...kBBBBBBk...', // dark uniform
  '..kBBkkkkBBk..', // belt
  '.kssBBBBBBssm.', // baton hand
  '.kssBBBBBBsskk',
  '..kkBBBBBBkk..',
  '...kBBkkBBk...',
  '...kBB..BBk...',
  '...kmm..mmk...',
  '..kkkk..kkkk..'
];

// JUIZ / CURITIBA ENEMY (14x16)
export const JUIZ_MATRIX = [
  '....kkkkkk....',
  '...kWWWWWWk...', // hair
  '..kWWWWWWWWk..',
  '..kssssssssk..',
  '..kskssksksk..',
  '..kssssssssk..',
  '...kssssssk...',
  '...kwwkkwwk...', // white judge collar
  '..kkkkkkkkkk..', // black robe
  '.ksskkkkkkssm.', // gavel in hand
  '.ksskkkkkksskk',
  '..kkkkkkkkkk..',
  '...kkk..kkk...',
  '...kkk..kkk...',
  '...kmm..mmk...',
  '..kkkk..kkkk..'
];

// FISCAL DA CPI / RECEITA (14x16)
export const FISCAL_MATRIX = [
  '....kkkkkk....',
  '...kmmmmmmk...', // brown hair
  '..kmmmmmmmmk..',
  '..kssssssssk..',
  '..kskssksksk..', // eyes
  '..kssssssssk..',
  '...kssssssk...',
  '...kbbkkbbk...', // blue suit + tie
  '..kbbkkkkbbk..',
  '.kssbbkkbbssm.', // clipboard in hand
  '.kssbbkkbbsskk',
  '..kkbbkkbbkk..',
  '...kbb..bbk...',
  '...kbb..bbk...',
  '...kmm..mmk...', // shoes
  '..kkkk..kkkk..'
];

// SWAN PEDALINHO (24x16)
export const PEDALINHO_MATRIX = [
  '........kwwk............',
  '.......kwwywwk..........', // yellow beak
  '.......kwwwwk...........',
  '........kwwk............',
  '........kwwk............',
  '.........kwwk...........',
  '..kwwwwwwkwwwk..........',
  '.kwwwwwwwwkwwwk.........',
  'kwwwwwwwwwwkwwwk..kbbk..', // seat blue
  'kwwwwwwwwwwwwwwwkkkbbk..',
  'kwwwwwwwwwwwwwwwwwwwwk..',
  '.kwwwwwwwwwwwwwwwwwwk...',
  '..kmmmmmmmmmmmmmmmmk....', // boat hull
  '...kmmmmmmmmmmmmmmk.....',
  '....kkkkkkkkkkkkkk......',
  '........................'
];

// Pre-render and cache sprite sheets
export function buildSprites() {
  const characters = {
    lula: { headBody: LULA_HEAD_BODY, palette: PALETTE },
    dilma: { headBody: DILMA_HEAD_BODY, palette: PALETTE },
    alckmin: { headBody: ALCKMIN_HEAD_BODY, palette: PALETTE }
  };

  const sprites = {};

  for (const [charName, charData] of Object.entries(characters)) {
    sprites[charName] = {};
    for (const action of ['stand', 'walk', 'jump', 'pole']) {
      const fullMatrix = charData.headBody.concat(LEGS[action]);
      sprites[charName][action] = [
        rasterizeMatrix(fullMatrix, charData.palette, false),
        rasterizeMatrix(fullMatrix, charData.palette, true)
      ];
    }
  }

  // Pre-render common items & enemies
  const items = {
    brasil: rasterizeMatrix(BRASIL_MAP_MATRIX, PALETTE),
    flag: rasterizeMatrix(BRASIL_FLAG_MATRIX, PALETTE),
    picanha: rasterizeMatrix(PICANHA_MATRIX, PALETTE),
    coxinha: [
      rasterizeMatrix(COXINHA_MATRIX, PALETTE, false),
      rasterizeMatrix(COXINHA_MATRIX, PALETTE, true)
    ],
    pato: [
      rasterizeMatrix(PATO_MATRIX, PALETTE, false),
      rasterizeMatrix(PATO_MATRIX, PALETTE, true)
    ],
    dops: [
      rasterizeMatrix(DOPS_MATRIX, PALETTE, false),
      rasterizeMatrix(DOPS_MATRIX, PALETTE, true)
    ],
    fiscal: [
      rasterizeMatrix(FISCAL_MATRIX, PALETTE, false),
      rasterizeMatrix(FISCAL_MATRIX, PALETTE, true)
    ],
    juiz: [
      rasterizeMatrix(JUIZ_MATRIX, PALETTE, false),
      rasterizeMatrix(JUIZ_MATRIX, PALETTE, true)
    ],
    pedalinho: rasterizeMatrix(PEDALINHO_MATRIX, PALETTE)
  };

  return { sprites, items };
}

