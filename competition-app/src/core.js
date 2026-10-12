export const teams = ['Northbridge FC','Harbour United'];
export function generateMatch(seed=26) {
  let state=seed>>>0;
  const random=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
  const names=[['Reed','Silva','Okoro','Vale','Mensah'],['Costa','Park','Diallo','Hart','Nouri']];
  let x=30,y=50,team=0,sequence=1;
  return Array.from({length:180},(_,i)=>{
    const r=random();let type=r<.58?'pass':r<.72?'pressure':r<.85?'tackle':'shot';
    if(type==='tackle'){team=1-team;sequence++;x=20+random()*25;}
    const start={x:+x.toFixed(1),y:+y.toFixed(1)};
    const end=type==='pressure'?{...start}:{x:+Math.min(98,Math.max(2,x+(type==='shot'?100-x:random()*30-7))).toFixed(1),y:+Math.min(95,Math.max(5,y+random()*36-18)).toFixed(1)};
    const outcome=type==='shot'?(random()<.18?'goal':random()<.55?'saved':'wide'):type==='pass'?(random()<.87?'complete':'incomplete'):type==='tackle'?'won':'applied';
    const event={id:`EV-${String(i+1).padStart(3,'0')}`,second:30+i*30,team:teams[team],player:names[team][Math.floor(random()*5)],type,outcome,start,end,sequence};
    x=end.x;y=end.y;
    if(type==='shot'||outcome==='incomplete'){team=1-team;sequence++;x=20;y=50;}
    return event;
  });
}
export function statistics(events) {
  return teams.map(team=>{const own=events.filter(e=>e.team===team),passes=own.filter(e=>e.type==='pass');return {team,goals:own.filter(e=>e.outcome==='goal').length,shots:own.filter(e=>e.type==='shot').length,passes:passes.length,accuracy:passes.length?Math.round(passes.filter(e=>e.outcome==='complete').length/passes.length*100):0,pressure:own.filter(e=>e.type==='pressure').length};});
}
export function interpret(events,index) {
  const event=events[index];if(!event)throw new Error('Unknown event');
  const context=events.slice(0,index+1).filter(e=>e.sequence===event.sequence).slice(-6);
  const passDistance=event.type==='pass'?Math.hypot((event.end.x-event.start.x)*1.05,(event.end.y-event.start.y)*.68):null;
  const progressive=event.type==='pass'&&event.outcome==='complete'&&event.end.x-event.start.x>=15;
  const pressures=context.filter(e=>e.type==='pressure').length;
  const pattern=event.type==='shot'?'Chance created':event.type==='tackle'?'Possession turnover':progressive?'Progressive pass':pressures>=2?'Pressure cluster':'Build-up play';
  return {event,context,pattern,passDistance:passDistance===null?null:+passDistance.toFixed(1),pressures,stats:statistics(events.slice(0,index+1)),evidence:context.map(e=>e.id)};
}
export function recordedAnswer(facts,question='',language='en') {
  const q=question.trim(),es=language==='es';if(!q)return null;
  if(/what happened|what occurred|qué ocurrió|que ocurrio|qu[eé] pas[oó]/i.test(q))return {text:observedLead(facts.event,language).replace(/Interpretation: $|Interpretación: $/,'').trim(),evidence:[facts.event.id]};
  if(/\bxg\b|expected goals|goals? probability|speed|injur|weather|off.ball|formation|intention|velocidad|lesi[oó]n|clima|sin bal[oó]n|formaci[oó]n|intenci[oó]n/i.test(q))return {text:es?'Estos datos no registran xG, velocidad, lesiones, clima, movimientos sin balón, formaciones ni intenciones. No se puede deducir esa información.':'These records do not include xG, speed, injuries, weather, off-ball movement, formations or intentions. That information cannot be inferred.',evidence:[facts.event.id]};
  if(/\bscore\b|marcador|resultado del partido/i.test(q))return {text:es?`Marcador registrado: ${facts.stats[0].team} ${facts.stats[0].goals}–${facts.stats[1].goals} ${facts.stats[1].team}, hasta ${facts.event.id}.`:`Recorded score: ${facts.stats[0].team} ${facts.stats[0].goals}–${facts.stats[1].goals} ${facts.stats[1].team}, through ${facts.event.id}.`,evidence:[facts.event.id]};
  if(/distance|how far|distancia|cu[aá]nto.*pase/i.test(q))return {text:facts.passDistance===null?(es?'El evento seleccionado no es un pase; no tiene una distancia de pase registrada.':'The selected event is not a pass; it has no recorded pass distance.'):(es?`Distancia estimada del pase: ${facts.passDistance} m, calculada a partir de las coordenadas sobre un campo supuesto de 105 × 68 m.`:`Estimated pass distance: ${facts.passDistance} m, calculated from coordinates on an assumed 105 × 68 m pitch.`),evidence:[facts.event.id]};
  return null;
}
export function observedLead(event,language='en') {
  const types={pass:'pase',shot:'tiro',tackle:'entrada',pressure:'presión'},outcomes={complete:'completado',incomplete:'incompleto',goal:'gol',saved:'parada',wide:'fuera',won:'ganada',applied:'aplicada'};
  return language==='es'?`Registro: ${event.id}, ${event.player} (${event.team}), ${types[event.type]}, ${outcomes[event.outcome]}. Interpretación: `:`Recorded: ${event.id}, ${event.player} (${event.team}), ${event.type}, ${event.outcome}. Interpretation: `;
}
export function explain(facts,mode='fan',question='',language='en') {
  const direct=recordedAnswer(facts,question,language);if(direct)return direct.text;
  const {event:e,pattern,passDistance,pressures}=facts;
  if(question&& !/why|matter|tactic|pressure|pass|shot|goal|moment|happen|coach|explain|recap|player|team|score|por qu[eé]|importa|t[aá]ctic|presi[oó]n|pase|tiro|gol|momento|explica|jugador|equipo|marcador/i.test(question))return language==='es'?'Los datos del evento no permiten responder a esa pregunta. Selecciona un momento o pregunta por las acciones registradas.':'The event data does not support an answer to that question. Select a match moment or ask about its recorded actions.';
  const minute=Math.floor(e.second/60)+':'+String(e.second%60).padStart(2,'0');
  const action={pass:e.outcome==='complete'?'completed a pass':'attempted a pass that was not completed',shot:e.outcome==='goal'?'scored a goal':e.outcome==='saved'?'had a shot saved':'sent a shot wide',tackle:'won possession with a tackle',pressure:'applied recorded pressure'}[e.type];
  const fact=mode==='fan'?`${minute}: ${e.player} (${e.team}) ${action}.`:`${minute}: ${e.player} (${e.team}) recorded a ${e.type}; outcome: ${e.outcome}.`;
  const interpretations={
    'Chance created':'The attack reached a shot. Shot location alone does not establish chance quality or an expected-goals value.',
    'Possession turnover':'The recorded tackle changed possession, creating an opportunity to attack before the opposition resets.',
    'Progressive pass':`The completed pass advanced the ball ${Math.round(e.end.x-e.start.x)} percentage points toward the attacking goal. That can help move an attack into a more dangerous area; defensive lines are not recorded.`,
    'Pressure cluster':`${pressures} pressure events appear in the cited possession sequence. This suggests a spell of pressure, but does not prove a coordinated press.`,
    'Build-up play':'This action is part of the possession sequence. The data does not include off-ball movement, so player intentions cannot be confirmed.'};
  if(language==='es')return `${minute}: ${e.player} (${e.team}), evento: ${ {pass:'pase',shot:'tiro',tackle:'entrada',pressure:'presión'}[e.type]}. Resultado registrado: ${ {complete:'completado',incomplete:'incompleto',goal:'gol',saved:'parada',wide:'fuera',won:'ganada',applied:'aplicada'}[e.outcome]}. ${mode==='coach'?'Revise la secuencia y la ubicación del balón antes de interpretar la táctica.':'Explora la secuencia para entender cómo se desarrolló la jugada.'} Los datos son sintéticos; no confirman la intención ni el movimiento sin balón.`;
  const review={pass:'Review the recorded pass direction and completion before evaluating progression; receiver and defender positions are unavailable.',shot:'Review the cited actions leading to the shot and its recorded outcome; shot quality cannot be established from these records.',tackle:'Review the recovery location and recorded possession change; the next action is a review opportunity, not evidence available at this moment.',pressure:'Review whether the cited possession contains repeated pressure events; pressing-player positions and coordination are unavailable.'}[e.type];
  return fact+' '+(mode==='fan'&&pattern==='Progressive pass'?'The completed pass moved the ball closer to the attacking goal. That could help the team advance its attack; the defenders’ positions are not recorded.':interpretations[pattern])+(mode==='coach'?` Coach review: ${review}${passDistance!==null?` Estimated pass distance: ${passDistance} m on a 105 × 68 m pitch.`:''}`:'')+' Evidence: '+facts.evidence.join(', ')+'.';
}
export function recap(events,mode='fan',favorite='all',language='en') {
  const stats=statistics(events),focus=favorite==='all'?events:events.filter(e=>e.team===favorite);
  if(mode==='fan'){
    const es=language==='es',lastGoal=focus.filter(e=>e.outcome==='goal').at(-1),shots=focus.filter(e=>e.type==='shot').length,turnovers=focus.filter(e=>e.type==='tackle').length;
    const score=`${teams[0]} ${stats[0].goals}–${stats[1].goals} ${teams[1]}`;
    const latest=lastGoal?`${lastGoal.player} (${lastGoal.team}), ${Math.floor(lastGoal.second/60)}:${String(lastGoal.second%60).padStart(2,'0')} (${lastGoal.id}).`:'';
    return es?`${score}, hasta el momento seleccionado. ${favorite==='all'?'Ambos equipos':favorite}: ${shots} tiros y ${turnovers} entradas ganadas. ${lastGoal?'Último gol registrado: '+latest:'No hay goles registrados para esta selección.'} ${focus.length?'Explora los tiros y los cambios de posesión para seguir el partido.':'Todavía no hay acciones registradas para esta selección.'} Resumen basado en reglas de eventos sintéticos; sin datos futuros.`:`${score}, through the selected moment. ${favorite==='all'?'Both teams':favorite}: ${shots} shots and ${turnovers} possession-winning tackles. ${lastGoal?'Latest recorded goal: '+latest:'No goals recorded for this selection yet.'} ${focus.length?'Explore shots and turnovers to follow the match story.':'No actions recorded for this selection yet.'} Rule-based recap of synthetic events; no future events included.`;
  }
  if(language==='es')return `${teams[0]} ${stats[0].goals}–${stats[1].goals} ${teams[1]} en el momento seleccionado. ${focus.filter(e=>e.type==='shot').length} tiros y ${focus.filter(e=>e.type==='tackle').length} entradas ganadas${favorite==='all'?'':` para ${favorite}`}. ${mode==='coach'?stats.map(s=>`${s.team}: ${s.accuracy}% de pases completados (${s.passes} pases registrados), ${s.pressure} eventos de presión.`).join(' '):'Explora los tiros y los cambios de posesión para seguir la historia del partido.'} Este resumen describe únicamente eventos sintéticos.`;
  return `${teams[0]} ${stats[0].goals}–${stats[1].goals} ${teams[1]} at the selected replay point. ${focus.filter(e=>e.type==='shot').length} shots and ${focus.filter(e=>e.type==='tackle').length} possession-winning tackles${favorite==='all'?'':` for ${favorite}`}. ${mode==='coach'?stats.map(s=>`${s.team}: ${s.accuracy}% pass completion (${s.passes} recorded passes), ${s.pressure} pressure events.`).join(' '):'Explore the shots and turnovers to follow the changing story of the match.'} This recap describes synthetic events only.`;
}

