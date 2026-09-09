import * as THREE from 'three';

/**
 * Procedural studio reflections and lighting environment textures
 */
export function createStudioEnvTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep twilight gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#0a101d');
  grad.addColorStop(0.35, '#05070a');
  grad.addColorStop(0.7, '#070b12');
  grad.addColorStop(1, '#111b2b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Softbox 1: Overhead main key reflection
  const softbox1 = ctx.createRadialGradient(512, 100, 10, 512, 100, 180);
  softbox1.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  softbox1.addColorStop(0.4, 'rgba(220, 240, 255, 0.45)');
  softbox1.addColorStop(1, 'rgba(220, 240, 255, 0)');
  ctx.fillStyle = softbox1;
  ctx.fillRect(200, 0, 624, 250);

  // Softbox 2: Left rim strip
  const softbox2 = ctx.createLinearGradient(120, 0, 220, 0);
  softbox2.addColorStop(0, 'rgba(120, 190, 255, 0)');
  softbox2.addColorStop(0.5, 'rgba(160, 220, 255, 0.6)');
  softbox2.addColorStop(1, 'rgba(120, 190, 255, 0)');
  ctx.fillStyle = softbox2;
  ctx.fillRect(100, 120, 140, 300);

  // Softbox 3: Right warm edge strip
  const softbox3 = ctx.createLinearGradient(800, 0, 900, 0);
  softbox3.addColorStop(0, 'rgba(255, 240, 210, 0)');
  softbox3.addColorStop(0.5, 'rgba(255, 230, 190, 0.5)');
  softbox3.addColorStop(1, 'rgba(255, 240, 210, 0)');
  ctx.fillStyle = softbox3;
  ctx.fillRect(780, 120, 140, 300);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

/**
 * Natural rock texture generator with bump and roughness
 */
export function createRockTextures(): { diffuse: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const size = 512;
  const canvasD = document.createElement('canvas');
  canvasD.width = size;
  canvasD.height = size;
  const ctxD = canvasD.getContext('2d')!;

  const canvasB = document.createElement('canvas');
  canvasB.width = size;
  canvasB.height = size;
  const ctxB = canvasB.getContext('2d')!;

  ctxD.fillStyle = '#14181f';
  ctxD.fillRect(0, 0, size, size);

  ctxB.fillStyle = '#808080';
  ctxB.fillRect(0, 0, size, size);

  // Granular noise and fissures
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const s = 1 + Math.random() * 3;
    const grayD = 18 + Math.floor(Math.random() * 26);
    const grayB = 100 + Math.floor(Math.random() * 60);

    ctxD.fillStyle = `rgb(${grayD}, ${grayD + 2}, ${grayD + 6})`;
    ctxD.fillRect(x, y, s, s);

    ctxB.fillStyle = `rgb(${grayB}, ${grayB}, ${grayB})`;
    ctxB.fillRect(x, y, s, s);
  }

  // Organic moss/wet fissures
  for (let f = 0; f < 12; f++) {
    let px = Math.random() * size;
    let py = Math.random() * size;
    ctxD.strokeStyle = 'rgba(24, 38, 30, 0.35)';
    ctxD.lineWidth = 2 + Math.random() * 3;
    ctxD.beginPath();
    ctxD.moveTo(px, py);
    for (let seg = 0; seg < 8; seg++) {
      px += (Math.random() - 0.5) * 60;
      py += (Math.random() - 0.5) * 60;
      ctxD.lineTo(px, py);
    }
    ctxD.stroke();
  }

  const diffuse = new THREE.CanvasTexture(canvasD);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;

  const bump = new THREE.CanvasTexture(canvasB);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  return { diffuse, bump };
}

/**
 * Realistic Mountain Shader Material with elevation & slope based snow, rock, and forest
 */
