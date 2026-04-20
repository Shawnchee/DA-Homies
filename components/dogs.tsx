"use client";

import { MutableRefObject, useEffect, useRef } from "react";
import * as THREE from "three";

const U = 0.22;
function vMat(col: number) {
  return new THREE.MeshLambertMaterial({ color: col });
}

function addCube(
  g: THREE.Group,
  x: number,
  y: number,
  z: number,
  m: THREE.Material,
  scale = 1,
) {
  const s = U * scale;
  const c = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), m);
  c.position.set(x * U, y * U, z * U);
  g.add(c);
  return c;
}

function fillEllipsoid(
  g: THREE.Group,
  cx: number,
  cy: number,
  cz: number,
  rx: number,
  ry: number,
  rz: number,
  paintFn: (x: number, y: number, z: number) => THREE.Material | null | undefined,
) {
  for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++) {
        const dx = (x - cx) / rx,
          dy = (y - cy) / ry,
          dz = (z - cz) / rz;
        if (dx * dx + dy * dy + dz * dz > 1.05) continue;
        const m = paintFn(x, y, z);
        if (m) addCube(g, x, y, z, m);
      }
    }
  }
}

/* Shared lower-body: solid jaw → neck → chest */
function addLowerBody(
  g: THREE.Group,
  jawMat: THREE.Material,
  chestMat: THREE.Material,
) {
  // y = -1 — bridge row matching skull width so the face doesn't pinch.
  for (let x = -3; x <= 1; x++)
    for (let z = -3; z <= 3; z++) {
      if (Math.abs(x) + Math.abs(z) <= 5) addCube(g, x, -1, z, jawMat);
    }
  // y = -2 — wide jaw back/mid, narrower under snout
  for (let x = -3; x <= 4; x++)
    for (let z = -3; z <= 3; z++) {
      const wideBack = x >= -3 && x <= 1 && Math.abs(x) + Math.abs(z) <= 5;
      const narrowFront = x >= 2 && x <= 4 && Math.abs(z) <= 2;
      if (wideBack || narrowFront) addCube(g, x, -2, z, jawMat);
    }
  // y = -3 — chin + upper chest
  for (let x = -3; x <= 4; x++)
    for (let z = -3; z <= 3; z++) {
      if (x >= 2 && Math.abs(z) <= 1) addCube(g, x, -3, z, jawMat);
      else if (x >= -2 && x <= 1 && Math.abs(x) + Math.abs(z) <= 4)
        addCube(g, x, -3, z, chestMat);
      else if (x === -3 && Math.abs(z) <= 1) addCube(g, x, -3, z, chestMat);
    }
  // y = -4 — fluffy chest
  for (let x = -2; x <= 1; x++)
    for (let z = -3; z <= 3; z++) {
      if (Math.abs(x) + Math.abs(z) > 4) continue;
      addCube(g, x, -4, z, chestMat);
    }
  // y = -5 — tapered
  for (let x = -1; x <= 0; x++)
    for (let z = -2; z <= 2; z++) addCube(g, x, -5, z, chestMat);
  addCube(g, 0, -6, 0, chestMat);
}

/* ^_^ smile eyes — 4 small blocks per side */
function addSmileEye(
  g: THREE.Group,
  mat: THREE.Material,
  x: number,
  y: number,
  zSide: 1 | -1,
) {
  const z = 2.05 * zSide * U;
  const center = new THREE.Mesh(
    new THREE.BoxGeometry(U * 0.55, U * 0.22, U * 0.18),
    mat,
  );
  center.position.set(x * U, (y - 0.12) * U, z);
  g.add(center);
  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(U * 0.22, U * 0.22, U * 0.18),
    mat,
  );
  inner.position.set((x - 0.42) * U, (y + 0.08) * U, z);
  g.add(inner);
  const outer = new THREE.Mesh(
    new THREE.BoxGeometry(U * 0.22, U * 0.22, U * 0.18),
    mat,
  );
  outer.position.set((x + 0.42) * U, (y + 0.08) * U, z);
  g.add(outer);
  const lash = new THREE.Mesh(
    new THREE.BoxGeometry(U * 0.35, U * 0.08, U * 0.15),
    mat,
  );
  lash.position.set(x * U, (y + 0.22) * U, z);
  g.add(lash);
}

function addCheek(
  g: THREE.Group,
  x: number,
  y: number,
  z: number,
  side: number,
) {
  const c = new THREE.Mesh(
    new THREE.BoxGeometry(U * 1.0, U * 0.7, U * 0.12),
    new THREE.MeshBasicMaterial({
      color: 0xf5a5b0,
      transparent: true,
      opacity: 0.75,
    }),
  );
  c.position.set(x * U, y * U, z * U * side);
  g.add(c);
}

