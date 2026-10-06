/* ==========================================================
   Ramo de tulipanes · script.js

   1) Para cambiar el texto, edita DEDICATORIA aquí abajo.
   2) O mándalo por el enlace, sin tocar el código:
        index.html?para=Camila&mensaje=Feliz%20cumple&firma=Tu%20nombre
   ========================================================== */

(() => {
  'use strict';

  /* ---------- 1. TEXTO ---------- */

  const DEDICATORIA = {
    para: 'Mi Pequeño Lirio 🌷',                       // sale como "Para ti"
    mensaje: 'No sé en qué momento, entre conversaciones, risas y casualidades, te convertiste en alguien que mi corazón empezó a elegir sin pensarlo. ' +
             'Llegaste cuando yo ya había aprendido que no todo lo que se quiere debe quedarse, y entonces apareciste tú, demostrándome que también existe alguien con quien querer quedarse. ' +
             'Mi pequeño lirio, si alguna vez dudas de lo que siento, quiero que recuerdes esto: no te elegí por un momento ni por una emoción pasajera. Te elegí porque contigo quiero descubrir todo lo que todavía nos queda por vivir. ' +
             'Quiero estar en tus días buenos, en tus días difíciles, en tus risas tontas y en esos silencios que algún día ya no necesitarán palabras. ' +
             'No sé qué nos depara el futuro, pero sí sé algo: quiero caminar hacia él contigo. ' +
             'Porque entre tantas personas, tantas historias y tantos caminos, ¡qué bonito fue encontrarte! ' +
             'Y si la vida nos permite escribir muchísimas páginas más, quiero que en todas ellas aparezca tu nombre junto al mío. ' +
             'Te quiero, pequeño lirio🌷. Y si este código te trajo hasta estas palabras, espero que también te recuerde algo que quizá no te digo suficientes veces: ' +
             'Eres una de las partes más bonitas de la historia que estoy escribiendo🌷.',
    firma: 'Con cariño: Tu papacito',             // déjalo vacío ('') si no quieres firma
  };

  const consulta = new URLSearchParams(window.location.search);
  ['para', 'mensaje'].forEach(clave => {
    const valor = (consulta.get(clave) || '').trim();
    if (valor) DEDICATORIA[clave] = valor.slice(0, 600);
  });
  if (consulta.has('firma')) DEDICATORIA.firma = consulta.get('firma').trim().slice(0, 80);

  const mensajes = (DEDICATORIA.mensaje.match(/[^.!?]+[.!?]+(?:["'”’)]*)|[^.!?]+$/g) || [DEDICATORIA.mensaje])
    .map(mensaje => mensaje.trim())
    .filter(Boolean);

  /* ---------- 2. UTILIDADES ---------- */

  const TAU = Math.PI * 2;
  const rad = d => d * Math.PI / 180;
  const clamp01 = x => Math.min(1, Math.max(0, x));
  const azar = (a, b) => a + Math.random() * (b - a);
  const elegir = lista => lista[Math.floor(Math.random() * lista.length)];

  const salida = t => 1 - Math.pow(1 - t, 3);                                   // frena al final
  const entradaSalida = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const rebote = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------- 3. SONIDO (todo sintetizado, sin archivos) ---------- */

  const Sonido = (() => {
    let ac = null, maestro = null, envio = null, activo = true;
    let paso = 0, proximo = 0;
    const midi = n => 440 * Math.pow(2, (n - 69) / 12);
    const ACORDES = [[60, 64, 67, 72], [57, 60, 64, 69], [60, 65, 69, 72], [59, 62, 67, 71]];
    const PATRON = [0, 1, 2, 3, 2, 1, 3, 2];

    function crearReverb() {
      const n = Math.floor(ac.sampleRate * 2.8);
      const buf = ac.createBuffer(2, n, ac.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
      }
      const conv = ac.createConvolver();
      conv.buffer = buf;
      return conv;
    }

    // Una nota con timbre de caja de música
    function tono(f, t, dur, vol) {
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      [[1, 1], [2, 0.28], [3, 0.08]].forEach(([mult, amp]) => {
        const o = ac.createOscillator(), ga = ac.createGain();
        o.type = 'sine';
        o.frequency.value = f * mult;
        ga.gain.value = amp;
        o.connect(ga);
        ga.connect(g);
        o.start(t);
        o.stop(t + dur + 0.05);
      });
      g.connect(maestro);
      g.connect(envio);
    }

    function programar() {
      while (proximo < ac.currentTime + 1.2) {
        const acorde = ACORDES[Math.floor(paso / 8) % ACORDES.length];
        tono(midi(acorde[PATRON[paso % 8]]), proximo, 1.8, 0.05);
        if (paso % 8 === 0) tono(midi(acorde[0] - 12), proximo, 4, 0.07);
        paso++;
        proximo += 0.5;
      }
    }

    return {
      iniciar() {
        if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
        try {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          maestro = ac.createGain();
          maestro.gain.value = activo ? 0.9 : 0;
          maestro.connect(ac.destination);
          const reverb = crearReverb();
          envio = ac.createGain();
          envio.gain.value = 0.45;
          envio.connect(reverb);
          reverb.connect(maestro);
          proximo = ac.currentTime + 0.3;
          programar();
          setInterval(programar, 250);
        } catch (e) { ac = null; }
      },
      campana(freq) { if (ac) tono(freq, ac.currentTime + 0.02, 2.6, 0.13); },
      acorde() {
        if (!ac) return;
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tono(f, ac.currentTime + 0.05 + i * 0.12, 3.2, 0.09));
      },
      alternar() {
        activo = !activo;
        if (maestro) maestro.gain.setTargetAtTime(activo ? 0.9 : 0, ac.currentTime, 0.15);
        return activo;
      },
    };
  })();


  /* ---------- 4. ELEMENTOS Y ESTADO ---------- */

  const $ = id => document.getElementById(id);
  const lienzo = $('lienzo');
  const ctx = lienzo.getContext('2d');
  const body = document.body;
  const elBloque = $('dedicatoria'), elTitulo = $('titulo'), elMensaje = $('mensaje');
  const elEscrito = $('escrito'), elResto = $('resto'), elFirma = $('firma');
  const btnAbrir = $('btnAbrir'), btnSonido = $('btnSonido'), btnRepetir = $('btnRepetir');

  let W = 0, H = 0, dpr = 1;
  let u = 30, ox = 0, oy = 0, modoLado = false;      // escala y origen del ramo en pantalla
  let inicio = null;                                  // momento en que se abrió (ms)
  let reloj = 0;                                      // segundos desde que cargó la página
  let tiempo = -1;                                    // segundos desde que se abrió
  let viento = 0, vientoObjetivo = 0;
  let luzAmb = 0.25, florecidos = 0;

  const marcas = { titulo: false, escribir: false };
  const escr = { i: 0, espera: 0, activo: false, listo: false, mensaje: 0, fase: 'escribiendo', tiempoFase: 0 };
  const emisor = { chispa: 0, corazon: 0 };

  // El mundo del ramo: x hacia la derecha, y hacia arriba, el papel termina en y = -9.2
  const G = { x: 0, y: -3.2 };                        // donde se juntan los tallos
  const aPantalla = (x, y) => [ox + x * u, oy - (y + 9.2) * u];


  /* ---------- 5. COLORES Y FLORES ---------- */

  const PALETAS = {
    violeta:  { oscuro: '#4a1578', medio: '#8a3fcf', claro: '#d3a6ff', borde: 'rgba(46,10,82,.65)',  brillo: '241,224,255', luz: '190,130,255' },
    rojo:     { oscuro: '#7a0a22', medio: '#d4223f', claro: '#ff7088', borde: 'rgba(77,4,20,.65)',   brillo: '255,208,216', luz: '255,90,120' },
    naranja:  { oscuro: '#a8330a', medio: '#f26a1f', claro: '#ffb26b', borde: 'rgba(107,31,5,.65)',  brillo: '255,227,196', luz: '255,160,90' },
    coral:    { oscuro: '#b02a52', medio: '#f2607f', claro: '#ffb3c1', borde: 'rgba(112,24,50,.65)', brillo: '255,230,236', luz: '255,130,160' },
    amarillo: { oscuro: '#b37d00', medio: '#f5c211', claro: '#fff19a', borde: 'rgba(120,80,0,.65)',  brillo: '255,251,224', luz: '255,225,110' },
    blanco:   { oscuro: '#d98fae', medio: '#f6c9d9', claro: '#fff8fb', borde: 'rgba(168,90,122,.65)', brillo: '255,255,255', luz: '255,210,230' },
    rosa:     { oscuro: '#a3123f', medio: '#e8386a', claro: '#ff8fb0', borde: 'rgba(107,10,42,.65)', brillo: '255,216,227', luz: '255,100,150' },
  };

  // De atrás hacia adelante: primero los de los costados, al final el del centro.
  // "retraso" decide cuándo empieza cada uno (el del centro abre primero).
  const TULIPANES = [
    { ang: -34, s: .62, pal: 'violeta',  retraso: .80, amp: 3.0, f: .25, fase: 0.2 },
    { ang:  34, s: .63, pal: 'rojo',     retraso: .80, amp: 3.0, f: .25, fase: 2.4 },
    { ang: -22, s: .68, pal: 'naranja',  retraso: .50, amp: 2.8, f: .30, fase: 4.0 },
    { ang:  22, s: .67, pal: 'coral',    retraso: .50, amp: 2.8, f: .30, fase: 1.3 },
    { ang: -11, s: .74, pal: 'amarillo', retraso: .25, amp: 2.4, f: .22, fase: 3.2 },
    { ang:  11, s: .73, pal: 'blanco',   retraso: .25, amp: 2.4, f: .22, fase: 5.1 },
    { ang:   0, s: .80, pal: 'rosa',     retraso: 0,   amp: 2.2, f: .28, fase: 0.9 },
  ].map(d => ({ ...d, t0: 1.0 + d.retraso, dur: 2.0, tb: 2.5 + d.retraso, durB: 1.5, listo: false, angAct: d.ang }));

  const NOTAS = [523.25, 659.25, 783.99, 880, 1046.5, 1318.5, 1568];
  [...TULIPANES].sort((a, b) => a.retraso - b.retraso).forEach((T, i) => { T.nota = NOTAS[i]; });

  const HOJAS = [
    { ang: -62, s: .82, verde: '#7fbf5a', amp: 2.0, fase: .5 },
    { ang: -42, s: .95, verde: '#6fae4f', amp: 2.0, fase: 2.5 },
    { ang: -22, s: .90, verde: '#8ac864', amp: 1.6, fase: 4.4 },
    { ang:  24, s: .92, verde: '#8ac864', amp: 1.6, fase: 1.0 },
    { ang:  44, s: .95, verde: '#6fae4f', amp: 2.0, fase: 3.6 },
    { ang:  62, s: .82, verde: '#7fbf5a', amp: 2.0, fase: 5.5 },
  ].map((d, i) => ({ ...d, t0: .7 + i * .1 }));

  const COLORES_PETALO = ['#ff8fb0', '#ffb3c1', '#ffd1a0', '#e8386a', '#fff0f4', '#ffe08a', '#d9a6ff'];


  /* ---------- 6. FORMAS (todas en coordenadas del tulipán) ---------- */

  const P = {
    base(c) {
      c.beginPath(); c.moveTo(0, 4.2);
      c.bezierCurveTo(-.9, 4.3, -1.4, 4.9, -1.5, 5.4);
      c.bezierCurveTo(-.9, 5.2, .9, 5.2, 1.5, 5.4);
      c.bezierCurveTo(1.4, 4.9, .9, 4.3, 0, 4.2);
      c.closePath();
    },
    izq(c) {
      c.beginPath(); c.moveTo(.1, 4.5);
      c.bezierCurveTo(-2.1, 4.8, -2.5, 7.2, -1.5, 8.6);
      c.bezierCurveTo(-.8, 7.7, -.2, 7, .3, 6);
      c.bezierCurveTo(.4, 5.4, .3, 4.8, .1, 4.5);
      c.closePath();
    },
    der(c) {
      c.beginPath(); c.moveTo(-.1, 4.5);
      c.bezierCurveTo(2.1, 4.8, 2.5, 7.2, 1.5, 8.6);
      c.bezierCurveTo(.8, 7.7, .2, 7, -.3, 6);
      c.bezierCurveTo(-.4, 5.4, -.3, 4.8, -.1, 4.5);
      c.closePath();
    },
    frente(c) {
      c.beginPath(); c.moveTo(0, 4.3);
      c.bezierCurveTo(-2, 4.5, -2.2, 7.4, 0, 9.3);
      c.bezierCurveTo(2.2, 7.4, 2, 4.5, 0, 4.3);
      c.closePath();
    },
    brillo(c) {
      c.beginPath(); c.moveTo(-.15, 5.3);
      c.bezierCurveTo(-.9, 5.9, -.9, 7.6, -.1, 8.5);
      c.bezierCurveTo(.35, 7.6, .3, 6.2, -.15, 5.3);
      c.closePath();
    },
    hoja(c) {
      c.beginPath(); c.moveTo(0, 0);
      c.bezierCurveTo(-.9, 1.5, -1.1, 4.2, 0, 7);
      c.bezierCurveTo(1, 4, .8, 1.4, 0, 0);
      c.closePath();
    },
    hojaDerecha(c) {                                  // mitad derecha, para dar volumen
      c.beginPath(); c.moveTo(0, 0);
      c.bezierCurveTo(-.1, 2.2, -.1, 4.6, 0, 7);
      c.bezierCurveTo(1, 4, .8, 1.4, 0, 0);
      c.closePath();
    },
  };

  const VENAS = [[-.9, .5], [.9, -.5], [0, 0]];

  // Tallo: curva de abajo (y = -4.6) hacia la flor (y = 4.5)
  const TALLO = [[0, -4.6], [.35, -1.5], [-.25, 2.0], [0, 4.5]];
  function puntoTallo(t) {
    const [p0, p1, p2, p3] = TALLO, m = 1 - t;
    return [
      m*m*m*p0[0] + 3*m*m*t*p1[0] + 3*m*t*t*p2[0] + t*t*t*p3[0],
      m*m*m*p0[1] + 3*m*m*t*p1[1] + 3*m*t*t*p2[1] + t*t*t*p3[1],
    ];
  }
  function tangenteTallo(t) {
    const [p0, p1, p2, p3] = TALLO, m = 1 - t;
    return [
      3*m*m*(p1[0]-p0[0]) + 6*m*t*(p2[0]-p1[0]) + 3*t*t*(p3[0]-p2[0]),
      3*m*m*(p1[1]-p0[1]) + 6*m*t*(p2[1]-p1[1]) + 3*t*t*(p3[1]-p2[1]),
    ];
  }

  function corazon(c, x, y, s) {
    c.beginPath();
    c.moveTo(x, y + s * .35);
    c.bezierCurveTo(x - s * .9, y - s * .35, x - s * .5, y - s * 1.0, x, y - s * .45);
    c.bezierCurveTo(x + s * .5, y - s * 1.0, x + s * .9, y - s * .35, x, y + s * .35);
    c.closePath();
  }

  function chispa4(c, r) {
    c.beginPath(); c.moveTo(0, -r);
    c.quadraticCurveTo(0, 0, r, 0);
    c.quadraticCurveTo(0, 0, 0, r);
    c.quadraticCurveTo(0, 0, -r, 0);
    c.quadraticCurveTo(0, 0, 0, -r);
    c.closePath();
  }

  function poligono(c, pts) {
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
  }

  // Brillos suaves reutilizables (un sprite por color)
  const sprites = {};
  function sprite(rgb) {
    if (sprites[rgb]) return sprites[rgb];
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const k = c.getContext('2d');
    const g = k.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(.25, `rgba(${rgb},.55)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    k.fillStyle = g;
    k.fillRect(0, 0, 64, 64);
    return (sprites[rgb] = c);
  }


  /* ---------- 7. ELEMENTOS DE FONDO ---------- */

  const estrellas = Array.from({ length: 140 }, () => ({
    x: Math.random(), y: Math.random(), r: azar(.4, 1.5), v: azar(.8, 2.6), f: azar(0, TAU), b: azar(.4, 1),
  }));

  const luciernagas = Array.from({ length: 38 }, (_, i) => ({
    x: Math.random(), y: Math.random(), r: azar(2.5, 6), v: azar(.8, 2.2), f: azar(0, TAU),
    w: azar(.3, .8), vy: azar(.004, .014), rgb: i % 3 ? '255,232,160' : '255,170,205',
  }));

  const petalosAmb = Array.from({ length: 14 }, () => ({
    x: Math.random(), fase: Math.random(), vel: azar(.035, .07), r: azar(5, 9),
    f: azar(0, TAU), giro: azar(1, 3), color: elegir(COLORES_PETALO),
  }));

  const particulas = [];


  /* ---------- 8. DISEÑO (tamaño y posición del ramo) ---------- */

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    lienzo.width = Math.round(W * dpr);
    lienzo.height = Math.round(H * dpr);

    modoLado = W >= 640 && W / H >= 1.3;
    body.classList.toggle('lado', modoLado);

    const ALTO = 17.4, ANCHO = 12.4;                  // medidas del ramo en unidades del mundo
    if (modoLado) {
      u = Math.min(H * .84 / ALTO, W * .50 / ANCHO);
      ox = W * .69;
      oy = H * .94;
    } else {
      const bajoTexto = elBloque.getBoundingClientRect().bottom + 16;
      const libre = H * .97 - bajoTexto;
      u = Math.min(libre / ALTO, W * .94 / ANCHO, H * .72 / ALTO);
      u = Math.max(u, 8);
      ox = W / 2;
      oy = H * .97;
    }
  }


  /* ---------- 9. DIBUJO DEL FONDO ---------- */

  function dibujarFondo() {
    const fondo = ctx.createLinearGradient(0, 0, 0, H);
    fondo.addColorStop(0, '#0d0524');
    fondo.addColorStop(.45, '#2a0f47');
    fondo.addColorStop(.78, '#6a2060');
    fondo.addColorStop(1, '#b8456a');
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, W, H);

    // estrellas
    ctx.fillStyle = '#fff6e6';
    for (const e of estrellas) {
      const tw = .5 + .5 * Math.sin(reloj * e.v + e.f);
      ctx.globalAlpha = (.2 + .8 * tw) * e.b;
      ctx.beginPath();
      ctx.arc(e.x * W, e.y * H * .72, e.r, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // luna
    const mr = Math.max(16, Math.min(W, H) * .05);
    const mx = modoLado ? W * .9 : W * .15;
    const my = modoLado ? H * .2 : Math.max(mr + 18, H * .075);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .45;
    ctx.drawImage(sprite('255,236,190'), mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
    ctx.restore();
    const lg = ctx.createRadialGradient(mx - mr * .3, my - mr * .3, mr * .1, mx, my, mr);
    lg.addColorStop(0, '#fffbe9');
    lg.addColorStop(1, '#f1dfae');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(190,160,110,.2)';
    [[.3, .1, .22], [-.35, .3, .16], [.05, -.4, .12], [-.1, .55, .1]].forEach(([dx, dy, k]) => {
      ctx.beginPath(); ctx.arc(mx + dx * mr, my + dy * mr, k * mr, 0, TAU); ctx.fill();
    });

    // resplandor detrás del ramo
    const [cx, cy] = aPantalla(0, 3);
    const pulso = .88 + .12 * Math.sin(reloj * 1.4);
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, u * 11);
    rg.addColorStop(0, `rgba(255,150,190,${.40 * pulso * luzAmb})`);
    rg.addColorStop(.45, `rgba(200,90,170,${.16 * luzAmb})`);
    rg.addColorStop(1, 'rgba(120,40,140,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    // luz en el suelo
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(1, .22);
    const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, u * 7);
    sg.addColorStop(0, `rgba(255,190,170,${.35 * luzAmb})`);
    sg.addColorStop(1, 'rgba(255,190,170,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(-u * 7, -u * 7, u * 14, u * 14);
    ctx.restore();
  }

  function dibujarLuciernagas() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const l of luciernagas) {
      const y = (((l.y - reloj * l.vy) % 1) + 1) % 1;
      const x = l.x * W + Math.sin(reloj * l.w + l.f) * 22;
      const yy = y * H + Math.cos(reloj * l.w * .8 + l.f) * 14;
      ctx.globalAlpha = (.25 + .75 * (.5 + .5 * Math.sin(reloj * l.v + l.f))) * (.5 + .5 * luzAmb);
      const r = l.r * 3.2;
      ctx.drawImage(sprite(l.rgb), x - r, yy - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  function dibujarViñeta() {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .78);
    v.addColorStop(0, 'rgba(8,2,20,0)');
    v.addColorStop(1, 'rgba(8,2,20,.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }


  /* ---------- 10. DIBUJO DEL RAMO ---------- */

  const hw = y => .7 + 2.9 * (y + 9.2) / 7.7;         // medio ancho del cono de papel a la altura y

  function dibujarInterior(p) {
    ctx.save();
    ctx.globalAlpha = p;
    ctx.translate(0, -(1 - p) * 2.5);
    poligono(ctx, [[-3.6, -1.5], [3.6, -1.5], [0, -3.0]]);
    const g = ctx.createLinearGradient(0, -1.5, 0, -3);
    g.addColorStop(0, '#9a6f48');
    g.addColorStop(1, '#4f331f');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  function dibujarHoja(L, t) {
    const g = salida(clamp01((t - L.t0) / 1.4));
    if (g <= .001) return;
    const amp = reducido ? .3 : 1;
    const ang = L.ang * (.5 + .5 * g) + Math.sin(TAU * .25 * t + L.fase) * L.amp * g * amp
              + (Math.sin(TAU * .25 * t + .7) * 1.2 + viento * 3) * g;
    ctx.save();
    ctx.translate(G.x, G.y);
    ctx.rotate(rad(ang));
    ctx.scale(L.s * (.55 + .45 * g), L.s * g);

    P.hoja(ctx);
    const gr = ctx.createLinearGradient(0, 0, 0, 7);
    gr.addColorStop(0, '#1d5424');
    gr.addColorStop(1, L.verde);
    ctx.fillStyle = gr;
    ctx.fill();

    P.hojaDerecha(ctx);
    ctx.fillStyle = 'rgba(0,30,0,.2)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, .2);
    ctx.bezierCurveTo(-.1, 2.2, -.1, 4.6, 0, 6.7);
    ctx.strokeStyle = 'rgba(207,232,176,.75)';
    ctx.lineWidth = .045;
    ctx.stroke();

    P.hoja(ctx);
    ctx.strokeStyle = 'rgba(10,50,15,.6)';
    ctx.lineWidth = .05;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }

  function dibujarCabeza(pal, b, resp, glow) {
    // resplandor suave detrás de la flor
    if (glow > .01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const r = ctx.createRadialGradient(0, 6.9, 0, 0, 6.9, 5);
      r.addColorStop(0, `rgba(${pal.luz},${.22 * glow})`);
      r.addColorStop(1, `rgba(${pal.luz},0)`);
      ctx.fillStyle = r;
      ctx.fillRect(-6, 1.5, 12, 11);
      ctx.restore();
    }

    // cáliz
    P.base(ctx);
    let g = ctx.createLinearGradient(0, 4.2, 0, 5.4);
    g.addColorStop(0, '#1f5a26');
    g.addColorStop(1, '#6fae4f');
    ctx.fillStyle = g;
    ctx.fill();

    // pétalos de atrás: se abren hacia los lados al florecer
    const apertura = 7 * resp - 12 * (1 - b);
    for (const lado of [-1, 1]) {
      ctx.save();
      const px = lado * .1, py = 4.5;
      ctx.translate(px, py);
      ctx.rotate(rad(-lado * apertura));
      ctx.translate(-px, -py);
      (lado < 0 ? P.izq : P.der)(ctx);
      g = ctx.createLinearGradient(0, 4.5, 0, 8.6);
      g.addColorStop(0, pal.oscuro);
      g.addColorStop(1, pal.medio);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = pal.borde;
      ctx.lineWidth = .05;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }

    // pétalo del frente
    P.frente(ctx);
    g = ctx.createLinearGradient(0, 4.3, 0, 9.3);
    g.addColorStop(0, pal.oscuro);
    g.addColorStop(.45, pal.medio);
    g.addColorStop(1, pal.claro);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.save();                                       // volumen: luz arriba a la izquierda, sombra a los lados
    P.frente(ctx);
    ctx.clip();
    const luz = ctx.createRadialGradient(-.7, 7.6, 0, -.7, 7.6, 2.8);
    luz.addColorStop(0, 'rgba(255,255,255,.22)');
    luz.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = luz;
    ctx.fillRect(-3, 3, 6, 8);
    const lados = ctx.createLinearGradient(-2.2, 0, 2.2, 0);
    lados.addColorStop(0, 'rgba(20,0,20,.30)');
    lados.addColorStop(.28, 'rgba(20,0,20,0)');
    lados.addColorStop(.72, 'rgba(20,0,20,0)');
    lados.addColorStop(1, 'rgba(20,0,20,.42)');
    ctx.fillStyle = lados;
    ctx.fillRect(-3, 3, 6, 8);
    ctx.restore();

    P.frente(ctx);
    ctx.strokeStyle = pal.borde;
    ctx.lineWidth = .055;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // brillo central
    P.brillo(ctx);
    g = ctx.createLinearGradient(0, 5.3, 0, 8.5);
    g.addColorStop(0, `rgba(${pal.brillo},.10)`);
    g.addColorStop(1, `rgba(${pal.brillo},.75)`);
    ctx.fillStyle = g;
    ctx.fill();

    // venas
    ctx.strokeStyle = pal.borde;
    ctx.globalAlpha = .35;
    ctx.lineWidth = .03;
    for (const [dx, c] of VENAS) {
      ctx.beginPath();
      ctx.moveTo(dx * .5, 4.7);
      ctx.bezierCurveTo(dx * 1.1, 6.0, dx * .9 + c * .2, 7.5, dx * .25, 8.9);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function trazarTallo(g, dx) {
    const n = Math.max(2, Math.ceil(36 * g));
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const q = puntoTallo(g * i / n);
      if (i) ctx.lineTo(q[0] + dx, q[1]); else ctx.moveTo(q[0] + dx, q[1]);
    }
  }

  function posicionCabeza(T) {                         // centro de la flor, en pantalla
    const a = rad(T.angAct), d = 11.5 * T.s;
    return aPantalla(G.x - d * Math.sin(a), G.y + d * Math.cos(a));
  }

  function dibujarTulipan(T, t) {
    const g = salida(clamp01((t - T.t0) / T.dur));       // cuánto ha crecido el tallo
    if (g <= .001) return;
    const b = entradaSalida(clamp01((t - T.tb) / T.durB)); // 0 = capullo, 1 = abierto
    const amp = reducido ? .3 : 1;
    const oleaje = TAU * T.f * t + T.fase;
    const resp = b * (.5 + .5 * Math.sin(oleaje + 1.2));   // la flor "respira" un poco
    const ang = T.ang * (.4 + .6 * g) + Math.sin(oleaje) * T.amp * g * amp
              + (Math.sin(TAU * .25 * t + .7) * 1.2 + viento * 3) * g;
    T.angAct = ang;

    if (!T.listo && b > .75) {                           // ¡floreció!
      T.listo = true;
      florecidos++;
      const [sx, sy] = posicionCabeza(T);
      rafagaChispas(sx, sy, PALETAS[T.pal].luz);
      Sonido.campana(T.nota);
    }

    const pal = PALETAS[T.pal];
    const p = puntoTallo(g);
    const [tx, ty] = tangenteTallo(g);

    ctx.save();
    ctx.translate(G.x, G.y);
    ctx.rotate(rad(ang));
    ctx.scale(T.s, T.s);
    ctx.translate(0, 4.6);

    // tallo
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    trazarTallo(g, 0);
    ctx.strokeStyle = '#245d26';
    ctx.lineWidth = .27;
    ctx.stroke();
    trazarTallo(g, -.05);
    ctx.strokeStyle = 'rgba(125,205,95,.85)';
    ctx.lineWidth = .09;
    ctx.stroke();

    // flor, pegada a la punta del tallo
    ctx.save();
    ctx.translate(p[0], p[1]);
    ctx.rotate(Math.atan2(-tx, ty));
    const hs = (.42 + .58 * b) * (.3 + .7 * Math.min(1, g * 2.5));
    ctx.scale(hs, hs);
    ctx.translate(0, -4.5);
    ctx.globalAlpha = Math.min(1, g * 4);
    const glow = b * (.75 + .25 * Math.sin(reloj * 1.6 + T.fase));
    dibujarCabeza(pal, b, resp, glow);
    ctx.restore();

    ctx.restore();
  }

  function dibujarPapel(p) {
    ctx.save();
    ctx.globalAlpha = p;
    ctx.translate(0, -(1 - p) * 2.5);
    const paneles = [
      [-1, [[-3.6, -1.5], [0, -3.0], [0, -9.2], [-.7, -9.2]], ['#f8e9cf', '#d9b88a']],
      [1,  [[3.6, -1.5], [0, -3.0], [0, -9.2], [.7, -9.2]],   ['#e6cca2', '#bf9566']],
    ];
    for (const [lado, pts, [claro, oscuro]] of paneles) {
      poligono(ctx, pts);
      const g = ctx.createLinearGradient(0, -1.5, 0, -9.2);
      g.addColorStop(0, claro);
      g.addColorStop(1, oscuro);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.save();
      ctx.clip();
      const h = ctx.createLinearGradient(lado * 3.6, 0, 0, 0);
      h.addColorStop(0, 'rgba(255,255,255,.18)');
      h.addColorStop(1, 'rgba(60,30,10,.18)');
      ctx.fillStyle = h;
      ctx.fillRect(-4, -10, 8, 10);
      ctx.fillStyle = 'rgba(176,96,70,.28)';           // corazones estampados en el papel
      for (let fila = 0; fila < 7; fila++) {
        for (let col = -3; col <= 3; col++) {
          corazon(ctx, col * 1.3 + (fila % 2 ? .65 : 0), -2.4 - fila * 1.1, -.2);
          ctx.fill();
        }
      }
      ctx.restore();

      poligono(ctx, pts);
      ctx.strokeStyle = 'rgba(120,76,40,.75)';
      ctx.lineWidth = .05;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // cinta
    ctx.beginPath();
    ctx.moveTo(-hw(-5.2), -5.2);
    ctx.lineTo(hw(-5.2), -5.2);
    ctx.lineTo(hw(-5.9), -5.9);
    ctx.lineTo(-hw(-5.9), -5.9);
    ctx.closePath();
    const cg = ctx.createLinearGradient(-2.2, 0, 2.2, 0);
    cg.addColorStop(0, '#9c1240');
    cg.addColorStop(.5, '#ee4a7a');
    cg.addColorStop(1, '#9c1240');
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.strokeStyle = '#6b0a2a';
    ctx.lineWidth = .04;
    ctx.stroke();
    ctx.restore();
  }

  function dibujarLazo(t) {
    const k = rebote(clamp01((t - 1.0) / .7));
    if (k <= .001) return;
    const mov = Math.sin(TAU * .5 * t) * 4;
    ctx.save();
    ctx.translate(0, -5.55);
    ctx.scale(k, k);

    for (const lado of [-1, 1]) {                      // colas
      ctx.beginPath();
      ctx.moveTo(lado * .05, -.15);
      ctx.lineTo(lado * .9, -1.75);
      ctx.lineTo(lado * .55, -1.5);
      ctx.lineTo(lado * .2, -1.8);
      ctx.lineTo(-lado * .2, -.35);
      ctx.closePath();
      ctx.fillStyle = '#c2184d';
      ctx.fill();
      ctx.strokeStyle = '#6b0a2a';
      ctx.lineWidth = .04;
      ctx.stroke();
    }
    for (const lado of [-1, 1]) {                      // lazadas
      ctx.beginPath();
      ctx.ellipse(lado * .85, .1, .78, .44, lado * rad(20 + mov), 0, TAU);
      const g = ctx.createRadialGradient(lado * .85, .25, 0, lado * .85, .1, .8);
      g.addColorStop(0, '#ff7fa3');
      g.addColorStop(1, '#d42a5b');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = '#7a0c2e';
      ctx.lineWidth = .045;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(lado * .85, .1, .42, .2, lado * rad(20 + mov), 0, TAU);
      ctx.fillStyle = 'rgba(122,12,46,.35)';
      ctx.fill();
    }
    ctx.beginPath();                                    // nudo
    ctx.arc(0, 0, .28, 0, TAU);
    ctx.fillStyle = '#a3123f';
    ctx.fill();
    ctx.strokeStyle = '#6b0a2a';
    ctx.lineWidth = .04;
    ctx.stroke();
    ctx.restore();
  }

  function dibujarRamo(t) {
    const papel = salida(clamp01((t - .2) / 1.0));
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(u, -u);
    ctx.translate(0, 9.2);

    dibujarInterior(papel);
    HOJAS.forEach(L => dibujarHoja(L, t));
    TULIPANES.forEach(T => dibujarTulipan(T, t));
    dibujarPapel(papel);
    dibujarLazo(t);

    ctx.restore();
  }


  /* ---------- 11. PARTÍCULAS ---------- */

  function emitir(p) {
    particulas.push({ vida: 0, dur: 2, vx: 0, vy: 0, g: 0, arr: 0, rot: 0, vr: 0, giro: 6, ph: azar(0, TAU), r: 6, ...p });
  }

  function rafagaChispas(x, y, rgb) {
    if (reducido) return;
    for (let i = 0; i < 14; i++) {
      const a = azar(0, TAU), v = azar(50, 150);
      emitir({ tipo: 'chispa', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, arr: 2.2, r: azar(3, 7), dur: azar(.9, 1.6), rgb, vr: azar(-2, 2) });
    }
  }

  function rafagaPetalos(x, y) {
    if (reducido) return;
    for (let i = 0; i < 18; i++) {
      const a = azar(0, TAU), v = azar(80, 240);
      emitir({ tipo: 'petalo', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 90, g: 160, arr: 1.1, r: azar(5, 9),
               rot: azar(0, TAU), vr: azar(-5, 5), giro: azar(3, 7), dur: azar(1.8, 3), color: elegir(COLORES_PETALO) });
    }
    for (let i = 0; i < 6; i++) {
      const a = azar(-Math.PI * .95, -Math.PI * .05), v = azar(60, 170);
      emitir({ tipo: 'corazon', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: -20, arr: 1.4, r: azar(6, 12),
               dur: azar(1.8, 2.8), color: elegir(['#ff6f9c', '#ff9fbf', '#ffd1dc']) });
    }
  }

  function actualizarParticulas(dt) {
    for (let i = particulas.length - 1; i >= 0; i--) {
      const p = particulas[i];
      p.vida += dt;
      if (p.vida >= p.dur) { particulas.splice(i, 1); continue; }
      p.vx -= p.vx * p.arr * dt;
      p.vy += p.g * dt - p.vy * p.arr * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.tipo === 'corazon') p.x += Math.sin(p.vida * 2.2 + p.ph) * 18 * dt;
    }
  }

  function dibujarParticulas() {
    // pétalos que caen despacito, una vez que ya floreció todo
    const on = clamp01((tiempo - 3.5) / 2);
    if (on > 0) {
      for (const p of petalosAmb) {
        const k = (reloj * p.vel + p.fase) % 1;
        const x = p.x * W + Math.sin(k * TAU * 2 + p.f) * 40;
        const y = -20 + k * (H + 40);
        const flip = .35 + .65 * Math.abs(Math.cos(reloj * p.giro + p.f));
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(k * TAU * p.giro + p.f);
        ctx.globalAlpha = .8 * Math.sin(Math.PI * k) * on;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * .5 * flip, p.r, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    for (const p of particulas) {
      const k = p.vida / p.dur;
      const a = (k < .1 ? k / .1 : 1) * (1 - k * k);
      if (p.tipo === 'chispa') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a * .8;
        const r = p.r * 4;
        ctx.drawImage(sprite(p.rgb), p.x - r, p.y - r, r * 2, r * 2);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = a;
        ctx.fillStyle = '#fff';
        chispa4(ctx, p.r * 1.3);
        ctx.fill();
        ctx.restore();
      } else if (p.tipo === 'petalo') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = a * .95;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * .5 * (.35 + .65 * Math.abs(Math.cos(p.vida * p.giro))), p.r, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else if (p.tipo === 'corazon') {
        ctx.save();
        ctx.globalAlpha = a * .9;
        ctx.fillStyle = p.color;
        corazon(ctx, p.x, p.y, p.r);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }


  /* ---------- 12. TEXTO ---------- */

  function prepararTexto() {
    elTitulo.textContent = 'Para ' + DEDICATORIA.para;
    elEscrito.textContent = '';
    elResto.textContent = mensajes[0];
    elMensaje.classList.remove('mensaje-saliendo');
    elMensaje.setAttribute('aria-label', DEDICATORIA.mensaje);
    elFirma.textContent = DEDICATORIA.firma;
    document.title = 'Para ' + DEDICATORIA.para + ' 🌷';
    escr.i = 0;
    escr.espera = 0;
    escr.activo = false;
    escr.listo = false;
    escr.mensaje = 0;
    escr.fase = 'escribiendo';
    escr.tiempoFase = 0;
  }

  function escribir(dt) {
    if (!escr.activo || escr.listo) return;
    if (escr.fase === 'pausa') {
      escr.tiempoFase -= dt;
      if (escr.tiempoFase <= 0) {
        elMensaje.classList.add('mensaje-saliendo');
        escr.fase = 'saliendo';
        escr.tiempoFase = reducido ? 0 : .55;
      }
      return;
    }
    if (escr.fase === 'saliendo') {
      escr.tiempoFase -= dt;
      if (escr.tiempoFase <= 0) {
        escr.mensaje++;
        escr.i = 0;
        escr.espera = 0;
        elEscrito.textContent = '';
        elResto.textContent = mensajes[escr.mensaje];
        elMensaje.classList.remove('mensaje-saliendo');
        escr.fase = 'escribiendo';
      }
      return;
    }

    const texto = mensajes[escr.mensaje];
    escr.espera -= dt;
    let cambio = false;
    while (escr.espera <= 0 && escr.i < texto.length) {
      const c = texto[escr.i++];
      escr.espera += reducido ? 0 : /[.!?]/.test(c) ? .45 : /[,;:]/.test(c) ? .22 : azar(.028, .052);
      cambio = true;
    }
    if (cambio) {
      elEscrito.textContent = texto.slice(0, escr.i);
      elResto.textContent = texto.slice(escr.i);
    }
    if (escr.i >= texto.length) {
      if (escr.mensaje < mensajes.length - 1) {
        escr.fase = 'pausa';
        escr.tiempoFase = 1.5;
      } else {
        escr.listo = true;
        body.classList.add('firmado');
        Sonido.acorde();
        setTimeout(() => body.classList.remove('escribiendo'), 2500);
      }
    }
  }


  /* ---------- 13. EVENTOS DE LA ANIMACIÓN ---------- */

  function gestionarEventos(dt) {
    if (!marcas.titulo && tiempo > 3.0) { marcas.titulo = true; body.classList.add('ver-titulo'); }
    if (!marcas.escribir && tiempo > 4.3) { marcas.escribir = true; body.classList.add('escribiendo'); escr.activo = true; }
    escribir(dt);

    // luz ambiente según cuántas flores han abierto
    const objetivo = .25 + .75 * (florecidos / TULIPANES.length);
    luzAmb += (objetivo - luzAmb) * Math.min(1, dt * 1.5);

    // destellos sobre las flores
    emisor.chispa -= dt;
    if (!reducido && florecidos >= 3 && emisor.chispa <= 0) {
      emisor.chispa = azar(.25, .6);
      const T = elegir(TULIPANES.filter(x => x.listo));
      const [sx, sy] = posicionCabeza(T);
      emitir({ tipo: 'chispa', x: sx + azar(-1.4, 1.4) * u, y: sy + azar(-1.4, 1.2) * u, vx: 0, vy: -azar(4, 14),
               r: azar(2, 4.5), dur: azar(1, 1.8), rgb: PALETAS[T.pal].luz, vr: azar(-1, 1) });
    }

    // corazones que suben del ramo
    emisor.corazon -= dt;
    if (!reducido && florecidos >= TULIPANES.length && emisor.corazon <= 0) {
      emisor.corazon = azar(1.1, 2.0);
      const [sx, sy] = aPantalla(azar(-3, 3), azar(1, 6));
      emitir({ tipo: 'corazon', x: sx, y: sy, vy: -azar(30, 58), r: azar(5, 11), dur: azar(3, 4.5),
               color: elegir(['#ff6f9c', '#ff9fbf', '#ffd1dc', '#ffb3c1']) });
    }
  }


  /* ---------- 14. BUCLE PRINCIPAL ---------- */

  let ultimo = performance.now();

  function cuadro(ahora) {
    const dt = Math.min(.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    reloj += dt;
    tiempo = inicio === null ? -1 : (ahora - inicio) / 1000;
    viento += (vientoObjetivo - viento) * Math.min(1, dt * 3);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dibujarFondo();
    dibujarLuciernagas();
    if (tiempo >= 0) {
      dibujarRamo(tiempo);
      gestionarEventos(dt);
    }
    actualizarParticulas(dt);
    dibujarParticulas();
    dibujarViñeta();

    requestAnimationFrame(cuadro);
  }


  /* ---------- 15. INTERACCIÓN ---------- */

  function abrir() {
    if (inicio !== null) return;
    body.classList.add('abierto');
    Sonido.iniciar();
    inicio = performance.now();
  }

  function reiniciar() {
    body.classList.remove('ver-titulo', 'escribiendo', 'firmado');
    particulas.length = 0;
    TULIPANES.forEach(T => { T.listo = false; });
    florecidos = 0;
    luzAmb = .25;
    marcas.titulo = marcas.escribir = false;
    emisor.chispa = emisor.corazon = 0;
    prepararTexto();
    medir();
    inicio = performance.now();
  }

  btnAbrir.addEventListener('click', abrir);

  btnSonido.addEventListener('click', () => {
    const suena = Sonido.alternar();
    btnSonido.classList.toggle('silencio', !suena);
    btnSonido.setAttribute('aria-pressed', String(!suena));
    btnSonido.setAttribute('aria-label', suena ? 'Silenciar la música' : 'Activar la música');
  });

  btnRepetir.addEventListener('click', reiniciar);

  window.addEventListener('pointermove', e => { vientoObjetivo = (e.clientX / Math.max(W, 1) - .5) * 2; });

  window.addEventListener('pointerdown', e => {
    if (tiempo < 0 || e.target.closest('button')) return;
    rafagaPetalos(e.clientX, e.clientY);
    Sonido.campana(elegir(NOTAS));
  });

  window.addEventListener('resize', medir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);


  /* ---------- 16. ARRANQUE ---------- */

  prepararTexto();
  medir();
  requestAnimationFrame(cuadro);
  btnAbrir.focus({ preventScroll: true });
})();