export function createMountainMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSunColor: { value: new THREE.Color(0xffeedd) },
      uSunIntensity: { value: 1.0 },
      uAmbientColor: { value: new THREE.Color(0x1a2432) },
      uFogColor: { value: new THREE.Color(0x0a0f18) },
      uFogNear: { value: 20.0 },
      uFogFar: { value: 180.0 },
      uGoldenRatio: { value: 0.0 }, // 0: daylight, 1: golden sunset
    },
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying float vElevation;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vElevation = position.y;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uSunColor;
      uniform float uSunIntensity;
      uniform vec3 uAmbientColor;
      uniform vec3 uFogColor;
      uniform float uFogNear;
      uniform float uFogFar;
      uniform float uGoldenRatio;

      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying float vElevation;

      void main() {
        // Base rock palette
        vec3 darkRock = vec3(0.08, 0.10, 0.13);
        vec3 midRock = vec3(0.18, 0.20, 0.25);
        vec3 snowColor = vec3(0.92, 0.95, 0.98);
        vec3 valleyForest = vec3(0.06, 0.12, 0.09);

        // Slope calculation: steeper = rock, flatter = snow or forest
        float slope = vNormal.y;

        // Elevation gradient: higher up = colder/snow
        float snowMask = smoothstep(12.0, 24.0, vElevation) * smoothstep(0.45, 0.85, slope);
        float valleyMask = smoothstep(6.0, -1.0, vElevation) * smoothstep(0.6, 0.95, slope);

        vec3 terrainColor = mix(darkRock, midRock, smoothstep(0.0, 18.0, vElevation));
        terrainColor = mix(terrainColor, valleyForest, valleyMask * 0.7);
        terrainColor = mix(terrainColor, snowColor, snowMask);

        // Warm golden hour sunlight tint
        vec3 warmSun = vec3(1.0, 0.72, 0.45);
        vec3 sunLight = mix(uSunColor, warmSun, uGoldenRatio);

        // Diffuse lighting
        vec3 lightDir = normalize(vec3(0.4, 0.7, -0.6));
        float diff = max(dot(vNormal, lightDir), 0.0);
        vec3 finalColor = terrainColor * (uAmbientColor + diff * sunLight * uSunIntensity);

        // Fog
        float dist = length(vWorldPos - cameraPosition);
        float fogFactor = clamp((dist - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);

        // Sun fog warm glow
        vec3 currentFog = mix(uFogColor, vec3(0.24, 0.16, 0.14), uGoldenRatio * 0.7);
        gl_FragColor = vec4(mix(finalColor, currentFog, fogFactor), 1.0);
      }
    `,
  });
}

/**
 * Animated River Shader Material with waves, reflections, and dynamic bank foam
 */
export function createRiverMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uSunColor: { value: new THREE.Color(0xfff0dd) },
      uSunIntensity: { value: 1.0 },
      uGoldenRatio: { value: 0.0 },
      uFogColor: { value: new THREE.Color(0x0a0f18) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Flowing harmonic ripples
        float wave1 = sin(pos.z * 0.45 - uTime * 3.5 + pos.x * 0.8) * 0.06;
        float wave2 = cos(pos.z * 0.9 - uTime * 5.0) * 0.035;
        float wave3 = sin(pos.x * 1.5 + pos.z * 0.2 - uTime * 2.0) * 0.025;
        pos.y += wave1 + wave2 + wave3;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;

        // Compute approximate normal from wave derivatives
        float dYdx = 0.8 * cos(pos.z * 0.45 - uTime * 3.5 + pos.x * 0.8) * 0.06;
        float dYdz = 0.45 * cos(pos.z * 0.45 - uTime * 3.5 + pos.x * 0.8) * 0.06;
        vNormal = normalize(vec3(-dYdx, 1.0, -dYdz));

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uSunColor;
      uniform float uSunIntensity;
      uniform float uGoldenRatio;
      uniform vec3 uFogColor;

      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying vec2 vUv;

      void main() {
        // Deep crystal river water with turquoise alpine undertones
        vec3 deepWater = vec3(0.02, 0.12, 0.22);
        vec3 shallowWater = vec3(0.08, 0.32, 0.45);
        vec3 goldenWater = vec3(0.38, 0.24, 0.12);

        vec3 waterColor = mix(deepWater, shallowWater, sin(vUv.x * 3.14159));
        waterColor = mix(waterColor, goldenWater, uGoldenRatio * 0.85);

        // Specular Sun Light path along river
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        vec3 lightDir = normalize(vec3(0.1, 0.6, -0.8));
        vec3 halfDir = normalize(lightDir + viewDir);

        float spec = pow(max(dot(vNormal, halfDir), 0.0), 75.0);
        vec3 specColor = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.85, 0.55), uGoldenRatio);

        // Edge/bank white water foam
        float edge = abs(vUv.x - 0.5) * 2.0;
        float foam = smoothstep(0.78, 0.98, edge) * (0.5 + 0.5 * sin(vWorldPos.z * 4.0 - uTime * 4.0));
        vec3 foamColor = vec3(0.85, 0.94, 1.0);

        vec3 finalColor = waterColor + spec * specColor * 2.8 + foam * foamColor * 0.45;

        // Distance fog
        float dist = length(vWorldPos - cameraPosition);
        float fogFactor = clamp((dist - 20.0) / (180.0 - 20.0), 0.0, 1.0);
        vec3 currentFog = mix(uFogColor, vec3(0.24, 0.16, 0.14), uGoldenRatio * 0.7);

        gl_FragColor = vec4(mix(finalColor, currentFog, fogFactor), 0.95);
      }
    `,
    transparent: true,
  });
}
