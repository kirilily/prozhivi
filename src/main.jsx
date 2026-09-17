import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BookOpen, Check, ChevronRight, LockKeyhole, NotebookPen, Sparkles } from 'lucide-react'
import './styles.css'

const chapters = [
  { id:'start', n:'01', title:'Разрешение начать', free:true, note:'Не улучшать осень. Сначала — заметить её.', tasks:['Найти бумажный блокнот или выбрать новый','Написать на первой странице: «Эту осень я не хочу пропустить»','Описать сегодняшний день пятью очень конкретными деталями'] },
  { id:'signs', n:'02', title:'Первые признаки', free:true, note:'Собрать маленькие доказательства перемены сезона.', tasks:['Сфотографировать три первых признака осени','Найти один новый запах сезона и записать его','Пройти знакомый маршрут медленнее обычного'] },
  { id:'body', n:'03', title:'Тело входит в осень', free:false, note:'Замечать сезон не только глазами.', tasks:['Собрать список из пяти способов согреться без экрана','Отследить, что изменилось в сне, еде и темпе','Устроить 20 минут прогулки без наушников'] },
  { id:'book', n:'04', title:'Книга моей осени', free:false, note:'Создать личную книжную полку сезона.', tasks:['Выбрать одну книгу на сентябрь','Оформить страницу любимой цитаты','Записать, какое настроение хочется читать этой осенью'] },
  { id:'taste', n:'05', title:'Вкус осени', free:false, note:'Запомнить сезон через кухню и маленькие ритуалы.', tasks:['Приготовить одно блюдо только ради атмосферы','Записать рецепт от руки','Собрать свой список осенних вкусов'] },
  { id:'city', n:'06', title:'Город меняется', free:false, note:'Увидеть собственный город как временную выставку.', tasks:['Выбрать одну улицу и пройти её как турист','Найти лучший свет после 17:00','Снять один кадр без людей'] },
  { id:'people', n:'07', title:'Люди моей осени', free:false, note:'Сохранить не события, а присутствие.', tasks:['Записать имя человека, с которым хочется увидеться','Задать близкому один небанальный вопрос','Сохранить фразу, которую не хочется забыть'] },
  { id:'offline', n:'08', title:'День без доказательств', free:false, note:'Не всё ценное обязано стать контентом.', tasks:['Провести один час без фото и сторис','Сделать что-то красивое и никому не показать','Вечером записать, что изменилось'] },
  { id:'memory', n:'09', title:'Осень из прошлого', free:false, note:'Найти, что в тебе уже было осенью раньше.', tasks:['Вспомнить одну осень из детства','Найти старую фотографию или песню','Написать короткое письмо себе из прошлого'] },
  { id:'rain', n:'10', title:'Плохая погода', free:false, note:'Перестать ждать идеальных условий.', tasks:['Выйти на короткую прогулку в серый день','Собрать список уютных занятий на плохую погоду','Записать один плюс дождливого дня'] },
  { id:'collect', n:'11', title:'Собрать осень', free:false, note:'Сделать из разрозненных следов личный архив.', tasks:['Выбрать 9 главных кадров сезона','Переписать три важные заметки начисто','Собрать маленький конверт с бумажными следами'] },
  { id:'leaf', n:'12', title:'Последний лист', free:false, note:'Закрыть сезон без ощущения, что всё прошло мимо.', tasks:['Написать, какой стала эта осень','Выбрать один ритуал, который останется зимой','Закончить фразу: «Я прожила эту осень, потому что…»'] }
]

const bonus = [
  {title:'Осенняя кухня', text:'Шарлотка, печёные яблоки, банановый хлеб, домашние тако и тёплые напитки.', free:true},
  {title:'Тютчев', text:'Поэзия, портрет, 5+ биографических фактов и задание на личное сопоставление.', free:false},
  {title:'Левитан', text:'Картина, контекст, факты и вопросы для медленного рассматривания.', free:false}
]

function load(){ try{return JSON.parse(localStorage.getItem('prozhivi-progress'))||{}}catch{return{}} }

