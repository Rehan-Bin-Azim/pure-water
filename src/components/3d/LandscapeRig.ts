import * as THREE from 'three';
import { createRockTextures, createMountainMaterial, createRiverMaterial } from './Materials';

export class LandscapeRig {
  public group: THREE.Group;

  // Rock Promontory where the glass sits
  public rockMesh: THREE.Mesh;
  public rockMaterial: THREE.MeshStandardMaterial;
  public puddleMesh: THREE.Mesh;

  // Rock Stream Channel connecting spill to river
  public streamChannelMesh: THREE.Mesh;
  public streamWaterMesh: THREE.Mesh;
  public streamWaterMat: THREE.MeshPhysicalMaterial;

  // Meandering Alpine River
  public riverMesh: THREE.Mesh;
  public riverMaterial: THREE.ShaderMaterial;

  // Mountains & Canyon Walls
  public mountainsMesh: THREE.Mesh;
  public mountainsMaterial: THREE.ShaderMaterial;
  public backgroundRidgeMesh: THREE.Mesh;

  // Instanced Pine Forest along valley banks and slopes
  public pineForestInstanced: THREE.InstancedMesh;
  private treeCount = 180;

  // Sun Disk for golden hour sunset
  public sunMesh: THREE.Mesh;
  public sunMaterial: THREE.MeshBasicMaterial;
  public sunHaloMesh: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();
    const { diffuse: rockDiff, bump: rockBump } = createRockTextures();

    // -------------------------------------------------------------
    // 1. ROCK PEDESTAL (Where Glass Sits & Spill Begins)
    // -------------------------------------------------------------
    const rockGeo = new THREE.CylinderGeometry(2.6, 3.6, 1.1, 40, 6);
    const rpos = rockGeo.attributes.position;
    for (let i = 0; i < rpos.count; i++) {
      const vx = rpos.getX(i);
      const vy = rpos.getY(i);
      const vz = rpos.getZ(i);
      // Sculpt layered basalt rock steps
      const noise = (Math.sin(vx * 3.2) * Math.cos(vz * 2.8) + Math.sin(vy * 3.5)) * 0.12;
      rpos.setXYZ(i, vx + noise, vy - 0.55 + noise * 0.4, vz + noise);
    }
    rockGeo.computeVertexNormals();

