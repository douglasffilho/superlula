# Guia de Integração: Super Lula no Super Flávio

Este documento detalha como a equipe de desenvolvimento do **Super Flávio** pode integrar o **Super Lula World** diretamente na plataforma atual (`superflavio.com`), aproveitando 100% da compatibilidade arquitetural.

---

## 🎯 Arquitetura Compartilhada (1:1)

O **Super Lula World** foi construído utilizando a exata mesma stack e filosofia técnica do **Super Flávio**:

1. **Canvas 2D Retrô**: Resolução nativa de `336 x 192` (proporção 16:9 NES), escalada via container query CSS (`--u: 1cqw`) e `image-rendering: pixelated`.
2. **Fixed Time-Step Loop**: 60 FPS com `requestAnimationFrame` e acumulador de física de 16.6ms (`1000/60`).
3. **Pixel Art Rasterizer**: Sprites gerados programmaticamente a partir de matrizes ASCII de 14 colunas com paleta compartilhada.
4. **Web Audio API Chiptune**: Síntese de som e música de 8 bits em tempo real (sem dependência de arquivos de áudio externos mp3/wav).
5. **Jornalismo Checado**: Sistema de diálogos de intro e conclusão com fontes documentadas de veículos oficiais (STF, G1, Folha, BBC Brasil, Estadão, TSE).

---

## 🚀 Como Integrar como Cartucho 3

No componente raiz do Super Flávio (`Xe`), adicione a rota para o hash `#3` ou `#lula`:

```jsx
// 1. Importar o componente
import { GameStage as SuperLulaWorld } from './superlula/components/GameStage.jsx';

// 2. No roteador do Super Flávio (função Xe):
let [cartridge, setCartridge] = useState(() => {
  let h = window.location.hash;
  return h === '#1' ? 1 : h === '#2' ? 2 : h === '#3' || h === '#lula' ? 3 : 0;
});

// 3. Na renderização condicional:
{cartridge === 1 ? (
  <de onExit={onExit} key="g1" />
) : cartridge === 2 ? (
  <Ye onExit={onExit} key="g2" />
) : cartridge === 3 ? (
  <SuperLulaWorld onExit={onExit} key="g3" />
) : (
  <div className="carts px">
    <h1>Escolha o cartucho</h1>
    <div className="cart-row">
      {/* Cartucho 1 - Super Flávio I */}
      <button className={"cart c1" + (cartridge === 1 ? " on" : "")} ...>...</button>

      {/* Cartucho 2 - Super Flávio II */}
      <button className={"cart c2" + (cartridge === 2 ? " on" : "")} ...>...</button>

      {/* Cartucho 3 - Super Lula World */}
      <button 
        className={"cart c3" + (cartridge === 3 ? " on" : "")}
        onClick={() => setHash(3)}
      >
        <span className="shell">
          <span className="lbl">
            <span className="cs">Super</span>
            <span className="cf clula">Lula</span>
            <span className="cw cstar">★ World ★</span>
            <span className="ct">A caravana<br />1980–2026</span>
          </span>
        </span>
      </button>
    </div>
  </div>
)}
```

---

## 🎨 Estilo CSS do Cartucho 3

Adicione as classes específicas do Cartucho 3 ao CSS do Super Flávio:

```css
.cart.c3 .lbl {
  background: linear-gradient(#b71c1c, #d32f2f, #ffd54f);
}
.cart.c3 .cf.clula {
  color: #ffffff;
  -webkit-text-stroke: 1.5px #000;
}
.cart.c3 .cw.cstar {
  color: var(--gold);
}
```

---

## 🗺️ As 7 Fases do Super Lula World

| Fase | Título | Ano | Tema Visual | Mecânica Chave | Fontes Documentadas |
|---|---|---|---|---|---|
| **1** | O Metalúrgico do ABC | 1980 | Fábrica Industrial | Megafones contra agentes do DOPS | Folha de S.Paulo (1980), FGV CPDOC |
| **2** | As Malas do Mensalão | 2005 | Brasília / Congresso | Correr dos holofotes da CPI e malas | STF (AP 470), G1, Folha |
| **3** | O Mistério do Triplex | 2016 | Praia / Solaris | Elevador privativo e plataformas verticais | STF Notícias, G1, BBC Brasil |
| **4** | Os Pedalinhos de Atibaia | 2016 | Sítio & Lago | Pular de pedalinho em pedalinho sobre a água | Folha, Estadão, ConJur |
| **5** | A Vigília e a Anulação | 2018–2021 | Curitiba / PF | Decisões do STF estampam "ANULADO" | STF Notícias, BBC Brasil, G1 |
| **6** | A Frente Ampla do Chuchu | 2022 | Eleição / Crepúsculo | Alckmin atira picolés de chuchu em patos/coxinhas | TSE 2022, BBC Brasil, Poder360 |
| **7** | A Picanha e a Rampa do Planalto | 2023–2026 | Planalto (SMB 1-1 NES) | Bate nos blocos, solta o mapa verde do Brasil (+10 pts) e sobe o mastro com a Bandeira | G1 Posse 2023, IBGE, Folha 2024 |

