"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Topic, Subtopic } from "@/data/topics";
import { subtopicToConceptId } from "@/lib/conceptUtils";
import FavoriteButton from "@/components/FavoriteButton";
import TopicIcon from "@/components/TopicIcon";

// ─── SVG diagram primitives ───────────────────────────────────────────────────

type Hue = { base: string; ink: string; soft: string };

function DiagBox({ x, y, w = 96, h = 46, label, sub, fill, stroke, text, rx = 12, dim }: {
  x: number; y: number; w?: number; h?: number; label: string; sub?: string;
  fill: string; stroke: string; text: string; rx?: number; dim?: boolean;
}) {
  return (
    <g opacity={dim ? 0.4 : 1}>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth="2" />
      <text x={x + w / 2} y={sub ? y + h / 2 - 3 : y + h / 2 + 4} textAnchor="middle"
        fontSize="12.5" fontWeight="700" fill={text} fontFamily="var(--font-body, system-ui)">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontSize="9.5"
        fill={text} opacity="0.8" fontFamily="var(--font-body, system-ui)">{sub}</text>}
    </g>
  );
}

function DiagArrow({ x1, y1, x2, y2, color, dashed, label, lx, ly, w = 2 }: {
  x1: number; y1: number; x2: number; y2: number; color: string;
  dashed?: boolean; label?: string; lx?: number; ly?: number; w?: number;
}) {
  const ang = Math.atan2(y2 - y1, x2 - x1), L = 9;
  const bx = x2 - Math.cos(ang) * 6, by = y2 - Math.sin(ang) * 6;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={w}
        strokeDasharray={dashed ? "5 4" : undefined} strokeLinecap="round" />
      <path d={`M ${x2} ${y2} L ${x2 - L * Math.cos(ang - 0.42)} ${y2 - L * Math.sin(ang - 0.42)} L ${x2 - L * Math.cos(ang + 0.42)} ${y2 - L * Math.sin(ang + 0.42)} Z`} fill={color} />
      {label && <text x={lx ?? (x1 + x2) / 2} y={ly ?? (y1 + y2) / 2 - 7} textAnchor="middle"
        fontSize="10" fontWeight="600" fill={color} fontFamily="var(--font-body, system-ui)">{label}</text>}
    </g>
  );
}