    this.rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x161a20,
      roughness: 0.55,
      metalness: 0.12,
      map: rockDiff,
      bumpMap: rockBump,
      bumpScale: 0.05,
    });
    this.rockMesh = new THREE.Mesh(rockGeo, this.rockMaterial);
    this.rockMesh.position.set(0.6, -0.55, 0);
    this.rockMesh.receiveShadow = true;
    this.group.add(this.rockMesh);

    // Wet water sheen under and around the glass
    const puddleGeo = new THREE.CircleGeometry(1.5, 32);
    puddleGeo.rotateX(-Math.PI / 2);
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x182430,
      roughness: 0.04,
      metalness: 0.85,
      transparent: true,
      opacity: 0.5,
    });
    this.puddleMesh = new THREE.Mesh(puddleGeo, puddleMat);
    this.puddleMesh.position.set(0.7, -0.01, 0.1);
    this.group.add(this.puddleMesh);

    // -------------------------------------------------------------
    // 2. CONNECTING STREAM WATERWAY (Carving from rock ledge down into river)
    // -------------------------------------------------------------
    // The physical stream spline connects the rock waterfall to the valley river
    const streamCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.1, -0.45, 0.28),
      new THREE.Vector3(3.8, -0.75, 0.4),
      new THREE.Vector3(4.4, -1.15, 0.6),
      new THREE.Vector3(4.8, -1.55, 0.8),
      new THREE.Vector3(5.0, -1.85, -2.5),
      new THREE.Vector3(4.2, -2.10, -6.0),
      new THREE.Vector3(2.5, -2.30, -10.0),
      new THREE.Vector3(0.0, -2.40, -15.0), // Joins the main river!
    ]);

    // Rock bed for the cascading tributary
    const channelGeo = new THREE.TubeGeometry(streamCurve, 50, 0.35, 12, false);
    const channelMat = new THREE.MeshStandardMaterial({
      color: 0x12151a,
      roughness: 0.8,
      metalness: 0.1,
    });
    this.streamChannelMesh = new THREE.Mesh(channelGeo, channelMat);
    this.streamChannelMesh.position.y = -0.1;
    this.group.add(this.streamChannelMesh);

    // Flowing water ribbon in the stream channel
    const streamWaterGeo = new THREE.TubeGeometry(streamCurve, 50, 0.22, 12, false);
    this.streamWaterMat = new THREE.MeshPhysicalMaterial({
      color: 0x88d8ff,
      transmission: 0.92,
      transparent: true,
      roughness: 0.06,
      ior: 1.333,
      clearcoat: 1.0,
      opacity: 0, // Awakens as spill reaches stream
    });
    this.streamWaterMesh = new THREE.Mesh(streamWaterGeo, this.streamWaterMat);
    this.group.add(this.streamWaterMesh);

    // -------------------------------------------------------------
    // 3. MEANDERING ALPINE RIVER
    // -------------------------------------------------------------
    const riverWidth = 18;
    const riverLength = 160;
    const riverGeo = new THREE.PlaneGeometry(riverWidth, riverLength, 80, 200);
    riverGeo.rotateX(-Math.PI / 2);

    // Give river a natural S-curve meander
    const rposArray = riverGeo.attributes.position;
    for (let i = 0; i < rposArray.count; i++) {
      const z = rposArray.getZ(i);
      // Gentle broad natural curve
      const meander = Math.sin(z * 0.045) * 6.5 + Math.cos(z * 0.02) * 2.8;
      rposArray.setX(i, rposArray.getX(i) + meander);
    }
    riverGeo.computeVertexNormals();

    this.riverMaterial = createRiverMaterial();
    this.riverMesh = new THREE.Mesh(riverGeo, this.riverMaterial);
    this.riverMesh.position.set(0, -2.42, -55);
    this.riverMesh.receiveShadow = true;
    this.group.add(this.riverMesh);

    // -------------------------------------------------------------
    // 4. MULTI-LAYER MOUNTAIN RANGES WITH SNOW CAPS
    // -------------------------------------------------------------
    const mtnGeo = new THREE.PlaneGeometry(220, 150, 110, 90);
    mtnGeo.rotateX(-Math.PI / 2);
    const mPos = mtnGeo.attributes.position;

    for (let i = 0; i < mPos.count; i++) {
      const x = mPos.getX(i);
      const z = mPos.getZ(i);

      // Distance from the river centerline
      const meander = Math.sin(z * 0.045) * 6.5 + Math.cos(z * 0.02) * 2.8;
      const distFromRiver = Math.abs(x - meander);

      let h = 0;
      if (distFromRiver > 8.5) {
        // Canyon slope rising from banks
        const slope = Math.pow((distFromRiver - 8.5) / 90.0, 1.35);
        // Multi-octave jagged mountain ridge noise
        const ridge1 = Math.sin(x * 0.09 + 1.2) * Math.cos(z * 0.08) * 6.5;
        const ridge2 = Math.sin(x * 0.22 - z * 0.14) * 3.2;
        const crags = Math.sin(x * 0.45 + z * 0.35) * 1.4;
        h = slope * 42.0 + ridge1 + ridge2 + crags;
      } else {
        // Valley floodplain
        h = -0.15 + (Math.random() - 0.5) * 0.08;
      }
      mPos.setY(i, h - 2.5);
    }
    mtnGeo.computeVertexNormals();

    this.mountainsMaterial = createMountainMaterial();
    this.mountainsMesh = new THREE.Mesh(mtnGeo, this.mountainsMaterial);
    this.mountainsMesh.position.set(0, 0, -55);
    this.mountainsMesh.receiveShadow = true;
    this.group.add(this.mountainsMesh);

    // Background distant majestic mountain silhouette
    const bgMtnGeo = new THREE.PlaneGeometry(280, 80, 80, 2);
    const bgPos = bgMtnGeo.attributes.position;
    for (let i = 0; i < bgPos.count; i++) {
      if (bgPos.getY(i) > 0) {
        const x = bgPos.getX(i);
        const peak = Math.sin(x * 0.05) * 14.0 + Math.sin(x * 0.12) * 6.0;
        bgPos.setY(i, bgPos.getY(i) + peak);
      }
    }
    bgMtnGeo.computeVertexNormals();
    const bgMtnMat = new THREE.MeshBasicMaterial({
      color: 0x0e1522,
      fog: true,
    });
    this.backgroundRidgeMesh = new THREE.Mesh(bgMtnGeo, bgMtnMat);
    this.backgroundRidgeMesh.position.set(0, 22, -140);
    this.group.add(this.backgroundRidgeMesh);

    // -------------------------------------------------------------
    // 5. INSTANCED CONIFER PINE FOREST
    // -------------------------------------------------------------
    // Cone tree silhouette
    const pineGeo = new THREE.ConeGeometry(0.7, 2.8, 6);
    pineGeo.translate(0, 1.4, 0);
    const pineMat = new THREE.MeshStandardMaterial({
      color: 0x0a1a12,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    this.pineForestInstanced = new THREE.InstancedMesh(pineGeo, pineMat, this.treeCount);
    const treeDummy = new THREE.Object3D();

    let planted = 0;
    let attempts = 0;
    while (planted < this.treeCount && attempts < 1000) {
      attempts++;
      const tz = -15 - Math.random() * 85;
      const meander = Math.sin(tz * 0.045) * 6.5 + Math.cos(tz * 0.02) * 2.8;
      const side = Math.random() > 0.5 ? 1 : -1;
      const dist = 9.5 + Math.random() * 45;
      const tx = meander + side * dist;

      // Height formula matching mountain slope
      const slope = Math.pow((dist - 8.5) / 90.0, 1.35);
      const ty = slope * 42.0 - 2.5 + Math.sin(tx * 0.09) * 4.0;

      // Only plant on accessible slopes, not sheer cliffs
      if (ty < 16.0 && ty > -2.4) {
        treeDummy.position.set(tx, ty, tz);
        const scale = 0.65 + Math.random() * 0.9;
        treeDummy.scale.set(scale, scale * (0.9 + Math.random() * 0.4), scale);
        treeDummy.rotation.y = Math.random() * Math.PI * 2;
        treeDummy.rotation.x = (Math.random() - 0.5) * 0.08;
        treeDummy.rotation.z = (Math.random() - 0.5) * 0.08;
        treeDummy.updateMatrix();
        this.pineForestInstanced.setMatrixAt(planted, treeDummy.matrix);
        planted++;
      }
    }
    this.pineForestInstanced.instanceMatrix.needsUpdate = true;
    this.pineForestInstanced.receiveShadow = true;
    this.group.add(this.pineForestInstanced);

    // -------------------------------------------------------------
    // 6. GOLDEN HOUR SUN & CORONA (Scene 7 payoff)
    // -------------------------------------------------------------
    const sunGeo = new THREE.SphereGeometry(4.2, 32, 32);
    this.sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd885,
      transparent: true,
      opacity: 0,
    });
    this.sunMesh = new THREE.Mesh(sunGeo, this.sunMaterial);
    this.sunMesh.position.set(8, 12, -95);
    this.group.add(this.sunMesh);

    // Soft glowing halo disk around sun
    const haloGeo = new THREE.RingGeometry(4.2, 14.0, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffb545,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.sunHaloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.sunHaloMesh.position.set(8, 12, -94);
    this.group.add(this.sunHaloMesh);
  }

  public update(p: number, time: number) {
    // Update River waves shader
    this.riverMaterial.uniforms.uTime.value = time;

    // Transition golden hour lighting ratio
    // From Scene 5 onwards (p >= 0.70), daylight warms into majestic golden hour
    let goldenRatio = 0.0;
    if (p > 0.70) {
      goldenRatio = Math.min(1.0, (p - 0.70) / 0.26);
    }
    this.riverMaterial.uniforms.uGoldenRatio.value = goldenRatio;
    this.mountainsMaterial.uniforms.uGoldenRatio.value = goldenRatio;

    // Stream water flow opacity
    if (p >= 0.50 && p < 0.85) {
      const st = Math.min(1.0, (p - 0.50) / 0.15);
      this.streamWaterMat.opacity = st * 0.95;
    } else if (p >= 0.85) {
      this.streamWaterMat.opacity = Math.max(0.0, 1.0 - (p - 0.85) / 0.12);
    } else {
      this.streamWaterMat.opacity = 0;
    }

    // Sun reveal in final scene
    if (p > 0.82) {
      const sunIn = Math.min(1.0, (p - 0.82) / 0.14);
      this.sunMaterial.opacity = sunIn * 0.95;
      (this.sunHaloMesh.material as THREE.MeshBasicMaterial).opacity = sunIn * 0.45;
      this.sunHaloMesh.lookAt(0, 10, 20);
    } else {
      this.sunMaterial.opacity = 0;
      (this.sunHaloMesh.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    // Atmospheric visibility of distant ridges
    if (p > 0.55) {
      const landscapeReveal = Math.min(1.0, (p - 0.55) / 0.20);
      this.mountainsMesh.visible = true;
      this.riverMesh.visible = true;
      this.pineForestInstanced.visible = true;
      this.mountainsMaterial.uniforms.uSunIntensity.value = 0.4 + landscapeReveal * 0.9;
    } else {
      // In early scenes, mountain meshes stay subtly veiled in dark background fog
      this.mountainsMaterial.uniforms.uSunIntensity.value = 0.1;
    }
  }
}
