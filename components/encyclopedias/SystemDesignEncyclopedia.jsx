import { useState, useEffect } from "react";

/* =========================================================================
   SYSTEM DESIGN ENCYCLOPEDIA
   A fully self-contained, interactive reference. All content + every diagram
   is hardcoded below. No network calls, no external libraries.
   ========================================================================= */

/* ---- Typography ---- */
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Times New Roman', serif";
const SANS = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

/* ---- Theme (warm "field-guide" paper, ink text, teal accent) ---- */
const T = {
  bg: "#f4f3ee",
  panel: "#faf9f4",
  card: "#ffffff",
  ink: "#211f1a",
  ink2: "#56524a",
  ink3: "#8d887c",
  line: "#e5e2d8",
  lineSoft: "#eeece4",
  accent: "#0f766e",
  accentInk: "#0a544e",
  accentSoft: "#e2efed",
  accentSoft2: "#d4e9e6",
};

/* ---- Diagram role colours (consistent across every SVG) ---- */
const C = {
  client: { fill: "#dbeafe", stroke: "#3b82f6", text: "#1e40af" },
  server: { fill: "#dcfce7", stroke: "#16a34a", text: "#15803d" },
  store:  { fill: "#fef3c7", stroke: "#d97706", text: "#b45309" },
  cache:  { fill: "#fee2e2", stroke: "#dc2626", text: "#b91c1c" },
  net:    { fill: "#ede9fe", stroke: "#7c3aed", text: "#6d28d9" },
  queue:  { fill: "#cffafe", stroke: "#0891b2", text: "#0e7490" },
  infra:  { fill: "#f1f5f9", stroke: "#94a3b8", text: "#475569" },
};

const ROLE_LEGEND = [
  ["client", "Client / user"],
  ["server", "Service / server"],
  ["store", "Data store"],
  ["cache", "Cache / memory"],
  ["net", "Router / gateway"],
  ["queue", "Queue / broker"],
];

/* =========================================================================
   Reusable SVG primitives — keep every diagram consistent + legible.
   ========================================================================= */

function Box({ x, y, w = 90, h = 44, role = "infra", label, sub, rx = 8 }) {
  x = +x; y = +y; w = +w; h = +h; rx = +rx;
  const c = C[role] || C.infra;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={c.fill} stroke={c.stroke} strokeWidth="2" />
      {sub ? (
        <>
          <text x={x + w / 2} y={y + h / 2} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={c.text}>{label}</text>
          <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fontSize="9.5" fill={c.text} opacity="0.85">{sub}</text>
        </>
      ) : (
        <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={c.text}>{label}</text>
      )}
    </g>
  );
}

function Cylinder({ x, y, w = 76, h = 60, role = "store", label, sub }) {
  x = +x; y = +y; w = +w; h = +h;
  const c = C[role] || C.store;
  const ry = 8;
  return (
    <g>
      <path
        d={`M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry} L ${x + w} ${y + h - ry} A ${w / 2} ${ry} 0 0 1 ${x} ${y + h - ry} Z`}
        fill={c.fill} stroke={c.stroke} strokeWidth="2"
      />
      <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} fill={c.fill} stroke={c.stroke} strokeWidth="2" />
      <text x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={c.text}>{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 19} textAnchor="middle" fontSize="9" fill={c.text} opacity="0.85">{sub}</text>}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color = "#64748b", dashed = false, width = 2, head = true, label, lx, ly, lcolor }) {
  x1 = +x1; y1 = +y1; x2 = +x2; y2 = +y2; width = +width;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const len = 9;
  const a1 = ang - Math.PI / 7;
  const a2 = ang + Math.PI / 7;
  const bx = head ? x2 - Math.cos(ang) * 6 : x2;
  const by = head ? y2 - Math.sin(ang) * 6 : y2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeDasharray={dashed ? "5 4" : undefined} strokeLinecap="round" />
      {head && (
        <path
          d={`M ${x2} ${y2} L ${x2 - len * Math.cos(a1)} ${y2 - len * Math.sin(a1)} L ${x2 - len * Math.cos(a2)} ${y2 - len * Math.sin(a2)} Z`}
          fill={color}
        />
      )}
      {label && (
        <text x={lx ?? (x1 + x2) / 2} y={ly ?? (y1 + y2) / 2 - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill={lcolor || color}>{label}</text>
      )}
    </g>
  );
}

function Label({ x, y, children, size = 11, weight = 600, color = T.ink2, anchor = "middle", italic = false }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color} fontStyle={italic ? "italic" : "normal"}>
      {children}
    </text>
  );
}

/* small token / actor dot */
function Dot({ cx, cy, r = 5, fill = "#0891b2", stroke }) {
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={stroke ? 1.5 : 0} />;
}

/* =========================================================================
   CONCEPT DATA — every entry fully written out (title, explanation,
   key points, and a hardcoded inline SVG).  viewBox is always 0 0 600 300.
   ========================================================================= */

