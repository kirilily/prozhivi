import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowRight, Check, ChevronDown, ChevronUp, Leaf, LockKeyhole, MapPin, NotebookPen, Paperclip, Volume2, VolumeX, X } from 'lucide-react'
import { SITE_BUILD, bonuses, chapters, freeTasks, previewContent, recipes, watchCategories } from './content'
import approvedPhotosRaw from './approved-photos.b64?raw'
import './styles.css'
import './restore-step1.css'
import './cleanup-r1.css'
import './approved-style.css'
import './qa-fix.css'

const PROGRESS_KEY = 'prozhivi-v3-progress'
const HABIT_KEY = 'prozhivi-v3-habit'
const APPROVED_PHOTOS = `data:image/webp;base64,${approvedPhotosRaw.trim()}`
const PHOTO_POSITIONS = ['0% 0%','33.333% 0%','66.666% 0%','100% 0%','0% 100%','33.333% 100%','66.666% 100%','100% 100%']
const photoStyle = index => ({backgroundImage:`url("${APPROVED_PHOTOS}")`,backgroundPosition:PHOTO_POSITIONS[index%8]})
function BrandLogo({compact=false}){
  return <span className={`brand-word ${compact?'compact':''}`} aria-label="ПРОЖИВИ">{'ПРОЖИВИ'.split('').map((letter,i)=><span key={i}>{letter}</span>)}</span>
}
const SOUND_URLS = {
  waves:'https://commons.wikimedia.org/wiki/Special:Redirect/file/NausetBeach.ogg',
  forest:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Sound_of_Forest_(Mookambika_wildlife_sanctuary).ogg',
  rain:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Garden%20rainfall.ogg'
}

