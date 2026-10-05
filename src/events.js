export const match = Object.freeze({id:'demo-001',home:'Cedar FC',away:'Marina FC',pitch:{lengthM:105,widthM:68},coordinateSystem:'team-normalized: attack toward increasing x; metres',synthetic:true});

// An authored sequence: ball movement is continuous within each possession.
// Pressure coordinates describe the ball location, not an inferred player position.
export const demoEvents = [
 {id:'M001',second:120,team:'Cedar FC',player:'Alex Vale',type:'pass',outcome:'complete',from:[35,34],to:[47,30]},
 {id:'M002',second:123,team:'Marina FC',player:'Sam Torres',type:'pressure',outcome:'applied',ball:[58,38]},
 {id:'M003',second:126,team:'Marina FC',player:'Lee Chen',type:'pressure',outcome:'applied',ball:[58,38]},
 {id:'M004',second:128,team:'Cedar FC',player:'Jules Reed',type:'pass',outcome:'complete',from:[47,30],to:[68,25]},
 {id:'M005',second:132,team:'Cedar FC',player:'Noah Silva',type:'shot',outcome:'saved',from:[68,25],to:[105,34]},
 {id:'M006',second:145,team:'Marina FC',player:'Lee Chen',type:'pass',outcome:'complete',from:[25,40],to:[44,36]},
 {id:'M007',second:150,team:'Cedar FC',player:'Alex Vale',type:'tackle',outcome:'won',ball:[61,32]},
 {id:'M008',second:153,team:'Cedar FC',player:'Alex Vale',type:'pass',outcome:'complete',from:[61,32],to:[83,34]},
 {id:'M009',second:158,team:'Cedar FC',player:'Noah Silva',type:'shot',outcome:'goal',from:[83,34],to:[105,34]}
];

const outcomes={pass:['complete','incomplete'],pressure:['applied'],tackle:['won','lost'],shot:['goal','saved','off-target','blocked']};
export function validateEvent(event) {
 if(!event||typeof event.id!=='string'||!/^M\d{3,6}$/.test(event.id))throw new Error('Invalid event ID');
 if(!Number.isInteger(event.second)||event.second<0||event.second>7200)throw new Error('Invalid match clock');
 if(![match.home,match.away].includes(event.team)||typeof event.player!=='string'||!event.player.trim())throw new Error('Unknown team or player');
 if(!outcomes[event.type]?.includes(event.outcome))throw new Error('Invalid event type or outcome');
 const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<=105&&p[1]>=0&&p[1]<=68;
 if(['pass','shot'].includes(event.type)?!point(event.from)||!point(event.to):!point(event.ball))throw new Error('Invalid pitch coordinates');
 return event;
}

export class MatchState {
 constructor(){this.events=[];this.ids=new Set();}
 ingest(input){
  validateEvent(input);
  if(this.ids.has(input.id))return {accepted:false,reason:'duplicate'};
  if(input.second<(this.events.at(-1)?.second??0))return {accepted:false,reason:'out-of-order'};
  const event=structuredClone(input);this.ids.add(event.id);this.events.push(event);
  return {accepted:true,state:this.snapshot()};
 }
 snapshot(asOfClock=this.events.at(-1)?.second??0){
  if(!Number.isInteger(asOfClock)||asOfClock<(this.events.at(-1)?.second??0)||asOfClock>7200)throw new Error('Invalid snapshot clock');
  const stats=Object.fromEntries([match.home,match.away].map(team=>[team,{passes:0,completed:0,shots:0,goals:0,pressures:0,tacklesWon:0}]));
  let possession=null;const changes=[];
  for(const e of this.events){
   const s=stats[e.team];
   if(e.type==='pass'){s.passes++;if(e.outcome==='complete')s.completed++;}
   if(e.type==='shot'){s.shots++;if(e.outcome==='goal')s.goals++;}
   if(e.type==='pressure')s.pressures++;
   if(e.type==='tackle'&&e.outcome==='won')s.tacklesWon++;
   // Recorded on-ball team, not continuous tracking or a possession percentage.
   if(e.type==='pass'||e.type==='shot'||(e.type==='tackle'&&e.outcome==='won')){
    if(possession&&possession!==e.team)changes.push({eventId:e.id,from:possession,to:e.team});
    possession=e.team;
   }
  }
  for(const s of Object.values(stats))s.passAccuracy=s.passes?s.completed/s.passes:null;
  const latest=this.events.at(-1);const context=this.events.filter(e=>e.second>=asOfClock-20&&e.second<=asOfClock);
  const signals=[];
  if(latest?.type==='pass'&&latest.outcome==='complete'&&latest.to[0]-latest.from[0]>=15)signals.push({kind:'progressive-pass',eventIds:[latest.id],advanceM:latest.to[0]-latest.from[0],distanceM:Math.hypot(latest.to[0]-latest.from[0],latest.to[1]-latest.from[1]),definition:'Completed pass advancing at least 15 metres in team-normalized coordinates; demo heuristic.'});
  for(const team of [match.home,match.away]){
   const pressure=context.filter(e=>e.type==='pressure'&&e.team===team);
   if(pressure.length>=2)signals.push({kind:'pressure-cluster',team,eventIds:pressure.map(e=>e.id),definition:'At least two recorded pressure actions in the preceding 20 seconds; not measured tactical control.'});
  }
  if(changes.at(-1)?.eventId===latest?.id)signals.push({kind:'possession-change',...changes.at(-1),eventIds:[latest.id]});
  return structuredClone({clock:asOfClock,latest:latest??null,stats,recordedOnBallTeam:possession,changes,signals,context});
 }
}
