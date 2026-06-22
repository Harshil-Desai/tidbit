import React from "react";

// Rich, self-contained SVG diagrams for the System Design guide, ported from the
// source encyclopedia (references/SystemDesignEncyclopedia.jsx). Kept in a .jsx
// module (excluded from the TS `include`) because the diagrams use shared
// primitives with untyped props. Imported by components/ConceptView.tsx.

const SANS = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

const T = {
  ink: "#211f1a", ink2: "#56524a", ink3: "#8d887c",
  line: "#e5e2d8", lineSoft: "#eeece4",
  accent: "#0f766e", accentInk: "#0a544e", accentSoft: "#e2efed", accentSoft2: "#d4e9e6",
};

const C = {
  client: { fill: "#dbeafe", stroke: "#3b82f6", text: "#1e40af" },
  server: { fill: "#dcfce7", stroke: "#16a34a", text: "#15803d" },
  store:  { fill: "#fef3c7", stroke: "#d97706", text: "#b45309" },
  cache:  { fill: "#fee2e2", stroke: "#dc2626", text: "#b91c1c" },
  net:    { fill: "#ede9fe", stroke: "#7c3aed", text: "#6d28d9" },
  queue:  { fill: "#cffafe", stroke: "#0891b2", text: "#0e7490" },
  infra:  { fill: "#f1f5f9", stroke: "#94a3b8", text: "#475569" },
};

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

function Dot({ cx, cy, r = 5, fill = "#0891b2", stroke }) {
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={stroke ? 1.5 : 0} />;
}

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

