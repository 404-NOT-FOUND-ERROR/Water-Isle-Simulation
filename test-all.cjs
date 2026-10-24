const {spawnSync}=require('node:child_process');
const suites=['physics','hydraulics','crew','residents','comparison','campaign-v6','gameplay'];
for(const name of suites){
  console.log('\n> '+name);
  const result=spawnSync(process.execPath,['test-'+name+'.cjs'],{cwd:__dirname,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status||1);
}
console.log('\nPASS all '+suites.length+' test suites');