function readStorage(key, fallback){
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function localISO(date = new Date()){
  const y = date.getFullYear(); const m = String(date.getMonth()+1).padStart(2,'0'); const d = String(date.getDate()).padStart(2,'0')
  return `${y}-${m}-${d}`
}
function dateFromISO(iso){ const [y,m,d]=iso.split('-').map(Number); return new Date(y,m-1,d,12,0,0,0) }
function addDays(date, amount){ const next=new Date(date); next.setDate(next.getDate()+amount); return next }
function dayLabel(date){ return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(date).replace('.','') }

function App(){
  const [bookOpen, setBookOpen] = useState(false)
  const [activeChapter, setActiveChapter] = useState(chapters[0])
  const [selectedTask, setSelectedTask] = useState(freeTasks[0])
  const [progress, setProgress] = useState(()=>readStorage(PROGRESS_KEY, {}))
  const [habitDraft, setHabitDraft] = useState(()=>readStorage(HABIT_KEY, {name:'', why:'', days:[], startDate:null, saved:false}))
  const [habitDirty, setHabitDirty] = useState(false)
  const [ambientMode, setAmbientMode] = useState('off')
  const [ambientError, setAmbientError] = useState('')
  const [activeBonus, setActiveBonus] = useState(null)
  const [openRecipe, setOpenRecipe] = useState(0)
  const chapterRef = useRef(null)
  const bonusRef = useRef(null)
  const audioRef = useRef(null)

  const doneTasks = useMemo(()=>freeTasks.filter(t=>progress[t.id]),[progress])
  const doneCount = doneTasks.length
  const selectedTaskIndex = Math.max(0, freeTasks.findIndex(t=>t.id===selectedTask.id))

  const toggleTask = id => {
    const next = {...progress, [id]:!progress[id]}
    setProgress(next)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
  }
  const chooseChapter = chapter => {
    setActiveChapter(chapter)
    setTimeout(()=>chapterRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),40)
  }
  const saveHabitField = (field,value)=>{ setHabitDraft(prev=>({...prev,[field]:value})); setHabitDirty(true) }
  const saveHabit = ()=>{
    if(!habitDraft.name.trim()) return
    const next={...habitDraft,startDate:habitDraft.startDate||localISO(),saved:true}
    setHabitDraft(next); localStorage.setItem(HABIT_KEY,JSON.stringify(next)); setHabitDirty(false)
  }
  const toggleHabitDay = i => {
    if(!habitDraft.saved||!habitDraft.startDate) return
    const start=dateFromISO(habitDraft.startDate); const date=addDays(start,i); const today=dateFromISO(localISO()); const oldest=addDays(today,-7)
    if(date>today||date<oldest) return
    const days=habitDraft.days.includes(i)?habitDraft.days.filter(d=>d!==i):[...habitDraft.days,i].sort((a,b)=>a-b)
    setHabitDraft(prev=>({...prev,days})); setHabitDirty(true)
  }
  const resetHabit = ()=>{
    const empty={name:'',why:'',days:[],startDate:null,saved:false}
    setHabitDraft(empty); localStorage.setItem(HABIT_KEY,JSON.stringify(empty)); setHabitDirty(false)
  }

  const stopAmbient = ()=>{
    if(audioRef.current){ audioRef.current.pause(); audioRef.current.currentTime=0; audioRef.current=null }
    setAmbientMode('off')
  }
  const startAmbient = async mode => {
    try{
      stopAmbient(); setAmbientError('')
      const audio=new Audio(SOUND_URLS[mode]); audio.loop=true; audio.volume=.16; audio.preload='auto'; audioRef.current=audio
      await audio.play(); setAmbientMode(mode)
    }catch{
      setAmbientError('Не получилось включить запись. Попробуй другой звук.')
      setAmbientMode('off')
    }
  }
  const toggleAmbient = mode => ambientMode===mode ? stopAmbient() : startAmbient(mode)
  useEffect(()=>()=>stopAmbient(),[])

  const openBonus = id => {
    setActiveBonus(id)
    setTimeout(()=>bonusRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  const startDate = habitDraft.startDate ? dateFromISO(habitDraft.startDate) : null
  const today = dateFromISO(localISO())
  const oldest = addDays(today,-7)

  return <main className="site-shell">
    <header className="top-nav">
      <a className="logo" href="#top"><BrandLogo compact/><span>сезонный дневник</span></a>
      <nav><a href="#route">карта</a><a href="#chapter">главы</a><a href="#bonus">между страницами</a></nav>
      <a className="nav-action" href="#chapter">открыть первую главу <ArrowRight size={14}/></a>
    </header>

    <section className="cinematic-hero" id="top">
      <div className="hero-photo"/>
      <div className="hero-darken"/>
      <div className="hero-content hero-content-safe">
        <span className="micro">ВЫПУСК 01 · ЛИЧНАЯ КНИГА ОСЕНИ</span>
        <div className="approved-hero-logo"><BrandLogo/><small>больше, чем каждый день</small></div>
        <h1 className="hero-editorial-copy">Открой свою осень.</h1>
        <p>В начале — пустой блокнот.<br/>В конце — твоя личная книга этой осени.</p>
        <div className="hero-buttons"><button onClick={()=>setBookOpen(true)}>открыть книгу <ArrowRight size={15}/></button><a href="#route">увидеть маршрут <ArrowDown size={14}/></a></div>
        <div className="ambient-control"><span>реальные звуки</span><button className={ambientMode==='waves'?'active':''} onClick={()=>toggleAmbient('waves')}><Volume2 size={13}/>волны</button><button className={ambientMode==='forest'?'active':''} onClick={()=>toggleAmbient('forest')}><Volume2 size={13}/>лес</button><button className={ambientMode==='rain'?'active':''} onClick={()=>toggleAmbient('rain')}><Volume2 size={13}/>дождь</button><button className={ambientMode==='off'?'active':''} onClick={stopAmbient}><VolumeX size={13}/>выкл</button></div>
        {ambientError&&<div className="ambient-error">{ambientError}</div>}
        <div className="hand-note hero-note">твоя осень уже начинается →</div>
      </div>

      <div className="hero-collage hero-collage-safe">
        <div className="hero-polaroid hp-one"><div className="photo photo-sprite" style={photoStyle(0)}/><span>тот же город, но глубже</span></div>
        <div className="hero-polaroid hp-two"><div className="photo photo-sprite" style={photoStyle(1)}/><span>маленькие моменты</span></div>
        <div className="paper-note pn-one">Больше жизни<br/>в простых днях.</div>
        <div className="ticket-stub">ОСЕНЬ<br/><b>время<br/>замедлиться</b><small>экз. 001</small></div>
      </div>

      <div className={`lux-book ${bookOpen?'open':''}`}>
        <div className="book-under"/>
        <div className="book-inside">
          <div className="inside-page left-page"><span className="micro dark">00 / КАК ЭТО УСТРОЕНО</span><h2>Твоя осень,<br/>которую можно<br/><i>сохранить.</i></h2><p>Выбирай главу, открывай одну точку и оставляй один настоящий след в бумажном дневнике.</p><div className="small-hand">не нужно успевать всё</div></div>
          <div className="inside-page right-page"><span className="micro dark">ОГЛАВЛЕНИЕ</span><div className="book-menu"><button onClick={()=>chooseChapter(chapters[0])}><b>01</b><span>Разрешение начать</span><small>открыта</small></button>{chapters.slice(1,5).map(c=><div key={c.id}><b>{c.n}</b><span>{c.title}</span><LockKeyhole size={11}/></div>)}</div><div className="paperclip"><Paperclip size={19}/></div></div>
        </div>
        <button className="book-cover" onClick={()=>setBookOpen(true)} aria-label="Открыть книгу ПРОЖИВИ"><span className="emboss-top">личная книга твоей осени</span><strong>ПРОЖИВИ</strong><Leaf className="emboss-leaf" size={54}/><span className="emboss-bottom">ВЫПУСК 01</span><span className="book-band">{bookOpen?'книга открыта':'открыть книгу'} <ArrowRight size={15}/></span></button>
      </div>
    </section>

    <section className="paper-intro ripped clean-intro">
      <div className="paper-copy"><span className="micro dark">ГЛАВА 01</span><h2>Разрешение<br/>начать</h2><h3>Сегодня достаточно одной точки.</h3><p>Не нужно всё успевать. Просто открой блокнот и поставь первую точку. С этого начинается твоя осень.</p><div className="today-slip"><span>СЕГОДНЯШНЯЯ ТОЧКА:</span><b>○ заметить что-то красивое по дороге сегодня.</b></div></div>
      <div className="open-book-visual clean-open-book"><div className="book-left-art"><div className="taped-photo autumn-photo photo-sprite" style={photoStyle(2)}/><div className="torn-note">Осень — это не конец,<br/>а более честное начало.</div><Leaf className="dry-leaf" size={42}/></div><div className="book-right-art"><div className="handwriting">Сегодня я заметила,<br/>как золотой свет ложится<br/>на старые фасады.<br/>И кажется, именно<br/>ради этого и стоит<br/>быть здесь. ♡</div><div className="taped-photo rainy-photo photo-sprite" style={photoStyle(5)}/><div className="handwriting small">маленькие моменты<br/>делают большую жизнь.</div></div><div className="chapter-tabs">{chapters.map(c=><button key={c.id} className={c.id===activeChapter.id?'active':''} onClick={()=>chooseChapter(c)}>{c.n}</button>)}</div></div>
      <div className="side-manifesto"><strong>Одна глава.<br/>Одна точка в день.<br/>Один настоящий след.</strong><p>Сайт помогает заметить, запомнить важное и собрать из простых дней настоящую историю — в твоём темпе.</p><a href="#chapter">как это работает <ArrowRight size={14}/></a></div>
    </section>

    <section className="route-section" id="route">
      <div className="route-head"><span className="micro dark">ТВОЙ СЕЗОН</span><h2>Двенадцать глав.<br/><i>Один живой маршрут.</i></h2><p>Каждая глава — маленькое приглашение: выйти из привычного, заметить красоту рядом и добавить в свою осень что-то настоящее.</p></div>
      <div className="route-map"><div className="map-paper-layer one"/><div className="map-paper-layer two"/><svg className="red-route" viewBox="0 0 1200 680" preserveAspectRatio="none" aria-hidden="true"><path d="M75 95 C180 15 260 180 350 120 S545 45 620 145 S820 220 900 125 C1005 8 1110 145 1060 260 C1005 375 815 290 745 395 S540 535 430 430 S170 370 125 510 C80 655 300 600 450 585 S760 705 860 565 S1080 500 1140 625"/></svg><div className="map-stamp"><MapPin size={15}/> личная карта сезона</div><div className="route-grid">{chapters.map((c,i)=><button key={c.id} onClick={()=>chooseChapter(c)} className={`map-card card-${i+1} ${c.free?'free':'locked'} ${activeChapter.id===c.id?'active':''}`}><span className="map-pin"/><div className="map-photo natural-map-photo photo-sprite" style={photoStyle(i)}><span>{c.n}</span></div><div className="map-caption"><b>{c.title}</b><small>{c.free?(doneCount?`${doneCount} следа сохранено`:'открыта бесплатно'):'полный сезон'}</small></div>{!c.free&&<LockKeyhole size={14} className="map-lock"/>}</button>)}</div><div className="hand-note map-note">здесь начинается твоя осень ♡</div></div>
    </section>

    <section className="chapter-section" id="chapter" ref={chapterRef}>
      <div className="chapter-heading"><div><span className="micro dark">ГЛАВА {activeChapter.n} / 12</span><h2>{activeChapter.title}</h2><p>{activeChapter.note}</p></div><div className="chapter-label">{activeChapter.free?'открыта полностью':'предпросмотр полного сезона'}</div></div>
      <div className="chapter-journal">
        <div className="journal-left"><span className="micro dark">ВЫБЕРИ ОДНУ ТОЧКУ</span>{activeChapter.free ? <div className="task-list">{freeTasks.map((t,i)=><button key={t.id} className={`${selectedTask.id===t.id?'active':''} ${progress[t.id]?'done':''}`} onClick={()=>setSelectedTask(t)}><span className="task-no">{String(i+1).padStart(2,'0')}</span><div><small>{t.verb}</small><b>{t.title}</b></div>{progress[t.id]&&<Check size={16}/>}</button>)}</div> : <div className="locked-card"><LockKeyhole/><b>Внутри — шесть точек.</b><p>Тема главы видна заранее, но сами задания откроются только в полном сезоне.</p></div>}</div>
        <div className="journal-right">{activeChapter.free ? <><span className="micro dark">СЕГОДНЯ / {selectedTask.verb}</span><div className="selected-task-photo photo-sprite" style={photoStyle(selectedTaskIndex)}/><h3>{selectedTask.title}</h3><p>{selectedTask.note}</p><div className="journal-note"><NotebookPen size={20}/><span>{selectedTask.prompt}</span></div><button className={`save-button ${progress[selectedTask.id]?'saved':''}`} onClick={()=>toggleTask(selectedTask.id)}>{progress[selectedTask.id]?<><Check/>момент сохранён</>:<><Leaf/>сохранить этот момент</>}</button><div className="trace-summary"><div><span className="micro dark">СОХРАНЁННЫЕ МОМЕНТЫ</span><p>{doneCount===0?'Когда выполнишь точку, можно сохранить её здесь — просто как маленькую отметку на память.':`У тебя уже сохранено: ${doneCount}.`}</p></div>{doneCount>0&&<div className="trace-chips">{doneTasks.map(t=><span key={t.id}><Leaf size={12}/>{t.verb.toLowerCase()}</span>)}</div>}</div></> : <div className="preview-spread"><span className="micro dark">ПРЕВЬЮ</span><h3>{activeChapter.title}</h3><p>{activeChapter.note}</p><div className="sealed"><LockKeyhole/><b>6 точек внутри полного сезона</b></div><button className="save-button">открыть полный сезон <ArrowRight size={15}/></button></div>}</div>
      </div>

    </section>

    <section className="habit-section">
      <div className="habit-copy"><span className="micro">НЕОБЯЗАТЕЛЬНАЯ СТРАНИЦА</span><h2>Мой ритм осени.</h2><p>Одна привычка бесплатно. Без серии и без «начинать заново» после пропуска.</p><div className="hand-note light">пропуски тоже считаются жизнью</div></div>
      <div className="habit-sheet"><div className="tape top"/><label>Что хочется повторять чаще?<input value={habitDraft.name} onChange={e=>saveHabitField('name',e.target.value)} placeholder="например: вечерняя прогулка"/></label><label>Зачем мне это <small>необязательно</small><textarea value={habitDraft.why} onChange={e=>saveHabitField('why',e.target.value)} placeholder="короткая личная причина"/></label><button className="habit-save" onClick={saveHabit} disabled={!habitDraft.name.trim()}>{habitDraft.saved?'сохранить изменения':'сохранить привычку'} <Check size={14}/></button>{habitDraft.saved&&startDate&&<><div className="habit-calendar-note">Можно отметить <b>сегодня и предыдущие 7 дней</b>. Будущие дни недоступны.</div><div className="habit-days">{Array.from({length:30},(_,i)=>{const date=addDays(startDate,i); const disabled=date>today||date<oldest; return <button key={i} disabled={disabled} title={disabled?'Этот день сейчас недоступен':dayLabel(date)} className={`${habitDraft.days.includes(i)?'marked':''} ${disabled?'locked-day':''}`} onClick={()=>toggleHabitDay(i)}><span>{i+1}</span><small>{dayLabel(date)}</small>{habitDraft.days.includes(i)&&<Check size={11}/>}</button>})}</div><div className="habit-actions-row"><div className="habit-summary">отмечено дней: <b>{habitDraft.days.length}</b>{habitDirty&&<span> · есть несохранённые изменения</span>}</div><button className="habit-clear" onClick={resetHabit}>очистить трекер</button></div></>}</div>
    </section>

    <section className="bonus-section" id="bonus">
      <div className="bonus-head"><span className="micro dark">МЕЖДУ СТРАНИЦАМИ</span><h2>То, что можно<br/><i>положить внутрь.</i></h2><p>Рецепты доступны полностью. Остальные бонусы можно рассмотреть в превью — ровно столько, чтобы понять настроение полного сезона.</p></div>
      <div className="bonus-cards">{bonuses.map((b,i)=><article key={b.id} className={activeBonus===b.id?'active-bonus-card':''}><span className="bonus-no">{b.n}</span><div className="bonus-photo natural-bonus-photo photo-sprite" style={photoStyle((i+6)%8)}/><small>{b.tag}</small><h3>{b.title}</h3><p>{b.text}</p><button onClick={()=>openBonus(b.id)}>{b.free?'открыть полностью':'посмотреть превью'} <ArrowRight size={14}/></button></article>)}</div>
      {activeBonus&&<div className="bonus-reader" ref={bonusRef}>
        <button className="bonus-close" onClick={()=>setActiveBonus(null)} aria-label="Закрыть"><X size={18}/></button>
        {activeBonus==='recipes'&&<div className="recipes-reader"><div className="bonus-reader-title"><span className="micro dark">БЕСПЛАТНО · ПОЛНОСТЬЮ</span><h3>Пять домашних рецептов</h3><p>Не ресторанные кадры — обычная еда, которую хочется приготовить в выходной и переписать в свой блокнот.</p></div><div className="recipe-list">{recipes.map((r,i)=><article key={r.title} className="recipe-card"><button className="recipe-head" onClick={()=>setOpenRecipe(openRecipe===i?-1:i)}><span>{String(i+1).padStart(2,'0')}</span><div><b>{r.title}</b><small>{r.time}</small></div>{openRecipe===i?<ChevronUp/>:<ChevronDown/>}</button>{openRecipe===i&&<div className="recipe-body"><div><strong>Нужно</strong><ul>{r.ingredients.map(x=><li key={x}>{x}</li>)}</ul></div><div><strong>Как сделать</strong><ol>{r.steps.map(x=><li key={x}>{x}</li>)}</ol></div></div>}</article>)}</div></div>}
        {activeBonus==='watch'&&<div className="watch-preview"><div className="bonus-reader-title grid-paper"><span className="micro dark">ПРЕВЬЮ ПОЛНОГО СЕЗОНА</span><h3>Что посмотреть осенью</h3><p>Какой у тебя сегодня вечер? Выбирай не «лучший фильм», а настроение.</p></div><div className="watch-grid">{watchCategories.map(cat=><article key={cat.title}><h4>{cat.title}</h4><div className="film-teasers">{cat.films.slice(0,2).map(f=><span key={f}>{f}</span>)}</div><small>ещё {cat.films.length-2} — в полном сезоне</small></article>)}</div></div>}
        {['playlists','culture','city'].includes(activeBonus)&&<div className="simple-preview"><div className="bonus-reader-title"><span className="micro dark">ПРЕВЬЮ ПОЛНОГО СЕЗОНА</span><h3>{bonuses.find(b=>b.id===activeBonus)?.title}</h3><p>{bonuses.find(b=>b.id===activeBonus)?.text}</p></div><div className="preview-slips">{previewContent[activeBonus].map((x,i)=><div key={x}><span>0{i+1}</span><b>{x}</b><LockKeyhole size={15}/></div>)}</div></div>}
      </div>}
    </section>

    <section className="final-section ripped-top"><div className="final-copy"><span className="micro dark">В КОНЦЕ СЕЗОНА</span><h2>Из точек<br/>рождается<br/><i>твоя книга.</i></h2><p>Фотографии, мысли, впечатления, билеты, зарисовки. То, что казалось обычными днями, станет историей, к которой захочется возвращаться.</p></div><div className="final-books"><div className="blank-book"><span>в начале — пустой блокнот</span></div><ArrowRight className="final-arrow"/><div className="filled-book"><div className="mini-polaroid photo-sprite" style={photoStyle(5)}/><div className="mini-paper">эта осень<br/>была здесь ♡</div><Leaf size={30}/><span>в конце — твоя книга осени</span></div></div></section>

    <footer><div className="logo"><BrandLogo compact/><span>бумажный дневник для настоящих моментов</span></div><p>Не ещё один список на осень. Твоя осень, которую ты действительно проживёшь и сохранишь.</p><small className="build-label">{SITE_BUILD}</small></footer>
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
