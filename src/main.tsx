import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Phaser from 'phaser';
import { GameScene, type SceneStatus } from './game/GameScene';
import { setMusicPaused, startMusic, stopMusic } from './game/audio';
import { getLevel, LEVELS, WORLD_ICONS, WORLD_NAMES } from './game/levels';
import { STICKER_INFO, STICKERS, type StickerType } from './game/model';
import { useProgress } from './state/progress';
import './styles/main.css';

type Screen = 'home' | 'map' | 'play' | 'bandit' | 'book' | 'settings';
const COSMETICS = [
  { id:'classic', name:'Classic Bandit', icon:'💜', detail:'The original little mischief maker.' },
  { id:'rainbow', name:'Rainbow Hat', icon:'🌈', detail:'Finish Wobble Village.' },
  { id:'robot', name:'Robot Helmet', icon:'🤖', detail:'Finish Turbo Town.' },
  { id:'knight', name:'Knight Costume', icon:'🛡️', detail:'Finish Castle of Chaos.' },
  { id:'golden', name:'Golden Bandit', icon:'👑', detail:'Beat King Cluck Returns.' },
  { id:'chicken', name:'Chicken Hat', icon:'🐔', detail:'Transform five chickens.' },
  { id:'tiny-crown', name:'Tiny Crown', icon:'✨', detail:'Win three levels while TINY.' }
];
const ACHIEVEMENTS = [
  { id:'first-sticker', name:'First Sticker', icon:'🏷️', detail:'Complete a transfer.' },
  { id:'chicken-whisperer', name:'Chicken Whisperer', icon:'🐔', detail:'Transform ten chickens.' },
  { id:'bounce-master', name:'Bounce Master', icon:'🏀', detail:'Cause 25 bounce collisions.' },
  { id:'mad-scientist', name:'Mad Scientist', icon:'🧪', detail:'Find five combinations.' },
  { id:'problem-solver', name:'Problem Solver', icon:'🧩', detail:'Finish all 20 levels.' },
  { id:'treasure-hunter', name:'Treasure Hunter', icon:'💎', detail:'Collect every hidden gem.' }
];

function Logo({ small = false }: { small?: boolean }) { return <div className={`logo ${small ? 'small' : ''}`}><span className="logo-star">✦</span>STICKER <strong>CHAOS</strong><span className="logo-star">✦</span></div>; }
function Back({ onClick }: { onClick: () => void }) { return <button className="icon-button back" onClick={onClick} aria-label="Back">←</button>; }

function Joystick({ onMove }: { onMove: (x:number,y:number) => void }) {
  const [point,setPoint] = useState({x:0,y:0});
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width/2)) / (rect.width/2);
    const y = (event.clientY - (rect.top + rect.height/2)) / (rect.height/2);
    const length = Math.max(1,Math.hypot(x,y));
    const next = {x:x/length,y:y/length}; setPoint(next); onMove(next.x,next.y);
  };
  const stop = () => {setPoint({x:0,y:0});onMove(0,0);};
  return <div className="joystick" role="group" aria-label="Movement joystick" onPointerDown={(event) => {event.currentTarget.setPointerCapture(event.pointerId);move(event);}} onPointerMove={(event) => {if(event.currentTarget.hasPointerCapture(event.pointerId))move(event);}} onPointerUp={stop} onPointerCancel={stop}>
    <div className="joystick-ring"/><div className="joystick-knob" style={{transform:`translate(${point.x*32}px,${point.y*32}px)`}}>✦</div>
  </div>;
}