function App(){
  const [opened,setOpened]=useState(false)
  const [active,setActive]=useState(chapters[0])
  const [progress,setProgress]=useState(load)
  const doneCount=useMemo(()=>Object.values(progress).filter(Boolean).length,[progress])
  const total=chapters.reduce((a,c)=>a+c.tasks.length,0)
  const toggle=(key)=>{ const next={...progress,[key]:!progress[key]}; setProgress(next); localStorage.setItem('prozhivi-progress',JSON.stringify(next)) }

  return <main>
    <header className="topbar"><div className="brand">ПРОЖИВИ<span>осень как свою</span></div><div className="progressMini">{doneCount}/{total} точек</div></header>

    <section className="hero">
      <div className="heroCopy"><span className="eyebrow">сезонный маршрут · осень 2026</span><h1>Не успеть всё.<br/>А <em>прожить</em> своё.</h1><p>Интерактивный маршрут, который возвращает тебя из бесконечной ленты в собственную осень — через бумажный блокнот, маленькие действия и личные следы.</p><button onClick={()=>setOpened(true)}><NotebookPen size={18}/> открыть мою осень</button></div>
      <button className={`book ${opened?'open':''}`} onClick={()=>setOpened(true)} aria-label="Открыть книгу"><div className="cover"><span>ПРОЖИВИ</span><small>осень 2026</small></div><div className="page left"><span>не список дел</span><strong>место,<br/>где сезон<br/>останется</strong></div><div className="page right"><small>начать с простого</small><p>Найди дома блокнот, который хочется трогать руками.</p><span className="scribble">не идеальный. твой.</span></div></button>
    </section>

    <section className="notebookStrip"><BookOpen/><p><b>Сначала — бумага.</b> Сайт направляет, но твоя осень остаётся не только в экране.</p></section>

    <section className="chaptersSection" id="chapters"><div className="sectionHead"><div><span className="eyebrow">маршрут</span><h2>12 глав одной осени</h2></div><p>В бесплатной версии открыты первые две главы. Остальные видны, но не притворяются бесплатными.</p></div>
      <div className="chapterGrid">{chapters.map(c=><button key={c.id} className={`chapterCard ${active.id===c.id?'active':''} ${!c.free?'locked':''}`} onClick={()=>setActive(c)}><span className="num">{c.n}</span><div><h3>{c.title}</h3><p>{c.note}</p></div>{c.free?<ChevronRight/>:<LockKeyhole/>}</button>)}</div>
    </section>

    <section className="workspace">
      <div className="paperPanel"><span className="eyebrow">глава {active.n}</span><h2>{active.title}</h2><p className="lead">{active.note}</p>{active.free?<div className="taskList">{active.tasks.map((t,i)=>{const k=active.id+'-'+i; return <button className={`task ${progress[k]?'done':''}`} onClick={()=>toggle(k)} key={k}><span>{progress[k]?<Check size={16}/>:i+1}</span><p>{t}</p></button>})}</div>:<div className="paywall"><LockKeyhole/><h3>Эта глава — в полной версии</h3><p>Ты видишь содержание маршрута заранее, но выполнение откроется после покупки полной версии.</p><button>посмотреть полную версию</button></div>}</div>
      <aside className="sideNote"><Sparkles/><h3>След сезона</h3><p>После каждой главы оставь в бумажном блокноте хотя бы один материальный след: фразу, билет, лист, маленькое фото, рецепт или наблюдение.</p><div className="meter"><span style={{width:`${Math.round(doneCount/total*100)}%`}}/></div><small>{Math.round(doneCount/total*100)}% маршрута пройдено</small></aside>
    </section>

    <section className="bonusSection"><div className="sectionHead"><div><span className="eyebrow">необязательное, но красивое</span><h2>Бонусы без свалки</h2></div><p>Один бонус бесплатный. Остальные не исчезают и не маскируются.</p></div><div className="bonusGrid">{bonus.map((b,i)=><article className="bonusCard" key={b.title}><span>{String(i+1).padStart(2,'0')}</span><h3>{b.title}</h3><p>{b.text}</p><small>{b.free?'открыто бесплатно':'полная версия'}</small></article>)}</div></section>

    <footer><div className="brand">ПРОЖИВИ<span>осень как свою</span></div><p>Не ещё один красивый экран. Повод заметить собственную жизнь.</p></footer>
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