export function commentaryLine(event,language='en') {
  const name=event.player;
  const lines=language==='es'?{
    pass:event.outcome==='complete'?`${name} completa el pase.`:`El pase de ${name} no se completa.`,
    shot:event.outcome==='goal'?`¡Gol de ${name} para ${event.team}!`:event.outcome==='saved'?`¡Tiro de ${name}, y parada!`:`${name} tira fuera.`,
    tackle:`${name} gana la posesión con una entrada.`,pressure:`${name} aplica presión.`
  }:{
    pass:event.outcome==='complete'?`${name} completes the pass.`:`${name}'s pass is incomplete.`,
    shot:event.outcome==='goal'?`Goal! ${name} scores for ${event.team}!`:event.outcome==='saved'?`${name} shoots—saved!`:`${name} sends the shot wide.`,
    tackle:`${name} wins possession with a tackle.`,pressure:`${name} applies pressure.`
  };
  return lines[event.type]||'';
}

export function createTradingMemory(eventIndex,{name='',note='',photo='',mediaKind='none'}={}) {
  const facts=interpret(generateMatch(),eventIndex);
  if(photo&&(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(photo)||photo.length>3000000))throw new Error('Use a local image under the card size limit.');
  return {version:1,index:eventIndex,eventId:facts.event.id,player:facts.event.player,team:facts.event.team,second:facts.event.second,type:facts.event.type,outcome:facts.event.outcome,name:String(name).trim().slice(0,32),note:String(note).trim().slice(0,160),photo,mediaKind:photo?(mediaKind==='video-frame'?'video-frame':'photo'):'none',evidence:facts.evidence,synthetic:true};
}
export function tradingCardSVG(memory,back=false) {
  const xml=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const wrap=(text,width)=>{const chunks=String(text).match(new RegExp('.{1,'+width+'}','gu'))||[];return chunks;};
  const text=(value,x,y,size=22,color='#f2f6fc')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${xml(value)}</text>`;
  const label=memory.name||memory.player;
  const photo=memory.photo?`<image href="${xml(memory.photo)}" x="44" y="180" width="512" height="410" preserveAspectRatio="xMidYMid slice"/>`:`<rect x="44" y="180" width="512" height="410" rx="16" fill="#123b34"/><circle cx="300" cy="385" r="100" fill="none" stroke="#67d9ff" stroke-width="3"/>${text(memory.type.toUpperCase(),90,380,44)}${text(memory.outcome.toUpperCase(),90,440,26,'#67d9ff')}`;
  const content=back?`${text('THE STORY BEHIND THE CARD',44,155,22,'#67d9ff')}${wrap(memory.note||'A moment worth remembering.',35).slice(0,5).map((line,i)=>text(line,44,205+i*30,22)).join('')}${text('RECORDED MATCH FACTS',44,420,18,'#67d9ff')}${wrap(`${memory.player} · ${memory.team}`,36).map((line,i)=>text(line,44,458+i*28,20)).join('')}${text(`${memory.type} · ${memory.outcome}`,44,530,22)}${text(`${memory.eventId} · ${Math.floor(memory.second/60)}:${String(memory.second%60).padStart(2,'0')}`,44,570,20)}${text('Evidence: '+memory.evidence.join(', '),44,620,13)}${text('Your note/media are personal additions.',44,690,16)}${text('They are not evidence of a real match.',44,718,16)}`:`${photo}${text(label,44,645,Math.min(28,Math.floor(840/Math.max(label.length,1))))}${text(memory.player+' · '+memory.type,44,692,22)}${text(memory.eventId+' · '+memory.team,44,734,17,'#67d9ff')}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="840" viewBox="0 0 600 840"><defs><linearGradient id="card-edge" x2="1" y2="1"><stop stop-color="#67d9ff"/><stop offset="1" stop-color="#c997ff"/></linearGradient></defs><rect width="600" height="840" rx="28" fill="#090e16"/><rect x="12" y="12" width="576" height="816" rx="24" fill="#111a26" stroke="url(#card-edge)" stroke-width="3"/><g font-family="Arial,sans-serif">${text('PRO-VISION / MEMORY CARD',44,66,23,'#67d9ff')}${text(back?'PERSONAL STORY / RECORDED EVIDENCE':'MY MATCH. MY MEMORY.',44,108,17)}${content}${text('FICTIONAL MATCH · PERSONAL KEEPSAKE',44,796,15,'#95a3b7')}</g></svg>`;
}
