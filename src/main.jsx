import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowRight, BookOpen, Check, Leaf, LockKeyhole, MapPin, NotebookPen, Paperclip, Sparkles } from 'lucide-react'
import { bonuses, chapters, freeTasks } from './content'
import './styles.css'

const PROGRESS_KEY = 'prozhivi-v2-progress'
const HABIT_KEY = 'prozhivi-v2-habit'

function readStorage(key, fallback){
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

function App(){
  const [bookOpen, setBookOpen] = useState(false)
  const [activeChapter, setActiveChapter] = useState(chapters[0])
  const [selectedTask, setSelectedTask] = useState(freeTasks[0])
  const [progress, setProgress] = useState(()=>readStorage(PROGRESS_KEY, {}))
  const [habit, setHabit] = useState(()=>readStorage(HABIT_KEY, {name:'', why:'', days:[]}))
  const [toast, setToast] = useState('')
  const chapterRef = useRef(null)

  const savedTraces = useMemo(()=>freeTasks.filter(t=>progress[t.id]),[progress])
  const doneCount = savedTraces.length

  const saveTask = (id)=>{
    const willSave = !progress[id]
    const next = {...progress, [id]: willSave}
    setProgress(next)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
    if(willSave){
      setToast('След добавлен в твою книгу')
      window.setTimeout(()=>setToast(''), 2100)
    }
  }

  const chooseChapter = (chapter)=>{
    setActiveChapter(chapter)
    setTimeout(()=>chapterRef.current?.scrollIntoView({behavior:'smooth', block:'start'}), 30)
  }

  const toggleHabitDay = (i)=>{
    const days = habit.days.includes(i) ? habit.days.filter(d=>d!==i) : [...habit.days,i]
    const next = {...habit, days}
    setHabit(next)
    localStorage.setItem(HABIT_KEY, JSON.stringify(next))
  }

  const saveHabitField = (field,value)=>{
    const next = {...habit,[field]:value}
    setHabit(next)
    localStorage.setItem(HABIT_KEY, JSON.stringify(next))
  }

  return <main className="site-shell">
    {toast && <div className="trace-toast"><span><Leaf size={15}/></span>{toast}</div>}

    <header className="nav-shell">
      <a className="wordmark" href="#top">ПРОЖИВИ<span>выпуск 01 · осень</span></a>
      <nav><a href="#route">маршрут</a><a href="#chapter">глава 01</a><a href="#archive">мой архив</a><a href="#bonus">между страницами</a></nav>
      <a className="nav-cta" href="#chapter">открыть главу <ArrowRight size={14}/></a>
    </header>

    <section className="hero-scene" id="top">
      <div className="hero-grain" aria-hidden="true"/>
      <div className="hero-copy">
        <div className="edition-row"><span className="issue-label">ПРОЖИВИ / ВЫПУСК 01</span><span className="edition-number">экземпляр № 001</span></div>
        <h1>Открой<br/><i>свою</i> осень.</h1>
        <p className="hero-lead">Не нужно успевать. Нужно однажды заметить. Сайт ведёт по маршруту, а настоящая книга сезона остаётся у тебя — на бумаге.</p>
        <div className="hero-actions">
          <button className="primary" onClick={()=>setBookOpen(v=>!v)}><BookOpen size={17}/>{bookOpen?'закрыть книгу':'раскрыть книгу'}</button>
          <a href="#route" className="text-link">увидеть маршрут <ArrowDown size={15}/></a>
        </div>
        <div className="hand-note note-one">твоя осень уже происходит ↗</div>
      </div>

      <div className={`book-stage ${bookOpen?'is-open':''}`}>
        <div className="desk-shadow"/>
        <div className="book-shadow"/>
        <div className="book-object" role="button" tabIndex={0} onClick={()=>setBookOpen(true)} onKeyDown={e=>e.key==='Enter'&&setBookOpen(true)} aria-label="Раскрыть книгу ПРОЖИВИ">
          <div className="book-pages-under"/>
          <div className="book-spread">
            <div className="book-page page-left">
              <span className="page-kicker">00 / КАК ЭТО УСТРОЕНО</span>
              <h2>Одна глава.<br/>Одна точка.<br/><em>И что-нибудь на память.</em></h2>
              <p>Выбирай то, на что есть силы. Всё важное переносится в твой бумажный дневник.</p>
              <span className="pencil-note">не идеальный дневник. твой.</span>
              <span className="page-stamp">SEASON / 26</span>
            </div>
            <div className="book-page page-right">
              <span className="page-kicker">ОГЛАВЛЕНИЕ / БЕСПЛАТНО</span>
              <div className="toc-mini">
                <button onClick={(e)=>{e.stopPropagation();chooseChapter(chapters[0])}}><b>01</b><span>Разрешение начать</span><small>открыта</small></button>
                {chapters.slice(1,5).map(c=><div key={c.id}><b>{c.n}</b><span>{c.title}</span><LockKeyhole size={12}/></div>)}
              </div>
              <div className="paper-clip"><Paperclip size={19}/></div>
              <div className="torn-note">сюда будут<br/>попадать твои следы</div>
            </div>
          </div>
          <div className="book-cover">
            <span className="cover-series">интерактивная книга твоей осени</span>
            <strong>ПРОЖИВИ</strong>
            <div className="cover-leaf"><Leaf size={55}/></div>
            <small>ВЫПУСК 01 · 2026</small>
            <span className="cover-ribbon">коснись обложки — книга раскроется</span>
            <span className="emboss-line">PERSONAL SEASON ARCHIVE</span>
          </div>
        </div>
      </div>

      <div className="scrap scrap-a"><span>ОСЕНЬ</span><b>время<br/>замедлиться</b><small>экз. 001</small></div>
      <div className="scrap scrap-b"><span>больше жизни</span><b>в обычных днях</b></div>
      <div className="masking-tape tape-a"/>
    </section>

    <section className="principle-strip">
      <div className="tape-label">маленькое правило выпуска</div>
      <p>Сайт не должен удерживать тебя внутри экрана. <strong>Он должен вернуть тебя в твою жизнь.</strong></p>
      <span className="hand-note">одного задания сегодня достаточно</span>
    </section>

    <section className="archive-strip" id="archive">
      <div className="archive-label"><span>ЛИЧНЫЙ АРХИВ ГЛАВЫ 01</span><b>{doneCount ? `${doneCount} ${doneCount===1?'след уже лежит':'следа уже лежат'} в книге` : 'пока чистая страница'}</b><small>Здесь нет процентов. Просто вещи, которые ты решила не потерять.</small></div>
      <div className="trace-pockets">
        {freeTasks.map((task,i)=>{
          const saved = !!progress[task.id]
          return <button key={task.id} className={`trace-pocket ${saved?'filled':''}`} onClick={()=>{setSelectedTask(task); chapterRef.current?.scrollIntoView({behavior:'smooth', block:'start'})}}>
            <span className="pocket-no">0{i+1}</span>
            <div className="pocket-art">{saved?<><Leaf size={26}/><em>сохранено</em></>:<span>место для<br/>будущего следа</span>}</div>
            <b>{saved?task.title:task.verb.toLowerCase()}</b>
          </button>
        })}
      </div>
      <div className="archive-handnote hand-note">архив растёт не по плану, а вместе с тобой</div>
    </section>

    <section className="route-section torn-top" id="route">
      <div className="route-intro">
        <div><span className="section-no">01 / ТВОЙ СЕЗОН</span><h2>Двенадцать глав.<br/><i>Один живой маршрут.</i></h2></div>
        <p>Не линейный марафон и не список «100 дел». Открывай главы в своём темпе, выбирай маленькое действие и сохраняй один настоящий след.</p>
      </div>

      <div className="route-board">
        <svg className="route-thread" viewBox="0 0 1200 760" preserveAspectRatio="none" aria-hidden="true"><path d="M70 120 C210 10 310 210 430 130 S650 30 760 160 S1000 260 1100 150 C1190 70 1110 360 990 350 S760 280 690 420 S470 540 340 430 S80 390 130 570 C180 720 400 580 540 625 S810 720 930 580 S1110 510 1160 660"/></svg>
        <div className="map-stamp"><MapPin size={16}/> карта сезона</div>
        <div className="route-grid">
          {chapters.map((c,i)=><button key={c.id} className={`chapter-polaroid p-${i+1} ${c.free?'is-free':'is-locked'} ${activeChapter.id===c.id?'is-active':''}`} onClick={()=>chooseChapter(c)}>
            <span className="pin"/>
            <div className={`photo-placeholder photo-${(i%6)+1}`}><span>{c.n}</span><Leaf size={34}/></div>
            <div className="polaroid-caption"><b>{c.title}</b><small>{c.free?'открыта бесплатно':'предпросмотр · полный сезон'}</small></div>
            {c.free && doneCount>0 && <span className="chapter-seal"><Leaf size={11}/>{doneCount} следа</span>}
            {!c.free&&<LockKeyhole className="mini-lock" size={15}/>} 
          </button>)}
        </div>
        <div className="hand-note route-note">нить ведёт дальше только тогда, когда тебе хочется</div>
      </div>
    </section>

    <section className="chapter-scene" id="chapter" ref={chapterRef}>
      <div className="chapter-topline"><span>ГЛАВА {activeChapter.n} / 12</span><span>{activeChapter.free?'БЕСПЛАТНАЯ ГЛАВА · ОТКРЫТА ПОЛНОСТЬЮ':'ПРЕДПРОСМОТР ПОЛНОГО СЕЗОНА'}</span></div>
      <div className="chapter-book">
        <div className="chapter-page intro-page">
          <span className="section-no">ГЛАВА {activeChapter.n}</span>
          <h2>{activeChapter.title}</h2>
          <p className="chapter-mood">{activeChapter.mood}</p>
          <p>{activeChapter.note}</p>
          {activeChapter.free ? <>
            <div className="margin-note">сегодня достаточно<br/>одной точки</div>
            <div className={`progress-stamp ${doneCount?'has-traces':''}`}><span>{doneCount||'—'}</span>{doneCount?'следа в архиве':'архив пока пуст'}</div>
            <div className="chapter-passport"><small>личный сезонный архив</small><b>01</b><span>глава открыта</span></div>
          </> : <div className="locked-note"><LockKeyhole/><b>Задания внутри закрыты.</b><span>Тему и настроение главы можно увидеть заранее — без притворного «бесплатного доступа».</span></div>}
        </div>

        <div className="chapter-page action-page">
          {activeChapter.free ? <>
            <div className="task-tabs">
              {freeTasks.map((t,i)=><button key={t.id} className={`${selectedTask.id===t.id?'active':''} ${progress[t.id]?'done':''}`} onClick={()=>setSelectedTask(t)}><span>{String(i+1).padStart(2,'0')} · {t.verb}</span><b>{t.title}</b>{progress[t.id]&&<Check size={14}/>}</button>)}
            </div>
            <article className="task-sheet">
              <div className="task-sheet-top"><span className="task-label">СЕГОДНЯШНЯЯ ТОЧКА / {selectedTask.verb}</span><span className="serial">PROZHIVI · 01/{String(freeTasks.indexOf(selectedTask)+1).padStart(2,'0')}</span></div>
              <h3>{selectedTask.title}</h3>
              <p>{selectedTask.note}</p>
              <div className="journal-prompt"><NotebookPen size={20}/><span>{selectedTask.prompt}</span></div>
              <div className="task-actions"><button className={`save-trace ${progress[selectedTask.id]?'saved':''}`} onClick={()=>saveTask(selectedTask.id)}>{progress[selectedTask.id]?<><Check/>лежит в архиве</>:<><Leaf/>сохранить этот след</>}</button>{progress[selectedTask.id]&&<a href="#archive" className="archive-link">посмотреть в архиве →</a>}</div>
              {progress[selectedTask.id]&&<div className="collected-card"><Sparkles size={17}/><div><small>КОЛЛЕКЦИОННЫЙ СЛЕД</small><b>{selectedTask.title}</b><span>Добавлен в личную книгу этой осени.</span></div></div>}
            </article>
          </> : <div className="preview-page"><span className="section-no">ПРЕВЬЮ</span><h3>{activeChapter.title}</h3><p>{activeChapter.note}</p><div className="sealed-envelope"><LockKeyhole/><b>Шесть точек откроются в полном сезоне</b><span>Чтение, наблюдение, прогулка, запись, маленький ритуал и сохранённый след.</span></div><button className="primary">открыть полный сезон <ArrowRight size={16}/></button></div>}
        </div>
      </div>

      {activeChapter.free && <div className="task-polaroid-board">
        <div className="straight-thread"/>
        {freeTasks.map((t,i)=><button key={t.id} className={`task-polaroid r-${i%3} ${selectedTask.id===t.id?'active':''} ${progress[t.id]?'done':''}`} onClick={()=>setSelectedTask(t)}><span className="clip-top"/><div className={`task-thumb task-photo-${i+1}`}><span>{String(i+1).padStart(2,'0')}</span><Leaf size={26}/></div><small>{t.verb}</small><b>{t.title}</b>{progress[t.id]&&<em>В АРХИВЕ</em>}</button>)}
        <div className="hand-note polaroid-note">выбирай не «следующее», а то, что откликается сегодня</div>
      </div>}
    </section>

    <section className="habit-section torn-top">
      <div className="habit-copy"><span className="section-no">ЛИЧНЫЙ ТРЕКЕР · 30 ДНЕЙ</span><h2>Мой ритм осени.</h2><p>Здесь не нужно держать серию. Просто отмечай дни, когда получилось повторить своё действие.</p><div className="hand-note">пропуски тоже считаются жизнью</div></div>
      <div className="habit-card">
        <span className="free-badge">ОДНА ПРИВЫЧКА БЕСПЛАТНО</span>
        <label>Что хочется повторять чаще?<input value={habit.name} onChange={e=>saveHabitField('name',e.target.value)} placeholder="например: вечерняя прогулка"/></label>
        <label>Зачем мне это <small>необязательно</small><textarea value={habit.why} onChange={e=>saveHabitField('why',e.target.value)} placeholder="короткая личная причина"/></label>
        <div className="habit-days">{Array.from({length:30},(_,i)=><button key={i} className={habit.days.includes(i)?'marked':''} onClick={()=>toggleHabitDay(i)}><span>{i+1}</span>{habit.days.includes(i)&&<Check size={12}/>}</button>)}</div>
        <div className="habit-total">не серия · просто отмечено дней: <b>{habit.days.length}</b></div>
      </div>
    </section>

    <section className="bonus-section" id="bonus">
      <div className="bonus-heading"><span className="section-no">МЕЖДУ СТРАНИЦАМИ</span><h2>То, что можно<br/><i>положить внутрь.</i></h2><p>Здесь будут только утверждённые материалы. Пока открыт один бесплатный выпуск — осенняя книга рецептов.</p></div>
      <div className="bonus-stack">{bonuses.map((b,i)=><article key={b.n} className={`bonus-ticket ${b.free?'free':''} t-${i}`}><span className="ticket-no">{b.n}</span><div><small>{b.tag}</small><h3>{b.title}</h3><p>{b.text}</p><button className="folio-button">раскрыть вложение <ArrowRight size={14}/></button></div><span className="ticket-arrow">↗</span><span className="bonus-tape"/></article>)}</div>
    </section>

    <section className="final-scene torn-top">
      <div className="empty-journal"><div/><div/></div>
      <div className="final-copy"><span className="section-no">ПОСЛЕДНЯЯ СТРАНИЦА</span><h2>К ноябрю блокнот уже не будет пустым.</h2><p>Останется то, что обычно забывается: куда ходила, что читала, какой был свет, что готовила и с кем пила чай.</p><div className="season-facts"><span><b>12</b> глав</span><span><b>6</b> точек в каждой</span><span><b>∞</b> свой темп</span></div><button className="primary">открыть полный сезон <ArrowRight size={17}/></button></div>
      <div className="filled-journal"><div className="mini-photo"/><div className="mini-note">моя осень<br/>была здесь ♡</div><div className="mini-leaf"><Leaf/></div></div>
    </section>

    <footer><div className="wordmark">ПРОЖИВИ<span>бумажный дневник для настоящих моментов</span></div><p>Не ещё один список на осень. Твоя осень, которую ты действительно проживёшь и сохранишь.</p></footer>
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