function DiagFrame({ children, vb = "0 0 460 240", caption }: {
  children: React.ReactNode; vb?: string; caption?: string;
}) {
  return (
    <figure style={{ margin: "0 0 8px" }}>
      <div style={{
        background: "var(--paper-2)", border: "1px solid var(--line)",
        borderRadius: "calc(var(--radius, 22px) * 0.7)", padding: "20px 16px",
      }}>
        <svg viewBox={vb} width="100%" role="img" aria-hidden="true" style={{ display: "block" }}>
          {children}
        </svg>
      </div>
      {caption && (
        <figcaption style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginTop: "10px", textAlign: "center", fontStyle: "italic" }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── Featured diagrams ────────────────────────────────────────────────────────

function LoadBalancingDiagram({ h }: { h: Hue }) {
  const s = "var(--ink-3)";
  return (
    <DiagFrame vb="0 0 460 230" caption="One front door; the load balancer spreads traffic across a healthy pool.">
      <DiagBox x={14} y={92} w={86} h={46} label="Clients" fill="var(--card)" stroke={s} text="var(--ink)" />
      <DiagBox x={172} y={88} w={104} h={54} label="Load" sub="Balancer" fill={h.soft} stroke={h.base} text={h.ink} />
      <DiagArrow x1={100} y1={115} x2={170} y2={115} color={h.base} label="requests" />
      {[40, 105, 170].map((y, i) => (
        <g key={i}>
          <DiagBox x={350} y={y} w={94} h={42} label={`Server ${i + 1}`} fill="var(--card)" stroke={s} text="var(--ink)" dim={i === 2} />
          <DiagArrow x1={276} y1={115} x2={348} y2={y + 21} color={i === 2 ? s : h.base} dashed={i === 2} />
        </g>
      ))}
      <text x={397} y={232} textAnchor="middle" fontSize="9.5" fill={s} fontFamily="var(--font-body, system-ui)">× health-checked, removed if it fails</text>
    </DiagFrame>
  );
}

function AttentionDiagram({ h }: { h: Hue }) {
  const tok = ["The", "cat", "sat", "down"];
  return (
    <DiagFrame vb="0 0 460 220" caption='Producing "sat", the model weighs every other token — most weight lands on "cat".'>
      {tok.map((t, i) => (
        <DiagBox key={i} x={20 + i * 110} y={20} w={84} h={40} label={t} fill="var(--card)" stroke="var(--ink-3)" text="var(--ink)" rx={10} />
      ))}
      <DiagBox x={130} y={150} w={120} h={48} label="Output for" sub='"sat"' fill={h.soft} stroke={h.base} text={h.ink} />
      {[0, 1, 2, 3].map((i) => {
        const wt = [0.15, 0.62, 0.08, 0.15][i];
        return <DiagArrow key={i} x1={62 + i * 110} y1={60} x2={190} y2={150} color={h.base} w={1 + wt * 6} />;
      })}
      <text x={62 + 110} y={92} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily="var(--font-body, system-ui)">0.62</text>
    </DiagFrame>
  );
}

function MvccDiagram({ h }: { h: Hue }) {
  const s = "var(--ink-3)";
  return (
    <DiagFrame vb="0 0 460 220" caption="An UPDATE writes a new row version; old readers still see the old one.">
      <DiagBox x={20} y={30} w={130} h={44} label="Txn A (reader)" sub="sees v1" fill={h.soft} stroke={h.base} text={h.ink} />
      <DiagBox x={20} y={150} w={130} h={44} label="Txn B (writer)" sub="UPDATE → v2" fill="var(--card)" stroke={s} text="var(--ink)" />
      <DiagBox x={300} y={42} w={130} h={40} label="row v1" sub="xmin 100" fill="var(--card)" stroke={h.base} text="var(--ink)" />
      <DiagBox x={300} y={140} w={130} h={40} label="row v2" sub="xmin 105" fill={h.soft} stroke={h.base} text={h.ink} />
      <DiagArrow x1={150} y1={52} x2={298} y2={62} color={h.base} label="read" />
      <DiagArrow x1={150} y1={172} x2={298} y2={160} color={s} label="write" />
      <line x1={365} y1={82} x2={365} y2={140} stroke={s} strokeWidth="1.5" strokeDasharray="4 4" />
    </DiagFrame>
  );
}

function CircuitBreakerDiagram({ h }: { h: Hue }) {
  const s = "var(--ink-3)";
  return (
    <DiagFrame vb="0 0 460 170" caption="Closed → trips Open after failures → Half-open probes → Closed when healthy.">
      <DiagBox x={18} y={60} w={110} h={48} label="Closed" sub="calls pass" fill="#e2f4e9" stroke="#2ba15a" text="#1c8147" />
      <DiagBox x={175} y={60} w={110} h={48} label="Open" sub="fail fast" fill="#fde7ea" stroke="#e8497b" text="#c72f60" />
      <DiagBox x={332} y={60} w={110} h={48} label="Half-Open" sub="probe" fill={h.soft} stroke={h.base} text={h.ink} />
      <DiagArrow x1={128} y1={78} x2={173} y2={78} color={s} label="errors" />
      <DiagArrow x1={285} y1={96} x2={332} y2={96} color={s} label="timeout" />
      <DiagArrow x1={387} y1={108} x2={120} y2={120} color="#2ba15a" label="success → reset" ly={148} />
    </DiagFrame>
  );
}

function ObserverDiagram({ h }: { h: Hue }) {
  const s = "var(--ink-3)";
  return (
    <DiagFrame vb="0 0 460 210" caption="One subject; many observers, all notified when state changes.">
      <DiagBox x={20} y={80} w={120} h={50} label="Subject" sub="state changed" fill={h.soft} stroke={h.base} text={h.ink} />
      {[20, 90, 160].map((y, i) => (
        <g key={i}>
          <DiagBox x={320} y={y} w={120} h={40} label={`Observer ${i + 1}`} fill="var(--card)" stroke={s} text="var(--ink)" />
          <DiagArrow x1={140} y1={105} x2={318} y2={y + 20} color={h.base} dashed label={i === 0 ? "notify()" : undefined} />
        </g>
      ))}
    </DiagFrame>
  );
}

function AgentLoopDiagram({ h }: { h: Hue }) {
  const s = "var(--ink-3)";
  return (
    <DiagFrame vb="0 0 360 250" caption="Think → Act → Observe, repeating until the goal is met — or a guard stops it.">
      <DiagBox x={120} y={16} w={120} h={46} label="Think" sub="plan / LLM" fill={h.soft} stroke={h.base} text={h.ink} />
      <DiagBox x={232} y={150} w={110} h={46} label="Act" sub="tool call" fill="var(--card)" stroke={s} text="var(--ink)" />
      <DiagBox x={20} y={150} w={110} h={46} label="Observe" sub="result" fill="var(--card)" stroke={s} text="var(--ink)" />
      <DiagArrow x1={235} y1={55} x2={287} y2={148} color={h.base} />
      <DiagArrow x1={245} y1={196} x2={120} y2={196} color={h.base} />
      <DiagArrow x1={70} y1={150} x2={140} y2={62} color={h.base} label="loop" lx={70} ly={110} />
    </DiagFrame>
  );
}

function GenericDiagram({ h, name }: { h: Hue; name: string }) {
  const s = "var(--ink-3)";
  return (
    <DiagFrame vb="0 0 460 130" caption={`A simplified view of ${name.toLowerCase()}.`}>
      <DiagBox x={20} y={42} w={110} h={46} label="Input" fill="var(--card)" stroke={s} text="var(--ink)" />
      <DiagBox x={175} y={38} w={110} h={54} label={name.split(" ")[0]} sub="the mechanism" fill={h.soft} stroke={h.base} text={h.ink} />
      <DiagBox x={330} y={42} w={110} h={46} label="Result" fill="var(--card)" stroke={s} text="var(--ink)" />
      <DiagArrow x1={130} y1={65} x2={173} y2={65} color={h.base} />
      <DiagArrow x1={285} y1={65} x2={328} y2={65} color={h.base} />
    </DiagFrame>
  );
}

// ─── Analogy card ─────────────────────────────────────────────────────────────

function AnalogyCard({ title, text, h }: { title: string; text: string; h: Hue }) {
  return (
    <div style={{
      marginTop: "1.8rem",
      background: "var(--card)",
      border: `1px solid var(--line)`,
      borderLeft: `3px solid ${h.base}`,
      borderRadius: "calc(var(--radius, 22px) * 0.7)",
      padding: "18px 20px",
    }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: h.base, marginBottom: 6 }}>
        In plain terms
      </div>
      <div style={{ fontWeight: 800, color: "var(--ink)", marginBottom: 4, fontSize: "1.02rem" }}>{title}</div>
      <div style={{ color: "var(--ink-2)", lineHeight: 1.6, fontSize: "0.98rem" }}>{text}</div>
    </div>
  );
}

// ─── Prose styles ─────────────────────────────────────────────────────────────

const PROSE: React.CSSProperties = {
  color: "var(--ink-2)",
  fontSize: "1rem",
  lineHeight: 1.72,
};

// ─── Featured content map (keyed by "topicId:subtopicName") ──────────────────

type FeaturedEntry = {
  oneLine: string;
  Diagram: React.ComponentType<{ h: Hue }>;
  analogy: { title: string; text: string };
  body: React.ReactNode;
  keyPoints: string[];
};

const FEATURED: Record<string, FeaturedEntry> = {
  "system-design:Load Balancing": {
    oneLine: "A load balancer is the single front door that quietly spreads visitors across a room full of identical servers — so no one server ever gets crushed.",
    Diagram: LoadBalancingDiagram,
    analogy: { title: "Like a host at a busy restaurant", text: "Diners don't pick their own table — the host seats them evenly so no waiter is overwhelmed and no table sits empty. If a waiter clocks out, the host just stops seating that section." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>When one server can't handle all your traffic, you run several identical copies. The <strong>load balancer</strong> sits in front of them and decides, for each incoming request, which server should answer using round-robin, least-connections, or consistent hashing.</p><p style={{margin:0}}>Watch out: the load balancer itself is a single point of failure unless deployed in an HA pair. Health checks typically have a 10–30 s interval, so a failing backend can still receive traffic for that window before it is drained.</p></div>,
    keyPoints: ["One entry point, many servers behind it", "Health checks remove dead servers automatically", "Round-robin, least-connections, and hashing are the common strategies", "L4 balancers route on TCP; L7 can route on URL, headers, or cookies", "The load balancer itself must be HA — it is a potential single point of failure"],
  },
  "ai-llm:The Attention Mechanism": {
    oneLine: "Attention lets a model look back over everything it has read and decide, word by word, which parts actually matter right now.",
    Diagram: AttentionDiagram,
    analogy: { title: "Like reading with a highlighter", text: "To understand the word \"it\" in a sentence, you glance back and mentally highlight the noun it refers to. Attention does exactly this — but for every word, all at once." },
    body: (
      <div style={PROSE}>
        <p style={{ margin: "0 0 1rem" }}>Earlier networks read text in order and quickly forgot the start of a long sentence. <strong>Attention</strong> fixed that: when producing each word, the model compares it against every other word and builds a weighted blend of them.</p>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)", margin: "1.4rem 0 0.5rem" }}>Queries, keys, and values</h3>
        <p style={{ margin: "0 0 1rem" }}>Each token emits a <strong>query</strong> ("what am I looking for?"), a <strong>key</strong> ("what do I offer?"), and a <strong>value</strong> ("here's my content"). The match between a query and every key produces the attention weights.</p>
        <ul style={{ margin: "0 0 1rem", paddingLeft: "1.4rem" }}>
          <li style={{ marginBottom: "0.4rem" }}>High weight → that token strongly informs the output.</li>
          <li>Near-zero weight → effectively ignored.</li>
        </ul>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)", margin: "1.4rem 0 0.5rem" }}>Why it was a breakthrough</h3>
        <p style={{ margin: "0 0 1rem" }}>Because every token can attend to every other token <strong>in parallel</strong>, attention scales beautifully on modern hardware — the insight that made the Transformer, and every modern LLM, possible.</p>
        <p style={{ margin: 0 }}>Watch out: because each token attends to every other, attention cost is O(n²) — doubling the sequence length quadruples the computation, which is why long contexts remain expensive.</p>
      </div>
    ),
    keyPoints: ["Each output word is a weighted blend of all input words", "Query · Key match decides the weights", "Runs in parallel — the key to scaling LLMs", "Attention cost is O(n²) in sequence length — long contexts are computationally expensive", "The 2017 'Attention Is All You Need' paper introduced this design for modern LLMs"],
  },
  "postgres-internals:MVCC — Multi-Version Concurrency Control": {
    oneLine: "MVCC means writers never block readers: instead of overwriting a row, Postgres keeps the old version around until no one needs it anymore.",
    Diagram: MvccDiagram,
    analogy: { title: "Like edits in a shared doc", text: "When a colleague edits a paragraph, you keep reading the version you opened. You don't get a blank screen mid-sentence — you simply see a consistent snapshot until you refresh." },
    body: <div style={PROSE}><p style={{ margin: "0 0 1rem" }}><strong>Multi-Version Concurrency Control</strong> is how Postgres lets many transactions touch the same data at once without tripping over each other. An <code style={{ background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em" }}>UPDATE</code> writes a new row version (stamped with <code style={{ background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em" }}>xmin</code>/<code style={{ background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em" }}>xmax</code>) and marks the old one expired — readers see a frozen snapshot while writers proceed in parallel.</p><p style={{ margin: 0 }}>Watch out: every UPDATE leaves a dead tuple on disk. Postgres caches commit status in per-tuple <strong>hint bits</strong> to avoid re-checking <code style={{ background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em" }}>pg_xact</code> on every read, but dead versions accumulate until <code style={{ background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em" }}>VACUUM</code> reclaims them.</p></div>,
    keyPoints: ["Updates create new row versions, never overwrite", "Each transaction reads a consistent snapshot", "VACUUM later reclaims dead versions", "Readers never block writers and writers never block readers", "Long-running transactions hold old snapshots, preventing VACUUM from reclaiming dead tuples"],
  },
  "cloud-architecture:Circuit Breaker Pattern": {
    oneLine: "A circuit breaker notices when a dependency is failing and stops calling it — failing fast instead of piling up and dragging the whole system down.",
    Diagram: CircuitBreakerDiagram,
    analogy: { title: "Like the breaker in your home", text: "When a circuit overloads, the breaker trips and cuts power rather than letting the wiring melt. After a moment you flip it back to test — if all is well, power resumes." },
    body: (
      <div style={PROSE}>
        <p style={{ margin: "0 0 1rem" }}>When a downstream service gets slow or starts erroring, naively retrying makes everything worse — requests queue up, threads block, and the failure cascades. The <strong>circuit breaker</strong> wraps those calls in a tiny state machine.</p>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)", margin: "1.4rem 0 0.5rem" }}>Three states</h3>
        <ul style={{ margin: "0 0 1rem", paddingLeft: "1.4rem" }}>
          <li style={{ marginBottom: "0.4rem" }}><strong>Closed</strong> — calls flow normally; failures are counted.</li>
          <li style={{ marginBottom: "0.4rem" }}><strong>Open</strong> — too many failures, so calls fail instantly without even trying.</li>
          <li><strong>Half-open</strong> — after a cooldown, a few probe calls test the waters.</li>
        </ul>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)", margin: "1.4rem 0 0.5rem" }}>Why it helps</h3>
        <p style={{ margin: 0 }}>Failing fast frees up resources and gives the struggling service room to recover, instead of being hammered while it's already down.</p>
      </div>
    ),
    keyPoints: ["Closed → Open → Half-open → Closed", "Open state fails instantly, no wasted calls", "Gives a failing dependency room to recover"],
  },
  "design-patterns:Observer": {
    oneLine: "The Observer pattern lets one object announce \"something changed!\" and have any number of listeners react — without it knowing who they are.",
    Diagram: ObserverDiagram,
    analogy: { title: "Like a newsletter", text: "The publisher doesn't know or care who's subscribed. It just sends an issue; every subscriber gets it. People can subscribe or unsubscribe any time without the publisher changing a thing." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>The <strong>Observer</strong> pattern defines a one-to-many relationship: when one object (the <strong>subject</strong>) changes state, all its <strong>observers</strong> are notified automatically. The subject keeps a list of observers and exposes <code>subscribe()</code> / <code>unsubscribe()</code>. Event listeners in the browser, reactive state libraries, and pub/sub systems are all the Observer pattern wearing different hats.</p><p style={{margin:0}}>Watch out: observers are notified in an unpredictable order, and forgetting to unsubscribe can cause memory leaks or unwanted update storms.</p></div>,
    keyPoints: ["One subject, many observers", "Subject doesn't know its observers' concrete types", "Powers UI events and reactive state everywhere", "Unsubscribing is essential — careless subscriptions cause memory leaks", "Notification order is not guaranteed across observers"],
  },
  "production-ai-agents:The Anatomy of an Agent Loop": {
    oneLine: "Every agent is, at heart, a loop: think about what to do, do it, look at what happened, repeat — until the goal is met or a guardrail stops it.",
    Diagram: AgentLoopDiagram,
    analogy: { title: "Like cooking from a recipe you're inventing", text: "You taste (observe), decide the dish needs salt (think), add a pinch (act), then taste again. The loop continues until it's right — or until you've clearly burnt it and should stop." },
    body: (
      <div style={PROSE}>
        <p style={{ margin: "0 0 1rem" }}>Strip away the hype and an agent is a humble loop with three phases that repeat.</p>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)", margin: "1.4rem 0 0.5rem" }}>Think → Act → Observe</h3>
        <ul style={{ margin: "0 0 1rem", paddingLeft: "1.4rem" }}>
          <li style={{ marginBottom: "0.4rem" }}><strong>Think</strong> — the model reasons about the goal and picks a next action.</li>
          <li style={{ marginBottom: "0.4rem" }}><strong>Act</strong> — it calls a tool, an API, or runs code.</li>
          <li><strong>Observe</strong> — the result is fed back in, and the loop turns again.</li>
        </ul>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)", margin: "1.4rem 0 0.5rem" }}>Where it goes wrong</h3>
        <p style={{ margin: 0 }}>Each phase has failure modes: bad plans, tool errors, misread results. Production-grade agents wrap the loop in <strong>timeouts, retries, and step limits</strong> so a confused agent can't spin forever or rack up a giant bill.</p>
      </div>
    ),
    keyPoints: ["The core is a think–act–observe loop", "Every phase has its own failure modes", "Guardrails (limits, timeouts) keep it from running away"],
  },

  // ── System Design ──────────────────────────────────────────────────────────
  "system-design:Horizontal vs Vertical Scaling": {
    oneLine: "Vertical scaling makes your one server bigger; horizontal scaling adds more servers — one hits a ceiling, the other scales to millions.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 235" caption="Scale-up: one big box. Scale-out: more boxes behind a balancer.">
        <DiagBox x={20} y={50} w={130} h={90} label="Vertical" sub="↑ bigger machine" fill={h.soft} stroke={h.base} text={h.ink} />
        <text x={85} y={165} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">hard ceiling</text>
        <DiagBox x={210} y={20} w={90} h={40} label="Load Balancer" fill={h.soft} stroke={h.base} text={h.ink} rx={8} />
        {[70,120,170].map((y,i)=><DiagBox key={i} x={330} y={y} w={110} h={34} label={`Server ${i+1}`} fill="var(--card)" stroke={s} text="var(--ink)" />)}
        {[70,120,170].map((y,i)=><DiagArrow key={i} x1={300} y1={40} x2={328} y2={y+17} color={h.base} />)}
        <text x={370} y={222} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">add more →</text>
      </DiagFrame>
    ); },
    analogy: { title: "Bigger truck vs. a fleet of vans", text: "You can keep buying a bigger truck, but eventually no vehicle can carry your load — a fleet of vans has no practical ceiling." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Vertical scaling</strong> adds CPU, RAM, or faster disks to one machine. It's simple but hits a hard hardware ceiling. <strong>Horizontal scaling</strong> spreads load across many commodity servers. It's more complex (stateless services + load balancer) but can grow indefinitely.</p><p style={{margin:0}}>Watch out: vertical scaling requires a reboot on most cloud instance types, meaning the resize itself causes a second outage window. Database write scaling is also asymmetric — read replicas are horizontal read-scale, but scaling write throughput beyond a single primary requires vertical sizing or sharding.</p></div>,
    keyPoints: ["Vertical: simpler but hits hardware limits", "Horizontal: limitless in theory, requires stateless design", "Most large systems combine both approaches", "Vertical scale-up typically requires a reboot on cloud instances", "Horizontal scaling bakes in fault tolerance — one node failure degrades capacity, not availability"],
  },
  "system-design:Auto-scaling": {
    oneLine: "Auto-scaling watches your traffic and quietly adds or removes servers so you pay for exactly what you need — nothing more, nothing less.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="High traffic triggers scale-out; low traffic triggers scale-in.">
        <DiagBox x={10} y={80} w={100} h={40} label="Traffic" sub="spike" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={160} y={70} w={120} h={60} label="Auto-scaler" sub="monitor & decide" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={110} y1={100} x2={158} y2={100} color={h.base} />
        <DiagBox x={340} y={40} w={105} h={36} label="Add instance" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <DiagBox x={340} y={124} w={105} h={36} label="Remove instance" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <DiagArrow x1={280} y1={88} x2={338} y2={58} color={h.base} label="high" lx={320} ly={68} />
        <DiagArrow x1={280} y1={112} x2={338} y2={142} color={s} label="low" lx={320} ly={132} />
      </DiagFrame>
    ); },
    analogy: { title: "Like a restaurant that opens extra tables", text: "When the queue grows, the host opens the back room. When it quiets down, they close it — you only staff what you need." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Auto-scaling continuously monitors a metric (CPU, request rate, queue depth) and adjusts the number of running instances to match demand. <strong>Scale-out</strong> adds instances when load rises; <strong>scale-in</strong> removes them when it drops — keeping costs proportional to usage.</p><p style={{margin:0}}>Watch out: services with heavy cold-start penalties (JVM warm-up, model loading, cache priming) will worsen latency during the exact spikes auto-scaling is meant to absorb. Cooldown periods prevent "flapping" but delay response to genuine sustained load.</p></div>,
    keyPoints: ["Scales out on high load, in on low load", "Driven by metrics: CPU, RPS, queue depth", "Needs warm-up time — plan for lag", "Scale-out fast, scale-in slow with cooldowns to prevent rapid churn", "Only works for stateless, horizontally scalable services behind a load balancer"],
  },
  "system-design:Rate Limiting": {
    oneLine: "Rate limiting caps how many requests a caller can make in a window, protecting your service from floods — accidental or malicious.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Token bucket: each request spends a token; tokens refill steadily.">
        <DiagBox x={10} y={72} w={100} h={46} label="Client" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={170} y={55} w={120} h={80} label="Token" sub="Bucket" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={350} y={72} w={100} h={46} label="Service" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={95} x2={168} y2={95} color={h.base} label="request" />
        <DiagArrow x1={290} y1={95} x2={348} y2={95} color={h.base} label="pass" />
        <text x={230} y={165} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">→ 429 if empty</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a bar's clicker counter", text: "The bouncer clicks for every person who enters. Once the venue hits capacity, new arrivals are turned away — no exceptions." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Rate limiting caps requests per client per time window. Common algorithms: <strong>token bucket</strong> (refills at a rate, allows short bursts), <strong>leaky bucket</strong> (drains at a fixed rate, smooths bursts), and <strong>sliding window</strong> (counts requests in a rolling period). Apply at the API gateway so limits are enforced before work begins.</p><p style={{margin:0}}>Watch out: in a clustered deployment, per-node counters silently allow N× the intended limit. Counters must live in a shared store (e.g., Redis) for the limit to be truly global — but that Redis instance then becomes a potential single point of failure.</p></div>,
    keyPoints: ["Prevents overload from any single caller", "Token bucket allows controlled bursts", "Return HTTP 429 with Retry-After header", "Enforce at the edge or gateway, before expensive downstream work", "Distributed counters require a shared store (e.g., Redis) — per-node counters leak excess traffic"],
  },
  "system-design:SQL vs NoSQL": {
    oneLine: "SQL gives you rigid structure and ACID guarantees; NoSQL trades some of that for flexible schemas and horizontal scalability.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="SQL: fixed schema, joins, ACID. NoSQL: flexible, horizontal, eventual.">
        <DiagBox x={10} y={20} w={200} h={160} label="SQL" sub="relational" fill={h.soft} stroke={h.base} text={h.ink} />
        <text x={110} y={80} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Fixed schema</text>
        <text x={110} y={100} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Joins &amp; transactions</text>
        <text x={110} y={120} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Scales vertically</text>
        <DiagBox x={250} y={20} w={200} h={160} label="NoSQL" sub="document / KV / graph" fill="var(--card)" stroke={s} text="var(--ink)" />
        <text x={350} y={80} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Flexible schema</text>
        <text x={350} y={100} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Eventual consistency</text>
        <text x={350} y={120} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Scales horizontally</text>
      </DiagFrame>
    ); },
    analogy: { title: "Spreadsheet vs. filing cabinet", text: "SQL is a tidy spreadsheet where every row has the same columns. NoSQL is a filing cabinet where each folder can hold whatever papers you stuff in it." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Choose <strong>SQL</strong> when your data has clear relationships, you need joins, or ACID transactions matter (banking, inventory). Choose <strong>NoSQL</strong> when your schema evolves rapidly, you need massive write throughput, or your data is naturally document/key-value shaped (user profiles, sessions, event logs).</p><p style={{margin:0}}>Watch out: denormalized NoSQL schemas duplicate data across documents — a single logical update must be applied to multiple locations, creating consistency drift if any write fails. Cassandra tombstone accumulation from frequent deletes can spike read latency during compaction.</p></div>,
    keyPoints: ["SQL: strong consistency, fixed schema, vertical scale", "NoSQL: flexible schema, eventual consistency, horizontal scale", "Many systems use both for different data", "SQL scales vertically for writes; NoSQL distributes writes across nodes natively", "NoSQL horizontal scaling pushes conflict resolution complexity into application code"],
  },
  "system-design:Database Sharding": {
    oneLine: "Sharding splits one giant database table across multiple nodes by a shard key — each node owns a slice of the data, so writes and storage scale out.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Rows are routed to a shard by key range (or hash).">
        <DiagBox x={10} y={77} w={110} h={46} label="App / Router" fill="var(--card)" stroke={s} text="var(--ink)" />
        {[20,90,160].map((y,i)=>(
          <g key={i}>
            <DiagBox x={330} y={y} w={120} h={38} label={`Shard ${i+1}`} sub={["A–G","H–P","Q–Z"][i]} fill={i===1?h.soft:"var(--card)"} stroke={i===1?h.base:s} text={i===1?h.ink:"var(--ink)"} />
            <DiagArrow x1={120} y1={100} x2={328} y2={y+19} color={i===1?h.base:s} />
          </g>
        ))}
        <text x={220} y={195} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">router directs each write to the correct shard</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like splitting a phone book by last name", text: "A–G goes in volume 1, H–P in volume 2, Q–Z in volume 3. Any lookup goes straight to the right volume — no scanning the others." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Sharding partitions rows across multiple database nodes using a <strong>shard key</strong>. Each node is responsible for a range or hash bucket of keys. Reads and writes for a key go only to its shard, so both storage and write throughput scale linearly with node count. The cost: cross-shard joins and re-sharding when you add nodes.</p><p style={{margin:0}}>Watch out: a poorly chosen shard key (e.g., a low-cardinality or time-based field) creates "hot" shards that recreate the single-node bottleneck. Resharding live traffic requires dual-write and backfill coordination; naive cutover causes write locks or data loss.</p></div>,
    keyPoints: ["Each shard owns a subset of rows by key", "Enables horizontal write scalability", "Cross-shard joins are expensive — choose shard key carefully", "Hash sharding spreads keys evenly; range sharding keeps ordered keys together for scans", "Consistent hashing minimises data movement when adding or removing shards"],
  },
  "system-design:Replication (Leader–Follower, Multi-Leader)": {
    oneLine: "Replication keeps identical copies of your data on multiple nodes — if the leader dies, a follower can take over and reads can spread across replicas.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Leader accepts writes; followers replicate and serve reads.">
        <DiagBox x={160} y={10} w={130} h={50} label="Leader" sub="writes here" fill={h.soft} stroke={h.base} text={h.ink} />
        {[20,160,300].map((x,i)=>(
          <g key={i}>
            <DiagBox x={x} y={130} w={110} h={46} label={`Follower ${i+1}`} sub="reads" fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={225} y1={60} x2={x+55} y2={128} color={h.base} dashed />
          </g>
        ))}
        <text x={230} y={196} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">replication lag possible</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a publisher and subscribers", text: "Every article is written once at the publisher and distributed to all subscribers. Readers get their own copy; none of them can edit it." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Leader–follower</strong> replication routes all writes to one leader; changes fan out to followers asynchronously. Followers handle reads, reducing load on the leader. <strong>Multi-leader</strong> replication allows writes on multiple nodes simultaneously — great for geo-distributed systems, but requires conflict resolution when two leaders accept conflicting writes.</p><p style={{margin:0}}>Watch out: reading from a lagging follower can return stale data — use read-your-writes consistency when staleness is unacceptable. Without proper fencing on failover, two nodes can simultaneously believe they are leader (split-brain), causing divergent writes.</p></div>,
    keyPoints: ["Leader takes writes; followers serve reads", "Async replication means followers may lag", "Multi-leader enables geo-distributed writes but needs conflict resolution", "A newly promoted follower may be behind the old leader's commit log, causing apparent data rollback", "Use read-your-writes consistency when the client must see its own most-recent write"],
  },
  "system-design:CAP Theorem": {
    oneLine: "A distributed system can only fully guarantee two of three properties — Consistency, Availability, and Partition Tolerance — never all three at once.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Pick any two: CA, CP, or AP — partition tolerance is usually non-negotiable.">
        <polygon points="230,15 60,175 400,175" fill="none" stroke={s} strokeWidth="2" />
        <text x={230} y={12} textAnchor="middle" fontSize="13" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">Consistency</text>
        <text x={30} y={192} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Availability</text>
        <text x={422} y={192} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Partition</text>
        <text x={230} y={100} textAnchor="middle" fontSize="11" fill={s} fontFamily="var(--font-body,system-ui)">CA · CP · AP</text>
        <circle cx={230} cy={95} r={28} fill={h.soft} stroke={h.base} strokeWidth="2" />
        <text x={230} y={99} textAnchor="middle" fontSize="10" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">choose 2</text>
      </DiagFrame>
    ); },
    analogy: { title: "A three-way promise you can't keep", text: "You can promise a bank to always be open, always be accurate, and survive any network outage — but when the network splits, you must pick accuracy or availability." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>In practice, network partitions happen and can't be ignored — so the real choice is <strong>CP</strong> (stay consistent, go unavailable during a partition) vs <strong>AP</strong> (stay available, risk serving stale data). Most distributed databases fall somewhere on this spectrum and let you tune the trade-off per query.</p><p style={{margin:0}}>Watch out: CAP's "Consistency" means linearizability, not eventual consistency. CP systems like etcd refuse writes during leader election; if callers retry aggressively instead of circuit-breaking, the backlog can overwhelm the cluster the moment the partition heals.</p></div>,
    keyPoints: ["Partition tolerance is non-negotiable in distributed systems", "CP: consistent but may reject requests during splits", "AP: always responds but may return stale data", "CP stores (etcd, HBase) sacrifice availability; AP stores (Cassandra, Dynamo) sacrifice strong consistency", "CAP does not cover latency — a CP system can be technically up but too slow to meet SLAs"],
  },
  "system-design:ACID vs BASE": {
    oneLine: "ACID gives you strong transactional guarantees; BASE trades them for availability and eventual consistency — the right choice depends on your tolerance for stale data.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="ACID: strong guarantees. BASE: eventual consistency for availability.">
        <DiagBox x={10} y={20} w={200} h={150} label="ACID" fill={h.soft} stroke={h.base} text={h.ink} />
        {["Atomic","Consistent","Isolated","Durable"].map((t,i)=>(
          <text key={i} x={110} y={70+i*22} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">{t}</text>
        ))}
        <DiagBox x={250} y={20} w={200} h={150} label="BASE" fill="var(--card)" stroke={s} text="var(--ink)" />
        {["Basically Available","Soft state","Eventually consistent"].map((t,i)=>(
          <text key={i} x={350} y={75+i*25} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">{t}</text>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Bank account vs. social media likes", text: "Your bank balance must be exactly right the instant you check — ACID. Your like count can be off by a few for a moment — BASE." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>ACID</strong> transactions guarantee every operation is atomic, data is always valid, transactions don't interfere, and commits survive crashes. <strong>BASE</strong> systems sacrifice strict consistency for availability and partition tolerance — data will eventually converge, but may be stale for a window. Use ACID for financial data; BASE is fine for caches, social feeds, and analytics.</p><p style={{margin:0}}>Watch out: BASE systems push conflict resolution into application code — engineers must reason about convergence, idempotency, and read-repair explicitly. Debugging BASE inconsistencies is notoriously difficult because the failure state is non-reproducible and spread across multiple nodes.</p></div>,
    keyPoints: ["ACID: safe for money and inventory", "BASE: acceptable for social, analytics, caches", "Modern databases often let you choose per operation", "ACID transactions impose write serialization overhead and lock contention that caps throughput on hot rows", "BASE systems can sustain high write throughput across geo-distributed nodes with no single coordinator bottleneck"],
  },
  "system-design:Caching Strategies": {
    oneLine: "A cache is a fast nearby copy of slow data — the hard part is deciding when to fill it, when to write through it, and when to invalidate it.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Cache-aside: app checks cache first, falls back to DB on miss, then fills the cache.">
        <DiagBox x={10} y={77} w={100} h={46} label="App" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={30} w={110} h={46} label="Cache" sub="fast" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={124} w={110} h={46} label="Database" sub="source of truth" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={90} x2={173} y2={53} color={h.base} label="1. check" lx={148} ly={58} />
        <DiagArrow x1={173} y1={147} x2={110} y2={110} color={s} label="miss→" lx={148} ly={122} />
        <DiagArrow x1={110} y1={108} x2={173} y2={147} color={s} label="2. query" lx={130} ly={140} />
        <DiagArrow x1={230} y1={124} x2={230} y2={78} color={h.base} dashed label="3. fill" lx={244} ly={100} />
      </DiagFrame>
    ); },
    analogy: { title: "Like keeping today's newspaper on your desk", text: "You check your desk first (cache). If it's not there, you go to the archive room (database) and bring a copy back to your desk for next time." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Cache-aside</strong>: the app checks the cache, queries the DB on a miss, and writes the result back. <strong>Write-through</strong>: every write goes to both cache and DB simultaneously. <strong>Write-behind</strong>: writes go to cache first, then are flushed to the DB asynchronously. Each trades off consistency, latency, and complexity differently.</p><p style={{margin:0}}>Watch out: write-behind is fast but risks data loss if the cache node crashes before the async flush completes — writes acknowledged to the client are permanently lost. When a popular TTL key expires under high load, a thundering herd of requests can hammer the database simultaneously.</p></div>,
    keyPoints: ["Cache-aside is the most common pattern", "Write-through keeps cache and DB in sync", "Always plan for cache invalidation — it's the hard part", "Write-behind (write-back) is fastest but risks losing acknowledged writes before flush", "Write-around skips the cache on writes; the cache fills only on a subsequent read"],
  },
  "system-design:CDN (Content Delivery Network)": {
    oneLine: "A CDN copies your static assets to dozens of edge servers around the world so users download from a server nearby, not one far away.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Origin serves the CDN; users pull from the nearest edge — a cache miss reaches origin.">
        <DiagBox x={10} y={77} w={110} h={46} label="Origin" sub="server" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={185} y={77} w={90} h={46} label="CDN Edge" sub="nearest PoP" fill={h.soft} stroke={h.base} text={h.ink} />
        {[20,90,160].map((y,i)=>(
          <g key={i}>
            <DiagBox x={340} y={y} w={110} h={36} label={["US user","EU user","APAC user"][i]} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={275} y1={100} x2={338} y2={y+18} color={h.base} />
          </g>
        ))}
        <DiagArrow x1={120} y1={100} x2={183} y2={100} color={s} dashed label="cache miss" />
      </DiagFrame>
    ); },
    analogy: { title: "Like a chain of local warehouses", text: "Amazon doesn't ship every order from one warehouse. It stores popular items near you, so delivery is next-day instead of two weeks." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>CDNs work by caching content at Points of Presence (PoPs) close to users. On the first request for an asset, the edge fetches it from the origin and caches it. Subsequent requests are served from the edge — faster and cheaper. Beyond static files, modern CDNs can also route API requests, run edge functions, and terminate TLS.</p><p style={{margin:0}}>Watch out: new JS/CSS deploys leave old assets cached at edge PoPs when versioned URLs are not used, so users receive a mix of old and new file versions until TTL expires. Purge APIs have propagation delays measured in seconds to minutes across all PoPs.</p></div>,
    keyPoints: ["Serves assets from the closest edge node", "Reduces origin load and latency for users worldwide", "Cache-Control headers control how long CDN holds content", "On a cache miss the edge fetches from origin once, then caches it for all subsequent requests", "Always use versioned (hashed) asset filenames to avoid stale cache after deploys"],
  },
  "system-design:Cache Eviction Policies": {
    oneLine: "When a cache fills up, an eviction policy decides which entry to remove — LRU, LFU, and TTL each make a different bet about what you'll need next.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="LRU evicts the least-recently-used entry when the cache is full.">
        {["A (recent)","B","C","D (oldest)"].map((lbl,i)=>(
          <DiagBox key={i} x={20+i*105} y={60} w={95} h={50} label={lbl} fill={i===3?h.soft:i===0?"var(--card)":"var(--card)"} stroke={i===3?h.base:s} text={i===3?h.ink:"var(--ink)"} />
        ))}
        <text x={435} y={85} fontSize="16" fill={h.base} fontFamily="var(--font-body,system-ui)">✕</text>
        <text x={230} y={150} textAnchor="middle" fontSize="11" fill={s} fontFamily="var(--font-body,system-ui)">← most recent · · · least recent →</text>
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">D evicted on next miss</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like clearing your desk", text: "You toss the papers you haven't touched in weeks (LRU). Or you toss the ones you've read least often (LFU). Or they simply expire after a day (TTL)." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>LRU</strong> (Least Recently Used) evicts the entry not accessed for the longest time — good for temporal locality. <strong>LFU</strong> (Least Frequently Used) evicts the entry accessed fewest times — good when popularity matters. <strong>TTL</strong> expires entries after a fixed duration regardless of access — simple and predictable. Redis supports all three; choose based on your access pattern.</p><p style={{margin:0}}>Watch out: LRU is vulnerable to scan pollution — a full-table read sequentially promotes millions of rarely-reused keys, evicting all genuinely hot entries. When many keys share the same TTL (e.g., all set at server startup), they expire simultaneously causing a thundering herd of backend requests.</p></div>,
    keyPoints: ["LRU: evict least recently accessed — most common default", "LFU: evict least frequently accessed — better for popularity-skewed workloads", "TTL: time-based expiry — simplest and most predictable", "LRU is vulnerable to scan pollution from bulk reads that flush all hot entries", "Many real caches combine signals (e.g., LRU + TTL) for better hit rates"],
  },
  "system-design:Redis Architecture": {
    oneLine: "Redis keeps its entire dataset in RAM, executes commands in a single thread, and optionally persists to disk — making it blindingly fast for caching and messaging.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Single-threaded event loop; optional AOF/RDB persistence; replication to replicas.">
        <DiagBox x={160} y={10} w={130} h={50} label="Redis" sub="in-memory store" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={10} y={120} w={120} h={40} label="AOF" sub="append-only log" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={160} y={120} w={130} h={40} label="RDB Snapshot" sub="periodic dump" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={320} y={120} w={130} h={40} label="Replica" sub="async copy" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={225} y1={60} x2={70} y2={118} color={s} dashed label="persist" lx={120} ly={80} />
        <DiagArrow x1={225} y1={60} x2={225} y2={118} color={s} dashed />
        <DiagArrow x1={225} y1={60} x2={385} y2={118} color={h.base} dashed label="replicate" lx={330} ly={80} />
      </DiagFrame>
    ); },
    analogy: { title: "Like a whiteboard in RAM", text: "Redis reads and writes to a whiteboard in memory — instantaneous. Periodically it photographs the whiteboard to disk so it can redraw it if the power goes out." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Redis stores all data in RAM and processes commands on a single-threaded event loop — no lock contention, predictable microsecond latency. It supports rich data structures (strings, hashes, sorted sets, streams) and two persistence options: <strong>RDB</strong> (periodic snapshots) and <strong>AOF</strong> (every-write log). Redis Cluster shards data across nodes for horizontal scale.</p><p style={{margin:0}}>Watch out: replication is asynchronous by default, so a primary failure risks losing acknowledged writes not yet replicated. During a background AOF rewrite Redis forks, and on large datasets the parent's write latency can spike to hundreds of milliseconds due to copy-on-write memory pressure.</p></div>,
    keyPoints: ["All data in RAM — sub-millisecond reads and writes", "Single-threaded: no locks, but CPU-bound on one core", "AOF + RDB persistence for durability without sacrificing speed", "Rich types: strings, hashes, lists, sorted sets, streams, HyperLogLog", "Async replication by default — primary failure can lose recently acknowledged writes"],
  },
  "system-design:DNS Resolution Flow": {
    oneLine: "When you type a URL, your browser silently asks a chain of four servers to translate that name into an IP address before any real request is sent.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 180" caption="Browser → Resolver → Root → TLD → Authoritative → IP">
        {["Browser","Resolver","Root NS","TLD NS","Auth NS"].map((lbl,i)=>(
          <DiagBox key={i} x={10+i*88} y={60} w={80} h={46} label={lbl} fill={i===4?h.soft:i===0?"var(--card)":"var(--card)"} stroke={i===4?h.base:s} text={i===4?h.ink:"var(--ink)"} rx={10} />
        ))}
        {[0,1,2,3].map(i=>(
          <DiagArrow key={i} x1={90+i*88} y1={83} x2={98+i*88} y2={83} color={h.base} />
        ))}
        <text x={230} y={155} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">result cached at resolver — TTL controls freshness</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like asking for directions step by step", text: "You ask a local (resolver), who asks the city hall (root), which points to the county clerk (TLD), who directs you to the building owner (authoritative) who finally has the address." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>DNS is a distributed lookup system. Your OS queries a <strong>recursive resolver</strong> (usually your ISP's or 8.8.8.8). If it doesn't have the answer cached, it walks up the hierarchy: <strong>root nameserver</strong> → <strong>TLD nameserver</strong> (e.g. .com) → <strong>authoritative nameserver</strong> for your domain. The final answer (an A or AAAA record) is returned and cached by the resolver for the record's TTL.</p><p style={{margin:0}}>Watch out: sub-second failover via DNS is unreliable because DNS TTL-based switching has inherent propagation delay. Resolvers, OS, and browser caches all layer on top, and client-side caches frequently ignore TTLs, holding stale records well past expiry.</p></div>,
    keyPoints: ["Four-step chain: resolver → root → TLD → authoritative", "Results are cached at the resolver for the record's TTL", "Lower TTL means faster propagation but more DNS traffic", "DNS is not suitable as a sole health-routing mechanism for sub-second failover", "Record types: A/AAAA (address), CNAME (alias), MX (mail), NS (delegation)"],
  },
  "system-design:HTTP vs HTTPS": {
    oneLine: "HTTPS wraps HTTP inside TLS — it encrypts traffic so eavesdroppers can't read it, and authenticates the server so you know you're talking to the real site.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="TLS handshake establishes a session key; all HTTP flows inside that encrypted tunnel.">
        <DiagBox x={10} y={80} w={90} h={40} label="Browser" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={360} y={80} w={90} h={40} label="Server" fill="var(--card)" stroke={s} text="var(--ink)" />
        <rect x={140} y={50} width={180} height={100} rx={10} fill={h.soft} stroke={h.base} strokeWidth="2" />
        <text x={230} y={80} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">TLS Tunnel</text>
        <text x={230} y={100} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">encrypted + authenticated</text>
        <text x={230} y={118} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">HTTP flows inside</text>
        <DiagArrow x1={100} y1={100} x2={138} y2={100} color={h.base} />
        <DiagArrow x1={322} y1={100} x2={358} y2={100} color={h.base} />
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">certificate proves server identity</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like sending a letter in a locked box", text: "Plain HTTP is a postcard anyone can read. HTTPS puts the message in a locked box — only the real recipient has the key, and the return address is verified." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>TLS performs a handshake before any HTTP is sent: the server presents a certificate, the client verifies it against a trusted CA, and they negotiate a symmetric session key. After that, all HTTP traffic is encrypted. Modern TLS 1.3 reduces the handshake to one round-trip. HTTPS also enables HTTP/2 and HTTP/3, which bring significant performance improvements.</p><p style={{margin:0}}>Watch out: 0-RTT session resumption in TLS 1.3 is vulnerable to replay attacks on non-idempotent endpoints if not explicitly guarded. Certificate expiry causes hard browser errors for all users — even a one-hour expiry window can constitute a full outage if renewal pipelines are manual.</p></div>,
    keyPoints: ["TLS encrypts traffic and authenticates the server", "Certificate chain anchors trust to a CA", "HTTPS is a prerequisite for HTTP/2 and HTTP/3", "Default ports: HTTP 80, HTTPS 443; browsers flag plain HTTP as Not Secure", "TLS 1.3 handshake completes in one round-trip, reducing connection setup latency"],
  },
  "system-design:WebSockets vs HTTP Polling": {
    oneLine: "HTTP polling repeatedly asks 'anything new?' and waits for an answer; WebSockets open a persistent two-way channel so the server can push updates the instant they happen.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Left: polling hammers the server. Right: WebSocket pushes only when data arrives.">
        <text x={110} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill={s} fontFamily="var(--font-body,system-ui)">HTTP Polling</text>
        {[40,80,120,160].map((y,i)=><DiagArrow key={i} x1={20} y1={y} x2={190} y2={y} color={i%2===0?s:h.base} dashed={i%2!==0} label={i%2===0?"req":undefined} />)}
        <text x={250} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">WebSocket</text>
        <line x1={240} y1={35} x2={240} y2={175} stroke={h.base} strokeWidth="2" />
        <line x1={440} y1={35} x2={440} y2={175} stroke={h.base} strokeWidth="2" />
        <DiagArrow x1={240} y1={35} x2={440} y2={35} color={h.base} label="upgrade" />
        {[80,130].map((y,i)=><DiagArrow key={i} x1={440} y1={y} x2={242} y2={y} color={h.base} label="push" lx={340} ly={y-8} />)}
      </DiagFrame>
    ); },
    analogy: { title: "Calling to check vs. being texted", text: "Polling is calling every 5 minutes asking 'did my package arrive?' WebSockets is getting a text the moment the courier rings your bell." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Long-polling</strong> holds the request open until data arrives, reducing empty responses. <strong>Server-Sent Events</strong> push a one-way stream over HTTP. <strong>WebSockets</strong> upgrade the HTTP connection to a full-duplex channel — both sides can send at any time, with minimal framing overhead. Use WebSockets for chat, live dashboards, and collaborative editing where sub-second latency matters.</p><p style={{margin:0}}>Watch out: without a shared pub/sub layer (e.g., Redis), a WebSocket message published on one server node is never delivered to clients connected to other nodes — horizontal scaling requires sticky sessions or a broker. Intermediate proxies or NAT gateways also silently drop idle TCP connections.</p></div>,
    keyPoints: ["Polling wastes bandwidth on empty responses", "WebSockets: one handshake, persistent bidirectional channel", "SSE is simpler for server-to-client-only streams", "WebSocket horizontal scaling requires sticky sessions or a shared pub/sub broker", "Long-polling holds the request open until data arrives — fewer empty replies than polling"],
  },
  "system-design:REST vs GraphQL vs gRPC": {
    oneLine: "REST is simple and cacheable; GraphQL lets clients fetch exactly what they need; gRPC is binary, fast, and ideal for internal service-to-service calls.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="REST: many endpoints. GraphQL: one endpoint, shaped query. gRPC: typed binary protocol.">
        {[["REST","many endpoints","JSON over HTTP","cacheable"],[" GraphQL","one endpoint","shape your query","flexible"],[" gRPC","IDL contract","binary / HTTP2","fast"]] .map(([title,...rows],col)=>(
          <g key={col}>
            <DiagBox x={10+col*148} y={10} w={136} h={36} label={title} fill={col===2?h.soft:"var(--card)"} stroke={col===2?h.base:s} text={col===2?h.ink:"var(--ink)"} />
            {rows.map((r,i)=><text key={i} x={78+col*148} y={70+i*26} textAnchor="middle" fontSize="10" fill="var(--ink-2)" fontFamily="var(--font-body,system-ui)">{r}</text>)}
          </g>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Menu vs. custom order vs. assembly line", text: "REST is a fixed menu. GraphQL lets you say exactly which toppings you want. gRPC is a factory line — no frills, maximum throughput." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>REST</strong>: resource-based URLs, HTTP verbs, JSON — universally understood and HTTP-cache-friendly. <strong>GraphQL</strong>: a single endpoint where the client describes exactly the data shape it needs — eliminates over- and under-fetching. <strong>gRPC</strong>: uses Protocol Buffers and HTTP/2 for typed, binary, streaming RPC — 5–10× smaller payloads than JSON, ideal for microservice meshes.</p><p style={{margin:0}}>Watch out: GraphQL without DataLoader batching causes N+1 query explosions — each list item triggers a separate resolver DB call. gRPC's HTTP/2 trailers are stripped or rejected by many Layer-7 load balancers, causing silent connection failures in production routing.</p></div>,
    keyPoints: ["REST: simple, cacheable, universally supported", "GraphQL: client-driven queries, one endpoint", "gRPC: binary, strongly typed, best for internal services", "GraphQL requires depth and complexity limits in production to prevent denial-of-service via crafted queries", "gRPC's .proto contract catches interface drift at build time rather than runtime"],
  },
  "system-design:Message Queues vs Event Streams": {
    oneLine: "A message queue delivers each message to one consumer and deletes it; an event stream persists messages so multiple consumers can replay history independently.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Queue: consume and delete. Stream: retain and replay at any offset.">
        <text x={110} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill={s} fontFamily="var(--font-body,system-ui)">Message Queue</text>
        <DiagBox x={20} y={30} w={80} h={36} label="Producer" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={130} y={30} w={80} h={36} label="Queue" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={240} y={30} w={80} h={36} label="Consumer" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={100} y1={48} x2={128} y2={48} color={h.base} />
        <DiagArrow x1={210} y1={48} x2={238} y2={48} color={h.base} />
        <text x={170} y={90} textAnchor="middle" fontSize="9" fill={s} fontFamily="var(--font-body,system-ui)">message deleted after ack</text>
        <text x={340} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">Event Stream</text>
        <DiagBox x={300} y={30} w={150} h={36} label="Log (retained)" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={300} y={100} w={70} h={30} label="Consumer A" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <DiagBox x={380} y={100} w={70} h={30} label="Consumer B" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <DiagArrow x1={335} y1={66} x2={335} y2={98} color={h.base} />
        <DiagArrow x1={415} y1={66} x2={415} y2={98} color={h.base} />
      </DiagFrame>
    ); },
    analogy: { title: "Ticket dispenser vs. a bulletin board", text: "A queue is a ticket dispenser — one person takes the ticket and it's gone. A stream is a bulletin board — every subscriber reads it at their own pace, nothing disappears." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Message queues</strong> (RabbitMQ, SQS) deliver each message to exactly one consumer and delete it on acknowledgement — great for task distribution. <strong>Event streams</strong> (Kafka, Kinesis) persist an ordered log; each consumer group tracks its own offset and can replay history. Use streams when multiple services need the same events, or when you need audit logs and replay.</p><p style={{margin:0}}>Watch out: if a Kafka consumer group falls behind and lag exceeds the retention window, events are deleted before processing — causing silent data loss. At-least-once delivery in both systems forces idempotent consumer design, adding complexity to every handler.</p></div>,
    keyPoints: ["Queues: one consumer, delete on ack", "Streams: many consumers, persistent, replayable", "Streams enable event sourcing and audit trails", "Order is guaranteed within a Kafka partition, not across the whole topic", "Kafka's immutable log doubles as an audit trail with zero additional infrastructure"],
  },
  "system-design:Pub/Sub Pattern": {
    oneLine: "Pub/Sub decouples producers from consumers — publishers send to a topic without knowing who's listening, and subscribers receive only the topics they care about.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Publisher → Topic → fan-out to all subscribers.">
        <DiagBox x={10} y={77} w={100} h={46} label="Publisher" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={77} w={110} h={46} label="Topic" sub="orders.created" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={110} y1={100} x2={173} y2={100} color={h.base} label="publish" />
        {[30,90,150].map((y,i)=>(
          <g key={i}>
            <DiagBox x={340} y={y} w={110} h={38} label={["Email svc","Inventory","Analytics"][i]} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={285} y1={100} x2={338} y2={y+19} color={h.base} />
          </g>
        ))}
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">publisher unaware of subscriber count or type</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a radio station", text: "The station broadcasts on a frequency without knowing who's tuned in. Anyone with a receiver on that frequency gets the signal instantly — the station never needs to know who that is." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Pub/Sub is the backbone of event-driven architecture. Producers publish events to named topics; consumers subscribe to the topics they need. Adding a new consumer requires zero changes to the producer. The message broker (SNS, Pub/Sub, Redis Streams) handles fan-out, buffering, and delivery guarantees.</p><p style={{margin:0}}>Watch out: pub/sub is inherently fire-and-forget — the publisher cannot receive a synchronous response from a consumer. Achieving exactly-once semantics requires idempotent consumers and transactional producers, adding significant application complexity.</p></div>,
    keyPoints: ["Zero coupling between publisher and subscribers", "Add new consumers without touching the producer", "Broker handles fan-out and delivery guarantees", "Publishers know only the topic, not who (if anyone) is listening", "Exactly-once delivery requires idempotent consumers and transactional producers"],
  },
  "system-design:Kafka Architecture": {
    oneLine: "Kafka is a distributed commit log — producers append to partitioned topics, consumers read at their own pace, and messages are retained for days so any consumer can replay history.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Topic split into partitions; consumer group members each own a partition.">
        <DiagBox x={10} y={77} w={90} h={46} label="Producer" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={100} y1={100} x2={128} y2={100} color={h.base} />
        <DiagBox x={130} y={20} w={100} h={36} label="Partition 0" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={130} y={82} w={100} h={36} label="Partition 1" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={130} y={144} w={100} h={36} label="Partition 2" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={230} y1={38} x2={318} y2={60} color={s} />
        <DiagArrow x1={230} y1={100} x2={318} y2={100} color={s} />
        <DiagArrow x1={230} y1={162} x2={318} y2={140} color={s} />
        <DiagBox x={320} y={20} w={130} h={140} label="Consumer" sub="Group" fill="var(--card)" stroke={s} text="var(--ink)" />
        <text x={385} y={90} textAnchor="middle" fontSize="10" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">C1 ← P0</text>
        <text x={385} y={110} textAnchor="middle" fontSize="10" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">C2 ← P1</text>
        <text x={385} y={130} textAnchor="middle" fontSize="10" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">C3 ← P2</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a logbook with multiple readers", text: "Every event is written sequentially into a logbook. Multiple readers each have a bookmark — they read at their own pace and can go back to re-read any page at any time." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Kafka partitions topics across brokers for parallelism. Producers append to the partition determined by a key (or round-robin). Each <strong>consumer group</strong> gets a private cursor (offset) per partition — one consumer per partition, fully parallel. Increasing partitions scales throughput; increasing consumer groups adds independent subscribers. Retention (default 7 days) enables replay and recovery.</p><p style={{margin:0}}>Watch out: partition count is effectively immutable after creation — under-partitioning at design time creates a hard throughput ceiling that requires painful topic recreation to fix. With unclean.leader.election.enable=true, a broker with stale data can be elected leader, silently serving older offsets.</p></div>,
    keyPoints: ["Partitions enable parallel writes and reads", "Consumer groups each track independent offsets", "Retention makes replay and recovery possible", "Order is guaranteed within a partition, not across the whole topic", "Partition count cannot be reduced after creation — plan capacity up front"],
  },
  "system-design:Dead Letter Queues": {
    oneLine: "A Dead Letter Queue catches messages that fail processing repeatedly so they don't block the main queue — you can inspect and replay them later without losing the data.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="After N retries the message is moved to the DLQ — not dropped.">
        <DiagBox x={10} y={77} w={100} h={46} label="Main Queue" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={170} y={77} w={100} h={46} label="Consumer" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={100} x2={168} y2={100} color={h.base} />
        <DiagArrow x1={220} y1={123} x2={220} y2={155} color={s} label="fail ×N" lx={240} ly={142} />
        <DiagBox x={155} y={155} w={130} h={30} label="Dead Letter Queue" fill={h.soft} stroke={h.base} text={h.ink} rx={8} />
        <DiagBox x={350} y={155} w={100} h={30} label="Inspect / Replay" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <DiagArrow x1={285} y1={170} x2={348} y2={170} color={h.base} dashed />
        <text x={230} y={50} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">main queue unblocked — poison messages isolated</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like returned mail", text: "A letter that can't be delivered three times isn't thrown away — it's set aside in a 'return to sender' pile for the postmaster to inspect and re-route later." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>When a consumer fails to process a message after a configured number of retries, the broker moves it to the <strong>DLQ</strong>. The main queue stays unblocked — no poison message can halt all processing. DLQ messages are preserved with their original metadata (headers, timestamp, original queue) so you can diagnose root causes, fix the consumer, and replay them safely.</p><p style={{margin:0}}>Watch out: replaying a large DLQ backlog at full speed overwhelms the consumer or downstream database, replicating the original outage. Without alerting on DLQ depth, thousands of failed messages accumulate undetected while the main queue appears healthy.</p></div>,
    keyPoints: ["Isolates poison messages so main queue keeps flowing", "Preserves failed messages for inspection and replay", "Alert on DLQ depth — it signals a processing failure", "Triggered after a configured max-retry or max-delivery count is exceeded", "Replay from the DLQ at a throttled rate to avoid overwhelming the consumer"],
  },
  "system-design:API Gateway Pattern": {
    oneLine: "An API Gateway is the single front door for all clients — it handles routing, authentication, rate limiting, and protocol translation before requests reach any backend service.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="One entry point handles cross-cutting concerns; backends stay simple.">
        {["Web","Mobile","3rd Party"].map((lbl,i)=>(
          <g key={i}>
            <DiagBox x={10} y={30+i*56} w={80} h={40} label={lbl} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={90} y1={50+i*56} x2={148} y2={100} color={s} />
          </g>
        ))}
        <DiagBox x={150} y={70} w={120} h={60} label="API Gateway" sub="auth · rate · route" fill={h.soft} stroke={h.base} text={h.ink} />
        {["Users svc","Orders svc","Search svc"].map((lbl,i)=>(
          <g key={i}>
            <DiagBox x={330} y={30+i*56} w={120} h={40} label={lbl} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={270} y1={100} x2={328} y2={50+i*56} color={h.base} />
          </g>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Like a hotel reception desk", text: "Guests don't wander backstage — they talk to reception. Reception handles identity checks, routes them to the right department, and enforces house rules." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The gateway centralises cross-cutting concerns: <strong>authentication</strong> (verify JWT/API key), <strong>rate limiting</strong> (per client), <strong>routing</strong> (path → service), <strong>SSL termination</strong>, and <strong>request/response transformation</strong>. Backend services become simpler because they assume requests are already validated. Popular choices: AWS API Gateway, Kong, Nginx, Envoy.</p><p style={{margin:0}}>Watch out: the gateway becomes a latency-adding hop in every request path — misconfigured timeouts or plugin chains can silently inflate p99 latency. Route rules and auth policies updated in the gateway can lag behind service deployments, causing 401s or 404s in production.</p></div>,
    keyPoints: ["Single entry point for all clients", "Centralises auth, rate limiting, and routing", "Backends stay simple — they trust the gateway", "The gateway itself must be HA — it is a single point of failure for all traffic", "Avoid pushing business logic into the gateway; keep it a thin routing and policy layer"],
  },
  "system-design:Service Mesh": {
    oneLine: "A service mesh injects a sidecar proxy into every pod so that retries, mTLS, tracing, and traffic management happen at the infrastructure layer — not in application code.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Sidecars intercept all traffic — app code stays simple.">
        <DiagBox x={20} y={30} w={80} h={40} label="Service A" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={20} y={90} w={80} h={40} label="Sidecar" sub="proxy" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={300} y={30} w={80} h={40} label="Service B" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={300} y={90} w={80} h={40} label="Sidecar" sub="proxy" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={100} y1={110} x2={298} y2={110} color={h.base} label="mTLS · retries · tracing" />
        <DiagBox x={155} y={155} w={150} h={36} label="Control Plane" sub="Istio / Linkerd" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <DiagArrow x1={60} y1={130} x2={175} y2={153} color={s} dashed />
        <DiagArrow x1={340} y1={130} x2={285} y2={153} color={s} dashed />
      </DiagFrame>
    ); },
    analogy: { title: "Like a dedicated security escort for every employee", text: "Instead of each employee learning security protocols, a trained escort accompanies every person. Policies change centrally — employees just do their jobs." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A service mesh (Istio, Linkerd) deploys a lightweight proxy sidecar next to each service instance. All inbound and outbound traffic flows through the sidecar, which enforces <strong>mTLS</strong> (mutual auth), circuit breaking, retries, and emits traces — without any code changes in the service. A central <strong>control plane</strong> pushes policy updates to all sidecars.</p><p style={{margin:0}}>Watch out: each sidecar proxy adds 1–2 ms per hop and consumes additional CPU and memory per pod. When the control plane (e.g., Istio Pilot) is unavailable, sidecars cannot refresh routing configuration, causing stale rules to persist and new deployments to fail traffic registration.</p></div>,
    keyPoints: ["Sidecars handle retries, mTLS, and tracing transparently", "No code changes needed in services", "Control plane pushes policy to all proxies centrally", "Each sidecar adds 1–2 ms of latency per hop at the infrastructure layer", "Sidecar injection must complete before a pod makes outbound calls or mTLS guarantees can be bypassed"],
  },
  "system-design:Circuit Breaker Pattern": {
    oneLine: "A circuit breaker wraps calls to a dependency and trips open when failures pile up — failing fast instead of queuing doomed requests until the whole system backs up.",
    Diagram: CircuitBreakerDiagram,
    analogy: { title: "Like the breaker in your home", text: "When a circuit overloads, the breaker trips and cuts power rather than letting wiring melt. After a moment you flip it back to test — if all is well, power resumes." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Three states: <strong>Closed</strong> (calls flow normally, failures counted), <strong>Open</strong> (calls fail instantly without hitting the dependency), <strong>Half-open</strong> (probe calls test recovery). Failing fast frees threads and gives the struggling service room to recover instead of being hammered. Libraries: Resilience4j, Polly, Hystrix.</p><p style={{margin:0}}>Watch out: each service instance tracks failures independently in memory, so the circuit never trips cluster-wide unless state is centralised (e.g., in Redis). Thresholds calibrated on normal traffic become hair-triggers during spikes, causing false trips that take down a healthy service at peak load.</p></div>,
    keyPoints: ["Closed → Open → Half-open → Closed", "Open state prevents cascading failure", "Give struggling services breathing room to recover", "Distributed deployments need shared state for accurate cluster-wide trip logic", "Half-open probe calls must be throttled to avoid a thundering herd on the recovering dependency"],
  },
  "system-design:Saga Pattern": {
    oneLine: "A saga breaks a distributed transaction into a sequence of local transactions, each publishing an event — and if any step fails, compensating transactions undo the previous steps.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Choreography saga: each service listens for events and emits the next one — or a compensation on failure.">
        {["Order svc","Payment svc","Inventory svc"].map((lbl,i)=>(
          <g key={i}>
            <DiagBox x={10+i*148} y={40} w={130} h={40} label={lbl} fill={i===1?h.soft:"var(--card)"} stroke={i===1?h.base:s} text={i===1?h.ink:"var(--ink)"} />
            {i<2&&<DiagArrow x1={140+i*148} y1={60} x2={158+i*148} y2={60} color={h.base} label="event" />}
          </g>
        ))}
        <text x={230} y={110} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">── failure at any step ──▶</text>
        {["Restore inventory","Refund payment","Cancel order"].map((lbl,i)=>(
          <g key={i}>
            <DiagBox x={10+(2-i)*148} y={130} w={130} h={40} label={lbl} sub="compensate" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
            {i<2&&<DiagArrow x1={158+(1-i)*148} y1={150} x2={140+(1-i)*148} y2={150} color={s} dashed />}
          </g>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Like a multi-stop flight booking", text: "Booking flight + hotel + car one step at a time — if the car hire fails, the hotel is cancelled and the flight refunded. Each cancellation is its own transaction." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Sagas avoid distributed locks. <strong>Choreography</strong>: each service listens for an event and emits the next, with each service responsible for its own compensation. <strong>Orchestration</strong>: a central saga orchestrator commands each step and handles compensation. Use sagas when a business operation spans multiple services that each have their own database.</p><p style={{margin:0}}>Watch out: compensating transactions must be idempotent — a choreography saga can re-deliver an event after a network timeout, triggering duplicate charges or double inventory deductions if handlers are not idempotent. Each forward step needs a tested, maintained undo path.</p></div>,
    keyPoints: ["Chains local transactions instead of distributed ones", "Compensation transactions undo on failure", "Choreography vs orchestration: decentralised vs coordinated", "Every forward step requires a tested, idempotent compensating action", "Temporary inconsistency between steps forces consumers to handle intermediate states explicitly"],
  },
  "system-design:Fault Tolerance & Redundancy": {
    oneLine: "Fault tolerance means the system keeps working when components fail; redundancy achieves that by running multiple copies so no single failure takes everything down.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Active–passive: traffic flows to primary; standby takes over on failure.">
        <DiagBox x={10} y={77} w={100} h={46} label="Clients" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={50} w={120} h={46} label="Primary" sub="active" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={120} w={120} h={46} label="Standby" sub="passive" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={100} x2={173} y2={73} color={h.base} label="traffic" />
        <line x1={235} y1={96} x2={235} y2={118} stroke={s} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={265} y={110} fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">heartbeat</text>
        <DiagArrow x1={295} y1={143} x2={360} y2={143} color={h.base} dashed label="failover" />
        <DiagBox x={362} y={120} w={90} h={46} label="Takes over" fill={h.soft} stroke={h.base} text={h.ink} rx={8} />
      </DiagFrame>
    ); },
    analogy: { title: "Like a spare tyre", text: "You don't drive on the spare — it sits in the boot until the main tyre fails. When it does, you're not stranded: redundancy buys you time to get back on the road." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Redundancy eliminates single points of failure by duplicating critical components: servers, power supplies, network links, databases. <strong>Active–active</strong> runs all replicas simultaneously and shares the load. <strong>Active–passive</strong> keeps standby warm and promotes it on failure. Combined with health checks and automated failover, redundancy turns hardware failures into brief blips.</p><p style={{margin:0}}>Watch out: if replication lag is not monitored, a passive replica that takes over may serve data that is seconds or minutes behind, causing silent data loss at the exact moment fault tolerance is supposed to protect you. Redundancy without chaos testing gives false confidence.</p></div>,
    keyPoints: ["Eliminate every single point of failure", "Active–active shares load; active–passive keeps a warm spare", "Automate failover so humans don't need to respond at 3 am", "N+1 redundancy provisions one spare beyond minimum load capacity", "Geographic redundancy across AZs provides resilience against entire data center outages"],
  },
  "system-design:Failover Strategies": {
    oneLine: "Failover automatically switches traffic from a failed component to a healthy standby — the key variables are detection time, promotion time, and whether any data is lost.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Health probe detects failure → load balancer routes to replica → replica promoted.">
        <DiagBox x={10} y={77} w={100} h={46} label="LB / DNS" sub="health probe" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={50} w={110} h={40} label="Primary" sub="✕ failed" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={130} w={110} h={40} label="Replica" sub="promoted" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={110} y1={100} x2={173} y2={70} color={s} dashed label="was" />
        <DiagArrow x1={110} y1={100} x2={173} y2={150} color={h.base} label="now" />
        <text x={340} y={100} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">RTO: time to recover</text>
        <text x={340} y={120} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">RPO: data loss window</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a deputy who takes charge instantly", text: "When the mayor is incapacitated, the deputy steps in without a vote — city business continues with minimal interruption." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Two key metrics: <strong>RTO</strong> (Recovery Time Objective) — how long the system can be down, and <strong>RPO</strong> (Recovery Point Objective) — how much data loss is acceptable. Synchronous replication reduces RPO to zero but adds write latency. DNS failover is simple but slow (TTL delays). Cloud load balancers with health checks can fail over in under 30 seconds.</p><p style={{margin:0}}>Watch out: without proper fencing, both primary and standby can simultaneously believe they are active (split-brain), accepting conflicting writes. A stale standby promoted during failover silently loses committed transactions that had not yet replicated.</p></div>,
    keyPoints: ["RTO: max acceptable downtime", "RPO: max acceptable data loss", "Automated health-check failover beats manual intervention every time", "Synchronous replication achieves near-zero RPO but adds write-path latency on every commit", "Heartbeat-based failure detection must use fencing or quorum to prevent split-brain promotion"],
  },
  "system-design:Chaos Engineering": {
    oneLine: "Chaos engineering deliberately injects failures into a live system to discover weaknesses before they manifest as real outages — you break it on your terms, not a customer's.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Chaos monkey injects faults; system should stay within steady-state behaviour.">
        <DiagBox x={10} y={77} w={110} h={46} label="Production" sub="system" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={50} w={110} h={46} label="Kill instance" fill={h.soft} stroke={h.base} text={h.ink} rx={8} />
        <DiagBox x={175} y={120} w={110} h={46} label="Inject latency" fill={h.soft} stroke={h.base} text={h.ink} rx={8} />
        <DiagBox x={340} y={77} w={110} h={46} label="Observe &" sub="learn" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={120} y1={90} x2={173} y2={73} color={h.base} label="inject" />
        <DiagArrow x1={120} y1={110} x2={173} y2={143} color={h.base} />
        <DiagArrow x1={285} y1={73} x2={338} y2={90} color={s} />
        <DiagArrow x1={285} y1={143} x2={338} y2={110} color={s} />
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">known blast radius &gt; unknown surprise</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like fire drills", text: "Instead of hoping you never have a fire, you schedule a drill. You find the exit-sign that's burned out and the door that's stuck — before the real emergency." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The discipline: define a steady-state hypothesis (e.g. p99 latency &lt; 200 ms), inject a failure (kill a node, saturate a network link, corrupt a dependency), and verify the system stays within the hypothesis. Netflix's Chaos Monkey pioneered this. Start in non-production, build confidence, then run in production during low-traffic hours.</p><p style={{margin:0}}>Watch out: always configure an automated halt condition — if no kill switch is set, an experiment can continue after the system breaches SLO thresholds, turning a controlled test into a prolonged production incident. Without a quantified steady-state metric, results are inconclusive.</p></div>,
    keyPoints: ["Find weaknesses on your terms, not during an incident", "Define steady-state hypothesis before each experiment", "Start small in staging; graduate to production", "Always configure a kill switch to abort the experiment if SLOs are breached", "Unbounded blast radius — always scope experiments to avoid hitting shared databases or brokers"],
  },
  "system-design:SLA / SLO / SLI": {
    oneLine: "SLIs measure what's actually happening, SLOs are internal targets you set for those measurements, and SLAs are the contractual promises you make to customers — violations have consequences.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="SLI (measured) feeds into SLO (target) which underlies the SLA (contract).">
        <DiagBox x={10} y={77} w={100} h={46} label="SLI" sub="measured" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={60} w={110} h={80} label="SLO" sub="internal target" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={350} y={77} w={100} h={46} label="SLA" sub="contract" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={100} x2={173} y2={100} color={h.base} label="feeds" />
        <DiagArrow x1={285} y1={100} x2={348} y2={100} color={h.base} label="backs" />
        <text x={230} y={170} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">SLO tighter than SLA → buffer for fixes before breach</text>
      </DiagFrame>
    ); },
    analogy: { title: "Speedometer, speed limit, and a contract", text: "The speedometer is your SLI. Your personal target of 65 mph is your SLO. The legal speed limit — with penalties — is the SLA." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>SLI</strong>: a concrete metric (success rate, p99 latency, error rate). <strong>SLO</strong>: the target value for an SLI that your team commits to internally (e.g. 99.9% success rate). <strong>SLA</strong>: a customer-facing contract backed by the SLO, with financial penalties for breaches. Set your SLO tighter than the SLA to have an error budget — room to absorb incidents before a contract violation.</p><p style={{margin:0}}>Watch out: measuring SLI only at the load balancer but excluding downstream dependency timeouts makes SLI look healthy while users experience cascading failures. Using a 30-day rolling window can mask a two-hour outage that consumed the entire monthly budget in one incident.</p></div>,
    keyPoints: ["SLI: what you measure, SLO: what you aim for, SLA: what you promise", "Error budget = 1 − SLO — spend it on features, not outages", "SLO should always be stricter than the SLA", "SLO-driven alerting focuses on user-impacting burn rates, reducing noisy threshold alerts", "SLAs set looser than SLOs give engineering a buffer before contract penalties trigger"],
  },
  "system-design:Consistent Hashing": {
    oneLine: "Consistent hashing places both keys and nodes on a virtual ring so that when a node is added or removed, only a fraction of keys need to move — not everything.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Keys and nodes share a ring — each key is served by the next node clockwise.">
        <circle cx={230} cy={100} r={80} fill="none" stroke={s} strokeWidth="2" />
        {[0,1,2,3].map(i=>{
          const a=i*Math.PI/2-Math.PI/4; const r=80;
          const nx=230+r*Math.cos(a), ny=100+r*Math.sin(a);
          return <circle key={i} cx={nx} cy={ny} r={14} fill={h.soft} stroke={h.base} strokeWidth="2" />;
        })}
        {[0,1,2,3].map(i=>{
          const a=i*Math.PI/2-Math.PI/4; const r=80;
          const nx=230+r*Math.cos(a), ny=100+r*Math.sin(a);
          return <text key={i} x={nx} y={ny+4} textAnchor="middle" fontSize="9" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">{`N${i+1}`}</text>;
        })}
        {[1,2,3].map(i=>{
          const a=i*Math.PI/2; const r=80;
          const kx=230+r*Math.cos(a), ky=100+r*Math.sin(a);
          return <rect key={i} x={kx-8} y={ky-8} width={16} height={16} rx={4} fill="var(--card)" stroke={s} strokeWidth="1.5" />;
        })}
        <text x={230} y={104} textAnchor="middle" fontSize="9" fill={s} fontFamily="var(--font-body,system-ui)">key ring</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like seats at a round table", text: "Each guest (node) claims the seats to their left. Add a new guest — only nearby seats shuffle; everyone else stays put." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Traditional modular hashing moves almost all keys when the cluster size changes. Consistent hashing maps both keys and nodes to a unit ring. A key is owned by the first node clockwise from its hash. Add a node: only the keys between it and its predecessor move. Remove a node: only its keys redistribute. Virtual nodes (vnodes) smooth out uneven distributions.</p><p style={{margin:0}}>Watch out: with fewer than 100–150 vnodes per physical node, the ring remains uneven and one node can hold 2–3× the data of another. When a node fails, its entire key range shifts to one clockwise neighbor, potentially doubling that node's load and triggering a cascade if the cluster is already near capacity.</p></div>,
    keyPoints: ["Adding/removing a node moves only O(K/N) keys", "Virtual nodes spread load evenly across real nodes", "Used in Cassandra, DynamoDB, and many CDNs", "A node failure shifts its key range to one clockwise neighbor — size vnodes generously to absorb this", "No central routing table needed — any client computes key ownership independently from the ring"],
  },
  "system-design:Consensus (Raft Algorithm)": {
    oneLine: "Raft is the algorithm that lets a cluster of nodes agree on a single sequence of values even when some nodes crash — by electing a leader who proposes all changes.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Leader elected by majority vote; all writes go through the leader and are replicated.">
        <DiagBox x={160} y={10} w={130} h={50} label="Leader" sub="proposes entries" fill={h.soft} stroke={h.base} text={h.ink} />
        {[20,320].map((x,i)=>(
          <g key={i}>
            <DiagBox x={x} y={130} w={110} h={46} label="Follower" sub={i===0?"voted for":"voted for"} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={225} y1={60} x2={x+55} y2={128} color={h.base} label={i===0?"replicate":undefined} dashed />
            <DiagArrow x1={x+55} y1={128} x2={225} y2={60} color={s} dashed label={i===0?"ack":undefined} lx={i===0?140:310} ly={95} />
          </g>
        ))}
        <text x={230} y={195} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">commit requires majority acknowledgement</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a committee with a chairperson", text: "The chair proposes every motion. A motion only passes when the majority agrees. If the chair is absent, the committee elects a new one before any more business is done." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Raft divides consensus into three sub-problems: <strong>leader election</strong> (the node with the most up-to-date log wins a majority vote), <strong>log replication</strong> (leader appends entries and replicates to followers before committing), and <strong>safety</strong> (a committed entry is guaranteed to appear in all future leaders' logs). Used in etcd, CockroachDB, and Consul.</p><p style={{margin:0}}>Watch out: all writes are serialized through a single leader, so a hot-spot workload or a leader on degraded hardware saturates its disk or network and stalls the entire cluster write path. Quorum writes mean latency is bounded by the slowest responding majority member.</p></div>,
    keyPoints: ["One leader per term — all writes go through it", "Commit requires acknowledgement from a majority", "Leader election restarts automatically when leader is lost", "A cluster of 2f+1 nodes tolerates f simultaneous failures", "The single-leader model caps write throughput to one node's capacity"],
  },
  "system-design:Distributed Transactions (2PC)": {
    oneLine: "Two-phase commit coordinates an atomic write across multiple databases — all participants vote to commit, and only if every one agrees does the coordinator make it permanent.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Phase 1: vote (prepare). Phase 2: commit or abort based on all votes.">
        <DiagBox x={160} y={10} w={130} h={40} label="Coordinator" fill={h.soft} stroke={h.base} text={h.ink} />
        {[40,320].map((x,i)=>(
          <g key={i}>
            <DiagBox x={x} y={80} w={110} h={40} label={`Participant ${i+1}`} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagBox x={x} y={150} w={110} h={40} label={i===0?"VOTE YES":"VOTE YES"} sub="prepared" fill={h.soft} stroke={h.base} text={h.ink} rx={8} />
            <DiagArrow x1={225} y1={50} x2={x+55} y2={78} color={h.base} label={i===0?"prepare":undefined} />
            <DiagArrow x1={x+55} y1={120} x2={225} y2={148} color={s} dashed />
            <DiagArrow x1={225} y1={148} x2={x+55} y2={148} color={h.base} dashed label={i===0?"commit":undefined} />
          </g>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Like asking every guest if they can attend a meeting", text: "You send a 'can you make Thursday?' email. Only if every single person replies 'yes' do you send the calendar invite. One 'no' and you reschedule." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>In <strong>Phase 1 (Prepare)</strong>, the coordinator asks each participant to lock resources and vote yes/no. In <strong>Phase 2 (Commit/Abort)</strong>, if all voted yes the coordinator broadcasts commit; otherwise it broadcasts abort. 2PC is blocking — if the coordinator crashes after prepare, participants are stuck holding locks. Consider Saga pattern or distributed databases (CockroachDB) for production-grade solutions.</p><p style={{margin:0}}>Watch out: a network partition after some participants receive "commit" and others do not leaves the system in a split-brain state — part of the data committed, part not. A single slow participant blocks the entire transaction because the coordinator must wait for all votes before proceeding.</p></div>,
    keyPoints: ["All participants must vote yes or the transaction aborts", "Coordinator crash during phase 2 can leave participants stuck", "Saga pattern or distributed DBs are often better in practice", "2PC holds locks across all participants for both phases, limiting throughput under high concurrency", "XA transaction recovery after a coordinator crash requires manual DBA intervention"],
  },
  "system-design:Vector Clocks": {
    oneLine: "Vector clocks track causality in distributed systems by giving each node its own counter — comparing two vectors reveals whether one event happened before another or if they're concurrent.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Node A and B exchange messages; clocks advance — concurrent updates detected by incomparable vectors.">
        <text x={80} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill={s} fontFamily="var(--font-body,system-ui)">Node A</text>
        <text x={380} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill={s} fontFamily="var(--font-body,system-ui)">Node B</text>
        <line x1={80} y1={25} x2={80} y2={165} stroke={s} strokeWidth="1.5" />
        <line x1={380} y1={25} x2={380} y2={165} stroke={s} strokeWidth="1.5" />
        {[["{A:1,B:0}",40],["{A:2,B:0}",90],["{A:2,B:2}",150]].map(([v,y],i)=>(
          <text key={i} x={80} y={y as number} textAnchor="middle" fontSize="9.5" fill={h.ink} fontFamily="var(--font-body,system-ui)">{v}</text>
        ))}
        {[["{A:0,B:1}",55],["{A:2,B:2}",115],["{A:2,B:3}",165]].map(([v,y],i)=>(
          <text key={i} x={380} y={y as number} textAnchor="middle" fontSize="9.5" fill={h.ink} fontFamily="var(--font-body,system-ui)">{v}</text>
        ))}
        <DiagArrow x1={80} y1={90} x2={378} y2={115} color={h.base} label="sync" />
        <DiagArrow x1={380} y1={55} x2={82} y2={150} color={s} dashed label="sync" lx={230} ly={110} />
      </DiagFrame>
    ); },
    analogy: { title: "Like a shared to-do list with initials", text: "Each person writes their initials next to changes they make. You can tell whose change came from whose version — and when two people changed the same item 'at the same time', both sets of initials are there." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Each node maintains a vector of counters — one per node. On a local event, increment your own counter. On receiving a message, merge by taking the max of each position and then increment your counter. Two events are causally related if one vector dominates the other. If neither dominates, the events are <strong>concurrent</strong> and may conflict — your application must resolve.</p><p style={{margin:0}}>Watch out: in systems where every client or ephemeral worker gets its own vector entry, vectors grow unboundedly — inflating payload size and making comparison O(n) per operation. If a restarted node reuses its old ID without resetting its counter, its events appear causally prior to newer events from other nodes.</p></div>,
    keyPoints: ["Each node has its own counter in the vector", "One vector dominates another = causal relationship", "Incomparable vectors = concurrent, possibly conflicting updates", "Vector size scales linearly with the number of unique writers — unbounded node IDs cause clock explosion", "Conflict resolution logic must be implemented at the application layer; vector clocks only detect conflicts"],
  },
  "system-design:Logging vs Metrics vs Tracing": {
    oneLine: "Logs tell you what happened in words, metrics show trends as numbers, and traces follow a request's path through every service — together they form complete observability.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Three complementary signals — use logs to investigate, metrics to detect, traces to locate.">
        <DiagBox x={10} y={50} w={130} h={100} label="Logs" sub="what happened" fill="var(--card)" stroke={s} text="var(--ink)" />
        <text x={75} y={105} textAnchor="middle" fontSize="9.5" fill="var(--ink-2)" fontFamily="var(--font-body,system-ui)">ERROR 404 /api/user</text>
        <text x={75} y={120} textAnchor="middle" fontSize="9.5" fill="var(--ink-2)" fontFamily="var(--font-body,system-ui)">free text, searchable</text>
        <DiagBox x={165} y={50} w={130} h={100} label="Metrics" sub="how much / how fast" fill={h.soft} stroke={h.base} text={h.ink} />
        <text x={230} y={105} textAnchor="middle" fontSize="9.5" fill={h.ink} fontFamily="var(--font-body,system-ui)">rps=142 p99=88ms</text>
        <text x={230} y={120} textAnchor="middle" fontSize="9.5" fill={h.ink} fontFamily="var(--font-body,system-ui)">aggregated, alertable</text>
        <DiagBox x={320} y={50} w={130} h={100} label="Traces" sub="which path, how long" fill="var(--card)" stroke={s} text="var(--ink)" />
        <text x={385} y={105} textAnchor="middle" fontSize="9.5" fill="var(--ink-2)" fontFamily="var(--font-body,system-ui)">A→B 12ms B→C 34ms</text>
        <text x={385} y={120} textAnchor="middle" fontSize="9.5" fill="var(--ink-2)" fontFamily="var(--font-body,system-ui)">distributed spans</text>
      </DiagFrame>
    ); },
    analogy: { title: "Security footage vs. door counter vs. GPS tracker", text: "Logs are the CCTV footage of what happened. Metrics are the people-counter above the door. Traces are GPS tracking each visitor's path through the building." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Logs</strong>: timestamped, structured text events — great for post-incident investigation. <strong>Metrics</strong>: numeric time-series (counters, gauges, histograms) — cheap to aggregate, ideal for dashboards and alerts. <strong>Traces</strong>: distributed spans linked by a trace ID — show latency and errors across service boundaries. The ELK stack, Prometheus, and Jaeger/Tempo are the common implementations.</p><p style={{margin:0}}>Watch out: a single service failing to forward W3C TraceContext headers breaks the trace at that hop, making spans appear as disconnected orphans. Storing only average latency in metrics masks tail-latency problems — p99 can be 10× the mean and an SLO breach goes undetected.</p></div>,
    keyPoints: ["Metrics detect problems, traces locate them, logs explain them", "All three are needed — none fully replaces the others", "Correlate via a shared trace ID for fast incident response", "Never expose high-cardinality labels (e.g., user ID) as metric tags — it explodes time-series cardinality", "Sampling in tracing means rare error paths may never be captured — tune sampling carefully"],
  },
  "system-design:The Three Pillars": {
    oneLine: "Logs, metrics, and traces are the three pillars of observability — together they let you ask any question about a system's behaviour without deploying new code to answer it.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="All three pillars converge into a shared observability platform.">
        <DiagBox x={20} y={20} w={110} h={46} label="Logs" sub="events" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={170} y={20} w={110} h={46} label="Metrics" sub="numbers" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={320} y={20} w={110} h={46} label="Traces" sub="spans" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={145} y={140} w={160} h={50} label="Observability" sub="platform" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={75} y1={66} x2={195} y2={138} color={h.base} />
        <DiagArrow x1={225} y1={66} x2={225} y2={138} color={h.base} />
        <DiagArrow x1={375} y1={66} x2={265} y2={138} color={h.base} />
        <text x={230} y={210} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">unknown-unknowns solvable without redeploying</text>
      </DiagFrame>
    ); },
    analogy: { title: "Diagnosis by symptoms, vitals, and X-ray", text: "A doctor uses verbal symptoms (logs), numerical vitals (metrics), and imaging (traces) together — no single source gives the complete picture." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Observability is the ability to infer a system's internal state from its external outputs. The three pillars provide complementary views: metrics catch regressions early (alert on p99 spike), traces pinpoint where latency accumulates (span waterfall), and logs give the full narrative (error message, stack trace, request context). A correlation ID ties all three to a single user request.</p><p style={{margin:0}}>Watch out: all three pillars depend on instrumentation in the code — inconsistent trace context propagation across services creates orphan spans and gaps in coverage. Aggressive head-based trace sampling discards the rare slow or error requests that matter most for debugging.</p></div>,
    keyPoints: ["Metrics alert, traces locate, logs explain", "Shared trace/correlation ID links all three signals", "True observability: answer new questions without new code", "OpenTelemetry auto-instrumentation retrofits observability without rewriting business logic", "All three pillars depend on instrumentation — consistent propagation across every service is mandatory"],
  },
  "system-design:Alerting Pipelines": {
    oneLine: "An alerting pipeline continuously evaluates metrics against rules, deduplicates noise, groups related alerts, and routes them to the right on-call engineer — fast.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 180" caption="Metrics → Alert rule → Dedup & group → Route → On-call.">
        {["Metrics","Alert Rules","Alert Manager","Router","On-Call"].map((lbl,i)=>(
          <g key={i}>
            <DiagBox x={10+i*88} y={70} w={80} h={40} label={lbl} fill={i===2?h.soft:i===4?"var(--card)":"var(--card)"} stroke={i===2?h.base:s} text={i===2?h.ink:"var(--ink)"} rx={i===4?20:10} />
            {i<4&&<DiagArrow x1={90+i*88} y1={90} x2={98+i*88} y2={90} color={h.base} />}
          </g>
        ))}
        <text x={230} y={145} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">AlertManager deduplicates · groups · silences</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a newsroom editor", text: "Dozens of reporters file stories. The editor deduplicates duplicates, groups related stories into one page, and routes breaking news to the right section — one coherent paper, not chaos." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Prometheus AlertManager is the reference implementation: alerting rules fire when a PromQL expression crosses a threshold, alerts are grouped by labels, deduplicated, and silenced during maintenance windows. Routing rules send critical alerts via PagerDuty and warnings via Slack. <strong>Alert fatigue</strong> is the main failure mode — be ruthless about signal quality over volume.</p><p style={{margin:0}}>Watch out: a silenced alert forgotten after an incident leaves a production degradation undetected for days. A team renaming their PagerDuty service or Slack channel without updating routing rules causes critical pages to be silently dropped instead of delivered.</p></div>,
    keyPoints: ["Rules evaluate continuously against metric time-series", "Dedup and grouping prevent alert storms", "Route by severity: critical → pager, warning → chat", "Escalation policies page a backup if the first responder doesn't acknowledge", "Alert fatigue is the main failure mode — prioritise signal quality over alert volume"],
  },
  "system-design:OAuth 2.0 / JWT Flow": {
    oneLine: "OAuth 2.0 lets a user grant a third-party app access to their data without sharing their password — the authorization server issues tokens that the app uses to call APIs.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Authorization Code flow: user authenticates once, app gets short-lived access tokens.">
        <DiagBox x={10} y={80} w={90} h={40} label="User / Browser" fill="var(--card)" stroke={s} text="var(--ink)" rx={10} />
        <DiagBox x={175} y={30} w={110} h={40} label="Auth Server" sub="login + consent" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={130} w={110} h={40} label="Resource API" sub="protected data" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={350} y={80} w={100} h={40} label="Client App" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={100} y1={90} x2={173} y2={50} color={h.base} label="1. login" />
        <DiagArrow x1={173} y1={50} x2={348} y2={90} color={h.base} label="2. code" />
        <DiagArrow x1={348} y1={100} x2={287} y2={50} color={s} label="3. exchange" />
        <DiagArrow x1={350} y1={110} x2={287} y2={150} color={h.base} label="4. access token" />
        <text x={230} y={195} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">JWT encodes claims — stateless, self-contained</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a valet key", text: "You hand the valet a key that opens the car door but not the glovebox or boot. The parking service gets exactly the access it needs — no more." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>OAuth 2.0 defines grant types. The most common for web apps is <strong>Authorization Code + PKCE</strong>: user logs in at the auth server, gets a code, the app exchanges it for an access token (and optionally a refresh token). <strong>JWTs</strong> encode claims (user ID, scopes, expiry) in a signed payload — APIs verify the signature without calling the auth server on every request. Refresh tokens allow long sessions without re-login.</p><p style={{margin:0}}>Watch out: JWTs remain valid until expiry and cannot be instantly revoked without a blocklist, negating the stateless benefit. If the server accepts multiple JWT algorithms, an attacker can swap the header to "none" or "HS256" with the public key as the secret — always pin the accepted algorithm explicitly.</p></div>,
    keyPoints: ["User authorises the app, never shares their password", "JWT: self-contained signed token, no auth-server roundtrip on each API call", "Short-lived access tokens + refresh tokens balance security and UX", "JWTs cannot be instantly revoked — use short expiry windows and a blocklist for sensitive operations", "JWT payload is encoded but not encrypted — never put secrets or sensitive PII in claims"],
  },
  "system-design:Rate Limiting Patterns": {
    oneLine: "Token bucket, leaky bucket, and sliding window are the three dominant algorithms for throttling requests — each makes a different trade-off between burstiness and smoothness.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Token bucket allows bursts; leaky bucket enforces constant rate; sliding window counts requests in a rolling window.">
        <DiagBox x={10} y={50} w={130} h={90} label="Token Bucket" fill={h.soft} stroke={h.base} text={h.ink} />
        <text x={75} y={105} textAnchor="middle" fontSize="9.5" fill={h.ink} fontFamily="var(--font-body,system-ui)">refills at rate r</text>
        <text x={75} y={122} textAnchor="middle" fontSize="9.5" fill={h.ink} fontFamily="var(--font-body,system-ui)">allows bursts</text>
        <DiagBox x={160} y={50} w={130} h={90} label="Leaky Bucket" fill="var(--card)" stroke={s} text="var(--ink)" />
        <text x={225} y={105} textAnchor="middle" fontSize="9.5" fill="var(--ink-2)" fontFamily="var(--font-body,system-ui)">constant drain rate</text>
        <text x={225} y={122} textAnchor="middle" fontSize="9.5" fill="var(--ink-2)" fontFamily="var(--font-body,system-ui)">smooths bursts</text>
        <DiagBox x={310} y={50} w={140} h={90} label="Sliding Window" fill="var(--card)" stroke={s} text="var(--ink)" />
        <text x={380} y={105} textAnchor="middle" fontSize="9.5" fill="var(--ink-2)" fontFamily="var(--font-body,system-ui)">rolling time window</text>
        <text x={380} y={122} textAnchor="middle" fontSize="9.5" fill="var(--ink-2)" fontFamily="var(--font-body,system-ui)">precise per client</text>
      </DiagFrame>
    ); },
    analogy: { title: "Bucket with holes, bucket with tokens, stopwatch", text: "Water poured in drains at a fixed rate (leaky). Tokens drop in and you spend them in a burst if you saved up (token). A stopwatch resets every minute and counts your requests (sliding)." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Token bucket</strong>: tokens accumulate up to a max capacity; each request spends one. Allows controlled bursts. <strong>Leaky bucket</strong>: requests enter a queue that drains at a fixed rate; bursts are absorbed and smoothed. <strong>Sliding window</strong>: counts requests in the last N seconds, updated continuously — no edge spikes at window boundaries.</p><p style={{margin:0}}>Watch out: fixed window implementations allow a client to send the full quota at the end of one window and immediately again at the start of the next, effectively doubling throughput at every boundary. When the centralized Redis store becomes unavailable, many implementations fail open and stop enforcing limits entirely.</p></div>,
    keyPoints: ["Token bucket: best when clients need short bursts", "Leaky bucket: best for smooth downstream rate", "Sliding window: most precise, slightly more memory per client", "Fixed windows allow 2× burst at window boundaries — use sliding window to eliminate edge spikes", "Distributed rate limiting requires a shared low-latency store; a Redis outage can silently disable all limits"],
  },
  "system-design:Zero Trust Architecture": {
    oneLine: "Zero Trust means no request is trusted by default — every access is verified, least-privilege is enforced, and traffic is encrypted even inside the network perimeter.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Every hop is verified — internal requests are treated the same as external ones.">
        <DiagBox x={10} y={77} w={100} h={46} label="User / Device" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={60} w={120} h={80} label="Policy Engine" sub="verify every request" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={355} y={77} w={95} h={46} label="Resource" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={100} x2={173} y2={100} color={h.base} label="authenticate" />
        <DiagArrow x1={295} y1={100} x2={353} y2={100} color={h.base} label="allow" />
        <text x={230} y={170} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">identity + device posture + context checked every time</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like showing ID at every door inside a building", text: "In a traditional office you badge in once and roam freely. Zero Trust puts a badge reader on every door — even to get from the kitchen to your own desk." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Zero Trust replaces the implicit trust of a VPN perimeter with continuous verification. Every request must present identity, every access is checked against policy (who, what device, what time, what data), and least-privilege is enforced so compromised credentials cause minimal blast radius. mTLS between services, short-lived certificates, and just-in-time provisioning are the implementation primitives.</p><p style={{margin:0}}>Watch out: short-lived workload certificates have fast TTLs — if automatic rotation fails silently, services begin rejecting each other's connections with cryptic TLS handshake errors. Over-permissive service accounts granted during initial rollout recreate the flat-network blast radius Zero Trust was meant to eliminate.</p></div>,
    keyPoints: ["Never trust, always verify — including internal traffic", "Least-privilege: grant minimum access needed", "Continuous verification beats a one-time perimeter login", "mTLS between services ensures both client and server identities are verified on every call", "Workload identity certificates must auto-rotate — expired certificates silently break service-to-service calls"],
  },

  // ── Design Patterns ────────────────────────────────────────────────────────
  "design-patterns:Abstract Factory": {
    oneLine: "Abstract Factory produces families of related objects — you swap the whole factory and get a consistent set of products without touching the code that uses them.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Switch factories to get a matching family of products — client code is unchanged.">
        <DiagBox x={160} y={10} w={130} h={40} label="AbstractFactory" sub="interface" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={20} y={100} w={130} h={40} label="MacFactory" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={300} y={100} w={130} h={40} label="WinFactory" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={225} y1={50} x2={85} y2={98} color={s} />
        <DiagArrow x1={225} y1={50} x2={365} y2={98} color={s} />
        <DiagBox x={20} y={165} w={130} h={30} label="MacButton · MacDialog" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <DiagBox x={300} y={165} w={130} h={30} label="WinButton · WinDialog" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <DiagArrow x1={85} y1={140} x2={85} y2={163} color={h.base} />
        <DiagArrow x1={365} y1={140} x2={365} y2={163} color={h.base} />
      </DiagFrame>
    ); },
    analogy: { title: "Like a furniture brand's catalogue", text: "IKEA makes a matching sofa, chair, and table in every style. You pick the style (factory) and everything in it goes together — you don't mix and match construction methods." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Abstract Factory defines an interface with a method for each product type. Concrete factories implement all methods for a specific family. Client code only uses the factory interface, so swapping the factory — say, from light theme to dark theme — replaces all products consistently with no if/else logic scattered through the client.</p><p style={{margin:0}}>Watch out: adding a brand-new product type (e.g. a third widget kind) forces a change to every existing factory class — the pattern is closed to easy product extension.</p></div>,
    keyPoints: ["Produces consistent families of related objects", "Swap the factory to change the whole product family", "Client code depends only on abstract interfaces", "Adding a new product type forces changes to every factory"],
  },
  "design-patterns:Builder": {
    oneLine: "Builder constructs a complex object step by step, letting you produce different representations with the same construction process.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Director calls builder methods in order; builder assembles the parts; client gets the result.">
        <DiagBox x={10} y={77} w={100} h={46} label="Director" sub="defines steps" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={60} w={120} h={80} label="Builder" sub="builds parts" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={355} y={77} w={95} h={46} label="Product" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={100} x2={173} y2={100} color={h.base} label="1. buildStep" />
        <DiagArrow x1={295} y1={100} x2={353} y2={100} color={h.base} label="2. getResult" />
        <text x={230} y={170} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">same director, different builders → different products</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like ordering a custom pizza", text: "The cashier (director) calls out 'add base', 'add sauce', 'add toppings' in order. Whether the kitchen (builder) is making thin-crust or deep-dish, the steps are the same." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Builder separates <em>how</em> an object is constructed from <em>what</em> it looks like. A <strong>Director</strong> calls builder methods in a defined order; different <strong>ConcreteBuilder</strong>s produce different representations. This eliminates telescoping constructors when objects have many optional parameters — each step is explicit and named.</p><p style={{margin:0}}>Trade-off: each distinct product representation requires its own builder class, which grows code volume — overkill for objects with only a couple of fields.</p></div>,
    keyPoints: ["Separates construction logic from the final representation", "Eliminates constructors with dozens of optional parameters", "Director can be reused to build different product variants", "Requires a separate builder class per product representation"],
  },
  "design-patterns:Factory Method": {
    oneLine: "Factory Method lets subclasses decide which class to instantiate — the parent defines the creation interface, but children override it to return specific types.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Creator declares createProduct(); subclasses override it to return the concrete type.">
        <DiagBox x={155} y={10} w={140} h={40} label="Creator" sub="createProduct()" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={30} y={110} w={130} h={40} label="ConcreteCreatorA" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={290} y={110} w={130} h={40} label="ConcreteCreatorB" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={225} y1={50} x2={95} y2={108} color={s} />
        <DiagArrow x1={225} y1={50} x2={355} y2={108} color={s} />
        <DiagBox x={30} y={170} w={130} h={26} label="ProductA" fill="var(--card)" stroke={h.base} text="var(--ink)" rx={8} />
        <DiagBox x={290} y={170} w={130} h={26} label="ProductB" fill="var(--card)" stroke={h.base} text="var(--ink)" rx={8} />
        <DiagArrow x1={95} y1={150} x2={95} y2={168} color={h.base} />
        <DiagArrow x1={355} y1={150} x2={355} y2={168} color={h.base} />
      </DiagFrame>
    ); },
    analogy: { title: "Like a franchise with local kitchens", text: "McDonald's headquarters defines 'make a burger' — but each franchise kitchen decides exactly which suppliers and equipment to use. The recipe is the same; the factory differs." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Factory Method defines a <code>createProduct()</code> method in a base class but defers the instantiation to subclasses. The base class calls <code>createProduct()</code> internally — it works without knowing the concrete type. Adding a new product variant requires only a new subclass, not modifying existing code.</p><p style={{margin:0}}>Watch out: each new product type needs a new subclass of the creator, so the class hierarchy can expand quickly for what are sometimes simple variations.</p></div>,
    keyPoints: ["Parent defines the interface; subclasses choose the concrete type", "Open/closed: add new products without changing the creator", "Framework code can call createProduct() without knowing the concrete class", "Can require many creator subclasses just to vary the product type"],
  },
  "design-patterns:Prototype": {
    oneLine: "Prototype creates new objects by cloning an existing instance — useful when construction is expensive or complex and you want a ready-to-use copy.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 180" caption="Client calls clone() on a prototype; gets an independent copy with the same state.">
        <DiagBox x={30} y={70} w={140} h={50} label="Prototype" sub="original" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={285} y={70} w={140} h={50} label="Clone" sub="independent copy" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={170} y1={95} x2={283} y2={95} color={h.base} label="clone()" />
        <text x={230} y={155} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">deep copy — original and clone are independent</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like duplicating a document", text: "Instead of recreating a complex report from scratch, you 'Save As' an existing one. Editing the copy doesn't affect the original." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Prototype is useful when creating an object is expensive (e.g. heavy database queries, deep object graphs) and you frequently need similar objects. The <code>clone()</code> method must decide between a <strong>shallow copy</strong> (shared references) and a <strong>deep copy</strong> (fully independent). JavaScript's <code>structuredClone</code> and Java's <code>Cloneable</code> are common implementations.</p><p style={{margin:0}}>Watch out: objects with circular references can be tricky to clone correctly — deep-copy logic must detect and handle cycles to avoid infinite recursion.</p></div>,
    keyPoints: ["Avoid expensive re-initialisation by cloning an existing instance", "Deep copy vs shallow copy — choose based on whether inner objects should be shared", "Useful for default object configurations and undo/redo stacks", "Circular references require special handling during deep cloning"],
  },
  "design-patterns:Singleton": {
    oneLine: "Singleton ensures exactly one instance of a class exists and provides a global access point to it — though global state makes testing harder, so use sparingly.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 180" caption="All callers go through getInstance(), which returns the same object every time.">
        <DiagBox x={160} y={20} w={130} h={50} label="Singleton" sub="private constructor" fill={h.soft} stroke={h.base} text={h.ink} />
        {[20,160,300].map((x,i)=>(
          <g key={i}>
            <DiagBox x={x} y={130} w={110} h={36} label={`Caller ${i+1}`} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={x+55} y1={128} x2={225} y2={70} color={h.base} label={i===1?"getInstance()":undefined} />
          </g>
        ))}
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">same instance returned to all callers</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a country's president", text: "There is exactly one president at any given time. Everyone who needs to interact with the presidency goes to the same one — there is no second instance." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Singleton uses a private constructor and a static <code>getInstance()</code> method that lazily creates and caches the instance. Thread-safe implementations use double-checked locking or enum singletons (Java). Common uses: configuration objects, connection pools, loggers. The downside is global mutable state, which makes unit testing difficult — consider dependency injection instead.</p><p style={{margin:0}}>Watch out: in multi-threaded environments, naive lazy initialisation without synchronisation can create multiple instances — always guard the first-creation branch.</p></div>,
    keyPoints: ["One instance, globally accessible via getInstance()", "Thread safety requires careful lazy-initialisation", "Global state makes testing harder — prefer DI in most cases", "Can mask poor design by hiding tight coupling between modules"],
  },
  "design-patterns:Adapter": {
    oneLine: "Adapter wraps an incompatible class in a new interface so it looks like what the client expects — bridging old and new without changing either side.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 180" caption="Client calls the Target interface; Adapter translates to the Adaptee's incompatible interface.">
        <DiagBox x={10} y={77} w={100} h={40} label="Client" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={165} y={60} w={120} h={60} label="Adapter" sub="wraps adaptee" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={350} y={77} w={100} h={40} label="Adaptee" sub="legacy" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={97} x2={163} y2={90} color={h.base} label="target iface" />
        <DiagArrow x1={285} y1={90} x2={348} y2={97} color={s} label="adaptee call" />
        <text x={230} y={155} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">neither client nor adaptee is modified</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a travel plug adapter", text: "Your UK plug works the same as always. The adapter in the wall socket makes it fit the European outlet. Neither the plug nor the socket changes." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>The <strong>class adapter</strong> uses multiple inheritance (or implements the target while extending the adaptee). The <strong>object adapter</strong> wraps the adaptee by composition — more flexible and preferred. Use Adapter when integrating a third-party library, migrating to a new API, or unit-testing by adapting a real dependency to an interface.</p><p style={{margin:0}}>Trade-off: every adapted call passes through an extra layer of indirection — sometimes the simpler fix is to change the service's interface directly rather than wrapping it.</p></div>,
    keyPoints: ["Bridges incompatible interfaces without modifying either side", "Object adapter (composition) is preferred over class adapter (inheritance)", "Common for integrating third-party or legacy code", "Adds an extra indirection layer — consider modifying the service when feasible"],
  },
  "design-patterns:Bridge": {
    oneLine: "Bridge decouples an abstraction from its implementation so both can vary independently — avoiding an explosion of subclasses when you have two orthogonal dimensions of variation.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Abstraction delegates to Implementor — swap either side independently.">
        <DiagBox x={10} y={50} w={130} h={40} label="Abstraction" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={10} y={120} w={130} h={40} label="RefinedAbstraction" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={75} y1={90} x2={75} y2={118} color={s} />
        <DiagBox x={310} y={50} w={140} h={40} label="Implementor" sub="interface" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={260} y={120} w={80} h={40} label="ImplA" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={360} y={120} w={80} h={40} label="ImplB" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={380} y1={90} x2={300} y2={118} color={s} />
        <DiagArrow x1={380} y1={90} x2={400} y2={118} color={s} />
        <DiagArrow x1={140} y1={90} x2={308} y2={70} color={h.base} label="bridge →" />
      </DiagFrame>
    ); },
    analogy: { title: "Remote controls and devices", text: "A universal remote (abstraction) works with any TV or stereo (implementor). Adding a new remote doesn't require rewriting the TV, and a new TV doesn't break existing remotes." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Without Bridge, combining M abstractions and N implementations requires M×N subclasses. With Bridge, you have M + N classes. The abstraction holds a reference to an implementor interface and delegates work to it. Example: <code>Shape</code> (abstraction) × <code>Color</code> (implementor) — Circle/Square can each use Red/Blue without four concrete classes.</p><p style={{margin:0}}>Watch out: Bridge adds upfront structural complexity — it is hard to apply retroactively to a class with one obvious dimension of variation.</p></div>,
    keyPoints: ["Avoids M×N subclass explosion by separating two dimensions", "Both abstraction and implementation can evolve independently", "Use when you need to combine orthogonal features flexibly", "Implementation can be swapped at runtime via the bridge reference"],
  },
  "design-patterns:Composite": {
    oneLine: "Composite lets you compose objects into tree structures and treat individual objects and compositions identically — so client code doesn't care whether it's talking to a leaf or a subtree.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Root composite contains leaves and sub-composites — all respond to the same operation.">
        <DiagBox x={165} y={10} w={130} h={36} label="Component" sub="interface: operation()" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={60} y={100} w={110} h={40} label="Leaf" sub="no children" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={280} y={100} w={110} h={40} label="Composite" sub="holds children" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={225} y1={46} x2={115} y2={98} color={s} />
        <DiagArrow x1={225} y1={46} x2={335} y2={98} color={s} />
        <DiagBox x={250} y={165} w={80} h={30} label="Leaf" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={340} y={165} w={80} h={30} label="Leaf" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={335} y1={140} x2={290} y2={163} color={h.base} />
        <DiagArrow x1={335} y1={140} x2={380} y2={163} color={h.base} />
      </DiagFrame>
    ); },
    analogy: { title: "Like a file system", text: "A file and a folder are both 'things you can open'. A folder can contain files or other folders. You double-click either the same way — the folder just does more behind the scenes." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Composite implements a shared <code>Component</code> interface. <strong>Leaf</strong> nodes execute operations directly. <strong>Composite</strong> nodes forward the operation to each child recursively. The key benefit: client code calls <code>component.operation()</code> without checking whether it's a leaf or a subtree — the tree handles the recursion.</p><p style={{margin:0}}>Watch out: making the interface too general can make some component types awkward — leaves may be forced to stub out child-management methods that don't apply to them.</p></div>,
    keyPoints: ["Leaf and composite share the same interface", "Composite forwards operations to children recursively", "Client code treats individual items and whole trees identically", "Overly general interfaces can weaken type safety for leaves vs composites"],
  },
  "design-patterns:Decorator": {
    oneLine: "Decorator wraps an object in layers, each layer adding new behaviour at runtime — without changing the object's class or requiring dozens of subclasses.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Each wrapper delegates to the inner object and adds its own behaviour before or after.">
        <rect x={20} y={30} width={420} height={50} rx={10} fill="var(--card)" stroke={s} strokeWidth="1.5" />
        <rect x={50} y={40} width={360} height={30} rx={8} fill="var(--card)" stroke={s} strokeWidth="1.5" />
        <rect x={80} y={48} width={300} height={14} rx={6} fill={h.soft} stroke={h.base} strokeWidth="2" />
        <text x={230} y={59} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">ConcreteComponent</text>
        <text x={230} y={28} textAnchor="middle" fontSize="9.5" fill={s} fontFamily="var(--font-body,system-ui)">LoggingDecorator</text>
        <text x={230} y={44} textAnchor="middle" fontSize="9.5" fill={s} fontFamily="var(--font-body,system-ui)">CachingDecorator</text>
        <text x={230} y={120} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">each layer calls the next → behaviour stacks</text>
        <DiagArrow x1={230} y1={80} x2={230} y2={108} color={h.base} label="delegate()" />
      </DiagFrame>
    ); },
    analogy: { title: "Like clothing layers", text: "You put a t-shirt on, then a jumper, then a coat. Each layer adds warmth without replacing what's underneath. Remove the coat and the jumper still works." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Each decorator wraps a component via composition, implementing the same interface. It calls the wrapped object's method and adds its own logic before or after. Decorators can be stacked arbitrarily — <code>new LoggingDecorator(new CachingDecorator(service))</code>. This is more flexible than subclassing: you compose behaviour at runtime.</p><p style={{margin:0}}>Watch out: behaviour can depend on the order decorators are applied — stacking caching before logging versus after produces different results.</p></div>,
    keyPoints: ["Wraps via composition, not inheritance", "Decorators can be stacked in any order at runtime", "Java's InputStream hierarchy is the classic example", "Decorator order matters — stacking sequence affects the final behaviour"],
  },
  "design-patterns:Facade": {
    oneLine: "Facade provides a simple interface to a complex subsystem — callers use one clean entry point instead of orchestrating many internal classes directly.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Client calls the facade; facade coordinates the complex subsystem internally.">
        <DiagBox x={10} y={80} w={90} h={40} label="Client" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={165} y={70} w={120} h={60} label="Facade" sub="simple API" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={100} y1={100} x2={163} y2={100} color={h.base} />
        {["SubsysA","SubsysB","SubsysC"].map((lbl,i)=>(
          <g key={i}>
            <DiagBox x={345} y={30+i*56} w={105} h={40} label={lbl} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={285} y1={100} x2={343} y2={50+i*56} color={s} />
          </g>
        ))}
        <text x={230} y={190} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">client unaware of subsystem complexity</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a hotel concierge", text: "You ask the concierge to arrange dinner, a taxi, and tickets. You don't call the restaurant, taxi company, and venue directly — one call handles all the complexity." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Facade doesn't prevent clients from accessing subsystem classes directly — it just provides a convenient shortcut. It reduces coupling: if the subsystem internals change, only the facade needs updating. Common in library design: a public <code>Client</code> class that hides dozens of internal modules behind a handful of clear methods.</p><p style={{margin:0}}>Watch out: a facade that orchestrates too many subsystems can grow into a "god object" — tightly coupled to everything and hard to maintain.</p></div>,
    keyPoints: ["One simple interface hides a complex subsystem", "Reduces coupling between client and internals", "Subsystem is still accessible directly when needed", "A growing facade can become a god object coupled to the whole system"],
  },
  "design-patterns:Flyweight": {
    oneLine: "Flyweight shares common intrinsic state among many fine-grained objects instead of storing a copy in each, cutting memory dramatically when you have millions of similar objects.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Shared flyweight holds intrinsic state; context supplies the extrinsic state at use time.">
        <DiagBox x={160} y={10} w={140} h={50} label="FlyweightFactory" sub="cache" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={110} w={110} h={40} label="Flyweight" sub="shared state" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={230} y1={60} x2={230} y2={108} color={h.base} label="getFlyweight(key)" />
        {[30,320].map((x,i)=>(
          <g key={i}>
            <DiagBox x={x} y={110} w={110} h={40} label="Context" sub="unique state" fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={x+55} y1={110} x2={230} y2={130} color={s} dashed label={i===0?"share":undefined} />
          </g>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Like a character glyph in a text renderer", text: "A document with a million 'a' characters doesn't store a million glyph objects. It stores one glyph for 'a' and a million references to it, each noting its position on screen." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Split object state into <strong>intrinsic</strong> (shared, immutable — e.g. character glyph shape) and <strong>extrinsic</strong> (unique per instance — e.g. position, colour). Store intrinsic state once in the Flyweight; pass extrinsic state at operation time. A factory caches flyweights by key so the same intrinsic state is never duplicated.</p><p style={{margin:0}}>Watch out: flyweight objects must remain immutable — if context code mutates shared state, all consumers of that flyweight will be affected.</p></div>,
    keyPoints: ["Share intrinsic state; pass extrinsic state at runtime", "Memory savings dramatic when millions of similar objects exist", "Flyweight objects must be immutable — never let context mutate them", "Trades memory savings for CPU time spent recomputing extrinsic state"],
  },
  "design-patterns:Proxy": {
    oneLine: "Proxy controls access to another object — it can add lazy loading, access control, logging, or caching transparently behind the same interface.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 180" caption="Client calls the proxy; proxy decides when and how to forward to the real subject.">
        <DiagBox x={10} y={77} w={90} h={40} label="Client" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={165} y={60} w={120} h={60} label="Proxy" sub="controls access" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={355} y={77} w={95} h={40} label="RealSubject" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={100} y1={97} x2={163} y2={90} color={h.base} label="request" />
        <DiagArrow x1={285} y1={90} x2={353} y2={97} color={s} dashed label="maybe" />
        <text x={230} y={155} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">virtual proxy / protection proxy / caching proxy</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a personal assistant", text: "Calls don't go straight to the CEO. The assistant screens them: junk is filtered, urgent calls are forwarded immediately, and routine requests get a standard reply." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Common proxy types: <strong>Virtual</strong> (lazy-load expensive objects on first access), <strong>Protection</strong> (check permissions before forwarding), <strong>Caching</strong> (return a cached result instead of calling the real subject), <strong>Remote</strong> (represent an object in a different process). All share the real subject's interface, so the client is unaware of the indirection.</p><p style={{margin:0}}>Watch out: each proxy call passes through an extra layer — a protection or remote proxy can measurably slow response time for high-frequency calls.</p></div>,
    keyPoints: ["Same interface as the real subject — transparent to client", "Virtual proxy: lazy-load expensive resources", "Protection proxy: gate access with authorisation checks", "Adding a proxy layer increases class count and can slow response time"],
  },
  "design-patterns:Chain of Responsibility": {
    oneLine: "Chain of Responsibility passes a request along a chain of handlers until one of them handles it — sender and receiver are decoupled, and you can add or reorder handlers freely.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 160" caption="Request travels the chain until a handler claims it — or falls off the end.">
        <DiagBox x={10} y={60} w={80} h={40} label="Sender" fill="var(--card)" stroke={s} text="var(--ink)" />
        {[110,210,310].map((x,i)=>(
          <g key={i}>
            <DiagBox x={x} y={60} w={80} h={40} label={`Handler${i+1}`} fill={i===1?h.soft:"var(--card)"} stroke={i===1?h.base:s} text={i===1?h.ink:"var(--ink)"} />
            <DiagArrow x1={i===0?90:x} y1={80} x2={x} y2={80} color={i===1?h.base:s} />
          </g>
        ))}
        <DiagArrow x1={390} y1={80} x2={430} y2={80} color={s} dashed label="unhandled" />
        <text x={230} y={140} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">Handler 2 claims the request — chain stops</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like escalating a support ticket", text: "Level 1 support tries to handle your issue. If they can't, it goes to Level 2, then Level 3. Each level decides to handle it or pass it on." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Each handler holds a reference to the next handler. When a request arrives, the handler either processes it or passes it to the next in line. The chain can be assembled dynamically at runtime — handlers are independent objects. Common in middleware pipelines (Express/Koa), logging frameworks, and event systems.</p><p style={{margin:0}}>Watch out: if no handler claims the request it silently falls off the end — always plan for an unhandled case, typically via a default catch-all handler.</p></div>,
    keyPoints: ["Decouples sender from the concrete handler that processes the request", "Handlers can be added, removed, or reordered at runtime", "Request may go unhandled if no handler claims it — plan for that case", "Debugging is harder when it is unclear which handler actually responded"],
  },
  "design-patterns:Command": {
    oneLine: "Command encapsulates a request as an object — enabling undo/redo, queuing, logging, and deferred execution without the invoker knowing anything about the operation.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Invoker holds commands; calling execute() delegates work to the receiver — invoker never calls receiver directly.">
        <DiagBox x={10} y={77} w={90} h={40} label="Invoker" sub="queues cmds" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={165} y={60} w={120} h={60} label="Command" sub="execute() / undo()" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={355} y={77} w={95} h={40} label="Receiver" sub="real work" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={100} y1={97} x2={163} y2={90} color={h.base} label="execute()" />
        <DiagArrow x1={285} y1={90} x2={353} y2={97} color={s} label="action()" />
        <text x={230} y={155} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">command history enables undo by calling undo() in reverse</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a restaurant order slip", text: "The waiter writes your order (command) and hands it to the kitchen (invoker queues it). The kitchen executes it. The waiter never cooks — and the order slip can be cancelled before it's made." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Command stores the receiver reference and any parameters needed to execute the operation. <strong>Undo</strong> is implemented by storing the inverse operation. A <strong>CommandHistory</strong> stack enables multi-level undo. Commands can also be serialised for logging, remote execution, or macro recording.</p><p style={{margin:0}}>Trade-off: every distinct action requires its own command class — in large systems this can mean dozens of small, nearly identical classes.</p></div>,
    keyPoints: ["Encapsulates operations as first-class objects", "Command history enables undo/redo", "Enables queuing, scheduling, and remote execution", "Each distinct action needs its own class — can add significant code volume"],
  },
  "design-patterns:Interpreter": {
    oneLine: "Interpreter defines a grammar for a simple language as a class hierarchy, then uses those classes to parse and evaluate expressions — useful for query languages and config DSLs.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Expression tree parsed from grammar; interpret() recursively evaluates the tree.">
        <DiagBox x={160} y={10} w={130} h={36} label="AbstractExpr" sub="interpret(ctx)" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={50} y={100} w={120} h={36} label="AndExpr" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={280} y={100} w={120} h={36} label="TerminalExpr" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={225} y1={46} x2={110} y2={98} color={s} />
        <DiagArrow x1={225} y1={46} x2={340} y2={98} color={s} />
        <DiagBox x={20} y={165} w={80} h={26} label="Left" fill="var(--card)" stroke={h.base} text="var(--ink)" rx={6} />
        <DiagBox x={120} y={165} w={80} h={26} label="Right" fill="var(--card)" stroke={h.base} text="var(--ink)" rx={6} />
        <DiagArrow x1={110} y1={136} x2={60} y2={163} color={h.base} />
        <DiagArrow x1={110} y1={136} x2={160} y2={163} color={h.base} />
      </DiagFrame>
    ); },
    analogy: { title: "Like parsing a recipe", text: "'Bake at 200°C for 30 min' is a sentence in a cooking language. The interpreter parses it into components (action, temperature, duration) and evaluates each one." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Each grammar rule becomes a class. Composite expressions hold references to sub-expressions and call <code>interpret()</code> on them recursively. The pattern is elegant for small grammars (SQL WHERE clauses, boolean rule engines, date expressions) but becomes unwieldy as grammars grow — prefer a parser generator (ANTLR, PEG) for complex languages.</p><p style={{margin:0}}>Watch out: the Interpreter is typically slower than a compiled parser — clarity of grammar mapping is its primary advantage, not execution speed.</p></div>,
    keyPoints: ["Grammar rules become classes; expressions form a tree", "interpret() evaluates recursively from leaves to root", "Suitable only for simple grammars — use parser generators beyond that", "Usually slower than a real parser; choose it for clarity, not performance"],
  },
  "design-patterns:Iterator": {
    oneLine: "Iterator provides a standard way to traverse a collection without exposing its internal structure — clients use next()/hasNext() regardless of whether it's an array, tree, or graph.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 180" caption="Client calls next() on the iterator; collection's structure is completely hidden.">
        <DiagBox x={10} y={77} w={90} h={40} label="Client" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={160} y={60} w={130} h={60} label="Iterator" sub="next() / hasNext()" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={350} y={77} w={100} h={40} label="Collection" sub="tree / list / …" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={100} y1={97} x2={158} y2={90} color={h.base} />
        <DiagArrow x1={290} y1={90} x2={348} y2={97} color={s} dashed label="iterates" />
        <text x={230} y={155} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">same loop code works for any collection type</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a TV remote's channel-up button", text: "You press next without knowing whether channels are stored alphabetically, by frequency, or as a linked list. The remote handles the traversal — you just consume channels." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Iterator extracts traversal logic from the collection. The collection creates an iterator via <code>createIterator()</code>; the iterator tracks position. This enables multiple simultaneous traversals of the same collection (each iterator has its own cursor), and lets you provide different traversal orders (forward, reverse, filtered) without changing the collection.</p><p style={{margin:0}}>Trade-off: for simple flat collections you can just loop directly — creating a dedicated iterator object adds overhead and complexity that small cases rarely justify.</p></div>,
    keyPoints: ["Traverse any collection without knowing its structure", "Multiple iterators can traverse the same collection concurrently", "Enables different traversal strategies (filter, reverse) on the same data", "Overkill for simple collections where a direct loop is clearer"],
  },
  "design-patterns:Mediator": {
    oneLine: "Mediator centralises communication between objects — instead of each object referencing all the others, they all talk to the mediator, keeping coupling to one connection each.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Components send messages to the mediator; it decides what to do and who to notify.">
        <DiagBox x={165} y={80} w={130} h={50} label="Mediator" sub="coordinates all" fill={h.soft} stroke={h.base} text={h.ink} />
        {[[10,20],[330,20],[10,150],[330,150]].map(([x,y],i)=>(
          <g key={i}>
            <DiagBox x={x} y={y} w={100} h={36} label={`Component${i+1}`} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={x+(i%2===0?100:0)} y1={y+18} x2={i%2===0?163:297} y2={105} color={i<2?h.base:s} />
          </g>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Like air traffic control", text: "Planes don't talk to each other directly — they all communicate through the tower. The controller coordinates everything; planes just send and receive messages to one address." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Without a mediator, N components need N×(N-1)/2 connections. With a mediator, each component has exactly one connection — to the mediator. The mediator encapsulates the interaction logic: which events from component A should trigger actions in components B and C. UI toolkits (dialogs where widgets react to each other) are the classic example.</p><p style={{margin:0}}>Watch out: centralising all interaction logic in one mediator can turn it into a complex god object that is itself difficult to maintain and test.</p></div>,
    keyPoints: ["N components × 1 mediator instead of N×N connections", "Mediator encapsulates all interaction logic", "Easy to change interactions by modifying only the mediator", "A mediator that does too much can become a bottleneck and god object"],
  },
  "design-patterns:Memento": {
    oneLine: "Memento captures an object's internal state so it can be restored later — enabling undo/redo without exposing the object's private implementation.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Originator creates mementos; Caretaker stores them; restoration resets internal state.">
        <DiagBox x={10} y={77} w={120} h={46} label="Originator" sub="save / restore" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={185} y={77} w={90} h={46} label="Memento" sub="snapshot" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={335} y={77} w={115} h={46} label="Caretaker" sub="history stack" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={130} y1={100} x2={183} y2={100} color={h.base} label="createMemento()" lx={157} ly={88} />
        <DiagArrow x1={275} y1={100} x2={333} y2={100} color={h.base} label="store" />
        <DiagArrow x1={333} y1={112} x2={275} y2={112} color={s} dashed label="restore" />
        <text x={230} y={165} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">originator's internals stay private</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a game save state", text: "Before a boss fight you save your game. If you lose, you reload that exact state — your health, items, position — without the game engine needing to know how your character was built." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>The <strong>Originator</strong> creates a Memento containing a snapshot of its state and can restore itself from one. The <strong>Caretaker</strong> stores mementos on a history stack but never looks inside them — encapsulation is preserved. Undo is implemented by popping the stack and calling <code>restore(memento)</code>.</p><p style={{margin:0}}>Watch out: each memento holds a full copy of the originator's state — storing many snapshots for deep undo history can consume significant memory.</p></div>,
    keyPoints: ["Captures object state without exposing internals", "Caretaker stores mementos but never inspects them", "Pop the history stack to implement multi-level undo", "Storing many mementos can consume a lot of memory — manage lifecycle carefully"],
  },
  "design-patterns:State": {
    oneLine: "State lets an object change its behaviour completely when its internal state changes — as if the object swapped its class — eliminating sprawling if/switch chains on a state variable.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Context delegates to its current State object; calling action() on different states gives different behaviour.">
        <DiagBox x={10} y={77} w={120} h={50} label="Context" sub="holds current state" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={185} y={60} w={90} h={80} label="State" sub="interface" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={130} y1={102} x2={183} y2={100} color={h.base} label="action()" />
        {[10,200].map((x,i)=>(
          <g key={i}>
            <DiagBox x={320+i*0} y={30+i*80} w={120} h={38} label={["StateA","StateB"][i]} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={275} y1={100} x2={318} y2={49+i*80} color={s} />
          </g>
        ))}
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">transition: context swaps its state reference</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a traffic light", text: "The same box emits different signals depending on its internal state — red, amber, green. The controller swaps state objects; behaviours change completely." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Instead of a giant switch statement, each state is its own class with the same interface. The <strong>Context</strong> holds a reference to the current State and delegates all state-dependent behaviour to it. States can trigger transitions by replacing the Context's current state. Adding a new state means a new class — no existing code changes.</p><p style={{margin:0}}>Watch out: state classes often need references to each other to trigger transitions, which can introduce coupling between concrete state classes.</p></div>,
    keyPoints: ["Replaces switch/if chains with polymorphism", "Each state is a class — adding states doesn't break others", "States can transition the context by replacing the current state reference", "State classes may need references to sibling states to drive transitions"],
  },
  "design-patterns:Strategy": {
    oneLine: "Strategy defines a family of interchangeable algorithms and lets you swap them at runtime — the context delegates to the strategy without knowing which one it's using.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Context holds a Strategy reference; swap the strategy to change the algorithm.">
        <DiagBox x={10} y={77} w={120} h={46} label="Context" sub="uses strategy" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={185} y={60} w={90} h={80} label="Strategy" sub="interface" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={130} y1={100} x2={183} y2={100} color={h.base} label="execute()" />
        {[["QuickSort",20],["MergeSort",120]].map(([lbl,y],i)=>(
          <g key={i}>
            <DiagBox x={330} y={y as number} w={120} h={38} label={lbl as string} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={275} y1={100} x2={328} y2={(y as number)+19} color={s} />
          </g>
        ))}
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">inject or swap at runtime without touching context</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like choosing a route in a sat-nav", text: "You can switch between 'fastest', 'scenic', or 'avoid tolls' at any time. The car (context) doesn't change — only the navigation algorithm (strategy) does." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Context holds a Strategy interface reference and calls its <code>execute()</code> method. Concrete strategies implement the algorithm differently. Strategies are injected (via constructor or setter), so you can swap them without changing the context. This eliminates conditionals for algorithm selection and makes strategies independently testable.</p><p style={{margin:0}}>Trade-off: clients must understand the available strategies well enough to choose the right one — the selection logic moves out of the context but doesn't disappear.</p></div>,
    keyPoints: ["Swap algorithms at runtime without changing the context", "Each strategy is independently testable", "Eliminates conditional logic for algorithm selection", "Clients must know the available strategies to make a valid choice"],
  },
  "design-patterns:Template Method": {
    oneLine: "Template Method defines the skeleton of an algorithm in a base class, with abstract steps that subclasses fill in — the order is fixed, the details vary.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Base class calls fixed steps in order; subclasses override only the hook methods.">
        <DiagBox x={155} y={10} w={150} h={50} label="AbstractClass" sub="templateMethod()" fill={h.soft} stroke={h.base} text={h.ink} />
        <text x={230} y={85} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">step1() → step2() → step3()</text>
        {[30,310].map((x,i)=>(
          <g key={i}>
            <DiagBox x={x} y={120} w={120} h={50} label={["ConcreteA","ConcreteB"][i]} sub="overrides hooks" fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={225} y1={60} x2={x+60} y2={118} color={s} />
          </g>
        ))}
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">fixed skeleton, variable details</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a recipe with customisable ingredients", text: "'Bake a cake: mix, bake, decorate' is the template. Whether you make chocolate or vanilla, the steps are identical — only the ingredients differ." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>The base class declares <code>templateMethod()</code> as <code>final</code> (or equivalent) so subclasses can't change the order of steps. It calls abstract <em>hook</em> methods that subclasses override. This enforces the algorithm structure while allowing customisation of individual steps. Common in test frameworks (<code>setUp</code>/<code>tearDown</code>), data importers, and report generators.</p><p style={{margin:0}}>Watch out: changes to the base class algorithm ripple into every subclass — the fixed skeleton that prevents disorder can also become a bottleneck when requirements evolve.</p></div>,
    keyPoints: ["Base class controls algorithm structure; subclasses fill in the steps", "Template method is sealed — order cannot be changed", "Avoids duplication when many classes share the same algorithm skeleton", "Base class changes propagate to all subclasses — modify with care"],
  },
  "design-patterns:Visitor": {
    oneLine: "Visitor lets you add new operations to an object hierarchy without modifying any of the classes — the element accepts a visitor, and the visitor implements the new behaviour.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="accept(visitor) calls visitor.visitX(this) — new operations added via new visitors only.">
        <DiagBox x={155} y={10} w={140} h={40} label="Visitor" sub="interface" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={20} y={100} w={120} h={40} label="ExportVisitor" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={310} y={100} w={120} h={40} label="PrintVisitor" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={225} y1={50} x2={80} y2={98} color={s} />
        <DiagArrow x1={225} y1={50} x2={370} y2={98} color={s} />
        <DiagBox x={155} y={150} w={140} h={36} label="Element.accept(v)" sub="v.visit(this)" fill="var(--card)" stroke={h.base} text="var(--ink)" />
        <DiagArrow x1={80} y1={140} x2={175} y2={148} color={h.base} dashed />
        <DiagArrow x1={370} y1={140} x2={275} y2={148} color={h.base} dashed />
      </DiagFrame>
    ); },
    analogy: { title: "Like an inspector touring a building", text: "Rooms (elements) stay the same. A fire inspector visits each room and runs a fire check; a health inspector visits the same rooms and runs a hygiene check. Neither inspection changes the rooms." },
    body: <div style={PROSE}><p style={{margin:"0 0 0.75rem"}}>Double dispatch: the element calls <code>visitor.visit(this)</code>, letting the visitor's method overload select the right implementation based on both the visitor type and the element type. Adding a new operation = new Visitor class. The downside: adding a new element type requires updating every existing visitor.</p><p style={{margin:0}}>Watch out: visitors often need access to elements' private internals to do their work, which weakens encapsulation — elements may need to expose state they would otherwise hide.</p></div>,
    keyPoints: ["Add new operations without modifying element classes", "Double dispatch selects the right visitor method automatically", "Best when element hierarchy is stable but operations change frequently", "Adding a new element type forces every existing visitor to be updated"],
  },

  // ── PostgreSQL Internals ───────────────────────────────────────────────────
  "postgres-internals:How a Query Travels Through Postgres": {
    oneLine: "Every SQL statement passes through four stages inside Postgres — parsing, rewriting, planning, and execution — before any data is touched.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 160" caption="SQL text → parse tree → query tree → plan → result rows.">
        {["Parser","Rewriter","Planner","Executor"].map((lbl,i)=>(
          <g key={i}>
            <DiagBox x={10+i*110} y={55} w={96} h={50} label={lbl} fill={i===2?h.soft:"var(--card)"} stroke={i===2?h.base:s} text={i===2?h.ink:"var(--ink)"} />
            {i<3&&<DiagArrow x1={106+i*110} y1={80} x2={118+i*110} y2={80} color={h.base} />}
          </g>
        ))}
        <text x={230} y={135} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">planner picks the cheapest access strategy</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like turning a recipe request into a cooked meal", text: "You say 'make pasta' (SQL). The chef understands the words (parse), checks for shortcuts (rewrite), plans the cooking order (plan), then executes it (execute)." },
    body: <div style={PROSE}><p style={{margin: "0 0 0.75rem"}}><strong>Parser</strong>: converts SQL text to a parse tree. <strong>Rewriter</strong>: applies rules and view expansions. <strong>Planner/Optimiser</strong>: generates all candidate query plans (seq scan, index scan, join orders) and selects the one with the lowest estimated cost. <strong>Executor</strong>: runs the chosen plan using a demand-pull (Volcano) model, returning rows one at a time.</p><p style={{margin: 0}}>Watch out: nested views are inlined recursively by the rewriter — deeply nested views can expand into enormous query trees that overwhelm the planner, causing slow planning even for simple-looking queries.</p></div>,
    keyPoints: ["Parser → Rewriter → Planner → Executor", "Planner chooses between seq scan, index scan, nested loops, hash joins", "EXPLAIN shows the plan; EXPLAIN ANALYZE runs it and shows actual costs", "The executor uses a demand-pull (Volcano) model — each node pulls one tuple at a time from its children", "Use parameterized statements to avoid parse-error storms from dynamically concatenated SQL"],
  },
  "postgres-internals:The Postgres Process Architecture": {
    oneLine: "Postgres spawns a dedicated OS process for every client connection, all sharing a common pool of shared memory for buffers, locks, and the WAL.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Postmaster forks a backend per connection; all backends share memory.">
        <DiagBox x={165} y={10} w={130} h={40} label="Postmaster" sub="listener" fill={h.soft} stroke={h.base} text={h.ink} />
        {[20,160,300].map((x,i)=>(
          <g key={i}>
            <DiagBox x={x} y={100} w={110} h={40} label={`Backend ${i+1}`} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={230} y1={50} x2={x+55} y2={98} color={h.base} label={i===1?"fork":undefined} />
          </g>
        ))}
        <rect x={10} y={162} width={440} height={30} rx={8} fill={h.soft} stroke={h.base} strokeWidth="2" />
        <text x={230} y={181} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">Shared Memory: buffer pool · lock table · WAL buffers</text>
        {[75,230,385].map((x,i)=><DiagArrow key={i} x1={x} y1={140} x2={x} y2={160} color={s} />)}
      </DiagFrame>
    ); },
    analogy: { title: "Like forking a new chef per order", text: "Each order (connection) gets its own chef (process). Chefs share the same kitchen (shared memory) — the walk-in fridge, the stove, the prep tables." },
    body: <div style={PROSE}><p style={{margin: "0 0 0.75rem"}}>The <strong>Postmaster</strong> listens on port 5432 and forks a fresh backend process for each connection. Each backend runs the full query pipeline independently. They all read from and write to <strong>shared buffers</strong> (the page cache), coordinate via the <strong>lock table</strong>, and append to <strong>WAL buffers</strong>. PgBouncer sits in front to pool connections and avoid forking overhead.</p><p style={{margin: 0}}>Each connection is a real OS process consuming memory and a <code style={{background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em"}}>ProcArray</code> slot — even an idle connection holds resources. If one backend crashes with a PANIC, the postmaster restarts the entire cluster to guarantee shared-memory integrity.</p></div>,
    keyPoints: ["One process per connection — isolation but high forking cost", "All backends share the buffer pool in shared memory", "Use a connection pooler (PgBouncer) at scale", "Background workers include checkpointer, WAL writer, bgwriter, and autovacuum launcher", "A single backend crash triggers a full cluster restart — the isolation model working as designed"],
  },
  "postgres-internals:How Tables Are Stored on Disk — The Heap": {
    oneLine: "A Postgres table is a heap file on disk — a flat list of 8 KB pages, each holding rows (tuples) with a header tracking visibility for MVCC.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Each 8 KB page holds a page header, item pointers, and variable-length tuples from both ends.">
        <rect x={10} y={40} width={440} height={120} rx={10} fill="var(--card)" stroke={s} strokeWidth="2" />
        <rect x={10} y={40} width={100} height={120} rx={8} fill={h.soft} stroke={h.base} strokeWidth="2" />
        <text x={60} y={105} textAnchor="middle" fontSize="10" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">Page Header</text>
        {[120,160,200].map((x,i)=>(
          <g key={i}>
            <rect x={x} y={48} width={32} height={20} rx={4} fill={h.soft} stroke={h.base} strokeWidth="1.5" />
            <text x={x+16} y={62} textAnchor="middle" fontSize="8" fill={h.ink} fontFamily="var(--font-body,system-ui)">ptr{i+1}</text>
          </g>
        ))}
        {[350,290,230].map((x,i)=>(
          <g key={i}>
            <rect x={x} y={110} width={60} height={40} rx={4} fill="var(--card)" stroke={s} strokeWidth="1.5" />
            <text x={x+30} y={134} textAnchor="middle" fontSize="9" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">tuple{i+1}</text>
          </g>
        ))}
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">free space in the middle</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like shelves in a library storeroom", text: "Rows are piled into 8 KB shelf-boxes (pages). The front of the box has an index card for each row; the actual rows are stacked from the back. Free space is in the middle." },
    body: <div style={PROSE}><p style={{margin: "0 0 0.75rem"}}>Each page (block) is 8 KB. It starts with a <strong>page header</strong> (free space pointers, checksum), then an array of <strong>item pointers</strong> (ctid: block + offset), and the actual <strong>tuples</strong> grow inward from the end. Each tuple header stores <code>xmin</code>/<code>xmax</code> for MVCC visibility. Very wide rows spill into TOAST tables. Pages are loaded into the <strong>shared buffer pool</strong> for reads and writes.</p><p style={{margin: 0}}>Watch out: <code style={{background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em"}}>ctid</code> is a physical address that changes on UPDATE and VACUUM FULL — never use it as a stable row identifier in application code.</p></div>,
    keyPoints: ["8 KB pages; item pointers grow from start, tuples from the end", "xmin/xmax on every tuple enables MVCC", "Oversized columns are compressed/stored in a TOAST table", "Every UPDATE writes a new tuple and tombstones the old one — UPDATE never edits in place", "Table files are stored as 1 GB segment files made up of 8 KB pages"],
  },
  "postgres-internals:B-Tree Indexes — The Data Structure": {
    oneLine: "Postgres B-tree indexes are balanced trees where every path from root to leaf is the same length, enabling O(log n) lookups and efficient range scans.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Root → internal nodes → leaf pages containing (key, heap TID) pairs in sorted order.">
        <DiagBox x={165} y={10} w={130} h={36} label="Root" sub="index page" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={60} y={90} w={120} h={36} label="Internal Node" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={280} y={90} w={120} h={36} label="Internal Node" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={225} y1={46} x2={120} y2={88} color={h.base} />
        <DiagArrow x1={225} y1={46} x2={340} y2={88} color={h.base} />
        {[10,110,250,360].map((x,i)=>(
          <g key={i}>
            <DiagBox x={x} y={165} w={90} h={30} label="Leaf" sub="key + TID" fill="var(--card)" stroke={s} text="var(--ink)" rx={6} />
            <DiagArrow x1={(i<2?120:340)} y1={126} x2={x+45} y2={163} color={s} />
          </g>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Like a library catalogue", text: "The catalogue is split into alphabetical sections (root). Each section points to sub-sections (internal nodes). The sub-sections point to the shelf location (leaf → heap TID)." },
    body: <div style={PROSE}><p style={{margin: "0 0 0.75rem"}}>B-tree leaf pages contain sorted (key, heap TID) pairs and are linked in order — enabling range scans without going back up the tree. Internal nodes hold separator keys and child page pointers. The tree stays balanced by splitting pages when they fill up. Most Postgres indexes use B-trees; they support =, &lt;, &gt;, BETWEEN, and IS NULL efficiently.</p><p style={{margin: 0}}>A B-tree on a low-cardinality column (e.g. a boolean) has poor selectivity and is almost never used by the planner — check <code style={{background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em"}}>pg_stat_user_indexes</code> to confirm an index earns its write overhead.</p></div>,
    keyPoints: ["O(log n) lookup; O(1) amortised insert with occasional splits", "Leaf pages linked for efficient range scans", "Works for =, <, >, BETWEEN, ORDER BY, and IS NULL", "Postgres uses a Lehman-Yao B+-tree — all real data lives in leaf pages, internal pages hold only separator keys", "An 8 KB page holds ~100–300 entries, keeping the tree 3–4 levels deep even for hundreds of millions of rows"],
  },
  "postgres-internals:B-Tree Index Operations — Insert, Split, Scan": {
    oneLine: "Inserting into a B-tree navigates to the right leaf and adds the entry — if the page is full it splits and the separator key propagates up; scans follow the leaf chain.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Page split: full leaf is divided; median key promoted to parent — tree stays balanced.">
        <DiagBox x={10} y={20} w={190} h={50} label="Full Leaf: 10 20 30 40" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={200} y1={45} x2={240} y2={45} color={h.base} label="split!" />
        <DiagBox x={245} y={10} w={90} h={36} label="10  20" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={355} y={10} w={90} h={36} label="30  40" fill={h.soft} stroke={h.base} text={h.ink} />
        <text x={400} y={62} textAnchor="middle" fontSize="9.5" fill={h.base} fontFamily="var(--font-body,system-ui)">30 promoted to parent</text>
        <DiagBox x={155} y={120} w={140} h={40} label="Index Scan" sub="follow leaf chain →" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={10} y={160} w={80} h={30} label="Leaf A" fill="var(--card)" stroke={s} text="var(--ink)" rx={6} />
        <DiagBox x={100} y={160} w={80} h={30} label="Leaf B" fill="var(--card)" stroke={s} text="var(--ink)" rx={6} />
        <DiagBox x={190} y={160} w={80} h={30} label="Leaf C" fill="var(--card)" stroke={s} text="var(--ink)" rx={6} />
        <DiagArrow x1={90} y1={175} x2={98} y2={175} color={h.base} />
        <DiagArrow x1={180} y1={175} x2={188} y2={175} color={h.base} />
      </DiagFrame>
    ); },
    analogy: { title: "Like filing a card into a full drawer", text: "When the drawer is full, you split it into two and promote the middle card to the master index. Anyone scanning reads card by card along the linked drawers." },
    body: <div style={PROSE}><p style={{margin: "0 0 0.75rem"}}><strong>Insert</strong>: traverse root → leaf, insert (key, TID). If the leaf overflows, split it into two pages and push the median key up to the parent (which may also split recursively). <strong>Index scan</strong>: find the start position, then follow the sibling pointers in the leaf layer — no need to traverse up. <strong>Bitmap scan</strong>: collect TIDs first, then fetch heap pages in physical order to minimise random I/O.</p><p style={{margin: 0}}>Watch out: an index-only scan can still hit the heap if the visibility map is not current — EXPLAIN ANALYZE will show a non-zero "Heap Fetches" count, meaning VACUUM needs to run.</p></div>,
    keyPoints: ["Insert navigates to leaf; page splits propagate upward", "Range scan follows leaf sibling pointers — fast sequential read", "Bitmap index scan batches heap fetches for efficiency", "A cascade of splits is the only way a B-tree grows taller — the root splits last", "Monotonically increasing keys (serial, timestamp) cause all inserts to hit the same rightmost leaf, creating contention under high write load"],
  },
  "postgres-internals:Other Index Types": {
    oneLine: "Postgres offers Hash, GIN, GiST, and BRIN indexes — each trades B-tree's generality for better performance on a specific data access pattern.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Choose by access pattern: Hash for equality, GIN for contains, GiST for ranges/geometry, BRIN for time-series.">
        {[["Hash","equality only"],["GIN","array / full-text"],["GiST","geo / ranges"],["BRIN","ordered large tables"]].map(([name,use],i)=>(
          <g key={i}>
            <DiagBox x={10+i*112} y={60} w={100} h={70} label={name as string} sub={use as string} fill={i===1?h.soft:"var(--card)"} stroke={i===1?h.base:s} text={i===1?h.ink:"var(--ink)"} />
          </g>
        ))}
        <text x={230} y={165} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">all integrate with the query planner automatically</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like choosing the right tool in a toolbox", text: "A B-tree is a swiss army knife. Hash is a faster, narrower knife for equality only. GIN is a staple gun for composite values. BRIN is a filing system for huge ordered archives." },
    body: <div style={PROSE}><p style={{margin: "0 0 0.75rem"}}><strong>Hash</strong>: O(1) equality lookups, no range support, rarely used. <strong>GIN</strong>: for jsonb, arrays, full-text search — stores a posting list per element value. <strong>GiST</strong>: generalised tree for geometric types, ranges, and nearest-neighbour. <strong>BRIN</strong>: stores only min/max per range of pages — tiny index, perfect for timestamp-sorted append-only tables.</p><p style={{margin: 0}}>BRIN is useless if the column lacks physical correlation with storage order — random inserts or updates destroy the min/max summaries, making block ranges overlap and preventing any pages from being skipped.</p></div>,
    keyPoints: ["GIN: best for searching inside composite types (jsonb, arrays, tsvector)", "GiST: geometry, ranges, nearest-neighbour", "BRIN: tiny footprint for time-ordered tables — good for logs and events", "GIN buffers new entries in a pending list flushed by autovacuum — heavy writes can cause pending-list bloat", "Hash indexes (since PG 10) are WAL-logged and crash-safe, but support only equality — not range queries"],
  },
  "postgres-internals:Transactions and ACID": {
    oneLine: "Postgres transactions guarantee that a group of operations either all succeed or all fail — atomically, consistently, in isolation, and durably.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="A transaction is a unit of work — BEGIN … COMMIT succeeds together or ROLLBACK undoes all.">
        <DiagBox x={10} y={60} w={110} h={40} label="BEGIN" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={40} w={110} h={40} label="Write ops" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={100} w={110} h={40} label="Read ops" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={340} y={60} w={110} h={80} label="COMMIT" sub="or ROLLBACK" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={120} y1={80} x2={173} y2={60} color={h.base} />
        <DiagArrow x1={120} y1={80} x2={173} y2={120} color={h.base} />
        <DiagArrow x1={285} y1={60} x2={338} y2={80} color={h.base} />
        <DiagArrow x1={285} y1={120} x2={338} y2={100} color={h.base} />
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">WAL ensures durability: committed data survives crashes</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a bank wire transfer", text: "Both the debit and credit happen or neither does. If the power goes out mid-transfer, the bank restores both accounts to their state before it started — nothing is left half-done." },
    body: <div style={PROSE}><p style={{margin: "0 0 0.75rem"}}><strong>Atomic</strong>: all-or-nothing. <strong>Consistent</strong>: constraints hold before and after. <strong>Isolated</strong>: transactions don't see each other's uncommitted changes (level-dependent). <strong>Durable</strong>: committed transactions survive crashes via WAL. Postgres wraps every statement in an implicit transaction; explicit BEGIN/COMMIT lets you batch multiple statements.</p><p style={{margin: 0}}>Transaction IDs are a 32-bit counter — every writing transaction consumes one. Very high transaction rates (or leaving autovacuum disabled) can approach the wraparound limit faster than expected; monitor <code style={{background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em"}}>age(datfrozenxid)</code> regularly.</p></div>,
    keyPoints: ["Atomic: all or nothing — partial writes never committed", "Durable: WAL ensures commits survive crashes", "Isolation level controls how much of other transactions you see", "Atomicity is implemented by MVCC plus the commit log (pg_xact) — an aborted transaction's tuples are simply never marked committed", "Read-only transactions don't consume an XID until they actually write — only writing transactions advance the 32-bit counter"],
  },
  "postgres-internals:Isolation Levels and Anomalies": {
    oneLine: "Postgres's four isolation levels control how much concurrent transactions can interfere — higher isolation prevents more anomalies but increases contention.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Stronger isolation → fewer anomalies → more blocking.">
        {[["Read\nCommitted","dirty read\nprevented"],["Repeatable\nRead","non-repeatable\nprevented"],["Serializable","phantom\nprevented"]].map(([lbl,sub],i)=>(
          <g key={i}>
            <DiagBox x={10+i*148} y={60} w={136} h={70} label={(lbl as string).replace("\n"," ")} sub={(sub as string).replace("\n"," ")} fill={i===2?h.soft:"var(--card)"} stroke={i===2?h.base:s} text={i===2?h.ink:"var(--ink)"} />
          </g>
        ))}
        <text x={230} y={158} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">Postgres default: Read Committed</text>
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">Serializable uses SSI — no explicit locks needed</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like proof-reading drafts", text: "Read Committed: you see every published revision as you read. Repeatable Read: you only see the version that existed when you started. Serializable: it's as if no one else is editing at all." },
    body: <div style={PROSE}><p style={{margin: "0 0 0.75rem"}}>The default level <strong>Read Committed</strong> sees each statement's snapshot freshly — susceptible to non-repeatable reads. <strong>Repeatable Read</strong> takes a snapshot at transaction start — prevents non-repeatable reads and phantoms in Postgres (unlike SQL standard). <strong>Serializable</strong> uses Serializable Snapshot Isolation (SSI) to detect write-skew and phantoms without locking.</p><p style={{margin: 0}}>Postgres never allows dirty reads — Read Uncommitted behaves identically to Read Committed. Under Serializable, expect occasional <code style={{background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em"}}>SQLSTATE 40001</code> errors; callers must retry — this is SSI working correctly, not a bug.</p></div>,
    keyPoints: ["Read Committed (default): fresh snapshot per statement", "Repeatable Read: snapshot fixed at transaction start", "Serializable: SSI catches write-skew without row locks", "Write skew — two transactions each read an overlapping set and write changes that jointly violate an invariant — is only prevented by Serializable", "Repeatable Read can fail an UPDATE with a serialization error if the underlying row changed since the snapshot was taken"],
  },
  "postgres-internals:Locking — Row Locks, Table Locks, Deadlocks": {
    oneLine: "Postgres uses lightweight row locks for DML and heavier table locks for DDL, and automatically detects deadlocks by cycling through the lock-wait graph.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Deadlock: Txn A holds lock 1 and waits for lock 2; Txn B holds lock 2 and waits for lock 1.">
        <DiagBox x={10} y={50} w={140} h={40} label="Txn A" sub="holds row 1" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={310} y={50} w={140} h={40} label="Txn B" sub="holds row 2" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={150} y1={60} x2={308} y2={60} color={h.base} label="waits for row 2" />
        <DiagArrow x1={310} y1={80} x2={152} y2={80} color={s} label="waits for row 1" lx={230} ly={95} />
        <DiagBox x={155} y={140} w={150} h={36} label="Deadlock Detector" sub="aborts one txn" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <text x={230} y={190} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">acquiring locks in a consistent order prevents deadlocks</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like two drivers at a single-lane bridge", text: "Each driver is already on the bridge and waiting for the other to reverse. Neither can proceed — deadlock. Someone has to back up (abort) before traffic flows again." },
    body: <div style={PROSE}><p style={{margin: "0 0 0.75rem"}}>Postgres uses <strong>MVCC for reads</strong> (no read locks needed) and row-level locks for writes (<code>FOR UPDATE</code>, <code>FOR SHARE</code>). DDL uses table-level <strong>Access Exclusive</strong> locks that block everything. Deadlock detection runs automatically every <code>deadlock_timeout</code> (default 1 s) and aborts the youngest transaction in the cycle. Prevention: always acquire locks in the same order.</p><p style={{margin: 0}}>Watch out: a single DDL statement waiting for Access Exclusive will itself queue all subsequent queries behind it — even a momentary ALTER TABLE during peak traffic can stall the entire application. Use <code style={{background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em"}}>lock_timeout</code> to bound the wait.</p></div>,
    keyPoints: ["MVCC: readers never block writers, writers never block readers", "DDL needs Access Exclusive — can cause surprise blocking", "Acquire locks in a consistent order to prevent deadlocks", "There are four row-lock strengths: FOR KEY SHARE, FOR SHARE, FOR NO KEY UPDATE, FOR UPDATE — ordered weakest to strongest", "pg_advisory_lock provides application-level cooperative locks not tied to any table row"],
  },
  "postgres-internals:WAL — The Write-Ahead Log": {
    oneLine: "WAL guarantees durability by writing a description of every change to a sequential log before touching the actual data pages — so a crash can always be replayed from the log.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Every change is written to WAL first; data page written to disk lazily (checkpoint); standbys stream WAL for replication.">
        <DiagBox x={10} y={80} w={110} h={40} label="Client COMMIT" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={60} w={110} h={80} label="WAL" sub="sequential log" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={345} y={40} w={105} h={36} label="Data Pages" sub="lazy flush" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={345} y={130} w={105} h={36} label="Standby" sub="stream WAL" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={120} y1={100} x2={173} y2={100} color={h.base} label="1. write" />
        <DiagArrow x1={285} y1={80} x2={343} y2={58} color={s} dashed label="checkpoint" />
        <DiagArrow x1={285} y1={120} x2={343} y2={148} color={h.base} dashed label="stream" />
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">crash recovery: replay WAL from last checkpoint</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a chef writing down every step before touching the dish", text: "Before moving any ingredient, the chef logs 'add 10 g salt'. If the kitchen burns down mid-cook, a new kitchen can replay the log exactly and finish the dish identically." },
    body: <div style={PROSE}><p style={{margin: "0 0 0.75rem"}}>WAL records describe the <em>intent</em> of a change before it's applied to the actual heap page. On COMMIT, WAL is flushed to disk (fsync) — the data page can remain dirty in the buffer pool. A <strong>checkpoint</strong> periodically flushes dirty pages and advances the WAL restart point. Standbys apply a continuous WAL stream for <strong>streaming replication</strong>; WAL archives enable point-in-time recovery (PITR).</p><p style={{margin: 0}}>Watch out: an inactive replication slot pins every WAL segment since its confirmed LSN — a dropped or forgotten slot will fill the disk indefinitely. Cap retention with <code style={{background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em"}}>max_slot_wal_keep_size</code>.</p></div>,
    keyPoints: ["WAL flushed on commit — guarantees durability without full page writes", "Checkpoint advances the recovery start point", "Streaming replication and PITR both rely on the WAL", "WAL is stored as 16 MB segment files under pg_wal/; the first write to a page after a checkpoint logs a full-page image", "Setting synchronous_commit=off risks losing the last fraction of a second of committed transactions after a crash"],
  },

  // ── Cloud Architecture ────────────────────────────────────────────────────
  "cloud-architecture:Strangler Fig Pattern": {
    oneLine: "Strangler Fig incrementally replaces a legacy system by routing traffic to new services one feature at a time — until the old system is completely surrounded and can be removed.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="A facade routes each feature to either the legacy system or the new replacement.">
        <DiagBox x={10} y={80} w={90} h={40} label="Clients" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={165} y={65} w={120} h={60} label="Facade / Proxy" sub="routing layer" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={100} y1={100} x2={163} y2={95} color={h.base} />
        <DiagBox x={345} y={40} w={105} h={40} label="New Service" sub="migrated ✓" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={345} y={130} w={105} h={40} label="Legacy App" sub="shrinking" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={285} y1={85} x2={343} y2={60} color={h.base} label="new routes" />
        <DiagArrow x1={285} y1={105} x2={343} y2={150} color={s} dashed label="old routes" />
        <text x={230} y={180} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">migrate feature by feature — legacy shrinks to nothing</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a strangler fig vine on a tree", text: "The fig grows around the old tree while the tree still stands. Over years the fig takes over, and eventually the original tree rots away inside a fully formed new structure." },
    body: <div style={PROSE}><p style={{margin:0}}>Add a proxy facade in front of the legacy system. New features always go into new services. Existing features migrate one by one — the facade reroutes each to the new service once migration is complete. When all routes point to new services, delete the legacy. No big-bang rewrite risk.</p><p style={{margin:"0.75em 0 0"}}>Watch out for strangle paralysis: if migration stalls half-done, you end up permanently maintaining both stacks. Track the percentage of traffic still hitting the monolith — a flat trend is a warning sign.</p></div>,
    keyPoints: ["Proxy facade routes to legacy or new service per feature", "Migrate incrementally — never a big-bang rewrite", "Legacy can be deleted when all routes point elsewhere", "The proxy itself can become a bottleneck — provision it like a critical service", "Data consistency must be managed during the split to prevent state drift"],
  },
  "cloud-architecture:Sidecar Pattern": {
    oneLine: "A sidecar container runs alongside each service in the same pod, handling cross-cutting concerns like logging, secrets, or TLS termination without touching service code.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Sidecar shares the pod's network namespace — it intercepts and enriches traffic transparently.">
        <rect x={60} y={30} width={340} height={120} rx={12} fill="var(--card)" stroke={s} strokeWidth="2" />
        <text x={230} y={22} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">Pod</text>
        <DiagBox x={80} y={50} w={130} h={80} label="Service" sub="business logic" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={255} y={50} w={130} h={80} label="Sidecar" sub="logs / TLS / proxy" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={210} y1={90} x2={253} y2={90} color={h.base} label="local call" />
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">both containers share network and storage volumes</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a motorcycle sidecar", text: "The sidecar doesn't drive — it rides alongside and carries extra gear the main bike doesn't need to care about. Remove it and the motorcycle still works fine." },
    body: <div style={PROSE}><p style={{margin:0}}>The sidecar shares the same pod network namespace as the main container, so all traffic passes through it. Common uses: Envoy sidecar for mTLS and observability (Istio), log shipping agents, config/secret reloaders (Vault agent), and protocol translators. The main service stays simple; the sidecar's lifecycle is managed separately.</p><p style={{margin:"0.75em 0 0"}}>Because the sidecar and app share the same CPU/memory limits on the pod, a misbehaving sidecar can throttle your service under load — always set per-container resource limits explicitly.</p></div>,
    keyPoints: ["Co-deployed in the same pod — shares network and volumes", "Handles cross-cutting concerns without modifying service code", "Independently deployable and updatable", "Resource contention between sidecar and app is a real production risk", "Version drift across the fleet produces inconsistent behaviour — use a fleet inventory dashboard"],
  },
  "cloud-architecture:Ambassador Pattern": {
    oneLine: "An Ambassador proxy container sits in front of a service to handle outbound concerns like retries, circuit breaking, and auth — keeping the service itself simple.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Service calls the ambassador (localhost); ambassador handles retries, auth, and routing outbound.">
        <DiagBox x={10} y={80} w={120} h={40} label="Service" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={185} y={65} w={120} h={60} label="Ambassador" sub="retries · auth · route" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={130} y1={100} x2={183} y2={95} color={h.base} label="localhost" />
        <DiagBox x={360} y={80} w={90} h={40} label="Upstream" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={305} y1={95} x2={358} y2={100} color={h.base} />
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">service never manages retry / circuit-break logic directly</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like an embassy aide", text: "The diplomat (service) doesn't handle visa paperwork, security checks, and scheduling — the aide (ambassador) does all that outbound work so the diplomat can focus on diplomacy." },
    body: <div style={PROSE}><p style={{margin:0}}>Ambassador is a specialised Sidecar focused on <em>outbound</em> calls. The service calls <code>localhost:port</code>; the ambassador handles retries with backoff, circuit breaking, auth token injection, and routing to the correct upstream. Envoy is the canonical ambassador. The pattern lets you change resilience policies without code deploys.</p><p style={{margin:"0.75em 0 0"}}>Aggressive retry policies inside the ambassador can amplify load on an already-failing downstream — outbound request-count spikes during errors are the tell-tale sign to monitor.</p></div>,
    keyPoints: ["Service calls localhost; ambassador handles the real outbound call", "Retries, circuit breaking, and auth centralised in the ambassador", "Change resilience policies without redeploying the service", "Retry amplification can worsen a downstream outage — tune retry budgets carefully", "Every call traverses the ambassador, adding tail latency that needs baseline measurement"],
  },
  "cloud-architecture:Anti-Corruption Layer (ACL)": {
    oneLine: "An Anti-Corruption Layer translates between two domain models so that integrating with a legacy system doesn't pollute your clean domain with its concepts.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 180" caption="The ACL translates model A concepts to model B — neither side knows about the other's internals.">
        <DiagBox x={10} y={70} w={130} h={50} label="New Domain" sub="clean model" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={165} y={60} w={130} h={60} label="ACL" sub="translate &amp; map" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={320} y={70} w={130} h={50} label="Legacy System" sub="messy model" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={140} y1={95} x2={163} y2={90} color={h.base} />
        <DiagArrow x1={295} y1={90} x2={318} y2={95} color={s} />
        <text x={230} y={160} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">new domain never imports legacy concepts directly</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a currency exchange", text: "You bring dollars; the booth converts them to euros. The vendor only accepts euros — it has no idea dollars exist. Neither economy is contaminated by the other's currency." },
    body: <div style={PROSE}><p style={{margin:0}}>The ACL sits between bounded contexts and converts concepts bidirectionally. Your clean domain model calls the ACL in its own terms; the ACL translates to the legacy system's format. This prevents legacy naming conventions, identifiers, and concepts from leaking into new code. Implement as a service, an adapter, or a set of translators.</p><p style={{margin:"0.75em 0 0"}}>When the external model changes and the mapping silently mistranslates fields, data corruption is hard to detect — contract tests comparing source vs translated payloads are essential to catch translation drift early.</p></div>,
    keyPoints: ["Translates between two domain models bidirectionally", "Prevents legacy concepts from polluting the new domain", "Can be a service layer, adapter, or set of mappers", "Lossy mapping — fields with no clean equivalent get silently dropped without round-trip tests", "The ACL can accrete too much logic and become a fragile god-service over time"],
  },
  "cloud-architecture:Event-Driven Architecture": {
    oneLine: "Event-driven architecture connects services through events rather than direct calls — producers emit facts that happened, and any number of consumers react without the producer needing to know who they are.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Producer emits events; event bus fans out to all interested consumers.">
        <DiagBox x={10} y={80} w={110} h={40} label="Producer" sub="emits events" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={180} y={70} w={100} h={60} label="Event Bus" sub="broker" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={120} y1={100} x2={178} y2={100} color={h.base} label="event" />
        {[20,90,160].map((y,i)=>(
          <g key={i}>
            <DiagBox x={340} y={y} w={110} h={38} label={["Billing","Inventory","Analytics"][i]} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={280} y1={100} x2={338} y2={y+19} color={h.base} />
          </g>
        ))}
        <text x={230} y={180} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">producer unaware of consumer count or type</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a breaking news alert", text: "The news agency broadcasts a headline — it doesn't call each reader individually. Everyone subscribed gets the alert. New subscribers can start listening without the agency changing anything." },
    body: <div style={PROSE}><p style={{margin:0}}>Events represent facts that occurred (OrderPlaced, UserRegistered). Consumers react independently and asynchronously — decoupled in time and space. Adding a new consumer requires zero changes to the producer. The trade-off: eventual consistency and the need to handle out-of-order or duplicate events via idempotency.</p><p style={{margin:"0.75em 0 0"}}>At-least-once brokers will re-deliver events — every consumer must be idempotent, or duplicate processing will silently corrupt state. Track duplicate-rate metrics to catch this in production.</p></div>,
    keyPoints: ["Producers emit facts; consumers react asynchronously", "Zero coupling — add consumers without touching producers", "Design events as immutable facts, not commands", "Unbounded consumer lag can explode into a backlog — monitor queue depth continuously", "Out-of-order delivery requires sequence numbers or gap checks at the consumer"],
  },
  "cloud-architecture:Event Sourcing": {
    oneLine: "Event Sourcing stores state as an immutable append-only sequence of events — to get the current state you replay the log, and you can replay to any point in time.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="State is derived by replaying events from the append-only event store.">
        <DiagBox x={10} y={77} w={90} h={40} label="Command" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={160} y={60} w={140} h={70} label="Event Store" sub="append-only log" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={100} y1={97} x2={158} y2={95} color={h.base} label="append event" />
        <DiagBox x={360} y={77} w={90} h={40} label="Current State" sub="= replay" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={300} y1={95} x2={358} y2={97} color={h.base} label="replay" />
        <text x={230} y={165} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">snapshots cache replayed state at a checkpoint</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a bank statement vs. a balance", text: "A balance sheet tells you what you have now. A bank statement tells you every transaction — replay it from any point and you get any historical balance. The statement is the source of truth." },
    body: <div style={PROSE}><p style={{margin:0}}>Every change is stored as an event (e.g. MoneyDeposited{"{amount:100}"}). Current state is derived by folding (reducing) all events. <strong>Snapshots</strong> cache the state at a checkpoint so you don't replay from the beginning every time. Benefits: full audit log, time-travel debugging, and easy event replay. Trade-offs: query complexity and event schema evolution.</p><p style={{margin:"0.75em 0 0"}}>Changing the shape of historical events is genuinely hard — use versioned events and upcasting so old events can still be replayed correctly after a schema change.</p></div>,
    keyPoints: ["Append-only log — events are never updated or deleted", "Replay events to compute current or historical state", "Snapshots prevent unbounded replay time", "Event store grows forever — track storage size and replay-duration trends", "Schema evolution of old events breaks replay if not versioned and upcast"],
  },
  "cloud-architecture:CQRS — Command Query Responsibility Segregation": {
    oneLine: "CQRS separates the write model (commands) from the read model (queries) so each can be optimised, scaled, and evolved independently.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Commands update the write store; a projection syncs a denormalised read store.">
        <DiagBox x={10} y={77} w={90} h={50} label="Client" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={165} y={40} w={110} h={50} label="Command" sub="write model" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={165} y={120} w={110} h={50} label="Query" sub="read model" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={100} y1={90} x2={163} y2={65} color={h.base} label="write" />
        <DiagArrow x1={100} y1={102} x2={163} y2={145} color={s} label="read" />
        <DiagBox x={340} y={40} w={110} h={50} label="Write DB" sub="normalised" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={340} y={120} w={110} h={50} label="Read DB" sub="denormalised" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={275} y1={65} x2={338} y2={65} color={h.base} />
        <DiagArrow x1={395} y1={90} x2={395} y2={118} color={s} dashed label="project" />
        <DiagArrow x1={338} y1={145} x2={275} y2={145} color={s} />
      </DiagFrame>
    ); },
    analogy: { title: "Like separate tills for buying and checking receipts", text: "One counter handles purchases (writes) and keeps a clean ledger. Another counter only handles receipt queries (reads) using a fast lookup table. Neither queue blocks the other." },
    body: <div style={PROSE}><p style={{margin:0}}>Commands change state (no return value); queries read state (no side effects). The write model uses a normalised schema for integrity; the read model uses denormalised projections optimised for the UI's query patterns. Projections update asynchronously from events — introducing eventual consistency. Scale write and read replicas independently.</p><p style={{margin:"0.75em 0 0"}}>A common production pitfall: users write and immediately read stale data from the lagging read model — track projection lag metrics and design the UI to tolerate or mask this consistency window.</p></div>,
    keyPoints: ["Commands and queries use separate models and databases", "Read model is a denormalised projection optimised for queries", "Eventual consistency between write and read models", "A missed or failed event can leave a projection permanently wrong — reconcile periodically", "Read and write sides can use completely different database technologies for their workload"],
  },
  "cloud-architecture:Saga Pattern": {
    oneLine: "A saga manages a long-running distributed transaction by chaining local transactions — if any step fails, compensating transactions undo the previous steps in reverse.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Orchestration saga: a central coordinator drives each step and handles compensation.">
        <DiagBox x={160} y={10} w={140} h={40} label="Saga Orchestrator" fill={h.soft} stroke={h.base} text={h.ink} />
        {[["Order svc",20],["Payment svc",160],["Shipping svc",300]].map(([lbl,x],i)=>(
          <g key={i}>
            <DiagBox x={x as number} y={100} w={120} h={40} label={lbl as string} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={230} y1={50} x2={(x as number)+60} y2={98} color={h.base} label={i===1?"step":undefined} />
            <DiagArrow x1={(x as number)+60} y1={140} x2={230} y2={155} color={s} dashed label={i===1?"ack":undefined} />
          </g>
        ))}
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">failure → orchestrator triggers compensating transactions</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like booking a holiday package", text: "You book flight, hotel, and car hire one at a time. If the hotel is full, the travel agent cancels the flight and car hire — compensation undoes completed steps." },
    body: <div style={PROSE}><p style={{margin:0}}><strong>Choreography</strong>: each service publishes an event; the next service reacts. No central controller, but harder to follow the flow. <strong>Orchestration</strong>: a central Saga Orchestrator sends commands and receives responses, tracking state and triggering compensations on failure. Orchestration is easier to debug and monitor.</p><p style={{margin:"0.75em 0 0"}}>Compensating transactions are not true rollbacks — they are forward-fixing actions, and if a compensation itself fails you need a dead-letter queue and stuck-saga alarms to avoid permanent partial state.</p></div>,
    keyPoints: ["Local transactions in each service, compensating actions on failure", "Choreography: event-driven, decentralised", "Orchestration: central coordinator, easier to observe", "Intermediate states are visible to other services — sagas provide no isolation guarantee", "A saga orchestrator's state must be durable — a crash mid-saga without persistence orphans work"],
  },
  "cloud-architecture:Outbox Pattern": {
    oneLine: "The Outbox Pattern reliably publishes events by writing them to a database outbox table in the same transaction as the business change — eliminating the dual-write race condition.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Business data + outbox row written atomically; a relay picks up the outbox and publishes.">
        <DiagBox x={10} y={70} w={130} h={50} label="Service" sub="BEGIN TX" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={200} y={40} w={110} h={40} label="Business Table" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={200} y={100} w={110} h={40} label="Outbox Table" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={140} y1={82} x2={198} y2={60} color={h.base} label="write" />
        <DiagArrow x1={140} y1={96} x2={198} y2={120} color={h.base} label="write" />
        <DiagBox x={365} y={80} w={85} h={40} label="Message Relay" sub="CDC / poll" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={310} y1={120} x2={363} y2={100} color={s} dashed label="read" />
        <text x={230} y={180} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">atomic write prevents lost events if broker is down</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like dropping a letter in your own post box first", text: "You write the letter and drop it in your private post box in one step. A courier checks the box and mails it later. Even if the postal service is down when you write it, the letter is safe." },
    body: <div style={PROSE}><p style={{margin:0}}>Without the Outbox, you write to DB then publish to the broker — if the broker call fails, the event is lost. The Outbox writes the event to a database table <em>atomically</em> with the business change. A <strong>message relay</strong> (CDC via Debezium, or a polling job) reads unpublished outbox rows and publishes them, then marks them as published. At-least-once delivery.</p><p style={{margin:"0.75em 0 0"}}>If the relay crashes after publishing but before marking the row as sent, the event is re-emitted — consumers must be idempotent, and you should monitor downstream duplicate rates to catch this.</p></div>,
    keyPoints: ["Atomic write of business data + event — no dual-write gap", "Relay publishes from outbox asynchronously", "At-least-once delivery — consumers must be idempotent", "Outbox table grows if published rows are never pruned — run a cleanup job", "If the relay falls behind, unpublished-row count is the key metric to alarm on"],
  },
  "cloud-architecture:Serverless Architecture": {
    oneLine: "Serverless runs your code in ephemeral, event-triggered functions managed entirely by the cloud — you pay per invocation and never provision or patch a server.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Event triggers a function; platform cold-starts a container, runs it, and tears it down.">
        <DiagBox x={10} y={77} w={100} h={40} label="Trigger" sub="HTTP / queue" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={60} w={110} h={70} label="Function" sub="your code" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={110} y1={97} x2={173} y2={95} color={h.base} label="invoke" />
        <DiagBox x={345} y={50} w={105} h={40} label="Database" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={345} y={120} w={105} h={40} label="Downstream" sub="API / queue" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={285} y1={80} x2={343} y2={70} color={s} />
        <DiagArrow x1={285} y1={110} x2={343} y2={140} color={s} />
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">stateless — state must live in external storage</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a taxi instead of owning a car", text: "You don't maintain a car (server). You call a taxi when needed (invoke a function). You pay per ride, not per hour of ownership — and the fleet scales infinitely." },
    body: <div style={PROSE}><p style={{margin:0}}>Functions are stateless — each invocation starts fresh. State lives in external storage (S3, DynamoDB, RDS). <strong>Cold starts</strong> add latency on the first invocation after idle. <strong>Concurrency</strong> scales automatically — 1 or 10,000 parallel invocations without any ops work. Best for event-driven workloads with variable traffic; less suited for long-running or latency-sensitive workloads.</p><p style={{margin:"0.75em 0 0"}}>Long tasks that hit the platform's execution-time limit (e.g. 15 minutes on AWS Lambda) fail mid-run with no partial result — offload anything long-running to a queue-backed worker instead.</p></div>,
    keyPoints: ["Stateless functions — all state in external storage", "Auto-scales to zero and back instantly", "Cold starts add latency — warm concurrency or provisioned concurrency mitigates it", "Execution-time limits make serverless unsuitable for long-running jobs", "Many tiny functions create distributed-tracing blind spots — adopt trace context propagation"],
  },
  "cloud-architecture:Fan-Out / Fan-In Pattern": {
    oneLine: "Fan-out splits a task into parallel sub-tasks that run concurrently; fan-in waits for all of them to finish and aggregates the results into one response.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="One request spawns N parallel workers; aggregator waits for all N results.">
        <DiagBox x={10} y={80} w={100} h={40} label="Orchestrator" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={100} x2={148} y2={100} color={h.base} label="fan-out" />
        {[30,90,150].map((y,i)=>(
          <g key={i}>
            <DiagBox x={150} y={y} w={100} h={36} label={`Worker ${i+1}`} fill={h.soft} stroke={h.base} text={h.ink} />
            <DiagArrow x1={250} y1={y+18} x2={298} y2={100} color={h.base} />
          </g>
        ))}
        <DiagBox x={300} y={80} w={100} h={40} label="Aggregator" sub="fan-in" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={400} y1={100} x2={445} y2={100} color={h.base} label="result" />
        <text x={230} y={190} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">wall-clock time = slowest worker, not sum of all</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like marking exams in parallel", text: "One coordinator splits 300 exams among 30 markers. Each marks in parallel. The coordinator collects and averages all scores. Total time: how long the slowest marker takes, not 300 × one marker's time." },
    body: <div style={PROSE}><p style={{margin:0}}>Fan-out is ideal when a task can be decomposed into independent sub-tasks — parallel search across shards, parallel API calls, map-reduce jobs. The aggregator (fan-in) waits using a barrier or promise.all and merges results. The bottleneck is the slowest worker — ensure work is evenly distributed and add a timeout so one slow worker doesn't stall the whole response.</p><p style={{margin:"0.75em 0 0"}}>When some workers fail and the aggregator can't form a complete result, you need per-branch success tracking and a completeness check — otherwise the fan-in silently returns a partial answer.</p></div>,
    keyPoints: ["Wall-clock time equals slowest worker — distribute evenly", "Works only when sub-tasks are independent", "Add timeouts so one stuck worker doesn't block the aggregator", "Partial fan-in on worker failures requires a completeness check before returning", "The aggregator itself can become a bottleneck — monitor its queue depth under high parallelism"],
  },
  "cloud-architecture:Competing Consumers Pattern": {
    oneLine: "Multiple consumers pull from the same queue and process messages in parallel — adding consumers increases throughput without any coordination between them.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Queue holds work; each consumer races to lock and process the next message.">
        <DiagBox x={10} y={77} w={100} h={40} label="Producer" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={60} w={110} h={70} label="Queue" sub="buffered work" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={110} y1={97} x2={173} y2={95} color={h.base} label="enqueue" />
        {[30,90,150].map((y,i)=>(
          <g key={i}>
            <DiagBox x={345} y={y} w={105} h={38} label={`Consumer ${i+1}`} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={285} y1={95} x2={343} y2={y+19} color={h.base} label={i===0?"dequeue":undefined} />
          </g>
        ))}
        <text x={230} y={180} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">scale consumers to match queue depth</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like checkout lanes at a supermarket", text: "One queue of shoppers, multiple checkout lanes. Open more lanes when the queue grows. Each lane independently processes the next shopper in line." },
    body: <div style={PROSE}><p style={{margin:0}}>The queue decouples producers from consumers and buffers load spikes. Consumers compete to dequeue and lock each message. A message is deleted only after successful acknowledgement — if a consumer crashes, the message becomes visible again and another consumer picks it up. Scale the consumer count by monitoring queue depth (SQS ApproximateNumberOfMessages).</p><p style={{margin:"0.75em 0 0"}}>A malformed poison-pill message repeatedly crashes whichever consumer picks it up — configure a redelivery-count limit that routes the message to a dead-letter queue to break the loop.</p></div>,
    keyPoints: ["Scale consumers by adding instances — no coordination needed", "Queue absorbs load spikes and distributes work evenly", "At-least-once delivery — consumers must handle duplicates", "Poison-pill messages need a redelivery limit and a dead-letter queue", "No ordering guarantee across consumers — use partition keys if order matters"],
  },
  "cloud-architecture:Durable Execution Pattern": {
    oneLine: "Durable execution persists the state of long-running workflows so they survive process crashes and restarts — no lost progress, no manual retry logic.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Workflow state persisted at every step — crash mid-flight, resume from the last checkpoint.">
        {["Step 1","Step 2","Step 3","Step 4"].map((lbl,i)=>(
          <g key={i}>
            <DiagBox x={10+i*108} y={60} w={96} h={50} label={lbl} fill={i===2?h.soft:i<2?"var(--card)":"var(--card)"} stroke={i===2?h.base:i<2?h.base:s} text={i===2?h.ink:"var(--ink)"} />
            {i<3&&<DiagArrow x1={106+i*108} y1={85} x2={118+i*108} y2={85} color={i<2?h.base:s} />}
          </g>
        ))}
        <text x={230} y={135} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">✓ persisted · ✓ persisted · 💥 crash → resume here</text>
        <text x={230} y={155} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">Temporal · AWS Step Functions · Durable Functions</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a save-state in a video game", text: "You save before every boss fight. Lose? Reload from the save. No need to replay the whole game — you pick up exactly where you were." },
    body: <div style={PROSE}><p style={{margin:0}}>Frameworks like <strong>Temporal</strong>, <strong>AWS Step Functions</strong>, and <strong>Azure Durable Functions</strong> persist the workflow's execution history in an external store. On crash, the worker replays the history to reconstruct state and continues from the last incomplete step. Retry logic, timeouts, and compensation are built into the framework — your code just expresses the happy path.</p><p style={{margin:"0.75em 0 0"}}>Replay-based engines break if step logic isn't deterministic — avoid direct clock reads, random calls, or external I/O inside step code; the engine's determinism checks will catch violations at runtime.</p></div>,
    keyPoints: ["State persisted at each step — crash-safe execution", "Replay history to restore state — no manual checkpointing", "Retry, timeout, and compensation handled by the framework", "Step code must be deterministic — direct clock or random calls break replay", "Deploying new workflow code can break in-flight runs — version workflow definitions carefully"],
  },
  "cloud-architecture:Bulkhead Pattern": {
    oneLine: "Bulkhead isolates failures by partitioning resources — each consumer gets its own thread pool or connection pool, so one overloaded consumer can't exhaust the shared resource for everyone.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Each service gets its own thread pool — overload in one doesn't starve the others.">
        {["Service A","Service B","Service C"].map((lbl,i)=>(
          <g key={i}>
            <DiagBox x={10+i*148} y={30} w={136} h={36} label={lbl} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagBox x={10+i*148} y={90} w={136} h={50} label={i===1?"OVERLOADED":"Pool OK"} sub={i===1?"exhausted":"10/10 free"} fill={i===1?h.soft:"var(--card)"} stroke={i===1?h.base:s} text={i===1?h.ink:"var(--ink)"} />
            <DiagArrow x1={78+i*148} y1={66} x2={78+i*148} y2={88} color={i===1?h.base:s} />
          </g>
        ))}
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">B drowning doesn't sink A or C</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like watertight compartments on a ship", text: "If one compartment floods, the bulkheads contain the water. The ship stays afloat. Without bulkheads, one breach floods the whole hull." },
    body: <div style={PROSE}><p style={{margin:0}}>Partition thread pools, connection pools, or semaphores by consumer/service. If Service B floods its pool with slow requests, Services A and C still have their own healthy pools. Bulkhead is often combined with Circuit Breaker: the circuit breaker detects failure; the bulkhead contains blast radius. Resilience4j and Hystrix both implement bulkheads.</p><p style={{margin:"0.75em 0 0"}}>Fixed-partition pools trade efficiency for isolation — idle partitions cannot lend capacity to a busy one, so under-sizing any compartment throttles normal load even when other pools are empty.</p></div>,
    keyPoints: ["Partition resources per consumer to contain failure blast radius", "Combine with circuit breaker for full resilience", "Size each pool based on the downstream service's capacity", "Mis-partitioned boundaries put correlated load in one bulkhead — analyse which workloads spike together", "Wasted idle capacity is the key cost — monitor per-partition utilisation variance"],
  },
  "cloud-architecture:Retry with Exponential Backoff & Jitter": {
    oneLine: "Retrying failed requests with exponentially increasing delays and random jitter prevents thundering-herd storms that would crush a recovering service.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 180" caption="Each retry waits 2ˣ seconds + random jitter — backoff spread prevents synchronized storms.">
        {[0,1,2,3].map(i=>{
          const y=50; const x=10+i*104; const bh=20+i*20;
          return (
            <g key={i}>
              <DiagArrow x1={x+10} y1={y} x2={x+80} y2={y} color={i===0?h.base:s} label={i===0?"try 1":i===3?"give up":undefined} lx={x+45} ly={y-8} />
              <rect x={x+80} y={y-bh/2} width={18} height={bh} rx={4} fill={h.soft} stroke={h.base} strokeWidth="1.5" />
              <text x={x+89} y={y+bh/2+14} textAnchor="middle" fontSize="8" fill={h.ink} fontFamily="var(--font-body,system-ui)">{["1s","2s","4s"][i]||""}</text>
            </g>
          );
        })}
        <text x={230} y={160} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">+ jitter: add random(0, delay) so clients don't retry in sync</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like redialing after a busy signal", text: "You wait 1 minute, then 2, then 4. You also wait an extra random few seconds so you and every other caller don't all redial at exactly the same moment." },
    body: <div style={PROSE}><p style={{margin:0}}>After a transient failure, wait <strong>2^attempt × base</strong> milliseconds before retrying. Add <strong>jitter</strong> (random fraction of the delay) so retrying clients don't all fire at the same instant and re-overload the recovering service. Always set a <strong>max attempts</strong> and a <strong>max delay cap</strong>. Don't retry non-idempotent operations (DELETE, POST) without deduplication.</p><p style={{margin:"0.75em 0 0"}}>Without jitter, all clients that fail at the same moment retry in a synchronised wave — this thundering herd can re-overwhelm the service right as it starts to recover, turning a transient blip into a prolonged outage.</p></div>,
    keyPoints: ["Exponential backoff: wait 1s, 2s, 4s, 8s…", "Jitter prevents thundering-herd resynchronisation", "Only retry idempotent operations, or use an idempotency key", "Exhausting the retry budget without failing fast amplifies load — enforce caps and route to a DLQ", "Cap the maximum delay (e.g. 30s) to bound worst-case recovery time"],
  },
  "cloud-architecture:Throttling & Rate Limiting Pattern": {
    oneLine: "Throttling controls how fast you call downstream services to protect them — rate limiting controls how fast callers can call you to protect yourself.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Throttle outbound calls to protect downstream; rate-limit inbound to protect yourself.">
        <DiagBox x={10} y={80} w={100} h={40} label="Your Service" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={50} w={110} h={40} label="Rate Limiter" sub="inbound guard" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={120} w={110} h={40} label="Throttler" sub="outbound guard" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={110} y1={90} x2={173} y2={70} color={h.base} label="←clients" />
        <DiagArrow x1={110} y1={100} x2={173} y2={140} color={s} label="→downstream" />
        <DiagBox x={345} y={120} w={105} h={40} label="Downstream" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={285} y1={140} x2={343} y2={140} color={s} />
      </DiagFrame>
    ); },
    analogy: { title: "Like traffic lights in both directions", text: "Rate limiting is the red light stopping too many cars entering your neighbourhood. Throttling is you checking the speedometer before pulling onto the motorway to protect other drivers." },
    body: <div style={PROSE}><p style={{margin:0}}><strong>Rate limiting</strong> rejects excess inbound requests (HTTP 429) to protect your service. <strong>Throttling</strong> slows your outbound calls to stay within a dependency's quota — use token bucket or a semaphore with sleep/retry. Both are necessary: rate limiting for security and fairness; throttling to avoid blowing through API quotas and getting your IP blocked.</p><p style={{margin:"0.75em 0 0"}}>Fixed-window counters allow a client to double their allowance by firing requests at the window boundary — sliding-window counters prevent this burst-at-boundary problem at the cost of slightly more state.</p></div>,
    keyPoints: ["Rate limiting: protect yourself from callers", "Throttling: protect downstream services from you", "Combine token bucket + circuit breaker for full outbound protection", "Always return Retry-After with a 429 — clients without guidance retry immediately and keep failing", "Distributed per-node counters undercount global rate — use shared state for accurate enforcement"],
  },
  "cloud-architecture:Database per Service Pattern": {
    oneLine: "Each microservice owns its private database — no service queries another's database directly, enforcing loose coupling and letting each service choose its own data store.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Services communicate through APIs, not shared tables — each owns its schema.">
        {[["Orders\nsvc","Orders DB"],[" Users\nsvc","Users DB"],["Inventory\nsvc","Inventory DB"]].map(([svc,db],i)=>(
          <g key={i}>
            <DiagBox x={10+i*148} y={20} w={136} h={36} label={(svc as string).replace("\n"," ")} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagBox x={10+i*148} y={110} w={136} h={36} label={db as string} fill={i===0?h.soft:"var(--card)"} stroke={i===0?h.base:s} text={i===0?h.ink:"var(--ink)"} />
            <DiagArrow x1={78+i*148} y1={56} x2={78+i*148} y2={108} color={h.base} label="owns" />
          </g>
        ))}
        <text x={230} y={170} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">cross-service data: API calls or events — never JOIN across DBs</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like separate notebooks for each department", text: "Sales, HR, and Finance each have their own notebook. They don't read each other's — they share summaries through official memos. Each team can change their format independently." },
    body: <div style={PROSE}><p style={{margin:0}}>Shared databases couple services at the schema level — one service's migration can break another's. Database per Service means each service has its own database credentials and schema. Cross-service queries become API calls or event subscriptions. Each service can choose the right database type for its workload: Postgres, MongoDB, Redis, Cassandra.</p><p style={{margin:"0.75em 0 0"}}>Cross-service reporting is the hardest part — analytics that spans multiple private stores requires a dedicated warehouse or data pipeline; ad-hoc data exports are a sign you need one.</p></div>,
    keyPoints: ["Each service owns its schema — no shared tables", "Cross-service data via API or events, never direct DB access", "Enables each service to use the optimal database technology", "Cross-service consistency has no single transaction — use sagas or events with reconciliation", "N+1 API fan-out on composite reads is a common performance trap to watch for"],
  },
  "cloud-architecture:CQRS + Read Replicas Pattern": {
    oneLine: "Combining CQRS with read replicas routes all writes to the primary and all queries to multiple read replicas — maximising both write throughput and read scalability.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Writes go to primary (command side); reads go to replicas (query side) — async replication in between.">
        <DiagBox x={10} y={80} w={100} h={40} label="Client" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={50} w={110} h={40} label="Primary DB" sub="writes only" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={120} w={110} h={40} label="Read Replica" sub="reads only" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={90} x2={173} y2={70} color={h.base} label="commands" />
        <DiagArrow x1={110} y1={100} x2={173} y2={140} color={s} label="queries" />
        <DiagArrow x1={230} y1={90} x2={230} y2={118} color={s} dashed label="async repl." />
        <text x={230} y={190} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">replica lag = eventual consistency window</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a library with one acquisitions desk and many reading rooms", text: "All new books are catalogued at one desk (primary). Readers browse copies in any of the many reading rooms (replicas). New books may take a moment to appear in all rooms." },
    body: <div style={PROSE}><p style={{margin:0}}>The write path hits the primary; replication propagates changes asynchronously to read replicas. The query path is load-balanced across replicas. Replica lag is typically milliseconds but can grow under heavy write load — clients that read immediately after writing should either read from the primary or use a consistency token to route to a sufficiently caught-up replica.</p><p style={{margin:"0.75em 0 0"}}>A failed CDC stream can leave a read store permanently wrong without anyone noticing — run periodic reconciliation checks against the primary to detect and correct projection divergence.</p></div>,
    keyPoints: ["Write primary, read replicas — linearly scalable reads", "Replica lag creates eventual consistency — design for it", "Sticky reads or conditional routing prevents stale-read UX issues", "Each read store (search, cache, warehouse) is a projection kept current via CDC or events", "Operational sprawl multiplies with each added read store — track incident attribution per store"],
  },
  "cloud-architecture:Materialized View Pattern": {
    oneLine: "A materialized view pre-computes and persists the result of an expensive query so reads are instantaneous — at the cost of staleness until the view is refreshed.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Source tables change → refresh job updates materialized view → queries read from fast pre-computed result.">
        <DiagBox x={10} y={70} w={130} h={50} label="Source Tables" sub="orders · products" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={205} y={70} w={50} h={50} label="Refresh" fill={h.soft} stroke={h.base} text={h.ink} rx={25} />
        <DiagBox x={320} y={70} w={130} h={50} label="Materialized View" sub="pre-computed" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={140} y1={95} x2={203} y2={95} color={h.base} label="change" />
        <DiagArrow x1={255} y1={95} x2={318} y2={95} color={h.base} label="update" />
        <DiagBox x={320} y={155} w={130} h={30} label="Query ← instant" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <DiagArrow x1={385} y1={120} x2={385} y2={153} color={s} />
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">CONCURRENT REFRESH avoids locking readers in Postgres</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a pre-printed price list", text: "Instead of calculating every customer's total at the till, you pre-print a price list each morning. Reads are instant — the list may be an hour old, but close enough for most purposes." },
    body: <div style={PROSE}><p style={{margin:0}}>Postgres <code>MATERIALIZED VIEW</code> stores the query result on disk. Reads hit a plain table — no complex join is re-executed. Refresh can be manual, scheduled, or triggered on source table changes (via triggers + a background job). <code>REFRESH MATERIALIZED VIEW CONCURRENTLY</code> allows reads during refresh. Use when read performance matters more than perfect freshness.</p><p style={{margin:"0.75em 0 0"}}>Eager refresh on every source write can trigger refresh storms under high write load — switch to batched or event-driven refresh and monitor refresh-rate spikes to catch this early.</p></div>,
    keyPoints: ["Pre-computed result — reads are O(1) instead of expensive joins", "Staleness: data is only as fresh as the last refresh", "CONCURRENT REFRESH avoids blocking readers", "Refresh storms from eager per-write updates can overwhelm the database under load", "A missed refresh leaves the view subtly wrong — checksum against recomputed results periodically"],
  },
  "cloud-architecture:Blue/Green Deployment": {
    oneLine: "Blue/Green deployment maintains two identical environments — blue (live) and green (new) — and switches traffic instantly between them for zero-downtime deploys and instant rollback.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Traffic routed to Blue (live); Green receives new version; flip the switch to make Green live.">
        <DiagBox x={10} y={80} w={100} h={40} label="LB / DNS" sub="routes traffic" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={50} w={130} h={50} label="Blue" sub="v1 — live" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={130} w={130} h={50} label="Green" sub="v2 — staging" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={95} x2={173} y2={75} color={h.base} label="100% traffic" />
        <DiagArrow x1={110} y1={105} x2={173} y2={155} color={s} dashed label="0% traffic" />
        <text x={340} y={105} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">⇩ flip switch</text>
        <text x={340} y={120} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">Green → 100%</text>
        <text x={340} y={135} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">Blue → 0% (warm standby)</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a Broadway stage swap", text: "The understudy rehearses on a second stage while the show runs on the main one. At intermission you swap them. If the understudy forgets their lines, swap back instantly." },
    body: <div style={PROSE}><p style={{margin:0}}>Both environments are identical in size. Deploy the new version to green, run smoke tests, then switch the load balancer in seconds — zero downtime. If issues appear post-switch, roll back in seconds by flipping traffic back to blue. The main cost: double infrastructure during each deployment window. Database migrations must be backward-compatible with both versions.</p><p style={{margin:"0.75em 0 0"}}>Long-lived connections can linger on the old stack after the switch — enforce a connection-drain period before tearing blue down to avoid in-flight request failures.</p></div>,
    keyPoints: ["Instant traffic switch = zero-downtime deploy", "Instant rollback — just flip traffic back to the old version", "DB migrations must support both v1 and v2 simultaneously", "Double infrastructure cost during each deployment window is the primary trade-off", "Stale long-lived connections to the old stack need explicit draining before teardown"],
  },
  "cloud-architecture:Canary Deployment": {
    oneLine: "Canary deployment sends a small percentage of real traffic to the new version — you monitor for errors before gradually increasing until the new version carries all traffic.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="5% to canary (v2); 95% to stable (v1) — graduate canary if metrics are healthy.">
        <DiagBox x={10} y={80} w={100} h={40} label="Load Balancer" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={175} y={50} w={130} h={50} label="Stable v1" sub="95% traffic" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={130} w={130} h={50} label="Canary v2" sub="5% traffic" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={110} y1={90} x2={173} y2={75} color={s} />
        <DiagArrow x1={110} y1={105} x2={173} y2={155} color={h.base} />
        <text x={370} y={100} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">monitor p99</text>
        <text x={370} y={115} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">error rate</text>
        <text x={370} y={130} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">→ 100% if ok</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like coal miners with a canary", text: "Coal miners carried a canary into mines — if dangerous gas appeared, the canary died first, alerting the miners before they were harmed. A small deployment takes the risk first." },
    body: <div style={PROSE}><p style={{margin:0}}>Start with 1–5% of traffic to the new version. Monitor error rate, p99 latency, and business metrics. If healthy, increment to 10%, 25%, 50%, 100%. If metrics degrade, route all traffic back to the stable version and investigate. Canary reduces the blast radius of bad releases: at 5%, only 5% of users are affected before rollback.</p><p style={{margin:"0.75em 0 0"}}>At very small traffic percentages there may not be enough sample volume to detect a real regression — check statistical significance before each promotion step rather than relying on raw error counts.</p></div>,
    keyPoints: ["Small initial blast radius — most users unaffected by bugs", "Automated metric checks can trigger rollback", "Graduate traffic slowly: 5% → 25% → 50% → 100%", "Low-traffic canaries lack sample size to detect subtle regressions — verify significance before promoting", "A stalled rollout leaves two versions running indefinitely — set automatic rollout-duration timeouts"],
  },
  "cloud-architecture:Feature Flags Pattern": {
    oneLine: "Feature flags decouple deployment from release — code ships to production turned off, and you enable it for users at any time without a redeploy.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Flag evaluated at runtime; true → new path, false → old path. Change without redeploy.">
        <DiagBox x={10} y={80} w={110} h={40} label="Request" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={185} y={65} w={90} h={60} label="Flag Check" sub="isEnabled?" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={120} y1={100} x2={183} y2={95} color={h.base} />
        <DiagBox x={340} y={40} w={110} h={40} label="New Feature" sub="true" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={340} y={120} w={110} h={40} label="Old Behaviour" sub="false" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={275} y1={80} x2={338} y2={60} color={h.base} label="on" />
        <DiagArrow x1={275} y1={110} x2={338} y2={140} color={s} label="off" />
        <text x={230} y={180} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">targeting: % of users, cohort, org, environment</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a light switch in the wall behind plaster", text: "The wiring is already installed and connected — it just isn't turned on yet. Flip the switch and the lights come on, instantly, for whoever you choose." },
    body: <div style={PROSE}><p style={{margin:0}}>Feature flags enable <strong>dark launches</strong> (deploy but don't activate), <strong>A/B testing</strong> (split users into groups), <strong>kill switches</strong> (disable a feature under load without redeploying), and <strong>gradual rollouts</strong> (percentage-based activation). Tools: LaunchDarkly, Unleash, Flagsmith. Keep flags short-lived — delete them when the feature is fully rolled out.</p><p style={{margin:"0.75em 0 0"}}>If the flag-service itself goes down and there is no safe default fallback defined, the system's behaviour becomes undefined — always configure a sensible default and monitor flag-service health.</p></div>,
    keyPoints: ["Deploy code dark; release when ready — no second deploy", "Kill switches let you disable features instantly without a deploy", "Delete flags after full rollout — flag debt is real", "Combinations of active flags create untested states — track and test active-flag interactions", "Flag-service outages need safe default fallbacks to prevent undefined behaviour"],
  },
  "cloud-architecture:Sidecar Service Mesh Pattern": {
    oneLine: "A sidecar service mesh deploys a proxy (Envoy) next to every service so mTLS, retries, tracing, and traffic management are handled at the infrastructure layer — not in code.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Every service has a sidecar proxy; the control plane distributes policy to all proxies.">
        <DiagBox x={20} y={20} w={80} h={36} label="Svc A" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={20} y={76} w={80} h={36} label="Proxy A" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={300} y={20} w={80} h={36} label="Svc B" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={300} y={76} w={80} h={36} label="Proxy B" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={100} y1={94} x2={298} y2={94} color={h.base} label="mTLS · tracing" />
        <DiagBox x={155} y={150} w={150} h={36} label="Control Plane" sub="Istio / Linkerd" fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
        <DiagArrow x1={60} y1={112} x2={175} y2={148} color={s} dashed label="policy" />
        <DiagArrow x1={340} y1={112} x2={285} y2={148} color={s} dashed />
      </DiagFrame>
    ); },
    analogy: { title: "Like security escorts for every employee", text: "No employee manages their own security. A trained escort accompanies everyone — handling authentication, logging, and routing. The control room updates all escort policies centrally." },
    body: <div style={PROSE}><p style={{margin:0}}>The control plane (Istiod, Linkerd control plane) configures all sidecars centrally. Each sidecar intercepts all inbound and outbound traffic, enforcing mTLS (mutual auth), observability (traces/metrics), traffic splitting (canary), and fault injection. No service code changes needed. Adds ~5–10 ms latency per hop due to proxying.</p><p style={{margin:"0.75em 0 0"}}>The control plane itself becomes critical infrastructure — if it can't push config updates, the mesh degrades; monitor config-propagation metrics and have a break-glass runbook ready.</p></div>,
    keyPoints: ["All traffic through sidecars — mTLS and tracing transparent to services", "Control plane pushes policy changes to all proxies without redeploy", "Adds per-hop latency — measure before committing", "Control-plane outage blocks config updates — monitor propagation health and prepare a break-glass runbook", "Misconfigured traffic rules silently break routing — lint and canary mesh config changes before applying"],
  },

  // ── AI & LLMs ─────────────────────────────────────────────────────────────
  "ai-llm:The Neuron": {
    oneLine: "An artificial neuron multiplies each input by a weight, sums everything up, adds a bias, and squashes the result through an activation function to produce one output.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Weighted inputs are summed (Σ), then passed through an activation function f().">
        {[60,110,160].map((y,i)=>(
          <g key={i}>
            <circle cx={40} cy={y} r={18} fill="var(--card)" stroke={s} strokeWidth="2" />
            <text x={40} y={y+5} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">{`x${i+1}`}</text>
            <DiagArrow x1={58} y1={y} x2={158} y2={118} color={s} />
            <text x={115} y={[80,112,150][i]} fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">{`×w${i+1}`}</text>
          </g>
        ))}
        <circle cx={180} cy={110} r={26} fill={h.soft} stroke={h.base} strokeWidth="2" />
        <text x={180} y={117} textAnchor="middle" fontSize="18" fill={h.ink} fontFamily="var(--font-body,system-ui)">Σ</text>
        <DiagArrow x1={206} y1={110} x2={270} y2={110} color={h.base} />
        <DiagBox x={274} y={88} w={80} h={44} label="f()" sub="activation" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={354} y1={110} x2={415} y2={110} color={h.base} />
        <circle cx={430} cy={110} r={16} fill="var(--card)" stroke={s} strokeWidth="2" />
        <text x={430} y={115} textAnchor="middle" fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">y</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a dimmer switch wired to three switches", text: "Each switch (input) contributes a little or a lot depending on how its dial is turned (weight). The dimmer blends them into one brightness level (output)." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A single neuron computes <code>y = f(w₁x₁ + w₂x₂ + … + b)</code>. The weights determine which inputs matter most; the bias shifts the activation threshold. The activation function (ReLU, sigmoid) adds the non-linearity needed for a network of neurons to learn complex patterns. One neuron is trivial — intelligence emerges from millions connected.</p><p style={{margin:0}}>The artificial neuron was first described on paper in 1943 by McCulloch and Pitts — decades before any computer could run more than a handful of them at once.</p></div>,
    keyPoints: ["Weighted sum + bias → activation function → single output", "Weights encode learned importance of each input", "Non-linear activation is what makes deep networks powerful", "Changing weights is how a neuron learns — training is just tuning those numbers", "One neuron is trivial; intelligence only emerges when millions are connected in layers"],
  },
  "ai-llm:Layers & Deep Networks": {
    oneLine: "Stacking neurons into layers — and layers into deeper networks — lets the model build increasingly abstract representations, from edges to shapes to concepts.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Input layer → hidden layers → output layer; information flows left to right.">
        {[[50,"Input"],[165,"Hidden 1"],[280,"Hidden 2"],[390,"Output"]].map(([x,lbl],col)=>{
          const ys = col===0||col===3 ? [70,110,150] : [50,90,130,170];
          return (
            <g key={col}>
              {ys.map((y,i)=>(
                <g key={i}>
                  <circle cx={x as number} cy={y} r={14} fill={col===1||col===2?h.soft:"var(--card)"} stroke={col===1||col===2?h.base:s} strokeWidth="2" />
                  {col===1&&ys.length>3&&<text x={x as number} y={y+4} textAnchor="middle" fontSize="8" fill={h.ink} fontFamily="var(--font-body,system-ui)">•</text>}
                </g>
              ))}
              <text x={x as number} y={200} textAnchor="middle" fontSize="9.5" fill={col===0?"var(--ink)":col===3?"var(--ink)":h.ink} fontFamily="var(--font-body,system-ui)">{lbl as string}</text>
            </g>
          );
        })}
        {[50,165,280].map((x,ci)=>{
          const ys1 = ci===0||ci===2 ? [70,110,150] : [50,90,130,170];
          const ys2 = ci===1||ci===2 ? [50,90,130,170] : [70,110,150];
          return ys1.flatMap((y1,i)=>ys2.map((y2,j)=>(
            <line key={`${ci}-${i}-${j}`} x1={x+14} y1={y1} x2={(ci===0?165:ci===1?280:390)-14} y2={y2} stroke={s} strokeWidth="0.6" opacity="0.5" />
          )));
        })}
      </DiagFrame>
    ); },
    analogy: { title: "Like a factory assembly line", text: "Each station (layer) adds something: the first cuts metal, the next bends it, the next welds it. No single station builds the whole part — but together they produce something complex." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The input layer receives raw numbers (pixel values, token IDs). Each hidden layer transforms the previous layer's outputs — early layers detect simple patterns (edges, common word pairs), later layers combine them into complex abstractions (faces, grammar). The output layer produces the final prediction. 'Deep' simply means many hidden layers.</p><p style={{margin:0}}>Watch out: depth beats width — a deep narrow network can represent patterns that would require an astronomically wider shallow network to match at the same parameter count.</p></div>,
    keyPoints: ["Depth: early layers = simple features, later layers = complex abstractions", "Every neuron in one layer connects to every neuron in the next (fully-connected)", "Depth beats width for most tasks at the same parameter count", "Information flows forward only — each layer's outputs become the next layer's inputs", "The word 'deep' simply means there are many hidden layers stacked together"],
  },
  "ai-llm:Activation Functions": {
    oneLine: "Activation functions introduce non-linearity into neural networks — without them, a million-layer network collapses to a single matrix multiplication and learns nothing complex.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="ReLU clips negatives to zero; Sigmoid squashes to (0,1); GELU is a smooth version of ReLU used in transformers.">
        {[["ReLU","max(0,x)"],["Sigmoid","1/(1+e⁻ˣ)"],["GELU","smooth ReLU"]].map(([name,formula],i)=>(
          <g key={i}>
            <DiagBox x={10+i*148} y={40} w={136} h={100} label={name as string} sub={formula as string} fill={i===2?h.soft:"var(--card)"} stroke={i===2?h.base:s} text={i===2?h.ink:"var(--ink)"} />
            <text x={78+i*148} y={120} textAnchor="middle" fontSize="9" fill={i===2?h.ink:"var(--ink-2)"} fontFamily="var(--font-body,system-ui)">{["kills negatives","S-curve 0→1","smooth, fast"][i]}</text>
          </g>
        ))}
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">transformers use GELU; older nets use ReLU; outputs use Sigmoid/Softmax</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a dimmer vs. an on/off switch vs. a smooth fade", text: "Sigmoid is an on/off switch that transitions smoothly. ReLU is a one-way valve — anything negative gets cut to zero. GELU is a soft version that eases the cutoff." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Without activation functions, composing linear layers produces another linear layer — no matter how deep, the network can only learn linear mappings. Activation functions break linearity. <strong>ReLU</strong>: fast, sparse activations, but neurons can 'die' if weights go very negative. <strong>GELU</strong>: smooth probabilistic gating — the default in modern transformers. <strong>Softmax</strong>: normalises outputs to a probability distribution for classification.</p><p style={{margin:0}}>ReLU's entire definition is <code>max(0, x)</code> — yet swapping it in for older smooth activations was a key trick that finally made very deep networks practical to train.</p></div>,
    keyPoints: ["Non-linearity is what makes depth meaningful", "ReLU: fast but neurons can die; GELU: smoother, preferred in transformers", "Softmax at the output converts logits to probabilities", "ReLU's simplicity — max(0, x) — is what made training very deep networks practical", "The activation choice strongly affects training speed and stability"],
  },
  "ai-llm:Training & Backpropagation": {
    oneLine: "Training is the process of iteratively adjusting weights to reduce prediction error — backpropagation computes how much each weight contributed to the error so gradient descent can fix it.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Forward pass computes prediction and loss; backward pass propagates gradients; optimizer updates weights.">
        <DiagBox x={10} y={77} w={90} h={46} label="Input" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={160} y={60} w={100} h={70} label="Network" sub="forward pass" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={320} y={77} w={130} h={46} label="Loss" sub="prediction vs truth" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={100} y1={100} x2={158} y2={100} color={h.base} label="→" />
        <DiagArrow x1={260} y1={100} x2={318} y2={100} color={h.base} />
        <DiagArrow x1={318} y1={112} x2={262} y2={130} color={s} label="gradients ←" lx={290} ly={130} />
        <text x={180} y={168} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">∂Loss/∂w — chain rule applied backwards through every layer</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like adjusting a recipe after a bad dish", text: "You taste it (forward pass), note it's too salty (loss). You trace back: too much salt was added at step 3 (gradient). Reduce the salt next time (weight update)." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The <strong>forward pass</strong> runs inputs through the network to get a prediction. A <strong>loss function</strong> measures how wrong it is. <strong>Backpropagation</strong> applies the chain rule to compute ∂Loss/∂w for every weight — how much each weight is responsible for the error. An <strong>optimiser</strong> (SGD, Adam) steps each weight in the direction that reduces the loss.</p><p style={{margin:0}}>Backpropagation was popularised in 1986 but sat largely idle for years — the world simply lacked the data and compute to reveal its power.</p></div>,
    keyPoints: ["Forward pass → loss → backward pass → weight update", "Backprop uses the chain rule through every layer", "Adam optimiser adapts the learning rate per weight automatically", "The learning rate is critical — too large overshoots the minimum, too small crawls", "Gradient descent repeats millions of times until weights settle into good predictions"],
  },
  "ai-llm:Overfitting & Generalization": {
    oneLine: "Overfitting is when a model memorises the training data so well it fails on new examples — regularisation, dropout, and early stopping are the main remedies.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Training loss keeps falling; validation loss bottoms out and rises — that's the overfit point.">
        <text x={230} y={20} textAnchor="middle" fontSize="11" fill={s} fontFamily="var(--font-body,system-ui)">Loss vs. Epoch</text>
        <line x1={40} y1={150} x2={420} y2={150} stroke={s} strokeWidth="1.5" />
        <line x1={40} y1={30} x2={40} y2={152} stroke={s} strokeWidth="1.5" />
        <text x={230} y={165} textAnchor="middle" fontSize="9" fill={s} fontFamily="var(--font-body,system-ui)">Epochs →</text>
        <polyline points="40,130 100,100 160,80 220,65 280,55 340,50 400,47" fill="none" stroke={h.base} strokeWidth="2" />
        <text x={410} y={50} fontSize="9" fill={h.ink} fontFamily="var(--font-body,system-ui)">train</text>
        <polyline points="40,128 100,98 160,82 220,72 280,75 340,88 400,105" fill="none" stroke={s} strokeWidth="2" strokeDasharray="5 3" />
        <text x={410} y={108} fontSize="9" fill={s} fontFamily="var(--font-body,system-ui)">val</text>
        <line x1={255} y1={30} x2={255} y2={150} stroke={h.base} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={265} y={45} fontSize="9" fill={h.ink} fontFamily="var(--font-body,system-ui)">early stop</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like cramming for an exam using last year's paper only", text: "You memorise every question and answer. You ace that paper perfectly. But in the real exam with new questions you fail — the knowledge doesn't generalise." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A model overfits when it has enough capacity to memorise rather than generalise. Remedies: <strong>dropout</strong> (randomly zero out neurons during training to prevent co-dependency), <strong>weight decay</strong> (L2 regularisation penalises large weights), <strong>data augmentation</strong> (expand training data with transformations), and <strong>early stopping</strong> (stop when validation loss stops improving).</p><p style={{margin:0}}>Dropout was partly inspired by fraud prevention — shuffling active neurons is like rotating bank tellers so no fixed group can quietly collude on a shortcut.</p></div>,
    keyPoints: ["Validation loss rising while training loss falls = overfit signal", "Dropout: randomly drop neurons during training", "Early stopping: halt training when val loss plateaus", "Regularization penalizes oversized weights to stop the model memorizing noise", "The goal is generalization — performance on unseen data, not the training set"],
  },
  "ai-llm:Tokenization": {
    oneLine: "Tokenization splits raw text into sub-word tokens — the atomic units a language model sees and predicts — balancing vocabulary size against coverage of rare words.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="BPE tokenizer splits 'unbelievable' into sub-word pieces, each mapped to an integer ID.">
        <DiagBox x={10} y={70} w={160} h={50} label='"unbelievable"' sub="raw text" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={170} y1={95} x2={208} y2={95} color={h.base} label="BPE" />
        {[["un",215],["believ",290],["able",380]].map(([tok,x],i)=>(
          <g key={i}>
            <DiagBox x={x as number} y={70} w={70} h={50} label={`"${tok}"`} sub={`id: ${1200+i*300}`} fill={h.soft} stroke={h.base} text={h.ink} />
            {i<2&&<line x1={(x as number)+70} y1={95} x2={[290,380][i] as number} y2={95} stroke={s} strokeWidth="1" strokeDasharray="3 2" />}
          </g>
        ))}
        <text x={230} y={155} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">common words → one token; rare words → multiple tokens</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like splitting words into syllables for a child learning to read", text: "'Unbelievable' becomes 'un-be-liev-able'. Each syllable is a manageable unit. Common short words stay whole; long rare words are broken into familiar pieces." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Models don't read characters or words — they read <strong>tokens</strong>. <strong>BPE</strong> (Byte-Pair Encoding) and its variants merge frequent byte pairs iteratively until a vocabulary of ~50k tokens is built. Common words map to one token; rare words split into multiple. The tokenizer also converts tokens to integer IDs that the model can embed. Token count ≠ word count — rule of thumb: 1 word ≈ 1.3 tokens for English.</p><p style={{margin:0}}>Watch out: a leading space is usually part of the following token — so "cat" and " cat" are often two different token IDs, which can quietly change model outputs.</p></div>,
    keyPoints: ["Tokens are sub-word units — not characters, not full words", "BPE: merge frequent pairs iteratively to build vocabulary", "1 word ≈ 1.3 English tokens; code and non-English can be much more", "Vocabulary size (often 30k–100k) trades coverage against memory", "Leading spaces belong to the next token — spacing changes can alter token IDs"],
  },
  "ai-llm:Embeddings": {
    oneLine: "Embeddings map tokens (and other discrete objects) to dense vectors in a high-dimensional space where semantically similar things are geometrically close.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Words with similar meaning cluster together in embedding space — vector arithmetic captures analogy.">
        <text x={230} y={20} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">2D projection of embedding space</text>
        <circle cx={120} cy={80} r={6} fill={h.base} />
        <text x={135} y={84} fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">king</text>
        <circle cx={170} cy={80} r={6} fill={h.base} />
        <text x={185} y={84} fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">queen</text>
        <circle cx={120} cy={110} r={6} fill={s} />
        <text x={135} y={114} fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">man</text>
        <circle cx={170} cy={110} r={6} fill={s} />
        <text x={185} y={114} fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">woman</text>
        <circle cx={300} cy={130} r={6} fill={h.base} />
        <text x={315} y={134} fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Paris</text>
        <circle cx={350} cy={130} r={6} fill={h.base} />
        <text x={365} y={134} fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">France</text>
        <circle cx={300} cy={160} r={6} fill={s} />
        <text x={315} y={164} fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Berlin</text>
        <circle cx={350} cy={160} r={6} fill={s} />
        <text x={365} y={164} fontSize="11" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Germany</text>
        <text x={230} y={195} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">king − man + woman ≈ queen</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a ZIP code for meaning", text: "A ZIP code is a compact number that encodes your location. An embedding is a compact vector that encodes a word's meaning — nearby ZIP codes are nearby places; nearby embeddings are semantically similar words." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>An embedding layer is a lookup table: each token ID maps to a learned dense vector (768 to 4096 dimensions in modern LLMs). The vectors are learned during training so that semantically similar tokens cluster nearby in vector space. This enables <strong>vector arithmetic</strong> (king − man + woman ≈ queen) and <strong>semantic search</strong> via cosine similarity.</p><p style={{margin:0}}>Positional encoding is added to each embedding to stamp in where the token sits in the sequence — without it, the model would treat "cat sat" and "sat cat" identically.</p></div>,
    keyPoints: ["Each token maps to a dense vector learned during training", "Semantic similarity = geometric proximity in embedding space", "Vector arithmetic captures analogies and relationships", "Positional encoding adds order so the model knows where each token appears", "Embedding dimensions range from ~768 in smaller models to 4096+ in large ones"],
  },
  "ai-llm:Multi-Head Attention": {
    oneLine: "Multi-head attention runs several attention operations in parallel, each learning to focus on a different type of relationship — subject-verb, coreference, proximity, etc. — then merges the results.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="H independent attention heads each compute a weighted context; their outputs are concatenated and projected.">
        <DiagBox x={10} y={80} w={80} h={40} label="Input" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={90} y1={100} x2={128} y2={100} color={h.base} />
        {[30,75,120].map((y,i)=>(
          <g key={i}>
            <DiagBox x={130} y={y} w={90} h={36} label={`Head ${i+1}`} fill={h.soft} stroke={h.base} text={h.ink} />
            <DiagArrow x1={220} y1={y+18} x2={278} y2={100} color={h.base} />
          </g>
        ))}
        <DiagBox x={280} y={70} w={90} h={60} label="Concat" sub="+ project" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={370} y1={100} x2={418} y2={100} color={h.base} />
        <DiagBox x={420} y={80} w={30} h={40} label="Out" fill="var(--card)" stroke={s} text="var(--ink)" rx={6} />
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">each head attends to a different aspect of the input</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like several specialists reviewing the same document", text: "A grammar expert, a fact-checker, and a style editor all read the same text simultaneously and mark different things. Their annotations are merged into one comprehensive review." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Single-head attention uses one set of Q/K/V projections. Multi-head runs H heads in parallel, each with its own projection matrices, each learning to attend to different positions or feature types. Outputs are concatenated and linearly projected. GPT-3 uses 96 attention heads; each head operates on a 128-d subspace of the 12,288-d embedding.</p><p style={{margin:0}}>Researchers can inspect trained models and find heads with clear specialties — some reliably connect pronouns to their noun, others track punctuation or syntactic structure.</p></div>,
    keyPoints: ["H heads run attention in parallel on different subspaces", "Each head specialises in a different type of relationship", "Concatenate + project to merge all heads back to model dimension", "GPT-3 uses 96 heads, each operating on a 128-d subspace of a 12,288-d embedding", "Individual heads develop interpretable specialties: coreference, syntax, proximity"],
  },
  "ai-llm:The Transformer Block": {
    oneLine: "A transformer block is the repeating unit of every modern LLM: multi-head attention followed by a feed-forward network, with residual connections and layer norm keeping training stable.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Input → LayerNorm → MHA → residual add → LayerNorm → FFN → residual add → Output.">
        {[["LayerNorm",30],["Multi-Head\nAttention",80],["Add & Norm",140],["Feed-Forward",190],["Add & Norm",240]].map(([lbl,y],i)=>(
          <g key={i}>
            <DiagBox x={150} y={y as number} w={160} h={36} label={(lbl as string).replace("\n"," ")} fill={i===1||i===3?h.soft:"var(--card)"} stroke={i===1||i===3?h.base:s} text={i===1||i===3?h.ink:"var(--ink)"} />
            {i<4&&<DiagArrow x1={230} y1={(y as number)+36} x2={230} y2={(y as number)+44} color={h.base} />}
          </g>
        ))}
        <text x={230} y={295} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">residual skip connections bypass each sub-layer</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a revision loop for an essay", text: "First you check which parts reference each other (attention). Then you refine the phrasing independently (FFN). After each step you compare to the original draft (residual) to make sure you haven't drifted." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Residual (skip) connections add the block's input directly to its output — gradients flow cleanly through hundreds of layers. <strong>Layer norm</strong> normalises activations before each sub-layer for training stability. The <strong>FFN</strong> (two linear layers + activation) applies per-token transformations that expand the dimension 4× then compress back — this is where most parameters live.</p><p style={{margin:0}}>The feed-forward network briefly expands each token to ~4× its size then shrinks it back — most of a model's raw parameter count lives in that expansion.</p></div>,
    keyPoints: ["MHA + FFN with residual connections and layer norm", "Residuals allow gradients to flow through hundreds of layers", "FFN holds ~2/3 of the parameters in a transformer block", "Layer normalization keeps activations in a stable range, making training reliable", "The FFN processes each token independently after attention mixes information across tokens"],
  },
  "ai-llm:Stacking Layers (The Full Model)": {
    oneLine: "A full LLM is dozens of identical transformer blocks stacked in sequence — the same block architecture repeated N times with independent weights.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Token embedding → positional encoding → N transformer blocks → output projection → logits.">
        {[["Embed +\nPos Enc",20],["Block 1",85],["Block 2",130],["… Block N",175],["Output\nProjection",220]].map(([lbl,y],i)=>(
          <g key={i}>
            <DiagBox x={130} y={y as number} w={200} h={36} label={(lbl as string).replace("\n"," ")} fill={i===1||i===2||i===3?h.soft:"var(--card)"} stroke={i===1||i===2||i===3?h.base:s} text={i===1||i===2||i===3?h.ink:"var(--ink)"} />
            {i<4&&<DiagArrow x1={230} y1={(y as number)+36} x2={230} y2={(y as number)+44} color={h.base} />}
          </g>
        ))}
        <text x={230} y={285} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">GPT-3: 96 blocks × 96 heads × 12,288 dims = 175 B params</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like reading a book chapter by chapter", text: "Each chapter (block) builds on what you learned in the previous one. By the final chapter your understanding is deep and layered — the early chapters laid foundations the later ones refine." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The embedding layer maps token IDs to vectors. Positional encoding adds position information. Then N identical transformer blocks refine the representations. The final output projection maps from model dimension to vocabulary size (50,257 tokens for GPT-2), producing <strong>logits</strong> — unnormalised scores for the next token. Softmax converts logits to probabilities.</p><p style={{margin:0}}>The largest models hold hundreds of billions of parameters — more individual numbers than there are stars in the Milky Way. Each block has its own full, independent set of weights.</p></div>,
    keyPoints: ["N identical blocks with independent weights stacked in sequence", "Embedding + positional encoding feed the first block", "Final linear layer maps to vocabulary size → logits → probabilities", "Early layers handle syntax, middle layers semantics, late layers task reasoning", "GPT-3: 96 blocks × 96 heads × 12,288 dims = 175 billion parameters"],
  },
  "ai-llm:The Language Modeling Objective": {
    oneLine: "LLMs are trained to predict the next token given all previous tokens — a deceptively simple objective that forces the model to learn grammar, facts, and reasoning from pure text.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Given 'The cat sat on the', model predicts 'mat' — cross-entropy loss drives training.">
        {['"The"','"cat"','"sat"','"on"','"the"'].map((tok,i)=>(
          <g key={i}>
            <DiagBox x={10+i*88} y={50} w={80} h={36} label={tok} fill="var(--card)" stroke={s} text="var(--ink)" rx={8} />
          </g>
        ))}
        <DiagBox x={170} y={130} w={120} h={40} label='Predict "mat"' fill={h.soft} stroke={h.base} text={h.ink} />
        {[0,1,2,3,4].map(i=>(
          <DiagArrow key={i} x1={50+i*88} y1={86} x2={230} y2={128} color={h.base} w={0.8+i*0.3} />
        ))}
        <text x={230} y={192} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">loss = cross-entropy(predicted token distribution, true next token)</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like auto-completing billions of sentences", text: "If you read enough text and predict the next word often enough, you are forced to learn grammar, facts, and context — because wrong predictions get penalised every time." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Next-token prediction is <strong>self-supervised</strong>: no labels needed — the next token is always right there in the text. The model maximises the log-probability of the actual next token across trillions of examples. This single objective forces the model to learn language structure, world knowledge, and reasoning as side effects of compression.</p><p style={{margin:0}}>This one objective — guess the next token — is enough to teach grammar, facts, translation, and even arithmetic, all as emergent side effects of getting better at prediction.</p></div>,
    keyPoints: ["Predict the next token — no human labels needed", "Self-supervised on raw text at web scale", "Cross-entropy loss on next-token distribution drives all learning", "The model outputs a probability distribution over the entire vocabulary at each step", "Temperature, top-k, and top-p control how adventurous sampling is at generation time"],
  },
  "ai-llm:Pre-training Data": {
    oneLine: "LLMs are pre-trained on web-scale corpora — carefully filtered and deduplicated mixtures of web pages, books, code, and scientific text.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Data pipeline: collect → deduplicate → quality filter → tokenize → training mixture.">
        {["Web crawl","Books","Code","Science"].map((src,i)=>(
          <g key={i}>
            <DiagBox x={10} y={20+i*42} w={100} h={34} label={src} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={110} y1={37+i*42} x2={168} y2={100} color={s} />
          </g>
        ))}
        <DiagBox x={170} y={70} w={120} h={60} label="Filter &" sub="Dedup" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={290} y1={100} x2={338} y2={100} color={h.base} />
        <DiagBox x={340} y={77} w={110} h={46} label="Tokenized" sub="training corpus" fill="var(--card)" stroke={s} text="var(--ink)" />
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">quality filtering removes spam, dedup prevents memorisation</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like curating a diet for an athlete", text: "You don't feed an athlete random food from a skip. You carefully select high-quality sources, remove duplicates, and balance the proportions — the quality of training data determines the quality of the model." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Common sources: <strong>CommonCrawl</strong> (web), <strong>The Pile</strong>, Wikipedia, books, GitHub, arXiv. Quality filtering removes low-quality, toxic, or duplicated content. <strong>Deduplication</strong> prevents memorisation of repeated passages. Data mixture (ratio of domains) heavily influences model strengths — more code = better coding; more multilingual = better translation.</p><p style={{margin:0}}>Data quality can matter more than raw quantity — a smaller, well-filtered corpus often beats a larger, noisier one trained at the same compute cost.</p></div>,
    keyPoints: ["Web crawl is the dominant source but requires heavy filtering", "Deduplication prevents memorisation of repeated text", "Data mixture shapes model capabilities — adjust ratios intentionally", "Corpora are measured in hundreds of billions or even trillions of tokens", "Quality filtering beats raw size — a well-curated smaller dataset often wins"],
  },
  "ai-llm:The Pre-training Loop": {
    oneLine: "Pre-training repeats millions of gradient steps across thousands of GPUs — each step processes a batch of token sequences, computes loss, backpropagates gradients, and updates weights.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 180" caption="Distributed training: data parallel + tensor parallel across thousands of GPUs.">
        <DiagBox x={10} y={70} w={100} h={40} label="Data" sub="batched tokens" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={175} y={55} w={110} h={70} label="GPU Cluster" sub="forward + backward" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={350} y={70} w={100} h={40} label="Optimizer" sub="update weights" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={110} y1={90} x2={173} y2={90} color={h.base} label="batch" />
        <DiagArrow x1={285} y1={90} x2={348} y2={90} color={h.base} label="gradients" />
        <DiagArrow x1={400} y1={110} x2={400} y2={160} color={s} dashed />
        <DiagArrow x1={400} y1={160} x2={120} y2={160} color={s} dashed />
        <DiagArrow x1={120} y1={160} x2={120} y2={112} color={s} dashed label="next batch" lx={60} ly={138} />
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">GPT-3: 300B tokens × ~175B params × thousands of A100s</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like training for a marathon with a coaching team", text: "You run a lap (batch), coach records your time (loss), team analyses technique (gradients), adjusts your training plan (update), repeat millions of times." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The <strong>forward pass</strong> runs inputs through the network to get a prediction. A <strong>loss function</strong> measures how wrong it is. <strong>Backpropagation</strong> applies the chain rule to compute ∂Loss/∂w for every weight — how much each weight is responsible for the error. An <strong>optimiser</strong> (SGD, Adam) steps each weight in the direction that reduces the loss.</p><p style={{margin:0}}><strong>Data parallelism</strong>: each GPU processes a different batch shard; gradients are averaged. <strong>Tensor parallelism</strong>: a single huge matrix operation is split across GPUs. The learning rate schedule (warmup → cosine decay) and batch size (often millions of tokens via gradient accumulation) are critical hyperparameters. Training costs millions of dollars — checkpoints are saved frequently.</p></div>,
    keyPoints: ["Data parallel: same model, different batches per GPU", "Tensor parallel: split large matrix ops across GPUs", "Learning rate schedule: linear warmup + cosine decay", "AdamW adapts the step size per weight and adds weight decay to curb overfitting", "A single run can loop hundreds of thousands of times across weeks on thousands of GPUs"],
  },
  "ai-llm:Compute & Scale": {
    oneLine: "Scaling laws show that model performance improves predictably with more compute, data, and parameters — and that the optimal allocation between them follows a precise formula.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Chinchilla scaling law: optimal tokens ≈ 20× parameters — many models were under-trained.">
        <DiagBox x={10} y={60} w={130} h={70} label="Compute" sub="FLOPs budget" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={165} y={40} w={130} h={50} label="Parameters" sub="model size" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={165} y={110} w={130} h={50} label="Tokens" sub="training data" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={325} y={70} w={130} h={60} label="Performance" sub="loss ↓" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={140} y1={85} x2={163} y2={65} color={h.base} />
        <DiagArrow x1={140} y1={95} x2={163} y2={135} color={h.base} />
        <DiagArrow x1={295} y1={65} x2={323} y2={90} color={h.base} />
        <DiagArrow x1={295} y1={135} x2={323} y2={110} color={h.base} />
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">Chinchilla: optimal = 20 tokens per parameter</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like choosing between a bigger factory or more raw materials", text: "With a fixed budget you must balance the size of the factory (parameters) against the amount of raw material to process (training tokens). Chinchilla showed most factories were under-fed." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Kaplan et al. found loss scales as a power law with parameters, data, and compute. The <strong>Chinchilla scaling law</strong> (Hoffmann et al. 2022) refined this: for a given compute budget, optimal performance requires ~20 training tokens per parameter. GPT-3 (175B params) was trained on 300B tokens — Chinchilla-optimal would need 3.5T tokens. LLaMA applied this insight.</p><p style={{margin:0}}>Training a frontier model can cost tens of millions of dollars in compute and consume as much electricity as a small town over the same period.</p></div>,
    keyPoints: ["Performance improves predictably with compute, data, and parameters", "Chinchilla: optimal ≈ 20 tokens per parameter", "Most early large models were parameter-rich but data-poor", "GPT-3 needed ~3.5T tokens to be Chinchilla-optimal; it was trained on only 300B", "Scaling laws let teams predict final loss before committing to a full training run"],
  },
  "ai-llm:Fine-tuning & Instruction Tuning": {
    oneLine: "Fine-tuning adapts a pre-trained model to a specific task or instruction-following behaviour using a small supervised dataset — far cheaper than pre-training from scratch.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Pre-trained base model + small instruction dataset → instruction-following model.">
        <DiagBox x={10} y={77} w={130} h={46} label="Base Model" sub="pre-trained" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={200} y={55} w={60} h={80} label="SFT" sub="supervised fine-tune" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={325} y={77} w={130} h={46} label="Instruction" sub="following model" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={140} y1={100} x2={198} y2={95} color={h.base} />
        <DiagArrow x1={260} y1={95} x2={323} y2={100} color={h.base} />
        <text x={230} y={165} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">LoRA / QLoRA fine-tune only adapter layers — 100× fewer params updated</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like specialising a generalist doctor", text: "Medical school (pre-training) gives broad knowledge. A residency (fine-tuning) drills specific skills in surgery or psychiatry. The broad foundation remains; specialised behaviour is added on top." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Supervised Fine-Tuning (SFT)</strong>: train on (prompt, response) pairs. <strong>Instruction tuning</strong>: SFT on diverse instruction-following examples to teach the model to follow any instruction. <strong>LoRA</strong> (Low-Rank Adaptation) fine-tunes only small adapter matrices inserted in attention layers — updating 0.1–1% of parameters while matching full fine-tune quality at a fraction of the cost.</p><p style={{margin:0}}>A few thousand to a few hundred thousand well-written examples can dramatically reshape behavior — tiny next to pre-training, yet enough to turn a text predictor into a responsive assistant.</p></div>,
    keyPoints: ["SFT: small supervised dataset, far cheaper than pre-training", "Instruction tuning teaches the model to follow arbitrary prompts", "LoRA: fine-tune adapters only — same quality, 100× fewer trainable params", "A base model predicts text; an instruction-tuned model answers requests", "The training mechanics are identical to pre-training — only the data and goal change"],
  },
  "ai-llm:RLHF — Reinforcement Learning from Human Feedback": {
    oneLine: "RLHF aligns LLM outputs with human preferences by training a reward model on human comparisons, then using RL to push the LLM toward responses the reward model scores highly.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Humans rank completions → reward model trained → PPO optimises LLM against reward model.">
        <DiagBox x={10} y={50} w={120} h={40} label="Completions" sub="A vs B ranking" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={185} y={50} w={90} h={40} label="Reward" sub="Model" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={345} y={50} w={105} h={40} label="PPO / RL" sub="optimize LLM" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={130} y1={70} x2={183} y2={70} color={h.base} label="train" />
        <DiagArrow x1={275} y1={70} x2={343} y2={70} color={h.base} label="score" />
        <DiagBox x={165} y={145} w={130} h={40} label="Aligned LLM" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={398} y1={90} x2={340} y2={143} color={s} dashed label="update" />
        <text x={230} y={200} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">DPO is a simpler alternative — no separate reward model needed</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like training a dog with a clicker", text: "You click (reward) when the dog sits correctly and ignore bad behaviour. Over thousands of repetitions the dog learns which behaviours earn clicks — the reward signal shapes the behaviour." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Step 1: collect human preference rankings (response A preferred over B). Step 2: train a <strong>Reward Model</strong> to predict human preference scores. Step 3: use <strong>PPO</strong> (proximal policy optimisation) to update the LLM to produce responses that score highly. A KL penalty prevents the model from drifting too far from the SFT baseline. DPO (Direct Preference Optimisation) skips the reward model entirely — simpler and often better.</p><p style={{margin:0}}>RLHF was the key ingredient that turned capable-but-unruly base models into the polished, instruction-following assistants that sparked the recent AI boom.</p></div>,
    keyPoints: ["Human preference rankings train the reward model", "PPO updates the LLM to maximise reward model scores", "DPO is a simpler, often better alternative to PPO-based RLHF", "A KL penalty keeps the model from drifting too far from its SFT baseline during RL", "Step 1 collects comparison pairs; Step 2 trains a scorer; Step 3 optimises the LLM"],
  },
  "ai-llm:The Inference Loop": {
    oneLine: "During inference the model generates text one token at a time — each forward pass predicts the next token, which is appended to the context for the next pass, and the KV cache avoids recomputing previous tokens.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Autoregressive generation: each new token appended to input before next forward pass.">
        <DiagBox x={10} y={60} w={180} h={40} label='"The cat sat on the"' sub="context so far" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={250} y={50} w={100} h={60} label="LLM" sub="forward pass" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={190} y1={80} x2={248} y2={80} color={h.base} />
        <DiagBox x={380} y={60} w={70} h={40} label='"mat"' sub="next token" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={350} y1={80} x2={378} y2={80} color={h.base} />
        <DiagArrow x1={415} y1={100} x2={415} y2={155} color={s} dashed />
        <DiagArrow x1={415} y1={155} x2={100} y2={155} color={s} dashed />
        <DiagArrow x1={100} y1={155} x2={100} y2={102} color={s} dashed label="append + repeat" lx={50} ly={130} />
        <text x={280} y={145} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">KV cache stores previous key/value — no recompute</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like reading one word at a time from a dictionary", text: "After each word you look up what word is most likely to follow it, given everything you've read so far. Append that word and look up the next one. Repeat until you reach a full stop." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Each forward pass produces logits for the next token. A <strong>decoding strategy</strong> (greedy, top-k, nucleus sampling) samples the next token from those logits. The token is appended to the input and the process repeats. The <strong>KV cache</strong> stores the key and value tensors for all previous tokens so each forward pass only computes new attention for the latest token — reducing compute from O(n²) per step to O(n).</p><p style={{margin:0}}>Because each token depends on all previous ones, an LLM literally cannot write the end of a sentence before the middle — it has no global draft, only the next word.</p></div>,
    keyPoints: ["Autoregressive: one token per forward pass, appended to context", "KV cache avoids recomputing attention for previous tokens", "Inference is memory-bandwidth bound — not compute bound", "The KV cache reduces per-step attention from O(n²) to O(n) by reusing past K/V tensors", "Tokens are generated strictly left to right — the model has no global view of the output"],
  },
  "ai-llm:Decoding Strategies": {
    oneLine: "Decoding strategies convert logits to the next token — greedy picks the highest probability, beam search explores multiple paths, and sampling strategies add controlled randomness.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Greedy: deterministic but repetitive. Top-k / nucleus: diverse and creative. Temperature scales all probabilities.">
        {[["Greedy","argmax — fast"],["Top-k","sample top K"],["Nucleus","sample top-p%"],["Temp","scale logits"]].map(([name,sub],i)=>(
          <DiagBox key={i} x={10+i*112} y={60} w={100} h={80} label={name as string} sub={sub as string} fill={i===2?h.soft:"var(--card)"} stroke={i===2?h.base:s} text={i===2?h.ink:"var(--ink)"} />
        ))}
        <text x={230} y={170} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">temperature &lt; 1 = sharper; &gt; 1 = more random</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like ordering from a menu", text: "Greedy always orders the number-one dish. Top-k picks randomly from the top 40. Nucleus sampling picks from dishes that together cover 90% of the menu's popularity score. Temperature makes you more or less adventurous." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Greedy</strong>: always take the highest-probability token — fast but repetitive. <strong>Beam search</strong>: keep B candidate sequences; explore top-B branches at each step; take the highest-scoring full sequence. <strong>Top-k</strong>: sample from the k highest-probability tokens. <strong>Nucleus (top-p)</strong>: sample from the smallest set of tokens whose probabilities sum to p. <strong>Temperature</strong>: divide logits by T before softmax — T &lt; 1 sharpens, T &gt; 1 flattens.</p><p style={{margin:0}}>Watch out: cranking temperature toward zero makes a model nearly deterministic; pushing it high enough turns coherent prose into surreal, dreamlike word salad.</p></div>,
    keyPoints: ["Greedy: deterministic, fast, prone to repetition", "Nucleus (top-p): best quality/diversity trade-off for creative tasks", "Temperature: single knob that controls overall randomness", "Top-k and top-p restrict the sampling pool to the most likely candidates before drawing", "Beam search keeps B candidate sequences and selects the most probable overall completion"],
  },
  "ai-llm:Context Window": {
    oneLine: "The context window is the maximum number of tokens a model can attend to at once — it determines the model's effective memory and the length of conversations or documents it can handle.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Everything inside the window is attended to; tokens outside are forgotten until re-ingested.">
        <rect x={10} y={60} width={440} height={60} rx={10} fill="var(--card)" stroke={s} strokeWidth="2" />
        <rect x={10} y={60} width={380} height={60} rx={10} fill={h.soft} stroke={h.base} strokeWidth="2" />
        <text x={200} y={97} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">Context window (e.g. 128k tokens)</text>
        <rect x={390} y={60} width={60} height={60} rx={10} fill="var(--card)" stroke={s} strokeWidth="2" />
        <text x={420} y={97} textAnchor="middle" fontSize="9.5" fill={s} fontFamily="var(--font-body,system-ui)">outside</text>
        <text x={230} y={160} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">longer context = more memory but quadratic attention cost (without tricks)</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a desk you work at", text: "You can only work with what fits on your desk. Documents beyond the desk's edge must be retrieved from a drawer — you can look at them, but you must bring them to the desk first." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Standard attention is O(n²) in context length — compute and memory grow quadratically. Modern models use tricks: <strong>RoPE / ALiBi</strong> positional encodings that extrapolate to longer sequences, <strong>sliding window attention</strong>, and <strong>flash attention</strong> (IO-aware GPU kernel that computes attention without materialising the full matrix). GPT-4 Turbo: 128k; Claude 3: 200k; Gemini 1.5: 1M.</p><p style={{margin:0}}>Going from a 4k-token to a 128k-token window is not 32× more attention work but closer to 1,000× — which is why long context was such a hard engineering problem.</p></div>,
    keyPoints: ["Context window = effective memory — beyond it, the model is blind", "Standard attention is O(n²) — long contexts are expensive", "RoPE, flash attention, and sliding windows extend practical context length", "RoPE rotates each token's vector by an angle based on its position; ALiBi penalizes distant tokens", "Going from 4k to 128k tokens is ~1,000× more attention work, not 32×"],
  },
  "ai-llm:RAG — Retrieval-Augmented Generation": {
    oneLine: "RAG grounds LLM outputs by retrieving relevant documents at query time and injecting them into the prompt — giving the model access to up-to-date, specific knowledge without retraining.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Query → embed → vector search → top-k docs → LLM generates with retrieved context.">
        <DiagBox x={10} y={80} w={90} h={40} label="User Query" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={155} y={50} w={90} h={40} label="Embed" sub="query vector" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagBox x={155} y={110} w={90} h={40} label="Vector DB" sub="top-k docs" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={320} y={80} w={130} h={40} label="LLM + Context" sub="grounded answer" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={100} y1={100} x2={153} y2={70} color={h.base} />
        <DiagArrow x1={100} y1={100} x2={153} y2={130} color={s} dashed />
        <DiagArrow x1={245} y1={70} x2={318} y2={100} color={h.base} label="retrieved docs" lx={285} ly={78} />
        <DiagArrow x1={245} y1={130} x2={318} y2={110} color={h.base} />
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">no retraining needed when knowledge changes</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like an open-book exam", text: "Instead of memorising everything, you bring reference books. When a question comes, you look up the most relevant pages and write your answer based on what you found — grounded in current sources." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Documents are <strong>chunked</strong> and <strong>embedded</strong> into vectors at index time. At query time, the user's question is embedded and the nearest document chunks are retrieved from a <strong>vector database</strong> (Pinecone, Weaviate, pgvector). The chunks are injected into the LLM prompt as context. The LLM can then cite specific retrieved passages, reducing hallucination and enabling up-to-date responses.</p><p style={{margin:0}}>RAG lets a model answer questions about documents written long after training — knowledge can be refreshed by simply adding files to the database, with no retraining required.</p></div>,
    keyPoints: ["Retrieve relevant context at query time — no retraining", "Vector similarity search finds semantically relevant chunks", "Reduces hallucination; enables citation of sources", "Documents are chunked and embedded at index time; only the query is embedded live", "The knowledge base can be updated anytime without touching the model weights"],
  },
  "ai-llm:AI Agents & Tool Use": {
    oneLine: "An AI agent connects an LLM to external tools — search, calculators, APIs, code execution — letting it take multi-step actions to complete tasks it can't solve with text prediction alone.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="LLM chooses a tool, calls it, receives results, reasons again — until task is complete.">
        <DiagBox x={155} y={10} w={150} h={46} label="LLM" sub="reason + plan" fill={h.soft} stroke={h.base} text={h.ink} />
        {[["Search",30],["Calculator",120],["Code Exec",210]].map(([lbl,x],i)=>(
          <g key={i}>
            <DiagBox x={x as number} y={130} w={100} h={36} label={lbl as string} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={230} y1={56} x2={(x as number)+50} y2={128} color={h.base} label={i===0?"tool call":undefined} />
            <DiagArrow x1={(x as number)+50} y1={128} x2={230} y2={56} color={s} dashed label={i===0?"result":undefined} lx={i===0?120:undefined} ly={i===0?96:undefined} />
          </g>
        ))}
        <text x={230} y={190} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">function calling / tool-use API defines available tools as JSON schemas</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a researcher with a laptop and a phone", text: "The researcher doesn't know everything — but they know how to Google, call an expert, and run a spreadsheet. They combine reasoning with external tools to solve problems they couldn't solve from memory alone." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Tool use is enabled by <strong>function calling</strong>: the LLM emits a structured JSON call specifying the tool and arguments; the host executes it and returns the result; the model reasons about the result and decides what to do next. The loop continues until the model signals completion. Agents are powerful but require careful guardrails: step limits, timeouts, and human-in-the-loop for irreversible actions.</p><p style={{margin:0}}>Giving a model a humble calculator can beat a vastly larger model at arithmetic — because doing math reliably and predicting the next token are genuinely different skills.</p></div>,
    keyPoints: ["LLM emits tool calls; host executes them and returns results", "Multi-step reasoning chains tools together", "Guardrails: step limits, timeouts, and confirmation for irreversible actions", "The ReAct pattern alternates Thought, Action, and Observation steps in a loop", "Tools extend the model beyond frozen knowledge: search, code execution, calculators, APIs"],
  },
  "ai-llm:Prompt Engineering": {
    oneLine: "Prompt engineering is the craft of designing inputs that elicit the best outputs from a language model — structure, examples, and explicit reasoning instructions all matter.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Zero-shot, few-shot, and chain-of-thought are the three most impactful prompting techniques.">
        {[["Zero-shot","instruction only"],["Few-shot","examples included"],["CoT","step-by-step"]].map(([name,sub],i)=>(
          <DiagBox key={i} x={10+i*148} y={55} w={136} h={100} label={name as string} sub={sub as string} fill={i===2?h.soft:"var(--card)"} stroke={i===2?h.base:s} text={i===2?h.ink:"var(--ink)"} />
        ))}
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">CoT: "Let's think step by step" unlocks reasoning in large models</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like briefing a brilliant but literal contractor", text: "A genius contractor does exactly what you say — nothing more. Vague instructions give vague results. Precise instructions with examples get exactly what you need." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Zero-shot</strong>: just state the task — works for simple, clear instructions. <strong>Few-shot</strong>: include 2–5 examples of (input, desired output) pairs — shows the model the format and style you want. <strong>Chain-of-thought (CoT)</strong>: ask the model to reason step-by-step before giving the final answer — dramatically improves multi-step reasoning. <strong>System prompt</strong>: sets persistent persona and constraints across a conversation.</p><p style={{margin:0}}>Simply adding "let's think step by step" was shown to boost reasoning accuracy on hard problems — a free upgrade that costs nothing but a few extra tokens.</p></div>,
    keyPoints: ["Few-shot examples show format better than lengthy instructions", "Chain-of-thought unlocks reasoning: 'think step by step'", "Be specific, not vague — models are literal", "Chat prompts stack roles: system sets behavior, user asks, assistant replies", "CoT works because generating intermediate steps gives the model more room to compute"],
  },
  "ai-llm:Multimodal Models": {
    oneLine: "Multimodal models process multiple input types — text, images, audio, video — by encoding each modality into a shared embedding space and attending across them jointly.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Each modality is encoded to tokens; a unified transformer attends across all of them.">
        {[["Text","tokens"],["Image","patches"],["Audio","frames"]].map(([mod,enc],i)=>(
          <g key={i}>
            <DiagBox x={10} y={20+i*56} w={110} h={44} label={mod as string} sub={enc as string} fill="var(--card)" stroke={s} text="var(--ink)" />
            <DiagArrow x1={120} y1={42+i*56} x2={178} y2={100} color={s} />
          </g>
        ))}
        <DiagBox x={180} y={70} w={100} h={60} label="Unified" sub="Transformer" fill={h.soft} stroke={h.base} text={h.ink} />
        <DiagArrow x1={280} y1={100} x2={338} y2={100} color={h.base} />
        <DiagBox x={340} y={78} w={110} h={44} label="Output" sub="text / action" fill="var(--card)" stroke={s} text="var(--ink)" />
        <text x={230} y={182} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">image patch embeddings occupy token positions just like text tokens</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a translator who speaks every language", text: "Instead of separate translators for French, Japanese, and sign language, one polyglot handles all of them — they can answer a question asked in French using knowledge from a Japanese book." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Images are split into fixed-size <strong>patches</strong> and projected into the same embedding dimension as text tokens. An encoder (e.g. CLIP, SigLIP) maps patches to the model's token space. The transformer attends jointly over text and image tokens. This enables image captioning, visual Q&A, chart reading, and document understanding. GPT-4V, Gemini, and Claude 3 all use this approach.</p><p style={{margin:0}}>To a multimodal model a 16×16 image patch is just another "word" in its vocabulary of vectors — which is how it can describe a photo it has never seen before.</p></div>,
    keyPoints: ["Images as patches: each patch = one token in the transformer", "Shared embedding space lets text and image attend to each other", "Single model handles text+vision tasks without separate pipelines", "Audio is handled similarly — waveforms are sliced into short frames that become tokens", "All modalities share one representation space, enabling cross-modal reasoning in one forward pass"],
  },
  "ai-llm:What LLMs Can't Do (Yet)": {
    oneLine: "Despite their capabilities, LLMs reliably struggle with multi-step arithmetic, persistent memory, grounding in real-time facts, and tasks requiring genuine world-state updates.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Core limitations: reasoning depth, knowledge cutoff, no persistent memory, no grounding.">
        {[["Arithmetic","errors on long chains"],["Memory","no persistent state"],["Real-time","knowledge cutoff"],["Grounding","can hallucinate facts"]].map(([lim,sub],i)=>(
          <DiagBox key={i} x={10+i*112} y={55} w={100} h={90} label={lim as string} sub={sub as string} fill="var(--card)" stroke={s} text="var(--ink)" />
        ))}
        <text x={230} y={170} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">mitigations: tools, RAG, RLHF, chain-of-thought</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a photographic memory with no pencil", text: "An LLM has read everything but can't update its notes, can't check facts live, and can confidently mis-remember — like a person who's read every textbook but can't look anything up mid-exam." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>LLMs are trained to produce plausible text, not verified truth — they <strong>hallucinate</strong> confidently. They have no persistent memory across conversations (without external storage). Arithmetic beyond ~4 digits is unreliable without a calculator tool. They have a <strong>knowledge cutoff</strong> — events after training are unknown. And they have no grounding in the current real world unless given tools or retrieved context.</p><p style={{margin:0}}>A model can ace an expert exam yet stumble on a child's riddle — fluency is not understanding, and benchmark scores can hide surprisingly brittle gaps.</p></div>,
    keyPoints: ["Hallucination: confident but incorrect outputs", "Knowledge cutoff: unaware of events after training", "Tool use (calculator, search) mitigates most limitations", "No memory persists between sessions unless an external system stores it explicitly", "Pattern-matching mimics reasoning but breaks down on genuinely novel problems"],
  },

  // ── Production AI Agents ──────────────────────────────────────────────────
  "production-ai-agents:What Makes Agentic Systems Uniquely Hard": {
    oneLine: "Agentic systems compound LLM non-determinism with real side-effects — every step can fail independently, errors cascade, and rollback is often impossible.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Each step has independent failure probability — compounding turns small error rates into high end-to-end failure rates.">
        {["Plan","Call API","Write DB","Send Email","Confirm"].map((step,i)=>(
          <g key={i}>
            <DiagBox x={10+i*88} y={70} w={80} h={40} label={step} fill={i===3?"var(--card)":h.soft} stroke={i===3?s:h.base} text={i===3?"var(--ink)":h.ink} />
            {i<4&&<DiagArrow x1={90+i*88} y1={90} x2={96+i*88} y2={90} color={i===3?s:h.base} />}
            <text x={50+i*88} y={135} textAnchor="middle" fontSize="9" fill={s} fontFamily="var(--font-body,system-ui)">p=0.95</text>
          </g>
        ))}
        <text x={230} y={162} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">0.95⁵ ≈ 0.77 — 23% end-to-end failure from 5% per-step error</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a chef using real ingredients, not a simulator", text: "A recipe test in a simulator is safe to fail. But in a real kitchen, burning the sauce and ordering the wrong ingredients has real consequences and costs real money. Agents act on the real world." },
    body: <div style={PROSE}><p style={{margin:0}}>LLMs alone are sandboxed — bad output is just bad text. Agents act: they write files, call APIs, send emails, charge customers. Errors compound multiplicatively across steps. There is no 'undo' for a sent email or a database write. Non-determinism that is acceptable in a chatbot is catastrophic in an automated workflow handling thousands of customers.</p><p style={{margin:'10px 0 0'}}>Watch out for naive retries: by the time an agent errors out it may have already fired irreversible side effects, so restarting from the top can double-charge customers or re-send emails already delivered.</p></div>,
    keyPoints: ["Compounding error rates: 95% per step × 5 steps = 77% success", "Side-effects are irreversible — no undo for sent emails or DB writes", "LLM non-determinism is fine for chat; catastrophic for automation", "A restart after failure replays every completed side effect unless you checkpoint progress first", "Model retries a single run can span minutes, dozens of LLM calls, and thousands of tokens — blast radius grows with time"],
  },
  "production-ai-agents:Why Classic Software Engineering Still Wins": {
    oneLine: "Most agentic tasks can be replaced by deterministic code — structure, validation, and hard-coded logic beat an LLM on reliability, speed, cost, and debuggability for well-defined sub-tasks.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Use LLMs only where deterministic code cannot solve the problem — everything else belongs in classic engineering.">
        <DiagBox x={10} y={50} w={200} h={120} label="Classic Code" sub="deterministic, testable, fast" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={250} y={50} w={200} h={120} label="LLM" sub="ambiguous, creative, slow" fill={h.soft} stroke={h.base} text={h.ink} />
        {(["parsing","validation","routing","formatting"] as string[]).map((task,i)=>(
          <text key={i} x={110} y={80+i*25} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">✓ {task}</text>
        ))}
        {(["classify intent","draft response","extract ambiguous"] as string[]).map((task,i)=>(
          <text key={i} x={350} y={85+i*28} textAnchor="middle" fontSize="10" fill={h.ink} fontFamily="var(--font-body,system-ui)">✓ {task}</text>
        ))}
        <text x={230} y={195} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">default to code; escalate to LLM only when needed</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like using a calculator vs. asking a professor", text: "You don't ask a professor to add 1+1 — you use a calculator. Ask the professor only for what calculators can't solve: interpretation, ambiguity, creativity." },
    body: <div style={PROSE}><p style={{margin:0}}>LLMs are powerful but expensive, slow, and non-deterministic. For any sub-task with a clear, verifiable answer — parsing JSON, validating formats, routing based on keywords, computing values — write deterministic code. Reserve the LLM for tasks requiring natural language understanding, creativity, or ambiguity resolution. Hybrid architectures (code orchestrates, LLM fills gaps) outperform pure-LLM pipelines.</p><p style={{margin:'10px 0 0'}}>The engineers with a real advantage are not the ones who know the most about prompting — they are the ones who already reach for circuit breakers, dead-letter queues, and idempotency keys by reflex.</p></div>,
    keyPoints: ["Parsing, validation, routing → code; ambiguity, creativity → LLM", "Deterministic code is 10–1000× faster and cheaper than an LLM call", "Hybrid: code orchestrates, LLM fills the gaps", "Circuit breakers, bulkheads, and message queues from microservice patterns apply directly to agents", "A single unprotected slow dependency can cascade and take down your entire agent platform"],
  },
  "production-ai-agents:Memory Management": {
    oneLine: "Agents need multiple memory types — in-context (short), external (long), episodic (past interactions), and semantic (facts) — because the context window is finite and expensive.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Four memory tiers: in-context scratch, vector store, key-value store, structured DB.">
        {[["In-context","current window"],["Vector store","semantic search"],["KV store","fast key lookup"],["SQL / DB","structured facts"]].map(([name,sub],i)=>(
          <DiagBox key={i} x={10+i*112} y={55} w={100} h={90} label={name as string} sub={sub as string} fill={i===0?h.soft:"var(--card)"} stroke={i===0?h.base:s} text={i===0?h.ink:"var(--ink)"} />
        ))}
        <text x={230} y={170} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">in-context is fastest; external stores are persistent across sessions</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a doctor's working memory, notepad, and patient file", text: "The doctor remembers the current conversation (in-context), jots notes on a pad (KV store), searches past visit records (vector store), and reads structured test results (SQL). Each layer has different speed and capacity." },
    body: <div style={PROSE}><p style={{margin:0}}><strong>In-context</strong>: everything in the prompt window — fast but limited and expensive per token. <strong>Vector store</strong>: embed memories as vectors, retrieve by similarity — ideal for unstructured past interactions. <strong>KV store</strong>: exact-key retrieval — user preferences, session state. <strong>Structured DB</strong>: queryable facts with relationships. Good agents explicitly manage what goes in each tier and prune context aggressively.</p><p style={{margin:'10px 0 0'}}>Watch out for naive oldest-first truncation: it evicts the original system prompt and goal first, leaving the agent confidently pursuing a subtly wrong objective with no memory of its constraints.</p></div>,
    keyPoints: ["In-context is limited — prune aggressively, summarise old turns", "Vector store for semantic retrieval of past interactions", "KV store for fast exact-key session state", "Pin the goal and hard constraints as never-evictable — they must survive the entire run", "Memory poisoning: one bad retrieval corrupts all subsequent reasoning for that run"],
  },
  "production-ai-agents:Concurrency": {
    oneLine: "Agents can run multiple tool calls in parallel — but concurrency requires careful coordination to avoid race conditions, duplicate work, and resource exhaustion.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Serial vs parallel tool execution — parallel is faster but requires coordination.">
        <text x={115} y={30} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-body,system-ui)">Serial</text>
        {[0,1,2].map(i=>(
          <DiagBox key={i} x={10+i*100} y={40} w={90} h={34} label={`Tool ${i+1}`} fill="var(--card)" stroke={s} text="var(--ink)" />
        ))}
        <text x={345} y={30} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily="var(--font-body,system-ui)">Parallel</text>
        {[0,1,2].map(i=>(
          <DiagBox key={i} x={250} y={40+i*48} w={90} h={34} label={`Tool ${i+1}`} fill={h.soft} stroke={h.base} text={h.ink} />
        ))}
        <DiagBox x={370} y={72} w={80} h={40} label="Merge" sub="results" fill={h.soft} stroke={h.base} text={h.ink} />
        {[0,1,2].map(i=>(<DiagArrow key={i} x1={340} y1={57+i*48} x2={368} y2={92} color={h.base} />))}
        <text x={230} y={185} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">use semaphores / concurrency limits to avoid API rate limits</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like kitchen sous chefs working simultaneously", text: "Three sous chefs can chop, sauce, and plate in parallel — but they must not reach for the same knife or use the same burner at the same time." },
    body: <div style={PROSE}><p style={{margin:0}}>Identify independent tool calls and issue them concurrently using <code>Promise.all</code> or equivalent. Use a <strong>semaphore</strong> to cap concurrent calls and avoid hitting API rate limits. Protect shared state with locks or immutable-update patterns. Detect and prevent <strong>fan-out explosions</strong> — an agent that spawns sub-agents that each spawn more agents can exhaust resources within seconds.</p><p style={{margin:'10px 0 0'}}>Apply the concurrency limit <em>account-wide across the entire agent tree</em>, not per agent — a single deep-research query can spawn thousands of sub-agents and hit provider rate limits in under two seconds.</p></div>,
    keyPoints: ["Parallel tool calls reduce latency dramatically", "Semaphore / concurrency limit to avoid rate limits and fan-out", "Shared mutable state is a bug waiting to happen — prefer immutable updates", "Cap fan-out depth and breadth per node so the agent tree can never grow exponentially", "Distributed locks serialize writes to shared resources to prevent clobbering between concurrent agents"],
  },
  "production-ai-agents:Backpressure": {
    oneLine: "Backpressure prevents upstream producers from overwhelming downstream consumers — in agentic pipelines, an unbounded queue is a time bomb waiting to exhaust memory and money.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Without backpressure the queue grows unbounded; with it, the producer slows to match consumer speed.">
        <DiagBox x={10} y={77} w={90} h={46} label="Producer" sub="fast" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={165} y={55} w={130} h={80} label="Queue" sub="unbounded = bad" fill={s} stroke={s} text="var(--paper)" />
        <DiagBox x={355} y={77} w={90} h={46} label="Consumer" sub="slow" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={100} y1={100} x2={163} y2={100} color={s} />
        <DiagArrow x1={295} y1={100} x2={353} y2={100} color={s} />
        <DiagArrow x1={353} y1={115} x2={165} y2={115} color={h.base} label="slow down signal" />
        <text x={230} y={170} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">bounded queue + reject / drop when full = backpressure</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a restaurant kitchen with a limited pass", text: "If the dining room only has 20 tables, the kitchen shouldn't cook 200 dishes and leave them piling up. The pass window is the backpressure: when it's full, the kitchen slows down." },
    body: <div style={PROSE}><p style={{margin:0}}>Backpressure is a signal from consumer to producer: 'slow down'. Without it, agentic systems can queue thousands of LLM tasks, each costing money and time. Apply backpressure at every boundary: use <strong>bounded queues</strong> (reject when full), <strong>concurrency limits</strong> (semaphores), and <strong>circuit breakers</strong> (stop sending when downstream is unhealthy). Monitor queue depth as a leading indicator of overload.</p><p style={{margin:'10px 0 0'}}>A bigger queue is not backpressure — it is a longer fuse. An unbounded queue converts a producer/consumer rate mismatch into steady memory growth until the process is OOM-killed.</p></div>,
    keyPoints: ["Unbounded queues lead to memory exhaustion and runaway costs", "Bounded queue + reject policy = backpressure", "Monitor queue depth — it's an early warning of system overload", "Use high/low watermarks to signal the producer to pause and resume, avoiding oscillation", "Pull-based demand (consumers request work when ready) is more stable than unconditional push from producers"],
  },
  "production-ai-agents:Retries": {
    oneLine: "Retries recover from transient failures automatically — but naive retries amplify load during outages; exponential backoff with jitter and a cap are essential.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Exponential backoff: wait 1s, 2s, 4s — jitter prevents thundering herd.">
        <DiagBox x={10} y={80} w={80} h={40} label="Request" fill="var(--card)" stroke={s} text="var(--ink)" />
        {[0,1,2].map(i=>(
          <g key={i}>
            <DiagArrow x1={90+i*110} y1={100} x2={130+i*110} y2={100} color={i===2?h.base:s} />
            <DiagBox x={132+i*110} y={80} w={70} h={40} label={["Fail","Fail","OK"][i]} fill={i===2?h.soft:"var(--card)"} stroke={i===2?h.base:s} text={i===2?h.ink:"var(--ink)"} />
            {i<2&&<text x={152+i*110} y={132} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">{`wait ${Math.pow(2,i)}s`}</text>}
          </g>
        ))}
        <text x={230} y={175} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">max retries + jitter prevents thundering herd on recovery</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like ringing a doorbell if no one answers", text: "Ring once. Wait. Ring again. Wait longer. Ring a third time. After 3 attempts you stop — you don't lean on it for ten minutes, and you don't press it every second." },
    body: <div style={PROSE}><p style={{margin:0}}>Only retry <strong>idempotent</strong> operations — retrying a non-idempotent call (charge a credit card) is a bug. Use <strong>exponential backoff</strong>: wait = min(cap, base × 2^attempt). Add <strong>jitter</strong> (random offset) to spread retries and avoid the thundering herd problem when many clients recover simultaneously. Set a <strong>max attempts</strong> limit and surface a clear error after exhaustion.</p><p style={{margin:'10px 0 0'}}>On retry, resume from the last good checkpoint rather than restarting the whole run — otherwise '3 retries' can quietly multiply into 27 attempts when inner and outer retry layers compound.</p></div>,
    keyPoints: ["Only retry idempotent operations — never duplicate charges", "Exponential backoff + jitter prevents thundering herd", "Set max attempts and surface failure clearly after exhaustion", "Nested retry layers multiply — inner × outer means 3 retries each becomes 9 attempts silently", "Treat confirmation timeouts as 'unknown' not 'failed' — verify before re-sending a side-effecting call"],
  },
  "production-ai-agents:Timeouts": {
    oneLine: "Timeouts bound how long any operation can stall your system — every LLM call, tool execution, and external API call must have a deadline or a single slow dependency can freeze your entire agent.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Without a timeout, one slow dependency blocks the thread forever; with one, you fail fast and can retry or fallback.">
        <DiagBox x={10} y={77} w={90} h={46} label="Agent" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagBox x={200} y={77} w={60} h={46} label="API" sub="slow…" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={100} y1={100} x2={198} y2={100} color={s} />
        <rect x={365} y={77} width={85} height={46} rx={8} fill={h.soft} stroke={h.base} strokeWidth="2" />
        <text x={407} y={106} textAnchor="middle" fontSize="11" fill={h.ink} fontFamily="var(--font-body,system-ui)">Timeout!</text>
        <line x1={260} y1={77} x2={363} y2={77} stroke={h.base} strokeWidth="1.5" strokeDasharray="6 3" />
        <text x={312} y={72} textAnchor="middle" fontSize="9.5" fill={h.ink} fontFamily="var(--font-body,system-ui)">deadline</text>
        <text x={230} y={172} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">set connect, read, and total timeouts independently</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a chess clock for every move", text: "If a player takes forever on one move the game never ends. A chess clock enforces a per-move budget. Timeouts enforce a per-call budget on every external dependency." },
    body: <div style={PROSE}><p style={{margin:0}}>Set three timeouts: <strong>connect timeout</strong> (how long to wait for a connection to be established), <strong>read timeout</strong> (how long to wait between received bytes), and <strong>total timeout</strong> (the hard wall-clock limit). LLM streaming responses can tie up connections for minutes — always set a total timeout. When a timeout fires, fail explicitly so the calling code can retry or fall back.</p><p style={{margin:'10px 0 0'}}>Use deadline propagation: compute the total run deadline once and pass remaining time down the call stack so no inner layer can promise more time than the outer layer has left.</p></div>,
    keyPoints: ["Set connect, read, and total timeouts independently", "LLM streaming can run for minutes — total timeout is essential", "Timeout → explicit failure → retry or fallback", "Deadline propagation ensures inner calls never outlive the outer budget — preventing cascading hangs", "A missing tool timeout can cause a worker to hold a GPU slot, DB connection, and queue slot for hours"],
  },
  "production-ai-agents:Failure Handling": {
    oneLine: "Production agents must handle partial failures gracefully — distinguishing transient from permanent errors, compensating for side-effects already taken, and surfacing failures clearly.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Error classification drives the recovery path: retry for transient, compensate for partial, abort for permanent.">
        <DiagBox x={155} y={10} w={150} h={40} label="Failure" fill="var(--card)" stroke={s} text="var(--ink)" />
        {[["Transient (network, 429)",25,115],["Partial (step 3 done)",165,115],["Permanent (4xx / bad input)",305,115]].map(([lbl,x,y],i)=>(
          <g key={i}>
            <DiagBox x={x as number} y={y as number} w={120} h={50} label={(lbl as string).split("(")[0].trim()} sub={`(${(lbl as string).split("(")[1]}`} fill={i===1?h.soft:"var(--card)"} stroke={i===1?h.base:s} text={i===1?h.ink:"var(--ink)"} />
            <DiagArrow x1={230} y1={50} x2={(x as number)+60} y2={y as number} color={s} />
            <text x={(x as number)+60} y={(y as number)+72} textAnchor="middle" fontSize="9.5" fill={s} fontFamily="var(--font-body,system-ui)">{["retry","compensate","abort"][i]}</text>
          </g>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Like a surgeon who can't simply ctrl-Z mid-operation", text: "If something goes wrong in surgery you can't undo what's been done — you assess the damage, compensate where possible, and decide whether to continue or close." },
    body: <div style={PROSE}><p style={{margin:0}}><strong>Transient errors</strong> (5xx, timeout, rate limit): retry with backoff. <strong>Partial completion</strong> (3 of 5 steps done when step 4 fails): you must compensate — undo what was done or record a compensation transaction. <strong>Permanent errors</strong> (400 Bad Request, schema validation failure): do not retry; fix the input. Use <strong>structured error types</strong> that carry the error class explicitly so callers can decide what to do.</p><p style={{margin:'10px 0 0'}}>The dangerous failures are the silent ones: soft errors return plausible but wrong data, logical errors pursue a wrong subgoal correctly for 20 steps — neither throws an exception.</p></div>,
    keyPoints: ["Classify errors: transient (retry), partial (compensate), permanent (abort)", "Compensation logic: undo irreversible side-effects taken before failure", "Structured error types let callers make the right recovery decision", "Saga pattern: pair each committed step with a compensating action so failure can roll back in reverse", "Checkpoint after every step — without it, a crash near the end forces a full restart and replays all side effects"],
  },
  "production-ai-agents:Observability": {
    oneLine: "Observability means you can answer 'what is my agent doing and why did it fail' without SSH-ing into a server — structured logs, traces, and metrics are the three pillars.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 190" caption="Logs record events, traces link them into a request chain, metrics aggregate them for dashboards.">
        {[["Logs","structured JSON events"],["Traces","distributed spans"],["Metrics","latency / error rate"]].map(([name,sub],i)=>(
          <DiagBox key={i} x={10+i*148} y={50} w={136} h={90} label={name as string} sub={sub as string} fill={i===1?h.soft:"var(--card)"} stroke={i===1?h.base:s} text={i===1?h.ink:"var(--ink)"} />
        ))}
        <text x={230} y={162} textAnchor="middle" fontSize="10" fill={s} fontFamily="var(--font-body,system-ui)">trace every LLM call with input, output, latency, and cost</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a flight data recorder for your agent", text: "You can't reproduce the crash, but the black box tells you everything: altitude, speed, control inputs, timestamps. Structured logs and traces are your black box." },
    body: <div style={PROSE}><p style={{margin:0}}>Log every LLM call: timestamp, model, prompt tokens, completion tokens, latency, cost estimate, tool calls made. Use a <strong>trace ID</strong> that flows through every sub-call so a single user request can be reconstructed end-to-end. Emit latency and error rate as metrics so dashboards alert before users notice. Log the full LLM response — intermediate reasoning steps are invaluable for debugging.</p><p style={{margin:'10px 0 0'}}>Treat tokens-per-run as a first-class metric: a runaway loop surfaces as an anomalous spike in this graph long before users report a problem.</p></div>,
    keyPoints: ["Log every LLM call: tokens, latency, cost, tool calls", "Trace ID links all sub-calls in a single request end-to-end", "Full LLM response in logs — intermediate reasoning is debugging gold", "Track steps-per-run and tokens-per-run as metrics — drift outside the normal band signals loops or confusion", "One parent span with a child span per step makes the root-cause span visible at a glance in a waterfall view"],
  },
  "production-ai-agents:The Reliable Agent Stack": {
    oneLine: "A production-ready agent is built in layers: idempotency and state machines at the base, circuit breakers and queues in the middle, observability and human-in-the-loop at the top.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 200" caption="Layered reliability: base handles state; middleware handles flow control; top handles visibility and safety.">
        {([
          ["Observability + Human-in-the-loop",20,h.soft,h.base,h.ink],
          ["Circuit Breakers + Queue + Backpressure",70,"var(--card)",s,"var(--ink)"],
          ["Idempotency + State Machine + Retries",120,"var(--card)",s,"var(--ink)"],
          ["Deterministic code (not LLM) where possible",170,"var(--card)",s,"var(--ink)"],
        ] as [string,number,string,string,string][]).map(([lbl,y,fill,stroke,text])=>(
          <DiagBox key={lbl} x={30} y={y} w={400} h={38} label={lbl} fill={fill} stroke={stroke} text={text} />
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Like a building's layered safety systems", text: "Sprinklers (base), fire doors (middleware), and emergency crew (top-level). Each layer provides a safety net if the ones below fail. No single layer is enough alone." },
    body: <div style={PROSE}><p style={{margin:0}}>Production agents require systematic layering: use <strong>state machines</strong> to make progress trackable and resumable; <strong>idempotency keys</strong> to make operations safe to replay; <strong>circuit breakers</strong> to stop hammering a failing dependency; <strong>bounded queues</strong> to apply backpressure; and <strong>human-in-the-loop</strong> checkpoints before irreversible high-stakes actions.</p><p style={{margin:'10px 0 0'}}>Omitting any single layer reintroduces exactly that chapter's failure mode: no checkpoint store means a crash near the end forces a full replay; no circuit breaker means one slow tool drains all capacity.</p></div>,
    keyPoints: ["State machine: make every agent step explicit and resumable", "Idempotency keys: safe replay of any step", "Human-in-the-loop checkpoint before irreversible actions", "Each infrastructure layer owns exactly one of the seven hard problems — removing any one layer reintroduces that failure mode", "The model is the easy part; the task queue, worker pool, timeout manager, and trace collector around it are what make it production-safe"],
  },
  "production-ai-agents:Failure Mode Catalog": {
    oneLine: "Agentic failure modes have names: infinite loops, tool-call cascades, prompt injection, context poisoning, and hallucinated function arguments — each needs a specific mitigation.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 195" caption="Common agentic failure modes and their first-line mitigations.">
        {[["Infinite loop","step counter"],["Tool cascade","fan-out limit"],["Prompt inject","input sanitise"],["Halluc. args","schema validate"],["Context poison","source trust"]].map(([mode,mitigation],i)=>(
          <g key={i}>
            <DiagBox x={10} y={25+i*32} w={150} h={26} label={mode as string} fill="var(--card)" stroke={s} text="var(--ink)" rx={6} />
            <DiagArrow x1={160} y1={38+i*32} x2={228} y2={38+i*32} color={h.base} />
            <DiagBox x={230} y={25+i*32} w={220} h={26} label={mitigation as string} fill={h.soft} stroke={h.base} text={h.ink} rx={6} />
          </g>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Like a pre-flight checklist for every run", text: "Pilots don't memorise possible failures ad hoc — they run a structured checklist that covers every known failure mode before takeoff. A failure mode catalog is that checklist for your agent." },
    body: <div style={PROSE}><p style={{margin:0}}>Anticipate each failure class: <strong>Infinite loop</strong> — enforce a hard step/token budget. <strong>Tool cascade</strong> — cap max concurrent and total tool calls. <strong>Prompt injection</strong> — treat user-provided content as untrusted, sanitise before inserting into system prompt. <strong>Hallucinated function arguments</strong> — validate every tool call against a JSON schema before execution. <strong>Context poisoning</strong> — track provenance of each context chunk; don't trust retrieved web content unconditionally.</p><p style={{margin:'10px 0 0'}}>The upper-right cluster — Infinite Loop, Retry Storm, Side Effect Replay, and Blind Failure — is both the most common and the most damaging; invest defenses here first.</p></div>,
    keyPoints: ["Step budget enforced in code — never let the LLM decide when to stop", "Validate all tool call arguments against JSON schema before execution", "Treat retrieved content as untrusted — prompt injection lives in web pages", "Named failure modes enable pattern-matching triage: a symptom maps to a mode maps to a known fix", "Run a pre-mortem: walk the catalog before launch and confirm each mode already has a mitigation in the stack"],
  },
  "production-ai-agents:Engineering Principles That Never Go Away": {
    oneLine: "Separation of concerns, least privilege, fail-fast, and idempotency are not optional extras for agents — they are load-bearing constraints that prevent entire classes of production incidents.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; return (
      <DiagFrame vb="0 0 460 195" caption="Classic principles apply to agents just as strongly as to any distributed system.">
        {[["Separation of concerns","small, focused steps"],["Least privilege","minimal permissions per tool"],["Fail fast","surface errors immediately"],["Idempotency","safe to replay any step"],["Immutable inputs","no shared mutable state"]].map(([principle,impl],i)=>(
          <g key={i}>
            <DiagBox x={10} y={18+i*34} w={180} h={28} label={principle as string} fill={h.soft} stroke={h.base} text={h.ink} rx={6} />
            <DiagArrow x1={190} y1={32+i*34} x2={218} y2={32+i*34} color={h.base} />
            <DiagBox x={220} y={18+i*34} w={230} h={28} label={impl as string} fill="var(--card)" stroke={s} text="var(--ink)" rx={6} />
          </g>
        ))}
      </DiagFrame>
    ); },
    analogy: { title: "Like traffic laws that apply to all vehicles, including self-driving cars", text: "Autonomous cars must still stop at red lights and stay in their lane. The laws don't disappear because the driver is an AI — they become more important." },
    body: <div style={PROSE}><p style={{margin:0}}><strong>Separation of concerns</strong>: each agent step does one thing — easier to test, retry, and observe. <strong>Least privilege</strong>: give each tool call the minimum permissions needed — a writing tool shouldn't be able to delete. <strong>Fail fast</strong>: detect errors early, surface them explicitly, don't bury them in LLM output. <strong>Idempotency</strong>: any step must be safe to replay. These principles predate AI agents by decades and their importance only grows with autonomy.</p><p style={{margin:'10px 0 0'}}>Frameworks and models churn every few months — but design-for-failure, bounded queues, and observability carry forward intact across every rewrite and will outlast whatever tooling you use today.</p></div>,
    keyPoints: ["Least privilege: each tool gets minimum permissions — no broad access", "Fail fast: explicit errors surface sooner than buried LLM errors", "Idempotency is non-negotiable — production failures always cause replays", "Graceful degradation: design every operation to return a useful partial result on failure instead of crashing entirely", "Codify principles as platform invariants in shared libraries and review checklists — reliability must hold regardless of which framework you use"],
  },
};

// ─── ConceptBody ──────────────────────────────────────────────────────────────

function ConceptBody({ topic, subtopic }: { topic: Topic; subtopic: Subtopic }) {
  const key = `${topic.id}:${subtopic.name}`;
  const f = FEATURED[key];
  const h = topic.hue;

  if (f) {
    return (
      <div>
        <p style={{
          fontFamily: "var(--font-display, Georgia, serif)",
          fontSize: "1.7rem",
          lineHeight: 1.28,
          color: "var(--ink)",
          margin: "0 0 1.6rem",
          letterSpacing: "-0.01em",
        }}>
          {f.oneLine}
        </p>
        <f.Diagram h={h} />
        <div style={{ marginTop: "1.6rem" }}>{f.body}</div>
        <AnalogyCard title={f.analogy.title} text={f.analogy.text} h={h} />
        {/* Key points */}
        <div style={{ marginTop: "2rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: h.ink, marginBottom: 12 }}>
            Key points
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {f.keyPoints.map((pt, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: h.soft, color: h.ink, fontSize: "0.7rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </div>
                <span style={{ color: "var(--ink)", fontSize: "0.96rem", lineHeight: 1.5, fontWeight: 500 }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* generated fallback */
  return (
    <div>
      <p style={{
        fontFamily: "var(--font-display, Georgia, serif)",
        fontSize: "1.6rem",
        lineHeight: 1.3,
        color: "var(--ink)",
        margin: "0 0 1.6rem",
      }}>
        {subtopic.description}
      </p>
      <GenericDiagram h={h} name={subtopic.name} />
      <div style={{ ...PROSE, marginTop: "1.6rem" }}>
        <p style={{ margin: "0 0 1rem" }}><strong>{subtopic.name}</strong> is one of the core ideas in {topic.title}. {subtopic.description}</p>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)", margin: "1.4rem 0 0.5rem" }}>Why it matters</h3>
        <p style={{ margin: 0 }}>Understanding this gives you a sharper mental model for the trade-offs around it — and helps you recognise where it shows up in real systems.</p>
      </div>
    </div>
  );
}

// ─── Share button ─────────────────────────────────────────────────────────────

function ShareButton({ topicSlug, conceptId }: { topicSlug: string; conceptId: string }) {
  const [copied, setCopied] = useState(false);
  const share = useCallback(async () => {
    const url = `${window.location.origin}/topics/${topicSlug}?concept=${conceptId}`;
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1900);
  }, [topicSlug, conceptId]);

  return (
    <button
      onClick={share}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: copied ? "var(--brand-soft)" : "var(--card)",
        border: `1px solid ${copied ? "var(--brand)" : "var(--line)"}`,
        color: copied ? "var(--brand-ink)" : "var(--ink-2)",
        borderRadius: "var(--radius-pill)", padding: "8px 14px",
        fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
        transition: "all 0.18s ease",
      }}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" />
            <path strokeLinecap="round" d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

// ─── Main ConceptView ─────────────────────────────────────────────────────────

interface Props {
  topic: Topic;
  subtopic: Subtopic;
}

export default function ConceptView({ topic, subtopic }: Props) {
  const router = useRouter();
  const idx = topic.subtopics.findIndex((s) => s.name === subtopic.name);
  const prev = topic.subtopics[idx - 1];
  const next = topic.subtopics[idx + 1];
  const conceptId = subtopicToConceptId(topic, subtopic) ?? subtopic.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const goTo = (s: Subtopic) => {
    const cid = subtopicToConceptId(topic, s) ?? s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    router.push(`/topics/${topic.id}?concept=${cid}`);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 28px 80px" }}>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: 22 }}>
        <ol style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.86rem", color: "var(--ink-3)", listStyle: "none", margin: 0, padding: 0 }}>
          <li><Link href="/" style={{ color: "var(--ink-2)", fontWeight: 600, textDecoration: "none" }}>Home</Link></li>
          <li style={{ opacity: 0.5 }}>/</li>
          <li><Link href={`/topics/${topic.id}`} style={{ color: "var(--ink-2)", fontWeight: 600, textDecoration: "none" }}>{topic.title}</Link></li>
          <li style={{ opacity: 0.5 }}>/</li>
          <li style={{ color: "var(--ink)", fontWeight: 600 }}>{subtopic.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="anim-float">
        {/* Guide chip + position */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: topic.hue.base, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <TopicIcon id={topic.id} size={20} />
          </div>
          <span style={{ fontWeight: 700, color: topic.hue.ink, fontSize: "0.92rem", whiteSpace: "nowrap" }}>{topic.title}</span>
          <span style={{ color: "var(--ink-3)", fontSize: "0.8rem", fontFamily: "ui-monospace, monospace" }}>
            {String(idx + 1).padStart(2, "0")} / {String(topic.subtopics.length).padStart(2, "0")}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display" style={{ fontSize: "clamp(2.6rem, 6vw, 4rem)", color: "var(--ink)", margin: "0 0 20px", lineHeight: 1.05 }}>
          {subtopic.name}
        </h1>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
          <FavoriteButton
            topicSlug={topic.id}
            topicTitle={topic.title}
            topicIcon={topic.icon}
            topicColor={topic.color}
            conceptId={conceptId}
            conceptTitle={subtopic.name}
            category={subtopic.description.slice(0, 60)}
            showLabel
          />
          <ShareButton topicSlug={topic.id} conceptId={conceptId} />
        </div>
      </div>

      {/* Body */}
      <div className="anim-float" style={{ animationDelay: "0.06s" }}>
        <ConceptBody topic={topic} subtopic={subtopic} />
      </div>

      {/* Prev / Next */}
      <div style={{ display: "flex", gap: 14, marginTop: 44, flexWrap: "wrap" }}>
        {([["Previous", prev], ["Next", next]] as [string, Subtopic | undefined][]).map(([label, s], i) =>
          s ? (
            <button
              key={i}
              onClick={() => goTo(s)}
              className="tidbit-card"
              style={{
                flex: 1, minWidth: 200, textAlign: i === 1 ? "right" : "left",
                padding: "16px 20px", cursor: "pointer",
                display: "flex", flexDirection: "column", gap: 3,
                boxShadow: "var(--shadow-sm)", border: "1px solid var(--line)",
              }}
            >
              <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{label}</span>
              <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.96rem" }}>{s.name}</span>
            </button>
          ) : <div key={i} style={{ flex: 1, minWidth: 200 }} />
        )}
      </div>
    </div>
  );
}