function GameScreen({ number, onBack, onNext }: { number:number; onBack:()=>void; onNext:(number:number)=>void }) {
  const level = getLevel(number);
  const { progress, recordTransfer, recordBounce, completeLevel } = useProgress();
  const [status,setStatus] = useState<SceneStatus>({ selected:null, armed:null, transfers:0, treasure:false, gem:false, goals:0, totalGoals:level.goals.length, message:level.hint, canUndo:false });
  const [paused,setPaused] = useState(false);
  const [result,setResult] = useState<{stars:number;gem:boolean}|null>(null);
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<GameScene|null>(null);
  useEffect(() => {
    if (!host.current) return;
    const gameScene = new GameScene(level, {
      onStatus: setStatus,
      onTransfer: (sticker,sourceKind,stickers) => recordTransfer(sticker,sourceKind,stickers),
      onBounce: () => recordBounce(),
      onComplete: (stars,gem,tiny) => { completeLevel(number,stars,gem,tiny); setResult({stars,gem}); }
    }, progress.settings, progress.selectedCosmetic);
    startMusic(level.world, progress.settings.musicVolume);
    scene.current = gameScene;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current,
      width:390,height:620,
      backgroundColor:'#fff0c8',
      scale:{ mode:Phaser.Scale.FIT, autoCenter:Phaser.Scale.CENTER_BOTH, width:390, height:620 },
      physics:{ default:'arcade', arcade:{ debug:false, gravity:{x:0,y:0} } },
      render:{ antialias:true, pixelArt:false },
      scene:[gameScene]
    });
    const visibility = () => { if(document.hidden){gameScene.setPaused(true);setMusicPaused(true);setPaused(true);} };
    document.addEventListener('visibilitychange',visibility);
    return () => { document.removeEventListener('visibilitychange',visibility); scene.current=null; stopMusic(); game.destroy(true); };
    // A level's game is intentionally mounted once; settings can be changed from the menu.
  },[number]);
  const resume = () => {setPaused(false);setMusicPaused(false);scene.current?.setPaused(false);};
  const restart = () => {setResult(null);setPaused(false);setMusicPaused(false);scene.current?.setPaused(false);scene.current?.restart();};
  return <main className="game-screen">
    <header className="game-top"><button className="icon-button" onClick={() => {setPaused(true);setMusicPaused(true);scene.current?.setPaused(true);}} aria-label="Pause">Ⅱ</button><div className="game-title"><small>{WORLD_NAMES[level.world-1]} · Level {number}</small><strong>{level.name}</strong></div><div className="game-progress"><span>🎁 {status.treasure?'✓':'0/1'}</span><span>💎 {status.gem?'✓':'0/1'}</span></div></header>
    <section className={`stage-shell world-${level.world}`} aria-label={`${level.name} game area`}><div ref={host} className="game-canvas"/><div className="stage-hint">{status.message || level.hint}</div></section>
    <div className="game-bottom"><div className="tool-row"><button className="tool-button" onClick={() => scene.current?.undo()} disabled={!status.canUndo}>↶ <span>UNDO</span></button><button className="tool-button" onClick={restart}>↻ <span>RESTART</span></button><div className="goal-count">⚡ {status.goals}/{status.totalGoals} switches</div></div>
      <div className="control-row">{progress.settings.controlMode==='joystick'?<Joystick onMove={(x,y)=>scene.current?.setJoystick(x,y)}/>:<div className="tap-tip">👆 Tap the ground<br/>to move</div>}
      <div className="sticker-tray">{status.selected?<><span className="tray-title">{status.selected.kind.toUpperCase()} STICKERS</span><div className="tray-stickers">{status.selected.stickers.length?status.selected.stickers.map((sticker)=><button key={sticker} className={`sticker-pill ${status.armed===sticker?'armed':''}`} style={{'--sticker':STICKER_INFO[sticker].color} as React.CSSProperties} onClick={()=>scene.current?.selectSticker(sticker)}>{STICKER_INFO[sticker].icon} {sticker}</button>):<span className="tray-empty">Tap a stickered object</span>}</div></>:<><span className="tray-title">HOW TO PLAY</span><span className="tray-empty">Tap an object, choose a sticker, then tap a new home. Or drag a sticker!</span></>}</div></div>
    </div>
    {paused && <div className="modal-backdrop"><div className="modal-card"><div className="modal-icon">⏸️</div><h2>Taking a breather?</h2><p>Your sticker puzzle is right where you left it.</p><button className="primary-button" onClick={resume}>RESUME</button><button className="secondary-button" onClick={restart}>RESTART LEVEL</button><button className="text-button" onClick={onBack}>WORLD MAP</button></div></div>}
    {result && <div className="modal-backdrop"><div className="modal-card victory"><div className="modal-icon">🎉</div><h2>Sticker spectacular!</h2><div className="big-stars">{'⭐'.repeat(result.stars)}{'☆'.repeat(3-result.stars)}</div><p>{result.gem?'You found the secret gem too!':'Try again to find the secret gem!'}</p><button className="primary-button" onClick={()=>number<20?onNext(number+1):onBack()}>{number<20?'NEXT LEVEL →':'WORLD MAP'}</button><button className="secondary-button" onClick={restart}>PLAY AGAIN</button></div></div>}
  </main>;
}