/* ============================================================
   HUSKY — the hero character. Voxel-pixel style, full face.
   ============================================================ */
function buildHusky() {
  const g = new THREE.Group();

  const DARK = vMat(0x3a3633);
  const GREY = vMat(0x6e6a64);
  const MASK = vMat(0x2a2623);
  const LIGHT = vMat(0xf1ebde);
  const WHITE = vMat(0xfbf7ec);
  const BLACK = vMat(0x100c08);
  const PINK = vMat(0xe89098);

  // --- skull (top dark, face light) ---
  fillEllipsoid(g, 0, 1.5, 0, 3.6, 3.3, 3.4, (x, y, z) => {
    if (y >= 2 && Math.abs(z) <= 3) return DARK;
    if (x >= 1 && Math.abs(z) === 0 && y >= 1) return LIGHT;
    if (x === 2 && Math.abs(z) === 1 && y >= 2) return LIGHT;
    if (y === 2 && Math.abs(z) === 2) return MASK;
    if (y <= 0) return LIGHT;
    if (Math.abs(z) >= 3) return DARK;
    if (y === 1 && Math.abs(z) >= 2) return GREY;
    return DARK;
  });

  // back head (closed dome)
  fillEllipsoid(g, -2, 1, 0, 2, 2.5, 2.8, () => DARK);

  // --- TOP-BACK + CROWN FILLER — closes every gap between the two
  // ellipsoids (skull + back-head) so the back dome and the crown between
  // the ears read as one solid mass.
  // back-top dome
  for (let z = -2; z <= 2; z++) addCube(g, -3, 2, z, DARK);
  for (let z = -2; z <= 2; z++) addCube(g, -3, 3, z, DARK);
  for (let z = -1; z <= 1; z++) addCube(g, -4, 2, z, DARK);
  for (let z = -1; z <= 1; z++) addCube(g, -3, 4, z, DARK);
  addCube(g, -4, 3, 0, DARK);
  // crown between the ears (x=-2..1, y=4, z=-1..1)
  for (let x = -2; x <= 1; x++)
    for (let z = -1; z <= 1; z++) addCube(g, x, 4, z, DARK);
  // side-top fluff so ears don't look disconnected
  for (let x = -2; x <= 0; x++) {
    addCube(g, x, 4, 2, DARK);
    addCube(g, x, 4, -2, DARK);
  }
  // rounded crown peak — three-cube dome instead of two for a smooth top
  for (let x = -2; x <= 1; x++) addCube(g, x, 5, 0, DARK);
  addCube(g, -1, 5, 1, DARK);
  addCube(g, 0, 5, 1, DARK);
  addCube(g, -1, 5, -1, DARK);
  addCube(g, 0, 5, -1, DARK);
  addCube(g, -1, 6, 0, DARK);
  addCube(g, 0, 6, 0, DARK);
  // between-ear bridge at y=3 (z=0..±1) — removes valley look between ears
  for (let x = -2; x <= 0; x++)
    for (let z = -1; z <= 1; z++) addCube(g, x, 3, z, DARK);
  // extra side bulk at y=2..3 to make the mask read as a proper skull cap
  for (let x = -3; x <= 1; x++) {
    addCube(g, x, 3, 3, DARK);
    addCube(g, x, 3, -3, DARK);
  }
  // back-neck fluff connecting skull down to chest
  for (let x = -3; x <= -2; x++)
    for (let z = -2; z <= 2; z++) {
      if (Math.abs(z) <= 2) addCube(g, x, 0, z, DARK);
    }
  addCube(g, -4, 1, 0, DARK);
  addCube(g, -4, 0, 0, DARK);

  // --- wedge snout ---
  fillEllipsoid(g, 3.3, -0.3, 0, 2.3, 1.8, 1.9, (x, y, z) => {
    if (y === 1 && Math.abs(z) <= 1) return GREY;
    if (y <= -1) return WHITE;
    if (Math.abs(z) >= 2) return LIGHT;
    return LIGHT;
  });

  addLowerBody(g, WHITE, WHITE);

  // --- nose ---
  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(U * 1.5, U * 1.1, U * 1.6),
    BLACK,
  );
  nose.position.set(5.4 * U, 0.2 * U, 0);
  g.add(nose);
  const noseTop = new THREE.Mesh(
    new THREE.SphereGeometry(U * 0.65, 14, 10),
    BLACK,
  );
  noseTop.position.set(5.4 * U, 0.65 * U, 0);
  noseTop.scale.set(1, 0.5, 1);
  g.add(noseTop);
  const noseShine = new THREE.Mesh(
    new THREE.BoxGeometry(U * 0.26, U * 0.2, U * 0.4),
    vMat(0x555048),
  );
  noseShine.position.set(5.8 * U, 0.5 * U, 0.45 * U);
  g.add(noseShine);

  // --- mouth smile ---
  addCube(g, 5, -0.7, 0, BLACK, 0.4);
  addCube(g, 4.6, -1, 0.9, BLACK, 0.4);
  addCube(g, 4.6, -1, -0.9, BLACK, 0.4);
  addCube(g, 4.2, -1.2, 1.2, BLACK, 0.35);
  addCube(g, 4.2, -1.2, -1.2, BLACK, 0.35);

  // tongue peek
  const tongue = new THREE.Mesh(
    new THREE.BoxGeometry(U * 0.55, U * 0.22, U * 0.9),
    PINK,
  );
  tongue.position.set(4.8 * U, -1.45 * U, 0);
  g.add(tongue);

  // --- prick ears ---
  const mkEar = (zSide: number) => {
    const ear = new THREE.Group();
    for (let dz = -1; dz <= 1; dz++)
      for (let dx = -1; dx <= 0; dx++) addCube(ear, dx, 0, dz, DARK);
    for (let dz = -1; dz <= 0; dz++)
      for (let dx = -1; dx <= 0; dx++) addCube(ear, dx, 1, dz, DARK);
    addCube(ear, -0.5, 2, -0.5, DARK);
    addCube(ear, -0.5, 2.7, -0.5, DARK, 0.7);
    addCube(ear, 0, 0, 0, LIGHT, 0.7);
    addCube(ear, 0, 1, -0.3, PINK, 0.55);

    ear.position.set(-1.5 * U, 3.5 * U, zSide * 2.4 * U);
    ear.rotation.z = zSide > 0 ? -0.04 : 0.04;
    return ear;
  };
  g.add(mkEar(1));
  g.add(mkEar(-1));

  // ear-base attachment blocks (anchors ears to skull)
  addCube(g, -1.5, 3, 2.2, DARK);
  addCube(g, -1.5, 3, -2.2, DARK);
  addCube(g, -1, 3.2, 2, DARK);
  addCube(g, -1, 3.2, -2, DARK);

  // happy closed smile-eyes (subtle blue tint)
  addSmileEye(g, vMat(0x14202a), 2.5, 2.1, 1);
  addSmileEye(g, vMat(0x14202a), 2.5, 2.1, -1);

  // eyebrow tufts
  addCube(g, 1.8, 3, 2, LIGHT, 0.7);
  addCube(g, 1.8, 3, -2, LIGHT, 0.7);

  // pink cheek blush
  addCheek(g, 2.3, 0.4, 3.05, 1);
  addCheek(g, 2.3, 0.4, 3.05, -1);

  return g;
}

