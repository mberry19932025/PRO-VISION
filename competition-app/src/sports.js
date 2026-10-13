import {generateMatch,interpret,recap} from './core.js';

export function matchReport(events,index,mode='fan',team='all',language='en'){
  const facts=interpret(events,index),recorded=events.slice(0,index+1);
  return {synthetic:true,through:facts.event.id,second:facts.event.second,teams:facts.stats,players:facts.playerStats,
    goals:recorded.filter(e=>e.outcome==='goal').map(e=>({id:e.id,index:events.indexOf(e),second:e.second,player:e.player,team:e.team})),
    recap:recap(recorded,mode,team,language),provenance:'Original fictional events. Counts include only records through the replay cursor. No player ratings, xG or tracking metrics.'};
}
export function comparePlayers(facts,first,second,language='en'){
  const players=[first,second].map(name=>facts.playerStats.find(p=>p.player===name));
  if(first===second||players.some(p=>!p))return null;
  const es=language==='es',summary=players.map(p=>`${p.player}: ${p.completed}/${p.passes} ${es?'pases completados':'passes completed'}, ${p.shots} ${es?'tiros':'shots'}, ${p.goals} ${es?'goles':'goals'}.`).join(' ');
  return {text:(es?'Comparación de acciones registradas · hasta ':'Recorded-action comparison · through ')+facts.event.id+'. '+summary+(es?' No es una clasificación del rendimiento general.':' This is not a ranking of overall performance.'),players,evidence:[...new Set(players.flatMap(p=>p.evidence))]};
}
export function footballAnswer(facts,question='',mode='fan',viewer={team:'all'},language='en'){
  const q=question.trim(),es=language==='es';
  if(/\b(nfl|nba|basketball|cricket|american football)\b|premier league|\btoday\b|\btonight\b|live scores?|últimos resultados|resultados de hoy/i.test(q))return {text:es?'Esta aplicación usa un partido de fútbol ficticio. No hay resultados reales ni otras ligas deportivas conectadas. Explora los datos registrados o abre Matchday para ver los encuentros de demostración.':'This app uses a fictional association-football match. Real Premier League scores and other sports feeds are not connected. Ask about the recorded match, or open Matchday for labeled demo fixtures.',evidence:[]};
  if(/^(hi|hello|hey|hola)[!,.\s]*$|what can (you|i) (do|ask)|how (do i use|does .*work)|help me get started|qu[eé] puedes hacer/i.test(q))return {text:es?'Pregunta por el marcador, un jugador, un momento o un resumen. Puedes revisar las pruebas y crear una tarjeta con tu foto. Los datos son ficticios.':'Ask for the score, player stats, a comparison, a match recap, or why a play matters. Inspect the evidence, then keep your moment as a photo memory card. The match data is fictional.',evidence:[]};
  if(/how.*(memory|trading.?card|t.?shirt)|can.*wear|c[oó]mo.*tarjeta/i.test(q))return {text:es?'Abre Studio, añade un nombre y una foto opcional, y crea tu tarjeta. Puedes girarla, descargarla y volver al momento. La camiseta es una vista conceptual; no hay fabricación ni etiqueta física conectada.':'Open Studio, add a name and optional photo, then create your memory card. Flip it, download it, or return to its match moment. The T-shirt is a concept preview; garment production and physical tags are not connected.',evidence:[]};
  if(/\bcompare\b|\bversus\b|\bvs\.?\b|compar[aá]/i.test(q)){
    const named=facts.playerStats.filter(p=>q.toLowerCase().split(/[^a-z]+/).includes(p.player.toLowerCase()));
    return named.length===2?comparePlayers(facts,named[0].player,named[1].player,language):{text:es?'Indica dos jugadores del partido ficticio para comparar sus acciones registradas.':'Name two demo players to compare their recorded actions, such as “Compare Vale and Silva”.',evidence:[facts.event.id]};
  }
  if(/\brecap\b|\bsummar(?:y|ize|ise)\b|match report|resumen|resume el partido/i.test(q))return {text:recap(generateMatch().slice(0,Number(facts.event.id.slice(3))),mode,viewer.team,language),evidence:[facts.event.id]};
  if(/what (is|does).*(progressive pass|pass accuracy|pressure event)|qu[eé].*(pase progresivo|precisi[oó]n)/i.test(q))return {text:es?'En esta demostración, un pase progresivo es un pase completado que avanza al menos 15 puntos de coordenadas. La precisión es el porcentaje de pases completados. La presión cuenta eventos registrados, no movimientos de jugadores.':'In this demo, a progressive pass is a completed pass that advances at least 15 coordinate points. Pass accuracy is completed passes divided by attempted passes. Pressure counts recorded events, not tracked player movement.',evidence:[facts.event.id]};
  return null;
}
