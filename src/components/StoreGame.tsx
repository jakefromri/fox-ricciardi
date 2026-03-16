import { useEffect, useRef, useState, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GameDisplay {
  id: number
  label: string
  title: string
  content: string
  color: string
  glow: string
  pos_x: number
  pos_y: number
  sort_order: number
}

interface RuntimeDisplay extends GameDisplay {
  visited: boolean
}

// ── Audio ─────────────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return audioCtx
}

function playTone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.10, delay = 0) {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gain.gain.setValueAtTime(0.001, ctx.currentTime + delay)
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + dur + 0.05)
  } catch {
    // audio may be blocked — fail silently
  }
}

function playInteract() {
  playTone(523, 0.07, 'square', 0.10)
  playTone(659, 0.07, 'square', 0.10, 0.08)
  playTone(784, 0.15, 'square', 0.10, 0.16)
}

function playClose() {
  playTone(392, 0.06, 'square', 0.08)
  playTone(330, 0.10, 'square', 0.08, 0.07)
}

function playVisitAll() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1175, 1319]
  notes.forEach((n, i) => playTone(n, 0.15, 'square', 0.11, i * 0.12))
}

const BG_NOTES = [392,440,494,523,494,440,392,392,349,392,440,392,349,330,349,0,392,440,494,523,587,523,494,440,523,494,440,392,349,330,349,392]

// ── Constants ─────────────────────────────────────────────────────────────────

const W = 800
const H = 576
const KIOSK_W = 76
const KIOSK_H = 52
const PROXIMITY = 80

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  displays: GameDisplay[]
  introText: string
}