export interface MousePosition {
  x: number;
  y: number;
}

export function HeroDog({
  mouseRef,
  size = 720,
}: {
  mouseRef?: MutableRefObject<MousePosition>;
  size?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = size,
      H = size;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
    camera.position.set(5.8, 1.4, 5.8);
    camera.lookAt(0.1, -0.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xfff6ea, 0.62));
    const key = new THREE.DirectionalLight(0xfff0d0, 1.35);
    key.position.set(5, 8, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xcfe4ff, 0.6);
    fill.position.set(-5, 2, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xc7d2fe, 0.5);
    rim.position.set(-3, 4, -5);
    scene.add(rim);

    const root = new THREE.Group();
    scene.add(root);
    root.add(buildHusky());

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.7, 48),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.12,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.55;
    scene.add(shadow);

    root.rotation.y = -0.22;

    let frame = 0,
      raf = 0;
    const tick = () => {
      frame += 1;
      const m =
        mouseRef && mouseRef.current ? mouseRef.current : { x: 0.5, y: 0.45 };
      const mx = m.x,
        my = m.y;

      const targetY = (mx - 0.5) * 1.0 - 0.18;
      const targetX = (0.5 - my) * 0.5;
      root.rotation.y += (targetY - root.rotation.y) * 0.075;
      root.rotation.x += (targetX - root.rotation.x) * 0.075;

      root.position.y = Math.sin(frame * 0.028) * 0.035;
      root.rotation.z = Math.sin(frame * 0.015) * 0.025;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material;
        if (mat) {
          if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
          else (mat as THREE.Material).dispose();
        }
      });
    };
  }, [size, mouseRef]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size, position: "relative" }}
    />
  );
}
