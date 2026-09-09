import * as THREE from 'three';

export class GlassRig {
  public group: THREE.Group;
  public glassMesh: THREE.Mesh;
  public glassMaterial: THREE.MeshPhysicalMaterial;
  public waterMesh: THREE.Mesh;
  public waterMaterial: THREE.MeshPhysicalMaterial;
  public waterSurfaceMesh: THREE.Mesh;
  public waterSurfaceGeo: THREE.CircleGeometry;
  public baseWaterSurfacePos: Float32Array;

  // First falling droplet & inflow stream
  public firstDropMesh: THREE.Mesh;
  public pourStreamMesh: THREE.Mesh;
  public pourStreamMat: THREE.MeshPhysicalMaterial;

  // Bubbles
  public bubbleInstanced: THREE.InstancedMesh;
  private bubbleCount = 75;
  private bubbleData: { x: number; y: number; z: number; speed: number; seed: number; radius: number }[] = [];

  // Exterior Condensation Dew Droplets
  public condensationInstanced: THREE.InstancedMesh;

  // Overflow spill stream & splash droplets
  public spillMesh: THREE.Mesh;
  public spillMat: THREE.MeshPhysicalMaterial;
  public splashInstanced: THREE.InstancedMesh;
  private splashCount = 50;
  private splashData: { origin: THREE.Vector3; vel: THREE.Vector3; scale: number }[] = [];

  // Rim glint sparkle points
  public rimGlintPoints: THREE.Points;
  public rimGlintMat: THREE.PointsMaterial;

  // Liquid inertia tracking
  private currentSloshAngle = 0;
  private sloshVelocity = 0;

