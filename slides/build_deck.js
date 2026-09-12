'use strict';
const pptxgen = require('pptxgenjs');
const path    = require('path');

// Grayscale palette: same template as ESDM and NWS decks
const C = {
  bg:      'F7F7F7',
  primary: '111111',
  navy:    '1A1A1A',
  muted:   '888888',
  light:   'EBEBEB',
  border:  'CCCCCC',
  accent:  'E0E0E0',
  white:   'FFFFFF',
  darkbg:  '1A1A1A',
};

const pres = new pptxgen();
pres.layout  = 'LAYOUT_16x9';
pres.author  = 'Bless Elikem Krapah';
pres.subject = 'COE 592 ASCT - Paper 8 Replication';
pres.title   = 'LDPC Codes: Replication of Gallager (1962)';

const W = 10, H = 5.625;
const TOTAL = 10;

const RES = path.join(__dirname, '..', 'results');

// Helpers
function bgRect(slide, color) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: { color: color || C.bg },
    line: { color: color || C.bg, pt: 0 }
  });
}

function headerBand(slide, text) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: W, h: 0.72,
    fill: { color: C.primary },
    line: { color: C.primary, pt: 0 }
  });
  slide.addText(text, {
    x: 0.3, y: 0, w: W - 0.6, h: 0.72,
    color: C.white, fontSize: 21, bold: true, valign: 'middle'
  });
}

function footer(slide, n) {
  slide.addText(
    'COE 592: Advanced Signal and Communication Theory  |  Bless Elikem Krapah  |  KNUST  |  ' + n + '/' + TOTAL,
    { x: 0, y: H - 0.22, w: W, h: 0.22, color: C.muted, fontSize: 7, align: 'center' }
  );
}

function codeBox(slide, text, x, y, w, h) {
  slide.addShape(pres.ShapeType.rect, {
    x: x, y: y, w: w, h: h,
    fill: { color: C.light },
    line: { color: C.border, pt: 1 }
  });
  slide.addText(text, {
    x: x + 0.12, y: y + 0.1, w: w - 0.24, h: h - 0.2,
    color: C.primary, fontSize: 9, fontFace: 'Courier New', valign: 'top'
  });
}

function card(slide, x, y, w, h, fillColor) {
  slide.addShape(pres.ShapeType.rect, {
    x: x, y: y, w: w, h: h,
    fill: { color: fillColor || C.light },
    line: { color: C.border, pt: 1 }
  });
}

// ────────────────────────────────────────────────────────────────────────
// SLIDE 1: Title (dark)
// ────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  bgRect(s, C.darkbg);

  s.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 2.52, w: 9, h: 0.025,
    fill: { color: C.muted }, line: { color: C.muted, pt: 0 }
  });

  s.addText('Low-Density Parity-Check Codes', {
    x: 0.5, y: 0.55, w: 9, h: 1.0,
    color: C.white, fontSize: 34, bold: true, align: 'center', valign: 'middle'
  });

  s.addText('Replication of Gallager (1962)', {
    x: 0.5, y: 1.65, w: 9, h: 0.55,
    color: C.border, fontSize: 18, align: 'center'
  });

  s.addText([
    { text: 'Paper #8:  ', options: { color: C.muted, fontSize: 11 } },
    { text: 'R. Gallager, "Low-Density Parity-Check Codes," IRE Trans. Inf. Theory, 1962', options: { color: C.accent, fontSize: 11, italic: true } }
  ], { x: 0.5, y: 2.28, w: 9, h: 0.28, align: 'center' });

  s.addText('Bless Elikem Krapah', {
    x: 0.5, y: 2.72, w: 9, h: 0.38,
    color: C.accent, fontSize: 15, align: 'center', bold: true
  });
  s.addText('COE 592: Advanced Signal and Communication Theory  |  KNUST MPhil  |  September 2026', {
    x: 0.5, y: 3.18, w: 9, h: 0.28,
    color: C.muted, fontSize: 10.5, align: 'center'
  });
}

