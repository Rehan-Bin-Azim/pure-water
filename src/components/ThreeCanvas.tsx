import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GlassRig } from './3d/GlassRig';
import { LandscapeRig } from './3d/LandscapeRig';
import { createStudioEnvTexture } from './3d/Materials';
import { audioEngine } from './AudioController';

interface ThreeCanvasProps {
  scrollProgress: number;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ scrollProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number>(scrollProgress);
  const currentScrollRef = useRef<number>(scrollProgress);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    scrollRef.current = scrollProgress;
    audioEngine.updateIntensity(scrollProgress);
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090d, 0.022);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.2, 4.3);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x07090d, 1);
    container.appendChild(renderer.domElement);

    // Procedural Studio Reflection HDR
    const envTexture = createStudioEnvTexture();
    scene.environment = envTexture;

    // --- LIGHTING RIG ---
    const ambientLight = new THREE.AmbientLight(0x283848, 0.7);
    scene.add(ambientLight);

    // Key softbox spotlight on glass
    const keyLight = new THREE.SpotLight(0xffffff, 5.0, 25, Math.PI / 4, 0.5, 1.2);
    keyLight.position.set(2.5, 6.0, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Cool rim backlight (crucial for glass edge silhouette definition)
    const rimLight = new THREE.DirectionalLight(0x75b8ff, 3.6);
    rimLight.position.set(-3.5, 2.5, -2.5);
    scene.add(rimLight);

    // Warm bounce light from bottom
    const bounceLight = new THREE.PointLight(0x2a3e56, 1.5, 12);
    bounceLight.position.set(0.5, -0.8, 2.0);
    scene.add(bounceLight);

    // Golden Hour Sun directional light (Scene 6, 7)
    const sunLight = new THREE.DirectionalLight(0xffd59e, 0);
    sunLight.position.set(8, 14, -90);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Interactive cursor specular glint light
    const cursorGlintLight = new THREE.PointLight(0xbfe6ff, 0.4, 4.0, 2.0);
    cursorGlintLight.position.set(0.6, 1.2, 1.2);
    scene.add(cursorGlintLight);

    // --- 3D OBJECT RIGS ---
    const landscapeRig = new LandscapeRig();
    scene.add(landscapeRig.group);

    const glassRig = new GlassRig();
    // Glass sits naturally on the rock promontory
    glassRig.group.position.set(0.65, 0, 0);
    scene.add(glassRig.group);

    // Mouse tracking for subtle desktop parallax & glints
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- CONTINUOUS SPLINE CAMERA CHOREOGRAPHY ---
    // Smooth Catmull-Rom camera path and lookAt trajectory
    const camPathPoints = [
      // 0.0 - 0.15: Hero shot approaching glass (glass slightly right of center)
      { p: 0.00, pos: new THREE.Vector3(0.0, 1.20, 4.30), look: new THREE.Vector3(0.35, 0.50, 0.0) },
      { p: 0.15, pos: new THREE.Vector3(0.1, 1.15, 3.80), look: new THREE.Vector3(0.40, 0.65, 0.0) },
      // 0.15 - 0.35: Moving slightly higher to look down into water stream pouring into glass
      { p: 0.25, pos: new THREE.Vector3(0.2, 1.55, 3.35), look: new THREE.Vector3(0.45, 0.90, 0.0) },
      { p: 0.35, pos: new THREE.Vector3(0.4, 1.60, 3.10), look: new THREE.Vector3(0.50, 0.95, 0.0) },
      // 0.35 - 0.50: Smooth orbital dolly to 3/4 angle as glass tilts
      { p: 0.42, pos: new THREE.Vector3(0.9, 1.45, 2.90), look: new THREE.Vector3(0.65, 0.85, 0.0) },
      { p: 0.50, pos: new THREE.Vector3(1.4, 1.30, 2.75), look: new THREE.Vector3(0.85, 0.70, 0.0) },
      // 0.50 - 0.68: Tracking downward following the cascading water over the rock channel
      { p: 0.58, pos: new THREE.Vector3(1.9, 0.95, 2.60), look: new THREE.Vector3(1.40, 0.30, 0.1) },
      { p: 0.68, pos: new THREE.Vector3(2.4, 0.60, 2.45), look: new THREE.Vector3(2.20, -0.15, 0.2) },
      // 0.68 - 0.84: Craning back & up: stream joins the winding river, mountains emerge
      { p: 0.76, pos: new THREE.Vector3(1.2, 2.20, 6.50), look: new THREE.Vector3(1.00, -0.80, -6.0) },
      { p: 0.84, pos: new THREE.Vector3(0.2, 4.80, 14.5), look: new THREE.Vector3(0.20, -1.20, -18.0) },
      // 0.84 - 1.00: Wide majestic cinematic golden-hour vista
      { p: 0.92, pos: new THREE.Vector3(0.0, 7.20, 22.0), look: new THREE.Vector3(0.00, -1.50, -32.0) },
      { p: 1.00, pos: new THREE.Vector3(0.0, 8.40, 25.5), look: new THREE.Vector3(0.00, -1.80, -40.0) },
    ];

    const evaluateCamera = (progress: number) => {
      const p = Math.max(0, Math.min(1, progress));
      let idx = 0;
      for (let i = 0; i < camPathPoints.length - 1; i++) {
        if (p >= camPathPoints[i].p && p <= camPathPoints[i + 1].p) {
          idx = i;
          break;
        }
      }
      const p0 = camPathPoints[idx];
      const p1 = camPathPoints[idx + 1];
      const segmentT = (p - p0.p) / (p1.p - p0.p);
      // Smooth Hermite easing for continuity
      const smoothT = segmentT * segmentT * (3 - 2 * segmentT);

      const pos = new THREE.Vector3().lerpVectors(p0.pos, p1.pos, smoothT);
      const look = new THREE.Vector3().lerpVectors(p0.look, p1.look, smoothT);
      return { pos, look };
    };

    // --- ANIMATION LOOP ---
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (timeMs: number) => {
      animationFrameId = requestAnimationFrame(render);
      const dt = Math.min((timeMs - lastTime) / 1000, 0.1);
      lastTime = timeMs;
      const elapsedTime = timeMs / 1000;

      // Smooth scroll interpolation (damper for buttery scroll feel)
      const targetScroll = scrollRef.current;
      currentScrollRef.current += (targetScroll - currentScrollRef.current) * 0.085;
      const p = currentScrollRef.current;

      // Mouse smoothing for subtle parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // 1. Camera Spline Evaluation
      const { pos: camPos, look: camLook } = evaluateCamera(p);

      // Subtle desktop mouse parallax: smaller when zoomed in, broader when wide
      const parallaxScale = p < 0.7 ? 0.25 : 0.65;
      camPos.x += mx * parallaxScale;
      camPos.y += my * (parallaxScale * 0.7);

      camera.position.copy(camPos);
      camera.lookAt(camLook);

      // 2. Update Glass and Fluid Rig
      glassRig.update(p, elapsedTime, dt);

      // Subtle responsive glass rotation from mouse on desktop (Scene 1-3)
      if (p < 0.4) {
        glassRig.group.rotation.y += mx * 0.08;
        glassRig.group.rotation.x += -my * 0.04;
      }

      // Cursor Glint Light updates
      cursorGlintLight.position.set(0.65 + mx * 0.8, 1.2 + my * 0.6, 1.2);

      // 3. Update Landscape and River Rig
      landscapeRig.update(p, elapsedTime);

      // 4. Lighting & Atmospheric Transitions
      if (p < 0.40) {
        // Dark moody studio with cool blue rim
        (scene.fog as THREE.FogExp2).color.setHex(0x07090d);
        (scene.fog as THREE.FogExp2).density = 0.022;
        renderer.setClearColor(0x07090d, 1);
        ambientLight.intensity = 0.7;
        keyLight.intensity = 5.0;
        rimLight.intensity = 3.6;
        sunLight.intensity = 0;
      } else if (p < 0.75) {
        // Dawn daylight breaking over mountain valley
        const t = (p - 0.40) / 0.35;
        const fogCol = new THREE.Color(0x07090d).lerp(new THREE.Color(0x101b28), t);
        (scene.fog as THREE.FogExp2).color.copy(fogCol);
        (scene.fog as THREE.FogExp2).density = 0.022 - t * 0.008;
        renderer.setClearColor(fogCol, 1);

        ambientLight.intensity = 0.7 + t * 0.3;
        keyLight.intensity = 5.0 * (1 - t * 0.5);
        rimLight.intensity = 3.6 * (1 - t * 0.3);
        sunLight.intensity = t * 1.5;
      } else {
        // Breathtaking golden-hour sunset
        const t = (p - 0.75) / 0.25;
        const fogCol = new THREE.Color(0x101b28).lerp(new THREE.Color(0x261a16), t);
        (scene.fog as THREE.FogExp2).color.copy(fogCol);
        (scene.fog as THREE.FogExp2).density = 0.014 + t * 0.003;
        renderer.setClearColor(fogCol, 1);

        ambientLight.intensity = 1.0 + t * 0.4;
        keyLight.intensity = 2.5 * (1 - t);
        rimLight.intensity = 2.5 * (1 - t);
        sunLight.intensity = 1.5 + t * 3.8;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 w-full h-full pointer-events-none"
      id="three-canvas-container"
    />
  );
};
