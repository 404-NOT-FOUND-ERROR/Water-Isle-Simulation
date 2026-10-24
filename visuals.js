// One palette and drawing language for lessons, live controls and reports.
const WaterVisual={
 colors:{ink:'#294e46',muted:'#70877b',land:'#d8e2bf',paper:'#f8f7ec',water:'#82c4cc',deep:'#2d8295',flow:'#368fa0',gold:'#d5ae66',stone:'#6d8d80',danger:'#bf7355'},
 serial:0,
 frame(body,label,viewBox='0 0 280 132',className='lesson-diagram'){
  const id='water-arrow-'+(++this.serial);
  return `<svg viewBox="${viewBox}" class="water-graphic ${className}" role="img" aria-label="${label}"><defs><marker id="${id}" markerWidth="4" markerHeight="4" refX="3.3" refY="2" orient="auto"><path d="M0 0L4 2L0 4Z" fill="${this.colors.flow}"/></marker></defs>${body.replaceAll('ARROW_ID',id)}</svg>`;
 },
 arrow(path,extra=''){return `<path d="${path}" class="diagram-flow ${extra}" fill="none" stroke="${this.colors.flow}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#ARROW_ID)"/>`;},
 label(x,y,text){return `<text x="${x}" y="${y}" text-anchor="middle">${text}</text>`;}
};
if(typeof module!=='undefined')module.exports=WaterVisual;
