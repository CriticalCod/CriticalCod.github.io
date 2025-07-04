const body = document.body;
const lightBg = document.getElementById('lightBg'), darkBg = document.getElementById('darkBg');
const toggleBtn = document.getElementById('toggleBtn'), cursor = document.getElementById('cursor');
const canvas = document.getElementById('weatherCanvas'), ctx = canvas.getContext('2d');
const welcomeAudio = document.getElementById('welcomeAudio'), bgAudio = document.getElementById('bgAudio'), goodbyeAudio = document.getElementById('goodbyeAudio');
let particles=[], cursorPos={x:-100,y:-100};

lightBg.style.opacity='1';

// Audio flow
window.addEventListener('DOMContentLoaded',()=>{
  welcomeAudio.play().catch(()=>{});
  welcomeAudio.addEventListener('ended',()=>bgAudio.play().catch(()=>{}));
});
window.addEventListener('beforeunload',()=>goodbyeAudio.play().catch(()=>{}));

// Typing effect
function typeEffect(txt,el,delay){let i=0;(function loop(){if(i<txt.length){el.textContent+=txt[i++];setTimeout(loop,delay);}})();}

// Title animation
(function animateTitle(){
  const titles=["Welcome","Casus"];
  let idx=0, sub=0, forward=true;
  setInterval(()=>{
    document.title=titles[idx].slice(0,sub);
    forward?sub++:sub--;
    if(!forward&&sub<1){forward=true;idx=(idx+1)%titles.length;}
    if(sub>titles[idx].length)forward=false;
  },300);
})();

// On load
window.onload=()=>{
  typeEffect("Casus",document.getElementById("typed-name"),150);
  typeEffect("With 3 years mastering code, 2 months crafting GFX, 1 year animating & extensive graphic design, I create engaging digital experiences.",document.getElementById("description"),25);
  ["About Me","My Games","GFX Gallery","Connect with Me"].forEach((t,i)=>{
    typeEffect(t,document.querySelectorAll("h2")[i],100);
  });
  initCanvas();animate();initCursor();initScroll();initCardHover();initVoxel();initGSAPAnimations();
  new SmoothScroll("nav a[href*='#']",{speed:800,speedAsDuration:true});
};

// Cursor & interaction
function initCursor(){
  document.addEventListener('mousemove',e=>{cursor.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;cursorPos={x:e.clientX,y:e.clientY};});
  document.querySelectorAll("a,button,.card").forEach(el=>{
    el.addEventListener("mouseenter",()=>cursor.style.transform+= " scale(2)");
    el.addEventListener("mouseleave",()=>cursor.style.transform=cursor.style.transform.replace(" scale(2)",""));
  });
}

// Reveal
function initScroll(){
  document.querySelectorAll("section").forEach(el=>{
    new IntersectionObserver(([e],obs)=>{if(e.isIntersecting){el.classList.add("visible");obs.disconnect();}},{threshold:0.3}).observe(el);
  });
  document.querySelectorAll(".gfx-gallery img").forEach(img=>{
    new IntersectionObserver(([e],obs)=>{if(e.isIntersecting){img.style.opacity=1;img.style.transform="scale(1)";obs.disconnect();}},{threshold:0.3}).observe(img);
  });
  const img=document.getElementById("profilePic");
  if(img)new IntersectionObserver(([e],obs)=>{if(e.isIntersecting){img.classList.add("visible");obs.disconnect();}}, {threshold:0.3}).observe(img);
}

// Card tilt
function initCardHover(){
  document.querySelectorAll(".card").forEach(card=>{
    card.addEventListener("mousemove",e=>{
      const r=card.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
      gsap.to(card,{rotationY:x/20,rotationX:-y/20,ease:"power1.out",duration:0.3});
    });
    card.addEventListener("mouseleave",()=>gsap.to(card,{rotationY:0,rotationX:0,duration:0.5,ease:"power2.out"}));
  });
}

// Particle physics
function initCanvas(){
  canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  particles=[];const isSnow=body.classList.contains("snow");
  for(let i=0;i<(isSnow?350:250);i++){
    particles.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      vx:Math.random()*2-1,
      vy:Math.random()*2-1,
      len:isSnow?Math.random()*4+2:Math.random()*15+10,
      opa:Math.random()*0.5+0.3,
      width:isSnow?0:Math.random()*1+1,
      angle:Math.random()*Math.PI/6-Math.PI/12
    });
  }
}
function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    const dx=p.x-cursorPos.x, dy=p.y-cursorPos.y, dist=Math.hypot(dx,dy);
    if(dist<80){
      const str=(80-dist)/80;
      p.vx+=(dx/dist)*str*0.5;p.vy+=(dy/dist)*str*0.5;
    }
    p.x+=p.vx;p.y+=p.vy;p.vx*=0.98;p.vy*=0.98;
    if(p.x<0||p.x>canvas.width)p.vx*=-1;
    if(p.y<0||p.y>canvas.height)p.vy*=-1;

    if(body.classList.contains("snow")){
      ctx.fillStyle=`rgba(255,255,255,${p.opa})`;
      ctx.beginPath();ctx.arc(p.x,p.y,p.len/2,0,Math.PI*2);ctx.fill();
    } else {
      const x2=p.x+Math.sin(p.angle)*p.len,y2=p.y+Math.cos(p.angle)*p.len;
      const grad=ctx.createLinearGradient(p.x,p.y,x2,y2);
      grad.addColorStop(0,`rgba(0,170,238,${p.opa})`);
      grad.addColorStop(1,'rgba(0,170,238,0)');
      ctx.strokeStyle=grad;ctx.lineWidth=p.width;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(x2,y2);ctx.stroke();
    }
  });
  requestAnimationFrame(animate);
}

// Theme switch
toggleBtn.addEventListener("click",()=>{
  const isSnow=body.classList.toggle("snow");
  body.classList.toggle("rain",!isSnow);
  toggleBtn.textContent=isSnow?"🌧️ Rain Mode":"❄️ Snow Mode";
  lightBg.style.opacity=isSnow?"0":"1";
  darkBg.style.opacity=isSnow?"1":"0";
  initCanvas();
});
window.addEventListener("resize",initCanvas);

// Voxel avatar
function initVoxel(){
  const container=document.getElementById("voxelCanvas");
  if(!container)return;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,0.1,1000);
  const renderer=new THREE.WebGLRenderer({alpha:true});
  renderer.setSize(150,150);container.appendChild(renderer.domElement);
  const cube=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshNormalMaterial());
  scene.add(cube);camera.position.z=3;
  (function animateCube(){
    requestAnimationFrame(animateCube);cube.rotation.x+=0.01;cube.rotation.y+=0.015;renderer.render(scene,camera);
  })();
}

// GSAP scroll effects
function initGSAPAnimations(){
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".card",{opacity:0,y:40,stagger:0.2,duration:0.8,ease:"power2.out",scrollTrigger:{trigger:".cards",start:"top 80%"}});
  gsap.to(".connect-icons img",{opacity:1,y:0,ease:"bounce.out",scrollTrigger:{trigger:"#connect",start:"top 80%"},stagger:0.3,delay:0.3});
}