const CONCEPTS = [
  /* ====================== SCALABILITY ====================== */
  {
    category: "Scalability",
    title: "Horizontal vs Vertical Scaling",
    explanation:
      "Every system eventually hits a capacity wall. You have two levers: make each machine bigger (vertical / scale-up) or add more machines (horizontal / scale-out). Vertical scaling is the first instinct — no code changes, no coordination overhead — but every physical host has a hard ceiling and is a single point of failure. Horizontal scaling removes that ceiling and bakes in redundancy, but the application must be stateless (or externalise state) and needs a load balancer to distribute work. Most production systems reach for vertical scaling first, then layer horizontal scaling on top once a single node can no longer absorb peak load.",
    points: [
      "Vertical (scale-up): resize the instance — more vCPU, RAM, faster NVMe. Simple, zero code change, but bounded by the largest available SKU and typically requires a reboot window.",
      "Horizontal (scale-out): add identical nodes behind a load balancer. Fault-tolerant by design — one node failure degrades capacity, not availability — and theoretically unbounded.",
      "Stateless is a prerequisite for horizontal scaling: session data, uploaded files, and in-process caches must live in an external store (Redis, S3, RDS) before you can safely clone a service.",
      "Cost curve diverges at scale: the 64-vCPU instance tier costs a steep premium per vCPU; running eight 8-vCPU commodity nodes often yields the same throughput at lower total cost.",
      "Vertical scaling leaves a single point of failure — a crashed host takes the whole service down; horizontal scaling distributes that risk across the fleet.",
      "Database write scaling is asymmetric: read replicas are horizontal read-scale, but scaling write throughput beyond a single primary requires vertical sizing or sharding, not merely adding nodes.",
    ],
    svg: (
      <svg viewBox="0 0 600 340" width="100%" style={{ fontFamily: SANS }}>
        {/* divider */}
        <line x1="300" y1="14" x2="300" y2="334" stroke={T.line} strokeWidth="1.5" strokeDasharray="5 4" />

        {/* LEFT: VERTICAL */}
        <Label x="150" y="16" size="12" weight="800" color={T.ink}>VERTICAL — scale up</Label>

        <Box x="18" y="26" w="80" h="60" role="server" label="Server" sub="2 vCPU / 4 GB" />
        <Label x="58" y="98" size="8.5" color={C.server.text} weight="600">t3.small</Label>
        <Arrow x1="98" y1="56" x2="116" y2="56" color={T.accent} />
        <Box x="116" y="30" w="84" h="52" role="server" label="Server" sub="8 vCPU / 32 GB" />
        <Label x="158" y="94" size="8.5" color={C.server.text} weight="600">m6i.2xlarge</Label>
        <Arrow x1="200" y1="56" x2="218" y2="56" color={T.accent} />
        <Box x="218" y="22" w="60" h="88" role="server" label="Server" sub="64 vCPU" />
        <Label x="248" y="122" size="8.5" color={C.server.text} weight="600">x2iedn.16xl</Label>

        <line x1="218" y1="22" x2="278" y2="22" stroke={C.cache.stroke} strokeWidth="2" strokeDasharray="3 2" />
        <Label x="148" y="18" size="8.5" color={C.cache.text} weight="700">⚠ hardware ceiling</Label>

        <rect x="18" y="138" width="264" height="20" rx="5" fill={C.cache.fill} stroke={C.cache.stroke} strokeWidth="1.2" />
        <Label x="150" y="152" size="9" color={C.cache.text} weight="700">1 host = 1 point of failure (SPOF)</Label>

        <Label x="22" y="178" size="9.5" color={T.ink2} weight="600" anchor="start">✔ no application changes required</Label>
        <Label x="22" y="194" size="9.5" color={T.ink2} weight="600" anchor="start">✔ zero coordination overhead</Label>
        <Label x="22" y="210" size="9.5" color={T.ink2} weight="600" anchor="start">✘ bounded by max instance size</Label>
        <Label x="22" y="226" size="9.5" color={T.ink2} weight="600" anchor="start">✘ reboot required to resize</Label>
        <Label x="22" y="242" size="9.5" color={T.ink2} weight="600" anchor="start">✘ no redundancy — one crash = full outage</Label>
        <Label x="22" y="258" size="9.5" color={T.ink2} weight="600" anchor="start">✘ premium pricing at high-end SKUs</Label>

        {/* RIGHT: HORIZONTAL */}
        <Label x="450" y="16" size="12" weight="800" color={T.ink}>HORIZONTAL — scale out</Label>

        <Box x="308" y="26" w="60" h="36" role="client" label="Traffic" />
        <Arrow x1="368" y1="44" x2="390" y2="44" color={C.client.stroke} />
        <Box x="390" y="26" w="90" h="36" role="net" label="Load Balancer" />

        <Arrow x1="428" y1="62" x2="352" y2="98" color={C.net.stroke} />
        <Arrow x1="436" y1="62" x2="430" y2="98" color={C.net.stroke} />
        <Arrow x1="444" y1="62" x2="506" y2="98" color={C.net.stroke} />

        <Box x="308" y="98" w="80" h="36" role="server" label="Node A" sub="healthy" />
        <Box x="390" y="98" w="80" h="36" role="server" label="Node B" sub="healthy" />
        <Box x="472" y="98" w="80" h="36" role="server" label="Node C" sub="healthy" />

        <rect x="390" y="148" width="80" height="34" rx="8" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="2" strokeDasharray="5 4" opacity="0.75" />
        <text x="430" y="169" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.server.text}>+ Node D</text>
        <Label x="430" y="194" size="8.5" color={C.server.text} weight="600">add on demand → ∞</Label>

        <rect x="308" y="208" width="244" height="20" rx="5" fill="#dcfce7" stroke={C.server.stroke} strokeWidth="1.2" />
        <Label x="430" y="222" size="9" color={C.server.text} weight="700">Node failure → LB routes around it</Label>

        <Box x="366" y="240" w="128" h="32" role="store" label="Shared State" sub="Redis / S3 / DB" />
        <Arrow x1="348" y1="134" x2="390" y2="240" color={C.store.stroke} dashed width="1.2" />
        <Arrow x1="430" y1="134" x2="430" y2="240" color={C.store.stroke} dashed width="1.2" />
        <Arrow x1="512" y1="134" x2="476" y2="240" color={C.store.stroke} dashed width="1.2" />
        <Label x="430" y="284" size="8.5" color={C.store.text} weight="600" italic>stateless nodes share external state</Label>

        <Label x="310" y="304" size="9.5" color={T.ink2} weight="600" anchor="start">✔ no hard capacity ceiling</Label>
        <Label x="310" y="320" size="9.5" color={T.ink2} weight="600" anchor="start">✔ fault-tolerant: one node down ≠ outage</Label>
        <Label x="310" y="336" size="9.5" color={T.ink2} weight="600" anchor="start">✘ app must be stateless; needs load balancer</Label>
      </svg>
    ),
  },
  {
    category: "Scalability",
    title: "Load Balancing",
    explanation:
      "A load balancer sits in front of a pool of servers and distributes incoming requests so no single server is overwhelmed. It also performs health checks, removing unhealthy nodes from rotation. The distribution algorithm decides which server handles each request.",
    points: [
      "Round robin: cycle through servers in order \u2014 simple and even when requests are uniform.",
      "Least connections: send to the server with the fewest active connections \u2014 better for long-lived/uneven work.",
      "Consistent hashing: map a request key to a server so the same key sticks to the same node (sticky cache locality).",
      "Health checks evict failing nodes; L4 balances on TCP, L7 can route on URL/headers.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="24" y="128" w="84" h="46" role="client" label="Clients" />
        <Arrow x1="108" y1="151" x2="226" y2="151" color={C.client.stroke} label="requests" />
        <Box x="226" y="116" w="120" h="70" role="net" label="Load Balancer" sub="+ health checks" />
        <Box x="470" y="44" w="106" h="46" role="server" label="Server A" sub="conn: 3" />
        <Box x="470" y="128" w="106" h="46" role="server" label="Server B" sub="conn: 1" />
        <Box x="470" y="212" w="106" h="46" role="server" label="Server C" sub="conn: 5" />
        <Arrow x1="346" y1="138" x2="470" y2="67" color={C.net.stroke} label="1" lx="408" ly="96" />
        <Arrow x1="346" y1="151" x2="470" y2="151" color={C.net.stroke} label="2" lx="408" ly="145" />
        <Arrow x1="346" y1="164" x2="470" y2="235" color={C.net.stroke} label="3" lx="408" ly="206" />
        <Label x="286" y="206" size="9.5" color={T.ink3} italic>round robin: 1&#8594;2&#8594;3, least-conn picks B</Label>
      </svg>
    ),
  },
  {
    category: "Scalability",
    title: "Auto-scaling",
    explanation:
      "Auto-scaling automatically changes the number of running instances based on live demand. A controller watches metrics (CPU, memory, queue depth, request rate) and adds capacity when load rises (scale-out) or removes it when load falls (scale-in). This matches cost to actual usage.",
    points: [
      "Target-tracking: keep a metric (e.g. CPU 70%) at a set point by adjusting instance count.",
      "Scale-out fast, scale-in slow, with cooldowns to avoid \u201Cflapping\u201D (rapid up/down churn).",
      "Predictive/scheduled scaling pre-warms capacity for known traffic spikes.",
      "Works only for stateless, horizontally scalable services behind a load balancer.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        {/* metric chart */}
        <rect x="24" y="56" width="208" height="150" rx="8" fill={C.infra.fill} stroke={C.infra.stroke} strokeWidth="1.5" />
        <Label x="128" y="48" size="10.5" weight="700" color={T.ink2}>CPU utilisation</Label>
        <line x1="40" y1="194" x2="220" y2="194" stroke={C.infra.stroke} strokeWidth="1.5" />
        <line x1="40" y1="70" x2="40" y2="194" stroke={C.infra.stroke} strokeWidth="1.5" />
        <line x1="40" y1="112" x2="220" y2="112" stroke={C.cache.stroke} strokeWidth="1.5" strokeDasharray="5 4" />
        <Label x="196" y="108" size="9" color={C.cache.text} weight="700" anchor="end">target 70%</Label>
        <path d="M 44 180 L 78 172 L 110 150 L 140 118 L 168 92 L 200 84" fill="none" stroke={C.net.stroke} strokeWidth="2.5" strokeLinejoin="round" />
        <Arrow x1="232" y1="120" x2="288" y2="120" color={T.ink2} label="breach" />
        {/* scaler */}
        <Box x="288" y="96" w="104" h="50" role="net" label="Auto Scaler" sub="scale out / in" />
        <Arrow x1="392" y1="120" x2="436" y2="120" color={C.net.stroke} />
        {/* instances */}
        <Box x="436" y="52" w="140" h="40" role="server" label="instance 1" />
        <Box x="436" y="100" w="140" h="40" role="server" label="instance 2" />
        <g>
          <rect x="436" y="148" width="140" height="40" rx="8" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="2" strokeDasharray="5 4" opacity="0.9" />
          <text x="506" y="172" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.server.text}>instance 3</text>
        </g>
        <Label x="506" y="208" size="10" color={C.server.text} weight="700">&#8593; +1 added on demand</Label>
      </svg>
    ),
  },
  {
    category: "Scalability",
    title: "Rate Limiting",
    explanation:
      "Rate limiting caps how many requests a client can make in a time window, protecting a service from overload, abuse, and runaway costs. A common model is the token bucket: tokens refill at a fixed rate, each request spends one, and requests are rejected when the bucket is empty.",
    points: [
      "Token bucket allows short bursts (up to bucket size) while bounding the long-run average rate.",
      "Over-limit requests get HTTP 429 (Too Many Requests), often with a Retry-After hint.",
      "Limit per API key / user / IP; enforce at the edge or gateway, before expensive work.",
      "In a cluster, counters live in shared storage (e.g. Redis) so the limit is global, not per-node.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="24" y="128" w="80" h="46" role="client" label="Clients" />
        <Arrow x1="104" y1="151" x2="186" y2="151" color={C.client.stroke} label="requests" />
        {/* refill */}
        <Arrow x1="240" y1="58" x2="240" y2="96" color={C.server.stroke} label="refill r/s" lx="300" ly="78" lcolor={C.server.text} />
        {/* bucket */}
        <rect x="186" y="96" width="110" height="118" rx="6" fill={C.queue.fill} stroke={C.queue.stroke} strokeWidth="2" />
        <Label x="241" y="90" size="10" weight="700" color={C.queue.text}>token bucket</Label>
        <Dot cx="210" cy="190" fill={C.queue.stroke} /><Dot cx="232" cy="190" fill={C.queue.stroke} />
        <Dot cx="254" cy="190" fill={C.queue.stroke} /><Dot cx="276" cy="190" fill={C.queue.stroke} />
        <Dot cx="221" cy="172" fill={C.queue.stroke} /><Dot cx="243" cy="172" fill={C.queue.stroke} />
        <Dot cx="265" cy="172" fill={C.queue.stroke} />
        <Label x="241" y="208" size="8.5" color={C.queue.text}>tokens</Label>
        {/* allowed */}
        <Arrow x1="296" y1="128" x2="452" y2="92" color={C.server.stroke} label="allow (spend 1)" lx="378" ly="98" lcolor={C.server.text} />
        <Box x="452" y="70" w="124" h="44" role="server" label="Service" />
        {/* rejected */}
        <Arrow x1="296" y1="182" x2="430" y2="210" color={C.cache.stroke} label="empty" lx="362" ly="188" lcolor={C.cache.text} />
        <Box x="430" y="190" w="146" h="40" role="cache" label="429 rejected" />
      </svg>
    ),
  },
  /* ====================== DATA STORAGE ====================== */
  {
    category: "Data Storage",
    title: "SQL vs NoSQL",
    explanation:
      "SQL (relational) databases store data in tables with a fixed schema and link rows across tables using joins, with strong transactional guarantees. NoSQL databases trade rigid schemas and joins for flexibility and horizontal scale, storing data as documents, key-value pairs, wide columns, or graphs.",
    points: [
      "SQL: structured schema, powerful joins, ACID transactions \u2014 great for complex, related data.",
      "NoSQL: schema-flexible and denormalized; data is shaped for the query, scaling out easily.",
      "SQL scales vertically (and with read replicas); NoSQL is built to shard across many nodes.",
      "Choose SQL for integrity and ad-hoc queries; NoSQL for huge scale, flexible/evolving data.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <line x1="300" y1="44" x2="300" y2="272" stroke={T.line} strokeWidth="1.5" strokeDasharray="4 4" />
        <Label x="150" y="30" size="13" weight="800" color={T.ink}>SQL — tables &amp; joins</Label>
        {/* users table */}
        <rect x="42" y="78" width="118" height="86" rx="6" fill="#fff" stroke={C.store.stroke} strokeWidth="2" />
        <rect x="42" y="78" width="118" height="24" rx="6" fill={C.store.fill} stroke={C.store.stroke} strokeWidth="2" />
        <text x="101" y="95" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.store.text}>users</text>
        <line x1="76" y1="102" x2="76" y2="164" stroke={C.store.stroke} strokeWidth="1" opacity="0.5" />
        <text x="59" y="120" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.store.text}>id</text>
        <text x="118" y="120" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.store.text}>name</text>
        <line x1="42" y1="126" x2="160" y2="126" stroke={C.store.stroke} strokeWidth="1" opacity="0.4" />
        <text x="59" y="142" textAnchor="middle" fontSize="9.5" fill={T.ink2}>1</text>
        <text x="118" y="142" textAnchor="middle" fontSize="9.5" fill={T.ink2}>Ada</text>
        <text x="59" y="158" textAnchor="middle" fontSize="9.5" fill={T.ink2}>2</text>
        <text x="118" y="158" textAnchor="middle" fontSize="9.5" fill={T.ink2}>Lin</text>
        {/* orders table */}
        <rect x="42" y="190" width="118" height="68" rx="6" fill="#fff" stroke={C.store.stroke} strokeWidth="2" />
        <rect x="42" y="190" width="118" height="24" rx="6" fill={C.store.fill} stroke={C.store.stroke} strokeWidth="2" />
        <text x="101" y="207" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.store.text}>orders</text>
        <text x="62" y="234" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.store.text}>id</text>
        <text x="128" y="234" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.store.text}>user_id</text>
        <text x="62" y="250" textAnchor="middle" fontSize="9.5" fill={T.ink2}>10</text>
        <text x="128" y="250" textAnchor="middle" fontSize="9.5" fill={T.ink2}>2</text>
        {/* join */}
        <path d="M 160 244 L 184 244 L 184 142 L 162 142" fill="none" stroke={C.net.stroke} strokeWidth="2" />
        <path d="M 168 142 L 160 138 L 160 146 Z" fill={C.net.stroke} />
        <text x="214" y="195" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.net.text}>JOIN (FK)</text>
        {/* NoSQL */}
        <Label x="450" y="30" size="13" weight="800" color={T.ink}>NoSQL — flexible documents</Label>
        <rect x="328" y="62" width="248" height="96" rx="8" fill="#fff" stroke={C.store.stroke} strokeWidth="2" />
        <text x="342" y="82" fontSize="10" fontFamily={MONO} fill={C.store.text}>{'{ "id": 1, "name": "Ada",'}</text>
        <text x="354" y="100" fontSize="10" fontFamily={MONO} fill={C.store.text}>{'"tags": ["vip","beta"],'}</text>
        <text x="354" y="118" fontSize="10" fontFamily={MONO} fill={C.store.text}>{'"addr": { "city": "NYC" }'}</text>
        <text x="342" y="136" fontSize="10" fontFamily={MONO} fill={C.store.text}>{'}'}</text>
        <rect x="328" y="170" width="248" height="62" rx="8" fill="#fff" stroke={C.store.stroke} strokeWidth="2" opacity="0.85" />
        <text x="342" y="192" fontSize="10" fontFamily={MONO} fill={C.store.text}>{'{ "id": 2, "name": "Lin",'}</text>
        <text x="354" y="210" fontSize="10" fontFamily={MONO} fill={C.store.text}>{'"phone": "555-0102" }'}</text>
        <text x="450" y="252" textAnchor="middle" fontSize="9.5" fill={T.ink3} fontStyle="italic">each document can differ — no fixed schema</text>
      </svg>
    ),
  },
  {
    category: "Data Storage",
    title: "Database Sharding",
    explanation:
      "Sharding splits one large dataset across many databases (shards), so each holds only a slice of the rows. A shard key (e.g. user ID) and a routing function decide which shard owns each record, letting reads and writes scale far beyond a single machine.",
    points: [
      "Hash sharding spreads keys evenly; range sharding keeps ordered keys together (good for scans).",
      "The shard key choice is critical \u2014 a bad key creates \u201Chot\u201D shards that bottleneck.",
      "Cross-shard queries and transactions are hard; design to keep related data on one shard.",
      "Resharding/rebalancing is expensive \u2014 consistent hashing minimizes data movement.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="20" y="128" w="92" h="48" role="client" label="App" sub="key = u8123" />
        <Arrow x1="112" y1="152" x2="206" y2="152" color={C.client.stroke} />
        <Box x="206" y="118" w="128" h="68" role="net" label="Shard Router" sub="hash(key) % N" />
        <Cylinder x="446" y="44" w="120" h="58" role="store" label="Shard 0" sub="ids 0–3" />
        <Cylinder x="446" y="124" w="120" h="58" role="store" label="Shard 1" sub="ids 4–7" />
        <Cylinder x="446" y="204" w="120" h="58" role="store" label="Shard 2" sub="ids 8–11" />
        <Arrow x1="334" y1="138" x2="446" y2="70" color={C.infra.stroke} dashed />
        <Arrow x1="334" y1="152" x2="446" y2="232" color={C.net.stroke} label="8123 % 3 = 2" lx="392" ly="206" lcolor={C.net.text} />
        <Arrow x1="334" y1="166" x2="446" y2="150" color={C.infra.stroke} dashed />
      </svg>
    ),
  },
  {
    category: "Data Storage",
    title: "Replication (Leader–Follower, Multi-Leader)",
    explanation:
      "Replication keeps copies of the same data on multiple nodes for fault tolerance and read scaling. In leader\u2013follower, one leader takes all writes and streams them to read-only followers. In multi-leader, several nodes accept writes and sync to each other, which requires conflict resolution.",
    points: [
      "Leader\u2013follower: simple, consistent writes; followers serve reads and act as failover targets.",
      "Async replication is fast but risks losing recent writes on leader failure (replication lag).",
      "Multi-leader: writes accepted in many places (e.g. multi-region) but conflicts can occur.",
      "Reading from a lagging follower can return stale data \u2014 use read-your-writes if needed.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <line x1="362" y1="44" x2="362" y2="272" stroke={T.line} strokeWidth="1.5" strokeDasharray="4 4" />
        <Label x="180" y="30" size="12.5" weight="800" color={T.ink}>Leader–Follower</Label>
        <Box x="20" y="58" w="66" h="40" role="client" label="Writer" />
        <Cylinder x="120" y="50" w="80" h="56" role="store" label="Leader" sub="writes" />
        <Arrow x1="86" y1="78" x2="120" y2="78" color={C.client.stroke} label="write" ly="70" />
        <Cylinder x="96" y="184" w="72" h="52" role="store" label="Follower" />
        <Cylinder x="196" y="184" w="72" h="52" role="store" label="Follower" />
        <Arrow x1="150" y1="106" x2="132" y2="184" color={C.infra.stroke} dashed label="replicate" lx="92" ly="150" lcolor={T.ink3} />
        <Arrow x1="170" y1="106" x2="232" y2="184" color={C.infra.stroke} dashed />
        <Box x="272" y="120" w="74" h="40" role="client" label="Readers" />
        <Arrow x1="168" y1="208" x2="272" y2="146" color={C.server.stroke} label="read" lx="232" ly="190" lcolor={C.server.text} />
        <Arrow x1="232" y1="208" x2="278" y2="160" color={C.server.stroke} />
        {/* multi-leader */}
        <Label x="478" y="30" size="12.5" weight="800" color={T.ink}>Multi-Leader</Label>
        <Box x="384" y="54" w="78" h="34" role="client" label="Writer A" />
        <Box x="494" y="54" w="78" h="34" role="client" label="Writer B" />
        <Cylinder x="390" y="116" w="72" h="54" role="store" label="Leader A" />
        <Cylinder x="494" y="116" w="72" h="54" role="store" label="Leader B" />
        <Arrow x1="423" y1="88" x2="423" y2="116" color={C.client.stroke} />
        <Arrow x1="533" y1="88" x2="533" y2="116" color={C.client.stroke} />
        <Arrow x1="462" y1="134" x2="494" y2="134" color={C.net.stroke} head={false} />
        <Arrow x1="494" y1="150" x2="462" y2="150" color={C.net.stroke} label="sync" ly="174" lcolor={C.net.text} />
        <text x="478" y="206" textAnchor="middle" fontSize="9.5" fill={C.cache.text} fontWeight="700">conflicts must be resolved</text>
      </svg>
    ),
  },
  {
    category: "Data Storage",
    title: "CAP Theorem",
    explanation:
      "The CAP theorem says a distributed data store can guarantee at most two of three properties: Consistency, Availability, and Partition tolerance. Because network partitions are unavoidable in practice, the real choice during a partition is between staying consistent (CP) or staying available (AP).",
    points: [
      "Consistency: every read sees the latest write (or an error) \u2014 one agreed-upon value.",
      "Availability: every request gets a (non-error) response, even if possibly stale.",
      "Partition tolerance: the system keeps working despite dropped/delayed network messages.",
      "CP (etcd, HBase) refuses writes to stay correct; AP (Cassandra, Dynamo) stays up but goes eventually consistent.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        {/* triangle */}
        <line x1="190" y1="96" x2="410" y2="96" stroke={C.infra.stroke} strokeWidth="2" />
        <line x1="190" y1="96" x2="300" y2="248" stroke={C.infra.stroke} strokeWidth="2" />
        <line x1="410" y1="96" x2="300" y2="248" stroke={C.infra.stroke} strokeWidth="2" />
        {/* vertices */}
        <circle cx="190" cy="96" r="24" fill={C.client.fill} stroke={C.client.stroke} strokeWidth="2.5" />
        <text x="190" y="101" textAnchor="middle" fontSize="17" fontWeight="800" fill={C.client.text}>C</text>
        <text x="190" y="64" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={T.ink}>Consistency</text>
        <circle cx="410" cy="96" r="24" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="2.5" />
        <text x="410" y="101" textAnchor="middle" fontSize="17" fontWeight="800" fill={C.server.text}>A</text>
        <text x="410" y="64" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={T.ink}>Availability</text>
        <circle cx="300" cy="248" r="24" fill={C.net.fill} stroke={C.net.stroke} strokeWidth="2.5" />
        <text x="300" y="253" textAnchor="middle" fontSize="17" fontWeight="800" fill={C.net.text}>P</text>
        <text x="300" y="285" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={T.ink}>Partition tolerance</text>
        {/* edge labels */}
        <text x="300" y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill={T.ink3}>CA — single node only</text>
        <text x="208" y="186" textAnchor="end" fontSize="10" fontWeight="700" fill={C.net.text}>CP</text>
        <text x="208" y="200" textAnchor="end" fontSize="8.5" fill={T.ink3}>etcd, HBase</text>
        <text x="392" y="186" textAnchor="start" fontSize="10" fontWeight="700" fill={C.net.text}>AP</text>
        <text x="392" y="200" textAnchor="start" fontSize="8.5" fill={T.ink3}>Dynamo, Cassandra</text>
        {/* partition motif */}
        <circle cx="492" cy="244" r="9" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="2" />
        <circle cx="560" cy="244" r="9" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="2" />
        <path d="M 503 244 L 519 240 L 525 248 L 541 244 L 549 244" fill="none" stroke={C.cache.stroke} strokeWidth="2" strokeDasharray="2 3" />
        <text x="526" y="224" textAnchor="middle" fontSize="8.5" fill={C.cache.text} fontWeight="700">partition</text>
      </svg>
    ),
  },
  {
    category: "Data Storage",
    title: "ACID vs BASE",
    explanation:
      "ACID and BASE are two consistency philosophies. ACID (typical of relational DBs) guarantees transactions are all-or-nothing and always leave data correct. BASE (typical of distributed NoSQL) relaxes this for availability and scale, accepting that replicas converge to a consistent state over time.",
    points: [
      "ACID = Atomic, Consistent, Isolated, Durable \u2014 a transaction fully commits or fully rolls back.",
      "BASE = Basically Available, Soft state, Eventually consistent \u2014 stays up, reconciles later.",
      "ACID favors correctness on a single/strongly-coordinated store; reads never see partial writes.",
      "BASE favors uptime and horizontal scale, tolerating brief stale reads across replicas.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <line x1="300" y1="44" x2="300" y2="272" stroke={T.line} strokeWidth="1.5" strokeDasharray="4 4" />
        {/* ACID */}
        <Label x="150" y="30" size="13" weight="800" color={T.ink}>ACID — all-or-nothing</Label>
        <rect x="40" y="70" width="220" height="92" rx="8" fill={C.store.fill} stroke={C.store.stroke} strokeWidth="2" />
        <text x="150" y="90" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={C.store.text}>TRANSACTION</text>
        <text x="56" y="112" fontSize="10" fontFamily={MONO} fill={T.ink}>debit  A  −$50</text>
        <text x="56" y="132" fontSize="10" fontFamily={MONO} fill={T.ink}>credit B  +$50</text>
        <text x="150" y="152" textAnchor="middle" fontSize="9" fill={T.ink3}>both succeed, or neither does</text>
        <Box x="46" y="186" w="92" h="36" role="server" label="COMMIT ✓" />
        <Box x="162" y="186" w="92" h="36" role="cache" label="ROLLBACK ✗" />
        <text x="150" y="244" textAnchor="middle" fontSize="9.5" fill={T.ink2} fontWeight="700">A · C · I · D — strong consistency</text>
        {/* BASE */}
        <Label x="450" y="30" size="13" weight="800" color={T.ink}>BASE — eventual</Label>
        <text x="450" y="70" textAnchor="middle" fontSize="9.5" fill={T.ink3}>write to one node, propagate over time</text>
        <Box x="332" y="86" w="64" h="40" role="store" label="N1" sub="v2 ✓" />
        <Box x="418" y="86" w="64" h="40" role="store" label="N2" sub="v1" />
        <Box x="504" y="86" w="64" h="40" role="store" label="N3" sub="v1" />
        <Arrow x1="396" y1="106" x2="418" y2="106" color={C.queue.stroke} />
        <Arrow x1="482" y1="106" x2="504" y2="106" color={C.queue.stroke} dashed />
        <text x="450" y="152" textAnchor="middle" fontSize="9.5" fill={T.ink3}>…moments later (converged)…</text>
        <Box x="332" y="170" w="64" h="40" role="server" label="N1" sub="v2" />
        <Box x="418" y="170" w="64" h="40" role="server" label="N2" sub="v2" />
        <Box x="504" y="170" w="64" h="40" role="server" label="N3" sub="v2" />
        <text x="450" y="244" textAnchor="middle" fontSize="9.5" fill={T.ink2} fontWeight="700">BA · S · E — stale reads possible</text>
      </svg>
    ),
  },
  /* ====================== CACHING ====================== */
  {
    category: "Caching",
    title: "Caching Strategies",
    explanation:
      "A cache stores hot data in fast memory so most requests avoid the slower database. The strategy defines how reads and writes flow between the application, the cache, and the database \u2014 each trading off freshness, write latency, and durability differently.",
    points: [
      "Cache-aside (lazy): app checks cache, loads from DB on a miss, then fills the cache.",
      "Write-through: every write goes to cache and DB together \u2014 always fresh, slower writes.",
      "Write-back: write to cache, flush to DB later \u2014 fast writes, risk of loss before flush.",
      "Write-around: writes skip the cache and go to DB; the cache fills only on a later read.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <text x="175" y="50" textAnchor="middle" fontSize="9.5" fontFamily={MONO} fontWeight="700" fill={T.ink3}>APP</text>
        <text x="350" y="50" textAnchor="middle" fontSize="9.5" fontFamily={MONO} fontWeight="700" fill={T.ink3}>CACHE</text>
        <text x="510" y="50" textAnchor="middle" fontSize="9.5" fontFamily={MONO} fontWeight="700" fill={T.ink3}>DATABASE</text>
        <line x1="8" y1="120" x2="572" y2="120" stroke={T.lineSoft} strokeWidth="1" />
        <line x1="8" y1="178" x2="572" y2="178" stroke={T.lineSoft} strokeWidth="1" />
        <line x1="8" y1="236" x2="572" y2="236" stroke={T.lineSoft} strokeWidth="1" />

        {/* Row 1: cache-aside */}
        <text x="12" y="95" fontSize="10.5" fontWeight="800" fill={T.ink}>Cache-Aside</text>
        <Box x="149" y="76" w="52" h="32" role="client" label="App" />
        <Box x="321" y="76" w="58" h="32" role="cache" label="Cache" />
        <Cylinder x="483" y="73" w="54" h="38" role="store" label="DB" />
        <Arrow x1="201" y1="92" x2="321" y2="92" color={C.client.stroke} label="get" />
        <Arrow x1="379" y1="98" x2="483" y2="98" color={C.infra.stroke} label="miss" />
        <Arrow x1="483" y1="80" x2="379" y2="80" color={C.queue.stroke} dashed label="fill" />

        {/* Row 2: write-through */}
        <text x="12" y="153" fontSize="10.5" fontWeight="800" fill={T.ink}>Write-Through</text>
        <Box x="149" y="134" w="52" h="32" role="client" label="App" />
        <Box x="321" y="134" w="58" h="32" role="cache" label="Cache" />
        <Cylinder x="483" y="131" w="54" h="38" role="store" label="DB" />
        <Arrow x1="201" y1="150" x2="321" y2="150" color={C.client.stroke} label="write" />
        <Arrow x1="379" y1="150" x2="483" y2="150" color={C.store.stroke} label="sync" lcolor={C.store.text} />

        {/* Row 3: write-back */}
        <text x="12" y="211" fontSize="10.5" fontWeight="800" fill={T.ink}>Write-Back</text>
        <Box x="149" y="192" w="52" h="32" role="client" label="App" />
        <Box x="321" y="192" w="58" h="32" role="cache" label="Cache" />
        <Cylinder x="483" y="189" w="54" h="38" role="store" label="DB" />
        <Arrow x1="201" y1="208" x2="321" y2="208" color={C.client.stroke} label="write" />
        <Arrow x1="379" y1="208" x2="483" y2="208" color={C.queue.stroke} dashed label="async flush" lcolor={C.queue.text} />

        {/* Row 4: write-around */}
        <text x="12" y="266" fontSize="10.5" fontWeight="800" fill={T.ink}>Write-Around</text>
        <Box x="149" y="246" w="52" h="32" role="client" label="App" />
        <Box x="321" y="234" w="58" h="24" role="cache" label="Cache" />
        <Cylinder x="483" y="243" w="54" h="38" role="store" label="DB" />
        <Arrow x1="201" y1="262" x2="483" y2="262" color={C.client.stroke} label="write (bypass cache)" lx="305" ly="258" />
        <Arrow x1="480" y1="250" x2="379" y2="246" color={C.queue.stroke} dashed label="fill on read" lx="432" ly="236" lcolor={C.queue.text} />
      </svg>
    ),
  },
  {
    category: "Caching",
    title: "CDN (Content Delivery Network)",
    explanation:
      "A CDN is a globally distributed network of edge servers that cache content close to users. When someone requests a file, the nearest edge serves it directly; only on a cache miss does the edge fetch from the origin server once, then cache it for everyone nearby. This cuts latency and offloads the origin.",
    points: [
      "Edge PoPs near users serve cached copies \u2014 fast, fewer round-trips over long distances.",
      "On a miss, the edge pulls from origin once and caches it; later requests are local hits.",
      "Great for static assets (images, CSS, JS, video) and cacheable API responses.",
      "Cache control via TTLs and headers; purge/invalidate to push updated content.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="20" y="48" w="86" h="36" role="client" label="User · US" />
        <Box x="20" y="132" w="86" h="36" role="client" label="User · EU" />
        <Box x="20" y="216" w="86" h="36" role="client" label="User · APAC" />
        <Box x="244" y="44" w="104" h="40" role="cache" label="Edge · US" />
        <Box x="244" y="130" w="104" h="40" role="cache" label="Edge · EU" />
        <Box x="244" y="216" w="104" h="40" role="cache" label="Edge · APAC" />
        <Arrow x1="106" y1="66" x2="244" y2="64" color={C.client.stroke} label="nearest" />
        <Arrow x1="106" y1="150" x2="244" y2="150" color={C.client.stroke} label="nearest" />
        <Arrow x1="106" y1="234" x2="244" y2="236" color={C.client.stroke} label="nearest" />
        <Box x="470" y="130" w="108" h="56" role="server" label="Origin" sub="source of truth" />
        <Arrow x1="348" y1="150" x2="470" y2="152" color={C.infra.stroke} dashed label="miss → origin (once)" lx="410" ly="142" />
        <Arrow x1="470" y1="166" x2="348" y2="164" color={C.server.stroke} dashed label="fill edge" lx="410" ly="184" lcolor={C.server.text} />
        <text x="300" y="288" textAnchor="middle" fontSize="10" fill={T.ink3} fontStyle="italic">cached content served from the edge, close to each user</text>
      </svg>
    ),
  },
  {
    category: "Caching",
    title: "Cache Eviction Policies",
    explanation:
      "A cache has limited memory, so when it is full it must evict an existing entry to admit a new one. The eviction policy decides which entry to drop. Different policies optimize for different access patterns by tracking recency, frequency, or age.",
    points: [
      "LRU (Least Recently Used): evict the entry untouched for the longest \u2014 good general default.",
      "LFU (Least Frequently Used): evict the entry with the fewest hits \u2014 keeps popular items.",
      "TTL (Time To Live): each entry expires after a set time, regardless of use \u2014 bounds staleness.",
      "Also FIFO and random; many real caches combine signals (e.g. LRU + TTL).",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="16" y="92" w="78" h="40" role="client" label="PUT E" />
        <Arrow x1="94" y1="112" x2="120" y2="112" color={C.client.stroke} label="full!" ly="104" lcolor={C.cache.text} />
        <rect x="120" y="66" width="456" height="96" rx="10" fill={C.cache.fill} stroke={C.cache.stroke} strokeWidth="2" opacity="0.55" />
        <text x="348" y="60" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.cache.text}>cache — size 4, FULL</text>
        {[
          { k: "A", x: 132, used: "8s", hits: "5", ttl: "30s" },
          { k: "B", x: 240, used: "3s", hits: "7", ttl: "0s ⚠", victim: "ttl" },
          { k: "C", x: 348, used: "70s", hits: "9", ttl: "50s", victim: "lru" },
          { k: "D", x: 456, used: "12s", hits: "1", ttl: "40s", victim: "lfu" },
        ].map((s) => (
          <g key={s.k}>
            <rect x={s.x} y="78" width="96" height="72" rx="7" fill="#fff" stroke={C.cache.stroke} strokeWidth="1.5" />
            <text x={s.x + 48} y="103" textAnchor="middle" fontSize="18" fontWeight="800" fill={C.cache.text}>{s.k}</text>
            <text x={s.x + 48} y="120" textAnchor="middle" fontSize="8.5" fill={T.ink2}>used {s.used}</text>
            <text x={s.x + 48} y="132" textAnchor="middle" fontSize="8.5" fill={T.ink2}>hits {s.hits}</text>
            <text x={s.x + 48} y="144" textAnchor="middle" fontSize="8.5" fill={T.ink2}>ttl {s.ttl}</text>
          </g>
        ))}
        {/* eviction call-outs */}
        <g>
          <path d="M 288 168 L 288 178 L 196 178 L 196 188" fill="none" stroke={C.store.stroke} strokeWidth="2" />
          <path d="M 196 196 L 192 188 L 200 188 Z" fill={C.store.stroke} />
          <text x="196" y="210" textAnchor="middle" fontSize="10" fontWeight="800" fill={C.store.text}>TTL</text>
          <text x="196" y="222" textAnchor="middle" fontSize="8.5" fill={T.ink3}>expired</text>
        </g>
        <g>
          <path d="M 396 168 L 396 196" fill="none" stroke={C.net.stroke} strokeWidth="2" />
          <path d="M 396 204 L 392 196 L 400 196 Z" fill={C.net.stroke} />
          <text x="396" y="222" textAnchor="middle" fontSize="10" fontWeight="800" fill={C.net.text}>LRU</text>
          <text x="396" y="234" textAnchor="middle" fontSize="8.5" fill={T.ink3}>oldest use</text>
        </g>
        <g>
          <path d="M 504 168 L 504 178 L 508 178 L 508 188" fill="none" stroke={C.cache.stroke} strokeWidth="2" />
          <path d="M 508 196 L 504 188 L 512 188 Z" fill={C.cache.stroke} />
          <text x="512" y="210" textAnchor="middle" fontSize="10" fontWeight="800" fill={C.cache.text}>LFU</text>
          <text x="512" y="222" textAnchor="middle" fontSize="8.5" fill={T.ink3}>fewest hits</text>
        </g>
        <text x="300" y="262" textAnchor="middle" fontSize="9.5" fill={T.ink2} fontWeight="600">each policy evicts a different victim from the same full cache</text>
      </svg>
    ),
  },
  {
    category: "Caching",
    title: "Redis Architecture",
    explanation:
      "Redis is an in-memory data store used as a cache, message broker, and fast database. It keeps data in RAM for microsecond access, processes commands on a single thread (avoiding locks), and offers optional persistence to disk plus replication for high availability.",
    points: [
      "In-memory + single-threaded event loop: predictable O(1) ops, no lock contention.",
      "Rich types: strings, hashes, lists, sets, sorted sets, streams, bitmaps, HyperLogLog.",
      "Durability via RDB snapshots and/or the AOF (append-only) command log.",
      "HA & scale: replicas for reads/failover, Sentinel for automatic promotion, Cluster for sharding.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="18" y="118" w="86" h="48" role="client" label="Client" />
        <Arrow x1="104" y1="142" x2="176" y2="142" color={C.client.stroke} label="commands (RESP)" lx="142" ly="132" />
        {/* primary */}
        <rect x="176" y="92" width="158" height="100" rx="10" fill={C.cache.fill} stroke={C.cache.stroke} strokeWidth="2.5" />
        <text x="255" y="114" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.cache.text}>Redis Primary</text>
        <text x="255" y="132" textAnchor="middle" fontSize="9" fill={C.cache.text}>in-memory · single thread</text>
        <line x1="190" y1="142" x2="320" y2="142" stroke={C.cache.stroke} strokeWidth="1" opacity="0.4" />
        <text x="255" y="158" textAnchor="middle" fontSize="8.5" fill={T.ink2}>strings · hashes · lists</text>
        <text x="255" y="172" textAnchor="middle" fontSize="8.5" fill={T.ink2}>sets · sorted sets · streams</text>
        {/* persistence */}
        <Cylinder x="198" y="222" w="114" h="52" role="store" label="Disk" sub="RDB + AOF" />
        <Arrow x1="255" y1="192" x2="255" y2="222" color={C.store.stroke} dashed label="persist" lx="290" ly="210" lcolor={C.store.text} />
        {/* replica */}
        <Box x="416" y="92" w="162" h="56" role="cache" label="Replica" sub="reads / failover target" />
        <Arrow x1="334" y1="120" x2="416" y2="120" color={C.infra.stroke} dashed label="replicate" />
        {/* sentinel */}
        <Box x="416" y="186" w="162" h="48" role="infra" label="Sentinel / Cluster" sub="monitor · promote · shard" />
        <Arrow x1="416" y1="210" x2="334" y2="178" color={C.infra.stroke} dashed label="watch" lx="372" ly="208" />
      </svg>
    ),
  },
  {
    category: "Networking",
    title: "DNS Resolution Flow",
    explanation:
      "DNS translates a human-friendly hostname like example.com into the IP address machines actually route to. A recursive resolver does the legwork \u2014 it walks the hierarchy from the root to the TLD (.com) server to the domain\u2019s authoritative server \u2014 caching each answer by TTL so future lookups are instant.",
    points: [
      "Hierarchy: root \u2192 TLD (.com) \u2192 authoritative name server, which holds the real A/AAAA record.",
      "The recursive resolver queries iteratively on the client\u2019s behalf, then caches the result.",
      "Caching at the resolver, OS, and browser layers means most lookups never reach the root.",
      "Record types: A/AAAA (address), CNAME (alias), MX (mail), NS (delegation).",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <text x="300" y="16" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={T.ink3}>Iterative resolution &#8212; the resolver does the walking, then caches</text>
        <Box x="8" y="126" w="96" h="48" role="client" label="Stub" sub="browser / OS" />
        <Box x="190" y="120" w="128" h="60" role="server" label="Recursive" sub="Resolver &#183; cache" />
        <Box x="452" y="24" w="140" h="46" role="infra" label="Root NS" sub="knows .com TLD" />
        <Box x="452" y="126" w="140" h="46" role="net" label="TLD NS (.com)" sub="knows authoritative" />
        <Box x="452" y="228" w="140" h="48" role="store" label="Authoritative" sub="A: 93.184.216.34" />
        {/* outbound queries */}
        <Arrow x1="104" y1="150" x2="190" y2="150" color={C.client.stroke} label="1" lx="146" ly="143" />
        <Arrow x1="318" y1="138" x2="452" y2="52" color={C.net.stroke} label="2" lx="372" ly="88" />
        <Arrow x1="318" y1="150" x2="452" y2="150" color={C.net.stroke} label="3" lx="386" ly="143" />
        <Arrow x1="318" y1="162" x2="452" y2="248" color={C.net.stroke} label="4" lx="372" ly="220" />
        {/* dashed referrals / answer back */}
        <Arrow x1="452" y1="64" x2="322" y2="132" dashed color={T.ink3} head={false} />
        <Arrow x1="452" y1="160" x2="322" y2="160" dashed color={T.ink3} head={false} />
        <Arrow x1="452" y1="240" x2="322" y2="170" dashed color={C.store.text} head={false} />
        <Arrow x1="190" y1="168" x2="104" y2="168" dashed color={C.server.stroke} label="5  IP" lx="146" ly="184" />
        <text x="386" y="100" textAnchor="middle" fontSize="7.5" fill={T.ink3}>refer .com</text>
        <text x="386" y="176" textAnchor="middle" fontSize="7.5" fill={T.ink3}>refer NS</text>
        <text x="392" y="210" textAnchor="middle" fontSize="7.5" fill={C.store.text}>answer</text>
      </svg>
    ),
  },
  {
    category: "Networking",
    title: "HTTP vs HTTPS",
    explanation:
      "HTTP sends requests and responses as plaintext, so anyone on the network path can read or tamper with them. HTTPS wraps the same HTTP messages in a TLS tunnel \u2014 client and server negotiate keys once, then encrypt everything \u2014 so an eavesdropper sees only ciphertext.",
    points: [
      "HTTPS = HTTP + TLS: it adds encryption, integrity, and server authentication.",
      "A TLS handshake exchanges keys once; bulk traffic then uses fast symmetric crypto.",
      "Certificates signed by a trusted CA prove you reached the real server, not an impostor.",
      "Default ports: HTTP 80, HTTPS 443; browsers now flag plain HTTP as \u201cNot Secure\u201d.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        {/* HTTP */}
        <text x="14" y="22" fontSize="11" fontWeight="800" fill={C.cache.text}>HTTP &#183; plaintext</text>
        <Box x="20" y="44" w="96" h="44" role="client" label="Client" />
        <Box x="470" y="44" w="106" h="44" role="server" label="Server" />
        <Arrow x1="116" y1="66" x2="470" y2="66" color={C.client.stroke} />
        <rect x="206" y="50" width="176" height="26" rx="4" fill="#fff" stroke={C.cache.stroke} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="294" y="67" textAnchor="middle" fontSize="10" fontFamily={MONO} fill={C.cache.text}>GET /login?pw=1234</text>
        <Box x="258" y="100" w="72" h="26" role="cache" label="Sniffer" />
        <line x1="294" y1="76" x2="294" y2="100" stroke={C.cache.stroke} strokeWidth="1.3" strokeDasharray="3 3" />
        <text x="338" y="116" fontSize="8.5" fill={C.cache.text}>reads it all</text>
        <line x1="14" y1="150" x2="586" y2="150" stroke={T.line} strokeWidth="1" />
        {/* HTTPS */}
        <text x="14" y="178" fontSize="11" fontWeight="800" fill={C.server.text}>HTTPS &#183; TLS encrypted</text>
        <Box x="20" y="200" w="96" h="44" role="client" label="Client" />
        <Box x="470" y="200" w="106" h="44" role="server" label="Server" />
        <rect x="116" y="214" width="354" height="16" rx="8" fill={T.accentSoft} stroke={T.accent} strokeWidth="1.3" />
        <text x="293" y="226" textAnchor="middle" fontSize="9" fontWeight="700" fill={T.accentInk}>encrypted TLS tunnel</text>
        <path d="M286 192 a8 8 0 0 1 16 0 v6" fill="none" stroke={C.server.text} strokeWidth="2.4" />
        <rect x="280" y="198" width="28" height="18" rx="3" fill="#dcfce7" stroke={C.server.text} strokeWidth="2" />
        <circle cx="294" cy="207" r="2.4" fill={C.server.text} />
        <rect x="206" y="250" width="176" height="24" rx="4" fill="#f1f5f9" stroke={C.server.stroke} strokeWidth="1.5" />
        <text x="294" y="266" textAnchor="middle" fontSize="10" fontFamily={MONO} fill={C.server.text}>a3f9!b7q#x2&#183;%k</text>
        <Box x="430" y="250" w="92" h="24" role="infra" label="Sniffer" />
        <text x="430" y="290" fontSize="8.5" fill={T.ink3}>sees only ciphertext</text>
      </svg>
    ),
  },
  {
    category: "Networking",
    title: "WebSockets vs HTTP Polling",
    explanation:
      "HTTP polling fakes real-time updates by having the client ask \u201canything new?\u201d on a timer \u2014 most responses come back empty, wasting round-trips. A WebSocket upgrades a single HTTP connection into a persistent, full-duplex channel so the server can push data the instant it appears.",
    points: [
      "Polling: repeated request/response \u2014 simple, but high latency and wasted overhead.",
      "Long-polling holds the request open until data arrives \u2014 fewer empty replies, still one-shot.",
      "WebSocket: one handshake (HTTP Upgrade \u2192 101), then a lasting bidirectional pipe.",
      "Use WebSockets for chat, live feeds, and games; polling is fine for infrequent updates.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        {/* polling */}
        <text x="14" y="18" fontSize="11" fontWeight="800" fill={C.cache.text}>HTTP Polling</text>
        <Box x="24" y="26" w="92" h="28" role="client" label="Client" />
        <Box x="484" y="26" w="92" h="28" role="server" label="Server" />
        <line x1="70" y1="54" x2="70" y2="148" stroke={T.line} strokeWidth="1.2" strokeDasharray="3 3" />
        <line x1="530" y1="54" x2="530" y2="148" stroke={T.line} strokeWidth="1.2" strokeDasharray="3 3" />
        <Arrow x1="70" y1="68" x2="530" y2="68" color={C.client.stroke} label="GET /updates" lx="240" ly="63" />
        <Arrow x1="530" y1="80" x2="70" y2="80" dashed color={T.ink3} label="204 no data" lx="360" ly="76" />
        <Arrow x1="70" y1="100" x2="530" y2="100" color={C.client.stroke} label="GET /updates" lx="240" ly="95" />
        <Arrow x1="530" y1="112" x2="70" y2="112" dashed color={T.ink3} label="204 no data" lx="360" ly="108" />
        <Arrow x1="70" y1="132" x2="530" y2="132" color={C.client.stroke} label="GET /updates" lx="240" ly="127" />
        <Arrow x1="530" y1="144" x2="70" y2="144" dashed color={C.server.stroke} label="200 + data" lx="360" ly="140" />
        <line x1="14" y1="160" x2="586" y2="160" stroke={T.line} strokeWidth="1" />
        {/* websocket */}
        <text x="14" y="180" fontSize="11" fontWeight="800" fill={C.server.text}>WebSocket</text>
        <Box x="24" y="188" w="92" h="28" role="client" label="Client" />
        <Box x="484" y="188" w="92" h="28" role="server" label="Server" />
        <line x1="70" y1="216" x2="70" y2="296" stroke={T.line} strokeWidth="1.2" strokeDasharray="3 3" />
        <line x1="530" y1="216" x2="530" y2="296" stroke={T.line} strokeWidth="1.2" strokeDasharray="3 3" />
        <Arrow x1="70" y1="230" x2="530" y2="230" color={C.client.stroke} label="GET Upgrade: websocket" lx="270" ly="225" />
        <Arrow x1="530" y1="242" x2="70" y2="242" dashed color={C.server.stroke} label="101 Switching Protocols" lx="290" ly="238" />
        <line x1="70" y1="258" x2="530" y2="258" stroke={T.accent} strokeWidth="3" />
        <line x1="70" y1="263" x2="530" y2="263" stroke={T.accent} strokeWidth="3" />
        <text x="300" y="276" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={T.accentInk}>one open connection &#183; full-duplex</text>
        <Arrow x1="530" y1="288" x2="70" y2="288" color={C.server.stroke} label="push event" lx="360" ly="296" />
      </svg>
    ),
  },
  {
    category: "Networking",
    title: "REST vs GraphQL vs gRPC",
    explanation:
      "These are three styles for service APIs. REST exposes many resource URLs over HTTP and often over- or under-fetches; GraphQL exposes one endpoint where the client asks for exactly the fields it needs; gRPC uses a binary Protobuf contract over HTTP/2 for fast, strongly-typed, streaming calls.",
    points: [
      "REST: resource-oriented and cache-friendly, but multiple round-trips and fixed response shapes.",
      "GraphQL: a single endpoint with client-specified queries \u2014 no over-fetching, great for varied UIs.",
      "gRPC: contract-first .proto, compact binary frames, HTTP/2 multiplexing and streaming.",
      "Rule of thumb: public/cacheable \u2192 REST; flexible clients \u2192 GraphQL; internal RPC \u2192 gRPC.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <line x1="200" y1="14" x2="200" y2="286" stroke={T.line} strokeWidth="1" />
        <line x1="400" y1="14" x2="400" y2="286" stroke={T.line} strokeWidth="1" />
        {/* REST */}
        <text x="100" y="26" textAnchor="middle" fontSize="12" fontWeight="800" fill={T.ink}>REST</text>
        <Box x="22" y="42" w="64" h="32" role="client" label="Client" />
        <rect x="112" y="40" width="78" height="22" rx="5" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="1.6" />
        <text x="151" y="55" textAnchor="middle" fontSize="8" fontFamily={MONO} fill={C.server.text}>/users</text>
        <rect x="112" y="74" width="78" height="22" rx="5" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="1.6" />
        <text x="151" y="89" textAnchor="middle" fontSize="7.2" fontFamily={MONO} fill={C.server.text}>/users/1/posts</text>
        <rect x="112" y="108" width="78" height="22" rx="5" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="1.6" />
        <text x="151" y="123" textAnchor="middle" fontSize="7.2" fontFamily={MONO} fill={C.server.text}>/posts/1/likes</text>
        <Arrow x1="86" y1="56" x2="112" y2="51" color={C.client.stroke} head={false} width="1.4" />
        <Arrow x1="86" y1="60" x2="112" y2="85" color={C.client.stroke} head={false} width="1.4" />
        <Arrow x1="86" y1="64" x2="112" y2="119" color={C.client.stroke} head={false} width="1.4" />
        <text x="100" y="156" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.cache.text}>3 calls &#183; over-fetch</text>
        <text x="100" y="170" textAnchor="middle" fontSize="8.5" fill={T.ink3}>JSON over HTTP/1.1</text>
        {/* GraphQL */}
        <text x="300" y="26" textAnchor="middle" fontSize="12" fontWeight="800" fill={T.ink}>GraphQL</text>
        <Box x="226" y="46" w="64" h="32" role="client" label="Client" />
        <Box x="316" y="44" w="74" h="38" role="net" label="/graphql" />
        <Arrow x1="290" y1="62" x2="316" y2="62" color={C.client.stroke} width="1.6" />
        <rect x="246" y="96" width="120" height="34" rx="5" fill="#fff" stroke={C.net.stroke} strokeWidth="1.3" />
        <text x="306" y="110" textAnchor="middle" fontSize="7.5" fontFamily={MONO} fill={C.net.text}>{"{ user { name,"}</text>
        <text x="306" y="122" textAnchor="middle" fontSize="7.5" fontFamily={MONO} fill={C.net.text}>{"  posts } }"}</text>
        <Cylinder x="262" y="142" w="34" h="26" role="store" label="" />
        <Cylinder x="306" y="142" w="34" h="26" role="store" label="" />
        <line x1="340" y1="82" x2="290" y2="142" stroke={C.net.stroke} strokeWidth="1.1" strokeDasharray="3 3" />
        <line x1="350" y1="82" x2="323" y2="142" stroke={C.net.stroke} strokeWidth="1.1" strokeDasharray="3 3" />
        <text x="300" y="186" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.server.text}>1 request &#183; exact fields</text>
        {/* gRPC */}
        <text x="500" y="26" textAnchor="middle" fontSize="12" fontWeight="800" fill={T.ink}>gRPC</text>
        <Box x="424" y="60" w="64" h="34" role="client" label="Stub" />
        <Box x="512" y="58" w="74" h="38" role="server" label="Service" />
        <Arrow x1="488" y1="71" x2="512" y2="71" color={C.queue.text} width="1.6" />
        <Arrow x1="512" y1="83" x2="488" y2="83" color={C.queue.text} width="1.6" />
        <text x="505" y="116" textAnchor="middle" fontSize="8" fontFamily={MONO} fill={C.queue.text}>0110 1001 binary</text>
        <text x="505" y="150" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.queue.text}>Protobuf / HTTP2</text>
        <text x="505" y="164" textAnchor="middle" fontSize="8.5" fill={T.ink3}>multiplexed &#183; streaming</text>
      </svg>
    ),
  },
  {
    category: "Messaging & Queues",
    title: "Message Queues vs Event Streams",
    explanation:
      "A message queue delivers each message to one consumer and deletes it on acknowledgment \u2014 work is consumed once and disappears. An event stream is an append-only log: events are retained and ordered, and many independent consumers read at their own offset, so the same events can be reprocessed or replayed.",
    points: [
      "Queue: competing consumers share the load; a message is processed once, then removed.",
      "Stream/log: events persist for a retention window and can be replayed from any offset.",
      "Streams preserve order per partition and support multiple independent consumer groups.",
      "Queues fit task distribution; streams fit event sourcing, analytics, and fan-out.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        {/* queue */}
        <text x="14" y="20" fontSize="11" fontWeight="800" fill={C.queue.text}>Message Queue &#183; consume &amp; delete</text>
        <Box x="14" y="62" w="82" h="38" role="server" label="Producer" />
        <Arrow x1="96" y1="81" x2="120" y2="81" color={C.server.stroke} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={120 + i * 46} y={66} width={42} height={30} rx={5} fill={C.queue.fill} stroke={C.queue.stroke} strokeWidth="1.6" />
            <text x={141 + i * 46} y={85} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={C.queue.text}>m{4 - i}</text>
          </g>
        ))}
        <Arrow x1="304" y1="81" x2="430" y2="81" color={C.queue.text} label="dequeue" lx="367" ly="76" />
        <Box x="430" y="62" w="100" h="38" role="client" label="Consumer" />
        <text x="300" y="118" textAnchor="middle" fontSize="8.5" fill={T.ink3}>delivered once, then removed from the queue</text>
        <line x1="14" y1="138" x2="586" y2="138" stroke={T.line} strokeWidth="1" />
        {/* stream */}
        <text x="14" y="160" fontSize="11" fontWeight="800" fill={C.net.text}>Event Stream &#183; append-only log, retained</text>
        <Box x="14" y="206" w="82" h="38" role="server" label="Producer" />
        <Arrow x1="96" y1="225" x2="120" y2="225" color={C.server.stroke} />
        <rect x="120" y="208" width="280" height="34" rx="5" fill={C.infra.fill} stroke={C.infra.stroke} strokeWidth="1.8" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={120 + (i + 1) * 56} y1="208" x2={120 + (i + 1) * 56} y2="242" stroke={C.infra.stroke} strokeWidth="1" opacity="0.5" />
            <text x={148 + i * 56} y="200" textAnchor="middle" fontSize="8" fill={T.ink3}>{i}</text>
            <text x={148 + i * 56} y="229" textAnchor="middle" fontSize="8.5" fontFamily={MONO} fill={T.ink2}>e{i}</text>
          </g>
        ))}
        <Box x="466" y="176" w="118" h="28" role="client" label="Group A &#183; off 4" />
        <Box x="466" y="246" w="118" h="28" role="client" label="Group B &#183; off 2" />
        <Arrow x1="400" y1="216" x2="466" y2="190" dashed color={C.client.stroke} head />
        <Arrow x1="288" y1="226" x2="466" y2="260" dashed color={C.client.stroke} head />
        <text x="300" y="292" textAnchor="middle" fontSize="8.5" fill={T.ink3}>replayable &#183; each consumer group tracks its own offset</text>
      </svg>
    ),
  },
  {
    category: "Messaging & Queues",
    title: "Pub/Sub Pattern",
    explanation:
      "In publish/subscribe, publishers send messages to a named topic instead of to specific receivers, and the broker fans each message out to every current subscriber. Publishers and subscribers never reference each other, so either side can be added or removed without touching the other.",
    points: [
      "Decoupling: publishers know only the topic, not who (if anyone) is listening.",
      "One message is delivered to every subscriber of the topic \u2014 one-to-many fan-out.",
      "Subscribers can join or leave at any time; the topic absorbs the change.",
      "Great for event notifications, cache invalidation, and broadcasting state changes.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="18" y="128" w="100" h="46" role="server" label="Publisher" />
        <Arrow x1="118" y1="151" x2="208" y2="151" color={C.server.stroke} label="publish" lx="163" ly="144" />
        <rect x="208" y="108" width="122" height="84" rx="10" fill={C.net.fill} stroke={C.net.stroke} strokeWidth="2.4" />
        <text x="269" y="144" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.net.text}>Topic</text>
        <text x="269" y="162" textAnchor="middle" fontSize="9" fill={C.net.text}>broker / channel</text>
        <Box x="430" y="38" w="156" h="48" role="client" label="Subscriber A" sub="email service" />
        <Box x="430" y="128" w="156" h="48" role="client" label="Subscriber B" sub="search indexer" />
        <Box x="430" y="218" w="156" h="48" role="client" label="Subscriber C" sub="audit log" />
        <Arrow x1="330" y1="138" x2="430" y2="62" color={C.net.stroke} label="copy" lx="392" ly="92" />
        <Arrow x1="330" y1="150" x2="430" y2="150" color={C.net.stroke} label="copy" lx="392" ly="143" />
        <Arrow x1="330" y1="162" x2="430" y2="242" color={C.net.stroke} label="copy" lx="392" ly="214" />
        <text x="269" y="232" textAnchor="middle" fontSize="8.5" fill={T.ink3}>publisher never names</text>
        <text x="269" y="245" textAnchor="middle" fontSize="8.5" fill={T.ink3}>its subscribers</text>
      </svg>
    ),
  },
  {
    category: "Messaging & Queues",
    title: "Kafka Architecture",
    explanation:
      "Kafka is a distributed commit log. A topic is split into partitions \u2014 each an ordered, append-only sequence \u2014 and producers route records to partitions by key. A consumer group assigns one consumer per partition so they read in parallel, while partitions are replicated across brokers for durability.",
    points: [
      "Order is guaranteed within a partition, not across the whole topic.",
      "Producers pick a partition by key (hash) so related records stay ordered together.",
      "A consumer group splits partitions among its members; each tracks its own offset.",
      "Replication keeps copies on multiple brokers, so a broker can fail without data loss.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="8" y="126" w="84" h="46" role="server" label="Producer" sub="key &#8594; part." />
        <rect x="116" y="26" width="300" height="248" rx="10" fill="#fff" stroke={C.infra.stroke} strokeWidth="1.8" />
        <text x="266" y="44" textAnchor="middle" fontSize="11" fontWeight="800" fill={T.ink2}>Topic: orders</text>
        {[0, 1, 2].map((p) => (
          <g key={p}>
            <text x="132" y={78 + p * 64} fontSize="9.5" fontWeight="800" fill={C.queue.text}>P{p}</text>
            <rect x="150" y={62 + p * 64} width="250" height="30" rx="5" fill={C.queue.fill} stroke={C.queue.stroke} strokeWidth="1.6" />
            {[1, 2, 3, 4].map((d) => (
              <line key={d} x1={150 + d * 50} y1={62 + p * 64} x2={150 + d * 50} y2={92 + p * 64} stroke={C.queue.stroke} strokeWidth="0.8" opacity="0.5" />
            ))}
            <text x="392" y={104 + p * 64} fontSize="7.5" fill={T.ink3}>offset &#8594;</text>
          </g>
        ))}
        <Arrow x1="92" y1="140" x2="150" y2="77" color={C.server.stroke} width="1.5" />
        <Arrow x1="92" y1="156" x2="150" y2="205" color={C.server.stroke} width="1.5" />
        <rect x="446" y="40" width="146" height="220" rx="10" fill={C.client.fill} stroke={C.client.stroke} strokeWidth="1.8" opacity="0.55" />
        <text x="519" y="58" textAnchor="middle" fontSize="10" fontWeight="800" fill={C.client.text}>Consumer Group</text>
        {[0, 1, 2].map((p) => (
          <g key={p}>
            <rect x="462" y={70 + p * 60} width="114" height="34" rx="6" fill="#fff" stroke={C.client.stroke} strokeWidth="1.6" />
            <text x="519" y={91 + p * 60} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.client.text}>C{p} &#8592; P{p}</text>
            <Arrow x1="400" y1={77 + p * 64} x2="462" y2={87 + p * 60} dashed color={C.client.stroke} head width="1.3" />
          </g>
        ))}
        <text x="300" y="292" textAnchor="middle" fontSize="8.5" fill={T.ink3}>ordered within a partition &#183; partitions replicated across brokers</text>
      </svg>
    ),
  },
  {
    category: "Messaging & Queues",
    title: "Dead Letter Queues",
    explanation:
      "A dead letter queue (DLQ) is a holding area for messages that can\u2019t be processed. After a consumer retries a message a set number of times and still fails, the broker moves the \u201cpoison\u201d message to the DLQ instead of blocking the main queue \u2014 where it can be inspected, fixed, or replayed later.",
    points: [
      "Keeps one bad (\u201cpoison\u201d) message from stalling the entire queue.",
      "Triggered after a configured max-retry / max-delivery count is exceeded.",
      "Preserves the failed message plus metadata for debugging and replay.",
      "Pair with alerting so a growing DLQ surfaces real processing bugs fast.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="10" y="118" w="80" h="42" role="server" label="Producer" />
        <Arrow x1="90" y1="139" x2="120" y2="139" color={C.server.stroke} label="enqueue" lx="105" ly="132" />
        <rect x="120" y="118" width="120" height="42" rx="7" fill={C.queue.fill} stroke={C.queue.stroke} strokeWidth="2" />
        <text x="180" y="144" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.queue.text}>Main Queue</text>
        <Arrow x1="240" y1="139" x2="300" y2="139" color={C.queue.text} label="deliver" lx="270" ly="132" />
        <Box x="300" y="114" w="112" h="50" role="client" label="Consumer" sub="process()" />
        {/* retry loop */}
        <path d="M356 114 C 356 92, 408 92, 408 116" fill="none" stroke={C.infra.stroke} strokeWidth="1.6" strokeDasharray="4 3" />
        <path d="M408 116 l -5 -7 l 9 1 Z" fill={C.infra.stroke} />
        <text x="382" y="88" textAnchor="middle" fontSize="8.5" fill={T.ink2}>retry &#215;3</text>
        {/* success */}
        <Arrow x1="412" y1="130" x2="470" y2="130" color={C.server.stroke} label="ack" lx="440" ly="124" />
        <Box x="470" y="110" w="120" h="44" role="server" label="Downstream" sub="continue" />
        {/* failure to DLQ */}
        <Arrow x1="356" y1="164" x2="356" y2="214" color={C.cache.stroke} label="retries exhausted" lx="356" ly="190" />
        <rect x="296" y="214" width="120" height="48" rx="7" fill={C.cache.fill} stroke={C.cache.stroke} strokeWidth="2.2" />
        <text x="356" y="234" textAnchor="middle" fontSize="11" fontWeight="800" fill={C.cache.text}>Dead Letter Q</text>
        <text x="356" y="250" textAnchor="middle" fontSize="8.5" fill={C.cache.text}>poison messages</text>
        <Arrow x1="416" y1="238" x2="470" y2="238" color={C.infra.stroke} dashed label="inspect" lx="443" ly="232" />
        <Box x="470" y="214" w="120" h="48" role="infra" label="Ops / Alert" sub="fix &amp; replay" />
      </svg>
    ),
  },
  {
    category: "Microservices",
    title: "API Gateway Pattern",
    explanation:
      "An API gateway is a single entry point that sits in front of many backend services. Clients call the gateway, which handles cross-cutting concerns \u2014 authentication, rate limiting, routing, and response aggregation \u2014 then forwards each request to the right service, hiding the internal structure.",
    points: [
      "One front door for all clients; internal services aren\u2019t exposed directly.",
      "Centralizes auth, TLS termination, rate limiting, and logging.",
      "Routes by path/host and can aggregate several service calls into one response.",
      "Trade-off: a powerful component that can become a bottleneck or single point of failure.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="10" y="86" w="92" h="44" role="client" label="Web App" />
        <Box x="10" y="168" w="92" h="44" role="client" label="Mobile" />
        <rect x="176" y="44" width="150" height="212" rx="10" fill={C.net.fill} stroke={C.net.stroke} strokeWidth="2.4" />
        <text x="251" y="70" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.net.text}>API Gateway</text>
        {["authentication", "rate limiting", "routing", "aggregation", "TLS / logging"].map((t, i) => (
          <text key={i} x="196" y={98 + i * 26} fontSize="9.5" fill={C.net.text}>&#8226; {t}</text>
        ))}
        <Arrow x1="102" y1="108" x2="176" y2="120" color={C.client.stroke} />
        <Arrow x1="102" y1="190" x2="176" y2="178" color={C.client.stroke} />
        {["User Service", "Order Service", "Payment Service", "Catalog Service"].map((s, i) => (
          <g key={i}>
            <Box x="410" y={44 + i * 56} w="168" h="44" role="server" label={s} />
            <Arrow x1="326" y1="150" x2="410" y2={66 + i * 56} color={C.net.stroke} width="1.4" />
          </g>
        ))}
        <text x="251" y="244" textAnchor="middle" fontSize="8" fill={C.net.text}>routes &amp; aggregates</text>
      </svg>
    ),
  },
  {
    category: "Microservices",
    title: "Service Mesh",
    explanation:
      "A service mesh moves networking concerns out of application code and into a sidecar proxy deployed next to each service. The proxies form a data plane that carries service-to-service traffic, while a control plane configures them centrally \u2014 adding mutual TLS, retries, load balancing, and telemetry without code changes.",
    points: [
      "A sidecar proxy beside each service intercepts all inbound/outbound traffic.",
      "The control plane pushes policy, routing, and certificates to every proxy.",
      "Delivers mTLS, retries, timeouts, and metrics uniformly \u2014 no app changes.",
      "Cost: extra proxies add latency, resource use, and operational complexity.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <rect x="170" y="18" width="260" height="46" rx="9" fill={C.net.fill} stroke={C.net.stroke} strokeWidth="2.2" />
        <text x="300" y="38" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.net.text}>Control Plane</text>
        <text x="300" y="54" textAnchor="middle" fontSize="9" fill={C.net.text}>config &#183; policy &#183; certificates</text>
        {[0, 1, 2].map((i) => {
          const x = 24 + i * 194;
          const names = ["Service A", "Service B", "Service C"];
          return (
            <g key={i}>
              <rect x={x} y={150} width={164} height={112} rx={10} fill={C.infra.fill} stroke={C.infra.stroke} strokeWidth="1.8" />
              <rect x={x + 16} y={164} width={132} height={40} rx={7} fill={C.server.fill} stroke={C.server.stroke} strokeWidth="1.8" />
              <text x={x + 82} y={188} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.server.text}>{names[i]}</text>
              <rect x={x + 16} y={212} width={132} height={36} rx={7} fill={C.net.fill} stroke={C.net.stroke} strokeWidth="1.8" />
              <text x={x + 82} y={234} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.net.text}>sidecar proxy</text>
              <Arrow x1={x + 90} y1={64} x2={x + 82} y2={212} dashed color={C.net.stroke} width="1.3" head />
            </g>
          );
        })}
        <Arrow x1="188" y1="230" x2="218" y2="230" color={C.queue.text} label="mTLS" lx="203" ly="224" />
        <Arrow x1="382" y1="230" x2="412" y2="230" color={C.queue.text} label="mTLS" lx="397" ly="224" />
        <text x="300" y="286" textAnchor="middle" fontSize="8.5" fill={T.ink3}>app code untouched &#183; proxies handle traffic, security &amp; telemetry</text>
      </svg>
    ),
  },
  {
    category: "Microservices",
    title: "Circuit Breaker Pattern",
    explanation:
      "A circuit breaker protects a caller from a failing dependency. It watches the failure rate: while healthy it stays Closed and lets calls through; once failures cross a threshold it trips Open and fails fast; after a cooldown it moves to Half-Open to test with a trial request before fully closing again.",
    points: [
      "Closed \u2192 normal traffic flows; failures are counted.",
      "Open \u2192 calls fail instantly, giving the sick service time to recover.",
      "Half-Open \u2192 a few probe requests decide whether to close or re-open.",
      "Prevents cascading failures from endlessly retrying a dead dependency.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <rect x="44" y="46" width="150" height="66" rx="10" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="2.4" />
        <text x="119" y="76" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.server.text}>CLOSED</text>
        <text x="119" y="94" textAnchor="middle" fontSize="9" fill={C.server.text}>calls pass through</text>
        <rect x="406" y="46" width="150" height="66" rx="10" fill={C.cache.fill} stroke={C.cache.stroke} strokeWidth="2.4" />
        <text x="481" y="76" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.cache.text}>OPEN</text>
        <text x="481" y="94" textAnchor="middle" fontSize="9" fill={C.cache.text}>fail fast, no calls</text>
        <rect x="225" y="200" width="150" height="66" rx="10" fill={C.store.fill} stroke={C.store.stroke} strokeWidth="2.4" />
        <text x="300" y="230" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.store.text}>HALF-OPEN</text>
        <text x="300" y="248" textAnchor="middle" fontSize="9" fill={C.store.text}>send trial request</text>
        <Arrow x1="194" y1="66" x2="406" y2="66" color={C.cache.stroke} label="failures &gt; threshold" lx="300" ly="58" />
        <Arrow x1="470" y1="112" x2="338" y2="200" color={C.store.stroke} label="cooldown elapsed" lx="448" ly="156" />
        <Arrow x1="240" y1="200" x2="130" y2="112" color={C.server.stroke} label="probe ok" lx="150" ly="170" />
        <Arrow x1="320" y1="200" x2="440" y2="112" dashed color={C.cache.stroke} label="probe fails" lx="412" ly="180" />
        <text x="300" y="290" textAnchor="middle" fontSize="8.5" fill={T.ink3}>while OPEN, callers get an instant error instead of hammering a sick service</text>
      </svg>
    ),
  },
  {
    category: "Microservices",
    title: "Saga Pattern",
    explanation:
      "A saga implements a distributed transaction as a sequence of local transactions, one per service. If any step fails, the saga runs compensating actions that semantically undo the previously completed steps \u2014 there\u2019s no global lock, so each service commits its own work and consistency is restored by rollback logic.",
    points: [
      "Replaces a single distributed (2PC) lock with a chain of local commits.",
      "Each forward step has a matching compensating action to undo it.",
      "On failure, compensations run in reverse to roll the system back.",
      "Orchestrated (a coordinator drives steps) or choreographed (services react to events).",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <text x="300" y="22" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={T.ink3}>forward steps commit locally &#8594; on failure, compensate in reverse</text>
        <Box x="22" y="64" w="126" h="52" role="server" label="1 &#183; Order" sub="create order" />
        <Box x="237" y="64" w="126" h="52" role="server" label="2 &#183; Payment" sub="charge card" />
        <Box x="452" y="64" w="126" h="52" role="server" label="3 &#183; Inventory" sub="reserve stock" />
        <Arrow x1="148" y1="90" x2="237" y2="90" color={C.server.stroke} label="ok" lx="192" ly="84" />
        <Arrow x1="363" y1="90" x2="452" y2="90" color={C.server.stroke} label="ok" lx="407" ly="84" />
        <line x1="500" y1="122" x2="530" y2="152" stroke={C.cache.stroke} strokeWidth="3" />
        <line x1="530" y1="122" x2="500" y2="152" stroke={C.cache.stroke} strokeWidth="3" />
        <text x="515" y="170" textAnchor="middle" fontSize="9" fontWeight="800" fill={C.cache.text}>fails!</text>
        <Box x="237" y="206" w="126" h="48" role="cache" label="C2 &#183; Refund" />
        <Box x="22" y="206" w="126" h="48" role="cache" label="C1 &#183; Cancel order" />
        <Arrow x1="498" y1="116" x2="363" y2="214" dashed color={C.cache.stroke} label="compensate" lx="452" ly="172" />
        <Arrow x1="237" y1="230" x2="148" y2="230" dashed color={C.cache.stroke} label="compensate" lx="192" ly="224" />
        <text x="300" y="288" textAnchor="middle" fontSize="8.5" fill={T.ink3}>no global lock &#183; rollback is explicit, application-defined logic</text>
      </svg>
    ),
  },
  {
    category: "Reliability",
    title: "Fault Tolerance & Redundancy",
    explanation:
      "Fault tolerance is a system\u2019s ability to keep working when a component fails, and redundancy is how you get it \u2014 by running spare capacity that can take over. With N+1 redundancy a pool sized for the load runs one extra node, so any single failure is absorbed without downtime.",
    points: [
      "Redundancy = duplicate components (active-active or active-standby) ready to take over.",
      "N+1 provisions one spare beyond the minimum needed to serve current load.",
      "A health check plus load balancer detects a dead node and reroutes its traffic.",
      "Eliminate single points of failure across servers, zones, and regions.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="240" y="24" w="120" h="44" role="net" label="Load Balancer" />
        <Box x="36" y="138" w="112" h="56" role="server" label="Node 1" sub="active" />
        <rect x="170" y="138" width="112" height="56" rx="8" fill={C.infra.fill} stroke={C.cache.stroke} strokeWidth="2" opacity="0.7" />
        <text x="226" y="162" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={T.ink3}>Node 2</text>
        <text x="226" y="178" textAnchor="middle" fontSize="9.5" fill={C.cache.text}>FAILED</text>
        <line x1="196" y1="146" x2="256" y2="186" stroke={C.cache.stroke} strokeWidth="2.5" />
        <line x1="256" y1="146" x2="196" y2="186" stroke={C.cache.stroke} strokeWidth="2.5" />
        <Box x="304" y="138" w="112" h="56" role="server" label="Node 3" sub="active" />
        <Box x="448" y="138" w="120" h="56" role="server" label="Standby" sub="N+1 spare" />
        <Arrow x1="270" y1="68" x2="92" y2="138" color={C.server.stroke} width="1.5" />
        <Arrow x1="290" y1="68" x2="226" y2="138" dashed color={C.cache.stroke} width="1.4" head={false} />
        <Arrow x1="312" y1="68" x2="360" y2="138" color={C.server.stroke} width="1.5" />
        <Arrow x1="330" y1="68" x2="508" y2="138" color={C.store.stroke} width="2.2" label="reroute" lx="470" ly="100" />
        <text x="300" y="232" textAnchor="middle" fontSize="9" fontWeight="700" fill={T.ink2}>a spare absorbs the load when a node fails &#8212; no single point of failure</text>
      </svg>
    ),
  },
  {
    category: "Reliability",
    title: "Failover Strategies",
    explanation:
      "Failover is the automatic switch from a failed primary to a healthy backup. A heartbeat continuously checks the primary\u2019s health; when it stops responding, a floating address (virtual IP or DNS record) is repointed to the standby, which is promoted to serve traffic.",
    points: [
      "Active-passive: a warm standby waits and is promoted when the primary dies.",
      "Heartbeats detect failure; several missed beats in a row trigger failover.",
      "A virtual IP or DNS update redirects clients to the new primary.",
      "Beware split-brain \u2014 fencing or quorum ensures only one primary is active.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="20" y="120" w="86" h="46" role="client" label="Clients" />
        <Box x="158" y="118" w="106" h="50" role="net" label="VIP / DNS" sub="floating addr" />
        <Arrow x1="106" y1="143" x2="158" y2="143" color={C.client.stroke} label="request" lx="132" ly="136" />
        <rect x="340" y="44" width="220" height="58" rx="9" fill={C.infra.fill} stroke={C.cache.stroke} strokeWidth="2" opacity="0.75" />
        <text x="450" y="68" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={T.ink3}>Primary (active)</text>
        <text x="450" y="86" textAnchor="middle" fontSize="9.5" fill={C.cache.text}>down</text>
        <line x1="356" y1="52" x2="380" y2="94" stroke={C.cache.stroke} strokeWidth="2.4" />
        <line x1="380" y1="52" x2="356" y2="94" stroke={C.cache.stroke} strokeWidth="2.4" />
        <Box x="340" y="190" w="220" h="58" role="server" label="Secondary" sub="promoted to active" />
        <line x1="450" y1="102" x2="450" y2="190" stroke={C.infra.stroke} strokeWidth="1.4" strokeDasharray="4 4" />
        <text x="498" y="150" textAnchor="middle" fontSize="8.5" fill={T.ink3}>heartbeat</text>
        <Arrow x1="264" y1="135" x2="340" y2="78" dashed color={T.ink3} head={false} label="was here" lx="300" ly="100" />
        <Arrow x1="264" y1="150" x2="340" y2="214" color={C.server.stroke} width="2.2" label="now routes here" lx="300" ly="200" />
      </svg>
    ),
  },
  {
    category: "Reliability",
    title: "Chaos Engineering",
    explanation:
      "Chaos engineering deliberately injects failures \u2014 killing servers, adding latency, dropping network links \u2014 into a production-like system to verify it degrades gracefully. By experimenting on purpose, teams find weaknesses and validate redundancy before a real outage does it for them.",
    points: [
      "Form a hypothesis (\u201cthe system stays up if a node dies\u201d), then test it for real.",
      "Inject controlled faults and measure the blast radius with observability.",
      "Start with a small scope and an abort switch; expand as confidence grows.",
      "Popularized by tools like Netflix\u2019s Chaos Monkey.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="16" y="120" w="116" h="56" role="cache" label="Chaos Monkey" sub="inject failure" />
        {/* cluster */}
        <line x1="265" y1="82" x2="385" y2="82" stroke={C.infra.stroke} strokeWidth="1.4" />
        <line x1="265" y1="200" x2="385" y2="200" stroke={C.infra.stroke} strokeWidth="1.4" />
        <line x1="265" y1="82" x2="265" y2="200" stroke={C.infra.stroke} strokeWidth="1.4" />
        <line x1="385" y1="82" x2="385" y2="200" stroke={C.infra.stroke} strokeWidth="1.4" />
        <Box x="220" y="60" w="90" h="44" role="server" label="A" />
        <Box x="340" y="60" w="90" h="44" role="server" label="B" />
        <rect x="220" y="178" width="90" height="44" rx="8" fill={C.infra.fill} stroke={C.cache.stroke} strokeWidth="2" opacity="0.7" />
        <text x="265" y="205" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={T.ink3}>C</text>
        <line x1="238" y1="186" x2="292" y2="214" stroke={C.cache.stroke} strokeWidth="2.4" />
        <line x1="292" y1="186" x2="238" y2="214" stroke={C.cache.stroke} strokeWidth="2.4" />
        <Box x="340" y="178" w="90" h="44" role="server" label="D" />
        <Arrow x1="132" y1="148" x2="220" y2="196" color={C.cache.stroke} width="2" label="kill node" lx="178" ly="160" />
        <Arrow x1="430" y1="140" x2="470" y2="140" color={C.infra.stroke} label="metrics" lx="450" ly="133" />
        <Box x="470" y="116" w="116" h="56" role="infra" label="Observe" sub="blast radius" />
        <text x="300" y="262" textAnchor="middle" fontSize="9" fontWeight="700" fill={T.ink2}>break things on purpose to prove the system survives real failures</text>
      </svg>
    ),
  },
  {
    category: "Reliability",
    title: "SLA / SLO / SLI",
    explanation:
      "These three terms describe reliability targets at rising levels of commitment. An SLI is a measured signal (like success rate); an SLO is the internal target for that signal plus an error budget; an SLA is the external contract with customers that carries penalties if the target is missed.",
    points: [
      "SLI \u2014 the actual measurement: availability, latency, or error rate.",
      "SLO \u2014 the internal goal for an SLI (e.g. 99.9% over 30 days).",
      "Error budget = 100% \u2212 SLO; spend it on releases and risk.",
      "SLA \u2014 the customer-facing promise with consequences; set looser than the SLO.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <rect x="120" y="36" width="360" height="60" rx="10" fill={C.cache.fill} stroke={C.cache.stroke} strokeWidth="2.2" />
        <text x="300" y="62" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.cache.text}>SLA &#183; external contract</text>
        <text x="300" y="82" textAnchor="middle" fontSize="9.5" fill={C.cache.text}>promise 99.5% uptime, else penalty / refund</text>
        <rect x="84" y="116" width="432" height="60" rx="10" fill={C.net.fill} stroke={C.net.stroke} strokeWidth="2.2" />
        <text x="300" y="142" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.net.text}>SLO &#183; internal target</text>
        <text x="300" y="162" textAnchor="middle" fontSize="9.5" fill={C.net.text}>99.9% over 30 days &#8594; error budget &#8776; 43 min</text>
        <rect x="48" y="196" width="504" height="60" rx="10" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="2.2" />
        <text x="300" y="222" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.server.text}>SLI &#183; measured signal</text>
        <text x="300" y="242" textAnchor="middle" fontSize="9.5" fill={C.server.text}>actual success rate, latency, availability</text>
        <Arrow x1="540" y1="226" x2="540" y2="176" color={T.ink3} head width="1.6" />
        <Arrow x1="540" y1="146" x2="540" y2="96" color={T.ink3} head width="1.6" />
        <text x="300" y="284" textAnchor="middle" fontSize="8.5" fill={T.ink3}>SLA &#8804; SLO &#8804; the reliability you actually aim for</text>
      </svg>
    ),
  },
  {
    category: "Distributed Systems",
    title: "Consistent Hashing",
    explanation:
      "Consistent hashing maps both servers and keys onto the same circular hash space; each key is owned by the first node found clockwise from it. Adding or removing a node only moves the keys in its immediate arc \u2014 about 1/N of them \u2014 instead of remapping everything, and virtual nodes spread each server across many ring positions to balance load.",
    points: [
      "Keys and nodes are hashed onto a ring; a key belongs to the next node clockwise.",
      "Adding/removing a node remaps only ~1/N of keys, not the whole keyspace.",
      "Virtual nodes give each server many ring points to even out load.",
      "Used in caches and databases (Dynamo, Cassandra, memcached clusters).",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <circle cx="200" cy="150" r="100" fill="none" stroke={C.infra.stroke} strokeWidth="2" />
        <path d="M163 58 A 100 100 0 0 1 240 54" fill="none" stroke={T.ink3} strokeWidth="1.4" />
        <path d="M240 54 l -8 -3 l 4 8 Z" fill={T.ink3} />
        <text x="200" y="40" textAnchor="middle" fontSize="8.5" fill={T.ink3}>clockwise</text>
        {/* nodes */}
        <Dot cx="200" cy="50" r="9" fill={C.server.fill} stroke={C.server.stroke} />
        <text x="200" y="36" textAnchor="middle" fontSize="9" fontWeight="800" fill={C.server.text}>N1</text>
        <Dot cx="113" cy="200" r="9" fill={C.server.fill} stroke={C.server.stroke} />
        <text x="92" y="214" textAnchor="middle" fontSize="9" fontWeight="800" fill={C.server.text}>N2</text>
        <Dot cx="287" cy="200" r="9" fill={C.server.fill} stroke={C.server.stroke} />
        <text x="308" y="214" textAnchor="middle" fontSize="9" fontWeight="800" fill={C.server.text}>N3</text>
        {/* keys */}
        <Dot cx="287" cy="100" r="6" fill={C.queue.fill} stroke={C.queue.stroke} />
        <text x="306" y="96" fontSize="8.5" fill={C.queue.text}>k1</text>
        <Dot cx="200" cy="250" r="6" fill={C.queue.fill} stroke={C.queue.stroke} />
        <text x="200" y="270" textAnchor="middle" fontSize="8.5" fill={C.queue.text}>k2</text>
        <Dot cx="106" cy="116" r="6" fill={C.queue.fill} stroke={C.queue.stroke} />
        <text x="86" y="112" fontSize="8.5" fill={C.queue.text}>k3</text>
        <Arrow x1="287" y1="100" x2="287" y2="190" dashed color={C.queue.text} width="1.3" head />
        <Arrow x1="200" y1="250" x2="122" y2="206" dashed color={C.queue.text} width="1.3" head />
        <Arrow x1="106" y1="116" x2="193" y2="58" dashed color={C.queue.text} width="1.3" head />
        {/* legend */}
        <text x="330" y="96" fontSize="9.5" fill={T.ink2}>&#8226; key &#8594; next node clockwise</text>
        <text x="330" y="120" fontSize="9.5" fill={T.ink2}>&#8226; add/remove moves ~1/N keys</text>
        <text x="330" y="144" fontSize="9.5" fill={T.ink2}>&#8226; virtual nodes balance load</text>
        <text x="330" y="168" fontSize="9.5" fill={T.ink2}>&#8226; no full rehash on change</text>
      </svg>
    ),
  },
  {
    category: "Distributed Systems",
    title: "Consensus (Raft Algorithm)",
    explanation:
      "Raft keeps a replicated log consistent across servers by electing a single leader. Clients send writes to the leader, which appends them to its log and replicates to followers; once a majority have stored an entry it is committed. Regular heartbeats and election terms keep exactly one leader in charge.",
    points: [
      "One elected leader handles all writes; followers replicate its log.",
      "An entry commits only after a majority (quorum) persists it.",
      "Heartbeats maintain leadership; a timeout triggers a new election (term).",
      "A cluster of 2f+1 nodes tolerates f failures.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="18" y="46" w="80" h="42" role="client" label="Client" />
        <Arrow x1="98" y1="67" x2="235" y2="67" color={C.client.stroke} label="set x=5" lx="166" ly="60" />
        <Box x="235" y="40" w="130" h="56" role="server" label="Leader" sub="term 4" />
        <rect x="252" y="104" width="96" height="22" rx="4" fill="#fff" stroke={C.server.stroke} strokeWidth="1.4" />
        <text x="300" y="119" textAnchor="middle" fontSize="9" fontFamily={MONO} fill={C.server.text}>log: [x=5]</text>
        <Box x="44" y="196" w="150" h="56" role="infra" label="Follower 1" />
        <Box x="406" y="196" w="150" h="56" role="infra" label="Follower 2" />
        <Arrow x1="270" y1="96" x2="150" y2="196" color={C.server.stroke} label="AppendEntries" lx="178" ly="150" />
        <Arrow x1="330" y1="96" x2="450" y2="196" color={C.server.stroke} label="AppendEntries" lx="426" ly="150" />
        <Arrow x1="160" y1="196" x2="270" y2="100" dashed color={C.infra.stroke} label="ack" lx="196" ly="150" head />
        <Arrow x1="440" y1="196" x2="330" y2="100" dashed color={C.infra.stroke} label="ack" lx="404" ly="150" head />
        <text x="300" y="284" textAnchor="middle" fontSize="9" fontWeight="700" fill={T.ink2}>entry commits once a majority (2 of 3) has stored it</text>
      </svg>
    ),
  },
  {
    category: "Distributed Systems",
    title: "Distributed Transactions (2PC)",
    explanation:
      "Two-phase commit coordinates an all-or-nothing transaction across multiple databases. In the prepare phase the coordinator asks every participant to vote; if all vote yes it tells them to commit, otherwise everyone aborts. This guarantees atomicity but blocks while participants hold locks waiting on the coordinator.",
    points: [
      "Phase 1 (prepare): each participant votes yes only if it can commit.",
      "Phase 2 (commit/abort): all-yes \u2192 commit; any no \u2192 global abort.",
      "Guarantees atomicity across nodes, but is a blocking protocol.",
      "A coordinator crash can leave participants stuck holding locks.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <rect x="30" y="44" width="130" height="212" rx="10" fill={C.net.fill} stroke={C.net.stroke} strokeWidth="2" />
        <text x="95" y="70" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.net.text}>Coordinator</text>
        <rect x="430" y="44" width="150" height="212" rx="10" fill={C.store.fill} stroke={C.store.stroke} strokeWidth="2" />
        <text x="505" y="68" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.store.text}>Participant DB</text>
        <text x="505" y="84" textAnchor="middle" fontSize="9" fill={C.store.text}>(&#215; N)</text>
        <text x="295" y="104" textAnchor="middle" fontSize="9" fontWeight="800" fill={T.ink3}>PHASE 1 &#183; prepare</text>
        <Arrow x1="160" y1="120" x2="430" y2="120" color={C.net.stroke} label="prepare?" lx="295" ly="114" />
        <Arrow x1="430" y1="140" x2="160" y2="140" dashed color={C.server.stroke} label="vote: yes" lx="295" ly="135" head />
        <text x="295" y="186" textAnchor="middle" fontSize="9" fontWeight="800" fill={T.ink3}>PHASE 2 &#183; commit</text>
        <Arrow x1="160" y1="202" x2="430" y2="202" color={T.accent} label="commit" lx="295" ly="197" />
        <Arrow x1="430" y1="222" x2="160" y2="222" dashed color={C.server.stroke} label="ack / done" lx="295" ly="217" head />
        <text x="300" y="284" textAnchor="middle" fontSize="8.5" fill={C.cache.text}>any participant votes NO &#8594; coordinator orders a global ABORT</text>
      </svg>
    ),
  },
  {
    category: "Distributed Systems",
    title: "Vector Clocks",
    explanation:
      "Vector clocks track causality without synchronized time. Each process keeps a vector of counters \u2014 one per process \u2014 incrementing its own on each event and merging the maximum on every message received. Comparing two vectors reveals whether one event happened-before another, or whether they are concurrent.",
    points: [
      "Each process increments its own slot on every local event.",
      "On receive, take the element-wise max of both vectors, then increment.",
      "If vector A \u2264 B element-wise, A happened-before B (causal order).",
      "If neither is \u2264 the other, the events are concurrent.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        {[["P1", 64], ["P2", 150], ["P3", 232]].map(([p, y], i) => (
          <g key={i}>
            <text x="34" y={y + 4} fontSize="11" fontWeight="800" fill={T.ink2}>{p}</text>
            <line x1="76" y1={y} x2="566" y2={y} stroke={C.infra.stroke} strokeWidth="1.6" />
            <path d={`M566 ${y} l -8 -4 l 0 8 Z`} fill={C.infra.stroke} />
          </g>
        ))}
        {/* P1 */}
        <Dot cx="140" cy="64" r="5" fill={C.server.stroke} />
        <text x="140" y="50" textAnchor="middle" fontSize="8.5" fontFamily={MONO} fill={T.ink2}>[1,0,0]</text>
        <Dot cx="300" cy="64" r="5" fill={C.server.stroke} />
        <text x="300" y="50" textAnchor="middle" fontSize="8.5" fontFamily={MONO} fill={T.ink2}>[2,0,0]</text>
        {/* P2 */}
        <Dot cx="200" cy="150" r="5" fill={C.client.stroke} />
        <text x="196" y="138" textAnchor="middle" fontSize="8.5" fontFamily={MONO} fill={T.ink2}>[0,1,0]</text>
        <Dot cx="248" cy="150" r="5" fill={C.client.stroke} />
        <text x="252" y="172" textAnchor="middle" fontSize="8.5" fontFamily={MONO} fill={T.ink2}>[1,2,0]</text>
        <Dot cx="420" cy="150" r="5" fill={C.client.stroke} />
        <text x="420" y="138" textAnchor="middle" fontSize="8.5" fontFamily={MONO} fill={T.ink2}>[1,3,0]</text>
        {/* P3 */}
        <Dot cx="360" cy="232" r="5" fill={C.queue.text} />
        <text x="360" y="254" textAnchor="middle" fontSize="8.5" fontFamily={MONO} fill={T.ink2}>[0,0,1]</text>
        <Dot cx="480" cy="232" r="5" fill={C.queue.text} />
        <text x="480" y="254" textAnchor="middle" fontSize="8.5" fontFamily={MONO} fill={T.ink2}>[1,3,2]</text>
        {/* messages */}
        <Arrow x1="140" y1="64" x2="248" y2="150" color={C.net.stroke} label="msg" lx="178" ly="104" width="1.5" />
        <Arrow x1="420" y1="150" x2="480" y2="232" color={C.net.stroke} label="msg" lx="438" ly="192" width="1.5" />
        <text x="300" y="290" textAnchor="middle" fontSize="8.5" fill={C.cache.text}>[2,0,0] &#8741; [0,0,1] &#8594; concurrent (neither &#8804; the other)</text>
      </svg>
    ),
  },
  {
    category: "Observability",
    title: "Logging vs Metrics vs Tracing",
    explanation:
      "These are the three core telemetry types. Logs are timestamped records of discrete events; metrics are numeric measurements aggregated over time; traces follow a single request as it travels across services, showing where time was spent. Together they answer what happened, how much, and where.",
    points: [
      "Logs: detailed event records \u2014 best for debugging specifics.",
      "Metrics: cheap aggregated numbers \u2014 best for dashboards and alerting.",
      "Traces: per-request spans across services \u2014 best for finding bottlenecks.",
      "Use all three: metrics to detect, traces to localize, logs to pinpoint.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <line x1="200" y1="14" x2="200" y2="286" stroke={T.line} strokeWidth="1" />
        <line x1="400" y1="14" x2="400" y2="286" stroke={T.line} strokeWidth="1" />
        {/* logs */}
        <text x="100" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.store.text}>Logs</text>
        {[["12:01 INFO ok", 48, false], ["12:01 INFO ok", 74, false], ["12:02 ERROR x500", 100, true], ["12:03 WARN slow", 126, false]].map(([t, y, err], i) => (
          <g key={i}>
            <rect x="20" y={y} width="160" height="20" rx="3" fill={err ? C.cache.fill : "#fff"} stroke={err ? C.cache.stroke : T.line} strokeWidth="1.2" />
            <text x="28" y={y + 14} fontSize="8" fontFamily={MONO} fill={err ? C.cache.text : T.ink2}>{t}</text>
          </g>
        ))}
        <text x="100" y="170" textAnchor="middle" fontSize="8.5" fill={T.ink3}>discrete events</text>
        {/* metrics */}
        <text x="300" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.net.text}>Metrics</text>
        <line x1="226" y1="150" x2="384" y2="150" stroke={T.ink3} strokeWidth="1.4" />
        <line x1="226" y1="48" x2="226" y2="150" stroke={T.ink3} strokeWidth="1.4" />
        <polyline points="232,132 256,118 280,124 304,96 328,104 352,72 378,84" fill="none" stroke={C.net.stroke} strokeWidth="2.2" />
        {[[232, 132], [280, 124], [328, 104], [378, 84]].map(([x, y], i) => <Dot key={i} cx={x} cy={y} r="3" fill={C.net.stroke} />)}
        <text x="300" y="170" textAnchor="middle" fontSize="8.5" fill={T.ink3}>numbers over time</text>
        {/* traces */}
        <text x="500" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.queue.text}>Traces</text>
        <rect x="414" y="48" width="166" height="14" rx="3" fill={C.queue.fill} stroke={C.queue.stroke} strokeWidth="1.2" />
        <text x="418" y="59" fontSize="7.5" fill={C.queue.text}>request</text>
        <rect x="430" y="70" width="120" height="14" rx="3" fill={C.client.fill} stroke={C.client.stroke} strokeWidth="1.2" />
        <text x="434" y="81" fontSize="7.5" fill={C.client.text}>auth</text>
        <rect x="446" y="92" width="96" height="14" rx="3" fill={C.store.fill} stroke={C.store.stroke} strokeWidth="1.2" />
        <text x="450" y="103" fontSize="7.5" fill={C.store.text}>db query</text>
        <rect x="446" y="114" width="56" height="14" rx="3" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="1.2" />
        <text x="450" y="125" fontSize="7.5" fill={C.server.text}>cache</text>
        <text x="500" y="170" textAnchor="middle" fontSize="8.5" fill={T.ink3}>one request, span by span</text>
        <text x="300" y="282" textAnchor="middle" fontSize="9" fontWeight="700" fill={T.ink2}>what happened &#183; how much &#183; where the time went</text>
      </svg>
    ),
  },
  {
    category: "Observability",
    title: "The Three Pillars",
    explanation:
      "The three pillars of observability \u2014 logs, metrics, and traces \u2014 are the data foundations that let you understand a system\u2019s internal state from the outside. They all rest on instrumentation in the code and agents that emit telemetry; together they make a system observable rather than merely monitored.",
    points: [
      "Logs, metrics, and traces are the three complementary signal types.",
      "All three depend on instrumentation/telemetry emitted by the application.",
      "No single pillar is enough \u2014 each answers a different kind of question.",
      "Modern stacks correlate them (e.g. trace IDs in logs) for fast diagnosis.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        {/* roof */}
        <path d="M70 80 L160 40 L440 40 L530 80 Z" fill={C.infra.fill} stroke={C.infra.stroke} strokeWidth="2" />
        <text x="300" y="66" textAnchor="middle" fontSize="15" fontWeight="800" fill={T.ink}>Observability</text>
        <rect x="78" y="84" width="444" height="14" rx="2" fill={C.infra.fill} stroke={C.infra.stroke} strokeWidth="1.5" />
        {/* pillars */}
        {[["Logs", "events", 120, C.store], ["Metrics", "aggregates", 268, C.net], ["Traces", "request flow", 416, C.queue]].map(([t, s, x, col], i) => (
          <g key={i}>
            <rect x={x} y={106} width={64} height={120} rx={4} fill={col.fill} stroke={col.stroke} strokeWidth="2.2" />
            <text x={x + 32} y={158} textAnchor="middle" fontSize="13" fontWeight="800" fill={col.text}>{t}</text>
            <text x={x + 32} y={176} textAnchor="middle" fontSize="8.5" fill={col.text}>{s}</text>
          </g>
        ))}
        {/* base */}
        <rect x="78" y="232" width="444" height="40" rx="5" fill={C.server.fill} stroke={C.server.stroke} strokeWidth="2" />
        <text x="300" y="256" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.server.text}>Instrumentation &amp; Telemetry &#183; SDKs, agents, exporters</text>
      </svg>
    ),
  },
  {
    category: "Observability",
    title: "Alerting Pipelines",
    explanation:
      "An alerting pipeline turns raw metrics into actionable notifications. Rules continuously evaluate metrics against thresholds; when one breaches, an alert fires into a manager that de-duplicates, groups, and routes it; finally the right person or channel is notified, with escalation if no one acknowledges.",
    points: [
      "Rules evaluate metrics (e.g. error rate &gt; 1% for 5m) and fire alerts.",
      "A manager de-duplicates and groups related alerts to cut noise.",
      "Routing sends each alert to the right team and channel.",
      "Escalation policies page a backup if the first responder doesn\u2019t ack.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="8" y="120" w="92" h="50" role="server" label="Metrics" sub="time series" />
        <Arrow x1="100" y1="145" x2="120" y2="145" color={C.server.stroke} />
        <Box x="120" y="116" w="110" h="58" role="net" label="Alert Rules" sub="thresholds" />
        <Arrow x1="230" y1="145" x2="262" y2="145" color={C.cache.stroke} label="breach &#8594; fire" lx="246" ly="138" />
        <Box x="262" y="116" w="120" h="58" role="infra" label="Alertmanager" sub="dedup &#183; group &#183; route" />
        <Box x="430" y="44" w="158" h="44" role="cache" label="On-call &#183; page" />
        <Box x="430" y="120" w="158" h="44" role="client" label="Slack" />
        <Box x="430" y="196" w="158" h="44" role="client" label="Ticket / Email" />
        <Arrow x1="382" y1="138" x2="430" y2="70" color={C.infra.stroke} width="1.5" />
        <Arrow x1="382" y1="145" x2="430" y2="142" color={C.infra.stroke} width="1.5" />
        <Arrow x1="382" y1="152" x2="430" y2="214" color={C.infra.stroke} width="1.5" />
        <path d="M588 52 C 600 30, 520 18, 509 40" fill="none" stroke={C.cache.stroke} strokeWidth="1.4" strokeDasharray="4 3" />
        <path d="M509 40 l 1 -8 l 6 6 Z" fill={C.cache.stroke} />
        <text x="540" y="22" textAnchor="middle" fontSize="8" fill={C.cache.text}>no ack &#8594; escalate</text>
        <text x="300" y="288" textAnchor="middle" fontSize="8.5" fill={T.ink3}>noisy signals are de-duplicated and grouped before paging a human</text>
      </svg>
    ),
  },
  {
    category: "Security",
    title: "OAuth 2.0 / JWT Flow",
    explanation:
      "OAuth 2.0 lets a user grant an app limited access to their account without sharing a password. The user logs in at the authorization server, which hands the app a short code; the app swaps that code for an access token \u2014 often a JWT \u2014 sent as a Bearer token on each API call. A JWT is a signed header.payload.signature the API can verify itself.",
    points: [
      "Authorization-code flow: user authenticates at the auth server, app gets a code, then a token.",
      "The access token (often a JWT) is sent as an Authorization: Bearer header.",
      "A JWT carries signed claims (sub, exp, scope) the API verifies without a DB lookup.",
      "Keep tokens short-lived; never put secrets in the JWT payload.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="20" y="50" w="110" h="56" role="client" label="User" sub="browser" />
        <Box x="185" y="50" w="120" h="56" role="server" label="Client App" />
        <Box x="400" y="50" w="150" h="56" role="net" label="Auth Server" />
        <Box x="400" y="182" w="150" h="54" role="store" label="Resource API" />
        <Arrow x1="130" y1="70" x2="185" y2="70" color={C.client.stroke} label="1 open" lx="157" ly="64" />
        <Arrow x1="305" y1="70" x2="400" y2="70" color={C.server.stroke} label="2 authorize" lx="352" ly="64" />
        <Arrow x1="400" y1="92" x2="305" y2="92" dashed color={C.net.stroke} label="3 token (JWT)" lx="352" ly="106" head />
        <Arrow x1="290" y1="106" x2="430" y2="182" color={C.server.stroke} label="4 Bearer JWT" lx="418" ly="148" />
        <Arrow x1="470" y1="182" x2="330" y2="108" dashed color={C.store.text} label="5 data" lx="430" ly="170" head />
        {/* JWT inset */}
        <text x="24" y="172" fontSize="10" fontWeight="800" fill={T.ink2}>JWT =</text>
        <rect x="20" y="182" width="96" height="46" rx="5" fill={C.cache.fill} stroke={C.cache.stroke} strokeWidth="1.8" />
        <text x="68" y="202" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.cache.text}>header</text>
        <text x="68" y="217" textAnchor="middle" fontSize="8" fill={C.cache.text}>alg, typ</text>
        <text x="120" y="210" textAnchor="middle" fontSize="14" fontWeight="800" fill={T.ink3}>.</text>
        <rect x="126" y="182" width="130" height="46" rx="5" fill={C.net.fill} stroke={C.net.stroke} strokeWidth="1.8" />
        <text x="191" y="202" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.net.text}>payload</text>
        <text x="191" y="217" textAnchor="middle" fontSize="8" fill={C.net.text}>sub, exp, scope</text>
        <text x="260" y="210" textAnchor="middle" fontSize="14" fontWeight="800" fill={T.ink3}>.</text>
        <rect x="266" y="182" width="92" height="46" rx="5" fill={C.infra.fill} stroke={C.infra.stroke} strokeWidth="1.8" />
        <text x="312" y="202" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.infra.text}>signature</text>
        <text x="312" y="217" textAnchor="middle" fontSize="8" fill={C.infra.text}>HMAC / RSA</text>
        <text x="190" y="250" textAnchor="middle" fontSize="8.5" fill={T.ink3}>API verifies the signature locally &#8212; no session lookup</text>
      </svg>
    ),
  },
  {
    category: "Security",
    title: "Rate Limiting Patterns",
    explanation:
      "Rate limiting caps how many requests a client may make in a period. Token and leaky buckets smooth bursts using a fill/drain rate; fixed windows count requests per fixed interval and reset; sliding windows track a rolling time range to avoid the burst-at-the-boundary problem of fixed windows.",
    points: [
      "Token bucket: tokens refill at a steady rate; each request spends one \u2014 allows bursts.",
      "Leaky bucket: requests drain at a constant rate; overflow is dropped \u2014 smooths output.",
      "Fixed window: a simple per-interval counter, but allows 2\u00d7 bursts at the edges.",
      "Sliding window: a rolling count that fixes the boundary-burst problem.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <line x1="300" y1="14" x2="300" y2="286" stroke={T.line} strokeWidth="1" />
        <line x1="14" y1="150" x2="586" y2="150" stroke={T.line} strokeWidth="1" />
        {/* token bucket */}
        <text x="150" y="32" textAnchor="middle" fontSize="11" fontWeight="800" fill={C.server.text}>Token Bucket</text>
        <rect x="110" y="58" width="80" height="64" rx="4" fill="none" stroke={C.infra.stroke} strokeWidth="2" />
        <Dot cx="130" cy="100" r="6" fill={C.server.stroke} />
        <Dot cx="150" cy="108" r="6" fill={C.server.stroke} />
        <Dot cx="170" cy="100" r="6" fill={C.server.stroke} />
        <Arrow x1="150" y1="40" x2="150" y2="58" color={C.queue.text} label="+r/s" lx="176" ly="50" />
        <Arrow x1="190" y1="90" x2="250" y2="90" color={C.server.stroke} label="spend 1" lx="222" ly="84" />
        <text x="150" y="138" textAnchor="middle" fontSize="8" fill={T.ink3}>burst up to bucket size</text>
        {/* leaky bucket */}
        <text x="450" y="32" textAnchor="middle" fontSize="11" fontWeight="800" fill={C.net.text}>Leaky Bucket</text>
        <Arrow x1="430" y1="40" x2="440" y2="56" color={C.cache.stroke} width="1.4" />
        <Arrow x1="455" y1="40" x2="448" y2="56" color={C.cache.stroke} width="1.4" />
        <Arrow x1="470" y1="40" x2="458" y2="56" color={C.cache.stroke} width="1.4" />
        <path d="M412 58 L488 58 L470 116 L430 116 Z" fill={C.net.fill} stroke={C.net.stroke} strokeWidth="2" />
        <Arrow x1="450" y1="116" x2="450" y2="140" color={C.server.stroke} label="steady out" lx="492" ly="132" />
        <text x="450" y="52" textAnchor="middle" fontSize="7.5" fill={C.cache.text}>overflow dropped</text>
        {/* fixed window */}
        <text x="150" y="174" textAnchor="middle" fontSize="11" fontWeight="800" fill={C.store.text}>Fixed Window</text>
        <rect x="40" y="194" width="100" height="50" rx="4" fill={C.store.fill} stroke={C.store.stroke} strokeWidth="1.8" />
        <text x="90" y="216" textAnchor="middle" fontSize="9" fill={C.store.text}>0&#8211;60s</text>
        <text x="90" y="232" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.store.text}>87 / 100</text>
        <rect x="160" y="194" width="100" height="50" rx="4" fill="#fff" stroke={C.store.stroke} strokeWidth="1.8" strokeDasharray="4 3" />
        <text x="210" y="216" textAnchor="middle" fontSize="9" fill={T.ink3}>60&#8211;120s</text>
        <text x="210" y="232" textAnchor="middle" fontSize="9" fontWeight="700" fill={T.ink3}>resets &#8594; 0</text>
        <text x="150" y="262" textAnchor="middle" fontSize="8" fill={T.ink3}>counter resets each interval</text>
        {/* sliding window */}
        <text x="450" y="174" textAnchor="middle" fontSize="11" fontWeight="800" fill={C.queue.text}>Sliding Window</text>
        <line x1="330" y1="234" x2="570" y2="234" stroke={T.ink3} strokeWidth="1.4" />
        <rect x="430" y="196" width="120" height="38" rx="4" fill={C.queue.fill} stroke={C.queue.stroke} strokeWidth="1.6" opacity="0.55" />
        {[350, 380, 410, 445, 470, 500, 530].map((x, i) => <Dot key={i} cx={x} cy={234} r="4" fill={x >= 430 ? C.queue.text : T.ink3} />)}
        <Arrow x1="500" y1="190" x2="540" y2="190" color={C.queue.text} width="1.4" head={false} />
        <text x="450" y="256" textAnchor="middle" fontSize="8" fill={T.ink3}>counts the last 60s, always rolling</text>
      </svg>
    ),
  },
  {
    category: "Security",
    title: "Zero Trust Architecture",
    explanation:
      "Zero trust drops the idea that anything inside the network perimeter is automatically trusted. Instead, every request must prove who the user is, the health of their device, and its context before a policy engine grants least-privilege access \u2014 and it re-checks on each request. \u201cNever trust, always verify.\u201d",
    points: [
      "No implicit trust from network location \u2014 inside is treated like outside.",
      "Each request is evaluated on identity, device posture, and context.",
      "A policy engine enforces least-privilege, per-request access decisions.",
      "Assume breach: verify continuously and encrypt everywhere.",
    ],
    svg: (
      <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
        <Box x="14" y="56" w="116" h="48" role="client" label="User" sub="identity" />
        <Box x="14" y="120" w="116" h="48" role="client" label="Device" sub="posture / health" />
        <Box x="14" y="184" w="116" h="46" role="infra" label="Context" sub="geo, risk, time" />
        <rect x="205" y="92" width="160" height="112" rx="10" fill={C.net.fill} stroke={C.net.stroke} strokeWidth="2.4" />
        <text x="285" y="136" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.net.text}>Policy Engine</text>
        <text x="285" y="154" textAnchor="middle" fontSize="9.5" fill={C.net.text}>verify every request</text>
        <text x="285" y="170" textAnchor="middle" fontSize="9" fill={C.net.text}>least privilege</text>
        <Arrow x1="130" y1="80" x2="205" y2="116" color={C.client.stroke} width="1.5" label="who" lx="166" ly="90" />
        <Arrow x1="130" y1="144" x2="205" y2="148" color={C.client.stroke} width="1.5" />
        <Arrow x1="130" y1="206" x2="205" y2="180" color={C.infra.stroke} width="1.5" label="context" lx="166" ly="206" />
        {["App", "Database", "Internal API"].map((r, i) => (
          <g key={i}>
            <Box x="432" y={64 + i * 68} w="150" h="46" role="store" label={r} />
            <Arrow x1="365" y1="148" x2="432" y2={87 + i * 68} dashed color={C.store.text} width="1.3" head />
          </g>
        ))}
        <text x="490" y="58" textAnchor="middle" fontSize="8" fill={T.ink3}>per-request access</text>
        {/* crossed-out old perimeter */}
        <rect x="150" y="240" width="300" height="40" rx="6" fill="none" stroke={C.cache.stroke} strokeWidth="1.6" strokeDasharray="5 4" opacity="0.8" />
        <text x="300" y="265" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.cache.text}>old \u201ctrusted internal network\u201d perimeter</text>
        <line x1="158" y1="244" x2="442" y2="276" stroke={C.cache.stroke} strokeWidth="2" />
      </svg>
    ),
  },
];

