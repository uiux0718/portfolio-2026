import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js';

const canvas = document.querySelector('#studio-canvas');
const surface = canvas?.parentElement;
const hero = surface?.closest('.hero');
const motion = matchMedia('(prefers-reduced-motion: no-preference)');

if (canvas && surface && hero) {
  try {
    const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
    camera.position.set(0, .1, 6.9);

    const environmentCanvas = document.createElement('canvas');
    environmentCanvas.width = 1024;
    environmentCanvas.height = 512;
    const context = environmentCanvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 1024, 512);
    gradient.addColorStop(0, '#111926');
    gradient.addColorStop(.35, '#829b8a');
    gradient.addColorStop(.6, '#e8f7ec');
    gradient.addColorStop(1, '#24213b');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 512);
    context.fillStyle = '#ffffff';
    context.fillRect(110, 50, 120, 330);
    context.fillRect(680, 80, 52, 340);
    context.fillStyle = '#cfff9e';
    context.fillRect(420, 250, 150, 180);
    context.fillStyle = '#b6a6ff';
    context.fillRect(850, 40, 90, 380);
    const environment = new THREE.CanvasTexture(environmentCanvas);
    environment.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentMap = pmrem.fromEquirectangular(environment);
    scene.environment = environmentMap.texture;
    environment.dispose();
    pmrem.dispose();

    const sculpture = new THREE.Group();
    scene.add(sculpture);
    const metal = new THREE.MeshPhysicalMaterial({
      color: 0xd4e7d5, metalness: 1, roughness: .18,
      clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.8,
    });
    const logoOutline = new THREE.Shape();
    const outlinePoints = [
      [-1.55, 1.65], [-1.06, 1.65], [0, .3], [1.06, 1.65], [1.55, 1.65],
      [.25, -.05], [.25, -1.55], [-.25, -1.8], [-.25, -.05],
    ];
    outlinePoints.forEach(([x, y], index) => {
      if (index === 0) logoOutline.moveTo(x, y);
      else logoOutline.lineTo(x, y);
    });
    logoOutline.closePath();
    const inset = new THREE.Path();
    const insetPoints = [
      [-1.28, 1.52], [-1.13, 1.52], [0, .08], [1.13, 1.52], [1.28, 1.52],
      [.12, -.1], [.12, -1.48], [-.12, -1.6], [-.12, -.1],
    ];
    insetPoints.forEach(([x, y], index) => {
      if (index === 0) inset.moveTo(x, y);
      else inset.lineTo(x, y);
    });
    inset.closePath();
    logoOutline.holes.push(inset);
    const logo = new THREE.Mesh(new THREE.ExtrudeGeometry(logoOutline, {
      depth: .35, bevelEnabled: true, bevelSize: .035,
      bevelThickness: .04, bevelSegments: 5, curveSegments: 16,
    }), metal);
    logo.position.z = -.18;
    logo.rotation.set(.08, -.25, -.12);
    sculpture.add(logo);
    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(2.02, .012, 12, 140),
      new THREE.MeshBasicMaterial({color: 0xc8f6a1, transparent: true, opacity: .55}),
    );
    orbit.rotation.set(1.05, .45, -.25);
    sculpture.add(orbit);
    const satellite = new THREE.Mesh(new THREE.SphereGeometry(.17, 24, 16), metal);
    satellite.position.set(1.8, .8, .5);
    sculpture.add(satellite);
    scene.add(new THREE.HemisphereLight(0xe7ffe5, 0x322047, 2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 4);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    let frame = 0;
    let visible = true;
    let targetX = 0;
    let targetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    const clock = new THREE.Clock();

    function render() {
      frame = 0;
      const time = clock.getElapsedTime();
      pointerX += (targetX - pointerX) * .06;
      pointerY += (targetY - pointerY) * .06;
      sculpture.rotation.set(pointerY * .3, pointerX * .5, 0);
      logo.rotation.y = -.25 + (motion.matches ? Math.sin(time * .35) * .22 : 0);
      logo.position.y = motion.matches ? Math.sin(time * .8) * .1 : 0;
      renderer.render(scene, camera);
      surface.setAttribute('data-ready', '');
      if (visible && !document.hidden && motion.matches) frame = requestAnimationFrame(render);
    }
    function resume() {
      cancelAnimationFrame(frame);
      frame = 0;
      if (visible && !document.hidden) render();
    }
    const resize = new ResizeObserver(() => {
      const {width, height} = surface.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (!frame) resume();
    });
    resize.observe(surface);
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      resume();
    });
    observer.observe(surface);
    hero.addEventListener('pointermove', event => {
      if (!motion.matches) return;
      const bounds = hero.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      targetY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    }, {passive: true});
    hero.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', resume);
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      surface.removeAttribute('data-ready');
    });
    resume();
  } catch (error) {
    surface.removeAttribute('data-ready');
    console.warn('3D preview unavailable', error.message);
  }
}