// ────────────────────────────────────────────────────────────────────────
// SLIDE 2: Paper Overview
// ────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  bgRect(s);
  headerBand(s, 'Paper Overview');
  footer(s, 2);

  s.addText('"Low-Density Parity-Check Codes"', {
    x: 0.4, y: 0.82, w: 9.2, h: 0.42,
    color: C.navy, fontSize: 15, bold: true, italic: true
  });
  s.addText('R. Gallager  |  IRE Transactions on Information Theory, vol. 8, pp. 21-28, 1962', {
    x: 0.4, y: 1.24, w: 9.2, h: 0.28,
    color: C.muted, fontSize: 10
  });

  // Three contribution cards
  const cards = [
    { icon: 'H', head: 'Sparse Parity-Check Matrix', body: 'A (j,k)-regular matrix H where every column has weight j and every row has weight k, keeping the code "low density".' },
    { icon: 'BP', head: 'Iterative Belief Propagation', body: 'Messages passed between variable nodes and check nodes on a Tanner graph, iterating until convergence.' },
    { icon: 'C', head: 'Near-Shannon Performance', body: 'Demonstrated BER curves approaching the channel capacity limit, far below any code of the 1950s.' },
  ];
  const cx = [0.35, 3.55, 6.75], cw = 3.0;
  cards.forEach((c_, i) => {
    card(s, cx[i], 1.68, cw, 3.55);
    s.addText(c_.icon, {
      x: cx[i] + 0.12, y: 1.78, w: cw - 0.24, h: 0.55,
      color: C.primary, fontSize: 22, bold: true, align: 'center'
    });
    s.addShape(pres.ShapeType.rect, {
      x: cx[i] + 0.12, y: 2.38, w: cw - 0.24, h: 0.02,
      fill: { color: C.border }, line: { color: C.border, pt: 0 }
    });
    s.addText(c_.head, {
      x: cx[i] + 0.15, y: 2.45, w: cw - 0.3, h: 0.42,
      color: C.primary, fontSize: 11, bold: true, align: 'center'
    });
    s.addText(c_.body, {
      x: cx[i] + 0.15, y: 2.92, w: cw - 0.3, h: 1.95,
      color: C.navy, fontSize: 9.5, align: 'left', valign: 'top'
    });
  });
}

// ────────────────────────────────────────────────────────────────────────
// SLIDE 3: Background: The Coding Gap
// ────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  bgRect(s);
  headerBand(s, 'Background: The Coding Gap');
  footer(s, 3);

  // Left column: Shannon context
  s.addText('Shannon (1948) proved that reliable communication is possible at any rate R below channel capacity:', {
    x: 0.4, y: 0.85, w: 5.0, h: 0.55, color: C.navy, fontSize: 10.5
  });

  codeBox(s,
    'C = (1/2) log2(1 + Eb/N0)\n\nFor rate R = 1/2 over AWGN:\n  Minimum Eb/N0 = 0 dB\n\nUncoded BPSK at BER=1e-5:\n  needs Eb/N0 ~ 8 dB\n\n  => 8 dB coding gap to fill',
    0.4, 1.5, 5.0, 2.5
  );

  s.addText('Shannon proved it was possible but gave no construction.', {
    x: 0.4, y: 4.1, w: 5.0, h: 0.42, color: C.muted, fontSize: 9.5, italic: true
  });

  // Right column: prior codes timeline
  s.addText('Prior codes and their limitations:', {
    x: 5.6, y: 0.85, w: 4.0, h: 0.35, color: C.navy, fontSize: 10.5, bold: true
  });

  const timeline = [
    { year: '1950', name: 'Hamming codes', note: 'Single-bit correction only, high redundancy' },
    { year: '1954', name: 'Reed-Muller', note: 'Hard decoding, poor high-SNR slope' },
    { year: '1960', name: 'BCH / Reed-Solomon', note: 'Powerful but algebraic, no iterative path' },
    { year: '1962', name: 'Gallager LDPC', note: 'First iterative decoder, near-Shannon BER' },
  ];
  timeline.forEach((t, i) => {
    const ty = 1.28 + i * 0.85;
    card(s, 5.6, ty, 4.0, 0.72, i === 3 ? C.primary : C.light);
    s.addText(t.year, {
      x: 5.72, y: ty + 0.06, w: 0.65, h: 0.58,
      color: i === 3 ? C.white : C.muted, fontSize: 10, bold: true, align: 'center', valign: 'middle'
    });
    s.addText(t.name, {
      x: 6.45, y: ty + 0.05, w: 3.0, h: 0.3,
      color: i === 3 ? C.white : C.primary, fontSize: 10, bold: true
    });
    s.addText(t.note, {
      x: 6.45, y: ty + 0.34, w: 3.0, h: 0.28,
      color: i === 3 ? C.accent : C.muted, fontSize: 8.5
    });
  });
}