export function StoreGame({ displays: rawDisplays, introText }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    gameState: 'start' as 'start' | 'playing' | 'dialog',
    player: { x: 380, y: 490, w: 20, h: 24, speed: 3, dir: 1 },
    displays: [] as RuntimeDisplay[],
    keys: {} as Record<string, boolean>,
    frameCount: 0,
    stepTimer: 0,
    bgIdx: 0,
    nearDisplay: null as RuntimeDisplay | null,
    celebFrames: 0,
    visitedCount: 0,
  })
  const bgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rafRef = useRef<number>(0)

  // Dialog state lives in React so the panel re-renders
  const [dialogDisplay, setDialogDisplay] = useState<RuntimeDisplay | null>(null)
  const [visitedCount, setVisitedCount] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [nearLabel, setNearLabel] = useState<string | null>(null)

  // Sync raw displays → runtime displays (with visited flag)
  useEffect(() => {
    stateRef.current.displays = [...rawDisplays]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(d => ({ ...d, visited: false }))
  }, [rawDisplays])

  // ── Collision ───────────────────────────────────────────────────────────────

  const buildWalls = useCallback(() => {
    const outer: [number,number,number,number][] = [
      [0,0,W,16],[0,560,W,16],[0,0,16,H],[784,0,16,H]
    ]
    const shelves: [number,number,number,number][] = [
      [32,72,48,10],[32,96,48,10],[32,120,48,10],[32,144,10,60],
      [720,72,48,10],[720,96,48,10],[720,120,48,10],[742,72,10,82],
      [150,196,10,180],[200,196,10,180],[150,196,60,10],[150,368,60,10],
      [270,196,10,180],[320,196,10,180],[270,196,60,10],[270,368,60,10],
      [478,196,10,180],[528,196,10,180],[478,196,60,10],[478,368,60,10],
      [598,196,10,180],[648,196,10,180],[598,196,60,10],[598,368,60,10],
      [32,416,110,14],[32,430,10,80],[142,416,10,94],
      [658,416,110,14],[658,430,10,80],[768,414,16,146],
    ]
    const kiosks = stateRef.current.displays.map(d =>
      [d.pos_x, d.pos_y, KIOSK_W, KIOSK_H] as [number,number,number,number]
    )
    return [...outer, ...shelves, ...kiosks]
  }, [])

  const checkCollision = useCallback((nx: number, ny: number) => {
    const walls = buildWalls()
    const p = stateRef.current.player
    const pad = 3
    const px = nx + pad, py = ny + pad
    const pw = p.w - pad * 2, ph = p.h - pad * 2
    for (const [wx, wy, ww, wh] of walls) {
      if (px < wx + ww && px + pw > wx && py < wy + wh && py + ph > wy) return true
    }
    return nx < 16 || nx + p.w > 784 || ny < 16 || ny + p.h > 560
  }, [buildWalls])

  // ── Game actions ─────────────────────────────────────────────────────────────

  const openDisplay = useCallback((d: RuntimeDisplay) => {
    const s = stateRef.current
    if (!d.visited) {
      d.visited = true
      s.visitedCount++
      setVisitedCount(s.visitedCount)
      if (s.visitedCount === s.displays.length) {
        s.celebFrames = 360
        setTimeout(playVisitAll, 300)
      }
    }
    s.gameState = 'dialog'
    setDialogDisplay({ ...d })
    playInteract()
  }, [])

  const closeDialog = useCallback(() => {
    stateRef.current.gameState = 'playing'
    setDialogDisplay(null)
    playClose()
  }, [])

  const startGame = useCallback(() => {
    stateRef.current.gameState = 'playing'
    setGameStarted(true)
    // start bg music
    if (!bgIntervalRef.current) {
      bgIntervalRef.current = setInterval(() => {
        const s = stateRef.current
        const n = BG_NOTES[s.bgIdx % BG_NOTES.length]
        if (n > 0) {
          playTone(n, 0.25, 'square', 0.05)
          playTone(n / 2, 0.25, 'triangle', 0.03)
        }
        s.bgIdx++
      }, 280)
    }
  }, [])

  // ── Keyboard ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const s = stateRef.current
      if (s.gameState === 'start') {
        if (e.code === 'Enter' || e.code === 'Space') startGame()
        return
      }
      if (s.gameState === 'dialog') {
        if (e.code === 'Escape') closeDialog()
        return
      }
      s.keys[e.code] = true
      if ((e.code === 'Space' || e.code === 'KeyE') && s.nearDisplay) {
        openDisplay(s.nearDisplay)
      }
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        e.preventDefault()
      }
    }
    const onUp = (e: KeyboardEvent) => { stateRef.current.keys[e.code] = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [startGame, closeDialog, openDisplay])

  // ── Cleanup ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (bgIntervalRef.current) clearInterval(bgIntervalRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ── Game loop ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    function update() {
      const s = stateRef.current
      if (s.gameState !== 'playing') return
      s.frameCount++

      const p = s.player
      let dx = 0, dy = 0
      if (s.keys['ArrowLeft']  || s.keys['KeyA']) { dx = -p.speed; p.dir = 2 }
      if (s.keys['ArrowRight'] || s.keys['KeyD']) { dx =  p.speed; p.dir = 3 }
      if (s.keys['ArrowUp']    || s.keys['KeyW']) { dy = -p.speed; p.dir = 1 }
      if (s.keys['ArrowDown']  || s.keys['KeyS']) { dy =  p.speed; p.dir = 0 }

      if (dx !== 0 || dy !== 0) {
        if (!checkCollision(p.x + dx, p.y)) p.x += dx
        if (!checkCollision(p.x, p.y + dy)) p.y += dy
        s.stepTimer++
        if (s.stepTimer % 18 === 0) playTone(80 + Math.random() * 30, 0.04, 'triangle', 0.02)
      }

      // Proximity check
      const cx = p.x + p.w / 2, cy = p.y + p.h / 2
      let closest: RuntimeDisplay | null = null
      let closestDist = Infinity
      for (const d of s.displays) {
        const dist = Math.hypot(cx - (d.pos_x + KIOSK_W / 2), cy - (d.pos_y + KIOSK_H / 2))
        if (dist < PROXIMITY && dist < closestDist) { closest = d; closestDist = dist }
      }
      s.nearDisplay = closest
      setNearLabel(closest ? `▶ PRESS SPACE  ·  ${closest.label}` : null)

      if (s.celebFrames > 0) s.celebFrames--
    }

    // ── Draw functions ───────────────────────────────────────────────────────────

    function drawStore() {
      // Base tiles
      for (let ty = 0; ty < 18; ty++) {
        for (let tx = 0; tx < 25; tx++) {
          ctx.fillStyle = (tx + ty) % 2 === 0 ? '#F5EDD8' : '#EADFC6'
          ctx.fillRect(16 + tx * 32, 16 + ty * 32, 32, 32)
        }
      }
      // Section overlays
      ctx.fillStyle = 'rgba(100,200,100,0.22)';  ctx.fillRect(16,16,250,190)
      ctx.fillStyle = 'rgba(255,220,80,0.18)';   ctx.fillRect(266,16,268,190)
      ctx.fillStyle = 'rgba(80,160,255,0.18)';   ctx.fillRect(534,16,250,190)
      ctx.fillStyle = 'rgba(255,160,60,0.2)';    ctx.fillRect(16,400,260,160)
      ctx.fillStyle = 'rgba(60,200,170,0.18)';   ctx.fillRect(534,400,250,160)

      // Outer walls
      ctx.fillStyle = '#2A4A18'
      ctx.fillRect(0,0,W,16); ctx.fillRect(0,560,W,16)
      ctx.fillRect(0,0,16,H); ctx.fillRect(784,0,16,H)
      ctx.fillStyle = '#1A3210'
      for (let x = 0; x < W; x += 16) {
        ctx.fillRect(x,0,8,8); ctx.fillRect(x+8,8,8,8)
        ctx.fillRect(x,560,8,8); ctx.fillRect(x+8,568,8,8)
      }
      for (let y = 0; y < H; y += 16) {
        ctx.fillRect(0,y,8,8); ctx.fillRect(8,y+8,8,8)
        ctx.fillRect(776,y,8,8); ctx.fillRect(784,y+8,8,8)
      }

      // Section signs
      const signs = [
        {x:30,y:18,w:110,label:'🥬 PRODUCE',bg:'#2E7D32',fg:'#CCFFCC'},
        {x:266,y:18,w:110,label:'🥖 BAKERY',bg:'#E65100',fg:'#FFEECC'},
        {x:430,y:18,w:108,label:'🍱 DELI',bg:'#880000',fg:'#FFCCCC'},
        {x:540,y:18,w:130,label:'📺 ELECTRONICS',bg:'#0D47A1',fg:'#CCDDFF'},
        {x:30,y:398,w:116,label:'🛒 CHECKOUT',bg:'#BF360C',fg:'#FFE0CC'},
        {x:540,y:398,w:130,label:'🗂️ MANAGER',bg:'#00695C',fg:'#CCFFF5'},
      ]
      signs.forEach(s => {
        ctx.fillStyle = s.bg; ctx.fillRect(s.x,s.y,s.w,14)
        ctx.fillStyle = s.fg; ctx.font = 'bold 9px Courier New'; ctx.textAlign = 'center'
        ctx.fillText(s.label, s.x + s.w / 2, s.y + 10)
      })

      // Shelves helper
      function shelf(sx: number, sy: number, sw: number, sh: number, col = '#7B5E45', hi = '#A07850') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx+3,sy+3,sw,sh)
        ctx.fillStyle = col; ctx.fillRect(sx,sy,sw,sh)
        ctx.fillStyle = hi; ctx.fillRect(sx,sy,sw,Math.min(4,sh))
        ctx.fillStyle = '#5A3E28'; ctx.fillRect(sx,sy+sh-2,sw,2)
      }

      // Top shelves
      for (let i = 0; i < 5; i++) shelf(32, 72+i*22, 50, 10, '#5A8A4A', '#7AAA6A')
      for (let i = 0; i < 5; i++) shelf(718, 72+i*22, 50, 10, '#3A5A8A', '#5A7AAA')

      // Center aisle shelf units
      const aisles: [number,number][] = [[150,202],[270,322],[478,530],[598,650]]
      aisles.forEach(([lx, rx]) => {
        ctx.fillStyle = 'rgba(0,0,0,0.2)'
        ctx.fillRect(lx+2,198,12,172); ctx.fillRect(rx+2,198,12,172)
        ctx.fillStyle = '#7B5E45'
        ctx.fillRect(lx,196,12,172); ctx.fillRect(rx,196,12,172)
        shelf(lx,196,rx-lx+12,10); shelf(lx,366,rx-lx+12,10); shelf(lx,278,rx-lx+12,8)
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = `hsl(${(lx*2+i*55)%360},70%,55%)`
          const bx = lx + 14 + i * Math.floor((rx - lx - 50) / 3)
          ctx.fillRect(bx,200,10,14); ctx.fillRect(bx,282,10,10); ctx.fillRect(bx,350,10,12)
        }
      })

      // Produce dots
      const pc = ['#FF4422','#FF8800','#FFDD00','#88CC22','#FF44AA','#44AAFF']
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
        ctx.fillStyle = pc[(i+j*3)%pc.length]
        ctx.beginPath(); ctx.arc(40+j*16, 76+i*22, 5, 0, Math.PI*2); ctx.fill()
      }

      // Electronics items
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#334466' : '#22AA88'
        ctx.fillRect(722, 74+i*22, 42, 8)
        ctx.fillStyle = '#88CCFF'; ctx.fillRect(724, 75+i*22, 12, 6)
      }

      // Checkout counter
      ctx.fillStyle = '#5A3E28'; ctx.fillRect(32,416,112,14); ctx.fillRect(32,430,10,80); ctx.fillRect(144,416,10,94)
      ctx.fillStyle = '#7B5E45'; ctx.fillRect(32,416,112,6)
      ctx.fillStyle = '#333'; ctx.fillRect(60,406,24,14)
      ctx.fillStyle = '#888'; ctx.fillRect(62,408,20,8)
      ctx.fillStyle = '#00FF88'; ctx.fillRect(63,409,18,4)

      // Manager desk
      ctx.fillStyle = '#2A4A18'; ctx.fillRect(658,416,112,14); ctx.fillRect(658,430,10,80)
      ctx.fillStyle = '#3A6A28'; ctx.fillRect(658,416,112,6)
      ctx.fillStyle = '#4488CC'; ctx.fillRect(680,432,30,20)
      ctx.fillStyle = '#AACCFF'; ctx.fillRect(682,434,26,14)

      // Entrance mat
      ctx.fillStyle = '#884400'; ctx.fillRect(300,552,200,8)
      ctx.fillStyle = '#CC6600'; ctx.fillRect(302,553,196,5)
      ctx.fillStyle = '#FFD700'; ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'center'
      ctx.fillText('▲  ENTRANCE  ▲', 400, 558)
    }

    function drawDisplays() {
      const s = stateRef.current
      const t = s.frameCount
      for (const d of s.displays) {
        const pulse = Math.sin(t * 0.07 + d.id) * 0.5 + 0.5
        const isNear = s.nearDisplay === d

        // Glow
        if (isNear || !d.visited) {
          ctx.save()
          ctx.shadowColor = d.glow
          ctx.shadowBlur = isNear ? 28 * pulse + 8 : 12 * pulse
          ctx.fillStyle = d.color
          ctx.fillRect(d.pos_x-2, d.pos_y-2, KIOSK_W+4, KIOSK_H+4)
          ctx.restore()
        }
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(d.pos_x+4, d.pos_y+4, KIOSK_W, KIOSK_H)
        // Body
        ctx.fillStyle = d.visited ? '#2A2A3A' : d.color; ctx.fillRect(d.pos_x, d.pos_y, KIOSK_W, KIOSK_H)
        // Screen
        ctx.fillStyle = d.visited ? '#111122' : 'rgba(0,0,0,0.35)'; ctx.fillRect(d.pos_x+5, d.pos_y+5, KIOSK_W-10, KIOSK_H-18)

        if (d.visited) {
          ctx.fillStyle = '#00FF88'; ctx.font = 'bold 16px Courier New'; ctx.textAlign = 'center'
          ctx.fillText('✓', d.pos_x + KIOSK_W/2, d.pos_y + KIOSK_H/2 - 4)
        } else {
          ctx.globalAlpha = 0.5 + pulse * 0.5
          ctx.fillStyle = d.color
          for (let i = 0; i < 4; i++) {
            const ly = d.pos_y + 8 + ((i * 8 + Math.floor(t * 0.3)) % (KIOSK_H - 22))
            ctx.fillRect(d.pos_x+7, ly, KIOSK_W-14, 2)
          }
          ctx.globalAlpha = 1
          ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.6; ctx.font = 'bold 8px Courier New'; ctx.textAlign = 'center'
          ctx.fillText('[ INFO ]', d.pos_x + KIOSK_W/2, d.pos_y + KIOSK_H/2 - 4)
          ctx.globalAlpha = 1
        }

        // Label bar
        ctx.fillStyle = '#111'; ctx.fillRect(d.pos_x, d.pos_y + KIOSK_H - 14, KIOSK_W, 14)
        ctx.fillStyle = d.visited ? '#558855' : '#FFD700'
        ctx.font = `bold ${d.label.length > 8 ? 7 : 8}px Courier New`; ctx.textAlign = 'center'
        ctx.fillText(d.label, d.pos_x + KIOSK_W/2, d.pos_y + KIOSK_H - 4)

        // Interaction arrow
        if (isNear) {
          ctx.fillStyle = `rgba(255,255,0,${0.6 + pulse * 0.4})`
          ctx.font = '14px Courier New'; ctx.textAlign = 'center'
          ctx.fillText('▼', d.pos_x + KIOSK_W/2, d.pos_y - 5)
        }
        // Visited dot
        if (d.visited) {
          ctx.fillStyle = '#00FF88'
          ctx.beginPath(); ctx.arc(d.pos_x + KIOSK_W - 5, d.pos_y + 5, 3, 0, Math.PI*2); ctx.fill()
        }
      }
    }

    function drawPlayer() {
      const s = stateRef.current
      const p = s.player
      const isMoving = Object.entries(s.keys).some(([k, v]) =>
        v && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS'].includes(k)
      )
      const swing = Math.sin(s.frameCount * 0.28) * 4

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.beginPath(); ctx.ellipse(p.x+10, p.y+p.h+1, 8, 3, 0, 0, Math.PI*2); ctx.fill()

      // Shoes
      ctx.fillStyle = '#222244'
      if (isMoving) {
        ctx.fillRect(p.x+3, p.y+p.h-4+swing, 6, 5)
        ctx.fillRect(p.x+11, p.y+p.h-4-swing, 6, 5)
      } else {
        ctx.fillRect(p.x+3, p.y+p.h-3, 6, 5)
        ctx.fillRect(p.x+11, p.y+p.h-3, 6, 5)
      }
      // Legs
      ctx.fillStyle = '#334488'
      if (isMoving) {
        ctx.fillRect(p.x+5, p.y+14, 5, p.h-14+swing)
        ctx.fillRect(p.x+11, p.y+14, 5, p.h-14-swing)
      } else {
        ctx.fillRect(p.x+5, p.y+14, 5, p.h-14)
        ctx.fillRect(p.x+11, p.y+14, 5, p.h-14)
      }
      // Body
      ctx.fillStyle = '#CC3322'; ctx.fillRect(p.x+3, p.y+10, p.w-6, 12)
      ctx.fillStyle = '#FF6655'; ctx.fillRect(p.x+7, p.y+10, 6, 3)
      // Arms
      ctx.fillStyle = '#CC3322'
      if (isMoving) {
        ctx.fillRect(p.x-1, p.y+10-swing, 4, 8)
        ctx.fillRect(p.x+p.w-3, p.y+10+swing, 4, 8)
      } else {
        ctx.fillRect(p.x-1, p.y+10, 4, 8); ctx.fillRect(p.x+p.w-3, p.y+10, 4, 8)
      }
      // Head
      ctx.fillStyle = '#F5C88A'; ctx.fillRect(p.x+5, p.y+1, p.w-10, 11)
      ctx.fillStyle = '#3A2208'; ctx.fillRect(p.x+5, p.y+1, p.w-10, 4); ctx.fillRect(p.x+5, p.y+1, 2, 7)
      // Eyes
      ctx.fillStyle = '#222'
      if (p.dir === 0) { ctx.fillRect(p.x+7,p.y+6,2,2); ctx.fillRect(p.x+12,p.y+6,2,2) }
      else if (p.dir === 1) { ctx.fillRect(p.x+7,p.y+3,2,2); ctx.fillRect(p.x+12,p.y+3,2,2) }
      else if (p.dir === 2) { ctx.fillRect(p.x+6,p.y+4,2,2); ctx.fillRect(p.x+6,p.y+8,2,2) }
      else { ctx.fillRect(p.x+13,p.y+4,2,2); ctx.fillRect(p.x+13,p.y+8,2,2) }
    }

    function drawCelebration() {
      const s = stateRef.current
      if (s.celebFrames <= 0) return
      ctx.fillStyle = `rgba(0,255,150,${Math.min(s.celebFrames/60,0.9)*0.15})`
      ctx.fillRect(0,0,W,H)
      if (s.celebFrames > 180) {
        const a = Math.min((s.celebFrames-180)/60, 1)
        ctx.fillStyle = `rgba(0,0,80,${a*0.92})`; ctx.fillRect(80,200,640,130)
        ctx.strokeStyle = `rgba(255,215,0,${a})`; ctx.lineWidth = 3; ctx.strokeRect(80,200,640,130)
        ctx.fillStyle = `rgba(255,215,0,${a})`; ctx.font = 'bold 26px Courier New'; ctx.textAlign = 'center'
        ctx.fillText('★  ALL DISPLAYS VISITED!  ★', 400, 248)
        ctx.fillStyle = `rgba(0,255,204,${a})`; ctx.font = '14px Courier New'
        ctx.fillText("YOU NOW KNOW JAKE.  HE'S EXCITED TO WORK WITH YOU.", 400, 282)
      }
      // Confetti
      for (let i = 0; i < 20; i++) {
        const cx = (Math.sin(s.frameCount*1.7 + i*1.3)*0.5+0.5)*W
        const cy = ((s.frameCount*1.36 + i*37) % H)
        ctx.fillStyle = `hsl(${(i*47+s.frameCount*3)%360},90%,60%)`
        ctx.fillRect(cx, cy, 6, 6)
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H)
      update()
      drawStore()
      drawDisplays()
      drawPlayer()
      drawCelebration()
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [checkCollision, openDisplay])

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex justify-center" style={{ fontFamily: "'Courier New', monospace" }}>
      <div className="relative" style={{ width: W, height: H }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            display: 'block',
            imageRendering: 'pixelated',
            border: '4px solid #FFD700',
            boxShadow: '0 0 40px rgba(255,215,0,0.3)',
          }}
        />

        {/* Start screen */}
        {!gameStarted && (
          <div
            onClick={startGame}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
            style={{ background: '#000088', zIndex: 100 }}
          >
            <div style={{ border: '3px solid #FFD700', padding: '40px 50px', textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: 48, color: '#FFD700', textShadow: '3px 3px 0 #CC6600, 6px 6px 0 #884400', letterSpacing: 6, fontWeight: 'bold', marginBottom: 4 }}>
                JAKE'S STORE
              </div>
              <div style={{ fontSize: 14, color: '#00FFFF', letterSpacing: 4, marginBottom: 32 }}>
                ▸ AN INTERACTIVE ADVENTURE ◂
              </div>
              <div style={{ fontSize: 13, color: '#aaddff', lineHeight: 2, marginBottom: 36, maxWidth: 460 }}>
                {introText}
              </div>
              <div style={{
                animation: 'blink 0.75s step-end infinite',
                fontSize: 16, color: '#FFD700', letterSpacing: 3, marginBottom: 24
              }}>
                [ PRESS ENTER OR CLICK TO START ]
              </div>
              <div style={{ fontSize: 11, color: '#668899', lineHeight: 1.8 }}>
                <span style={{ color: '#aaccdd' }}>ARROW KEYS / WASD</span> to move &nbsp;·&nbsp;
                <span style={{ color: '#aaccdd' }}>SPACE / E</span> to interact &nbsp;·&nbsp;
                <span style={{ color: '#aaccdd' }}>ESC</span> to close
              </div>
            </div>
          </div>
        )}

        {/* HUD — visits counter */}
        {gameStarted && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: 8, left: 8,
              background: 'rgba(0,0,60,0.85)',
              border: '2px solid #FFD700',
              padding: '5px 10px',
              fontSize: 11, color: '#FFD700', letterSpacing: 1,
            }}
          >
            DISPLAYS: {visitedCount}/{rawDisplays.length}
          </div>
        )}

        {/* HUD — controls */}
        {gameStarted && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: 8, right: 8,
              background: 'rgba(0,0,60,0.85)',
              border: '2px solid #334466',
              padding: '5px 10px',
              fontSize: 10, color: '#556688', lineHeight: 1.7, textAlign: 'right',
            }}
          >
            ARROWS: MOVE<br />SPACE: INTERACT<br />ESC: CLOSE
          </div>
        )}

        {/* Interaction prompt */}
        {gameStarted && nearLabel && !dialogDisplay && (
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,80,0.95)',
              border: '2px solid #00FFFF',
              padding: '5px 18px',
              fontSize: 13, color: '#00FFFF', whiteSpace: 'nowrap', letterSpacing: 1,
            }}
          >
            {nearLabel}
          </div>
        )}

        {/* Info panel */}
        {dialogDisplay && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.75)', zIndex: 50 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeDialog() }}
          >
            <div style={{
              background: '#000066',
              border: '4px solid #FFD700',
              width: 700,
              maxHeight: 500,
              padding: '20px 28px 24px',
              position: 'relative',
              overflowY: 'auto',
              fontFamily: "'Courier New', monospace",
            }}>
              {/* Corner decorations */}
              {(['tl','tr','bl','br'] as const).map(pos => (
                <div key={pos} style={{
                  position: 'absolute',
                  width: 12, height: 12,
                  borderColor: '#FF6600',
                  borderStyle: 'solid',
                  ...(pos === 'tl' ? { top: 4, left: 4, borderWidth: '3px 0 0 3px' } :
                      pos === 'tr' ? { top: 4, right: 4, borderWidth: '3px 3px 0 0' } :
                      pos === 'bl' ? { bottom: 4, left: 4, borderWidth: '0 0 3px 3px' } :
                                     { bottom: 4, right: 4, borderWidth: '0 3px 3px 0' })
                }} />
              ))}
              <button
                onClick={closeDialog}
                style={{
                  position: 'absolute', top: 14, right: 16,
                  fontSize: 13, color: '#FFD700', cursor: 'pointer',
                  background: '#000044', border: '2px solid #FFD700',
                  fontFamily: "'Courier New', monospace",
                  padding: '2px 8px', letterSpacing: 1,
                }}
              >
                [ X CLOSE ]
              </button>
              <div style={{
                fontSize: 18, color: '#FFD700',
                borderBottom: '2px solid #336699',
                paddingBottom: 10, marginBottom: 16,
                letterSpacing: 2, fontWeight: 'bold', paddingRight: 80,
              }}>
                {dialogDisplay.title}
              </div>
              {/* Panel styles injected inline for portability */}
              <style>{`
                .panel-content .sec { color: #00FFFF; font-weight: bold; font-size: 11px; letter-spacing: 2px; display: block; margin-top: 14px; margin-bottom: 4px; }
                .panel-content .hi  { color: #FFD700; }
                .panel-content .dim { color: #778899; font-size: 12px; }
                .panel-content .bad { color: #FF6666; }
                @keyframes blink { 50% { opacity: 0; } }
              `}</style>
              <div
                className="panel-content"
                style={{ fontSize: 13, color: '#ddeeff', lineHeight: 1.9 }}
                dangerouslySetInnerHTML={{ __html: dialogDisplay.content }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
