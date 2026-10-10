import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {GLTFExporter} from './vendor/GLTFExporter.js';
const $=id=>document.getElementById(id);let seed=47;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}const P=(x,z)=>[(x-600)*.12,(z-720)*.12];
const scene=new THREE.Scene();scene.background=new THREE.Color('#bbced0');scene.fog=new THREE.Fog('#bbced0',180,650);const model=new THREE.Group();model.name='参考规划_米制概念模型';scene.add(model);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.25,1000);camera.position.set(108,108,150);const renderer=new THREE.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true,preserveDrawingBuffer:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;$('scene').appendChild(renderer.domElement);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(5,0,-3);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.493;controls.minDistance=4;controls.maxDistance=420;controls.update();
const hemi=new THREE.HemisphereLight('#daeaff','#5c6940',2.1);scene.add(hemi);const sun=new THREE.DirectionalLight('#fff0cc',3.4);sun.position.set(-90,125,45);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-145,right:145,top:145,bottom:-145,near:1,far:450});sun.shadow.bias=-.0004;sun.shadow.normalBias=.12;scene.add(sun);
function material(color,extra={}){return new THREE.MeshStandardMaterial({color,roughness:.92,...extra})}const mats={plaster:material('#e5decb'),wood:material('#5c4635'),metal:material('#43504b',{metalness:.5,roughness:.4}),glass:material('#758c93',{metalness:.45,roughness:.18}),tile:material('#875746'),bark:material('#9c9777'),leaf:material('#4d7840',{side:THREE.DoubleSide}),concrete:material('#b6b4a6'),white:material('#e6e4d2')};
function noiseTex(a,b,size=256){let c=document.createElement('canvas');c.width=c.height=size;let ctx=c.getContext('2d');ctx.fillStyle=a;ctx.fillRect(0,0,size,size);for(let i=0;i<18000;i++){ctx.globalAlpha=.04+rand()*.13;ctx.fillStyle=rand()>.5?b:a;ctx.fillRect(rand()*size,rand()*size,rand()*2+1,rand()*2+1)}let t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(100,100);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.colorSpace=THREE.SRGBColorSpace;return t}
let grassTex=noiseTex('#71834e','#3c5634');let grassMat=material('#adb889',{map:grassTex});let asphaltTex=noiseTex('#737770','#363c39');asphaltTex.repeat.set(2,16);let roadMat=material('#b7b6a1',{map:asphaltTex});
function box(w,h,d,x,y,z,mat,parent=model){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
function poly(points,mat,y=.025,parent=model){let shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();let geometry=new THREE.ShapeGeometry(shape);if(mat.map===grassTex){const position=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<position.count;i++)uv.setXY(i,position.getX(i)/1600+.5,position.getY(i)/1600+.5)}let mesh=new THREE.Mesh(geometry,mat);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.receiveShadow=true;parent.add(mesh);return mesh}
let ground=new THREE.Mesh(new THREE.PlaneGeometry(1600,1600),grassMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);const land=[P(23,1330),P(1060,30),P(1070,1145)];poly(land,material('#8f9b5d',{map:grassTex}));const upper=[P(570,610),P(1060,30),P(1065,625)];poly(upper,material('#798b4c',{map:grassTex}),.04);poly([P(23,1330),P(385,830),P(334,1270)],material('#b8b19a',{map:grassTex}),.05);poly([P(335,1270),P(533,875),P(1067,881),P(1070,1145)],material('#a3aa69',{map:grassTex}),.045);
// Separate road intersection surfaces physically; offsets survive GLB export.
let roadSurfaceIndex=0;const roads=[];function road(points,width){let pp=points.map(p=>P(...p));roads.push({points:pp,width});for(let i=0;i<pp.length-1;i++){let [x,z]=pp[i],[xx,zz]=pp[i+1],length=Math.hypot(xx-x,zz-z);const lift=roadSurfaceIndex++*.002;let m=box(width,.07,length+.2,(x+xx)/2,.085+lift,(z+zz)/2,roadMat);m.rotation.y=Math.atan2(xx-x,zz-z);let edge=box(.13,.1,length,(x+xx)/2,.12+lift,(z+zz)/2,mats.concrete);edge.rotation.y=m.rotation.y;edge.position.x+=Math.cos(m.rotation.y)*(width/2);edge.position.z-=Math.sin(m.rotation.y)*(width/2);let edge2=edge.clone();edge2.position.x-=Math.cos(m.rotation.y)*width;edge2.position.z+=Math.sin(m.rotation.y)*width;model.add(edge2)}}
road([[467,1280],[449,1238],[477,1150]],6);road([[477,1150],[478,735],[535,666]],4);road([[478,854],[1067,858]],4);road([[840,854],[843,620],[848,425]],3);road([[848,425],[1060,169],[1060,62]],3);road([[745,420],[1056,426]],2);
function nearRoad(x,z,margin=1){return roads.some(r=>r.points.slice(1).some((b,i)=>{let a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<r.width/2+margin}))}
function inside(x,z,points=land){let result=false;for(let i=0,j=points.length-1;i<points.length;j=i++){let a=points[i],b=points[j];if(((a[1]>z)!=(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]))result=!result}return result}
const boundaryGroup=new THREE.Group();model.add(boundaryGroup);function line3(points,color,y=.2,parent=boundaryGroup){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],y,p[1])));let l=new THREE.Line(g,new THREE.LineBasicMaterial({color}));parent.add(l);return l}line3([...land,land[0]],'#bf7954');
// Fine wire perimeter fence, with an entrance left open.
for(let i=0;i<3;i++){let a=land[i],b=land[(i+1)%3],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/4);for(let j=0;j<=n;j++){let t=j/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(i===2&&x>-21&&x<-11)continue;box(.09,1.25,.09,x,.625,z,mats.metal,boundaryGroup)}for(let h of [.45,.85,1.2])line3([a,b],'#727969',h,boundaryGroup)}
// Instanced areca trunks and organic fronds, including slender leaflets.
let palms=[];for(let py=90;py<612;py+=32){for(let px=570;px<1060;px+=32){let [x,z]=P(px+(rand()-.5)*6,py+(rand()-.5)*6);if(inside(x,z,upper)&&!nearRoad(x,z,1.6))palms.push({x,z,h:7+rand()*3,rot:rand()*Math.PI*2})}}
// Central planting area: planted rows rather than an empty diagram.
for(let py=650;py<815;py+=44)for(let px=570;px<1040;px+=44){let [x,z]=P(px,py);if(inside(x,z)&&!nearRoad(x,z,2.4))palms.push({x,z,h:5.4+rand()*2.5,rot:rand()*6.28})}
const dummy=new THREE.Object3D();let trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.1,.18,1,9),mats.bark,palms.length);trunk.castShadow=trunk.receiveShadow=true;model.add(trunk);palms.forEach((p,i)=>{dummy.position.set(p.x,p.h/2,p.z);dummy.rotation.set(0,p.rot,.025);dummy.scale.set(1,p.h,1);dummy.updateMatrix();trunk.setMatrixAt(i,dummy.matrix)});
function frondGeo(){let pos=[],uv=[],idx=[];let n=16;for(let i=0;i<=n;i++){let t=i/n,r=t*3.7,h=Math.sin(t*Math.PI)*.5-t*t*.85;let w=Math.sin(t*Math.PI)*.55;pos.push(r,h,-w,r,h,w);uv.push(t,0,t,1);if(i<n){let k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}}let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
let leafCanvas=document.createElement('canvas');leafCanvas.width=256;leafCanvas.height=128;let lc=leafCanvas.getContext('2d');lc.clearRect(0,0,256,128);lc.fillStyle='#ffffff';lc.fillRect(0,61,256,6);for(let i=2;i<45;i++){let x=i*5.5,w=Math.sin(x/256*Math.PI)*59;lc.beginPath();lc.moveTo(x-8,64);lc.lineTo(x+13,64-w);lc.lineTo(x+19,64-w);lc.lineTo(x+5,64);lc.closePath();lc.fill();lc.beginPath();lc.moveTo(x-8,64);lc.lineTo(x+13,64+w);lc.lineTo(x+19,64+w);lc.lineTo(x+5,64);lc.fill()}let alpha=new THREE.CanvasTexture(leafCanvas);let leafMat=material('#598049',{alphaMap:alpha,alphaTest:.4,alphaToCoverage:true,side:THREE.DoubleSide});const fronds=new THREE.InstancedMesh(frondGeo(),leafMat,palms.length*10);fronds.castShadow=true;fronds.receiveShadow=false;model.add(fronds);palms.forEach((p,i)=>{for(let j=0;j<10;j++){dummy.position.set(p.x,p.h-.3+(j%3)*.12,p.z);dummy.rotation.set(0,p.rot+j*Math.PI*.2, .08+(j%3)*.14);let s=.7+(p.h-5)*.065;dummy.scale.set(s,s,s);dummy.updateMatrix();fronds.setMatrixAt(i*10+j,dummy.matrix)}});
// Ring scars on visible palm trunks.
const scars=new THREE.InstancedMesh(new THREE.TorusGeometry(.145,.009,3,9),material('#706f55'),palms.length*9);model.add(scars);palms.forEach((p,i)=>{for(let j=0;j<9;j++){dummy.position.set(p.x,.7+j*.58,p.z);dummy.rotation.set(Math.PI/2,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();scars.setMatrixAt(i*9+j,dummy.matrix)}});
// Short grass blades with distance-friendly instancing.
let bladeGeo=new THREE.BufferGeometry();bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.045,0,0,.045,0,0,.02,.28,0],3));bladeGeo.computeVertexNormals();const blade=new THREE.InstancedMesh(bladeGeo,material('#60743c',{side:THREE.DoubleSide,alphaToCoverage:true}),11000);let count=0;for(let i=0;i<17000&&count<11000;i++){let x=-70+rand()*135,z=-85+rand()*160;if(!inside(x,z)||nearRoad(x,z,.5)|| (x<-22&&z>26))continue;dummy.position.set(x,.07,z);dummy.rotation.set(0,rand()*6.28,0);dummy.scale.set(1,.4+rand()*1.1,1);dummy.updateMatrix();blade.setMatrixAt(count++,dummy.matrix)}blade.count=count;model.add(blade);
// Six single-storey container homes, arranged as C relative to the reference plan.
const collisions=[],containerLayout=[];
const housingStart=model.children.length;
let [hx,hz]=P(260,1132);
const containerMat=material('#d9ddd3',{metalness:.35,roughness:.62});
const frameMat=material('#465b51',{metalness:.55,roughness:.42});
function containerHome(name,x,z,rotation=0,inward=1){
 const w=6.06,d=2.44,h=2.9,base=.26;
 const group=new THREE.Group();group.name=name;group.position.set(x,0,z);group.rotation.y=rotation;model.add(group);
 containerLayout.push({name,x,z,w:rotation?d:w,d:rotation?w:d,rotation});collisions.push({x,z,w:(rotation?d:w)+.12,d:(rotation?w:d)+.12});
 box(w+.12,.18,d+.12,0,.12,0,mats.concrete,group);
 box(w,h,d,0,base+h/2,0,containerMat,group);
 // Flat roof and structural corner posts preserve the shipping-container silhouette.
 box(w+.12,.1,d+.12,0,base+h+.05,0,frameMat,group);
 for(let a of [-1,1])for(let b of [-1,1])box(.13,h+.08,.13,a*(w/2-.045),base+h/2,b*(d/2-.045),frameMat,group);
 for(let s of [-1,1]){
  box(w,.1,.09,0,base+.05,s*(d/2+.02),frameMat,group);
  box(w,.1,.09,0,base+h-.05,s*(d/2+.02),frameMat,group);
  for(let k=-w/2+.22;k<w/2-.14;k+=.19)box(.035,h-.26,.045,k,base+h/2,s*(d/2+.02),containerMat,group);
 }
 // Windows and door face the shared courtyard.
 let front=inward*(d/2+.055);
 for(let wx of [-1.65,1.5]){
  box(1.42,1.32,.095,wx,1.9,front,frameMat,group);
  box(1.27,1.17,.12,wx,1.9,front+inward*.035,mats.glass,group);
  box(.05,1.2,.13,wx,1.9,front+inward*.09,mats.white,group);
  box(1.54,.07,.25,wx,1.21,front+inward*.09,frameMat,group);
 }
 box(.95,2.24,.11,-.18,base+1.12,front,frameMat,group);
 box(.74,1.42,.12,-.18,base+1.5,front+inward*.035,mats.glass,group);
 box(.07,.16,.08,.13,1.3,front+inward*.13,mats.metal,group);
 box(1.25,.13,.52,-.18,.14,front+inward*.34,mats.concrete,group);
 box(w-.3,.07,.65,0,base+h-.28,front+inward*.27,frameMat,group);
 // Rear service door and roof ventilation.
 box(.75,1.3,.07,0,1.15,-front,containerMat,group);
 box(.9,.32,.62,1.5,base+h+.24,0,mats.white,group);
 for(let k=0;k<5;k++)box(.025,.025,.5,1.18+k*.15,base+h+.415,0,mats.metal,group);
 return group;
}
// Top: 2; left: 1; bottom: 3. Opening is toward plan-right (+X).
const leftX=-44.8,firstX=leftX+3.03,step=6.31,topZ=44.3,bottomZ=54.7;
containerHome('集装箱房_上排01',firstX,topZ,0,1);
containerHome('集装箱房_上排02',firstX+step,topZ,0,1);
containerHome('集装箱房_左侧01',leftX+1.22,49.5,Math.PI/2,1);
containerHome('集装箱房_下排01',firstX,bottomZ,0,-1);
containerHome('集装箱房_下排02',firstX+step,bottomZ,0,-1);
containerHome('集装箱房_下排03',firstX+step*2,bottomZ,0,-1);
// Shared courtyard and approach to the opening.
poly([[leftX-.3,topZ-1.5],[firstX+step*2+3.35,topZ-1.5],[firstX+step*2+3.35,bottomZ+1.6],[leftX-.3,bottomZ+1.6]],material('#b8b8a5'),.075);

