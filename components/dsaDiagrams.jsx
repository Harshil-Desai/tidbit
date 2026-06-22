import React from "react";

// Self-contained SVG diagrams for the Data Structures & Algorithms guide, ported
// verbatim from the source encyclopedia. Kept in a .jsx module (excluded from the
// TS `include`) because the SVGs use untyped inline data arrays. Imported by
// components/ConceptView.tsx via the FEATURED map.

function Figure({ children, caption }) {
  return (
    <figure style={{ margin: "0 0 8px" }}>
      <div style={{
        background: "var(--paper-2)", border: "1px solid var(--line)",
        borderRadius: "calc(var(--radius, 22px) * 0.7)", padding: "20px 16px",
      }}>
        {children}
      </div>
      {caption && (
        <figcaption style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginTop: "10px", textAlign: "center", fontStyle: "italic" }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export const dsaDiagrams = {
  "Asymptotic Analysis": () => (
      <Figure caption="The growth ladder: six classes plotted against input size. They start bunched near the origin and fan out brutally as n grows. The inset zooms into small n, where a small-constant O(n²) (green) sits below a large-constant O(n log n) (amber) until the crossover n₀ — at small scale, constants decide the winner, not the exponent.">
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
      </Figure>
  ),
  "The Machine Model": () => (
      <Figure caption="Left: the memory hierarchy, fast/small at top to slow/huge at the bottom. Right: the same O(n) work, two ways. The array scan (green) loads eight elements per 64-byte line and prefetches forward; the linked-list chase (red) hops to scattered addresses, missing cache on nearly every step.">
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
      </Figure>
  ),
  "Arrays & Dynamic Arrays": () => (
      <Figure caption="A full buffer (size == capacity) triggers a resize: a new block twice as large is allocated, all elements are copied (green), the new value lands in the first free slot (amber), and the spare slots absorb the next few appends for free. Because capacity doubles each time, the copies form a geometric series summing to about 2n — the source of O(1) amortized append.">
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
      </Figure>
  ),
  "Linked Lists": () => (
      <Figure caption="Top: three nodes at unrelated addresses, each pointing to the next, ending at null (∅). Middle: deleting the held middle node is O(1) — repoint A.next to C (green) and drop the old link (red); no elements shift. Bottom: a doubly linked list adds a prev pointer so a node can be unlinked without first walking the list to find what came before it.">
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
      </Figure>
  ),
  "Stacks, Queues, Deques & Ring Buffers": () => (
      <Figure caption="Top: a stack pushes/pops one end (LIFO); a queue enqueues at the back and dequeues at the front (FIFO). Bottom: a ring buffer stores the logical sequence a,b,c,d,e across wrapped indices 5,6,7,0,1. The head and tail cursors rotate with modular arithmetic so neither end ever shifts data — the dashed arc shows index 7 wrapping back to 0.">
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
      </Figure>
  ),
  "Hash Functions & Hash Tables": () => (
      <Figure caption="Each key is hashed to a big integer, then reduced modulo the capacity to a bucket index. owl and cat land alone; dog and fox both reduce to bucket 6 — a collision (amber), handled by the strategies in the next chapter. The load factor α tracks how full the table is and triggers a grow-and-rehash before collisions become common.">
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
      </Figure>
  ),
  "Collision Resolution": () => (
      <Figure caption="The same collision (dog and fox both hash to bucket 6), resolved two ways. Top: chaining hangs a list off bucket 6 — dog → fox → ∅. Bottom: open addressing keeps fox in the array by probing forward to slot 7; and because dog was deleted as a tombstone rather than blanked, a later lookup for fox still probes past slot 6 and finds it.">
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
      </Figure>
  ),
  "Binary Trees & Traversals": () => (
      <Figure caption="One tree, four visit orders. The depth-first orders differ only in when the node itself is emitted relative to its subtrees; note that inorder spells the values out alphabetically — the sorted-order property that makes inorder special for search trees. Level-order instead sweeps rank by rank using a queue.">
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
      </Figure>
  ),
  "Binary Search Trees": () => (
      <Figure caption="Left: searching for 7 descends the tree, comparing and discarding half the remaining keys at each step (amber path) — the halving behavior that gives O(h). Right: the same five keys inserted in sorted order build a one-sided chain of height n, with no rebalancing to save it — search is now a linear walk. Shape is dictated entirely by insertion order.">
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
      </Figure>
  ),
  "Self-Balancing Trees": () => (
      <Figure caption="A right rotation repairs a left-left imbalance: y rises into z's place, z descends to the right, and the middle subtree T2 is re-homed from y's right to z's left — three pointers, O(1), order preserved, height reduced. Below: AVL keeps subtree heights within one (tightest, read-optimal); red-black uses color rules for a looser bound with fewer rotations (write-optimal).">
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
      </Figure>
  ),
  "B-Trees & B+ Trees": () => (
      <Figure caption="Top: a B+ tree where the root holds only router keys (30, 60) and every value lives in a leaf; the leaves are chained (dashed blue) so a range query descends once then walks sideways. Bottom: inserting 25 overflows a full leaf, which splits in two and copies the median (30) up to the parent — and if the parent fills, the split cascades upward, the only way the tree gains height.">
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
      </Figure>
  ),
  "Heaps & Priority Queues": () => (
      <Figure caption="Top: the same min-heap as a tree and as the array [2,7,4,9,8,6,5] — the complete shape lets index arithmetic replace child pointers entirely. Bottom: inserting 1 appends it at index 7, then sifts it up the parent chain 7 → 3 → 1 → 0, swapping past each larger ancestor until it becomes the new root — one root-to-leaf path, O(log n).">
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
      </Figure>
  ),
  "Tries & Radix Trees": () => (
      <Figure caption="Left: a trie holding cat, car, card, dog — cat/car/card share the c-a path, and a green marker flags each word ending. Right: the radix-compressed form merges every run of single-child nodes into one substring-labeled edge, so the three-node d-o-g chain collapses to a single dog edge while every lookup still works identically.">
        <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Trie and its radix-compressed form">
          <text x="20" y="16" fontSize="11" fontWeight="700" fill="#6d28d9" fontFamily="monospace">TRIE · one node per char · ● = word end · lookup O(k)</text>
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
      </Figure>
  ),
  "Segment Trees & Fenwick Trees": () => (
      <Figure caption="Top: a sum segment tree over [3,1,4,1,5,9]; the query sum[1,4] does not scan four elements — it grabs the three precomputed nodes ([1:1], [2:2], [3:4]) that tile the interval, totaling 11. Bottom: a Fenwick tree where each index covers i & (−i) elements (its lowest set bit); a prefix query walks 7 → 6 → 4 → 0, stripping one bit per hop.">
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
      </Figure>
  ),
  "Comparison Sorts": () => (
      <Figure caption="Top: one quicksort partition splits the array around pivot 4 — everything smaller drifts left (green), everything larger right (blue), and the pivot drops into its permanent sorted position before the two sides recurse independently. Bottom: mergesort recursively halves down to singletons (blue, left), then merges adjacent sorted runs back up (green, right) into the fully ordered array.">
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
      </Figure>
  ),
  "Linear-Time Sorts": () => (
      <Figure caption="Top: counting sort tallies each value (amber), prefix-sums the counts into positions, and writes the output directly — no element is ever compared. Bottom: radix sort makes one stable pass per digit, least-significant first; after sorting on the ones digit and then the tens digit (highlighted), the array is fully ordered in just two passes.">
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
      </Figure>
  ),
  "Production Sorts": () => (
      <Figure caption="Top: Timsort breaks the array into natural runs — two ascending (green, blue) and one descending (red) that it reverses in place — then merges them with a balanced stack, galloping past any run that dominates. Bottom: Introsort defaults to quicksort but watches itself: too-deep recursion diverts a subarray to heapsort (guaranteed bound), and tiny subarrays divert to insertion sort (low overhead).">
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
      </Figure>
  ),
  "Graph Representations": () => (
      <Figure caption="One undirected graph in two storage forms. The adjacency matrix is a symmetric 4×4 grid — instant O(1) edge tests, but every cell exists even though most are zero. The adjacency list keeps only the real neighbors per vertex — compact O(V+E) space and fast neighbor iteration, at the cost of an O(deg) scan to test one specific edge.">
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
      </Figure>
  ),
  "Graph Traversal": () => (
      <Figure caption="The identical graph from A under both traversals. BFS (left) pulls from the front of a queue, fanning out in layers {A} {B,C} {D,E} {F} — so its discovery tree is shallow and wide, and the first arrival at any vertex is a shortest hop-path. DFS (right) pulls from a stack, plunging A→B→D→F before backtracking to E and C — a deep spine whose finish order gives a topological sort.">
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
      </Figure>
  ),
  "Shortest Paths": () => (
      <Figure caption="A Dijkstra snapshot: S and B are settled (green), and popping B relaxes the edge B→A, lowering A's tentative distance from 4 to 3 (amber) and reshuffling the min-heap so (3, A) is next. The lower panel contrasts the three: Dijkstra's greed needs non-negative weights, Bellman-Ford trades speed for handling negatives and detecting negative cycles, and A* steers Dijkstra with a heuristic.">
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
      </Figure>
  ),
  "Minimum Spanning Trees": () => (
      <Figure caption="The MST (green, total weight 12) on a 5-vertex graph. Kruskal (top right) walks the weight-sorted edge list adding AB, BC, BD, DE and rejecting AC, CD, CE because each would close a cycle, stopping at V−1=4. Prim (bottom right) grows a single tree from A, each step taking the cheapest edge leaving the current set — arriving at the identical tree by a different route.">
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
      </Figure>
  ),
  "Union-Find": () => (
      <Figure caption="Top: union(4,6) finds the two roots (1, 5) and hangs the smaller tree under the larger by size, so 5 now points to 1 and the merged tree stays shallow. Bottom: a find(4) on a tall chain re-points every node it passes directly at the root 1, collapsing the chain into a flat star so the next query is O(1). Together these give the α(n) ≈ constant bound.">
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
      </Figure>
  ),
  "Divide & Conquer and the Master Theorem": () => (
      <Figure caption="The recursion tree for mergesort's 2T(n/2) + n: the root does n work, its two children do n/2 each (n total), the next level four n/4's (n again), and so on — every one of the log₂ n levels costs n, summing to n log n. That is Case 2 of the Master Theorem, which classifies any a·T(n/b)+f(n) by whether the leaves, the levels, or the root carries the weight.">
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
      </Figure>
  ),
  "Dynamic Programming": () => (
      <Figure caption="Left: the naive fib(5) tree rebuilds f(3) twice (amber) and f(2) three times (blue) — the overlap that makes plain recursion exponential. Right: DP stores each dp[i] once and reuses it; the transition dp[i] = dp[i−1] + dp[i−2] fills the table left-to-right in O(n), and keeping only the last two values drops it to O(1) space.">
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
      </Figure>
  ),
  "Greedy Algorithms": () => (
      <Figure caption="Top — greedy succeeds: scanning activities by earliest finish time and taking each one that doesn't overlap the last yields the maximum set {A, C, E}, and an exchange argument proves no schedule fits more. Bottom — greedy fails: to make 6 from {1, 3, 4} the greedy grab of the largest coin (4) forces 4+1+1 = three coins, while the optimum 3+3 uses two — the denomination set lacks the greedy-choice property, so DP is required.">
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
      </Figure>
  ),
  "Probabilistic Structures": () => (
      <Figure caption="Top: a skip list searching for 17 — it rides the sparse top lane from 1 to 12, drops to level 1, drops again to level 0, then steps right to 17, touching far fewer nodes than the full list. Bottom: a Bloom filter after inserting cat→{1,4,9} and dog→{4,7,11}; cat and owl resolve correctly, but fox — never inserted — collides on bits already set, the unavoidable false positive. A 0 bit always means definitely-absent.">
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
      </Figure>
  ),
};
