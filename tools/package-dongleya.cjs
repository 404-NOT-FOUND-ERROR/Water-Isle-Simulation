// Prepare a self-contained file and separate covers for manual submission.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const output=path.resolve(process.argv[2]||path.join(root,'..','output','给水一条路-懂了鸭上传包'));
const files=[['index.html','index.html'],['assets/covers/cover.jpg','封面-电脑-16比9.jpg'],['assets/covers/cover-portrait.jpg','封面-手机-3比4.jpg']];
const pending=files.map(([source,name])=>({name,bytes:fs.readFileSync(path.join(root,source))}));
if(pending[0].bytes.length>100*1024*1024)throw new Error('HTML exceeds the platform size limit.');
for(const item of pending.slice(1)){
 if(item.bytes.length>2*1024*1024||item.bytes.readUInt16BE(0)!==0xffd8||item.bytes.readUInt16BE(item.bytes.length-2)!==0xffd9)throw new Error('Incomplete JPEG: '+item.name);
}
fs.mkdirSync(output,{recursive:true});
for(const item of pending)fs.writeFileSync(path.join(output,item.name),item.bytes);
const title='给水一条路';
const description='动手疏河、筑坝、调闸，在五段河谷旅程与自由水工坊里，观察水流如何影响村庄、木桥和农田。';
fs.writeFileSync(path.join(output,'上传说明.txt'),`给水一条路 · 懂了鸭手动上传包\n\n1. 作品文件：index.html（包含全部六关、模型和图片）\n2. 电脑封面：封面-电脑-16比9.jpg\n3. 手机封面：封面-手机-3比4.jpg\n\n建议标题：${title}\n建议简介：${description}\n主题词：水利科普、洪水、河流、交互游戏\n\n解压后在懂了鸭选择 index.html 上传，再分别选择两张封面。\n选择电脑和手机展示，预览后按你的发布设置完成填写。\n\n本地打开 index.html 也可以游玩。\n`, 'utf8');
const manifest={title,description,delivery:'manual-upload',files:pending.map(item=>({name:item.name,bytes:item.bytes.length,sha256:crypto.createHash('sha256').update(item.bytes).digest('hex')}))};
fs.writeFileSync(path.join(output,'文件校验.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('UPLOAD_PACKAGE='+output);console.log('HTML_BYTES='+pending[0].bytes.length);