box(3.8,.15,2.1,hx+3,1.1,hz,mats.wood);for(let a of [-1,1])for(let b of [-1,1])box(.12,1.1,.12,hx+3+a*1.7,.55,hz+b*.8,mats.wood);for(let side of [-1,1])box(4,.2,.6,hx+3,.65,hz+side*1.6,mats.wood);
// Align housing to the lower fence and maintain 1.5 m clear between outer rear wall and fence face.
const fenceSlope=(land[2][1]-land[0][1])/(land[2][0]-land[0][0]);
const fenceIntercept=land[0][1]-fenceSlope*land[0][0];
const housingAngle=Math.atan(-fenceSlope),co=Math.cos(housingAngle),si=Math.sin(housingAngle);
const housingAnchor={x:-50,z:fenceSlope*(-50)+fenceIntercept-(1.5+1.31+.045)*Math.hypot(1,fenceSlope)};
function housingPoint(x,z){let dx=x-firstX,dz=z-bottomZ;return [housingAnchor.x+co*dx+si*dz,housingAnchor.z-si*dx+co*dz]}
const housingTransform=new THREE.Matrix4().makeTranslation(housingAnchor.x,0,housingAnchor.z).multiply(new THREE.Matrix4().makeRotationY(housingAngle)).multiply(new THREE.Matrix4().makeTranslation(-firstX,0,-bottomZ));
model.children.slice(housingStart).forEach(child=>child.applyMatrix4(housingTransform));
containerLayout.forEach(c=>{[c.x,c.z]=housingPoint(c.x,c.z);c.angle=housingAngle});
collisions.forEach(c=>{[c.x,c.z]=housingPoint(c.x,c.z);c.angle=housingAngle});
[hx,hz]=housingPoint(hx,hz);
road([[333,1203],[425,1237],[467,1228]],3);
// Paved passage parallel to the lower perimeter; no vehicle or furniture occupies it.
const passageStartX=-54,passageEndX=-30;
const normal=new THREE.Vector2(-fenceSlope,1).normalize();
const inset=(x,d)=>[x-normal.x*d,fenceSlope*x+fenceIntercept-normal.y*d];
const passagePoints=[inset(passageStartX,.045),inset(passageEndX,.045),inset(passageEndX,1.545),inset(passageStartX,1.545)];
const passage=poly(passagePoints,material('#cec7b4'),.11);passage.name='下方围栏_1.5米净宽步行通道';
// Dimension annotation shows fence-face to the outermost rear service-door surface.
const dimensionX=-40,dimensionA=inset(dimensionX,.045),dimensionB=inset(dimensionX,1.545);
const dimensionGroup=new THREE.Group();scene.add(dimensionGroup);
line3([dimensionA,dimensionB],'#f4eac7',.23,dimensionGroup);
for(let pt of [dimensionA,dimensionB])line3([[pt[0]-.28,pt[1]-.05],[pt[0]+.28,pt[1]+.05]],'#f4eac7',.23,dimensionGroup);
// Orchard in the selected wedge between the housing and the main road.
const orchardArea=[[-24,20],[-17,12],[-17,49],[-42,49],[-38,39]];
poly(orchardArea,material('#879350',{map:grassTex}),.055);
const orchardTrees=[],orchardGroup=new THREE.Group();orchardGroup.name='住宅上方_概念果园';model.add(orchardGroup);
const orchardLeaf=[material('#426e32'),material('#557a3c'),material('#658c42')];
const fruitMat=material('#e5a243',{roughness:.7});
const branchGeo=new THREE.CylinderGeometry(.055,.10,1,7),crownGeo=new THREE.IcosahedronGeometry(1,2),fruitGeo=new THREE.SphereGeometry(.115,8,6);
function branchBetween(a,b,parent){let v=new THREE.Vector3().subVectors(b,a);let branch=new THREE.Mesh(branchGeo,mats.wood);branch.position.copy(a).add(b).multiplyScalar(.5);branch.scale.y=v.length();branch.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());branch.castShadow=true;parent.add(branch)}
for(let z=23;z<=48;z+=5.6)for(let x=-40;x<=-20;x+=5.6){if(!inside(x,z,orchardArea)||!inside(x,z)||nearRoad(x,z,3))continue;
 const g=new THREE.Group();g.position.set(x,0,z);g.name='果树_'+(orchardTrees.length+1);orchardGroup.add(g);orchardTrees.push({x,z,h:4.4});
 const bed=new THREE.Mesh(new THREE.CircleGeometry(1.35,24),material('#77694b'));bed.rotation.x=-Math.PI/2;bed.position.y=.085;bed.receiveShadow=true;g.add(bed);
 let stem=new THREE.Mesh(new THREE.CylinderGeometry(.13,.22,2.6,10),mats.wood);stem.position.y=1.3;stem.castShadow=true;g.add(stem);
 for(let j=0;j<5;j++){let angle=j*Math.PI*2/5,xx=Math.cos(angle)*1.08,zz=Math.sin(angle)*1.08;
 branchBetween(new THREE.Vector3(0,1.8,0),new THREE.Vector3(xx,3.15,zz),g);
 let crown=new THREE.Mesh(crownGeo,orchardLeaf[j%3]);crown.position.set(xx,3.45+(j%2)*.3,zz);crown.scale.set(1.3,1.18,1.3);crown.rotation.set(rand()*.3,rand()*6.28,rand()*.2);crown.castShadow=crown.receiveShadow=true;g.add(crown);
 for(let k=0;k<8;k++){let a=rand()*Math.PI*2,b=(rand()-.5)*1.8;let f=new THREE.Mesh(fruitGeo,fruitMat);f.position.set(xx+Math.cos(a)*1.17,3.35+b*.8,zz+Math.sin(a)*1.17);g.add(f)}
 }
 let top=new THREE.Mesh(crownGeo,orchardLeaf[1]);top.position.y=4.1;top.scale.set(1.2,.9,1.2);top.castShadow=true;g.add(top);
}
// Relocate one overlapping fruit tree to the orchard's upper end.
const movedFruitIndex=orchardTrees.findIndex(t=>Math.abs(t.x+40)<.01&&Math.abs(t.z-45.4)<.01);
if(movedFruitIndex>=0){orchardTrees[movedFruitIndex].x=-20.5;orchardTrees[movedFruitIndex].z=17.8;orchardGroup.children[movedFruitIndex].position.set(-20.5,0,17.8);}
// Irrigation facilities relocated to the selected gap between carport and upper containers.
const irrigationGroup=new THREE.Group();irrigationGroup.name='果园灌溉_水井与泵房';model.add(irrigationGroup);
const irrigation={well:{x:-46.6,z:52.7,r:.75},house:{x:-49.7,z:53.1,w:3,d:2.4,h:2.65}};
const pumpBlue=material('#35749b',{metalness:.45,roughness:.4}),pipeBlue=material('#3885a0',{metalness:.3,roughness:.55}),brickMat=material('#b1aaa0'),pipeBlack=material('#34443e');
function cylinder(r1,r2,h,x,y,z,mat,parent=irrigationGroup){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,24),mat);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh}
function pipe(a,b,r=.055,mat=pipeBlue){let av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);let mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),10),mat);mesh.position.copy(av).add(bv).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());mesh.castShadow=true;irrigationGroup.add(mesh);return mesh}
const well=irrigation.well,ph=irrigation.house;
box(2.05,.16,2.05,well.x,.12,well.z,mats.concrete,irrigationGroup);
// Raised ring and sealed inspection lid for a compact irrigation borewell.
cylinder(.75,.8,.72,well.x,.55,well.z,brickMat);
for(let h of [.29,.47,.65,.83]){let ring=new THREE.Mesh(new THREE.TorusGeometry(.755,.013,5,32),mats.concrete);ring.rotation.x=Math.PI/2;ring.position.set(well.x,h,well.z);irrigationGroup.add(ring)}
cylinder(.77,.77,.09,well.x,.955,well.z,mats.metal);
cylinder(.28,.28,.035,well.x,.998,well.z,mats.concrete);
box(.28,.045,.045,well.x,1.035,well.z,mats.metal,irrigationGroup);
pipe([well.x,.95,well.z],[well.x,1.24,well.z]);pipe([well.x,1.24,well.z],[ph.x-.65,1.24,ph.z]);
// Valve hand wheel beside the well.
let wheel=new THREE.Mesh(new THREE.TorusGeometry(.16,.025,6,16),material('#ad5b3a'));wheel.position.set(well.x+.65,1.44,well.z);wheel.rotation.x=Math.PI/2;irrigationGroup.add(wheel);pipe([well.x+.65,1.24,well.z],[well.x+.65,1.44,well.z],.035,mats.metal);
box(ph.w+.5,.2,ph.d+.5,ph.x,.15,ph.z,mats.concrete,irrigationGroup);
box(ph.w,ph.h,.14,ph.x,ph.h/2+.25,ph.z-ph.d/2,mats.plaster,irrigationGroup);
for(let side of [-1,1])box(.14,ph.h,ph.d,ph.x+side*ph.w/2,ph.h/2+.25,ph.z,mats.plaster,irrigationGroup);
box(ph.w+.32,.14,ph.d+.36,ph.x,ph.h+.32,ph.z,frameMat,irrigationGroup);
box(ph.w,.23,.14,ph.x,ph.h+.10,ph.z+ph.d/2,frameMat,irrigationGroup);
// Front grille permits a view of the modeled pump and pressure vessel.
box(1.05,2.28,.1,ph.x+.9,1.4,ph.z+ph.d/2,mats.metal,irrigationGroup);
box(.08,.12,.08,ph.x+.58,1.35,ph.z+ph.d/2+.1,mats.white,irrigationGroup);
for(let i=0;i<11;i++)box(.027,2.1,.04,ph.x-1.34+i*.18,1.36,ph.z+ph.d/2,mats.metal,irrigationGroup);
box(1.97,.06,.04,ph.x-.41,.75,ph.z+ph.d/2,mats.metal,irrigationGroup);
box(1.97,.06,.04,ph.x-.41,2.0,ph.z+ph.d/2,mats.metal,irrigationGroup);
box(1.95,.1,.28,ph.x-.42,.28,ph.z+ph.d/2+.1,mats.concrete,irrigationGroup);
// Pump, electric motor, pressure tank, gauge and service cabinet.
box(1.5,.22,.8,ph.x-.35,.36,ph.z+.1,mats.concrete,irrigationGroup);
let pump=cylinder(.24,.24,.65,ph.x-.48,.72,ph.z+.1,pumpBlue);pump.rotation.z=Math.PI/2;
let motor=cylinder(.22,.22,.55,ph.x+.14,.72,ph.z+.1,mats.metal);motor.rotation.z=Math.PI/2;
for(let k=0;k<6;k++)box(.024,.38,.37,ph.x-.04+k*.065,.72,ph.z+.1,mats.metal,irrigationGroup);
cylinder(.27,.27,1.18,ph.x-.88,.89,ph.z-.62,pumpBlue);
let cap=new THREE.Mesh(new THREE.SphereGeometry(.27,16,8),pumpBlue);cap.position.set(ph.x-.88,1.47,ph.z-.62);cap.scale.y=.6;irrigationGroup.add(cap);
pipe([ph.x-.65,1.24,ph.z],[ph.x-.65,.72,ph.z+.1]);
pipe([ph.x-.4,.72,ph.z+.1],[ph.x-.4,.28,ph.z+.1]);pipe([ph.x-.4,.28,ph.z+.1],[ph.x+1.8,.28,ph.z+.1]);
let gauge=cylinder(.105,.105,.055,ph.x-.58,1.36,ph.z+.1,mats.white);gauge.rotation.x=Math.PI/2;
box(.4,.56,.12,ph.x+.9,1.45,ph.z-ph.d/2+.12,mats.metal,irrigationGroup);
// One main feed and thin drip laterals to each planted row.
const mainX=-19.5;
pipe([ph.x+1.8,.28,ph.z+.1],[ph.x+1.8,-.2,ph.z+.1]);pipe([ph.x+1.8,-.2,ph.z+.1],[mainX,-.2,ph.z+.1]);pipe([mainX,-.2,ph.z+.1],[mainX,-.2,51.0]);pipe([mainX,-.2,51.0],[mainX,-.2,47.5]);pipe([mainX,-.2,47.5],[mainX,.14,47.1]);pipe([mainX,.14,47.1],[mainX,.14,17.8]);
const rowZ=[...new Set(orchardTrees.map(t=>t.z))];
rowZ.forEach(z=>{const row=orchardTrees.filter(t=>t.z===z),xmin=Math.min(mainX,...row.map(t=>t.x)),xmax=Math.max(mainX,...row.map(t=>t.x));pipe([xmin,.13,z],[xmax,.13,z],.025,pipeBlack);row.forEach(t=>{let loop=new THREE.Mesh(new THREE.TorusGeometry(.6,.022,5,24),pipeBlack);loop.rotation.x=Math.PI/2;loop.position.set(t.x,.13,t.z);irrigationGroup.add(loop)})});
collisions.push({x:ph.x,z:ph.z,w:ph.w+.25,d:ph.d+.25,angle:0},{x:well.x,z:well.z,w:1.7,d:1.7,angle:0});
// Native model signage, retained in GLB exports.
let signCanvas=document.createElement('canvas');signCanvas.width=384;signCanvas.height=96;let signCtx=signCanvas.getContext('2d');signCtx.fillStyle='#e8eee2';signCtx.fillRect(0,0,384,96);signCtx.fillStyle='#355a46';signCtx.font='500 36px PingFang SC, sans-serif';signCtx.textAlign='center';signCtx.fillText('果园灌溉泵房',192,60);let signTexture=new THREE.CanvasTexture(signCanvas);signTexture.colorSpace=THREE.SRGBColorSpace;let sign=new THREE.Mesh(new THREE.PlaneGeometry(1.7,.43),new THREE.MeshStandardMaterial({map:signTexture,roughness:.85}));sign.position.set(ph.x,2.76,ph.z+ph.d/2+.081);irrigationGroup.add(sign);
// Two broad-canopy shade trees in the marked southwest pocket.
const shadeTrees=[{x:-61,z:65,r:3.7},{x:-57.5,z:69.5,r:3.7},{x:-31.5,z:62.4,r:3.7},{x:-38.4,z:56.6,r:3.7}];
const shadeGroup=new THREE.Group();shadeGroup.name='生活区_四棵遮阴树';model.add(shadeGroup);
const shadeLeaves=[material('#3f6837'),material('#517b42'),material('#5e8749')];
shadeTrees.forEach((t,i)=>{let tree=new THREE.Group();tree.name='遮阴树_'+(i+1);tree.position.set(t.x,0,t.z);shadeGroup.add(tree);
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.40,4.7,12),mats.wood);trunk.position.y=2.35;trunk.castShadow=true;tree.add(trunk);
 for(let j=0;j<7;j++){let a=j*Math.PI*2/7,xx=Math.cos(a)*2.05,zz=Math.sin(a)*2.05;branchBetween(new THREE.Vector3(0,2.7,0),new THREE.Vector3(xx,5.3,zz),tree);let crown=new THREE.Mesh(crownGeo,shadeLeaves[j%3]);crown.position.set(xx,5.7+(j%3)*.25,zz);crown.scale.set(2.15,1.75,2.15);crown.rotation.y=j; crown.castShadow=crown.receiveShadow=true;tree.add(crown)}
 let crown=new THREE.Mesh(crownGeo,shadeLeaves[1]);crown.position.y=6.7;crown.scale.set(2.6,1.65,2.6);crown.castShadow=crown.receiveShadow=true;tree.add(crown);
 const bed=new THREE.Mesh(new THREE.CircleGeometry(.95,24),material('#847654'));bed.rotation.x=-Math.PI/2;bed.position.y=.12;bed.receiveShadow=true;tree.add(bed);collisions.push({x:t.x,z:t.z,w:.85,d:.85,angle:0});
});
// Distribution house close to the slanted fence. Routes represent underground cables.
const power={x:-57.1,z:60.4,w:2.6,d:2.0,h:2.7,angle:Math.atan2(156,124.44)};
const powerGroup=new THREE.Group();powerGroup.name='围栏旁_配电房';powerGroup.position.set(power.x,0,power.z);powerGroup.rotation.y=power.angle;model.add(powerGroup);
box(power.w+.3,.2,power.d+.3,0,.15,0,mats.concrete,powerGroup);
box(power.w,power.h,power.d,0,power.h/2+.25,0,mats.plaster,powerGroup);
box(power.w+.3,.15,power.d+.3,0,power.h+.33,0,frameMat,powerGroup);
const cabinetMat=material('#657877',{metalness:.55,roughness:.5});
box(1.6,2.2,.14,-.2,1.37,power.d/2+.06,cabinetMat,powerGroup);
box(.035,2.15,.05,-.2,1.37,power.d/2+.15,mats.metal,powerGroup);
for(let x of [-.34,-.05])box(.04,.25,.05,x,1.43,power.d/2+.17,mats.white,powerGroup);
for(let k=0;k<7;k++)box(1.05,.025,.055,.22,2.07+k*.065,power.d/2+.16,mats.metal,powerGroup);
box(.45,.68,.08,.97,1.35,power.d/2+.055,cabinetMat,powerGroup);
box(.08,.12,.08,.97,1.5,power.d/2+.105,material('#a7c7a1'),powerGroup);
let powerSignCanvas=document.createElement('canvas');powerSignCanvas.width=384;powerSignCanvas.height=96;let ps=powerSignCanvas.getContext('2d');ps.fillStyle='#e8e6d5';ps.fillRect(0,0,384,96);ps.fillStyle='#415448';ps.font='500 42px PingFang SC, sans-serif';ps.textAlign='center';ps.fillText('配电房',192,64);let pst=new THREE.CanvasTexture(powerSignCanvas);pst.colorSpace=THREE.SRGBColorSpace;let powerSign=new THREE.Mesh(new THREE.PlaneGeometry(1.65,.4),new THREE.MeshStandardMaterial({map:pst}));powerSign.position.set(0,2.61,power.d/2+.09);powerGroup.add(powerSign);
// Small lightning plate on the door is part of the model.
const boltShape=new THREE.Shape();boltShape.moveTo(.02,.2);boltShape.lineTo(-.13,-.02);boltShape.lineTo(-.02,-.02);boltShape.lineTo(-.03,-.2);boltShape.lineTo(.13,.06);boltShape.lineTo(.02,.06);boltShape.closePath();let bolt=new THREE.Mesh(new THREE.ShapeGeometry(boltShape),new THREE.MeshBasicMaterial({color:'#ead489'}));bolt.position.set(.28,1.73,power.d/2+.15);powerGroup.add(bolt);
collisions.push({x:power.x,z:power.z,w:power.w+.3,d:power.d+.3,angle:power.angle});
const cableGroup=new THREE.Group();cableGroup.name='地下电缆_路径示意';model.add(cableGroup);const cableRoutes=[];
function cableRoute(name,points){points=points.filter((p,i)=>i===0||Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>.001);if(points.length<2)return;cableRoutes.push({name,points});let curve=new THREE.CurvePath();for(let i=1;i<points.length;i++)curve.add(new THREE.LineCurve3(new THREE.Vector3(points[i-1][0],.18,points[i-1][1]),new THREE.Vector3(points[i][0],.18,points[i][1])));let cable=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(8,points.length*6),.025,6,false),material('#cc9a4d',{emissive:'#9e6d2b',emissiveIntensity:.13}));cable.name=name; cableGroup.add(cable);}
const HP=(x,z)=>housingPoint(x,z);
const sideBusX=leftX-.3,topBusZ=topZ-1.3,bottomBusZ=bottomZ+1.5;
cableRoute('住宅供电主干',[[power.x,power.z],HP(sideBusX,49.5),HP(sideBusX,topBusZ),HP(firstX+step+3.3,topBusZ)]);
cableRoute('下排住宅供电主干',[HP(sideBusX,49.5),HP(sideBusX,bottomBusZ),HP(firstX+step*2+3.3,bottomBusZ)]);
containerLayout.forEach((c,i)=>{const old=i<2?[firstX+i*step,topZ]:i===2?[leftX+1.22,49.5]:[firstX+(i-3)*step,bottomZ];const tap=i<2?HP(old[0],topBusZ):i===2?HP(sideBusX,49.5):HP(old[0],bottomBusZ);cableRoute('集装箱房'+(i+1)+'支线',[tap,[c.x,c.z]]);const g=model.children.find(g=>g.name===c.name);box(.32,.42,.10,0,1.1,i<2?-1.28:1.28,cabinetMat,g)});
cableRoute('泵房供电',[[power.x,power.z],[-54.5,58.5],[ph.x,ph.z+ph.d/2]]);
cableRoute('场地照明供电',[[ph.x,ph.z-ph.d/2],[-16,50.5],[-12,46.8],[-12,25.2],[-12,4.8]]);
for(let py of [760,930,1110]){let [x,z]=P(500,py);cableRoute('路灯'+py+'支线',[[-12,z],[x,z]])}
// Three covered bays fit within the slanted fence pocket; local front faces the access road.
const parking={carport:{x:-43.8,z:47.2,w:8.4,d:5.3,angle:Math.atan2(156,124.44),bays:3},temporary:{x:-24.5,z:54.6,w:8.4,d:6.4,bays:3},access:{width:3,points:[[-14.7,49.2],[-31.5,49.2],[-38,49.2],[-41.73,48.86]]}};
const carportGroup=new THREE.Group();carportGroup.name='围栏内_三车位车棚';carportGroup.position.set(parking.carport.x,0,parking.carport.z);carportGroup.rotation.y=parking.carport.angle;model.add(carportGroup);
const pavementMat=material('#afa99a'),parkingPaint=material('#ede8cc'),roofMat=material('#54726d',{metalness:.5,roughness:.5});
box(8.8,.15,5.7,0,.14,0,pavementMat,carportGroup);
for(let x of [-4.2,-1.4,1.4,4.2])for(let z of [-2.55,2.55]){
 const column=box(.12,2.95,.12,x,1.64,z,mats.metal,carportGroup);
 let wx=parking.carport.x+Math.cos(parking.carport.angle)*x+Math.sin(parking.carport.angle)*z,wz=parking.carport.z-Math.sin(parking.carport.angle)*x+Math.cos(parking.carport.angle)*z;
 collisions.push({x:wx,z:wz,w:.16,d:.16,angle:parking.carport.angle});
}
for(let z of [-2.55,2.55])box(8.65,.13,.12,0,3.14,z,mats.metal,carportGroup);
for(let x of [-4.2,-1.4,1.4,4.2])box(.10,.13,5.6,x,3.14,0,mats.metal,carportGroup);
const carportRoofGroup=new THREE.Group();carportRoofGroup.name='车棚顶盖';carportGroup.add(carportRoofGroup);
const carportRoof=box(8.95,.12,5.85,0,3.28,0,roofMat,carportRoofGroup);carportRoof.rotation.x=-.025;
for(let x=-4.35;x<=4.35;x+=.3){let rib=box(.035,.035,5.7,x,3.36,0,roofMat,carportRoofGroup);rib.rotation.x=-.025}
// White bay lines, stops and in-model bay numbering.
function parkingNumber(text,x,z,parent){let c=document.createElement('canvas');c.width=128;c.height=128;let ctx=c.getContext('2d');ctx.fillStyle='#eee9d5';ctx.font='bold 64px sans-serif';ctx.textAlign='center';ctx.fillText(text,64,87);let t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;let m=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),new THREE.MeshStandardMaterial({map:t,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,.228,z);parent.add(m)}
for(let x of [-4.2,-1.4,1.4,4.2])box(.075,.012,5,x,.224,0,parkingPaint,carportGroup);
box(8.4,.012,.075,0,.224,-2.5,parkingPaint,carportGroup);
for(let i=0;i<3;i++){let x=-2.8+i*2.8;box(1.5,.10,.16,x,.27,-2.1,mats.concrete,carportGroup);parkingNumber('P'+(i+1),x,1.75,carportGroup)}
const cp=parking.carport;
// A 3 m access lane joins the main road and the carport entrance.
road(parking.access.points.map(([x,z])=>[x/.12+600,z/.12+720]),parking.access.width);
// Open apron joins the three-metre access lane without blocking doors or the well.
poly([[-43.0,48.3],[-40.0,48.3],[-35.8,49.2],[-35.8,50.7],[-40.7,50.4]],roadMat,.17);
const temporaryGroup=new THREE.Group();temporaryGroup.name='入口旁_三个临时车位';temporaryGroup.position.set(parking.temporary.x,0,parking.temporary.z);model.add(temporaryGroup);
box(8.4,.10,6.4,0,.105,0,material('#b6b2a0',{map:grassTex}),temporaryGroup);
for(let x of [-4.05,-1.35,1.35,4.05])box(.075,.018,5.0,x,.17,0,parkingPaint,temporaryGroup);
box(8.1,.018,.075,0,.17,2.5,parkingPaint,temporaryGroup);
for(let i=0;i<3;i++){let x=-2.7+i*2.7;parkingNumber('T'+(i+1),x,-1.8,temporaryGroup);box(1.4,.09,.15,x,.20,2.1,mats.concrete,temporaryGroup)}
function car(x,z){let g=new THREE.Group();g.name='入口车辆';model.add(g);box(1.9,.65,4.2,x,.65,z,material('#d5cfb9'),g);box(1.6,.65,2.1,x,1.24,z,mats.glass,g);box(1.75,.08,2.2,x,1.6,z,mats.white,g);for(let a of [-1,1])for(let b of [-1,1]){let wheel=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.2,14),material('#252c29'));wheel.rotation.z=Math.PI/2;wheel.position.set(x+a*.95,.42,z+b*1.3);g.add(wheel)}for(let a of [-1,1])box(.45,.2,.06,x+a*.55,.8,z+2.13,material('#fff5d9'),g)}car(-24.5,54.6);
// Border trees add context without changing the plot layout.
const treeGeo=new THREE.IcosahedronGeometry(1,2),treeMat=material('#496643');for(let i=0;i<48;i++){let x=-100+rand()*230,z=-140+rand()*260;if(inside(x,z)||nearRoad(x,z,5))continue;let h=4+rand()*4;box(.3,h,.3,x,h/2,z,mats.wood);for(let j=0;j<3;j++){let tree=new THREE.Mesh(treeGeo,treeMat);tree.position.set(x+(rand()-.5)*2,h+j*.5,z+(rand()-.5)*2);tree.scale.set(2.3+rand(),1.7+rand(),2.3+rand());tree.castShadow=true;scene.add(tree)}}
// Lighting fixtures along the main circulation.
for(let py of [760,930,1110]){let [x,z]=P(500,py);box(.09,3.7,.09,x,1.85,z,mats.metal);box(.5,.12,.5,x,3.7,z,mats.metal);box(.35,.12,.35,x,3.57,z,material('#fff1cd',{emissive:'#ffd59b',emissiveIntensity:.6}))}
const labelGroup=new THREE.Group();scene.add(labelGroup);function label(text,px,py,color='#264b35',height=4){let c=document.createElement('canvas');c.width=512;c.height=96;let ctx=c.getContext('2d');ctx.fillStyle='#f7f7e9ed';ctx.beginPath();ctx.roundRect(3,3,506,90,18);ctx.fill();ctx.fillStyle=color;ctx.font='500 30px PingFang SC, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48);let t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;let sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,depthWrite:false,transparent:true}));let [x,z]=P(px,py);sprite.position.set(x,height,z);sprite.scale.set(17,3.2,1);labelGroup.add(sprite)}label('生活区 · C 字集装箱',170,1190,'#805d3d',7);label('车棚 · 3 个车位',235,1113,'#44675d',4);label('3 m 车棚道路',386,1130,'#647466',1);label('临时车位 · 3 位',396,1176,'#6e7254',2);label('配电房',124,1223,'#766443',4);label('灌溉井与泵房',197,1161,'#386f79',4);label('果园 · 示意果树',368,1002,'#486739',6);label('围栏通道 · 净宽 1.5 m',243,1270,'#79684c',2);label('槟榔种植区 · 3.0 亩',735,724);label('预留区 · 5.9 亩',835,1030,'#687339',3);label('上部树阵',1000,300,'#3d6337',11);label('4 m 联络道路',965,855,'#647466',.8);label('3 m 种植通道',844,575,'#647466',1);label('2 m 支路',994,427,'#647466',1);label('6 m 入口',469,1240,'#647466',1.5);label('4 m 主路',478,1000,'#647466',1);
let mode='orbit',yaw=0,pitch=0,keys={},transition=null,last=performance.now(),drag=null;const views={all:{pos:[108,108,150],target:[5,0,-3],title:'用地全景'},home:{pos:[hx+34,42,hz+40],target:[hx+6,2,hz-4],title:'生活区 · C 字形集装箱与果园'},power:{pos:[-35,27,75],target:[-57,2,63],title:'遮阴树与配电房'},pump:{pos:[-54,24,66],target:[-48.5,1,53.1],title:'果园灌溉 · 水井与泵房'},parking:{pos:[-12,29,70],target:[-37,1,49],title:'停车规划 · 车棚与临时车位'},orchard:{pos:[-8,24,65],target:[-28,2,37],title:'果园 · 成排果树'},plant:{pos:[25,28,27],target:[20,3,-8],title:'槟榔种植区 · 林间空间'},reserve:{pos:[60,40,97],target:[25,0,33],title:'预留区 · 开放草地'},top:{pos:[0,230,0.1],target:[0,0,0],title:'平面俯瞰 · 道路与分区'}};
function toast(s){$('toast').textContent=s;$('toast').style.display='block';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('toast').style.display='none',3500)}
const touchDeviceQuery=matchMedia('(pointer: coarse)');
const touchInput={x:0,forward:0,up:false,down:false,joystickPointer:null};
let walkEyeHeight=1.75;
const isTouchDevice=()=>touchDeviceQuery.matches||(navigator.maxTouchPoints>0&&innerWidth<=1024);
// Apply the device default once; resizing and navigation preserve manual choices.
$('labels').checked=!isTouchDevice();
labelGroup.visible=dimensionGroup.visible=$('labels').checked;
function resetTouchInput(){touchInput.x=touchInput.forward=0;touchInput.up=touchInput.down=false;touchInput.joystickPointer=null;$('joystickKnob').style.transform='translate(0px,0px)';for(const id of ['touchUp','touchDown'])$(id).classList.remove('is-held')}
function updateTouchNavigation(){const active=isTouchDevice()&&mode!=='orbit';$('touchNavigation').hidden=!active;document.body.classList.toggle('touch-roaming',active);$('liftLabel').textContent=mode==='walk'?'视点高度':'飞行高度';if(active)$('hint').textContent='左侧摇杆移动 · 拖动画面转向 · 按住右侧升降'}
const joystick=$('moveJoystick');
function moveJoystick(e){const r=joystick.getBoundingClientRect(),radius=r.width*.34,dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,length=Math.hypot(dx,dy),scale=length>radius?radius/length:1,x=dx*scale,y=dy*scale;touchInput.x=Math.abs(x)<4?0:x/radius;touchInput.forward=Math.abs(y)<4?0:-y/radius;$('joystickKnob').style.transform=`translate(${x}px,${y}px)`}
joystick.addEventListener('pointerdown',e=>{if(touchInput.joystickPointer!==null)return;e.preventDefault();touchInput.joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveJoystick(e)});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===touchInput.joystickPointer){e.preventDefault();moveJoystick(e)}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(event,e=>{if(e.pointerId===touchInput.joystickPointer){touchInput.x=touchInput.forward=0;touchInput.joystickPointer=null;$('joystickKnob').style.transform='translate(0px,0px)'}});
for(const [id,direction] of [['touchUp','up'],['touchDown','down']]){const button=$(id);let pointer=null;button.addEventListener('pointerdown',e=>{if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;button.setPointerCapture(e.pointerId);touchInput[direction]=true;button.classList.add('is-held')});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>{if(pointer===e.pointerId){pointer=null;touchInput[direction]=false;button.classList.remove('is-held')}})}
touchDeviceQuery.addEventListener('change',()=>{resetTouchInput();updateTouchNavigation()});
window.addEventListener('resize',()=>{resetTouchInput();updateTouchNavigation()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys={};drag=null;resetTouchInput()}});
function setMode(m){if(document.pointerLockElement)document.exitPointerLock();mode=m;transition=null;resetTouchInput();walkEyeHeight=1.75;controls.enabled=m==='orbit';$('crosshair').style.display=m==='orbit'?'none':'block';document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));if(m!=='orbit'){let [x,z]=P(478,1190);camera.position.set(x,m==='walk'?1.75:14,z);yaw=0;pitch= m==='walk'?0:-.18;camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);$('viewTitle').textContent=m==='walk'?'地面漫游':'自由飞行'}$('hint').textContent=m==='orbit'?'左键旋转 · 右键平移 · 滚轮缩放':m==='walk'?'点击场景进入 · WASD 移动 · Shift 加速 · Esc 释放鼠标':'点击场景进入 · WASD 飞行 · Q/E 升降 · Shift 加速';updateTouchNavigation();if(m!=='orbit'){if(isTouchDevice()&&!$('panelContent').hidden)$('panelSize').click();toast(isTouchDevice()?'摇杆控制移动，拖动画面转向，右侧按住升降':'点击场景控制视角；也可按住鼠标拖动查看')}}
function goto(v){setMode('orbit');let t=views[v];transition={from:camera.position.clone(),targetFrom:controls.target.clone(),to:new THREE.Vector3(...t.pos),target:new THREE.Vector3(...t.target),start:performance.now()};$('viewTitle').textContent=t.title;document.querySelectorAll('.zone').forEach(b=>b.classList.toggle('selected',b.dataset.view===v))}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>goto(b.dataset.view));$('top').onclick=()=>goto('top');$('reset').onclick=()=>goto('all');$('labels').onchange=e=>labelGroup.visible=dimensionGroup.visible=e.target.checked;$('carportRoof').onchange=e=>{carportRoofGroup.visible=e.target.checked;renderer.shadowMap.needsUpdate=true};$('cables').onchange=e=>cableGroup.visible=e.target.checked;$('boundary').onchange=e=>{boundaryGroup.visible=e.target.checked;renderer.shadowMap.needsUpdate=true};
$('sun').oninput=e=>{renderer.shadowMap.needsUpdate=true;let t=e.target.value/100;sun.position.set(-130+260*t,25+110*Math.sin(Math.PI*t),55);sun.color.set(t>.78?'#ffd19c':'#fff3db');sun.intensity=2+1.4*Math.sin(Math.PI*t);hemi.intensity=t>.85?1.45:2.1;$('sunText').textContent=t<.33?'清晨':t<.7?'午后':'日落'};$('fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>toast('当前窗口不支持全屏'))};
function dialog(content){keys={};drag=null;resetTouchInput();$('dialogContent').innerHTML=content;$('dialog').showModal()}$('closeDialog').onclick=()=>$('dialog').close();$('reference').onclick=()=>dialog('<h2>原始规划图</h2><p>三角地块边界与分区按图还原。红色手绘标注解释为道路宽度。截图不含测绘边长，因此面积标签保留原图数据，模型比例为估算。</p><img src="reference.png" alt="用户提供的原始土地规划图">');$('help').onclick=()=>dialog('<h2>自由探索这片土地</h2><ul><li><b>环绕浏览：</b>左键拖动旋转，右键平移，滚轮缩放；触屏用一指旋转、双指缩放。</li><li><b>地面漫游：</b>点击场景后，鼠标转头，WASD 移动，Shift 加速。Esc 退出鼠标锁定。手机端用左侧摇杆移动，拖动画面转向，右侧上下按钮调整视点高度；地面模式避让建筑体量。</li><li><b>自由飞行：</b>WASD 移动，Q 下降、E 上升；也可以按住场景拖动视角。手机端用左侧摇杆移动，按住右侧按钮升降。</li><li><b>快速定位：</b>点击左侧分区；“平面俯瞰”可核对原图布局。</li><li><b>模型导出：</b>下载 GLB，在 Blender 等三维软件中继续编辑。单位为米。</li></ul><p>场景采用程序化植被与建筑。没有地形测绘、精确边界和真实建筑资料，当前版本是可交互概念模型，尚未达到 GTA5 的资产精细度。图上方不等于正北。</p>');
window.addEventListener('keydown',e=>{if($('dialog').open)return;if(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ShiftLeft','ShiftRight'].includes(e.code)&&mode!=='orbit')e.preventDefault();keys[e.code]=true});window.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>{keys={};drag=null;resetTouchInput()});document.addEventListener('pointerlockchange',()=>{keys={}});
renderer.domElement.addEventListener('pointerdown',e=>{if(mode==='orbit')return;if(drag)return;drag={x:e.clientX,y:e.clientY,pointerId:e.pointerId};renderer.domElement.setPointerCapture(e.pointerId);if(e.pointerType==='mouse'&&!document.pointerLockElement){let p=renderer.domElement.requestPointerLock();if(p?.catch)p.catch(()=>{})}});for(const event of ['pointerup','pointercancel'])window.addEventListener(event,e=>{if(drag?.pointerId===e.pointerId)drag=null});renderer.domElement.addEventListener('lostpointercapture',e=>{if(drag?.pointerId===e.pointerId)drag=null});window.addEventListener('mousemove',e=>{if(mode==='orbit')return;let dx=0,dy=0;if(document.pointerLockElement===renderer.domElement){dx=e.movementX;dy=e.movementY}else if(drag){dx=e.clientX-drag.x;dy=e.clientY-drag.y;drag={...drag,x:e.clientX,y:e.clientY}}yaw-=dx*.0025;pitch=THREE.MathUtils.clamp(pitch-dy*.0025,-1.5,1.5);camera.rotation.set(pitch,yaw,0)});renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&drag?.pointerId===e.pointerId&&mode!=='orbit'){yaw-=(e.clientX-drag.x)*.004;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-drag.y)*.004,-1.5,1.5);camera.rotation.set(pitch,yaw,0);drag={...drag,x:e.clientX,y:e.clientY}}});
$('export').onclick=async()=>{let b=$('export');b.disabled=true;b.textContent='正在打包模型…';try{const exporter=new GLTFExporter();let result=await exporter.parseAsync(model,{binary:true,onlyVisible:false});let blob=new Blob([result],{type:'model/gltf-binary'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='三角地块-概念规划.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('GLB 模型已导出，单位为米')}catch(e){console.error(e);toast('导出失败，请重试')}finally{b.disabled=false;b.innerHTML='↓ 导出三维模型 <small>GLB</small>'}};
const mini=$('minimap'),mc=mini.getContext('2d');function mapPoint(x,z){return [30+(x+70)*1.15,18+(z+85)*1.32]}function drawMap(){mc.clearRect(0,0,220,260);mc.fillStyle='#eef1e6';mc.fillRect(0,0,220,260);mc.fillStyle='#aab992';mc.strokeStyle='#8c9c74';mc.beginPath();land.forEach(([x,z],i)=>{let [a,b]=mapPoint(x,z);i?mc.lineTo(a,b):mc.moveTo(a,b)});mc.closePath();mc.fill();mc.stroke();mc.fillStyle='#698553';palms.forEach(p=>{let [a,b]=mapPoint(p.x,p.z);mc.beginPath();mc.arc(a,b,1.6,0,6.28);mc.fill()});mc.fillStyle='#447239';orchardTrees.forEach(t=>{let [a,b]=mapPoint(t.x,t.z);mc.beginPath();mc.arc(a,b,2.7,0,6.28);mc.fill()});mc.strokeStyle='#ede6d1';roads.forEach(r=>{mc.lineWidth=r.width*1.1;mc.beginPath();r.points.forEach(([x,z],i)=>{let [a,b]=mapPoint(x,z);i?mc.lineTo(a,b):mc.moveTo(a,b)});mc.stroke()});mc.fillStyle='#667e72';containerLayout.forEach(c=>{let [a,b]=mapPoint(c.x,c.z);mc.save();mc.translate(a,b);mc.rotate(-(c.angle||0));mc.fillRect(-c.w*.575,-c.d*.66,c.w*1.15,c.d*1.32);mc.restore()});let [cx,cy]=mapPoint(camera.position.x,camera.position.z);mc.fillStyle='#294b36';mc.beginPath();mc.arc(cx,cy,4,0,6.28);mc.fill();mc.fillStyle='#647559';mc.font='10px sans-serif';mc.fillText('SITE / 位置示意',15,246)}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
let frames=0;function tick(now){requestAnimationFrame(tick);let dt=Math.min((now-last)/1000,.05);last=now;if(transition){let t=THREE.MathUtils.clamp((now-transition.start)/1100,0,1),s=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,s);controls.target.lerpVectors(transition.targetFrom,transition.target,s);if(t===1)transition=null}if(mode==='orbit'){controls.update()}else{let speed=(keys.ShiftLeft||keys.ShiftRight?14:5)*dt;let forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),move=new THREE.Vector3();const paused=$('dialog').open||document.hidden;if(!paused){move.addScaledVector(forward,(keys.KeyW?1:0)-(keys.KeyS?1:0)+touchInput.forward);move.addScaledVector(right,(keys.KeyD?1:0)-(keys.KeyA?1:0)+touchInput.x)}if(move.lengthSq()>1)move.normalize();move.multiplyScalar(speed);const lift=paused?0:(keys.KeyE||touchInput.up?1:0)-(keys.KeyQ||touchInput.down?1:0);if(mode==='fly')move.y=lift*speed;else{walkEyeHeight=THREE.MathUtils.clamp(walkEyeHeight+lift*dt,1.1,3.5);move.y=0}let next=camera.position.clone().add(move);let blocked=mode==='walk'&&collisions.some(c=>{let dx=next.x-c.x,dz=next.z-c.z,a=c.angle||0;return Math.abs(Math.cos(a)*dx-Math.sin(a)*dz)<c.w/2+.3&&Math.abs(Math.sin(a)*dx+Math.cos(a)*dz)<c.d/2+.3});if(!blocked)camera.position.copy(next);camera.position.x=THREE.MathUtils.clamp(camera.position.x,-190,190);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-220,220);camera.position.y=mode==='walk'?walkEyeHeight:THREE.MathUtils.clamp(camera.position.y,1.75,280)}renderer.render(scene,camera);if(frames++%10===0)drawMap()}
window.__landExplorer={scene,model,camera,controls,palms,roads,goto,setMode,renderer,parking,carportGroup,carportRoofGroup,temporaryGroup,power,powerGroup,shadeTrees,shadeGroup,cableRoutes,cableGroup,irrigation,irrigationGroup,containerLayout,collisions,orchardTrees,orchardArea,land,housingAngle,passagePoints,fenceSlope,fenceIntercept};$('stats').textContent=palms.length+' 株槟榔 · '+orchardTrees.length+' 株果树 · '+shadeTrees.length+' 棵遮阴树';$('loading').style.display='none';tick(performance.now());

function bindSizeToggle(buttonId, shellId, contentId, name){
 const button=$(buttonId),shell=$(shellId),content=$(contentId);
 button.addEventListener('click',()=>{
  const expanded=button.getAttribute('aria-expanded')==='true';
  button.setAttribute('aria-expanded',String(!expanded));
  content.hidden=expanded;
  shell.classList.toggle('is-small',expanded);
  button.textContent=(expanded?'+ 展开':'− 缩小')+name;
 });
}
bindSizeToggle('panelSize','sitePanel','panelContent','面板');
bindSizeToggle('mapSize','minimapShell','minimap','地图');

// Mobile starts compact; subsequent manual choices remain unchanged.
if(isTouchDevice()){
 $('panelSize').click();
 $('mapSize').click();
}