/* =========================================================================
   APP SHELL
   ========================================================================= */

function Chevron({ open }) {
  return (
    <span style={{ display: "inline-block", width: 14, color: T.ink3, fontSize: 11, transition: "transform .15s", transform: open ? "rotate(90deg)" : "none" }}>
      &#9654;
    </span>
  );
}

/* =========================================================================
   ENRICHMENTS — extra sections per concept (when to use, avoid, failures,
   trade-offs). Keyed by concept title to keep the CONCEPTS array clean.
   ========================================================================= */
const ENRICHMENTS = {
  "Horizontal vs Vertical Scaling": {
    whenToUse: ["When your service is stateless and traffic spikes are unpredictable — horizontal scaling lets you add nodes behind a load balancer and absorb bursts without downtime.", "If you need to scale a single relational database instance quickly — vertical scaling (more RAM, faster NVMe) defers the complexity of sharding until you genuinely hit single-node limits.", "When your workload is CPU- or memory-bound on a single thread (e.g., an in-memory cache or a legacy monolith) — a larger machine extracts more throughput with zero code changes."],
    avoid: ["When your application holds local in-memory session state — horizontal scaling causes requests to hit nodes that lack the session, producing intermittent auth failures unless you externalize state first.", "If chasing a cost target on a bursty but low-baseline workload — over-provisioned horizontal fleets waste money on idle nodes that vertical right-sizing or auto-scaling would avoid.", "When database write throughput is the bottleneck — blindly adding read replicas does nothing for write-heavy workloads; you need vertical scaling or a write-partitioning strategy."],
    failures: [{ name: "Thundering Herd on Scale-Out", detail: "When many new horizontal nodes start simultaneously and all attempt cache warm-up or DB connection establishment at once, they overwhelm downstream dependencies before they become useful." }, { name: "Vertical Ceiling Mid-Incident", detail: "A vertical scale-up requires a reboot on most cloud instance types, meaning the remediation itself causes a second outage window during an active incident." }, { name: "Split-Brain After Horizontal Shard", detail: "Sharding a database horizontally without careful key-range planning causes cross-shard transactions to fail or produce inconsistent reads when the application assumes a single consistent view." }],
    tradeoffs: { pros: ["Horizontal scaling provides fault tolerance by design — losing one node degrades capacity rather than causing total failure.", "Vertical scaling requires no application changes and eliminates the operational burden of distributed coordination and load balancer configuration.", "Horizontal scaling allows incremental cost growth that tracks traffic linearly, avoiding large step-function pricing."], cons: ["Horizontal scaling mandates stateless service design and external state stores, adding infrastructure complexity and a new class of network-latency bugs.", "Vertical scaling imposes hard hardware ceilings — the largest available instance size becomes a non-negotiable architectural constraint as load grows.", "Operating a large horizontal fleet increases blast radius for bad deploys and complicates distributed tracing and log correlation."] },
  },
  "Load Balancing": {
    whenToUse: ["When your single server CPU or memory is consistently above 70% under peak load and horizontal scaling is cheaper than vertical.", "When you need zero-downtime deployments and must drain traffic from instances being replaced.", "If you need geographic or path-based routing to serve different API versions or regional backends from a single ingress point."],
    avoid: ["When you have a stateful service that hasn't externalized session state — sticky sessions mask the problem rather than solving it.", "If your bottleneck is a single shared database or downstream dependency, adding more app servers just shifts the queue.", "When traffic is low and predictable — the operational overhead and added network hop are rarely justified for internal microservices under light load."],
    failures: [{ name: "Health Check Lag Spike", detail: "A backend becomes unhealthy but continues receiving traffic for the full health-check interval (commonly 10–30 s), causing a wave of errors before the LB drains it." }, { name: "Thundering Herd on Failover", detail: "When one backend is removed, the remaining nodes absorb a sudden traffic surge that can cascade and take them down too if they lack sufficient headroom." }, { name: "Sticky Session Hotspot", detail: "IP-hash or cookie-based affinity concentrates a disproportionate share of heavy users onto one backend, defeating horizontal scaling and causing uneven resource exhaustion." }],
    tradeoffs: { pros: ["Enables horizontal scaling by distributing load across commodity instances without changing application code.", "Provides automatic failover — unhealthy backends are removed from rotation within seconds, improving overall availability.", "Layer-7 LBs allow traffic shaping, canary deployments, and A/B testing at the infrastructure level without application changes."], cons: ["The load balancer itself becomes a single point of failure unless deployed in an HA pair or managed service.", "SSL termination, request inspection, and connection pooling at the LB add latency and increase the blast radius of a misconfiguration.", "Debugging distributed request traces is harder because the LB obscures the original client IP and introduces an extra hop in timing profiles."] },
  },
  "Auto-scaling": {
    whenToUse: ["When your traffic has pronounced peaks and valleys (e.g., daily spikes, seasonal surges) and over-provisioning a fixed fleet would waste significant cost.", "When you need fault tolerance at the infrastructure level and want the scheduler to replace unhealthy instances automatically without paging an on-call engineer.", "If you are running stateless microservices behind a load balancer and want to meet SLOs under unpredictable load without manual capacity planning."],
    avoid: ["When your service has heavy cold-start penalties (JVM warm-up, model loading, cache priming) — scaling will worsen latency under the exact spikes you are trying to absorb.", "If your workload is stateful and you have not implemented drain/handoff logic, abrupt scale-in will terminate in-flight sessions or shed database connections without warning.", "When baseline load is constant and predictable — the operational overhead of tuning thresholds, cooldown periods, and alarms yields no benefit over a fixed, right-sized fleet."],
    failures: [{ name: "Thrashing on Noisy Metric", detail: "A single bursty metric (e.g., a 30-second CPU spike from a batch job) triggers repeated scale-out/in cycles, burning costs and destabilizing the fleet before the cooldown window can dampen the oscillation." }, { name: "Scale-In Connection Drain Failure", detail: "Instances are terminated before in-flight HTTP or database connections finish because the deregistration delay is shorter than the longest p99 request, causing 5xx errors during every scale-in event." }, { name: "Quota Exhaustion Silent Cap", detail: "Cloud account vCPU quotas are hit silently at peak load — the autoscaler requests new capacity, the cloud API returns a quota error, and the fleet stops expanding while traffic continues to climb." }],
    tradeoffs: { pros: ["Reduces infrastructure spend during off-peak hours by releasing idle capacity instead of paying for headroom 24/7.", "Eliminates manual on-call toil for routine capacity events, letting engineers respond to actual incidents rather than provisioning tickets.", "Provides a built-in self-healing loop that replaces failed or degraded instances without human intervention, improving availability."], cons: ["Tuning scale-out thresholds, cooldown periods, min/max bounds, and warm-up buffers requires sustained operational expertise.", "Unpredictable instance churn complicates distributed tracing, log correlation, and cost attribution because ephemeral node IDs cycle frequently.", "Predictive scaling models can diverge from reality after a product launch or viral event, requiring fallback manual overrides."] },
  },
  "Rate Limiting": {
    whenToUse: ["When your public API receives unpredictable traffic spikes that could cascade failures into downstream databases or microservices.", "If you need to enforce fair usage across tenants in a multi-tenant SaaS platform to prevent one customer from starving others.", "When exposing endpoints that trigger expensive operations (ML inference, third-party API calls) where each request has significant cost or latency."],
    avoid: ["When the bottleneck is internal service-to-service traffic on a trusted network — rate limiting adds latency and complexity without meaningful protection.", "If your traffic patterns are legitimately bursty and predictable (e.g., batch jobs on a schedule) — a queue or backpressure mechanism fits better than hard caps.", "When limits are applied uniformly without accounting for client tier — a blanket IP-based limit will block shared NAT users or corporate proxies unfairly."],
    failures: [{ name: "Thundering Herd on Reset", detail: "When rate limit windows reset at a fixed clock boundary (e.g., top of the minute), all throttled clients retry simultaneously, creating a traffic spike that defeats the purpose of limiting." }, { name: "Redis SPOF Kills All Traffic", detail: "A shared Redis counter with no fallback means a Redis outage either drops all requests (fail-closed) or bypasses all limits (fail-open), both of which are operationally catastrophic." }, { name: "Stale Counter Under Partitions", detail: "Network partitions between app instances and the shared counter store cause each instance to fall back to local counting, silently allowing Nx the intended limit during the partition window." }],
    tradeoffs: { pros: ["Protects downstream services from cascading overload without requiring changes to those services.", "Provides a clear, enforceable contract for API consumers, enabling monetization tiers and SLA guarantees.", "Reduces infrastructure costs by preventing runaway clients or scrapers from consuming unbounded compute."], cons: ["Distributed counters (Redis-based) add a synchronous network hop to every request, increasing p99 latency.", "Choosing the right algorithm and window size requires load testing — misconfigured limits silently degrade legitimate users.", "Operational overhead grows with complexity: per-tenant limits, burst allowances, and exemptions require ongoing tuning and monitoring."] },
  },
  "SQL vs NoSQL": {
    whenToUse: ["When your data has complex relationships requiring multi-table joins and referential integrity — reach for SQL to avoid denormalizing yourself into inconsistency.", "If you need horizontal write scaling beyond what a single primary can sustain (e.g., >50k writes/sec across regions), a wide-column or document store will outperform any RDBMS.", "When your schema is genuinely unknown or evolves per-document (e.g., user-defined attributes in a SaaS product), a document store avoids costly ALTER TABLE migrations on large tables."],
    avoid: ["When your team defaults to MongoDB because SQL migrations feel painful — schema discipline in SQL prevents entire classes of data corruption that document stores silently allow.", "If you need multi-entity transactions (e.g., debit one account, credit another), avoid eventually-consistent NoSQL stores unless you are prepared to implement saga patterns.", "When you conflate 'flexible schema' with 'no schema' — schemaless NoSQL still requires application-level validation, and skipping it leads to unreadable documents in production within months."],
    failures: [{ name: "Cassandra Tombstone Accumulation", detail: "Frequent deletes or TTL-heavy workloads generate tombstones that are not immediately purged, causing read latency to spike during compaction as Cassandra must scan millions of deleted markers." }, { name: "MongoDB Unbounded Document Growth", detail: "Appending arrays to documents without size caps causes documents to exceed their allocated space, triggering frequent document moves on disk and degrading write performance under load." }, { name: "SQL N+1 Under ORM Abstraction", detail: "ORMs that lazy-load associations silently execute one query per row in a result set, turning a single page load into hundreds of round trips that only surface under production traffic volumes." }],
    tradeoffs: { pros: ["SQL's ACID guarantees eliminate an entire class of consistency bugs that NoSQL systems push onto application code to solve.", "NoSQL wide-column stores (Cassandra, ScyllaDB) achieve near-linear write throughput scaling by adding nodes with no single-primary bottleneck.", "SQL's mature query planner and tooling ecosystem give engineers deep visibility into performance that most NoSQL systems lack."], cons: ["NoSQL horizontal scaling comes with operational complexity: rebalancing, replication lag, and quorum tuning require specialized expertise to avoid silent data loss.", "Denormalized NoSQL schemas duplicate data across documents, meaning a single logical update must be applied to multiple locations — creating consistency drift if any write fails.", "SQL vertical scaling hits a hard ceiling at the largest available instance, and read replicas add replication lag that surprises engineers who assume all reads are current."] },
  },
  "Database Sharding": {
    whenToUse: ["When your single database node is hitting CPU, memory, or I/O ceilings despite indexing and read-replica offloading.", "When you need horizontal write scalability and a single primary can no longer absorb the write throughput.", "If you need to enforce data residency by co-locating tenant data in specific geographic shards."],
    avoid: ["When your dataset fits comfortably on a single node — sharding adds operational complexity with no benefit.", "If your access patterns require frequent cross-shard joins or multi-row transactions, as distributed coordination overhead will negate throughput gains.", "When you have not yet exhausted vertical scaling, connection pooling, and read replicas, which are far simpler to operate."],
    failures: [{ name: "Hot Shard Saturation", detail: "A poorly chosen shard key (e.g., user signup date or a low-cardinality field) funnels a disproportionate share of traffic to one shard, recreating the single-node bottleneck you were trying to escape." }, { name: "Resharding Downtime", detail: "Migrating data to a new shard topology under live traffic requires careful dual-write and backfill coordination; naive resharding causes extended write locks or data loss if the cutover window is mismanaged." }, { name: "Cross-Shard Transaction Drift", detail: "Distributed transactions spanning multiple shards rely on two-phase commit, which leaves records in an indeterminate state if a coordinator crashes mid-flight, causing data inconsistencies that are difficult to detect and repair." }],
    tradeoffs: { pros: ["Write throughput scales linearly as shards are added, removing the single-node write ceiling.", "Each shard is a smaller, cheaper node that can be independently backed up, restored, or promoted.", "Fault blast radius is contained — a shard failure affects only the slice of data it owns."], cons: ["Application or middleware must implement shard-aware routing logic, increasing code and deployment complexity.", "Cross-shard queries require scatter-gather fan-out or denormalization, degrading latency and complicating schema changes.", "Operational burden multiplies with shard count: monitoring, schema migrations, and backups must be coordinated across every node."] },
  },
  "Replication (Leader–Follower, Multi-Leader)": {
    whenToUse: ["When your read traffic significantly outpaces writes and you need horizontal read scaling without sharding complexity.", "If you need automatic failover and high availability for a write-primary workload where brief leader election downtime is acceptable.", "When you operate across multiple geographic regions and need each region to accept writes locally to minimize latency."],
    avoid: ["When your workload is write-heavy across all nodes — replication lag will cause stale reads and conflict resolution overhead negates multi-leader gains.", "If your application cannot tolerate eventual consistency or requires strict linearizability for all reads — followers will serve stale data during lag spikes.", "When you lack operational tooling for monitoring replication lag and managing failover — blind promotion of a lagging follower will cause data loss."],
    failures: [{ name: "Stale Read After Failover", detail: "A newly promoted leader may be behind the old leader's commit log, causing clients to read data that appears to roll back to an earlier state." }, { name: "Split-Brain Dual Writes", detail: "Without proper fencing, two nodes simultaneously believe they are the leader and both accept writes, creating divergent dataset branches that are difficult to reconcile." }, { name: "Multi-Leader Write Conflict", detail: "Concurrent writes to the same record on different leaders produce conflicts that last-write-wins or application-level resolvers may silently resolve incorrectly, resulting in data loss." }],
    tradeoffs: { pros: ["Read throughput scales linearly by adding follower replicas without touching the write path.", "Leader–follower provides a clear, operationally simple mental model — all writes serialize through one node.", "Follower replicas serve as warm standbys, reducing recovery time objective (RTO) compared to restoring from backup."], cons: ["Asynchronous replication introduces replication lag, making it impossible to guarantee that follower reads reflect the latest committed write.", "Failover is operationally complex — automated leader election risks split-brain and requires distributed consensus (e.g., Raft) to be safe.", "Multi-leader conflict resolution must be designed and tested explicitly; generic strategies like last-write-wins silently discard valid writes under concurrent load."] },
  },
  "CAP Theorem": {
    whenToUse: ["When your system must never return stale or conflicting data (e.g., financial ledgers, distributed locks), choose a CP store and accept that writes may be rejected during a partition.", "If you need 24/7 availability for user-facing reads and can tolerate eventual consistency (e.g., shopping carts, social feeds), an AP store like Cassandra is the right fit.", "When designing a new distributed service, use CAP as a forcing function to make the CP vs. AP trade-off explicit before choosing a datastore."],
    avoid: ["When your workload runs on a single node or within a single data center with reliable networking, CAP trade-offs are largely irrelevant and add unnecessary complexity.", "If you misread 'Consistency' as 'eventual consistency' — CAP's C means linearizability, not the weaker guarantee many AP stores actually provide.", "When you need both strong consistency and high availability during normal operation — CAP only forces a choice under partition, so design for partition recovery paths."],
    failures: [{ name: "Split-Brain Write Conflict", detail: "During a network partition, two AP nodes accept conflicting writes to the same key; after healing, the merge logic silently discards one update, causing permanent data loss." }, { name: "CP Timeout Cascade", detail: "A CP store like etcd refuses writes during a leader election; if upstream services retry aggressively instead of circuit-breaking, the backlog overwhelms the cluster the moment the partition heals." }, { name: "Stale Read on Replica Lag", detail: "An AP store reports 'available' but a lagging replica returns data seconds or minutes behind the leader, causing a user to see a rolled-back state after a confirmed write." }],
    tradeoffs: { pros: ["Forces an explicit, documented consistency contract before a system goes to production, preventing silent disagreements between teams.", "AP stores like Cassandra achieve near-linear write throughput by dropping the coordination overhead required for strong consistency.", "CP stores give you a clear, auditable source of truth that simplifies reasoning about correctness in multi-service transactions."], cons: ["CP systems introduce write latency and availability windows during leader elections or quorum loss, directly impacting SLA.", "AP systems require conflict resolution logic (CRDTs, application-level merging) that is complex to implement correctly.", "CAP does not cover latency, so choosing CP does not protect against slow quorum responses degrading perceived availability even when the system is technically up."] },
  },
  "ACID vs BASE": {
    whenToUse: ["When your system handles financial transactions, inventory reservations, or any operation where partial writes would corrupt business-critical data.", "If you need to scale writes horizontally across many nodes and can tolerate eventual consistency, such as user activity feeds, session stores, or analytics event ingestion.", "When your read traffic dwarfs write traffic and stale reads are acceptable, such as serving cached product catalog pages or leaderboard rankings."],
    avoid: ["When your domain requires strict read-your-writes guarantees, such as auth token validation or double-spend prevention — BASE consistency windows will cause phantom failures.", "If your team lacks operational expertise to handle conflict resolution, tombstones, or vector clocks; eventual consistency bugs surface late and are hard to reproduce in staging.", "When regulatory compliance (PCI-DSS, SOX) mandates auditable, point-in-time consistent records — BASE systems make external audits significantly harder."],
    failures: [{ name: "Phantom Double-Spend", detail: "Two concurrent BASE nodes both approve a payment before replication converges, debiting the account twice because neither node saw the other's write in time." }, { name: "Stale Cache Poisoning", detail: "A read-replica lagging by seconds serves an outdated record to downstream services that cache it further, causing a cascade of stale state that outlives the original replication lag." }, { name: "Silent Conflict Merge", detail: "Last-write-wins or application-level merge logic silently discards valid concurrent updates, such as two users editing a shared document, with no error surfaced to either client." }],
    tradeoffs: { pros: ["ACID gives strong correctness guarantees that eliminate entire classes of concurrency bugs without application-level compensation logic.", "BASE systems can sustain high write throughput across geo-distributed nodes with no single coordinator bottleneck, enabling linear horizontal scale.", "BASE availability during network partitions means the system continues accepting writes even when replicas are temporarily unreachable."], cons: ["ACID transactions impose write serialization overhead and lock contention that caps throughput on hot rows, often requiring connection pooling and careful schema design.", "BASE systems push conflict resolution complexity into application code, requiring engineers to reason about convergence, idempotency, and read-repair explicitly.", "Debugging BASE inconsistencies in production is notoriously difficult because the failure state is non-reproducible and spread across multiple nodes."] },
  },
  "Caching Strategies": {
    whenToUse: ["When your read-to-write ratio is high and the same data is fetched repeatedly by many users (e.g., product catalog, user profiles).", "If you need to absorb database read spikes during traffic bursts without scaling the DB tier.", "When query latency exceeds acceptable SLA thresholds and the underlying data changes infrequently enough to tolerate brief staleness."],
    avoid: ["When data mutates on nearly every request (e.g., real-time inventory counts), cache churn negates any benefit and adds operational overhead.", "If correctness is paramount and even momentary stale reads are unacceptable (e.g., financial balances, auth tokens), cache inconsistency becomes a liability.", "When the working set is too large to fit in memory, cache eviction thrash causes hit rates to collapse and latency becomes worse than a direct DB read."],
    failures: [{ name: "Thundering Herd on Expiry", detail: "When a popular key's TTL expires under high load, hundreds of requests simultaneously miss the cache and hammer the database before any single request can repopulate it." }, { name: "Write-Behind Data Loss", detail: "If the cache node crashes before the async flush completes, writes acknowledged to the client are permanently lost because they never reached the durable store." }, { name: "Cache Stampede on Cold Start", detail: "After a cache flush or deployment, all keys are cold simultaneously, causing the origin database to absorb the full production request volume until the cache warms up." }],
    tradeoffs: { pros: ["Dramatically reduces p99 read latency by serving hot data from memory rather than disk-backed storage.", "Shields the primary database from read amplification, allowing a smaller DB instance to handle peak traffic.", "Horizontally scalable read capacity — adding cache nodes absorbs more traffic without touching the DB schema or sharding strategy."], cons: ["Cache invalidation logic adds correctness risk; stale reads are a persistent operational concern that grows with write frequency.", "Introduces a second stateful system to operate, monitor, and size, increasing infrastructure complexity and on-call burden.", "Write-through and write-behind patterns couple cache availability to write-path correctness, turning a cache outage into a write-path incident."] },
  },
  "CDN (Content Delivery Network)": {
    whenToUse: ["When your static assets or media files are served to geographically distributed users and round-trip latency to origin is measurable in hundreds of milliseconds.", "When your origin servers are absorbing bandwidth-heavy requests (large images, video, JS bundles) that could be offloaded to edge nodes at lower cost.", "If you need TLS termination and DDoS absorption at the network edge before traffic ever reaches your infrastructure."],
    avoid: ["When serving highly personalized or user-specific responses that cannot be shared across cache keys, making cache hit rates negligible.", "If your content changes faster than your CDN's minimum TTL or purge propagation time, you risk serving stale data to users.", "When your user base is entirely within a single region and the CDN's edge nodes add routing hops rather than reducing them."],
    failures: [{ name: "Stale Cache After Deploy", detail: "New JS/CSS deploys leave old assets cached at edge PoPs when versioned URLs are not used, so users receive a mix of old and new file versions until TTL expires." }, { name: "Cache Key Collision", detail: "Query strings or headers that vary the response (e.g., Accept-Language, cookie-based A/B flags) are stripped from the cache key, causing one user's personalized response to be served to another." }, { name: "Origin Overload on Cache Miss Storm", detail: "A cache flush or a cold CDN deployment causes all PoPs to simultaneously miss and stampede the origin, overwhelming it just as traffic spikes." }],
    tradeoffs: { pros: ["Dramatically reduces p95/p99 latency for geographically distant users by serving from an edge node tens of milliseconds away instead of a distant origin.", "Offloads bandwidth and compute from origin servers, reducing infrastructure cost for high-traffic static workloads.", "Built-in DDoS absorption and TLS termination at the edge reduces the attack surface and operational burden on your own infrastructure."], cons: ["Cache invalidation is operationally complex — purge APIs have propagation delays measured in seconds to minutes, and misconfigured TTLs silently serve stale content.", "CDN egress and request pricing can exceed origin savings at high scale, especially for large media files with low cache hit ratios.", "Debugging cache behavior (hit/miss, vary headers, cache key construction) requires CDN-vendor-specific tooling and adds an extra layer of indirection to production incidents."] },
  },
  "Cache Eviction Policies": {
    whenToUse: ["When your workload has strong temporal locality (e.g., user session data, recent feed items) and you want simple, predictable eviction with LRU.", "If you need to protect a cache from scan pollution — large one-off queries that would flush hot data — use ARC or a segmented LRU variant.", "When cached entries have a natural expiry contract (auth tokens, rate-limit counters, DNS records), TTL-based eviction enforces correctness without manual invalidation."],
    avoid: ["When access frequency is nearly uniform across keys, LFU adds bookkeeping overhead with no meaningful hit-rate advantage over LRU.", "If your dataset has periodic bulk scans (ETL jobs, full-table reads), pure LRU will thrash the cache and evict all hot keys in a single pass.", "When items must be invalidated on write (cache-aside with DB mutations), relying solely on TTL risks serving stale data until the timer expires."],
    failures: [{ name: "LRU Scan Thrash", detail: "A full-table scan or cold-start bulk read sequentially promotes millions of rarely-reused keys, evicting all genuinely hot entries and collapsing hit rate to near zero." }, { name: "LFU Frequency Decay Lag", detail: "Counters accumulated during a past traffic spike keep stale keys pinned as 'frequent,' starving newly popular keys from entering the cache until the old counts age out." }, { name: "TTL Clock Stampede", detail: "When many keys share the same TTL (e.g., all set at server startup), they expire simultaneously, causing a thundering-herd of backend requests that overwhelms the origin." }],
    tradeoffs: { pros: ["LRU and LFU are O(1) with a doubly-linked list + hash map, adding negligible per-request latency.", "TTL provides a hard bound on data staleness, making cache correctness auditable and predictable for compliance-sensitive data.", "ARC self-tunes the recency/frequency balance at runtime, removing the need to manually profile and adjust policy per workload."], cons: ["LFU requires per-key counters and an aging mechanism, increasing memory overhead and implementation complexity compared to LRU.", "TTL-based eviction can mask missing invalidation logic, leaving engineers unaware of stale-read bugs that only surface after cache expiry.", "No single policy handles mixed workloads optimally — a cache shared by session reads, bulk exports, and low-frequency config keys will always have a mismatched eviction policy for at least one access pattern."] },
  },
  "Redis Architecture": {
    whenToUse: ["When your application needs sub-millisecond read/write latency for session tokens, rate-limit counters, or leaderboards that would bottleneck a relational DB.", "When you need atomic operations across composite data structures (e.g., incrementing a counter and appending to a list in one round-trip) without application-level locking.", "If you need a pub/sub or stream-based fan-out layer to decouple producers from consumers without standing up a full message broker."],
    avoid: ["When your dataset reliably exceeds available RAM and you cannot shard it, because Redis evicts or errors rather than spilling to disk transparently.", "If you need complex relational queries or secondary indexes across many fields — Redis data modeling devolves into multiple round-trips or bloated sorted-set hacks.", "When durability requirements demand zero data loss on crash, because even AOF with fsync-every-write adds latency and a crash between fsyncs can still lose the last write."],
    failures: [{ name: "Memory Fragmentation OOM Kill", detail: "Under heavy churn of variable-length values, the allocator fragments heap until RSS exceeds the container memory limit and the OOM killer terminates the process, even though Redis reports used_memory well under the limit." }, { name: "AOF Rewrite Stall", detail: "During a background AOF rewrite Redis forks, and on a large dataset with copy-on-write pressure the parent's write latency spikes to hundreds of milliseconds, breaking latency SLAs." }, { name: "Cluster Split-Brain Writes", detail: "If a primary loses quorum but clients still route to it before Sentinel/Cluster triggers failover, writes accepted during that window are silently discarded when the replica is promoted." }],
    tradeoffs: { pros: ["Single-threaded command execution eliminates lock contention and makes command latency predictable at microsecond scale.", "Rich atomic data structures (sorted sets, HyperLogLog, streams) replace entire categories of application-level logic with a single network round-trip.", "Redis Cluster provides horizontal write scaling and automatic failover without a separate coordination service."], cons: ["All active data must fit in RAM across the cluster, making capacity planning expensive and eviction policy tuning mandatory.", "Replication is asynchronous by default, so any primary failure risks losing acknowledged writes that had not yet been replicated.", "Operational complexity multiplies with Cluster: resharding, slot migration, and cross-slot multi-key commands are restricted or require careful coordination."] },
  },
  "DNS Resolution Flow": {
    whenToUse: ["When your service needs zero-downtime cutover between IPs — set a low TTL (60s) days before the migration so resolvers drain caches quickly.", "When you need to implement geographic traffic steering — authoritative nameservers can return different A records based on the resolver's origin region.", "If you need to detect DNS hijacking or validate record integrity in a regulated environment — enable DNSSEC validation at the resolver layer."],
    avoid: ["When sub-second failover is required — DNS TTL-based switching has an inherent propagation delay that makes it unsuitable as a sole health-routing mechanism.", "If you are relying on DNS TTL as a security boundary — client-side resolvers and OS caches frequently ignore TTLs, holding stale records well past expiry.", "When debugging intermittent connectivity issues caused by stale records — changing TTL after the fact does not flush already-cached responses in downstream resolvers."],
    failures: [{ name: "Stale Cache After Failover", detail: "A resolver that cached the old IP before TTL was lowered continues serving the dead address, causing a subset of users to experience outages for the full original TTL window." }, { name: "Negative Caching Storm", detail: "A misconfigured SOA negative-cache TTL causes resolvers to cache NXDOMAIN responses for deleted or mis-typed records, blocking traffic long after the record is corrected." }, { name: "DNSSEC Validation Failure", detail: "Expired or mismatched DNSSEC signatures cause validating resolvers to return SERVFAIL for legitimate domains, silently dropping all traffic from security-conscious clients." }],
    tradeoffs: { pros: ["Globally distributed caching at recursive resolvers reduces authoritative nameserver query load at scale.", "TTL-based propagation requires no client-side changes — failover and traffic shifts happen transparently to all consumers.", "DNSSEC provides a cryptographically verifiable chain of trust that prevents cache poisoning without requiring application-layer changes."], cons: ["TTL propagation makes instantaneous global cutover impossible — residual traffic to old records persists for the full TTL duration after any change.", "Operational complexity increases with DNSSEC key rotation, which must be timed precisely to avoid validation failures during the rollover window.", "Recursive resolver behavior is outside your control — OS-level and browser caches can override TTLs, making real-world propagation times unpredictable."] },
  },
  "HTTP vs HTTPS": {
    whenToUse: ["When your service transmits credentials, tokens, or any PII — HTTPS is mandatory to prevent credential theft over untrusted networks.", "If you need API authenticity guarantees between services, HTTPS mutual TLS (mTLS) ensures both client and server identities are verified.", "When deploying to production on any public-facing endpoint, HTTPS is required by browsers for service workers, geolocation, and other modern APIs."],
    avoid: ["When running service-to-service traffic entirely within a trusted private network with existing encryption at the infrastructure layer (e.g., WireGuard), double-encrypting adds latency with no meaningful security gain.", "If you are doing local development with non-browser tooling, self-signed certificate friction slows iteration with no real security benefit.", "When terminating TLS at a load balancer, avoid re-encrypting all the way to every internal pod unless compliance mandates end-to-end encryption, as it adds CPU overhead and complicates certificate rotation."],
    failures: [{ name: "Mixed Content Blocking", detail: "A single HTTP sub-resource (image, script, or XHR) on an HTTPS page causes browsers to block or warn, breaking functionality silently in production after a migration." }, { name: "Certificate Expiry Outage", detail: "Forgetting to auto-renew a certificate causes hard browser errors for all users — even a one-hour expiry window can constitute a full outage if renewal pipelines are manual." }, { name: "TLS Version Downgrade", detail: "Without HSTS and explicit server-side minimum version enforcement, a man-in-the-middle can negotiate TLS 1.0/1.1 and exploit known weaknesses such as BEAST or POODLE." }],
    tradeoffs: { pros: ["Encryption in transit prevents credential and session token theft on shared or hostile networks.", "Server certificates provide cryptographic proof of origin, blocking DNS spoofing and BGP hijack impersonation attacks.", "HSTS and certificate pinning give a durable, browser-enforced upgrade path that survives misconfigured redirects."], cons: ["TLS handshakes add 1–2 round trips of latency for new connections, which compounds in high-connection-rate microservice meshes without connection pooling.", "Certificate lifecycle management — procurement, rotation, OCSP stapling, and CT log monitoring — introduces non-trivial operational overhead.", "0-RTT session resumption in TLS 1.3 is vulnerable to replay attacks on non-idempotent endpoints if not explicitly guarded."] },
  },
  "WebSockets vs HTTP Polling": {
    whenToUse: ["When your app requires sub-second bidirectional updates, such as collaborative editing or live trading feeds where polling latency is unacceptable.", "If you need the server to push events to many clients simultaneously without each client repeatedly hammering your API.", "When your use case involves sustained, frequent message exchange where the HTTP handshake overhead per request would dominate bandwidth costs."],
    avoid: ["When updates are infrequent (e.g., a dashboard refreshing every 30 seconds), since polling is simpler to operate and scales without sticky-session concerns.", "If your infrastructure sits behind proxies or load balancers that aggressively terminate idle TCP connections, as silent disconnects will silently break WebSocket clients.", "When your team lacks observability tooling for long-lived connections, making it hard to diagnose ghost connections and memory leaks under load."],
    failures: [{ name: "Silent WebSocket Disconnect", detail: "Intermediate proxies or NAT gateways silently drop idle TCP connections, leaving clients in a connected state with no data flow until a heartbeat or reconnect logic catches the stale socket." }, { name: "Polling Thundering Herd", detail: "When a large cohort of clients all poll on the same interval, requests arrive in synchronized bursts that spike server CPU and database load, causing cascading latency spikes." }, { name: "Horizontal Scale Fan-Out Failure", detail: "Without a shared pub/sub layer (e.g., Redis), a WebSocket message published on one server node is never delivered to clients connected to other nodes, causing silent message loss." }],
    tradeoffs: { pros: ["WebSockets eliminate per-message HTTP overhead, reducing bandwidth and server CPU for high-frequency update streams.", "True server push removes client polling logic entirely, simplifying application code and cutting unnecessary round trips.", "Full-duplex channels let both sides send independently, enabling tightly coupled interactions like collaborative cursors or multiplayer state sync."], cons: ["WebSockets require stateful connection management — horizontal scaling mandates sticky sessions or a pub/sub broker, adding operational complexity.", "Long-lived TCP connections consume file descriptors and memory per connection, requiring careful tuning of OS limits and connection pooling.", "Polling degrades gracefully behind any HTTP infrastructure, while WebSocket upgrades can be silently blocked by corporate proxies, CDN edge nodes, or misconfigured load balancers."] },
  },
  "REST vs GraphQL vs gRPC": {
    whenToUse: ["When your API is consumed by third-party clients or browsers where REST's ubiquity and HTTP caching reduce infrastructure complexity.", "If you need a flexible public or BFF API where mobile and web clients fetch different data shapes, GraphQL eliminates the need for multiple versioned endpoints.", "When building internal microservices with strict latency budgets and well-defined contracts, gRPC's binary framing and codegen enforce interface consistency at compile time."],
    avoid: ["When your team lacks GraphQL operational experience — N+1 resolver bugs and unbounded query depth can saturate your database under production load.", "If your infrastructure or clients cannot guarantee HTTP/2 end-to-end, gRPC's transport dependency will block adoption at load balancers or legacy proxies.", "When exposing a simple CRUD resource to external partners, GraphQL's schema overhead and lack of native CDN cacheability add cost with no benefit over REST."],
    failures: [{ name: "GraphQL N+1 Query Explosion", detail: "Without DataLoader batching, each list item triggers an individual resolver database call, multiplying queries by result count and collapsing under moderate traffic." }, { name: "gRPC Proxy Incompatibility", detail: "HTTP/2 trailers required by gRPC are stripped or rejected by many Layer-7 load balancers and API gateways, causing silent connection failures in production routing." }, { name: "REST Chatty Under-fetching", detail: "Mobile clients hitting paginated REST APIs for related resources issue cascading sequential requests, inflating latency and battery usage on high-latency connections." }],
    tradeoffs: { pros: ["REST's stateless resource model maps directly onto HTTP caching infrastructure, enabling CDN edge caching with zero application code.", "gRPC's generated stubs from .proto files enforce a shared schema contract between services, catching interface drift at build time rather than runtime.", "GraphQL's single endpoint with typed introspection enables frontend teams to iterate on data requirements without backend deploys."], cons: ["GraphQL requires a query depth and complexity analysis layer in production to prevent denial-of-service via deeply nested or expensive client-crafted queries.", "gRPC's binary protocol eliminates human readability, making on-call debugging without tooling significantly slower than inspecting JSON.", "REST versioning strategies (URI, header, or query param) each introduce long-term maintenance burden as old versions must be supported until all clients migrate."] },
  },
  "Message Queues vs Event Streams": {
    whenToUse: ["When your workers need to process jobs exactly once and you want built-in competing-consumer load balancing, reach for a queue (SQS, RabbitMQ).", "If you need multiple independent downstream services to react to the same event (e.g., order placed triggers billing, inventory, and notifications), use a stream.", "When you need replay capability for bootstrapping a new service from historical data or debugging a production incident, Kafka's durable log is the right fit."],
    avoid: ["When you only have one consumer and no need for replay — the operational overhead of Kafka clusters is unjustified.", "If your team lacks Kafka expertise; misconfigured partition counts and replication factors cause data loss and uneven consumer lag in production.", "When message ordering must be strictly global — Kafka guarantees order only within a partition, so cross-partition ordering requires extra coordination."],
    failures: [{ name: "Consumer Lag Accumulation", detail: "A slow or crashing Kafka consumer group falls behind indefinitely; if lag exceeds the retention window, events are deleted before processing, causing silent data loss." }, { name: "Poison Message Loop", detail: "A malformed message that always throws on deserialization causes a queue consumer to nack and requeue it in a tight loop, starving all other messages until a DLQ is configured." }, { name: "Rebalance Storm", detail: "Frequent Kafka consumer group rebalances — triggered by slow poll intervals or rolling deployments — halt all partition consumption for seconds to minutes, causing visible processing gaps under load." }],
    tradeoffs: { pros: ["Streams decouple producers from consumers completely, letting you add new subscribers without touching upstream services.", "Queue-based task distribution gives you fine-grained per-message acknowledgment and built-in retry/DLQ semantics out of the box.", "Kafka's immutable log doubles as an audit trail and enables event-sourcing patterns with zero additional infrastructure."], cons: ["Kafka clusters require careful capacity planning and ongoing ops burden that queues like SQS fully abstract away.", "At-least-once delivery in both systems forces idempotent consumer design, adding complexity to every handler that writes to a database or calls an external API.", "Stream consumers must manage committed offsets correctly — failing to commit after processing, or committing before processing, causes duplicate work or message loss on restart."] },
  },
  "Pub/Sub Pattern": {
    whenToUse: ["When your system needs to broadcast a single event (e.g., order placed) to multiple independent downstream services without tight coupling.", "If you need to absorb traffic spikes by buffering events between a high-throughput producer and slower consumers.", "When adding new consumers to an event stream must not require changes to the publisher."],
    avoid: ["When you need guaranteed exactly-once, ordered processing of a single consumer's queue — a point-to-point message queue (SQS, RabbitMQ) is a simpler fit.", "If the publisher requires a synchronous response from the consumer, since pub/sub is inherently fire-and-forget.", "When your event volume is low and the broker's operational overhead (schema registry, partition tuning, consumer group management) outweighs the decoupling benefit."],
    failures: [{ name: "Consumer Lag Spiral", detail: "A slow consumer falls behind on its partition offset, and if lag accumulates faster than it drains, the consumer never catches up — often triggered by a downstream database becoming a bottleneck under fan-out load." }, { name: "Silent Message Loss on Overflow", detail: "When a topic's retention window expires or a queue reaches its size limit before a consumer recovers from an outage, messages are silently dropped unless dead-letter queues and monitoring are explicitly configured." }, { name: "Thundering Herd on Rebalance", detail: "A consumer group rebalance (e.g., rolling deploy of 20 pods) causes all partitions to be reassigned simultaneously, stalling processing for seconds to minutes and spiking downstream latency." }],
    tradeoffs: { pros: ["Publishers and consumers can be deployed, scaled, and failed independently, eliminating synchronous inter-service dependencies.", "Fan-out to N consumers is free — adding a new subscriber requires zero changes to the publisher or existing consumers.", "The broker acts as a buffer, smoothing bursty write loads and protecting downstream services from traffic spikes."], cons: ["Debugging end-to-end request flows requires distributed tracing correlation IDs, since there is no direct call stack linking publisher to consumer.", "Operational burden is high: brokers require capacity planning, partition rebalancing, offset management, schema evolution, and consumer lag alerting.", "Achieving exactly-once semantics requires idempotent consumers and transactional producers, adding significant application-level complexity."] },
  },
  "Kafka Architecture": {
    whenToUse: ["When your system needs durable, replayable event streams shared across multiple independent consumers (e.g., analytics, audit logs, and microservices all reading the same pipeline).", "If you need to decouple high-throughput producers from slow downstream consumers without losing messages under burst load.", "When you need a scalable change data capture (CDC) backbone where downstream services reconstruct state from an ordered log."],
    avoid: ["When you need low-latency request/reply semantics — Kafka's poll-based consumption adds milliseconds of latency unsuitable for synchronous RPC patterns.", "If your workload is simple task queuing with per-message acknowledgment and deletion — RabbitMQ or SQS handles this with far less operational overhead.", "When your team lacks the operational expertise to tune partition counts, retention policies, and consumer group lag — misconfiguration silently causes runaway disk usage or consumer stalls."],
    failures: [{ name: "Consumer Lag Spiral", detail: "A slow consumer falls behind partition head; if lag exceeds the retention window before the consumer catches up, offsets point to deleted segments and the consumer must reset, risking data loss or reprocessing from the beginning." }, { name: "Partition Rebalance Storm", detail: "Frequent consumer group rebalances caused by slow poll loops or deployment rolling restarts halt all partition consumption for seconds to minutes across the entire group." }, { name: "Unclean Leader Election", detail: "With unclean.leader.election.enable=true, a broker with stale data is elected leader after ISR failure, silently serving older offsets and causing consumers to skip or duplicate messages." }],
    tradeoffs: { pros: ["Horizontal throughput scales linearly by adding partitions and brokers without changing producer or consumer code.", "Messages are durably persisted to disk and replayable, enabling late-joining consumers and point-in-time recovery without re-ingestion.", "Decouples producers from consumers completely — producers never block waiting for downstream services to process."], cons: ["Partition count is effectively immutable after creation; under-partitioning at design time creates a hard throughput ceiling that requires painful topic recreation to fix.", "Exactly-once semantics require idempotent producers, transactional APIs, and consumer-side deduplication — significantly increasing application complexity.", "Cluster operations (broker replacement, partition reassignment, rolling upgrades) require careful sequencing and can saturate network I/O during partition replication."] },
  },
  "Dead Letter Queues": {
    whenToUse: ["When your consumers encounter transient or permanent processing failures and you need to prevent poison-pill messages from blocking the entire queue indefinitely.", "If you need an audit trail of failed messages to diagnose upstream data quality issues or schema mismatches in production.", "When your system requires guaranteed message delivery and you cannot afford to silently drop unprocessable events."],
    avoid: ["When failures are expected and ignorable — routing every low-priority event to a DLQ creates noise that buries real incidents.", "If your retry logic does not have exponential backoff, the DLQ will fill with messages that could have self-healed, masking a misconfigured retry policy.", "When the downstream fix requires schema migration — replaying DLQ messages before the consumer is updated will immediately re-dead-letter them."],
    failures: [{ name: "DLQ Replay Storm", detail: "Replaying a large DLQ backlog at full speed overwhelms the consumer or downstream database, causing cascading failures identical to the original outage." }, { name: "Silent DLQ Saturation", detail: "Without alerting on DLQ depth, thousands of failed messages accumulate undetected while the main queue appears healthy, delaying incident discovery by hours or days." }, { name: "Poison Message Loop", detail: "A message is replayed from the DLQ before its root cause is fixed, fails again, and re-enters the DLQ indefinitely, wasting compute and obscuring queue metrics." }],
    tradeoffs: { pros: ["Isolates poison-pill messages so a single bad event cannot starve downstream consumers of healthy work.", "Preserves full message context — headers, payload, error reason, and original timestamp — enabling precise root-cause analysis without log correlation.", "Enables safe replay-driven recovery: once the bug is fixed, messages can be reprocessed without data loss or manual reconstruction."], cons: ["Operational overhead is non-trivial: teams must instrument DLQ depth alerts, build replay tooling, and define retention policies to prevent unbounded storage growth.", "Replay correctness is not guaranteed — if consumers are not idempotent, replaying DLQ messages can cause duplicate side effects such as double charges or duplicate notifications.", "DLQ existence can mask systemic issues; teams may treat DLQ growth as normal and defer root-cause fixes, accumulating technical debt in the failure path."] },
  },
  "API Gateway Pattern": {
    whenToUse: ["When your microservices architecture exposes dozens of endpoints and you need a unified surface for auth, rate limiting, and routing without duplicating that logic per service.", "When you need to support multiple client types (mobile, web, third-party) with different payload shapes or auth schemes from the same backend fleet.", "If you need to enforce SLAs, collect distributed traces, or apply circuit breaking at the edge before requests fan out to internal services."],
    avoid: ["When you have a monolith or fewer than three services — the operational overhead of an HA gateway cluster outweighs the benefit.", "If you push heavy business logic (data aggregation, orchestration, validation) into the gateway, turning it into a fat middleware that becomes a deployment bottleneck.", "When your team lacks the ops maturity to monitor and hot-reload gateway config — misconfigurations silently drop traffic with no service-level visibility."],
    failures: [{ name: "Gateway Config Drift", detail: "Route rules and auth policies updated in the gateway lag behind service deployments, causing 401s or 404s in production until configs are manually reconciled." }, { name: "Thundering Herd on Restart", detail: "Rolling gateway restarts under load cause brief connection drops that trigger client retries, spiking upstream services beyond capacity before the new instances are ready." }, { name: "TLS Termination Misconfiguration", detail: "When the gateway terminates TLS but forwards plain HTTP internally, a misconfigured internal network policy or cloud security group exposes inter-service traffic in cleartext." }],
    tradeoffs: { pros: ["Centralises cross-cutting concerns so individual services ship without auth or rate-limiting boilerplate, reducing per-service complexity.", "Enables protocol translation (gRPC to REST, WebSocket upgrades) at the edge without touching backend service code.", "Provides a single observability chokepoint for request volume, latency percentiles, and error rates across all services."], cons: ["The gateway becomes a latency-adding hop in every request path — misconfigured timeouts or plugin chains can silently inflate p99 latency.", "HA deployment, certificate management, and plugin versioning add significant operational burden that scales with traffic and team size.", "Gateway vendor lock-in (Kong, AWS API Gateway, Envoy config formats) makes migration costly if requirements outgrow the chosen platform."] },
  },
  "Service Mesh": {
    whenToUse: ["When your organization runs 10+ microservices across multiple teams and needs consistent mTLS, observability, and traffic policy without burdening each team with cross-cutting networking code.", "If you need fine-grained traffic control such as canary deployments, A/B testing, or weighted routing across service versions in production.", "When compliance requires encrypted service-to-service communication and you cannot enforce it at the application layer consistently."],
    avoid: ["When your architecture has fewer than five services — the operational overhead of managing a control plane and sidecar fleet exceeds the benefit.", "If your team lacks Kubernetes expertise, since most service meshes assume a container orchestration platform and add significant debugging surface area.", "When latency budgets are extremely tight (sub-millisecond SLOs) because every hop through an Envoy sidecar adds 1–2ms of overhead."],
    failures: [{ name: "Control Plane Outage Cascades", detail: "If Istio Pilot becomes unavailable, sidecars cannot refresh xDS configuration, causing stale routing rules to persist and new deployments to fail traffic registration." }, { name: "mTLS Certificate Expiry", detail: "Workload certificates issued by the mesh CA have short TTLs; if automatic rotation fails silently, services begin rejecting each other's connections with cryptic TLS handshake errors." }, { name: "Sidecar Injection Race", detail: "A pod that starts before its Envoy sidecar is fully initialized can make outbound calls that bypass the mesh, breaking mTLS guarantees and leaking unencrypted traffic." }],
    tradeoffs: { pros: ["Centrally enforced mTLS and RBAC policies eliminate per-service networking boilerplate and reduce the blast radius of a compromised service.", "Built-in distributed tracing and traffic metrics give platform teams end-to-end observability without instrumenting application code.", "Traffic management features like retries, timeouts, and circuit breakers are applied uniformly via CRDs, enabling safe progressive delivery across all services."], cons: ["Each sidecar proxy consumes additional CPU and memory per pod, meaningfully increasing cluster resource costs at scale.", "Debugging mesh-layer failures requires expertise in xDS APIs, Envoy admin endpoints, and control-plane logs — a steep learning curve that can block incident response.", "Upgrades to the mesh version often require coordinated sidecar restarts across the entire fleet, creating a wide blast radius and complex change management."] },
  },
  "Circuit Breaker Pattern": {
    whenToUse: ["When your service calls an external dependency (DB, third-party API, downstream microservice) that can fail slowly and exhaust your thread pool under load.", "When you need to give a degraded dependency time to recover without manual intervention or cascading timeouts propagating upstream.", "If you need observable failure boundaries — a tripped circuit makes it immediately visible in dashboards which dependency is the source of an incident."],
    avoid: ["When the dependency is synchronous and critical with no acceptable fallback — a tripped circuit still returns an error, so the caller must be able to tolerate that.", "If the call volume is too low to produce statistically meaningful failure rates, the circuit will never accumulate enough data to trip accurately.", "When the downstream call is idempotent and fast enough that a simple retry with exponential backoff is sufficient — adding a circuit breaker adds operational complexity without meaningful benefit."],
    failures: [{ name: "Thundering Herd on Half-Open", detail: "When the circuit transitions to half-open, all queued callers simultaneously probe the recovering dependency, overwhelming it before it has stabilized." }, { name: "Threshold Tuned to Steady State", detail: "Thresholds calibrated on normal traffic become hair-triggers during traffic spikes, causing false trips that take down a healthy service during peak load." }, { name: "Shared State Drift in Multi-Instance Deploy", detail: "Each instance tracks failures independently in memory, so the circuit never trips cluster-wide unless state is centralized (e.g., in Redis), masking a real outage." }],
    tradeoffs: { pros: ["Fails fast on known-bad dependencies, freeing threads and preventing latency from compounding into full service unavailability.", "Creates a natural recovery window for the downstream service by shedding load during the open state.", "Provides a clear, observable signal — circuit state is a first-class health metric that maps directly to a specific dependency."], cons: ["Requires careful per-dependency threshold tuning; wrong values cause either false trips or late protection.", "Distributed deployments need a shared state store for accurate cluster-wide trip logic, adding infrastructure overhead.", "Callers must explicitly handle the fast-fail error case and implement fallback logic, increasing application complexity."] },
  },
  "Saga Pattern": {
    whenToUse: ["When your business transaction spans multiple microservices and you cannot use a distributed 2PC without creating tight coupling or availability risk.", "If you need long-running workflows (e.g., order fulfillment, travel booking) where individual steps may take seconds to minutes and holding locks is impractical.", "When your services are owned by separate teams with independent deployment cycles and a shared transaction coordinator would become a cross-team bottleneck."],
    avoid: ["When the business domain genuinely requires strict ACID isolation — for example, financial double-entry ledgers where even a brief inconsistent state is unacceptable.", "If your compensating transactions cannot be made idempotent or are technically impossible to reverse (e.g., sending an SMS), because rollback leaves the system in an unrecoverable partial state.", "When the workflow has fewer than two services involved, since a local database transaction is simpler and removes all saga overhead."],
    failures: [{ name: "Lost Compensating Transaction", detail: "A compensating event is published but the downstream service is temporarily down, leaving the saga permanently stuck in a partially rolled-back state if the retry mechanism has no dead-letter queue." }, { name: "Duplicate Event Processing", detail: "A choreography saga re-delivers an event after a network timeout, causing a service to execute its step twice — triggering duplicate charges or double inventory deductions if handlers are not idempotent." }, { name: "Phantom Reads Between Steps", detail: "A concurrent saga reads data committed by the first step of another saga before that saga completes, acting on a state that may later be compensated and effectively never existed." }],
    tradeoffs: { pros: ["Eliminates distributed locks, so each service commits locally and releases resources immediately, improving throughput under high concurrency.", "Services remain loosely coupled — adding or reordering a step requires changing only the orchestrator or a single event subscription, not every participant.", "Failure scope is bounded: a saga failure triggers targeted compensations rather than a full system rollback, reducing blast radius."], cons: ["Compensating logic doubles your codebase surface area — every forward action needs a tested, idempotent undo path that must be maintained as the schema evolves.", "Debugging a failed saga across service logs and event streams is significantly harder than reading a single database transaction log.", "The temporary inconsistency window forces consumers to handle intermediate states explicitly, complicating UI and downstream query logic."] },
  },
  "Fault Tolerance & Redundancy": {
    whenToUse: ["When your service has an SLA requiring 99.9%+ uptime and a single node failure would breach it.", "If you need to perform zero-downtime deployments or maintenance without customer-visible interruption.", "When a component failure would cause data loss that cannot be recovered from backups within your RPO window."],
    avoid: ["When your service is a non-critical internal tool where minutes of downtime carries no business consequence.", "If you haven't profiled your actual failure modes — redundancy without chaos testing gives false confidence and hidden single points of failure.", "When the operational overhead of keeping replicas in sync exceeds the cost of occasional downtime for a low-traffic service."],
    failures: [{ name: "Split-Brain on Failover", detail: "In active-passive setups, network partitions can cause both nodes to believe they are primary simultaneously, leading to conflicting writes and data corruption." }, { name: "Thundering Herd After Recovery", detail: "When a failed node rejoins, it may receive a full flood of catch-up replication and live traffic at once, overwhelming it and triggering a second failure cascade." }, { name: "Stale Passive Takeover", detail: "If replication lag is not monitored, a passive replica that takes over may serve or commit data that is seconds or minutes behind, causing silent data loss at the exact moment fault tolerance is supposed to protect you." }],
    tradeoffs: { pros: ["Eliminates single points of failure, allowing rolling hardware and software upgrades without downtime.", "Geographic redundancy across AZs provides resilience against entire data center outages with automatic traffic rerouting.", "Active-active configurations provide horizontal scaling headroom so capacity can absorb failure load without manual intervention."], cons: ["Replication introduces consistency complexity — every write must be coordinated across replicas, increasing latency and requiring conflict resolution strategies.", "Multi-AZ and multi-region deployments multiply infrastructure costs, often 2–3x, requiring clear ROI justification per service tier.", "Failover logic adds significant operational burden: runbooks, regular DR drills, monitoring for replication lag, and on-call procedures must all be maintained continuously."] },
  },
  "Failover Strategies": {
    whenToUse: ["When your service has a strict SLA (e.g., 99.9%+ uptime) and a single instance failure would breach it.", "If you need to survive datacenter-level outages without manual operator intervention.", "When your RPO is near-zero and losing even seconds of writes is unacceptable (e.g., financial transaction logs)."],
    avoid: ["When your workload is stateless and horizontally scalable — load balancer rerouting is simpler and cheaper than maintaining a standby.", "If your failure domain is application bugs rather than infrastructure — failover promotes the bug to the standby and accomplishes nothing.", "When the cost of synchronous replication to a hot standby exceeds the cost of the downtime you are trying to prevent."],
    failures: [{ name: "Split-Brain on Network Partition", detail: "Both primary and standby believe the other is dead and accept writes simultaneously, causing divergent state that is expensive or impossible to reconcile." }, { name: "Failover to Stale Standby", detail: "Replication lag means the standby is seconds or minutes behind at the moment of promotion, silently losing committed transactions despite a healthy-looking setup." }, { name: "Thundering Herd on Recovery", detail: "When the failed primary comes back online it rejoins as a peer, triggering a leadership election storm and a burst of replication traffic that degrades the newly promoted primary." }],
    tradeoffs: { pros: ["Automated failover eliminates human reaction time, cutting RTO from minutes to seconds without operator involvement.", "Hot standby doubles as a read replica, giving you a latency benefit during normal operation.", "A well-tested failover path forces you to validate backup integrity continuously rather than discovering corruption during an actual incident."], cons: ["Synchronous replication to a hot standby adds write-path latency on every commit, which compounds under high throughput.", "Maintaining and operating a standby that serves no production traffic is pure cost — hardware, licensing, and engineering toil.", "Failover logic is a failure surface in itself; misconfigured health checks or fencing agents cause false positives that take down a healthy primary."] },
  },
  "Chaos Engineering": {
    whenToUse: ["When your system has multiple interdependent services and you need to verify that circuit breakers, retries, and fallbacks actually trigger under real failure conditions.", "When you are preparing for high-traffic events and need confidence that dependency failures won't cascade into a full outage.", "If you need to validate that your on-call runbooks and automated recovery mechanisms work before a real incident forces the test."],
    avoid: ["When your system lacks baseline observability — without solid metrics and alerting you cannot detect whether the hypothesis passed or failed.", "If your team has not yet implemented basic fault-tolerance patterns like timeouts and retries, fix those first rather than confirming they are absent.", "When running in a shared staging environment without blast-radius controls, as injected failures will corrupt other teams' test runs."],
    failures: [{ name: "Unbounded Blast Radius", detail: "A poorly scoped experiment targets a shared database or message broker, cascading failures beyond the intended service and triggering a real customer-facing outage." }, { name: "Missing Steady-State Baseline", detail: "Without a quantified steady-state metric (e.g., p99 latency, error rate), teams cannot determine whether the system degraded during the experiment, making results inconclusive." }, { name: "No Automated Halt Condition", detail: "An experiment continues after the system breaches SLO thresholds because no kill switch was configured, turning a controlled test into a prolonged production incident." }],
    tradeoffs: { pros: ["Converts silent systemic assumptions into verified, documented resilience properties before they manifest as incidents.", "Builds on-call muscle memory through repeated failure scenarios, reducing mean time to recovery when real incidents occur.", "Surfaces hidden dependencies and single points of failure that architecture diagrams and code reviews consistently miss."], cons: ["Requires significant observability infrastructure and mature alerting before experiments yield actionable signal.", "Coordinating production experiments demands cross-team buy-in, change-management overhead, and clear rollback procedures.", "Frequent experiments in production introduce operational risk and can erode team trust if communication and blast-radius controls are weak."] },
  },
  "SLA / SLO / SLI": {
    whenToUse: ["When your team needs an objective, data-driven way to decide whether to ship a feature or freeze deployments based on remaining error budget.", "When you need to align engineering priorities with business commitments by surfacing reliability gaps before customers escalate.", "If you need to negotiate realistic uptime contracts with enterprise customers based on measured historical SLI data rather than aspirational numbers."],
    avoid: ["When your service has no meaningful traffic baseline yet — SLOs set too early lock you into targets you cannot accurately validate.", "If you set SLOs on every metric indiscriminately, engineers spend more time managing alert noise than building product.", "When SLAs are copy-pasted from competitors without mapping them to your actual infrastructure capacity, creating contractual liability you cannot meet."],
    failures: [{ name: "Availability Theater", detail: "Teams measure success/failure at the load balancer but exclude downstream dependency timeouts, making SLI look healthy while users experience cascading failures." }, { name: "Error Budget Ignored Under Pressure", detail: "Management overrides the error budget freeze to ship a critical feature, eroding the cultural contract SLOs depend on and making future budget enforcement impossible." }, { name: "Wrong Aggregation Window", detail: "Using a 30-day rolling window masks a two-hour outage that consumed the entire monthly budget in one incident, leaving no margin for the rest of the period." }],
    tradeoffs: { pros: ["Error budgets provide a shared, quantitative language that removes blame from reliability conversations between product and engineering.", "SLO-driven alerting reduces pages by focusing on user-impacting burn rates rather than raw metric thresholds.", "Documented SLIs create an audit trail that accelerates post-incident root cause analysis by pinpointing exactly when and how fast reliability degraded."], cons: ["Defining accurate SLIs requires instrumenting every critical user journey, which adds non-trivial observability overhead to each service.", "Error budget policies only work if leadership enforces them consistently — without organizational buy-in they become documentation nobody acts on.", "Negotiating SLAs introduces legal and financial risk that forces engineering decisions to be reviewed by non-technical stakeholders, slowing incident response policy changes."] },
  },
  "Consistent Hashing": {
    whenToUse: ["When your cache or data tier scales horizontally and you need to minimize key remapping during node additions or removals.", "When you need to route requests to the same node for session affinity or local caching without a central coordinator.", "If you are building a distributed key-value store or sharded database where rebalancing cost must stay proportional to cluster change size."],
    avoid: ["When your dataset is small and fits on a single node — the operational complexity of a ring is not justified.", "If your workload has highly skewed key access patterns that vnodes alone cannot smooth out, since hotspots will persist regardless of ring distribution.", "When strong consistency across shards is required, because consistent hashing is a routing mechanism, not a consistency protocol."],
    failures: [{ name: "Vnode Count Too Low", detail: "With fewer than 100–150 vnodes per physical node, the ring remains uneven enough that one node can hold 2–3x the data of another, causing memory pressure and latency spikes under load." }, { name: "Cascading Overload on Node Loss", detail: "When a node fails, its entire key range shifts to one clockwise neighbor, doubling that node's load and triggering a chain of failures if the cluster is already near capacity." }, { name: "Hash Function Collision Clustering", detail: "A poorly chosen hash function can cluster multiple node tokens near the same ring position, defeating the load-balancing goal entirely." }],
    tradeoffs: { pros: ["Incremental scaling moves only 1/N of keys per node change, making live cluster resizes operationally safe.", "No central routing table is needed — any node or client can independently compute key ownership from the ring.", "Virtual nodes give fine-grained, configurable load distribution without resharding the entire dataset."], cons: ["Vnode metadata (token ranges per node) must be gossiped and kept consistent across the cluster, adding coordination overhead.", "Debugging data skew requires inspecting token distribution across hundreds of vnodes, which is operationally non-trivial.", "Replication across the ring requires careful placement logic to avoid co-locating replicas on the same physical host when using vnodes."] },
  },
  "Consensus (Raft Algorithm)": {
    whenToUse: ["When your system requires a strongly consistent, replicated state machine (e.g., distributed locks, leader election, or configuration storage) where correctness trumps availability.", "If you need a fault-tolerant coordination service that can survive up to (n-1)/2 node failures without split-brain.", "When you are building on etcd, CockroachDB, or TiKV and need to understand or tune the underlying consensus layer for your operational SLA."],
    avoid: ["When your workload is read-heavy and geo-distributed — Raft's leader bottleneck adds cross-region latency on every write.", "If eventual consistency is acceptable, as the coordination overhead of quorum acknowledgment is unnecessary cost for loosely coupled systems.", "When you need sub-millisecond write latency at extreme throughput, since every commit requires a majority round-trip before the client gets an acknowledgment."],
    failures: [{ name: "Election Storm Under Partition", detail: "During a partial network partition, followers repeatedly time out and increment their term, triggering cascading elections that stall the cluster until the partition heals and terms stabilize." }, { name: "Lagging Follower Log Divergence", detail: "A follower that rejoins after a long outage must replay a large backlog of log entries from the leader, causing replication lag and temporarily reducing the effective quorum size for new commits." }, { name: "Leader Bottleneck Overload", detail: "All writes are serialized through a single leader, so a hot-spot workload or a leader on degraded hardware saturates its disk or network and stalls the entire cluster write path." }],
    tradeoffs: { pros: ["Strong linearizability guarantees simplify application logic by eliminating the need to handle stale or conflicting reads.", "Deterministic leader election and explicit term numbers make failure scenarios easier to reason about and debug than leaderless protocols like Paxos.", "Widely battle-tested in production systems (etcd, CockroachDB, TiKV), so mature tooling and well-understood operational playbooks exist."], cons: ["The single-leader model caps write throughput to one node's capacity and adds a network round-trip for any client not co-located with the leader.", "Quorum writes mean latency is bounded by the slowest responding majority member, making p99 latency sensitive to follower health.", "Cluster reconfiguration (adding or removing nodes) requires a joint-consensus log entry, adding operational complexity and a brief window of reduced fault tolerance."] },
  },
  "Distributed Transactions (2PC)": {
    whenToUse: ["When your operation spans multiple databases or services and you require strict atomicity with no partial commits tolerated.", "If you need cross-shard consistency in a relational system (e.g., moving funds between accounts on different DB nodes) and latency is acceptable.", "When your workload has low contention and short transactions so lock hold times during both phases remain bounded."],
    avoid: ["When operating at high throughput — lock contention across phases will bottleneck your system under load.", "If your services are owned by separate teams or cross network trust boundaries, as coordinator failures leave remote participants in an uncertain blocked state.", "When eventual consistency is acceptable — saga patterns or outbox+CDC give you distributed coordination without the blocking and single point of failure."],
    failures: [{ name: "Coordinator Crash After Phase 1", detail: "If the coordinator dies after sending 'prepare' but before sending the final commit/abort, participants hold locks indefinitely and cannot resolve their state without manual intervention or a recovery log." }, { name: "Network Partition During Phase 2", detail: "A partition after some participants receive 'commit' and others do not leaves the system in a split-brain state where part of the data is committed and part is not, violating atomicity." }, { name: "Slow Participant Blocking All", detail: "A single slow or overloaded participant delays the entire transaction because the coordinator must wait for all votes before proceeding, turning one node's latency spike into a system-wide stall." }],
    tradeoffs: { pros: ["Guarantees strict atomicity across multiple nodes with no application-level compensating logic required.", "Well-understood protocol with native support in most relational databases (XA transactions) and mature coordinator implementations.", "Provides linearizable cross-node commits, making it straightforward to reason about consistency invariants."], cons: ["Holds distributed locks across all participants for the full duration of both phases, directly limiting throughput and increasing p99 latency.", "The coordinator is a single point of failure; without a durable recovery log and fencing tokens, a crash mid-protocol can leave participants blocked indefinitely.", "Operationally fragile — XA transaction recovery requires manual DBA intervention when coordinators or participants crash in production scenarios."] },
  },
  "Vector Clocks": {
    whenToUse: ["When your system has multiple writers updating the same key across partitions or replicas and you need to detect concurrent writes rather than silently applying last-write-wins.", "If you need to implement client-side or application-level conflict resolution (e.g., shopping carts, collaborative documents) and must know which writes are causally independent.", "When building a multi-master replication layer where nodes must distinguish stale reads from genuine conflicts before merging state."],
    avoid: ["When a single authoritative leader handles all writes — a monotonic sequence number is simpler and sufficient.", "If your conflict resolution strategy is always last-write-wins; vector clocks add overhead without benefit when you never inspect causality.", "When the number of participating nodes is unbounded or highly dynamic, as the vector size grows with the node count and becomes expensive to store and compare."],
    failures: [{ name: "Vector Truncation Drops History", detail: "DynamoDB's original implementation capped vector size and pruned old entries by timestamp, silently discarding causal history and causing valid conflicts to go undetected." }, { name: "Node ID Reuse After Restart", detail: "If a restarted node reuses its old ID without resetting its counter, its events appear causally prior to newer events from other nodes, corrupting the happened-before relation." }, { name: "Clock Explosion Under Fan-Out", detail: "In systems where every client or ephemeral worker gets its own vector entry, vectors grow unboundedly, inflating payload size and making comparison O(n) per operation." }],
    tradeoffs: { pros: ["Provides mathematically precise causality tracking without a global clock, making concurrent writes unambiguously detectable.", "Enables application-level merge logic (e.g., union of sets, user-prompted resolution) instead of silent data loss.", "Decentralized — no coordinator required, so the mechanism itself does not become a bottleneck or single point of failure."], cons: ["Vector size scales linearly with the number of unique writers, increasing storage and network overhead per object.", "Conflict resolution logic must be implemented at the application layer, adding significant product and engineering complexity.", "Garbage-collecting stale node entries without losing causal information requires a careful distributed protocol that is easy to implement incorrectly."] },
  },
  "Logging vs Metrics vs Tracing": {
    whenToUse: ["When your on-call needs to reconstruct the exact sequence of events that led to a user-facing error, reach for structured logs with a correlation ID.", "If you need to set SLO-based alerts or capacity-plan based on request rate and error rate trends, metrics are the right signal.", "When a request is slow but you cannot tell which downstream service is the bottleneck, distributed tracing pinpoints latency at the span level."],
    avoid: ["When you are trying to detect a latency regression across thousands of requests — logs at scale are too expensive to aggregate for this; use metrics histograms instead.", "If your service emits a high-cardinality label (e.g., user ID) as a metric tag, you will explode your time-series cardinality and crash Prometheus or exceed cloud billing limits.", "When you rely solely on logs across microservices to debug a slow request, you will miss the causal chain between services that only a trace can reveal."],
    failures: [{ name: "Log Volume Overwhelms Pipeline", detail: "Debug-level logging left enabled in production saturates the log shipper (Fluentd/Logstash), causing backpressure that drops critical error logs exactly when an incident is happening." }, { name: "Missing Trace Context Propagation", detail: "A single service failing to forward W3C TraceContext or B3 headers breaks the trace at that hop, making spans appear as disconnected orphans and hiding the real latency source." }, { name: "Metrics Without Percentiles", detail: "Storing only average latency in metrics masks tail-latency problems; p99 can be 10x the mean, and an SLO breach goes undetected until users complain." }],
    tradeoffs: { pros: ["Combining all three pillars gives you fast detection via metrics, rapid triage via traces, and deep forensics via logs — each at its appropriate cost tier.", "Metrics are cheap to retain long-term, enabling trend analysis and capacity forecasting that logs cannot economically provide.", "Structured logs with injected trace IDs create a pivot between pillars — you can jump from a slow trace span directly to the exact log lines emitted by that request."], cons: ["Operating three separate pipelines (e.g., Prometheus, Jaeger, Loki or ELK) multiplies infrastructure, on-call surface area, and storage cost significantly.", "Instrumentation discipline is hard to enforce at scale — inconsistent span naming, missing log levels, or ad-hoc metric names accumulate into an unmaintainable observability layer.", "Sampling in distributed tracing means low-traffic or rare error paths may never be captured, creating blind spots in exactly the cases you most need visibility."] },
  },
  "The Three Pillars": {
    whenToUse: ["When your on-call team needs to move from alert to root cause without switching between unrelated tools.", "If you need to correlate a latency spike in a dashboard with the exact request trace and surrounding log lines.", "When you are instrumenting a distributed system where a single user request fans out across five or more services."],
    avoid: ["When you are building a simple monolith with a single database — the overhead of all three pillars outweighs the debugging benefit.", "If your team has not yet standardized log formats or trace propagation, adopting all three pillars simultaneously creates inconsistent, unreliable signal.", "When budget is constrained and high-cardinality trace storage costs would crowd out other reliability investments — start with structured logs and metrics first."],
    failures: [{ name: "Missing Trace Context Propagation", detail: "When an upstream service drops the W3C traceparent header — often at a legacy HTTP client or a message queue boundary — the trace silently splits into disconnected spans, making distributed root-cause analysis impossible." }, { name: "Metric Cardinality Explosion", detail: "Adding high-cardinality labels such as user ID or request URL to Prometheus metrics causes time-series count to grow unboundedly, exhausting scrape memory and crashing the metrics backend." }, { name: "Log Volume Drowning Signals", detail: "Verbose DEBUG logs left enabled in production flood the log pipeline, driving up ingest costs and causing critical ERROR events to be dropped when the pipeline applies back-pressure sampling." }],
    tradeoffs: { pros: ["Exemplar links between metrics and traces cut mean-time-to-diagnosis because engineers skip the manual search step entirely.", "OpenTelemetry auto-instrumentation lets teams retrofit observability onto existing services without rewriting business logic.", "Structured logs double as an audit trail and a cheap substitute for traces during early-stage incidents before trace data is indexed."], cons: ["Operating three separate storage backends — a TSDB, a log aggregator, and a trace store — multiplies infrastructure cost and on-call surface area.", "Consistent trace context propagation requires every service, library, and async worker to be instrumented, creating a long tail of gaps in polyglot environments.", "Sampling strategies for traces must be tuned carefully; aggressive head-based sampling discards the rare slow or error requests that matter most for debugging."] },
  },
  "Alerting Pipelines": {
    whenToUse: ["When your service has defined SLOs and you need automated escalation when error budgets burn too fast.", "If you need to correlate alerts across multiple services and suppress downstream noise when a root-cause upstream alert fires.", "When your on-call rotation requires audit trails and escalation policies to ensure no alert goes unacknowledged."],
    avoid: ["When you have fewer than a handful of services — direct log monitoring or a simple health-check dashboard avoids pipeline overhead.", "If alerts are being added reactively after every incident without reviewing existing signal-to-noise ratio, you will accelerate alert fatigue rather than fix it.", "When the underlying metrics collection is unreliable — a noisy or incomplete pipeline produces misleading alerts that erode on-call trust."],
    failures: [{ name: "Alert Storm on Deployment", detail: "A single bad deploy triggers hundreds of correlated alerts simultaneously, overwhelming the on-call and burying the root-cause signal in noise because grouping and inhibition rules were never configured." }, { name: "Silenced Alert Forgotten", detail: "An on-call silences a flapping alert during an incident and never removes the silence, leaving a production degradation undetected for days." }, { name: "Routing Misconfiguration", detail: "A team renames their PagerDuty service or Slack channel without updating alert routing rules, causing critical pages to be silently dropped instead of delivered." }],
    tradeoffs: { pros: ["Automated escalation ensures critical issues reach a human even outside business hours without manual monitoring.", "Centralised routing and grouping lets you enforce consistent on-call policies and SLA response times across all services.", "Linking runbooks directly in alert payloads reduces the cognitive load on the on-call and measurably cuts mean time to resolution."], cons: ["Maintaining accurate alert thresholds and routing rules requires continuous investment as services and traffic patterns evolve.", "Pipeline infrastructure itself (Alertmanager, PagerDuty integrations) becomes a critical dependency that must be monitored and operated.", "Poorly tuned pipelines generate alert fatigue faster than no alerting, requiring disciplined hygiene reviews to stay effective."] },
  },
  "OAuth 2.0 / JWT Flow": {
    whenToUse: ["When your service needs to delegate authentication to a trusted identity provider (Google, Auth0, Okta) without managing passwords.", "If you need stateless, horizontally scalable API authorization where each service can verify tokens independently without a shared session store.", "When building a public API that third-party developers will integrate, requiring scoped, revocable access without exposing user credentials."],
    avoid: ["When you need instant token revocation — JWTs remain valid until expiry and cannot be invalidated without a blocklist, negating the stateless benefit.", "If your client is a traditional server-rendered app with a single backend — session cookies are simpler, more auditable, and avoid token leakage via XSS.", "When handling highly sensitive operations (financial transactions, PII updates) where the 15-minute window of a compromised token is an unacceptable blast radius."],
    failures: [{ name: "Refresh Token Rotation Race", detail: "Under concurrent requests, two threads simultaneously exchange the same refresh token; one succeeds and the other receives an invalid-grant error, logging the user out unexpectedly." }, { name: "Algorithm Confusion Attack", detail: "If the server accepts multiple JWT algorithms, an attacker swaps the header to 'none' or 'HS256' with the public key as the secret, forging valid-looking tokens." }, { name: "Clock Skew Expiry Rejection", detail: "A 1–2 second clock drift between the token issuer and a microservice causes 'token not yet valid' (nbf) or premature expiry errors under load, requiring explicit leeway configuration." }],
    tradeoffs: { pros: ["Stateless verification lets any service validate tokens using only the public key, eliminating session-store round-trips and reducing latency at scale.", "Scoped tokens limit blast radius — a leaked token grants only the permissions declared in its claims, not full account access.", "Standardized flows (RFC 6749, RFC 7519) mean battle-tested libraries exist for every language, reducing implementation risk."], cons: ["Short-lived tokens require refresh logic in every client, adding complexity and a class of token-expiry bugs that are hard to reproduce in development.", "JWT payloads are encoded but not encrypted, so any sensitive claim (user role, plan tier) is readable by anyone who intercepts the token in transit or storage.", "Operating an authorization server (or depending on a third-party IdP) introduces an availability dependency — if the auth server is down, new logins and token refreshes fail across all services."] },
  },
  "Rate Limiting Patterns": {
    whenToUse: ["When your public API needs to protect downstream services from abusive or runaway clients without rejecting legitimate bursty traffic.", "If you need to enforce per-tenant SLA tiers where different customers have different request quotas on shared infrastructure.", "When your upstream dependency (database, third-party API) has a hard request cap and you need to guarantee you never exceed it."],
    avoid: ["When your service already sits behind an API gateway (Kong, AWS API GW) that has native rate limiting — duplicating it in application code adds latency and drift.", "If your traffic is uniformly low volume and bursty behavior is expected and benign — rate limiting adds operational overhead with no real protection benefit.", "When you have not profiled actual request distributions yet; setting limits before you understand normal burst patterns leads to false positives that block legitimate users."],
    failures: [{ name: "Clock Skew Breaks Windows", detail: "In distributed deployments, inconsistent system clocks across nodes cause fixed and sliding window counters to disagree, allowing clients to exceed limits by targeting nodes with lagging clocks." }, { name: "Redis SPOF Bypasses Limits", detail: "When the centralized Redis store used for distributed rate limit counters becomes unavailable, many implementations fail open and stop enforcing limits entirely, exposing backends to full blast traffic." }, { name: "Boundary Burst Double-Spend", detail: "Fixed window implementations allow a client to send the full quota at the end of one window and immediately again at the start of the next, effectively doubling allowed throughput at every boundary." }],
    tradeoffs: { pros: ["Prevents cascade failures by capping the blast radius when a single client or misconfigured service hammers a shared resource.", "Token bucket gives you tunable burst headroom so legitimate high-frequency workflows (batch uploads, retry storms after an outage) are not penalized.", "Sliding window log provides auditable per-client request timestamps, which simplifies abuse investigation and SLA reporting."], cons: ["Distributed rate limiting requires a low-latency shared store (Redis, Memcached); every request now has a network round-trip in its hot path.", "Sliding window log memory cost scales linearly with request volume per client, making it impractical for high-cardinality or high-rate endpoints without TTL tuning.", "Choosing and communicating the right limit values is operationally hard — too tight and you SLA-breach legitimate users, too loose and you fail to protect backends."] },
  },
  "Zero Trust Architecture": {
    whenToUse: ["When your workforce is distributed across remote locations or you rely heavily on SaaS, making a fixed network perimeter meaningless.", "If you need to grant contractors or third-party vendors scoped access to internal services without placing them on the corporate network.", "When operating in regulated industries (PCI-DSS, HIPAA) where lateral movement after a breach must be demonstrably contained."],
    avoid: ["When your entire stack runs in a single isolated private network with no external integrations and the operational overhead outweighs the risk reduction.", "If you lack mature identity infrastructure (IdP, SSO, device inventory) — deploying Zero Trust without these foundations produces security theater, not real enforcement.", "When migrating a legacy monolith that cannot emit per-request identity context, as retrofit complexity will exceed the benefit without a parallel modernization effort."],
    failures: [{ name: "Token Reuse After Revocation", detail: "Short-lived tokens cached at the service mesh layer remain valid after an IdP revocation event because services do not re-validate against the authoritative source on every hop." }, { name: "Over-Permissive Service Accounts", detail: "Workload identities are granted broad scopes during initial rollout and never tightened, recreating the flat-network blast radius Zero Trust was meant to eliminate." }, { name: "Policy Drift Under Incident Pressure", detail: "During an outage, engineers bypass policy engine enforcement with emergency break-glass rules that are never rolled back, leaving permanent gaps in the authorization chain." }],
    tradeoffs: { pros: ["Blast radius of a stolen credential is bounded to explicitly granted scopes, limiting attacker lateral movement to microsegmented service boundaries.", "Continuous per-request authorization produces a dense audit log that accelerates forensic investigation and satisfies compliance evidence requirements.", "Decoupling access control from network topology lets you safely adopt multi-cloud, hybrid, and BYOD environments without re-architecting connectivity."], cons: ["Every service-to-service call adds latency for policy evaluation and cryptographic verification, which compounds in deep call chains without careful caching strategy.", "Operating a policy engine, certificate authority, device inventory, and IdP federation layer requires significant platform engineering investment and on-call expertise.", "Debugging access failures across multiple enforcement points dramatically increases mean time to resolution for auth incidents."] },
  },
};

