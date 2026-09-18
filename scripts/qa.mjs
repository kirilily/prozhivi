import { chromium } from 'playwright'

const BASE = process.env.QA_URL || 'http://127.0.0.1:4173/'
const viewports = [
  {name:'desktop', width:1440, height:1000},
  {name:'tablet', width:834, height:1112},
  {name:'mobile', width:390, height:844},
]

const failures = []
const results = []

function pushFail(view, check, details=''){
  failures.push({view, check, details})
}

const browser = await chromium.launch({headless:true})

for (const v of viewports){
  const context = await browser.newContext({viewport:{width:v.width,height:v.height}})
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type()==='error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => consoleErrors.push(String(err)))

  await page.goto(BASE, {waitUntil:'networkidle', timeout:60000})

  const baseMetrics = await page.evaluate(() => {
    const root = document.documentElement
    const keySelectors = [
      '.top-nav','.hero-content-safe','.hero-collage-safe','.lux-book',
      '.clean-open-book','.route-map','.chapter-journal','.habit-sheet',
      '.bonus-section','.final-section'
    ]
    const rects = {}
    for (const sel of keySelectors){
      const el=document.querySelector(sel)
      if(!el) continue
      const r=el.getBoundingClientRect()
      rects[sel]={x:r.x,right:r.right,width:r.width,height:r.height}
    }
    const offenders=[...document.querySelectorAll('body *')].map(el=>{
      const r=el.getBoundingClientRect()
      const st=getComputedStyle(el)
      return {tag:el.tagName,cls:String(el.className||''),x:r.x,right:r.right,width:r.width,sw:el.scrollWidth,cw:el.clientWidth,ovx:st.overflowX}
    }).filter(o=>o.width>1 && (o.x < -3 || o.right > innerWidth+3 || ((o.ovx==='visible'||o.ovx==='clip') && o.sw > o.cw+8))).slice(0,30)
    return {
      innerWidth,
      scrollWidth:root.scrollWidth,
      rects,
      offenders,
    }
  })

  if (baseMetrics.scrollWidth > v.width + 3){
    pushFail(v.name,'horizontal page overflow',`scrollWidth=${baseMetrics.scrollWidth}, viewport=${v.width}`)
  }

  for (const [sel,r] of Object.entries(baseMetrics.rects)){
    if (r.x < -3 || r.right > v.width + 3) pushFail(v.name,`${sel} leaves viewport`,JSON.stringify(r))
  }

  if (baseMetrics.offenders.length){
    const serious = baseMetrics.offenders.filter(o => !o.cls.includes('chapter-tabs') && !o.cls.includes('red-route'))
    if (serious.length) pushFail(v.name,'overflowing elements',JSON.stringify(serious.slice(0,8)))
  }

  // Book interaction
  const openBtn = page.getByRole('button',{name:/открыть книгу/i}).first()
  if (await openBtn.count()){
    await openBtn.click()
    await page.waitForTimeout(1100)
    const book = await page.evaluate(() => {
      const shell=document.querySelector('.lux-book')
      const pages=[...document.querySelectorAll('.inside-page')].map(el=>{
        const r=el.getBoundingClientRect(); return {width:r.width,height:r.height}
      })
      return {open:shell?.classList.contains('open'),pages}
    })
    if(!book.open) pushFail(v.name,'book did not open')
    if(book.pages.length!==2 || book.pages.some(p=>p.width<90 || p.height<250)){
      pushFail(v.name,'book pages too small or missing',JSON.stringify(book.pages))
    }
  } else pushFail(v.name,'open book button missing')

  // Moment persistence
  const momentBtn = page.getByRole('button',{name:/сохранить этот момент|момент сохранён/i}).first()
  if (await momentBtn.count()){
    const txt=(await momentBtn.innerText()).toLowerCase()
    if(!txt.includes('момент сохранён')) await momentBtn.click()
    await page.reload({waitUntil:'networkidle'})
    const persisted = (await page.getByRole('button',{name:/момент сохранён|сохранить этот момент/i}).first().innerText()).toLowerCase()
    if(!persisted.includes('момент сохранён')) pushFail(v.name,'saved moment not persisted after reload')
  } else pushFail(v.name,'save moment button missing')

  // Habit tracker save + future lock
  const habitInput = page.locator('.habit-sheet input').first()
  if (await habitInput.count()){
    await habitInput.fill('вечерняя прогулка')
    const saveHabit=page.getByRole('button',{name:/сохранить привычку|сохранить изменения/i}).first()
    await saveHabit.click()
    const habitState=await page.evaluate(() => {
      const buttons=[...document.querySelectorAll('.habit-days button')]
      return {count:buttons.length,disabled:buttons.filter(b=>b.disabled).length,enabled:buttons.filter(b=>!b.disabled).length}
    })
    if(habitState.count!==30) pushFail(v.name,'habit calendar should have 30 days',JSON.stringify(habitState))
    if(habitState.disabled<20) pushFail(v.name,'too many habit days available at once',JSON.stringify(habitState))
  } else pushFail(v.name,'habit input missing')

  // Bonus interaction
  const bonusSection=page.locator('#bonus')
  const bonusCount=await bonusSection.count()
  if(!bonusCount){
    pushFail(v.name,'bonus section missing after interactions',`url=${page.url()} body=${(await page.locator('body').innerText()).slice(0,250)}`)
  }else{
    await bonusSection.scrollIntoViewIfNeeded({timeout:5000}).catch(err=>pushFail(v.name,'could not scroll to bonus',String(err)))
    const bonusBtn=bonusSection.getByRole('button',{name:/открыть полностью/i}).first()
    if(await bonusBtn.count()){
      await bonusBtn.click()
      await page.waitForTimeout(250)
      if(!(await page.locator('.bonus-reader').isVisible())) pushFail(v.name,'bonus reader did not open')
      const recipeCount=await page.locator('.recipe-card').count()
      if(recipeCount!==5) pushFail(v.name,'free recipes count mismatch',String(recipeCount))
    } else pushFail(v.name,'free bonus button missing')
  }

  if(consoleErrors.length) pushFail(v.name,'console/page errors',consoleErrors.join(' | ').slice(0,1200))

  results.push({view:v.name,baseMetrics,consoleErrors})
  await context.close()
}

await browser.close()

console.log('QA_RESULTS_START')
console.log(JSON.stringify({results,failures},null,2))
console.log('QA_RESULTS_END')

if(failures.length){
  console.error(`QA failed with ${failures.length} issue(s)`)
  process.exit(1)
}
console.log('QA passed')
