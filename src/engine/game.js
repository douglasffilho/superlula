// Physics and Level Engine for Super Lula World

import { audio } from './audio.js';
import { music } from './music.js';
import { THEMES, MAP_NODES, LEVELS } from '../data/levels.js';
import { buildSprites, PALETTE } from './sprites.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Viewport dimensions (exact NES retro 16:9 ratio)
    this.vw = 336;
    this.vh = 192;

    // Build pre-rendered sprite assets
    const { sprites, items } = buildSprites();
    this.sprites = sprites;
    this.items = items;

    // Selected player character ('lula', 'dilma', 'alckmin')
    this.hero = 'lula';

    // Game State: 'title' | 'select' | 'map' | 'play' | 'dialog' | 'pause' | 'dying' | 'clear' | 'credits'
    this.state = 'title';
    this.prevMapState = 'title';

    // Progress
    this.lives = 5;
    this.score = 0;
    this.brasilCount = 0;
    this.currentLevelIdx = 0;
    this.completedMask = 0; // bitmask for completed stages (1..7)

    try {
      this.completedMask = parseInt(localStorage.getItem('slw-done') || '0', 10) || 0;
      // Auto-select latest unlocked stage
      let idx = 0;
      while (idx < 6 && (this.completedMask & (1 << idx))) {
        idx++;
      }
      this.currentLevelIdx = idx;
    } catch (e) {}

    // Input state
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      action: false
    };

    // Camera scroll offset
    this.camX = 0;

    // Frame counter
    this.tickCount = 0;

    // Active Level Data
    this.level = null;
    this.grid = []; // 12 rows x W columns
    this.entities = [];
    this.particles = [];
    this.player = null;

    // Flagpole / Clear animation state
    this.clearTimer = 0;
    this.flagY = 40; // flag sliding down position

    // Active dialog state
    this.dialog = null;

    // Callbacks for UI updates
    this.onStateChange = null;
    this.onHudUpdate = null;
    this.onDialog = null;

    // Fixed 60 FPS loop state
    this.lastTime = 0;
    this.accumTime = 0;
    this.animId = null;
    this.running = false;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop = (now) => {
      if (!this.running) return;
      this.animId = requestAnimationFrame(this.loop);
      const delta = Math.min(100, now - this.lastTime);
      this.lastTime = now;
      this.accumTime += delta;

      while (this.accumTime >= 1000 / 60) {
        this.update();
        this.accumTime -= 1000 / 60;
      }
      this.render();

      // Tick music synthesizer
      const activeTrack = this.getActiveTrack();
      music.tick(audio.ctx, activeTrack, audio.muted, this.state === 'pause');
    };
    this.animId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    music.stop(audio.ctx);
  }

  getActiveTrack() {
    if (this.state === 'title' || this.state === 'select' || this.state === 'map') {
      return 'title';
    }
    if (this.state === 'play' || this.state === 'pause' || this.state === 'dialog') {
      if (this.level) {
        const theme = THEMES[this.level.theme];
        return theme?.music || 'overworld';
      }
    }
    return null;
  }

  // Set input key state
  setInput(key, isPressed) {
    if (key === 'left') this.keys.left = isPressed;
    if (key === 'right') this.keys.right = isPressed;
    if (key === 'up') this.keys.up = isPressed;
    if (key === 'down') this.keys.down = isPressed;
    if (key === 'jump') this.keys.jump = isPressed;
    if (key === 'action') this.keys.action = isPressed;
  }

  // Load a stage
  loadLevel(levelIndex) {
    const levelDef = LEVELS[levelIndex];
    if (!levelDef) return;

    this.currentLevelIdx = levelIndex;
    const w = levelDef.w;
    this.grid = Array.from({ length: 12 }, () => Array(w).fill(' '));
    this.entities = [];
    this.particles = [];
    this.camX = 0;
    this.clearTimer = 0;
    this.flagY = 40;

    // Builder helper API
    const builder = {
      g: (x1, x2, row = 10) => {
        for (let y = row; y < 12; y++) {
          for (let x = x1; x <= x2 && x < w; x++) {
            this.grid[y][x] = 'G';
          }
        }
      },
      p: (x, y, width, tile = 'B') => {
        for (let i = 0; i < width && x + i < w; i++) {
          this.grid[y][x + i] = tile;
        }
      },
      t: (x, y, tile) => {
        if (x < w && y < 12) this.grid[y][x] = tile;
      },
      coin: (x, y, count = 1) => {
        for (let i = 0; i < count; i++) {
          this.entities.push({
            type: 'coin',
            x: (x + i) * 16 + 4,
            y: y * 16 + 2,
            w: 8,
            h: 12,
            collected: false
          });
        }
      },
      stairs: (startX, height, dir = 1) => {
        for (let s = 0; s < height; s++) {
          const col = dir === 1 ? startX + s : startX + (height - 1 - s);
          for (let row = 10 - s; row < 12; row++) {
            if (col < w) this.grid[row][col] = 'X';
          }
        }
      },
      e: (type, x, y, opts = {}) => {
        this.entities.push({
          type,
          x: x * 16,
          y: y * 16,
          w: 14,
          h: 14,
          vx: opts.vx || -0.45,
          vy: 0,
          face: -1,
          dead: false
        });
      },
      goal: (x) => {
        this.goalX = x;
        // Pedestal at flagpole base
        this.grid[9][x] = 'X';
      }
    };

    levelDef.make(builder);
    this.level = levelDef;

    // Initialize player at start
    this.player = {
      x: 32,
      y: 9 * 16 - 4,
      w: 12,
      h: 18,
      vx: 0,
      vy: 0,
      onGround: false,
      face: 1,
      inv: 0,
      sliding: false,
      dead: false
    };

    this.notifyHud();
  }

  notifyHud() {
    if (this.onHudUpdate) {
      this.onHudUpdate({
        lives: this.lives,
        levelName: this.level ? this.level.name : `Fase ${this.currentLevelIdx + 1}`,
        score: this.score,
        brasil: this.brasilCount,
        hero: this.hero
      });
    }
  }

  showDialog(pages, onDone, tag = 'Missão') {
    this.state = 'dialog';
    this.dialog = {
      pages,
      index: 0,
      charCount: 0,
      onDone
    };
    if (this.onDialog) {
      this.onDialog(this.dialog);
    }
  }

  // Handle direct click on retro canvas
  handleCanvasClick(clickX, clickY) {
    audio.init();

    if (this.state === 'title') {
      audio.jump();
      this.state = 'select';
      if (this.onStateChange) this.onStateChange(this.state);
      return;
    }

    if (this.state === 'select') {
      // Lula: x 70..126, Dilma: 140..196, Alckmin: 210..266
      if (clickX >= 65 && clickX <= 130 && clickY >= 50 && clickY <= 130) {
        audio.sel();
        this.hero = 'lula';
        this.notifyHud();
      } else if (clickX >= 135 && clickX <= 200 && clickY >= 50 && clickY <= 130) {
        audio.sel();
        this.hero = 'dilma';
        this.notifyHud();
      } else if (clickX >= 205 && clickX <= 270 && clickY >= 50 && clickY <= 130) {
        audio.sel();
        this.hero = 'alckmin';
        this.notifyHud();
      } else if (clickY >= 135) {
        audio.powerup();
        this.state = 'map';
        if (this.onStateChange) this.onStateChange(this.state);
      }
      return;
    }

    if (this.state === 'map') {
      // Check if user clicked near any node in MAP_NODES
      for (let i = 0; i < MAP_NODES.length; i++) {
        const [nx, ny] = MAP_NODES[i];
        const dist = Math.hypot(clickX - nx, clickY - ny);
        if (dist <= 18) {
          if (this.currentLevelIdx === i) {
            // Start level!
            const curLevel = LEVELS[this.currentLevelIdx];
            this.loadLevel(this.currentLevelIdx);
            this.showDialog(
              [{
                tag: curLevel.intro.tag,
                title: curLevel.intro.title,
                body: curLevel.intro.body
              }],
              () => {
                this.state = 'play';
                if (this.onStateChange) this.onStateChange(this.state);
              }
            );
          } else {
            this.currentLevelIdx = i;
            audio.sel();
            this.notifyHud();
          }
          return;
        }
      }

      // If clicked bottom info bar (y > 165), launch stage!
      if (clickY >= 165) {
        const curLevel = LEVELS[this.currentLevelIdx];
        this.loadLevel(this.currentLevelIdx);
        this.showDialog(
          [{
            tag: curLevel.intro.tag,
            title: curLevel.intro.title,
            body: curLevel.intro.body
          }],
          () => {
            this.state = 'play';
            if (this.onStateChange) this.onStateChange(this.state);
          }
        );
      }
      return;
    }

    if (this.state === 'dialog') {
      this.advanceDialog();
      return;
    }

    if (this.state === 'credits') {
      this.state = 'map';
      if (this.onStateChange) this.onStateChange(this.state);
      return;
    }

    if (this.state === 'play') {
      // Clicking on top half triggers jump
      if (clickY < 120) {
        this.setInput('jump', true);
        setTimeout(() => this.setInput('jump', false), 160);
      }
    }
  }

  // MAIN UPDATE TICK (60 FPS)
  update() {
    this.tickCount++;

    if (this.state === 'title') {
      if (this.keys.jump) {
        this.keys.jump = false;
        audio.jump();
        this.state = 'select';
        if (this.onStateChange) this.onStateChange(this.state);
      }
      return;
    }

    if (this.state === 'select') {
      if (this.keys.left) {
        this.keys.left = false;
        audio.sel();
        if (this.hero === 'lula') this.hero = 'alckmin';
        else if (this.hero === 'dilma') this.hero = 'lula';
        else this.hero = 'dilma';
        this.notifyHud();
      }
      if (this.keys.right) {
        this.keys.right = false;
        audio.sel();
        if (this.hero === 'lula') this.hero = 'dilma';
        else if (this.hero === 'dilma') this.hero = 'alckmin';
        else this.hero = 'lula';
        this.notifyHud();
      }
      if (this.keys.jump) {
        this.keys.jump = false;
        audio.powerup();
        this.state = 'map';
        if (this.onStateChange) this.onStateChange(this.state);
      }
      return;
    }

    if (this.state === 'map') {
      if (this.keys.right || this.keys.up) {
        this.keys.right = false;
        this.keys.up = false;
        if (this.currentLevelIdx < LEVELS.length - 1) {
          this.currentLevelIdx++;
          audio.sel();
          this.notifyHud();
        }
      }
      if (this.keys.left || this.keys.down) {
        this.keys.left = false;
        this.keys.down = false;
        if (this.currentLevelIdx > 0) {
          this.currentLevelIdx--;
          audio.sel();
          this.notifyHud();
        }
      }
      if (this.keys.jump) {
        this.keys.jump = false;
        const curLevel = LEVELS[this.currentLevelIdx];
        this.loadLevel(this.currentLevelIdx);
        this.showDialog(
          [{
            tag: curLevel.intro.tag,
            title: curLevel.intro.title,
            body: curLevel.intro.body
          }],
          () => {
            this.state = 'play';
            if (this.onStateChange) this.onStateChange(this.state);
          }
        );
      }
      return;
    }

    if (this.state === 'dialog') {
      if (this.dialog) {
        const curPage = this.dialog.pages[this.dialog.index];
        const bodyLen = curPage?.body?.length || 0;
        if (this.dialog.charCount < bodyLen) {
          this.dialog.charCount += 1.5;
        }
      }
      return;
    }

    if (this.state === 'pause') {
      return;
    }

    if (this.state === 'play') {
      this.updatePlayState();
    } else if (this.state === 'clear') {
      this.updateClearState();
    } else if (this.state === 'dying') {
      this.updateDyingState();
    }

    // Update active particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.t++;
      p.x += p.vx || 0;
      p.y += p.vy || 0;
      if (p.gravity) p.vy += p.gravity;
      if (p.t > p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  advanceDialog() {
    if (!this.dialog) return;
    const curPage = this.dialog.pages[this.dialog.index];
    const bodyLen = curPage?.body?.length || 0;
    if (this.dialog.charCount < bodyLen) {
      this.dialog.charCount = bodyLen;
      if (this.onDialog) this.onDialog(this.dialog);
      return;
    }

    if (this.dialog.index < this.dialog.pages.length - 1) {
      this.dialog.index++;
      this.dialog.charCount = 0;
      audio.sel();
      if (this.onDialog) this.onDialog(this.dialog);
    } else {
      const doneCb = this.dialog.onDone;
      this.dialog = null;
      if (doneCb) doneCb();
    }
  }

  // GAMEPLAY PHYSICS UPDATE
  updatePlayState() {
    const p = this.player;
    if (!p) return;

    if (p.inv > 0) p.inv--;

    // Horizontal Movement
    const maxSpeed = this.keys.action ? 3.4 : 2.4;
    const accel = 0.16;
    const friction = 0.84;

    if (this.keys.left) {
      p.vx -= accel;
      p.face = -1;
    } else if (this.keys.right) {
      p.vx += accel;
      p.face = 1;
    } else {
      p.vx *= friction;
      if (Math.abs(p.vx) < 0.05) p.vx = 0;
    }

    p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));

    // Jump Movement
    if (this.keys.jump) {
      if (p.onGround) {
        p.vy = -5.3;
        p.onGround = false;
        audio.jump();
      }
    } else if (p.vy < -2.2) {
      p.vy *= 0.6; // Variable jump height
    }

    // Action Key (Projectile shoot or summon)
    if (this.keys.action && this.tickCount % 22 === 0) {
      this.spawnProjectile(p.x + (p.face > 0 ? 12 : -8), p.y + 4, p.face * 4);
    }

    // Gravity
    p.vy += 0.26;
    if (p.vy > 4.8) p.vy = 4.8;

    // Apply Horizontal Movement & Tile Collision
    p.x += p.vx;
    this.collideHorizontal(p);

    // Apply Vertical Movement & Tile Collision
    p.onGround = false;
    p.y += p.vy;
    this.collideVertical(p);

    // Pit fall check
    if (p.y > 210) {
      this.killPlayer('pit');
      return;
    }

    // Camera follow player
    const targetCamX = p.x - this.vw * 0.38;
    this.camX = Math.max(0, Math.min((this.level.w * 16) - this.vw, targetCamX));

    // Check Goal Collision (Flagpole reached!)
    if (p.x >= this.goalX * 16 - 4 && !p.sliding) {
      p.sliding = true;
      p.vx = 0;
      p.x = this.goalX * 16 - 6;
      audio.flagSlide();
      this.state = 'clear';
      this.clearTimer = 160;
      return;
    }

    // Update Entities
    this.updateEntities();
  }

  // Tile collision routines
  getTile(tx, ty) {
    if (ty < 0 || ty >= 12 || tx < 0 || tx >= this.level.w) return ' ';
    return this.grid[ty][tx];
  }

  isSolid(tx, ty) {
    const tile = this.getTile(tx, ty);
    return tile === 'G' || tile === 'B' || tile === '?' || tile === 'D' || tile === 'X';
  }

  collideHorizontal(p) {
    const topTile = Math.floor((p.y + 2) / 16);
    const bottomTile = Math.floor((p.y + p.h - 1) / 16);

    if (p.vx > 0) {
      const rightTile = Math.floor((p.x + p.w) / 16);
      for (let ty = topTile; ty <= bottomTile; ty++) {
        if (this.isSolid(rightTile, ty)) {
          p.x = rightTile * 16 - p.w;
          p.vx = 0;
          break;
        }
      }
    } else if (p.vx < 0) {
      const leftTile = Math.floor(p.x / 16);
      for (let ty = topTile; ty <= bottomTile; ty++) {
        if (this.isSolid(leftTile, ty)) {
          p.x = (leftTile + 1) * 16;
          p.vx = 0;
          break;
        }
      }
    }
  }

  collideVertical(p) {
    const leftTile = Math.floor((p.x + 2) / 16);
    const rightTile = Math.floor((p.x + p.w - 2) / 16);

    if (p.vy > 0) {
      // Falling down
      const bottomTile = Math.floor((p.y + p.h) / 16);
      for (let tx = leftTile; tx <= rightTile; tx++) {
        if (this.isSolid(tx, bottomTile)) {
          p.y = bottomTile * 16 - p.h;
          p.vy = 0;
          p.onGround = true;
          break;
        }
      }
    } else if (p.vy < 0) {
      // Jumping up - bump block with head!
      const topTile = Math.floor(p.y / 16);
      for (let tx = leftTile; tx <= rightTile; tx++) {
        const tile = this.getTile(tx, topTile);
        if (this.isSolid(tx, topTile)) {
          p.y = (topTile + 1) * 16;
          p.vy = 0;
          this.hitBlock(tx, topTile, tile);
          break;
        }
      }
    }
  }

  // Hit block from below
  hitBlock(tx, ty, tile) {
    if (tile === '?') {
      // Turns into used block 'D'
      this.grid[ty][tx] = 'D';
      audio.brasil();
      this.brasilCount++;
      this.score += 10;
      this.notifyHud();

      // Spawn pop-up green Brasil map item and +10 score text!
      this.particles.push({
        type: 'pop_brasil',
        x: tx * 16 + 2,
        y: ty * 16 - 12,
        vy: -2.8,
        gravity: 0.14,
        t: 0,
        maxLife: 26
      });
      this.particles.push({
        type: 'text',
        text: '10',
        x: tx * 16 + 4,
        y: ty * 16 - 14,
        vy: -0.6,
        t: 0,
        maxLife: 35
      });
    } else if (tile === 'B') {
      audio.bump();
      this.particles.push({
        type: 'bump_tile',
        tx,
        ty,
        t: 0,
        maxLife: 10
      });
    }
  }

  spawnProjectile(x, y, vx) {
    audio.shoot();
    this.particles.push({
      type: 'chuchu',
      x,
      y,
      vx,
      vy: 0,
      t: 0,
      maxLife: 50
    });
  }

  // Update enemies and items
  updateEntities() {
    const p = this.player;

    for (const ent of this.entities) {
      if (ent.dead) continue;

      if (ent.type === 'coin') {
        // Collect coin
        if (
          p.x < ent.x + ent.w &&
          p.x + p.w > ent.x &&
          p.y < ent.y + ent.h &&
          p.y + p.h > ent.y
        ) {
          ent.dead = true;
          audio.coin();
          this.score += 100;
          this.notifyHud();
          this.particles.push({
            type: 'text',
            text: '100',
            x: ent.x,
            y: ent.y,
            vy: -0.5,
            t: 0,
            maxLife: 28
          });
        }
        continue;
      }

      // Enemy walking physics
      ent.x += ent.vx;
      ent.vy = (ent.vy || 0) + 0.2;
      ent.y += ent.vy;

      // Enemy ground collision
      const botTile = Math.floor((ent.y + ent.h) / 16);
      const midXTile = Math.floor((ent.x + ent.w / 2) / 16);
      if (this.isSolid(midXTile, botTile)) {
        ent.y = botTile * 16 - ent.h;
        ent.vy = 0;
      }

      // Reverse direction at solid walls
      const checkX = ent.vx > 0 ? ent.x + ent.w : ent.x;
      const wallTile = Math.floor(checkX / 16);
      const wallY = Math.floor((ent.y + 4) / 16);
      if (this.isSolid(wallTile, wallY)) {
        ent.vx *= -1;
      }

      // Check collision with projectiles
      for (const part of this.particles) {
        if (part.type === 'chuchu') {
          if (
            part.x < ent.x + ent.w &&
            part.x + 8 > ent.x &&
            part.y < ent.y + ent.h &&
            part.y + 8 > ent.y
          ) {
            ent.dead = true;
            part.t = 999;
            audio.stomp();
            this.score += 200;
            this.notifyHud();
            this.particles.push({
              type: 'text',
              text: '200',
              x: ent.x,
              y: ent.y,
              vy: -0.6,
              t: 0,
              maxLife: 30
            });
            break;
          }
        }
      }

      // Player collision with enemy
      if (
        p.x < ent.x + ent.w &&
        p.x + p.w > ent.x &&
        p.y < ent.y + ent.h &&
        p.y + p.h > ent.y
      ) {
        // Stomp on top of enemy!
        if (p.vy > 0 && p.y + p.h - p.vy <= ent.y + 6) {
          ent.dead = true;
          p.vy = -3.8;
          audio.stomp();
          this.score += 200;
          this.notifyHud();
          this.particles.push({
            type: 'text',
            text: '200',
            x: ent.x,
            y: ent.y,
            vy: -0.6,
            t: 0,
            maxLife: 30
          });
        } else if (p.inv <= 0) {
          this.killPlayer('enemy');
        }
      }
    }
  }

  killPlayer(cause) {
    const p = this.player;
    if (p.dead) return;
    p.dead = true;
    p.vy = -4.5;
    audio.die();
    this.lives--;
    this.state = 'dying';
    this.clearTimer = 90;
    this.notifyHud();
  }

  updateDyingState() {
    const p = this.player;
    if (p) {
      p.vy += 0.22;
      p.y += p.vy;
    }
    this.clearTimer--;
    if (this.clearTimer <= 0) {
      if (this.lives <= 0) {
        this.lives = 5;
        this.state = 'title';
      } else {
        this.loadLevel(this.currentLevelIdx);
        this.state = 'play';
      }
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  // Clear state: slide down pole and enter castle!
  updateClearState() {
    const p = this.player;
    if (!p) return;

    this.clearTimer--;

    // Flag slides down
    if (this.flagY < 130) {
      this.flagY += 1.2;
    }

    // Player slides down flagpole
    if (p.y < 9 * 16 - 2) {
      p.y += 1.4;
    } else {
      // Step off pole and walk right into castle door
      p.face = 1;
      p.x += 0.9;
    }

    if (this.clearTimer === 60) {
      audio.clear();
      this.score += 1000;
      this.notifyHud();
    }

    if (this.clearTimer <= 0) {
      // Mark stage as completed
      this.completedMask |= (1 << this.currentLevelIdx);
      try {
        localStorage.setItem('slw-done', String(this.completedMask));
      } catch (e) {}

      // Show Outro Story Dialog with verified sources!
      const curLevel = this.level;
      this.showDialog(
        [{
          tag: 'Fase Concluída!',
          title: curLevel.name,
          body: curLevel.outro.body,
          note: curLevel.outro.note,
          src: curLevel.outro.src
        }],
        () => {
          if (this.currentLevelIdx >= LEVELS.length - 1) {
            this.state = 'credits';
          } else {
            this.state = 'map';
          }
          if (this.onStateChange) this.onStateChange(this.state);
        }
      );
    }
  }

  // CANVAS 2D RENDERING ROUTINE
  render() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (this.state === 'title' || this.state === 'select') {
      this.renderTitleScreen();
    } else if (this.state === 'map') {
      this.renderMapScreen();
    } else if (this.state === 'credits') {
      this.renderCreditsScreen();
    } else {
      this.renderLevelScreen();
    }
  }

  // Render Title and Select Screens
  renderTitleScreen() {
    const ctx = this.ctx;
    // Sky
    const grad = ctx.createLinearGradient(0, 0, 0, this.vh);
    grad.addColorStop(0, '#5c94fc');
    grad.addColorStop(1, '#a4c2ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.vw, this.vh);

    // Scrolling Clouds & Hills
    this.drawHillsAndClouds(this.tickCount * 0.4);

    // Floor
    ctx.fillStyle = '#c84418';
    ctx.fillRect(0, 160, this.vw, 32);

    if (this.state === 'title') {
      // Retro Title Logo
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1a1020';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('SUPER', this.vw / 2 + 1, 46);
      ctx.fillStyle = '#ffd21f';
      ctx.fillText('SUPER', this.vw / 2, 45);

      ctx.fillStyle = '#1a1020';
      ctx.font = '22px "Press Start 2P", monospace';
      ctx.fillText('LULA', this.vw / 2 + 2, 72);
      ctx.fillStyle = '#d32f2f';
      ctx.fillText('LULA', this.vw / 2, 70);

      ctx.fillStyle = '#1a1020';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('WORLD', this.vw / 2 + 1, 92);
      ctx.fillStyle = '#169c3c';
      ctx.fillText('WORLD', this.vw / 2, 91);

      // Blinking press start text
      if ((this.tickCount >> 5) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText('APERTE Z PARA COMEÇAR', this.vw / 2, 132);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '6px "VT323", monospace';
      ctx.fillText('Uma sátira baseada em fatos reais · 1980–2026', this.vw / 2, 150);
    } else if (this.state === 'select') {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText('SELECIONE O JOGADOR', this.vw / 2, 40);

      const charList = [
        { id: 'lula', name: 'LULA', title: 'O Presidente', x: this.vw / 2 - 70 },
        { id: 'dilma', name: 'DILMA', title: 'A Presidenta', x: this.vw / 2 },
        { id: 'alckmin', name: 'ALCKMIN', title: 'O Vice Chuchu', x: this.vw / 2 + 70 }
      ];

      charList.forEach((c) => {
        const isSelected = this.hero === c.id;
        const bounce = isSelected ? Math.sin(this.tickCount * 0.15) * 3 : 0;

        if (isSelected) {
          ctx.strokeStyle = '#ffd21f';
          ctx.lineWidth = 2;
          ctx.strokeRect(c.x - 22, 60, 44, 60);
          ctx.fillStyle = 'rgba(255, 210, 31, 0.2)';
          ctx.fillRect(c.x - 22, 60, 44, 60);
        }

        // Draw character sprite
        const sprCanvas = this.sprites[c.id].stand[0];
        ctx.drawImage(sprCanvas, c.x - 7, 72 + bounce);

        ctx.fillStyle = isSelected ? '#ffd21f' : '#ffffff';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(c.name, c.x, 102);

        ctx.fillStyle = '#d4d8f5';
        ctx.font = '6px "VT323", monospace';
        ctx.fillText(c.title, c.x, 114);
      });

      ctx.fillStyle = '#ffffff';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('◀ / ▶ ESCOLHE · Z CONFIRMA', this.vw / 2, 145);
    }
  }

  // Render Brazil World Map Screen
  renderMapScreen() {
    const ctx = this.ctx;
    // Map ocean background
    ctx.fillStyle = '#2a6fd6';
    ctx.fillRect(0, 0, this.vw, this.vh);

    // Brazil mainland green landmass
    ctx.fillStyle = '#1f7a2e';
    ctx.beginPath();
    ctx.ellipse(this.vw / 2, 118, 150, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3ec04a';
    ctx.beginPath();
    ctx.ellipse(this.vw / 2, 114, 144, 54, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dotted paths between nodes
    for (let i = 0; i < MAP_NODES.length - 1; i++) {
      const [x1, y1] = MAP_NODES[i];
      const [x2, y2] = MAP_NODES[i + 1];
      for (let step = 1; step < 8; step++) {
        const factor = step / 8;
        const px = x1 + (x2 - x1) * factor;
        const py = y1 + (y2 - y1) * factor;
        ctx.fillStyle = '#f4e08a';
        ctx.fillRect(px - 1, py - 1, 3, 3);
      }
    }

    // Stage Nodes
    MAP_NODES.forEach(([nx, ny], idx) => {
      const isDone = !!(this.completedMask & (1 << idx));
      ctx.fillStyle = '#1a1020';
      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isDone ? '#ffd21f' : '#e8412c';
      ctx.beginPath();
      ctx.arc(nx, ny, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(idx + 1), nx, ny + 3);

      if (isDone) {
        // Green star / checkmark
        ctx.fillStyle = '#169c3c';
        ctx.fillRect(nx + 4, ny - 8, 4, 4);
      }
    });

    // Player standing on selected node
    const [curX, curY] = MAP_NODES[this.currentLevelIdx];
    const bounce = Math.round(Math.sin(this.tickCount * 0.12) * 2);
    const heroSpr = this.sprites[this.hero].stand[0];
    ctx.drawImage(heroSpr, curX - 7, curY - 26 + bounce);

    // Map Header & Info Bar
    ctx.fillStyle = '#1a1020';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SUPER LULA WORLD', this.vw / 2 + 1, 19);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SUPER LULA WORLD', this.vw / 2, 18);

    // Stage name at bottom
    const curLevel = LEVELS[this.currentLevelIdx];
    ctx.fillStyle = '#070920';
    ctx.fillRect(0, 168, this.vw, 24);
    ctx.fillStyle = '#ffd21f';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(`FASE ${this.currentLevelIdx + 1}: ${curLevel.name} (${curLevel.year})`, this.vw / 2, 182);
  }

  // Render In-Game Gameplay Screen
  renderLevelScreen() {
    const ctx = this.ctx;
    const theme = THEMES[this.level.theme] || THEMES.planalto;

    // Sky Background
    ctx.fillStyle = theme.sky[0];
    ctx.fillRect(0, 0, this.vw, this.vh);

    // Parallax Clouds & Bushes
    this.drawHillsAndClouds(this.camX * 0.25);

    // Tile Grid Rendering
    const startCol = Math.max(0, Math.floor(this.camX / 16));
    const endCol = Math.min(this.level.w - 1, startCol + Math.ceil(this.vw / 16) + 1);

    for (let row = 0; row < 12; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tile = this.grid[row][col];
        if (tile === ' ') continue;
        const destX = Math.round(col * 16 - this.camX);
        const destY = row * 16;
        this.drawTile(tile, destX, destY, theme);
      }
    }

    // Flagpole and Castle at Goal
    this.drawGoal(theme);

    // Render Entities (Coins, Enemies)
    for (const ent of this.entities) {
      if (ent.dead) continue;
      const destX = Math.round(ent.x - this.camX);
      if (destX < -20 || destX > this.vw + 20) continue;
      this.drawEntity(ent, destX, ent.y);
    }

    // Render Player
    const p = this.player;
    if (p && (!p.inv || (this.tickCount >> 2) % 2 === 0)) {
      const destX = Math.round(p.x - this.camX);
      let anim = 'stand';
      if (p.sliding) {
        anim = 'pole';
      } else if (!p.onGround) {
        anim = 'jump';
      } else if (Math.abs(p.vx) > 0.2) {
        anim = (this.tickCount >> 3) % 2 === 0 ? 'walk' : 'stand';
      }

      const flip = p.face < 0;
      const sprCanvas = this.sprites[this.hero][anim][flip ? 1 : 0];
      ctx.drawImage(sprCanvas, destX, p.y);
    }

    // Render Particles (Brasil pop, text, chuchu)
    for (const part of this.particles) {
      const destX = Math.round(part.x - this.camX);
      if (part.type === 'pop_brasil') {
        ctx.drawImage(this.items.brasil, destX, part.y);
      } else if (part.type === 'text') {
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(part.text, destX, part.y);
      } else if (part.type === 'chuchu') {
        ctx.fillStyle = '#80c040';
        ctx.fillRect(destX, part.y, 6, 6);
      }
    }

    // Goal clear banner
    if (this.state === 'clear' && this.clearTimer < 90) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FASE CONCLUÍDA!', this.vw / 2 + 1, 80 + 1);
      ctx.fillStyle = '#ffd21f';
      ctx.fillText('FASE CONCLUÍDA!', this.vw / 2, 80);
    }
  }

  // Draw Scenery (Clouds & Bushes)
  drawHillsAndClouds(scrollOffset) {
    const ctx = this.ctx;
    // Clouds
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const cx = (((i * 120 - scrollOffset * 0.5) % (this.vw + 60)) + this.vw + 60) % (this.vw + 60) - 40;
      const cy = 25 + (i % 2) * 20;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 4, 12, 0, Math.PI * 2);
      ctx.arc(cx + 18, cy, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Green hills / bushes
    ctx.fillStyle = '#169c3c';
    for (let i = 0; i < 3; i++) {
      const hx = (((i * 150 - scrollOffset) % (this.vw + 80)) + this.vw + 80) % (this.vw + 80) - 40;
      ctx.beginPath();
      ctx.arc(hx, 160, 24, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#1a1020';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Draw Individual Tile
  drawTile(tile, x, y, theme) {
    const ctx = this.ctx;
    if (tile === 'G') {
      // Ground tile with top border and bricks
      ctx.fillStyle = theme.top;
      ctx.fillRect(x, y, 16, 2);
      ctx.fillStyle = theme.fill;
      ctx.fillRect(x, y + 2, 16, 14);
      ctx.fillStyle = theme.dot;
      ctx.fillRect(x + 2, y + 4, 2, 2);
      ctx.fillRect(x + 10, y + 10, 2, 2);
    } else if (tile === 'B') {
      // Brick block
      ctx.fillStyle = theme.brick;
      ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = '#1a1020';
      ctx.strokeRect(x + 0.5, y + 0.5, 15, 15);
      ctx.fillRect(x, y + 8, 16, 1);
      ctx.fillRect(x + 8, y, 1, 8);
      ctx.fillRect(x + 4, y + 8, 1, 8);
      ctx.fillRect(x + 12, y + 8, 1, 8);
    } else if (tile === '?') {
      // Question block
      ctx.fillStyle = '#ffd21f';
      ctx.fillRect(x, y, 16, 16);
      ctx.strokeStyle = '#1a1020';
      ctx.strokeRect(x + 0.5, y + 0.5, 15, 15);
      ctx.fillStyle = '#1a1020';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('?', x + 8, y + 12);
    } else if (tile === 'D') {
      // Used block
      ctx.fillStyle = '#8a6a50';
      ctx.fillRect(x, y, 16, 16);
      ctx.strokeStyle = '#1a1020';
      ctx.strokeRect(x + 0.5, y + 0.5, 15, 15);
    } else if (tile === 'X') {
      // Solid stone pedestal block
      ctx.fillStyle = '#b85c38';
      ctx.fillRect(x, y, 16, 16);
      ctx.strokeStyle = '#1a1020';
      ctx.strokeRect(x + 0.5, y + 0.5, 15, 15);
    }
  }

  // Draw Goal: Flagpole with Brazilian Flag & Castle
  drawGoal(theme) {
    const ctx = this.ctx;
    const gx = Math.round(this.goalX * 16 - this.camX);
    if (gx < -100 || gx > this.vw + 120) return;

    // Green Flagpole (10 tiles high, ~160px)
    const poleTop = 32;
    const poleBottom = 9 * 16;
    ctx.fillStyle = '#169c3c';
    ctx.fillRect(gx + 6, poleTop, 4, poleBottom - poleTop);

    // Green/gold ball on top
    ctx.beginPath();
    ctx.arc(gx + 8, poleTop - 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd21f';
    ctx.fill();

    // Brazilian Flag attached to pole!
    // When sliding, flag slides down with this.flagY
    const flagY = Math.min(poleBottom - 16, this.flagY);
    ctx.drawImage(this.items.flag, gx - 16, flagY);

    // Red Brick Castle behind the pole!
    const castleX = gx + 28;
    const castleY = 64;
    const castleW = 64;
    const castleH = 96;

    // Castle Wall
    ctx.fillStyle = '#b84418';
    ctx.fillRect(castleX, castleY, castleW, castleH);
    ctx.strokeStyle = '#1a1020';
    ctx.lineWidth = 1;
    ctx.strokeRect(castleX, castleY, castleW, castleH);

    // Castle Battlements (Turrets) on top
    for (let t = 0; t < 4; t++) {
      ctx.fillStyle = '#b84418';
      ctx.fillRect(castleX + t * 16, castleY - 12, 12, 12);
      ctx.strokeRect(castleX + t * 16, castleY - 12, 12, 12);
    }

    // Castle Arched Doorway
    ctx.fillStyle = '#1a1020';
    ctx.beginPath();
    ctx.arc(castleX + castleW / 2, castleY + castleH - 24, 12, Math.PI, 0);
    ctx.rect(castleX + castleW / 2 - 12, castleY + castleH - 24, 24, 24);
    ctx.fill();
  }

  // Draw Entity
  drawEntity(ent, x, y) {
    const ctx = this.ctx;
    if (ent.type === 'coin') {
      ctx.fillStyle = '#ffd21f';
      ctx.beginPath();
      ctx.ellipse(x + 4, y + 6, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 3, y + 4, 2, 4);
    } else if (this.items[ent.type]) {
      const flip = ent.vx > 0;
      const spr = Array.isArray(this.items[ent.type])
        ? this.items[ent.type][flip ? 1 : 0]
        : this.items[ent.type];
      ctx.drawImage(spr, x, y);
    }
  }

  // Credits Screen when game is completed!
  renderCreditsScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = '#070920';
    ctx.fillRect(0, 0, this.vw, this.vh);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd21f';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('PARABÉNS, COMPANHEIRO!', this.vw / 2, 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('VOCÊ ZEROU SUPER LULA WORLD!', this.vw / 2, 54);

    // Display Hero with Presidential Sash & Brazilian Flag
    const heroSpr = this.sprites[this.hero].stand[0];
    ctx.drawImage(heroSpr, this.vw / 2 - 14, 70);
    ctx.drawImage(this.items.flag, this.vw / 2 + 6, 72);

    ctx.fillStyle = '#d4d8f5';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText(`PONTUAÇÃO FINAL: ${this.score}`, this.vw / 2, 110);
    ctx.fillText(`MAPAS DO BRASIL: ${this.brasilCount}`, this.vw / 2, 124);

    ctx.fillStyle = '#8a9ab8';
    ctx.font = '6px "VT323", monospace';
    ctx.fillText('Todas as 7 fases checadas com fontes oficiais do STF e imprensa.', this.vw / 2, 148);

    if ((this.tickCount >> 5) % 2 === 0) {
      ctx.fillStyle = '#ffd21f';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText('APERTE Z PARA VOLTAR AO MENU', this.vw / 2, 172);
    }

    if (this.keys.jump) {
      this.keys.jump = false;
      this.state = 'map';
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }
}

