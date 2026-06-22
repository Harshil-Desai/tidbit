import React, { useState, useRef, useEffect } from 'react';

/* ============================================================
   Diagram palette — role-based color coding used across every SVG.
   data=blue  ptr=purple  active=amber  done=green  bad=red
   aux=teal/sky  meta=slate
   ============================================================ */
const C = {
  data:   { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
  ptr:    { fill: '#ede9fe', stroke: '#8b5cf6', text: '#6d28d9' },
  active: { fill: '#fef3c7', stroke: '#f59e0b', text: '#b45309' },
  done:   { fill: '#d1fae5', stroke: '#10b981', text: '#047857' },
  bad:    { fill: '#fee2e2', stroke: '#ef4444', text: '#b91c1c' },
  aux:    { fill: '#e0f2fe', stroke: '#0ea5e9', text: '#0369a1' },
  meta:   { fill: '#f1f5f9', stroke: '#64748b', text: '#475569' },
};

const PARTS = [
  { id: 0, label: 'The Lens',                  color: '#64748b' },
  { id: 1, label: 'Linear Structures',         color: '#3b82f6' },
  { id: 2, label: 'Hashing',                   color: '#0d9488' },
  { id: 3, label: 'Trees',                     color: '#059669' },
  { id: 4, label: 'Heaps, Tries & Special',    color: '#8b5cf6' },
  { id: 5, label: 'Sorting',                   color: '#f59e0b' },
  { id: 6, label: 'Graphs',                    color: '#6366f1' },
  { id: 7, label: 'Paradigms & Probabilistic', color: '#f43f5e' },
];
const partOf = (id) => PARTS.find((p) => p.id === id);
const shortTitle = (t) => t.split(' \u2014 ')[0].split(' (')[0];

const monoFont = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
const uiFont = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/* ============================================================
   Minimal Python syntax highlighter (no libraries).
   ============================================================ */
const PY_KEYWORDS = new Set([
  'def','return','if','elif','else','for','while','in','not','and','or','is',
  'None','True','False','class','import','from','as','with','yield','lambda',
  'pass','break','continue','raise','try','except','finally','global',
  'nonlocal','del','assert','await','async',
]);

function tokenizeLine(line) {
  const tokens = [];
  let i = 0;
  const n = line.length;
  while (i < n) {
    const c = line[i];
    if (c === '#') { tokens.push(['#6a9955', line.slice(i)]); break; }
    if (c === '"' || c === "'") {
      const q = c;
      let j = i + 1;
      while (j < n && line[j] !== q) { if (line[j] === '\\') j++; j++; }
      j = Math.min(j + 1, n);
      tokens.push(['#ce9178', line.slice(i, j)]);
      i = j; continue;
    }
    if (c >= '0' && c <= '9') {
      let j = i;
      while (j < n && ((line[j] >= '0' && line[j] <= '9') || line[j] === '.')) j++;
      tokens.push(['#b5cea8', line.slice(i, j)]);
      i = j; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(line[j])) j++;
      const w = line.slice(i, j);
      let k = j;
      while (k < n && line[k] === ' ') k++;
      if (PY_KEYWORDS.has(w)) tokens.push(['#569cd6', w]);
      else if (line[k] === '(') tokens.push(['#dcdcaa', w]);
      else tokens.push(['#d4d4d4', w]);
      i = j; continue;
    }
    tokens.push(['#d4d4d4', c]);
    i++;
  }
  return tokens;
}

function CodeBlock({ code }) {
  const lines = code.replace(/^\n/, '').replace(/\n$/, '').split('\n');
  return (
    <pre style={{
      background: '#1e1e1e', color: '#d4d4d4', padding: '14px 16px',
      borderRadius: 8, overflowX: 'auto', fontSize: 13, lineHeight: 1.65,
      margin: 0, fontFamily: monoFont,
    }}>
      <code>
        {lines.map((ln, idx) => (
          <div key={idx} style={{ whiteSpace: 'pre', minHeight: '1.2em' }}>
            {tokenizeLine(ln).map((t, ti) => (
              <span key={ti} style={{ color: t[0] }}>{t[1]}</span>
            ))}
          </div>
        ))}
      </code>
    </pre>
  );
}

const inlineCode = {
  fontFamily: monoFont, background: '#f1f5f9', padding: '1px 5px',
  borderRadius: 3, fontSize: '0.9em', color: '#0f172a',
};
function RichText({ text }) {
  const parts = String(text).split('`');
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? <code key={i} style={inlineCode}>{p}</code>
              : <React.Fragment key={i}>{p}</React.Fragment>
      )}
    </>
  );
}

/* shared content styles */
const sectionH = {
  fontSize: 13, fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: 0.6, color: '#0f172a', margin: '34px 0 12px',
};
const thStyle = {
  textAlign: 'left', fontSize: 11.5, textTransform: 'uppercase',
  letterSpacing: 0.4, color: '#64748b', padding: '8px 12px',
  borderBottom: '2px solid #e2e8f0', fontWeight: 700,
};
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #f1f5f9', color: '#334155' };
const navBtn = {
  flex: 1, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff',
  padding: '10px 14px', cursor: 'pointer', maxWidth: '49%', color: '#0f172a',
};

/* ============================================================
   ALL CHAPTER CONTENT
   ============================================================ */
