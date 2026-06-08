import React, { useState, useMemo, useRef, useEffect } from "react";

/* =========================================================================
   Cloud Architecture Patterns — The Complete Visual Guide
   Fully self-contained. All content + diagrams hardcoded. No fetching.
   ========================================================================= */

/* ---- SVG palette ---- */
const C = {
  svc: "#8b5cf6", svcF: "#ede9fe",
  data: "#3b82f6", dataF: "#dbeafe",
  brk: "#f59e0b", brkF: "#fef3c7",
  trf: "#0ea5e9", trfF: "#e0f2fe",
  fail: "#ef4444", failF: "#fee2e2",
  ok: "#10b981", okF: "#d1fae5",
  gray: "#94a3b8", grayF: "#f1f5f9", ink: "#1e293b",
};

/* ---- tiny SVG helpers (composed differently in every diagram) ---- */
function Arrow({ x1, y1, x2, y2, color = C.gray, label, dashed, w = 2, labelDy = -6, labelDx = 0 }) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const L = 9;
  const ax1 = x2 - L * Math.cos(ang - Math.PI / 7);
  const ay1 = y2 - L * Math.sin(ang - Math.PI / 7);
  const ax2 = x2 - L * Math.cos(ang + Math.PI / 7);
  const ay2 = y2 - L * Math.sin(ang + Math.PI / 7);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeDasharray={dashed ? "5 4" : undefined} />
      <polygon points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`} fill={color} />
      {label && (
        <text x={(x1 + x2) / 2 + labelDx} y={(y1 + y2) / 2 + labelDy} fontSize="11" fill="#475569" textAnchor="middle">{label}</text>
      )}
    </g>
  );
}
function Node({ x, y, w, h, fill, stroke, label, sub, rx = 8, fs = 12, tc = C.ink }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -3 : 4)} fontSize={fs} fontWeight="600" fill={tc} textAnchor="middle">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 12} fontSize="10" fill={tc} opacity="0.8" textAnchor="middle">{sub}</text>}
    </g>
  );
}
function Cyl({ x, y, w, h, fill, stroke, label, sub }) {
  const ry = 7;
  return (
    <g>
      <path d={`M${x},${y + ry} a${w / 2},${ry} 0 0,0 ${w},0 v${h - 2 * ry} a${w / 2},${ry} 0 0,1 ${-w},0 Z`} fill={fill} stroke={stroke} strokeWidth="1.5" />
      <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + (sub ? 0 : 6)} fontSize="11" fontWeight="600" fill={C.ink} textAnchor="middle">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 13} fontSize="9" fill={C.ink} opacity="0.8" textAnchor="middle">{sub}</text>}
    </g>
  );
}
function Cap({ children, x, y, anchor = "middle", color = "#64748b", fs = 11, bold }) {
  return <text x={x} y={y} fontSize={fs} fill={color} textAnchor={anchor} fontWeight={bold ? 700 : 400}>{children}</text>;
}
const Frame = ({ children }) => (
  <svg viewBox="0 0 640 320" width="100%" role="img" style={{ display: "block" }}>{children}</svg>
);

/* ======================= DIAGRAMS (one per pattern) ===================== */

const SVG_STRANGLER = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Strangler Fig — traffic shifts from monolith to services over time</Cap>
    <Node x={250} y={130} w={140} h={52} fill={C.trfF} stroke={C.trf} label="Proxy / Facade" sub="routing layer" />
    {/* monolith shrinking right */}
    <Node x={470} y={70} w={150} h={170} fill={C.svcF} stroke={C.svc} label="Monolith" sub="legacy — shrinking" />
    {/* growing microservices left */}
    <Node x={30} y={60} w={150} h={36} fill={C.svcF} stroke={C.svc} label="Users svc" />
    <Node x={30} y={108} w={150} h={36} fill={C.svcF} stroke={C.svc} label="Orders svc" />
    <Node x={30} y={156} w={150} h={36} fill={C.svcF} stroke={C.svc} label="Catalog svc" />
    <Node x={30} y={204} w={150} h={28} fill="#faf5ff" stroke={C.svc} label="next to extract…" fs={10} />
    <Arrow x1={250} y1={150} x2={182} y2={130} color={C.ok} label="30% → new" labelDy={-10} />
    <Arrow x1={390} y1={156} x2={468} y2={156} color={C.brk} label="70% → old" labelDy={-10} />
    <Arrow x1={320} y1={250} x2={150} y2={250} color={C.ok} w={1.5} dashed label="" />
    <Cap x={240} y={266} fs={10} color={C.ok} bold>traffic shifts left over months/years →</Cap>
    <Arrow x1={150} y1={188} x2={250} y2={170} color={C.gray} w={1.5} />
  </Frame>
);

const SVG_SIDECAR = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Sidecar — helper container in the same pod handles plumbing</Cap>
    <rect x={150} y={60} width={340} height={150} rx={14} fill="#fafafa" stroke={C.gray} strokeWidth="1.5" strokeDasharray="6 4" />
    <Cap x={320} y={80} fs={11} color="#64748b" bold>Pod / Task (one deploy unit)</Cap>
    <Node x={300} y={100} w={160} h={90} fill={C.svcF} stroke={C.svc} label="Main App" sub="business logic" />
    <Node x={180} y={100} w={100} h={90} fill={C.brkF} stroke={C.brk} label="Sidecar" sub="proxy / TLS" />
    <Arrow x1={50} y1={145} x2={178} y2={145} color={C.trf} label="inbound" labelDy={-8} />
    <Arrow x1={282} y1={145} x2={298} y2={145} color={C.gray} />
    <Cap x={290} y={138} fs={9} color="#475569">fwd</Cap>
    <Arrow x1={230} y1={190} x2={230} y2={270} color={C.ok} label="logs / metrics" labelDx={-2} labelDy={-2} />
    <Node x={150} y={272} w={170} h={38} fill={C.okF} stroke={C.ok} label="Telemetry collector" fs={11} />
    <Arrow x1={460} y1={145} x2={560} y2={145} color={C.svc} label="" />
    <Cap x={560} y={130} fs={10} color="#475569">downstream</Cap>
  </Frame>
);

const SVG_AMBASSADOR = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Ambassador — outbound proxy: app just calls localhost</Cap>
    <Node x={30} y={130} w={130} h={70} fill={C.svcF} stroke={C.svc} label="Main App" sub="calls localhost" />
    <Node x={220} y={120} w={150} h={90} fill={C.brkF} stroke={C.brk} label="Ambassador" sub="outbound proxy" />
    <Arrow x1={160} y1={165} x2={218} y2={165} color={C.trf} label="localhost:8080" labelDy={-8} />
    <Node x={470} y={56} w={150} h={40} fill={C.dataF} stroke={C.data} label="Service A (gRPC)" fs={11} />
    <Node x={470} y={150} w={150} h={40} fill={C.dataF} stroke={C.data} label="Service B (REST)" fs={11} />
    <Node x={470} y={244} w={150} h={40} fill={C.dataF} stroke={C.data} label="Service C" fs={11} />
    <Arrow x1={370} y1={140} x2={468} y2={80} color={C.ok} label="+ protocol xlate" labelDy={-6} />
    <Arrow x1={370} y1={165} x2={468} y2={170} color={C.ok} label="+ auth header" labelDy={-8} />
    <Arrow x1={370} y1={195} x2={468} y2={262} color={C.ok} label="+ retry on 503" labelDy={14} />
  </Frame>
);

const SVG_ACL = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Anti-Corruption Layer — translates between clean & legacy models</Cap>
    <Node x={30} y={70} w={160} h={170} fill={C.okF} stroke={C.ok} label="Your Clean Domain" sub="Order, LineItem" />
    <Cap x={110} y={140} fs={10} color="#065f46">Order{`{ id, items }`}</Cap>
    <Cap x={110} y={160} fs={10} color="#065f46">clean, focused</Cap>
    <Node x={250} y={90} w={140} h={130} fill={C.brkF} stroke={C.brk} label="ACL" sub="translator" />
    <Node x={450} y={70} w={170} h={170} fill={C.grayF} stroke={C.gray} label="Legacy ERP" sub="messy model" />
    <Cap x={535} y={140} fs={9} color="#475569">OrderRecord</Cap>
    <Cap x={535} y={156} fs={9} color="#475569">(47 fields, codes)</Cap>
    <Arrow x1={190} y1={140} x2={248} y2={140} color={C.ok} label="clean →" labelDy={-8} />
    <Arrow x1={390} y1={155} x2={448} y2={155} color={C.gray} label="↔ messy" labelDy={-8} />
    <Cap x={320} y={250} fs={10} color="#b45309" bold>legacy concepts never leak into your domain</Cap>
  </Frame>
);

const SVG_EDA = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Event-Driven — producers emit, broker fans out to consumers</Cap>
    <Node x={250} y={70} w={140} h={180} fill={C.brkF} stroke={C.brk} label="Event Bus" sub="broker" />
    {["Orders", "Payments", "Catalog"].map((n, i) => (
      <g key={n}>
        <Node x={30} y={70 + i * 62} w={120} h={44} fill={C.svcF} stroke={C.svc} label={n} fs={11} />
        <Arrow x1={150} y1={92 + i * 62} x2={248} y2={130 + i * 18} color={C.svc} label={i === 0 ? "OrderPlaced" : ""} labelDy={-7} />
      </g>
    ))}
    {["Email", "Analytics", "Inventory", "Audit"].map((n, i) => (
      <g key={n}>
        <Node x={500} y={56 + i * 56} w={120} h={40} fill={C.dataF} stroke={C.data} label={n} fs={11} />
        <Arrow x1={390} y1={150} x2={498} y2={76 + i * 56} color={C.ok} />
      </g>
    ))}
    <Cap x={445} y={300} fs={10} color="#065f46">fan-out, no producer ↔ consumer coupling</Cap>
  </Frame>
);

const SVG_EVENT_SOURCING = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Event Sourcing — append-only events replayed into state</Cap>
    <Cap x={95} y={52} fs={10} color="#b45309" bold>Event store (append-only)</Cap>
    {["1 OrderCreated", "2 ItemAdded", "3 PaymentDone"].map((e, i) => (
      <Node key={e} x={30} y={62 + i * 58} w={150} h={44} fill={C.brkF} stroke={C.brk} label={e} fs={10} />
    ))}
    <Arrow x1={105} y1={106} x2={105} y2={120} color={C.brk} />
    <Arrow x1={105} y1={164} x2={105} y2={178} color={C.brk} />
    <Cap x={196} y={150} fs={9} color="#b45309">append</Cap>
    <Arrow x1={180} y1={150} x2={330} y2={150} color={C.svc} label="replay →" labelDy={-8} />
    <Node x={330} y={120} w={150} h={60} fill={C.svcF} stroke={C.svc} label="Current State" sub="balance = Σ events" />
    <Node x={500} y={70} w={120} h={40} fill={C.dataF} stroke={C.data} label="Read model A" fs={10} />
    <Node x={500} y={130} w={120} h={40} fill={C.dataF} stroke={C.data} label="Read model B" fs={10} />
    <Node x={500} y={210} w={120} h={40} fill={C.dataF} stroke={C.data} label="Search proj." fs={10} />
    <Arrow x1={480} y1={140} x2={498} y2={90} color={C.ok} label="" />
    <Arrow x1={480} y1={150} x2={498} y2={150} color={C.ok} />
    <Arrow x1={405} y1={180} x2={498} y2={230} color={C.ok} label="projections" labelDy={16} />
  </Frame>
);

const SVG_CQRS = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>CQRS — separate write model from read model</Cap>
    <Cap x={150} y={48} fs={11} bold color={C.svc}>Command side (write)</Cap>
    <Node x={40} y={60} w={220} h={34} fill={C.svcF} stroke={C.svc} label="UI → Command" fs={11} />
    <Arrow x1={150} y1={94} x2={150} y2={108} color={C.svc} />
    <Node x={40} y={108} w={220} h={34} fill={C.svcF} stroke={C.svc} label="Command Handler" fs={11} />
    <Arrow x1={150} y1={142} x2={150} y2={156} color={C.svc} />
    <Cyl x={75} y={156} w={150} h={66} fill={C.dataF} stroke={C.data} label="Write DB" sub="normalized" />
    <Cap x={490} y={48} fs={11} bold color={C.data}>Query side (read)</Cap>
    <Node x={380} y={60} w={220} h={34} fill={C.svcF} stroke={C.svc} label="UI → Query" fs={11} />
    <Arrow x1={490} y1={94} x2={490} y2={108} color={C.svc} />
    <Node x={380} y={108} w={220} h={34} fill={C.svcF} stroke={C.svc} label="Query Handler" fs={11} />
    <Arrow x1={490} y1={142} x2={490} y2={156} color={C.svc} />
    <Cyl x={415} y={156} w={150} h={66} fill={C.dataF} stroke={C.data} label="Read DB" sub="denormalized" />
    <Arrow x1={225} y1={188} x2={415} y2={188} color={C.brk} label="events / sync →" labelDy={-9} />
    <Cap x={320} y={250} fs={10} color="#b45309">scale read & write independently</Cap>
  </Frame>
);

const SVG_SAGA = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Saga — local txns + compensating rollbacks on failure</Cap>
    {[
      { l: "Reserve Inv.", x: 20 }, { l: "Charge Pay.", x: 180 }, { l: "Ship Order", x: 340 }, { l: "Notify", x: 500 },
    ].map((s, i) => (
      <Node key={s.l} x={s.x} y={90} w={120} h={50} fill={i === 2 ? C.failF : C.svcF} stroke={i === 2 ? C.fail : C.svc} label={s.l} fs={11} />
    ))}
    <Arrow x1={140} y1={115} x2={178} y2={115} color={C.ok} />
    <Arrow x1={300} y1={115} x2={338} y2={115} color={C.ok} />
    <Arrow x1={460} y1={115} x2={498} y2={115} color={C.ok} label="" />
    <Cap x={320} y={80} fs={10} color="#065f46" bold>happy path →</Cap>
    {/* failure marker at step 3 */}
    <text x={400} y={160} fontSize="13" fill={C.fail} textAnchor="middle" fontWeight="700">✗ payment failed</text>
    {/* compensating arrows right to left */}
    <Arrow x1={350} y1={210} x2={240} y2={210} color={C.fail} label="release pay" labelDy={16} />
    <Arrow x1={240} y1={230} x2={80} y2={230} color={C.fail} label="release inventory" labelDy={16} />
    <Cap x={120} y={205} fs={10} color={C.fail} bold>← compensating transactions roll back</Cap>
  </Frame>
);

const SVG_OUTBOX = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Outbox — DB write + event in one atomic transaction</Cap>
    <rect x={30} y={70} width={250} height={170} rx={12} fill="#f8fafc" stroke={C.svc} strokeWidth="1.5" strokeDasharray="6 4" />
    <Cap x={155} y={90} fs={11} color={C.svc} bold>Single DB transaction</Cap>
    <Cyl x={55} y={104} w={90} h={62} fill={C.dataF} stroke={C.data} label="Order" sub="table" />
    <Cyl x={170} y={104} w={90} h={62} fill={C.brkF} stroke={C.brk} label="Outbox" sub="table" />
    <Node x={70} y={196} w={170} h={32} fill={C.svcF} stroke={C.svc} label="OrderService write" fs={10} />
    <Arrow x1={155} y1={196} x2={120} y2={168} color={C.svc} />
    <Arrow x1={155} y1={196} x2={205} y2={168} color={C.svc} />
    <Node x={360} y={120} w={120} h={50} fill={C.svcF} stroke={C.svc} label="Relay / CDC" sub="poll outbox" />
    <Arrow x1={260} y1={135} x2={358} y2={140} color={C.brk} label="read unsent" labelDy={-8} />
    <Arrow x1={245} y1={150} x2={300} y2={150} color={C.gray} w={1.2} dashed />
    <Node x={520} y={120} w={100} h={50} fill={C.brkF} stroke={C.brk} label="Kafka" sub="broker" />
    <Arrow x1={480} y1={145} x2={518} y2={145} color={C.ok} label="publish" labelDy={-8} />
    <Cap x={420} y={230} fs={10} color="#065f46">no dual-write inconsistency · at-least-once</Cap>
  </Frame>
);

const SVG_SERVERLESS = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Serverless — event-triggered functions, auto-scale, pay-per-use</Cap>
    {["HTTP", "Queue", "Schedule", "File upload"].map((n, i) => (
      <g key={n}>
        <Node x={20} y={56 + i * 56} w={120} h={40} fill={C.trfF} stroke={C.trf} label={n} fs={11} />
        <Arrow x1={140} y1={76 + i * 56} x2={258} y2={160} color={C.trf} />
      </g>
    ))}
    <Node x={260} y={120} w={130} h={48} fill={C.svcF} stroke={C.svc} label="Function" sub="1 → N instances" />
    <Node x={272} y={108} w={130} h={48} fill="#f5f3ff" stroke={C.svc} rx={8} label="" />
    <Node x={284} y={96} w={130} h={48} fill="#faf5ff" stroke={C.svc} rx={8} label="" />
    <Cap x={350} y={200} fs={10} color={C.svc}>auto-scale on demand</Cap>
    <Cyl x={490} y={70} w={120} h={60} fill={C.dataF} stroke={C.data} label="DynamoDB" sub="store" />
    <Node x={490} y={160} w={120} h={42} fill={C.brkF} stroke={C.brk} label="EventBridge" fs={11} />
    <Node x={490} y={222} w={120} h={42} fill={C.svcF} stroke={C.svc} label="Downstream" fs={11} />
    <Arrow x1={390} y1={130} x2={488} y2={100} color={C.ok} />
    <Arrow x1={390} y1={145} x2={488} y2={181} color={C.ok} />
    <Arrow x1={390} y1={160} x2={488} y2={243} color={C.ok} />
  </Frame>
);

const SVG_FANOUT = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Fan-out / Fan-in — parallel work then aggregate</Cap>
    <Node x={250} y={44} w={140} h={40} fill={C.brkF} stroke={C.brk} label="Upload event" fs={11} />
    {["Thumbnail", "Metadata", "Virus scan", "Index"].map((n, i) => (
      <g key={n}>
        <Node x={20 + i * 155} y={150} w={130} h={46} fill={C.svcF} stroke={C.svc} label={n} fs={11} />
        <Arrow x1={320} y1={84} x2={85 + i * 155} y2={148} color={C.trf} />
        <Arrow x1={85 + i * 155} y1={196} x2={320} y2={244} color={C.ok} />
      </g>
    ))}
    <Cap x={150} y={120} fs={10} color={C.trf} bold>fan-out (parallel) ↓</Cap>
    <Node x={245} y={246} w={150} h={46} fill={C.okF} stroke={C.ok} label="Aggregator" sub="mark complete" />
    <Cap x={500} y={264} fs={10} color="#065f46" bold>↑ fan-in (join all)</Cap>
  </Frame>
);

const SVG_COMPETING = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Competing Consumers — one queue, many workers, 1 msg each</Cap>
    <Node x={40} y={90} w={150} h={140} fill={C.brkF} stroke={C.brk} label="" />
    <Cap x={115} y={84} fs={11} color="#b45309" bold>Queue</Cap>
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={55} y={104 + i * 24} width={120} height={18} rx={4} fill="#fff" stroke={C.brk} />
    ))}
    {["Worker 1", "Worker 2", "Worker 3", "Worker 4"].map((n, i) => (
      <g key={n}>
        <Node x={420} y={56 + i * 60} w={140} h={44} fill={C.svcF} stroke={C.svc} label={n} fs={11} />
        <Arrow x1={190} y1={160} x2={418} y2={78 + i * 60} color={C.ok} label={i === 0 ? "msg 4" : ""} labelDy={-6} />
      </g>
    ))}
    <Arrow x1={490} y1={300} x2={490} y2={284} color={C.trf} />
    <Cap x={490} y={314} fs={10} color={C.trf} bold>scale on queue depth ↑</Cap>
  </Frame>
);

const SVG_DURABLE = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Durable Execution — checkpointed workflow survives crashes</Cap>
    {[1, 2, 3, 4, 5].map((s, i) => (
      <g key={s}>
        <Node x={20 + i * 122} y={120} w={100} h={46} fill={i === 2 ? C.failF : C.svcF} stroke={i === 2 ? C.fail : C.svc} label={`Step ${s}`} fs={11} />
        {i < 4 && <Arrow x1={120 + i * 122} y1={143} x2={142 + i * 122} y2={143} color={i < 2 ? C.ok : C.gray} />}
      </g>
    ))}
    <text x={294} y={104} fontSize="13" fill={C.fail} textAnchor="middle" fontWeight="700">💥 crash</text>
    <Arrow x1={294} y1={166} x2={294} y2={216} color={C.fail} dashed />
    <Arrow x1={294} y1={250} x2={294} y2={170} color={C.ok} label="resume from cp3" labelDx={70} labelDy={4} />
    <Cyl x={244} y={250} w={110} h={56} fill={C.dataF} stroke={C.data} label="Checkpoint" sub="store" />
    <Cap x={520} y={210} fs={10} color="#065f46">not from step 1 →</Cap>
  </Frame>
);

const SVG_CIRCUIT = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Circuit Breaker — Closed → Open → Half-Open</Cap>
    <circle cx={120} cy={130} r={46} fill={C.okF} stroke={C.ok} strokeWidth="2" />
    <Cap x={120} y={128} fs={12} bold color="#065f46">Closed</Cap>
    <Cap x={120} y={143} fs={9} color="#065f46">normal</Cap>
    <circle cx={520} cy={130} r={46} fill={C.failF} stroke={C.fail} strokeWidth="2" />
    <Cap x={520} y={128} fs={12} bold color="#991b1b">Open</Cap>
    <Cap x={520} y={143} fs={9} color="#991b1b">fail fast</Cap>
    <circle cx={320} cy={250} r={44} fill={C.brkF} stroke={C.brk} strokeWidth="2" />
    <Cap x={320} y={248} fs={11} bold color="#b45309">Half-Open</Cap>
    <Cap x={320} y={262} fs={9} color="#b45309">probe</Cap>
    <Arrow x1={166} y1={120} x2={474} y2={120} color={C.fail} label="N failures / M s" labelDy={-8} />
    <Arrow x1={500} y1={172} x2={356} y2={224} color={C.brk} label="after T s" labelDy={-6} />
    <Arrow x1={288} y1={222} x2={150} y2={168} color={C.ok} label="probe ok" labelDy={-6} />
    <Arrow x1={360} y1={272} x2={478} y2={168} color={C.fail} label="still bad" labelDy={18} />
    <Cap x={320} y={300} fs={10} color="#475569">Open → return fallback immediately (no 30s hang)</Cap>
  </Frame>
);

const SVG_BULKHEAD = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Bulkhead — isolate failure to one compartment</Cap>
    <path d="M30,70 h250 v110 q-125,40 -250,0 Z" fill="#f8fafc" stroke={C.gray} strokeWidth="1.5" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={42 + i * 60} y={80} width={54} height={86} rx={4}
        fill={i === 1 ? C.failF : C.okF} stroke={i === 1 ? C.fail : C.ok} strokeWidth="1.5" />
    ))}
    <Cap x={69} y={128} fs={9} color="#065f46">ok</Cap>
    <Cap x={129} y={128} fs={9} color="#991b1b" bold>flood</Cap>
    <Cap x={189} y={128} fs={9} color="#065f46">ok</Cap>
    <Cap x={249} y={128} fs={9} color="#065f46">ok</Cap>
    <Cap x={155} y={205} fs={11} bold color={C.ink}>With bulkheads — ship floats</Cap>
    {/* shared pool comparison */}
    <rect x={380} y={80} width={230} height={86} rx={8} fill={C.failF} stroke={C.fail} strokeWidth="1.5" />
    <Cap x={495} y={128} fs={11} bold color="#991b1b">Shared pool — all flooded</Cap>
    <Cap x={495} y={205} fs={11} bold color={C.ink}>Without bulkheads — sinks</Cap>
    <Cap x={495} y={224} fs={10} color="#991b1b">one bad tenant drains everything</Cap>
  </Frame>
);

const SVG_RETRY = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Retry: backoff + jitter prevents the thundering herd</Cap>
    {/* timeline */}
    <line x1={40} y1={120} x2={300} y2={120} stroke={C.gray} />
    <Cap x={40} y={108} fs={10} color="#991b1b" bold>No jitter</Cap>
    {[0, 1, 2].map((i) => <circle key={i} cx={50} cy={108 + i * 8} r={4} fill={C.fail} />)}
    <Cap x={50} y={150} fs={9} color="#475569">fail T=0</Cap>
    {[0, 1, 2].map((i) => <circle key={i} cx={230} cy={108 + i * 8} r={4} fill={C.fail} />)}
    <Cap x={230} y={150} fs={9} color="#991b1b" bold>all retry T=1 💥</Cap>
    <line x1={340} y1={120} x2={610} y2={120} stroke={C.gray} />
    <Cap x={345} y={108} fs={10} color="#065f46" bold>With jitter</Cap>
    {[0, 1, 2].map((i) => <circle key={i} cx={350} cy={108 + i * 8} r={4} fill={C.fail} />)}
    <Cap x={350} y={150} fs={9} color="#475569">fail T=0</Cap>
    <circle cx={500} cy={108} r={4} fill={C.ok} />
    <circle cx={540} cy={116} r={4} fill={C.ok} />
    <circle cx={575} cy={124} r={4} fill={C.ok} />
    <Cap x={530} y={150} fs={9} color="#065f46" bold>spread 0.7 / 1.1 / 1.4</Cap>
    {/* backoff ladder */}
    <Cap x={320} y={200} fs={11} bold color={C.ink}>Exponential backoff</Cap>
    {["1s", "2s", "4s", "8s", "16s"].map((t, i) => (
      <g key={t}>
        <rect x={120 + i * 80} y={285 - i * 14} width={60} height={14 + i * 14} fill={C.svcF} stroke={C.svc} />
        <Cap x={150 + i * 80} y={300} fs={10} color={C.svc} bold>{t}</Cap>
      </g>
    ))}
  </Frame>
);

const SVG_THROTTLE = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Throttling — token bucket + window counters</Cap>
    <Arrow x1={70} y1={50} x2={70} y2={90} color={C.trf} label="refill rate" labelDx={-26} labelDy={4} />
    <rect x={40} y={90} width={120} height={120} rx={6} fill="#fff" stroke={C.brk} strokeWidth="2" />
    <rect x={40} y={150} width={120} height={60} rx={6} fill={C.brkF} stroke={C.brk} />
    {[0, 1, 2].map((i) => <circle key={i} cx={70 + i * 22} cy={175} r={8} fill={C.brk} />)}
    <Cap x={100} y={228} fs={10} color="#b45309" bold>token bucket</Cap>
    <Arrow x1={160} y1={170} x2={230} y2={170} color={C.ok} label="req ok" labelDy={-8} />
    <Arrow x1={160} y1={140} x2={230} y2={120} color={C.fail} label="empty → 429" labelDy={-8} />
    {/* windows */}
    <Cap x={420} y={70} fs={11} bold color={C.ink}>Fixed window</Cap>
    {[0, 1, 2].map((i) => <rect key={i} x={300 + i * 80} y={80} width={70} height={36} fill={C.svcF} stroke={C.svc} />)}
    {[0, 1, 2].map((i) => <Cap key={i} x={335 + i * 80} y={102} fs={10} color={C.svc}>{`≤100`}</Cap>)}
    <Cap x={420} y={160} fs={11} bold color={C.ink}>Sliding window</Cap>
    <rect x={300} y={170} width={250} height={36} fill={C.dataF} stroke={C.data} />
    <rect x={360} y={170} width={140} height={36} fill="#bfdbfe" stroke={C.data} />
    <Cap x={430} y={192} fs={10} color={C.data}>rolling count</Cap>
    <Cap x={420} y={240} fs={10} color="#475569">free 100/min · paid 10,000/min</Cap>
  </Frame>
);

const SVG_DBPER = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Database per Service — each owns its store, no DB sharing</Cap>
    {["Users", "Orders", "Catalog", "Billing"].map((n, i) => (
      <g key={n}>
        <Node x={20 + i * 155} y={50} w={120} h={44} fill={C.svcF} stroke={C.svc} label={n} fs={11} />
        <Arrow x1={80 + i * 155} y1={94} x2={80 + i * 155} y2={110} color={C.gray} />
        <Cyl x={30 + i * 155} y={110} w={100} h={56} fill={C.dataF} stroke={C.data} label="own DB" sub="" />
      </g>
    ))}
    {[0, 1, 2].map((i) => (
      <Arrow key={i} x1={140 + i * 155} y1={72} x2={175 + i * 155} y2={72} color={C.brk} label={i === 0 ? "API/event" : ""} labelDy={-7} />
    ))}
    <Cap x={320} y={196} fs={10} color="#b45309">services talk via API/events — never each other's DB</Cap>
    {/* anti-pattern */}
    <Cap x={320} y={230} fs={11} bold color={C.fail}>Anti-pattern: one shared DB</Cap>
    <Cyl x={270} y={244} w={100} h={56} fill={C.failF} stroke={C.fail} label="shared DB" />
    {[150, 250, 390, 490].map((x, i) => (
      <Arrow key={i} x1={x} y1={300} x2={320} y2={290} color={C.fail} w={1.3} />
    ))}
  </Frame>
);

const SVG_READREPLICA = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>CQRS + Read Replicas — one write, many tuned read stores</Cap>
    <Cyl x={30} y={120} w={130} h={70} fill={C.dataF} stroke={C.data} label="Write primary" sub="source of truth" />
    <Node x={210} y={130} w={130} h={50} fill={C.brkF} stroke={C.brk} label="CDC / events" sub="stream" />
    <Arrow x1={160} y1={155} x2={208} y2={155} color={C.brk} label="changes →" labelDy={-8} />
    {[
      { l: "Relational replica", u: "OLTP reads" },
      { l: "Search index", u: "full-text" },
      { l: "Cache (Redis)", u: "sessions" },
      { l: "Warehouse", u: "analytics" },
    ].map((s, i) => (
      <g key={s.l}>
        <Node x={440} y={48 + i * 62} w={180} h={48} fill={C.dataF} stroke={C.data} label={s.l} sub={s.u} fs={11} />
        <Arrow x1={340} y1={155} x2={438} y2={72 + i * 62} color={C.ok} />
      </g>
    ))}
  </Frame>
);

const SVG_MATVIEW = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Materialized View — pre-computed, kept-in-sync read table</Cap>
    {["Items", "Prices", "Inventory"].map((n, i) => (
      <g key={n}>
        <Cyl x={30} y={60 + i * 74} w={120} h={58} fill={C.dataF} stroke={C.data} label={n} />
        <Arrow x1={150} y1={86 + i * 74} x2={278} y2={150} color={C.gray} label={i === 1 ? "join" : ""} labelDy={-7} />
      </g>
    ))}
    <Node x={280} y={120} w={130} h={70} fill={C.svcF} stroke={C.svc} label="Refresh" sub="event-driven" />
    <Arrow x1={410} y1={155} x2={478} y2={150} color={C.brk} label="materialize" labelDy={-8} />
    <Cyl x={480} y={110} w={140} h={90} fill={C.okF} stroke={C.ok} label="Materialized" sub="pre-joined view" />
    <Node x={250} y={250} w={140} h={40} fill={C.trfF} stroke={C.trf} label="App / listing page" fs={11} />
    <Arrow x1={390} y1={270} x2={550} y2={202} color={C.ok} label="fast read" labelDy={16} />
  </Frame>
);

const SVG_BLUEGREEN = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Blue/Green — atomic traffic switch, instant rollback</Cap>
    <Node x={250} y={50} w={140} h={44} fill={C.trfF} stroke={C.trf} label="Load balancer" fs={11} />
    <Node x={60} y={150} w={180} h={90} fill="#dbeafe" stroke="#2563eb" label="Blue" sub="current — v1" />
    <Node x={400} y={150} w={180} h={90} fill={C.okF} stroke={C.ok} label="Green" sub="new — v2" />
    <Arrow x1={300} y1={94} x2={150} y2={148} color="#2563eb" label="100% now" labelDy={-6} />
    <Arrow x1={340} y1={94} x2={490} y2={148} color={C.ok} label="switch → 100%" labelDy={-6} dashed />
    <Arrow x1={400} y1={260} x2={240} y2={260} color={C.fail} label="rollback ← switch back to Blue" labelDy={16} />
  </Frame>
);

const SVG_CANARY = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Canary — gradual shift 1% → 5% → 25% → 100%</Cap>
    <Node x={250} y={48} w={140} h={40} fill={C.trfF} stroke={C.trf} label="Traffic split" fs={11} />
    <Node x={60} y={150} w={170} h={70} fill={C.okF} stroke={C.ok} label="v1 stable" sub="95%" />
    <Node x={300} y={150} w={150} h={70} fill={C.brkF} stroke={C.brk} label="v2 canary" sub="5%" />
    <Arrow x1={300} y1={88} x2={150} y2={148} color={C.ok} label="95%" labelDy={-6} />
    <Arrow x1={340} y1={88} x2={375} y2={148} color={C.brk} label="5%" labelDy={-6} />
    <Node x={490} y={120} w={130} h={120} fill="#f8fafc" stroke={C.gray} label="" />
    <Cap x={555} y={140} fs={10} bold color={C.ink}>Monitor</Cap>
    <Cap x={555} y={162} fs={9} color="#475569">error rate</Cap>
    <Cap x={555} y={180} fs={9} color="#475569">latency p99</Cap>
    <Cap x={555} y={205} fs={9} color={C.fail}>breach → rollback</Cap>
    <Cap x={555} y={222} fs={9} color={C.ok}>ok → promote</Cap>
    <Arrow x1={235} y1={230} x2={620} y2={290} color={C.svc} w={1.4} />
    <Cap x={300} y={300} fs={10} color={C.svc} bold>shift % up as confidence grows →</Cap>
  </Frame>
);

const SVG_FLAGS = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Feature Flags — deploy off, release via config</Cap>
    <Node x={30} y={60} w={170} h={44} fill={C.svcF} stroke={C.svc} label="Deploy" sub="flag = OFF" />
    <Arrow x1={200} y1={82} x2={258} y2={120} color={C.gray} />
    <Node x={250} y={110} w={150} h={64} fill={C.brkF} stroke={C.brk} label="Flag service" sub="evaluate rules" />
    {[
      { l: "Beta users", v: "ON", c: C.ok },
      { l: "Free tier", v: "OFF", c: C.fail },
      { l: "25% rollout", v: "ON", c: C.ok },
    ].map((s, i) => (
      <g key={s.l}>
        <Node x={450} y={56 + i * 60} w={170} h={46} fill="#f8fafc" stroke={s.c} label={s.l} sub={`flag ${s.v}`} fs={11} />
        <Arrow x1={400} y1={142} x2={448} y2={78 + i * 60} color={s.c} />
      </g>
    ))}
    {/* rollout slider */}
    <line x1={250} y1={240} x2={400} y2={240} stroke={C.gray} strokeWidth="3" />
    <line x1={250} y1={240} x2={325} y2={240} stroke={C.svc} strokeWidth="3" />
    <circle cx={325} cy={240} r={8} fill={C.svc} />
    <Cap x={325} y={266} fs={10} color={C.svc} bold>rollout 25%</Cap>
  </Frame>
);

const SVG_MESH = (
  <Frame>
    <Cap x={320} y={20} fs={12} bold color={C.ink}>Service Mesh — sidecar proxies + central control plane</Cap>
    <Node x={210} y={44} w={220} h={36} fill={C.brkF} stroke={C.brk} label="Control plane (Istiod)" fs={11} />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={30 + i * 155} y={140} width={130} height={70} rx={10} fill="#fafafa" stroke={C.gray} strokeDasharray="4 3" />
        <Node x={40 + i * 155} y={150} w={50} h={50} fill={C.svcF} stroke={C.svc} label="app" fs={10} />
        <Node x={98 + i * 155} y={150} w={52} h={50} fill={C.trfF} stroke={C.trf} label="proxy" fs={9} />
        <Arrow x1={320} y1={80} x2={95 + i * 155} y2={148} color={C.brk} w={1.2} dashed />
      </g>
    ))}
    {[0, 1, 2].map((i) => (
      <Arrow key={i} x1={150 + i * 155} y1={175} x2={185 + i * 155} y2={175} color={C.trf} label={i === 0 ? "mTLS" : ""} labelDy={-7} />
    ))}
    <Node x={235} y={258} w={170} h={40} fill={C.dataF} stroke={C.data} label="Telemetry backend" fs={11} />
    {[1, 2].map((i) => <Arrow key={i} x1={120 + i * 155} y1={210} x2={300} y2={256} color={C.ok} w={1.2} />)}
    <Cap x={150} y={250} fs={10} color="#065f46">traces/metrics →</Cap>
  </Frame>
);

/* =============================== PARTS =================================== */
const PARTS = [
  { id: "p1", name: "Foundational Patterns", short: "Foundational", color: "#475569", tint: "#f1f5f9" },
  { id: "p2", name: "Event-Driven Patterns", short: "Event-Driven", color: "#8b5cf6", tint: "#f3e8ff" },
  { id: "p3", name: "Serverless Patterns", short: "Serverless", color: "#d97706", tint: "#fef3c7" },
  { id: "p4", name: "Resilience Patterns", short: "Resilience", color: "#dc2626", tint: "#fee2e2" },
  { id: "p5", name: "Data Patterns", short: "Data", color: "#2563eb", tint: "#dbeafe" },
  { id: "p6", name: "Deployment Patterns", short: "Deployment", color: "#059669", tint: "#d1fae5" },
];

/* ============================== PATTERNS ================================ */
const PATTERNS = [
  /* ---------------- PART 1 ---------------- */
  {
    id: "strangler-fig", num: 1, part: "p1", title: "Strangler Fig Pattern",
    coreIdea: "Migrate a monolith to microservices incrementally by routing more and more traffic to new services until the old code is fully strangled.",
    explanation:
      "A proxy or facade is placed in front of the existing monolith, and from there you carve out one capability at a time into a new service. Each extracted seam gets its routing rule so a slice of traffic flows to the new implementation while the rest still hits the monolith. Over weeks or months you keep shifting traffic and retiring monolith code, so the system is always shippable and you never bet the company on a big-bang rewrite. The name comes from the strangler fig vine that grows around a host tree until the tree is gone. The hard part is discipline: the proxy and dual-stack are temporary scaffolding, not a destination.",
    svg: SVG_STRANGLER,
    caption: "Proxy routes a growing share of traffic to new services while the monolith shrinks.",
    cloud: {
      aws: ["API Gateway — front-door routing", "ALB listener rules — path-based split", "Lambda / ECS — new services"],
      gcp: ["Cloud Endpoints — facade", "Cloud Load Balancing — URL maps", "Cloud Run — new services"],
      azure: ["API Management — facade & policies", "App Service — new services", "Front Door — routing"],
    },
    whenToUse: [
      "A large legacy monolith must keep serving production traffic while you modernize it piece by piece.",
      "Risk tolerance is low and a full rewrite would take a year before any value ships.",
      "You can identify clear seams (bounded capabilities) that can be extracted independently.",
    ],
    failureModes: [
      { name: "Proxy becomes a bottleneck", detail: "All traffic funnels through one facade; if it is under-provisioned latency and outages spread everywhere. Detect via rising p99 at the proxy and saturation alarms." },
      { name: "Data consistency during the split", detail: "Old and new code write to overlapping data, causing drift. Detect with reconciliation jobs comparing monolith vs service records." },
      { name: "Strangle paralysis", detail: "The migration stalls half-done, leaving permanent dual maintenance. Detect by tracking the percentage of traffic still on the monolith trending flat." },
    ],
    benefits: ["Incremental, low-risk migration", "System stays shippable throughout", "Easy rollback per extracted seam"],
    costs: ["Long-lived dual stack to maintain", "Routing/facade complexity", "Migration may never finish without discipline"],
    related: ["acl", "service-mesh", "db-per-service"],
  },
  {
    id: "sidecar", num: 2, part: "p1", title: "Sidecar Pattern",
    coreIdea: "Run a helper container next to your main app in the same deploy unit so it handles cross-cutting concerns while the app stays focused.",
    explanation:
      "The sidecar shares the pod's lifecycle and network namespace with the main container, so they communicate over localhost with near-zero overhead. It absorbs concerns that every service needs but no business team wants to rewrite: structured logging, metrics scraping, TLS termination, config hot-reload, and service-mesh proxying. Because the sidecar is a separate image, you can patch or upgrade the platform capability fleet-wide without touching application code. The classic example is Envoy injected into every mesh pod. The cost is that you now ship and operate two containers per unit, and their lifecycles are coupled.",
    svg: SVG_SIDECAR,
    caption: "Inbound traffic hits the sidecar first; it forwards to the app and ships telemetry outbound.",
    cloud: {
      aws: ["ECS task with two containers", "App Mesh — Envoy sidecar", "CloudWatch agent sidecar"],
      gcp: ["GKE pod — Istio sidecar injection", "Cloud Service Mesh", "Ops Agent sidecar"],
      azure: ["AKS — Dapr sidecar", "Azure Service Mesh", "AKS sidecar log/metric agents"],
    },
    whenToUse: [
      "Many services in different languages all need the same logging, TLS, or metrics behavior.",
      "You want to add a platform capability without redeploying or rewriting every app.",
      "A third-party agent must run co-located with the app but stay independently upgradeable.",
    ],
    failureModes: [
      { name: "Sidecar crash takes down the pod", detail: "If the app depends on the sidecar for networking and it dies, the whole unit is unhealthy. Detect with per-container liveness probes and restart metrics." },
      { name: "Resource contention", detail: "Sidecar and app compete for the same CPU/memory limits, throttling the app under load. Detect via per-container utilization and throttling counters." },
      { name: "Version drift across the fleet", detail: "Sidecars upgrade at different rates, producing inconsistent behavior. Detect with a fleet inventory dashboard of sidecar image versions." },
    ],
    benefits: ["Keeps app code clean and focused", "Language-agnostic shared capability", "Patch platform features independently"],
    costs: ["Doubles container count and resource use", "Coupled lifecycle with the app", "Operational/version-drift overhead"],
    related: ["ambassador", "service-mesh", "circuit-breaker"],
  },
  {
    id: "ambassador", num: 3, part: "p1", title: "Ambassador Pattern",
    coreIdea: "A specialized sidecar that proxies the app's outbound calls, handling retries, auth, and protocol translation so the app just calls localhost.",
    explanation:
      "Where a generic sidecar covers any cross-cutting concern, the ambassador focuses specifically on egress: the app makes a simple call to localhost and the ambassador owns everything that makes remote calls reliable. It can retry on transient 503s, trip a circuit breaker, inject auth tokens, and translate between protocols such as REST-to-gRPC. This keeps client resilience logic out of the application and consistent across a polyglot fleet. A typical flow is the app calling localhost:8080/api while the ambassador rewrites it to a gRPC backend with an auth header and retry policy. It is essentially the client-side counterpart to an API gateway.",
    svg: SVG_AMBASSADOR,
    caption: "App calls localhost; the ambassador adds retries, auth, and protocol translation on each outbound hop.",
    cloud: {
      aws: ["App Mesh — Envoy outbound", "API Gateway SDK clients", "Lambda extension as egress proxy"],
      gcp: ["Apigee adapter", "Cloud Service Mesh egress gateway", "Traffic Director client config"],
      azure: ["Dapr service invocation", "KEDA with ambassador proxy", "API Management self-hosted gateway"],
    },
    whenToUse: [
      "Clients across several languages need identical retry, timeout, and auth behavior on outbound calls.",
      "You must talk to a backend that speaks a different protocol than your app expects.",
      "You want resilience policy (circuit breaking, backoff) configured by ops, not baked into each app.",
    ],
    failureModes: [
      { name: "Hidden latency from added hops", detail: "Every call now traverses the ambassador, adding tail latency. Detect by comparing app-to-localhost vs end-to-end timing." },
      { name: "Retry amplification", detail: "Aggressive retries multiply load on an already-failing dependency. Detect via outbound request-count spikes during downstream errors." },
      { name: "Auth/token misconfiguration", detail: "A stale or wrong injected token silently fails all egress. Detect with 401/403 rate alarms per ambassador." },
    ],
    benefits: ["Centralizes client resilience logic", "Transparent protocol translation", "Consistent egress behavior fleet-wide"],
    costs: ["Extra network hop and latency", "Another component to operate", "Misconfig can break all outbound calls"],
    related: ["sidecar", "circuit-breaker", "retry-backoff"],
  },
  {
    id: "acl", num: 4, part: "p1", title: "Anti-Corruption Layer (ACL)",
    coreIdea: "A translation layer that maps between your clean domain model and a messy legacy or third-party model so external concepts never pollute your services.",
    explanation:
      "When you must integrate with a legacy ERP or a third-party API whose data model is awkward, the ACL acts as a one-way membrane: your services speak your ubiquitous language, and the ACL translates to and from the foreign model. This prevents the external system's quirks — cryptic codes, a 47-field OrderRecord, inconsistent enums — from leaking into and corrupting your domain. The layer typically lives as a dedicated service or function that owns the mapping logic and adapts it as the external system changes. It is a deliberate investment in isolation: you accept translation overhead to keep your core model coherent. Over time it also becomes the single place to absorb breaking changes from the upstream system.",
    svg: SVG_ACL,
    caption: "The ACL translates your clean domain types to and from the legacy system's messy model.",
    cloud: {
      aws: ["Lambda — translator function", "EventBridge — transform & route", "Step Functions — mapping flow"],
      gcp: ["Cloud Functions — translator", "Pub/Sub — message transform", "Workflows — mapping orchestration"],
      azure: ["Azure Functions — ACL adapter", "Logic Apps — transform actions", "Service Bus — message mapping"],
    },
    whenToUse: [
      "You integrate with a legacy or vendor system whose model would corrupt your clean domain.",
      "The external API changes often and you want one isolated place to absorb the churn.",
      "Multiple services need the same external data but must not depend on its foreign shape.",
    ],
    failureModes: [
      { name: "Translation drift", detail: "The external model changes and the mapping silently mistranslates fields. Detect with schema-validation checks and contract tests against the upstream." },
      { name: "ACL becomes a god service", detail: "Too much logic accretes in the layer until it is itself a fragile monolith. Detect by tracking its change frequency and code size." },
      { name: "Lossy mapping", detail: "Fields with no clean equivalent get dropped, losing data. Detect with round-trip tests comparing source vs translated payloads." },
    ],
    benefits: ["Protects domain model integrity", "Isolates upstream changes", "Single, testable translation point"],
    costs: ["Extra mapping code to maintain", "Translation latency/overhead", "Risk of becoming a complex hotspot"],
    related: ["strangler-fig", "outbox", "event-driven"],
  },

  /* ---------------- PART 2 ---------------- */
  {
    id: "event-driven", num: 5, part: "p2", title: "Event-Driven Architecture",
    coreIdea: "Services communicate by emitting and reacting to events through a broker, so producers never know who consumes them.",
    explanation:
      "Instead of calling each other directly, services publish facts about what happened — OrderPlaced, PaymentCaptured — to a bus, and any number of consumers subscribe independently. This gives you loose coupling, independent scaling, and temporal decoupling, since a consumer can be offline and catch up later. You distinguish domain events, cross-service integration events, commands, and queries, and design topics around them. The trade-off is that you give up the simplicity of synchronous request/response and must reason about ordering, duplicates, and consumer lag. Done well, you can add a brand-new consumer to an existing event stream without touching any producer.",
    svg: SVG_EDA,
    caption: "Producers emit events to a central bus that fans them out to independent consumers.",
    cloud: {
      aws: ["EventBridge — event router", "SNS + SQS — pub/sub & buffering", "Kinesis — streaming events"],
      gcp: ["Pub/Sub — messaging backbone", "Eventarc — event routing", "Cloud Tasks — deferred work"],
      azure: ["Event Grid — event routing", "Event Hubs — streaming", "Service Bus — queues/topics"],
    },
    whenToUse: [
      "Multiple teams need to react to the same business fact without coordinating deploys.",
      "Producers and consumers must scale and fail independently of one another.",
      "You expect to add new consumers of existing events over time.",
    ],
    failureModes: [
      { name: "Out-of-order events", detail: "Consumers receive events in the wrong sequence and compute bad state. Detect with sequence numbers and gap/ordering checks." },
      { name: "Duplicate delivery", detail: "At-least-once brokers re-deliver, causing double processing. Detect via idempotency keys and duplicate-rate metrics." },
      { name: "Unbounded consumer lag", detail: "A slow consumer falls behind until the backlog explodes. Detect with consumer-lag and queue-depth alarms." },
    ],
    benefits: ["Loose coupling between services", "Independent scaling & deploys", "Easy to add new consumers"],
    costs: ["Harder to trace end-to-end flows", "Eventual consistency to reason about", "Ordering & duplicate handling required"],
    related: ["event-sourcing", "saga", "outbox"],
  },
  {
    id: "event-sourcing", num: 6, part: "p2", title: "Event Sourcing",
    coreIdea: "Persist every state change as an immutable event; current state is the replay of all events rather than a mutable row.",
    explanation:
      "The event store is append-only — you never update or delete — so the full history of how an aggregate reached its current state is preserved. Current state is derived by folding all events from the beginning, which gives you a complete audit log, time travel, and the ability to rebuild new read models by replaying. Projections consume the event stream to build query-optimized views, and snapshots are used to avoid replaying from zero for long-lived aggregates. A bank account balance is the canonical example: it is just the sum of every debit and credit event. The cost is real: storage grows forever, replays of old aggregates are slow, and evolving the schema of historical events is genuinely tricky.",
    svg: SVG_EVENT_SOURCING,
    caption: "An append-only event log is replayed into current state and projected into multiple read models.",
    cloud: {
      aws: ["DynamoDB + Streams — event store", "Kinesis — replay stream", "EventBridge Pipes — projections"],
      gcp: ["Firestore — event store", "Pub/Sub — replay", "BigQuery — projections"],
      azure: ["Cosmos DB change feed — event store", "Event Hubs — replay", "Functions — projections"],
    },
    whenToUse: [
      "You need a complete, tamper-evident audit trail of every change (finance, compliance).",
      "You want to derive new read models retroactively by replaying history.",
      "Temporal queries — 'what did state look like last Tuesday?' — are a real requirement.",
    ],
    failureModes: [
      { name: "Event store grows unbounded", detail: "History accumulates forever, inflating cost and replay time. Detect with store-size growth and replay-duration trends." },
      { name: "Slow replay for old aggregates", detail: "Rebuilding a long-lived aggregate from scratch is expensive. Mitigate with snapshots; detect via aggregate-load latency." },
      { name: "Schema evolution of old events", detail: "Changing event shapes breaks replay of historical data. Detect with versioned events and upcasting test coverage." },
    ],
    benefits: ["Full audit log & time travel", "Rebuild any read model by replay", "Immutable, debuggable history"],
    costs: ["Storage grows forever", "Replay & snapshot complexity", "Event schema versioning is hard"],
    related: ["cqrs", "event-driven", "materialized-view"],
  },
  {
    id: "cqrs", num: 7, part: "p2", title: "CQRS — Command Query Responsibility Segregation",
    coreIdea: "Split the write model that handles commands from the read model that serves queries, so each is optimized for its job.",
    explanation:
      "On the write side you keep a normalized, consistent model that enforces business rules; on the read side you keep denormalized views shaped exactly for each query pattern. The two sides are kept in sync, often via events: commands produce events that update one or more read projections. This lets you scale reads and writes independently — invaluable when reads outnumber writes by orders of magnitude. A common shape is writing to Postgres while serving reads from Elasticsearch for full-text search. The price is eventual consistency: there is a window where a write is not yet visible in the read model, which can confuse users if not designed for.",
    svg: SVG_CQRS,
    caption: "Commands flow through a write model; queries hit a separately tuned read model kept in sync via events.",
    cloud: {
      aws: ["RDS — write side", "DynamoDB / OpenSearch — read side", "Lambda on DynamoDB Streams — projections"],
      gcp: ["Cloud Spanner — writes", "Firestore / BigQuery — reads", "Dataflow — projections"],
      azure: ["Azure SQL — writes", "Cosmos DB — reads", "Azure Functions — projections"],
    },
    whenToUse: [
      "Read and write workloads have wildly different volumes or shapes (e.g. 1000:1 reads).",
      "Query patterns need denormalized views the write schema can't serve efficiently.",
      "You already use event sourcing and want query-optimized projections.",
    ],
    failureModes: [
      { name: "Confusing consistency window", detail: "Users write then immediately read stale data from the lagging read model. Detect with read-model lag metrics and user-reported 'my change vanished' reports." },
      { name: "Projection lag", detail: "Projection workers fall behind under load, widening staleness. Detect via projection backlog and processing-time alarms." },
      { name: "Read models drift out of sync", detail: "A missed or failed event leaves a projection permanently wrong. Detect with periodic reconciliation against the source." },
    ],
    benefits: ["Independent read/write scaling", "Query-optimized read models", "Cleaner write-side business logic"],
    costs: ["Eventual consistency to manage", "More moving parts to operate", "Projection sync complexity"],
    related: ["event-sourcing", "cqrs-read-replicas", "materialized-view"],
  },
  {
    id: "saga", num: 8, part: "p2", title: "Saga Pattern",
    coreIdea: "Coordinate a distributed transaction as a series of local transactions, using compensating actions to undo earlier steps on failure.",
    explanation:
      "Because two-phase commit doesn't scale across services, a saga breaks a business transaction into steps where each step commits locally and then triggers the next via an event or command. If a later step fails, the saga runs compensating transactions to semantically undo the earlier committed steps. There are two flavors: choreography, where services react to each other's events with no central coordinator, and orchestration, where a saga orchestrator explicitly tells each service what to do. A classic order saga reserves inventory, charges payment, then ships; if payment fails it releases the inventory. The hard part is that compensations are not true rollbacks — they are forward-fixing actions that must be designed for every failure point.",
    svg: SVG_SAGA,
    caption: "Steps commit left-to-right on the happy path; a failure at step 3 triggers compensations right-to-left.",
    cloud: {
      aws: ["Step Functions — orchestration sagas", "EventBridge — choreography sagas", "SQS — step messaging"],
      gcp: ["Workflows — orchestration", "Pub/Sub — choreography", "Cloud Tasks — step retries"],
      azure: ["Durable Functions — orchestration", "Service Bus — choreography", "Logic Apps — flows"],
    },
    whenToUse: [
      "A business process spans multiple services that each own their own data.",
      "You need atomicity across services but two-phase commit is impractical.",
      "Steps may fail independently and you can define meaningful compensations.",
    ],
    failureModes: [
      { name: "Compensation failure", detail: "A compensating step itself fails, leaving the system half-undone. Detect with dead-letter queues on compensation actions and stuck-saga alarms." },
      { name: "Lost saga state", detail: "Without durable tracking, a crash mid-saga leaves orphaned partial work. Detect with a saga-state store and timeout sweeps." },
      { name: "Choreography spaghetti", detail: "Event-reaction chains become impossible to follow as steps grow. Detect by mapping event flows and watching for cyclic dependencies." },
    ],
    benefits: ["Distributed atomicity without 2PC", "Each service stays autonomous", "Explicit, testable failure handling"],
    costs: ["Compensations are hard to design", "No isolation — intermediate states visible", "Complex to debug end-to-end"],
    related: ["event-driven", "outbox", "durable-execution"],
  },
  {
    id: "outbox", num: 9, part: "p2", title: "Outbox Pattern",
    coreIdea: "Write the business change and the outgoing event into the same database transaction, then let a relay publish the event reliably.",
    explanation:
      "The dual-write problem is that saving to the database and publishing an event are two separate operations — if one succeeds and the other fails, your data and your events diverge. The outbox solves this by writing the event row into an Outbox table inside the same local transaction as the business write, so both commit or neither does. A separate relay process then reads unpublished rows from the outbox and publishes them to the broker, marking each as sent. This guarantees at-least-once delivery with no inconsistency between state and events. The OrderService example saves the order and an OrderCreated outbox row atomically, and a CDC or polling relay forwards it to Kafka.",
    svg: SVG_OUTBOX,
    caption: "The order and the event commit atomically; a relay later publishes the outbox row to the broker.",
    cloud: {
      aws: ["RDS — order + outbox tables", "DMS / Lambda CDC — relay", "EventBridge / SQS — target broker"],
      gcp: ["Cloud SQL — outbox table", "Datastream CDC — relay", "Pub/Sub — target broker"],
      azure: ["Azure SQL — outbox + change tracking", "Functions CDC — relay", "Service Bus — target broker"],
    },
    whenToUse: [
      "You must guarantee an event is published whenever and only when a DB write commits.",
      "You're integrating a relational write with an event-driven downstream.",
      "Lost or phantom events would cause real data-integrity problems.",
    ],
    failureModes: [
      { name: "Relay falls behind", detail: "The publisher can't keep up and the outbox grows. Detect with unpublished-row count and relay-lag metrics." },
      { name: "Duplicate publishes", detail: "A relay crash after publish but before marking sent re-emits the event. Detect via downstream idempotency and duplicate-rate tracking." },
      { name: "Outbox table bloat", detail: "Published rows are never pruned, degrading the DB. Detect with table-size growth and run a cleanup/archival job." },
    ],
    benefits: ["Eliminates dual-write inconsistency", "At-least-once delivery guarantee", "Works with ordinary transactions"],
    costs: ["Extra table + relay to operate", "Requires idempotent consumers", "Publish latency (poll interval)"],
    related: ["event-driven", "saga", "cqrs"],
  },

  /* ---------------- PART 3 ---------------- */
  {
    id: "serverless", num: 10, part: "p3", title: "Serverless Architecture",
    coreIdea: "Run event-triggered functions where the provider handles provisioning, scaling, and patching, and you pay only for what runs.",
    explanation:
      "Functions execute in response to triggers — an HTTP request, a queue message, a file upload, a schedule, or a stream record — and scale from zero to many instances automatically. You pay per invocation and duration rather than for idle capacity, which is ideal for spiky or unpredictable workloads. The platform owns the servers, so there is no patching or capacity planning, but you inherit constraints like cold starts, execution-time limits, and harder local testing. Serverless shines for glue code, event processing, and APIs with variable traffic. The main caution is that the convenience comes with vendor lock-in and distributed-tracing challenges as the number of functions grows.",
    svg: SVG_SERVERLESS,
    caption: "Varied event sources trigger functions that auto-scale and write to downstream stores and services.",
    cloud: {
      aws: ["Lambda + API Gateway", "S3 / DynamoDB — triggers & store", "EventBridge — event routing"],
      gcp: ["Cloud Functions + Cloud Run", "Pub/Sub — triggers", "Firestore — store"],
      azure: ["Azure Functions + API Management", "Blob Storage — triggers", "Cosmos DB — store"],
    },
    whenToUse: [
      "Traffic is spiky or unpredictable and you don't want to pay for idle servers.",
      "You need event-glue between cloud services without managing infrastructure.",
      "A small team wants to ship features without operating a fleet.",
    ],
    failureModes: [
      { name: "Cold starts", detail: "Idle functions add startup latency to the first request. Detect with init-duration metrics; mitigate with provisioned concurrency." },
      { name: "Execution-time limits", detail: "Long tasks hit the platform timeout (e.g. 15 min) and fail mid-run. Detect with timeout-error rates; offload long work elsewhere." },
      { name: "Distributed-tracing blind spots", detail: "Many tiny functions make end-to-end failures hard to follow. Detect by adopting trace context propagation and gap analysis." },
    ],
    benefits: ["No servers to manage or patch", "Scales to zero — pay per use", "Fast to ship event-driven code"],
    costs: ["Cold-start latency", "Execution limits & vendor lock-in", "Harder testing and tracing"],
    related: ["fan-out-in", "competing-consumers", "durable-execution"],
  },
  {
    id: "fan-out-in", num: 11, part: "p3", title: "Fan-Out / Fan-In Pattern",
    coreIdea: "Split one task into parallel work across many workers (fan-out), then aggregate their results back into one outcome (fan-in).",
    explanation:
      "When a unit of work decomposes into independent sub-tasks, you fan out by dispatching each to its own worker so they run concurrently, then fan in by collecting all results into a final outcome. The image-processing example fans out to generate a thumbnail, extract metadata, run a virus scan, and build a search index in parallel, then fans in to mark the upload complete. Parallelism cuts wall-clock latency dramatically when sub-tasks don't depend on each other. The aggregator must handle partial completion — some workers failing or timing out — rather than waiting forever. This is the workhorse pattern behind map-style processing in serverless and workflow systems.",
    svg: SVG_FANOUT,
    caption: "One trigger fans out to parallel workers; an aggregator fans the results back in.",
    cloud: {
      aws: ["SNS → multiple SQS + Lambda — fan-out", "Step Functions Map state — fan-in", "S3 events — trigger"],
      gcp: ["Pub/Sub multi-subscription — fan-out", "Workflows — fan-in", "Cloud Functions — workers"],
      azure: ["Event Grid → multiple queues — fan-out", "Durable Functions Task.WhenAll — fan-in", "Functions — workers"],
    },
    whenToUse: [
      "A task splits into independent sub-tasks that can run concurrently.",
      "Total latency matters and parallelism beats sequential processing.",
      "You need to aggregate many partial results into one final answer.",
    ],
    failureModes: [
      { name: "Partial fan-in", detail: "Some workers fail and the aggregator can't form a complete result. Detect with per-branch success tracking and a completeness check." },
      { name: "Timeout waiting for all workers", detail: "One slow worker stalls the whole aggregation. Detect via straggler timing and apply per-branch deadlines." },
      { name: "Aggregator bottleneck", detail: "The fan-in step can't keep up with parallel output. Detect with aggregator queue depth and processing latency." },
    ],
    benefits: ["Massive latency reduction via parallelism", "Independent, scalable workers", "Natural fit for serverless"],
    costs: ["Partial-failure handling complexity", "Aggregator can bottleneck", "Harder to reason about timing"],
    related: ["serverless", "competing-consumers", "saga"],
  },
  {
    id: "competing-consumers", num: 12, part: "p3", title: "Competing Consumers Pattern",
    coreIdea: "Run many consumer instances reading from one queue so each message is processed exactly once and load self-balances.",
    explanation:
      "Multiple workers pull from the same queue, and the broker hands each message to exactly one consumer, so adding consumers increases throughput linearly until the queue drains. Load balances naturally: busy workers pull fewer messages while idle ones pull more, with no central dispatcher. You scale the consumer count based on queue depth, growing it when backlog rises and shrinking it when the queue empties. Because there is no ordering guarantee across consumers, the pattern suits independent, idempotent work. Reliability comes from visibility timeouts and explicit acknowledgement: if a worker crashes mid-message, the message becomes visible again for another consumer.",
    svg: SVG_COMPETING,
    caption: "Many workers compete for messages on one queue; consumer count scales with queue depth.",
    cloud: {
      aws: ["SQS — shared queue", "Lambda / ECS tasks — consumers", "CloudWatch — scale on queue depth"],
      gcp: ["Pub/Sub — shared subscription", "Cloud Run / Functions — subscribers", "Autoscaling on backlog"],
      azure: ["Service Bus queue", "Azure Functions — consumers", "Scale controller on queue length"],
    },
    whenToUse: [
      "Work items are independent and can be processed in any order.",
      "Throughput must scale horizontally by adding workers.",
      "You want automatic load balancing without a central dispatcher.",
    ],
    failureModes: [
      { name: "Poison-pill message", detail: "A malformed message repeatedly crashes whichever consumer picks it up. Detect with redelivery-count limits routing to a dead-letter queue." },
      { name: "No ordering guarantee", detail: "Related messages process out of order across consumers. Detect by validating ordering assumptions; use partition keys if order matters." },
      { name: "Lost in-flight message", detail: "A consumer crash before ack can drop or duplicate work. Detect with visibility-timeout tuning and at-least-once idempotency." },
    ],
    benefits: ["Linear horizontal scaling", "Self-balancing load", "Built-in retry via redelivery"],
    costs: ["No cross-message ordering", "Requires idempotent processing", "Poison pills need DLQ handling"],
    related: ["serverless", "bulkhead", "retry-backoff"],
  },
  {
    id: "durable-execution", num: 13, part: "p3", title: "Durable Execution Pattern",
    coreIdea: "Run long-lived workflows that checkpoint their state automatically, so a crash resumes from the last checkpoint instead of restarting.",
    explanation:
      "A durable execution engine records each completed step so that if a worker or the infrastructure crashes, the workflow resumes exactly where it left off rather than from the beginning. This makes it safe to write multi-step processes that sleep for days, wait on human approval, or call flaky services, with exactly-once semantics for each step. The engine handles retries, timers, and state persistence transparently, so the code reads like a straightforward sequence even though it may span weeks. A signup drip is a good example: send a welcome email, wait three days, send a follow-up, wait for activation, then expire the trial. The model trades some infrastructure complexity for workflows that are genuinely crash-proof.",
    svg: SVG_DURABLE,
    caption: "A crash at step 3 resumes from its checkpoint, reading durable state rather than starting over.",
    cloud: {
      aws: ["Step Functions — checkpointed state", "Lambda — step activities", "EventBridge Scheduler — timers"],
      gcp: ["Workflows — durable execution", "Cloud Tasks — scheduling", "Cloud Functions — steps"],
      azure: ["Durable Functions — auto checkpointing", "Storage — state store", "Timers/entities — long waits"],
    },
    whenToUse: [
      "Workflows run for hours, days, or weeks and must survive restarts.",
      "Steps include human approvals or long sleeps between actions.",
      "You need exactly-once step semantics without hand-rolling state machines.",
    ],
    failureModes: [
      { name: "Non-deterministic code", detail: "Replay-based engines break if step logic isn't deterministic. Detect with engine determinism checks and avoid direct clock/random calls." },
      { name: "Stuck workflows", detail: "A step waits forever on an event that never arrives. Detect with timeouts and stalled-instance dashboards." },
      { name: "Version skew on in-flight runs", detail: "Deploying new workflow code breaks running instances. Detect with versioned definitions and migration tests." },
    ],
    benefits: ["Crash-proof, resumable workflows", "Exactly-once step semantics", "Natural long-running orchestration"],
    costs: ["Determinism constraints on code", "Engine lock-in & learning curve", "Versioning in-flight runs is tricky"],
    related: ["saga", "serverless", "fan-out-in"],
  },

  /* ---------------- PART 4 ---------------- */
  {
    id: "circuit-breaker", num: 14, part: "p4", title: "Circuit Breaker Pattern",
    coreIdea: "Stop calling a failing dependency by tripping a breaker that fails fast and returns a fallback until the dependency recovers.",
    explanation:
      "The breaker tracks failures and moves between three states: Closed (calls pass through normally), Open (the dependency is failing, so reject calls immediately), and Half-Open (let one probe through to test recovery). It opens after a threshold like N failures within M seconds, then after a cooldown T it goes half-open to probe; success closes it, failure reopens it. While open, callers get an instant fallback instead of waiting on doomed timeouts, which prevents one slow dependency from cascading into a system-wide pile-up. The payment example is illustrative: when the payment service is down, the breaker opens and checkout offers 'pay later' instead of hanging for 30 seconds. The key tuning challenge is picking thresholds that react fast without flapping.",
    svg: SVG_CIRCUIT,
    caption: "Closed → Open on repeated failures; Half-Open probes recovery before fully closing again.",
    cloud: {
      aws: ["App Mesh — circuit breaking", "Lambda — custom breaker logic", "API Gateway + authorizer breaker"],
      gcp: ["Cloud Service Mesh — circuit breaking", "Traffic Director — outlier policies", "GKE Istio config"],
      azure: ["API Management — circuit-breaker policy", "Dapr — resiliency policies", "AKS Istio config"],
    },
    whenToUse: [
      "A downstream dependency can fail and you don't want callers to hang on timeouts.",
      "You can provide a sensible fallback or degraded response when it's unavailable.",
      "Cascading failures from one slow service threaten the whole system.",
    ],
    failureModes: [
      { name: "Flapping", detail: "Thresholds too tight cause the breaker to open/close rapidly. Detect with state-transition rate metrics and tune cooldowns." },
      { name: "Stale-open breaker", detail: "It stays open after the dependency recovers, blocking good traffic. Detect with probe-success vs open-duration monitoring." },
      { name: "Bad fallback", detail: "The fallback returns wrong or stale data users act on. Detect by tracking fallback-served rate and downstream correctness." },
    ],
    benefits: ["Prevents cascading failures", "Fast-fail instead of hanging", "Gives dependencies room to recover"],
    costs: ["Threshold tuning is fiddly", "Fallback logic to design & test", "Can mask underlying problems"],
    related: ["bulkhead", "retry-backoff", "ambassador"],
  },
  {
    id: "bulkhead", num: 15, part: "p4", title: "Bulkhead Pattern",
    coreIdea: "Partition resources so a failure or overload in one compartment can't drain capacity and sink the whole system.",
    explanation:
      "Named after a ship's watertight compartments, the bulkhead isolates workloads so flooding one doesn't sink the vessel. In software you give each tenant, feature, or workload its own thread pool, connection pool, or queue consumers, capping the blast radius of any single overload. The video-encoding example puts encoding jobs on a separate queue from thumbnail generation, so a flood of video work can't starve thumbnails. This trades some efficiency — partitioned resources can't be freely shared — for predictable isolation under stress. It pairs naturally with circuit breakers and rate limits to build defense in depth.",
    svg: SVG_BULKHEAD,
    caption: "With bulkheads one flooded compartment is contained; a shared pool lets one overload sink everything.",
    cloud: {
      aws: ["Separate SQS queues per workload", "Per-function Lambda concurrency limits", "Account-level isolation"],
      gcp: ["Separate Pub/Sub subscriptions", "Cloud Run concurrency limits", "Per-project quotas"],
      azure: ["Separate Service Bus queues", "Functions host concurrency limits", "Per-plan isolation"],
    },
    whenToUse: [
      "One noisy tenant or feature could exhaust resources shared by everyone.",
      "Different workloads have different criticality and must not interfere.",
      "You need predictable isolation under load spikes.",
    ],
    failureModes: [
      { name: "Under-sized partition", detail: "A compartment's fixed allocation is too small and throttles normal load. Detect with per-partition saturation and rejection metrics." },
      { name: "Wasted capacity", detail: "Idle partitions can't lend resources to a busy one, lowering utilization. Detect by comparing per-partition usage variance." },
      { name: "Mis-partitioning", detail: "Wrong boundaries put correlated load in one bulkhead. Detect by analyzing which workloads spike together." },
    ],
    benefits: ["Contains blast radius of failures", "Predictable isolation per workload", "Protects critical paths from noisy ones"],
    costs: ["Lower overall resource efficiency", "More pools/queues to size & operate", "Partition boundaries are hard to get right"],
    related: ["circuit-breaker", "throttling", "competing-consumers"],
  },
  {
    id: "retry-backoff", num: 16, part: "p4", title: "Retry with Exponential Backoff & Jitter",
    coreIdea: "Retry transient failures with exponentially increasing, randomized delays so clients recover without stampeding the recovering service.",
    explanation:
      "Many failures are transient, so retrying often succeeds — but naive retries can make things worse. Exponential backoff increases the wait between attempts (1s, 2s, 4s, 8s, 16s) to give the dependency time to recover. Jitter adds randomness to those delays so that thousands of clients that failed at the same instant don't all retry at the same moment and re-overwhelm the service in a thundering herd. You cap the number of retries and send permanent failures to a dead-letter queue rather than retrying forever. Without jitter, synchronized retries amplify load on an already-struggling service; with it, the retries spread out and the system drains gracefully.",
    svg: SVG_RETRY,
    caption: "Without jitter all clients retry at once; with jitter they spread out, atop an exponential backoff ladder.",
    cloud: {
      aws: ["SQS redrive policy + DLQ", "Lambda retry config", "SDK retry with built-in jitter"],
      gcp: ["Pub/Sub retry policy", "Cloud Tasks retry config", "Client-library backoff"],
      azure: ["Service Bus retry policy", "Azure Functions retry policy", "SDK retry with jitter"],
    },
    whenToUse: [
      "Failures are often transient (network blips, throttling, brief unavailability).",
      "Many clients may fail simultaneously and could create a retry storm.",
      "You want automatic recovery without manual intervention.",
    ],
    failureModes: [
      { name: "Thundering herd (no jitter)", detail: "Synchronized retries spike load right when the service is recovering. Detect with request-rate spikes correlated to error events." },
      { name: "Retrying non-idempotent ops", detail: "Retries duplicate side effects like double charges. Detect via idempotency keys and duplicate-action audits." },
      { name: "Retry budget exhaustion", detail: "Endless retries amplify load instead of failing fast. Detect with retry-count metrics and enforce caps + DLQ." },
    ],
    benefits: ["Automatic recovery from transients", "Jitter prevents retry storms", "DLQ captures permanent failures"],
    costs: ["Added latency from waits", "Requires idempotent operations", "Can amplify load if mis-tuned"],
    related: ["circuit-breaker", "throttling", "competing-consumers"],
  },
  {
    id: "throttling", num: 17, part: "p4", title: "Throttling & Rate Limiting Pattern",
    coreIdea: "Cap request rates per client, endpoint, or globally to protect services from being overwhelmed and to enforce fair usage.",
    explanation:
      "Rate limiting bounds how fast callers may consume a service, protecting it from overload and enforcing tier-based fairness. Common algorithms include the token bucket (tokens refill at a fixed rate and each request consumes one), leaky bucket, and fixed or sliding window counters; sliding windows avoid the burst-at-boundary problem of fixed windows. When a caller exceeds the limit, the service returns 429 Too Many Requests with a Retry-After header so well-behaved clients back off. You can apply a soft limit that slows callers or a hard limit that rejects them outright. A typical product setup gives the free tier 100 requests per minute and paid tiers 10,000, enforced at the gateway.",
    svg: SVG_THROTTLE,
    caption: "A token bucket refills at a fixed rate; an empty bucket returns 429. Fixed vs sliding windows compared.",
    cloud: {
      aws: ["API Gateway usage plans + keys", "WAF rate-based rules", "Lambda reserved concurrency"],
      gcp: ["Cloud Endpoints rate limits", "Apigee quota policies", "Cloud Armor rate limiting"],
      azure: ["API Management rate-limit policy", "Front Door rate-limiting rules", "App Gateway WAF limits"],
    },
    whenToUse: [
      "A service must be protected from overload or abusive callers.",
      "You sell tiered plans with different request allowances.",
      "Backpressure is needed to keep a downstream dependency healthy.",
    ],
    failureModes: [
      { name: "Burst at fixed-window boundary", detail: "Clients double their allowance across the window edge. Detect with per-second request distributions; use sliding windows." },
      { name: "Distributed counter drift", detail: "Per-node counters undercount global rate. Detect by comparing node sums to a central counter; use shared state." },
      { name: "No Retry-After guidance", detail: "Throttled clients retry immediately and keep failing. Detect via repeated 429s from the same client; emit Retry-After." },
    ],
    benefits: ["Protects services from overload", "Enforces fair, tiered usage", "Provides graceful backpressure"],
    costs: ["Algorithm/state complexity", "Risk of throttling legitimate traffic", "Distributed counting is hard"],
    related: ["bulkhead", "retry-backoff", "circuit-breaker"],
  },

  /* ---------------- PART 5 ---------------- */
  {
    id: "db-per-service", num: 18, part: "p5", title: "Database per Service Pattern",
    coreIdea: "Each microservice owns its own database and no other service may touch it directly, so services stay truly independent.",
    explanation:
      "Giving every service exclusive ownership of its data store means schemas can evolve, scale, and even use different database technologies without coordinating with other teams. Services never reach into each other's databases; they share data only through APIs, events, or materialized views. This enables polyglot persistence — a search service on Elasticsearch, a ledger on Postgres, a cache on Redis — chosen per workload. The cost is that operations spanning services become application-level joins or event-driven aggregation, and cross-service reporting needs a separate analytics path. The anti-pattern to avoid is the shared database, where many services couple tightly through one schema and lose all independence.",
    svg: SVG_DBPER,
    caption: "Each service owns its DB and shares only via API/events; the shared-DB anti-pattern couples everything.",
    cloud: {
      aws: ["Per-service RDS instance or DynamoDB table", "No cross-account DB access", "IAM-scoped data isolation"],
      gcp: ["Per-service Cloud SQL or Firestore", "Per-project data boundaries", "IAM-scoped access"],
      azure: ["Per-service Azure SQL or Cosmos DB account", "Per-service resource isolation", "RBAC-scoped access"],
    },
    whenToUse: [
      "Teams must evolve schemas and scale data independently.",
      "Different services genuinely need different database technologies.",
      "You want to prevent hidden coupling through a shared schema.",
    ],
    failureModes: [
      { name: "Cross-service join sprawl", detail: "Queries that need data from several services become chatty API fan-outs. Detect with N+1 call patterns and latency from composite reads." },
      { name: "Consistency across services", detail: "No single transaction spans services, so data can diverge. Detect with reconciliation checks; use sagas/events for consistency." },
      { name: "Hard cross-service reporting", detail: "Analytics needs data spread across many stores. Detect by the rise of ad-hoc data exports; build a dedicated warehouse." },
    ],
    benefits: ["Independent schema evolution & scaling", "Polyglot persistence per workload", "No hidden coupling via shared DB"],
    costs: ["Cross-service queries get complex", "Cross-service consistency is manual", "Reporting needs a separate pipeline"],
    related: ["event-driven", "cqrs", "strangler-fig"],
  },
  {
    id: "cqrs-read-replicas", num: 19, part: "p5", title: "CQRS + Read Replicas Pattern",
    coreIdea: "Serve commands from a write primary and queries from multiple purpose-built read stores, each kept in sync from the source of truth.",
    explanation:
      "This extends CQRS to the storage layer: writes go to a primary, and reads are served from replicas and specialized read stores tuned for distinct access patterns. You might keep Postgres for transactional writes, read replicas for OLTP reads, Elasticsearch for full-text search, Redis for hot session/cache reads, and a warehouse like BigQuery for analytics. Each read store is a projection kept current via change data capture or events flowing from the primary. The payoff is that every query type runs against a store optimized for it, instead of forcing one database to be good at everything. The trade-off is operating several stores and accepting replication lag between them.",
    svg: SVG_READREPLICA,
    caption: "Writes hit the primary; a CDC/event stream feeds replicas, search, cache, and warehouse read stores.",
    cloud: {
      aws: ["RDS primary + read replicas", "OpenSearch + ElastiCache", "Redshift — analytics"],
      gcp: ["Cloud Spanner — writes", "Firestore + Memorystore", "BigQuery — analytics"],
      azure: ["Azure SQL primary + read replicas", "Cognitive Search + Redis Cache", "Synapse — analytics"],
    },
    whenToUse: [
      "Different query types need fundamentally different store technologies.",
      "Read volume far exceeds write volume and must scale separately.",
      "You need full-text, caching, and analytics views off the same source data.",
    ],
    failureModes: [
      { name: "Replication lag", detail: "Read stores trail the primary, serving stale data. Detect with per-store lag metrics and staleness alarms." },
      { name: "Projection divergence", detail: "A failed CDC stream leaves a read store permanently wrong. Detect with periodic reconciliation against the primary." },
      { name: "Operational sprawl", detail: "Each added store multiplies ops burden and failure surface. Detect via incident attribution per store and on-call load." },
    ],
    benefits: ["Each query type on an optimal store", "Independent read scaling", "Search/cache/analytics off one source"],
    costs: ["Replication lag / staleness", "Many stores to operate", "Keeping projections in sync"],
    related: ["cqrs", "materialized-view", "event-sourcing"],
  },
  {
    id: "materialized-view", num: 20, part: "p5", title: "Materialized View Pattern",
    coreIdea: "Pre-compute the result of an expensive query into a stored table that's kept in sync, so reads are fast instead of recomputed each time.",
    explanation:
      "Rather than running a costly join or aggregation on every request, you compute it once and store the result as a materialized view that you read directly. The view is kept in sync via a refresh strategy: eager on every write, lazy on read when stale, scheduled every N minutes, or event-driven when source data changes. The product-listing example pre-joins item, price, inventory, and seller rating into one row so the page renders from a single fast read. This trades storage and refresh complexity for dramatically lower read latency and load on source tables. Choosing the refresh strategy is the core design decision, since it sets the staleness-versus-cost balance.",
    svg: SVG_MATVIEW,
    caption: "Source tables are pre-joined into a materialized view; the app reads the view directly and fast.",
    cloud: {
      aws: ["DynamoDB GSI — pre-computed views", "ElastiCache — cached views", "Redshift materialized views"],
      gcp: ["BigQuery materialized views", "Firestore denormalized documents", "Spanner materialized views"],
      azure: ["Cosmos DB denormalized containers", "Azure SQL indexed/materialized views", "Synapse materialized views"],
    },
    whenToUse: [
      "An expensive join or aggregation is read far more often than its sources change.",
      "Read latency is critical (listing pages, dashboards) and recomputation is too slow.",
      "You can tolerate some staleness in exchange for fast reads.",
    ],
    failureModes: [
      { name: "Stale view", detail: "Refresh lags behind source changes and reads return old data. Detect with view-age metrics versus source update timestamps." },
      { name: "Refresh storms", detail: "Eager refresh on every write overwhelms the system. Detect via refresh-rate spikes; switch to batched or scheduled refresh." },
      { name: "Drift from source", detail: "A missed refresh leaves the view subtly wrong. Detect with periodic checksum comparison against recomputed results." },
    ],
    benefits: ["Very fast reads", "Offloads expensive joins/aggregations", "Reduces load on source tables"],
    costs: ["Extra storage", "Refresh strategy complexity", "Staleness / drift to manage"],
    related: ["cqrs", "cqrs-read-replicas", "event-sourcing"],
  },

  /* ---------------- PART 6 ---------------- */
  {
    id: "blue-green", num: 21, part: "p6", title: "Blue/Green Deployment",
    coreIdea: "Keep two identical production environments and switch all traffic from the old (Blue) to the new (Green) in one atomic flip, with instant rollback.",
    explanation:
      "You run two full production stacks: Blue serves all traffic while you deploy and verify the new version on Green. When Green is ready, you flip the router so 100% of traffic moves to Green in a single atomic step, and if anything goes wrong you flip straight back to Blue. This gives near-instant rollback and avoids the partial-state risk of in-place upgrades. The costs are running double the infrastructure during the switch and ensuring database changes are compatible across both versions, since both may briefly read the same data. It's ideal when you need clean, all-or-nothing cutover with a fast escape hatch.",
    svg: SVG_BLUEGREEN,
    caption: "The load balancer sends 100% to Blue, then atomically switches to Green — with rollback back to Blue.",
    cloud: {
      aws: ["ALB target-group swap", "Route 53 weighted routing", "CodeDeploy / Beanstalk blue-green"],
      gcp: ["Cloud Run traffic split", "GKE service selector swap", "App Engine traffic migration"],
      azure: ["App Service deployment slots", "AKS ingress swap", "Traffic Manager routing"],
    },
    whenToUse: [
      "You need clean, all-or-nothing cutover with instant rollback.",
      "Downtime during deploys is unacceptable.",
      "You can afford to run two full environments briefly.",
    ],
    failureModes: [
      { name: "Incompatible DB migration", detail: "Schema changes break the version still reading the shared database. Detect with backward-compatible migration tests across both versions." },
      { name: "Cost of double infrastructure", detail: "Running two full stacks doubles spend during the window. Detect with cost-per-deploy tracking and tight switch windows." },
      { name: "Stale connections after switch", detail: "Long-lived connections linger on the old stack. Detect with connection-drain metrics and enforce draining before teardown." },
    ],
    benefits: ["Near-instant rollback", "Zero-downtime cutover", "Full verification before switch"],
    costs: ["Double infrastructure cost", "DB migration compatibility burden", "All-or-nothing (no gradual exposure)"],
    related: ["canary", "feature-flags", "service-mesh"],
  },
  {
    id: "canary", num: 22, part: "p6", title: "Canary Deployment",
    coreIdea: "Shift traffic to a new version gradually (1% → 5% → 25% → 100%), watching metrics at each stage and rolling back automatically if they regress.",
    explanation:
      "Instead of an instant flip, a canary exposes the new version to a small slice of real traffic first, then increases the percentage as confidence grows. At each stage you compare error rate and latency between versions, and if the new one breaches thresholds you halt and roll back automatically. Real canary users — a chosen segment — hit the new version while everyone else stays on the stable build. This catches problems that only appear under production traffic while limiting their blast radius. The difference from blue/green is gradual versus instant: canary trades a slower, more cautious rollout for much smaller exposure to a bad release.",
    svg: SVG_CANARY,
    caption: "95% stays on stable v1 while 5% canaries v2; metrics gate each increase in traffic share.",
    cloud: {
      aws: ["CodeDeploy canary + Lambda weighted aliases", "API Gateway canary releases", "CloudWatch alarms — auto-rollback"],
      gcp: ["Cloud Run gradual migration", "GKE with Flagger", "Anthos progressive delivery"],
      azure: ["App Service slots with % routing", "Deployment Manager health checks", "Front Door weighted routing"],
    },
    whenToUse: [
      "You want to catch production-only issues before full rollout.",
      "Blast radius of a bad release must stay small.",
      "You have good metrics to gate progression automatically.",
    ],
    failureModes: [
      { name: "Insensitive metrics", detail: "Thresholds miss a real regression and the canary promotes anyway. Detect with statistically sound comparison and guardrail metrics." },
      { name: "Low-traffic canary", detail: "Too little traffic to detect issues at small percentages. Detect by checking sample size before each promotion." },
      { name: "Long-lived dual versions", detail: "A stalled rollout leaves two versions running indefinitely. Detect with rollout-duration alerts and automatic timeouts." },
    ],
    benefits: ["Small blast radius for bad releases", "Catches production-only problems", "Automated metric-gated rollout"],
    costs: ["Slower than instant cutover", "Needs strong metrics & automation", "Two versions coexist during rollout"],
    related: ["blue-green", "feature-flags", "service-mesh"],
  },
  {
    id: "feature-flags", num: 23, part: "p6", title: "Feature Flags Pattern",
    coreIdea: "Decouple deploy from release: ship code with features turned off, then enable them via config without redeploying.",
    explanation:
      "A feature flag is a runtime switch evaluated by a flag service, so you can deploy code with a feature dark and turn it on later for specific users, tiers, or percentages without a new deployment. Flags come in flavors: short-lived release flags, experiment flags for A/B tests, ops flags that act as kill switches, and permission flags gating access by user or plan. This enables trunk-based development, dark launches, gradual rollouts, and instant kill switches when something misbehaves. The risk is flag debt: temporary flags that are never removed accumulate, their interactions multiply the testing matrix, and stale flags become a source of confusion. Disciplined cleanup is essential to keep the benefit.",
    svg: SVG_FLAGS,
    caption: "Code deploys with the flag off; the flag service evaluates rules so segments get different experiences.",
    cloud: {
      aws: ["AppConfig feature flags", "CloudWatch Evidently — A/B testing", "Parameter Store config"],
      gcp: ["Firebase Remote Config", "Cloud Deploy with flags", "App Config management"],
      azure: ["App Configuration feature management", "Split.io / LaunchDarkly integration", "App Config filters"],
    },
    whenToUse: [
      "You want to release independently of deploy (dark launches, gradual rollout).",
      "You need an instant kill switch for a risky feature.",
      "You're running A/B experiments or per-tier gating.",
    ],
    failureModes: [
      { name: "Flag debt", detail: "Temporary flags are never removed and clutter the codebase. Detect with flag-age reports and enforce cleanup deadlines." },
      { name: "Flag interaction bugs", detail: "Combinations of flags produce untested states. Detect by tracking active-flag combinations and targeted testing." },
      { name: "Flag-service outage", detail: "If evaluation fails, behavior is undefined. Detect with flag-service health checks and safe default fallbacks." },
    ],
    benefits: ["Deploy decoupled from release", "Instant kill switch & rollback", "Enables trunk-based dev and A/B"],
    costs: ["Flag debt accumulates", "Testing-matrix explosion", "Dependency on flag-service availability"],
    related: ["canary", "blue-green", "circuit-breaker"],
  },
  {
    id: "service-mesh", num: 24, part: "p6", title: "Sidecar Service Mesh Pattern",
    coreIdea: "Inject a proxy sidecar into every service pod and let the mesh handle mTLS, retries, traffic shaping, and observability — so apps write no networking code.",
    explanation:
      "A service mesh deploys an Envoy or Linkerd proxy alongside every service, and all service-to-service traffic flows through these sidecars rather than directly. The mesh of proxies handles mutual TLS, retries, circuit breaking, load balancing, traffic shaping, and distributed tracing uniformly, so developers ship business logic with zero networking plumbing. A central control plane (such as Istiod) configures every sidecar, while the data plane — the sidecars themselves — carries the actual traffic and emits telemetry. This gives consistent, centrally governed networking behavior across a polyglot fleet. The cost is operational: the mesh adds latency per hop, significant complexity, and a control plane that becomes critical infrastructure.",
    svg: SVG_MESH,
    caption: "Every pod has an app + proxy; traffic flows through sidecars, configured centrally and emitting telemetry.",
    cloud: {
      aws: ["App Mesh with Envoy sidecars", "ECS service mesh", "X-Ray — mesh tracing"],
      gcp: ["Anthos Service Mesh / Istio on GKE", "Traffic Director — control plane", "Cloud Trace integration"],
      azure: ["Istio add-on for AKS", "Linkerd on AKS / Open Service Mesh", "Azure Monitor — mesh telemetry"],
    },
    whenToUse: [
      "Many polyglot services need uniform mTLS, retries, and traffic policy.",
      "You want networking concerns governed centrally, not coded per service.",
      "Deep observability of service-to-service traffic is a requirement.",
    ],
    failureModes: [
      { name: "Control-plane outage", detail: "If the control plane can't push config, the mesh degrades. Detect with control-plane health and config-propagation metrics." },
      { name: "Per-hop latency tax", detail: "Every call traverses two proxies, adding tail latency. Detect by comparing direct vs meshed call timing." },
      { name: "Configuration complexity", detail: "Misapplied traffic rules silently break routing. Detect with config validation, canarying mesh changes, and policy linting." },
    ],
    benefits: ["Zero networking code in apps", "Uniform mTLS, retries, tracing", "Centralized traffic governance"],
    costs: ["Added per-hop latency", "Significant operational complexity", "Control plane is critical infra"],
    related: ["sidecar", "circuit-breaker", "canary"],
  },
];

/* ============================ UI COMPONENT ============================== */
const partOf = (id) => PARTS.find((p) => p.id === id);
const patternById = (id) => PATTERNS.find((p) => p.id === id);
const AWS = "#FF9900", GCP = "#4285F4", AZURE = "#0078D4";

export default function App() {
  const [selectedId, setSelectedId] = useState(PATTERNS[0].id);
  const [readPatterns, setReadPatterns] = useState(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(() => new Set());
  const contentRef = useRef(null);

  const selected = patternById(selectedId);
  const flatIndex = PATTERNS.findIndex((p) => p.id === selectedId);
  const prev = flatIndex > 0 ? PATTERNS[flatIndex - 1] : null;
  const next = flatIndex < PATTERNS.length - 1 ? PATTERNS[flatIndex + 1] : null;

  const goTo = (id) => {
    setSelectedId(id);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };
  const toggleRead = (id) => {
    setReadPatterns((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const togglePart = (pid) => {
    setCollapsed((s) => {
      const n = new Set(s);
      n.has(pid) ? n.delete(pid) : n.add(pid);
      return n;
    });
  };

  const q = searchQuery.trim().toLowerCase();
  const matches = (p) => !q || p.title.toLowerCase().includes(q);
  const isRead = readPatterns.has(selectedId);
  const part = partOf(selected.part);

  return (
    <div style={S.app}>
      <style>{CSS}</style>

      {/* ---------------- Sidebar ---------------- */}
      <aside style={S.sidebar} className="cap-sidebar">
        <div style={S.brand}>
          <div style={S.brandTitle}>Cloud Architecture Patterns</div>
          <div style={S.brandSub}>The Complete Visual Guide</div>
        </div>

        <div style={S.progressWrap}>
          <div style={S.progressTop}>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{readPatterns.size} / {PATTERNS.length}</span>
            <span style={{ color: "#64748b" }}>patterns learned</span>
          </div>
          <div style={S.progressTrack}>
            <div style={{ ...S.progressBar, width: `${(readPatterns.size / PATTERNS.length) * 100}%` }} />
          </div>
        </div>

        <input
          className="cap-search"
          style={S.search}
          placeholder="Search patterns…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <nav style={S.nav}>
          {PARTS.map((pt) => {
            const chapters = PATTERNS.filter((p) => p.part === pt.id && matches(p));
            if (q && chapters.length === 0) return null;
            const isCollapsed = collapsed.has(pt.id) && !q;
            return (
              <div key={pt.id} style={{ marginBottom: 4 }}>
                <button className="cap-partbtn" style={S.partBtn} onClick={() => togglePart(pt.id)}>
                  <span style={{ ...S.partDot, background: pt.color }} />
                  <span style={S.partName}>{pt.short}</span>
                  <span style={{ ...S.chevron, transform: isCollapsed ? "rotate(-90deg)" : "none" }}>▾</span>
                </button>
                {!isCollapsed && chapters.map((p) => {
                  const active = p.id === selectedId;
                  const done = readPatterns.has(p.id);
                  return (
                    <button
                      key={p.id}
                      className="cap-chapter"
                      style={{
                        ...S.chapterBtn,
                        borderLeftColor: active ? pt.color : "transparent",
                        background: active ? pt.tint : "transparent",
                        color: active ? "#0f172a" : "#475569",
                        fontWeight: active ? 600 : 400,
                      }}
                      data-concept-id={p.id}
                      onClick={() => goTo(p.id)}
                    >
                      <span style={S.chapNum}>{p.num}</span>
                      <span style={S.chapTitle}>{p.title.replace(/ Pattern$/, "")}</span>
                      {done && <span style={{ color: pt.color, fontSize: 12 }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {q && PATTERNS.filter(matches).length === 0 && (
            <div style={S.noResults}>No patterns match “{searchQuery}”.</div>
          )}
        </nav>
      </aside>

      {/* ---------------- Content ---------------- */}
      <main ref={contentRef} style={S.main} className="cap-main">
        <div style={S.contentWrap}>
          {/* header */}
          <div style={{ position: "relative" }}>
            <div style={S.bigNum}>{String(selected.num).padStart(2, "0")}</div>
            <span style={{ ...S.partPill, background: part.tint, color: part.color }}>
              <span style={{ ...S.pillDot, background: part.color }} /> Part {part.id.slice(1)} · {part.name}
            </span>
            <h1 style={S.h1}>{selected.title}</h1>
            <div style={S.coreIdea}>
              <span style={S.coreLabel}>The core idea</span>
              {selected.coreIdea}
            </div>
          </div>

          {/* explanation */}
          <section style={S.section}>
            <h2 style={S.h2}>The pattern explained</h2>
            <p style={S.prose}>{selected.explanation}</p>
          </section>

          {/* diagram */}
          <section style={S.section}>
            <h2 style={S.h2}>Data flow</h2>
            <figure style={S.svgCard}>
              <div style={S.svgInner}>{selected.svg}</div>
              <figcaption style={S.caption}>{selected.caption}</figcaption>
            </figure>
          </section>

          {/* cloud mapping */}
          <section style={S.section}>
            <h2 style={S.h2}>Cloud service mapping</h2>
            <div style={S.cloudCard}>
              <div style={S.cloudGrid}>
                {[
                  { name: "AWS", color: AWS, items: selected.cloud.aws },
                  { name: "GCP", color: GCP, items: selected.cloud.gcp },
                  { name: "Azure", color: AZURE, items: selected.cloud.azure },
                ].map((col) => (
                  <div key={col.name} style={S.cloudCol}>
                    <div style={{ ...S.cloudBadge, background: col.color }}>{col.name}</div>
                    <ul style={S.cloudList}>
                      {col.items.map((it, i) => {
                        const [svc, ...role] = it.split(" — ");
                        return (
                          <li key={i} style={S.cloudItem}>
                            <span style={{ fontWeight: 600, color: "#0f172a" }}>{svc}</span>
                            {role.length > 0 && <span style={S.cloudRole}>{role.join(" — ")}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* when to use */}
          <section style={S.section}>
            <div style={S.calloutBlue}>
              <div style={{ ...S.calloutHead, color: "#1d4ed8" }}>When to use</div>
              <ul style={S.calloutList}>
                {selected.whenToUse.map((w, i) => (
                  <li key={i} style={S.calloutLi}><span style={{ color: "#3b82f6", marginRight: 8 }}>→</span>{w}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* failure modes */}
          <section style={S.section}>
            <div style={S.calloutRed}>
              <div style={{ ...S.calloutHead, color: "#b91c1c" }}>Failure modes in production</div>
              <ul style={S.calloutList}>
                {selected.failureModes.map((f, i) => (
                  <li key={i} style={{ ...S.calloutLi, display: "block", marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, color: "#991b1b" }}>{f.name}.</span>{" "}
                    <span style={{ color: "#7f1d1d" }}>{f.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* trade-offs */}
          <section style={S.section}>
            <h2 style={S.h2}>Trade-offs</h2>
            <div style={S.tradeGrid}>
              <div style={S.tradeBenefit}>
                <div style={{ ...S.tradeHead, color: "#047857" }}>Benefits</div>
                {selected.benefits.map((b, i) => (
                  <div key={i} style={S.tradeItem}><span style={{ color: "#10b981", fontWeight: 700 }}>✓</span> {b}</div>
                ))}
              </div>
              <div style={S.tradeCost}>
                <div style={{ ...S.tradeHead, color: "#b91c1c" }}>Costs & downsides</div>
                {selected.costs.map((c, i) => (
                  <div key={i} style={S.tradeItem}><span style={{ color: "#ef4444", fontWeight: 700 }}>✕</span> {c}</div>
                ))}
              </div>
            </div>
          </section>

          {/* related */}
          <section style={S.section}>
            <h2 style={S.h2}>Related patterns</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {selected.related.map((rid) => {
                const r = patternById(rid);
                if (!r) return null;
                const rp = partOf(r.part);
                return (
                  <button
                    key={rid}
                    className="cap-relpill"
                    style={{ ...S.relPill, borderColor: rp.color, color: rp.color }}
                    onClick={() => goTo(rid)}
                  >
                    {r.title.replace(/ Pattern$/, "")}
                  </button>
                );
              })}
            </div>
          </section>

          {/* mark learned */}
          <button
            className="cap-learn"
            style={{
              ...S.learnBtn,
              background: isRead ? "#ecfdf5" : "#0f172a",
              color: isRead ? "#047857" : "#fff",
              borderColor: isRead ? "#10b981" : "#0f172a",
            }}
            onClick={() => toggleRead(selectedId)}
          >
            {isRead ? "✓ Learned — click to unmark" : "Mark this pattern as learned"}
          </button>

          {/* prev / next */}
          <div style={S.pager}>
            <button
              className="cap-pager"
              style={{ ...S.pagerBtn, opacity: prev ? 1 : 0.4, cursor: prev ? "pointer" : "default" }}
              onClick={() => prev && goTo(prev.id)}
              disabled={!prev}
            >
              <span style={S.pagerDir}>← Previous</span>
              <span style={S.pagerTitle}>{prev ? prev.title.replace(/ Pattern$/, "") : "—"}</span>
            </button>
            <button
              className="cap-pager"
              style={{ ...S.pagerBtn, textAlign: "right", opacity: next ? 1 : 0.4, cursor: next ? "pointer" : "default" }}
              onClick={() => next && goTo(next.id)}
              disabled={!next}
            >
              <span style={S.pagerDir}>Next →</span>
              <span style={S.pagerTitle}>{next ? next.title.replace(/ Pattern$/, "") : "—"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =============================== STYLES ================================= */
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const S = {
  app: { display: "flex", height: "100vh", width: "100%", fontFamily: FONT, color: "#0f172a", background: "#fff", overflow: "hidden", fontSize: 15 },

  sidebar: { width: 260, minWidth: 260, borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", background: "#fcfcfd", overflowY: "auto" },
  brand: { padding: "18px 18px 12px", borderBottom: "1px solid #eef2f6" },
  brandTitle: { fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.25 },
  brandSub: { fontSize: 11.5, color: "#94a3b8", marginTop: 3, letterSpacing: "0.02em", textTransform: "uppercase" },

  progressWrap: { padding: "12px 18px" },
  progressTop: { display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 7 },
  progressTrack: { height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" },
  progressBar: { height: "100%", background: "linear-gradient(90deg,#6366f1,#0ea5e9)", borderRadius: 99, transition: "width .4s ease" },

  search: { margin: "0 18px 12px", padding: "8px 11px", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", fontFamily: FONT },

  nav: { padding: "0 10px 24px", flex: 1 },
  partBtn: { width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", border: "none", background: "transparent", cursor: "pointer", borderRadius: 7, fontSize: 12.5, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.03em" },
  partDot: { width: 8, height: 8, borderRadius: 99, flexShrink: 0 },
  partName: { flex: 1, textAlign: "left" },
  chevron: { fontSize: 10, color: "#94a3b8", transition: "transform .2s" },

  chapterBtn: { width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "7px 9px 7px 12px", border: "none", borderLeft: "3px solid transparent", background: "transparent", cursor: "pointer", borderRadius: "0 7px 7px 0", fontSize: 13, textAlign: "left", marginBottom: 1, fontFamily: FONT },
  chapNum: { fontSize: 10.5, color: "#94a3b8", width: 16, textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" },
  chapTitle: { flex: 1, lineHeight: 1.3 },
  noResults: { padding: "16px 12px", fontSize: 13, color: "#94a3b8" },

  main: { flex: 1, overflowY: "auto", background: "#fff" },
  contentWrap: { maxWidth: 760, margin: "0 auto", padding: "52px 32px 96px" },

  bigNum: { position: "absolute", top: -34, right: -6, fontSize: 80, fontWeight: 900, color: "#0f172a", opacity: 0.05, lineHeight: 1, pointerEvents: "none", letterSpacing: "-0.04em" },
  partPill: { display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, letterSpacing: "0.01em" },
  pillDot: { width: 7, height: 7, borderRadius: 99 },
  h1: { fontSize: 36, fontWeight: 800, letterSpacing: "-0.025em", margin: "16px 0 0", lineHeight: 1.12 },
  coreIdea: { marginTop: 18, padding: "14px 16px", background: "#f8fafc", border: "1px solid #eef2f6", borderRadius: 10, fontSize: 15.5, lineHeight: 1.65, color: "#334155" },
  coreLabel: { display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", marginBottom: 5 },

  section: { marginTop: 38 },
  h2: { fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", margin: "0 0 14px", paddingBottom: 8, borderBottom: "1px solid #f1f5f9" },
  prose: { fontSize: 16, lineHeight: 1.8, color: "#1e293b", margin: 0 },

  svgCard: { border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#fff" },
  svgInner: { padding: "18px 18px 6px", background: "linear-gradient(180deg,#fcfdff,#f8fafc)" },
  caption: { fontSize: 12.5, color: "#64748b", padding: "10px 18px", borderTop: "1px solid #f1f5f9", margin: 0, lineHeight: 1.5 },

  cloudCard: { border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" },
  cloudGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr" },
  cloudCol: { borderRight: "1px solid #f1f5f9", padding: "0 0 14px" },
  cloudBadge: { color: "#fff", fontSize: 12, fontWeight: 800, padding: "8px 0", textAlign: "center", letterSpacing: "0.04em" },
  cloudList: { listStyle: "none", margin: 0, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 },
  cloudItem: { fontSize: 12.5, lineHeight: 1.4, display: "flex", flexDirection: "column", gap: 2 },
  cloudRole: { color: "#64748b", fontSize: 11.5 },

  calloutBlue: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px 18px" },
  calloutRed: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 18px" },
  calloutHead: { fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 },
  calloutList: { listStyle: "none", margin: 0, padding: 0 },
  calloutLi: { fontSize: 15, lineHeight: 1.6, color: "#1e293b", marginBottom: 8, display: "flex" },

  tradeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  tradeBenefit: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 16px" },
  tradeCost: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 16px" },
  tradeHead: { fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 },
  tradeItem: { fontSize: 14, lineHeight: 1.5, color: "#1e293b", marginBottom: 9, display: "flex", gap: 9, alignItems: "flex-start" },

  relPill: { padding: "7px 14px", borderRadius: 99, border: "1.5px solid", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT, transition: "all .15s" },

  learnBtn: { marginTop: 40, width: "100%", padding: "13px", borderRadius: 10, border: "1.5px solid", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT, transition: "all .15s" },

  pager: { marginTop: 24, display: "flex", gap: 12, borderTop: "1px solid #f1f5f9", paddingTop: 24 },
  pagerBtn: { flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", fontFamily: FONT },
  pagerDir: { fontSize: 11.5, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },
  pagerTitle: { fontSize: 14, fontWeight: 600, color: "#0f172a" },
};

const CSS = `
* { box-sizing: border-box; }
.cap-search:focus { border-color:#818cf8; box-shadow:0 0 0 3px rgba(129,140,248,.15); }
.cap-partbtn:hover { background:#f1f5f9 !important; }
.cap-chapter:hover { background:#f8fafc; }
.cap-relpill:hover { background:#f8fafc; transform:translateY(-1px); }
.cap-learn:hover { filter:brightness(.96); }
.cap-pager:hover:not(:disabled) { border-color:#cbd5e1; background:#fafbfc; }
.cap-main::-webkit-scrollbar, .cap-sidebar::-webkit-scrollbar { width:9px; }
.cap-main::-webkit-scrollbar-thumb, .cap-sidebar::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:99px; }
.cap-main::-webkit-scrollbar-thumb:hover, .cap-sidebar::-webkit-scrollbar-thumb:hover { background:#cbd5e1; }
@media (max-width:820px){
  .cap-sidebar { width:200px !important; min-width:200px !important; }
}
`;
