// Render the journey artwork from the same world, geometry and models as the game.
// This local authoring page is never included in the shipped HTML.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const hook = fs.readFileSync(path.join(__dirname, 'journey-studio.js'), 'utf8');
const css = `
#app,body>dialog{display:none!important}body{overflow:auto!important;background:#eef2e7}
#studio{max-width:1200px;margin:auto;padding:28px;font:16px system-ui;color:#294e46}
#studio h1{font-size:28px;margin:0 0 12px}#studio p{margin:8px 0 20px}
#studio button{margin-bottom:24px}#studio-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
#studio figure{margin:0;border:1px solid #c7d8c5;border-radius:18px;overflow:hidden;background:#f8f7ec}
#studio img{display:block;width:100%;height:auto}#studio figcaption{padding:12px 18px;font-weight:600}
@media(max-width:600px){#studio-grid{grid-template-columns:1fr}}
`;
const studio = `<section id="studio"><h1>河谷旅程 · 模型取景</h1><p>六座岛，使用游戏中的地形、水路与建筑。</p><button id="render-journey" disabled>生成六关缩略图</button> <button id="render-covers" disabled>生成横竖封面</button><div id="studio-grid"></div></section>`;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace('/* AUTHORING_HOOK */', () => hook)
  .replace('</style>', css + '</style>')
  .replace(/(<body[^>]*>)/, '$1' + studio);
fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
fs.writeFileSync(path.join(root, 'test-results/journey-studio.html'), html);
console.log('Journey studio: http://127.0.0.1:8765/test-results/journey-studio.html');