// ────────────────────────────────────────────────────────────────────────
// SLIDE 4: LDPC Code Construction
// ────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  bgRect(s);
  headerBand(s, 'LDPC Code Construction');
  footer(s, 4);

  // Left: definition
  s.addText('(j,k)-Regular LDPC Code:', {
    x: 0.4, y: 0.82, w: 4.8, h: 0.35, color: C.primary, fontSize: 12, bold: true
  });
  s.addText([
    { text: 'Every column of H has weight j\n', options: { fontSize: 10 } },
    { text: 'Every row of H has weight k\n', options: { fontSize: 10 } },
    { text: 'Rate  R = 1 - j/k\n\n', options: { fontSize: 10 } },
    { text: 'Gallager\'s construction:\n', options: { fontSize: 10, bold: true } },
    { text: 'H = [ H₁; H₂; ...; Hⱼ ]\n\n', options: { fontSize: 10, fontFace: 'Courier New' } },
    { text: 'H₁ : block-diagonal\n  columns r·k..(r+1)·k-1 have 1 in row r\n\n', options: { fontSize: 10 } },
    { text: 'H₂..Hⱼ : random column\n  permutations of H₁', options: { fontSize: 10 } },
  ], { x: 0.4, y: 1.25, w: 4.7, h: 3.5, color: C.navy, valign: 'top' });

  // Right: code box
  s.addText('Implementation (src/ldpc.py):', {
    x: 5.3, y: 0.82, w: 4.3, h: 0.35, color: C.primary, fontSize: 11, bold: true
  });
  codeBox(s,
    'def make_H(n, j, k, seed=42):\n' +
    '  m_sub = n // k   # rows per sub-mat\n' +
    '  # H1: block-diagonal\n' +
    '  H1 = zeros((m_sub, n))\n' +
    '  for r in range(m_sub):\n' +
    '    H1[r, r*k:(r+1)*k] = 1\n\n' +
    '  # H2..Hj: random permutations\n' +
    '  sub = [H1]\n' +
    '  for _ in range(j - 1):\n' +
    '    perm = rng.permutation(n)\n' +
    '    sub.append(H1[:, perm])\n\n' +
    '  return vstack(sub)   # (m, n)',
    5.3, 1.25, 4.3, 3.35
  );

  // Parameter bar
  card(s, 0.4, 4.72, 9.2, 0.48);
  s.addText('This replication:  n = 1200  |  j/k = {2/4, 3/6, 4/8}  |  Rate R = 0.5  |  m = n·j/k = 600 check nodes', {
    x: 0.55, y: 4.78, w: 8.9, h: 0.36,
    color: C.navy, fontSize: 9.5, align: 'center', valign: 'middle'
  });
}