export default function App() {
  const categories = [];
  CONCEPTS.forEach((c) => { if (!categories.includes(c.category)) categories.push(c.category); });

  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [hover, setHover] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 880);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const q = query.trim().toLowerCase();
  const isMatch = (c) => !q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);

  const grouped = categories.map((cat) => ({
    cat,
    items: CONCEPTS.map((c, i) => ({ c, i })).filter((x) => x.c.category === cat),
  }));

  const current = CONCEPTS[selected];

  const pick = (i) => { setSelected(i); if (narrow) setNavOpen(false); };

  /* ---------- Sidebar / nav list ---------- */
  const navList = (
    <nav style={{ padding: "4px 10px 28px" }}>
      {grouped.map(({ cat, items }) => {
        const visible = items.filter((x) => isMatch(x.c));
        if (q && visible.length === 0) return null;
        const open = q ? true : !collapsed[cat];
        const catHover = hover === "cat:" + cat;
        return (
          <div key={cat} style={{ marginBottom: 2 }}>
            <button
              onClick={() => setCollapsed((s) => ({ ...s, [cat]: !s[cat] }))}
              onMouseEnter={() => setHover("cat:" + cat)}
              onMouseLeave={() => setHover(null)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                background: catHover ? T.lineSoft : "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                padding: "9px 8px", borderRadius: 8, color: T.ink,
                fontFamily: SANS, fontSize: 11.5, fontWeight: 800,
                letterSpacing: ".07em", textTransform: "uppercase",
              }}
            >
              <Chevron open={open} />
              <span style={{ flex: 1 }}>{cat}</span>
              <span style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: 0,
                color: T.accentInk, background: T.accentSoft,
                borderRadius: 999, padding: "1px 8px", minWidth: 18, textAlign: "center",
              }}>{visible.length}</span>
            </button>
            {open && (
              <div style={{ marginLeft: 7, paddingLeft: 11, borderLeft: `1px solid ${T.line}` }}>
                {visible.map(({ c, i }) => {
                  const active = i === selected;
                  const h = hover === i;
                  return (
                    <button
                      key={i}
                      data-concept-id={c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                      onClick={() => pick(i)}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                      style={{
                        width: "100%", textAlign: "left", cursor: "pointer",
                        border: "none", borderRadius: 7, margin: "1px 0",
                        padding: "7px 10px", fontFamily: SANS, fontSize: 13,
                        lineHeight: 1.3,
                        fontWeight: active ? 700 : 500,
                        color: active ? T.accentInk : (h ? T.ink : T.ink2),
                        background: active ? T.accentSoft : (h ? T.lineSoft : "transparent"),
                        borderLeft: active ? `2px solid ${T.accent}` : "2px solid transparent",
                      }}
                    >
                      {c.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {q && grouped.every(({ items }) => items.filter((x) => isMatch(x.c)).length === 0) && (
        <div style={{ padding: 18, color: T.ink3, fontSize: 13 }}>No concepts match &ldquo;{query}&rdquo;.</div>
      )}
    </nav>
  );

  const searchBar = (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.ink3, fontSize: 14, pointerEvents: "none" }}>&#9906;</span>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search concepts…"
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "10px 32px 10px 32px",
          border: `1px solid ${T.line}`, borderRadius: 10,
          background: T.card, color: T.ink, fontFamily: SANS, fontSize: 13.5, outline: "none",
        }}
      />
      {query && (
        <button onClick={() => setQuery("")} style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          border: "none", background: "transparent", cursor: "pointer", color: T.ink3, fontSize: 16, lineHeight: 1, padding: 4,
        }}>&times;</button>
      )}
    </div>
  );

  const brand = (
    <div>
      <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: T.ink, lineHeight: 1.1 }}>
        System Design
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".22em", color: T.accent, textTransform: "uppercase", marginTop: 3 }}>
        Encyclopedia
      </div>
    </div>
  );

  /* ---------- Main content ---------- */
  const content = (
    <article style={{ maxWidth: 880, margin: "0 auto", padding: narrow ? "22px 18px 60px" : "44px 52px 80px" }}>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: T.accent, fontWeight: 700 }}>
        {current.category}
      </div>
      <h1 style={{ fontFamily: SERIF, fontSize: narrow ? 28 : 38, lineHeight: 1.08, color: T.ink, margin: "10px 0 0", fontWeight: 700, letterSpacing: "-0.01em" }}>
        {current.title}
      </h1>
      <p style={{ fontFamily: SANS, fontSize: narrow ? 15.5 : 17, lineHeight: 1.65, color: T.ink2, margin: "18px 0 0", maxWidth: 660 }}>
        {current.explanation}
      </p>

      <div style={{ marginTop: 30 }}>
        <SectionLabel>Key points</SectionLabel>
        <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
          {current.points.map((p, i) => (
            <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 11 }}>
              <span style={{ flexShrink: 0, width: 7, height: 7, marginTop: 8, background: T.accent, borderRadius: 2, transform: "rotate(45deg)" }} />
              <span style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.55, color: T.ink }}>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 34 }}>
        <SectionLabel>How it works</SectionLabel>
        <div style={{
          marginTop: 14, background: T.card, border: `1px solid ${T.line}`,
          borderRadius: 14, padding: narrow ? "16px 14px" : "22px 26px",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 6px 20px rgba(20,18,12,.04)",
        }}>
          <div style={{ width: "100%" }}>{current.svg}</div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.lineSoft}`, display: "flex", flexWrap: "wrap", gap: "8px 18px" }}>
            {ROLE_LEGEND.map(([role, name]) => (
              <span key={role} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: SANS, fontSize: 11, color: T.ink2 }}>
                <span style={{ width: 13, height: 13, borderRadius: 4, background: C[role].fill, border: `2px solid ${C[role].stroke}` }} />
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {(() => {
        const e = ENRICHMENTS[current.title];
        if (!e) return null;
        return (
          <>
            {/* When to use */}
            <div style={{ marginTop: 34 }}>
              <SectionLabel>When to use</SectionLabel>
              <div style={{ marginTop: 14, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px 20px" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {e.whenToUse.map((w, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < e.whenToUse.length - 1 ? 10 : 0 }}>
                      <span style={{ flexShrink: 0, color: "#2563eb", fontWeight: 700, marginTop: 1, fontFamily: SANS, fontSize: 14 }}>→</span>
                      <span style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: "#1e3a8a" }}>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* When to avoid */}
            <div style={{ marginTop: 22 }}>
              <SectionLabel>When to avoid</SectionLabel>
              <div style={{ marginTop: 14, background: "#fefce8", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {e.avoid.map((a, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < e.avoid.length - 1 ? 10 : 0 }}>
                      <span style={{ flexShrink: 0, color: "#d97706", fontWeight: 700, marginTop: 1, fontFamily: SANS, fontSize: 14 }}>✕</span>
                      <span style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: "#78350f" }}>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Failure modes */}
            <div style={{ marginTop: 22 }}>
              <SectionLabel>Failure modes</SectionLabel>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {e.failures.map((f, i) => (
                  <div key={i} style={{ background: T.card, border: "1px solid #fecaca", borderLeft: "3px solid #ef4444", borderRadius: 10, padding: "13px 18px" }}>
                    <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#b91c1c", marginBottom: 5 }}>{f.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: T.ink2 }}>{f.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade-offs */}
            <div style={{ marginTop: 22 }}>
              <SectionLabel>Trade-offs</SectionLabel>
              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "15px 18px" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "#166534", fontWeight: 700, marginBottom: 12 }}>Benefits</div>
                  {e.tradeoffs.pros.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: i < e.tradeoffs.pros.length - 1 ? 9 : 0 }}>
                      <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0, fontSize: 13 }}>✓</span>
                      <span style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: "#14532d" }}>{p}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 12, padding: "15px 18px" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "#9f1239", fontWeight: 700, marginBottom: 12 }}>Costs</div>
                  {e.tradeoffs.cons.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: i < e.tradeoffs.cons.length - 1 ? 9 : 0 }}>
                      <span style={{ color: "#ef4444", fontWeight: 700, flexShrink: 0, fontSize: 13 }}>✕</span>
                      <span style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: "#881337" }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </article>
  );

  /* ---------- Layout ---------- */
  if (narrow) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: T.bg, color: T.ink, fontFamily: SANS }}>
        <header style={{ background: T.panel, borderBottom: `1px solid ${T.line}`, padding: "12px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            {brand}
            <button onClick={() => setNavOpen((o) => !o)} style={{
              border: `1px solid ${T.line}`, background: navOpen ? T.accentSoft : T.card, color: navOpen ? T.accentInk : T.ink,
              borderRadius: 9, padding: "8px 12px", cursor: "pointer", fontFamily: SANS, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7,
            }}>
              <span style={{ fontSize: 15 }}>&#9776;</span> Browse
            </button>
          </div>
          <div style={{ marginTop: 12 }}>{searchBar}</div>
        </header>
        {navOpen && (
          <div style={{ flexShrink: 0, maxHeight: "55vh", overflowY: "auto", background: T.panel, borderBottom: `1px solid ${T.line}`, WebkitOverflowScrolling: "touch" }}>
            {navList}
          </div>
        )}
        <main style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>{content}</main>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", background: T.bg, color: T.ink, fontFamily: SANS, overflow: "hidden" }}>
      <aside style={{ width: 300, flexShrink: 0, background: T.panel, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "22px 20px 16px", borderBottom: `1px solid ${T.line}` }}>
          {brand}
          <div style={{ marginTop: 16 }}>{searchBar}</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>{navList}</div>
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.line}`, fontFamily: MONO, fontSize: 10.5, color: T.ink3, letterSpacing: ".04em" }}>
          {CONCEPTS.length} concepts &middot; {categories.length} categories
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: "auto" }}>{content}</main>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: T.ink3, fontWeight: 700 }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: T.line }} />
    </div>
  );
}
