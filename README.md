# 🌟 Super Lula World (1980–2026)

> Um jogo de plataforma 8-bit satírico e factual, criado com a mesma tecnologia de **Super Flávio World** (`https://www.superflavio.com/#1`).

![Super Lula Screenshot](https://raw.githubusercontent.com/superflavio/assets/main/demo.png)

---

## 🎮 Sobre o Jogo

**Super Lula World** reconta a trajetória política e as principais controvérsias de Luiz Inácio Lula da Silva entre 1980 e 2026 no formato clássico de plataforma retro (NES / Super Mario Bros).

Assim como o **Super Flávio**, todas as fases contam com introduções e conclusões fundamentadas em reportagens jornalísticas e autos oficiais checados (STF, G1, Folha de S.Paulo, BBC News Brasil, Estadão, TSE e FGV CPDOC).

---

## 🕹️ Controles (Computador e Mobile)

O jogo pode ser jogado no computador tanto pelo **teclado** quanto **clicando diretamente nos botões da tela com o mouse** (ou por toque no celular):

| Ação | Teclado no PC | Botões na Tela (Mouse ou Toque) |
|---|---|---|
| **Mover para a Esquerda** | ◀ ou **A** | Botão **◀** `[A]` (clicar e segurar) |
| **Mover para a Direita** | ▶ ou **D** | Botão **▶** `[D]` (clicar e segurar) |
| **Olhar Cima / Menu** | ▲ ou **W** | Botão **▲** `[W]` |
| **Abaixar / Menu** | ▼ ou **S** | Botão **▼** `[S]` |
| **Pular / Confirmar** | **Z** ou **Espaço** / Enter | Botão **Z** `[PULAR]` |
| **Correr / Ação Especial** | **X** ou **Shift** | Botão **X** `[AÇÃO]` |
| **Pausar Jogo** | **Esc** | Botão **⏸** no topo |
| **Ligar/Desligar Som** | **M** | Botão **🔊** no topo |
| **Interação no Canvas** | - | Clique no canvas para selecionar personagens ou fases |

---

## ⚙️ Stack Tecnológica

- **Framework**: React 19 + Vite
- **Engine Gráfica**: HTML5 Canvas 2D (Resolução nativa retro `336 x 192`, aspect ratio 16:9)
- **Game Loop**: 60 FPS com acumulador de física de passo fixo
- **Sprites**: Gerados programmaticamente via matrizes ASCII de pixel art (14x20)
- **Áudio**: Web Audio API Chiptune (Síntese de som e música de 8 bits em tempo real)
- **Design Responsivo**: CSS com container queries (`--u: 1cqw`) e controles virtuais de toque

---

## 📦 Como Rodar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em ambiente de desenvolvimento
npm run dev

# 3. Compilar para produção
npm run build
```

---

## 🤝 Integração com o Super Flávio

Consulte o arquivo [`INTEGRATION_SUPER_FLAVIO.md`](./INTEGRATION_SUPER_FLAVIO.md) para o guia passo a passo de como plugar o Super Lula World como Cartucho 3 no site oficial do Super Flávio.

