import React, { useMemo, useState } from 'react'

const MIN_STEP = 30
const ROW_H = 44
const days = ['월','화','수','목','금','토','일']

const pad2 = (n)=> String(n).padStart(2,'0')
const toHHMM = (min)=> `${pad2(Math.floor(min/60))}:${pad2(min%60)}`
const fromHHMM = (s)=> { const [h,m] = s.split(':').map(Number); return h*60+(m||0) }

function TimeSelect({ value, onChange, min=0, max=24*60, step=30 }){
  const opts = []; for (let t=min;t<=max;t+=step) opts.push(t)
  return (
    <select className="select" value={value} onChange={e=>onChange(Number(e.target.value))}>
      {opts.map(t=> <option key={t} value={t}>{toHHMM(t)}</option>)}
    </select>
  )
}

function Event({ evt, start, onEdit, onDelete }){
  const top = ((evt.start-start)/MIN_STEP)*ROW_H
  const h = Math.max(((evt.end-evt.start)/MIN_STEP)*ROW_H, ROW_H)
  return (
    <div className="event" style={{ top, height: h }}>
      <div className="inner">
        <div className="text">
          <div className="meta">{toHHMM(evt.start)} – {toHHMM(evt.end)}</div>
          <div className="name">{evt.title || '제목 없음'}</div>
        </div>
        <div className="controls">
          <button className="small button" onClick={onEdit}>수정</button>
          <button className="small button secondary" onClick={onDelete}>삭제</button>
        </div>
      </div>
    </div>
  )
}

export default function App(){
  const [start, setStart] = useState(fromHHMM('10:00'))
  const [end, setEnd] = useState(fromHHMM('18:00'))
  const [activeDay, setActiveDay] = useState(0)
  const [events, setEvents] = useState([
    { id: 'e1', day: 0, title: '일정 제목을 입력하세요', start: fromHHMM('11:00'), end: fromHHMM('11:30') }
  ])

  const rows = useMemo(()=> { const r=[]; for(let t=start;t<end;t+=MIN_STEP) r.push(t); return r },[start,end])
  const dayEvents = events.filter(e=>e.day===activeDay)

  const addEvent = ()=> {
    const s = Math.min(end-30, start+60)
    setEvents(v=> [...v, { id: Math.random().toString(36).slice(2,9), day: activeDay, title:'새 일정', start:s, end:s+30 }])
  }

  const editFirst = (evt)=> {
    const title = prompt('일정 제목', evt.title || '')
    if (title === null) return
    const s = prompt('시작 (HH:MM)', '11:00')
    const e = prompt('끝 (HH:MM)', '11:30')
    const ns = fromHHMM(s || '11:00'), ne = fromHHMM(e || '11:30')
    setEvents(v=> v.map(x=> x.id===evt.id ? { ...x, title, start: ns, end: Math.max(ns+30, ne) } : x))
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">타임라인 편집기</div>
          <div className="subtitle">더블클릭 대신 간단 편집(프롬프트)으로 구성한 최소 버전. Netlify/Vercel 배포용.</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="button" onClick={addEvent}>+ 일정 추가</button>
          <button className="button secondary" onClick={()=>navigator.clipboard.writeText(window.location.href)}>URL 복사</button>
        </div>
      </div>

      <div className="card" style={{padding:20}}>
        <div className="row">
          <div>
            <div className="label">시작 시간</div>
            <TimeSelect value={start} onChange={(v)=> setStart(Math.min(v, end-30))} step={30} />
          </div>
          <div>
            <div className="label">끝 시간</div>
            <TimeSelect value={end} onChange={(v)=> setEnd(Math.max(v, start+30))} step={30} />
          </div>
          <div>
            <div className="label">요일 선택</div>
            <div className="daychips">
              {days.map((d,i)=>(
                <button key={d} className={"chip "+(i===activeDay?'active':'')} onClick={()=>setActiveDay(i)}>{d}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="timeline card">
          <div className="grid" style={{height: rows.length*44}}>
            <div className="axis">
              {rows.map(t=> <div key={t} className="tick"><span style={{marginTop:8, fontWeight: (t%60===0?'600':'400')}}>{String(Math.floor(t/60)).padStart(2,'0')}:{String(t%60).padStart(2,'0')}</span></div>)}
            </div>
            <div className="canvas" style={{height: rows.length*44, position:'relative'}}>
              {dayEvents.map(evt=> <div key={evt.id} onDoubleClick={()=>editFirst(evt)}>
                <Event evt={evt} start={start} onEdit={()=>editFirst(evt)} onDelete={()=>setEvents(v=>v.filter(x=>x.id!==evt.id))} />
              </div>)}
            </div>
          </div>
          <div className="footer-hint">Tip: 이벤트를 더블클릭해서 빠르게 수정할 수 있어요. SPA 새로고침 404 방지를 위해 Netlify에선 public/_redirects 포함.</div>
        </div>
      </div>
    </div>
  )
}