// ────────────────────────────────────────────────────────────────────────
// SLIDE 5: Belief Propagation Decoder
// ────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  bgRect(s);
  headerBand(s, 'Belief Propagation Decoder');
  footer(s, 5);

  // Left: concept and equations
  s.addText('Log-domain sum-product algorithm on the Tanner graph:', {
    x: 0.4, y: 0.82, w: 5.2, h: 0.35, color: C.navy, fontSize: 10.5
  });

  const steps = [
    { n: '1', head: 'Channel LLR (initialise)', body: 'L(cᴵ) = 2·yᴵ / σ²' },
    { n: '2', head: 'Check-node update', body: 'rⱼ→ᴵ = 2·arctanh(∏_{i\'≠i} tanh(q_{i\'→j}/2))' },
    { n: '3', head: 'Variable-node update', body: 'qᴵ→ⱼ = L_ch[i] + Σ_{j\'≠j} r_{j\'→i}' },
    { n: '4', head: 'Decision + syndrome', body: 'cᴵ = 0 if L_post > 0; stop if H·c = 0 mod 2' },
  ];
  steps.forEach((st, i) => {
    const sy = 1.28 + i * 0.92;
    card(s, 0.4, sy, 5.2, 0.78);
    s.addText(st.n, {
      x: 0.55, y: sy + 0.08, w: 0.42, h: 0.6,
      color: C.primary, fontSize: 18, bold: true, align: 'center', valign: 'middle'
    });
    s.addText(st.head, {
      x: 1.05, y: sy + 0.06, w: 4.42, h: 0.28,
      color: C.primary, fontSize: 10, bold: true
    });
    s.addText(st.body, {
      x: 1.05, y: sy + 0.35, w: 4.42, h: 0.36,
      color: C.navy, fontSize: 9.5, fontFace: 'Courier New'
    });
  });

  // Right: numerical stability note + code snippet
  s.addText('Vectorised implementation (src/decoder.py):', {
    x: 5.8, y: 0.82, w: 3.8, h: 0.35, color: C.primary, fontSize: 10.5, bold: true
  });

  codeBox(s,
    '# Sign/log-magnitude trick (stable)\n' +
    'sign_q     = sign(q_c)\n' +
    'total_sign = prod(sign_q, axis=1)\n' +
    'sign_excl  = total_sign * sign_q\n\n' +
    'log_t = log(|tanh(q_c/2)| + eps)\n' +
    'log_excl = sum(log_t,1) - log_t\n\n' +
    'r = sign_excl * 2*arctanh(\n' +
    '      clip(exp(log_excl), 0, 1))\n\n' +
    '# All edges updated as numpy arrays\n' +
    '# No Python loops over edges',
    5.8, 1.25, 3.8, 3.28
  );

  s.addText('Key: edges stored as flat arrays (m*k,); all updates are numpy matrix ops, no Python edge-level loops.', {
    x: 5.8, y: 4.6, w: 3.8, h: 0.6,
    color: C.muted, fontSize: 8.5, italic: true, valign: 'top'
  });
}

// ────────────────────────────────────────────────────────────────────────
// SLIDE 6: Replication Setup
// ────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  bgRect(s);
  headerBand(s, 'Replication Setup');
  footer(s, 6);

  // Left: parameter table
  s.addText('Simulation parameters:', {
    x: 0.4, y: 0.82, w: 4.8, h: 0.35, color: C.primary, fontSize: 11, bold: true
  });

  const params = [
    ['Codeword length n', '1200 (divisible by 4, 6, 8)'],
    ['Configurations', '(j=2,k=4), (j=3,k=6), (j=4,k=8)'],
    ['Code rate R', '1 - j/k = 0.5 for all'],
    ['Channel', 'BPSK-AWGN'],
    ['Eb/N0 range', '0.5 to 4.0 dB (step 0.5 dB)'],
    ['Blocks per point', '200 codewords'],
    ['Max BP iterations', '50 (early-stop on syndrome)'],
    ['Codeword type', 'All-zero (valid for linear codes)'],
    ['Shannon limit (R=1/2)', '0 dB'],
  ];
  params.forEach(([k_, v_], i) => {
    const py = 1.28 + i * 0.38;
    s.addShape(pres.ShapeType.rect, {
      x: 0.4, y: py, w: 4.8, h: 0.36,
      fill: { color: i % 2 === 0 ? C.light : C.bg },
      line: { color: C.border, pt: 0.5 }
    });
    s.addText(k_, { x: 0.52, y: py + 0.05, w: 2.4, h: 0.26, color: C.muted, fontSize: 9.5 });
    s.addText(v_, { x: 2.98, y: py + 0.05, w: 2.1, h: 0.26, color: C.navy, fontSize: 9.5, bold: true });
  });

  // Right: justification notes
  s.addText('Replication scope and choices:', {
    x: 5.5, y: 0.82, w: 4.1, h: 0.35, color: C.primary, fontSize: 11, bold: true
  });

  const notes = [
    'Gallager\'s original used n up to 2048; n=1200 balances simulation speed with statistical reliability (240K bits per SNR point).',
    'All-zero codeword is valid because LDPC is a linear code and BPSK-AWGN is symmetric; any codeword gives the same BER.',
    'Three (j,k) pairs share rate R=1/2, isolating the effect of graph density on performance.',
    'Log-domain BP avoids numerical underflow in the product of tanh values, matching Gallager\'s original message-passing description.',
  ];
  notes.forEach((note, i) => {
    card(s, 5.5, 1.28 + i * 0.95, 4.1, 0.82);
    s.addText(note, {
      x: 5.65, y: 1.35 + i * 0.95, w: 3.8, h: 0.68,
      color: C.navy, fontSize: 9.0, valign: 'top'
    });
  });
}