  constructor() {
    this.group = new THREE.Group();

    // -------------------------------------------------------------
    // 1. HEAVY CRYSTAL TUMBLER GEOMETRY
    // -------------------------------------------------------------
    const glassPoints: THREE.Vector2[] = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.56, 0),
      new THREE.Vector2(0.64, 0.08),
      new THREE.Vector2(0.67, 0.35), // Thick base
      new THREE.Vector2(0.74, 1.15),
      new THREE.Vector2(0.79, 1.72),
      new THREE.Vector2(0.77, 1.75), // Rounded lip
      new THREE.Vector2(0.73, 1.75),
      new THREE.Vector2(0.69, 1.68), // Inner wall
      new THREE.Vector2(0.65, 1.15),
      new THREE.Vector2(0.57, 0.40),
      new THREE.Vector2(0.50, 0.35),
      new THREE.Vector2(0, 0.35),    // Base inner cavity floor
    ];

    const glassGeometry = new THREE.LatheGeometry(glassPoints, 64);
    glassGeometry.computeVertexNormals();

    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.52,
      thickness: 1.5,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      envMapIntensity: 2.4,
      side: THREE.DoubleSide,
    });

    this.glassMesh = new THREE.Mesh(glassGeometry, this.glassMaterial);
    this.glassMesh.castShadow = true;
    this.glassMesh.receiveShadow = true;
    this.group.add(this.glassMesh);

    // -------------------------------------------------------------
    // 2. EXTERIOR CONDENSATION DEW DROPLETS (Micro-beads on glass)
    // -------------------------------------------------------------
    const dewCount = 55;
    const dewGeo = new THREE.SphereGeometry(0.016, 8, 8);
    const dewMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      transparent: true,
      roughness: 0.01,
      ior: 1.333,
      clearcoat: 1.0,
    });
    this.condensationInstanced = new THREE.InstancedMesh(dewGeo, dewMat, dewCount);
    const dewDummy = new THREE.Object3D();
    for (let i = 0; i < dewCount; i++) {
      const angle = (i / dewCount) * Math.PI * 2 + Math.sin(i * 3) * 0.4;
      const height = 0.45 + (i / dewCount) * 1.0;
      const radius = 0.67 + (height / 1.7) * 0.11 + 0.005;
      dewDummy.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      dewDummy.scale.setScalar(0.4 + Math.random() * 0.8);
      dewDummy.updateMatrix();
      this.condensationInstanced.setMatrixAt(i, dewDummy.matrix);
    }
    this.condensationInstanced.instanceMatrix.needsUpdate = true;
    this.group.add(this.condensationInstanced);

    // -------------------------------------------------------------
    // 3. WATER VOLUME INSIDE GLASS
    // -------------------------------------------------------------
    const waterInnerGeo = new THREE.CylinderGeometry(0.66, 0.55, 1.25, 48, 16);
    waterInnerGeo.translate(0, 0.625, 0); // Bottom anchored
    this.waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x98e2ff,
      transmission: 0.92,
      opacity: 0.96,
      transparent: true,
      roughness: 0.015,
      ior: 1.333,
      thickness: 1.2,
      specularIntensity: 1.0,
      clearcoat: 1.0,
      envMapIntensity: 2.2,
      side: THREE.DoubleSide,
    });

    this.waterMesh = new THREE.Mesh(waterInnerGeo, this.waterMaterial);
    this.waterMesh.position.set(0, 0.35, 0);
    this.waterMesh.scale.set(1, 0.001, 1);
    this.group.add(this.waterMesh);

    // Dynamic water meniscus top surface
    this.waterSurfaceGeo = new THREE.CircleGeometry(0.66, 48);
    this.waterSurfaceGeo.rotateX(-Math.PI / 2);
    this.baseWaterSurfacePos = new Float32Array(this.waterSurfaceGeo.attributes.position.array);

    const waterSurfaceMat = new THREE.MeshPhysicalMaterial({
      color: 0xc8f0ff,
      transmission: 0.94,
      transparent: true,
      roughness: 0.02,
      ior: 1.333,
      clearcoat: 1.0,
      side: THREE.DoubleSide,
    });
    this.waterSurfaceMesh = new THREE.Mesh(this.waterSurfaceGeo, waterSurfaceMat);
    this.waterSurfaceMesh.position.set(0, 0.35, 0);
    this.waterSurfaceMesh.visible = false;
    this.group.add(this.waterSurfaceMesh);

    // -------------------------------------------------------------
    // 4. FIRST WATER DROPLET & INFLOW POUR STREAM
    // -------------------------------------------------------------
    // First teardrop
    const dropGeo = new THREE.ConeGeometry(0.045, 0.12, 16);
    dropGeo.rotateX(Math.PI);
    const dropMat = new THREE.MeshPhysicalMaterial({
      color: 0xdaf2ff,
      transmission: 0.96,
      transparent: true,
      roughness: 0.02,
      ior: 1.333,
      clearcoat: 1.0,
    });
    this.firstDropMesh = new THREE.Mesh(dropGeo, dropMat);
    this.firstDropMesh.position.set(0, 3.5, 0);
    this.firstDropMesh.visible = false;
    this.group.add(this.firstDropMesh);

    // Progressive pouring liquid cylinder
    const pourGeo = new THREE.CylinderGeometry(0.04, 0.08, 3.8, 24, 1);
    pourGeo.translate(0, 1.9, 0);
    this.pourStreamMat = new THREE.MeshPhysicalMaterial({
      color: 0xc2eeff,
      transmission: 0.95,
      transparent: true,
      opacity: 0,
      roughness: 0.03,
      ior: 1.333,
      clearcoat: 1.0,
    });
    this.pourStreamMesh = new THREE.Mesh(pourGeo, this.pourStreamMat);
    this.pourStreamMesh.position.set(0, 1.6, 0);
    this.pourStreamMesh.scale.set(1, 0.001, 1);
    this.group.add(this.pourStreamMesh);

    // -------------------------------------------------------------
    // 5. AERATED MICRO-BUBBLES
    // -------------------------------------------------------------
    const bubbleGeo = new THREE.SphereGeometry(0.022, 10, 10);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      transparent: true,
      roughness: 0.01,
      ior: 1.1,
    });
    this.bubbleInstanced = new THREE.InstancedMesh(bubbleGeo, bubbleMat, this.bubbleCount);
    const bDummy = new THREE.Object3D();
    for (let i = 0; i < this.bubbleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.46;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = 0.38 + Math.random() * 1.1;
      this.bubbleData.push({
        x,
        y,
        z,
        speed: 0.008 + Math.random() * 0.014,
        seed: Math.random() * 100,
        radius: r,
      });
      bDummy.position.set(x, y, z);
      bDummy.scale.setScalar(0.4 + Math.random() * 0.8);
      bDummy.updateMatrix();
      this.bubbleInstanced.setMatrixAt(i, bDummy.matrix);
    }
    this.bubbleInstanced.instanceMatrix.needsUpdate = true;
    this.bubbleInstanced.visible = false;
    this.group.add(this.bubbleInstanced);

    // -------------------------------------------------------------
    // 6. SPILLING WATER STREAM (Curve from lip down to rock channel)
    // -------------------------------------------------------------
    const spillCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.72, 1.62, 0),
      new THREE.Vector3(1.15, 1.30, 0.08),
      new THREE.Vector3(1.60, 0.70, 0.12),
      new THREE.Vector3(2.05, 0.15, 0.18),
      new THREE.Vector3(2.55, -0.20, 0.22),
      new THREE.Vector3(3.20, -0.45, 0.28),
    ]);
    const spillGeo = new THREE.TubeGeometry(spillCurve, 44, 0.075, 16, false);
    this.spillMat = new THREE.MeshPhysicalMaterial({
      color: 0x9be0ff,
      transmission: 0.95,
      transparent: true,
      roughness: 0.025,
      ior: 1.333,
      clearcoat: 1.0,
      opacity: 0,
    });
    this.spillMesh = new THREE.Mesh(spillGeo, this.spillMat);
    this.group.add(this.spillMesh);

    // Splash Particles
    const splashGeo = new THREE.SphereGeometry(0.035, 10, 10);
    const splashMat = new THREE.MeshPhysicalMaterial({
      color: 0xdaf2ff,
      transmission: 0.96,
      transparent: true,
      roughness: 0.02,
      ior: 1.333,
      clearcoat: 1.0,
    });
    this.splashInstanced = new THREE.InstancedMesh(splashGeo, splashMat, this.splashCount);
    const sDummy = new THREE.Object3D();
    for (let i = 0; i < this.splashCount; i++) {
      this.splashData.push({
        origin: new THREE.Vector3(0.8 + Math.random() * 1.8, 0.2 + Math.random() * 1.3, (Math.random() - 0.5) * 0.6),
        vel: new THREE.Vector3(0.02 + Math.random() * 0.03, -0.01 - Math.random() * 0.02, (Math.random() - 0.5) * 0.02),
        scale: 0.3 + Math.random() * 0.9,
      });
      sDummy.position.copy(this.splashData[i].origin);
      sDummy.scale.setScalar(this.splashData[i].scale);
      sDummy.updateMatrix();
      this.splashInstanced.setMatrixAt(i, sDummy.matrix);
    }
    this.splashInstanced.instanceMatrix.needsUpdate = true;
    this.splashInstanced.visible = false;
    this.group.add(this.splashInstanced);

    // Rim glint sparkles
    const rimCount = 36;
    const rimGeo = new THREE.BufferGeometry();
    const rimPos = new Float32Array(rimCount * 3);
    for (let i = 0; i < rimCount; i++) {
      const angle = (i / rimCount) * Math.PI * 2;
      rimPos[i * 3] = Math.cos(angle) * 0.75;
      rimPos[i * 3 + 1] = 1.74;
      rimPos[i * 3 + 2] = Math.sin(angle) * 0.75;
    }
    rimGeo.setAttribute('position', new THREE.BufferAttribute(rimPos, 3));
    this.rimGlintMat = new THREE.PointsMaterial({
      color: 0xebf8ff,
      size: 0.07,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.rimGlintPoints = new THREE.Points(rimGeo, this.rimGlintMat);
    this.group.add(this.rimGlintPoints);
  }

  /**
   * Update all glass, fluid, and stream physics according to normalized scroll progress
   */
  public update(p: number, time: number, dt: number) {
    const bDummy = new THREE.Object3D();
    const sDummy = new THREE.Object3D();

    // -------------------------------------------------------------
    // STAGE 1: EMPTY GLASS (0.0 to 0.08)
    // -------------------------------------------------------------
    if (p < 0.08) {
      this.firstDropMesh.visible = false;
      this.pourStreamMesh.scale.set(1, 0.001, 1);
      this.pourStreamMat.opacity = 0;
      this.waterMesh.scale.set(1, 0.001, 1);
      this.waterSurfaceMesh.visible = false;
      this.bubbleInstanced.visible = false;
      this.spillMat.opacity = 0;
      this.splashInstanced.visible = false;

      this.group.position.set(0.65, 0, 0); // Positioned slightly right of center
      this.group.rotation.set(0, 0.2 + time * 0.04, 0);
      this.group.scale.setScalar(1);
    }
    // -------------------------------------------------------------
    // STAGE 2A: FIRST TEARDROP FALLING (0.08 to 0.16)
    // -------------------------------------------------------------
    else if (p < 0.16) {
      const t = (p - 0.08) / 0.08;
      this.firstDropMesh.visible = true;
      // Droplet falls under gravity into the glass
      const dropY = 3.2 - Math.pow(t, 1.6) * 2.8;
      this.firstDropMesh.position.set(0, dropY, 0);
      this.firstDropMesh.scale.set(1, 1 + t * 0.5, 1); // Stretches as it falls

      this.pourStreamMesh.scale.set(1, 0.001, 1);
      this.pourStreamMat.opacity = 0;
      this.waterMesh.scale.set(1, 0.001, 1);
      this.waterSurfaceMesh.visible = false;
      this.bubbleInstanced.visible = false;
      this.spillMat.opacity = 0;
      this.splashInstanced.visible = false;

      this.group.position.set(0.65 - t * 0.15, 0, 0);
      this.group.rotation.set(0, 0.2 + t * 0.2, 0);
      this.group.scale.setScalar(1);
    }
    // -------------------------------------------------------------
    // STAGE 2B: CONTINUOUS POURING STREAM & FILLING (0.16 to 0.35)
    // -------------------------------------------------------------
    else if (p < 0.35) {
      const t = (p - 0.16) / 0.19;
      this.firstDropMesh.visible = false;

      // Stream grows and tapers
      const streamStrength = Math.sin(t * Math.PI);
      this.pourStreamMesh.scale.set(0.6 + streamStrength * 0.5, streamStrength, 0.6 + streamStrength * 0.5);
      this.pourStreamMat.opacity = Math.min(0.96, streamStrength * 1.4);

      // Water level rises progressively
      const fillAmount = Math.max(0.001, Math.min(1.0, t * 0.94));
      this.waterMesh.scale.set(1, fillAmount, 1);
      this.waterSurfaceMesh.visible = true;
      this.waterSurfaceMesh.position.y = 0.35 + fillAmount * 1.25;

      // Animate surface ripples
      const wsPos = this.waterSurfaceGeo.attributes.position;
      for (let i = 0; i < wsPos.count; i++) {
        const ox = this.baseWaterSurfacePos[i * 3];
        const oz = this.baseWaterSurfacePos[i * 3 + 2];
        const d = Math.hypot(ox, oz);
        const wave = Math.sin(d * 16.0 - time * 12.0) * (0.02 * streamStrength) * Math.exp(-d * 2.0);
        wsPos.setY(i, wave);
      }
      this.waterSurfaceGeo.computeVertexNormals();
      this.waterSurfaceGeo.attributes.position.needsUpdate = true;

      // Bubbles churn and rise through liquid volume
      this.bubbleInstanced.visible = true;
      const currentSurfaceY = 0.35 + fillAmount * 1.25;
      for (let i = 0; i < this.bubbleCount; i++) {
        const bd = this.bubbleData[i];
        bd.y += bd.speed * (0.8 + streamStrength * 0.8);
        if (bd.y > currentSurfaceY) {
          bd.y = 0.38;
        }
        const wobble = Math.sin(time * 6 + bd.seed) * 0.02;
        bDummy.position.set(bd.x + wobble, bd.y, bd.z);
        const isActive = bd.y <= currentSurfaceY;
        bDummy.scale.setScalar(isActive ? 0.4 + Math.sin(time * 3 + i) * 0.2 : 0);
        bDummy.updateMatrix();
        this.bubbleInstanced.setMatrixAt(i, bDummy.matrix);
      }
      this.bubbleInstanced.instanceMatrix.needsUpdate = true;

      this.spillMat.opacity = 0;
      this.splashInstanced.visible = false;

      this.group.position.set(0.5 - t * 0.1, 0, 0);
      this.group.rotation.set(0, 0.4 + t * 0.3, 0);
      this.group.scale.setScalar(1);
    }
    // -------------------------------------------------------------
    // STAGE 3: GLASS ROTATION & INERTIAL TILT (0.35 to 0.50)
    // -------------------------------------------------------------
    else if (p < 0.50) {
      const t = (p - 0.35) / 0.15;
      this.firstDropMesh.visible = false;
      this.pourStreamMesh.scale.set(1, 0.001, 1);
      this.pourStreamMat.opacity = 0;

      // Smooth cinematic tilt around Z (-0.68 rad / ~39 deg)
      const targetTilt = t * -0.68;
      this.group.rotation.set(0, 0.7 + t * 0.6, targetTilt);
      this.group.position.set(0.4 + t * 0.3, t * 0.12, 0);

      // --- INERTIAL FLUID COUNTER-TILT ---
      // Liquid surface seeks gravity (stays level in world space), with inertial lag
      const targetSlosh = -targetTilt;
      const sloshDiff = targetSlosh - this.currentSloshAngle;
      this.sloshVelocity += sloshDiff * 14.0 * dt;
      this.sloshVelocity *= 0.88; // Damping
      this.currentSloshAngle += this.sloshVelocity * dt;

      this.waterSurfaceMesh.visible = true;
      this.waterSurfaceMesh.rotation.z = this.currentSloshAngle;
      this.waterSurfaceMesh.position.y = 1.48;

      // Micro-sloshing ripples on tilted surface
      const wsPos = this.waterSurfaceGeo.attributes.position;
      for (let i = 0; i < wsPos.count; i++) {
        const ox = this.baseWaterSurfacePos[i * 3];
        const oz = this.baseWaterSurfacePos[i * 3 + 2];
        const sloshWave = Math.sin(ox * 4.0 + time * 6.0) * 0.015 * t;
        wsPos.setY(i, sloshWave);
      }
      this.waterSurfaceGeo.computeVertexNormals();
      this.waterSurfaceGeo.attributes.position.needsUpdate = true;

      // Airborne leaping droplets
      this.splashInstanced.visible = true;
      for (let i = 0; i < this.splashCount; i++) {
        const sp = this.splashData[i];
        const leapT = (time * 0.6 + i * 0.09) % 1.0;
        const px = 0.7 + t * 0.7 + Math.cos(i) * 0.45 * leapT;
        const py = 1.45 + Math.sin(leapT * Math.PI) * 0.35 - leapT * 0.5;
        const pz = Math.sin(i) * 0.35;
        sDummy.position.set(px, py, pz);
        sDummy.scale.setScalar(sp.scale * t * (1 - leapT * 0.4));
        sDummy.updateMatrix();
        this.splashInstanced.setMatrixAt(i, sDummy.matrix);
      }
      this.splashInstanced.instanceMatrix.needsUpdate = true;

      this.spillMat.opacity = 0;
      this.group.scale.setScalar(1);
    }
    // -------------------------------------------------------------
    // STAGE 4: SPILL & WATER OVERFLOW (0.50 to 0.68)
    // -------------------------------------------------------------
    else if (p < 0.68) {
      const t = (p - 0.50) / 0.18;
      this.firstDropMesh.visible = false;
      this.pourStreamMesh.scale.set(1, 0.001, 1);

      // Glass reaches overflow angle (-1.35 rad / ~77 deg)
      const tilt = -0.68 - t * 0.67;
      this.group.rotation.set(0, 1.3 + t * 0.3, tilt);
      this.group.position.set(0.7 + t * 0.3, 0.12 - t * 0.18, 0);

      // Water volume steadily empties
      const remainingWater = Math.max(0.12, 0.94 - t * 0.75);
      this.waterMesh.scale.set(1, remainingWater, 1);

      // Spilling cascade activates and flows
      this.spillMat.opacity = Math.min(1.0, t * 1.8);

      // Active rushing droplets over the rock channel
      this.splashInstanced.visible = true;
      for (let i = 0; i < this.splashCount; i++) {
        const flowT = (time * 1.6 + i * 0.08) % 1.0;
        const px = 1.0 + flowT * 2.3 + (Math.random() - 0.5) * 0.08;
        const py = 1.2 - flowT * 1.65;
        const pz = (Math.sin(i * 2 + time * 3) * 0.25) * (1 - flowT * 0.5);
        sDummy.position.set(px, py, pz);
        sDummy.scale.setScalar(0.4 * (1 - flowT * 0.3));
        sDummy.updateMatrix();
        this.splashInstanced.setMatrixAt(i, sDummy.matrix);
      }
      this.splashInstanced.instanceMatrix.needsUpdate = true;

      this.group.scale.setScalar(1);
    }
    // -------------------------------------------------------------
    // STAGE 5: STREAM UNIFICATION (0.68 to 0.82)
    // -------------------------------------------------------------
    else if (p < 0.82) {
      const t = (p - 0.68) / 0.14;
      // The glass gently recedes into the mountain promontory background
      const fade = Math.max(0, 1 - t * 1.4);
      this.group.scale.setScalar(fade);
      this.spillMat.opacity = Math.max(0, 1 - t * 1.6);
      this.splashInstanced.visible = t < 0.35;
    }
    // -------------------------------------------------------------
    // STAGE 6 & 7: WIDE CINEMATIC LANDSCAPE
    // -------------------------------------------------------------
    else {
      this.group.scale.setScalar(0);
      this.spillMat.opacity = 0;
      this.splashInstanced.visible = false;
    }
  }
}