function App() {
  const { ready, progress, load, setSettings, selectCosmetic, reset } = useProgress();
  const [screen,setScreen] = useState<Screen>('home');
  const [level,setLevel] = useState(1);
  useEffect(()=>{void load();},[load]);
  const openLevel = (number:number) => {setLevel(number);setScreen('play');};
  if(!ready) return <main className="boot"><img src="/icons/icon-192.png" alt="Sticker Bandit"/><h1>Sticker Chaos</h1><p>Gathering stickers...</p></main>;
  const nextAvailable = Math.min(20,Math.max(1,...progress.completedLevels.map((value)=>value+1)));
  if(screen==='play') return <GameScreen key={level} number={level} onBack={()=>setScreen('map')} onNext={openLevel}/>;
  return <div className="app-shell">
    {screen==='home' && <main className="home-screen"><div className="home-cloud one"/><div className="home-cloud two"/><div className="home-sparkles">✦ ⋆ ✧ ✦ ⋆</div><div className="home-content"><Logo/><div className="mascot-wrap"><div className="mascot-halo"/><img className="mascot" src="/icons/icon-512.png" alt="Sticker Bandit smiling"/><span className="floating-sticker s1">⚡ FAST</span><span className="floating-sticker s2">✦ BIG</span><span className="floating-sticker s3">☁ FLOAT</span></div><p className="tagline">STEAL THE RULES OF REALITY!</p><button className="primary-button play-button" onClick={()=>setScreen('map')}>▶ {progress.completedLevels.length?'KEEP PLAYING':'PLAY'} <span>✦</span></button><div className="home-nav"><button onClick={()=>setScreen('bandit')}><span>🎭</span> MY BANDIT</button><button onClick={()=>setScreen('book')}><span>📖</span> STICKER BOOK</button><button onClick={()=>setScreen('settings')}><span>⚙️</span> SETTINGS</button></div></div><div className="home-footer">20 silly puzzles · 8 magical stickers · all yours to explore</div></main>}
    {screen==='map' && <main className="page map-page"><div className="page-heading"><Back onClick={()=>setScreen('home')}/><div><span className="eyebrow">THE ADVENTURE</span><h1>Pick a level!</h1></div><span className="page-decoration">🗺️</span></div><div className="map-progress"><span>⭐ {Object.values(progress.levelStars).reduce((a,b)=>a+b,0)} / 60 stars</span><span>💎 {progress.collectedGems.length} / 20 gems</span></div><div className="world-list">{WORLD_NAMES.map((name,index)=><section className={`world-card world-card-${index+1}`} key={name}><div className="world-card-heading"><span className="world-emoji">{WORLD_ICONS[index]}</span><div><small>WORLD {index+1}</small><h2>{name}</h2></div></div><div className="level-grid">{LEVELS.slice(index*5,index*5+5).map((item)=><button key={item.number} className={`level-button ${item.number<=nextAvailable?'available':'locked'} ${progress.completedLevels.includes(item.number)?'finished':''}`} disabled={item.number>nextAvailable} onClick={()=>openLevel(item.number)} aria-label={`Level ${item.number}: ${item.name}${item.number>nextAvailable?', locked':''}`}><strong>{item.number>nextAvailable?'🔒':item.number}</strong><span>{progress.levelStars[item.number]?'⭐'.repeat(progress.levelStars[item.number]):item.number===nextAvailable?'NEW':'·'}</span></button>)}</div></section>)}</div></main>}
    {screen==='bandit' && <main className="page collection-page"><div className="page-heading"><Back onClick={()=>setScreen('home')}/><div><span className="eyebrow">DRESS UP</span><h1>My Bandit</h1></div><span className="page-decoration">🎭</span></div><div className="collection-hero"><img src="/icons/icon-192.png" alt="Your Sticker Bandit"/><div><span className="eyebrow">CURRENT LOOK</span><h2>{COSMETICS.find((item)=>item.id===progress.selectedCosmetic)?.name}</h2><p>Costumes are just for fun. Every Bandit is equally clever!</p></div></div><div className="card-grid">{COSMETICS.map((item)=><button key={item.id} className={`collection-card ${progress.selectedCosmetic===item.id?'selected':''}`} disabled={!progress.unlockedCosmetics.includes(item.id)} onClick={()=>selectCosmetic(item.id)}><span className="card-icon">{progress.unlockedCosmetics.includes(item.id)?item.icon:'🔒'}</span><strong>{item.name}</strong><small>{progress.unlockedCosmetics.includes(item.id)?progress.selectedCosmetic===item.id?'Wearing now': 'Tap to wear':item.detail}</small></button>)}</div></main>}
    {screen==='book' && <main className="page collection-page"><div className="page-heading"><Back onClick={()=>setScreen('home')}/><div><span className="eyebrow">THE COLLECTION</span><h1>Sticker Book</h1></div><span className="page-decoration">📖</span></div><p className="page-intro">Peel, swap, combine. Every sticker changes how an object behaves!</p><div className="book-list">{STICKERS.map((sticker:StickerType)=><article key={sticker} className={`book-entry ${progress.stickerDiscoveries.includes(sticker)?'found':''}`}><div className="book-icon" style={{background:STICKER_INFO[sticker].color}}>{STICKER_INFO[sticker].icon}</div><div><h2>{sticker} {progress.stickerDiscoveries.includes(sticker)?'✓':'?'}</h2><p>{STICKER_INFO[sticker].description}</p><small>{STICKER_INFO[sticker].example}</small></div></article>)}</div><h2 className="section-title">🏆 Achievements</h2><div className="achievement-list">{ACHIEVEMENTS.map((item)=><div key={item.id} className={`achievement ${progress.achievements.includes(item.id)?'earned':''}`}><span>{progress.achievements.includes(item.id)?item.icon:'🔒'}</span><div><strong>{item.name}</strong><small>{item.detail}</small></div></div>)}</div></main>}
    {screen==='settings' && <main className="page settings-page"><div className="page-heading"><Back onClick={()=>setScreen('home')}/><div><span className="eyebrow">MAKE IT YOURS</span><h1>Settings</h1></div><span className="page-decoration">⚙️</span></div><section className="settings-card"><label><span>🎵 Music volume</span><input type="range" min="0" max="1" step="0.05" value={progress.settings.musicVolume} onChange={(event)=>setSettings({musicVolume:Number(event.target.value)})}/></label><label><span>🔊 Sound effects</span><input type="range" min="0" max="1" step="0.05" value={progress.settings.effectsVolume} onChange={(event)=>setSettings({effectsVolume:Number(event.target.value)})}/></label><label className="toggle-row"><span>✨ Reduced motion</span><input type="checkbox" checked={progress.settings.reducedMotion} onChange={(event)=>setSettings({reducedMotion:event.target.checked})}/></label><div className="setting-group"><strong>Movement controls</strong><div className="segmented"><button className={progress.settings.controlMode==='joystick'?'active':''} onClick={()=>setSettings({controlMode:'joystick'})}>Joystick</button><button className={progress.settings.controlMode==='tap'?'active':''} onClick={()=>setSettings({controlMode:'tap'})}>Tap to move</button></div></div></section><section className="instruction-card"><h2>How to play</h2><p>1. Tap a stickered object or drag its sticker.</p><p>2. Tap a new object to transfer the magic.</p><p>3. Light every switch, collect the present, and reach the door!</p><p>Move with the joystick, tap the ground, or use arrow keys.</p></section><button className="danger-button" onClick={()=>{if(window.confirm('Reset all levels, stars, and collectibles? This cannot be undone.')){reset();setScreen('home');}}}>Reset progress</button></main>}
  </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
