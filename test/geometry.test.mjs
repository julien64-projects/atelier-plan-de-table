import * as G from '../lib/geometry/tableGeometry.js';
let pass=0, fail=0;
const eq=(a,b,msg)=>{ if(a===b){pass++;} else {fail++;console.log(`  ✗ ${msg}: attendu ${b}, obtenu ${a}`);} };

console.log('— Capacité ronde —');
eq(G.capaciteRonde(120),6,'Ø120 → 6');
eq(G.capaciteRonde(150),8,'Ø150 → 8');
eq(G.capaciteRonde(180),10,'Ø180 → 10');

console.log('— Capacité droite / banquet —');
eq(G.capaciteDroite(180),6,'180cm → 6');
eq(G.capaciteDroite(240),8,'240cm → 8');
eq(G.capaciteDroite(180,{bouts:true}),8,'180cm + bouts → 8');

console.log('— Auto-dimensionnement —');
const r=G.dimensionnerPour(10,'ronde');
eq(r.capacite>=10,true,`ronde pour 10 → Ø${r.diametreCm}`);
const b=G.dimensionnerPour(64,'banquet');
eq(b.capacite>=64,true,`banquet pour 64 → ${b.longueurCm}cm`);

console.log('— Alerte dépassement —');
const t={shape:'ronde',diametreCm:150};
eq(G.etatCapacite(t,8).niveau,'plein','8/8 → plein');
eq(G.etatCapacite(t,9).niveau,'depassement','9/8 → dépassement');
eq(G.etatCapacite(t,6).niveau,'ok','6/8 → ok');

console.log(`\nRésultat : ${pass} OK, ${fail} échec(s)`);
console.log('Banquet 64 →', JSON.stringify(G.dimensionnerPour(64,'banquet')));
console.log('Ronde 10 →', JSON.stringify(G.dimensionnerPour(10,'ronde')));