// ────────────────────────────────────────────────────────────────────────
// SLIDE 7: Results: BER Curves
// ────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  bgRect(s);
  headerBand(s, 'Results: BER vs Eb/N0');
  footer(s, 7);

  s.addImage({
    path: path.join(RES, 'ber_vs_snr.png'),
    x: 0.25, y: 0.82, w: 7.0, h: 4.48
  });

  // Side annotations
  const ann = [
    { y: 1.2,  text: '(j=4,k=8)\nSharpest\nwaterfall' },
    { y: 2.15, text: '(j=3,k=6)\nGallager\'s\nmain case' },
    { y: 3.1,  text: '(j=2,k=4)\nError floor\nvisible' },
  ];
  ann.forEach(a => {
    s.addText(a.text, {
      x: 7.45, y: a.y, w: 2.2, h: 0.75,
      color: C.navy, fontSize: 9, align: 'left', valign: 'top'
    });
  });

  s.addText([
    { text: 'Key result: ', options: { bold: true } },
    { text: '(j=3,k=6) drops from BER 5.7e-2 at 1 dB to effectively zero at 2.5 dB, a waterfall consistent with Gallager\'s theoretical analysis. Shannon limit at 0 dB.' }
  ], {
    x: 0.25, y: 5.2, w: 9.5, h: 0.28,
    color: C.muted, fontSize: 8.5
  });
}

// ────────────────────────────────────────────────────────────────────────
// SLIDE 8: Original Contribution: Convergence Analysis
// ────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  bgRect(s);
  headerBand(s, 'Original Contribution: Convergence Analysis');
  footer(s, 8);

  s.addImage({
    path: path.join(RES, 'convergence.png'),
    x: 0.3, y: 0.82, w: 5.8, h: 3.75
  });

  s.addText('Findings (not in original paper):', {
    x: 6.3, y: 0.82, w: 3.35, h: 0.35,
    color: C.primary, fontSize: 10.5, bold: true
  });

  const findings = [
    'BER drops 2-3 orders of magnitude in the first 10 iterations.',
    'At Eb/N0=2.5 dB, decoder converges to zero errors in ~7 iterations on average.',
    'Most of the gain comes in the first 15 iterations; diminishing returns after that.',
    'Enables early-stopping: monitor syndrome, not iteration count.',
  ];
  findings.forEach((f, i) => {
    card(s, 6.3, 1.28 + i * 0.88, 3.35, 0.73);
    s.addText(f, {
      x: 6.45, y: 1.34 + i * 0.88, w: 3.05, h: 0.6,
      color: C.navy, fontSize: 9.0, valign: 'top'
    });
  });

  s.addText('Gallager (1962) described iterative decoding conceptually but did not plot convergence trajectories. This analysis quantifies the per-iteration improvement.', {
    x: 0.3, y: 4.68, w: 9.35, h: 0.55,
    color: C.muted, fontSize: 8.5, italic: true
  });
}

// ────────────────────────────────────────────────────────────────────────
// SLIDE 9: Limitations
// ────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  bgRect(s);
  headerBand(s, 'Limitations');
  footer(s, 9);

  const lims = [
    {
      head: 'Error Floor',
      body: '(j=2,k=4) shows high residual BER at 4 dB rather than a clean waterfall. Short cycles in the Tanner graph (low girth) cause correlated messages that stall the decoder. Higher j raises the waterfall threshold and suppresses the floor.'
    },
    {
      head: 'Block Length',
      body: 'Performance degrades sharply below n~500. Gallager used n up to 2048; modern codes use n up to 64800 (DVB-S2). Our n=1200 is modest; extending to larger n would lower the waterfall SNR threshold.'
    },
    {
      head: '1962 Computational Context',
      body: 'Belief propagation required floating-point operations per edge per iteration. For n=1000 and 50 iterations, this was infeasible on 1962 hardware, contributing to the paper being ignored for 30 years.'
    },
    {
      head: 'Statistical Precision',
      body: 'With 200 blocks per SNR point, BER estimates below ~5e-4 carry high variance. True error floor characterisation requires millions of blocks. Results at 3-4 dB showing BER=0 reflect insufficient samples, not true zero-error performance.'
    },
  ];

  const col = [[0.35, 4.65], [5.05, 4.65]];
  lims.forEach((lim, i) => {
    const cx = col[i % 2][0], cy = i < 2 ? 0.82 : 3.1;
    card(s, cx, cy, col[i % 2][1], 2.0);
    s.addText(lim.head, {
      x: cx + 0.15, y: cy + 0.1, w: col[i % 2][1] - 0.3, h: 0.32,
      color: C.primary, fontSize: 10.5, bold: true
    });
    s.addShape(pres.ShapeType.rect, {
      x: cx + 0.15, y: cy + 0.46, w: col[i % 2][1] - 0.3, h: 0.02,
      fill: { color: C.border }, line: { color: C.border, pt: 0 }
    });
    s.addText(lim.body, {
      x: cx + 0.15, y: cy + 0.54, w: col[i % 2][1] - 0.3, h: 1.36,
      color: C.navy, fontSize: 9.0, valign: 'top'
    });
  });
}

