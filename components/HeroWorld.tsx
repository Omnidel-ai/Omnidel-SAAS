"use client";

import { AnimatePresence, animate, motion, useReducedMotion, type Variants } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import view from "@/content/globe.json";
import { acharyas, heroWorld } from "@/content/site";
import { Icon } from "./Icon";
import { enterSpring } from "./Motion";

const RAD = Math.PI / 180;
const ease = [0.23, 1, 0.32, 1] as const;

/* ── The globe: one fragment shader that ray-casts a sphere ─────────────────
   It mirrors `render` in scripts/hero-footage/build_hero.py, which draws the
   still (public/hero/globe.webp) shown before WebGL starts: change both. */

const VERT = "attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }";
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_day;
uniform sampler2D u_clouds;
uniform vec2 u_res;
uniform float u_lon;
uniform float u_lat;
uniform float u_roll;
uniform float u_cloud;
uniform vec3 u_light;
uniform vec3 u_clear;
uniform vec2 u_clearR;
const float PI = 3.14159265;

float water(vec3 c) {
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  return smoothstep(0.02, 0.09, c.b - max(c.r, c.g) * 0.9) * (1.0 - smoothstep(0.5, 0.7, lum));
}

void main() {
  vec2 p = gl_FragCoord.xy / u_res * 2.0 - 1.0;
  float r2 = dot(p, p);
  float alpha = 1.0 - smoothstep(1.0 - 3.0 / u_res.x, 1.0, sqrt(r2));
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }
  float z = sqrt(max(0.0, 1.0 - r2));
  vec2 rp = vec2(p.x * cos(u_roll) - p.y * sin(u_roll), p.x * sin(u_roll) + p.y * cos(u_roll));
  vec3 q = vec3(rp.x, rp.y * cos(u_lat) + z * sin(u_lat), -rp.y * sin(u_lat) + z * cos(u_lat));
  float lat = asin(clamp(q.y, -1.0, 1.0));
  float lon = atan(q.x, q.z) + u_lon;
  vec2 uv = vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);

  vec3 col = texture2D(u_day, uv).rgb;
  float w = water(col);
  vec3 surface = vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));
  float clearing = 1.0 - smoothstep(u_clearR.x, u_clearR.y, acos(clamp(dot(surface, u_clear), -1.0, 1.0)));
  float cloud = texture2D(u_clouds, vec2(uv.x + u_cloud, uv.y)).r * (1.0 - 0.85 * clearing);

  vec3 n = vec3(p, z);
  float diff = smoothstep(-0.3, 1.0, dot(n, u_light));
  col *= 0.40 + 0.78 * diff;
  vec3 h = normalize(u_light + vec3(0.0, 0.0, 1.0));
  float nh = max(dot(n, h), 0.0);
  col += vec3(1.0, 0.96, 0.88) * (pow(nh, 60.0) * (0.12 + 0.6 * w) + pow(nh, 6.0) * 0.06);
  col = mix(col, vec3(0.55 + 0.55 * diff), cloud * 0.88);
  col = mix(col, vec3(0.62, 0.80, 1.0) * (0.75 + 0.45 * diff), pow(1.0 - z, 2.6) * 0.62);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * alpha, alpha);
}`;

function compile(gl: WebGLRenderingContext) {
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = shader(gl.VERTEX_SHADER, VERT);
  const fs = shader(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  return gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null;
}

function upload(gl: WebGLRenderingContext, img: HTMLImageElement, unit: number) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
  if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
}

function load(src: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img.decode().then(() => img);
}

/** Where the globe faces at time t (seconds): it sways a few degrees either side of India. */
const lonAt = (t: number) => (view.lon + view.sway * Math.sin((2 * Math.PI * t) / view.swaySeconds)) * RAD;

function Globe({ enabled, running, onTurn }: { enabled: boolean; running: boolean; onTurn: (lon: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const loop = useRef<{ start: () => void; stop: () => void } | null>(null);
  const turn = useRef(onTurn);
  const [live, setLive] = useState(false);

  useEffect(() => {
    turn.current = onTurn;
  }, [onTurn]);

  useEffect(() => {
    const c = canvas.current;
    const el = box.current;
    if (!enabled || !c || !el) return;
    const gl = c.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    const prog = gl && compile(gl);
    if (!gl || !prog) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const light = view.light.map((v) => v / Math.hypot(...view.light));
    const india = { lat: 22 * RAD, lon: 80 * RAD };
    gl.uniform1i(u("u_day"), 0);
    gl.uniform1i(u("u_clouds"), 1);
    gl.uniform1f(u("u_lat"), view.lat * RAD);
    gl.uniform1f(u("u_roll"), view.roll * RAD);
    gl.uniform3f(u("u_light"), light[0], light[1], light[2]);
    gl.uniform3f(u("u_clear"), Math.cos(india.lat) * Math.sin(india.lon), Math.sin(india.lat), Math.cos(india.lat) * Math.cos(india.lon));
    gl.uniform2f(u("u_clearR"), 16 * 0.6 * RAD, 16 * 1.4 * RAD);
    const uLon = u("u_lon");
    const uCloud = u("u_cloud");
    const uRes = u("u_res");

    let ready = false;
    let disposed = false;
    let raf = 0;
    let t = 0;
    let last = 0;
    const draw = () => {
      if (!ready) return;
      const lon = lonAt(t);
      gl.uniform1f(uLon, lon);
      gl.uniform1f(uCloud, t / view.cloudSeconds);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      turn.current(lon);
    };
    const tick = (now: number) => {
      t += Math.min(0.1, (now - last) / 1000);
      last = now;
      draw();
      raf = requestAnimationFrame(tick);
    };
    const fit = () => {
      const s = Math.max(2, Math.round(el.clientWidth * Math.min(2, window.devicePixelRatio || 1)));
      if (c.width !== s) {
        c.width = c.height = s;
        gl.viewport(0, 0, s, s);
        gl.uniform2f(uRes, s, s);
      }
      draw();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    loop.current = {
      start: () => {
        if (raf || !ready) return;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      },
      stop: () => {
        cancelAnimationFrame(raf);
        raf = 0;
      },
    };
    const lost = (e: Event) => {
      e.preventDefault();
      loop.current?.stop();
      ready = false;
      setLive(false);
    };
    c.addEventListener("webglcontextlost", lost);

    Promise.all([load(heroWorld.globe.day), load(heroWorld.globe.clouds)])
      .then(([day, clouds]) => {
        if (disposed) return;
        upload(gl, day, 0);
        upload(gl, clouds, 1);
        ready = true;
        fit();
        setLive(true);
      })
      .catch(() => {}); // keep the still

    return () => {
      disposed = true;
      ro.disconnect();
      cancelAnimationFrame(raf);
      c.removeEventListener("webglcontextlost", lost);
      loop.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (running && live) loop.current?.start();
    else loop.current?.stop();
  }, [running, live]);

  return (
    <div className="od-world__globe" ref={box}>
      <span className="od-world__halo" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="od-world__still"
        src={heroWorld.globe.still}
        srcSet={`${heroWorld.globe.still400} 400w, ${heroWorld.globe.still} 800w`}
        sizes="(max-width: 560px) 220px, 420px"
        alt=""
        data-hidden={live || undefined}
      />
      <canvas ref={canvas} className="od-world__canvas" data-live={live || undefined} />
    </div>
  );
}

/* ── Threads of light from Indian cities to the phone ─────────────────────── */

/** A point on the globe, in the globe's own -1..1 frame (y up; z > 0 faces us). The inverse of the shader's mapping. */
function project(lat: number, lon: number, lon0: number) {
  const lr = lon - lon0;
  const qx = Math.cos(lat) * Math.sin(lr);
  const qy = Math.sin(lat);
  const qz = Math.cos(lat) * Math.cos(lr);
  const la = view.lat * RAD;
  const ro = view.roll * RAD;
  const ry = qy * Math.cos(la) - qz * Math.sin(la);
  const z = qy * Math.sin(la) + qz * Math.cos(la);
  return { x: qx * Math.cos(ro) + ry * Math.sin(ro), y: -qx * Math.sin(ro) + ry * Math.cos(ro), z };
}

const CITIES = view.cities.map((c) => ({ name: c.name, lat: c.lat * RAD, lon: c.lon * RAD }));
const LIVE = CITIES.findIndex((c) => c.name === heroWorld.live);

/* ── The phone and its screens ────────────────────────────────────────────── */

const SCREENS = ["brand", "list", "task", "pay"] as const;
type Screen = (typeof SCREENS)[number];
const SCREEN_MS: Record<Screen, number> = { brand: 5000, list: 5000, task: 3400, pay: 3800 };

const pageV: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
const itemV: Variants = {
  hidden: { opacity: 0, transform: "translateY(40%)" },
  shown: { opacity: 1, transform: "translateY(0%)", transition: { duration: 0.55, ease } },
};
const popV: Variants = {
  hidden: { opacity: 0, transform: "scale(0.6)" },
  shown: { opacity: 1, transform: "scale(1)", transition: { type: "spring", duration: 0.5, bounce: 0.35 } },
};

const thumb = (photo?: string) => photo?.replace(/^\/acharyas\/(?:acharya-)?(\w+)\.\w+$/, "/hero/av-$1.webp");
const roster = acharyas.map((a) => ({
  name: a.name.endsWith("Ji") ? a.name : `${a.name} Acharya`,
  field: a.field,
  photo: thumb(a.photo),
}));

function Bar() {
  return (
    <div className="od-scr__bar">
      <span>9:41</span>
      <svg viewBox="0 0 36 12" aria-hidden="true">
        <rect x="0" y="8" width="3" height="4" rx=".8" />
        <rect x="4.6" y="6" width="3" height="6" rx=".8" />
        <rect x="9.2" y="3.5" width="3" height="8.5" rx=".8" />
        <rect x="13.8" y="1" width="3" height="11" rx=".8" />
        <rect x="21" y="1.5" width="12.5" height="9" rx="2.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <rect x="22.8" y="3.3" width="7.4" height="5.4" rx="1.3" />
        <rect x="34.2" y="4.6" width="1.4" height="2.8" rx=".6" />
      </svg>
    </div>
  );
}

/** The app's tab bar, with the screen's own tab lit. */
function Tabs({ on }: { on: number }) {
  return (
    <div className="od-scr__tabs">
      {heroWorld.phone.tabs.map((t, i) => (
        <span key={t.label} data-on={i === on || undefined}>
          <Icon name={t.icon} />
          {t.label}
        </span>
      ))}
    </div>
  );
}

function Count({ to, decimals = 0, delay = 0, duration = 1.1 }: { to: number; decimals?: number; delay?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const c = animate(0, to, { duration, delay, ease, onUpdate: (v) => (el.textContent = v.toFixed(decimals)) });
    return () => c.stop();
  }, [to, decimals, delay, duration]);
  return <span ref={ref}>{(0).toFixed(decimals)}</span>;
}

function Approve() {
  const t = heroWorld.phone.task;
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setOk(true), 2000);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <motion.span className="od-scr__btn" data-ok={ok || undefined} variants={itemV}>
      {ok ? `✓ ${t.approved}` : t.approve}
    </motion.span>
  );
}

function ScreenView({ screen, first }: { screen: Screen; first: boolean }) {
  const p = heroWorld.phone;
  const init = first ? false : "hidden";
  if (screen === "brand")
    return (
      <motion.div className="od-scr od-scr--brand" variants={pageV} initial={init} animate="shown">
        <motion.b className="od-scr__word" variants={itemV}>
          {p.brand}
        </motion.b>
        <motion.i
          className="od-scr__rule"
          variants={{ hidden: { opacity: 0, transform: "scaleX(0)" }, shown: { opacity: 1, transform: "scaleX(1)", transition: { duration: 0.8, ease } } }}
        />
        <motion.span className="od-scr__tag" variants={itemV}>
          {p.tagline}
        </motion.span>
      </motion.div>
    );
  if (screen === "list")
    return (
      <motion.div className="od-scr" variants={pageV} initial={init} animate="shown">
        <Bar />
        <motion.b className="od-scr__h" variants={itemV}>
          {p.list.title}
        </motion.b>
        <motion.span className="od-scr__sub" variants={itemV}>
          {p.list.sub}
        </motion.span>
        <div className="od-scr__list">
          {roster.map((a, i) => (
            <motion.div className={`od-scr__row${i === 2 ? " od-scr__row--tap" : ""}`} key={a.name} variants={itemV}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {a.photo && <img src={a.photo} alt="" width={48} height={48} />}
              <span>
                <b>{a.name}</b>
                <small>{a.field}</small>
              </span>
              <i />
            </motion.div>
          ))}
        </div>
        <Tabs on={1} />
      </motion.div>
    );
  if (screen === "task")
    return (
      <motion.div className="od-scr" variants={pageV} initial={init} animate="shown">
        <Bar />
        <motion.b className="od-scr__h od-scr__h--sm" variants={itemV}>
          {p.task.title}
        </motion.b>
        <motion.span className="od-scr__sub" variants={itemV}>
          {p.task.meta}
        </motion.span>
        <motion.span className="od-scr__label" variants={itemV}>
          {p.task.proof}
        </motion.span>
        <div className="od-scr__shots">
          {[0, 1, 2].map((i) => (
            <motion.span className="od-scr__shot" key={i} variants={popV}>
              <motion.i
                initial={{ opacity: 0, transform: "scale(0)" }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                transition={{ type: "spring", duration: 0.45, bounce: 0.4, delay: 0.5 + i * 0.16 }}
              >
                ✓
              </motion.i>
            </motion.span>
          ))}
        </div>
        <motion.div className="od-scr__score" variants={itemV}>
          <small>{p.task.scoreLabel}</small>
          <b>
            <Count to={p.task.score} decimals={1} delay={0.75} duration={0.9} />
            <span className="od-scr__of"> / 10</span>
          </b>
          <i>
            <motion.i
              initial={{ transform: "scaleX(0)" }}
              animate={{ transform: `scaleX(${p.task.score / 10})` }}
              transition={{ duration: 0.9, delay: 0.75, ease }}
            />
          </i>
        </motion.div>
        <motion.span className="od-scr__note" variants={itemV}>
          ✓ {p.task.note}
        </motion.span>
        <Approve />
        <Tabs on={2} />
      </motion.div>
    );
  return (
    <motion.div className="od-scr od-scr--pay" variants={pageV} initial={init} animate="shown">
      <Bar />
      <motion.span className="od-scr__label" variants={itemV}>
        {p.pay.who}
      </motion.span>
      <motion.b className="od-scr__amount" variants={itemV}>
        ₹<Count to={p.pay.amount} delay={0.4} />
      </motion.b>
      <motion.span className="od-scr__ok" variants={itemV}>
        ✓ {p.pay.note}
      </motion.span>
      <div className="od-scr__lines">
        {p.pay.lines.map((l) => (
          <motion.span key={l.label} variants={itemV}>
            {l.label}
            <b>{l.value}</b>
          </motion.span>
        ))}
      </div>
      <Tabs on={3} />
    </motion.div>
  );
}

/* ── Notifications beside the phone ───────────────────────────────────────── */

const NOTES = heroWorld.notes;
type Note = { key: number; i: number };
/** What shows before anything moves (and stays, with reduced motion): the first two, newest on top. */
const FIRST_NOTES: Note[] = [
  { key: -1, i: 1 },
  { key: -2, i: 0 },
];

function Notes({ running, max }: { running: boolean; max: number }) {
  const [list, setList] = useState<Note[]>(FIRST_NOTES);
  const next = useRef(2);
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      const k = next.current++;
      setList((l) => [{ key: k, i: k % NOTES.length }, ...l].slice(0, max));
    }, 2400);
    return () => window.clearTimeout(id);
  }, [running, list, max]);

  return (
    <div className="od-world__notes" style={{ "--n": max } as React.CSSProperties}>
      <AnimatePresence initial={false}>
        {list.slice(0, max).map((it, idx) => {
          const n = NOTES[it.i];
          return (
            <motion.div
              key={it.key}
              className="od-note"
              initial={{ opacity: 0, transform: "translate3d(-12%, -26%, 0) scale(0.94)" }}
              animate={{ opacity: idx === max - 1 ? 0.55 : 1, transform: `translate3d(0%, ${idx * 112}%, 0) scale(${1 - idx * 0.035})` }}
              exit={{ opacity: 0, transform: `translate3d(0%, ${max * 112}%, 0) scale(0.9)`, transition: { duration: 0.3 } }}
              transition={enterSpring}
            >
              <span className={`od-note__ico od-note__ico--${n.tone}`}>
                <Icon name={n.icon} />
              </span>
              <span className="od-note__txt">
                <b>{n.title}</b>
                <small>{n.text}</small>
              </span>
              <span className="od-note__time">{idx === 0 ? "now" : `${idx * 2}m`}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ── The whole scene ──────────────────────────────────────────────────────── */

/**
 * The hero's world: a WebGL globe turned to India, threads of light from four
 * Indian cities to a phone, the phone stepping through the OmniDEL app, and
 * notifications stacking up beside it. The first paint is static (the
 * globe's still, the phone's first screen, two notifications); then it moves,
 * only while on screen. One button pauses everything. With reduced motion it
 * stays as that first paint, threads drawn but still.
 */
export function HeroWorld() {
  preload(heroWorld.globe.still, {
    as: "image",
    fetchPriority: "high",
    imageSrcSet: `${heroWorld.globe.still400} 400w, ${heroWorld.globe.still} 800w`,
    imageSizes: "(max-width: 560px) 220px, 420px",
  });

  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const threads = useRef<(SVGPathElement | null)[]>([]);
  const pulses = useRef<(SVGPathElement | null)[]>([]);
  const pins = useRef<(SVGGElement | null)[]>([]);
  const tag = useRef<HTMLSpanElement>(null);
  const geo = useRef<{ gx: number; gy: number; gr: number; px: number; py: number } | null>(null);
  const lon = useRef(view.lon * RAD);

  // `reduce` is right from the first client render, but the server can't know it: markup goes by `still`
  // (set after mount, so it hydrates cleanly), the timers and WebGL by `reduce`.
  const [still, setStill] = useState(false);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [screen, setScreen] = useState<Screen>("brand");
  const [cycled, setCycled] = useState(false);
  const [maxNotes, setMaxNotes] = useState(3);
  const running = !reduce && !paused && onScreen;

  useEffect(() => setStill(Boolean(reduce)), [reduce]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The phone steps through its screens.
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      setCycled(true);
      setScreen((s) => SCREENS[(SCREENS.indexOf(s) + 1) % SCREENS.length]);
    }, SCREEN_MS[screen]);
    return () => window.clearTimeout(id);
  }, [running, screen]);

  // Threads: from each city on the globe's near side to the phone's left edge.
  const drawThreads = useCallback((lon0: number) => {
    lon.current = lon0;
    const g = geo.current;
    if (!g) return;
    CITIES.forEach((c, i) => {
      const p = project(c.lat, c.lon, lon0);
      const x = g.gx + p.x * g.gr;
      const y = g.gy - p.y * g.gr;
      const seen = p.z > 0.15;
      const dx = g.px - x;
      const d = seen
        ? `M${x.toFixed(1)} ${y.toFixed(1)}C${(x + dx * 0.45).toFixed(1)} ${(y - Math.abs(dx) * 0.28).toFixed(1)} ${(g.px - dx * 0.3).toFixed(1)} ${g.py.toFixed(1)} ${g.px.toFixed(1)} ${g.py.toFixed(1)}`
        : "";
      threads.current[i]?.setAttribute("d", d);
      pulses.current[i]?.setAttribute("d", d);
      const pin = pins.current[i];
      if (pin) {
        pin.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        pin.style.opacity = seen ? "1" : "0";
      }
      if (i === LIVE && tag.current) {
        tag.current.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        tag.current.style.opacity = seen ? "1" : "0";
      }
    });
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const s = el.getBoundingClientRect();
      const g = el.querySelector(".od-world__globe")?.getBoundingClientRect();
      const ph = phone.current?.getBoundingClientRect();
      if (!g || !ph || !s.width) return;
      geo.current = {
        gx: g.left - s.left + g.width / 2,
        gy: g.top - s.top + g.height / 2,
        gr: g.width / 2,
        px: ph.left - s.left + ph.width * 0.05,
        py: ph.top - s.top + ph.height * 0.8,
      };
      svg.current?.setAttribute("viewBox", `0 0 ${s.width.toFixed(1)} ${s.height.toFixed(1)}`);
      setMaxNotes(s.width < 480 ? 2 : 3);
      drawThreads(lon.current);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [drawThreads]);

  const ctl = paused ? { icon: "play", label: "Play the animation" } : { icon: "pause", label: "Pause the animation" };

  return (
    <div className="od-world" role="img" aria-label={heroWorld.label} data-paused={still || paused || !onScreen || undefined}>
      <div className="od-world__stage" ref={stage} aria-hidden="true">
        <span className="od-world__reflect" />
        <span className="od-world__shadow od-world__shadow--globe" />
        <span className="od-world__shadow od-world__shadow--phone" />
        <Globe enabled={!reduce} running={running} onTurn={drawThreads} />
        <svg className="od-world__threads" ref={svg} preserveAspectRatio="none">
          {CITIES.map((c, i) => (
            <g key={c.name}>
              <path className="od-world__thread" ref={(e) => void (threads.current[i] = e)} />
              <path
                className="od-world__pulse"
                ref={(e) => void (pulses.current[i] = e)}
                pathLength={100}
                style={{ animationDelay: `${i * -0.7}s`, animationDuration: `${2.4 + i * 0.35}s` }}
              />
              <g className="od-world__pin" ref={(e) => void (pins.current[i] = e)} style={{ opacity: 0 }}>
                <circle r="7" />
                <circle r="2.6" />
              </g>
            </g>
          ))}
        </svg>
        <span className="od-world__tag" ref={tag}>
          <i />
          {heroWorld.live}
        </span>
        <div className="od-ph" ref={phone}>
          <div className="od-ph__body">
            <span className="od-ph__island" />
            <div className="od-ph__screen">
              <AnimatePresence initial={false}>
                <motion.div
                  key={screen}
                  className="od-ph__page"
                  initial={{ opacity: 0, transform: "translateY(4%)" }}
                  animate={{ opacity: 1, transform: "translateY(0%)" }}
                  exit={{ opacity: 0, transform: "translateY(-3%)" }}
                  transition={{ duration: 0.6, ease }}
                >
                  <ScreenView screen={screen} first={!cycled} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        <Notes running={running} max={maxNotes} />
      </div>
      {!still && (
        <button type="button" className="od-world__ctl" onClick={() => setPaused((p) => !p)} aria-label={ctl.label} title={ctl.label}>
          <Icon name={ctl.icon} />
        </button>
      )}
    </div>
  );
}
