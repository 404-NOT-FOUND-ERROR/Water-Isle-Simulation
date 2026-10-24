  const fantasyPalette = {
    stone: toon(0x9c8cae, {side: THREE.DoubleSide}),
    paleStone: toon(0xdfc8aa, {side: THREE.DoubleSide}),
    starRoad: toon(0x699cb8, {emissive: 0x17455b, emissiveIntensity: .28, side: THREE.DoubleSide}),
    starEdge: toon(0xc3ded6, {side: THREE.DoubleSide}),
    timber: toon(0xaa7950, {side: THREE.DoubleSide}),
    timberEdge: toon(0x684c45, {side: THREE.DoubleSide}),
    gold: toon(0xffd46e), ink: toon(0x304658),
    walls: [toon(0xffe6bb), toon(0xffcaa7), toon(0xc1e8cf)],
    roofs: [toon(0x519e9d), toon(0xcc7499), toon(0x678eb4)],
    crystal: toon(0x80e4d9, {emissive: 0x216e76, emissiveIntensity: .38}),
    lilacCrystal: toon(0xc3adfa, {emissive: 0x4c326f, emissiveIntensity: .3}),
    mushroom: toon(0xe784ae), mushroomStem: toon(0xffe2b7),
    crystalSoil: toon(0x9aaf9d, {side: THREE.DoubleSide}),
    mushroomSoil: toon(0x7daf93, {side: THREE.DoubleSide})
  };
  function rand(){seedHash=(seedHash*1664525+1013904223)>>>0;return seedHash/4294967296}
  function meshWithOutline(root, scale=1.035){root.traverse(mesh=>{if(!mesh.isMesh||mesh.userData.outline||mesh.userData.isOutline)return;const hull=new THREE.Mesh(mesh.geometry.clone(),outlineMat);hull.userData.isOutline=true;hull.scale.setScalar(scale);hull.renderOrder=mesh.renderOrder-1;hull.name='inverted-hull';mesh.add(hull);mesh.userData.outline=hull;outlines.push(hull)});return root}
  function makeTree(x,z,pine=false){const g=new THREE.Group();const y=terrainHeight(x,z);g.position.set(x,y,z);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(pine?.22:.28,pine?.34:.42,pine?2.7:2.2,8),mats.trunk);trunk.position.y=1.1;trunk.castShadow=true;g.add(trunk);if(pine){for(let i=0;i<3;i++){const cone=new THREE.Mesh(new THREE.ConeGeometry(1.55-i*.27,2.35-i*.4,8),mats.pine);cone.position.y=2.15+i*.75;cone.castShadow=true;g.add(cone)}}else{const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.65,1),mats.leaf);crown.scale.set(1.1,.95,1);crown.position.y=2.55;crown.castShadow=true;g.add(crown);const crown2=new THREE.Mesh(new THREE.IcosahedronGeometry(1.05,1),mats.leaf);crown2.position.set(.65,3.15,.18);crown2.castShadow=true;g.add(crown2)}meshWithOutline(g,1.045);scene.add(g);props.push(g);return g}
  function makeRock(x,z){const g=new THREE.Group();g.position.set(x,terrainHeight(x,z),z);const r=new THREE.Mesh(new THREE.IcosahedronGeometry(.65+rand()*.45,1),mats.rock);r.scale.y=.6;r.rotation.set(rand(),rand(),rand());r.castShadow=true;g.add(r);meshWithOutline(g,1.07);scene.add(g);props.push(g);return g}
  function makeCloud(x,y,z,s){const g=new THREE.Group();g.position.set(x,y,z);for(let i=0;i<4;i++){const p=new THREE.Mesh(new THREE.DodecahedronGeometry(s*(.6+rand()*.35),1),mats.cloud);p.position.set((i-1.5)*s*.7,rand()*s*.3,Math.sin(i)*s*.35);g.add(p)}g.userData.baseX=x;g.userData.speed=.5+rand();scene.add(g);dynamic.push(g);return g}
  function makeFlower(x,z,kind='resource'){const g=new THREE.Group();g.position.set(x,terrainHeight(x,z),z);const stem=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.45,6),mats.trunk);stem.position.y=.22;g.add(stem);for(let i=0;i<5;i++){const petal=new THREE.Mesh(new THREE.SphereGeometry(.17,7,5),kind==='plant'?mats.flower:mats.seed);petal.scale.set(.8,.45,1);petal.position.set(Math.cos(i*TAU/5)*.16,.48,Math.sin(i*TAU/5)*.16);g.add(petal)}const center=new THREE.Mesh(new THREE.SphereGeometry(.13,7,5),mats.flower);center.position.y=.48;g.add(center);g.userData.kind=kind;meshWithOutline(g,1.12);scene.add(g);return g}
  function addProp(group, groundOffset = 0) {
    group.userData.fantasyGround = groundOffset;
    scene.add(group);
    props.push(group);
    return group;
  }
  function fantasyMesh(group, geometry, material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }
  function fantasyGlow(group, geometry, color, x, y, z, phase = 0) {
    const material = toon(color, {emissive: color, emissiveIntensity: .15});
    const mesh = fantasyMesh(group, geometry, material, x, y, z);
    lanterns.push({mesh, material, phase});
    return mesh;
  }
  function makeCrystal(x, z, scale = 1, lilac = false) {
    const group = new THREE.Group();
    group.position.set(x, terrainHeight(x, z), z);
    for (let i = 0; i < 4; i++) {
      const height = (1.35 + rand() * 2.2) * scale;
      const crystal = fantasyMesh(group,
        new THREE.CylinderGeometry(.035, (.35 + rand() * .12) * scale, height, 5),
        lilac ? fantasyPalette.lilacCrystal : fantasyPalette.crystal,
        (i - 1.5) * .48 * scale, height * .49, (rand() - .5) * .8 * scale);
      crystal.rotation.set((rand() - .5) * .24, rand() * TAU, (rand() - .5) * .3);
    }
    meshWithOutline(group, 1.025);
    return addProp(group);
  }
  function makeMushroom(x, z, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, terrainHeight(x, z), z);
    fantasyMesh(group, new THREE.CylinderGeometry(.18 * scale, .32 * scale, 1.65 * scale, 7),
      fantasyPalette.mushroomStem, 0, .81 * scale, 0);
    const cap = fantasyMesh(group, new THREE.SphereGeometry(.94 * scale, 11, 7),
      fantasyPalette.mushroom, 0, 1.64 * scale, 0);
    cap.scale.y = .43;
    const skirt = fantasyGlow(group, new THREE.TorusGeometry(.61 * scale, .07 * scale, 5, 12),
      0xffd993, 0, 1.43 * scale, 0, rand() * TAU);
    skirt.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      const a = i * TAU / 3 + .5;
      const dot = fantasyMesh(group, new THREE.SphereGeometry(.14 * scale, 6, 4),
        fantasyPalette.mushroomStem, Math.cos(a) * .49 * scale,
        1.94 * scale, Math.sin(a) * .49 * scale);
      dot.scale.y = .32;
    }
    meshWithOutline(group, 1.02);
    return addProp(group);
  }
  function makeHouse(x, z, angle, variant) {
    const group = new THREE.Group();
    group.position.set(x, terrainHeight(x, z), z); group.rotation.y = angle;
    const wall = fantasyPalette.walls[variant % 3], roof = fantasyPalette.roofs[variant % 3];
    fantasyMesh(group, new THREE.CylinderGeometry(1.57, 1.68, 1.15, 10),
      fantasyPalette.paleStone, 0, -.26, 0);
    fantasyMesh(group, new THREE.CylinderGeometry(1.42, 1.56, 1.9, 12), wall, 0, .95, 0);
    if (variant % 2) {
      const dome = fantasyMesh(group, new THREE.SphereGeometry(1.8, 12, 8), roof, 0, 2.0, 0);
      dome.scale.y = .56;
      fantasyMesh(group, new THREE.ConeGeometry(.23, .65, 7), fantasyPalette.gold, 0, 3.13, 0);
    } else {
      fantasyMesh(group, new THREE.ConeGeometry(1.94, 1.58, 10), roof, 0, 2.56, 0);
      fantasyMesh(group, new THREE.SphereGeometry(.13, 6, 5), fantasyPalette.gold, 0, 3.43, 0);
    }
    const door = fantasyMesh(group, new THREE.CapsuleGeometry(.3, .52, 4, 8),
      fantasyPalette.ink, 0, .56, 1.48);
    door.scale.z = .12;
    for (const side of [-1, 1]) {
      const window = fantasyGlow(group, new THREE.SphereGeometry(.29, 8, 6),
        0xffdb8f, side * .83, 1.17, 1.25, variant * .6);
      window.scale.set(1, 1, .18); window.rotation.y = side * .55;
    }
    const chimney = fantasyMesh(group, new THREE.CylinderGeometry(.16, .2, .75, 7),
      fantasyPalette.stone, -.85, 2.7, -.35);
    chimney.rotation.z = -.06;
    meshWithOutline(group, 1.022);
    group.userData.townBuilding = true;
    fantasyBuildings.push({group, x, z, radius: 1.66, height: 3.55, kind: 'house'});
    return addProp(group);
  }
  function makeLantern(x, z, variant = 0) {
    const group = new THREE.Group();
    group.position.set(x, terrainHeight(x, z), z);
    fantasyMesh(group, new THREE.CylinderGeometry(.065, .12, 2.05, 6),
      fantasyPalette.ink, 0, 1.03, 0);
    fantasyGlow(group, new THREE.SphereGeometry(.22, 8, 6), 0xffd278, 0, 2.12, 0, variant);
    fantasyMesh(group, new THREE.ConeGeometry(.36, .28, 7),
      fantasyPalette.roofs[variant % 3], 0, 2.43, 0);
    meshWithOutline(group, 1.025);
    return addProp(group);
  }
  function makeResident(index) {
    const group = new THREE.Group(), phase = index * TAU / 3;
    fantasyMesh(group, new THREE.CapsuleGeometry(.3, .43, 4, 8),
      fantasyPalette.roofs[index], 0, .56, 0);
    fantasyMesh(group, new THREE.SphereGeometry(.28, 9, 6), mats.wall, 0, 1.15, 0);
    fantasyMesh(group, new THREE.ConeGeometry(.4, .44, 8),
      fantasyPalette.gold, 0, 1.5, 0);
    for (const side of [-1, 1]) {
      fantasyMesh(group, new THREE.SphereGeometry(.034, 5, 4),
        fantasyPalette.ink, side * .09, 1.18, .258);
    }
    group.position.set(9 + Math.cos(phase) * 2.8, 0, 5 + Math.sin(phase) * 2.8);
    group.position.y = terrainHeight(group.position.x, group.position.z);
    meshWithOutline(group, 1.025); addProp(group);
    residents.push({group, phase, speed: .13 + index * .028});
  }