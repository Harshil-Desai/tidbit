"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Topic, Subtopic } from "@/data/topics";
import { subtopicToConceptId } from "@/lib/conceptUtils";
import FavoriteButton from "@/components/FavoriteButton";
import TopicIcon from "@/components/TopicIcon";
import { dsaDiagrams } from "@/components/dsaDiagrams";
import { systemDesignDiagrams } from "@/components/systemDesignDiagrams";
import { conceptExtras, type ConceptExtras } from "@/data/conceptExtras";

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
    Diagram: systemDesignDiagrams["Load Balancing"],
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
    Diagram: systemDesignDiagrams["Horizontal vs Vertical Scaling"],
    analogy: { title: "Bigger truck vs. a fleet of vans", text: "You can keep buying a bigger truck, but eventually no vehicle can carry your load — a fleet of vans has no practical ceiling." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Vertical scaling</strong> adds CPU, RAM, or faster disks to one machine. It's simple but hits a hard hardware ceiling. <strong>Horizontal scaling</strong> spreads load across many commodity servers. It's more complex (stateless services + load balancer) but can grow indefinitely.</p><p style={{margin:0}}>Watch out: vertical scaling requires a reboot on most cloud instance types, meaning the resize itself causes a second outage window. Database write scaling is also asymmetric — read replicas are horizontal read-scale, but scaling write throughput beyond a single primary requires vertical sizing or sharding.</p></div>,
    keyPoints: ["Vertical: simpler but hits hardware limits", "Horizontal: limitless in theory, requires stateless design", "Most large systems combine both approaches", "Vertical scale-up typically requires a reboot on cloud instances", "Horizontal scaling bakes in fault tolerance — one node failure degrades capacity, not availability"],
  },
  "system-design:Auto-scaling": {
    oneLine: "Auto-scaling watches your traffic and quietly adds or removes servers so you pay for exactly what you need — nothing more, nothing less.",
    Diagram: systemDesignDiagrams["Auto-scaling"],
    analogy: { title: "Like a restaurant that opens extra tables", text: "When the queue grows, the host opens the back room. When it quiets down, they close it — you only staff what you need." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Auto-scaling continuously monitors a metric (CPU, request rate, queue depth) and adjusts the number of running instances to match demand. <strong>Scale-out</strong> adds instances when load rises; <strong>scale-in</strong> removes them when it drops — keeping costs proportional to usage.</p><p style={{margin:0}}>Watch out: services with heavy cold-start penalties (JVM warm-up, model loading, cache priming) will worsen latency during the exact spikes auto-scaling is meant to absorb. Cooldown periods prevent "flapping" but delay response to genuine sustained load.</p></div>,
    keyPoints: ["Scales out on high load, in on low load", "Driven by metrics: CPU, RPS, queue depth", "Needs warm-up time — plan for lag", "Scale-out fast, scale-in slow with cooldowns to prevent rapid churn", "Only works for stateless, horizontally scalable services behind a load balancer"],
  },
  "system-design:Rate Limiting": {
    oneLine: "Rate limiting caps how many requests a caller can make in a window, protecting your service from floods — accidental or malicious.",
    Diagram: systemDesignDiagrams["Rate Limiting"],
    analogy: { title: "Like a bar's clicker counter", text: "The bouncer clicks for every person who enters. Once the venue hits capacity, new arrivals are turned away — no exceptions." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Rate limiting caps requests per client per time window. Common algorithms: <strong>token bucket</strong> (refills at a rate, allows short bursts), <strong>leaky bucket</strong> (drains at a fixed rate, smooths bursts), and <strong>sliding window</strong> (counts requests in a rolling period). Apply at the API gateway so limits are enforced before work begins.</p><p style={{margin:0}}>Watch out: in a clustered deployment, per-node counters silently allow N× the intended limit. Counters must live in a shared store (e.g., Redis) for the limit to be truly global — but that Redis instance then becomes a potential single point of failure.</p></div>,
    keyPoints: ["Prevents overload from any single caller", "Token bucket allows controlled bursts", "Return HTTP 429 with Retry-After header", "Enforce at the edge or gateway, before expensive downstream work", "Distributed counters require a shared store (e.g., Redis) — per-node counters leak excess traffic"],
  },
  "system-design:SQL vs NoSQL": {
    oneLine: "SQL gives you rigid structure and ACID guarantees; NoSQL trades some of that for flexible schemas and horizontal scalability.",
    Diagram: systemDesignDiagrams["SQL vs NoSQL"],
    analogy: { title: "Spreadsheet vs. filing cabinet", text: "SQL is a tidy spreadsheet where every row has the same columns. NoSQL is a filing cabinet where each folder can hold whatever papers you stuff in it." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Choose <strong>SQL</strong> when your data has clear relationships, you need joins, or ACID transactions matter (banking, inventory). Choose <strong>NoSQL</strong> when your schema evolves rapidly, you need massive write throughput, or your data is naturally document/key-value shaped (user profiles, sessions, event logs).</p><p style={{margin:0}}>Watch out: denormalized NoSQL schemas duplicate data across documents — a single logical update must be applied to multiple locations, creating consistency drift if any write fails. Cassandra tombstone accumulation from frequent deletes can spike read latency during compaction.</p></div>,
    keyPoints: ["SQL: strong consistency, fixed schema, vertical scale", "NoSQL: flexible schema, eventual consistency, horizontal scale", "Many systems use both for different data", "SQL scales vertically for writes; NoSQL distributes writes across nodes natively", "NoSQL horizontal scaling pushes conflict resolution complexity into application code"],
  },
  "system-design:Database Sharding": {
    oneLine: "Sharding splits one giant database table across multiple nodes by a shard key — each node owns a slice of the data, so writes and storage scale out.",
    Diagram: systemDesignDiagrams["Database Sharding"],
    analogy: { title: "Like splitting a phone book by last name", text: "A–G goes in volume 1, H–P in volume 2, Q–Z in volume 3. Any lookup goes straight to the right volume — no scanning the others." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Sharding partitions rows across multiple database nodes using a <strong>shard key</strong>. Each node is responsible for a range or hash bucket of keys. Reads and writes for a key go only to its shard, so both storage and write throughput scale linearly with node count. The cost: cross-shard joins and re-sharding when you add nodes.</p><p style={{margin:0}}>Watch out: a poorly chosen shard key (e.g., a low-cardinality or time-based field) creates "hot" shards that recreate the single-node bottleneck. Resharding live traffic requires dual-write and backfill coordination; naive cutover causes write locks or data loss.</p></div>,
    keyPoints: ["Each shard owns a subset of rows by key", "Enables horizontal write scalability", "Cross-shard joins are expensive — choose shard key carefully", "Hash sharding spreads keys evenly; range sharding keeps ordered keys together for scans", "Consistent hashing minimises data movement when adding or removing shards"],
  },
  "system-design:Replication (Leader–Follower, Multi-Leader)": {
    oneLine: "Replication keeps identical copies of your data on multiple nodes — if the leader dies, a follower can take over and reads can spread across replicas.",
    Diagram: systemDesignDiagrams["Replication (Leader–Follower, Multi-Leader)"],
    analogy: { title: "Like a publisher and subscribers", text: "Every article is written once at the publisher and distributed to all subscribers. Readers get their own copy; none of them can edit it." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Leader–follower</strong> replication routes all writes to one leader; changes fan out to followers asynchronously. Followers handle reads, reducing load on the leader. <strong>Multi-leader</strong> replication allows writes on multiple nodes simultaneously — great for geo-distributed systems, but requires conflict resolution when two leaders accept conflicting writes.</p><p style={{margin:0}}>Watch out: reading from a lagging follower can return stale data — use read-your-writes consistency when staleness is unacceptable. Without proper fencing on failover, two nodes can simultaneously believe they are leader (split-brain), causing divergent writes.</p></div>,
    keyPoints: ["Leader takes writes; followers serve reads", "Async replication means followers may lag", "Multi-leader enables geo-distributed writes but needs conflict resolution", "A newly promoted follower may be behind the old leader's commit log, causing apparent data rollback", "Use read-your-writes consistency when the client must see its own most-recent write"],
  },
  "system-design:CAP Theorem": {
    oneLine: "A distributed system can only fully guarantee two of three properties — Consistency, Availability, and Partition Tolerance — never all three at once.",
    Diagram: systemDesignDiagrams["CAP Theorem"],
    analogy: { title: "A three-way promise you can't keep", text: "You can promise a bank to always be open, always be accurate, and survive any network outage — but when the network splits, you must pick accuracy or availability." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>In practice, network partitions happen and can't be ignored — so the real choice is <strong>CP</strong> (stay consistent, go unavailable during a partition) vs <strong>AP</strong> (stay available, risk serving stale data). Most distributed databases fall somewhere on this spectrum and let you tune the trade-off per query.</p><p style={{margin:0}}>Watch out: CAP's "Consistency" means linearizability, not eventual consistency. CP systems like etcd refuse writes during leader election; if callers retry aggressively instead of circuit-breaking, the backlog can overwhelm the cluster the moment the partition heals.</p></div>,
    keyPoints: ["Partition tolerance is non-negotiable in distributed systems", "CP: consistent but may reject requests during splits", "AP: always responds but may return stale data", "CP stores (etcd, HBase) sacrifice availability; AP stores (Cassandra, Dynamo) sacrifice strong consistency", "CAP does not cover latency — a CP system can be technically up but too slow to meet SLAs"],
  },
  "system-design:ACID vs BASE": {
    oneLine: "ACID gives you strong transactional guarantees; BASE trades them for availability and eventual consistency — the right choice depends on your tolerance for stale data.",
    Diagram: systemDesignDiagrams["ACID vs BASE"],
    analogy: { title: "Bank account vs. social media likes", text: "Your bank balance must be exactly right the instant you check — ACID. Your like count can be off by a few for a moment — BASE." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>ACID</strong> transactions guarantee every operation is atomic, data is always valid, transactions don't interfere, and commits survive crashes. <strong>BASE</strong> systems sacrifice strict consistency for availability and partition tolerance — data will eventually converge, but may be stale for a window. Use ACID for financial data; BASE is fine for caches, social feeds, and analytics.</p><p style={{margin:0}}>Watch out: BASE systems push conflict resolution into application code — engineers must reason about convergence, idempotency, and read-repair explicitly. Debugging BASE inconsistencies is notoriously difficult because the failure state is non-reproducible and spread across multiple nodes.</p></div>,
    keyPoints: ["ACID: safe for money and inventory", "BASE: acceptable for social, analytics, caches", "Modern databases often let you choose per operation", "ACID transactions impose write serialization overhead and lock contention that caps throughput on hot rows", "BASE systems can sustain high write throughput across geo-distributed nodes with no single coordinator bottleneck"],
  },
  "system-design:Caching Strategies": {
    oneLine: "A cache is a fast nearby copy of slow data — the hard part is deciding when to fill it, when to write through it, and when to invalidate it.",
    Diagram: systemDesignDiagrams["Caching Strategies"],
    analogy: { title: "Like keeping today's newspaper on your desk", text: "You check your desk first (cache). If it's not there, you go to the archive room (database) and bring a copy back to your desk for next time." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Cache-aside</strong>: the app checks the cache, queries the DB on a miss, and writes the result back. <strong>Write-through</strong>: every write goes to both cache and DB simultaneously. <strong>Write-behind</strong>: writes go to cache first, then are flushed to the DB asynchronously. Each trades off consistency, latency, and complexity differently.</p><p style={{margin:0}}>Watch out: write-behind is fast but risks data loss if the cache node crashes before the async flush completes — writes acknowledged to the client are permanently lost. When a popular TTL key expires under high load, a thundering herd of requests can hammer the database simultaneously.</p></div>,
    keyPoints: ["Cache-aside is the most common pattern", "Write-through keeps cache and DB in sync", "Always plan for cache invalidation — it's the hard part", "Write-behind (write-back) is fastest but risks losing acknowledged writes before flush", "Write-around skips the cache on writes; the cache fills only on a subsequent read"],
  },
  "system-design:CDN (Content Delivery Network)": {
    oneLine: "A CDN copies your static assets to dozens of edge servers around the world so users download from a server nearby, not one far away.",
    Diagram: systemDesignDiagrams["CDN (Content Delivery Network)"],
    analogy: { title: "Like a chain of local warehouses", text: "Amazon doesn't ship every order from one warehouse. It stores popular items near you, so delivery is next-day instead of two weeks." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>CDNs work by caching content at Points of Presence (PoPs) close to users. On the first request for an asset, the edge fetches it from the origin and caches it. Subsequent requests are served from the edge — faster and cheaper. Beyond static files, modern CDNs can also route API requests, run edge functions, and terminate TLS.</p><p style={{margin:0}}>Watch out: new JS/CSS deploys leave old assets cached at edge PoPs when versioned URLs are not used, so users receive a mix of old and new file versions until TTL expires. Purge APIs have propagation delays measured in seconds to minutes across all PoPs.</p></div>,
    keyPoints: ["Serves assets from the closest edge node", "Reduces origin load and latency for users worldwide", "Cache-Control headers control how long CDN holds content", "On a cache miss the edge fetches from origin once, then caches it for all subsequent requests", "Always use versioned (hashed) asset filenames to avoid stale cache after deploys"],
  },
  "system-design:Cache Eviction Policies": {
    oneLine: "When a cache fills up, an eviction policy decides which entry to remove — LRU, LFU, and TTL each make a different bet about what you'll need next.",
    Diagram: systemDesignDiagrams["Cache Eviction Policies"],
    analogy: { title: "Like clearing your desk", text: "You toss the papers you haven't touched in weeks (LRU). Or you toss the ones you've read least often (LFU). Or they simply expire after a day (TTL)." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>LRU</strong> (Least Recently Used) evicts the entry not accessed for the longest time — good for temporal locality. <strong>LFU</strong> (Least Frequently Used) evicts the entry accessed fewest times — good when popularity matters. <strong>TTL</strong> expires entries after a fixed duration regardless of access — simple and predictable. Redis supports all three; choose based on your access pattern.</p><p style={{margin:0}}>Watch out: LRU is vulnerable to scan pollution — a full-table read sequentially promotes millions of rarely-reused keys, evicting all genuinely hot entries. When many keys share the same TTL (e.g., all set at server startup), they expire simultaneously causing a thundering herd of backend requests.</p></div>,
    keyPoints: ["LRU: evict least recently accessed — most common default", "LFU: evict least frequently accessed — better for popularity-skewed workloads", "TTL: time-based expiry — simplest and most predictable", "LRU is vulnerable to scan pollution from bulk reads that flush all hot entries", "Many real caches combine signals (e.g., LRU + TTL) for better hit rates"],
  },
  "system-design:Redis Architecture": {
    oneLine: "Redis keeps its entire dataset in RAM, executes commands in a single thread, and optionally persists to disk — making it blindingly fast for caching and messaging.",
    Diagram: systemDesignDiagrams["Redis Architecture"],
    analogy: { title: "Like a whiteboard in RAM", text: "Redis reads and writes to a whiteboard in memory — instantaneous. Periodically it photographs the whiteboard to disk so it can redraw it if the power goes out." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Redis stores all data in RAM and processes commands on a single-threaded event loop — no lock contention, predictable microsecond latency. It supports rich data structures (strings, hashes, sorted sets, streams) and two persistence options: <strong>RDB</strong> (periodic snapshots) and <strong>AOF</strong> (every-write log). Redis Cluster shards data across nodes for horizontal scale.</p><p style={{margin:0}}>Watch out: replication is asynchronous by default, so a primary failure risks losing acknowledged writes not yet replicated. During a background AOF rewrite Redis forks, and on large datasets the parent's write latency can spike to hundreds of milliseconds due to copy-on-write memory pressure.</p></div>,
    keyPoints: ["All data in RAM — sub-millisecond reads and writes", "Single-threaded: no locks, but CPU-bound on one core", "AOF + RDB persistence for durability without sacrificing speed", "Rich types: strings, hashes, lists, sorted sets, streams, HyperLogLog", "Async replication by default — primary failure can lose recently acknowledged writes"],
  },
  "system-design:DNS Resolution Flow": {
    oneLine: "When you type a URL, your browser silently asks a chain of four servers to translate that name into an IP address before any real request is sent.",
    Diagram: systemDesignDiagrams["DNS Resolution Flow"],
    analogy: { title: "Like asking for directions step by step", text: "You ask a local (resolver), who asks the city hall (root), which points to the county clerk (TLD), who directs you to the building owner (authoritative) who finally has the address." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>DNS is a distributed lookup system. Your OS queries a <strong>recursive resolver</strong> (usually your ISP's or 8.8.8.8). If it doesn't have the answer cached, it walks up the hierarchy: <strong>root nameserver</strong> → <strong>TLD nameserver</strong> (e.g. .com) → <strong>authoritative nameserver</strong> for your domain. The final answer (an A or AAAA record) is returned and cached by the resolver for the record's TTL.</p><p style={{margin:0}}>Watch out: sub-second failover via DNS is unreliable because DNS TTL-based switching has inherent propagation delay. Resolvers, OS, and browser caches all layer on top, and client-side caches frequently ignore TTLs, holding stale records well past expiry.</p></div>,
    keyPoints: ["Four-step chain: resolver → root → TLD → authoritative", "Results are cached at the resolver for the record's TTL", "Lower TTL means faster propagation but more DNS traffic", "DNS is not suitable as a sole health-routing mechanism for sub-second failover", "Record types: A/AAAA (address), CNAME (alias), MX (mail), NS (delegation)"],
  },
  "system-design:HTTP vs HTTPS": {
    oneLine: "HTTPS wraps HTTP inside TLS — it encrypts traffic so eavesdroppers can't read it, and authenticates the server so you know you're talking to the real site.",
    Diagram: systemDesignDiagrams["HTTP vs HTTPS"],
    analogy: { title: "Like sending a letter in a locked box", text: "Plain HTTP is a postcard anyone can read. HTTPS puts the message in a locked box — only the real recipient has the key, and the return address is verified." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>TLS performs a handshake before any HTTP is sent: the server presents a certificate, the client verifies it against a trusted CA, and they negotiate a symmetric session key. After that, all HTTP traffic is encrypted. Modern TLS 1.3 reduces the handshake to one round-trip. HTTPS also enables HTTP/2 and HTTP/3, which bring significant performance improvements.</p><p style={{margin:0}}>Watch out: 0-RTT session resumption in TLS 1.3 is vulnerable to replay attacks on non-idempotent endpoints if not explicitly guarded. Certificate expiry causes hard browser errors for all users — even a one-hour expiry window can constitute a full outage if renewal pipelines are manual.</p></div>,
    keyPoints: ["TLS encrypts traffic and authenticates the server", "Certificate chain anchors trust to a CA", "HTTPS is a prerequisite for HTTP/2 and HTTP/3", "Default ports: HTTP 80, HTTPS 443; browsers flag plain HTTP as Not Secure", "TLS 1.3 handshake completes in one round-trip, reducing connection setup latency"],
  },
  "system-design:WebSockets vs HTTP Polling": {
    oneLine: "HTTP polling repeatedly asks 'anything new?' and waits for an answer; WebSockets open a persistent two-way channel so the server can push updates the instant they happen.",
    Diagram: systemDesignDiagrams["WebSockets vs HTTP Polling"],
    analogy: { title: "Calling to check vs. being texted", text: "Polling is calling every 5 minutes asking 'did my package arrive?' WebSockets is getting a text the moment the courier rings your bell." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Long-polling</strong> holds the request open until data arrives, reducing empty responses. <strong>Server-Sent Events</strong> push a one-way stream over HTTP. <strong>WebSockets</strong> upgrade the HTTP connection to a full-duplex channel — both sides can send at any time, with minimal framing overhead. Use WebSockets for chat, live dashboards, and collaborative editing where sub-second latency matters.</p><p style={{margin:0}}>Watch out: without a shared pub/sub layer (e.g., Redis), a WebSocket message published on one server node is never delivered to clients connected to other nodes — horizontal scaling requires sticky sessions or a broker. Intermediate proxies or NAT gateways also silently drop idle TCP connections.</p></div>,
    keyPoints: ["Polling wastes bandwidth on empty responses", "WebSockets: one handshake, persistent bidirectional channel", "SSE is simpler for server-to-client-only streams", "WebSocket horizontal scaling requires sticky sessions or a shared pub/sub broker", "Long-polling holds the request open until data arrives — fewer empty replies than polling"],
  },
  "system-design:REST vs GraphQL vs gRPC": {
    oneLine: "REST is simple and cacheable; GraphQL lets clients fetch exactly what they need; gRPC is binary, fast, and ideal for internal service-to-service calls.",
    Diagram: systemDesignDiagrams["REST vs GraphQL vs gRPC"],
    analogy: { title: "Menu vs. custom order vs. assembly line", text: "REST is a fixed menu. GraphQL lets you say exactly which toppings you want. gRPC is a factory line — no frills, maximum throughput." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>REST</strong>: resource-based URLs, HTTP verbs, JSON — universally understood and HTTP-cache-friendly. <strong>GraphQL</strong>: a single endpoint where the client describes exactly the data shape it needs — eliminates over- and under-fetching. <strong>gRPC</strong>: uses Protocol Buffers and HTTP/2 for typed, binary, streaming RPC — 5–10× smaller payloads than JSON, ideal for microservice meshes.</p><p style={{margin:0}}>Watch out: GraphQL without DataLoader batching causes N+1 query explosions — each list item triggers a separate resolver DB call. gRPC's HTTP/2 trailers are stripped or rejected by many Layer-7 load balancers, causing silent connection failures in production routing.</p></div>,
    keyPoints: ["REST: simple, cacheable, universally supported", "GraphQL: client-driven queries, one endpoint", "gRPC: binary, strongly typed, best for internal services", "GraphQL requires depth and complexity limits in production to prevent denial-of-service via crafted queries", "gRPC's .proto contract catches interface drift at build time rather than runtime"],
  },
  "system-design:Message Queues vs Event Streams": {
    oneLine: "A message queue delivers each message to one consumer and deletes it; an event stream persists messages so multiple consumers can replay history independently.",
    Diagram: systemDesignDiagrams["Message Queues vs Event Streams"],
    analogy: { title: "Ticket dispenser vs. a bulletin board", text: "A queue is a ticket dispenser — one person takes the ticket and it's gone. A stream is a bulletin board — every subscriber reads it at their own pace, nothing disappears." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Message queues</strong> (RabbitMQ, SQS) deliver each message to exactly one consumer and delete it on acknowledgement — great for task distribution. <strong>Event streams</strong> (Kafka, Kinesis) persist an ordered log; each consumer group tracks its own offset and can replay history. Use streams when multiple services need the same events, or when you need audit logs and replay.</p><p style={{margin:0}}>Watch out: if a Kafka consumer group falls behind and lag exceeds the retention window, events are deleted before processing — causing silent data loss. At-least-once delivery in both systems forces idempotent consumer design, adding complexity to every handler.</p></div>,
    keyPoints: ["Queues: one consumer, delete on ack", "Streams: many consumers, persistent, replayable", "Streams enable event sourcing and audit trails", "Order is guaranteed within a Kafka partition, not across the whole topic", "Kafka's immutable log doubles as an audit trail with zero additional infrastructure"],
  },
  "system-design:Pub/Sub Pattern": {
    oneLine: "Pub/Sub decouples producers from consumers — publishers send to a topic without knowing who's listening, and subscribers receive only the topics they care about.",
    Diagram: systemDesignDiagrams["Pub/Sub Pattern"],
    analogy: { title: "Like a radio station", text: "The station broadcasts on a frequency without knowing who's tuned in. Anyone with a receiver on that frequency gets the signal instantly — the station never needs to know who that is." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Pub/Sub is the backbone of event-driven architecture. Producers publish events to named topics; consumers subscribe to the topics they need. Adding a new consumer requires zero changes to the producer. The message broker (SNS, Pub/Sub, Redis Streams) handles fan-out, buffering, and delivery guarantees.</p><p style={{margin:0}}>Watch out: pub/sub is inherently fire-and-forget — the publisher cannot receive a synchronous response from a consumer. Achieving exactly-once semantics requires idempotent consumers and transactional producers, adding significant application complexity.</p></div>,
    keyPoints: ["Zero coupling between publisher and subscribers", "Add new consumers without touching the producer", "Broker handles fan-out and delivery guarantees", "Publishers know only the topic, not who (if anyone) is listening", "Exactly-once delivery requires idempotent consumers and transactional producers"],
  },
  "system-design:Kafka Architecture": {
    oneLine: "Kafka is a distributed commit log — producers append to partitioned topics, consumers read at their own pace, and messages are retained for days so any consumer can replay history.",
    Diagram: systemDesignDiagrams["Kafka Architecture"],
    analogy: { title: "Like a logbook with multiple readers", text: "Every event is written sequentially into a logbook. Multiple readers each have a bookmark — they read at their own pace and can go back to re-read any page at any time." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Kafka partitions topics across brokers for parallelism. Producers append to the partition determined by a key (or round-robin). Each <strong>consumer group</strong> gets a private cursor (offset) per partition — one consumer per partition, fully parallel. Increasing partitions scales throughput; increasing consumer groups adds independent subscribers. Retention (default 7 days) enables replay and recovery.</p><p style={{margin:0}}>Watch out: partition count is effectively immutable after creation — under-partitioning at design time creates a hard throughput ceiling that requires painful topic recreation to fix. With unclean.leader.election.enable=true, a broker with stale data can be elected leader, silently serving older offsets.</p></div>,
    keyPoints: ["Partitions enable parallel writes and reads", "Consumer groups each track independent offsets", "Retention makes replay and recovery possible", "Order is guaranteed within a partition, not across the whole topic", "Partition count cannot be reduced after creation — plan capacity up front"],
  },
  "system-design:Dead Letter Queues": {
    oneLine: "A Dead Letter Queue catches messages that fail processing repeatedly so they don't block the main queue — you can inspect and replay them later without losing the data.",
    Diagram: systemDesignDiagrams["Dead Letter Queues"],
    analogy: { title: "Like returned mail", text: "A letter that can't be delivered three times isn't thrown away — it's set aside in a 'return to sender' pile for the postmaster to inspect and re-route later." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>When a consumer fails to process a message after a configured number of retries, the broker moves it to the <strong>DLQ</strong>. The main queue stays unblocked — no poison message can halt all processing. DLQ messages are preserved with their original metadata (headers, timestamp, original queue) so you can diagnose root causes, fix the consumer, and replay them safely.</p><p style={{margin:0}}>Watch out: replaying a large DLQ backlog at full speed overwhelms the consumer or downstream database, replicating the original outage. Without alerting on DLQ depth, thousands of failed messages accumulate undetected while the main queue appears healthy.</p></div>,
    keyPoints: ["Isolates poison messages so main queue keeps flowing", "Preserves failed messages for inspection and replay", "Alert on DLQ depth — it signals a processing failure", "Triggered after a configured max-retry or max-delivery count is exceeded", "Replay from the DLQ at a throttled rate to avoid overwhelming the consumer"],
  },
  "system-design:API Gateway Pattern": {
    oneLine: "An API Gateway is the single front door for all clients — it handles routing, authentication, rate limiting, and protocol translation before requests reach any backend service.",
    Diagram: systemDesignDiagrams["API Gateway Pattern"],
    analogy: { title: "Like a hotel reception desk", text: "Guests don't wander backstage — they talk to reception. Reception handles identity checks, routes them to the right department, and enforces house rules." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The gateway centralises cross-cutting concerns: <strong>authentication</strong> (verify JWT/API key), <strong>rate limiting</strong> (per client), <strong>routing</strong> (path → service), <strong>SSL termination</strong>, and <strong>request/response transformation</strong>. Backend services become simpler because they assume requests are already validated. Popular choices: AWS API Gateway, Kong, Nginx, Envoy.</p><p style={{margin:0}}>Watch out: the gateway becomes a latency-adding hop in every request path — misconfigured timeouts or plugin chains can silently inflate p99 latency. Route rules and auth policies updated in the gateway can lag behind service deployments, causing 401s or 404s in production.</p></div>,
    keyPoints: ["Single entry point for all clients", "Centralises auth, rate limiting, and routing", "Backends stay simple — they trust the gateway", "The gateway itself must be HA — it is a single point of failure for all traffic", "Avoid pushing business logic into the gateway; keep it a thin routing and policy layer"],
  },
  "system-design:Service Mesh": {
    oneLine: "A service mesh injects a sidecar proxy into every pod so that retries, mTLS, tracing, and traffic management happen at the infrastructure layer — not in application code.",
    Diagram: systemDesignDiagrams["Service Mesh"],
    analogy: { title: "Like a dedicated security escort for every employee", text: "Instead of each employee learning security protocols, a trained escort accompanies every person. Policies change centrally — employees just do their jobs." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A service mesh (Istio, Linkerd) deploys a lightweight proxy sidecar next to each service instance. All inbound and outbound traffic flows through the sidecar, which enforces <strong>mTLS</strong> (mutual auth), circuit breaking, retries, and emits traces — without any code changes in the service. A central <strong>control plane</strong> pushes policy updates to all sidecars.</p><p style={{margin:0}}>Watch out: each sidecar proxy adds 1–2 ms per hop and consumes additional CPU and memory per pod. When the control plane (e.g., Istio Pilot) is unavailable, sidecars cannot refresh routing configuration, causing stale rules to persist and new deployments to fail traffic registration.</p></div>,
    keyPoints: ["Sidecars handle retries, mTLS, and tracing transparently", "No code changes needed in services", "Control plane pushes policy to all proxies centrally", "Each sidecar adds 1–2 ms of latency per hop at the infrastructure layer", "Sidecar injection must complete before a pod makes outbound calls or mTLS guarantees can be bypassed"],
  },
  "system-design:Circuit Breaker Pattern": {
    oneLine: "A circuit breaker wraps calls to a dependency and trips open when failures pile up — failing fast instead of queuing doomed requests until the whole system backs up.",
    Diagram: systemDesignDiagrams["Circuit Breaker Pattern"],
    analogy: { title: "Like the breaker in your home", text: "When a circuit overloads, the breaker trips and cuts power rather than letting wiring melt. After a moment you flip it back to test — if all is well, power resumes." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Three states: <strong>Closed</strong> (calls flow normally, failures counted), <strong>Open</strong> (calls fail instantly without hitting the dependency), <strong>Half-open</strong> (probe calls test recovery). Failing fast frees threads and gives the struggling service room to recover instead of being hammered. Libraries: Resilience4j, Polly, Hystrix.</p><p style={{margin:0}}>Watch out: each service instance tracks failures independently in memory, so the circuit never trips cluster-wide unless state is centralised (e.g., in Redis). Thresholds calibrated on normal traffic become hair-triggers during spikes, causing false trips that take down a healthy service at peak load.</p></div>,
    keyPoints: ["Closed → Open → Half-open → Closed", "Open state prevents cascading failure", "Give struggling services breathing room to recover", "Distributed deployments need shared state for accurate cluster-wide trip logic", "Half-open probe calls must be throttled to avoid a thundering herd on the recovering dependency"],
  },
  "system-design:Saga Pattern": {
    oneLine: "A saga breaks a distributed transaction into a sequence of local transactions, each publishing an event — and if any step fails, compensating transactions undo the previous steps.",
    Diagram: systemDesignDiagrams["Saga Pattern"],
    analogy: { title: "Like a multi-stop flight booking", text: "Booking flight + hotel + car one step at a time — if the car hire fails, the hotel is cancelled and the flight refunded. Each cancellation is its own transaction." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Sagas avoid distributed locks. <strong>Choreography</strong>: each service listens for an event and emits the next, with each service responsible for its own compensation. <strong>Orchestration</strong>: a central saga orchestrator commands each step and handles compensation. Use sagas when a business operation spans multiple services that each have their own database.</p><p style={{margin:0}}>Watch out: compensating transactions must be idempotent — a choreography saga can re-deliver an event after a network timeout, triggering duplicate charges or double inventory deductions if handlers are not idempotent. Each forward step needs a tested, maintained undo path.</p></div>,
    keyPoints: ["Chains local transactions instead of distributed ones", "Compensation transactions undo on failure", "Choreography vs orchestration: decentralised vs coordinated", "Every forward step requires a tested, idempotent compensating action", "Temporary inconsistency between steps forces consumers to handle intermediate states explicitly"],
  },
  "system-design:Fault Tolerance & Redundancy": {
    oneLine: "Fault tolerance means the system keeps working when components fail; redundancy achieves that by running multiple copies so no single failure takes everything down.",
    Diagram: systemDesignDiagrams["Fault Tolerance & Redundancy"],
    analogy: { title: "Like a spare tyre", text: "You don't drive on the spare — it sits in the boot until the main tyre fails. When it does, you're not stranded: redundancy buys you time to get back on the road." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Redundancy eliminates single points of failure by duplicating critical components: servers, power supplies, network links, databases. <strong>Active–active</strong> runs all replicas simultaneously and shares the load. <strong>Active–passive</strong> keeps standby warm and promotes it on failure. Combined with health checks and automated failover, redundancy turns hardware failures into brief blips.</p><p style={{margin:0}}>Watch out: if replication lag is not monitored, a passive replica that takes over may serve data that is seconds or minutes behind, causing silent data loss at the exact moment fault tolerance is supposed to protect you. Redundancy without chaos testing gives false confidence.</p></div>,
    keyPoints: ["Eliminate every single point of failure", "Active–active shares load; active–passive keeps a warm spare", "Automate failover so humans don't need to respond at 3 am", "N+1 redundancy provisions one spare beyond minimum load capacity", "Geographic redundancy across AZs provides resilience against entire data center outages"],
  },
  "system-design:Failover Strategies": {
    oneLine: "Failover automatically switches traffic from a failed component to a healthy standby — the key variables are detection time, promotion time, and whether any data is lost.",
    Diagram: systemDesignDiagrams["Failover Strategies"],
    analogy: { title: "Like a deputy who takes charge instantly", text: "When the mayor is incapacitated, the deputy steps in without a vote — city business continues with minimal interruption." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Two key metrics: <strong>RTO</strong> (Recovery Time Objective) — how long the system can be down, and <strong>RPO</strong> (Recovery Point Objective) — how much data loss is acceptable. Synchronous replication reduces RPO to zero but adds write latency. DNS failover is simple but slow (TTL delays). Cloud load balancers with health checks can fail over in under 30 seconds.</p><p style={{margin:0}}>Watch out: without proper fencing, both primary and standby can simultaneously believe they are active (split-brain), accepting conflicting writes. A stale standby promoted during failover silently loses committed transactions that had not yet replicated.</p></div>,
    keyPoints: ["RTO: max acceptable downtime", "RPO: max acceptable data loss", "Automated health-check failover beats manual intervention every time", "Synchronous replication achieves near-zero RPO but adds write-path latency on every commit", "Heartbeat-based failure detection must use fencing or quorum to prevent split-brain promotion"],
  },
  "system-design:Chaos Engineering": {
    oneLine: "Chaos engineering deliberately injects failures into a live system to discover weaknesses before they manifest as real outages — you break it on your terms, not a customer's.",
    Diagram: systemDesignDiagrams["Chaos Engineering"],
    analogy: { title: "Like fire drills", text: "Instead of hoping you never have a fire, you schedule a drill. You find the exit-sign that's burned out and the door that's stuck — before the real emergency." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The discipline: define a steady-state hypothesis (e.g. p99 latency &lt; 200 ms), inject a failure (kill a node, saturate a network link, corrupt a dependency), and verify the system stays within the hypothesis. Netflix's Chaos Monkey pioneered this. Start in non-production, build confidence, then run in production during low-traffic hours.</p><p style={{margin:0}}>Watch out: always configure an automated halt condition — if no kill switch is set, an experiment can continue after the system breaches SLO thresholds, turning a controlled test into a prolonged production incident. Without a quantified steady-state metric, results are inconclusive.</p></div>,
    keyPoints: ["Find weaknesses on your terms, not during an incident", "Define steady-state hypothesis before each experiment", "Start small in staging; graduate to production", "Always configure a kill switch to abort the experiment if SLOs are breached", "Unbounded blast radius — always scope experiments to avoid hitting shared databases or brokers"],
  },
  "system-design:SLA / SLO / SLI": {
    oneLine: "SLIs measure what's actually happening, SLOs are internal targets you set for those measurements, and SLAs are the contractual promises you make to customers — violations have consequences.",
    Diagram: systemDesignDiagrams["SLA / SLO / SLI"],
    analogy: { title: "Speedometer, speed limit, and a contract", text: "The speedometer is your SLI. Your personal target of 65 mph is your SLO. The legal speed limit — with penalties — is the SLA." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>SLI</strong>: a concrete metric (success rate, p99 latency, error rate). <strong>SLO</strong>: the target value for an SLI that your team commits to internally (e.g. 99.9% success rate). <strong>SLA</strong>: a customer-facing contract backed by the SLO, with financial penalties for breaches. Set your SLO tighter than the SLA to have an error budget — room to absorb incidents before a contract violation.</p><p style={{margin:0}}>Watch out: measuring SLI only at the load balancer but excluding downstream dependency timeouts makes SLI look healthy while users experience cascading failures. Using a 30-day rolling window can mask a two-hour outage that consumed the entire monthly budget in one incident.</p></div>,
    keyPoints: ["SLI: what you measure, SLO: what you aim for, SLA: what you promise", "Error budget = 1 − SLO — spend it on features, not outages", "SLO should always be stricter than the SLA", "SLO-driven alerting focuses on user-impacting burn rates, reducing noisy threshold alerts", "SLAs set looser than SLOs give engineering a buffer before contract penalties trigger"],
  },
  "system-design:Consistent Hashing": {
    oneLine: "Consistent hashing places both keys and nodes on a virtual ring so that when a node is added or removed, only a fraction of keys need to move — not everything.",
    Diagram: systemDesignDiagrams["Consistent Hashing"],
    analogy: { title: "Like seats at a round table", text: "Each guest (node) claims the seats to their left. Add a new guest — only nearby seats shuffle; everyone else stays put." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Traditional modular hashing moves almost all keys when the cluster size changes. Consistent hashing maps both keys and nodes to a unit ring. A key is owned by the first node clockwise from its hash. Add a node: only the keys between it and its predecessor move. Remove a node: only its keys redistribute. Virtual nodes (vnodes) smooth out uneven distributions.</p><p style={{margin:0}}>Watch out: with fewer than 100–150 vnodes per physical node, the ring remains uneven and one node can hold 2–3× the data of another. When a node fails, its entire key range shifts to one clockwise neighbor, potentially doubling that node's load and triggering a cascade if the cluster is already near capacity.</p></div>,
    keyPoints: ["Adding/removing a node moves only O(K/N) keys", "Virtual nodes spread load evenly across real nodes", "Used in Cassandra, DynamoDB, and many CDNs", "A node failure shifts its key range to one clockwise neighbor — size vnodes generously to absorb this", "No central routing table needed — any client computes key ownership independently from the ring"],
  },
  "system-design:Consensus (Raft Algorithm)": {
    oneLine: "Raft is the algorithm that lets a cluster of nodes agree on a single sequence of values even when some nodes crash — by electing a leader who proposes all changes.",
    Diagram: systemDesignDiagrams["Consensus (Raft Algorithm)"],
    analogy: { title: "Like a committee with a chairperson", text: "The chair proposes every motion. A motion only passes when the majority agrees. If the chair is absent, the committee elects a new one before any more business is done." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Raft divides consensus into three sub-problems: <strong>leader election</strong> (the node with the most up-to-date log wins a majority vote), <strong>log replication</strong> (leader appends entries and replicates to followers before committing), and <strong>safety</strong> (a committed entry is guaranteed to appear in all future leaders' logs). Used in etcd, CockroachDB, and Consul.</p><p style={{margin:0}}>Watch out: all writes are serialized through a single leader, so a hot-spot workload or a leader on degraded hardware saturates its disk or network and stalls the entire cluster write path. Quorum writes mean latency is bounded by the slowest responding majority member.</p></div>,
    keyPoints: ["One leader per term — all writes go through it", "Commit requires acknowledgement from a majority", "Leader election restarts automatically when leader is lost", "A cluster of 2f+1 nodes tolerates f simultaneous failures", "The single-leader model caps write throughput to one node's capacity"],
  },
  "system-design:Distributed Transactions (2PC)": {
    oneLine: "Two-phase commit coordinates an atomic write across multiple databases — all participants vote to commit, and only if every one agrees does the coordinator make it permanent.",
    Diagram: systemDesignDiagrams["Distributed Transactions (2PC)"],
    analogy: { title: "Like asking every guest if they can attend a meeting", text: "You send a 'can you make Thursday?' email. Only if every single person replies 'yes' do you send the calendar invite. One 'no' and you reschedule." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>In <strong>Phase 1 (Prepare)</strong>, the coordinator asks each participant to lock resources and vote yes/no. In <strong>Phase 2 (Commit/Abort)</strong>, if all voted yes the coordinator broadcasts commit; otherwise it broadcasts abort. 2PC is blocking — if the coordinator crashes after prepare, participants are stuck holding locks. Consider Saga pattern or distributed databases (CockroachDB) for production-grade solutions.</p><p style={{margin:0}}>Watch out: a network partition after some participants receive "commit" and others do not leaves the system in a split-brain state — part of the data committed, part not. A single slow participant blocks the entire transaction because the coordinator must wait for all votes before proceeding.</p></div>,
    keyPoints: ["All participants must vote yes or the transaction aborts", "Coordinator crash during phase 2 can leave participants stuck", "Saga pattern or distributed DBs are often better in practice", "2PC holds locks across all participants for both phases, limiting throughput under high concurrency", "XA transaction recovery after a coordinator crash requires manual DBA intervention"],
  },
  "system-design:Vector Clocks": {
    oneLine: "Vector clocks track causality in distributed systems by giving each node its own counter — comparing two vectors reveals whether one event happened before another or if they're concurrent.",
    Diagram: systemDesignDiagrams["Vector Clocks"],
    analogy: { title: "Like a shared to-do list with initials", text: "Each person writes their initials next to changes they make. You can tell whose change came from whose version — and when two people changed the same item 'at the same time', both sets of initials are there." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Each node maintains a vector of counters — one per node. On a local event, increment your own counter. On receiving a message, merge by taking the max of each position and then increment your counter. Two events are causally related if one vector dominates the other. If neither dominates, the events are <strong>concurrent</strong> and may conflict — your application must resolve.</p><p style={{margin:0}}>Watch out: in systems where every client or ephemeral worker gets its own vector entry, vectors grow unboundedly — inflating payload size and making comparison O(n) per operation. If a restarted node reuses its old ID without resetting its counter, its events appear causally prior to newer events from other nodes.</p></div>,
    keyPoints: ["Each node has its own counter in the vector", "One vector dominates another = causal relationship", "Incomparable vectors = concurrent, possibly conflicting updates", "Vector size scales linearly with the number of unique writers — unbounded node IDs cause clock explosion", "Conflict resolution logic must be implemented at the application layer; vector clocks only detect conflicts"],
  },
  "system-design:Logging vs Metrics vs Tracing": {
    oneLine: "Logs tell you what happened in words, metrics show trends as numbers, and traces follow a request's path through every service — together they form complete observability.",
    Diagram: systemDesignDiagrams["Logging vs Metrics vs Tracing"],
    analogy: { title: "Security footage vs. door counter vs. GPS tracker", text: "Logs are the CCTV footage of what happened. Metrics are the people-counter above the door. Traces are GPS tracking each visitor's path through the building." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Logs</strong>: timestamped, structured text events — great for post-incident investigation. <strong>Metrics</strong>: numeric time-series (counters, gauges, histograms) — cheap to aggregate, ideal for dashboards and alerts. <strong>Traces</strong>: distributed spans linked by a trace ID — show latency and errors across service boundaries. The ELK stack, Prometheus, and Jaeger/Tempo are the common implementations.</p><p style={{margin:0}}>Watch out: a single service failing to forward W3C TraceContext headers breaks the trace at that hop, making spans appear as disconnected orphans. Storing only average latency in metrics masks tail-latency problems — p99 can be 10× the mean and an SLO breach goes undetected.</p></div>,
    keyPoints: ["Metrics detect problems, traces locate them, logs explain them", "All three are needed — none fully replaces the others", "Correlate via a shared trace ID for fast incident response", "Never expose high-cardinality labels (e.g., user ID) as metric tags — it explodes time-series cardinality", "Sampling in tracing means rare error paths may never be captured — tune sampling carefully"],
  },
  "system-design:The Three Pillars": {
    oneLine: "Logs, metrics, and traces are the three pillars of observability — together they let you ask any question about a system's behaviour without deploying new code to answer it.",
    Diagram: systemDesignDiagrams["The Three Pillars"],
    analogy: { title: "Diagnosis by symptoms, vitals, and X-ray", text: "A doctor uses verbal symptoms (logs), numerical vitals (metrics), and imaging (traces) together — no single source gives the complete picture." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Observability is the ability to infer a system's internal state from its external outputs. The three pillars provide complementary views: metrics catch regressions early (alert on p99 spike), traces pinpoint where latency accumulates (span waterfall), and logs give the full narrative (error message, stack trace, request context). A correlation ID ties all three to a single user request.</p><p style={{margin:0}}>Watch out: all three pillars depend on instrumentation in the code — inconsistent trace context propagation across services creates orphan spans and gaps in coverage. Aggressive head-based trace sampling discards the rare slow or error requests that matter most for debugging.</p></div>,
    keyPoints: ["Metrics alert, traces locate, logs explain", "Shared trace/correlation ID links all three signals", "True observability: answer new questions without new code", "OpenTelemetry auto-instrumentation retrofits observability without rewriting business logic", "All three pillars depend on instrumentation — consistent propagation across every service is mandatory"],
  },
  "system-design:Alerting Pipelines": {
    oneLine: "An alerting pipeline continuously evaluates metrics against rules, deduplicates noise, groups related alerts, and routes them to the right on-call engineer — fast.",
    Diagram: systemDesignDiagrams["Alerting Pipelines"],
    analogy: { title: "Like a newsroom editor", text: "Dozens of reporters file stories. The editor deduplicates duplicates, groups related stories into one page, and routes breaking news to the right section — one coherent paper, not chaos." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Prometheus AlertManager is the reference implementation: alerting rules fire when a PromQL expression crosses a threshold, alerts are grouped by labels, deduplicated, and silenced during maintenance windows. Routing rules send critical alerts via PagerDuty and warnings via Slack. <strong>Alert fatigue</strong> is the main failure mode — be ruthless about signal quality over volume.</p><p style={{margin:0}}>Watch out: a silenced alert forgotten after an incident leaves a production degradation undetected for days. A team renaming their PagerDuty service or Slack channel without updating routing rules causes critical pages to be silently dropped instead of delivered.</p></div>,
    keyPoints: ["Rules evaluate continuously against metric time-series", "Dedup and grouping prevent alert storms", "Route by severity: critical → pager, warning → chat", "Escalation policies page a backup if the first responder doesn't acknowledge", "Alert fatigue is the main failure mode — prioritise signal quality over alert volume"],
  },
  "system-design:OAuth 2.0 / JWT Flow": {
    oneLine: "OAuth 2.0 lets a user grant a third-party app access to their data without sharing their password — the authorization server issues tokens that the app uses to call APIs.",
    Diagram: systemDesignDiagrams["OAuth 2.0 / JWT Flow"],
    analogy: { title: "Like a valet key", text: "You hand the valet a key that opens the car door but not the glovebox or boot. The parking service gets exactly the access it needs — no more." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>OAuth 2.0 defines grant types. The most common for web apps is <strong>Authorization Code + PKCE</strong>: user logs in at the auth server, gets a code, the app exchanges it for an access token (and optionally a refresh token). <strong>JWTs</strong> encode claims (user ID, scopes, expiry) in a signed payload — APIs verify the signature without calling the auth server on every request. Refresh tokens allow long sessions without re-login.</p><p style={{margin:0}}>Watch out: JWTs remain valid until expiry and cannot be instantly revoked without a blocklist, negating the stateless benefit. If the server accepts multiple JWT algorithms, an attacker can swap the header to "none" or "HS256" with the public key as the secret — always pin the accepted algorithm explicitly.</p></div>,
    keyPoints: ["User authorises the app, never shares their password", "JWT: self-contained signed token, no auth-server roundtrip on each API call", "Short-lived access tokens + refresh tokens balance security and UX", "JWTs cannot be instantly revoked — use short expiry windows and a blocklist for sensitive operations", "JWT payload is encoded but not encrypted — never put secrets or sensitive PII in claims"],
  },
  "system-design:Rate Limiting Patterns": {
    oneLine: "Token bucket, leaky bucket, and sliding window are the three dominant algorithms for throttling requests — each makes a different trade-off between burstiness and smoothness.",
    Diagram: systemDesignDiagrams["Rate Limiting Patterns"],
    analogy: { title: "Bucket with holes, bucket with tokens, stopwatch", text: "Water poured in drains at a fixed rate (leaky). Tokens drop in and you spend them in a burst if you saved up (token). A stopwatch resets every minute and counts your requests (sliding)." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Token bucket</strong>: tokens accumulate up to a max capacity; each request spends one. Allows controlled bursts. <strong>Leaky bucket</strong>: requests enter a queue that drains at a fixed rate; bursts are absorbed and smoothed. <strong>Sliding window</strong>: counts requests in the last N seconds, updated continuously — no edge spikes at window boundaries.</p><p style={{margin:0}}>Watch out: fixed window implementations allow a client to send the full quota at the end of one window and immediately again at the start of the next, effectively doubling throughput at every boundary. When the centralized Redis store becomes unavailable, many implementations fail open and stop enforcing limits entirely.</p></div>,
    keyPoints: ["Token bucket: best when clients need short bursts", "Leaky bucket: best for smooth downstream rate", "Sliding window: most precise, slightly more memory per client", "Fixed windows allow 2× burst at window boundaries — use sliding window to eliminate edge spikes", "Distributed rate limiting requires a shared low-latency store; a Redis outage can silently disable all limits"],
  },
  "system-design:Zero Trust Architecture": {
    oneLine: "Zero Trust means no request is trusted by default — every access is verified, least-privilege is enforced, and traffic is encrypted even inside the network perimeter.",
    Diagram: systemDesignDiagrams["Zero Trust Architecture"],
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
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; const f = "var(--font-body,system-ui)"; const indexes = [
        { name:"Hash", use:"equality only", icon:"=", detail:"O(1) lookup\nno range support", hi:false },
        { name:"GIN", use:"jsonb / arrays / FTS", icon:"∈", detail:"posting list\nper element", hi:true },
        { name:"GiST", use:"geo / ranges / NN", icon:"⊂", detail:"nearest-neighbour\n& range overlap", hi:false },
        { name:"BRIN", use:"huge ordered tables", icon:"↕", detail:"min/max per\nblock range", hi:false },
      ]; return (
      <DiagFrame vb="0 0 460 210" caption="Each index trades B-tree generality for faster performance on a specific access pattern. GIN is the go-to for jsonb and full-text search.">
        {indexes.map(({name,use,icon,detail,hi},i)=>(
          <g key={i}>
            <rect x={10+i*112} y={20} width={100} height={120} rx={10} fill={hi?h.soft:"var(--card)"} stroke={hi?h.base:s} strokeWidth="1.5"/>
            {/* Big icon */}
            <text x={60+i*112} y={55} textAnchor="middle" fontSize="28" fill={hi?h.ink:s} fontFamily={f}>{icon}</text>
            {/* Name */}
            <text x={60+i*112} y={74} textAnchor="middle" fontSize="11" fontWeight="700" fill={hi?"var(--ink)":"var(--ink)"} fontFamily={f}>{name}</text>
            {/* Use */}
            <text x={60+i*112} y={87} textAnchor="middle" fontSize="8.5" fill={hi?h.ink:s} fontFamily={f}>{use}</text>
            {/* Detail lines */}
            {detail.split("\n").map((line,j)=>(
              <text key={j} x={60+i*112} y={104+j*13} textAnchor="middle" fontSize="8" fill={hi?h.ink:s} fontFamily={f} opacity="0.85">{line}</text>
            ))}
          </g>
        ))}
        {/* Query type row */}
        <text x={230} y={163} textAnchor="middle" fontSize="9" fill={s} fontFamily={f}>WHERE x = ?  ·  WHERE x @&gt; ?  ·  WHERE x &amp;&amp; range  ·  WHERE ts &gt; ?</text>
        <text x={230} y={180} textAnchor="middle" fontSize="9.5" fill={s} fontFamily={f}>all integrate with the query planner — no hint needed</text>
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
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; const f = "var(--font-body,system-ui)"; const levels = [
        { name:"Read Committed", anomaly:"non-repeatable read", color:"var(--card)", stroke:s, text:"var(--ink)" },
        { name:"Repeatable Read", anomaly:"phantom read", color:"var(--card)", stroke:s, text:"var(--ink)" },
        { name:"Serializable (SSI)", anomaly:"write skew", color:h.soft, stroke:h.base, text:h.ink },
      ]; return (
      <DiagFrame vb="0 0 460 210" caption="Each level eliminates one more anomaly. Higher isolation costs more contention. Postgres default is Read Committed.">
        {/* Staircase bars — wider = stronger */}
        {levels.map(({name,anomaly,color,stroke,text},i)=>{
          const w = 200+i*70; const x = (460-w)/2; const y = 20+i*52;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={38} rx={8} fill={color} stroke={stroke} strokeWidth="1.5"/>
              <text x={x+w/2} y={y+14} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={text} fontFamily={f}>{name}</text>
              <text x={x+w/2} y={y+28} textAnchor="middle" fontSize="9" fill={text} fontFamily={f} opacity="0.85">prevents: dirty read{i>0?" + non-repeatable":""}{i>1?" + phantom + write-skew":""}</text>
            </g>
          );
        })}
        {/* Arrows between levels */}
        {[0,1].map(i=>(
          <g key={i}>
            <line x1={230} y1={58+i*52} x2={230} y2={64+i*52} stroke={s} strokeWidth="1.5" markerEnd="url(#arrowhead)"/>
            <text x={245} y={62+i*52} fontSize="9" fill={s} fontFamily={f}>+ more safety</text>
          </g>
        ))}
        {/* Side labels */}
        <text x={14} y={39} fontSize="9" fill={s} fontFamily={f}>weak</text>
        <text x={14} y={143} fontSize="9" fill={h.ink} fontFamily={f}>strong</text>
        <line x1={20} y1={44} x2={20} y2={148} stroke={s} strokeWidth="1" strokeDasharray="3 2"/>
        <text x={230} y={192} textAnchor="middle" fontSize="9.5" fill={s} fontFamily={f}>Postgres default: Read Committed · Serializable uses SSI (no locks)</text>
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
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; const f = "var(--font-body,system-ui)"; return (
      <DiagFrame vb="0 0 460 205" caption="Each function shapes how neurons fire: ReLU is a one-way gate, Sigmoid squashes to a probability, GELU is a smooth probabilistic gate.">
        {/* — ReLU graph — */}
        <text x={75} y={22} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily={f}>ReLU</text>
        <text x={75} y={34} textAnchor="middle" fontSize="9" fill={s} fontFamily={f}>max(0, x)</text>
        <line x1={10} y1={110} x2={142} y2={110} stroke={s} strokeWidth="1"/>
        <line x1={75} y1={42} x2={75} y2={112} stroke={s} strokeWidth="1"/>
        <polyline points="10,110 75,110 141,44" fill="none" stroke={h.base} strokeWidth="2.5" strokeLinejoin="round"/>
        <text x={10} y={109} fontSize="8" fill={s} fontFamily={f}>−</text>
        <text x={136} y={109} fontSize="8" fill={s} fontFamily={f}>+</text>
        {/* — Sigmoid graph — */}
        <text x={228} y={22} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)" fontFamily={f}>Sigmoid</text>
        <text x={228} y={34} textAnchor="middle" fontSize="9" fill={s} fontFamily={f}>1 /(1 + e⁻ˣ)</text>
        <line x1={163} y1={110} x2={295} y2={110} stroke={s} strokeWidth="1"/>
        <line x1={228} y1={42} x2={228} y2={115} stroke={s} strokeWidth="1"/>
        <polyline points="163,107 185,102 207,91 228,75 250,59 272,48 294,43" fill="none" stroke={s} strokeWidth="2" strokeLinejoin="round"/>
        <text x={300} y={46} fontSize="8" fill={s} fontFamily={f}>1</text>
        <text x={300} y={113} fontSize="8" fill={s} fontFamily={f}>0</text>
        {/* — GELU graph — */}
        <text x={381} y={22} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily={f}>GELU</text>
        <text x={381} y={34} textAnchor="middle" fontSize="9" fill={s} fontFamily={f}>smooth ReLU</text>
        <line x1={316} y1={110} x2={448} y2={110} stroke={s} strokeWidth="1"/>
        <line x1={381} y1={42} x2={381} y2={112} stroke={s} strokeWidth="1"/>
        <polyline points="316,110 337,111 359,114 370,113 381,110 403,92 425,67 447,44" fill="none" stroke={h.base} strokeWidth="2.5" strokeLinejoin="round"/>
        <text x={316} y={109} fontSize="8" fill={s} fontFamily={f}>−</text>
        <text x={442} y={109} fontSize="8" fill={s} fontFamily={f}>+</text>
        {/* — Dividers — */}
        <line x1={153} y1={18} x2={153} y2={128} stroke={s} strokeWidth="0.5" strokeDasharray="4 3"/>
        <line x1={308} y1={18} x2={308} y2={128} stroke={s} strokeWidth="0.5" strokeDasharray="4 3"/>
        <text x={230} y={148} textAnchor="middle" fontSize="9.5" fill={s} fontFamily={f}>transformers use GELU; binary classifiers use Sigmoid; multi-class output uses Softmax</text>
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
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; const f = "var(--font-body,system-ui)"; return (
      <DiagFrame vb="0 0 430 278" caption="Each sub-layer is wrapped in a residual: output = x + sublayer(LayerNorm(x)). Skip paths allow gradients to flow through hundreds of layers.">
        {/* Input */}
        <text x={220} y={16} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily={f}>x (input)</text>
        <line x1={220} y1={19} x2={220} y2={28} stroke={h.base} strokeWidth="2"/>
        {/* LayerNorm 1 */}
        <DiagBox x={120} y={28} w={200} h={34} label="Layer Norm" fill="var(--card)" stroke={s} text="var(--ink)" />
        <line x1={220} y1={62} x2={220} y2={70} stroke={h.base} strokeWidth="2"/>
        {/* MHA */}
        <DiagBox x={120} y={70} w={200} h={34} label="Multi-Head Attention" fill={h.soft} stroke={h.base} text={h.ink} />
        <line x1={220} y1={104} x2={220} y2={118} stroke={h.base} strokeWidth="2"/>
        {/* Add node 1 */}
        <circle cx={220} cy={126} r={11} fill={h.soft} stroke={h.base} strokeWidth="1.5"/>
        <text x={220} y={130} textAnchor="middle" fontSize="13" fontWeight="700" fill={h.ink} fontFamily={f}>+</text>
        {/* Skip path 1: from before LayerNorm1 to Add1 */}
        <path d="M 120 45 L 58 45 L 58 126 L 209 126" fill="none" stroke={s} strokeWidth="1.5" strokeDasharray="5 3"/>
        <text x={42} y={88} textAnchor="middle" fontSize="9" fill={s} fontFamily={f} transform="rotate(-90 42 88)">skip</text>
        {/* Arrow from Add1 down */}
        <line x1={220} y1={137} x2={220} y2={148} stroke={h.base} strokeWidth="2"/>
        {/* LayerNorm 2 */}
        <DiagBox x={120} y={148} w={200} h={34} label="Layer Norm" fill="var(--card)" stroke={s} text="var(--ink)" />
        <line x1={220} y1={182} x2={220} y2={190} stroke={h.base} strokeWidth="2"/>
        {/* FFN */}
        <DiagBox x={120} y={190} w={200} h={34} label="Feed-Forward Network" fill={h.soft} stroke={h.base} text={h.ink} />
        <line x1={220} y1={224} x2={220} y2={238} stroke={h.base} strokeWidth="2"/>
        {/* Add node 2 */}
        <circle cx={220} cy={246} r={11} fill={h.soft} stroke={h.base} strokeWidth="1.5"/>
        <text x={220} y={250} textAnchor="middle" fontSize="13" fontWeight="700" fill={h.ink} fontFamily={f}>+</text>
        {/* Skip path 2: from after Add1 to Add2 */}
        <path d="M 120 165 L 58 165 L 58 246 L 209 246" fill="none" stroke={s} strokeWidth="1.5" strokeDasharray="5 3"/>
        <text x={42} y={208} textAnchor="middle" fontSize="9" fill={s} fontFamily={f} transform="rotate(-90 42 208)">skip</text>
        {/* Output */}
        <line x1={220} y1={257} x2={220} y2={266} stroke={h.base} strokeWidth="2"/>
        <text x={220} y={275} textAnchor="middle" fontSize="11" fontWeight="700" fill={h.ink} fontFamily={f}>x′ (output)</text>
      </DiagFrame>
    ); },
    analogy: { title: "Like a revision loop for an essay", text: "First you check which parts reference each other (attention). Then you refine the phrasing independently (FFN). After each step you compare to the original draft (residual) to make sure you haven't drifted." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Residual (skip) connections add the block's input directly to its output — gradients flow cleanly through hundreds of layers. <strong>Layer norm</strong> normalises activations before each sub-layer for training stability. The <strong>FFN</strong> (two linear layers + activation) applies per-token transformations that expand the dimension 4× then compress back — this is where most parameters live.</p><p style={{margin:0}}>The feed-forward network briefly expands each token to ~4× its size then shrinks it back — most of a model's raw parameter count lives in that expansion.</p></div>,
    keyPoints: ["MHA + FFN with residual connections and layer norm", "Residuals allow gradients to flow through hundreds of layers", "FFN holds ~2/3 of the parameters in a transformer block", "Layer normalization keeps activations in a stable range, making training reliable", "The FFN processes each token independently after attention mixes information across tokens"],
  },
  "ai-llm:Stacking Layers (The Full Model)": {
    oneLine: "A full LLM is dozens of identical transformer blocks stacked in sequence — the same block architecture repeated N times with independent weights.",
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; const f = "var(--font-body,system-ui)"; return (
      <DiagFrame vb="0 0 460 240" caption="Each block refines the representations passed from below. Early blocks learn syntax; late blocks learn task reasoning.">
        {/* Token input */}
        <text x={230} y={15} textAnchor="middle" fontSize="10" fill={s} fontFamily={f}>Tokens: "The cat sat…"</text>
        <DiagBox x={100} y={20} w={260} h={34} label="Embed + Positional Encoding" fill="var(--card)" stroke={s} text="var(--ink)" />
        <DiagArrow x1={230} y1={54} x2={230} y2={64} color={h.base} />
        {/* Block stack */}
        {[
          {lbl:"Block 1",sub:"syntax, local patterns", y:64},
          {lbl:"Block 2",sub:"word relationships", y:108},
          {lbl:"  ·  ·  ·",sub:"", y:152},
          {lbl:"Block N",sub:"reasoning, task logic", y:182},
        ].map(({lbl,sub,y},i)=>(
          <g key={i}>
            <rect x={80} y={y} width={300} height={34} rx={10} fill={i===0||i===3?h.soft:"var(--card)"} stroke={i===0||i===3?h.base:s} strokeWidth={i===0||i===3?2:1}/>
            <text x={230} y={y+14} textAnchor="middle" fontSize="11" fontWeight="700" fill={i===0||i===3?h.ink:"var(--ink)"} fontFamily={f}>{lbl}</text>
            {sub&&<text x={230} y={y+26} textAnchor="middle" fontSize="8.5" fill={i===0||i===3?h.ink:s} fontFamily={f}>{sub}</text>}
            {i<3&&<DiagArrow x1={230} y1={y+34} x2={230} y2={y+42} color={i===2?s:h.base} dashed={i===2} />}
          </g>
        ))}
        <DiagArrow x1={230} y1={216} x2={230} y2={224} color={h.base} />
        <DiagBox x={100} y={224} w={260} h={10} label="Output Projection → logits over vocabulary" fill="var(--card)" stroke={s} text="var(--ink)" rx={6} />
        <text x={230} y={246} textAnchor="middle" fontSize="9.5" fill={s} fontFamily={f}>GPT-3: 96 blocks × 96 heads × 12,288 dims = 175 B params</text>
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
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; const f = "var(--font-body,system-ui)"; const tiers = [
        { label:"In-context", sub:"current window", w:120, fill:h.soft, stroke:h.base, text:h.ink },
        { label:"Vector store", sub:"semantic search", w:200, fill:"var(--card)", stroke:s, text:"var(--ink)" },
        { label:"KV store", sub:"fast key lookup", w:300, fill:"var(--card)", stroke:s, text:"var(--ink)" },
        { label:"SQL / DB", sub:"structured facts", w:400, fill:"var(--card)", stroke:s, text:"var(--ink)" },
      ]; return (
      <DiagFrame vb="0 0 460 230" caption="Higher tier = faster access but limited size. Lower tier = vast capacity but slower retrieval. Good agents manage all four.">
        {/* Speed label left */}
        <text x={16} y={30} fontSize="9" fill={s} fontFamily={f}>⚡ fast</text>
        <text x={16} y={180} fontSize="9" fill={s} fontFamily={f}>🐢 slow</text>
        <line x1={24} y1={32} x2={24} y2={178} stroke={s} strokeWidth="1" strokeDasharray="3 2"/>
        {/* Capacity label right */}
        <text x={430} y={30} textAnchor="end" fontSize="9" fill={s} fontFamily={f}>small</text>
        <text x={430} y={180} textAnchor="end" fontSize="9" fill={s} fontFamily={f}>huge</text>
        <line x1={436} y1={32} x2={436} y2={178} stroke={s} strokeWidth="1" strokeDasharray="3 2"/>
        {/* Pyramid tiers */}
        {tiers.map(({label,sub,w,fill,stroke,text},i)=>{
          const x = (460-w)/2; const y = 18+i*42;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={36} rx={8} fill={fill} stroke={stroke} strokeWidth="1.5"/>
              <text x={x+w/2} y={y+14} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={text} fontFamily={f}>{label}</text>
              <text x={x+w/2} y={y+26} textAnchor="middle" fontSize="9" fill={text} fontFamily={f} opacity="0.8">{sub}</text>
            </g>
          );
        })}
        <text x={230} y={207} textAnchor="middle" fontSize="9.5" fill={s} fontFamily={f}>pin goals in-context; recall past runs from vector store; exact state from KV</text>
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
    Diagram: ({ h }: { h: Hue }) => { const s = "var(--ink-3)"; const f = "var(--font-body,system-ui)"; return (
      <DiagFrame vb="0 0 460 210" caption="Every LLM call emits an event that fans out to logs (what happened), a trace span (where in the request), and a metrics counter (how often/fast).">
        {/* Agent source */}
        <DiagBox x={160} y={10} w={140} h={40} label="Agent call" sub="LLM / tool" fill={h.soft} stroke={h.base} text={h.ink} />
        {/* Fan-out lines */}
        <line x1={230} y1={50} x2={230} y2={62} stroke={h.base} strokeWidth="1.5"/>
        <line x1={68} y1={62} x2={392} y2={62} stroke={h.base} strokeWidth="1.5"/>
        {[68,230,392].map(x=>(
          <line key={x} x1={x} y1={62} x2={x} y2={75} stroke={h.base} strokeWidth="1.5"/>
        ))}
        {/* Three pillars */}
        {([
          ["Logs", "structured events", "timestamp, model,\nprompt tokens, cost", 14],
          ["Traces", "distributed spans", "trace ID links every\nLLM + tool call", 158],
          ["Metrics", "aggregated signals", "latency p99,\nerror rate, token/run", 302],
        ] as [string,string,string,number][]).map(([name,sub,detail,x],i)=>(
          <g key={i}>
            <DiagBox x={x} y={75} w={144} h={44} label={name} sub={sub} fill={i===1?h.soft:"var(--card)"} stroke={i===1?h.base:s} text={i===1?h.ink:"var(--ink)"} />
            {detail.split("\n").map((line,j)=>(
              <text key={j} x={x+72} y={137+j*14} textAnchor="middle" fontSize="9" fill={s} fontFamily={f}>{line}</text>
            ))}
          </g>
        ))}
        <text x={230} y={185} textAnchor="middle" fontSize="9.5" fill={s} fontFamily={f}>trace ID threads all spans together — one click to the root cause</text>
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
  "data-structures-algorithms:Asymptotic Analysis": {
    oneLine: "Big-O measures how an algorithm's operation count grows as input size n heads toward infinity, deliberately throwing away constants and hardware so you can compare algorithms by their scaling, not their stopwatch.",
    Diagram: dsaDiagrams["Asymptotic Analysis"],
    analogy: { title: "Like a telescope, not a stopwatch", text: "It throws away everything you can see up close so the shape of the curve at infinity comes into focus. Two cars look identical at the curb, but one keeps accelerating forever and the other tops out — that long-run shape is all Big-O cares about." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Asymptotic analysis asks one question: as <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n</code> grows without bound, how fast does the number of basic operations grow? <strong>Big-O</strong> is an upper bound, <strong>Big-Ω</strong> a lower bound, and <strong>Big-Θ</strong> a tight bound that pins both sides — most claims people label O(n) are really <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n)</code> claims. We drop constants and lower-order terms because they vanish in the limit, so <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>3n² + 5n + 100</code> is just <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n²)</code>.</p><p style={{margin:0}}>The growth ladder diverges brutally: at n = 10⁶, an <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n log n)</code> sort does ~20 million steps while <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n²)</code> does a trillion. <strong>Amortized analysis</strong> handles operations that are occasionally expensive but cheap on average — a dynamic-array append is O(1) amortized even though one append in many triggers an O(n) copy. Watch out: average-case Θ(n log n) code can hide a worst case — sorted data into a naive-pivot quicksort, or adversarial keys into a hash table — that pushes it to Θ(n²) or worse, so randomize pivots or pick an algorithm with a hard worst-case bound.</p></div>,
    keyPoints: ["Big-O drops constants and lower-order terms to expose only how cost scales with n", "Θ is a tight bound; citing a loose O() upper bound proves nothing useful", "The growth ladder runs Θ(1), Θ(log n), Θ(n), Θ(n log n), Θ(n²), Θ(2ⁿ) — and they diverge fast", "At n = 10⁶, Θ(n log n) does ~2×10⁷ steps but Θ(n²) does 10¹² — a 50,000x gap", "Asymptotics can lose at small n: a tiny-constant Θ(n²) can beat a big-constant Θ(n log n), so benchmark at real sizes"],
  },
  "data-structures-algorithms:The Machine Model": {
    oneLine: "Big-O assumes every memory access costs the same, but real hardware makes some accesses 100,000x slower than others, so the algorithm with fewer operations can still lose to the one that touches memory in cache-friendly order.",
    Diagram: dsaDiagrams["The Machine Model"],
    analogy: { title: "Like a city, not a flat warehouse", text: "RAM is not a warehouse where every shelf is one step away — it is a city, and the cache line is the truckload. You pay for the trip once, so use everything that came on the truck before sending it back." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The cost model behind Big-O — one operation, one unit of time — is a fiction. Real machines have a <strong>memory hierarchy</strong>: <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>registers</code> → <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>L1</code> → <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>L2</code> → <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>L3</code> → <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>RAM</code> → <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>SSD</code>, each tier roughly 10–100x slower than the one above. Memory also moves in fixed 64-byte <strong>cache lines</strong>, not one byte at a time, so touching one array element drags its neighbors into cache for free.</p><p style={{margin:0}}>This hands arrays two gifts — <strong>spatial locality</strong> (the next element is already loaded) and <strong>temporal locality</strong> (recently touched data stays cached). A contiguous array walk can beat an O(n) linked-list walk by 10x, because the list is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n</code> separate allocations and each hop is a random pointer chase that stalls hundreds of cycles. Asymptotics pick the algorithm class, but constants and cache behavior pick the winner within a class. Watch out: pointer-heavy structures like linked lists and trees are slow despite a great Big-O because every node is a random-address cache miss — prefer contiguous layouts, struct-of-arrays, or a pool allocator so nodes sit next to each other.</p></div>,
    keyPoints: ["Big-O's flat cost model is a fiction: real access latency spans a million-fold range", "Memory moves in 64-byte cache lines, so touching one element prefetches its neighbors for free", "Spatial and temporal locality make contiguous arrays far faster than scattered nodes", "An array scan can beat an equal-O(n) linked-list walk by 10x purely from cache behavior", "Beware false sharing: padding hot per-thread data onto its own cache line stops lines from bouncing between cores"],
  },
  "data-structures-algorithms:Arrays & Dynamic Arrays": {
    oneLine: "A static array is one contiguous block where element i lives at base + i × stride for true O(1) indexing, while a dynamic array fakes unlimited growth by allocating a bigger block and copying everything over whenever it fills.",
    Diagram: dsaDiagrams["Arrays & Dynamic Arrays"],
    analogy: { title: "Like a parking lot you rebuild twice as large", text: "When the lot fills, you bulldoze it and rebuild double the size across the street, then tow every car over. The move is expensive, but because the lot keeps doubling you do it ever more rarely, so the average cost per car parked stays flat." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A static <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>array</code> is a single contiguous run of bytes. Because every element has the same width (<strong>stride</strong>), the address of element <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>i</code> is just <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>base + i × stride</code> — one multiply and one add, which makes random access genuinely <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(1)</code> and arrays the most cache-friendly structure that exists. The catch is that the size is fixed at allocation.</p><p style={{margin:0}}>A <strong>dynamic array</strong> — Python's list, C++'s vector, Java's ArrayList — solves this by tracking <strong>size</strong> and <strong>capacity</strong> over an over-allocated buffer. <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>append</code> writes into the next free slot in O(1) until full; then it allocates a buffer a constant factor larger (often 2x), copies all elements, and frees the old one. That copy is O(n), but geometric growth means the total work across n appends is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>1 + 2 + 4 + ... + n ≈ 2n</code>, so each append is O(1) amortized. Watch out: a loop doing front insert or delete like <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>lst.pop(0)</code> quietly becomes O(n²) since every later element shifts — use a <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>deque</code> for true O(1) ends.</p></div>,
    keyPoints: ["Indexing is true O(1) via base + i × stride; arrays are the most cache-friendly structure", "Dynamic arrays track size and capacity over a deliberately over-allocated buffer", "Geometric (often 2x) growth makes append O(1) amortized — total copy work is about 2n", "Insert or delete anywhere but the end is O(n) because every later element must shift", "Amortized is not worst-case latency: a single resize spikes to O(n), so preallocate for real-time loops"],
  },
  "data-structures-algorithms:Linked Lists": {
    oneLine: "A linked list trades the array's contiguous block for scattered nodes joined by pointers — you give up O(1) indexing and cache friendliness, and in return you get O(1) splicing anywhere, as long as you already hold a reference to the spot.",
    Diagram: dsaDiagrams["Linked Lists"],
    analogy: { title: "Like a paper scavenger hunt", text: "Each clue holds a value and the address of the next clue. Splicing in a new clue means rewriting a single address, but to reach the 50th clue you must physically visit all 49 before it — there is no shortcut to the middle." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Each node is an independent heap allocation holding a value plus a pointer to the next node (singly linked) or to both next and previous (doubly linked). Because nodes sit at unrelated addresses, there is no <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>base + i × stride</code> formula — to reach element <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>k</code> you start at the head and follow k pointers, so indexing and search are <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n)</code>. That same indirection makes the list <strong>cache-hostile</strong>: every hop is a random-address pointer chase that likely misses cache.</p><p style={{margin:0}}>The payoff is <strong>structural surgery</strong>. Given a reference to a node, inserting or removing next to it is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(1)</code> — you rewire a constant number of pointers, no shifting. The fine print: in a singly linked list, deleting a node you hold is still Θ(n) because you need the predecessor to repoint its <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>next</code>. A <strong>doubly linked</strong> list carries a <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>prev</code> pointer, making arbitrary splices truly O(1) — why LRU caches and OS scheduler queues use them. Watch out: indexing a list like an array with a <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>node_at(k)</code> call inside a loop turns an innocent traversal into O(n²); iterate with a moving cursor instead.</p></div>,
    keyPoints: ["Nodes are scattered heap allocations joined by pointers, so there is no constant-time index formula", "Indexing and search are Θ(n) — you must walk from the head following pointers", "Splicing next to a node you already hold is Θ(1): just rewire a few pointers, no shifting", "Singly-linked delete of a held node is Θ(n) (you need the predecessor); a doubly linked prev fixes it", "Pointer chasing causes cache misses, so for scan-heavy work a list is routinely 5–10x slower than an array"],
  },
  "data-structures-algorithms:Stacks, Queues, Deques & Ring Buffers": {
    oneLine: "Stacks, queues, and deques are not new storage but access disciplines layered on an array or list, and the ring buffer is the trick that makes a queue O(1) at both ends without ever shifting elements.",
    Diagram: dsaDiagrams["Stacks, Queues, Deques & Ring Buffers"],
    analogy: { title: "Like a plate dispenser and a ticket line", text: "A stack is the spring-loaded plate dispenser — you only ever take or add the top plate (LIFO). A queue is the ticket line — you join at the back and are served from the front (FIFO)." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A <strong>stack</strong> is last-in-first-out: you push and pop at one end only, exactly what the CPU uses for function calls and what any traversal uses to backtrack. A <strong>queue</strong> is first-in-first-out: enqueue at the back, dequeue from the front — the model for task pipelines and breadth-first search. A <strong>deque</strong> allows push and pop at both ends and generalizes both. All three are <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(1)</code> per operation when implemented correctly.</p><p style={{margin:0}}>The naive trap is building a queue on a plain array and dequeuing from the front — that shifts every remaining element, making a drain <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n²)</code>. The fix is a <strong>ring buffer</strong>: a fixed-capacity array with two indices, <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>head</code> and <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>tail</code>, that advance with <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>(i + 1) % capacity</code> so they wrap around. Nothing ever moves, giving genuine O(1) enqueue and dequeue with zero allocation — why ring buffers run audio pipelines, NIC I/O, and lock-free queues. Watch out: with only head and tail you cannot tell full from empty since both leave <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>head == tail</code> — track an explicit element count or deliberately leave one slot vacant.</p></div>,
    keyPoints: ["Stacks (LIFO), queues (FIFO), and deques are access disciplines layered over an array or list", "All three are O(1) per operation when implemented correctly", "Dequeuing from the front of a plain array is O(n) per call and O(n²) to drain", "A ring buffer wraps head/tail with (i + 1) % capacity so nothing ever shifts — true O(1) at both ends", "Full vs empty both leave head == tail, so track a count or keep one slot vacant; decide an overflow policy on purpose"],
  },
  "data-structures-algorithms:Hash Functions & Hash Tables": {
    oneLine: "A hash table is an array plus a function that turns any key into a slot number, so a lookup becomes one address computation instead of a scan — the whole game is keeping that function fast, well-spread, and the table empty enough that collisions stay rare.",
    Diagram: dsaDiagrams["Hash Functions & Hash Tables"],
    analogy: { title: "Like a librarian who never opens the book", text: "One glance at the title and they shout a shelf number — no searching the stacks. It is magic when every title maps to its own shelf, and useless the moment they start sending every book to shelf 7." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A <strong>hash table</strong> stores entries in an array of buckets and uses a <strong>hash function</strong> to decide where each key goes: <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>index = hash(key) % capacity</code>. A good hash is fast and spreads keys uniformly so distinct keys rarely land in the same bucket. Because the index is computed rather than searched, lookup, insert, and delete are <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(1)</code> on <strong>average</strong> — an expected-time guarantee, not a worst-case one.</p><p style={{margin:0}}>What keeps the average true is the <strong>load factor</strong> <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>α = n / capacity</code>. Once α crosses ~0.75 the table resizes — allocating a bigger array and rehashing every key, an <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n)</code> cost that amortizes to <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(1)</code> per op. Watch out: mutating a key in place after insertion changes its hash, so the entry sits in the wrong bucket — present in memory but unfindable, since lookups compute the new hash. Only ever hash on immutable fields.</p></div>,
    keyPoints: ["index = hash(key) % capacity turns a key directly into a slot, no scan", "Lookup, insert, and delete are O(1) on average but O(n) worst case", "Load factor α = n/capacity triggers a grow-and-rehash around 0.7–0.75", "Equal keys must hash equally, and a key's hash must not change while stored", "Hash flooding (attacker keys that all collide) collapses every op to O(n) — use a keyed hash like SipHash"],
  },
  "data-structures-algorithms:Collision Resolution": {
    oneLine: "Two distinct keys will eventually hash to the same bucket, and collision resolution is the policy for what happens next — either grow a little list hanging off that bucket (chaining), or keep everything inside the array and hunt for the next free slot (open addressing).",
    Diagram: dsaDiagrams["Collision Resolution"],
    analogy: { title: "Like a coat-check versus a parking garage", text: "Chaining is a coat-check where each numbered hook holds a whole rack of coats. Open addressing is a garage with no overflow lot — if your space is taken you roll to the next, and on leaving you must drop a 'keep looking' cone or the next driver misses the cars beyond." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}><strong>Separate chaining</strong> makes each bucket the head of a small container — usually a linked list — and appends colliding entries there. A lookup hashes to the bucket and walks its (hopefully tiny) list, giving <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(1 + α)</code> average time; deletion is a trivial unlink. It degrades gracefully past <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>α = 1</code> and forgives a mediocre hash, but pays for pointer chasing and a separate allocation per node.</p><p style={{margin:0}}><strong>Open addressing</strong> keeps every entry in the array and, on collision, probes a deterministic sequence of slots until it finds an empty one. Linear probing is cache-friendly but prone to <strong>primary clustering</strong>; double hashing spreads probes best. It demands a lower load factor (keep <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>α &lt; 0.7</code>) and cost explodes as <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>α → 1</code>. Watch out: deleting without a <strong>tombstone</strong> severs the probe chain, making every entry bumped past that slot unreachable even though it is still in the array.</p></div>,
    keyPoints: ["Chaining hangs a list off each bucket; lookup is Θ(1 + α) and deletes are a simple unlink", "Open addressing stores everything in-array and probes for the next free slot", "Linear probing suffers primary clustering; double hashing spreads probes out", "Open-addressing deletes must leave a tombstone or the probe chain breaks and entries vanish", "Keep open-addressing load factor under ~0.7 — its cost explodes as α approaches 1"],
  },
  "data-structures-algorithms:Binary Trees & Traversals": {
    oneLine: "A binary tree links nodes that each have up to two children, and almost everything about its performance comes down to one number — its height — while how you walk it decides the order in which you see the data.",
    Diagram: dsaDiagrams["Binary Trees & Traversals"],
    analogy: { title: "Like an org chart and party etiquette", text: "A binary tree is an org chart, and a traversal is the etiquette for whom you greet first at the party. You can greet-then-descend, do-the-left-wing-then-greet-then-the-right, or shake every subordinate's hand before the boss's — and level-order just works the building floor by floor." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A binary tree is a set of nodes, each holding a value and up to two child pointers, <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>left</code> and <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>right</code>, descending from a single <strong>root</strong> down to <strong>leaf</strong> nodes. The decisive property is <strong>height</strong> — the longest root-to-leaf path — because reaching the bottom costs in proportion to it: a balanced tree has height <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(log n)</code>, but a degenerate chain has height <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n)</code>.</p><p style={{margin:0}}>Visiting every node is a <strong>traversal</strong>. The depth-first orders differ only in when a node is processed: <strong>preorder</strong> (node-left-right, good for copying), <strong>inorder</strong> (left-node-right, which emits a search tree's keys in sorted order), and <strong>postorder</strong> (left-right-node, good for deleting bottom-up). Breadth-first sweeps rank by rank with a queue. Watch out: a skewed tree of height <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n</code> recursed naively overflows the call stack — traverse iteratively with an explicit stack, or keep the tree balanced.</p></div>,
    keyPoints: ["Height — the longest root-to-leaf path — drives cost; balanced is Θ(log n), degenerate is Θ(n)", "All four traversals visit every node in Θ(n) time using Θ(h) or Θ(w) space", "Inorder of a BST emits keys in sorted order; postorder safely frees children before parents", "Recursive DFS uses call-stack space proportional to height and can overflow on deep trees", "Tree ops are only O(log n) when the height is logarithmic — an unbalanced tree degrades to O(n)"],
  },
  "data-structures-algorithms:Binary Search Trees": {
    oneLine: "A binary search tree keeps one rule at every node — everything on the left is smaller, everything on the right is larger — which turns search into a halving descent, but nothing forces the tree to stay bushy, so the wrong insertion order quietly collapses it into a slow chain.",
    Diagram: dsaDiagrams["Binary Search Trees"],
    analogy: { title: "Like the number line folded into a tree", text: "At each node you ask 'left or right?' and throw away half of what remains — but only if someone folded it evenly. Feed it sorted data and it lays the number line out flat, with no creases to shortcut, so you are back to walking every point." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A BST enforces a single invariant recursively: for every node, all keys in its <strong>left subtree</strong> are less than its key and all keys in its <strong>right subtree</strong> are greater. That ordering lets search behave like binary search — compare the target, step left if smaller or right if larger, and discard the other subtree each time, reaching any key in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(h)</code> comparisons. An <strong>inorder</strong> traversal reads the keys back sorted for free.</p><p style={{margin:0}}><strong>Deletion</strong> has three cases: a leaf is removed, a one-child node is bypassed, and a two-child node is replaced by its <strong>inorder successor</strong> (the smallest key in its right subtree). The fatal weakness is that shape is entirely a function of insertion order, and a plain BST never self-corrects. Watch out: inserting already-sorted or monotonically increasing keys — timestamps, auto-increment IDs — builds a one-sided chain of height <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n</code>, degrading every operation to linear time.</p></div>,
    keyPoints: ["The invariant — left subtree smaller, right subtree larger — turns search into an O(h) halving descent", "Inorder traversal reads BST keys back in sorted order for free", "Deleting a two-child node replaces it with its inorder successor, then deletes that successor", "Tree shape depends entirely on insertion order; random inserts average Θ(log n) height", "Sorted or monotonic insertion builds a height-n chain, making every operation O(n)"],
  },
  "data-structures-algorithms:Self-Balancing Trees": {
    oneLine: "A self-balancing tree keeps a BST from degenerating by enforcing a height bound after every update, repairing violations with rotations — local, constant-time pointer reshuffles that lower the height while preserving the left-smaller / right-larger order.",
    Diagram: dsaDiagrams["Self-Balancing Trees"],
    analogy: { title: "Like a librarian who reshelves as they go", text: "Every time a book makes one section too tall, they make a quick three-shelf swap that keeps everything in alphabetical order but lowers the tallest stack. The aisle never gets so deep that you have to walk forever to reach the back." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The fix for the BST's fragility is structural: detect when an insert or delete has made the tree too lopsided and immediately rebalance with <strong>rotations</strong>. A rotation re-parents three nodes and re-homes a single subtree in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(1)</code> — a right rotation lifts a node's left child into its place, pushes the node down to the right, and moves that child's right subtree across, all while keeping every key in sorted position. Because the cost is constant and it provably reduces height, a few rotations after each update keep the whole tree shallow.</p><p style={{margin:0}}>An <strong>AVL tree</strong> keeps subtree heights within one (a balance factor in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>&#123;−1, 0, +1&#125;</code>), guaranteeing height under about <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>1.44 log n</code> — tightest balance, fastest reads. A <strong>red-black tree</strong> uses looser color rules for a <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>2 log n</code> bound with fewer rotations, which is why it backs std::map, Java's TreeMap, and the Linux kernel. Watch out: rebalancing only the touched node misses violations that surface several levels above — retrace the path to the root and fix up the whole way.</p></div>,
    keyPoints: ["A rotation re-parents three nodes in O(1), lowering height while preserving sorted order", "AVL enforces |h(L) − h(R)| ≤ 1, bounding height at ~1.44 log n — tightest balance, fastest reads", "Red-black trees use color rules for a 2 log n bound with fewer rotations — best for writes", "Every search, insert, and delete in both stays a guaranteed Θ(log n)", "Rebalancing must retrace to the root, since an imbalance can surface several levels above the touched node"],
  },
  "data-structures-algorithms:B-Trees & B+ Trees": {
    oneLine: "A B-tree is a search tree redesigned around the brutal cost of a disk seek: each node holds hundreds of keys so it fills exactly one page, the fanout is enormous, and the height shrinks to three or four levels even for billions of keys — so a lookup costs a handful of I/Os instead of thirty.",
    Diagram: dsaDiagrams["B-Trees & B+ Trees"],
    analogy: { title: "Like a library card catalog", text: "A binary tree sends you back and forth to the stacks thirty times, asking one yes/no question per trip. A B+ tree is the catalog drawer that narrows you among hundreds of shelves in a single glance, so even a billion books are only four drawers deep." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Binary trees assume every node access is cheap, which is false when nodes live on disk — there each pointer hop is a multi-millisecond seek, and a balanced binary tree over a billion keys is roughly 30 levels deep. A <strong>B-tree</strong> fixes this by packing many keys into each node: an order-<code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>m</code> node holds up to <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>m−1</code> keys and <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>m</code> child pointers, sized so one node equals one disk page. Search finds the key interval within a node, then descends, so the number of disk reads is just the height, <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(log_m n)</code> — only three or four levels for that same billion keys, and all leaves sit at the same depth.</p><p style={{margin:0}}>Balance is kept by <strong>splitting and merging</strong> rather than rotating: an overflowing leaf splits and pushes its median key up, and only a cascading root split grows the tree taller. The <strong>B+ tree</strong> variant stores only router keys in internal nodes while all values live in leaves chained as a sorted linked list, turning a range query into one descent plus a sideways walk — which is why InnoDB, PostgreSQL, SQLite, NTFS, and ext4 all build on it. Watch out: keying a B+ index on a random value like a UUID scatters inserts across the whole tree, causing constant leaf splits and heavy write amplification, so prefer monotonic keys for insert-heavy indexes.</p></div>,
    keyPoints: ["Each node fills one disk page, giving a fanout of hundreds and a height of only 3–4 levels for a billion keys", "Search, insert, and delete are all Θ(log n) comparisons but only Θ(log_m n) disk reads", "Balance is maintained by splitting/merging nodes, not rotations; the tree grows only when the root splits", "B+ trees keep values in leaves chained in sorted order, so range scans are one descent plus a sequential walk", "Random keys like UUIDs shred leaf pages with splits and write amplification — prefer monotonic keys"],
  },
  "data-structures-algorithms:Heaps & Priority Queues": {
    oneLine: "A binary heap is a complete tree where every parent out-ranks its children, but because it is complete it needs no pointers at all — it lives in a plain array, with a child at 2i+1 / 2i+2 and a parent at (i−1)//2, giving O(1) access to the best element and O(log n) to insert or remove it.",
    Diagram: dsaDiagrams["Heaps & Priority Queues"],
    analogy: { title: "Like a tournament bracket run upward", text: "The smaller value wins each match and rises, so the champion at the top is the global minimum, found instantly. But the bracket only records who beat whom along each path, so naming the runner-up still takes a playoff among the champion's direct challengers." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A <strong>binary heap</strong> maintains one weak ordering: in a min-heap every node is less than or equal to both its children. That is far weaker than a BST — siblings are unordered — but it guarantees the single thing a priority queue needs: the minimum is always at the root, readable in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(1)</code>. The structural trick is that a heap is always a <strong>complete</strong> tree, so it maps perfectly onto a contiguous array: the node at index <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>i</code> has its parent at <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>(i−1)//2</code> and its children at <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>2i+1</code> and <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>2i+2</code> — no pointers, no per-node allocation, great cache locality.</p><p style={{margin:0}}>Two operations keep the property intact, each walking one root-to-leaf path. <strong>Insert</strong> appends the value and sifts it up; <strong>extract-min</strong> removes the root, moves the last element up, and sifts it down — both <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(log n)</code>. Building a heap from an arbitrary array is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n)</code>, not <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n log n)</code>, if you sift down from the last internal node backward. Heaps power Dijkstra, A*, schedulers, heapsort, and streaming top-k. Watch out: a heap is ordered only along paths, so <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>contains(x)</code> and arbitrary delete are <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n)</code> — keep a side map from value to index if you need decrease-key, or use a balanced BST for ordered search.</p></div>,
    keyPoints: ["A complete tree maps onto a flat array: parent (i−1)//2, children 2i+1 and 2i+2 — no pointers needed", "Peek min or max is Θ(1); insert (sift-up) and extract-min (sift-down) are each Θ(log n)", "Bottom-up heapify builds a heap in Θ(n), far cheaper than n repeated O(n log n) inserts", "Searching for an arbitrary value is O(n) because siblings are unordered — a heap is not a searchable set", "Lazy priority queues must skip stale entries or use a position map, or popped outdated state corrupts results"],
  },
  "data-structures-algorithms:Tries & Radix Trees": {
    oneLine: "A trie stores strings by laying them out character-by-character down shared paths, so a lookup costs only the length of the key — O(k) — no matter how many millions of keys are stored, and prefix queries fall out for free; a radix tree then crushes the wasted single-child chains to make it memory-cheap.",
    Diagram: dsaDiagrams["Tries & Radix Trees"],
    analogy: { title: "Like a choose-your-own-adventure book", text: "Every page is a single letter, and the words you know are exactly the marked endings you can reach by spelling. Adding 'card' after 'car' costs just the one extra page 'd', and a radix tree is that same book after gluing every run of single-choice pages into one." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A <strong>trie</strong> is built from the keys' characters rather than from comparisons or hashes: each edge carries one character, every path from the root spells a prefix, and a flag marks where a complete word ends. To look up or insert a key you walk its characters from the root, so the cost is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(k)</code> in the key's length and completely <strong>independent of n</strong>, the number of keys stored — no hashing, no collisions, a true worst-case bound. Prefix operations fall out naturally: \"all words starting with car\" is just descend to the <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>car</code> node and enumerate its subtree, which is why tries power autocomplete and spell-checkers.</p><p style={{margin:0}}>The price is space: a naive trie keeps a child slot per possible character at every node, wasteful when branches are sparse, and long single-child chains are pure overhead. A <strong>radix tree</strong> (compressed or Patricia trie) merges any chain of single-child nodes into one edge labeled with the whole substring, collapsing the tree to its branching points while preserving every lookup — which is why IP routing tables, Linux's LPC-trie, and Redis's keyspace use it. Watch out: if you only need exact membership with no prefix or ordered queries, a trie pays <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(k)</code> and heavy memory for what a hash set does in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(1)</code> — reach for a trie only when its prefix and ordering powers are the point.</p></div>,
    keyPoints: ["Lookup, insert, and delete cost Θ(k) in the key length, independent of how many keys are stored", "Prefix enumeration is natural: descend to the prefix node and walk its subtree — ideal for autocomplete", "There are no collisions and no comparisons against other keys, giving a true worst-case bound", "Per-node alphabet arrays waste memory on sparse branches; use hash maps or compress into a radix tree", "Radix/Patricia compression merges single-child chains into one labeled edge, keeping only real decision points"],
  },
  "data-structures-algorithms:Segment Trees & Fenwick Trees": {
    oneLine: "When you must repeatedly ask what is the sum/min/max over array indices l..r while the array keeps changing, both a naive recompute and a precomputed prefix array fail — a segment tree (or Fenwick tree) precomputes aggregates over a tree of ranges so every query and every update is O(log n).",
    Diagram: dsaDiagrams["Segment Trees & Fenwick Trees"],
    analogy: { title: "Like a stack of nested progress bars", text: "Each bar already knows the total for its slice, so any range you name is assembled from a few pre-summed pieces instead of re-adding every element. A Fenwick tree is that same idea folded into the binary digits of the indices, so the hops are just bit-flips." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The problem is the tension between queries and updates: a prefix-sum array answers a range sum in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(1)</code> but any update forces an <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n)</code> rebuild, while rescanning per query is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n)</code> the other way. A <strong>segment tree</strong> resolves both: each node owns a contiguous slice and stores the aggregate (sum, min, max, gcd — anything associative) of its children. A range query stitches together only the <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(log n)</code> nodes that tile the interval; a point update re-aggregates the <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(log n)</code> ancestors above one leaf. It costs about <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>4n</code> storage but is maximally flexible.</p><p style={{margin:0}}>A <strong>Fenwick tree</strong> (binary indexed tree) is a leaner specialist for invertible aggregates like sums. It is one <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n+1</code> array where position <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>i</code> covers a block of <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>i &amp; (−i)</code> elements — its lowest set bit. A prefix sum strips the lowest set bit each hop, and a range sum is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>prefix(r) − prefix(l−1)</code>, which is exactly why it needs an invertible operation. Watch out: that subtraction only works for invertible operations, so a plain Fenwick tree cannot do range-min or range-max — use a segment tree for non-invertible aggregates, or a sparse table for static range-min.</p></div>,
    keyPoints: ["Both make range query and point update O(log n), resolving the prefix-array vs. rescan tension", "A segment tree handles any associative aggregate (sum, min, max, gcd) and supports range updates via lazy propagation", "A segment tree costs about 4n storage; a Fenwick tree is a single n+1 array, tiny and cache-friendly", "A Fenwick tree only works for invertible operations like sum because it isolates ranges by subtraction", "A Fenwick tree must be 1-indexed (index 0 hangs the loop), and a segment tree must allocate 4n to avoid out-of-bounds reads"],
  },
  "data-structures-algorithms:Comparison Sorts": {
    oneLine: "Any sort that orders elements purely by comparing pairs is provably stuck at Ω(n log n) — there are n! possible orderings and each comparison reveals only one bit — so the three great comparison sorts differ not in beating that wall but in how they split the work and what they trade away.",
    Diagram: dsaDiagrams["Comparison Sorts"],
    analogy: { title: "Like three movers packing a truck", text: "One is fast but throws boxes anywhere and sometimes jams the doorway, one always packs neatly in order but needs a second truck for scratch space, and one packs steadily in place but keeps running across the warehouse. Same total work, different costs paid." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>There is a hard floor under comparison sorting. Picture the algorithm as a decision tree where each node is a comparison and each leaf is one of the <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n!</code> possible orderings; to distinguish all of them the tree must have at least <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n!</code> leaves, so its height — the worst-case comparisons — is at least <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>log₂(n!) ≈ n log n</code>. <strong>Quicksort</strong> picks a pivot and partitions into smaller and larger halves, then recurses; it is in-place, cache-friendly, and fastest in practice with tiny constants, but a bad pivot degrades it to <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n²)</code> and it is not stable.</p><p style={{margin:0}}><strong>Mergesort</strong> splits in half, sorts each, then merges in linear time — always <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n log n)</code> and stable — but the merge needs <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n)</code> scratch space, so it shines for linked lists and external sorting. <strong>Heapsort</strong> builds a max-heap and repeatedly extracts the max, giving a guaranteed <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n log n)</code> in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(1)</code> space, but its scattered sift operations make it cache-hostile and slower in wall-clock terms. Watch out: choosing the first or last element as the pivot on already-sorted data produces maximally lopsided partitions and collapses quicksort to <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n²)</code> — randomize the pivot or use median-of-three.</p></div>,
    keyPoints: ["Any comparison sort needs Ω(n log n) comparisons because distinguishing n! orderings requires that decision-tree height", "Quicksort is in-place and fastest on average (Θ(n log n)) but degrades to Θ(n²) on bad pivots and is unstable", "Mergesort is always Θ(n log n) and stable but needs Θ(n) scratch space — ideal for linked lists and external sorts", "Heapsort guarantees Θ(n log n) in Θ(1) space but its poor cache locality makes it slower in practice", "Recurse into the smaller partition and loop on the larger one to cap quicksort's stack depth at O(log n)"],
  },
  "data-structures-algorithms:Linear-Time Sorts": {
    oneLine: "These sorts run in O(n) because they read keys directly and drop each one into its address instead of comparing elements, which only works when the keys are structured.",
    Diagram: dsaDiagrams["Linear-Time Sorts"],
    analogy: { title: "Like sorting mail by ZIP code", text: "Instead of holding two letters up against each other to decide which goes first, you read each letter's ZIP code and drop it straight into the labeled pigeonhole. It is only fast because every item already has a small, known address." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The <strong>comparison wall</strong> of <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Ω(n log n)</code> only binds algorithms that learn order by comparing. <strong>Counting sort</strong> handles integer keys in a bounded range by tallying how many times each value occurs, turning those counts into prefix sums, and placing each element directly — <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n + k)</code> time, stable, no comparison ever made. Its constraint is that the range <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>k</code> must stay comparable to <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n</code>.</p><p style={{margin:0}}><strong>Radix sort</strong> lifts that limit by decomposing wide keys into fixed-width digits and running a stable pass — usually counting sort — once per digit from least significant to most. <strong>Bucket sort</strong> takes a third route for uniformly distributed keys: scatter elements into about <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n</code> buckets, sort each small bucket, and concatenate. Watch out: bucket sort is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n)</code> only when keys spread evenly — a clustered distribution dumps most elements into one bucket and degrades to <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n²)</code>.</p></div>,
    keyPoints: ["Counting sort is Θ(n + k), stable, and never compares — but needs k = O(n).", "Radix LSD runs one stable pass per digit; each pass MUST be stable or earlier orderings are scrambled.", "32-bit integers in base 256 sort in just four radix passes, effectively Θ(n).", "Bucket sort averages Θ(n) on uniform data but hits Θ(n²) worst case on skewed data.", "All three trade comparisons for direct indexing, paying with assumptions about the keys."],
  },
  "data-structures-algorithms:Production Sorts": {
    oneLine: "The sorts that ship in real standard libraries are hybrids that detect the shape of the data and switch tools mid-flight — Timsort exploits pre-sorted runs while Introsort runs fast quicksort but bails to heapsort the instant it smells an O(n²) spiral.",
    Diagram: dsaDiagrams["Production Sorts"],
    analogy: { title: "Like a seasoned foreman", text: "A good foreman sizes up the material before picking a tool: if the lumber is already half-stacked in neat piles, just slide them together. Charge in with the fast tool, but keep one hand on the safety lever to swap to the slower-but-unbreakable tool the moment the fast one binds." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Library sorts optimize <strong>real inputs</strong>, which are messy and often partly ordered. <strong>Timsort</strong> — behind Python, Java, and V8 — is a stable, adaptive mergesort: it scans for natural runs, extends short ones with binary insertion sort up to a <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>minrun</code> threshold, then merges with a stack that enforces balance invariants. Its galloping mode leaps over long stretches of a dominating run, giving <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n)</code> on nearly-sorted data and <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n log n)</code> worst case.</p><p style={{margin:0}}><strong>Introsort</strong> — behind C++'s <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>std::sort</code> — begins as quicksort but introspects: if recursion depth exceeds <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>2·log₂ n</code> it switches to heapsort, and below ~16 elements it switches to insertion sort. Watch out: Python and Java object sorts are stable, but C++'s std::sort is Introsort and is NOT stable — code that quietly relied on equal keys keeping their order will silently misorder, so use std::stable_sort.</p></div>,
    keyPoints: ["Timsort is stable and adaptive: Θ(n) on runs, Θ(n log n) worst case.", "Introsort is quicksort's speed plus heapsort's guaranteed Θ(n log n) bound — but unstable.", "Guarantees come from fallbacks; speed comes from adaptivity.", "Plain quicksort's Θ(n²) worst case is exactly why the heapsort fallback exists.", "Both invoke the comparator Θ(n log n) times, so precompute a cheap sort key to keep each compare O(1)."],
  },
  "data-structures-algorithms:Graph Representations": {
    oneLine: "How you store a graph's edges decides which questions are cheap: an adjacency matrix answers are these two connected? in O(1) at O(V²) memory, while an adjacency list costs only O(V + E) and iterates neighbors fast, which is why it wins on the sparse graphs that dominate the real world.",
    Diagram: dsaDiagrams["Graph Representations"],
    analogy: { title: "Like a grid versus contact cards", text: "An adjacency matrix is a giant attendance grid that tells you instantly whether any two people are linked, but it needs a row and column for every possible pair even though almost none are connected. An adjacency list is a stack of contact cards storing only the real relationships, staying tiny for sparse webs — but to check one link you must flip through a card." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>An <strong>adjacency matrix</strong> is a <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>V × V</code> grid where cell <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>[u][v]</code> holds the edge weight; it gives <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(1)</code> edge lookup but occupies <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(V²)</code> space no matter how few edges exist, making it ideal for <strong>dense</strong> graphs. An <strong>adjacency list</strong> stores per vertex only its actual neighbors in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(V + E)</code> space — the default for almost every real graph, which is overwhelmingly sparse.</p><p style={{margin:0}}>A third form, the <strong>edge list</strong>, stores all edges as <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>(u, v, weight)</code> triples and is the natural input for Kruskal's MST or Bellman-Ford. The decision reduces to density and access pattern. Watch out: in an undirected graph, adding only <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>u → v</code> silently makes the graph directed so a traversal misses the edge from v's side — always insert both directions and keep the matrix symmetric.</p></div>,
    keyPoints: ["Matrix: Θ(V²) space, O(1) edge test, O(V) to enumerate one vertex's neighbors.", "List: Θ(V + E) space, O(deg) edge test, O(deg) neighbor iteration.", "Edge list stores (u, v, w) triples in Θ(E) — ideal for edge-sweeping algorithms.", "Pick matrix for dense graphs or constant edge probes; list for sparse graphs or neighbor iteration.", "Most real graphs are sparse, so the adjacency list is the default; a matrix on a large sparse graph is ruinous."],
  },
  "data-structures-algorithms:Graph Traversal": {
    oneLine: "BFS and DFS visit every reachable vertex in O(V + E) and differ in exactly one thing — a FIFO queue versus a stack — yet that single swap turns layer-by-layer flooding into dive-and-backtrack.",
    Diagram: dsaDiagrams["Graph Traversal"],
    analogy: { title: "Like water versus a lone explorer", text: "BFS floods a maze level by level like rising water, so the instant it touches the exit it has the shortest route. DFS is a lone explorer following each corridor to its dead end and backing up — which is how it hands you the order to do dependent tasks, or notices a loop in the halls." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Both traversals need a <strong>visited set</strong>, because without one a cycle sends them into an infinite loop. <strong>BFS</strong> uses a <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>FIFO</code> queue: it dequeues a vertex, enqueues all unvisited neighbors, and expands outward in concentric layers — distance 0, then 1, then 2. That layered order is exactly why BFS finds the <strong>shortest unweighted path</strong>: the first time it reaches a vertex is necessarily via a minimum-hop route, running in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(V + E)</code>.</p><p style={{margin:0}}><strong>DFS</strong> uses a <strong>stack</strong> — explicit or via recursion — diving as deep as possible before backtracking. Its finish order yields a <strong>topological sort</strong> of a DAG, a back-edge reveals a cycle, and the recursion structure underlies bridges, articulation points, and SCCs. Watch out: DFS finds <em>a</em> path, not the shortest — it commits to one deep route and may reach the target the long way around, so use BFS for fewest-edge shortest paths.</p></div>,
    keyPoints: ["Both run in Θ(V + E); the only difference is FIFO queue (BFS) versus stack (DFS).", "BFS expands in layers, so first arrival at a vertex is the shortest unweighted path.", "DFS finish order gives topological sort; back-edges reveal cycles.", "Always need a visited set — and for BFS, mark vertices on enqueue, not dequeue.", "Recursive DFS can overflow the call stack; use an explicit stack for deep graphs."],
  },
  "data-structures-algorithms:Shortest Paths": {
    oneLine: "Every shortest-path algorithm is built on one move — edge relaxation, dist[v] = min(dist[v], dist[u] + w) — and they differ only in the order they relax: Dijkstra greedily settles the nearest vertex, Bellman-Ford relaxes everything V−1 times, and A* relaxes toward the goal using a heuristic.",
    Diagram: dsaDiagrams["Shortest Paths"],
    analogy: { title: "Like an accountant, a brute, and a compass", text: "Dijkstra is a cautious accountant who finalizes the cheapest still-open vertex first, trusting nothing cheaper can arrive later — a trust that shatters the instant an edge can subtract cost. Bellman-Ford is the brute who re-checks every road enough times that no saving can hide, while A* is Dijkstra holding a compass, relaxing toward the goal first." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Once edges carry weights, fewest hops is not least cost, so we <strong>relax edges</strong> instead. <strong>Dijkstra's algorithm</strong> repeatedly extracts the unsettled vertex with the smallest tentative distance from a min-heap, relaxes its outgoing edges, and finalizes it. Its correctness rests on a <strong>non-negativity</strong> assumption: once a vertex is settled with the minimum tentative distance, nothing later can beat it. With a binary heap it runs in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ((V + E) log V)</code>.</p><p style={{margin:0}}>When edges can be negative, <strong>Bellman-Ford</strong> relaxes <em>all</em> <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>E</code> edges <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>V−1</code> times in <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(V · E)</code>; a further improvement on a V-th pass reveals a negative cycle. <strong>A*</strong> is Dijkstra with direction, ordering the frontier by <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>f(n) = g(n) + h(n)</code>. Watch out: a single negative edge can offer a cheaper route to a vertex Dijkstra already finalized, but the greedy lock means it never reconsiders — so use Bellman-Ford for negative weights.</p></div>,
    keyPoints: ["Edge relaxation, dist[v] = min(dist[v], dist[u] + w), is the shared heartbeat of all three.", "Dijkstra is Θ((V + E) log V) with a binary heap but only correct for non-negative weights.", "Bellman-Ford is Θ(V · E), handles negatives, and detects negative cycles on a V-th pass.", "A* with an admissible h finds the optimal path while expanding fewer nodes; h = 0 is exactly Dijkstra.", "An inadmissible heuristic that overestimates forfeits A*'s optimality."],
  },
  "data-structures-algorithms:Minimum Spanning Trees": {
    oneLine: "A minimum spanning tree connects every vertex of a weighted undirected graph using exactly V−1 edges of least total weight, found greedily by Kruskal (cheapest edge anywhere with no cycle) or Prim (grow one tree outward by its cheapest leaving edge).",
    Diagram: dsaDiagrams["Minimum Spanning Trees"],
    analogy: { title: "Like the cheapest set of roads with no loops", text: "Imagine paving roads so every town is reachable while spending the least cable. Kruskal is a thrifty contractor laying the cheapest road anywhere that doesn't merely close a loop, while Prim is a capital city growing outward one cheapest road at a time." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>An <strong>MST</strong> is the cheapest subgraph that keeps all <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>V</code> vertices connected: a tree with exactly <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>V−1</code> edges minimizing total weight. Both algorithms are greedy and provably correct by the <strong>cut property</strong>. <strong>Kruskal</strong> sorts all edges ascending, then adds each edge only if its endpoints are in different components, costing <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(E log E)</code> dominated by the sort — a natural fit for sparse graphs.</p><p style={{margin:0}}><strong>Prim</strong> starts from one vertex and repeatedly adds the minimum-weight edge connecting the growing tree to an outside vertex via a min-heap, giving <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(E log V)</code>, or <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(V²)</code> with an array which wins on dense graphs. Watch out: an MST minimizes total weight, which is not the same as minimizing the distance from a source to each vertex — that is a shortest-path tree, so use Dijkstra for that and never substitute one for the other.</p></div>,
    keyPoints: ["An MST is a tree with exactly V−1 edges of least total weight on an undirected graph", "Both Kruskal and Prim are greedy, justified by the cut property", "Kruskal Θ(E log E) sorts edges and adds those that don't close a cycle; best for sparse graphs", "Prim Θ(E log V) with a heap, or Θ(V²) with an array, which wins on dense graphs", "Back Kruskal's cycle test with Union-Find; an MST is not a shortest-path tree"],
  },
  "data-structures-algorithms:Union-Find": {
    oneLine: "A disjoint-set structure tracks a partition of elements into groups and answers same-group? plus merge two groups almost for free, using parent-pointer up-trees that union by rank and path compression flatten to an amortized cost of α(n), the inverse Ackermann function, below 5 for any real input.",
    Diagram: dsaDiagrams["Union-Find"],
    analogy: { title: "Like teammates who each point to their captain", text: "Everyone knows just one other person to point to, and following that chain ends at the team captain, so two people share a team if their chains reach the same captain. Path compression has everyone you pass re-pin their badge straight to the captain, so the next lookup is instant." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Union-Find (a <strong>disjoint-set union</strong>, or DSU) maintains disjoint sets and supports <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>find(x)</code>, returning a representative, and <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>union(x, y)</code>, merging two sets. It is a forest of <strong>up-trees</strong>: each element stores one parent pointer, the root is the representative, and <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>find</code> walks to it. Done naively a chain of unions makes <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>find</code> cost <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(n)</code>, so <strong>union by rank</strong> always hangs the shorter tree under the taller, keeping height logarithmic.</p><p style={{margin:0}}><strong>Path compression</strong> re-points every node on a find path directly at the root, flattening the tree. Together they give an amortized <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(α(n))</code> per operation — the inverse Ackermann function, below 5 for any conceivable n. It powers Kruskal's cycle test, connected-components, and cycle detection. Watch out: applying neither optimization lets a chain build a linear tree and turns Kruskal quadratic — always apply union by rank and path compression together, since each alone only reaches <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(log n)</code>.</p></div>,
    keyPoints: ["DSU supports find (representative of a set) and union (merge two sets) over a parent-pointer forest", "Union by rank hangs the shorter tree under the taller, bounding height to O(log n)", "Path compression re-points nodes straight to the root, flattening trees on each find", "Both together give O(α(n)) amortized, effectively constant for any real input", "DSU cannot delete or undo a union; use link-cut trees or an offline rollback variant"],
  },
  "data-structures-algorithms:Divide & Conquer and the Master Theorem": {
    oneLine: "Divide-and-conquer splits a problem into smaller copies, solves them recursively, and combines the results, and the cost T(n) = a·T(n/b) + f(n) is solved by the Master Theorem asking one question: does the work pile up at the root, spread evenly across levels, or sink into the leaves?",
    Diagram: dsaDiagrams["Divide & Conquer and the Master Theorem"],
    analogy: { title: "Like delegating work down an org chart", text: "Split the job, hand each piece to a clone of yourself, then stitch the answers back together. The only question that matters is which layer is busiest — the boss combining at the top, every layer equally, or the countless tiny workers at the bottom — because the heaviest layer sets the total bill." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>The pattern has three steps: <strong>divide</strong> the input into <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>a</code> subproblems of size <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n/b</code>, <strong>conquer</strong> them by recursing, and <strong>combine</strong> with non-recursive work <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>f(n)</code>. That gives the recurrence <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>T(n) = a·T(n/b) + f(n)</code>. The <strong>Master Theorem</strong> compares <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>f(n)</code> against the watershed <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n^(log_b a)</code>: leaves dominate (Case 1), work is balanced across levels (Case 2), or the top combine dominates (Case 3).</p><p style={{margin:0}}>Mergesort is the textbook Case 2 — <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>2T(n/2) + Θ(n)</code> gives <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n log n)</code> — while binary search is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(log n)</code> and Karatsuba reaches <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>n^1.585</code>. Watch out: the theorem only covers the constant-a, equal-size-split form, so recurrences that subtract (<code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>T(n−1) + n</code>), split unevenly, or sit in the gap between cases need the recursion-tree method or Akra-Bazzi instead.</p></div>,
    keyPoints: ["Divide-and-conquer yields the recurrence T(n) = a·T(n/b) + f(n)", "The Master Theorem compares f(n) to the watershed n^(log_b a)", "Three cases: leaves dominate, levels balanced (extra log n), or root dominates", "Mergesort is Θ(n log n), binary search Θ(log n), Karatsuba n^1.585, Strassen n^2.807", "It fails on subtractive, uneven, or gap recurrences — use recursion trees or Akra-Bazzi"],
  },
  "data-structures-algorithms:Dynamic Programming": {
    oneLine: "Dynamic programming turns an exponential recursion into a polynomial one whenever a problem has overlapping subproblems and optimal substructure, by computing each distinct subproblem a single time and reusing the stored result everywhere it reappears.",
    Diagram: dsaDiagrams["Dynamic Programming"],
    analogy: { title: "Like a jigsaw you never assemble twice", text: "Finishing a giant puzzle, naive recursion keeps rebuilding the same corner from scratch over and over. DP builds each chunk once, writes it into a table, and just glances at it forever after." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>DP applies when two conditions hold. First, <strong>overlapping subproblems</strong>: naive recursion re-solves the same smaller instances — naive Fibonacci recomputes <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>fib(3)</code> exponentially often — so caching collapses the work. Second, <strong>optimal substructure</strong>: an optimal whole is built from optimal parts. <strong>Memoization</strong> (top-down) caches each recursive result, while <strong>tabulation</strong> (bottom-up) fills a table from base cases in dependency order.</p><p style={{margin:0}}>The craft is two definitions: the <strong>state</strong> (the minimal parameters identifying a subproblem) and the <strong>transition</strong> (the recurrence). 0/1 knapsack is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>(item index, remaining capacity)</code>; LCS and edit distance are positions in two strings. Often you can drop <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(n·m)</code> space to <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>Θ(m)</code> by keeping recent slices. Watch out: omitting a parameter the subproblem depends on — keying knapsack on item index but not capacity — corrupts the cache and yields wrong answers, as does filling in an order where a dependency isn't ready.</p></div>,
    keyPoints: ["DP needs both overlapping subproblems and optimal substructure", "Memoization (top-down cache) and tabulation (bottom-up fill) are equivalent approaches", "The craft is defining the state and the transition recurrence", "Knapsack drops from Θ(2ⁿ) to Θ(n·W); many tables shrink to one or two rows of space", "An incomplete state key or wrong fill order produces wrong answers"],
  },
  "data-structures-algorithms:Greedy Algorithms": {
    oneLine: "A greedy algorithm builds an answer by repeatedly taking the best-looking option right now and never reconsidering it — fast and simple, but provably optimal only when the problem has the greedy-choice property; without it greedy returns a fast wrong answer and you fall back to DP.",
    Diagram: dsaDiagrams["Greedy Algorithms"],
    analogy: { title: "Like filling a plate at a buffet", text: "You always grab the most appealing dish in front of you and never put anything back. When the buffet is arranged so each best grab leaves the best remaining options, you build the perfect meal in one pass; otherwise the big shrimp now costs you two lobsters later." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>Where DP compares sub-solutions before committing, a greedy algorithm <strong>commits immediately</strong>: each step makes the locally optimal choice and never backtracks. It is correct only with two properties. The <strong>greedy-choice property</strong> means a locally optimal choice is part of some global optimum, and <strong>optimal substructure</strong> means the rest combines once that choice is fixed. When both hold, an <strong>exchange argument</strong> proves correctness and greedy beats DP by skipping the comparison entirely.</p><p style={{margin:0}}>The criterion must be right: activity selection is optimal sorting by earliest <strong>finish</strong> time, but earliest start or shortest duration picks fewer. Huffman coding, fractional knapsack, Dijkstra, Prim, and Kruskal are all greedy. Watch out: the property genuinely fails for others — 0/1 knapsack cannot take fractions so the greedy ratio overcommits, and coin change for a non-canonical set like making 6 from <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>{'{1, 3, 4}'}</code> grabs a 4 and finishes at three coins when two threes would do; verify the property before trusting the speed, and reach for DP when it is absent.</p></div>,
    keyPoints: ["Greedy commits to the locally optimal choice each step and never backtracks", "Correct only with the greedy-choice property plus optimal substructure", "Prove correctness with an exchange argument or matroid theory", "Activity selection by earliest finish, Huffman, fractional knapsack, Dijkstra/Prim/Kruskal are greedy-safe", "0/1 knapsack and non-canonical coin change fail greedy and need DP"],
  },
  "data-structures-algorithms:Probabilistic Structures": {
    oneLine: "Two structures buy speed or space by trading away a sliver of certainty: a skip list layers express lanes over a sorted list for expected O(log n) search without tree rotations, and a Bloom filter packs set membership into a tiny bit array that never reports a false negative but occasionally a false positive.",
    Diagram: dsaDiagrams["Probabilistic Structures"],
    analogy: { title: "Like express lanes and a smudgy guest list", text: "A skip list adds sparse express lanes over a sorted list so you leap over big stretches before dropping down near your target. A Bloom filter is a guest list so compressed that a 'no' is always trustworthy but a 'yes' might be a stranger who happens to match." },
    body: <div style={PROSE}><p style={{margin:"0 0 1rem"}}>A <strong>skip list</strong> is a randomized alternative to a balanced tree: a sorted linked list with express lanes where each node is promoted to the next level with probability <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>p</code> (usually 1/2). Searching starts top-left, moves right until the next node would overshoot, then drops a level, giving <strong>expected</strong> <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>O(log n)</code> with no rotations. Redis sorted sets, the RocksDB memtable, and <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>ConcurrentSkipListMap</code> all use them.</p><p style={{margin:0}}>A <strong>Bloom filter</strong> is a bit array of <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>m</code> bits plus <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>k</code> hash functions; inserting sets the k bits, querying checks them. Any 0 bit means <strong>definitely not present</strong> — no false negatives — while all-1 means <strong>probably present</strong>, the false positive coming from bits set by other elements. Optimal sizing is <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>m = −n·ln p / (ln 2)²</code> bits and <code style={{background:"var(--paper-2)",padding:"1px 6px",borderRadius:4,fontSize:"0.9em"}}>k = (m/n)·ln 2</code> hashes. Watch out: a positive can be a false positive, so treat it as 'maybe, verify against the source of truth' — only the negative answer is guaranteed; and never delete by clearing bits, since shared bits would corrupt other keys — use a counting Bloom filter instead.</p></div>,
    keyPoints: ["A skip list layers express lanes over a sorted list for expected O(log n) search, insert, delete", "Skip lists need no rotations and power Redis sorted sets, RocksDB memtables, ConcurrentSkipListMap", "A Bloom filter uses m bits and k hashes; a 0 bit means definitely absent (no false negatives)", "An all-ones lookup means probably present — false positives are tunable via m = −n·ln p/(ln 2)² and k = (m/n)·ln 2", "Treat a Bloom 'present' as 'maybe, verify'; plain Bloom filters cannot delete — use a counting variant"],
  },

};

// ─── ConceptBody ──────────────────────────────────────────────────────────────

// Renders inline `code` spans and *emphasis* from the source markdown text.
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /`([^`]+)`|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] != null) {
      parts.push(
        <code key={k++} style={{ background: "var(--paper-2)", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em" }}>{m[1]}</code>
      );
    } else {
      parts.push(<em key={k++}>{m[2]}</em>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const EXTRAS_HEADING: React.CSSProperties = {
  fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em",
  textTransform: "uppercase", marginBottom: 12,
};

// Renders the structured "extras" sections (complexity tables, pros/cons,
// failure modes, code examples, etc.) ported from the source encyclopedias.
function ExtraSectionView({ section, h }: { section: ConceptExtras["sections"][number]; h: Hue }) {
  const heading = <div style={{ ...EXTRAS_HEADING, color: h.ink }}>{section.heading}</div>;

  if (section.kind === "list") {
    return (
      <div style={{ marginTop: "2rem" }}>
        {heading}
        <ul style={{ margin: 0, paddingLeft: "1.3rem", display: "flex", flexDirection: "column", gap: 7 }}>
          {section.items.map((it, i) => (
            <li key={i} style={{ color: "var(--ink)", fontSize: "0.96rem", lineHeight: 1.55 }}>{renderInline(it)}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (section.kind === "deflist") {
    return (
      <div style={{ marginTop: "2rem" }}>
        {heading}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {section.items.map((p, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${h.base}`, background: "var(--paper-2)", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.96rem", marginBottom: 4 }}>{renderInline(p.term)}</div>
              <div style={{ color: "var(--ink-2)", fontSize: "0.92rem", lineHeight: 1.6 }}>{renderInline(p.body)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.kind === "table") {
    const cell: React.CSSProperties = { padding: "9px 14px", color: "var(--ink-2)", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap" };
    return (
      <div style={{ marginTop: "2rem" }}>
        {heading}
        <div style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: "calc(var(--radius, 22px) * 0.5)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                {section.cols.map((c, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "10px 14px", background: "var(--paper-2)", color: "var(--ink-2)", fontWeight: 700, fontSize: "0.76rem", letterSpacing: "0.02em", borderBottom: "1px solid var(--line)" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((r, i) => (
                <tr key={i} style={{ borderTop: i ? "1px solid var(--line-soft)" : "none" }}>
                  {r.map((c, j) => (
                    <td key={j} style={j === 0 ? { padding: "9px 14px", color: "var(--ink)", fontWeight: 600 } : cell}>{renderInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (section.kind === "code") {
    return (
      <div style={{ marginTop: "2rem" }}>
        {heading}
        <pre style={{ margin: 0, background: "#1e1e1e", color: "#d4d4d4", padding: "16px 18px", borderRadius: "calc(var(--radius, 22px) * 0.5)", overflowX: "auto", fontSize: "0.82rem", lineHeight: 1.6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>
          <code>{section.code}</code>
        </pre>
      </div>
    );
  }

  // prose
  return (
    <div style={{ marginTop: "2rem" }}>
      {heading}
      <p style={{ margin: 0, color: "var(--ink)", fontSize: "0.98rem", lineHeight: 1.65 }}>{renderInline(section.text)}</p>
    </div>
  );
}

function ConceptExtrasBlock({ data, h }: { data: ConceptExtras; h: Hue }) {
  return (
    <>
      {data.sections.map((s, i) => (
        <ExtraSectionView key={i} section={s} h={h} />
      ))}
    </>
  );
}

function ConceptBody({ topic, subtopic }: { topic: Topic; subtopic: Subtopic }) {
  const key = `${topic.id}:${subtopic.name}`;
  const f = FEATURED[key];
  const extras = conceptExtras[key];
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
        {extras && <ConceptExtrasBlock data={extras} h={h} />}
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
      {extras && <ConceptExtrasBlock data={extras} h={h} />}
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