// ────────────────────────────────────────────────────────────────────────
// SLIDE 10: Implications and Impact (dark)
// ────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  bgRect(s, C.darkbg);
  footer(s, 10);

  s.addText('Implications and Impact', {
    x: 0.4, y: 0.18, w: 9.2, h: 0.52,
    color: C.white, fontSize: 22, bold: true, align: 'center'
  });

  // Timeline row
  const milestones = [
    { year: '1962', text: 'Gallager proposes\nLDPC codes' },
    { year: '1993', text: 'Turbo codes\nrediscover iteration' },
    { year: '1996', text: 'MacKay & Neal\nrediscover LDPC' },
    { year: '2008', text: 'WiMAX 802.16\nadopts LDPC' },
    { year: '2017', text: '5G NR standard\nchosen over polar' },
  ];

  const mw = 1.65, mx0 = 0.35;
  // Timeline line
  s.addShape(pres.ShapeType.rect, {
    x: mx0, y: 1.52, w: 9.3, h: 0.04,
    fill: { color: C.muted }, line: { color: C.muted, pt: 0 }
  });
  milestones.forEach((m, i) => {
    const mx = mx0 + i * 1.86;
    s.addShape(pres.ShapeType.ellipse, {
      x: mx + mw/2 - 0.18, y: 1.36, w: 0.36, h: 0.36,
      fill: { color: C.accent }, line: { color: C.accent, pt: 0 }
    });
    s.addText(m.year, {
      x: mx, y: 1.82, w: mw, h: 0.3,
      color: C.accent, fontSize: 10, bold: true, align: 'center'
    });
    s.addText(m.text, {
      x: mx, y: 2.18, w: mw, h: 0.55,
      color: C.border, fontSize: 8.5, align: 'center'
    });
  });

  // Impact cards
  const impacts = [
    { head: 'Modern Standards', body: 'LDPC is in 5G NR, Wi-Fi 6 (802.11ax), DVB-S2, and 10GbE. Every smartphone you own contains Gallager\'s construction from 1962.' },
    { head: 'Capacity-Achieving', body: 'Irregular LDPC codes (Luby et al., 2001) achieve the Shannon limit to within 0.0045 dB, the closest any code has come.' },
    { head: 'Algorithmic Legacy', body: 'Belief propagation generalised to Bayesian networks, turbo decoding, compressed sensing, and modern deep learning (graph neural networks).' },
  ];
  const iw = 2.9;
  impacts.forEach((imp, i) => {
    const ix = 0.35 + i * 3.15;
    s.addShape(pres.ShapeType.rect, {
      x: ix, y: 2.92, w: iw, h: 2.3,
      fill: { color: '2A2A2A' },
      line: { color: C.muted, pt: 0.5 }
    });
    s.addText(imp.head, {
      x: ix + 0.12, y: 3.02, w: iw - 0.24, h: 0.32,
      color: C.accent, fontSize: 10, bold: true
    });
    s.addText(imp.body, {
      x: ix + 0.12, y: 3.38, w: iw - 0.24, h: 1.75,
      color: C.border, fontSize: 9.0, valign: 'top'
    });
  });
}

// ── Write file ────────────────────────────────────────────────────────────
pres.writeFile({ fileName: path.join(__dirname, 'presentation.pptx') })
  .then(() => console.log('Saved -> slides/presentation.pptx'))
  .catch(err => { console.error(err); process.exit(1); });