const CHAPTERS = [
  {
    num: 1,
    part: 0,
    title: 'Asymptotic Analysis — Big-O, Big-Θ, Big-Ω',
    coreIdea: "Big-O measures how an algorithm's operation count grows as input size `n` heads toward infinity — it deliberately throws away constants and hardware so you can compare algorithms by their scaling, not their stopwatch.",
    explanation: [
      "Asymptotic analysis asks one question: as `n` grows without bound, how fast does the number of basic operations grow? `Big-O` is an upper bound (grows no faster than), `Big-Ω` is a lower bound (grows no slower than), and `Big-Θ` is a tight bound that pins both sides — most claims people label 'O(n)' are really `Θ(n)` claims. We drop constants and lower-order terms because they vanish in the limit: `3n² + 5n + 100` is `O(n²)` because for large `n` the `n²` term dwarfs everything else.",
      "The growth ladder — `O(1)`, `O(log n)`, `O(n)`, `O(n log n)`, `O(n²)`, `O(2ⁿ)`, `O(n!)` — diverges brutally: at `n = 10⁶`, an `O(n log n)` sort does ~20 million steps while `O(n²)` does a trillion. Amortized analysis handles operations that are occasionally expensive but cheap on average across a sequence — a dynamic-array `append` is `O(1)` amortized even though one append in many triggers an `O(n)` copy (the aggregate, banker's, and potential methods all formalize this). Finally, an algorithm has best, average, and worst cases that can diverge wildly: quicksort is `Θ(n log n)` on average but `Θ(n²)` on an adversarial input, and that gap is exactly where production bugs hide.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Growth-rate chart">
        <defs>
          <marker id="axEnd" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" /></marker>
        </defs>
        <line x1="55" y1="278" x2="560" y2="278" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#axEnd)" />
        <line x1="55" y1="278" x2="55" y2="28" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#axEnd)" />
        <text x="300" y="300" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="monospace">input size n  →</text>
        <text x="20" y="155" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="monospace" transform="rotate(-90 20 155)">operations</text>

        <polyline fill="none" stroke="#64748b" strokeWidth="2" points="55,262 560,258" />
        <polyline fill="none" stroke="#0ea5e9" strokeWidth="2" points="55,262 200,240 560,222" />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points="55,277 560,140" />
        <polyline fill="none" stroke="#10b981" strokeWidth="2" points="55,277 150,262 280,232 400,188 500,130 558,94" />
        <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points="55,277 160,268 270,242 360,202 430,150 500,84 545,44" />
        <polyline fill="none" stroke="#ef4444" strokeWidth="2" points="55,277 170,273 260,263 330,243 380,205 415,135 440,55 450,34" />

        <text x="565" y="262" fontSize="11" fill="#64748b" fontFamily="monospace">O(1)</text>
        <text x="565" y="226" fontSize="11" fill="#0369a1" fontFamily="monospace">O(log n)</text>
        <text x="565" y="143" fontSize="11" fill="#1e40af" fontFamily="monospace">O(n)</text>
        <text x="505" y="80" fontSize="11" fill="#047857" fontFamily="monospace">O(n log n)</text>
        <text x="470" y="40" fontSize="11" fill="#b45309" fontFamily="monospace">O(n²)</text>
        <text x="345" y="40" fontSize="11" fill="#b91c1c" fontFamily="monospace">O(2ⁿ)</text>

        <rect x="74" y="48" width="200" height="104" rx="8" fill="#ffffff" stroke="#e2e8f0" />
        <rect x="74" y="48" width="200" height="104" rx="8" fill="#f59e0b" opacity="0.05" />
        <text x="84" y="64" fontSize="9.5" fill="#475569" fontFamily="monospace">zoom · small n</text>
        <line x1="90" y1="138" x2="262" y2="138" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="90" y1="138" x2="90" y2="72" stroke="#cbd5e1" strokeWidth="1" />
        <polyline fill="none" stroke="#10b981" strokeWidth="1.6" strokeDasharray="3 2" points="90,136 142,130 182,116 218,94 254,76" />
        <polyline fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="3 2" points="90,114 152,108 202,102 254,96" />
        <circle cx="200" cy="103" r="3" fill="#0f172a" />
        <line x1="200" y1="103" x2="200" y2="138" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 2" />
        <text x="204" y="134" fontSize="8.5" fill="#0f172a" fontFamily="monospace">n₀</text>
        <text x="256" y="74" fontSize="8" fill="#047857" fontFamily="monospace">n²</text>
        <text x="150" y="90" fontSize="8" fill="#b45309" fontFamily="monospace">c·n log n</text>
      </svg>
    ),
    svgCaption: "The growth ladder: six classes plotted against input size. They start bunched near the origin and fan out brutally as `n` grows. The inset zooms into small `n`, where a small-constant `O(n²)` (green) sits *below* a large-constant `O(n log n)` (amber) until the crossover `n₀` — at small scale, constants decide the winner, not the exponent.",
    cols: ['Growth class', 'Big-Θ', 'Steps @ n = 10⁶'],
    complexity: [
      { op: 'Constant', time: 'Θ(1)', space: '1' },
      { op: 'Logarithmic', time: 'Θ(log n)', space: '~20' },
      { op: 'Linear', time: 'Θ(n)', space: '10⁶' },
      { op: 'Linearithmic', time: 'Θ(n log n)', space: '~2 × 10⁷' },
      { op: 'Quadratic', time: 'Θ(n²)', space: '10¹²' },
      { op: 'Exponential', time: 'Θ(2ⁿ)', space: 'astronomical' },
    ],
    breaks: [
      { name: 'Asymptotics at small n', body: "You pick the 'faster' big-O algorithm and it loses in practice. The dropped constants and lower-order terms dominate at small/medium `n`, so a `Θ(n²)` with a tiny constant beats a `Θ(n log n)` with a big one. Benchmark at your real input sizes — this is exactly why std-library sorts switch to insertion sort below ~16 elements." },
      { name: 'The hidden worst case', body: "Average-case `Θ(n log n)` code occasionally hangs. A worst-case input (sorted data into a naive-pivot quicksort, or adversarial keys into a hash table) pushes it to `Θ(n²)` or worse. Randomize pivots / use median-of-three, or pick an algorithm with a hard worst-case bound." },
      { name: 'Confusing O with Θ', body: "You 'prove' an algorithm is fast by citing a loose `O()` upper bound. `O` is only an upper bound, so saying an `O(n)` routine is `O(n²)` is technically true and useless. State `Θ` when you mean a tight bound, and remember an upper bound alone says nothing about the lower bound." },
    ],
    code: [
      `import math

def steps(n):
    # operation counts each growth class needs for input n
    return {
        "O(1)":       1,
        "O(log n)":   math.log2(n),
        "O(n)":       n,
        "O(n log n)": n * math.log2(n),
        "O(n^2)":     n * n,
    }

for n in (8, 1024, 1_000_000):
    print(n, {k: round(v) for k, v in steps(n).items()})
# at n=1e6: O(n log n) ~2e7 but O(n^2) = 1e12  -- a 50,000x gap`,
      `def T(n):
    return 3*n*n + 5*n + 100        # the exact operation count

# the n^2 term's share of total work approaches 100% as n grows,
# which is precisely why we keep only n^2 and call it O(n^2)
for n in (1, 10, 100, 10_000):
    print(n, f"{3*n*n / T(n):.2%} of the work is the n^2 term")
# n=1 -> 2.80%   n=10000 -> 99.98%`,
    ],
    mentalModel: "Big-O is a telescope, not a stopwatch: it throws away everything you can see up close so the *shape* of the curve at infinity comes into focus.",
  },
  {
    num: 2,
    part: 0,
    title: 'The Machine Model — Cache, Locality, and Why Big-O Lies',
    coreIdea: "Big-O assumes every memory access costs the same; real hardware makes some accesses 100,000× slower than others, so the algorithm with fewer operations can still lose to the one that touches memory in cache-friendly order.",
    explanation: [
      "The cost model behind Big-O — one operation, one unit of time — is a fiction. Real machines have a memory hierarchy: `registers` → `L1` → `L2` → `L3` → `RAM` → `SSD`, each tier roughly 10–100× slower than the one above, so a register hit is sub-nanosecond while an `SSD` read is ~100 microseconds — a factor of a million. Crucially, memory moves in fixed 64-byte blocks called `cache lines`, not one byte at a time: touching a single array element drags its neighbors into cache for free.",
      "This hands arrays two gifts — `spatial locality` (the next element you want is already in the loaded line) and `temporal locality` (recently touched data stays cached). A contiguous array scan is one cache-friendly stream, so an `O(n)` array walk can beat an `O(n)` linked-list walk by 10×: the list is `n` separate allocations, and each hop is a random pointer chase that likely misses cache and stalls hundreds of cycles waiting on RAM. The rule has two steps — asymptotics pick the algorithm *class*, but constants and cache behavior pick the winner *within* a class.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Memory hierarchy and access patterns">
        <defs>
          <marker id="arG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#10b981" /></marker>
          <marker id="arR" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" /></marker>
        </defs>
        <text x="20" y="18" fontSize="11" fontWeight="700" fill="#475569" fontFamily="monospace">MEMORY HIERARCHY</text>

        {[
          ['Registers', '~0.3 ns', '~1 KB', '#d1fae5', '#10b981', 32],
          ['L1 cache', '~1 ns', '64 KB', '#dcfce7', '#22c55e', 68],
          ['L2 cache', '~4 ns', '512 KB', '#e0f2fe', '#0ea5e9', 104],
          ['L3 cache', '~12 ns', '16 MB', '#fef9c3', '#eab308', 140],
          ['Main RAM', '~80 ns', '16 GB', '#fed7aa', '#f59e0b', 176],
          ['SSD', '~100 µs', '1 TB', '#fee2e2', '#ef4444', 212],
        ].map(([name, lat, size, fill, stroke, y]) => (
          <g key={name}>
            <rect x="20" y={y} width="220" height="30" rx="5" fill={fill} stroke={stroke} strokeWidth="1.3" />
            <text x="30" y={y + 19} fontSize="11.5" fontWeight="700" fill="#334155">{name}</text>
            <text x="158" y={y + 19} fontSize="10.5" fill="#475569" fontFamily="monospace">{lat}</text>
            <text x="232" y={y + 19} fontSize="9.5" fill="#94a3b8" textAnchor="end" fontFamily="monospace">{size}</text>
          </g>
        ))}
        <text x="130" y="258" fontSize="9" fill="#64748b" textAnchor="middle" fontFamily="monospace">each step down ≈ 10–100× slower</text>

        <text x="290" y="28" fontSize="11" fontWeight="700" fill="#047857" fontFamily="monospace">① sequential array scan</text>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <g key={i}>
            <rect x={300 + i * 29} y="40" width="26" height="24" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2" />
            <text x={313 + i * 29} y="56" fontSize="10" fill="#1e40af" textAnchor="middle" fontFamily="monospace">{i}</text>
          </g>
        ))}
        <path d="M300,70 L300,76 L532,76 L532,70" fill="none" stroke="#10b981" strokeWidth="1.4" />
        <text x="416" y="90" fontSize="9.5" fill="#047857" textAnchor="middle" fontFamily="monospace">one 64-byte cache line → 8 elements, 1 fetch</text>
        <line x1="302" y1="104" x2="528" y2="104" stroke="#10b981" strokeWidth="2" markerEnd="url(#arG)" />
        <text x="416" y="118" fontSize="9.5" fill="#047857" textAnchor="middle" fontFamily="monospace">scan direction · neighbors prefetched</text>

        <text x="290" y="150" fontSize="11" fontWeight="700" fill="#b91c1c" fontFamily="monospace">② linked-list pointer chase</text>
        {[
          ['0x1A', 300, 166], ['0x9F', 514, 156], ['0x44', 356, 248], ['0xC2', 582, 246],
        ].map(([addr, x, y]) => (
          <g key={addr}>
            <rect x={x} y={y} width="44" height="22" rx="3" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.2" />
            <text x={x + 22} y={y + 15} fontSize="9.5" fill="#6d28d9" textAnchor="middle" fontFamily="monospace">{addr}</text>
          </g>
        ))}
        <line x1="344" y1="174" x2="514" y2="166" stroke="#ef4444" strokeWidth="1.6" strokeDasharray="4 3" markerEnd="url(#arR)" />
        <line x1="536" y1="178" x2="400" y2="252" stroke="#ef4444" strokeWidth="1.6" strokeDasharray="4 3" markerEnd="url(#arR)" />
        <line x1="400" y1="256" x2="582" y2="254" stroke="#ef4444" strokeWidth="1.6" strokeDasharray="4 3" markerEnd="url(#arR)" />
        <text x="455" y="296" fontSize="9.5" fill="#b91c1c" textAnchor="middle" fontFamily="monospace">every hop jumps to a random address → cache miss</text>
      </svg>
    ),
    svgCaption: "Left: the memory hierarchy, fast/small at top to slow/huge at the bottom. Right: the same `O(n)` work, two ways. The array scan (green) loads eight elements per 64-byte line and prefetches forward; the linked-list chase (red) hops to scattered addresses, missing cache on nearly every step.",
    cols: ['Tier', 'Typical latency', 'Relative cost'],
    complexity: [
      { op: 'Register', time: '~0.3 ns', space: '1×' },
      { op: 'L1 cache', time: '~1 ns', space: '~3×' },
      { op: 'L2 cache', time: '~4 ns', space: '~13×' },
      { op: 'L3 cache', time: '~12 ns', space: '~40×' },
      { op: 'Main RAM', time: '~80 ns', space: '~250×' },
      { op: 'SSD read', time: '~100 µs', space: '~300,000×' },
    ],
    breaks: [
      { name: 'Pointer-chasing structures', body: "A linked list or pointer-heavy tree is slow despite a great Big-O. Every node is a separate heap allocation at a random address, so traversal is a stream of cache misses with nothing prefetched. Use contiguous layouts — arrays, array-backed heaps, struct-of-arrays — or a pool allocator so nodes sit next to each other." },
      { name: 'Array-of-structs scans', body: "You loop over one field across many objects and it crawls. With interleaved fields, each 64-byte line you load carries mostly the *other* fields you didn't want. Switch to struct-of-arrays (each field its own array) so the field you scan is contiguous and every loaded byte is useful." },
      { name: 'False sharing', body: "A multithreaded counter gets *slower* as you add threads. Two cores write different variables that happen to share one cache line, forcing the line to bounce between caches on every write. Pad hot per-thread data so each lands on its own 64-byte line." },
    ],
    code: [
      `import time, random

N = 1_000_000
data = list(range(N))
seq  = list(range(N))                 # visit 0,1,2,... -> one stream
rand = seq[:]; random.shuffle(rand)   # same elements, random order

def walk(order):
    t = time.perf_counter(); s = 0
    for i in order:                   # identical operation count both ways
        s += data[i]
    return time.perf_counter() - t

print("sequential:", round(walk(seq),  3), "s")
print("scattered :", round(walk(rand), 3), "s")   # commonly 3-10x slower`,
      `CACHE_LINE = 64          # bytes pulled in per memory touch

# array-of-structs: Point is x,y,z,w = 32 bytes but we only read x,
# so each line carries 2 useful x's and 56 wasted bytes
useful = (CACHE_LINE // 32) * 8
print(f"AoS: {useful}/{CACHE_LINE} = {useful/CACHE_LINE:.0%} of each line is useful")
# struct-of-arrays: all x's contiguous -> the whole line is x's
print(f"SoA: {CACHE_LINE}/{CACHE_LINE} = 100% useful")`,
    ],
    mentalModel: "RAM is not a flat warehouse where every shelf is one step away — it is a city, and the cache line is the truckload: you pay for the trip once, so use everything that came on the truck before sending it back.",
  },
  {
    num: 3,
    part: 1,
    title: 'Arrays & Dynamic Arrays — Contiguous Memory and the Doubling Trick',
    coreIdea: "A static array is one contiguous block where element `i` lives at `base + i × stride`, giving true `O(1)` indexing; a dynamic array fakes unlimited growth on top of it by allocating a bigger block and copying everything over whenever it fills.",
    explanation: [
      "A static array is the simplest structure in computing: a single contiguous run of bytes. Because every element has the same width (`stride`), the address of element `i` is just `base + i × stride` — one multiply and one add, no searching, which is why random access is genuinely `O(1)` and why arrays are the most cache-friendly structure that exists. The catch is that the size is fixed at allocation: there is no room to grow without finding new memory.",
      "A dynamic array — Python's `list`, C++'s `vector`, Java's `ArrayList`, Go's `slice` — solves this by tracking two numbers, `size` (elements in use) and `capacity` (slots allocated), over a buffer that is deliberately bigger than needed. `append` writes into the next free slot in `O(1)` until `size == capacity`; then it allocates a new buffer (almost always a constant factor larger — 2× in many implementations, 1.5× in others), copies all `size` elements across, and frees the old one. That copy is `O(n)`, but because the buffer grows geometrically the copies happen exponentially less often: across `n` appends the total work is `1 + 2 + 4 + ... + n ≈ 2n`, so each append is `O(1)` amortized. Inserting or deleting anywhere but the end stays `O(n)` because every later element must shift.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Dynamic array doubling">
        <defs>
          <marker id="dynCopy" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#10b981" /></marker>
        </defs>
        <text x="20" y="18" fontSize="11" fontWeight="700" fill="#475569" fontFamily="monospace">DYNAMIC ARRAY GROWTH · geometric doubling</text>

        <text x="40" y="54" fontSize="10.5" fill="#b45309" fontFamily="monospace">size = 4   capacity = 4   → full, no free slot</text>
        {[7, 3, 9, 5].map((v, i) => (
          <g key={i}>
            <rect x={40 + i * 46} y="62" width="42" height="30" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.3" />
            <text x={61 + i * 46} y="82" fontSize="13" fill="#1e40af" textAnchor="middle" fontFamily="monospace">{v}</text>
            <text x={61 + i * 46} y="104" fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{i}</text>
          </g>
        ))}

        <text x="250" y="130" fontSize="10" fill="#475569" textAnchor="middle" fontFamily="monospace">append(2): allocate 2×, copy all 4, free old</text>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={61 + i * 46} y1="106" x2={61 + i * 46} y2="168" stroke="#10b981" strokeWidth="1.3" strokeDasharray="3 2" markerEnd="url(#dynCopy)" />
        ))}

        <text x="40" y="160" fontSize="10.5" fill="#0369a1" fontFamily="monospace">capacity = 8 (doubled)</text>
        {[7, 3, 9, 5, 2, null, null, null].map((v, i) => (
          <g key={i}>
            <rect x={40 + i * 46} y="170" width="42" height="30" rx="4"
              fill={v === null ? '#f1f5f9' : i === 4 ? '#fef3c7' : '#dbeafe'}
              stroke={v === null ? '#cbd5e1' : i === 4 ? '#f59e0b' : '#3b82f6'}
              strokeWidth="1.3" strokeDasharray={v === null ? '3 2' : 'none'} />
            {v !== null && <text x={61 + i * 46} y="190" fontSize="13" fill={i === 4 ? '#b45309' : '#1e40af'} textAnchor="middle" fontFamily="monospace">{v}</text>}
            <text x={61 + i * 46} y="212" fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{i}</text>
          </g>
        ))}
        <text x="40" y="234" fontSize="9.5" fill="#047857" fontFamily="monospace">4 copied + 1 new + 3 spare → next 3 appends are O(1)</text>

        <text x="430" y="248" fontSize="10" fontWeight="700" fill="#0369a1" fontFamily="monospace">doubling ladder</text>
        {[['2', 22], ['4', 40], ['8', 74], ['16', 130], ['32', 190]].map(([cap, w], i) => (
          <g key={cap}>
            <rect x="430" y={258 + i * 0} width={Number(w)} height="0" />
            <rect x="430" y={120 + i * 22} width={Number(w)} height="14" rx="2" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1" />
            <text x={436 + Number(w)} y={131 + i * 22} fontSize="8.5" fill="#0369a1" fontFamily="monospace">{cap}</text>
          </g>
        ))}
        <text x="430" y="244" fontSize="9" fill="#475569" fontFamily="monospace">Σ 1+2+4+…+n ≈ 2n</text>
      </svg>
    ),
    svgCaption: "A full buffer (`size == capacity`) triggers a resize: a new block twice as large is allocated, all elements are copied (green), the new value lands in the first free slot (amber), and the spare slots absorb the next few appends for free. Because capacity doubles each time, the copies form a geometric series summing to about `2n` — the source of `O(1)` amortized `append`.",
    complexity: [
      { op: 'Index / set a[i]', time: 'Θ(1)', space: '—' },
      { op: 'append (amortized)', time: 'Θ(1)*', space: 'Θ(1)' },
      { op: 'append (single worst)', time: 'Θ(n)', space: 'Θ(n)' },
      { op: 'insert / delete at i', time: 'Θ(n)', space: '—' },
      { op: 'search (unsorted)', time: 'Θ(n)', space: '—' },
      { op: 'total storage', time: '—', space: 'Θ(n)' },
    ],
    breaks: [
      { name: 'Front insert/delete in a loop', body: "A loop doing `lst.pop(0)` or `lst.insert(0, x)` quietly becomes `O(n²)` — each call shifts every remaining element by one slot. Use `collections.deque` for true `O(1)` ends, or append to the back and reverse once at the end." },
      { name: 'Amortized is not worst-case latency', body: "An average `O(1)` append still has occasional `O(n)` spikes when a resize fires — fatal for a real-time or audio loop where one frame must not stall on a giant copy + allocation. Preallocate to the known size up front (`reserve` / build a fixed list), or use a chunked deque that never relocates." },
      { name: 'Capacity never auto-shrinks', body: "After growing to a million and deleting almost everything, most implementations keep the huge buffer — your memory stays pinned high. Rebuild the container (`lst = list(lst)`) or call the language's `shrink_to_fit` to release the slack." },
    ],
    code: [
      `import sys

# watch a Python list's allocation grow in geometric jumps
lst = []
last = -1
for i in range(33):
    cap_bytes = sys.getsizeof(lst)
    if cap_bytes != last:                 # capacity changed -> a resize happened
        print(f"len={len(lst):>2}  bytes={cap_bytes}")
        last = cap_bytes
    lst.append(i)
# the byte size jumps at len 0,4,8,16,25,... not every append -> amortized O(1)`,
      `import time

def front_insert(n):                      # O(n^2): every insert shifts all
    a = []
    for i in range(n):
        a.insert(0, i)
    return a

def back_append(n):                       # O(n) amortized
    a = []
    for i in range(n):
        a.append(i)
    return a

for fn in (front_insert, back_append):
    t = time.perf_counter()
    fn(50_000)
    print(fn.__name__, round(time.perf_counter() - t, 3), "s")
# front_insert is typically 100x+ slower at this size`,
    ],
    mentalModel: "A dynamic array is a parking lot that, when it fills, you bulldoze and rebuild twice as large across the street — then tow every car over. The move is expensive, but because the lot keeps doubling you do it ever more rarely, so the average cost per car parked stays flat.",
  },
  {
    num: 4,
    part: 1,
    title: 'Linked Lists — Pointers, Splicing, and the Price of Indirection',
    coreIdea: "A linked list trades the array's contiguous block for scattered nodes joined by pointers — you give up `O(1)` indexing and cache friendliness, and in return you get `O(1)` splicing anywhere, *as long as you already hold a reference to the spot*.",
    explanation: [
      "Each node is an independent heap allocation holding a value plus a pointer to the next node (a singly linked list) or pointers to both next and previous (doubly linked). Because the nodes are separate objects at unrelated addresses, there is no `base + i × stride` formula — to reach element `k` you must start at the head and follow `k` pointers, so indexing and search are `Θ(n)`. This same indirection is what makes the list cache-hostile: every hop is a pointer chase to a random address that likely misses cache, exactly the pathology from the machine-model chapter.",
      "The payoff is structural surgery. Given a reference to a node, inserting or removing adjacent to it is `Θ(1)` — you rewire a constant number of pointers and touch nothing else, no shifting like an array requires. The crucial fine print: in a *singly* linked list, deleting a node you hold is still `Θ(n)`, because you need the *predecessor* to repoint its `next`, and finding it means walking from the head. A doubly linked list fixes this by carrying a `prev` pointer, making arbitrary splices truly `O(1)`; this is why production LRU caches, free lists, and OS scheduler queues use intrusive doubly linked lists where the node handle is already in hand.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Linked list nodes and splicing">
        <defs>
          <marker id="llNext" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6" /></marker>
          <marker id="llNew" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#10b981" /></marker>
          <marker id="llOld" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" /></marker>
          <marker id="llPrev" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" /></marker>
        </defs>

        <text x="20" y="18" fontSize="11" fontWeight="700" fill="#475569" fontFamily="monospace">SINGLY LINKED LIST · node = [ value | next ]</text>
        <text x="20" y="73" fontSize="10" fill="#6d28d9" fontFamily="monospace">head</text>
        {[['7', 70, '0x1A'], ['3', 262, '0x9F'], ['9', 454, '0x44']].map(([v, x, addr], i) => (
          <g key={i}>
            <text x={Number(x) + 40} y="48" fontSize="8.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{addr}</text>
            <rect x={x} y="56" width="118" height="34" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.3" />
            <line x1={Number(x) + 80} y1="56" x2={Number(x) + 80} y2="90" stroke="#3b82f6" strokeWidth="1" />
            <text x={Number(x) + 40} y="78" fontSize="14" fill="#1e40af" textAnchor="middle" fontFamily="monospace">{v}</text>
            <circle cx={Number(x) + 99} cy="73" r="3" fill="#1e40af" />
          </g>
        ))}
        <line x1="169" y1="73" x2="258" y2="73" stroke="#3b82f6" strokeWidth="1.6" markerEnd="url(#llNext)" />
        <line x1="361" y1="73" x2="450" y2="73" stroke="#3b82f6" strokeWidth="1.6" markerEnd="url(#llNext)" />
        <line x1="553" y1="73" x2="590" y2="73" stroke="#94a3b8" strokeWidth="1.4" />
        <text x="596" y="77" fontSize="10" fill="#94a3b8" fontFamily="monospace">∅</text>

        <text x="20" y="124" fontSize="11" fontWeight="700" fill="#b91c1c" fontFamily="monospace">DELETE the middle node — O(1) when you hold a reference</text>
        {[['7', 120, '#dbeafe', '#3b82f6'], ['3', 300, '#e2e8f0', '#94a3b8'], ['9', 480, '#dbeafe', '#3b82f6']].map(([v, x, f, s], i) => (
          <g key={i}>
            <rect x={x} y="138" width="72" height="30" rx="4" fill={f} stroke={s} strokeWidth="1.3" />
            <text x={Number(x) + 36} y="158" fontSize="13" fill={i === 1 ? '#94a3b8' : '#1e40af'} textAnchor="middle" fontFamily="monospace">{v}</text>
          </g>
        ))}
        <text x="336" y="190" fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">freed</text>
        <line x1="192" y1="160" x2="296" y2="153" stroke="#ef4444" strokeWidth="1.4" strokeDasharray="4 3" markerEnd="url(#llOld)" />
        <path d="M192,150 C 280,118 400,118 478,150" fill="none" stroke="#10b981" strokeWidth="1.8" markerEnd="url(#llNew)" />
        <text x="335" y="124" fontSize="9" fill="#047857" textAnchor="middle" fontFamily="monospace">new: A.next → C</text>

        <text x="20" y="222" fontSize="11" fontWeight="700" fill="#6d28d9" fontFamily="monospace">DOUBLY LINKED · prev lets you splice without scanning for the predecessor</text>
        {[['7', 130], ['3', 300], ['9', 470]].map(([v, x], i) => (
          <g key={i}>
            <rect x={x} y="240" width="96" height="34" rx="4" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.3" />
            <text x={Number(x) + 48} y="262" fontSize="13" fill="#6d28d9" textAnchor="middle" fontFamily="monospace">{v}</text>
          </g>
        ))}
        <line x1="226" y1="250" x2="298" y2="250" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#llNext)" />
        <line x1="396" y1="250" x2="468" y2="250" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#llNext)" />
        <line x1="298" y1="266" x2="226" y2="266" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#llPrev)" />
        <line x1="468" y1="266" x2="396" y2="266" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#llPrev)" />
        <text x="262" y="294" fontSize="8.5" fill="#3b82f6" textAnchor="middle" fontFamily="monospace">next →</text>
        <text x="432" y="294" fontSize="8.5" fill="#8b5cf6" textAnchor="middle" fontFamily="monospace">← prev</text>
      </svg>
    ),
    svgCaption: "Top: three nodes at unrelated addresses, each pointing to the next, ending at null (`∅`). Middle: deleting the held middle node is `O(1)` — repoint `A.next` to `C` (green) and drop the old link (red); no elements shift. Bottom: a doubly linked list adds a `prev` pointer so a node can be unlinked without first walking the list to find what came before it.",
    complexity: [
      { op: 'Index / search', time: 'Θ(n)', space: '—' },
      { op: 'Insert/delete at head', time: 'Θ(1)', space: 'Θ(1)' },
      { op: 'Splice given node ref', time: 'Θ(1)', space: 'Θ(1)' },
      { op: 'Delete held node (singly)', time: 'Θ(n)', space: '—' },
      { op: 'Insert/delete at index i', time: 'Θ(n)', space: '—' },
      { op: 'Storage (n nodes)', time: '—', space: 'Θ(n) + ptrs' },
    ],
    breaks: [
      { name: 'Indexing it like an array', body: "Writing `node_at(k)` and calling it inside a loop turns an innocent traversal into `O(n²)` — each lookup re-walks from the head. Iterate with a moving cursor (`while node: node = node.next`), or pick an array if you truly need random access." },
      { name: 'Cache misses eat the asymptotics', body: "For read- or scan-heavy workloads a linked list is routinely 5–10× slower than an array of the same `O(n)`, because every node is a random-address pointer chase that stalls on memory. Use contiguous storage, or pool the nodes in one slab so they sit near each other." },
      { name: 'Singly-linked delete needs the predecessor', body: "You hold the node to remove but it is singly linked, so unlinking it is `O(n)` — you must scan from the head to find the node whose `next` points at it. Use a doubly linked list, keep a `prev` handle, or copy the successor's value into this node and delete the successor instead." },
    ],
    code: [
      `class Node:
    __slots__ = ("val", "next")
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt

def insert_after(node, val):      # O(1): splice a new node in
    node.next = Node(val, node.next)

def delete_after(node):           # O(1): unlink node.next
    if node.next:
        node.next = node.next.next

head = Node(7, Node(3, Node(9)))
insert_after(head, 5)             # 7 -> 5 -> 3 -> 9
delete_after(head.next)           # remove the 3 after the 5
n = head
while n:                          # traverse is the only way to read
    print(n.val, end=" -> ")
    n = n.next                    # 7 -> 5 -> 9 ->`,
      `def reverse(head):                # classic 3-pointer in-place reversal
    prev = None
    cur = head
    while cur:
        nxt = cur.next            # save the rest of the list
        cur.next = prev           # flip this link backward
        prev = cur                # advance prev and cur by one
        cur = nxt
    return prev                   # new head is the old tail

# build 1->2->3->4 then reverse to 4->3->2->1
head = Node(1, Node(2, Node(3, Node(4))))
head = reverse(head)
out, n = [], head
while n: out.append(n.val); n = n.next
print(out)                        # [4, 3, 2, 1]`,
    ],
    mentalModel: "A linked list is a paper scavenger hunt: each clue holds a value and the address of the next clue. Splicing in a new clue means rewriting a single address, but to reach the 50th clue you must physically visit all 49 before it — there is no shortcut to the middle.",
  },
  {
    num: 5,
    part: 1,
    title: 'Stacks, Queues, Deques & Ring Buffers — Disciplines Over an Array',
    coreIdea: "Stacks, queues, and deques are not new storage — they are *access disciplines* (where you may push and pop) layered on an array or list; the ring buffer is the trick that makes a queue `O(1)` at both ends without ever shifting elements.",
    explanation: [
      "A stack is last-in-first-out: you push and pop at one end only, like a spring-loaded plate dispenser, and it is exactly the structure the CPU uses for function calls (the call stack) and that any traversal uses to remember where to backtrack. A queue is first-in-first-out: you enqueue at the back and dequeue from the front, the natural model for task pipelines and breadth-first search. A deque (double-ended queue) allows push and pop at *both* ends and generalizes both. All three are `O(1)` per operation when implemented correctly.",
      "The naive trap is building a queue on a plain array and dequeuing from the front — that shifts every remaining element down by one, making each dequeue `O(n)` and a drain `O(n²)`. The fix is a ring (circular) buffer: a fixed-capacity array with two indices, `head` (next read) and `tail` (next write), that each advance with `(i + 1) % capacity` so they wrap from the last slot back to the first. Nothing ever moves; you just rotate the two cursors around the ring, giving genuine `O(1)` enqueue and dequeue with zero allocation — which is why ring buffers are everywhere latency matters: audio pipelines, network card I/O, and lock-free producer/consumer queues. The one subtlety is telling *full* from *empty*, since both leave `head == tail`; you resolve it by tracking an explicit element count or by deliberately leaving one slot empty.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Stack, queue, and ring buffer">
        <defs>
          <marker id="sqArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b" /></marker>
          <marker id="rbHead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" /></marker>
          <marker id="rbTail" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" /></marker>
          <marker id="rbWrap" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0ea5e9" /></marker>
        </defs>

        <text x="20" y="18" fontSize="11" fontWeight="700" fill="#1e40af" fontFamily="monospace">STACK · LIFO (push/pop one end)</text>
        <text x="80" y="42" fontSize="9" fill="#b45309" textAnchor="middle" fontFamily="monospace">↑ push / pop ↓</text>
        {[['C', 50], ['B', 72], ['A', 94]].map(([v, y], i) => (
          <g key={i}>
            <rect x="50" y={y} width="60" height="20" rx="3" fill={i === 0 ? '#fef3c7' : '#dbeafe'} stroke={i === 0 ? '#f59e0b' : '#3b82f6'} strokeWidth="1.2" />
            <text x="80" y={Number(y) + 14} fontSize="11" fill={i === 0 ? '#b45309' : '#1e40af'} textAnchor="middle" fontFamily="monospace">{v}</text>
          </g>
        ))}
        <text x="118" y="64" fontSize="8.5" fill="#94a3b8" fontFamily="monospace">← top</text>

        <text x="330" y="18" fontSize="11" fontWeight="700" fill="#0369a1" fontFamily="monospace">QUEUE · FIFO (enqueue back, dequeue front)</text>
        {['A', 'B', 'C', 'D'].map((v, i) => (
          <g key={i}>
            <rect x={360 + i * 42} y="40" width="36" height="26" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2" />
            <text x={378 + i * 42} y="58" fontSize="11" fill="#1e40af" textAnchor="middle" fontFamily="monospace">{v}</text>
          </g>
        ))}
        <text x="378" y="84" fontSize="8.5" fill="#047857" textAnchor="middle" fontFamily="monospace">dequeue</text>
        <text x="546" y="84" fontSize="8.5" fill="#b45309" textAnchor="middle" fontFamily="monospace">enqueue</text>
        <line x1="378" y1="32" x2="345" y2="32" stroke="#64748b" strokeWidth="1.2" markerEnd="url(#sqArr)" />
        <line x1="528" y1="53" x2="560" y2="53" stroke="#64748b" strokeWidth="1.2" markerEnd="url(#sqArr)" />

        <line x1="20" y1="112" x2="620" y2="112" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="134" fontSize="11" fontWeight="700" fill="#475569" fontFamily="monospace">RING BUFFER · indices advance with (i + 1) % capacity — nothing shifts</text>

        {['d', 'e', null, null, null, 'a', 'b', 'c'].map((v, i) => (
          <g key={i}>
            <rect x={40 + i * 70} y="168" width="62" height="40" rx="5"
              fill={v === null ? '#f1f5f9' : '#dbeafe'} stroke={v === null ? '#cbd5e1' : '#3b82f6'}
              strokeWidth="1.3" strokeDasharray={v === null ? '3 2' : 'none'} />
            {v !== null && <text x={71 + i * 70} y="193" fontSize="15" fill="#1e40af" textAnchor="middle" fontFamily="monospace">{v}</text>}
            <text x={71 + i * 70} y="224" fontSize="9.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{i}</text>
          </g>
        ))}

        <line x1="391" y1="150" x2="391" y2="166" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#rbTail)" />
        <text x="391" y="146" fontSize="9.5" fill="#b45309" textAnchor="middle" fontFamily="monospace">tail → write next</text>
        <line x1="421" y1="240" x2="421" y2="210" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#rbHead)" />
        <text x="421" y="256" fontSize="9.5" fill="#6d28d9" textAnchor="middle" fontFamily="monospace">head → read next</text>

        <path d="M601,208 C 620,250 40,250 71,212" fill="none" stroke="#0ea5e9" strokeWidth="1.6" strokeDasharray="4 3" markerEnd="url(#rbWrap)" />
        <text x="330" y="294" fontSize="9.5" fill="#0369a1" textAnchor="middle" fontFamily="monospace">wrap: slot 7 → slot 0 · keep a count to tell full from empty (both leave head == tail)</text>
      </svg>
    ),
    svgCaption: "Top: a stack pushes/pops one end (LIFO); a queue enqueues at the back and dequeues at the front (FIFO). Bottom: a ring buffer stores the logical sequence `a,b,c,d,e` across wrapped indices `5,6,7,0,1`. The `head` and `tail` cursors rotate with modular arithmetic so neither end ever shifts data — the dashed arc shows index 7 wrapping back to 0.",
    complexity: [
      { op: 'Stack push / pop', time: 'Θ(1)', space: 'Θ(1)' },
      { op: 'Queue enqueue/dequeue (ring)', time: 'Θ(1)', space: 'Θ(1)' },
      { op: 'Queue dequeue (array front)', time: 'Θ(n)', space: '—' },
      { op: 'Deque push/pop either end', time: 'Θ(1)', space: 'Θ(1)' },
      { op: 'Peek front / top', time: 'Θ(1)', space: '—' },
      { op: 'Storage', time: '—', space: 'Θ(n)' },
    ],
    breaks: [
      { name: 'The list-as-queue mistake', body: "Using a plain list and calling `lst.pop(0)` to dequeue is `O(n)` per call and `O(n²)` to drain — every survivor shifts down a slot. Use `collections.deque` (a doubly linked block list) or a ring buffer for `O(1)` ends." },
      { name: 'Full vs empty ambiguity', body: "A ring buffer with only `head` and `tail` cannot distinguish full from empty: both leave `head == tail`, so a wrong guess either drops data or reads stale slots. Track an explicit element count, or deliberately keep one slot vacant so 'full' means `(tail + 1) % cap == head`." },
      { name: 'Overflow with no policy', body: "When the producer outruns the consumer, a fixed ring overflows — and silently overwriting unread data corrupts the stream. Decide the policy on purpose: block the producer, drop the oldest, or drop the newest; do not let it happen by accident." },
    ],
    code: [
      `class RingBuffer:
    def __init__(self, capacity):
        self.buf = [None] * capacity
        self.cap = capacity
        self.head = self.tail = self.count = 0

    def enqueue(self, x):                 # O(1), no shifting
        if self.count == self.cap:
            raise OverflowError("buffer full")
        self.buf[self.tail] = x
        self.tail = (self.tail + 1) % self.cap   # wrap with modulo
        self.count += 1

    def dequeue(self):                    # O(1)
        if self.count == 0:
            raise IndexError("buffer empty")
        x = self.buf[self.head]
        self.head = (self.head + 1) % self.cap
        self.count -= 1
        return x

rb = RingBuffer(3)
rb.enqueue("a"); rb.enqueue("b"); print(rb.dequeue())  # a
rb.enqueue("c"); rb.enqueue("d")          # d wraps into slot 0
print(rb.dequeue(), rb.dequeue())         # b c`,
      `from collections import deque

dq = deque()
dq.append(1); dq.append(2)        # use as a stack: append / pop  (LIFO)
print(dq.pop())                   # 2  -> last in, first out

dq.appendleft(0)                  # use as a queue: append / popleft (FIFO)
print(dq.popleft())               # 0  -> O(1) at the front, unlike list.pop(0)
print(list(dq))                   # [1]`,
    ],
    mentalModel: "A ring buffer is a revolving sushi conveyor of fixed length: chefs set plates down at the tail, diners lift them off at the head, and when either reaches the end of the loop it simply continues from the start. The belt itself never slides — only the two points of attention travel around it.",
  },
  {
    num: 6,
    part: 2,
    title: 'Hash Functions & Hash Tables — Turning Keys Into Array Indices',
    coreIdea: "A hash table is just an array plus a function that turns any key into a slot number, so a lookup becomes one address computation instead of a scan — the whole game is keeping that function fast, well-spread, and the table empty enough that collisions stay rare.",
    explanation: [
      "A hash table stores entries in an array of `capacity` buckets and uses a hash function to decide where each key goes: `index = hash(key) % capacity` (or `hash(key) & (capacity − 1)` when capacity is a power of two). A good hash function is fast and spreads keys uniformly so that distinct keys rarely land in the same bucket — for strings that usually means a polynomial rolling hash, for integers a multiply-and-shift mixer. Because the index is computed, not searched, lookup, insert, and delete are `O(1)` on *average*. Note the qualifier: that is an expected-time guarantee, not a worst-case one.",
      "What keeps the average true is the load factor `α = n / capacity`, the fraction of the table in use. As `α` rises, the chance that a new key collides with an existing one climbs, so once `α` crosses a threshold (commonly around 0.7–0.75) the table *resizes*: it allocates a larger array, recomputes every key's bucket, and reinserts them — an `O(n)` rehash that, amortized over the inserts that triggered it, stays `O(1)` per operation, the same geometric-growth argument as a dynamic array. Two contracts must hold or entries vanish: equal keys must produce equal hashes, and a key's hash must not change while it sits in the table. The worst case is still `O(n)` — if every key hashes to one bucket, the table degrades to a linear list, which is precisely the collision problem the next chapter is about.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Hash function mapping keys to buckets">
        <defs>
          <marker id="hsArr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0d9488" /></marker>
        </defs>
        <text x="20" y="18" fontSize="11" fontWeight="700" fill="#0f766e" fontFamily="monospace">key → hash(key) → % capacity → bucket index</text>

        {[['cat', '0x8c1f', '3', 64, 123], ['owl', '0x2319', '1', 100, 65], ['dog', '0x4f20', '6', 136, 210], ['fox', '0x4fa8', '6', 172, 210]].map(([k, h, idx, ry, by], i) => (
          <g key={i}>
            <rect x="20" y={Number(ry) - 13} width="50" height="26" rx="4" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.2" />
            <text x="45" y={Number(ry) + 4} fontSize="12" fill="#0f766e" textAnchor="middle" fontFamily="monospace">{k}</text>
            <line x1="70" y1={ry} x2="90" y2={ry} stroke="#0d9488" strokeWidth="1.2" markerEnd="url(#hsArr)" />
            <rect x="92" y={Number(ry) - 12} width="94" height="24" rx="4" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.1" />
            <text x="139" y={Number(ry) + 4} fontSize="10.5" fill="#475569" textAnchor="middle" fontFamily="monospace">h={h}</text>
            <line x1="186" y1={ry} x2="206" y2={ry} stroke="#0d9488" strokeWidth="1.2" markerEnd="url(#hsArr)" />
            <rect x="208" y={Number(ry) - 12} width="76" height="24" rx="4" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.1" />
            <text x="246" y={Number(ry) + 4} fontSize="10.5" fill="#475569" textAnchor="middle" fontFamily="monospace">% 8 = {idx}</text>
            <line x1="284" y1={ry} x2="422" y2={by} stroke="#5eead4" strokeWidth="1.3" markerEnd="url(#hsArr)" />
          </g>
        ))}

        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const fill = i === 6 ? '#fef3c7' : (i === 1 || i === 3) ? '#ccfbf1' : '#f8fafc';
          const stroke = i === 6 ? '#f59e0b' : (i === 1 || i === 3) ? '#0d9488' : '#e2e8f0';
          const label = i === 1 ? 'owl' : i === 3 ? 'cat' : i === 6 ? 'dog, fox  ⚠ collision' : '';
          return (
            <g key={i}>
              <text x={418} y={36 + i * 29 + 17} fontSize="10" fill="#94a3b8" textAnchor="end" fontFamily="monospace">{i}</text>
              <rect x="426" y={36 + i * 29} width="150" height="25" rx="4" fill={fill} stroke={stroke} strokeWidth="1.2" />
              <text x="436" y={36 + i * 29 + 17} fontSize="10.5" fill={i === 6 ? '#b45309' : '#0f766e'} fontFamily="monospace">{label}</text>
            </g>
          );
        })}
        <text x="592" y="160" fontSize="9.5" fill="#475569" textAnchor="middle" fontFamily="monospace" transform="rotate(90 592 160)">bucket array (capacity 8)</text>

        <text x="20" y="300" fontSize="10" fill="#0f766e" fontFamily="monospace">load factor α = n / capacity = 4 / 8 = 0.50 — grow &amp; rehash all keys once α exceeds ~0.75</text>
      </svg>
    ),
    svgCaption: "Each key is hashed to a big integer, then reduced modulo the capacity to a bucket index. `owl` and `cat` land alone; `dog` and `fox` both reduce to bucket 6 — a collision (amber), handled by the strategies in the next chapter. The load factor `α` tracks how full the table is and triggers a grow-and-rehash before collisions become common.",
    cols: ['Operation', 'Average', 'Worst case'],
    complexity: [
      { op: 'Lookup', time: 'Θ(1)', space: 'Θ(n)' },
      { op: 'Insert (amortized)', time: 'Θ(1)', space: 'Θ(n)' },
      { op: 'Delete', time: 'Θ(1)', space: 'Θ(n)' },
      { op: 'Resize / rehash', time: 'Θ(n) total', space: 'Θ(n)' },
      { op: 'Iterate all keys', time: 'Θ(n)', space: 'Θ(n)' },
    ],
    breaks: [
      { name: 'Hash flooding (algorithmic DoS)', body: "An attacker who knows your hash function sends keys engineered to all collide, collapsing every `O(1)` op to `O(n)` and freezing the server. Use a keyed, randomized hash like SipHash (Python, Rust, and Perl seed string hashing per-process for exactly this reason)." },
      { name: 'A weak or low-entropy hash', body: "Hashing on only the low bits, or `% ` a non-prime against patterned keys (multiples of 16, sequential IDs), clusters everything into a few buckets and wrecks the distribution. Use a proper mixing/finalizer step and a prime modulus, and never use an object's memory address as the hash of a value-equality key." },
      { name: 'Mutating a key in place', body: "Change a field the hash depends on after inserting, and the entry is now in the wrong bucket — present in memory but unfindable, since lookups compute the *new* hash. Only hash on immutable fields, and never mutate a key while it lives in a set or dict." },
    ],
    code: [
      `def poly_hash(s, base=131, mod=2**61 - 1):
    # polynomial rolling hash: each char shifts the running value by 'base'
    h = 0
    for ch in s:
        h = (h * base + ord(ch)) % mod
    return h

CAP = 8
for key in ("cat", "owl", "dog", "fox"):
    h = poly_hash(key)
    print(f"{key}: h={h}  bucket={h % CAP}")   # bucket = h % capacity
# dog and fox can share a bucket -> that is a collision`,
      `import random

def bucket_spread(n_keys, cap):
    counts = [0] * cap
    for _ in range(n_keys):
        key = random.randbytes(8)            # random keys -> good hash proxy
        counts[hash(key) % cap] += 1
    return counts

spread = bucket_spread(800, 8)
print("per-bucket:", spread)
print("ideal ~", 800 // 8, "each")
# a healthy hash keeps buckets near-even; lopsided counts = clustering`,
    ],
    mentalModel: "A hash function is a lightning-fast librarian who never opens the book — one glance at the title and they shout a shelf number. Magic when every title maps to its own shelf; useless the moment the librarian starts sending every book to shelf 7.",
  },
  {
    num: 7,
    part: 2,
    title: 'Collision Resolution — Chaining vs Open Addressing',
    coreIdea: "Two distinct keys will eventually hash to the same bucket; collision resolution is the policy for what happens next — either grow a little list hanging off that bucket (chaining), or keep everything inside the array and hunt for the next free slot (open addressing).",
    explanation: [
      "Separate chaining makes each bucket the head of a small container — usually a linked list, sometimes a dynamic array or even a tree — and simply appends colliding entries there. A lookup hashes to the bucket and walks its (hopefully tiny) list, giving `Θ(1 + α)` average time where `α` is the load factor; deletion is a trivial unlink. Chaining degrades gracefully past `α = 1` and is forgiving of a mediocre hash, but it pays for pointer chasing and a separate allocation per node, and Java's HashMap famously 'treeifies' any chain that grows past length 8 into a red-black tree so a bad bucket stays `O(log k)` instead of `O(k)`.",
      "Open addressing keeps every entry in the array itself and, on collision, probes a deterministic sequence of alternative slots until it finds an empty one. Linear probing tries `i+1, i+2, …` — maximally cache-friendly but prone to *primary clustering*, where occupied runs merge into long ones; quadratic probing tries `i+1², i+2², …` to break those runs; double hashing derives the step from a second hash for the best spread. The defining gotcha is deletion: you cannot simply blank a slot, because that would break the probe chain and hide every entry that was displaced past it — so you write a *tombstone* marker that lookups skip and inserts may reuse. Open addressing has no per-entry pointers and superb locality, but it demands a lower load factor (keep `α < 0.7`) and its cost explodes as `α → 1` (`Θ(1 / (1 − α))`). Python's `dict` uses open addressing with a perturbation probe; most modern high-performance tables (Rust, Swift, Abseil) use open-addressing variants like Robin Hood or SwissTable.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Chaining versus open addressing">
        <defs>
          <marker id="crChain" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0d9488" /></marker>
          <marker id="crProbe" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" /></marker>
        </defs>

        <text x="20" y="16" fontSize="11" fontWeight="700" fill="#0f766e" fontFamily="monospace">SEPARATE CHAINING · each bucket heads a list of its colliding keys</text>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const occ = { 1: 'owl', 3: 'cat', 6: 'dog' };
          const v = occ[i];
          return (
            <g key={i}>
              <text x={62 + i * 73} y="34" fontSize="9.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{i}</text>
              <rect x={30 + i * 73} y="40" width="66" height="28" rx="4" fill={v ? '#ccfbf1' : '#f8fafc'} stroke={v ? '#0d9488' : '#e2e8f0'} strokeWidth="1.2" />
              {v && <text x={63 + i * 73} y="59" fontSize="11.5" fill="#0f766e" textAnchor="middle" fontFamily="monospace">{v}</text>}
            </g>
          );
        })}
        <line x1="501" y1="68" x2="501" y2="92" stroke="#0d9488" strokeWidth="1.4" markerEnd="url(#crChain)" />
        <rect x="468" y="94" width="66" height="26" rx="4" fill="#ccfbf1" stroke="#0d9488" strokeWidth="1.2" />
        <text x="501" y="111" fontSize="11.5" fill="#0f766e" textAnchor="middle" fontFamily="monospace">fox</text>
        <line x1="501" y1="120" x2="501" y2="134" stroke="#94a3b8" strokeWidth="1.2" />
        <text x="501" y="146" fontSize="10" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">∅</text>
        <text x="30" y="112" fontSize="9.5" fill="#475569" fontFamily="monospace">lookup = hash to bucket,</text>
        <text x="30" y="126" fontSize="9.5" fill="#475569" fontFamily="monospace">then walk its short list:</text>
        <text x="30" y="140" fontSize="9.5" fill="#475569" fontFamily="monospace">Θ(1 + α)</text>

        <line x1="20" y1="162" x2="620" y2="162" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="182" fontSize="11" fontWeight="700" fill="#b45309" fontFamily="monospace">OPEN ADDRESSING · linear probing keeps entries in the array; deletes leave tombstones</text>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          let label = '', fill = '#f8fafc', stroke = '#e2e8f0', tcol = '#0f766e';
          if (i === 1) { label = 'owl'; fill = '#ccfbf1'; stroke = '#0d9488'; }
          if (i === 3) { label = 'cat'; fill = '#ccfbf1'; stroke = '#0d9488'; }
          if (i === 6) { label = '✗'; fill = '#fee2e2'; stroke = '#ef4444'; tcol = '#b91c1c'; }
          if (i === 7) { label = 'fox'; fill = '#fef3c7'; stroke = '#f59e0b'; tcol = '#b45309'; }
          return (
            <g key={i}>
              <text x={62 + i * 73} y="200" fontSize="9.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{i}</text>
              <rect x={30 + i * 73} y="206" width="66" height="30" rx="4" fill={fill} stroke={stroke} strokeWidth="1.2" strokeDasharray={i === 6 ? '3 2' : 'none'} />
              <text x={63 + i * 73} y="226" fontSize="12" fill={tcol} textAnchor="middle" fontFamily="monospace">{label}</text>
            </g>
          );
        })}
        <path d="M501,206 C 520,184 555,184 574,204" fill="none" stroke="#f59e0b" strokeWidth="1.6" markerEnd="url(#crProbe)" />
        <text x="448" y="262" fontSize="9.5" fill="#b45309" fontFamily="monospace">fox hashed to 6 (taken) → probed to 7</text>
        <text x="448" y="278" fontSize="9.5" fill="#b91c1c" fontFamily="monospace">dog deleted → tombstone (✗), not empty,</text>
        <text x="448" y="292" fontSize="9.5" fill="#b91c1c" fontFamily="monospace">so the probe to fox at 7 still works</text>
      </svg>
    ),
    svgCaption: "The same collision (`dog` and `fox` both hash to bucket 6), resolved two ways. Top: chaining hangs a list off bucket 6 — `dog → fox → ∅`. Bottom: open addressing keeps `fox` in the array by probing forward to slot 7; and because `dog` was deleted as a *tombstone* rather than blanked, a later lookup for `fox` still probes past slot 6 and finds it.",
    cols: ['Operation', 'Chaining', 'Open addressing'],
    complexity: [
      { op: 'Lookup (average)', time: 'Θ(1 + α)', space: 'Θ(1 / (1 − α))' },
      { op: 'Insert (average)', time: 'Θ(1)', space: 'Θ(1 / (1 − α))' },
      { op: 'Delete', time: 'Θ(1)', space: 'Θ(1) + tombstone' },
      { op: 'Worst case', time: 'Θ(n)', space: 'Θ(n)' },
      { op: 'Per-entry overhead', time: 'list node', space: 'none (in-array)' },
    ],
    breaks: [
      { name: 'Deleting without a tombstone', body: "In open addressing, blanking a deleted slot severs the probe chain: every entry that was bumped past it becomes unreachable even though it is still in the array. Mark deletions as tombstones that lookups skip and inserts may overwrite, and periodically rehash the whole table to purge accumulated tombstones." },
      { name: 'Primary clustering at high load', body: "Linear probing lets occupied runs merge into ever-longer ones, so probe sequences lengthen and lookups crawl as `α` approaches 0.9. Hold `α` under ~0.7 with timely resizes, or switch to double hashing / Robin Hood hashing, which spread the probes out." },
      { name: 'One giant chain from a bad hash', body: "With chaining and a poor hash, most keys funnel into a few buckets, so a 'list' becomes a linear scan plus a stream of cache misses on every node. Fix the hash, and treeify pathologically long chains — Java's HashMap rewrites any chain over length 8 as a red-black tree for an `O(log k)` floor." },
    ],
    code: [
      `class ChainedMap:
    def __init__(self, cap=8):
        self.buckets = [[] for _ in range(cap)]    # each bucket: list of (k, v)
        self.cap = cap

    def _b(self, key):
        return hash(key) % self.cap

    def put(self, key, val):
        bucket = self.buckets[self._b(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, val); return       # update in place
        bucket.append((key, val))                    # append on collision

    def get(self, key):
        for k, v in self.buckets[self._b(key)]:      # walk the short list
            if k == key:
                return v
        raise KeyError(key)

m = ChainedMap(); m.put("dog", 1); m.put("fox", 2)
print(m.get("fox"))                                  # 2`,
      `_EMPTY = object()
_TOMB  = object()                       # tombstone sentinel

class LinearProbeMap:
    def __init__(self, cap=8):
        self.slots = [(_EMPTY, None)] * cap
        self.cap = cap

    def put(self, key, val):
        i = hash(key) % self.cap
        while self.slots[i][0] not in (_EMPTY, _TOMB, key):
            i = (i + 1) % self.cap      # linear probe to next slot
        self.slots[i] = (key, val)

    def get(self, key):
        i = hash(key) % self.cap
        while self.slots[i][0] is not _EMPTY:        # stop only on EMPTY, skip TOMB
            if self.slots[i][0] == key:
                return self.slots[i][1]
            i = (i + 1) % self.cap
        raise KeyError(key)

    def delete(self, key):
        i = hash(key) % self.cap
        while self.slots[i][0] is not _EMPTY:
            if self.slots[i][0] == key:
                self.slots[i] = (_TOMB, None)        # tombstone, not EMPTY
                return
            i = (i + 1) % self.cap

m = LinearProbeMap(); m.put("dog", 1); m.put("fox", 2)
m.delete("dog"); print(m.get("fox"))                 # 2 -> still reachable`,
    ],
    mentalModel: "Chaining is a coat-check where each numbered hook can hold a whole rack of coats. Open addressing is a parking garage with no overflow lot: if your assigned space is taken you roll to the next, and when you leave you must drop a 'towed — keep looking' cone, or the next driver will assume the row ended and miss the cars beyond.",
  },
  {
    num: 8,
    part: 3,
    title: 'Binary Trees & Traversals — Shape, Height, and Order of Visit',
    coreIdea: "A binary tree links nodes that each have up to two children, and almost everything about its performance comes down to one number — its height — while *how* you walk it (pre/in/post-order or level-by-level) decides the order in which you see the data.",
    explanation: [
      "A binary tree is a set of nodes where each holds a value and up to two child pointers, `left` and `right`, descending from a single `root` down to `leaf` nodes with no children. The decisive property is *height* — the longest root-to-leaf path — because the cost of reaching the bottom is proportional to it: a balanced tree has height `Θ(log n)`, but a degenerate tree that has collapsed into a single chain has height `Θ(n)`, no better than a linked list. Most trees are stored as linked nodes, though a *complete* tree can be packed into a flat array where node `i`'s children sit at `2i+1` and `2i+2` and its parent at `(i−1)//2`, a layout the heap chapter relies on.",
      "Visiting every node is a traversal, and there are four canonical orders. The depth-first family differs only in *when* you process a node relative to its subtrees: preorder is node-then-left-then-right (good for copying or serializing structure), inorder is left-then-node-then-right (which, crucially, emits a binary *search* tree's keys in sorted order), and postorder is left-then-right-then-node (good for deleting or evaluating expression trees bottom-up). Breadth-first (level-order) instead sweeps the tree one rank at a time using a queue. Recursive DFS is concise but consumes call-stack space proportional to the height, `Θ(h)` — which is exactly why a deep, unbalanced tree can overflow the stack, and why an iterative version with an explicit stack is the safe choice on untrusted shapes.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Binary tree and traversal orders">
        <defs>
          <marker id="btE" markerWidth="2" markerHeight="2" refX="1" refY="1"><circle cx="1" cy="1" r="1" fill="#059669" /></marker>
        </defs>
        <text x="20" y="18" fontSize="11" fontWeight="700" fill="#047857" fontFamily="monospace">BINARY TREE</text>
        {/* edges */}
        <line x1="170" y1="50" x2="90" y2="108" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="170" y1="50" x2="250" y2="108" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="90" y1="108" x2="50" y2="166" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="90" y1="108" x2="130" y2="166" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="250" y1="108" x2="300" y2="166" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="130" y1="166" x2="100" y2="222" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="130" y1="166" x2="160" y2="222" stroke="#a7f3d0" strokeWidth="2" />
        {[['F', 170, 50], ['B', 90, 108], ['G', 250, 108], ['A', 50, 166], ['D', 130, 166], ['I', 300, 166], ['C', 100, 222], ['E', 160, 222]].map(([v, x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="17" fill="#d1fae5" stroke="#059669" strokeWidth="1.6" />
            <text x={x} y={Number(y) + 5} fontSize="14" fill="#047857" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <text x="170" y="33" fontSize="8.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">root</text>
        <text x="60" y="252" fontSize="8.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">leaves →</text>

        <line x1="360" y1="40" x2="360" y2="290" stroke="#e2e8f0" strokeWidth="1" />
        <text x="380" y="40" fontSize="11" fontWeight="700" fill="#047857" fontFamily="monospace">TRAVERSAL ORDERS</text>
        {[
          ['preorder  (N L R)', 'F B A D C E G I', '#3b82f6', 78],
          ['inorder   (L N R)', 'A B C D E F G I', '#059669', 122],
          ['postorder (L R N)', 'A C E D B I G F', '#8b5cf6', 166],
          ['level (BFS, queue)', 'F B G A D I C E', '#f59e0b', 210],
        ].map(([label, seq, col, y], i) => (
          <g key={i}>
            <circle cx="386" cy={Number(y) - 4} r="4" fill={col} />
            <text x="398" y={y} fontSize="10" fill="#475569" fontFamily="monospace">{label}</text>
            <text x="398" y={Number(y) + 16} fontSize="11.5" fill="#0f172a" fontFamily="monospace" fontWeight="700">{seq}</text>
          </g>
        ))}
        <text x="380" y="252" fontSize="9" fill="#047857" fontFamily="monospace">inorder of a BST = sorted keys ↑</text>
        <text x="380" y="270" fontSize="9" fill="#475569" fontFamily="monospace">DFS uses a stack · BFS uses a queue</text>
        <text x="380" y="288" fontSize="9" fill="#475569" fontFamily="monospace">cost ∝ height h, not node count alone</text>
      </svg>
    ),
    svgCaption: "One tree, four visit orders. The depth-first orders differ only in when the node itself is emitted relative to its subtrees; note that *inorder* spells the values out alphabetically — the sorted-order property that makes inorder special for search trees. Level-order instead sweeps rank by rank using a queue.",
    cols: ['Operation', 'Time', 'Space'],
    complexity: [
      { op: 'Pre / in / post-order', time: 'Θ(n)', space: 'Θ(h)' },
      { op: 'Level-order (BFS)', time: 'Θ(n)', space: 'Θ(w)' },
      { op: 'Search (unordered tree)', time: 'Θ(n)', space: 'Θ(h)' },
      { op: 'Recursion stack depth', time: '—', space: 'Θ(h)' },
      { op: 'Node storage', time: '—', space: 'Θ(n)' },
    ],
    breaks: [
      { name: 'Deep recursion overflows the stack', body: "A skewed tree of height `n` recursed naively hits a `RecursionError` (Python caps at ~1000 frames) or a native stack overflow. Traverse iteratively with an explicit stack/queue, or keep the tree balanced so `h = O(log n)`." },
      { name: 'Assuming O(log n) on an unbalanced tree', body: "Tree operations are only logarithmic when the height is logarithmic; a tree built from sorted insertions degrades to a chain with `O(n)` height and `O(n)` operations. Use a self-balancing tree (next chapters) or randomize insertion order." },
      { name: 'Picking the wrong traversal', body: "Expecting sorted output from preorder, or trying to free/evaluate a tree top-down, produces wrong results — only inorder sorts a BST, and only postorder safely deletes children before parents. Match the order to the task, and never mutate the tree mid-walk without a snapshot." },
    ],
    code: [
      `class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def inorder(node, out):              # L, node, R  -> sorted for a BST
    if node:
        inorder(node.left, out)
        out.append(node.val)
        inorder(node.right, out)

def preorder(node, out):             # node, L, R
    if node:
        out.append(node.val)
        preorder(node.left, out)
        preorder(node.right, out)

root = Node("F", Node("B", Node("A"), Node("D", Node("C"), Node("E"))),
                  Node("G", None, Node("I")))
io = []; inorder(root, io); print("inorder :", io)     # A B C D E F G I
po = []; preorder(root, po); print("preorder:", po)    # F B A D C E G I`,
      `from collections import deque

def inorder_iter(root):              # explicit stack -> no recursion limit
    out, stack, cur = [], [], root
    while cur or stack:
        while cur:                   # dive left, remembering the path
            stack.append(cur); cur = cur.left
        cur = stack.pop()            # backtrack: visit, then go right
        out.append(cur.val)
        cur = cur.right
    return out

def level_order(root):               # BFS with a queue
    out, q = [], deque([root] if root else [])
    while q:
        n = q.popleft()
        out.append(n.val)
        if n.left:  q.append(n.left)
        if n.right: q.append(n.right)
    return out`,
    ],
    mentalModel: "A binary tree is an org chart, and a traversal is the etiquette for whom you greet first at the party: greet-then-descend (preorder), do-the-left-wing-then-greet-then-the-right (inorder), or shake every subordinate's hand before the boss's (postorder). Level-order just works the building floor by floor.",
  },
  {
    num: 9,
    part: 3,
    title: 'Binary Search Trees — The Ordering Invariant and Its Fragility',
    coreIdea: "A binary search tree keeps one rule at every node — everything on the left is smaller, everything on the right is larger — which turns search into a halving descent; but nothing in the rule forces the tree to stay bushy, so the wrong insertion order quietly collapses it into a slow chain.",
    explanation: [
      "A BST enforces a single invariant recursively: for every node, all keys in its left subtree are less than its key and all keys in its right subtree are greater. That ordering is what lets search behave like binary search on a sorted array — compare the target to the current node, step left if smaller or right if larger, and discard the entire other subtree each time, reaching any key in `O(h)` comparisons. Insert follows the same descent until it falls off the tree, then attaches a new leaf there; an inorder traversal reads the keys back in sorted order for free.",
      "Deletion is the one operation with real subtlety, splitting into three cases: a leaf is simply removed, a node with one child is bypassed by splicing that child up, and a node with two children is replaced by its inorder successor (the smallest key in its right subtree) or predecessor, after which that successor — which has at most one child — is deleted by the easier rules. The fatal weakness is that the tree's shape is entirely a function of insertion order, and a plain BST never corrects it: random insertions yield an expected height of `Θ(log n)`, but inserting already-sorted or monotonically increasing keys (timestamps, auto-increment IDs) builds a one-sided chain of height `Θ(n)`, degrading every operation to linear time. That fragility — great average behavior, catastrophic worst case, with no self-correction — is the entire motivation for the self-balancing trees in the next chapter.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Binary search tree search path and degenerate case">
        <text x="20" y="18" fontSize="11" fontWeight="700" fill="#047857" fontFamily="monospace">BALANCED BST · search(7): 8 → 3 → 6 → 7 in O(h)</text>
        {[['8-3', 150, 46, 80, 104, true], ['8-10', 150, 46, 250, 104, false], ['3-1', 80, 104, 40, 162, false], ['3-6', 80, 104, 120, 162, true], ['10-14', 250, 104, 300, 162, false], ['6-4', 120, 162, 90, 216, false], ['6-7', 120, 162, 150, 216, true]].map(([id, x1, y1, x2, y2, hot], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? '#f59e0b' : '#a7f3d0'} strokeWidth={hot ? '2.6' : '2'} />
        ))}
        {[['8', 150, 46, true], ['3', 80, 104, true], ['10', 250, 104, false], ['1', 40, 162, false], ['6', 120, 162, true], ['14', 300, 162, false], ['4', 90, 216, false], ['7', 150, 216, true]].map(([v, x, y, hot], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="17" fill={hot ? '#fef3c7' : '#d1fae5'} stroke={hot ? '#f59e0b' : '#059669'} strokeWidth="1.7" />
            <text x={x} y={Number(y) + 5} fontSize="13" fill={hot ? '#b45309' : '#047857'} textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <text x="108" y="80" fontSize="9" fill="#b45309" fontFamily="monospace">7&lt;8 ↙</text>
        <text x="104" y="138" fontSize="9" fill="#b45309" fontFamily="monospace">7&gt;3 ↘</text>
        <text x="142" y="192" fontSize="9" fill="#b45309" fontFamily="monospace">7&gt;6 ↘</text>

        <line x1="380" y1="36" x2="380" y2="300" stroke="#e2e8f0" strokeWidth="1" />
        <text x="400" y="40" fontSize="11" fontWeight="700" fill="#b91c1c" fontFamily="monospace">SAME KEYS, SORTED INSERT</text>
        <text x="400" y="56" fontSize="10" fill="#475569" fontFamily="monospace">insert 1,2,3,4,5 in order →</text>
        {[['1', 440, 84], ['2', 478, 124], ['3', 516, 164], ['4', 554, 204], ['5', 592, 244]].map(([v, x, y], i) => (
          <g key={i}>
            {i > 0 && <line x1={Number(x) - 38} y1={Number(y) - 40} x2={x} y2={y} stroke="#fecaca" strokeWidth="2" />}
            <circle cx={x} cy={y} r="16" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.6" />
            <text x={x} y={Number(y) + 5} fontSize="13" fill="#b91c1c" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <text x="400" y="284" fontSize="10" fill="#b91c1c" fontFamily="monospace">height = n → degenerate chain</text>
        <text x="400" y="300" fontSize="10" fill="#b91c1c" fontFamily="monospace">every op is now O(n)</text>
      </svg>
    ),
    svgCaption: "Left: searching for 7 descends the tree, comparing and discarding half the remaining keys at each step (amber path) — the halving behavior that gives `O(h)`. Right: the *same five keys* inserted in sorted order build a one-sided chain of height `n`, with no rebalancing to save it — search is now a linear walk. Shape is dictated entirely by insertion order.",
    cols: ['Operation', 'Balanced', 'Worst case'],
    complexity: [
      { op: 'Search', time: 'Θ(log n)', space: 'Θ(h)' },
      { op: 'Insert', time: 'Θ(log n)', space: 'Θ(h)' },
      { op: 'Delete', time: 'Θ(log n)', space: 'Θ(h)' },
      { op: 'Min / max / successor', time: 'Θ(log n)', space: 'Θ(h)' },
      { op: 'Inorder (sorted output)', time: 'Θ(n)', space: 'Θ(h)' },
    ],
    breaks: [
      { name: 'Sorted or monotonic insertion', body: "Building a BST from sorted data, or from ever-increasing keys like timestamps and auto-increment IDs, produces a fully one-sided chain of height `n` — every operation becomes `O(n)`. Use a self-balancing tree, shuffle the inputs first, or pick a structure with hard worst-case bounds." },
      { name: 'Deleting a two-child node naively', body: "Just detaching a node that has both children orphans a whole subtree or violates the ordering. Replace the node's key with its inorder successor (the minimum of the right subtree), then delete that successor, which is guaranteed to have at most one child." },
      { name: 'Undefined duplicate-key policy', body: "Without a rule for equal keys you get lost updates, keys scattered inconsistently across both subtrees, or even loops. Decide up front — store a count on the node, always send equals one direction, or forbid duplicates — and apply it everywhere." },
    ],
    code: [
      `class BST:
    class _N:
        def __init__(self, key):
            self.key, self.left, self.right = key, None, None

    def __init__(self):
        self.root = None

    def insert(self, key):
        def go(node):
            if node is None:
                return BST._N(key)
            if key < node.key:   node.left  = go(node.left)
            elif key > node.key: node.right = go(node.right)
            return node                         # equal -> ignore (our policy)
        self.root = go(self.root)

    def search(self, key):
        node = self.root
        while node:                             # halving descent: O(h)
            if key == node.key: return True
            node = node.left if key < node.key else node.right
        return False

t = BST()
for k in (8, 3, 10, 1, 6, 14, 4, 7):
    t.insert(k)
print(t.search(7), t.search(5))                # True False`,
      `def delete(root, key):
    if root is None:
        return None
    if key < root.key:
        root.left = delete(root.left, key)
    elif key > root.key:
        root.right = delete(root.right, key)
    else:
        if root.left is None:  return root.right    # 0 or 1 child
        if root.right is None: return root.left
        succ = root.right                           # inorder successor:
        while succ.left:                            # min of right subtree
            succ = succ.left
        root.key = succ.key                         # copy key up
        root.right = delete(root.right, succ.key)   # delete the successor
    return root`,
    ],
    mentalModel: "A BST is the number line folded into a tree: at each node you ask 'left or right?' and throw away half of what remains — but only if someone folded it evenly. Feed it sorted data and it lays the number line out flat, with no creases to shortcut, so you are back to walking every point.",
  },
  {
    num: 10,
    part: 3,
    title: 'Self-Balancing Trees — Rotations, AVL, and Red-Black',
    coreIdea: "A self-balancing tree keeps a BST from degenerating by enforcing a height bound after every update, and it repairs violations with *rotations* — local, constant-time pointer reshuffles that lower the height while preserving the left-smaller / right-larger order.",
    explanation: [
      "The fix for the BST's fragility is a structural one: detect when an insert or delete has made the tree too lopsided and immediately rebalance using rotations. A rotation re-parents three nodes and re-homes a single subtree in `O(1)` — a right rotation, for example, lifts a node's left child into its place, pushes the node down to the right, and moves that child's right subtree across to become the node's new left subtree, all while keeping every key in sorted position. Because the cost is constant and it provably reduces height, a handful of rotations after each update is enough to keep the whole tree shallow.",
      "Two disciplines dominate. An AVL tree enforces a strict invariant — at every node the heights of the two subtrees differ by at most one (a balance factor in `{−1, 0, +1}`) — and after an update it retraces the path to the root, rotating wherever the factor hits `±2`; this guarantees a height of at most about `1.44 log n`, giving the tightest balance and the fastest lookups, at the cost of more rebalancing on writes. A red-black tree enforces a looser set of color rules (the root is black, a red node has only black children, and every root-to-leaf path crosses the same number of black nodes), which bounds height at `2 log n` while needing fewer rotations per update — at most two on insert and three on delete. That trade — AVL for read-heavy workloads, red-black for write-heavy ones — is why red-black trees back `C++`'s `std::map`, Java's `TreeMap`, and the Linux kernel's scheduler, timers, and memory maps, while every operation in both stays a guaranteed `Θ(log n)`.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Tree rotation and AVL versus red-black">
        <defs>
          <marker id="rotArr" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#059669" /></marker>
        </defs>
        <text x="20" y="16" fontSize="11" fontWeight="700" fill="#047857" fontFamily="monospace">RIGHT ROTATION · the O(1) move that rebalances a left-heavy node</text>

        {/* before */}
        <line x1="150" y1="58" x2="90" y2="116" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="150" y1="58" x2="222" y2="120" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="90" y1="116" x2="50" y2="174" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="90" y1="116" x2="130" y2="174" stroke="#a7f3d0" strokeWidth="2" />
        {[['z', 150, 58, '#fee2e2', '#ef4444', '#b91c1c'], ['y', 90, 116, '#d1fae5', '#059669', '#047857'], ['x', 50, 174, '#d1fae5', '#059669', '#047857']].map(([v, x, y, f, s, t], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="16" fill={f} stroke={s} strokeWidth="1.7" />
            <text x={x} y={Number(y) + 5} fontSize="13" fill={t} textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <polygon points="222,112 208,144 236,144" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.2" />
        <text x="222" y="138" fontSize="9" fill="#0369a1" textAnchor="middle" fontFamily="monospace">T3</text>
        <polygon points="130,168 116,198 144,198" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.2" />
        <text x="130" y="192" fontSize="9" fill="#0369a1" textAnchor="middle" fontFamily="monospace">T2</text>
        <text x="168" y="56" fontSize="9" fill="#b91c1c" fontFamily="monospace">bf +2</text>

        <line x1="262" y1="120" x2="330" y2="120" stroke="#059669" strokeWidth="2" markerEnd="url(#rotArr)" />
        <text x="296" y="112" fontSize="9" fill="#047857" textAnchor="middle" fontFamily="monospace">rotate(z)</text>
        <text x="296" y="136" fontSize="8.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">T2 re-homed</text>

        {/* after */}
        <line x1="470" y1="58" x2="410" y2="116" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="470" y1="58" x2="540" y2="116" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="540" y1="116" x2="500" y2="174" stroke="#a7f3d0" strokeWidth="2" />
        <line x1="540" y1="116" x2="600" y2="174" stroke="#a7f3d0" strokeWidth="2" />
        {[['y', 470, 58], ['x', 410, 116], ['z', 540, 116]].map(([v, x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="16" fill="#d1fae5" stroke="#059669" strokeWidth="1.7" />
            <text x={x} y={Number(y) + 5} fontSize="13" fill="#047857" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <polygon points="500,168 486,198 514,198" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.2" />
        <text x="500" y="192" fontSize="9" fill="#0369a1" textAnchor="middle" fontFamily="monospace">T2</text>
        <polygon points="600,168 586,198 614,198" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.2" />
        <text x="600" y="192" fontSize="9" fill="#0369a1" textAnchor="middle" fontFamily="monospace">T3</text>
        <text x="470" y="42" fontSize="9" fill="#047857" textAnchor="middle" fontFamily="monospace">balanced ✓</text>

        <line x1="20" y1="222" x2="620" y2="222" stroke="#e2e8f0" strokeWidth="1" />
        <circle cx="30" cy="246" r="6" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
        <text x="44" y="250" fontSize="10.5" fontWeight="700" fill="#047857" fontFamily="monospace">AVL — strict</text>
        <text x="44" y="266" fontSize="9.5" fill="#475569" fontFamily="monospace">|h(L) − h(R)| ≤ 1 everywhere · height ≤ 1.44 log n</text>
        <text x="44" y="280" fontSize="9.5" fill="#475569" fontFamily="monospace">more rotations on write, fastest reads</text>

        <circle cx="332" cy="246" r="6" fill="#1f2937" stroke="#000000" strokeWidth="1" />
        <circle cx="346" cy="246" r="6" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
        <text x="360" y="250" fontSize="10.5" fontWeight="700" fill="#b91c1c" fontFamily="monospace">Red-Black — looser</text>
        <text x="360" y="266" fontSize="9.5" fill="#475569" fontFamily="monospace">equal black-height per path · height ≤ 2 log n</text>
        <text x="360" y="280" fontSize="9.5" fill="#475569" fontFamily="monospace">≤ 2–3 rotations/update, best for writes</text>
      </svg>
    ),
    svgCaption: "A right rotation repairs a left-left imbalance: `y` rises into `z`'s place, `z` descends to the right, and the middle subtree `T2` is re-homed from `y`'s right to `z`'s left — three pointers, `O(1)`, order preserved, height reduced. Below: AVL keeps subtree heights within one (tightest, read-optimal); red-black uses color rules for a looser bound with fewer rotations (write-optimal).",
    cols: ['Property', 'AVL', 'Red-Black'],
    complexity: [
      { op: 'Search / insert / delete', time: 'Θ(log n)', space: 'Θ(log n)' },
      { op: 'Height bound', time: '≤ 1.44 log n', space: '≤ 2 log n' },
      { op: 'Rotations per insert', time: '≤ 2', space: '≤ 2' },
      { op: 'Rotations per delete', time: 'O(log n)', space: '≤ 3' },
      { op: 'Best-fit workload', time: 'read-heavy', space: 'write-heavy' },
    ],
    breaks: [
      { name: 'Rebalancing only the new node', body: "An imbalance created by an insert or delete can surface several levels *above* the touched node, so checking just that node leaves a hidden violation. Retrace the path to the root, updating heights (AVL) or running the recolor/rotate fix-up loop (red-black) the whole way up." },
      { name: 'Mis-wiring the re-homed subtree', body: "The single most common rotation bug is mishandling the middle subtree (`T2` above) — drop it and you lose nodes; attach it on the wrong side and you break the ordering. Follow the three-pointer dance exactly, and verify with property checks: inorder must stay sorted and the invariant must hold." },
      { name: 'AVL on a write-heavy workload', body: "AVL's strict balance triggers more restructuring under churny inserts and deletes, so using it where writes dominate burns cycles for balance you do not read back. Prefer a red-black tree (fewer rotations per update) for write-heavy maps; reserve AVL for lookup-dominated data." },
    ],
    code: [
      `class AVL:
    class _N:
        __slots__ = ("k", "l", "r", "h")
        def __init__(self, k):
            self.k, self.l, self.r, self.h = k, None, None, 1

    def _h(self, n):  return n.h if n else 0
    def _bf(self, n): return self._h(n.l) - self._h(n.r)
    def _fix(self, n):
        n.h = 1 + max(self._h(n.l), self._h(n.r))
        return n

    def _rot_right(self, z):                 # the O(1) rebalance
        y = z.l
        z.l = y.r                            # re-home the middle subtree
        y.r = z
        self._fix(z); self._fix(y)
        return y

    def _rot_left(self, z):
        y = z.r
        z.r = y.l
        y.l = z
        self._fix(z); self._fix(y)
        return y

    def insert(self, k):
        def go(n):
            if n is None: return AVL._N(k)
            if k < n.k: n.l = go(n.l)
            else:       n.r = go(n.r)
            self._fix(n)
            bf = self._bf(n)
            if bf > 1 and k < n.l.k: return self._rot_right(n)        # LL
            if bf > 1:              n.l = self._rot_left(n.l); return self._rot_right(n)  # LR
            if bf < -1 and k > n.r.k: return self._rot_left(n)       # RR
            if bf < -1:             n.r = self._rot_right(n.r); return self._rot_left(n)  # RL
            return n
        self.root = go(self.root)`,
      `import math

def height(n):
    return 0 if n is None else 1 + max(height(n.l), height(n.r))

t = AVL()
for k in range(1, 1024):          # SORTED insert -> would wreck a plain BST
    t.insert(k)

n = 1023
print("nodes:", n, "height:", height(t.root))
print("log2(n):", round(math.log2(n), 1))
# height stays ~10-13, NOT 1023 -> rotations kept it balanced`,
    ],
    mentalModel: "A rotation is re-hanging a mobile sculpture: you unclip one arm and re-attach it a single notch over, and the whole structure swings back to level. Because you only ever touch a couple of joints, the repair is instant no matter how large the mobile has grown.",
  },
  {
    num: 11,
    part: 3,
    title: 'B-Trees & B+ Trees — High Fanout for the Disk',
    coreIdea: "A B-tree is a search tree redesigned around the brutal cost of a disk seek: each node holds hundreds of keys so it fills exactly one page, the fanout is enormous, and the height shrinks to three or four levels even for billions of keys — so a lookup costs a handful of I/Os instead of thirty.",
    explanation: [
      "Binary trees assume every node access is cheap, which is false when nodes live on disk: there each pointer hop is a multi-millisecond seek, and a balanced binary tree over a billion keys is ~30 levels deep, meaning ~30 seeks per lookup. A B-tree fixes this by packing many keys into each node — an order-`m` B-tree node holds up to `m−1` keys and `m` child pointers, and is sized so one node equals one disk page (typically 4–16 KB, giving a fanout of hundreds). Search finds the right key interval *within* a node (a cheap in-memory scan) and descends to the matching child, so the number of disk reads is the height, `Θ(log_m n)` — only three or four levels for that same billion keys. The tree stays perfectly height-balanced by construction: all leaves sit at the same depth.",
      "Balance is maintained by splitting and merging rather than rotating. An insert goes to a leaf; if the leaf overflows, it splits into two and the median key is pushed up into the parent — and if that cascades all the way up, the root splits and the tree grows one level taller (the only way a B-tree's height changes). Deletion mirrors this by borrowing a key from a sibling or merging two thin nodes. The B+ tree variant, used by virtually every database and filesystem, refines this further: internal nodes store *only keys as routers* while all actual values live in the leaves, and the leaves are chained together in a sorted linked list. That leaf chain turns a range query into a single descent followed by a sequential walk — `Θ(log_m n + k/B)` — which is why MySQL's InnoDB, PostgreSQL, SQLite, and filesystems like NTFS and ext4 all build their indexes on B+ trees.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="B+ tree with linked leaves and a node split">
        <defs>
          <marker id="bpArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#059669" /></marker>
          <marker id="bpLeaf" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#0ea5e9" /></marker>
          <marker id="bpUp" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" /></marker>
        </defs>
        <text x="20" y="16" fontSize="11" fontWeight="700" fill="#047857" fontFamily="monospace">B+ TREE · internal = router keys, leaves = data + sibling links (node = 1 page)</text>

        <rect x="262" y="34" width="116" height="30" rx="4" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
        <line x1="320" y1="34" x2="320" y2="64" stroke="#059669" strokeWidth="1" />
        <text x="291" y="54" fontSize="12" fill="#047857" textAnchor="middle" fontFamily="monospace" fontWeight="700">30</text>
        <text x="349" y="54" fontSize="12" fill="#047857" textAnchor="middle" fontFamily="monospace" fontWeight="700">60</text>

        <line x1="270" y1="64" x2="110" y2="120" stroke="#059669" strokeWidth="1.4" markerEnd="url(#bpArr)" />
        <line x1="320" y1="64" x2="318" y2="120" stroke="#059669" strokeWidth="1.4" markerEnd="url(#bpArr)" />
        <line x1="370" y1="64" x2="520" y2="120" stroke="#059669" strokeWidth="1.4" markerEnd="url(#bpArr)" />

        {[['L1', 40, ['10', '20']], ['L2', 248, ['30', '40', '50']], ['L3', 456, ['60', '70', '80']]].map(([id, x, keys], gi) => (
          <g key={gi}>
            <rect x={x} y="122" width={keys.length * 44} height="30" rx="4" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.4" />
            {keys.map((k, ki) => (
              <g key={ki}>
                {ki > 0 && <line x1={Number(x) + ki * 44} y1="122" x2={Number(x) + ki * 44} y2="152" stroke="#16a34a" strokeWidth="0.8" />}
                <text x={Number(x) + ki * 44 + 22} y="142" fontSize="11.5" fill="#15803d" textAnchor="middle" fontFamily="monospace">{k}</text>
              </g>
            ))}
          </g>
        ))}
        <line x1="128" y1="137" x2="246" y2="137" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#bpLeaf)" />
        <line x1="380" y1="137" x2="454" y2="137" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#bpLeaf)" />
        <text x="320" y="174" fontSize="9.5" fill="#0369a1" textAnchor="middle" fontFamily="monospace">leaves linked in sorted order → range scan walks straight across</text>

        <line x1="20" y1="190" x2="620" y2="190" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="210" fontSize="11" fontWeight="700" fill="#b45309" fontFamily="monospace">NODE SPLIT · insert 25 into a full leaf [20 | 30 | 40] (capacity 3)</text>

        <rect x="60" y="224" width="132" height="28" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.4" />
        {['20', '30', '40', '25?'].map((k, i) => (
          <text key={i} x={82 + i * 32} y="242" fontSize="11" fill="#b91c1c" textAnchor="middle" fontFamily="monospace">{k}</text>
        ))}
        <text x="126" y="268" fontSize="9" fill="#b91c1c" textAnchor="middle" fontFamily="monospace">overflow!</text>

        <line x1="200" y1="238" x2="244" y2="238" stroke="#f59e0b" strokeWidth="1.6" markerEnd="url(#bpUp)" />

        <rect x="306" y="280" width="60" height="26" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.4" />
        <text x="336" y="298" fontSize="11" fill="#b45309" textAnchor="middle" fontFamily="monospace">30 ↑</text>
        <line x1="320" y1="280" x2="300" y2="262" stroke="#f59e0b" strokeWidth="1.3" markerEnd="url(#bpUp)" />
        <line x1="352" y1="280" x2="430" y2="262" stroke="#f59e0b" strokeWidth="1.3" markerEnd="url(#bpUp)" />
        <rect x="252" y="234" width="92" height="26" rx="4" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.3" />
        <text x="278" y="251" fontSize="11" fill="#15803d" textAnchor="middle" fontFamily="monospace">20</text>
        <text x="318" y="251" fontSize="11" fill="#15803d" textAnchor="middle" fontFamily="monospace">25</text>
        <rect x="392" y="234" width="92" height="26" rx="4" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.3" />
        <text x="418" y="251" fontSize="11" fill="#15803d" textAnchor="middle" fontFamily="monospace">30</text>
        <text x="458" y="251" fontSize="11" fill="#15803d" textAnchor="middle" fontFamily="monospace">40</text>
        <text x="540" y="244" fontSize="9.5" fill="#475569" fontFamily="monospace">split → median</text>
        <text x="540" y="258" fontSize="9.5" fill="#475569" fontFamily="monospace">pushed up; if</text>
        <text x="540" y="272" fontSize="9.5" fill="#475569" fontFamily="monospace">parent fills, it</text>
        <text x="540" y="286" fontSize="9.5" fill="#475569" fontFamily="monospace">splits too → grows up</text>
      </svg>
    ),
    svgCaption: "Top: a B+ tree where the root holds only router keys (`30`, `60`) and every value lives in a leaf; the leaves are chained (dashed blue) so a range query descends once then walks sideways. Bottom: inserting `25` overflows a full leaf, which splits in two and copies the median (`30`) up to the parent — and if the parent fills, the split cascades upward, the only way the tree gains height.",
    cols: ['Operation', 'Comparisons', 'Disk page reads'],
    complexity: [
      { op: 'Search', time: 'Θ(log n)', space: 'Θ(log_m n)' },
      { op: 'Insert', time: 'Θ(log n)', space: 'Θ(log_m n)' },
      { op: 'Delete', time: 'Θ(log n)', space: 'Θ(log_m n)' },
      { op: 'Range scan, k items (B+)', time: 'Θ(log n + k)', space: 'Θ(log_m n + k/B)' },
      { op: 'Height', time: '—', space: '⌈log_m n⌉' },
    ],
    breaks: [
      { name: 'A binary tree on disk', body: "Backing an on-disk index with a BST or red-black tree means one seek per level and ~30 levels for a billion keys — orders of magnitude more I/O than a B+ tree's three or four. Use a B+ tree whose node is sized to fill a disk page so the fanout (and thus the height saved) is maximal." },
      { name: 'Mis-sized nodes', body: "Nodes much smaller than a page waste each expensive read on too few keys, making the tree needlessly tall; nodes far larger than a page blow the cache and make in-node search costly. Tune the node size to roughly the underlying page/block size to balance fanout against per-node work." },
      { name: 'Random keys shred the leaves', body: "A B+ index keyed on a random value like a UUID scatters inserts across the whole tree, causing constant leaf splits, poor page fill, and heavy write amplification — the well-known 'UUID primary key is slow' problem. Prefer monotonic keys (auto-increment, time-ordered IDs) for insert-heavy indexes, or tune the fill factor." },
    ],
    code: [
      `class BTreeNode:
    def __init__(self, keys, children=None, leaf=True):
        self.keys = keys                # sorted keys in this node (one page)
        self.children = children or []
        self.leaf = leaf

    def search(self, target):
        i = 0
        while i < len(self.keys) and target > self.keys[i]:
            i += 1                       # in-node scan to find the interval
        if i < len(self.keys) and self.keys[i] == target:
            return self                  # found in this node
        if self.leaf:
            return None                  # ran off a leaf -> absent
        return self.children[i].search(target)   # descend one page

root = BTreeNode([30, 60], leaf=False, children=[
    BTreeNode([10, 20]), BTreeNode([40, 50]), BTreeNode([70, 80, 90])])
print(root.search(50) is not None)       # True (one descent)
print(root.search(55) is not None)       # False`,
      `import math

def levels(n, fanout):
    return math.ceil(math.log(n, fanout))   # disk reads per lookup

n = 1_000_000_000                            # one billion keys
print("binary tree   :", levels(n, 2),   "reads")     # ~30
print("B+ tree (200) :", levels(n, 200), "reads")     # ~4
print("B+ tree (500) :", levels(n, 500), "reads")     # ~4
# higher fanout collapses height -> a lookup is a handful of seeks`,
    ],
    mentalModel: "A B+ tree is a library catalog built around the cost of walking to the stacks. A binary tree asks one yes/no question per trip and sends you back and forth thirty times; the catalog drawer narrows you among hundreds of shelves in a single glance, so even a billion books are four drawers deep — and the books themselves sit on one long shelf you can read straight down.",
  },
  {
    num: 12,
    part: 4,
    title: 'Heaps & Priority Queues — A Tree That Lives in a Flat Array',
    coreIdea: "A binary heap is a complete tree where every parent out-ranks its children, but because it is complete it needs no pointers at all — it lives in a plain array, with a child at `2i+1` / `2i+2` and a parent at `(i−1)//2`, giving `O(1)` access to the best element and `O(log n)` to insert or remove it.",
    explanation: [
      "A binary heap maintains one weak ordering: in a min-heap every node is less than or equal to both its children (a max-heap flips the comparison). That is far weaker than a BST — siblings are unordered and there is no global sort — but it guarantees the single thing a priority queue needs: the minimum (or maximum) is always at the root, readable in `O(1)`. The structural trick is that a heap is always a *complete* binary tree, filled left-to-right with no gaps, which means it maps perfectly onto a contiguous array: the node at index `i` has its parent at `(i−1)//2` and its children at `2i+1` and `2i+2`. No child pointers, no allocation per node, and excellent cache locality.",
      "Two operations keep the property intact, both walking a single root-to-leaf path. Insert appends the new value at the end of the array and *sifts it up*, swapping with its parent as long as it out-ranks it — `O(log n)`. Extract-min removes the root, moves the last element into its place, and *sifts it down*, swapping with its smaller child until order is restored — also `O(log n)`. A subtle and useful fact: building a heap from an arbitrary array is `Θ(n)`, not `Θ(n log n)`, if you sift down from the last internal node backwards, because most nodes are near the bottom and barely move. The catch is that a heap supports *no* efficient search or arbitrary delete — it is ordered only along paths, so finding a specific value is `O(n)`. Heaps power Dijkstra and A* shortest paths, event-driven simulation, OS schedulers, heapsort, and streaming top-k; variants include `d`-ary heaps and the Fibonacci heap, whose `O(1)` amortized decrease-key gives Dijkstra its best theoretical bound.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Heap as tree and array, with sift-up">
        <defs>
          <marker id="hpMap" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" /></marker>
          <marker id="hpUp" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" /></marker>
        </defs>
        <text x="20" y="16" fontSize="11" fontWeight="700" fill="#6d28d9" fontFamily="monospace">MIN-HEAP · complete tree ⇔ flat array (no pointers)</text>

        <line x1="150" y1="48" x2="90" y2="100" stroke="#ddd6fe" strokeWidth="2" />
        <line x1="150" y1="48" x2="234" y2="100" stroke="#ddd6fe" strokeWidth="2" />
        <line x1="90" y1="100" x2="55" y2="152" stroke="#ddd6fe" strokeWidth="2" />
        <line x1="90" y1="100" x2="125" y2="152" stroke="#ddd6fe" strokeWidth="2" />
        <line x1="234" y1="100" x2="199" y2="152" stroke="#ddd6fe" strokeWidth="2" />
        <line x1="234" y1="100" x2="269" y2="152" stroke="#ddd6fe" strokeWidth="2" />
        {[['2', 150, 48, 0], ['7', 90, 100, 1], ['4', 234, 100, 2], ['9', 55, 152, 3], ['8', 125, 152, 4], ['6', 199, 152, 5], ['5', 269, 152, 6]].map(([v, x, y, idx], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="15" fill={i === 0 ? '#ede9fe' : '#f5f3ff'} stroke="#8b5cf6" strokeWidth="1.6" />
            <text x={x} y={Number(y) + 5} fontSize="13" fill="#6d28d9" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
            <text x={x} y={Number(y) + 27} fontSize="8" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">i={idx}</text>
          </g>
        ))}
        <text x="150" y="33" fontSize="8.5" fill="#7c3aed" textAnchor="middle" fontFamily="monospace">root = min (O(1))</text>

        {[2, 7, 4, 9, 8, 6, 5].map((v, i) => (
          <g key={i}>
            <rect x={372 + i * 34} y="64" width="30" height="28" rx="3" fill={i === 0 ? '#ede9fe' : '#f5f3ff'} stroke="#8b5cf6" strokeWidth="1.3" />
            <text x={387 + i * 34} y="83" fontSize="12" fill="#6d28d9" textAnchor="middle" fontFamily="monospace">{v}</text>
            <text x={387 + i * 34} y="104" fontSize="8.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{i}</text>
          </g>
        ))}
        <text x="372" y="132" fontSize="10" fill="#475569" fontFamily="monospace">parent(i) = (i − 1) // 2</text>
        <text x="372" y="148" fontSize="10" fill="#475569" fontFamily="monospace">left(i)  = 2i + 1</text>
        <text x="372" y="164" fontSize="10" fill="#475569" fontFamily="monospace">right(i) = 2i + 2</text>
        <path d="M421,92 C 430,116 470,116 478,94" fill="none" stroke="#8b5cf6" strokeWidth="1.2" markerEnd="url(#hpMap)" />
        <text x="450" y="124" fontSize="8.5" fill="#7c3aed" textAnchor="middle" fontFamily="monospace">i=1 → 3,4</text>

        <line x1="20" y1="190" x2="620" y2="190" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="210" fontSize="11" fontWeight="700" fill="#b45309" fontFamily="monospace">INSERT 1 · append at the end, then sift-up while smaller than parent — O(log n)</text>
        {[2, 7, 4, 9, 8, 6, 5, 1].map((v, i) => {
          const hot = [0, 1, 3, 7].includes(i);
          return (
            <g key={i}>
              <rect x={110 + i * 50} y="252" width="44" height="32" rx="4" fill={hot ? '#fef3c7' : '#f8fafc'} stroke={hot ? '#f59e0b' : '#e2e8f0'} strokeWidth="1.3" />
              <text x={132 + i * 50} y="273" fontSize="13" fill={hot ? '#b45309' : '#475569'} textAnchor="middle" fontFamily="monospace" fontWeight={hot ? '700' : '400'}>{v}</text>
              <text x={132 + i * 50} y="296" fontSize="8.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{i}</text>
            </g>
          );
        })}
        <path d="M532,252 C 500,228 350,228 332,250" fill="none" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#hpUp)" />
        <path d="M332,252 C 300,232 200,232 182,250" fill="none" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#hpUp)" />
        <path d="M182,252 C 160,236 150,236 145,250" fill="none" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#hpUp)" />
        <text x="330" y="240" fontSize="9" fill="#b45309" textAnchor="middle" fontFamily="monospace">1 climbs: idx 7 → 3 → 1 → 0 (new root)</text>
      </svg>
    ),
    svgCaption: "Top: the same min-heap as a tree and as the array `[2,7,4,9,8,6,5]` — the complete shape lets index arithmetic replace child pointers entirely. Bottom: inserting `1` appends it at index 7, then sifts it up the parent chain `7 → 3 → 1 → 0`, swapping past each larger ancestor until it becomes the new root — one root-to-leaf path, `O(log n)`.",
    cols: ['Operation', 'Time', 'Space'],
    complexity: [
      { op: 'Peek min / max', time: 'Θ(1)', space: '—' },
      { op: 'Insert (sift-up)', time: 'Θ(log n)', space: 'Θ(1)' },
      { op: 'Extract-min (sift-down)', time: 'Θ(log n)', space: 'Θ(1)' },
      { op: 'Build-heap from array', time: 'Θ(n)', space: 'Θ(1)' },
      { op: 'Search arbitrary value', time: 'Θ(n)', space: '—' },
      { op: 'Storage', time: '—', space: 'Θ(n)' },
    ],
    breaks: [
      { name: 'Treating it as a searchable set', body: "A heap is ordered only along root-to-leaf paths, not globally, so `contains(x)`, find, or delete-arbitrary are all `O(n)` — siblings are unordered. If you need decrease-key or arbitrary delete, keep a side hash map from value to its array index and update it on every swap; if you need ordered search, use a balanced BST instead." },
      { name: 'Building by n repeated inserts', body: "Pushing `n` items one at a time is `O(n log n)`, but bottom-up heapify — sifting down from the last internal node backward — is `Θ(n)` because most nodes barely move. Heapify the whole array at once (`heapq.heapify`) instead of looping `heappush`." },
      { name: 'Stale entries in a lazy priority queue', body: "Dijkstra-style code that pushes updated priorities without removing the old tuples leaves outdated entries in the heap; popping them and acting on stale state corrupts the result. Use lazy deletion — tag each pop and skip any node already finalized — or a true decrease-key backed by a position map." },
    ],
    code: [
      `class MinHeap:
    def __init__(self):
        self.a = []

    def push(self, x):
        self.a.append(x)                 # append at the end
        i = len(self.a) - 1
        while i > 0:                     # sift up
            p = (i - 1) // 2
            if self.a[i] >= self.a[p]: break
            self.a[i], self.a[p] = self.a[p], self.a[i]
            i = p

    def pop(self):
        a = self.a
        a[0], a[-1] = a[-1], a[0]        # move last to root
        out = a.pop()
        i, n = 0, len(a)
        while True:                      # sift down
            l, r, s = 2*i + 1, 2*i + 2, i
            if l < n and a[l] < a[s]: s = l
            if r < n and a[r] < a[s]: s = r
            if s == i: break
            a[i], a[s] = a[s], a[i]; i = s
        return out

h = MinHeap()
for x in (5, 2, 8, 1, 9, 3): h.push(x)
print([h.pop() for _ in range(6)])       # 1 2 3 5 8 9 -> sorted (heapsort)`,
      `import heapq

nums = [5, 2, 8, 1, 9, 3]
heapq.heapify(nums)                  # O(n), NOT O(n log n)
print(heapq.heappop(nums))           # 1  -> the minimum

# max-heap: push negatives (heapq is min-only)
maxh = []
for x in (5, 2, 8): heapq.heappush(maxh, -x)
print(-heapq.heappop(maxh))          # 8

# streaming top-3 with a size-k min-heap: keep only the k largest seen
stream, k, keep = [7, 1, 9, 3, 8, 2, 10], 3, []
for x in stream:
    heapq.heappush(keep, x)
    if len(keep) > k: heapq.heappop(keep)   # evict the smallest
print(sorted(keep, reverse=True))    # [10, 9, 8]`,
    ],
    mentalModel: "A min-heap is a tournament run upward where the smaller value wins each match and rises — so the champion at the top is the global minimum. But the bracket only records who beat whom along each path, not the full ranking, which is why naming the runner-up still requires a playoff among the champion's direct challengers.",
  },
  {
    num: 13,
    part: 4,
    title: 'Tries & Radix Trees — Indexing by Shared Prefix',
    coreIdea: "A trie stores strings by laying them out character-by-character down shared paths, so a lookup costs only the length of the key — `O(k)` — no matter how many millions of keys are stored, and prefix queries fall out for free; a radix tree then crushes the wasted single-child chains to make it memory-cheap.",
    explanation: [
      "A trie (prefix tree) is built from the keys' characters rather than from comparisons or hashes: each edge carries one character, every path from the root spells a prefix, and a flag on a node marks where a complete word ends. To look up or insert a key you simply walk its characters from the root, so the cost is `Θ(k)` in the key's length and is completely *independent of `n`*, the number of keys stored — there is no hashing and no comparison against other keys, and therefore no collisions and a true worst-case bound. The structure also makes prefix operations natural: 'all words starting with car' is just 'descend to the `car` node, then enumerate its subtree', which is why tries power autocomplete, spell-checkers, and dictionaries.",
      "The price is space. A naive trie keeps a child slot per possible character at every node — a 256-wide array, or wider for Unicode — which is enormously wasteful when branches are sparse, and long runs of single-child nodes (the unique tail of a key) are pure overhead. A radix tree (also called a compressed trie or Patricia trie) fixes both by merging any chain of single-child nodes into one edge labeled with the whole substring, collapsing the tree to only its branching points while preserving every lookup. This compression is what makes prefix structures practical at scale: IP routing tables use radix tries for longest-prefix match, Linux's routing uses an LPC-trie, and Redis stores its keyspace in a radix tree. Choose a trie over a hash table only when you need its extra powers — ordered traversal, prefix and longest-match queries — since for pure exact-membership a hash set is `O(1)` with smaller constants.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Trie and its radix-compressed form">
        <text x="20" y="16" fontSize="11" fontWeight="700" fill="#6d28d9" fontFamily="monospace">TRIE · one node per char · ● = word end · lookup O(k)</text>
        {/* trie edges with labels */}
        {[
          [110, 46, 70, 96, 'c'], [70, 96, 70, 146, 'a'], [70, 146, 40, 196, 't'], [70, 146, 110, 196, 'r'], [110, 196, 110, 246, 'd'],
          [110, 46, 200, 96, 'd'], [200, 96, 200, 146, 'o'], [200, 146, 200, 196, 'g'],
        ].map(([x1, y1, x2, y2, ch], i) => (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ddd6fe" strokeWidth="2" />
            <text x={(Number(x1) + Number(x2)) / 2 + 6} y={(Number(y1) + Number(y2)) / 2 + 3} fontSize="10" fill="#7c3aed" fontFamily="monospace" fontWeight="700">{ch}</text>
          </g>
        ))}
        {[[110, 46, false], [70, 96, false], [70, 146, false], [40, 196, true], [110, 196, true], [110, 246, true], [200, 96, false], [200, 146, false], [200, 196, true]].map(([x, y, end], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="13" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="1.5" />
            {end && <circle cx={x} cy={y} r="5" fill="#10b981" />}
          </g>
        ))}
        <text x="40" y="216" fontSize="8.5" fill="#047857" textAnchor="middle" fontFamily="monospace">cat</text>
        <text x="132" y="200" fontSize="8.5" fill="#047857" fontFamily="monospace">car</text>
        <text x="132" y="250" fontSize="8.5" fill="#047857" fontFamily="monospace">card</text>
        <text x="218" y="200" fontSize="8.5" fill="#047857" fontFamily="monospace">dog</text>
        <text x="110" y="32" fontSize="8" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">root</text>

        <line x1="320" y1="36" x2="320" y2="300" stroke="#e2e8f0" strokeWidth="1" />
        <text x="350" y="16" fontSize="11" fontWeight="700" fill="#6d28d9" fontFamily="monospace">RADIX TREE · single-child chains merged into one edge</text>
        {[
          [470, 50, 430, 120, '"ca"'], [430, 120, 390, 188, '"t"'], [430, 120, 480, 188, '"r"'], [480, 188, 480, 252, '"d"'],
          [470, 50, 565, 120, '"dog"'],
        ].map(([x1, y1, x2, y2, lbl], i) => (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ddd6fe" strokeWidth="2" />
            <text x={(Number(x1) + Number(x2)) / 2 + 4} y={(Number(y1) + Number(y2)) / 2 + 3} fontSize="9.5" fill="#7c3aed" fontFamily="monospace" fontWeight="700">{lbl}</text>
          </g>
        ))}
        {[[470, 50, false], [430, 120, false], [390, 188, true], [480, 188, true], [480, 252, true], [565, 120, true]].map(([x, y, end], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="13" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="1.5" />
            {end && <circle cx={x} cy={y} r="5" fill="#10b981" />}
          </g>
        ))}
        <text x="390" y="208" fontSize="8.5" fill="#047857" textAnchor="middle" fontFamily="monospace">cat</text>
        <text x="498" y="192" fontSize="8.5" fill="#047857" fontFamily="monospace">car</text>
        <text x="498" y="256" fontSize="8.5" fill="#047857" fontFamily="monospace">card</text>
        <text x="583" y="124" fontSize="8.5" fill="#047857" fontFamily="monospace">dog</text>
        <text x="470" y="36" fontSize="8" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">root</text>
        <text x="350" y="296" fontSize="9" fill="#475569" fontFamily="monospace">9 nodes → 6 nodes; the 'dog' chain became one edge</text>
      </svg>
    ),
    svgCaption: "Left: a trie holding `cat`, `car`, `card`, `dog` — `cat`/`car`/`card` share the `c-a` path, and a green marker flags each word ending. Right: the radix-compressed form merges every run of single-child nodes into one substring-labeled edge, so the three-node `d-o-g` chain collapses to a single `dog` edge while every lookup still works identically.",
    cols: ['Operation', 'Time', 'Space'],
    complexity: [
      { op: 'Insert (key length k)', time: 'Θ(k)', space: 'Θ(k)' },
      { op: 'Search / contains', time: 'Θ(k)', space: 'Θ(1)' },
      { op: 'Prefix enumeration', time: 'Θ(p + out)', space: 'Θ(out)' },
      { op: 'Delete', time: 'Θ(k)', space: 'Θ(1)' },
      { op: 'Naive trie storage', time: '—', space: 'Θ(Σ × nodes)' },
      { op: 'Radix tree storage', time: '—', space: 'Θ(total chars)' },
    ],
    breaks: [
      { name: 'Per-node alphabet arrays', body: "Giving every node a fixed child array sized to the alphabet (256, or far more for Unicode) wastes enormous memory when branching is sparse — most slots are empty. Store children in a hash map or small sorted list per node, or compress the whole structure into a radix tree." },
      { name: 'Long single-child chains', body: "Keys with long unique tails produce deep runs of one-child nodes that add depth and allocations with zero branching benefit, dwarfing a plain hash set's footprint. Radix/Patricia compression merges each such run into a single labeled edge, keeping only the real decision points." },
      { name: 'Using a trie where a hash set fits', body: "If you only need exact membership with no prefix, ordered, or longest-match queries, a trie pays `O(k)` and heavy memory for what a hash set does in `O(1)`. Reach for a trie only when its prefix/ordering powers are the point; otherwise a hash table wins." },
    ],
    code: [
      `class Trie:
    def __init__(self):
        self.children = {}          # char -> Trie  (sparse, no fixed array)
        self.is_word = False

    def insert(self, word):
        node = self
        for ch in word:             # walk/extend one char at a time: O(k)
            node = node.children.setdefault(ch, Trie())
        node.is_word = True

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_word

    def starts_with(self, prefix):  # autocomplete gate, O(len prefix)
        return self._walk(prefix) is not None

    def _walk(self, s):
        node = self
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

t = Trie()
for w in ("cat", "car", "card", "dog"): t.insert(w)
print(t.search("car"), t.search("ca"), t.starts_with("ca"))   # True False True`,
      `def words_with_prefix(trie, prefix):
    node = trie._walk(prefix)
    if node is None:
        return []
    out = []
    def dfs(n, path):                # enumerate the subtree under the prefix
        if n.is_word:
            out.append(prefix + path)
        for ch, child in sorted(n.children.items()):
            dfs(child, path + ch)
    dfs(node, "")
    return out

print(words_with_prefix(t, "ca"))    # ['car', 'card', 'cat']  -> autocomplete`,
    ],
    mentalModel: "A trie is a choose-your-own-adventure book where every page is a single letter and the words you know are exactly the marked endings you can reach by spelling. Adding 'card' after 'car' costs just the one extra page 'd', since the 'car' path already exists — and a radix tree is that same book after gluing every run of single-choice pages into one.",
  },
  {
    num: 14,
    part: 4,
    title: 'Segment Trees & Fenwick Trees — Range Queries in Logarithmic Time',
    coreIdea: "When you must repeatedly ask 'what is the sum/min/max over array indices `l..r`?' *while* the array keeps changing, both a naive recompute and a precomputed prefix array fail — a segment tree (or Fenwick tree) precomputes aggregates over a tree of ranges so every query and every update is `O(log n)`.",
    explanation: [
      "The problem is the tension between queries and updates. A prefix-sum array answers a range sum in `O(1)` but any single update forces an `O(n)` rebuild; recomputing per query is `O(n)` the other way. A segment tree resolves both at once: it is a binary tree where each node owns a contiguous slice of the array, leaves hold single elements, and every internal node stores the aggregate (sum, min, max, gcd — anything associative) of its two children's slices. A range query descends the tree and stitches together only the `O(log n)` nodes whose slices exactly tile the requested interval; a point update changes one leaf and re-aggregates the `O(log n)` ancestors above it. With lazy propagation it even supports range updates by deferring work down the tree. It costs about `4n` storage and a bit of code, but it is maximally flexible.",
      "A Fenwick tree (binary indexed tree, or BIT) is a leaner specialist for invertible aggregates like sums. It is a single `n+1` array that exploits the binary representation of indices: position `i` is responsible for a block of `i & (−i)` elements — the value of its lowest set bit. To get a prefix sum you start at `i` and repeatedly strip the lowest set bit (`i −= i & −i`), accumulating a handful of cells; to update you add `i & −i` to climb the other way. A range sum `[l, r]` is then just `prefix(r) − prefix(l−1)`, which is exactly why the BIT needs an *invertible* operation — that subtraction is how it isolates the interval, and it is the reason a plain Fenwick tree cannot do range-min or range-max. In exchange for that limitation it is tiny, cache-friendly, and a dozen lines of code, which makes it the default for sum-style range analytics and competitive programming.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Segment tree range query and Fenwick index coverage">
        <defs>
          <marker id="stUp" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" /></marker>
        </defs>
        <text x="20" y="14" fontSize="11" fontWeight="700" fill="#6d28d9" fontFamily="monospace">SEGMENT TREE (sum) over [3,1,4,1,5,9] · query sum[1,4] tiles into 3 nodes</text>
        {[
          [320, 38, 170, 80], [320, 38, 470, 80],
          [170, 80, 90, 122], [170, 80, 250, 122],
          [470, 80, 400, 122], [470, 80, 540, 122],
          [90, 122, 50, 164], [90, 122, 130, 164],
          [400, 122, 360, 164], [400, 122, 440, 164],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ddd6fe" strokeWidth="1.8" />
        ))}
        {[
          ['0:5', '23', 320, 38, false], ['0:2', '8', 170, 80, false], ['3:5', '15', 470, 80, false],
          ['0:1', '4', 90, 122, false], ['2:2', '4', 250, 122, true], ['3:4', '6', 400, 122, true], ['5:5', '9', 540, 122, false],
          ['0:0', '3', 50, 164, false], ['1:1', '1', 130, 164, true], ['3:3', '1', 360, 164, false], ['4:4', '5', 440, 164, false],
        ].map(([rng, val, x, y, hot], i) => (
          <g key={i}>
            <rect x={Number(x) - 24} y={y} width="48" height="28" rx="4" fill={hot ? '#fef3c7' : '#f5f3ff'} stroke={hot ? '#f59e0b' : '#8b5cf6'} strokeWidth="1.4" />
            <text x={x} y={Number(y) + 12} fontSize="8" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{rng}</text>
            <text x={x} y={Number(y) + 24} fontSize="12" fill={hot ? '#b45309' : '#6d28d9'} textAnchor="middle" fontFamily="monospace" fontWeight="700">{val}</text>
          </g>
        ))}
        <text x="320" y="200" fontSize="9.5" fill="#b45309" textAnchor="middle" fontFamily="monospace">sum[1,4] = [1:1]1 + [2:2]4 + [3:4]6 = 11 · only O(log n) nodes touched</text>

        <line x1="20" y1="214" x2="620" y2="214" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="234" fontSize="11" fontWeight="700" fill="#6d28d9" fontFamily="monospace">FENWICK / BIT · index i owns a block of length (i &amp; −i); prefix(7) = t[7]+t[6]+t[4]</text>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const lsb = i & (-i);
          const hot = [4, 6, 7].includes(i);
          const cx = 90 + i * 60;
          return (
            <g key={i}>
              <rect x={cx - 24} y="250" width="48" height="30" rx="4" fill={hot ? '#fef3c7' : '#f8fafc'} stroke={hot ? '#f59e0b' : '#cbd5e1'} strokeWidth="1.3" />
              <text x={cx} y="270" fontSize="13" fill={hot ? '#b45309' : '#475569'} textAnchor="middle" fontFamily="monospace" fontWeight={hot ? '700' : '400'}>{i}</text>
              <text x={cx} y="294" fontSize="8.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">covers {lsb}</text>
            </g>
          );
        })}
        <path d="M510,250 C 500,234 480,234 470,248" fill="none" stroke="#f59e0b" strokeWidth="1.4" markerEnd="url(#stUp)" />
        <path d="M450,250 C 420,232 360,232 330,248" fill="none" stroke="#f59e0b" strokeWidth="1.4" markerEnd="url(#stUp)" />
        <text x="430" y="226" fontSize="9" fill="#b45309" textAnchor="middle" fontFamily="monospace">7 → 6 → 4 → 0 · each step strips the lowest set bit</text>
      </svg>
    ),
    svgCaption: "Top: a sum segment tree over `[3,1,4,1,5,9]`; the query `sum[1,4]` does not scan four elements — it grabs the three precomputed nodes (`[1:1]`, `[2:2]`, `[3:4]`) that tile the interval, totaling 11. Bottom: a Fenwick tree where each index covers `i & (−i)` elements (its lowest set bit); a prefix query walks `7 → 6 → 4 → 0`, stripping one bit per hop.",
    cols: ['Property', 'Segment tree', 'Fenwick / BIT'],
    complexity: [
      { op: 'Build', time: 'Θ(n)', space: 'Θ(n)' },
      { op: 'Range query', time: 'Θ(log n)', space: 'Θ(log n)' },
      { op: 'Point update', time: 'Θ(log n)', space: 'Θ(log n)' },
      { op: 'Memory', time: '≈ 4n', space: 'n + 1' },
      { op: 'Operations', time: 'any associative', space: 'invertible (sum)' },
    ],
    breaks: [
      { name: 'Recomputing on a mixed workload', body: "When both range queries and point updates are frequent, a prefix-sum array (`O(1)` query but `O(n)` update) or a per-query rescan (`O(n)`) both blow up. A segment tree or Fenwick tree makes *both* `O(log n)`, which is the whole reason they exist." },
      { name: 'A Fenwick tree for min / max', body: "The BIT derives a range from `prefix(r) − prefix(l−1)`, and that subtraction only works for invertible operations like sum — applying it to min or max gives nonsense. Use a segment tree for non-invertible aggregates, or a sparse table for static range-min with no updates." },
      { name: 'Off-by-one and 1-indexing traps', body: "A Fenwick tree must be 1-indexed — index 0 has `0 & −0 == 0`, so the update loop never advances and hangs — and a segment tree under-sized below `4n` reads out of bounds. Use 1-based indexing for the BIT and allocate `4n` (or twice the next power of two) for the segment tree." },
    ],
    code: [
      `class Fenwick:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)            # 1-indexed

    def update(self, i, delta):           # add delta at position i
        while i <= self.n:
            self.t[i] += delta
            i += i & (-i)                 # climb by the lowest set bit

    def prefix(self, i):                  # sum of [1..i]
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & (-i)                 # descend by the lowest set bit
        return s

    def range_sum(self, l, r):            # invertible: subtract prefixes
        return self.prefix(r) - self.prefix(l - 1)

bit = Fenwick(6)
for i, v in enumerate([3, 1, 4, 1, 5, 9], start=1):
    bit.update(i, v)
print(bit.range_sum(2, 5))                # 1+4+1+5 = 11`,
      `class SegTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.t = [0] * (4 * self.n)
        self._build(arr, 1, 0, self.n - 1)

    def _build(self, a, node, lo, hi):
        if lo == hi:
            self.t[node] = a[lo]; return
        mid = (lo + hi) // 2
        self._build(a, 2*node, lo, mid)
        self._build(a, 2*node + 1, mid + 1, hi)
        self.t[node] = self.t[2*node] + self.t[2*node + 1]

    def query(self, l, r, node=1, lo=0, hi=None):
        if hi is None: hi = self.n - 1
        if r < lo or hi < l:        return 0              # disjoint
        if l <= lo and hi <= r:     return self.t[node]   # fully inside
        mid = (lo + hi) // 2
        return (self.query(l, r, 2*node, lo, mid) +
                self.query(l, r, 2*node + 1, mid + 1, hi))

    def update(self, i, val, node=1, lo=0, hi=None):
        if hi is None: hi = self.n - 1
        if lo == hi:
            self.t[node] = val; return
        mid = (lo + hi) // 2
        if i <= mid: self.update(i, val, 2*node, lo, mid)
        else:        self.update(i, val, 2*node + 1, mid + 1, hi)
        self.t[node] = self.t[2*node] + self.t[2*node + 1]

st = SegTree([3, 1, 4, 1, 5, 9])
print(st.query(1, 4))                  # 11
st.update(2, 10)                       # A[2] = 4 -> 10
print(st.query(1, 4))                  # 1+10+1+5 = 17`,
    ],
    mentalModel: "A segment tree is a stack of nested progress bars — each already knows the total for its slice, so any range you name is assembled from a few pre-summed pieces instead of re-adding every element. A Fenwick tree is that same idea folded into the binary digits of the indices, so the hops are just bit-flips.",
  },
  {
    num: 15,
    part: 5,
    title: 'Comparison Sorts — Quicksort, Mergesort, Heapsort, and the n log n Wall',
    coreIdea: "Any sort that orders elements purely by comparing pairs is provably stuck at `Ω(n log n)` — there are `n!` possible orderings and each comparison reveals only one bit — so the three great comparison sorts differ not in beating that wall but in *how* they split the work and what they trade away.",
    explanation: [
      "There is a hard floor under comparison sorting. Picture the algorithm as a decision tree where each internal node is a comparison and each leaf is one of the `n!` possible orderings; to distinguish all of them the tree must have at least `n!` leaves, so its height — the worst-case number of comparisons — is at least `log₂(n!) ≈ n log n`. No comparison sort can tunnel under that. What distinguishes the workhorses is their strategy and their trade-offs. Quicksort picks a *pivot* and partitions the array into elements less than it and greater than it, then recurses on each side; it is in-place, extremely cache-friendly, and the fastest in practice on average (`Θ(n log n)` with tiny constants), but a bad pivot on adversarial input degrades it to `Θ(n²)` and it is not stable.",
      "Mergesort splits the array in half, recursively sorts each half, then merges the two sorted runs in linear time; it is the dependable one — *always* `Θ(n log n)`, and *stable* (equal keys keep their original order) — but the merge needs `Θ(n)` scratch space, which is why it shines for linked lists and external/on-disk sorting rather than tight in-memory arrays. Heapsort builds a max-heap in `Θ(n)` and repeatedly extracts the maximum, giving a *guaranteed* `Θ(n log n)` in `Θ(1)` extra space, but the heap's sift operations jump all over memory, so its poor cache locality makes it slower in wall-clock terms than quicksort despite identical asymptotics. The clean summary: quicksort is fast-but-fragile and in-place, mergesort is guaranteed-and-stable but hungry for memory, and heapsort is guaranteed-and-in-place but cache-hostile — and the next chapters show how production sorts combine their strengths.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Quicksort partition and mergesort split-merge">
        <defs>
          <marker id="sortDn" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" /></marker>
          <marker id="mgDn" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6" /></marker>
          <marker id="mgUp" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#10b981" /></marker>
        </defs>
        <text x="20" y="16" fontSize="11" fontWeight="700" fill="#b45309" fontFamily="monospace">QUICKSORT · partition around a pivot — the pivot lands in its final sorted slot</text>
        {[3, 8, 1, 5, 2, 7, 4].map((v, i) => (
          <g key={i}>
            <rect x={40 + i * 54} y="36" width="48" height="30" rx="4" fill={i === 6 ? '#fef3c7' : '#dbeafe'} stroke={i === 6 ? '#f59e0b' : '#3b82f6'} strokeWidth="1.3" />
            <text x={64 + i * 54} y="56" fontSize="14" fill={i === 6 ? '#b45309' : '#1e40af'} textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <text x="430" y="56" fontSize="9.5" fill="#b45309" fontFamily="monospace">pivot = 4</text>
        <line x1="200" y1="70" x2="200" y2="92" stroke="#94a3b8" strokeWidth="1.4" markerEnd="url(#sortDn)" />
        <text x="240" y="86" fontSize="9.5" fill="#475569" fontFamily="monospace">partition: O(n) scan</text>
        {[['3', 'lo'], ['1', 'lo'], ['2', 'lo'], ['4', 'piv'], ['8', 'hi'], ['5', 'hi'], ['7', 'hi']].map(([v, kind], i) => {
          const f = kind === 'piv' ? '#fef3c7' : kind === 'lo' ? '#d1fae5' : '#dbeafe';
          const s = kind === 'piv' ? '#f59e0b' : kind === 'lo' ? '#10b981' : '#3b82f6';
          const t = kind === 'piv' ? '#b45309' : kind === 'lo' ? '#047857' : '#1e40af';
          return (
            <g key={i}>
              <rect x={40 + i * 54} y="98" width="48" height="30" rx="4" fill={f} stroke={s} strokeWidth="1.3" />
              <text x={64 + i * 54} y="118" fontSize="14" fill={t} textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
            </g>
          );
        })}
        <text x="118" y="146" fontSize="9" fill="#047857" textAnchor="middle" fontFamily="monospace">&lt; pivot · recurse ←</text>
        <text x="226" y="146" fontSize="9" fill="#b45309" textAnchor="middle" fontFamily="monospace">✓ final</text>
        <text x="442" y="146" fontSize="9" fill="#1e40af" textAnchor="middle" fontFamily="monospace">&gt; pivot · recurse →</text>

        <line x1="20" y1="166" x2="620" y2="166" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="186" fontSize="11" fontWeight="700" fill="#b45309" fontFamily="monospace">MERGESORT · split to singletons (↓), merge sorted runs (↑) — always O(n log n), stable</text>

        <text x="24" y="246" fontSize="9" fill="#1e40af" fontFamily="monospace" transform="rotate(-90 24 246)">split ↓</text>
        {[[[5, 2, 8, 1], 70, 198], [[5, 2], 50, 238], [[8, 1], 150, 238], [[5], 40, 278], [[2], 80, 278], [[8], 130, 278], [[1], 170, 278]].map(([arr, x, y], gi) => (
          <g key={gi}>
            {arr.map((v, i) => (
              <g key={i}>
                <rect x={Number(x) + i * 26} y={y} width="22" height="24" rx="3" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.1" />
                <text x={Number(x) + i * 26 + 11} y={Number(y) + 17} fontSize="11" fill="#1e40af" textAnchor="middle" fontFamily="monospace">{v}</text>
              </g>
            ))}
          </g>
        ))}
        <line x1="120" y1="222" x2="80" y2="236" stroke="#3b82f6" strokeWidth="1.1" markerEnd="url(#mgDn)" />
        <line x1="130" y1="222" x2="180" y2="236" stroke="#3b82f6" strokeWidth="1.1" markerEnd="url(#mgDn)" />

        <text x="616" y="246" fontSize="9" fill="#047857" fontFamily="monospace" transform="rotate(-90 616 246)">merge ↑</text>
        {[[[1, 2, 5, 8], 410, 198], [[2, 5], 400, 238], [[1, 8], 500, 238], [[5], 410, 278], [[2], 450, 278], [[8], 500, 278], [[1], 540, 278]].map(([arr, x, y], gi) => (
          <g key={gi}>
            {arr.map((v, i) => (
              <g key={i}>
                <rect x={Number(x) + i * 26} y={y} width="22" height="24" rx="3" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.1" />
                <text x={Number(x) + i * 26 + 11} y={Number(y) + 17} fontSize="11" fill="#047857" textAnchor="middle" fontFamily="monospace">{v}</text>
              </g>
            ))}
          </g>
        ))}
        <line x1="430" y1="262" x2="445" y2="248" stroke="#10b981" strokeWidth="1.1" markerEnd="url(#mgUp)" />
        <line x1="520" y1="262" x2="505" y2="248" stroke="#10b981" strokeWidth="1.1" markerEnd="url(#mgUp)" />
      </svg>
    ),
    svgCaption: "Top: one quicksort partition splits the array around pivot `4` — everything smaller drifts left (green), everything larger right (blue), and the pivot drops into its permanent sorted position before the two sides recurse independently. Bottom: mergesort recursively halves down to singletons (blue, left), then merges adjacent sorted runs back up (green, right) into the fully ordered array.",
    cols: ['Algorithm', 'Avg / worst time', 'Space · stability'],
    complexity: [
      { op: 'Quicksort', time: 'Θ(n log n) / Θ(n²)', space: 'Θ(log n) · unstable' },
      { op: 'Mergesort', time: 'Θ(n log n) / Θ(n log n)', space: 'Θ(n) · stable' },
      { op: 'Heapsort', time: 'Θ(n log n) / Θ(n log n)', space: 'Θ(1) · unstable' },
      { op: 'Lower bound', time: 'Ω(n log n)', space: 'any comparison sort' },
    ],
    breaks: [
      { name: 'Quicksort on sorted input', body: "Choosing the first or last element as the pivot on already-sorted or reverse-sorted data produces maximally lopsided partitions — `n` levels deep — collapsing quicksort to `Θ(n²)`. Randomize the pivot or use median-of-three, and fall back to heapsort past a depth limit (introsort, next chapters)." },
      { name: 'Recursion-depth overflow', body: "Quicksort's worst case recurses `O(n)` deep and blows the call stack on large adversarial inputs. Recurse into the *smaller* partition and loop on the larger one, which caps the live stack depth at `O(log n)` regardless of pivot luck." },
      { name: 'Assuming stability you do not have', body: "Quicksort and heapsort reorder equal keys, so a two-pass 'sort by date, then by name' silently scrambles the date order within each name. Use a stable sort (mergesort or Timsort) when ties must be preserved, or fold a tiebreaker into the comparison key." },
    ],
    code: [
      `import random

def quicksort(a, lo=0, hi=None):
    if hi is None: hi = len(a) - 1
    if lo >= hi: return
    p = random.randint(lo, hi)               # randomized pivot dodges O(n^2)
    a[p], a[hi] = a[hi], a[p]
    pivot = a[hi]
    i = lo                                    # Lomuto partition
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]; i += 1
    a[i], a[hi] = a[hi], a[i]                 # pivot to its final slot
    quicksort(a, lo, i - 1)
    quicksort(a, i + 1, hi)

arr = [3, 8, 1, 5, 2, 7, 4]
quicksort(arr); print(arr)                    # [1, 2, 3, 4, 5, 7, 8]`,
      `def mergesort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left  = mergesort(a[:mid])                # split + recurse
    right = mergesort(a[mid:])
    return merge(left, right)

def merge(L, R):                              # linear, stable merge
    out, i, j = [], 0, 0
    while i < len(L) and j < len(R):
        if L[i] <= R[j]:                      # <= keeps equal keys in order
            out.append(L[i]); i += 1
        else:
            out.append(R[j]); j += 1
    out.extend(L[i:]); out.extend(R[j:])
    return out

print(mergesort([5, 2, 8, 1, 5, 3]))          # [1, 2, 3, 5, 5, 8]
# CPython's built-in sorted() is Timsort -> stable, O(n log n) (next chapters)`,
    ],
    mentalModel: "Comparison sorting is twenty-questions where each yes/no can at best halve the orderings still in play — and with `n!` orderings on the table you need about `log₂(n!) ≈ n log n` questions, a wall no comparison sort can dig under. Quicksort, mergesort, and heapsort are just three styles of asking: split by value, split down the middle, or run a tournament.",
  },
  {
    num: 16,
    part: 5,
    title: 'Linear-Time Sorts — Counting, Radix, and Bucket',
    coreIdea: "These sorts run in `O(n)` because they break the rules: instead of *comparing* elements they read the keys directly and drop each one into its address, which only works when the keys are structured — small integers, fixed-width digits, or a known uniform spread.",
    explanation: [
      "The `Ω(n log n)` wall only binds algorithms that learn about order through comparisons; sorts that exploit the actual structure of the keys can do better. Counting sort handles integer keys in a bounded range `[0, k)`: it tallies how many times each value occurs in a `k`-sized count array, turns those counts into prefix sums that give each value its final slice of positions, then places every element directly — `Θ(n + k)` time, stable, no comparison ever made. Its hard constraint is that `k` must stay comparable to `n`; counting-sorting a thousand 64-bit integers would demand a count array of `2⁶⁴` entries, which is why it works as a building block rather than a general sort.",
      "Radix sort lifts that limitation by decomposing wide keys into fixed-width digits and running a stable pass — usually counting sort — once per digit, from least significant to most significant (LSD). After each pass the array is sorted by all digits processed so far, and crucially each pass *must be stable* or it would scramble the ordering the previous passes established; for 32-bit integers in base 256 that is just four passes, effectively `Θ(n)`. Bucket sort takes a third route for keys known to be roughly uniformly distributed: scatter the `n` elements into about `n` buckets by value, sort each small bucket with insertion sort, and concatenate — `Θ(n)` on average, but `Θ(n²)` in the worst case if the distribution is skewed and everything piles into one bucket. The common thread is that all three trade comparisons for direct indexing, and all three pay for it with assumptions about the keys that a comparison sort never needs.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Counting sort and radix LSD passes">
        <defs>
          <marker id="lsArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" /></marker>
        </defs>
        <text x="20" y="14" fontSize="11" fontWeight="700" fill="#b45309" fontFamily="monospace">COUNTING SORT · count each value, then place — O(n + k)</text>
        <text x="20" y="34" fontSize="9.5" fill="#475569" fontFamily="monospace">input</text>
        {[2, 5, 2, 0, 3, 2, 0].map((v, i) => (
          <g key={i}>
            <rect x={70 + i * 40} y="24" width="34" height="26" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2" />
            <text x={87 + i * 40} y="42" fontSize="12" fill="#1e40af" textAnchor="middle" fontFamily="monospace">{v}</text>
          </g>
        ))}
        <text x="380" y="42" fontSize="9.5" fill="#475569" fontFamily="monospace">values in [0, 6)</text>

        <text x="20" y="78" fontSize="9.5" fill="#475569" fontFamily="monospace">counts</text>
        {[2, 0, 3, 1, 0, 1].map((c, i) => (
          <g key={i}>
            <rect x={70 + i * 56} y="62" width="48" height="26" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.2" />
            <text x={94 + i * 56} y="80" fontSize="12" fill="#b45309" textAnchor="middle" fontFamily="monospace" fontWeight="700">{c}</text>
            <text x={94 + i * 56} y="102" fontSize="8.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">val {i}</text>
          </g>
        ))}

        <line x1="200" y1="106" x2="200" y2="118" stroke="#94a3b8" strokeWidth="1.3" markerEnd="url(#lsArr)" />
        <text x="240" y="116" fontSize="9" fill="#475569" fontFamily="monospace">prefix-sum → positions, then place</text>
        <text x="20" y="140" fontSize="9.5" fill="#475569" fontFamily="monospace">output</text>
        {[0, 0, 2, 2, 2, 3, 5].map((v, i) => (
          <g key={i}>
            <rect x={70 + i * 40} y="124" width="34" height="26" rx="3" fill="#d1fae5" stroke="#10b981" strokeWidth="1.2" />
            <text x={87 + i * 40} y="142" fontSize="12" fill="#047857" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}

        <line x1="20" y1="166" x2="620" y2="166" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="186" fontSize="11" fontWeight="700" fill="#b45309" fontFamily="monospace">RADIX SORT (LSD) · one stable pass per digit, least-significant first</text>
        {[
          ['original', [53, 9, 31, 17, 25], 206, null],
          ['by ones digit →', [31, 53, 25, 17, 9], 248, 'ones'],
          ['by tens digit → sorted ✓', [9, 17, 25, 31, 53], 290, 'tens'],
        ].map(([label, arr, y, hl], gi) => (
          <g key={gi}>
            <text x="20" y={Number(y) + 4} fontSize="9" fill="#475569" fontFamily="monospace">{label}</text>
            {arr.map((v, i) => {
              const s = String(v).padStart(2, '0');
              return (
                <g key={i}>
                  <rect x={230 + i * 56} y={Number(y) - 14} width="46" height="26" rx="3" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.2" />
                  <text x={253 + i * 56} y={Number(y) + 4} fontSize="12" fill="#1e40af" textAnchor="middle" fontFamily="monospace">
                    <tspan fill={hl === 'tens' ? '#b45309' : '#1e40af'} fontWeight={hl === 'tens' ? '700' : '400'}>{s[0]}</tspan>
                    <tspan fill={hl === 'ones' ? '#b45309' : '#1e40af'} fontWeight={hl === 'ones' ? '700' : '400'}>{s[1]}</tspan>
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    ),
    svgCaption: "Top: counting sort tallies each value (amber), prefix-sums the counts into positions, and writes the output directly — no element is ever compared. Bottom: radix sort makes one stable pass per digit, least-significant first; after sorting on the ones digit and then the tens digit (highlighted), the array is fully ordered in just two passes.",
    cols: ['Algorithm', 'Time', 'Space / note'],
    complexity: [
      { op: 'Counting sort', time: 'Θ(n + k)', space: 'Θ(n + k) · stable' },
      { op: 'Radix sort (LSD)', time: 'Θ(d · (n + b))', space: 'Θ(n + b) · stable' },
      { op: 'Bucket sort (average)', time: 'Θ(n)', space: 'Θ(n)' },
      { op: 'Bucket sort (worst)', time: 'Θ(n²)', space: 'Θ(n)' },
      { op: 'vs comparison bound', time: 'beats Ω(n log n)', space: 'by not comparing' },
    ],
    breaks: [
      { name: 'A key range far larger than n', body: "Counting- or bucket-sorting keys with range `k ≫ n` — say a thousand random 64-bit values — spends `O(k)` time and memory on a giant mostly-empty count array, losing badly to `O(n log n)`. Only use counting sort when `k = O(n)`; decompose wide keys into small-base digits and use radix instead." },
      { name: 'An unstable digit pass in radix', body: "Radix LSD relies on each digit pass preserving the order established by previous (less significant) passes; if the inner sort is not stable, those orderings are destroyed and the result is wrong. The per-digit sort must be stable — counting sort is; never plug in quicksort." },
      { name: 'Bucket sort on skewed data', body: "Bucket sort is `O(n)` only when keys spread evenly; a clustered distribution dumps most elements into one bucket, which then costs `O(n²)` to sort. Verify near-uniformity (or transform the keys), size the bucket count near `n`, and fall back to a comparison sort if the data is lumpy." },
    ],
    code: [
      `def counting_sort(a, k):                  # keys in [0, k)
    count = [0] * k
    for x in a:                           # tally occurrences
        count[x] += 1
    for i in range(1, k):                 # prefix sums -> end positions
        count[i] += count[i - 1]
    out = [0] * len(a)
    for x in reversed(a):                 # reverse keeps it STABLE
        count[x] -= 1
        out[count[x]] = x
    return out

print(counting_sort([2, 5, 2, 0, 3, 2, 0], k=6))   # [0, 0, 2, 2, 2, 3, 5]`,
      `def radix_sort(a, base=10):               # non-negative ints
    if not a:
        return a
    max_val = max(a)
    exp = 1
    while max_val // exp > 0:              # one pass per digit
        buckets = [[] for _ in range(base)]
        for x in a:
            buckets[(x // exp) % base].append(x)   # stable: append order kept
        a = [x for bucket in buckets for x in bucket]
        exp *= base
    return a

print(radix_sort([170, 45, 75, 90, 2, 802, 24, 66]))
# [2, 24, 45, 66, 75, 90, 170, 802]`,
    ],
    mentalModel: "Linear sorts beat the comparison wall by refusing to compare at all: rather than asking 'which is bigger?', they ask 'what *is* this value?' and drop each item straight into its labeled pigeonhole — like sorting mail by reading the ZIP code, not by holding two letters up against each other. The catch is that every item must have a small, known address.",
  },
  {
    num: 17,
    part: 5,
    title: 'Production Sorts — Timsort & Introsort',
    coreIdea: "The sorts that ship in real standard libraries are hybrids: they detect the shape of the actual data and switch tools mid-flight — Timsort exploits pre-sorted runs for stable, often-linear performance, while Introsort runs fast quicksort but bails out to heapsort the instant it smells an `O(n²)` spiral.",
    explanation: [
      "Textbook sorts optimize a single worst case; library sorts optimize *real inputs*, which are messy and frequently already partly ordered. Timsort — the algorithm behind Python's `list.sort()` and `sorted()`, Java's object sort, Android, and V8 — is a stable, adaptive mergesort built around that observation. It first scans for natural runs (maximal ascending or strictly-descending stretches, reversing the descending ones in place), then extends any run shorter than a `minrun` threshold (~32–64) using binary insertion sort, and finally merges the runs using a stack that enforces balance invariants on run lengths so no merge is wildly lopsided. Its galloping mode is the clever finish: when one run keeps winning the merge comparison, it switches from one-at-a-time to exponential search to leap over long stretches of the dominating run. The payoff is `Θ(n)` on already-sorted or nearly-sorted data, `Θ(n log n)` worst case, and full stability.",
      "Introsort — the algorithm behind `C++`'s `std::sort` — takes the opposite starting point and hardens it. It begins as quicksort with a median-of-three pivot for raw average speed, but it *introspects*: it tracks recursion depth, and if that depth exceeds `2·log₂ n` (the signature of a bad-pivot sequence dragging quicksort toward `O(n²)`), it switches that subarray to heapsort, which guarantees `Θ(n log n)` no matter what. Below a small size threshold (~16 elements) it switches again to insertion sort, whose low overhead and cache-friendliness beat the recursion machinery on tiny arrays. The result is quicksort's typical speed with heapsort's ironclad worst-case bound — though, unlike Timsort, it is not stable. The shared lesson is pure engineering: guarantees come from fallbacks, speed comes from adaptivity, and the right production sort is a composite that picks the best tool for each region of the data.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Timsort runs and introsort fallback flow">
        <defs>
          <marker id="prArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b" /></marker>
          <marker id="prYes" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" /></marker>
        </defs>
        <text x="20" y="14" fontSize="11" fontWeight="700" fill="#b45309" fontFamily="monospace">TIMSORT · detect natural runs (reverse descending), then merge — adaptive + stable</text>
        {[
          ['1', 'a'], ['3', 'a'], ['5', 'a'], ['9', 'd'], ['7', 'd'], ['2', 'd'], ['4', 'b'], ['6', 'b'], ['8', 'b'],
        ].map(([v, run], i) => {
          const map = { a: ['#d1fae5', '#10b981', '#047857'], d: ['#fee2e2', '#ef4444', '#b91c1c'], b: ['#dbeafe', '#3b82f6', '#1e40af'] };
          const [f, s, t] = map[run];
          return (
            <g key={i}>
              <rect x={70 + i * 44} y="28" width="38" height="28" rx="3" fill={f} stroke={s} strokeWidth="1.3" />
              <text x={89 + i * 44} y="47" fontSize="13" fill={t} textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
            </g>
          );
        })}
        <text x="128" y="72" fontSize="8.5" fill="#047857" textAnchor="middle" fontFamily="monospace">run ↑</text>
        <text x="260" y="72" fontSize="8.5" fill="#b91c1c" textAnchor="middle" fontFamily="monospace">descending → reverse</text>
        <text x="408" y="72" fontSize="8.5" fill="#1e40af" textAnchor="middle" fontFamily="monospace">run ↑</text>
        <text x="70" y="92" fontSize="9" fill="#475569" fontFamily="monospace">merge runs with a balance-invariant stack (A &gt; B + C); gallop when one run dominates</text>

        <line x1="20" y1="108" x2="620" y2="108" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="128" fontSize="11" fontWeight="700" fill="#b45309" fontFamily="monospace">INTROSORT · quicksort by default, with two safety fallbacks</text>

        <rect x="240" y="140" width="160" height="30" rx="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.4" />
        <text x="320" y="159" fontSize="11" fill="#b45309" textAnchor="middle" fontFamily="monospace" fontWeight="700">quicksort (median-of-3)</text>

        <line x1="320" y1="170" x2="320" y2="184" stroke="#64748b" strokeWidth="1.3" markerEnd="url(#prArr)" />
        <polygon points="320,186 410,212 320,238 230,212" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.3" />
        <text x="320" y="208" fontSize="9.5" fill="#475569" textAnchor="middle" fontFamily="monospace">depth &gt; 2·log₂n?</text>
        <text x="320" y="222" fontSize="9.5" fill="#475569" textAnchor="middle" fontFamily="monospace">(bad-pivot spiral)</text>

        <line x1="410" y1="212" x2="470" y2="212" stroke="#ef4444" strokeWidth="1.4" markerEnd="url(#prYes)" />
        <text x="440" y="206" fontSize="9" fill="#b91c1c" textAnchor="middle" fontFamily="monospace">yes</text>
        <rect x="472" y="197" width="150" height="30" rx="5" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.4" />
        <text x="547" y="216" fontSize="10" fill="#6d28d9" textAnchor="middle" fontFamily="monospace" fontWeight="700">heapsort · O(n log n) ✓</text>

        <line x1="320" y1="238" x2="320" y2="252" stroke="#64748b" strokeWidth="1.3" markerEnd="url(#prArr)" />
        <text x="338" y="250" fontSize="9" fill="#475569" fontFamily="monospace">no</text>
        <polygon points="320,254 400,276 320,298 240,276" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.3" />
        <text x="320" y="280" fontSize="9.5" fill="#475569" textAnchor="middle" fontFamily="monospace">subarray &lt; ~16?</text>

        <line x1="400" y1="276" x2="460" y2="276" stroke="#ef4444" strokeWidth="1.4" markerEnd="url(#prYes)" />
        <text x="430" y="270" fontSize="9" fill="#b91c1c" textAnchor="middle" fontFamily="monospace">yes</text>
        <rect x="462" y="261" width="160" height="30" rx="5" fill="#d1fae5" stroke="#10b981" strokeWidth="1.4" />
        <text x="542" y="280" fontSize="10" fill="#047857" textAnchor="middle" fontFamily="monospace" fontWeight="700">insertion sort · low overhead</text>
        <text x="150" y="280" fontSize="9" fill="#475569" textAnchor="middle" fontFamily="monospace">no → recurse</text>
      </svg>
    ),
    svgCaption: "Top: Timsort breaks the array into natural runs — two ascending (green, blue) and one descending (red) that it reverses in place — then merges them with a balanced stack, galloping past any run that dominates. Bottom: Introsort defaults to quicksort but watches itself: too-deep recursion diverts a subarray to heapsort (guaranteed bound), and tiny subarrays divert to insertion sort (low overhead).",
    cols: ['Sort', 'Typical', 'Worst · properties'],
    complexity: [
      { op: 'Timsort', time: 'Θ(n) on runs', space: 'Θ(n log n) · stable, Θ(n) aux' },
      { op: 'Introsort', time: 'Θ(n log n)', space: 'Θ(n log n) · unstable, Θ(log n)' },
      { op: 'Plain quicksort', time: 'Θ(n log n)', space: 'Θ(n²) worst — why fallback exists' },
    ],
    breaks: [
      { name: 'Cross-language stability assumptions', body: "Python's and Java's object sorts use Timsort and are stable, but `C++`'s `std::sort` is Introsort and is *not* stable — porting code that quietly relied on equal keys keeping their order will silently misorder. Use `std::stable_sort` in `C++`, or fold a tiebreaker into the comparison key." },
      { name: 'Expecting adaptivity from a non-adaptive sort', body: "Timsort is `Θ(n)` on nearly-sorted or append-heavy data because it reuses existing runs; quicksort and introsort gain nothing from pre-sortedness. For incrementally-growing or mostly-ordered data, pick an adaptive sort rather than re-running a non-adaptive one each time." },
      { name: 'An expensive comparator called n log n times', body: "Both sorts invoke the comparison `Θ(n log n)` times, so an `O(m)` comparator (deep object compare, locale-aware string compare) makes the whole sort `Θ(n log n · m)`. Precompute a cheap sort key once per element — `key=` in Python, the decorate-sort-undecorate pattern — so each comparison is `O(1)`." },
    ],
    code: [
      `def insertion_sort(a, lo, hi):
    for i in range(lo + 1, hi):
        x, j = a[i], i - 1
        while j >= lo and a[j] > x:
            a[j + 1] = a[j]; j -= 1
        a[j + 1] = x

def merge(L, R):                              # stable merge
    out, i, j = [], 0, 0
    while i < len(L) and j < len(R):
        if L[i] <= R[j]: out.append(L[i]); i += 1
        else:            out.append(R[j]); j += 1
    out.extend(L[i:]); out.extend(R[j:]); return out

def timsort(a, minrun=32):
    n, runs, i = len(a), [], 0
    while i < n:
        j = i + 1
        if j < n and a[j] < a[i]:             # descending run...
            while j < n and a[j] < a[j - 1]: j += 1
            a[i:j] = a[i:j][::-1]             # ...reversed to ascending
        else:
            while j < n and a[j] >= a[j - 1]: j += 1
        end = min(i + minrun, n)              # extend short runs
        if end > j:
            insertion_sort(a, i, end); j = end
        runs.append(a[i:j]); i = j
    while len(runs) > 1:                       # balanced pairwise merge
        runs.append(merge(runs.pop(0), runs.pop(0)))
    return runs[0] if runs else a

print(timsort([1, 3, 5, 9, 7, 2, 4, 6, 8]))   # [1, 2, 3, 4, 5, 6, 7, 8, 9]`,
      `import math, heapq

def insertion_sort(a, lo, hi):
    for i in range(lo + 1, hi):
        x, j = a[i], i - 1
        while j >= lo and a[j] > x:
            a[j + 1] = a[j]; j -= 1
        a[j + 1] = x

def partition(a, lo, hi):                      # median-of-three pivot
    mid = (lo + hi - 1) // 2
    trio = sorted((a[lo], a[mid], a[hi - 1]))
    pivot = trio[1]
    i = lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]; i += 1
    return i

def introsort(a):
    def rec(lo, hi, depth):
        if hi - lo <= 16:                      # tiny -> insertion sort
            insertion_sort(a, lo, hi); return
        if depth == 0:                          # spiral -> heapsort fallback
            chunk = a[lo:hi]; heapq.heapify(chunk)
            for i in range(lo, hi): a[i] = heapq.heappop(chunk)
            return
        p = partition(a, lo, hi)                # otherwise quicksort
        rec(lo, p, depth - 1); rec(p, hi, depth - 1)
    if a:
        rec(0, len(a), 2 * int(math.log2(len(a))))
    return a

print(introsort([3, 8, 1, 5, 2, 7, 4, 6, 0, 9]))  # 0..9 sorted`,
    ],
    mentalModel: "A production sort is a seasoned foreman, not a purist: it sizes up the material first. Timsort sees the lumber is already half-stacked in neat piles and just slides them together; Introsort charges in with the fast tool but keeps one hand on the safety lever, swapping to the slower-but-unbreakable tool the moment the fast one starts to bind.",
  },
  {
    num: 18,
    part: 6,
    title: 'Graph Representations — Matrix, List, and the Density Trade-off',
    coreIdea: "A graph is just vertices and edges, but *how* you store the edges decides which questions are cheap: an adjacency matrix answers 'are these two connected?' in `O(1)` while always costing `O(V²)` memory, whereas an adjacency list costs only `O(V + E)` and iterates a vertex's neighbors fast — which is why it wins on the sparse graphs that dominate the real world.",
    explanation: [
      "The same abstract graph admits several concrete layouts, and each makes a different operation fast. An adjacency matrix is a `V × V` grid where cell `[u][v]` holds 1 (or the edge weight) when an edge exists; it gives `O(1)` edge-existence and weight lookup, but it occupies `Θ(V²)` space no matter how few edges there are, and listing one vertex's neighbors means scanning a whole row of `V` cells. That makes it ideal for *dense* graphs (where `E` approaches `V²`) and for code that constantly probes specific edges, but ruinous for sparse ones. An adjacency list instead stores, per vertex, a list of just its actual neighbors, using `Θ(V + E)` space and giving `O(degree)` neighbor iteration — the default for almost every real graph, since road networks, social graphs, and dependency graphs are overwhelmingly sparse.",
      "A third form, the edge list, simply stores all edges as `(u, v, weight)` triples in `Θ(E)` space; it is the natural input for algorithms that sweep over every edge, like Kruskal's MST or Bellman-Ford. Cutting across all three are two orthogonal properties: a graph is *directed* or *undirected* (undirected means the matrix is symmetric and each edge appears in both vertices' lists), and *weighted* or *unweighted*. The practical decision reduces to density and access pattern — pick the matrix when the graph is dense or you need instant edge tests, pick the list when it is sparse or you mostly iterate neighbors, and pick the edge list when your algorithm processes edges in bulk. Getting this choice wrong is one of the most common sources of accidental quadratic blowups in graph code.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="A graph as adjacency matrix and adjacency list">
        <text x="20" y="16" fontSize="11" fontWeight="700" fill="#4338ca" fontFamily="monospace">SAME GRAPH, THREE VIEWS · undirected, vertices 0–3</text>

        {/* graph */}
        <text x="20" y="40" fontSize="9.5" fill="#475569" fontFamily="monospace">graph</text>
        {[[80, 70, 180, 70], [80, 70, 180, 160], [180, 70, 180, 160], [180, 160, 80, 160]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c7d2fe" strokeWidth="2.2" />
        ))}
        {[['0', 80, 70], ['1', 180, 70], ['2', 180, 160], ['3', 80, 160]].map(([v, x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="17" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.8" />
            <text x={x} y={Number(y) + 5} fontSize="14" fill="#4338ca" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}

        {/* matrix */}
        <text x="270" y="40" fontSize="9.5" fill="#475569" fontFamily="monospace">adjacency matrix — Θ(V²)</text>
        {[0, 1, 2, 3].map((c) => <text key={'c' + c} x={310 + c * 26} y="58" fontSize="9.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{c}</text>)}
        {[0, 1, 2, 3].map((r) => <text key={'r' + r} x="286" y={80 + r * 26} fontSize="9.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{r}</text>)}
        {[[0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1], [0, 0, 1, 0]].map((row, r) => (
          row.map((cell, c) => (
            <g key={r + '-' + c}>
              <rect x={298 + c * 26} y={64 + r * 26} width="24" height="24" fill={cell ? '#c7d2fe' : '#f8fafc'} stroke="#cbd5e1" strokeWidth="0.8" />
              <text x={310 + c * 26} y={80 + r * 26} fontSize="11" fill={cell ? '#4338ca' : '#cbd5e1'} textAnchor="middle" fontFamily="monospace" fontWeight={cell ? '700' : '400'}>{cell}</text>
            </g>
          ))
        ))}
        <text x="270" y="190" fontSize="8.5" fill="#475569" fontFamily="monospace">edge(u,v)? → O(1)</text>

        {/* list */}
        <text x="450" y="40" fontSize="9.5" fill="#475569" fontFamily="monospace">adjacency list — Θ(V+E)</text>
        {[['0', [1, 2]], ['1', [0, 2]], ['2', [0, 1, 3]], ['3', [2]]].map(([v, ns], ri) => (
          <g key={ri}>
            <rect x="450" y={54 + ri * 32} width="24" height="24" rx="3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.3" />
            <text x="462" y={70 + ri * 32} fontSize="12" fill="#4338ca" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
            {ns.map((n, ni) => (
              <g key={ni}>
                <line x1={474 + ni * 42} y1={66 + ri * 32} x2={488 + ni * 42} y2={66 + ri * 32} stroke="#a5b4fc" strokeWidth="1.4" />
                <rect x={488 + ni * 42} y={54 + ri * 32} width="24" height="24" rx="3" fill="#eef2ff" stroke="#818cf8" strokeWidth="1.1" />
                <text x={500 + ni * 42} y={70 + ri * 32} fontSize="11" fill="#4338ca" textAnchor="middle" fontFamily="monospace">{n}</text>
              </g>
            ))}
          </g>
        ))}
        <text x="450" y="196" fontSize="8.5" fill="#475569" fontFamily="monospace">neighbors(u) → O(deg)</text>

        <line x1="20" y1="214" x2="620" y2="214" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="238" fontSize="10" fill="#475569" fontFamily="monospace">Matrix: O(V²) space, O(1) edge test, O(V) to list neighbors → best when DENSE.</text>
        <text x="20" y="258" fontSize="10" fill="#475569" fontFamily="monospace">List: O(V+E) space, O(deg) edge test, O(deg) to list neighbors → best when SPARSE.</text>
        <text x="20" y="282" fontSize="10" fill="#4338ca" fontFamily="monospace" fontWeight="700">Most real graphs (roads, social, dependencies) are sparse → adjacency list is the default.</text>
      </svg>
    ),
    svgCaption: "One undirected graph in two storage forms. The adjacency matrix is a symmetric `4×4` grid — instant `O(1)` edge tests, but every cell exists even though most are zero. The adjacency list keeps only the real neighbors per vertex — compact `O(V+E)` space and fast neighbor iteration, at the cost of an `O(deg)` scan to test one specific edge.",
    cols: ['Operation', 'Adjacency matrix', 'Adjacency list'],
    complexity: [
      { op: 'Space', time: 'Θ(V²)', space: 'Θ(V + E)' },
      { op: 'Edge exists? (u, v)', time: 'Θ(1)', space: 'Θ(deg u)' },
      { op: 'Enumerate neighbors', time: 'Θ(V)', space: 'Θ(deg u)' },
      { op: 'Iterate all edges', time: 'Θ(V²)', space: 'Θ(V + E)' },
      { op: 'Best fit', time: 'dense (E ≈ V²)', space: 'sparse (E ≪ V²)' },
    ],
    breaks: [
      { name: 'A matrix for a large sparse graph', body: "Storing a 10-million-user social graph as a matrix demands `10¹⁴` cells — impossible — even though the real edges number perhaps `10⁹`. For sparse graphs (nearly all real ones) use an adjacency list, whose footprint scales with edges actually present, not with vertex pairs." },
      { name: 'A list for constant edge probes on a dense graph', body: "If the workload is repeated random 'is `u` adjacent to `v`?' queries on a dense graph, each list lookup costs `O(deg)` and adds up. Use a matrix for `O(1)` tests, or back each vertex with a hash set of neighbors to keep `O(1)` checks while staying sparse-friendly." },
      { name: 'Forgetting the reverse edge', body: "In an undirected graph, adding only `u → v` to the list (or setting only `matrix[u][v]`) silently makes the graph directed, so a traversal misses the edge from `v`'s side. Always insert both directions — `u → v` and `v → u` — and keep the matrix symmetric." },
    ],
    code: [
      `edges = [(0, 1), (0, 2), (1, 2), (2, 3)]   # undirected
V = 4

matrix = [[0] * V for _ in range(V)]
adj = {v: [] for v in range(V)}
for u, v in edges:
    matrix[u][v] = matrix[v][u] = 1          # symmetric for undirected
    adj[u].append(v); adj[v].append(u)        # both directions

# edge test: matrix is O(1); list is O(deg)
print(matrix[2][3] == 1)                      # True  (instant)
print(3 in adj[2])                            # True  (scans 2's neighbors)
print(adj[2])                                 # [0, 1, 3]`,
      `class Graph:
    def __init__(self, directed=False):
        self.directed = directed
        self.adj = {}                         # vertex -> list of (nbr, weight)

    def add_edge(self, u, v, w=1):
        self.adj.setdefault(u, []).append((v, w))
        if not self.directed:                 # mirror for undirected
            self.adj.setdefault(v, []).append((u, w))
        else:
            self.adj.setdefault(v, [])

    def neighbors(self, u):
        return self.adj.get(u, [])

g = Graph()
for u, v in [(0, 1), (0, 2), (1, 2), (2, 3)]:
    g.add_edge(u, v)
print(g.neighbors(2))                         # [(0, 1), (1, 1), (3, 1)]`,
    ],
    mentalModel: "Choosing a graph representation is choosing between a giant attendance grid and a stack of contact cards. The grid tells you instantly whether any two people are linked, but it needs a row and column for every possible pair even though almost none are connected; the contact cards store only the real relationships, staying tiny for sparse webs — but to check one specific link you must flip through a card.",
  },
  {
    num: 19,
    part: 6,
    title: 'Graph Traversal — BFS, DFS, and the One-Knob Difference',
    coreIdea: "Breadth-first and depth-first search visit every reachable vertex in `O(V + E)` and differ in exactly one thing — a FIFO queue versus a stack — yet that single swap turns layer-by-layer flooding (which finds shortest unweighted paths) into dive-and-backtrack (which orders dependencies and detects cycles).",
    explanation: [
      "Both traversals systematically explore a graph from a start vertex, and both need a *visited* set, because without one a cycle sends them into an infinite loop. BFS uses a FIFO queue: it dequeues a vertex, enqueues all its unvisited neighbors, and repeats, which makes it expand outward in concentric layers — all vertices at distance 0, then distance 1, then distance 2. That layered order is exactly why BFS finds the shortest path (fewest edges) in an unweighted graph: the first time it reaches a vertex is necessarily via a minimum-hop route. It is the tool for level-order processing, bipartite checks, and unweighted shortest paths, running in `Θ(V + E)` with frontier space up to `Θ(V)` for the widest layer.",
      "DFS uses a stack — explicit, or implicitly the call stack via recursion — so it dives as deep as possible along one path and backtracks only when it hits a dead end. This depth-first order exposes structure that layers hide: the order in which vertices *finish* yields a topological sort of a DAG, a back-edge to an ancestor reveals a cycle, and the recursion structure underlies algorithms for bridges, articulation points, and strongly connected components. It is also `Θ(V + E)`, with stack space proportional to the deepest path. The mechanical takeaway is striking: the two algorithms are identical except for which end of the frontier you pull from, and that choice — queue or stack — is the entire difference between 'nearest first' and 'deepest first'.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="BFS layers versus DFS deep path on the same graph">
        <text x="20" y="16" fontSize="11" fontWeight="700" fill="#4338ca" fontFamily="monospace">SAME GRAPH, START = A · numbers show visit order · bold = discovery (tree) edges</text>
        <text x="100" y="36" fontSize="10" fontWeight="700" fill="#4338ca" fontFamily="monospace">BFS — FIFO queue (layers)</text>

        {/* BFS edges */}
        {[[80, 56, 50, 112, true], [80, 56, 140, 112, true], [50, 112, 40, 176, true], [140, 112, 160, 176, true], [40, 176, 90, 234, true], [160, 176, 90, 234, false]].map(([x1, y1, x2, y2, tree], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={tree ? '#6366f1' : '#cbd5e1'} strokeWidth={tree ? '2.4' : '1.4'} strokeDasharray={tree ? '0' : '4 3'} />
        ))}
        {[['A', 80, 56, 1], ['B', 50, 112, 2], ['C', 140, 112, 3], ['D', 40, 176, 4], ['E', 160, 176, 5], ['F', 90, 234, 6]].map(([v, x, y, ord], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="16" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.7" />
            <text x={x} y={Number(y) + 5} fontSize="13" fill="#4338ca" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
            <circle cx={Number(x) + 14} cy={Number(y) - 12} r="8" fill="#f59e0b" />
            <text x={Number(x) + 14} y={Number(y) - 9} fontSize="9" fill="#fff" textAnchor="middle" fontFamily="monospace" fontWeight="700">{ord}</text>
          </g>
        ))}
        <text x="20" y="266" fontSize="9" fill="#475569" fontFamily="monospace">layers: {'{A} {B,C} {D,E} {F}'}</text>
        <text x="20" y="282" fontSize="9" fill="#475569" fontFamily="monospace">queue grows wide; first hit = shortest</text>

        <line x1="320" y1="28" x2="320" y2="300" stroke="#e2e8f0" strokeWidth="1" />
        <text x="420" y="36" fontSize="10" fontWeight="700" fill="#4338ca" fontFamily="monospace">DFS — stack / recursion (deep)</text>

        {/* DFS edges: discovery A-B-D-F-E-C */}
        {[[400, 56, 370, 112, true], [400, 56, 460, 112, false], [370, 112, 360, 176, true], [460, 112, 480, 176, true], [360, 176, 410, 234, true], [480, 176, 410, 234, true]].map(([x1, y1, x2, y2, tree], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={tree ? '#6366f1' : '#cbd5e1'} strokeWidth={tree ? '2.4' : '1.4'} strokeDasharray={tree ? '0' : '4 3'} />
        ))}
        {[['A', 400, 56, 1], ['B', 370, 112, 2], ['C', 460, 112, 6], ['D', 360, 176, 3], ['E', 480, 176, 5], ['F', 410, 234, 4]].map(([v, x, y, ord], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="16" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.7" />
            <text x={x} y={Number(y) + 5} fontSize="13" fill="#4338ca" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
            <circle cx={Number(x) + 14} cy={Number(y) - 12} r="8" fill="#10b981" />
            <text x={Number(x) + 14} y={Number(y) - 9} fontSize="9" fill="#fff" textAnchor="middle" fontFamily="monospace" fontWeight="700">{ord}</text>
          </g>
        ))}
        <text x="340" y="266" fontSize="9" fill="#475569" fontFamily="monospace">path: A→B→D→F deep, backtrack→E→C</text>
        <text x="340" y="282" fontSize="9" fill="#475569" fontFamily="monospace">finish order → topological sort</text>
      </svg>
    ),
    svgCaption: "The identical graph from `A` under both traversals. BFS (left) pulls from the front of a queue, fanning out in layers `{A} {B,C} {D,E} {F}` — so its discovery tree is shallow and wide, and the first arrival at any vertex is a shortest hop-path. DFS (right) pulls from a stack, plunging `A→B→D→F` before backtracking to `E` and `C` — a deep spine whose finish order gives a topological sort.",
    cols: ['Property', 'BFS', 'DFS'],
    complexity: [
      { op: 'Time', time: 'Θ(V + E)', space: 'Θ(V + E)' },
      { op: 'Frontier structure', time: 'FIFO queue', space: 'stack / recursion' },
      { op: 'Extra space', time: 'Θ(V) widest layer', space: 'Θ(V) deepest path' },
      { op: 'Shortest unweighted path', time: 'yes', space: 'no' },
      { op: 'Signature uses', time: 'levels, bipartite', space: 'topo sort, cycle, SCC' },
    ],
    breaks: [
      { name: 'No visited set', body: "Without marking visited vertices, any cycle loops forever and even a DAG gets re-explored exponentially. Mark vertices visited — and for BFS, mark them when *enqueuing*, not when dequeuing, or the same vertex gets queued multiple times before it is first processed." },
      { name: 'Recursive DFS stack overflow', body: "Recursive DFS rides the call stack, so a long path or skewed graph blows Python's ~1000-frame recursion limit (or the native stack in other languages). Use an iterative DFS with an explicit stack for large or deep graphs rather than relying on recursion." },
      { name: 'Using DFS for shortest paths', body: "DFS finds *a* path, not the shortest — it commits to one deep route and may reach the target the long way around. For fewest-edge shortest paths in an unweighted graph use BFS, and reconstruct the route from the parent pointers its layer-tree records." },
    ],
    code: [
      `from collections import deque

def bfs(adj, src):
    dist = {src: 0}
    parent = {src: None}
    q = deque([src])
    while q:
        u = q.popleft()                      # FIFO -> layer by layer
        for v in adj[u]:
            if v not in dist:                # mark on enqueue
                dist[v] = dist[u] + 1
                parent[v] = u
                q.append(v)
    return dist, parent

def shortest_path(parent, target):           # walk parents back to source
    path = []
    while target is not None:
        path.append(target); target = parent[target]
    return path[::-1]

adj = {'A':['B','C'],'B':['A','D'],'C':['A','E'],'D':['B','F'],'E':['C','F'],'F':['D','E']}
dist, parent = bfs(adj, 'A')
print(dist['F'], shortest_path(parent, 'F'))   # 3 ['A', 'B', 'D', 'F']`,
      `def dfs_iter(adj, src):                       # explicit stack, no recursion
    seen, order, stack = set(), [], [src]
    while stack:
        u = stack.pop()                      # LIFO -> dive deep
        if u in seen: continue
        seen.add(u); order.append(u)
        for v in reversed(adj[u]):           # reversed -> natural left-to-right
            if v not in seen: stack.append(v)
    return order

def topo_sort(adj):                           # DFS finish-order on a DAG
    seen, out = set(), []
    def visit(u):
        seen.add(u)
        for v in adj.get(u, []):
            if v not in seen: visit(v)
        out.append(u)                        # push on finish
    for u in adj: 
        if u not in seen: visit(u)
    return out[::-1]                          # reverse = topological order

dag = {'A':['B','C'],'B':['D'],'C':['D'],'D':[]}
print(dfs_iter(adj, 'A'))                      # one DFS visit order from A
print(topo_sort(dag))                          # ['A', 'C', 'B', 'D'] (a valid order)`,
    ],
    mentalModel: "BFS and DFS are one exploration with a single knob flipped — queue versus stack. BFS floods a maze level by level like rising water, so the instant it touches the exit it has the shortest route. DFS is a lone explorer following each corridor to its dead end, unspooling thread and backing up — which is how it can hand you the order to do dependent tasks, or notice a loop in the halls.",
  },
  {
    num: 20,
    part: 6,
    title: 'Shortest Paths — Dijkstra, Bellman-Ford, and A*',
    coreIdea: "Every shortest-path algorithm is built on one move — *edge relaxation*, `dist[v] = min(dist[v], dist[u] + w)` — and they differ only in the order and conditions under which they relax: Dijkstra greedily settles the nearest vertex (non-negative weights only), Bellman-Ford relaxes everything `V−1` times (negatives allowed), and A* relaxes toward the goal using a heuristic.",
    explanation: [
      "Once edges carry weights, BFS no longer finds the cheapest route — fewest hops is not least cost — so we relax edges instead. Dijkstra's algorithm keeps a tentative distance for every vertex, repeatedly extracts the unsettled vertex with the smallest tentative distance from a min-heap, relaxes its outgoing edges (improving neighbors it can now reach more cheaply), and marks it finalized. Its correctness rests entirely on a *non-negativity* assumption: because no edge can reduce a cost, once a vertex is settled with the minimum tentative distance, nothing discovered later can beat it. With a binary heap this runs in `Θ((V + E) log V)`, and it is the right default whenever all weights are non-negative — road maps, network latencies, and the like.",
      "When edges can be negative, that assumption breaks and Dijkstra silently returns wrong answers, so Bellman-Ford steps in: it simply relaxes *all* `E` edges, `V−1` times, since any shortest path uses at most `V−1` edges and one full pass guarantees one more correct hop. That makes it `Θ(V · E)` — slower but general — and it gains a bonus: if a `V`-th pass still improves some distance, the graph contains a negative cycle and no finite shortest path exists, which is how routing protocols and currency-arbitrage detectors use it. A* is Dijkstra with a sense of direction: it orders the frontier by `f(n) = g(n) + h(n)`, where `g` is the cost so far and `h` is a heuristic estimate of the remaining cost to the goal. If `h` never overestimates (is *admissible*), A* still finds the optimal path but explores far fewer vertices by aiming at the target — and with `h = 0` it degenerates exactly back into Dijkstra.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Dijkstra relaxation snapshot with priority queue">
        <defs>
          <marker id="spEdge" markerWidth="8" markerHeight="8" refX="13" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" /></marker>
          <marker id="spHot" markerWidth="8" markerHeight="8" refX="13" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" /></marker>
        </defs>
        <text x="20" y="16" fontSize="11" fontWeight="700" fill="#4338ca" fontFamily="monospace">DIJKSTRA · S and B settled; relaxing B→A improves A from 4 to 3</text>
        {/* edges */}
        {[[70, 90, 175, 66, '4', false], [70, 90, 175, 150, '', false], [180, 70, 180, 132, '2', true], [188, 64, 290, 104, '5', false], [192, 150, 290, 116, '1', false], [312, 110, 398, 110, '3', false]].map(([x1, y1, x2, y2, w, hot], i) => (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? '#f59e0b' : '#cbd5e1'} strokeWidth={hot ? '2.6' : '1.6'} markerEnd={hot ? 'url(#spHot)' : 'url(#spEdge)'} />
            {w && <text x={(Number(x1) + Number(x2)) / 2 + 6} y={(Number(y1) + Number(y2)) / 2} fontSize="10" fill={hot ? '#b45309' : '#64748b'} fontFamily="monospace" fontWeight="700">{w}</text>}
          </g>
        ))}
        <text x="118" y="118" fontSize="9.5" fill="#64748b" fontFamily="monospace">4</text>
        {[
          ['S', 70, 90, '0', 'set'], ['B', 180, 60, '1', 'set'], ['A', 180, 150, '3', 'relax'], ['C', 300, 110, '6', 'front'], ['D', 410, 110, '∞', 'far'],
        ].map(([v, x, y, d, kind], i) => {
          const map = { set: ['#d1fae5', '#10b981', '#047857'], relax: ['#fef3c7', '#f59e0b', '#b45309'], front: ['#fff7ed', '#fdba74', '#c2410c'], far: ['#f1f5f9', '#cbd5e1', '#94a3b8'] };
          const [f, s, t] = map[kind];
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="17" fill={f} stroke={s} strokeWidth="1.8" />
              <text x={x} y={Number(y) + 5} fontSize="14" fill={t} textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
              <text x={x} y={Number(y) - 22} fontSize="10" fill={t} textAnchor="middle" fontFamily="monospace" fontWeight="700">d={d}</text>
            </g>
          );
        })}
        <text x="300" y="150" fontSize="8.5" fill="#c2410c" fontFamily="monospace">via B: 1+5</text>
        <text x="120" y="180" fontSize="9" fill="#b45309" fontFamily="monospace">relax B→A: 1 + 2 = 3 &lt; 4 ✓</text>

        <rect x="470" y="44" width="150" height="120" rx="6" fill="#faf5ff" stroke="#c4b5fd" strokeWidth="1.3" />
        <text x="545" y="62" fontSize="9.5" fontWeight="700" fill="#6d28d9" textAnchor="middle" fontFamily="monospace">min-heap (frontier)</text>
        <rect x="486" y="74" width="118" height="24" rx="3" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.1" />
        <text x="545" y="90" fontSize="11" fill="#6d28d9" textAnchor="middle" fontFamily="monospace">(3, A) ← pop next</text>
        <rect x="486" y="102" width="118" height="24" rx="3" fill="#f5f3ff" stroke="#a78bfa" strokeWidth="1" />
        <text x="545" y="118" fontSize="11" fill="#7c3aed" textAnchor="middle" fontFamily="monospace">(6, C)</text>
        <text x="545" y="146" fontSize="8.5" fill="#64748b" textAnchor="middle" fontFamily="monospace">settled: S(0), B(1)</text>

        <line x1="20" y1="186" x2="620" y2="186" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="208" fontSize="9.5" fill="#475569" fontFamily="monospace">DIJKSTRA · greedy: settle nearest, relax, lock it. Works only if weights ≥ 0.</text>
        <text x="20" y="232" fontSize="9.5" fill="#b91c1c" fontFamily="monospace">NEGATIVE edge ⇒ a settled vertex could still improve ⇒ Dijkstra is wrong.</text>
        <text x="20" y="256" fontSize="9.5" fill="#475569" fontFamily="monospace">BELLMAN-FORD · relax ALL edges V−1× (Θ(V·E)); a further gain = negative cycle.</text>
        <text x="20" y="280" fontSize="9.5" fill="#4338ca" fontFamily="monospace" fontWeight="700">A* · order by f = g + h; admissible h aims at the goal, expanding fewer nodes (h=0 → Dijkstra).</text>
      </svg>
    ),
    svgCaption: "A Dijkstra snapshot: `S` and `B` are settled (green), and popping `B` relaxes the edge `B→A`, lowering `A`'s tentative distance from 4 to 3 (amber) and reshuffling the min-heap so `(3, A)` is next. The lower panel contrasts the three: Dijkstra's greed needs non-negative weights, Bellman-Ford trades speed for handling negatives and detecting negative cycles, and A* steers Dijkstra with a heuristic.",
    cols: ['Algorithm', 'Time', 'Handles'],
    complexity: [
      { op: 'BFS (unweighted)', time: 'Θ(V + E)', space: 'unit weights only' },
      { op: 'Dijkstra (binary heap)', time: 'Θ((V + E) log V)', space: 'non-negative weights' },
      { op: 'Dijkstra (Fibonacci)', time: 'Θ(E + V log V)', space: 'non-negative weights' },
      { op: 'Bellman-Ford', time: 'Θ(V · E)', space: 'negatives; finds neg cycle' },
      { op: 'A* (admissible h)', time: '≤ Dijkstra', space: 'non-negative + heuristic' },
    ],
    breaks: [
      { name: 'Dijkstra with negative edges', body: "A single negative edge can offer a cheaper route to a vertex Dijkstra already finalized, but the greedy lock means it never reconsiders — so the distances come out wrong (note: a negative edge is enough; you do not need a negative cycle). Use Bellman-Ford for negative weights, or Johnson's algorithm for all-pairs." },
      { name: 'An inadmissible A* heuristic', body: "If `h` ever overestimates the true remaining cost, A* can settle the goal via a suboptimal path and return it, forfeiting optimality. Keep `h` admissible — straight-line distance is `≤` any real road distance, for example — and prefer a consistent `h` to also avoid re-expanding nodes." },
      { name: 'No priority queue, or stale heap entries', body: "Re-scanning all vertices for the minimum makes Dijkstra `Θ(V²)` (fine when dense, wasteful when sparse), and a lazy heap that never skips outdated tuples will process stale, too-large distances. Use a binary heap with lazy deletion — discard a popped entry whose distance exceeds the current best — or a decrease-key heap." },
    ],
    code: [
      `import heapq

def dijkstra(adj, src):                       # adj: u -> list of (v, weight)
    dist = {src: 0}
    pq = [(0, src)]                           # (tentative distance, vertex)
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, float('inf')):
            continue                          # stale entry -> skip
        for v, w in adj[u]:
            nd = d + w                        # relax the edge u -> v
            if nd < dist.get(v, float('inf')):
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist

adj = {'S':[('A',4),('B',1)], 'B':[('A',2),('C',5)],
       'A':[('C',1)], 'C':[('D',3)], 'D':[]}
print(dijkstra(adj, 'S'))     # {'S':0,'B':1,'A':3,'C':4,'D':7}`,
      `def bellman_ford(vertices, edges, src):       # edges: list of (u, v, w)
    dist = {v: float('inf') for v in vertices}
    dist[src] = 0
    for _ in range(len(vertices) - 1):        # V-1 full relaxation passes
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:                      # one more pass: still improving?
        if dist[u] + w < dist[v]:
            raise ValueError("negative cycle detected")
    return dist

V = ['S', 'A', 'B', 'C', 'D']
E = [('S','A',4),('S','B',1),('B','A',2),('B','C',5),('A','C',1),('C','D',3)]
print(bellman_ford(V, E, 'S'))   # same distances, and negatives would be fine`,
    ],
    mentalModel: "Edge relaxation is the shared heartbeat: whenever you spot a cheaper way to reach a vertex, you write it down. Dijkstra is a cautious accountant who finalizes the cheapest still-open vertex first, trusting nothing cheaper can arrive later — a trust that shatters the instant an edge can *subtract* cost. Bellman-Ford is the brute who re-checks every road enough times that no saving can hide. A* is Dijkstra holding a compass, relaxing toward the goal first.",
  },
  {
    num: 21,
    part: 6,
    title: 'Minimum Spanning Trees — Kruskal & Prim',
    coreIdea: "A minimum spanning tree connects every vertex of a weighted undirected graph using exactly `V−1` edges of least total weight, and two greedy algorithms find it: Kruskal adds the cheapest edge anywhere that does not close a cycle, while Prim grows one tree outward by always taking the cheapest edge leaving it — different orders, same minimal network.",
    explanation: [
      "An MST is the cheapest subgraph that keeps all `V` vertices connected: a tree (no cycles) with exactly `V−1` edges minimizing the sum of weights. Both standard algorithms are greedy and both are provably correct by the *cut property* — the lightest edge crossing any partition of the vertices belongs to some MST. Kruskal works edge-first: sort all edges ascending by weight, then walk the list adding each edge only if its two endpoints are in different components (so it never forms a cycle), stopping once `V−1` edges are chosen. The cycle test is the crux, and it is done with a Union-Find / disjoint-set structure that answers 'same component?' in near-constant time; the overall cost `Θ(E log E)` is dominated by the initial sort, making Kruskal a natural fit for sparse graphs or when edges arrive pre-sorted.",
      "Prim works vertex-first: start from an arbitrary vertex and repeatedly add the minimum-weight edge that connects the growing tree to a vertex still outside it, using a min-heap keyed by each frontier vertex's cheapest connecting edge. That gives `Θ(E log V)` with a binary heap, or `Θ(V²)` with a simple array — which actually wins on dense graphs. The two can pick different trees when weights tie, but the total weight is always the same minimum. MSTs underpin physical network design (laying cable or roads with minimal wire), single-linkage clustering, and approximation algorithms for problems like the traveling salesman. A crucial caveat that trips people up: an MST minimizes *total* weight, which is not the same as minimizing the distance from a source to each vertex — that is a shortest-path tree, and the two are generally different.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="MST highlighted with Kruskal and Prim selection">
        <text x="20" y="16" fontSize="11" fontWeight="700" fill="#4338ca" fontFamily="monospace">MST (green) · total weight = 12</text>
        {/* edges: MST bold green, others gray dashed */}
        {[
          [70, 80, 180, 70, '1', true], [70, 80, 110, 160, '4', false], [180, 70, 110, 160, '2', true],
          [180, 70, 230, 150, '3', true], [110, 160, 230, 150, '5', false], [230, 150, 180, 240, '6', true], [110, 160, 180, 240, '7', false],
        ].map(([x1, y1, x2, y2, w, mst], i) => (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={mst ? '#10b981' : '#cbd5e1'} strokeWidth={mst ? '3' : '1.5'} strokeDasharray={mst ? '0' : '4 3'} />
            <text x={(Number(x1) + Number(x2)) / 2 + 5} y={(Number(y1) + Number(y2)) / 2} fontSize="10.5" fill={mst ? '#047857' : '#94a3b8'} fontFamily="monospace" fontWeight="700">{w}</text>
          </g>
        ))}
        {[['A', 70, 80], ['B', 180, 70], ['C', 110, 160], ['D', 230, 150], ['E', 180, 240]].map(([v, x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="16" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.8" />
            <text x={x} y={Number(y) + 5} fontSize="13" fill="#4338ca" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}

        <line x1="290" y1="28" x2="290" y2="300" stroke="#e2e8f0" strokeWidth="1" />
        <text x="306" y="40" fontSize="10" fontWeight="700" fill="#4338ca" fontFamily="monospace">KRUSKAL · sort edges, add if no cycle</text>
        {[
          ['AB', '1', true], ['BC', '2', true], ['BD', '3', true], ['AC', '4', false], ['CD', '5', false], ['DE', '6', true], ['CE', '7', false],
        ].map(([e, w, add], i) => (
          <g key={i}>
            <rect x={306 + (i % 4) * 78} y={52 + Math.floor(i / 4) * 40} width="68" height="30" rx="4" fill={add ? '#d1fae5' : '#fee2e2'} stroke={add ? '#10b981' : '#ef4444'} strokeWidth="1.3" />
            <text x={340 + (i % 4) * 78} y={66 + Math.floor(i / 4) * 40} fontSize="10" fill={add ? '#047857' : '#b91c1c'} textAnchor="middle" fontFamily="monospace" fontWeight="700">{e} · {w}</text>
            <text x={340 + (i % 4) * 78} y={78 + Math.floor(i / 4) * 40} fontSize="8" fill={add ? '#047857' : '#b91c1c'} textAnchor="middle" fontFamily="monospace">{add ? '✓ add' : '✗ cycle'}</text>
          </g>
        ))}
        <text x="306" y="148" fontSize="8.5" fill="#475569" fontFamily="monospace">stop at V−1 = 4 edges</text>

        <text x="306" y="186" fontSize="10" fontWeight="700" fill="#4338ca" fontFamily="monospace">PRIM · grow from A, take cheapest leaving edge</text>
        {[['{A}', '+B', '1'], ['{A,B}', '+C', '2'], ['{A,B,C}', '+D', '3'], ['{…,D}', '+E', '6']].map(([set, add, w], i) => (
          <g key={i}>
            <rect x={306} y={200 + i * 26} width="150" height="22" rx="3" fill="#eef2ff" stroke="#818cf8" strokeWidth="1.1" />
            <text x={312} y={215 + i * 26} fontSize="9.5" fill="#4338ca" fontFamily="monospace">{set} → {add} (w={w})</text>
            <text x={470} y={215 + i * 26} fontSize="9" fill="#10b981" fontFamily="monospace" fontWeight="700">✓</text>
          </g>
        ))}
        <text x="306" y="308" fontSize="8.5" fill="#475569" fontFamily="monospace">Kruskal O(E log E) · Prim O(E log V) · same tree here</text>
      </svg>
    ),
    svgCaption: "The MST (green, total weight 12) on a 5-vertex graph. Kruskal (top right) walks the weight-sorted edge list adding `AB, BC, BD, DE` and rejecting `AC, CD, CE` because each would close a cycle, stopping at `V−1=4`. Prim (bottom right) grows a single tree from `A`, each step taking the cheapest edge leaving the current set — arriving at the identical tree by a different route.",
    cols: ['Algorithm', 'Time', 'Best for'],
    complexity: [
      { op: 'Kruskal', time: 'Θ(E log E)', space: 'sparse; edge-centric' },
      { op: 'Prim (binary heap)', time: 'Θ(E log V)', space: 'general' },
      { op: 'Prim (array)', time: 'Θ(V²)', space: 'dense graphs' },
      { op: 'Output', time: 'V − 1 edges', space: 'minimum total weight' },
    ],
    breaks: [
      { name: 'Running MST on a directed graph', body: "MST is defined only for undirected graphs; the directed counterpart is the minimum arborescence, solved by the Chu-Liu/Edmonds algorithm, not by Kruskal or Prim. Applying an MST algorithm to a digraph quietly produces a meaningless result — use Edmonds' algorithm when edges have direction." },
      { name: 'Kruskal without Union-Find', body: "Testing each candidate edge for a cycle by running a fresh BFS/DFS makes the cycle checks dominate at `O(E · V)`. Back the connectivity test with a disjoint-set structure using path compression and union by rank, which makes 'same component?' near-`O(1)` (next chapter)." },
      { name: 'Mistaking the MST for a shortest-path tree', body: "An MST minimizes the *sum* of all edge weights, which is not the same as minimizing the distance from a root to every vertex — those differ in general, and tied weights also mean the MST is not unique. Use Dijkstra for source-to-all shortest paths; never substitute one for the other." },
    ],
    code: [
      `def kruskal(vertices, edges):                 # edges: list of (w, u, v)
    parent = {v: v for v in vertices}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]         # path compression
            x = parent[x]
        return x
    mst, total = [], 0
    for w, u, v in sorted(edges):                 # cheapest first
        ru, rv = find(u), find(v)
        if ru != rv:                              # different components -> no cycle
            parent[ru] = rv
            mst.append((u, v, w)); total += w
    return mst, total

V = ['A', 'B', 'C', 'D', 'E']
E = [(1,'A','B'),(4,'A','C'),(2,'B','C'),(3,'B','D'),(5,'C','D'),(6,'D','E'),(7,'C','E')]
print(kruskal(V, E))    # tree edges + total = 12`,
      `import heapq

def prim(adj, start):                         # adj: u -> list of (v, w)
    seen = {start}
    pq = [(w, start, v) for v, w in adj[start]]
    heapq.heapify(pq)
    mst, total = [], 0
    while pq and len(seen) < len(adj):
        w, u, v = heapq.heappop(pq)
        if v in seen:                          # edge leads back into the tree
            continue
        seen.add(v)
        mst.append((u, v, w)); total += w
        for nxt, nw in adj[v]:                 # push the new frontier edges
            if nxt not in seen:
                heapq.heappush(pq, (nw, v, nxt))
    return mst, total

adj = {'A':[('B',1),('C',4)], 'B':[('A',1),('C',2),('D',3)],
       'C':[('A',4),('B',2),('D',5),('E',7)], 'D':[('B',3),('C',5),('E',6)],
       'E':[('D',6),('C',7)]}
print(prim(adj, 'A'))   # same total = 12`,
    ],
    mentalModel: "An MST is the cheapest set of roads that still lets you drive between every town with no wasteful loops. Kruskal is the thrifty contractor paving the cheapest available road anywhere on the map and skipping any that would merely close a loop; Prim is the capital city growing outward, each year paving only the single cheapest road to one new town. Different order, same minimal network.",
  },
  {
    num: 22,
    part: 6,
    title: 'Union-Find — Disjoint Sets in Near-Constant Time',
    coreIdea: "A disjoint-set structure tracks a partition of elements into groups and answers 'same group?' plus 'merge two groups' almost for free — using a forest of parent-pointer up-trees that two tricks, union by rank and path compression, flatten to an amortized cost of `α(n)`, the inverse Ackermann function, which is below 5 for any input that will ever exist.",
    explanation: [
      "Union-Find (a disjoint-set union, or DSU) maintains a collection of disjoint sets and supports two operations: `find(x)`, which returns a representative identifying `x`'s set, and `union(x, y)`, which merges the two sets. It is represented as a forest of *up-trees*: every element stores a single parent pointer, the root of each tree is that set's representative, `find` walks parents to the root, and `union` links one root beneath another. Done naively this degrades — a bad sequence of unions builds a tall linear chain and `find` becomes `O(n)` — so two optimizations are applied together. *Union by rank* (or size) always hangs the shorter/smaller tree under the taller/larger root, keeping height logarithmic.",
      "*Path compression* does the heavy lifting: during a `find`, after locating the root, it re-points every node along the path directly at the root, so the tree flattens a little more each time it is queried and subsequent lookups are nearly instant. Used together, union by rank and path compression give an amortized cost of `O(α(n))` per operation — where `α`, the inverse Ackermann function, grows so slowly it is below 5 for any conceivable `n`, making the structure effectively constant-time. This deceptively simple tool is everywhere connectivity matters: it is the engine behind Kruskal's cycle test, dynamic connected-components and 'are these two nodes linked?' queries, cycle detection in undirected graphs, image-segmentation and percolation models. Its one real limitation is that it only merges and queries — it cannot efficiently delete an element or undo a union without specialized rollback variants.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Union by size and path compression in a disjoint-set forest">
        <defs>
          <marker id="ufUp" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" /></marker>
          <marker id="ufStep" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#94a3b8" /></marker>
        </defs>
        <text x="20" y="14" fontSize="11" fontWeight="700" fill="#4338ca" fontFamily="monospace">UNION BY SIZE · hang the smaller tree's root under the larger's</text>
        {/* tree1 */}
        {[[44, 90, 68, 56], [96, 90, 76, 56], [96, 126, 100, 96]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6366f1" strokeWidth="1.6" markerEnd="url(#ufUp)" />
        ))}
        {[['1', 70, 50], ['2', 44, 92], ['3', 96, 92], ['4', 96, 128]].map(([v, x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="14" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.6" />
            <text x={x} y={Number(y) + 5} fontSize="12" fill="#4338ca" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <text x="70" y="36" fontSize="8" fill="#64748b" textAnchor="middle" fontFamily="monospace">size 4</text>
        {/* tree2 */}
        <line x1="190" y1="90" x2="190" y2="66" stroke="#6366f1" strokeWidth="1.6" markerEnd="url(#ufUp)" />
        {[['5', 190, 50], ['6', 190, 92]].map(([v, x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="14" fill="#eef2ff" stroke="#818cf8" strokeWidth="1.6" />
            <text x={x} y={Number(y) + 5} fontSize="12" fill="#4338ca" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <text x="190" y="36" fontSize="8" fill="#64748b" textAnchor="middle" fontFamily="monospace">size 2</text>
        <line x1="216" y1="78" x2="278" y2="78" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#ufStep)" />
        <text x="247" y="70" fontSize="8.5" fill="#475569" textAnchor="middle" fontFamily="monospace">union(4,6)</text>
        {/* merged */}
        {[[300, 92, 326, 56], [346, 92, 336, 56], [400, 92, 350, 58], [346, 128, 350, 98], [400, 128, 400, 98]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6366f1" strokeWidth="1.6" markerEnd="url(#ufUp)" />
        ))}
        {[['1', 332, 50], ['2', 300, 92], ['3', 346, 92], ['5', 400, 92], ['4', 346, 128], ['6', 400, 128]].map(([v, x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="14" fill={v === '5' || v === '6' ? '#eef2ff' : '#e0e7ff'} stroke={v === '5' || v === '6' ? '#818cf8' : '#6366f1'} strokeWidth="1.6" />
            <text x={x} y={Number(y) + 5} fontSize="12" fill="#4338ca" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <text x="470" y="80" fontSize="9" fill="#475569" fontFamily="monospace">root 5 now</text>
        <text x="470" y="94" fontSize="9" fill="#475569" fontFamily="monospace">points to 1</text>

        <line x1="20" y1="150" x2="620" y2="150" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="170" fontSize="11" fontWeight="700" fill="#4338ca" fontFamily="monospace">PATH COMPRESSION · find(4) re-points every node on the path straight to the root</text>
        {/* before chain */}
        {[[70, 274, 70, 246], [70, 238, 70, 210], [70, 202, 70, 196]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="1.6" markerEnd="url(#ufUp)" />
        ))}
        {[['1', 70, 188], ['2', 70, 224], ['3', 70, 260], ['4', 70, 290]].map(([v, x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="13" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.4" />
            <text x={x} y={Number(y) + 5} fontSize="12" fill="#475569" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <text x="70" y="306" fontSize="8" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">tall chain</text>
        <line x1="120" y1="240" x2="190" y2="240" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#ufStep)" />
        <text x="155" y="232" fontSize="8.5" fill="#475569" textAnchor="middle" fontFamily="monospace">find(4)</text>
        {/* after star */}
        {[[260, 250, 300, 214], [330, 258, 332, 218], [400, 250, 360, 214]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6366f1" strokeWidth="1.6" markerEnd="url(#ufUp)" />
        ))}
        {[['1', 332, 200], ['2', 260, 256], ['3', 330, 268], ['4', 400, 256]].map(([v, x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="13" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
            <text x={x} y={Number(y) + 5} fontSize="12" fill="#4338ca" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        <text x="332" y="306" fontSize="8" fill="#64748b" textAnchor="middle" fontFamily="monospace">flat star → next find is O(1)</text>

        <rect x="452" y="186" width="168" height="96" rx="6" fill="#eef2ff" stroke="#a5b4fc" strokeWidth="1.3" />
        <text x="536" y="208" fontSize="10" fontWeight="700" fill="#4338ca" textAnchor="middle" fontFamily="monospace">rank + compression</text>
        <text x="536" y="230" fontSize="10" fill="#4338ca" textAnchor="middle" fontFamily="monospace">⇒ O(α(n)) amortized</text>
        <text x="536" y="252" fontSize="9" fill="#475569" textAnchor="middle" fontFamily="monospace">α(n) &lt; 5 for any real n</text>
        <text x="536" y="270" fontSize="9" fill="#475569" textAnchor="middle" fontFamily="monospace">≈ constant time</text>
      </svg>
    ),
    svgCaption: "Top: `union(4,6)` finds the two roots (`1`, `5`) and hangs the smaller tree under the larger by size, so `5` now points to `1` and the merged tree stays shallow. Bottom: a `find(4)` on a tall chain re-points every node it passes directly at the root `1`, collapsing the chain into a flat star so the next query is `O(1)`. Together these give the `α(n)` ≈ constant bound.",
    cols: ['Operation', 'Time', 'Note'],
    complexity: [
      { op: 'make_set', time: 'Θ(1)', space: 'one node' },
      { op: 'find / union (naive)', time: 'O(n)', space: 'degenerate chains' },
      { op: '+ union by rank/size', time: 'O(log n)', space: 'bounded height' },
      { op: '+ path compression', time: 'O(α(n)) amortized', space: '≈ constant' },
      { op: 'm ops on n elements', time: 'O(m · α(n))', space: 'near-linear' },
    ],
    breaks: [
      { name: 'Skipping the optimizations', body: "Plain `union`/`find` with neither trick lets a chain of unions build a linear tree, making every `find` `O(n)` and a Kruskal run quadratic. Always apply union by rank/size *and* path compression together — each alone only reaches `O(log n)`; only the pair gives the `α(n)` bound." },
      { name: 'Mishandling rank on merge', body: "Union by rank works only if rank is updated correctly: when two roots of *equal* rank merge, the surviving root's rank increases by one; otherwise it stays. Bumping rank on every union (or never) breaks the height guarantee and silently degrades performance back toward `O(log n)` or worse." },
      { name: 'Expecting deletion or undo', body: "DSU only merges sets and reports representatives — it cannot remove an element from a set or cleanly undo a `union`. For dynamic connectivity with deletions use link-cut trees or Euler-tour trees; for batch problems needing rollback, use an offline union-find with an explicit operation stack." },
    ],
    code: [
      `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))      # each element is its own root
        self.rank = [0] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path compression
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                  # already together
        if self.rank[ra] < self.rank[rb]: # attach shorter under taller
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1            # only equal ranks bump
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)

d = DSU(6)
for a, b in [(0, 1), (1, 2), (3, 4)]:
    d.union(a, b)
print(d.connected(0, 2), d.connected(0, 3))   # True False`,
      `def count_components(n, edges):
    dsu = DSU(n)
    components = n                        # start fully disconnected
    for u, v in edges:
        if dsu.union(u, v):               # a successful merge joins two groups
            components -= 1
    return components

def has_cycle_undirected(n, edges):
    dsu = DSU(n)
    for u, v in edges:
        if not dsu.union(u, v):           # endpoints already linked -> cycle
            return True
    return False

print(count_components(6, [(0,1),(1,2),(3,4)]))      # 3  ({0,1,2},{3,4},{5})
print(has_cycle_undirected(4, [(0,1),(1,2),(2,0)]))  # True`,
    ],
    mentalModel: "Union-Find is a room of people grouped by team, where each person knows just one other to point to and the chain of pointers ends at the captain. To check if two share a team, follow each chain to its captain. Path compression is everyone you pass re-pinning their badge straight to the captain, so the next lookup is instant; union by size is the smaller team's captain reporting to the bigger team's, so no chain ever grows tall.",
  },
  {
    num: 23,
    part: 7,
    title: 'Divide & Conquer and the Master Theorem',
    coreIdea: "Divide-and-conquer splits a problem into smaller copies of itself, solves them recursively, and combines the results — and the cost of that whole recursion is captured by `T(n) = a·T(n/b) + f(n)`, which the Master Theorem solves by asking one question: does the work pile up at the root, spread evenly across levels, or sink into the leaves?",
    explanation: [
      "The pattern has three steps: *divide* the input into `a` subproblems each of size `n/b`, *conquer* them by recursing, and *combine* their answers with some non-recursive work `f(n)`. That structure produces the recurrence `T(n) = a·T(n/b) + f(n)`, where `a` is how many subproblems you spawn, `b` is how much smaller each is, and `f(n)` is the divide-plus-combine cost per call. The Master Theorem reads off the answer by comparing `f(n)` against the *watershed* `n^(log_b a)` — the total cost of all the leaf work. If `f(n)` is polynomially smaller than the watershed, the leaves dominate and `T(n) = Θ(n^(log_b a))` (Case 1); if they are the same order, work is balanced across all `log_b n` levels and `T(n) = Θ(n^(log_b a) · log n)` (Case 2); if `f(n)` is polynomially larger (with a mild regularity condition), the top-level combine dominates and `T(n) = Θ(f(n))` (Case 3).",
      "A recursion tree makes this concrete: each level holds the subproblems at that depth, and summing the per-level work shows where the total concentrates. Mergesort is the textbook Case 2 — `2T(n/2) + Θ(n)` has watershed `n¹`, every level costs `Θ(n)`, and across `log₂ n` levels that is `Θ(n log n)`. Binary search is `T(n/2) + Θ(1)`, watershed `n⁰`, giving `Θ(log n)`. Karatsuba multiplication cleverly turns four sub-multiplications into three — `3T(n/2) + Θ(n)`, watershed `n^(log₂3) ≈ n^1.585` — beating schoolbook `O(n²)`, and Strassen's `7T(n/2) + Θ(n²)` reaches `n^(log₂7) ≈ n^2.807` for matrices. The theorem's limit is its rigidity: it only handles the constant-`a`, equal-size-split form, so recurrences that subtract rather than divide, split unevenly, or sit in the gap between cases need the recursion-tree method or the Akra-Bazzi generalization instead.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Recursion tree and the three Master Theorem cases">
        <text x="20" y="14" fontSize="11" fontWeight="700" fill="#be123c" fontFamily="monospace">RECURSION TREE · T(n) = 2T(n/2) + n  (mergesort) → every level costs n</text>
        {/* edges */}
        {[[220, 52, 130, 92], [220, 52, 310, 92], [130, 100, 72, 138], [130, 100, 188, 138], [310, 100, 252, 138], [310, 100, 368, 138]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbcfe8" strokeWidth="1.8" />
        ))}
        <g>
          <rect x="196" y="38" width="48" height="26" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="220" y="55" fontSize="12" fill="#be123c" textAnchor="middle" fontFamily="monospace" fontWeight="700">n</text>
        </g>
        {[[130, 86], [310, 86]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 24} y={y} width="48" height="26" rx="4" fill="#fff1f2" stroke="#fb7185" strokeWidth="1.3" />
            <text x={x} y={Number(y) + 17} fontSize="11" fill="#be123c" textAnchor="middle" fontFamily="monospace">n/2</text>
          </g>
        ))}
        {[72, 188, 252, 368].map((x, i) => (
          <g key={i}>
            <rect x={x - 22} y="132" width="44" height="24" rx="4" fill="#fff1f2" stroke="#fda4af" strokeWidth="1.1" />
            <text x={x} y="148" fontSize="10.5" fill="#be123c" textAnchor="middle" fontFamily="monospace">n/4</text>
          </g>
        ))}
        <text x="220" y="184" fontSize="10" fill="#9f1239" textAnchor="middle" fontFamily="monospace">⋯ down to n leaves of Θ(1) ⋯</text>

        <text x="450" y="44" fontSize="9.5" fontWeight="700" fill="#be123c" fontFamily="monospace">work / level</text>
        {[['level 0', 'n', 56], ['level 1', '2·(n/2) = n', 88], ['level 2', '4·(n/4) = n', 138], ['leaves', 'n·Θ(1) = n', 180]].map(([lvl, w, y], i) => (
          <g key={i}>
            <text x="450" y={y} fontSize="9" fill="#64748b" fontFamily="monospace">{lvl}</text>
            <text x="520" y={y} fontSize="9.5" fill="#9f1239" fontFamily="monospace" fontWeight="700">{w}</text>
          </g>
        ))}
        <line x1="448" y1="190" x2="615" y2="190" stroke="#fbcfe8" strokeWidth="1" />
        <text x="450" y="204" fontSize="9.5" fill="#be123c" fontFamily="monospace" fontWeight="700">Σ = n × log₂n = n log n</text>

        <line x1="20" y1="220" x2="620" y2="220" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="240" fontSize="10.5" fontWeight="700" fill="#be123c" fontFamily="monospace">MASTER THEOREM · compare f(n) to the watershed n^(log_b a):</text>
        {[
          ['Case 1', 'f smaller', 'Θ(n^log_b a)', 'leaves win', '#ffe4e6', '#f43f5e'],
          ['Case 2', 'f = watershed', 'Θ(n^log_b a · log n)', 'balanced', '#fef3c7', '#f59e0b'],
          ['Case 3', 'f larger', 'Θ(f(n))', 'root wins', '#dbeafe', '#3b82f6'],
        ].map(([c, cond, res, who, f, s], i) => (
          <g key={i}>
            <rect x={20 + i * 200} y="250" width="186" height="44" rx="5" fill={f} stroke={s} strokeWidth="1.3" />
            <text x={28 + i * 200} y="266" fontSize="9.5" fontWeight="700" fill="#334155" fontFamily="monospace">{c} · {cond}</text>
            <text x={28 + i * 200} y="280" fontSize="9.5" fill="#334155" fontFamily="monospace">{res}</text>
            <text x={28 + i * 200} y="291" fontSize="8" fill="#64748b" fontFamily="monospace">{who}</text>
          </g>
        ))}
      </svg>
    ),
    svgCaption: "The recursion tree for mergesort's `2T(n/2) + n`: the root does `n` work, its two children do `n/2` each (`n` total), the next level four `n/4`'s (`n` again), and so on — every one of the `log₂ n` levels costs `n`, summing to `n log n`. That is Case 2 of the Master Theorem, which classifies any `a·T(n/b)+f(n)` by whether the leaves, the levels, or the root carries the weight.",
    cols: ['Recurrence', 'Solution', 'Example'],
    complexity: [
      { op: 'T(n/2) + O(1)', time: 'Θ(log n)', space: 'binary search' },
      { op: '2T(n/2) + O(n)', time: 'Θ(n log n)', space: 'mergesort' },
      { op: '2T(n/2) + O(1)', time: 'Θ(n)', space: 'tree traversal' },
      { op: '3T(n/2) + O(n)', time: 'Θ(n^1.585)', space: 'Karatsuba' },
      { op: '7T(n/2) + O(n²)', time: 'Θ(n^2.807)', space: 'Strassen' },
    ],
    breaks: [
      { name: 'Applying it to the wrong recurrence shape', body: "The Master Theorem only covers `a·T(n/b) + f(n)` with constant `a` and `b > 1`. Recurrences that *subtract* (`T(n) = T(n−1) + n`) or split unevenly (`T(n) = T(n/3) + T(2n/3) + n`) are outside it — solve those with the recursion-tree method or the Akra-Bazzi theorem." },
      { name: 'The gap between cases', body: "If `f(n)` exceeds the watershed but only by a non-polynomial factor (a stray `log n`, say), it falls between Case 2 and Case 3 and none of the three rules apply. Reach for the extended Master Theorem or draw the recursion tree and sum the levels directly." },
      { name: 'Misreading a, b, or f', body: "Counting subproblems wrong — treating mergesort as one recursive call, or forgetting the `Θ(n)` merge — yields a completely wrong bound. Identify `a` (how many recursive calls), `b` (the size-shrink factor), and `f(n)` (all non-recursive work in one call) carefully before plugging in." },
    ],
    code: [
      `def karatsuba(x, y):
    if x < 10 or y < 10:
        return x * y                         # base case
    m = max(len(str(x)), len(str(y))) // 2
    hi_x, lo_x = divmod(x, 10 ** m)
    hi_y, lo_y = divmod(y, 10 ** m)
    z0 = karatsuba(lo_x, lo_y)               # only 3 sub-mults, not 4
    z2 = karatsuba(hi_x, hi_y)               #  -> T(n) = 3T(n/2) + O(n)
    z1 = karatsuba(lo_x + hi_x, lo_y + hi_y) - z0 - z2
    return z2 * 10 ** (2 * m) + z1 * 10 ** m + z0

print(karatsuba(1234, 5678), 1234 * 5678)    # 7006652 7006652`,
      `import math

def master(a, b, d):                          # T(n) = a*T(n/b) + Theta(n^d)
    crit = math.log(a, b)                     # exponent of the watershed
    if d < crit - 1e-9:
        return f"Theta(n^{crit:.3f})        [case 1: leaves dominate]"
    if abs(d - crit) < 1e-9:
        return f"Theta(n^{d} log n)         [case 2: balanced]"
    return f"Theta(n^{d})                  [case 3: root dominates]"

print("binary search:", master(1, 2, 0))      # log n   (n^0 log n)
print("mergesort    :", master(2, 2, 1))      # n log n
print("Karatsuba    :", master(3, 2, 1))      # n^1.585
print("Strassen     :", master(7, 2, 2))      # n^2.807`,
    ],
    mentalModel: "Divide-and-conquer is delegation: split the job, hand each piece to a clone of yourself, then stitch the answers back together. The Master Theorem only asks one thing about the org chart — does the real work happen at the top while combining, spread evenly across every layer, or down among the countless tiny leaves? Whichever layer is heaviest sets the total bill.",
  },
  {
    num: 24,
    part: 7,
    title: 'Dynamic Programming — Solving Each Subproblem Once',
    coreIdea: "Dynamic programming turns an exponential recursion into a polynomial one whenever a problem has *overlapping subproblems* (the same sub-call recurs constantly) and *optimal substructure* (the best answer is built from best sub-answers) — by computing each distinct subproblem a single time and reusing the stored result everywhere it reappears.",
    explanation: [
      "DP applies exactly when two conditions hold. First, overlapping subproblems: a naive recursion keeps re-solving the *same* smaller instances — naive Fibonacci recomputes `fib(3)` and `fib(2)` an exponential number of times — so caching each result collapses the work. Second, optimal substructure: an optimal solution to the whole is assembled from optimal solutions to its parts, which is what lets you combine sub-answers at all. Given both, there are two equivalent implementations. *Memoization* (top-down) keeps the natural recursion but caches each result in a table keyed by the subproblem, so each state is computed once and only the states you actually reach get computed. *Tabulation* (bottom-up) fills a table iteratively from the base cases in an order where every dependency is already known, avoiding recursion entirely and often enabling space savings.",
      "The craft of DP is two definitions: the *state* — the minimal set of parameters that uniquely identifies a subproblem — and the *transition* — the recurrence expressing a state in terms of smaller ones. Get those right and the rest is mechanical. The classic examples each have a characteristic state: Fibonacci is one index, 0/1 knapsack is `(item index, remaining capacity)`, longest common subsequence and edit distance are `(position in string A, position in string B)`, coin change is the target amount. Because many transitions depend only on the previous row or two, a frequent final optimization drops the table from `Θ(n·m)` to `Θ(m)` space by keeping just the recent slices. The dependency graph of subproblems must be acyclic — that is precisely why you can order the computation — and the two most common mistakes are forgetting a parameter the subproblem actually depends on, and assuming optimal substructure for a problem that lacks it.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Fibonacci naive recursion tree versus DP table">
        <defs>
          <marker id="dpArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f43f5e" /></marker>
        </defs>
        <text x="20" y="14" fontSize="11" fontWeight="700" fill="#be123c" fontFamily="monospace">NAIVE fib(5) · same subproblems recomputed → exponential</text>
        {[[160, 50, 95, 90], [160, 50, 235, 90], [95, 98, 55, 138], [95, 98, 135, 138], [235, 98, 200, 138], [235, 98, 285, 138]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbcfe8" strokeWidth="1.6" />
        ))}
        {[
          ['f(5)', 160, 50, 'none'], ['f(4)', 95, 90, 'none'], ['f(3)', 235, 90, 'dup3'],
          ['f(3)', 55, 138, 'dup3'], ['f(2)', 135, 138, 'dup2'], ['f(2)', 200, 138, 'dup2'], ['f(1)', 285, 138, 'none'],
        ].map(([v, x, y, dup], i) => {
          const map = { none: ['#ffe4e6', '#f43f5e', '#be123c'], dup3: ['#fef3c7', '#f59e0b', '#b45309'], dup2: ['#dbeafe', '#3b82f6', '#1e40af'] };
          const [f, s, t] = map[dup];
          return (
            <g key={i}>
              <rect x={x - 22} y={y} width="44" height="26" rx="4" fill={f} stroke={s} strokeWidth="1.3" />
              <text x={x} y={Number(y) + 17} fontSize="11" fill={t} textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
            </g>
          );
        })}
        <text x="40" y="182" fontSize="9" fill="#b45309" fontFamily="monospace">f(3) built 2× (amber)</text>
        <text x="40" y="196" fontSize="9" fill="#1e40af" fontFamily="monospace">f(2) built 3× (blue) → work explodes</text>

        <line x1="330" y1="28" x2="330" y2="208" stroke="#e2e8f0" strokeWidth="1" />
        <text x="346" y="44" fontSize="10.5" fontWeight="700" fill="#be123c" fontFamily="monospace">DP TABLE · each state once → O(n)</text>
        {[0, 1, 1, 2, 3, 5].map((v, i) => (
          <g key={i}>
            <rect x={358 + i * 42} y="60" width="38" height="30" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.3" />
            <text x={377 + i * 42} y="80" fontSize="13" fill="#be123c" textAnchor="middle" fontFamily="monospace" fontWeight="700">{v}</text>
            <text x={377 + i * 42} y="102" fontSize="8.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">dp[{i}]</text>
          </g>
        ))}
        <path d="M545,60 C 540,40 480,40 462,58" fill="none" stroke="#f43f5e" strokeWidth="1.3" markerEnd="url(#dpArr)" />
        <path d="M545,60 C 530,30 440,30 420,58" fill="none" stroke="#f43f5e" strokeWidth="1.3" markerEnd="url(#dpArr)" />
        <text x="470" y="126" fontSize="9.5" fill="#9f1239" textAnchor="middle" fontFamily="monospace">transition: dp[i] = dp[i−1] + dp[i−2]</text>
        <text x="470" y="142" fontSize="9" fill="#64748b" textAnchor="middle" fontFamily="monospace">fill 0→n once; keep 2 vars → O(1) space</text>

        <line x1="20" y1="222" x2="620" y2="222" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="242" fontSize="9.5" fill="#475569" fontFamily="monospace">Needs OVERLAPPING SUBPROBLEMS + OPTIMAL SUBSTRUCTURE.</text>
        <text x="20" y="262" fontSize="9.5" fill="#475569" fontFamily="monospace">Memoization (top-down cache) ≡ Tabulation (bottom-up fill).</text>
        <text x="20" y="282" fontSize="9.5" fill="#be123c" fontFamily="monospace" fontWeight="700">The whole craft: define the STATE (what identifies a subproblem) and the TRANSITION.</text>
      </svg>
    ),
    svgCaption: "Left: the naive `fib(5)` tree rebuilds `f(3)` twice (amber) and `f(2)` three times (blue) — the overlap that makes plain recursion exponential. Right: DP stores each `dp[i]` once and reuses it; the transition `dp[i] = dp[i−1] + dp[i−2]` fills the table left-to-right in `O(n)`, and keeping only the last two values drops it to `O(1)` space.",
    cols: ['Problem', 'Naive recursion', 'With DP'],
    complexity: [
      { op: 'Fibonacci', time: 'Θ(φⁿ)', space: 'Θ(n)' },
      { op: '0/1 Knapsack', time: 'Θ(2ⁿ)', space: 'Θ(n · W)' },
      { op: 'Longest common subseq.', time: 'Θ(2ⁿ)', space: 'Θ(m · n)' },
      { op: 'Edit distance', time: 'Θ(3ⁿ)', space: 'Θ(m · n)' },
      { op: 'Coin change', time: 'exponential', space: 'Θ(n · amount)' },
    ],
    breaks: [
      { name: 'No caching on overlapping calls', body: "Leaving a recursion that revisits the same subproblems uncached keeps it exponential — naive Fibonacci or knapsack will hang on modest inputs. Add a memoization cache keyed by the subproblem, or rewrite as a bottom-up table; either makes each state cost-once." },
      { name: 'Assuming optimal substructure that is not there', body: "DP only works if optimal sub-answers compose into an optimal whole — and some problems fail this, like the longest *simple* path in a general graph (NP-hard), where subpaths cannot be freely combined without repeating vertices. Confirm the substructure property before committing to a DP formulation." },
      { name: 'An incomplete state', body: "Omitting a parameter that actually distinguishes subproblems — keying knapsack on item index but not remaining capacity — corrupts the cache and yields wrong answers, as does filling the table in an order where a needed dependency isn't ready. Put every relevant parameter in the state key and compute in dependency order." },
    ],
    code: [
      `from functools import lru_cache

@lru_cache(maxsize=None)                      # memoization: top-down cache
def fib_memo(n):
    if n < 2:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)  # each n computed exactly once

def fib_tab(n):                               # tabulation: bottom-up, O(1) space
    if n < 2:
        return n
    prev, cur = 0, 1
    for _ in range(2, n + 1):
        prev, cur = cur, prev + cur           # keep only the last two states
    return cur

print(fib_memo(50), fib_tab(50))              # 12586269025 12586269025`,
      `def knapsack_01(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]    # state: (item i, capacity w)
    for i in range(1, n + 1):
        wi, vi = weights[i - 1], values[i - 1]
        for w in range(W + 1):
            dp[i][w] = dp[i - 1][w]                # transition: skip item i...
            if wi <= w:                            # ...or take it if it fits
                dp[i][w] = max(dp[i][w], dp[i - 1][w - wi] + vi)
    return dp[n][W]

w = [2, 3, 4, 5]
v = [3, 4, 5, 6]
print(knapsack_01(w, v, 5))                    # 7  (items of weight 2 + 3)`,
    ],
    mentalModel: "Dynamic programming is finishing a giant jigsaw without ever assembling the same corner twice. Naive recursion keeps rebuilding identical chunks from scratch; DP builds each chunk once and writes it into a table it can glance at forever after. The entire art is naming the chunks — the state — and knowing how the big ones are assembled from smaller ones — the transition.",
  },
  {
    num: 25,
    part: 7,
    title: 'Greedy Algorithms — Commit Locally, Never Look Back',
    coreIdea: "A greedy algorithm builds an answer by repeatedly taking the best-looking option right now and never reconsidering it — blazingly fast and simple, but provably optimal only when the problem has the *greedy-choice property* (a safe local choice always leads to a global optimum); without it, greedy returns a fast but wrong answer and you must fall back to DP.",
    explanation: [
      "Where dynamic programming compares sub-solutions before committing, a greedy algorithm commits immediately: at each step it makes the locally optimal choice and moves on, never backtracking. That makes it a single fast pass with no table to fill, but it is correct only for problems with two properties. The first is the *greedy-choice property* — there exists a locally optimal choice that is part of some globally optimal solution, so making it never closes off the optimum. The second is *optimal substructure*, shared with DP — once you fix the greedy choice, the remaining subproblem's optimal solution combines with it. When both hold, you can usually prove correctness with an *exchange argument* (show any optimal solution can be transformed, without loss, into one that agrees with the greedy choice) or via matroid theory, and greedy beats DP because it skips the comparison entirely.",
      "The catch is that the *criterion* must be the right one, and many natural-seeming criteria are wrong. Activity selection — choose the most non-overlapping intervals — is optimal when you sort by earliest *finish* time, but sorting by earliest start or shortest duration gives fewer activities. Other provably-correct greedies include Huffman coding (repeatedly merge the two least-frequent symbols into an optimal prefix code), fractional knapsack (take the highest value-per-weight first), and the graph algorithms you have already seen — Dijkstra, Prim, and Kruskal are all greedy. But the property genuinely fails for others: 0/1 knapsack cannot take fractions, so the greedy ratio overcommits and needs DP; and coin change with a non-canonical denomination set, like making 6 from `{1, 3, 4}`, makes greedy grab a 4 and finish at three coins when two threes would do. The discipline is therefore: verify the greedy-choice property *before* trusting the speed, and reach for DP when it is absent.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Activity selection greedy and a coin-change counterexample">
        <text x="20" y="14" fontSize="11" fontWeight="700" fill="#be123c" fontFamily="monospace">WHEN GREEDY WORKS · activity selection: sort by earliest FINISH, take non-overlapping</text>
        {/* timeline axis */}
        <line x1="60" y1="170" x2="600" y2="170" stroke="#cbd5e1" strokeWidth="1.2" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
          <g key={t}>
            <line x1={60 + t * 54} y1="166" x2={60 + t * 54} y2="174" stroke="#cbd5e1" strokeWidth="1" />
            <text x={60 + t * 54} y="186" fontSize="8.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{t}</text>
          </g>
        ))}
        {[
          ['A', 1, 3, 40, true], ['B', 2, 5, 66, false], ['C', 4, 7, 92, true], ['D', 6, 8, 118, false], ['E', 8, 9, 144, true],
        ].map(([name, s, e, y, pick], i) => {
          const [f, st, tx] = pick ? ['#d1fae5', '#10b981', '#047857'] : ['#f1f5f9', '#cbd5e1', '#94a3b8'];
          return (
            <g key={i}>
              <rect x={60 + s * 54} y={y} width={(e - s) * 54} height="18" rx="3" fill={f} stroke={st} strokeWidth="1.4" strokeDasharray={pick ? '0' : '4 3'} />
              <text x={60 + s * 54 + (e - s) * 27} y={y + 13} fontSize="10" fill={tx} textAnchor="middle" fontFamily="monospace" fontWeight="700">{name}</text>
              <text x={48} y={y + 13} fontSize="8.5" fill={tx} textAnchor="end" fontFamily="monospace">{pick ? '✓' : '✗'}</text>
            </g>
          );
        })}
        <text x="60" y="206" fontSize="9" fill="#047857" fontFamily="monospace">picked A, C, E (3) · rejected B, D (overlap) → provably maximal</text>

        <line x1="20" y1="218" x2="620" y2="218" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="238" fontSize="11" fontWeight="700" fill="#be123c" fontFamily="monospace">WHEN GREEDY FAILS · coins {'{1, 3, 4}'}, make 6</text>
        {/* greedy row */}
        <text x="20" y="262" fontSize="9.5" fill="#b91c1c" fontFamily="monospace">greedy:</text>
        {[['4', 0], ['1', 1], ['1', 2]].map(([c, i], k) => (
          <g key={k}>
            <rect x={86 + i * 44} y="250" width="38" height="22" rx="3" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.3" />
            <text x={105 + i * 44} y="265" fontSize="11" fill="#b91c1c" textAnchor="middle" fontFamily="monospace" fontWeight="700">{c}</text>
          </g>
        ))}
        <text x="232" y="265" fontSize="10" fill="#b91c1c" fontFamily="monospace" fontWeight="700">= 3 coins ✗</text>
        {/* optimal row */}
        <text x="20" y="292" fontSize="9.5" fill="#047857" fontFamily="monospace">optimal:</text>
        {[['3', 0], ['3', 1]].map(([c, i], k) => (
          <g key={k}>
            <rect x={86 + i * 44} y="280" width="38" height="22" rx="3" fill="#d1fae5" stroke="#10b981" strokeWidth="1.3" />
            <text x={105 + i * 44} y="295" fontSize="11" fill="#047857" textAnchor="middle" fontFamily="monospace" fontWeight="700">{c}</text>
          </g>
        ))}
        <text x="188" y="295" fontSize="10" fill="#047857" fontFamily="monospace" fontWeight="700">= 2 coins ✓</text>
        <text x="360" y="276" fontSize="9" fill="#475569" fontFamily="monospace">grabbing the 4 leaves a</text>
        <text x="360" y="292" fontSize="9" fill="#475569" fontFamily="monospace">worse remainder → use DP</text>
      </svg>
    ),
    svgCaption: "Top — greedy *succeeds*: scanning activities by earliest finish time and taking each one that doesn't overlap the last yields the maximum set `{A, C, E}`, and an exchange argument proves no schedule fits more. Bottom — greedy *fails*: to make 6 from `{1, 3, 4}` the greedy grab of the largest coin (4) forces `4+1+1` = three coins, while the optimum `3+3` uses two — the denomination set lacks the greedy-choice property, so DP is required.",
    cols: ['Greedy problem', 'Time', 'Optimal?'],
    complexity: [
      { op: 'Activity selection', time: 'Θ(n log n)', space: 'yes ✓' },
      { op: 'Huffman coding', time: 'Θ(n log n)', space: 'yes ✓' },
      { op: 'Fractional knapsack', time: 'Θ(n log n)', space: 'yes ✓' },
      { op: 'Dijkstra / Prim / Kruskal', time: 'Θ(E log V)', space: 'yes ✓' },
      { op: 'Coin change (arbitrary)', time: 'Θ(n)', space: 'NO ✗ → DP' },
      { op: '0/1 knapsack', time: '—', space: 'NO ✗ → DP' },
    ],
    breaks: [
      { name: 'Greedy on a problem without the property', body: "0/1 knapsack cannot split items, so taking the best value-per-weight ratio first can leave capacity that a different combination would have filled more valuably — greedy returns a suboptimal pack. Only the *fractional* knapsack is greedy-safe; the 0/1 version needs the DP table from the previous chapter." },
      { name: 'The wrong greedy criterion', body: "Activity selection by earliest finish is optimal, but sorting the same intervals by earliest start or shortest duration quietly selects fewer activities. Never trust a greedy ordering on intuition — prove it with an exchange argument (or identify the matroid) before relying on it." },
      { name: 'Non-canonical coin systems', body: "Greedy coin change is optimal only for canonical denomination sets (like `1, 5, 10, 25`); with sets such as `{1, 3, 4}` — or a normal set with one coin removed — greedy overshoots the minimum count. Use the DP coin-change recurrence (`Θ(n · amount)`), or first verify the system is canonical." },
    ],
    code: [
      `def activity_selection(activities):           # activities: list of (start, finish)
    chosen = []
    last_finish = float('-inf')
    for start, finish in sorted(activities, key=lambda a: a[1]):  # earliest finish
        if start >= last_finish:                  # no overlap with the last pick
            chosen.append((start, finish))
            last_finish = finish                  # commit, never reconsider
    return chosen

acts = [(1, 3), (2, 5), (4, 7), (6, 8), (8, 9)]
print(activity_selection(acts))   # [(1, 3), (4, 7), (8, 9)] -> 3 activities`,
      `def coin_greedy(coins, amount):               # take the largest coin that fits
    count, remaining = 0, amount
    for c in sorted(coins, reverse=True):
        while remaining >= c:
            remaining -= c; count += 1
    return count if remaining == 0 else None

def coin_dp(coins, amount):                   # bottom-up optimum
    INF = float('inf')
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != INF else None

print(coin_greedy([1, 3, 4], 6), coin_dp([1, 3, 4], 6))   # 3  2  (greedy is wrong)`,
    ],
    mentalModel: "A greedy algorithm is someone filling a plate at a buffet by always grabbing the most appealing dish in front of them and never putting anything back. When the buffet is arranged so each best-looking grab leaves the best remaining options — the greedy-choice property — they assemble the perfect meal in one quick pass. When it isn't, taking the big shrimp now means missing two lobsters later, and they stride off confidently with the wrong plate.",
  },
  {
    num: 26,
    part: 7,
    title: 'Probabilistic Structures — Skip Lists & Bloom Filters',
    coreIdea: "Two structures buy speed or space by trading away a sliver of certainty: a skip list layers express lanes over a sorted list for *expected* `O(log n)` search without any tree rotations, and a Bloom filter packs set membership into a tiny bit array that never reports a false negative but occasionally a false positive.",
    explanation: [
      "A skip list is a randomized alternative to a balanced tree. It is a sorted linked list with extra levels of express lanes: level 0 contains every element, and each node is independently promoted to the next level up with probability `p` (usually 1/2), so higher levels hold geometrically fewer nodes. To search, you start at the top-left, move right along a lane until the next node would overshoot the target, then drop down one level and repeat — the sparse upper lanes let you leap over large stretches, giving *expected* `O(log n)` search, insert, and delete. Crucially that bound is expected over the random promotions, not a worst-case guarantee, but the probability of significant degradation is astronomically small with good randomness. Skip lists are far simpler to implement than red-black or AVL trees (no rotations), support range queries naturally, and parallelize well — which is why Redis sorted sets, the LevelDB/RocksDB memtable, and Java's `ConcurrentSkipListMap` all use them.",
      "A Bloom filter answers set membership in tiny space by tolerating false positives. It is a bit array of `m` bits plus `k` independent hash functions. To insert `x`, you set the `k` bits at positions `h₁(x) … hₖ(x)`; to query `x`, you check those same `k` bits. If *any* is 0, `x` is **definitely not** in the set — there are no false negatives — and if *all* are 1, `x` is **probably** present, the catch being those bits may have been set by other elements, producing a false positive. The false-positive rate is tunable: for `n` elements and target rate `p`, the optimal sizing is `m = −n·ln p / (ln 2)²` bits and `k = (m/n)·ln 2` hashes, often just a handful of bits per element versus storing the keys themselves. The cost of that compression is that you cannot delete from a plain Bloom filter — clearing an element's bits would also clear bits shared with others — so deletion requires a counting Bloom filter with small per-slot counters. Databases like Bigtable, Cassandra, and RocksDB use Bloom filters to skip disk lookups for absent keys, and they appear in web caches, routers, and spell checkers.",
    ],
    svg: (
      <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Skip list search path and Bloom filter insert and query">
        <defs>
          <marker id="slPath" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" /></marker>
          <marker id="slLane" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 Z" fill="#cbd5e1" /></marker>
        </defs>
        <text x="20" y="14" fontSize="11" fontWeight="700" fill="#be123c" fontFamily="monospace">SKIP LIST · express lanes; search 17 drops down levels (amber path)</text>
        {(() => {
          const xs = [70, 134, 198, 262, 326, 390, 454, 518];
          const vals = [1, 4, 7, 9, 12, 17, 20, 25];
          const levels = { 0: [0, 1, 2, 3, 4, 5, 6, 7], 1: [0, 2, 4, 6], 2: [0, 4] };
          const ys = { 0: 130, 1: 92, 2: 54 };
          const out = [];
          // lane arrows (gray) between consecutive present nodes per level
          [0, 1, 2].forEach((L) => {
            const cols = levels[L];
            for (let i = 0; i < cols.length - 1; i++) {
              out.push(<line key={'l' + L + i} x1={xs[cols[i]] + 14} y1={ys[L]} x2={xs[cols[i + 1]] - 14} y2={ys[L]} stroke="#cbd5e1" strokeWidth="1.3" markerEnd="url(#slLane)" />);
            }
          });
          // vertical connectors for multi-level values
          [0, 4].forEach((c) => out.push(<line key={'v' + c} x1={xs[c]} y1="64" x2={xs[c]} y2="120" stroke="#e2e8f0" strokeWidth="1" />));
          [2, 6].forEach((c) => out.push(<line key={'v' + c} x1={xs[c]} y1="102" x2={xs[c]} y2="120" stroke="#e2e8f0" strokeWidth="1" />));
          // search path: L2 1->12, drop, L1 12 drop, L0 12->17
          out.push(<line key="p1" x1={xs[0] + 14} y1="54" x2={xs[4] - 14} y2="54" stroke="#f59e0b" strokeWidth="2.4" markerEnd="url(#slPath)" />);
          out.push(<line key="p2" x1={xs[4]} y1="64" x2={xs[4]} y2="82" stroke="#f59e0b" strokeWidth="2.4" markerEnd="url(#slPath)" />);
          out.push(<line key="p3" x1={xs[4]} y1="102" x2={xs[4]} y2="120" stroke="#f59e0b" strokeWidth="2.4" markerEnd="url(#slPath)" />);
          out.push(<line key="p4" x1={xs[4] + 14} y1="130" x2={xs[5] - 14} y2="130" stroke="#f59e0b" strokeWidth="2.4" markerEnd="url(#slPath)" />);
          // nodes
          [0, 1, 2].forEach((L) => {
            levels[L].forEach((c) => {
              const onPath = (L === 2 && (c === 0 || c === 4)) || (L === 1 && c === 4) || (L === 0 && (c === 4 || c === 5));
              const found = L === 0 && c === 5;
              out.push(
                <g key={'n' + L + c}>
                  <rect x={xs[c] - 14} y={ys[L] - 11} width="28" height="22" rx="3" fill={found ? '#d1fae5' : onPath ? '#fef3c7' : '#ffe4e6'} stroke={found ? '#10b981' : onPath ? '#f59e0b' : '#fb7185'} strokeWidth="1.4" />
                  <text x={xs[c]} y={ys[L] + 4} fontSize="10.5" fill={found ? '#047857' : onPath ? '#b45309' : '#be123c'} textAnchor="middle" fontFamily="monospace" fontWeight="700">{vals[c]}</text>
                </g>
              );
            });
          });
          ['L2', 'L1', 'L0'].forEach((lab, i) => out.push(<text key={'lab' + i} x="30" y={[58, 96, 134][i]} fontSize="8.5" fill="#94a3b8" fontFamily="monospace">{lab}</text>));
          return out;
        })()}
        <text x="70" y="156" fontSize="9" fill="#b45309" fontFamily="monospace">ride top lane, drop down near the target → 17 found in 3 hops, not 5</text>

        <line x1="20" y1="172" x2="620" y2="172" stroke="#e2e8f0" strokeWidth="1" />
        <text x="20" y="192" fontSize="11" fontWeight="700" fill="#be123c" fontFamily="monospace">BLOOM FILTER · m bits, k hashes — insert sets bits, query checks them</text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((b) => {
          const set = [1, 4, 7, 9, 11].includes(b);
          return (
            <g key={b}>
              <rect x={70 + b * 40} y="204" width="36" height="26" rx="3" fill={set ? '#ffe4e6' : '#f8fafc'} stroke={set ? '#f43f5e' : '#cbd5e1'} strokeWidth="1.3" />
              <text x={88 + b * 40} y="221" fontSize="11" fill={set ? '#be123c' : '#cbd5e1'} textAnchor="middle" fontFamily="monospace" fontWeight="700">{set ? '1' : '0'}</text>
              <text x={88 + b * 40} y="242" fontSize="7.5" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{b}</text>
            </g>
          );
        })}
        <text x="70" y="262" fontSize="9" fill="#475569" fontFamily="monospace">insert cat → {'{1,4,9}'} · insert dog → {'{4,7,11}'}  (bit 4 shared)</text>
        <text x="70" y="280" fontSize="9" fill="#047857" fontFamily="monospace">query cat → 1,4,9 all set → maybe present ✓   ·   query owl → bit 2 = 0 → definitely absent ✓</text>
        <text x="70" y="298" fontSize="9" fill="#b91c1c" fontFamily="monospace" fontWeight="700">query fox (never added) → 4,7,9 all set → FALSE POSITIVE ✗  (no false negatives, ever)</text>
      </svg>
    ),
    svgCaption: "Top: a skip list searching for 17 — it rides the sparse top lane from 1 to 12, drops to level 1, drops again to level 0, then steps right to 17, touching far fewer nodes than the full list. Bottom: a Bloom filter after inserting `cat`→{1,4,9} and `dog`→{4,7,11}; `cat` and `owl` resolve correctly, but `fox` — never inserted — collides on bits already set, the unavoidable false positive. A 0 bit always means definitely-absent.",
    cols: ['Property', 'Skip list', 'Bloom filter'],
    complexity: [
      { op: 'Search / membership', time: 'O(log n) expected', space: 'O(k) ≈ O(1)' },
      { op: 'Insert', time: 'O(log n) expected', space: 'O(k)' },
      { op: 'Delete', time: 'O(log n) expected', space: 'unsupported → counting' },
      { op: 'Space', time: 'O(n) + pointers', space: 'O(m) bits, ~few/elem' },
      { op: 'Exactness', time: 'exact, ordered', space: 'false positives possible' },
    ],
    breaks: [
      { name: 'Trusting a Bloom "present" as certain', body: "A positive result can be a false positive, so using it where correctness depends on it — 'the filter says this key exists, skip the database' returning phantom data — is a bug. Treat a positive as 'maybe, verify against the source of truth'; only the *negative* answer ('definitely absent') is guaranteed." },
      { name: 'Deleting from a plain Bloom filter', body: "Clearing an element's `k` bits also clears bits it shares with other elements, which then start reporting absent — introducing false negatives and corrupting unrelated keys. Never reset bits in a standard Bloom filter; if deletion is required, use a counting Bloom filter whose slots are small counters you increment and decrement." },
      { name: 'Under-sizing m or choosing k poorly', body: "Too few bits or the wrong number of hash functions drives the false-positive rate toward 1 — a saturated, mostly-ones array answers 'yes' to everything. Size the filter from the expected count `n` and target rate `p`: `m = −n·ln p / (ln 2)²` bits and `k = (m/n)·ln 2` hashes." },
    ],
    code: [
      `import random

class SkipList:
    def __init__(self, max_level=16, p=0.5):
        self.max_level, self.p = max_level, p
        self.head = [None] * max_level        # head's forward pointers
        self.level = 1

    def _random_level(self):
        lvl = 1
        while random.random() < self.p and lvl < self.max_level:
            lvl += 1                          # coin flips -> geometric heights
        return lvl

    def insert(self, val):
        update = [None] * self.max_level
        node = self.head
        for i in range(self.level - 1, -1, -1):
            while node[i] and node[i][0] < val:
                node = node[i]                # move right on the lane
            update[i] = node                  # where we dropped down
        lvl = self._random_level()
        self.level = max(self.level, lvl)
        new = [val] + [None] * lvl            # new[0]=value, new[1..]=pointers
        for i in range(lvl):
            target = update[i] if update[i] else self.head
            new[i + 1] = target[i] if update[i] else self.head[i]
            (update[i] if update[i] else self.head)[i] = new

    def search(self, val):
        node = self.head
        for i in range(self.level - 1, -1, -1):
            while node[i] and node[i][0] < val:
                node = node[i]                # skip ahead, then drop a level
        nxt = node[0]
        return nxt is not None and nxt[0] == val

sl = SkipList()
for v in [1, 4, 7, 9, 12, 17, 20, 25]:
    sl.insert(v)
print(sl.search(17), sl.search(8))            # True False`,
      `import hashlib, math

class BloomFilter:
    def __init__(self, n, p=0.01):                       # n items, target FP rate
        self.m = max(8, int(-n * math.log(p) / math.log(2) ** 2))
        self.k = max(1, round(self.m / n * math.log(2)))
        self.bits = bytearray((self.m + 7) // 8)

    def _indices(self, item):                            # double hashing -> k bits
        d = item.encode()
        h1 = int.from_bytes(hashlib.md5(d).digest()[:8], 'big')
        h2 = int.from_bytes(hashlib.sha1(d).digest()[:8], 'big')
        return [(h1 + i * h2) % self.m for i in range(self.k)]

    def add(self, item):
        for idx in self._indices(item):
            self.bits[idx >> 3] |= 1 << (idx & 7)

    def __contains__(self, item):                        # False = definitely absent
        return all(self.bits[idx >> 3] & (1 << (idx & 7))
                   for idx in self._indices(item))

bf = BloomFilter(n=1000, p=0.01)
for w in ["cat", "dog", "bird"]:
    bf.add(w)
print("cat" in bf, "bird" in bf)              # True True  (never a false negative)
print("snake" in bf)                          # False  (almost surely; rarely a FP)`,
    ],
    mentalModel: "Both structures buy speed or space by trading a sliver of certainty. A skip list is an express-lane highway — the ground road stops at every exit, but the upper lanes skip most, so you ride high until you're about to overshoot, then drop a lane at a time, reaching any exit in a handful of hops. A Bloom filter is a bouncer's smudged guest list: if a name's marks aren't all there the person is *definitely* not invited, but because names share smudges the bouncer occasionally waves through a gate-crasher — never turning away a real guest, only sometimes admitting a fake one.",
  },
  /* __INSERT_CHAPTERS__ */
];

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [selected, setSelected] = useState(1);
  const [mastered, setMastered] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(() => new Set());
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [selected]);

  const ordered = [...CHAPTERS].sort((a, b) => a.num - b.num);
  const chapter = ordered.find((c) => c.num === selected) || ordered[0];
  const pmeta = partOf(chapter.part);

  function goTo(num) {
    setMastered((prev) => {
      const s = new Set(prev);
      s.add(selected);
      return s;
    });
    setSelected(num);
  }
  function togglePart(id) {
    setCollapsed((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  const q = query.trim().toLowerCase();
  const idx = ordered.findIndex((c) => c.num === selected);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx < ordered.length - 1 ? ordered[idx + 1] : null;
  const pct = Math.round((mastered.size / Math.max(ordered.length, 1)) * 100);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: uiFont, color: '#0f172a', background: '#fff' }}>
      {/* ============ SIDEBAR ============ */}
      <aside style={{
        width: 260, minWidth: 260, borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', background: '#fafafa',
      }}>
        <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid #eef2f6' }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>
            DSA <span style={{ color: '#64748b', fontWeight: 600 }}>Under the Hood</span>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, lineHeight: 1.4 }}>
            How the structures are laid out in memory and how the algorithms run.
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters…"
            style={{
              width: '100%', boxSizing: 'border-box', marginTop: 12,
              padding: '7px 10px', fontSize: 13, border: '1px solid #e2e8f0',
              borderRadius: 6, outline: 'none', background: '#fff', fontFamily: uiFont,
            }}
          />
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 5 }}>
              <span style={{ fontFamily: monoFont }}>{mastered.size} / {ordered.length} mastered</span>
              <span style={{ fontFamily: monoFont }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: 6, width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#10b981)', borderRadius: 99, transition: 'width .35s ease' }} />
            </div>
          </div>
        </div>

        <nav style={{ overflowY: 'auto', padding: '6px 8px 24px', flex: 1 }}>
          {PARTS.map((part) => {
            const chs = ordered.filter((c) => c.part === part.id);
            const visible = chs.filter((c) => !q || c.title.toLowerCase().includes(q) || String(c.num) === q);
            if (q && visible.length === 0) return null;
            const isCollapsed = collapsed.has(part.id) && !q;
            return (
              <div key={part.id} style={{ marginBottom: 2 }}>
                <button
                  onClick={() => togglePart(part.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 8px', border: 'none', background: 'transparent',
                    cursor: 'pointer', textAlign: 'left', borderRadius: 6, fontFamily: uiFont,
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: part.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#475569', flex: 1 }}>
                    Part {part.id} · {part.label}
                  </span>
                  <span style={{ fontSize: 9, color: '#94a3b8', transform: isCollapsed ? 'rotate(-90deg)' : 'none', transition: 'transform .15s' }}>▾</span>
                </button>
                {!isCollapsed && visible.map((c) => {
                  const active = c.num === selected;
                  const done = mastered.has(c.num);
                  return (
                    <button
                      key={c.num}
                      onClick={() => goTo(c.num)}
                      style={{
                        width: '100%', display: 'flex', gap: 8, alignItems: 'flex-start',
                        padding: '6px 8px 6px 10px', marginLeft: 6, border: 'none',
                        borderLeft: `2px solid ${active ? part.color : 'transparent'}`,
                        background: active ? '#fff' : 'transparent', cursor: 'pointer',
                        textAlign: 'left', borderRadius: active ? '0 6px 6px 0' : 6,
                        boxShadow: active ? '0 1px 2px rgba(15,23,42,0.06)' : 'none', fontFamily: uiFont,
                      }}
                    >
                      <span style={{ fontSize: 11, fontFamily: monoFont, color: active ? part.color : '#94a3b8', fontWeight: active ? 700 : 500, width: 18, flexShrink: 0 }}>
                        {String(c.num).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: 12.5, lineHeight: 1.35, color: active ? '#0f172a' : '#475569', fontWeight: active ? 600 : 400, flex: 1 }}>
                        {shortTitle(c.title)}
                      </span>
                      {done && <span style={{ color: '#10b981', fontSize: 11, flexShrink: 0, fontWeight: 700 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ============ CONTENT ============ */}
      <main ref={contentRef} style={{ flex: 1, overflowY: 'auto' }}>
        <article style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px 96px', position: 'relative' }}>
          <div aria-hidden style={{
            position: 'absolute', top: 20, right: 18, fontSize: 130, fontWeight: 900,
            color: pmeta.color, opacity: 0.05, lineHeight: 1, pointerEvents: 'none',
            fontFamily: monoFont, userSelect: 'none',
          }}>
            {String(chapter.num).padStart(2, '0')}
          </div>

          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 0.7, color: '#fff', background: pmeta.color, padding: '4px 11px', borderRadius: 99,
          }}>
            Part {chapter.part} · {pmeta.label}
          </span>

          <h1 style={{ fontSize: 31, lineHeight: 1.18, margin: '14px 0 0', letterSpacing: -0.6, fontWeight: 800 }}>
            <span style={{ color: pmeta.color, fontFamily: monoFont, fontSize: 22, marginRight: 10 }}>
              {String(chapter.num).padStart(2, '0')}
            </span>
            {chapter.title}
          </h1>

          <div style={{ marginTop: 18, padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, color: pmeta.color }}>
              The core idea
            </span>
            <div style={{ marginTop: 4, color: '#1e293b', fontSize: 15.5, lineHeight: 1.6 }}>
              <RichText text={chapter.coreIdea} />
            </div>
          </div>

          <div style={{ marginTop: 26, fontSize: 16, lineHeight: 1.8, color: '#1e293b' }}>
            {chapter.explanation.map((p, i) => (
              <p key={i} style={{ margin: i ? '14px 0 0' : 0 }}><RichText text={p} /></p>
            ))}
          </div>

          <figure style={{ margin: '32px 0 0' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 16px', background: '#fff' }}>
              {chapter.svg}
            </div>
            <figcaption style={{ fontSize: 12.5, color: '#64748b', marginTop: 9, textAlign: 'center', lineHeight: 1.5 }}>
              <RichText text={chapter.svgCaption} />
            </figcaption>
          </figure>

          <h3 style={sectionH}>Complexity at a glance</h3>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={thStyle}>{(chapter.cols || ['Operation', 'Time', 'Space'])[0]}</th>
                  <th style={{ ...thStyle, fontFamily: monoFont }}>{(chapter.cols || ['Operation', 'Time', 'Space'])[1]}</th>
                  <th style={{ ...thStyle, fontFamily: monoFont }}>{(chapter.cols || ['Operation', 'Time', 'Space'])[2]}</th>
                </tr>
              </thead>
              <tbody>
                {chapter.complexity.map((r, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{r.op}</td>
                    <td style={{ ...tdStyle, fontFamily: monoFont, color: '#0f172a' }}>{r.time}</td>
                    <td style={{ ...tdStyle, fontFamily: monoFont, color: '#0f172a' }}>{r.space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 32, background: '#fef2f2', borderLeft: '3px solid #ef4444', borderRadius: '0 8px 8px 0', padding: '16px 18px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>
              Where it breaks
            </div>
            {chapter.breaks.map((b, i) => (
              <div key={i} style={{ marginTop: i ? 14 : 0, fontSize: 14.5, lineHeight: 1.65 }}>
                <span style={{ fontWeight: 700, color: '#991b1b' }}>{b.name}. </span>
                <span style={{ color: '#7f1d1d' }}><RichText text={b.body} /></span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, background: '#eff6ff', borderLeft: '3px solid #3b82f6', borderRadius: '0 8px 8px 0', padding: '16px 18px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
              See it in code
            </div>
            {chapter.code.map((snip, i) => (
              <div key={i} style={{ marginTop: i ? 14 : 0 }}><CodeBlock code={snip} /></div>
            ))}
          </div>

          <blockquote style={{
            margin: '32px 0 0', borderLeft: `4px solid ${pmeta.color}`, padding: '8px 0 8px 20px',
            fontStyle: 'italic', fontSize: 18, lineHeight: 1.6, color: '#334155',
          }}>
            <RichText text={chapter.mentalModel} />
          </blockquote>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 48, borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
            {prev ? (
              <button onClick={() => goTo(prev.num)} style={navBtn}>
                <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>← Prev</span>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{shortTitle(prev.title)}</div>
              </button>
            ) : <span style={{ flex: 1, maxWidth: '49%' }} />}
            {next ? (
              <button onClick={() => goTo(next.num)} style={{ ...navBtn, textAlign: 'right' }}>
                <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>Next →</span>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{shortTitle(next.title)}</div>
              </button>
            ) : <span style={{ flex: 1, maxWidth: '49%' }} />}
          </div>
        </article>
      </main>
    </div>
  );
}
