import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
 * "Lanes": a field of lines over rolling terrain, with small loads moving
 * along a few of them. The cursor raises the ground beneath it and a click
 * sends a pulse rippling outward. Everything is computed in the vertex shader,
 * so the CPU only updates a handful of uniforms per frame.
 */

const X_MIN = -16;
const X_MAX = 16;
const Z_FAR = -18;
const Z_NEAR = 5;

const PAPER = new THREE.Color("#e9ecee");
const INK = new THREE.Color("#18232b");
const SIGNAL = new THREE.Color("#f25c05");

// Ashima / Stefan Gustavson 2D simplex noise (MIT)
const NOISE = /* glsl */ `
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
`;

const TERRAIN = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform vec3 uPulse; // x, z, start time
${NOISE}
float gGlow;
float terrain(vec2 p){
  gGlow = 0.0;
  float h = snoise(p * 0.09 + vec2(0.0, uTime * 0.025)) * 1.25;
  h += snoise(p * 0.27 - vec2(uTime * 0.02, 0.0)) * 0.22;
  // the cursor lifts the ground beneath it
  vec2 d = p - uPointer;
  float lift = uPointerStrength * exp(-dot(d, d) * 0.22);
  h += lift * 1.5;
  gGlow += lift;
  // a click sends a ring outward
  float t = uTime - uPulse.z;
  if (t > 0.0 && t < 6.0) {
    float r = length(p - uPulse.xy);
    float ring = exp(-pow(r - t * 5.5, 2.0) * 1.2);
    float k = ring * exp(-t * 0.6);
    h += k * 0.9;
    gGlow += k * 1.4;
  }
  return h;
}
`;

const lineVertex = /* glsl */ `
${TERRAIN}
varying float vDepth;
varying float vEdge;
varying float vHeight;
varying float vGlow;
void main(){
  vec3 p = position;
  p.y = terrain(p.xz);
  vHeight = p.y;
  vGlow = clamp(gGlow, 0.0, 1.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = -mv.z;
  vEdge = 1.0 - smoothstep(${(X_MAX - 4).toFixed(1)}, ${X_MAX.toFixed(1)}, abs(p.x));
  gl_Position = projectionMatrix * mv;
}
`;

const lineFragment = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uSignal;
varying float vDepth;
varying float vEdge;
varying float vHeight;
varying float vGlow;
void main(){
  float fog = smoothstep(26.0, 6.0, vDepth);
  float lift = smoothstep(0.4, 1.8, vHeight) * 0.25;
  vec3 col = mix(uPaper, uInk, 0.55 + lift);
  col = mix(col, uSignal, smoothstep(0.08, 0.7, vGlow) * 0.9);
  gl_FragColor = vec4(col, fog * vEdge * (0.9 + vGlow * 0.1));
}
`;

const loadVertex = /* glsl */ `
${TERRAIN}
attribute float aOffset;
attribute float aSpeed;
uniform float uPixelRatio;
varying float vDepth;
void main(){
  float span = ${(X_MAX - X_MIN).toFixed(1)};
  float x = mod(aOffset + uTime * aSpeed, span) + ${X_MIN.toFixed(1)};
  vec3 p = vec3(x, 0.0, position.z);
  p.y = terrain(p.xz) + 0.04;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = -mv.z;
  gl_PointSize = 60.0 * uPixelRatio / vDepth;
  gl_Position = projectionMatrix * mv;
}
`;

const loadFragment = /* glsl */ `
uniform vec3 uSignal;
varying float vDepth;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float fog = smoothstep(26.0, 6.0, vDepth);
  gl_FragColor = vec4(uSignal, smoothstep(0.5, 0.35, d) * fog);
}
`;

function buildLanes(rows, segments) {
  const positions = new Float32Array(rows * segments * 3);
  const indices = [];
  for (let r = 0; r < rows; r++) {
    const z = Z_FAR + (Z_NEAR - Z_FAR) * (r / (rows - 1));
    for (let s = 0; s < segments; s++) {
      const i = r * segments + s;
      positions[i * 3] = X_MIN + (X_MAX - X_MIN) * (s / (segments - 1));
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = z;
      if (s < segments - 1) indices.push(i, i + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -6), 30);
  return geo;
}

function buildLoads(rows, count) {
  const positions = new Float32Array(count * 3);
  const offsets = new Float32Array(count);
  const speeds = new Float32Array(count);
  // deterministic pseudo-random so the layout is stable between renders
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    const row = Math.floor(rand() * rows);
    positions[i * 3 + 2] = Z_FAR + (Z_NEAR - Z_FAR) * (row / (rows - 1));
    offsets[i] = rand() * (X_MAX - X_MIN);
    speeds[i] = (0.6 + rand() * 1.4) * (rand() > 0.5 ? 1 : -1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
  geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -6), 30);
  return geo;
}

function Field({ input, compact, reducedMotion }) {
  const { camera, gl } = useThree();
  const rows = compact ? 30 : 46;
  const segments = compact ? 110 : 170;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uPulse: { value: new THREE.Vector3(0, -2, 0.6) }, // one pulse on load
      uInk: { value: INK },
      uPaper: { value: PAPER },
      uSignal: { value: SIGNAL },
      uPixelRatio: { value: gl.getPixelRatio() },
    }),
    [gl],
  );

  const lanes = useMemo(() => buildLanes(rows, segments), [rows, segments]);
  const loads = useMemo(() => buildLoads(rows, compact ? 40 : 70), [rows, compact]);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ground = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector2(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => () => { lanes.dispose(); loads.dispose(); }, [lanes, loads]);

  useFrame((_, delta) => {
    const u = uniforms;
    const dt = Math.min(delta, 0.05);
    // ambient drift stops under reduced motion; pointer response stays
    u.uTime.value += reducedMotion ? 0 : dt;

    // project the cursor onto the ground plane
    if (input.current.active) {
      raycaster.setFromCamera(input.current.ndc, camera);
      if (raycaster.ray.intersectPlane(ground, hit)) target.set(hit.x, hit.z);
    }
    u.uPointer.value.lerp(target, 1 - Math.pow(0.0015, dt));
    const want = input.current.active ? 1 : 0;
    u.uPointerStrength.value += (want - u.uPointerStrength.value) * (1 - Math.pow(0.02, dt));

    if (input.current.pulse) {
      u.uPulse.value.set(target.x, target.y, u.uTime.value);
      input.current.pulse = false;
    }

    // scrolling away tilts the view down over the field
    const s = input.current.scroll;
    // narrow screens look down at the field from higher so it fills the frame
    const baseY = compact ? 6.2 : 3.1;
    const baseLook = compact ? -2.2 : 0;
    camera.position.set(0, baseY + s * 3.5, 8.5 - s * 2.5);
    lookAt.set(0, baseLook - s * 1.5, -4 - s * 2);
    camera.lookAt(lookAt);
  });

  return (
    <>
      <lineSegments geometry={lanes} frustumCulled={false}>
        <shaderMaterial
          vertexShader={lineVertex}
          fragmentShader={lineFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </lineSegments>
      <points geometry={loads} frustumCulled={false}>
        <shaderMaterial
          vertexShader={loadVertex}
          fragmentShader={loadFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </>
  );
}

export default function Lanes({ surfaceRef, running, reducedMotion, compact }) {
  const input = useRef({ ndc: new THREE.Vector2(), active: false, pulse: false, scroll: 0 });

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;

    const toNdc = (clientX, clientY) => {
      const r = el.getBoundingClientRect();
      input.current.ndc.set(
        ((clientX - r.left) / r.width) * 2 - 1,
        -((clientY - r.top) / r.height) * 2 + 1,
      );
    };
    const move = (e) => {
      // ignore pointer over interactive text, so links stay easy to use
      if (e.target.closest("a, button")) {
        input.current.active = false;
        return;
      }
      toNdc(e.clientX, e.clientY);
      input.current.active = true;
    };
    const leave = () => { input.current.active = false; };
    const down = (e) => {
      if (e.target.closest("a, button")) return;
      toNdc(e.clientX, e.clientY);
      input.current.active = true;
      input.current.pulse = true;
    };
    const scroll = () => {
      input.current.scroll = Math.min(1, Math.max(0, window.scrollY / el.offsetHeight));
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    window.addEventListener("scroll", scroll, { passive: true });
    scroll();
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("scroll", scroll);
    };
  }, [surfaceRef]);

  return (
    <Canvas
      className="lanes-canvas"
      frameloop={running ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 42, near: 0.1, far: 60, position: [0, 3.1, 8.5] }}
      aria-hidden="true"
    >
      <Field input={input} compact={compact} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