export const systemDesignDiagrams = {
  "Load Balancing": () => (
    <Figure caption={"A load balancer sits in front of a pool of servers and distributes incoming requests so no single server is overwhelmed."}>
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
    </Figure>
  ),
  "Horizontal vs Vertical Scaling": () => (
    <Figure caption={"Scaling is how a system handles more load."}>
        <svg viewBox="0 0 600 300" width="100%" style={{ fontFamily: SANS }}>
          <line x1="300" y1="44" x2="300" y2="272" stroke={T.line} strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Vertical */}
          <Label x="150" y="30" size="13" weight="800" color={T.ink}>VERTICAL — scale up</Label>
          <Label x="150" y="46" size="10.5" color={T.ink3}>same box, more power</Label>
          <Box x="60" y="190" w="64" h="56" role="server" label="Server" sub="2 vCPU" />
          <Arrow x1="132" y1="200" x2="186" y2="120" color={T.accent} label="upgrade" lx="170" ly="158" lcolor={T.accent} />
          <Box x="176" y="96" w="92" h="130" role="server" label="Server" sub="32 vCPU" />
          <Label x="222" y="250" size="10" color={C.server.text} weight="700">+CPU  +RAM  +Disk</Label>
          {/* Horizontal */}
          <Label x="450" y="30" size="13" weight="800" color={T.ink}>HORIZONTAL — scale out</Label>
          <Label x="450" y="46" size="10.5" color={T.ink3}>more boxes, share the work</Label>
          <Box x="402" y="78" w="96" h="40" role="net" label="Balancer" />
          <Box x="338" y="196" w="68" h="46" role="server" label="Node A" />
          <Box x="416" y="196" w="68" h="46" role="server" label="Node B" />
          <Box x="494" y="196" w="68" h="46" role="server" label="Node C" />
          <Arrow x1="440" y1="118" x2="378" y2="196" color={C.net.stroke} />
          <Arrow x1="450" y1="118" x2="450" y2="196" color={C.net.stroke} />
          <Arrow x1="460" y1="118" x2="522" y2="196" color={C.net.stroke} />
          <Label x="450" y="262" size="10" color={C.server.text} weight="700">add identical nodes &#8594; &#8734;</Label>
        </svg>
    </Figure>
  ),
  "Auto-scaling": () => (
    <Figure caption={"Auto-scaling automatically changes the number of running instances based on live demand."}>
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
    </Figure>
  ),
  "Rate Limiting": () => (
    <Figure caption={"Rate limiting caps how many requests a client can make in a time window, protecting a service from overload, abuse, and runaway costs."}>
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
    </Figure>
  ),
  "SQL vs NoSQL": () => (
    <Figure caption={"SQL (relational) databases store data in tables with a fixed schema and link rows across tables using joins, with strong transactional guarantees."}>
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
    </Figure>
  ),
  "Database Sharding": () => (
    <Figure caption={"Sharding splits one large dataset across many databases (shards), so each holds only a slice of the rows."}>
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
    </Figure>
  ),
  "Replication (Leader–Follower, Multi-Leader)": () => (
    <Figure caption={"Replication keeps copies of the same data on multiple nodes for fault tolerance and read scaling."}>
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
    </Figure>
  ),
  "CAP Theorem": () => (
    <Figure caption={"The CAP theorem says a distributed data store can guarantee at most two of three properties: Consistency, Availability, and Partition tolerance."}>
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
    </Figure>
  ),
  "ACID vs BASE": () => (
    <Figure caption={"ACID and BASE are two consistency philosophies."}>
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
    </Figure>
  ),
  "Caching Strategies": () => (
    <Figure caption={"A cache stores hot data in fast memory so most requests avoid the slower database."}>
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
    </Figure>
  ),
  "CDN (Content Delivery Network)": () => (
    <Figure caption={"A CDN is a globally distributed network of edge servers that cache content close to users."}>
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
    </Figure>
  ),
  "Cache Eviction Policies": () => (
    <Figure caption={"A cache has limited memory, so when it is full it must evict an existing entry to admit a new one."}>
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
    </Figure>
  ),
  "Redis Architecture": () => (
    <Figure caption={"Redis is an in-memory data store used as a cache, message broker, and fast database."}>
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
    </Figure>
  ),
  "DNS Resolution Flow": () => (
    <Figure caption={"DNS translates a human-friendly hostname like example.com into the IP address machines actually route to."}>
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
    </Figure>
  ),
  "HTTP vs HTTPS": () => (
    <Figure caption={"HTTP sends requests and responses as plaintext, so anyone on the network path can read or tamper with them."}>
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
    </Figure>
  ),
  "WebSockets vs HTTP Polling": () => (
    <Figure caption={"HTTP polling fakes real-time updates by having the client ask “anything new?” on a timer — most responses come back empty, wasting round-trips."}>
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
    </Figure>
  ),
  "REST vs GraphQL vs gRPC": () => (
    <Figure caption={"These are three styles for service APIs."}>
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
    </Figure>
  ),
  "Message Queues vs Event Streams": () => (
    <Figure caption={"A message queue delivers each message to one consumer and deletes it on acknowledgment — work is consumed once and disappears."}>
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
    </Figure>
  ),
  "Pub/Sub Pattern": () => (
    <Figure caption={"In publish/subscribe, publishers send messages to a named topic instead of to specific receivers, and the broker fans each message out to every current subscriber."}>
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
    </Figure>
  ),
  "Kafka Architecture": () => (
    <Figure caption={"Kafka is a distributed commit log."}>
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
    </Figure>
  ),
  "Dead Letter Queues": () => (
    <Figure caption={"A dead letter queue (DLQ) is a holding area for messages that can’t be processed."}>
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
    </Figure>
  ),
  "API Gateway Pattern": () => (
    <Figure caption={"An API gateway is a single entry point that sits in front of many backend services."}>
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
    </Figure>
  ),
  "Service Mesh": () => (
    <Figure caption={"A service mesh moves networking concerns out of application code and into a sidecar proxy deployed next to each service."}>
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
    </Figure>
  ),
  "Circuit Breaker Pattern": () => (
    <Figure caption={"A circuit breaker protects a caller from a failing dependency."}>
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
    </Figure>
  ),
  "Saga Pattern": () => (
    <Figure caption={"A saga implements a distributed transaction as a sequence of local transactions, one per service."}>
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
    </Figure>
  ),
  "Fault Tolerance & Redundancy": () => (
    <Figure caption={"Fault tolerance is a system’s ability to keep working when a component fails, and redundancy is how you get it — by running spare capacity that can take over."}>
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
    </Figure>
  ),
  "Failover Strategies": () => (
    <Figure caption={"Failover is the automatic switch from a failed primary to a healthy backup."}>
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
    </Figure>
  ),
  "Chaos Engineering": () => (
    <Figure caption={"Chaos engineering deliberately injects failures — killing servers, adding latency, dropping network links — into a production-like system to verify it degrades gracefully."}>
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
    </Figure>
  ),
  "SLA / SLO / SLI": () => (
    <Figure caption={"These three terms describe reliability targets at rising levels of commitment."}>
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
    </Figure>
  ),
  "Consistent Hashing": () => (
    <Figure caption={"Consistent hashing maps both servers and keys onto the same circular hash space; each key is owned by the first node found clockwise from it."}>
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
    </Figure>
  ),
  "Consensus (Raft Algorithm)": () => (
    <Figure caption={"Raft keeps a replicated log consistent across servers by electing a single leader."}>
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
    </Figure>
  ),
  "Distributed Transactions (2PC)": () => (
    <Figure caption={"Two-phase commit coordinates an all-or-nothing transaction across multiple databases."}>
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
    </Figure>
  ),
  "Vector Clocks": () => (
    <Figure caption={"Vector clocks track causality without synchronized time."}>
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
    </Figure>
  ),
  "Logging vs Metrics vs Tracing": () => (
    <Figure caption={"These are the three core telemetry types."}>
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
    </Figure>
  ),
  "The Three Pillars": () => (
    <Figure caption={"The three pillars of observability — logs, metrics, and traces — are the data foundations that let you understand a system’s internal state from the outside."}>
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
    </Figure>
  ),
  "Alerting Pipelines": () => (
    <Figure caption={"An alerting pipeline turns raw metrics into actionable notifications."}>
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
    </Figure>
  ),
  "OAuth 2.0 / JWT Flow": () => (
    <Figure caption={"OAuth 2.0 lets a user grant an app limited access to their account without sharing a password."}>
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
    </Figure>
  ),
  "Rate Limiting Patterns": () => (
    <Figure caption={"Rate limiting caps how many requests a client may make in a period."}>
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
    </Figure>
  ),
  "Zero Trust Architecture": () => (
    <Figure caption={"Zero trust drops the idea that anything inside the network perimeter is automatically trusted."}>
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
    </Figure>
  ),
};
