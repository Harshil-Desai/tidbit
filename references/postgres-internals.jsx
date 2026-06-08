import React, { useState, useRef } from "react";

/* ============================================================
   Database Internals — How Postgres Actually Works
   Fully self-contained interactive encyclopedia.
   All content, diagrams and explanations are hardcoded.
   ============================================================ */

const PARTS = [
  { id: 0, name: "The Big Picture", color: "#64748b" }, // slate
  { id: 1, name: "Storage", color: "#3b82f6" }, // blue
  { id: 2, name: "Transactions & Concurrency", color: "#8b5cf6" }, // purple
  { id: 3, name: "Durability", color: "#f59e0b" }, // amber
  { id: 4, name: "Memory", color: "#0ea5e9" }, // teal/sky
  { id: 5, name: "The Query Planner", color: "#6366f1" }, // indigo
  { id: 6, name: "Maintenance", color: "#10b981" }, // green
  { id: 7, name: "Advanced Internals", color: "#f43f5e" }, // rose
];

const PART_LABEL = [
  "Part 0 · Big Picture",
  "Part 1 · Storage",
  "Part 2 · Transactions",
  "Part 3 · Durability",
  "Part 4 · Memory",
  "Part 5 · Query Planner",
  "Part 6 · Maintenance",
  "Part 7 · Advanced",
];

/* ---------- inline monospace code chip ---------- */
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const codeStyle = {
  fontFamily: MONO,
  background: "#f1f5f9",
  padding: "1px 4px",
  borderRadius: 3,
  fontSize: "0.88em",
  color: "#0f172a",
};
function C({ children }) {
  return <code style={codeStyle}>{children}</code>;
}

/* ---------- tiny SQL syntax highlighter for dark code blocks ---------- */
const SQL_KEYWORDS = new Set(
  ("select from where and or not null insert into values update set delete create index unique on table explain analyze buffers verbose format json order by group having limit offset join left right inner outer full cross using as distinct count sum avg max min coalesce nullif vacuum freeze reindex concurrently begin commit rollback for share key no update lock in is like ilike desc asc with case when then else end extension returning interval now extract drop alter add show reset to load isolation level repeatable read committed serializable between cardinality default current_database current_user pg_size_pretty true false")
    .split(" ")
);

function highlightSQL(code) {
  const lines = code.split("\n");
  return lines.map((line, li) => {
    let codePart = line;
    let comment = null;
    const ci = line.indexOf("--");
    if (ci >= 0) {
      codePart = line.slice(0, ci);
      comment = line.slice(ci);
    }
    const tokens = codePart.split(/(\s+|[(),.;=<>!|@:]+)/);
    const els = tokens.map((tok, ti) => {
      if (tok === "" ) return null;
      if (/^\s+$/.test(tok) || /^[(),.;=<>!|@:]+$/.test(tok)) return tok;
      if (/^'[^']*'$/.test(tok)) return <span key={ti} style={{ color: "#ce9178" }}>{tok}</span>;
      if (/^-?\d+(\.\d+)?$/.test(tok)) return <span key={ti} style={{ color: "#b5cea8" }}>{tok}</span>;
      if (SQL_KEYWORDS.has(tok.toLowerCase())) return <span key={ti} style={{ color: "#569cd6" }}>{tok}</span>;
      if (/^pg_[a-z_]+$/i.test(tok) || /_(lsn|xid|tup|stat)/i.test(tok)) return <span key={ti} style={{ color: "#4ec9b0" }}>{tok}</span>;
      return tok;
    });
    return (
      <div key={li}>
        {els}
        {comment && <span style={{ color: "#6a9955" }}>{comment}</span>}
        {line === "" ? "\u00a0" : null}
      </div>
    );
  });
}

function CodeBlock({ children }) {
  return (
    <pre
      style={{
        background: "#1e1e1e",
        color: "#d4d4d4",
        padding: "13px 15px",
        borderRadius: 8,
        overflowX: "auto",
        fontSize: 12.5,
        lineHeight: 1.65,
        fontFamily: MONO,
        margin: "10px 0 0",
      }}
    >
      {highlightSQL(children)}
    </pre>
  );
}

/* SVG palette helpers (per the spec color coding) */
const COL = {
  heap: "#3b82f6",
  heapSoft: "#dbeafe",
  index: "#8b5cf6",
  indexSoft: "#ede9fe",
  wal: "#f59e0b",
  walSoft: "#fef3c7",
  mem: "#0ea5e9",
  memSoft: "#e0f2fe",
  dead: "#ef4444",
  deadSoft: "#fee2e2",
  good: "#10b981",
  goodSoft: "#d1fae5",
  proc: "#64748b",
  procSoft: "#e2e8f0",
  ink: "#0f172a",
  line: "#94a3b8",
};

const CHAPTERS = [
/* ============ CHAPTER 1 ============ */
{
  id: 1, part: 0,
  title: "How a Query Travels Through Postgres",
  core: "A SQL string is parsed into a tree, rewritten, costed into a plan, then run by the executor against the storage engine — each stage hands a different artifact to the next.",
  explanation: (<>
    When a client sends a SQL string over a connection, the dedicated <C>backend</C> process for that session runs it through a strict pipeline. The <b>parser</b> first does a raw grammar parse producing a raw parse tree, then semantic analysis resolves table and column names against catalogs like <C>pg_class</C> and <C>pg_attribute</C>, producing a <C>Query</C> node tree. The <b>rewriter</b> applies the rule system — most importantly expanding views into their underlying queries and applying row-level security policies. The <b>planner/optimizer</b> then enumerates equivalent execution strategies, costs each using statistics from <C>pg_statistic</C>, and emits a single <C>PlannedStmt</C> tree of plan nodes. The <b>executor</b> walks that tree using a demand-pull (Volcano) model: each node asks its children for one tuple at a time. The bottom nodes are scans that ask the storage engine — the heap and indexes through the buffer manager — for physical tuples, and rows flow up the tree until the top node ships them back to the client.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Query pipeline">
      {[
        { x: 8, label: "Client", sub: "SQL text", c: COL.proc },
        { x: 110, label: "Parser", sub: "→ parse tree", c: COL.heap },
        { x: 212, label: "Rewriter", sub: "→ Query tree", c: COL.index },
        { x: 314, label: "Planner", sub: "→ PlannedStmt", c: COL.wal },
        { x: 416, label: "Executor", sub: "→ tuples", c: COL.good },
        { x: 518, label: "Storage", sub: "heap+index", c: COL.mem },
      ].map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={120} width={92} height={60} rx={8} fill="#fff" stroke={s.c} strokeWidth={2} />
          <rect x={s.x} y={120} width={92} height={20} rx={8} fill={s.c} />
          <text x={s.x + 46} y={134} fontSize={11} fill="#fff" textAnchor="middle" fontWeight="700">{s.label}</text>
          <text x={s.x + 46} y={160} fontSize={9.5} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>{s.sub}</text>
        </g>
      ))}
      {[100, 202, 304, 406, 508].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={150} x2={x + 10} y2={150} stroke={COL.line} strokeWidth={2} markerEnd="url(#ah1)" />
        </g>
      ))}
      <defs>
        <marker id="ah1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={COL.line} />
        </marker>
      </defs>
      <text x={320} y={36} fontSize={13} fill={COL.ink} textAnchor="middle" fontWeight="700">Tracing: SELECT * FROM orders WHERE user_id = 42</text>
      <text x={54} y={210} fontSize={9} fill={COL.proc} textAnchor="middle">string</text>
      <text x={156} y={210} fontSize={9} fill={COL.heap} textAnchor="middle">RangeVar+Expr</text>
      <text x={258} y={210} fontSize={9} fill={COL.index} textAnchor="middle">views expanded</text>
      <text x={360} y={210} fontSize={9} fill={COL.wal} textAnchor="middle">IndexScan chosen</text>
      <text x={462} y={210} fontSize={9} fill={COL.good} textAnchor="middle">pull rows</text>
      <text x={564} y={210} fontSize={9} fill={COL.mem} textAnchor="middle">8KB pages</text>
      <rect x={8} y={250} width={602} height={48} rx={8} fill="#f8fafc" stroke="#e2e8f0" />
      <text x={20} y={270} fontSize={10.5} fill={COL.ink} fontFamily={MONO}>parse tree → rewritten Query → PlannedStmt(IndexScan on orders_user_id_idx)</text>
      <text x={20} y={288} fontSize={10.5} fill={COL.ink} fontFamily={MONO}>→ executor pulls ctid 42 from index → fetches heap tuple → returns row</text>
    </svg>
  ),
  caption: "Left-to-right pipeline: each subsystem consumes one artifact and produces the next.",
  failures: [
    { name: "Parse-error storms", symptom: "App latency spikes with bursts of \u201csyntax error at or near\u201d in logs.", cause: "Dynamically concatenated SQL produces malformed statements that die in the parser before planning ever happens.", fix: "Use parameterized / prepared statements so the grammar is fixed and only values vary." },
    { name: "Planning time dominates execution", symptom: "Trivial queries are slow and backends burn CPU before returning anything.", cause: "Huge IN-lists or many joins exceeding join_collapse_limit make the planner explode combinatorially.", fix: "Rewrite IN-lists as = ANY(array), reduce joined tables, and reuse prepared statements (generic plans)." },
    { name: "View-expansion blowup", symptom: "Querying a nested view is far slower than the referenced tables would suggest.", cause: "The rewriter inlines views recursively, so nested views flatten into an enormous query the planner struggles with.", fix: "Materialize the hot view or flatten the nesting; check EXPLAIN for far more scan nodes than tables you named." },
  ],
  observe: [
    { note: "Show the plan tree the planner produced for a query, without running it:", sql: "EXPLAIN (VERBOSE) SELECT * FROM orders WHERE user_id = 42;" },
    { note: "Compare time spent planning vs executing, per normalized query:", sql: "SELECT query, calls, mean_plan_time, mean_exec_time\nFROM pg_stat_statements\nORDER BY mean_exec_time DESC LIMIT 5;" },
    { note: "Log the chosen plan for every executed statement:", sql: "LOAD 'auto_explain';\nSET auto_explain.log_min_duration = 0;" },
  ],
  mental: "SQL text is a wish; the parse tree is the wish made precise, the plan is the strategy for granting it, and the executor is the genie that actually fetches the rows.",
},

/* ============ CHAPTER 2 ============ */
{
  id: 2, part: 0,
  title: "The Postgres Process Architecture",
  core: "Postgres is a fleet of cooperating OS processes sharing one region of memory \u2014 never threads \u2014 so a crash in one backend can be contained without corrupting everyone else.",
  explanation: (<>
    The first process is the <b>postmaster</b>, which binds the listening socket and does almost nothing but supervise; for every client connection it <C>fork()</C>s a dedicated <b>backend</b> process that runs that session's queries to completion. All backends attach to a single <b>shared memory</b> segment created at startup, holding the buffer pool (<C>shared_buffers</C>), WAL buffers, the lock table, and the <C>ProcArray</C> that tracks every live transaction. A set of auxiliary background processes do system-wide work: the <b>checkpointer</b> flushes dirty pages at checkpoints, the <b>background writer</b> trickles dirty pages out ahead of demand, the <b>WAL writer</b> flushes WAL buffers, and the <b>autovacuum launcher</b> spawns autovacuum workers. Because state is shared through explicit, lock-guarded memory rather than a shared language heap, a backend that segfaults is killed and the postmaster restarts the whole cluster into crash recovery rather than letting one corrupt thread silently poison the others. This is also why connection counts matter so much: each connection is a real OS process with its own memory, which is exactly what poolers like PgBouncer exist to amortize. The trade is simplicity and isolation over the raw efficiency of a thread-per-connection model.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Process architecture">
      <rect x={250} y={8} width={140} height={36} rx={8} fill={COL.proc} />
      <text x={320} y={31} fontSize={12} fill="#fff" textAnchor="middle" fontWeight="700">postmaster (listener)</text>
      {[60, 230, 400].map((x, i) => (
        <g key={i}>
          <line x1={320} y1={44} x2={x + 55} y2={78} stroke={COL.line} strokeWidth={1.5} />
          <rect x={x} y={80} width={110} height={40} rx={7} fill="#fff" stroke={COL.heap} strokeWidth={2} />
          <text x={x + 55} y={98} fontSize={11} fill={COL.ink} textAnchor="middle" fontWeight="700">backend {i + 1}</text>
          <text x={x + 55} y={112} fontSize={9} fill={COL.proc} textAnchor="middle" fontFamily={MONO}>session</text>
          <line x1={x + 55} y1={120} x2={x + 55} y2={150} stroke={COL.line} strokeWidth={1.5} markerEnd="url(#ah2)" />
        </g>
      ))}
      <rect x={20} y={152} width={470} height={56} rx={8} fill={COL.memSoft} stroke={COL.mem} strokeWidth={2} />
      <text x={255} y={172} fontSize={12} fill={COL.ink} textAnchor="middle" fontWeight="700">SHARED MEMORY</text>
      <text x={255} y={194} fontSize={10} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>buffer pool · WAL buffers · lock table · ProcArray</text>
      {[
        { y: 78, t: "checkpointer" },
        { y: 116, t: "bgwriter" },
        { y: 154, t: "WAL writer" },
        { y: 192, t: "autovac launcher" },
      ].map((p, i) => (
        <g key={i}>
          <rect x={508} y={p.y} width={120} height={28} rx={6} fill={COL.procSoft} stroke={COL.proc} strokeWidth={1.5} />
          <text x={568} y={p.y + 18} fontSize={9.5} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>{p.t}</text>
        </g>
      ))}
      <line x1={508} y1={180} x2={490} y2={180} stroke={COL.line} strokeWidth={1.5} />
      <text x={255} y={236} fontSize={10} fill={COL.proc} textAnchor="middle">One crashed backend → postmaster restarts cluster → shared memory stays consistent</text>
      <text x={568} y={236} fontSize={9} fill={COL.proc} textAnchor="middle">background workers</text>
      <defs>
        <marker id="ah2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={COL.line} />
        </marker>
      </defs>
    </svg>
  ),
  caption: "Postmaster spawns one backend per connection; all touch one shared-memory bar; background workers run alongside.",
  failures: [
    { name: "Connection exhaustion", symptom: "New sessions fail with \u201csorry, too many clients already.\u201d", cause: "Each connection is a process; reaching max_connections blocks new ones, and even idle connections hold memory and a ProcArray slot.", fix: "Put PgBouncer in transaction-pooling mode in front and cap application pool sizes." },
    { name: "Backend crash \u2192 full restart", symptom: "Every session disconnects at once with \u201cthe database system is in recovery mode.\u201d", cause: "One backend hit a PANIC/segfault; the postmaster kills all children and runs crash recovery to guarantee shared-memory integrity.", fix: "Find the offending query or extension in the log \u2014 the cluster-wide restart is the isolation model working as intended." },
    { name: "Runaway autovacuum workers", symptom: "CPU and I/O spike with many \u2018autovacuum worker\u2019 rows in pg_stat_activity.", cause: "Several large tables cross their thresholds together while autovacuum_max_workers is set high.", fix: "Tune autovacuum_vacuum_cost_limit and stagger maintenance; investigate why so many tables aged at once." },
  ],
  observe: [
    { note: "List every process \u2014 backends plus checkpointer, walwriter, autovacuum:", sql: "SELECT pid, backend_type, state, query\nFROM pg_stat_activity\nORDER BY backend_type;" },
    { note: "The knobs that size the process fleet and shared memory:", sql: "SELECT name, setting FROM pg_settings\nWHERE name IN ('max_connections','shared_buffers','autovacuum_max_workers');" },
    { note: "Background writer / checkpointer activity counters:", sql: "SELECT * FROM pg_stat_bgwriter;" },
  ],
  mental: "Think of an open-plan office: the postmaster is the receptionist who never does the work but gives each visitor their own desk (a backend), and shared memory is the one whiteboard everyone reads and writes under strict turn-taking rules.",
},

/* ============ CHAPTER 3 ============ */
{
  id: 3, part: 1,
  title: "How Tables Are Stored on Disk \u2014 The Heap",
  core: "A table is just a file of fixed-size 8KB pages holding an unordered pile of tuples, and an UPDATE never edits a tuple in place \u2014 it writes a new version and tombstones the old one.",
  explanation: (<>
    A table's main fork is stored as one or more 1GB segment files made of 8KB pages (the <C>BLCKSZ</C> compile-time constant). Each page has a 24-byte page header, then an array of 4-byte <b>item pointers</b> (line pointers) growing downward from the top, free space in the middle, and the actual tuples packed upward from the bottom. Every tuple carries a 23-byte header before its column data: <C>xmin</C> (the inserting xid), <C>xmax</C> (the deleting/updating xid, 0 if live), a <C>ctid</C> self-pointer of (block number, item offset), an infomask of status bits, and a null bitmap. Because Postgres uses MVCC, an UPDATE does <i>not</i> overwrite the row: it inserts a brand-new tuple and sets the old tuple's <C>xmax</C> to the updating xid, leaving a dead version behind for <C>VACUUM</C> to reclaim. The <C>ctid</C> is the physical address that index entries store to find the tuple, which is why ctids change when a row moves. This heap structure is exactly why Postgres tables have no inherent order and why a sequential scan simply reads pages from first to last.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="8KB heap page layout">
      <rect x={20} y={20} width={250} height={280} rx={6} fill="#fff" stroke={COL.heap} strokeWidth={2} />
      <text x={145} y={14} fontSize={11} fill={COL.heap} textAnchor="middle" fontWeight="700">one 8KB heap page</text>
      <rect x={20} y={20} width={250} height={30} fill={COL.heapSoft} />
      <text x={145} y={39} fontSize={10} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>PageHeader (24 bytes)</text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={26} y={56 + i * 16} width={238} height={13} fill={COL.indexSoft} stroke={COL.index} strokeWidth={0.8} />
          <text x={32} y={66 + i * 16} fontSize={8.5} fill={COL.ink} fontFamily={MONO}>lp[{i}] → off,len ↓</text>
        </g>
      ))}
      <rect x={26} y={110} width={238} height={70} fill="#f8fafc" stroke="#cbd5e1" strokeDasharray="3 3" />
      <text x={145} y={148} fontSize={10} fill={COL.line} textAnchor="middle">free space</text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={26} y={188 + i * 36} width={238} height={30} fill={i === 0 ? COL.deadSoft : COL.heapSoft} stroke={i === 0 ? COL.dead : COL.heap} strokeWidth={1} />
          <text x={32} y={207 + i * 36} fontSize={9} fill={COL.ink} fontFamily={MONO}>tuple {i} {i === 0 ? "(dead, xmax set)" : ""}</text>
        </g>
      ))}
      <line x1={290} y1={196} x2={330} y2={196} stroke={COL.line} strokeWidth={1.5} markerEnd="url(#ah3)" />
      <rect x={332} y={120} width={296} height={150} rx={6} fill="#fff" stroke={COL.heap} strokeWidth={2} />
      <text x={480} y={114} fontSize={11} fill={COL.heap} textAnchor="middle" fontWeight="700">one tuple expanded</text>
      {[
        { t: "xmin = 4823", c: COL.good },
        { t: "xmax = 0  (still live)", c: COL.ink },
        { t: "ctid = (0, 3)", c: COL.index },
        { t: "infomask + null bitmap", c: COL.proc },
        { t: "data: user_id=42, total=99.50, …", c: COL.heap },
      ].map((r, i) => (
        <g key={i}>
          <rect x={340} y={128 + i * 27} width={280} height={22} rx={4} fill="#f8fafc" stroke="#e2e8f0" />
          <circle cx={352} cy={139 + i * 27} r={4} fill={r.c} />
          <text x={364} y={143 + i * 27} fontSize={10} fill={COL.ink} fontFamily={MONO}>{r.t}</text>
        </g>
      ))}
      <text x={290} y={300} fontSize={9} fill={COL.proc}>pointers grow ↓ · tuples grow ↑</text>
      <defs>
        <marker id="ah3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={COL.line} />
        </marker>
      </defs>
    </svg>
  ),
  caption: "Header + line-pointer array (top, growing down), free space, tuples (bottom, growing up). One tuple's header decoded on the right.",
  failures: [
    { name: "Table bloat from churny updates", symptom: "The table file keeps growing while the live row count stays flat, and scans slow down.", cause: "Every UPDATE leaves a dead tuple; if VACUUM can't keep pace, dead versions pile up inside the pages.", fix: "Make autovacuum more aggressive, lower fillfactor to enable HOT updates, and avoid updating indexed columns." },
    { name: "ctid assumptions in app code", symptom: "Application caches a ctid and later reads the wrong row or none at all.", cause: "ctid is a physical address that changes on UPDATE and VACUUM FULL \u2014 it is not a stable identifier.", fix: "Always key on a real primary key, never on the system ctid column." },
    { name: "Free-space-map staleness", symptom: "Inserts grow the file even though vacuumed pages have room.", cause: "The free space map didn't reflect reclaimable space, so inserts append new pages instead of reusing gaps.", fix: "Run VACUUM (which rebuilds the FSM); VACUUM FULL or pg_repack to physically compact." },
  ],
  observe: [
    { note: "Peek at the hidden system columns \u2014 physical location and MVCC stamps:", sql: "SELECT ctid, xmin, xmax, * FROM orders LIMIT 5;" },
    { note: "Decode every line pointer and tuple header on page 0:", sql: "CREATE EXTENSION pageinspect;\nSELECT * FROM heap_page_items(get_raw_page('orders', 0));" },
    { note: "Physical bytes the heap occupies on disk:", sql: "SELECT pg_size_pretty(pg_relation_size('orders'));" },
  ],
  mental: "A heap page is a parking lot where cars (tuples) park bottom-up while a numbered directory (line pointers) fills top-down; you never repaint a car, you park a new one and cross the old number off the directory.",
},
/* ============ CHAPTER 4 ============ */
{
  id: 4, part: 1,
  title: "B-Tree Indexes \u2014 The Data Structure",
  core: "A Postgres B-tree is a shallow, balanced tree whose leaves form a doubly-linked list of sorted keys pointing at heap ctids, so any lookup costs only a handful of page reads even over billions of rows.",
  explanation: (<>
    Postgres's default index is a Lehman-Yao B+-tree where all real data lives in the leaf level and every leaf sits at the same depth. <b>Internal pages</b> hold separator keys and downlinks to child pages; <b>leaf pages</b> hold the indexed key values plus the <C>ctid</C> of each matching heap tuple, kept in sorted order. Because an 8KB page holds on the order of hundreds of entries (a fanout of roughly 100\u2013300), the tree stays just 3\u20134 levels deep even for hundreds of millions of rows, so a point lookup touches only root \u2192 internal \u2192 leaf. Crucially, every leaf has right- and left-sibling pointers forming a doubly-linked list, which lets a range scan walk keys in order without ever revisiting internal nodes. A search is O(log n): binary-search the root to choose a child, repeat down to the leaf, then binary-search the leaf. The high-key / right-link design also lets concurrent readers descend safely while another backend is splitting a page, which is what makes the structure both fast and highly concurrent.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="B-tree structure">
      <rect x={270} y={16} width={100} height={34} rx={6} fill={COL.indexSoft} stroke={COL.wal} strokeWidth={2.5} />
      <text x={320} y={38} fontSize={11} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>root [50]</text>
      {[{ x: 120, k: "[20]" }, { x: 420, k: "[80]" }].map((n, i) => (
        <g key={i}>
          <line x1={i === 0 ? 290 : 350} y1={50} x2={n.x + 50} y2={80} stroke={i === 0 ? COL.wal : COL.line} strokeWidth={i === 0 ? 2.5 : 1.5} />
          <rect x={n.x} y={82} width={100} height={32} rx={6} fill={COL.indexSoft} stroke={i === 0 ? COL.wal : COL.index} strokeWidth={i === 0 ? 2.5 : 2} />
          <text x={n.x + 50} y={103} fontSize={10.5} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>internal {n.k}</text>
        </g>
      ))}
      {[
        { x: 30, k: "10 15", hot: false },
        { x: 170, k: "20 35", hot: true },
        { x: 330, k: "55 70", hot: false },
        { x: 470, k: "80 95", hot: false },
      ].map((l, i) => (
        <g key={i}>
          <rect x={l.x} y={150} width={120} height={36} rx={6} fill={l.hot ? "#fef3c7" : COL.indexSoft} stroke={l.hot ? COL.wal : COL.index} strokeWidth={l.hot ? 2.5 : 1.8} />
          <text x={l.x + 60} y={173} fontSize={11} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>leaf {l.k}</text>
          {i < 3 && <line x1={l.x + 120} y1={168} x2={l.x + 140} y2={168} stroke={COL.line} strokeWidth={1.5} markerEnd="url(#ah4)" />}
          {i > 0 && <line x1={l.x} y1={178} x2={l.x - 20} y2={178} stroke={COL.line} strokeWidth={1} markerEnd="url(#ah4)" />}
        </g>
      ))}
      <line x1={150} y1={114} x2={230} y2={150} stroke={COL.wal} strokeWidth={2.5} />
      <text x={300} y={206} fontSize={9.5} fill={COL.wal} textAnchor="middle" fontWeight="700">amber = search path for key 35: root → internal[20] → leaf</text>
      <rect x={170} y={224} width={300} height={78} rx={6} fill="#fff" stroke={COL.index} strokeWidth={1.5} />
      <text x={320} y={240} fontSize={10} fill={COL.index} textAnchor="middle" fontWeight="700">leaf [20 35] expanded</text>
      <text x={186} y={262} fontSize={10} fill={COL.ink} fontFamily={MONO}>key 20 → ctid (0,3)</text>
      <text x={186} y={282} fontSize={10} fill={COL.ink} fontFamily={MONO}>key 35 → ctid (5,1)</text>
      <line x1={360} y1={258} x2={420} y2={258} stroke={COL.heap} strokeWidth={1.5} markerEnd="url(#ah4h)" />
      <rect x={422} y={248} width={40} height={20} rx={3} fill={COL.heapSoft} stroke={COL.heap} />
      <text x={442} y={262} fontSize={8} fill={COL.ink} textAnchor="middle">heap</text>
      <defs>
        <marker id="ah4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={COL.line} /></marker>
        <marker id="ah4h" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={COL.heap} /></marker>
      </defs>
    </svg>
  ),
  caption: "Root → internal → leaf, leaves linked sideways for range scans. Highlighted amber path is a search for key 35; one leaf shows real ctid pointers into the heap.",
  failures: [
    { name: "Index ignored for low selectivity", symptom: "Planner picks a sequential scan even though a perfectly good index exists.", cause: "The predicate matches a large fraction of rows, so random heap fetches through the index cost more than reading sequentially (governed by random_page_cost).", fix: "This is usually correct; if you truly need the index, make it covering for an index-only scan, or lower random_page_cost on SSD." },
    { name: "Bloated B-tree from deletes", symptom: "Index size grows and scans slow over time on a heavily updated table.", cause: "Deleted leaf entries leave half-empty pages that don't automatically merge back.", fix: "REINDEX CONCURRENTLY to rebuild the index without locking out writes." },
    { name: "Index on a low-cardinality column", symptom: "A large index is created but pg_stat_user_indexes shows it's almost never scanned.", cause: "A B-tree on a boolean or few-value column has poor selectivity, so the planner avoids it.", fix: "Drop it, or replace it with a partial index targeting the rare values you actually query." },
  ],
  observe: [
    { note: "Has the index ever actually been used?", sql: "SELECT indexrelname, idx_scan, idx_tup_read\nFROM pg_stat_user_indexes WHERE relname = 'orders';" },
    { note: "Inspect the B-tree meta page \u2014 root block and tree height:", sql: "CREATE EXTENSION pageinspect;\nSELECT * FROM bt_metap('orders_pkey');" },
    { note: "Size of each index on a table:", sql: "SELECT indexrelid::regclass,\n       pg_size_pretty(pg_relation_size(indexrelid))\nFROM pg_index WHERE indrelid = 'orders'::regclass;" },
  ],
  mental: "A B-tree is a library: the root and internal pages are the floor-and-shelf signs that get you to the right shelf in two or three glances, and the leaves are the shelf itself \u2014 a single sorted row of cards you can read straight along for a range scan.",
},

/* ============ CHAPTER 5 ============ */
{
  id: 5, part: 1,
  title: "B-Tree Index Operations \u2014 Insert, Split, Scan",
  core: "Inserts descend to the right leaf and slot the key in sorted order; when a leaf overflows it splits in two and pushes a separator up \u2014 and a split that cascades to the root is the only way a B-tree grows taller.",
  explanation: (<>
    To insert, Postgres descends from the root using separator keys to reach the correct leaf, then places the new key in sorted position. If the leaf has room the insert is local and cheap; if it's full, the leaf is <b>split</b> into two pages, roughly half the entries move to a new right sibling, the sibling links are rewired, and the median separator key is inserted into the parent. If the parent is also full it splits too, and this can cascade upward; when the root itself splits, a new root is created one level up \u2014 the only mechanism by which the tree ever gains height, which is what keeps it perfectly balanced. A forward range scan finds the starting leaf once via the tree, then follows right-sibling links straight across the leaf level, never touching internal pages again. The planner chooses among a plain <b>index scan</b> (random heap fetches), a <b>bitmap scan</b> (collect ctids, then visit the heap in physical order), and an <b>index-only scan</b> (answer entirely from the index when it covers all needed columns and the visibility map marks the page all-visible).
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="leaf split">
      <text x={160} y={24} fontSize={12} fill={COL.ink} textAnchor="middle" fontWeight="700">BEFORE: insert 25 into a full leaf</text>
      <rect x={110} y={40} width={100} height={28} rx={5} fill={COL.indexSoft} stroke={COL.index} strokeWidth={2} />
      <text x={160} y={59} fontSize={10} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>parent [40]</text>
      <line x1={160} y1={68} x2={160} y2={100} stroke={COL.line} strokeWidth={1.5} />
      <rect x={70} y={102} width={180} height={34} rx={6} fill="#fef3c7" stroke={COL.wal} strokeWidth={2.5} />
      <text x={160} y={124} fontSize={11} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>10 20 30 35 (FULL)</text>
      <text x={160} y={152} fontSize={9} fill={COL.dead} textAnchor="middle">no room for 25 → must split</text>

      <line x1={270} y1={120} x2={310} y2={120} stroke={COL.line} strokeWidth={2} markerEnd="url(#ah5)" />

      <text x={490} y={24} fontSize={12} fill={COL.ink} textAnchor="middle" fontWeight="700">AFTER: split + push separator up</text>
      <rect x={420} y={40} width={140} height={28} rx={5} fill="#d1fae5" stroke={COL.good} strokeWidth={2.5} />
      <text x={490} y={59} fontSize={10} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>parent [30, 40]</text>
      <line x1={450} y1={68} x2={400} y2={100} stroke={COL.line} strokeWidth={1.5} />
      <line x1={530} y1={68} x2={560} y2={100} stroke={COL.line} strokeWidth={1.5} />
      <rect x={330} y={102} width={130} height={34} rx={6} fill="#d1fae5" stroke={COL.good} strokeWidth={2} />
      <text x={395} y={124} fontSize={10.5} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>10 20 25</text>
      <rect x={500} y={102} width={120} height={34} rx={6} fill="#d1fae5" stroke={COL.good} strokeWidth={2} />
      <text x={560} y={124} fontSize={10.5} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>30 35</text>
      <line x1={460} y1={119} x2={500} y2={119} stroke={COL.line} strokeWidth={1.5} markerEnd="url(#ah5)" />
      <text x={490} y={152} fontSize={9} fill={COL.good} textAnchor="middle">median 30 pushed to parent; if parent fills, it splits too → up to root</text>

      <rect x={20} y={190} width={600} height={110} rx={8} fill="#f8fafc" stroke="#e2e8f0" />
      <text x={320} y={210} fontSize={11} fill={COL.ink} textAnchor="middle" fontWeight="700">Three scan strategies over the same leaves</text>
      {[
        { x: 40, t: "Index Scan", d: "tree → ctid → random heap fetch", c: COL.index },
        { x: 240, t: "Bitmap Scan", d: "gather ctids → sort → heap in order", c: COL.heap },
        { x: 440, t: "Index-Only", d: "answer from index, skip heap", c: COL.good },
      ].map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={224} width={170} height={60} rx={6} fill="#fff" stroke={s.c} strokeWidth={1.8} />
          <text x={s.x + 85} y={246} fontSize={11} fill={s.c} textAnchor="middle" fontWeight="700">{s.t}</text>
          <text x={s.x + 85} y={268} fontSize={8.8} fill={COL.ink} textAnchor="middle">{s.d}</text>
        </g>
      ))}
      <defs><marker id="ah5" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={COL.line} /></marker></defs>
    </svg>
  ),
  caption: "A full leaf splits into two when 25 arrives; the median key 30 is pushed up. Below: the three ways the planner reads a B-tree.",
  failures: [
    { name: "Right-edge insert contention", symptom: "Lock/buffer contention on an index over a serial or timestamp column under heavy insert load.", cause: "Monotonically increasing keys all land on the same rightmost leaf, splitting it repeatedly.", fix: "Accept it (recent PG optimizes rightmost splits), or distribute keys; watch LWLock buffer waits on the index." },
    { name: "Split-driven write amplification", symptom: "WAL volume spikes during a bulk insert into an indexed table.", cause: "Random insertion order causes many leaf splits, each fully WAL-logged.", fix: "Load data in key order, or drop and rebuild the index after the bulk load." },
    { name: "Index-only scan still hitting the heap", symptom: "EXPLAIN shows an Index Only Scan but with a high \u201cHeap Fetches\u201d count.", cause: "The visibility map isn't all-visible for those pages because VACUUM hasn't run recently.", fix: "VACUUM the table so the visibility map bits are set and the heap can be skipped." },
  ],
  observe: [
    { note: "Confirm an index-only scan and watch the Heap Fetches line:", sql: "EXPLAIN (ANALYZE, BUFFERS)\nSELECT id FROM orders WHERE id BETWEEN 100 AND 200;" },
    { note: "Live/dead items and free space on a specific leaf page:", sql: "SELECT * FROM bt_page_stats('orders_pkey', 1);  -- pageinspect" },
    { note: "Tuples read from index vs fetched from heap, per index:", sql: "SELECT relname, idx_scan, idx_tup_read, idx_tup_fetch\nFROM pg_stat_user_indexes;" },
  ],
  mental: "Inserting into a B-tree is like filing a card into a full drawer: you split the drawer in two and add a new label to the cabinet above; if that cabinet is full you split it too, and only when the very top cabinet splits does the filing system grow one level taller.",
},

/* ============ CHAPTER 6 ============ */
{
  id: 6, part: 1,
  title: "Other Index Types",
  core: "B-tree is the default, but Postgres ships five other access methods \u2014 Hash, GiST, GIN, BRIN, plus partial and expression variants \u2014 each a different physical structure tuned for a different query shape.",
  explanation: (<>
    A <b>Hash</b> index stores entries in on-disk hash buckets for O(1) equality lookups but supports no ordering or range queries (and since PG 10 it is WAL-logged and crash-safe). <b>GiST</b> is a generalized, extensible balanced tree where each node holds a lossy predicate covering its subtree, which is how it indexes geometry, ranges, and nearest-neighbor (<C>{"<->"}</C>) searches. <b>GIN</b> is an inverted index mapping each contained element \u2014 a word in a <C>tsvector</C>, a key in <C>jsonb</C>, an element in an array \u2014 to a posting list of rows containing it, making containment queries fast at the cost of slower writes (buffered in a pending list). <b>BRIN</b> stores only a summary (min/max) per range of physically adjacent blocks, making it astonishingly tiny but useful only when the column correlates with physical order, like an append-only timestamp. A <b>partial</b> index uses a <C>WHERE</C> clause to index just a subset of rows, and an <b>expression</b> index indexes a function output such as <C>lower(email)</C> so queries on that expression can use it. Picking the right access method is often a bigger win than tuning any single B-tree.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="six index types">
      {[
        { x: 14, t: "Hash", c: COL.index, use: "= equality only", draw: (x) => (<g>{[0,1,2].map(i=>(<g key={i}><rect x={x+8} y={64+i*16} width={70} height={12} fill={COL.indexSoft} stroke={COL.index} strokeWidth={0.7}/><text x={x+12} y={73+i*16} fontSize={7} fontFamily={MONO}>bucket {i}</text></g>))}</g>) },
        { x: 220, t: "GiST", c: COL.index, use: "geo · ranges · KNN", draw: (x) => (<g><rect x={x+30} y={60} width={28} height={14} fill={COL.indexSoft} stroke={COL.index}/>{[0,1].map(i=>(<rect key={i} x={x+10+i*40} y={86} width={24} height={14} fill={COL.indexSoft} stroke={COL.index}/>))}<line x1={x+44} y1={74} x2={x+22} y2={86} stroke={COL.line}/><line x1={x+44} y1={74} x2={x+62} y2={86} stroke={COL.line}/></g>) },
        { x: 426, t: "GIN", c: COL.index, use: "arrays · jsonb · FTS", draw: (x) => (<g>{["cat","dog"].map((w,i)=>(<g key={i}><text x={x+8} y={70+i*18} fontSize={8} fontFamily={MONO} fill={COL.index}>{w}→</text><rect x={x+44} y={60+i*18} width={48} height={11} fill={COL.indexSoft} stroke={COL.index} strokeWidth={0.7}/><text x={x+46} y={69+i*18} fontSize={7} fontFamily={MONO}>1,4,9</text></g>))}</g>) },
        { x: 14, t: "BRIN", c: COL.index, use: "naturally ordered cols", draw: (x) => (<g>{[0,1,2].map(i=>(<g key={i}><rect x={x+8} y={64+i*16} width={70} height={12} fill={COL.indexSoft} stroke={COL.index} strokeWidth={0.7}/><text x={x+11} y={73+i*16} fontSize={6.5} fontFamily={MONO}>blk {i*4}-{i*4+3}: {i*100}–{i*100+99}</text></g>))}</g>), row: 1 },
        { x: 220, t: "Partial", c: COL.heap, use: "WHERE active", draw: (x) => (<g><rect x={x+8} y={60} width={88} height={42} fill="#f1f5f9" stroke="#cbd5e1"/>{[0,1,2].map(i=>(<rect key={i} x={x+12} y={64+i*12} width={80} height={9} fill={i===1?COL.heapSoft:"#fff"} stroke={i===1?COL.heap:"#e2e8f0"}/>))}<text x={x+52} y={114} fontSize={7} textAnchor="middle" fill={COL.heap}>only matching rows</text></g>), row: 1 },
        { x: 426, t: "Expression", c: COL.heap, use: "lower(email)", draw: (x) => (<g><rect x={x+8} y={62} width={40} height={16} fill="#fff" stroke="#cbd5e1"/><text x={x+28} y={73} fontSize={7} textAnchor="middle" fontFamily={MONO}>email</text><text x={x+52} y={73} fontSize={9} fill={COL.heap}>→</text><rect x={x+58} y={62} width={40} height={16} fill={COL.indexSoft} stroke={COL.heap}/><text x={x+78} y={73} fontSize={6.5} textAnchor="middle" fontFamily={MONO}>lower()</text></g>), row: 1 },
      ].map((b, i) => {
        const baseY = (b.row ? 158 : 0);
        return (
          <g key={i} transform={`translate(0,${baseY})`}>
            <rect x={b.x} y={36} width={200} height={108} rx={8} fill="#fff" stroke={b.c} strokeWidth={1.6} />
            <text x={b.x + 100} y={54} fontSize={12} fill={b.c} textAnchor="middle" fontWeight="700">{b.t}</text>
            {b.draw(b.x)}
            <text x={b.x + 100} y={134} fontSize={8.5} fill={COL.proc} textAnchor="middle" fontStyle="italic">{b.use}</text>
          </g>
        );
      })}
    </svg>
  ),
  caption: "Six index structures side by side, each with its best-use case. Top row: Hash, GiST, GIN. Bottom row: BRIN, Partial, Expression.",
  failures: [
    { name: "GIN slow writes / pending-list bloat", symptom: "Inserts into a jsonb or tsvector column slow down; some lookups scan a large pending list.", cause: "GIN buffers new entries in a pending list flushed by (auto)vacuum.", fix: "Lower gin_pending_list_limit or set fastupdate=off, and ensure the table is vacuumed regularly." },
    { name: "BRIN useless after random writes", symptom: "A BRIN index yields no speedup at all.", cause: "The column lost physical correlation (rows inserted/updated out of order), so block-range summaries overlap and nothing can be skipped.", fix: "Use a B-tree, or restore physical order with CLUSTER / pg_repack; check correlation in pg_stats." },
    { name: "Hash index on a range query", symptom: "A query with < or > ignores the hash index and seq-scans.", cause: "Hash indexes support only equality.", fix: "Use a B-tree for any range or ordering predicate." },
  ],
  observe: [
    { note: "List the installed access methods on this server:", sql: "SELECT amname FROM pg_am;" },
    { note: "See how tiny a BRIN index is compared to a B-tree:", sql: "CREATE INDEX ON events USING brin (created_at);\nSELECT pg_size_pretty(pg_relation_size('events_created_at_idx'));" },
    { note: "Usage counts for your GIN indexes:", sql: "SELECT indexrelname, idx_scan\nFROM pg_stat_user_indexes WHERE indexrelname LIKE '%gin%';" },
  ],
  mental: "If B-tree is a sorted phone book, then Hash is a coat-check ticket, GIN is the index-of-terms in the back of a book, GiST is a set of nested map regions, and BRIN is the chapter range printed on a book's spine.",
},

/* ============ CHAPTER 7 ============ */
{
  id: 7, part: 2,
  title: "Transactions and ACID",
  core: "ACID isn't one feature \u2014 it's four guarantees implemented by four different subsystems: MVCC, constraints, snapshots, and the WAL.",
  explanation: (<>
    <b>Atomicity</b> (all-or-nothing) comes from MVCC plus undo-free rollback: an aborted transaction simply never marks its xid committed in the commit log (<C>pg_xact</C> / clog), so its tuples are invisible and reclaimed later. <b>Consistency</b> means every committed transaction leaves all constraints and triggers satisfied, enforced synchronously as statements run. <b>Isolation</b> means concurrent transactions don't see each other's in-flight work, achieved through MVCC snapshot isolation rather than read locks. <b>Durability</b> means a committed transaction survives a crash, guaranteed by writing and <C>fsync</C>ing a WAL record before the commit is acknowledged to the client. Transaction ids are a 32-bit counter that increments per writing transaction and wraps roughly every 4 billion, which is precisely why VACUUM's freezing work and <C>autovacuum_freeze_max_age</C> exist as an operational concern. Read-only transactions don't consume an xid until they actually write, so the counter advances only with real changes \u2014 a small but important detail for wraparound math.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="ACID quadrants">
      {[
        { x: 20, y: 20, t: "Atomicity", m: "MVCC + clog", d: "abort → xid never committed → tuples invisible", c: COL.heap },
        { x: 326, y: 20, t: "Consistency", m: "constraints + triggers", d: "checks run as each statement executes", c: COL.good },
        { x: 20, y: 168, t: "Isolation", m: "MVCC snapshot", d: "each txn sees a frozen view of versions", c: COL.index },
        { x: 326, y: 168, t: "Durability", m: "WAL fsync", d: "log flushed to disk before COMMIT ack", c: COL.wal },
      ].map((q, i) => (
        <g key={i}>
          <rect x={q.x} y={q.y} width={294} height={130} rx={10} fill="#fff" stroke={q.c} strokeWidth={2} />
          <rect x={q.x} y={q.y} width={294} height={28} rx={10} fill={q.c} />
          <text x={q.x + 14} y={q.y + 19} fontSize={13} fill="#fff" fontWeight="700">{q.t}</text>
          <rect x={q.x + 16} y={q.y + 42} width={150} height={26} rx={6} fill={COL.procSoft} stroke={q.c} />
          <text x={q.x + 91} y={q.y + 59} fontSize={11} fill={COL.ink} textAnchor="middle" fontFamily={MONO}>{q.m}</text>
          <text x={q.x + 16} y={q.y + 92} fontSize={10} fill={COL.ink}>{q.d}</text>
          <line x1={q.x + 16} y1={q.y + 104} x2={q.x + 270} y2={q.y + 104} stroke="#e2e8f0" />
          <text x={q.x + 16} y={q.y + 120} fontSize={9} fill={COL.proc} fontStyle="italic">the Postgres mechanism that implements it</text>
        </g>
      ))}
    </svg>
  ),
  caption: "Each ACID property maps to a distinct Postgres mechanism \u2014 there is no single \u2018transaction engine.\u2019",
  failures: [
    { name: "Long idle-in-transaction sessions", symptom: "Bloat grows and VACUUM can't clean dead tuples even on quiet tables.", cause: "An open transaction holds an old snapshot/xmin, so dead versions are still considered potentially visible.", fix: "Set idle_in_transaction_session_timeout and fix the app to commit promptly; watch backend_xmin in pg_stat_activity." },
    { name: "Deferred constraint surprises", symptom: "Application errors arrive at COMMIT rather than at the offending statement.", cause: "DEFERRABLE constraints are checked at commit time, not when the row is written.", fix: "Understand the deferral semantics and validate earlier in the transaction if you want fail-fast behavior." },
    { name: "XID burn from tiny transactions", symptom: "Rapid xid consumption and frequent anti-wraparound vacuums.", cause: "Every writing transaction consumes an xid; very high transaction rates approach wraparound faster.", fix: "Batch small writes and make sure autovacuum's freezing keeps pace; monitor age(datfrozenxid)." },
  ],
  observe: [
    { note: "The current transaction id counter (64-bit extended form):", sql: "SELECT txid_current();" },
    { note: "How close each database is to wraparound trouble:", sql: "SELECT datname, age(datfrozenxid)\nFROM pg_database ORDER BY age(datfrozenxid) DESC;" },
    { note: "Transactions holding old snapshots right now:", sql: "SELECT pid, state, xact_start, backend_xmin\nFROM pg_stat_activity WHERE state LIKE '%transaction%';" },
  ],
  mental: "ACID is a relay team, not a single sprinter: MVCC carries atomicity and isolation, the constraint system carries consistency, and the WAL anchors durability \u2014 drop any one runner and the whole guarantee falls.",
},
/* ============ CHAPTER 8 ============ */
{
  id: 8, part: 2,
  title: "MVCC — Multi-Version Concurrency Control",
  core: "Instead of locking rows for reads, Postgres keeps every version of a row tagged with the transactions that created and deleted it, and shows each transaction only the versions valid as of its snapshot.",
  explanation: (<>
    MVCC means a row is never updated in place: each <C>UPDATE</C> writes a brand-new tuple version and stamps the old one as deleted. Every tuple header carries an <C>xmin</C> (the xid that created it) and an <C>xmax</C> (the xid that deleted it, or 0 if still live). When a transaction starts a statement it takes a <b>snapshot</b> — essentially the next xid plus the list of xids currently in progress — and a tuple is visible only if its <C>xmin</C> committed before the snapshot and its <C>xmax</C> is unset, still running, or aborted. Because visibility is computed from these stamps rather than from locks, <b>readers never block writers and writers never block readers</b>. Commit status itself lives in the <C>pg_xact</C> (clog) area, and to avoid hammering it Postgres caches the answer in per-tuple <b>hint bits</b> the first time a tuple's fate is checked. The cost of all this is <b>dead tuples</b>: old versions no longer visible to any snapshot, which accumulate until <C>VACUUM</C> reclaims their space.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="MVCC versions and visibility">
      {/* three transactions timeline */}
      <text x={12} y={18} fontSize={12} fontWeight="700" fill={COL.ink}>Row versions (tagged xmin / xmax)</text>
      {[
        { y: 34, xmin: "100", xmax: "140", label: "v1", c: COL.dead, note: "superseded" },
        { y: 92, xmin: "140", xmax: "175", label: "v2", c: COL.dead, note: "superseded" },
        { y: 150, xmin: "175", xmax: "0", label: "v3", c: COL.good, note: "live" },
      ].map((r, i) => (
        <g key={i}>
          <rect x={12} y={r.y} width={300} height={46} rx={8} fill={r.c === COL.good ? COL.goodSoft : COL.deadSoft} stroke={r.c} strokeWidth={2} />
          <text x={26} y={r.y + 20} fontSize={13} fontWeight="700" fill={COL.ink}>{r.label}</text>
          <text x={26} y={r.y + 38} fontSize={10} fill={r.c} fontStyle="italic">{r.note}</text>
          <rect x={86} y={r.y + 10} width={100} height={26} rx={5} fill="#fff" stroke={COL.heap} />
          <text x={136} y={r.y + 27} fontSize={11} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>xmin {r.xmin}</text>
          <rect x={196} y={r.y + 10} width={104} height={26} rx={5} fill="#fff" stroke={r.xmax === "0" ? COL.good : COL.dead} />
          <text x={248} y={r.y + 27} fontSize={11} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>xmax {r.xmax}</text>
        </g>
      ))}
      {/* visibility matrix */}
      <text x={350} y={18} fontSize={12} fontWeight="700" fill={COL.ink}>Which version each snapshot sees</text>
      {["v1", "v2", "v3"].map((v, ci) => (
        <text key={v} x={470 + ci * 52} y={42} fontSize={11} textAnchor="middle" fill={COL.proc} fontFamily={MONO}>{v}</text>
      ))}
      {[
        { t: "T@120", vis: [true, false, false] },
        { t: "T@160", vis: [false, true, false] },
        { t: "T@200", vis: [false, false, true] },
      ].map((row, ri) => (
        <g key={ri}>
          <text x={356} y={70 + ri * 44} fontSize={11} fill={COL.ink} fontFamily={MONO}>{row.t}</text>
          {row.vis.map((ok, ci) => (
            <g key={ci}>
              <rect x={446 + ci * 52} y={56 + ri * 44} width={44} height={30} rx={6} fill={ok ? COL.goodSoft : "#f8fafc"} stroke={ok ? COL.good : COL.line} />
              <text x={468 + ci * 52} y={76 + ri * 44} fontSize={14} textAnchor="middle" fill={ok ? COL.good : COL.line}>{ok ? "\u2713" : "\u2715"}</text>
            </g>
          ))}
        </g>
      ))}
      <text x={350} y={208} fontSize={10} fill={COL.proc}>Snapshot @N sees the version whose xmin \u2264 N and xmax &gt; N (or 0).</text>
      {/* dead tuple note */}
      <rect x={12} y={228} width={616} height={78} rx={10} fill="#fff" stroke={COL.line} />
      <text x={26} y={250} fontSize={12} fontWeight="700" fill={COL.ink}>Dead tuples</text>
      <text x={26} y={272} fontSize={11} fill={COL.ink}>v1 and v2 are invisible to every current snapshot, but still occupy heap space.</text>
      <text x={26} y={292} fontSize={11} fill={COL.dead}>VACUUM is what eventually reclaims those slots \u2014 MVCC creates the garbage, VACUUM collects it.</text>
    </svg>
  ),
  caption: "A single logical row becomes a chain of physical versions; visibility is arithmetic on xmin/xmax against a snapshot.",
  failures: [
    { name: "Snapshot held open by a long transaction", symptom: "Dead tuples pile up and VACUUM reports millions of rows it cannot remove.", cause: "An old snapshot (often idle-in-transaction) means even ancient versions might still be visible to it, so VACUUM must keep them.", fix: "Find the culprit via backend_xmin in pg_stat_activity, terminate it, and set idle_in_transaction_session_timeout." },
    { name: "Hint-bit write storm after bulk load", symptom: "The first SELECT over freshly inserted data is unexpectedly slow and write-heavy.", cause: "Tuples lack hint bits, so the first reader checks clog and dirties pages to cache the result.", fix: "Run VACUUM (or let autovacuum) settle hint bits proactively after large loads." },
    { name: "Update-heavy table bloat", symptom: "A small hot table grows to many gigabytes despite a stable row count.", cause: "Every UPDATE creates a new version; if autovacuum can't keep pace the dead versions accumulate.", fix: "Tune autovacuum to be more aggressive on that table and consider HOT-update-friendly fillfactor." },
  ],
  observe: [
    { note: "See the hidden version stamps on any table's rows:", sql: "SELECT xmin, xmax, ctid, *\nFROM orders LIMIT 5;" },
    { note: "Count dead vs live tuples per table:", sql: "SELECT relname, n_live_tup, n_dead_tup\nFROM pg_stat_user_tables ORDER BY n_dead_tup DESC;" },
    { note: "The oldest snapshot any backend is pinning:", sql: "SELECT pid, backend_xmin, state\nFROM pg_stat_activity\nWHERE backend_xmin IS NOT NULL;" },
  ],
  mental: "MVCC is a museum that never repaints a canvas: it hangs a fresh copy with a dated tag and leaves the old ones up, so each visitor sees the gallery as it stood the day their ticket was issued.",
},
/* ============ CHAPTER 9 ============ */
{
  id: 9, part: 2,
  title: "Isolation Levels and Anomalies",
  core: "An isolation level is really a policy about when snapshots are taken and how conflicts are detected — that single choice decides which concurrency anomalies are possible.",
  explanation: (<>
    Postgres offers three meaningful isolation levels on top of MVCC. <b>Read Committed</b> (the default) takes a <i>fresh snapshot at the start of every statement</i>, so each command sees everything committed up to that instant — which permits non-repeatable and phantom reads within a transaction. <b>Repeatable Read</b> takes <i>one snapshot at the first statement</i> and reuses it for the whole transaction, giving stable reads and (in Postgres) eliminating phantoms, but it can fail an update with a serialization error if the row changed underneath it. <b>Serializable</b> adds Serializable Snapshot Isolation (SSI), which tracks read-write dependencies between concurrent transactions and aborts one with SQLSTATE <C>40001</C> if their interleaving could not have occurred in any serial order. Notably Postgres never allows <b>dirty reads</b>, so the Read Uncommitted level behaves identically to Read Committed. The anomaly Serializable specifically defends against that the others cannot is <b>write skew</b>: two transactions each read an overlapping set, see a constraint satisfied, and each writes a change that is individually fine but jointly violates the invariant.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Write skew across two transactions">
      <text x={12} y={18} fontSize={12} fontWeight="700" fill={COL.ink}>Write skew \u2014 the anomaly only Serializable stops</text>
      <text x={12} y={36} fontSize={10} fill={COL.proc}>Invariant: at least one doctor must remain on call.</text>
      {/* two lanes */}
      {[
        { y: 60, t: "Txn A", c: COL.heap },
        { y: 180, t: "Txn B", c: COL.index },
      ].map((l, i) => (
        <g key={i}>
          <rect x={12} y={l.y} width={616} height={104} rx={10} fill="#fff" stroke={l.c} strokeWidth={2} />
          <text x={26} y={l.y + 22} fontSize={13} fontWeight="700" fill={l.c}>{l.t}</text>
        </g>
      ))}
      {/* steps A */}
      <rect x={96} y={74} width={150} height={30} rx={6} fill={COL.heapSoft} stroke={COL.heap} />
      <text x={171} y={93} fontSize={10} textAnchor="middle" fill={COL.ink}>reads: 2 on call \u2713</text>
      <rect x={300} y={74} width={170} height={30} rx={6} fill={COL.deadSoft} stroke={COL.dead} />
      <text x={385} y={93} fontSize={10} textAnchor="middle" fill={COL.ink}>sets A = off duty</text>
      <text x={96} y={134} fontSize={10} fill={COL.proc} fontFamily={MONO}>snapshot sees B still on call</text>
      {/* steps B */}
      <rect x={96} y={196} width={150} height={30} rx={6} fill={COL.indexSoft} stroke={COL.index} />
      <text x={171} y={215} fontSize={10} textAnchor="middle" fill={COL.ink}>reads: 2 on call \u2713</text>
      <rect x={300} y={196} width={170} height={30} rx={6} fill={COL.deadSoft} stroke={COL.dead} />
      <text x={385} y={215} fontSize={10} textAnchor="middle" fill={COL.ink}>sets B = off duty</text>
      <text x={96} y={256} fontSize={10} fill={COL.proc} fontFamily={MONO}>snapshot sees A still on call</text>
      {/* outcome */}
      <rect x={486} y={120} width={142} height={84} rx={10} fill={COL.deadSoft} stroke={COL.dead} strokeWidth={2} />
      <text x={557} y={146} fontSize={12} fontWeight="700" textAnchor="middle" fill={COL.dead}>Result</text>
      <text x={557} y={168} fontSize={10} textAnchor="middle" fill={COL.ink}>0 doctors on call</text>
      <text x={557} y={186} fontSize={10} textAnchor="middle" fill={COL.ink}>invariant broken</text>
      <text x={12} y={300} fontSize={10} fill={COL.good}>Serializable detects the read-write dependency cycle and aborts one txn with error 40001.</text>
    </svg>
  ),
  caption: "Each transaction's write is locally valid; only their interleaving violates the rule — exactly the case SSI is built to catch.",
  failures: [
    { name: "Assuming Read Committed gives stable reads", symptom: "A sum computed across two queries in one transaction doesn't add up.", cause: "Read Committed re-snapshots per statement, so a concurrent commit changes what the second query sees.", fix: "Use Repeatable Read for multi-statement consistency, or take all values in a single statement." },
    { name: "Unhandled serialization failures", symptom: "Under Serializable, transactions intermittently fail with SQLSTATE 40001.", cause: "SSI aborts a transaction whose interleaving could break serial order — this is expected, not a bug.", fix: "Wrap Serializable transactions in retry logic that re-runs on 40001 errors." },
    { name: "Write skew under Repeatable Read", symptom: "An invariant like 'at least one row must remain' is silently violated.", cause: "Repeatable Read stops phantoms but not write skew across disjoint rows.", fix: "Promote to Serializable, or take an explicit lock (SELECT ... FOR UPDATE) on the guarding rows." },
  ],
  observe: [
    { note: "Check and set the isolation level of the current transaction:", sql: "SHOW transaction_isolation;\nBEGIN ISOLATION LEVEL REPEATABLE READ;" },
    { note: "Count serialization failures the server has seen:", sql: "SELECT datname, conflicts\nFROM pg_stat_database WHERE datname = current_database();" },
    { note: "Demonstrate a stable snapshot across statements:", sql: "BEGIN ISOLATION LEVEL REPEATABLE READ;\nSELECT count(*) FROM orders;\n-- run again later in the same txn: identical result" },
  ],
  mental: "An isolation level is how often you blink: Read Committed re-opens your eyes before every statement, Repeatable Read keeps them fixed on one frozen photo, and Serializable also checks that nobody rearranged the room while everyone's eyes were closed.",
},
/* ============ CHAPTER 10 ============ */
{
  id: 10, part: 2,
  title: "Locking — Row Locks, Table Locks, Deadlocks",
  core: "Postgres layers explicit locks on top of MVCC: lightweight row locks recorded in the tuple itself, eight table-level modes governed by a compatibility matrix, and a periodic detector that breaks deadlocks by aborting a victim.",
  explanation: (<>
    Even though reads don't lock, writes and explicit lock requests do. There are four <b>row-lock strengths</b> — <C>FOR KEY SHARE</C>, <C>FOR SHARE</C>, <C>FOR NO KEY UPDATE</C>, and <C>FOR UPDATE</C> — ordered from weakest to strongest, designed so foreign-key checks (key share) rarely conflict with ordinary updates. A simple exclusive row lock is recorded by writing the locker's xid into the tuple's <C>xmax</C>; when multiple transactions share-lock the same row, Postgres allocates a <C>pg_multixact</C> entry and stores that id instead. At the table level there are <b>eight lock modes</b> from <C>ACCESS SHARE</C> (taken by every SELECT) up to <C>ACCESS EXCLUSIVE</C> (taken by <C>DROP TABLE</C> and most <C>ALTER TABLE</C>), and a fixed compatibility matrix decides which can coexist. Conflicting requests <b>queue</b> behind the holder, so one slow DDL statement can stall every query that follows it. A separate family of <C>pg_advisory_lock</C> functions gives applications cooperative locks tied to nothing in the schema. Because queued lockers can form cycles, a deadlock detector wakes every <C>deadlock_timeout</C> (1s by default), finds any circular wait, and aborts one transaction to free the rest.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Lock compatibility and deadlock">
      {/* compatibility grid */}
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>Table-lock compatibility (subset)</text>
      {(() => {
        const modes = ["ACCESS SHARE", "ROW EXCL", "SHARE", "ACCESS EXCL"];
        const cells = [
          [1,1,1,0],
          [1,1,0,0],
          [1,0,1,0],
          [0,0,0,0],
        ];
        return (
          <g fontFamily={MONO} fontSize={8}>
            {modes.map((m, ci) => (
              <text key={"c"+ci} x={120 + ci * 44} y={34} textAnchor="middle" fill={COL.proc}>{m.split(" ")[0]}</text>
            ))}
            {modes.map((m, ri) => (
              <g key={"r"+ri}>
                <text x={108} y={56 + ri * 30} textAnchor="end" fill={COL.proc}>{m}</text>
                {cells[ri].map((ok, ci) => (
                  <g key={ci}>
                    <rect x={98 + ci * 44} y={44 + ri * 30} width={40} height={24} rx={4}
                      fill={ok ? COL.goodSoft : COL.deadSoft} stroke={ok ? COL.good : COL.dead} />
                    <text x={118 + ci * 44} y={60 + ri * 30} textAnchor="middle" fontSize={11}
                      fill={ok ? COL.good : COL.dead}>{ok ? "\u2713" : "\u2715"}</text>
                  </g>
                ))}
              </g>
            ))}
          </g>
        );
      })()}
      {/* deadlock circular wait */}
      <text x={350} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>Deadlock: circular wait</text>
      <rect x={372} y={40} width={110} height={50} rx={8} fill={COL.heapSoft} stroke={COL.heap} strokeWidth={2} />
      <text x={427} y={62} fontSize={12} fontWeight="700" textAnchor="middle" fill={COL.heap}>Txn A</text>
      <text x={427} y={80} fontSize={9} textAnchor="middle" fill={COL.ink}>holds row 1</text>
      <rect x={372} y={180} width={110} height={50} rx={8} fill={COL.indexSoft} stroke={COL.index} strokeWidth={2} />
      <text x={427} y={202} fontSize={12} fontWeight="700" textAnchor="middle" fill={COL.index}>Txn B</text>
      <text x={427} y={220} fontSize={9} textAnchor="middle" fill={COL.ink}>holds row 2</text>
      <defs>
        <marker id="ar10" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.dead} />
        </marker>
      </defs>
      <path d="M470,92 C540,120 540,150 478,178" fill="none" stroke={COL.dead} strokeWidth={2} markerEnd="url(#ar10)" />
      <text x={556} y={138} fontSize={9} fill={COL.dead}>wants row 2</text>
      <path d="M384,178 C322,150 322,120 380,92" fill="none" stroke={COL.dead} strokeWidth={2} markerEnd="url(#ar10)" />
      <text x={300} y={138} fontSize={9} fill={COL.dead} textAnchor="end">wants row 1</text>
      <rect x={356} y={248} width={272} height={58} rx={10} fill={COL.deadSoft} stroke={COL.dead} />
      <text x={368} y={270} fontSize={11} fontWeight="700" fill={COL.dead}>Detector fires after deadlock_timeout</text>
      <text x={368} y={290} fontSize={10} fill={COL.ink}>One txn is chosen as victim and rolled back.</text>
    </svg>
  ),
  caption: "The matrix decides who may share a table; when row-level waits form a cycle, the detector picks a victim so the rest proceed.",
  failures: [
    { name: "ALTER TABLE stalls the whole table", symptom: "A quick DDL hangs and a queue of ordinary queries piles up behind it.", cause: "Most ALTER TABLE forms take ACCESS EXCLUSIVE, which conflicts with the ACCESS SHARE every SELECT holds — and queued requests block newcomers too.", fix: "Run DDL with a short lock_timeout, in low-traffic windows, and prefer online-safe forms (e.g. ADD COLUMN without volatile default)." },
    { name: "Frequent deadlocks under concurrency", symptom: "Transactions intermittently abort with 'deadlock detected'.", cause: "Two code paths lock the same rows in different orders, forming a cycle.", fix: "Acquire locks in a consistent global order and add retry logic; inspect the detail in the server log." },
    { name: "Lock pile-up behind a long transaction", symptom: "Throughput collapses and pg_stat_activity shows many sessions in 'Lock' wait.", cause: "A long-running transaction holds a conflicting lock and everyone queues behind it.", fix: "Identify blockers with pg_blocking_pids() and keep write transactions short." },
  ],
  observe: [
    { note: "Locks currently held or awaited, with grant status:", sql: "SELECT relation::regclass, mode, granted, pid\nFROM pg_locks WHERE NOT granted;" },
    { note: "Who is blocking whom, right now:", sql: "SELECT pid, pg_blocking_pids(pid) AS blocked_by, query\nFROM pg_stat_activity WHERE cardinality(pg_blocking_pids(pid)) > 0;" },
    { note: "Take and release an application-level advisory lock:", sql: "SELECT pg_advisory_lock(42);\nSELECT pg_advisory_unlock(42);" },
  ],
  mental: "Locks are the signs on shared office doors — most people only need 'reading, please knock,' a few need 'do not enter,' and when two colleagues each refuse to leave until the other does, the facilities manager (the detector) simply ejects one of them.",
},
/* ============ CHAPTER 11 ============ */
{
  id: 11, part: 3,
  title: "WAL — The Write-Ahead Log",
  core: "Before any change touches a data page, a record describing that change is appended to the WAL and fsynced to disk — so a crash can always be repaired by replaying the log.",
  explanation: (<>
    The write-ahead rule is the foundation of durability: a modification is first described in a <b>WAL record</b> and that record is flushed to disk <i>before</i> the corresponding data page is allowed to reach disk. Each record names a <b>resource manager</b> (heap, btree, etc.) that knows how to redo it, may carry a <b>full-page image</b> the first time a page is touched after a checkpoint, and is stamped with a 64-bit <C>LSN</C> (Log Sequence Number) marking its byte position in the log stream. WAL is stored as a sequence of 16MB segment files under <C>pg_wal/</C>. At commit, the backend must ensure its records are durable; the dedicated <b>WAL writer</b> and the <b>group commit</b> mechanism batch many transactions' flushes into a single <C>fsync</C> to amortize the cost. After a crash, recovery starts at the most recent checkpoint and replays forward, reapplying any change that was in memory but never made it to its data file. Because the log is an authoritative, ordered record of every change, the same stream also powers <b>streaming replication</b>, <b>point-in-time recovery</b>, and <b>logical decoding</b> — knobs like <C>wal_level</C>, <C>synchronous_commit</C>, and <C>max_wal_size</C> tune how much it records and how aggressively it flushes.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="WAL write path and recovery">
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>Commit write path</text>
      {/* buffer pool dirty page */}
      <rect x={12} y={32} width={120} height={70} rx={8} fill={COL.memSoft} stroke={COL.mem} strokeWidth={2} />
      <text x={72} y={54} fontSize={11} fontWeight="700" textAnchor="middle" fill={COL.mem}>Buffer pool</text>
      <rect x={26} y={64} width={92} height={26} rx={4} fill="#fff" stroke={COL.dead} />
      <text x={72} y={81} fontSize={10} textAnchor="middle" fill={COL.dead}>dirty page</text>
      {/* steps */}
      <defs>
        <marker id="arW" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.wal} />
        </marker>
      </defs>
      <rect x={170} y={32} width={130} height={44} rx={8} fill={COL.walSoft} stroke={COL.wal} strokeWidth={2} />
      <text x={235} y={50} fontSize={10} fontWeight="700" textAnchor="middle" fill={COL.ink}>1. Write WAL record</text>
      <text x={235} y={66} fontSize={9} textAnchor="middle" fill={COL.proc} fontFamily={MONO}>to WAL buffer</text>
      <rect x={170} y={86} width={130} height={44} rx={8} fill={COL.walSoft} stroke={COL.wal} strokeWidth={2} />
      <text x={235} y={104} fontSize={10} fontWeight="700" textAnchor="middle" fill={COL.ink}>2. fsync WAL</text>
      <text x={235} y={120} fontSize={9} textAnchor="middle" fill={COL.proc} fontFamily={MONO}>durable on disk</text>
      <rect x={330} y={32} width={130} height={44} rx={8} fill={COL.goodSoft} stroke={COL.good} strokeWidth={2} />
      <text x={395} y={50} fontSize={10} fontWeight="700" textAnchor="middle" fill={COL.ink}>3. Ack COMMIT</text>
      <text x={395} y={66} fontSize={9} textAnchor="middle" fill={COL.proc}>client released</text>
      <rect x={330} y={86} width={130} height={44} rx={8} fill={COL.heapSoft} stroke={COL.heap} strokeWidth={2} strokeDasharray="4 3" />
      <text x={395} y={104} fontSize={10} fontWeight="700" textAnchor="middle" fill={COL.ink}>4. Later: flush page</text>
      <text x={395} y={120} fontSize={9} textAnchor="middle" fill={COL.proc}>at checkpoint</text>
      <path d="M132,60 L168,54" stroke={COL.wal} strokeWidth={2} markerEnd="url(#arW)" />
      <path d="M300,54 L328,54" stroke={COL.wal} strokeWidth={2} markerEnd="url(#arW)" />
      <text x={150} y={150} fontSize={9} fill={COL.proc}>WAL goes to disk before the heap page \u2014 that ordering is the whole guarantee.</text>
      {/* WAL segments */}
      <text x={12} y={186} fontSize={11} fontWeight="700" fill={COL.ink}>pg_wal/ \u2014 16MB segments, ordered by LSN</text>
      {[0,1,2,3,4].map((i) => (
        <g key={i}>
          <rect x={12 + i * 88} y={196} width={80} height={34} rx={6} fill={COL.walSoft} stroke={COL.wal} />
          <text x={52 + i * 88} y={217} fontSize={9} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>seg {i+1}</text>
        </g>
      ))}
      {/* recovery */}
      <text x={12} y={258} fontSize={11} fontWeight="700" fill={COL.ink}>Crash recovery</text>
      <rect x={12} y={268} width={150} height={38} rx={8} fill="#fff" stroke={COL.good} strokeWidth={2} />
      <text x={87} y={285} fontSize={10} textAnchor="middle" fill={COL.good} fontWeight="700">last checkpoint</text>
      <text x={87} y={300} fontSize={9} textAnchor="middle" fill={COL.proc}>start replay here</text>
      <path d="M168,287 L300,287" stroke={COL.wal} strokeWidth={2} markerEnd="url(#arW)" />
      <text x={234} y={280} fontSize={9} textAnchor="middle" fill={COL.proc}>redo each record</text>
      <rect x={306} y={268} width={120} height={38} rx={8} fill={COL.deadSoft} stroke={COL.dead} strokeWidth={2} />
      <text x={366} y={291} fontSize={11} textAnchor="middle" fill={COL.dead} fontWeight="700">crash point</text>
    </svg>
  ),
  caption: "Durability is an ordering rule, not a faster disk: the log is forced first, the data page can wait until a checkpoint.",
  failures: [
    { name: "synchronous_commit=off data loss", symptom: "After a crash, the last fraction of a second of 'committed' transactions are gone.", cause: "With async commit, COMMIT returns before the WAL fsync completes, so recent records can be lost.", fix: "Use the default synchronous_commit=on for data you cannot lose; reserve off for tolerant workloads." },
    { name: "pg_wal fills the disk", symptom: "The server stops accepting writes; the data directory is full of WAL segments.", cause: "An inactive replication slot or archiver failure prevents old segments from being recycled.", fix: "Drop or advance the stuck slot, fix archive_command, and cap retention with max_slot_wal_keep_size." },
    { name: "fsync turned off in production", symptom: "Great write throughput, then total corruption after an unclean shutdown.", cause: "fsync=off lets the OS reorder/lose writes, breaking the write-ahead ordering guarantee.", fix: "Never run production with fsync=off; if I/O is the bottleneck, batch commits or use faster storage." },
  ],
  observe: [
    { note: "Current WAL write position (LSN) on the primary:", sql: "SELECT pg_current_wal_lsn();" },
    { note: "How much WAL a workload generates between two samples:", sql: "SELECT pg_size_pretty(\n  pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0'));" },
    { note: "WAL-related settings in effect:", sql: "SELECT name, setting FROM pg_settings\nWHERE name IN ('wal_level','synchronous_commit','max_wal_size');" },
  ],
  mental: "WAL is a ship captain's logbook: the captain writes down every action the instant it's decided, so even if the ship is damaged the crew can reconstruct exactly what happened by reading the log forward from the last known-good entry.",
},
/* ============ CHAPTER 12 ============ */
{
  id: 12, part: 3,
  title: "Checkpoints",
  core: "A checkpoint flushes all dirty buffers to disk and records the log position reached, so crash recovery only has to replay WAL written after the most recent checkpoint instead of since the dawn of time.",
  explanation: (<>
    WAL replay is bounded by checkpoints. A <b>checkpoint</b> is the guarantee that every dirty page in the buffer pool as of some LSN has been written to its data file, which means recovery can safely ignore all WAL before that point. The checkpointer runs a sequence: it notes the <b>start LSN</b>, writes out all dirty buffers (spread over time to avoid an I/O spike), writes a <b>checkpoint record</b> into the WAL, and finally stamps the checkpoint LSN into the <C>pg_control</C> file that recovery reads first. On restart, Postgres opens <C>pg_control</C>, finds the latest checkpoint, and begins redo from there. The timing is a direct tradeoff: checkpoints fire when either <C>checkpoint_timeout</C> (5 minutes by default) elapses or <C>max_wal_size</C> (1GB) of WAL has accumulated, whichever comes first. Setting them too frequent causes repeated full-page-image writes and I/O bursts; too rare means a smaller WAL footprint but a longer, scarier recovery. <C>checkpoint_completion_target</C> smears the flushing across the interval so the disk isn't slammed all at once.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Checkpoints on the WAL timeline">
      <text x={12} y={18} fontSize={12} fontWeight="700" fill={COL.ink}>WAL timeline with checkpoints</text>
      {/* timeline bar */}
      <line x1={20} y1={120} x2={620} y2={120} stroke={COL.line} strokeWidth={2} />
      {/* grayed pre-checkpoint region */}
      <rect x={20} y={104} width={300} height={32} fill="#f1f5f9" opacity={0.9} />
      <text x={170} y={96} fontSize={9} textAnchor="middle" fill={COL.proc}>already checkpointed \u2014 recovery skips this</text>
      {/* checkpoint markers */}
      {[
        { x: 120, n: "CKPT 1" },
        { x: 320, n: "CKPT 2 (latest)" },
      ].map((c, i) => (
        <g key={i}>
          <line x1={c.x} y1={92} x2={c.x} y2={148} stroke={COL.good} strokeWidth={3} />
          <circle cx={c.x} cy={120} r={6} fill={COL.good} />
          <text x={c.x} y={166} fontSize={9} textAnchor="middle" fill={COL.good} fontWeight="700">{c.n}</text>
        </g>
      ))}
      {/* WAL records as ticks */}
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1={40 + i * 24} y1={114} x2={40 + i * 24} y2={126} stroke={COL.wal} strokeWidth={2} />
      ))}
      {/* crash */}
      <g>
        <line x1={560} y1={92} x2={560} y2={148} stroke={COL.dead} strokeWidth={3} />
        <text x={560} y={86} fontSize={14} textAnchor="middle" fill={COL.dead} fontWeight="700">\u2715</text>
        <text x={560} y={166} fontSize={9} textAnchor="middle" fill={COL.dead} fontWeight="700">crash</text>
      </g>
      {/* replay arrow from latest ckpt to crash */}
      <defs>
        <marker id="arC" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.heap} />
        </marker>
      </defs>
      <path d="M320,196 L556,196" stroke={COL.heap} strokeWidth={2.5} markerEnd="url(#arC)" />
      <text x={438} y={188} fontSize={10} textAnchor="middle" fill={COL.heap} fontWeight="700">replay only this span</text>
      <line x1={320} y1={150} x2={320} y2={200} stroke={COL.good} strokeDasharray="3 3" />
      <line x1={560} y1={150} x2={560} y2={200} stroke={COL.dead} strokeDasharray="3 3" />
      {/* pg_control box */}
      <rect x={20} y={230} width={280} height={72} rx={10} fill="#fff" stroke={COL.line} />
      <text x={34} y={252} fontSize={12} fontWeight="700" fill={COL.ink}>pg_control</text>
      <text x={34} y={272} fontSize={10} fill={COL.ink} fontFamily={MONO}>latest checkpoint LSN = CKPT 2</text>
      <text x={34} y={290} fontSize={10} fill={COL.proc}>recovery reads this file first to find the start point</text>
      <rect x={320} y={230} width={300} height={72} rx={10} fill={COL.walSoft} stroke={COL.wal} />
      <text x={334} y={252} fontSize={12} fontWeight="700" fill={COL.ink}>Triggers</text>
      <text x={334} y={272} fontSize={10} fill={COL.ink} fontFamily={MONO}>checkpoint_timeout (5min)</text>
      <text x={334} y={290} fontSize={10} fill={COL.ink} fontFamily={MONO}>max_wal_size (1GB) \u2014 whichever first</text>
    </svg>
  ),
  caption: "The latest checkpoint LSN in pg_control is the only place recovery needs to begin; everything to its left is already safely on disk.",
  failures: [
    { name: "Checkpoint I/O spikes", symptom: "Periodic latency stalls every few minutes correlated with disk write bursts.", cause: "Too much dirty data is flushed at once when a checkpoint fires.", fix: "Raise max_wal_size and set checkpoint_completion_target near 0.9 to spread the writes." },
    { name: "Painfully long crash recovery", symptom: "After a crash the database takes many minutes to come back up.", cause: "Checkpoints are too infrequent, so there's a huge span of WAL to replay.", fix: "Lower checkpoint_timeout / max_wal_size to bound recovery time, accepting more steady-state I/O." },
    { name: "Full-page-image WAL bloat", symptom: "WAL volume balloons right after each checkpoint.", cause: "The first write to a page after a checkpoint logs a full-page image; frequent checkpoints multiply these.", fix: "Make checkpoints less frequent and consider wal_compression to shrink full-page images." },
  ],
  observe: [
    { note: "Checkpoint activity counters (PG17+ view):", sql: "SELECT num_timed, num_requested, write_time, sync_time\nFROM pg_stat_checkpointer;" },
    { note: "The checkpoint position recovery would start from:", sql: "SELECT checkpoint_lsn, redo_lsn\nFROM pg_control_checkpoint();" },
    { note: "Checkpoint tuning settings:", sql: "SELECT name, setting FROM pg_settings\nWHERE name LIKE 'checkpoint%' OR name = 'max_wal_size';" },
  ],
  mental: "A checkpoint is a video-game save point: dying still costs you the progress since the last save, so you save often enough that re-doing the lost stretch is quick \u2014 but not so often that saving itself becomes the chore.",
},
/* ============ CHAPTER 13 ============ */
{
  id: 13, part: 3,
  title: "Replication — Streaming and Logical",
  core: "Physical replication ships raw WAL bytes for a replica to replay into a byte-identical copy; logical replication decodes that same WAL into row-level change events that a subscriber can apply selectively.",
  explanation: (<>
    Both forms of replication are built on the WAL. In <b>physical (streaming) replication</b>, a <C>walsender</C> process on the primary streams WAL bytes to a <C>walreceiver</C> on the standby, whose startup process continuously replays them — producing a block-for-block identical copy that can serve read-only queries in <b>hot standby</b> mode. Replication can be <b>asynchronous</b> (the primary acks the commit immediately and the standby may lag) or <b>synchronous</b> (the primary waits for the standby to flush the WAL before acking), trading latency for zero-data-loss failover. <b>Replication lag</b> is just the gap between the primary's current LSN and the standby's replayed LSN, visible in <C>pg_stat_replication</C>. <b>Logical replication</b> instead runs the WAL through a <i>logical decoding</i> plugin that reconstructs INSERT/UPDATE/DELETE events for specific tables, letting you replicate across major versions, platforms, or into a subset of tables. Both rely on <b>replication slots</b>, which pin WAL on the primary until the consumer confirms receipt — safe against disconnects, but a dropped or inactive slot will retain WAL forever and fill the disk unless bounded by <C>max_slot_wal_keep_size</C>.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Physical and logical replication">
      {/* primary */}
      <rect x={16} y={40} width={150} height={90} rx={10} fill={COL.heapSoft} stroke={COL.heap} strokeWidth={2} />
      <text x={91} y={62} fontSize={13} fontWeight="700" textAnchor="middle" fill={COL.heap}>Primary</text>
      <rect x={30} y={74} width={122} height={26} rx={5} fill="#fff" stroke={COL.wal} />
      <text x={91} y={91} fontSize={10} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>walsender</text>
      <text x={91} y={118} fontSize={9} textAnchor="middle" fill={COL.proc}>WAL stream source</text>
      {/* physical replica */}
      <defs>
        <marker id="arR" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.wal} />
        </marker>
      </defs>
      <path d="M168,72 L300,72" stroke={COL.wal} strokeWidth={2.5} markerEnd="url(#arR)" />
      <text x={234} y={64} fontSize={9} textAnchor="middle" fill={COL.wal} fontWeight="700">raw WAL bytes</text>
      <rect x={304} y={40} width={160} height={90} rx={10} fill={COL.goodSoft} stroke={COL.good} strokeWidth={2} />
      <text x={384} y={62} fontSize={13} fontWeight="700" textAnchor="middle" fill={COL.good}>Physical standby</text>
      <rect x={318} y={74} width={132} height={26} rx={5} fill="#fff" stroke={COL.good} />
      <text x={384} y={91} fontSize={10} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>walreceiver \u2192 replay</text>
      <text x={384} y={118} fontSize={9} textAnchor="middle" fill={COL.proc}>byte-identical, hot standby</text>
      {/* lag note */}
      <rect x={484} y={52} width={140} height={66} rx={10} fill="#fff" stroke={COL.line} />
      <text x={554} y={72} fontSize={10} fontWeight="700" textAnchor="middle" fill={COL.ink}>Lag =</text>
      <text x={554} y={90} fontSize={9} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>primary LSN</text>
      <text x={554} y={104} fontSize={9} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>\u2212 replay LSN</text>
      {/* logical decoding layer */}
      <text x={16} y={170} fontSize={12} fontWeight="700" fill={COL.ink}>Logical decoding \u2014 same WAL, different consumer</text>
      <rect x={16} y={184} width={150} height={50} rx={8} fill={COL.walSoft} stroke={COL.wal} strokeWidth={2} />
      <text x={91} y={205} fontSize={10} textAnchor="middle" fill={COL.ink}>WAL records</text>
      <text x={91} y={222} fontSize={9} textAnchor="middle" fill={COL.proc} fontFamily={MONO}>physical changes</text>
      <path d="M168,209 L228,209" stroke={COL.index} strokeWidth={2.5} markerEnd="url(#arR)" />
      <rect x={232} y={184} width={170} height={50} rx={8} fill={COL.indexSoft} stroke={COL.index} strokeWidth={2} />
      <text x={317} y={205} fontSize={10} textAnchor="middle" fill={COL.index} fontWeight="700">decoding plugin</text>
      <text x={317} y={222} fontSize={9} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>INSERT/UPDATE/DELETE</text>
      <path d="M404,209 L464,209" stroke={COL.index} strokeWidth={2.5} markerEnd="url(#arR)" />
      <rect x={468} y={184} width={156} height={50} rx={8} fill={COL.goodSoft} stroke={COL.good} strokeWidth={2} />
      <text x={546} y={205} fontSize={10} textAnchor="middle" fill={COL.good} fontWeight="700">subscriber</text>
      <text x={546} y={222} fontSize={9} textAnchor="middle" fill={COL.proc}>cross-version, per-table</text>
      {/* slot warning */}
      <rect x={16} y={252} width={608} height={54} rx={10} fill={COL.deadSoft} stroke={COL.dead} />
      <text x={30} y={273} fontSize={11} fontWeight="700" fill={COL.dead}>Replication slots pin WAL until consumed</text>
      <text x={30} y={293} fontSize={10} fill={COL.ink}>An inactive slot retains WAL indefinitely \u2014 bound it with max_slot_wal_keep_size or pg_wal fills the disk.</text>
    </svg>
  ),
  caption: "One WAL stream feeds two very different consumers: a literal byte-replayer and a logical change-event decoder.",
  failures: [
    { name: "Runaway WAL from an orphaned slot", symptom: "pg_wal grows without bound long after a replica was decommissioned.", cause: "Its replication slot still exists and pins every segment since the slot's confirmed LSN.", fix: "Drop unused slots with pg_drop_replication_slot() and monitor pg_replication_slots." },
    { name: "Synchronous replica stalls the primary", symptom: "Commits hang on the primary when the standby goes away.", cause: "synchronous_commit=remote_apply/on with a required sync standby waits forever for an ack.", fix: "Use multiple sync standbys (quorum) or relax the sync requirement so a single failure can't block commits." },
    { name: "Silent logical replication divergence", symptom: "Subscriber row counts drift from the publisher over time.", cause: "Conflicts (e.g. duplicate keys) or an unreplicated DDL change broke apply on the subscriber.", fix: "Check subscriber logs and pg_stat_subscription; logical replication does not replicate DDL automatically." },
  ],
  observe: [
    { note: "Connected standbys and their lag in bytes:", sql: "SELECT application_name, state,\n  pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replay_lag\nFROM pg_stat_replication;" },
    { note: "Replication slots and the WAL they are retaining:", sql: "SELECT slot_name, active,\n  pg_size_pretty(pg_wal_lsn_diff(\n    pg_current_wal_lsn(), restart_lsn)) AS retained\nFROM pg_replication_slots;" },
    { note: "Am I a primary or a standby right now?", sql: "SELECT pg_is_in_recovery();" },
  ],
  mental: "Physical replication is a photocopier making an exact duplicate page by page; logical replication is a translator who reads the original and re-dictates its meaning into another room \u2014 same source, but one copies bytes and the other copies intent.",
},
/* ============ CHAPTER 14 ============ */
{
  id: 14, part: 4,
  title: "The Buffer Pool",
  core: "shared_buffers is a fixed array of 8KB frames that caches hot pages; a hash table finds them in O(1) and a clock-sweep counter cheaply approximates LRU to decide what to evict.",
  explanation: (<>
    The buffer pool is Postgres's primary in-memory cache, sized by <C>shared_buffers</C> (default 128MB, commonly set near 25% of RAM). It is an array of fixed 8KB <b>buffer frames</b>, each paired with a <b>buffer descriptor</b> holding the page identity, a <b>dirty</b> flag, a <b>pin count</b>, and a <b>usage count</b>. To locate a page, a backend hashes the key <C>(relation, fork, block)</C> through a shared hash table that maps directly to a frame, so a hit costs a hash probe rather than disk I/O. Eviction uses the <b>clock-sweep</b> algorithm: every access bumps a frame's usage count, and a rotating "hand" decrements counts as it passes, evicting the first frame it finds at zero — an O(1) approximation of LRU that avoids maintaining a true ordered list. A frame currently being read or written is <b>pinned</b> and cannot be evicted until released. Because the OS also caches the same files, data often lives in memory twice (<b>double buffering</b>); Postgres can't yet do direct I/O, so the practical mitigations are right-sizing shared_buffers and using huge pages. A healthy system shows a <b>buffer hit ratio</b> above 99% — the fraction of page requests served without touching disk.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Buffer pool frames and clock sweep">
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>Hash lookup \u2192 frame</text>
      {/* hash key box */}
      <rect x={12} y={28} width={150} height={48} rx={8} fill={COL.memSoft} stroke={COL.mem} strokeWidth={2} />
      <text x={87} y={48} fontSize={10} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>(rel, fork, block)</text>
      <text x={87} y={66} fontSize={9} textAnchor="middle" fill={COL.proc}>buffer tag</text>
      <defs>
        <marker id="arB" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.mem} />
        </marker>
      </defs>
      <path d="M164,52 L210,52" stroke={COL.mem} strokeWidth={2} markerEnd="url(#arB)" />
      <text x={250} y={48} fontSize={10} textAnchor="middle" fill={COL.proc} fontFamily={MONO}>hash</text>
      <path d="M286,52 L324,52" stroke={COL.mem} strokeWidth={2} markerEnd="url(#arB)" />
      {/* frame grid */}
      <text x={332} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>Buffer frames (usage count / state)</text>
      {(() => {
        const frames = [
          { u: 3, s: "clean", c: COL.heap, sc: COL.heapSoft },
          { u: 0, s: "evict\u2192", c: COL.dead, sc: COL.deadSoft },
          { u: 2, s: "dirty", c: COL.dead, sc: "#fff" },
          { u: 5, s: "pinned", c: COL.good, sc: COL.goodSoft },
          { u: 1, s: "clean", c: COL.heap, sc: COL.heapSoft },
          { u: 4, s: "dirty", c: COL.dead, sc: "#fff" },
          { u: 0, s: "free", c: COL.line, sc: "#f8fafc" },
          { u: 2, s: "clean", c: COL.heap, sc: COL.heapSoft },
        ];
        return frames.map((f, i) => {
          const col = i % 4, row = Math.floor(i / 4);
          const x = 332 + col * 74, y = 30 + row * 70;
          return (
            <g key={i}>
              <rect x={x} y={y} width={66} height={58} rx={6} fill={f.sc} stroke={f.c} strokeWidth={2} />
              <text x={x + 33} y={y + 24} fontSize={15} textAnchor="middle" fill={f.c} fontWeight="700" fontFamily={MONO}>{f.u}</text>
              <text x={x + 33} y={y + 44} fontSize={8.5} textAnchor="middle" fill={COL.ink}>{f.s}</text>
            </g>
          );
        });
      })()}
      {/* clock hand */}
      <circle cx={250} cy={150} r={40} fill="none" stroke={COL.proc} strokeWidth={2} />
      <line x1={250} y1={150} x2={250} y2={116} stroke={COL.dead} strokeWidth={3} />
      <circle cx={250} cy={150} r={4} fill={COL.dead} />
      <text x={250} y={208} fontSize={10} textAnchor="middle" fill={COL.proc} fontWeight="700">clock hand</text>
      <text x={250} y={224} fontSize={9} textAnchor="middle" fill={COL.proc}>decrements, evicts at 0</text>
      {/* legend / hit ratio */}
      <rect x={12} y={250} width={616} height={56} rx={10} fill="#fff" stroke={COL.line} />
      <text x={26} y={272} fontSize={11} fontWeight="700" fill={COL.ink}>Eviction rule</text>
      <text x={26} y={292} fontSize={10} fill={COL.ink}>Access raises usage count; the sweep lowers it; the first frame at 0 that is unpinned is reused. Target hit ratio &gt; 99%.</text>
    </svg>
  ),
  caption: "Finding a page is a hash probe; choosing a victim is a cheap rotating counter, not a maintained LRU list.",
  failures: [
    { name: "shared_buffers too small", symptom: "High disk read I/O and a hit ratio well below 99% on a working set that should fit in RAM.", cause: "Hot pages are constantly evicted because the pool can't hold the working set.", fix: "Raise shared_buffers toward ~25% of RAM and re-measure the hit ratio." },
    { name: "shared_buffers too large", symptom: "Performance degrades and double-buffering wastes memory.", cause: "An oversized pool steals RAM from the OS cache and worsens duplication without proportional benefit.", fix: "Keep shared_buffers moderate, let the OS cache do its part, and consider huge pages." },
    { name: "A few hot pages thrash the cache", symptom: "A large one-off scan evicts everyone's working set and latency spikes for all queries.", cause: "Clock-sweep gives sequential scans the chance to flush hot pages; very large scans pollute the pool.", fix: "Rely on Postgres's ring-buffer strategy for big scans and avoid unnecessary full-table reads in peak hours." },
  ],
  observe: [
    { note: "Buffer cache hit ratio for the current database:", sql: "SELECT round(100.0 * blks_hit /\n  nullif(blks_hit + blks_read, 0), 2) AS hit_pct\nFROM pg_stat_database WHERE datname = current_database();" },
    { note: "What is actually living in the buffer pool (needs pg_buffercache):", sql: "CREATE EXTENSION IF NOT EXISTS pg_buffercache;\nSELECT relname, count(*) AS buffers\nFROM pg_buffercache b JOIN pg_class c ON b.relfilenode = pg_relation_filenode(c.oid)\nGROUP BY relname ORDER BY buffers DESC LIMIT 10;" },
    { note: "How big the pool is:", sql: "SHOW shared_buffers;" },
  ],
  mental: "The buffer pool is a cook's countertop: ingredients you keep reaching for stay within arm's reach, and when space runs out you clear away whatever you haven't touched in a while \u2014 you don't keep a meticulous list, you just remember roughly what you've used lately.",
},
/* ============ CHAPTER 15 ============ */
{
  id: 15, part: 4,
  title: "Work Memory and Sort/Hash Operations",
  core: "work_mem is the budget for a single sort or hash node — not the whole query — and when an operation exceeds it, the work spills from fast in-memory algorithms to disk-backed ones.",
  explanation: (<>
    <C>work_mem</C> caps the memory one sort or hash operation may use before it must spill to temporary files on disk. A <b>sort</b> that fits in work_mem runs an in-memory quicksort; if it overflows, Postgres switches to an <b>external merge sort</b>, writing sorted runs to temp files in <C>pgsql_tmp</C> and merging them — correct but far slower. A <b>hash join</b> builds a hash table on the smaller input in work_mem and probes it with the larger; if the build side won't fit, it switches to a <b>batched (grace) hash join</b> that partitions both inputs to disk and processes them in pieces. Hash aggregation behaves the same way. The dangerous subtlety is that work_mem is <i>per operation, per connection</i>: a single complex query can have many sort/hash nodes, and many concurrent connections multiply that, so peak memory roughly equals <C>connections × nodes × work_mem</C>. Set it too low and queries spill constantly; set it too high and a burst of concurrency can drive the server into the OOM killer. Logging is your friend here — <C>log_temp_files</C> records every spill so you can see which queries blow past the budget.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="In-memory vs disk-spill sort paths">
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>One sort node, two fates \u2014 decided by work_mem</text>
      {/* threshold line */}
      <line x1={320} y1={30} x2={320} y2={296} stroke={COL.wal} strokeWidth={2} strokeDasharray="5 4" />
      <rect x={262} y={32} width={116} height={22} rx={6} fill={COL.walSoft} stroke={COL.wal} />
      <text x={320} y={47} fontSize={10} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>work_mem limit</text>
      {/* in-memory path */}
      <text x={40} y={74} fontSize={11} fontWeight="700" fill={COL.good}>Fits in memory</text>
      <rect x={20} y={84} width={120} height={40} rx={8} fill={COL.memSoft} stroke={COL.mem} strokeWidth={2} />
      <text x={80} y={108} fontSize={10} textAnchor="middle" fill={COL.ink}>data \u2264 work_mem</text>
      <defs>
        <marker id="arM" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.good} />
        </marker>
      </defs>
      <path d="M80,126 L80,150" stroke={COL.good} strokeWidth={2} markerEnd="url(#arM)" />
      <rect x={20} y={154} width={120} height={40} rx={8} fill={COL.goodSoft} stroke={COL.good} strokeWidth={2} />
      <text x={80} y={178} fontSize={10} textAnchor="middle" fill={COL.good} fontWeight="700">quicksort (RAM)</text>
      <path d="M80,196 L80,220" stroke={COL.good} strokeWidth={2} markerEnd="url(#arM)" />
      <rect x={20} y={224} width={120} height={36} rx={8} fill="#fff" stroke={COL.good} />
      <text x={80} y={246} fontSize={10} textAnchor="middle" fill={COL.ink}>sorted output</text>
      <text x={80} y={284} fontSize={10} textAnchor="middle" fill={COL.good} fontWeight="700">fast \u2713</text>
      {/* disk spill path */}
      <text x={420} y={74} fontSize={11} fontWeight="700" fill={COL.dead}>Too large \u2192 spill</text>
      <rect x={400} y={84} width={140} height={40} rx={8} fill="#fff" stroke={COL.dead} strokeWidth={2} />
      <text x={470} y={108} fontSize={10} textAnchor="middle" fill={COL.ink}>data &gt; work_mem</text>
      <defs>
        <marker id="arD" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.dead} />
        </marker>
      </defs>
      <path d="M470,126 L470,150" stroke={COL.dead} strokeWidth={2} markerEnd="url(#arD)" />
      <rect x={400} y={154} width={140} height={40} rx={8} fill={COL.deadSoft} stroke={COL.dead} strokeWidth={2} />
      <text x={470} y={172} fontSize={10} textAnchor="middle" fill={COL.dead} fontWeight="700">write sorted runs</text>
      <text x={470} y={187} fontSize={9} textAnchor="middle" fill={COL.proc} fontFamily={MONO}>pgsql_tmp temp files</text>
      <path d="M470,196 L470,220" stroke={COL.dead} strokeWidth={2} markerEnd="url(#arD)" />
      <rect x={400} y={224} width={140} height={36} rx={8} fill={COL.deadSoft} stroke={COL.dead} strokeWidth={2} />
      <text x={470} y={246} fontSize={10} textAnchor="middle" fill={COL.dead} fontWeight="700">external merge</text>
      <text x={470} y={284} fontSize={10} textAnchor="middle" fill={COL.dead} fontWeight="700">slow, disk-bound</text>
    </svg>
  ),
  caption: "The same logical sort is a quicksort or a multi-pass disk merge depending entirely on whether it fits the per-node budget.",
  failures: [
    { name: "Constant temp-file spills", symptom: "Queries are slow and the log fills with 'temporary file' messages.", cause: "work_mem is too small for the sorts/hashes these queries need, forcing disk-backed algorithms.", fix: "Raise work_mem for the session or role running heavy analytics, not globally." },
    { name: "Out-of-memory under concurrency", symptom: "The OOM killer terminates Postgres during traffic spikes.", cause: "Many connections each ran multi-node queries, and total work_mem usage exceeded RAM.", fix: "Lower the global work_mem and bound concurrency (connection pooler); size for peak parallelism." },
    { name: "Surprise from per-node multiplication", symptom: "A single query uses far more memory than work_mem suggests.", cause: "The plan has several sort/hash nodes, each entitled to its own work_mem.", fix: "Inspect EXPLAIN for the number of memory-hungry nodes and set work_mem accordingly." },
  ],
  observe: [
    { note: "Turn on logging of every disk spill:", sql: "SET log_temp_files = 0;\n-- then watch the server log for temp file sizes" },
    { note: "See whether a sort fit in memory or spilled:", sql: "EXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders ORDER BY created_at;\n-- look for 'Sort Method: external merge  Disk: ...'" },
    { note: "Current budget:", sql: "SHOW work_mem;" },
  ],
  mental: "work_mem is the size of your desk: a task whose papers all fit lets you sort them in one sweep, but the moment they overflow you're shuttling stacks to the floor and back \u2014 and every coworker has their own desk, so handing everyone a huge one can bankrupt the whole office.",
},
/* ============ CHAPTER 16 ============ */
{
  id: 16, part: 5,
  title: "Statistics and the pg_statistic Catalog",
  core: "The planner can't see your data, only summaries of it — ANALYZE samples each table into pg_statistic, and every cost estimate downstream rests on how accurate those summaries are.",
  explanation: (<>
    The optimizer never scans your data to decide a plan; it reasons from <b>statistics</b> stored in <C>pg_statistic</C> (readably exposed via the <C>pg_stats</C> view). <C>ANALYZE</C> reads a random sample — roughly <C>300 × default_statistics_target</C> rows — and computes per-column summaries: <C>n_distinct</C> (number of distinct values), <C>correlation</C> (how closely physical row order matches sorted order, from -1 to 1), <C>most_common_vals</C> with their <C>most_common_freqs</C>, and <C>histogram_bounds</C> describing the rest of the distribution. From these the planner derives <b>selectivity</b> — the fraction of rows a predicate will match — and multiplies it by the table's row estimate to get a cardinality. When those estimates are right, costing is sound; when they're <b>stale or skewed</b>, the plan can be catastrophically wrong. The classic failure: a column truly has 100 distinct values but stats claim 1000, so the planner thinks a join produces ten times fewer rows than it does, picks a <b>nested loop</b> over a hash join, and the query runs 100× slower. You raise resolution with <C>ALTER TABLE ... ALTER COLUMN ... SET STATISTICS</C>, and capture cross-column dependencies the per-column model misses with <C>CREATE STATISTICS</C>.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Column statistics visualized">
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>What pg_statistic stores for one column</text>
      {/* histogram */}
      <text x={12} y={40} fontSize={11} fontWeight="700" fill={COL.heap}>histogram_bounds</text>
      {(() => {
        const h = [40, 70, 55, 90, 60, 110, 75, 95];
        return h.map((v, i) => (
          <g key={i}>
            <rect x={16 + i * 30} y={170 - v} width={24} height={v} rx={3} fill={COL.heapSoft} stroke={COL.heap} />
          </g>
        ));
      })()}
      <line x1={12} y1={170} x2={260} y2={170} stroke={COL.line} />
      <text x={12} y={186} fontSize={9} fill={COL.proc}>equal-frequency buckets across the value range</text>
      {/* MCV table */}
      <text x={290} y={40} fontSize={11} fontWeight="700" fill={COL.index}>most_common_vals / freqs</text>
      {[
        { v: "'active'", f: "0.62" },
        { v: "'pending'", f: "0.21" },
        { v: "'closed'", f: "0.12" },
      ].map((r, i) => (
        <g key={i}>
          <rect x={290} y={52 + i * 30} width={150} height={26} rx={5} fill={COL.indexSoft} stroke={COL.index} />
          <text x={302} y={69 + i * 30} fontSize={10} fill={COL.ink} fontFamily={MONO}>{r.v}</text>
          <rect x={450} y={52 + i * 30} width={170} height={26} rx={5} fill="#fff" stroke={COL.index} />
          <text x={462} y={69 + i * 30} fontSize={10} fill={COL.ink} fontFamily={MONO}>{r.f}</text>
        </g>
      ))}
      {/* correlation strip */}
      <text x={290} y={166} fontSize={11} fontWeight="700" fill={COL.good}>correlation \u2248 0.93 (well-ordered)</text>
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x={290 + i * 16} y={176} width={13} height={14} rx={2}
          fill={i < 18 ? COL.goodSoft : COL.deadSoft} stroke={i < 18 ? COL.good : COL.dead} />
      ))}
      {/* the failure */}
      <rect x={12} y={206} width={616} height={100} rx={10} fill={COL.deadSoft} stroke={COL.dead} strokeWidth={2} />
      <text x={28} y={228} fontSize={12} fontWeight="700" fill={COL.dead}>How one wrong number wrecks a plan</text>
      <text x={28} y={250} fontSize={11} fill={COL.ink}>n_distinct says 1000, reality is 100 \u2192 selectivity 10\u00d7 too small \u2192</text>
      <text x={28} y={270} fontSize={11} fill={COL.ink}>estimated 50 rows, actual 5000 rows \u2192 planner picks Nested Loop \u2192</text>
      <text x={28} y={290} fontSize={11} fontWeight="700" fill={COL.dead}>5000 index lookups instead of one Hash Join \u2014 ~100\u00d7 slower.</text>
    </svg>
  ),
  caption: "Histograms, common values, and correlation are the only lens the planner has — every cardinality estimate is derived from them.",
  failures: [
    { name: "Stale stats after a bulk load", symptom: "Right after loading millions of rows, queries pick terrible plans.", cause: "pg_statistic still reflects the old (or empty) table, so cardinalities are wildly off.", fix: "Run ANALYZE on the table immediately after large loads; don't wait for autovacuum." },
    { name: "Skewed column under-sampled", symptom: "Queries filtering on a heavily skewed column estimate rows poorly.", cause: "The default statistics target is too coarse to capture the distribution.", fix: "Increase per-column resolution with ALTER TABLE ... SET STATISTICS and re-ANALYZE." },
    { name: "Correlated columns mis-estimated", symptom: "A multi-column predicate's estimate is far off even with fresh stats.", cause: "Per-column stats assume independence; correlated columns break that assumption.", fix: "Create extended statistics with CREATE STATISTICS (dependencies, ndistinct)." },
  ],
  observe: [
    { note: "Inspect a column's gathered statistics:", sql: "SELECT attname, n_distinct, correlation, most_common_vals\nFROM pg_stats WHERE tablename = 'orders';" },
    { note: "Refresh statistics for one table:", sql: "ANALYZE orders;" },
    { note: "Capture cross-column dependencies:", sql: "CREATE STATISTICS orders_stx (dependencies)\nON user_id, status FROM orders;\nANALYZE orders;" },
  ],
  mental: "Statistics are the navigator's depth chart: the ship is steered entirely from the chart, never by looking at the seabed \u2014 so an out-of-date chart sends you confidently onto the rocks.",
},
/* ============ CHAPTER 17 ============ */
{
  id: 17, part: 5,
  title: "The Query Planner — Join Strategies",
  core: "Postgres has three join algorithms with very different cost curves, and it uses dynamic programming to pick both the algorithm and the order of joins that minimize estimated total cost.",
  explanation: (<>
    There are three ways to join two relations. A <b>Nested Loop</b> scans the inner relation once per outer row — O(n×m) in general, but excellent when the outer side is tiny and the inner has a usable index, turning each probe into a cheap index lookup. A <b>Hash Join</b> builds an in-memory hash table on the smaller input and probes it with the larger, giving roughly O(n+m); it's the workhorse for big equality joins with no helpful index. A <b>Merge Join</b> requires both inputs sorted on the join key and then walks them in lockstep — cheap when the sorts come free from index scans, and the natural choice for range-based merges. Beyond picking an algorithm, the planner must choose <b>join order</b>: <C>(A⋈B)⋈C</C> can be a thousand times cheaper than <C>A⋈(B⋈C)</C> because the size of the intermediate result drives everything downstream. Postgres solves this with <b>dynamic programming</b> over subsets of relations, but only up to <C>join_collapse_limit</C> tables (default 8); beyond that it stops exhaustively searching to keep planning time bounded. For debugging you can force its hand with <C>enable_nestloop</C>, <C>enable_hashjoin</C>, and <C>enable_mergejoin</C>.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Three join algorithms and join order">
      {[
        { x: 12, title: "Nested Loop", c: COL.heap, sc: COL.heapSoft, note: "for each outer \u2192 probe inner", best: "tiny outer + indexed inner" },
        { x: 218, title: "Hash Join", c: COL.index, sc: COL.indexSoft, note: "build hash on small, probe", best: "big equality joins" },
        { x: 424, title: "Merge Join", c: COL.good, sc: COL.goodSoft, note: "sort both \u2192 walk in step", best: "pre-sorted inputs" },
      ].map((j, i) => (
        <g key={i}>
          <rect x={j.x} y={16} width={196} height={150} rx={10} fill={j.sc} stroke={j.c} strokeWidth={2} />
          <text x={j.x + 98} y={40} fontSize={13} fontWeight="700" textAnchor="middle" fill={j.c}>{j.title}</text>
          <text x={j.x + 98} y={60} fontSize={9.5} textAnchor="middle" fill={COL.ink}>{j.note}</text>
          {/* mini diagram */}
          {i === 0 && (
            <g>
              {[0,1,2].map((k) => (
                <g key={k}>
                  <rect x={j.x + 20} y={74 + k * 26} width={30} height={20} rx={3} fill="#fff" stroke={j.c} />
                  <path d={`M${j.x+52},${84+k*26} L${j.x+110},${84+k*26}`} stroke={j.c} strokeWidth={1.5} />
                  <rect x={j.x + 112} y={74 + k * 26} width={60} height={20} rx={3} fill="#fff" stroke={j.c} />
                </g>
              ))}
              <text x={j.x + 142} y={150} fontSize={8} textAnchor="middle" fill={COL.proc} fontFamily={MONO}>O(n\u00d7m)</text>
            </g>
          )}
          {i === 1 && (
            <g>
              <rect x={j.x + 20} y={78} width={70} height={70} rx={4} fill="#fff" stroke={j.c} />
              <text x={j.x + 55} y={100} fontSize={8} textAnchor="middle" fill={COL.ink}>hash</text>
              <text x={j.x + 55} y={114} fontSize={8} textAnchor="middle" fill={COL.ink}>table</text>
              {[0,1,2].map((k) => <line key={k} x1={j.x+20} y1={120+k*8} x2={j.x+90} y2={120+k*8} stroke={j.c} />)}
              <path d={`M${j.x+92},${113} L${j.x+150},${113}`} stroke={j.c} strokeWidth={1.5} markerEnd="url(#arJ)" />
              <text x={j.x + 130} y={150} fontSize={8} textAnchor="middle" fill={COL.proc} fontFamily={MONO}>O(n+m)</text>
            </g>
          )}
          {i === 2 && (
            <g>
              {[0,1,2,3].map((k) => (
                <g key={k}>
                  <rect x={j.x + 24} y={76 + k * 17} width={50} height={13} rx={2} fill="#fff" stroke={j.c} />
                  <rect x={j.x + 110} y={76 + k * 17} width={50} height={13} rx={2} fill="#fff" stroke={j.c} />
                </g>
              ))}
              <text x={j.x + 98} y={156} fontSize={8} textAnchor="middle" fill={COL.proc} fontFamily={MONO}>both sorted</text>
            </g>
          )}
        </g>
      ))}
      <defs>
        <marker id="arJ" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.index} />
        </marker>
      </defs>
      {/* join order */}
      <text x={12} y={196} fontSize={12} fontWeight="700" fill={COL.ink}>Join order changes the intermediate size \u2014 and the cost</text>
      <rect x={12} y={208} width={300} height={96} rx={10} fill={COL.goodSoft} stroke={COL.good} strokeWidth={2} />
      <text x={162} y={228} fontSize={11} fontWeight="700" textAnchor="middle" fill={COL.good}>(A \u22c8 B) \u22c8 C</text>
      <text x={162} y={248} fontSize={10} textAnchor="middle" fill={COL.ink}>A\u22c8B yields 50 rows \u2192 cheap final join</text>
      <text x={162} y={284} fontSize={10} textAnchor="middle" fill={COL.good} fontWeight="700">small intermediate \u2713</text>
      <rect x={328} y={208} width={300} height={96} rx={10} fill={COL.deadSoft} stroke={COL.dead} strokeWidth={2} />
      <text x={478} y={228} fontSize={11} fontWeight="700" textAnchor="middle" fill={COL.dead}>A \u22c8 (B \u22c8 C)</text>
      <text x={478} y={248} fontSize={10} textAnchor="middle" fill={COL.ink}>B\u22c8C yields 5M rows \u2192 huge final join</text>
      <text x={478} y={284} fontSize={10} textAnchor="middle" fill={COL.dead} fontWeight="700">1000\u00d7 more work \u2715</text>
    </svg>
  ),
  caption: "Same three tables, same result — the planner's job is choosing the algorithm and the order that never materialize a giant intermediate.",
  failures: [
    { name: "Nested loop on a bad estimate", symptom: "A query that should take milliseconds runs for minutes with a Nested Loop at the top.", cause: "Underestimated outer rows made nested looping look cheap; the inner side is probed millions of times.", fix: "Fix the underlying statistics; as a stopgap, test with enable_nestloop=off to confirm the diagnosis." },
    { name: "Hash join spills to disk", symptom: "A large hash join is far slower than expected and writes temp files.", cause: "The build side didn't fit in work_mem, triggering batched hash join.", fix: "Raise work_mem for that workload or reduce the build side with better filtering." },
    { name: "Planner gives up on join order", symptom: "A query with many joined tables plans slowly or picks an odd order.", cause: "The number of tables exceeds join_collapse_limit, so exhaustive search is skipped.", fix: "Raise join_collapse_limit cautiously, or restructure the query to constrain the search space." },
  ],
  observe: [
    { note: "See which join the planner chose:", sql: "EXPLAIN SELECT *\nFROM orders o JOIN users u ON u.id = o.user_id;" },
    { note: "Force a different strategy to compare costs:", sql: "SET enable_hashjoin = off;\nEXPLAIN ANALYZE SELECT *\nFROM orders o JOIN users u ON u.id = o.user_id;\nRESET enable_hashjoin;" },
    { note: "Check the join-order search limit:", sql: "SHOW join_collapse_limit;" },
  ],
  mental: "The three joins are three ways to match guests to seats: checking every guest against every chair by hand (nested loop), building a quick lookup of seat assignments and calling names (hash join), or zipping two pre-sorted lists together (merge join) \u2014 and seating the smallest group first keeps the line short.",
},
/* ============ CHAPTER 18 ============ */
{
  id: 18, part: 5,
  title: "The Query Planner — Scan Strategies",
  core: "How Postgres reads a table depends on how much of it a query needs: sequential for large fractions, index for tiny ones, bitmap for the middle, and index-only when the index alone can answer.",
  explanation: (<>
    The planner has four main ways to fetch rows. A <b>Sequential Scan</b> reads every page in physical order and is costed with <C>seq_page_cost</C> (1.0) — efficient I/O per page, so it wins whenever a query touches a large fraction of the table. An <b>Index Scan</b> walks a B-tree to find matching <C>ctid</C>s and fetches each heap tuple individually; each fetch is random I/O priced at <C>random_page_cost</C> (4.0 by default), so it only wins for highly selective predicates. A <b>Bitmap Scan</b> bridges the two: it scans the index to collect <i>all</i> matching ctids into an in-memory bitmap, sorts them by physical location, then reads the heap pages once each in order — converting scattered random I/O into near-sequential I/O, ideal for medium-sized result sets. An <b>Index-Only Scan</b> avoids the heap entirely when the index contains every needed column and the <b>visibility map</b> marks the page all-visible, so no tuple-visibility check against the heap is required. The crossover from index to seq scan typically lands around 5–10% selectivity and is governed by the ratio of those page-cost settings. For big seq scans, <b>parallel workers</b> can split the table into chunks and scan concurrently.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Three table access patterns">
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>A 1000-page table, three ways to read it</text>
      {/* page strip helper */}
      {(() => {
        const rows = [
          { y: 36, title: "Seq Scan", c: COL.heap, sc: COL.heapSoft, mode: "seq", note: "read every page, in order" },
          { y: 132, title: "Index Scan", c: COL.index, sc: COL.indexSoft, mode: "rand", note: "jump to a few pages, random I/O" },
          { y: 228, title: "Bitmap Scan", c: COL.good, sc: COL.goodSoft, mode: "bitmap", note: "collect ctids \u2192 sort \u2192 read in order" },
        ];
        const hit = { rand: [3, 11, 22, 27], bitmap: [3, 11, 22, 27] };
        return rows.map((r, ri) => (
          <g key={ri}>
            <text x={12} y={r.y} fontSize={12} fontWeight="700" fill={r.c}>{r.title}</text>
            <text x={120} y={r.y} fontSize={9.5} fill={COL.proc}>{r.note}</text>
            {Array.from({ length: 32 }).map((_, i) => {
              let fill = "#f8fafc", stroke = COL.line;
              if (r.mode === "seq") { fill = r.sc; stroke = r.c; }
              if (r.mode === "rand" && hit.rand.includes(i)) { fill = r.sc; stroke = r.c; }
              if (r.mode === "bitmap" && hit.bitmap.includes(i)) { fill = r.sc; stroke = r.c; }
              return <rect key={i} x={12 + i * 19} y={r.y + 10} width={16} height={40} rx={2} fill={fill} stroke={stroke} />;
            })}
            {r.mode === "rand" && (
              <text x={12} y={r.y + 70} fontSize={9} fill={COL.dead}>scattered fetches \u2014 random_page_cost (4.0) each</text>
            )}
            {r.mode === "bitmap" && (
              <text x={12} y={r.y + 70} fontSize={9} fill={COL.good}>same pages, but visited in physical order \u2192 fewer seeks</text>
            )}
            {r.mode === "seq" && (
              <text x={12} y={r.y + 70} fontSize={9} fill={COL.heap}>seq_page_cost (1.0) per page \u2014 cheap when reading most of the table</text>
            )}
          </g>
        ));
      })()}
    </svg>
  ),
  caption: "Index scan and bitmap scan touch the same heap pages, but the bitmap reorders them so the disk stops seeking back and forth.",
  failures: [
    { name: "Seq scan where an index should win", symptom: "A selective query reads the whole table instead of using an index.", cause: "Stale stats overestimate selectivity, or random_page_cost is set too high for fast SSD storage.", fix: "Re-ANALYZE; on SSDs lower random_page_cost (e.g. to ~1.1) so index scans are costed fairly." },
    { name: "Index scan thrashing on a wide range", symptom: "An index scan returning many rows is slower than a seq scan would be.", cause: "Each matching row is a random heap fetch; for large result sets that's more expensive than reading sequentially.", fix: "Let the planner choose a bitmap or seq scan with correct stats; don't force the index." },
    { name: "Index-only scan still hits the heap", symptom: "An index-only scan shows many 'Heap Fetches' in EXPLAIN ANALYZE.", cause: "The visibility map isn't up to date, so pages aren't marked all-visible and visibility must be checked in the heap.", fix: "VACUUM the table to refresh the visibility map so index-only scans stay off the heap." },
  ],
  observe: [
    { note: "Watch the access method change with selectivity:", sql: "EXPLAIN SELECT * FROM orders WHERE status = 'rare';\nEXPLAIN SELECT * FROM orders WHERE status = 'common';" },
    { note: "Confirm an index-only scan and its heap fetches:", sql: "EXPLAIN (ANALYZE)\nSELECT user_id FROM orders WHERE user_id = 42;" },
    { note: "The cost knobs that drive the choice:", sql: "SELECT name, setting FROM pg_settings\nWHERE name IN ('seq_page_cost','random_page_cost');" },
  ],
  mental: "Reading a table is like finding entries in a phone book: read every page if you want most of the names, flip straight to three pages if you want just a few, or \u2014 if there are a few dozen \u2014 jot down all the page numbers first and then walk through the book once in order.",
},
/* ============ CHAPTER 19 ============ */
{
  id: 19, part: 5,
  title: "EXPLAIN and Reading Query Plans",
  core: "EXPLAIN reveals the plan tree the optimizer chose; ANALYZE adds what actually happened, and the gap between estimated and actual rows is the single most useful signal for diagnosing slow queries.",
  explanation: (<>
    <C>EXPLAIN</C> prints the chosen plan without running it; <C>EXPLAIN ANALYZE</C> executes the query and annotates each node with real timings and row counts; <C>EXPLAIN (ANALYZE, BUFFERS)</C> adds how many pages were served from cache versus read from disk. You read a plan <b>innermost-first</b>: the most-indented node runs earliest and feeds its parent. Each node reports <C>cost=startup..total</C> in arbitrary planner units, <C>rows=N</C> as the <i>estimated</i> output, and with ANALYZE the <C>actual rows=N</C> and <C>loops=N</C> — and crucially the displayed per-loop actual must be <b>multiplied by loops</b> to get the true total. The strongest red flag is <b>estimated ≪ actual</b>, which means the stats misled the planner and likely produced a bad join or scan choice; other warnings are a high <C>loops</C> count on a nested-loop inner node (a join-order mistake) and large <C>Buffers: read</C> values (cache misses you'd like to avoid). Common nodes to recognize include <C>Seq Scan</C>, <C>Index Scan</C>, <C>Bitmap Heap Scan</C>, <C>Hash Join</C>, <C>Merge Join</C>, <C>Nested Loop</C>, <C>Sort</C>, <C>Aggregate</C>, and <C>Gather</C> for parallel plans. For chronic offenders, <C>auto_explain</C> can log full plans of slow queries automatically.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Plan tree with a bad estimate">
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>A plan tree (read deepest first)</text>
      {/* top node */}
      <rect x={210} y={28} width={220} height={48} rx={8} fill={COL.indexSoft} stroke={COL.index} strokeWidth={2} />
      <text x={320} y={48} fontSize={12} fontWeight="700" textAnchor="middle" fill={COL.index}>Hash Join</text>
      <text x={320} y={66} fontSize={9} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>cost=0..980  rows=50</text>
      {/* children */}
      <defs>
        <marker id="arE" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.line} />
        </marker>
      </defs>
      <path d="M250,76 L150,108" stroke={COL.line} strokeWidth={1.6} markerEnd="url(#arE)" />
      <path d="M390,76 L490,108" stroke={COL.line} strokeWidth={1.6} markerEnd="url(#arE)" />
      {/* left child: bad estimate node */}
      <rect x={30} y={112} width={240} height={66} rx={8} fill={COL.deadSoft} stroke={COL.dead} strokeWidth={2.5} />
      <text x={150} y={132} fontSize={12} fontWeight="700" textAnchor="middle" fill={COL.dead}>Seq Scan on orders</text>
      <text x={150} y={150} fontSize={9} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>rows=50 (est)</text>
      <text x={150} y={166} fontSize={9} textAnchor="middle" fill={COL.dead} fontFamily={MONO} fontWeight="700">actual rows=5000  loops=1</text>
      {/* warning badge */}
      <circle cx={258} cy={120} r={11} fill={COL.dead} />
      <text x={258} y={125} fontSize={13} textAnchor="middle" fill="#fff" fontWeight="700">!</text>
      {/* right child ok */}
      <rect x={380} y={112} width={230} height={66} rx={8} fill={COL.goodSoft} stroke={COL.good} strokeWidth={2} />
      <text x={495} y={132} fontSize={12} fontWeight="700" textAnchor="middle" fill={COL.good}>Index Scan on users</text>
      <text x={495} y={150} fontSize={9} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>rows=1000 (est)</text>
      <text x={495} y={166} fontSize={9} textAnchor="middle" fill={COL.good} fontFamily={MONO}>actual rows=1010  loops=1</text>
      {/* reading guide */}
      <rect x={12} y={196} width={616} height={110} rx={10} fill="#fff" stroke={COL.line} />
      <text x={28} y={218} fontSize={12} fontWeight="700" fill={COL.ink}>How to read it</text>
      <text x={28} y={240} fontSize={10.5} fill={COL.ink}>1. Start at the deepest node; rows flow upward into parents.</text>
      <text x={28} y={260} fontSize={10.5} fill={COL.ink}>2. Compare est vs actual \u2014 the red node estimated 50 but produced 5000 (100\u00d7 off).</text>
      <text x={28} y={280} fontSize={10.5} fill={COL.ink}>3. Multiply actual rows \u00d7 loops for nested-loop inners.</text>
      <text x={28} y={300} fontSize={10.5} fill={COL.dead} fontWeight="700">That single bad estimate is why the join above is mis-costed.</text>
    </svg>
  ),
  caption: "The plan is a tree of producers; the node where estimated and actual rows diverge is almost always the root cause of a slow query.",
  failures: [
    { name: "Reading EXPLAIN without ANALYZE for perf", symptom: "You trust the cost numbers but the query is still slow.", cause: "Plain EXPLAIN shows only estimates; without ANALYZE you can't see where reality diverged.", fix: "Use EXPLAIN (ANALYZE, BUFFERS) on a representative run (mind that ANALYZE actually executes the query)." },
    { name: "Misreading nested-loop loops", symptom: "A node looks cheap but the query is slow.", cause: "Per-loop actual rows/time must be multiplied by loops; a small per-loop cost times millions of loops is huge.", fix: "Always factor loops into nested-loop inner nodes when reading the plan." },
    { name: "Ignoring high Buffers: read", symptom: "Two runs of the same query differ wildly in speed.", cause: "Cold cache: the slow run read pages from disk (Buffers: read) while the fast run hit shared_buffers.", fix: "Add BUFFERS to EXPLAIN to distinguish cache state from genuine plan problems." },
  ],
  observe: [
    { note: "The most useful everyday form:", sql: "EXPLAIN (ANALYZE, BUFFERS, VERBOSE)\nSELECT * FROM orders WHERE user_id = 42;" },
    { note: "Machine-readable output for tools:", sql: "EXPLAIN (FORMAT JSON)\nSELECT * FROM orders WHERE user_id = 42;" },
    { note: "Automatically log slow query plans:", sql: "LOAD 'auto_explain';\nSET auto_explain.log_min_duration = '500ms';" },
  ],
  mental: "A query plan is a recipe read from the deepest indentation outward: each step hands its result up to the next, and when one step claims it'll yield a pinch of an ingredient but actually dumps in a cupful, every step above it is thrown off.",
},
/* ============ CHAPTER 20 ============ */
{
  id: 20, part: 6,
  title: "VACUUM — Dead Tuple Cleanup",
  core: "VACUUM reclaims the dead tuples MVCC leaves behind, marking their space reusable in place and updating the visibility and free-space maps so future queries stay fast.",
  explanation: (<>
    Every <C>UPDATE</C> and <C>DELETE</C> leaves a <b>dead tuple</b>: a version whose <C>xmax</C> is a committed transaction older than every active snapshot, so no one can see it but it still occupies a heap slot. Plain <C>VACUUM</C> scans the table, finds those tuples, and marks their space <b>reusable in place</b> — it does <i>not</i> return space to the operating system, it just lets future inserts overwrite the gaps. <C>VACUUM FULL</C> does return space by rewriting the whole table compactly, but it takes an <C>ACCESS EXCLUSIVE</C> lock that blocks all access, so it's a last resort. As it cleans, VACUUM maintains two side structures: the <b>visibility map</b> (one bit per page meaning "all tuples here are visible to everyone"), which lets future VACUUMs and index-only scans skip the page, and the <b>free space map</b>, which tells <C>INSERT</C> where room exists. Rather than relying on manual runs, the <b>autovacuum</b> daemon triggers a vacuum when dead tuples exceed <C>autovacuum_vacuum_threshold + autovacuum_vacuum_scale_factor × reltuples</C> — so a table's vacuum frequency scales with its size and churn.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="VACUUM cleaning a heap page">
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>Before VACUUM</text>
      <text x={336} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>After VACUUM</text>
      {/* before page */}
      <rect x={12} y={26} width={290} height={170} rx={10} fill="#fff" stroke={COL.line} strokeWidth={2} />
      {(() => {
        const slots = ["live","dead","dead","live","dead","live","dead","dead","live","dead","dead","dead"];
        return slots.map((s, i) => {
          const col = i % 4, row = Math.floor(i / 4);
          const dead = s === "dead";
          return (
            <g key={i}>
              <rect x={28 + col * 68} y={42 + row * 48} width={58} height={38} rx={5}
                fill={dead ? COL.deadSoft : COL.heapSoft} stroke={dead ? COL.dead : COL.heap} strokeWidth={1.5}
                strokeDasharray={dead ? "4 3" : "0"} />
              <text x={57 + col * 68} y={65 + row * 48} fontSize={9} textAnchor="middle"
                fill={dead ? COL.dead : COL.heap}>{dead ? "dead" : "live"}</text>
            </g>
          );
        });
      })()}
      {/* sweep arrow */}
      <defs>
        <marker id="arV" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.good} />
        </marker>
      </defs>
      <path d="M308,110 L330,110" stroke={COL.good} strokeWidth={2.5} markerEnd="url(#arV)" />
      <text x={319} y={100} fontSize={9} textAnchor="middle" fill={COL.good} fontWeight="700">sweep</text>
      {/* after page */}
      <rect x={336} y={26} width={290} height={170} rx={10} fill="#fff" stroke={COL.line} strokeWidth={2} />
      {(() => {
        const slots = ["live","live","live","live","free","free","free","free","free","free","free","free"];
        return slots.map((s, i) => {
          const col = i % 4, row = Math.floor(i / 4);
          const free = s === "free";
          return (
            <g key={i}>
              <rect x={352 + col * 68} y={42 + row * 48} width={58} height={38} rx={5}
                fill={free ? COL.goodSoft : COL.heapSoft} stroke={free ? COL.good : COL.heap} strokeWidth={1.5} />
              <text x={381 + col * 68} y={65 + row * 48} fontSize={9} textAnchor="middle"
                fill={free ? COL.good : COL.heap}>{free ? "reusable" : "live"}</text>
            </g>
          );
        });
      })()}
      {/* maps */}
      <rect x={12} y={210} width={300} height={96} rx={10} fill={COL.goodSoft} stroke={COL.good} />
      <text x={28} y={232} fontSize={11} fontWeight="700" fill={COL.good}>Visibility map</text>
      <text x={28} y={252} fontSize={10} fill={COL.ink}>1 bit/page: \u201call tuples visible to all.\u201d</text>
      <text x={28} y={270} fontSize={10} fill={COL.ink}>Lets index-only scans skip the heap and</text>
      <text x={28} y={286} fontSize={10} fill={COL.ink}>future VACUUMs skip clean pages.</text>
      <rect x={328} y={210} width={300} height={96} rx={10} fill={COL.heapSoft} stroke={COL.heap} />
      <text x={344} y={232} fontSize={11} fontWeight="700" fill={COL.heap}>Free space map</text>
      <text x={344} y={252} fontSize={10} fill={COL.ink}>Tracks reusable space per page so</text>
      <text x={344} y={270} fontSize={10} fill={COL.ink}>INSERT can find room without scanning.</text>
      <text x={344} y={286} fontSize={10} fill={COL.proc} fontStyle="italic">Space stays in the file, ready to refill.</text>
    </svg>
  ),
  caption: "Plain VACUUM compacts logically, not physically: the slots are freed for reuse but the file keeps its size.",
  failures: [
    { name: "Autovacuum can't keep up", symptom: "Dead tuples and table size climb steadily on a high-churn table.", cause: "Default autovacuum thresholds are too lax for the write rate, so cleanup lags behind generation.", fix: "Lower per-table autovacuum_vacuum_scale_factor and raise cost limits so it runs more often and faster." },
    { name: "VACUUM FULL locks production", symptom: "Running VACUUM FULL to reclaim space freezes the application.", cause: "It takes ACCESS EXCLUSIVE and rewrites the whole table.", fix: "Use pg_repack for online compaction, or schedule VACUUM FULL only in maintenance windows." },
    { name: "Index-only scans degrade", symptom: "Previously fast index-only scans start hitting the heap.", cause: "The visibility map is stale because vacuum hasn't run, so pages aren't marked all-visible.", fix: "Ensure regular VACUUM runs to keep the visibility map current." },
  ],
  observe: [
    { note: "Dead tuples and last (auto)vacuum per table:", sql: "SELECT relname, n_dead_tup, last_autovacuum\nFROM pg_stat_user_tables ORDER BY n_dead_tup DESC;" },
    { note: "Vacuum a table and refresh its stats together:", sql: "VACUUM (VERBOSE, ANALYZE) orders;" },
    { note: "Watch a vacuum in progress:", sql: "SELECT * FROM pg_stat_progress_vacuum;" },
  ],
  mental: "VACUUM is the building janitor unlocking apartments whose tenants moved out: the rooms become available to rent again immediately, but the building doesn't get any smaller \u2014 only a full renovation (VACUUM FULL) actually shrinks the footprint.",
},
/* ============ CHAPTER 21 ============ */
{
  id: 21, part: 6,
  title: "XID Wraparound — The Postgres Time Bomb",
  core: "Transaction IDs are a 32-bit counter compared modularly, so if the oldest unfrozen rows aren't frozen before the counter laps them, they'd suddenly look like they're in the future and vanish — which Postgres prevents by shutting down first.",
  explanation: (<>
    Transaction IDs are <b>32-bit</b>: they count from a few special low values up to about 4.2 billion and then wrap back to the start. MVCC visibility is decided by comparing a tuple's <C>xmin</C> against the current XID, but because the space is circular the comparison is <b>modular</b> — roughly half the space is treated as "in the past" and half as "in the future." If the counter advances all the way around and laps an old, unfrozen tuple, that tuple's xmin would suddenly fall into the "future" half and the row would become <b>invisible</b> — silent, catastrophic data loss. To prevent this, VACUUM performs <b>freezing</b>: it stamps sufficiently old tuples as frozen, a special state meaning "always in the past, visible to everyone regardless of XID." The <C>age()</C> of <C>relfrozenxid</C> (per table) and <C>datfrozenxid</C> (per database) measures how many transactions have elapsed since the last freeze. When age crosses <C>autovacuum_freeze_max_age</C> (200 million), Postgres forces an <b>anti-wraparound autovacuum</b> even on otherwise-quiet tables. If freezing falls catastrophically behind and age nears 2 billion, the server stops accepting new writes — the infamous "database is not accepting commands to avoid wraparound" — to protect the data. The same hazard exists for <b>MultiXact</b> IDs used by shared row locks.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="32-bit XID space as a circle">
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>The 32-bit XID space is a circle, not a line</text>
      {/* circle */}
      <circle cx={200} cy={180} r={110} fill="none" stroke={COL.line} strokeWidth={2} />
      {/* frozen arc (green, past, visible always) */}
      <path d="M200,70 A110,110 0 0 1 310,180" fill="none" stroke={COL.good} strokeWidth={10} />
      <text x={300} y={120} fontSize={10} fill={COL.good} fontWeight="700">frozen \u2713</text>
      {/* safe past arc (blue) */}
      <path d="M310,180 A110,110 0 0 1 200,290" fill="none" stroke={COL.heap} strokeWidth={10} />
      <text x={278} y={258} fontSize={10} fill={COL.heap} fontWeight="700">recent past</text>
      {/* danger arc (red, about to be lapped) */}
      <path d="M200,290 A110,110 0 0 1 110,118" fill="none" stroke={COL.dead} strokeWidth={10} />
      <text x={78} y={235} fontSize={10} fill={COL.dead} fontWeight="700">danger: old &amp;</text>
      <text x={86} y={249} fontSize={10} fill={COL.dead} fontWeight="700">unfrozen</text>
      {/* wraparound seam */}
      <line x1={200} y1={62} x2={200} y2={88} stroke={COL.dead} strokeWidth={3} />
      <text x={200} y={52} fontSize={10} textAnchor="middle" fill={COL.dead} fontWeight="700">wrap seam</text>
      {/* current xid pointer */}
      <line x1={200} y1={180} x2={118} y2={118} stroke={COL.proc} strokeWidth={3} markerEnd="url(#arX)" />
      <defs>
        <marker id="arX" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.proc} />
        </marker>
      </defs>
      <circle cx={200} cy={180} r={5} fill={COL.proc} />
      <text x={150} y={190} fontSize={9} fill={COL.proc}>current XID</text>
      {/* explanation panel */}
      <rect x={336} y={36} width={292} height={130} rx={10} fill={COL.deadSoft} stroke={COL.dead} />
      <text x={352} y={58} fontSize={12} fontWeight="700" fill={COL.dead}>If the hand laps unfrozen rows</text>
      <text x={352} y={80} fontSize={10} fill={COL.ink}>their xmin falls into the \u201cfuture\u201d half \u2192</text>
      <text x={352} y={98} fontSize={10} fill={COL.ink}>they become invisible \u2192 data appears lost.</text>
      <text x={352} y={122} fontSize={10} fill={COL.ink}>Near age 2B Postgres refuses writes:</text>
      <text x={352} y={140} fontSize={9.5} fill={COL.dead} fontFamily={MONO}>\u201cnot accepting commands to</text>
      <text x={352} y={154} fontSize={9.5} fill={COL.dead} fontFamily={MONO}>avoid wraparound data loss\u201d</text>
      <rect x={336} y={176} width={292} height={130} rx={10} fill={COL.goodSoft} stroke={COL.good} />
      <text x={352} y={198} fontSize={12} fontWeight="700" fill={COL.good}>Freezing defuses it</text>
      <text x={352} y={220} fontSize={10} fill={COL.ink}>VACUUM marks old tuples frozen =</text>
      <text x={352} y={238} fontSize={10} fill={COL.ink}>\u201calways past,\u201d immune to the wrap.</text>
      <text x={352} y={262} fontSize={10} fill={COL.ink}>autovacuum_freeze_max_age (200M)</text>
      <text x={352} y={280} fontSize={10} fill={COL.ink}>forces an anti-wraparound vacuum.</text>
      <text x={352} y={300} fontSize={9.5} fill={COL.proc} fontStyle="italic">Monitor age(datfrozenxid) long before 2B.</text>
    </svg>
  ),
  caption: "Because the counter is circular, safety isn't about never wrapping — it's about freezing old rows into a permanent past before the wrap reaches them.",
  failures: [
    { name: "Approaching wraparound shutdown", symptom: "Warnings about wraparound escalate, then the database stops accepting writes.", cause: "Freezing fell behind (often a stuck autovacuum or a long-held xmin) and datfrozenxid age neared 2 billion.", fix: "Resolve the blocker (idle transactions, disabled autovacuum), then run an aggressive VACUUM (FREEZE)." },
    { name: "Autovacuum disabled 'for performance'", symptom: "Months later, sudden anti-wraparound vacuums saturate I/O.", cause: "Turning off autovacuum stops freezing, so emergency vacuums must eventually do it all at once.", fix: "Never disable autovacuum globally; tune it instead and let freezing happen incrementally." },
    { name: "MultiXact wraparound", symptom: "Wraparound warnings appear even though XID age looks fine.", cause: "Heavy use of shared row locks (FOR SHARE / FK checks) consumed MultiXact IDs, which have their own wraparound.", fix: "Watch mxid_age as well as xid_age and ensure vacuum keeps both frozen." },
  ],
  observe: [
    { note: "How many transactions until each database is in danger:", sql: "SELECT datname, age(datfrozenxid),\n  2000000000 - age(datfrozenxid) AS xids_left\nFROM pg_database ORDER BY age(datfrozenxid) DESC;" },
    { note: "Per-table freeze age, worst first:", sql: "SELECT relname, age(relfrozenxid)\nFROM pg_class WHERE relkind = 'r'\nORDER BY age(relfrozenxid) DESC LIMIT 10;" },
    { note: "Force freezing on a lagging table:", sql: "VACUUM (FREEZE, VERBOSE) orders;" },
  ],
  mental: "XIDs are a clock with an hour hand but no date: as long as you keep engraving \u201cthis already happened\u201d on old events (freezing), you never confuse them with new ones \u2014 but stop engraving and eventually the hand sweeps back around and yesterday looks like tomorrow.",
},
/* ============ CHAPTER 22 ============ */
{
  id: 22, part: 6,
  title: "ANALYZE, Table Bloat, and Index Bloat",
  core: "When dead space accumulates faster than VACUUM reclaims it, tables and indexes bloat — growing on disk while live data stays flat — and recovering that space requires a rewrite, not just a vacuum.",
  explanation: (<>
    <b>Table bloat</b> is what you get when dead tuples are generated faster than autovacuum can mark them reusable: the file keeps growing even though the live row count is stable, because plain VACUUM never shrinks the file, it only enables reuse. You can measure it with the <C>pgstattuple</C> extension (which reports the live/dead/free byte breakdown) or estimate it by comparing <C>relpages</C> against the pages the live rows should occupy. <b>Index bloat</b> is a related but distinct problem: when entries are deleted, B-tree leaf pages don't merge back together, so over time an index accumulates many sparsely-filled pages that make scans read more blocks than necessary. The fix for index bloat is to rebuild: <C>REINDEX</C> recreates the index compactly, and <C>REINDEX CONCURRENTLY</C> does it without a long lock; for table bloat without downtime, the <C>pg_repack</C> extension rewrites the table and its indexes online. It's worth separating <C>ANALYZE</C> from <C>VACUUM</C> in your head — ANALYZE only refreshes the planner statistics and removes no dead tuples, which makes it the right tool after a large data load when stats are stale but there's nothing to clean. Warning signs of bloat include a table whose size climbs while row count holds, sequential scans slowing over time, and index scans that no longer fit in cache.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Bloated vs dense pages and indexes">
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>Heap pages</text>
      {/* bloated heap */}
      <text x={12} y={36} fontSize={10} fontWeight="700" fill={COL.dead}>Bloated (mostly dead/free)</text>
      {[0,1,2].map((p) => (
        <g key={p}>
          <rect x={12 + p * 96} y={44} width={86} height={60} rx={6} fill="#fff" stroke={COL.dead} strokeWidth={1.5} />
          {Array.from({ length: 6 }).map((_, i) => {
            const live = i === 1 || (p === 1 && i === 4);
            return <rect key={i} x={18 + p * 96 + (i % 3) * 26} y={50 + Math.floor(i / 3) * 26} width={22} height={22} rx={3}
              fill={live ? COL.heapSoft : COL.deadSoft} stroke={live ? COL.heap : COL.dead} strokeDasharray={live ? "0" : "3 2"} />;
          })}
        </g>
      ))}
      <text x={12} y={120} fontSize={9} fill={COL.dead}>3 pages to hold 4 live rows</text>
      {/* dense heap */}
      <text x={336} y={36} fontSize={10} fontWeight="700" fill={COL.good}>Compact (after repack)</text>
      <rect x={336} y={44} width={86} height={60} rx={6} fill="#fff" stroke={COL.good} strokeWidth={1.5} />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={342 + (i % 3) * 26} y={50 + Math.floor(i / 3) * 26} width={22} height={22} rx={3}
          fill={COL.goodSoft} stroke={COL.good} />
      ))}
      <text x={336} y={120} fontSize={9} fill={COL.good}>1 page holds the same live rows</text>
      {/* indexes */}
      <text x={12} y={156} fontSize={12} fontWeight="700" fill={COL.ink}>B-tree leaf pages</text>
      <text x={12} y={176} fontSize={10} fontWeight="700" fill={COL.dead}>Bloated index (sparse leaves)</text>
      {[0,1,2,3].map((p) => (
        <g key={p}>
          <rect x={12 + p * 74} y={184} width={64} height={48} rx={6} fill="#fff" stroke={COL.index} strokeWidth={1.5} />
          {Array.from({ length: 8 }).map((_, i) => {
            const filled = (p + i) % 4 === 0;
            return <rect key={i} x={18 + p * 74 + (i % 4) * 14} y={190 + Math.floor(i / 4) * 18} width={11} height={14} rx={2}
              fill={filled ? COL.indexSoft : "#fff"} stroke={filled ? COL.index : COL.line} />;
          })}
        </g>
      ))}
      <text x={12} y={248} fontSize={9} fill={COL.dead}>deleted entries leave gaps; pages don\u2019t merge</text>
      <text x={336} y={176} fontSize={10} fontWeight="700" fill={COL.good}>Rebuilt index (REINDEX)</text>
      {[0,1].map((p) => (
        <g key={p}>
          <rect x={336 + p * 74} y={184} width={64} height={48} rx={6} fill="#fff" stroke={COL.good} strokeWidth={1.5} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={342 + p * 74 + (i % 4) * 14} y={190 + Math.floor(i / 4) * 18} width={11} height={14} rx={2}
              fill={COL.goodSoft} stroke={COL.good} />
          ))}
        </g>
      ))}
      <text x={336} y={248} fontSize={9} fill={COL.good}>same keys in half the pages</text>
      <rect x={12} y={262} width={616} height={44} rx={10} fill="#fff" stroke={COL.line} />
      <text x={26} y={284} fontSize={10.5} fill={COL.ink}>ANALYZE \u2260 VACUUM: ANALYZE only refreshes statistics and frees no space \u2014 use it after big loads when stats are stale.</text>
      <text x={26} y={300} fontSize={10} fill={COL.proc}>Reclaiming bloat needs a rewrite: REINDEX (CONCURRENTLY) for indexes, pg_repack for tables \u2014 online.</text>
    </svg>
  ),
  caption: "Bloat is wasted space the file already claimed; only a rewrite gives it back, while ANALYZE merely keeps the planner honest.",
  failures: [
    { name: "Table grows, row count doesn't", symptom: "Disk usage for a table climbs steadily while SELECT count(*) stays flat.", cause: "Update/delete churn outpaces autovacuum, accumulating dead space that's reused slowly or not at all.", fix: "Tune autovacuum to be more aggressive; reclaim existing bloat with pg_repack online." },
    { name: "Index much larger than its table", symptom: "An index's size dwarfs expectations and scans read excessive blocks.", cause: "Deleted entries left sparse leaf pages that never merged back.", fix: "REINDEX CONCURRENTLY to rebuild it compactly without blocking writes." },
    { name: "Stale plans after a big load", symptom: "Queries regress immediately after importing a lot of data.", cause: "Statistics are stale; the data is fine but the planner's picture is wrong.", fix: "Run ANALYZE (not just VACUUM) right after the load to refresh statistics." },
  ],
  observe: [
    { note: "Exact live/dead/free breakdown (needs pgstattuple):", sql: "CREATE EXTENSION IF NOT EXISTS pgstattuple;\nSELECT * FROM pgstattuple('orders');" },
    { note: "Index density and leaf fragmentation:", sql: "SELECT * FROM pgstatindex('orders_pkey');" },
    { note: "Biggest relations on disk:", sql: "SELECT relname, pg_size_pretty(pg_total_relation_size(oid))\nFROM pg_class WHERE relkind = 'r'\nORDER BY pg_total_relation_size(oid) DESC LIMIT 10;" },
  ],
  mental: "Bloat is a closet that's mostly empty hangers: you stop being able to find your clothes not because you own more, but because the deleted ones left their hangers behind \u2014 and only emptying and re-hanging the whole closet (a rewrite) makes it compact again.",
},
/* ============ CHAPTER 23 ============ */
{
  id: 23, part: 7,
  title: "TOAST — Storage of Large Values",
  core: "Since a tuple must fit comfortably in an 8KB page, Postgres compresses and offloads oversized column values into a hidden side table, leaving only a small pointer in the main row.",
  explanation: (<>
    A Postgres page is 8KB and a tuple is expected to fit within it, so when a row's value gets large the engine applies <b>TOAST</b> — The Oversized-Attribute Storage Technique. Once a tuple would exceed roughly <C>TOAST_TUPLE_THRESHOLD</C> (about 2KB), Postgres tries to shrink it according to each column's storage <b>strategy</b>: <C>PLAIN</C> (never toasted, for fixed small types), <C>EXTENDED</C> (the default — compress first, then move out-of-line if still too big), <C>EXTERNAL</C> (move out-of-line without compression, faster for substring access), and <C>MAIN</C> (compress but try hard to keep it inline). When a value goes <b>out-of-line</b>, it's split into ~2KB chunks stored in a per-table TOAST relation named <C>pg_toast.pg_toast_NNNN</C>, and the main tuple keeps only an ~18-byte <b>TOAST pointer</b> (length plus the chunk location). Compression uses <C>pglz</C> by default, or LZ4 where configured via <C>default_toast_compression</C>. The performance implication is real: a <C>SELECT *</C> that pulls a wide JSONB or text column must <b>detoast</b> it — fetch and decompress every chunk — so selecting only the columns you need avoids paying for values you'll never read.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="TOAST out-of-line storage">
      <text x={12} y={16} fontSize={12} fontWeight="700" fill={COL.ink}>Main heap page</text>
      <rect x={12} y={26} width={250} height={150} rx={10} fill="#fff" stroke={COL.heap} strokeWidth={2} />
      {/* a row with small cols + toast pointer */}
      <rect x={28} y={44} width={60} height={30} rx={4} fill={COL.heapSoft} stroke={COL.heap} />
      <text x={58} y={63} fontSize={9} textAnchor="middle" fill={COL.ink}>id</text>
      <rect x={92} y={44} width={70} height={30} rx={4} fill={COL.heapSoft} stroke={COL.heap} />
      <text x={127} y={63} fontSize={9} textAnchor="middle" fill={COL.ink}>created_at</text>
      <rect x={166} y={44} width={82} height={30} rx={4} fill={COL.walSoft} stroke={COL.wal} strokeWidth={2} />
      <text x={207} y={59} fontSize={9} textAnchor="middle" fill={COL.ink}>jsonb_col</text>
      <text x={207} y={70} fontSize={8} textAnchor="middle" fill={COL.wal} fontFamily={MONO}>TOAST ptr</text>
      <text x={28} y={100} fontSize={9} fill={COL.proc}>row &gt; ~2KB \u2192 big column moved out;</text>
      <text x={28} y={116} fontSize={9} fill={COL.proc}>only an ~18-byte pointer remains inline.</text>
      <text x={28} y={146} fontSize={9} fill={COL.ink} fontFamily={MONO}>ptr = {`{len, chunk location}`}</text>
      {/* compression step */}
      <defs>
        <marker id="arT" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.wal} />
        </marker>
      </defs>
      <path d="M248,59 L300,59" stroke={COL.wal} strokeWidth={2.5} markerEnd="url(#arT)" />
      <rect x={302} y={42} width={96} height={34} rx={6} fill={COL.indexSoft} stroke={COL.index} />
      <text x={350} y={58} fontSize={9} textAnchor="middle" fill={COL.index} fontWeight="700">compress</text>
      <text x={350} y={70} fontSize={8} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>pglz / lz4</text>
      <path d="M398,59 L450,59" stroke={COL.wal} strokeWidth={2.5} markerEnd="url(#arT)" />
      {/* toast table */}
      <text x={452} y={36} fontSize={11} fontWeight="700" fill={COL.wal}>pg_toast.pg_toast_NNNN</text>
      {[0,1,2].map((i) => (
        <g key={i}>
          <rect x={452} y={44 + i * 40} width={170} height={32} rx={6} fill={COL.walSoft} stroke={COL.wal} />
          <text x={466} y={64 + i * 40} fontSize={10} fill={COL.ink} fontFamily={MONO}>chunk {i + 1}  (~2KB)</text>
        </g>
      ))}
      {/* detoast note */}
      <rect x={12} y={196} width={610} height={50} rx={10} fill={COL.heapSoft} stroke={COL.heap} />
      <text x={26} y={218} fontSize={11} fontWeight="700" fill={COL.heap}>Detoasting cost</text>
      <text x={26} y={238} fontSize={10} fill={COL.ink}>Reading the column reassembles every chunk and decompresses it \u2014 SELECT * pays this even if you ignore the value.</text>
      {/* strategies */}
      <rect x={12} y={254} width={610} height={52} rx={10} fill="#fff" stroke={COL.line} />
      <text x={26} y={274} fontSize={10.5} fill={COL.ink}><tspan fontWeight="700">Strategies:</tspan> PLAIN (never) \u00b7 EXTENDED (compress then out-of-line, default) \u00b7</text>
      <text x={26} y={292} fontSize={10.5} fill={COL.ink}>EXTERNAL (out-of-line, no compression) \u00b7 MAIN (compress, stay inline if possible)</text>
    </svg>
  ),
  caption: "The main tuple stays small and fast to scan; the heavy value lives in chunks next door, fetched only when actually read.",
  failures: [
    { name: "SELECT * detoast overhead", symptom: "Queries are slow whenever a wide TOASTed column is in the result, even when unused.", cause: "Selecting the column forces fetching and decompressing all its TOAST chunks.", fix: "Select only needed columns; avoid pulling large JSONB/text you won't use." },
    { name: "Wrong strategy for substring access", symptom: "Repeatedly reading slices of a large value is slower than expected.", cause: "EXTENDED compresses the value, so any access must decompress the whole thing.", fix: "Set the column's storage to EXTERNAL so slices can be read without full decompression." },
    { name: "TOAST table bloat goes unnoticed", symptom: "Disk usage grows but the visible table looks small.", cause: "Updates to large values churn the hidden TOAST relation, which bloats independently.", fix: "Include pg_total_relation_size (which counts TOAST) when monitoring and vacuum accordingly." },
  ],
  observe: [
    { note: "Find a table's hidden TOAST relation and its size:", sql: "SELECT reltoastrelid::regclass,\n  pg_size_pretty(pg_relation_size(reltoastrelid))\nFROM pg_class WHERE relname = 'orders';" },
    { note: "Per-column storage strategy (p/e/x/m):", sql: "SELECT attname, attstorage\nFROM pg_attribute\nWHERE attrelid = 'orders'::regclass AND attnum > 0;" },
    { note: "Change a column's TOAST strategy:", sql: "ALTER TABLE orders\nALTER COLUMN payload SET STORAGE EXTERNAL;" },
  ],
  mental: "TOAST is a coat check: you don't drag an oversized suitcase to your dinner table \u2014 you hand it over, keep a small numbered ticket in your pocket, and only the moment you actually need the contents does someone go fetch and unpack it.",
},
/* ============ CHAPTER 24 ============ */
{
  id: 24, part: 7,
  title: "The Postgres Extension System",
  core: "Postgres exposes its type system, index framework, and execution pipeline as extension points, so add-ons can introduce new data types, index methods, and hooks without modifying the core.",
  explanation: (<>
    Postgres was built to be extended. The core lets add-ons register custom <b>data types</b>, <b>operators</b>, and <b>functions</b> in C or a procedural language, and even custom <b>index access methods</b> through generic frameworks like <C>GiST</C> and <C>GIN</C> — which is exactly how new indexing strategies arrive without a core change. A handful of extensions are worth knowing by name: <C>pg_stat_statements</C> aggregates execution stats per normalized query; <C>pgvector</C> adds a vector type with <C>IVFFlat</C> and <C>HNSW</C> indexes for similarity search; <C>PostGIS</C> brings geospatial types and indexes; <C>pg_partman</C> automates partition lifecycle; <C>timescaledb</C> optimizes time-series workloads; <C>pg_repack</C> removes bloat online; <C>pgcrypto</C> provides cryptographic functions; and <C>pg_trgm</C> enables trigram-based fuzzy text matching. Beyond data structures, Postgres exposes <b>hooks</b> — function pointers an extension can chain onto during <C>_PG_init</C> — including the <b>planner hook</b>, the <b>executor hooks</b> (<C>ExecutorStart</C>/<C>ExecutorRun</C>/<C>ExecutorEnd</C>), and utility/storage manager hooks. An extension saves the previous hook, installs its own, and calls through, so multiple extensions can cooperate on the same query. This is why so much of the modern Postgres ecosystem lives <i>outside</i> the core yet feels native.
  </>),
  svg: (
    <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Extension hooks plugging into the core">
      {/* core box with sockets */}
      <rect x={210} y={40} width={220} height={240} rx={12} fill={COL.procSoft} stroke={COL.proc} strokeWidth={2.5} />
      <text x={320} y={66} fontSize={14} fontWeight="700" textAnchor="middle" fill={COL.proc}>Postgres core</text>
      {[
        { y: 92, label: "planner hook" },
        { y: 140, label: "executor hooks" },
        { y: 188, label: "index AM (GiST/GIN)" },
        { y: 236, label: "storage / utility hooks" },
      ].map((s, i) => (
        <g key={i}>
          <rect x={226} y={s.y} width={188} height={32} rx={6} fill="#fff" stroke={COL.proc} />
          <text x={320} y={s.y + 21} fontSize={11} textAnchor="middle" fill={COL.ink} fontFamily={MONO}>{s.label}</text>
          {/* socket dots */}
          <circle cx={214} cy={s.y + 16} r={5} fill={COL.proc} />
          <circle cx={426} cy={s.y + 16} r={5} fill={COL.proc} />
        </g>
      ))}
      {/* extension plugs on left */}
      <defs>
        <marker id="arP" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={COL.index} />
        </marker>
      </defs>
      <g>
        <rect x={20} y={92} width={150} height={32} rx={6} fill={COL.indexSoft} stroke={COL.index} strokeWidth={2} />
        <text x={95} y={113} fontSize={10} textAnchor="middle" fill={COL.index} fontWeight="700">pg_stat_statements</text>
        <path d="M170,108 L208,108" stroke={COL.index} strokeWidth={2} markerEnd="url(#arP)" />
        <text x={95} y={140} fontSize={8} textAnchor="middle" fill={COL.proc}>chains the executor hooks</text>
      </g>
      <g>
        <rect x={20} y={180} width={150} height={32} rx={6} fill={COL.heapSoft} stroke={COL.heap} strokeWidth={2} />
        <text x={95} y={201} fontSize={10} textAnchor="middle" fill={COL.heap} fontWeight="700">pgvector</text>
        <path d="M170,196 L208,196" stroke={COL.heap} strokeWidth={2} markerEnd="url(#arP)" />
        <text x={95} y={228} fontSize={8} textAnchor="middle" fill={COL.proc}>registers HNSW / IVFFlat AM</text>
      </g>
      {/* extension plugs on right */}
      <g>
        <rect x={470} y={92} width={150} height={32} rx={6} fill={COL.goodSoft} stroke={COL.good} strokeWidth={2} />
        <text x={545} y={113} fontSize={10} textAnchor="middle" fill={COL.good} fontWeight="700">PostGIS</text>
        <path d="M468,108 L432,108" stroke={COL.good} strokeWidth={2} markerEnd="url(#arP)" />
        <text x={545} y={140} fontSize={8} textAnchor="middle" fill={COL.proc}>custom types + GiST</text>
      </g>
      <g>
        <rect x={470} y={236} width={150} height={32} rx={6} fill={COL.walSoft} stroke={COL.wal} strokeWidth={2} />
        <text x={545} y={257} fontSize={10} textAnchor="middle" fill={COL.wal} fontWeight="700">pg_partman</text>
        <path d="M468,252 L432,252" stroke={COL.wal} strokeWidth={2} markerEnd="url(#arP)" />
        <text x={545} y={284} fontSize={8} textAnchor="middle" fill={COL.proc}>utility hooks</text>
      </g>
      <text x={320} y={304} fontSize={9} textAnchor="middle" fill={COL.proc} fontStyle="italic">Each extension saves the prior hook and calls through \u2014 so they compose.</text>
    </svg>
  ),
  caption: "The core publishes sockets — hooks and access-method interfaces — and extensions plug in, chaining politely so several can coexist on one query.",
  failures: [
    { name: "Version mismatch on upgrade", symptom: "After a major Postgres upgrade an extension fails to load.", cause: "Compiled C extensions are tied to a server version and ABI; the old binary doesn't match.", fix: "Install the extension build matching the new major version, then run ALTER EXTENSION ... UPDATE." },
    { name: "pg_stat_statements not capturing", symptom: "The view exists but stays empty.", cause: "The extension must be in shared_preload_libraries to install its executor hook at startup.", fix: "Add it to shared_preload_libraries and restart the server, then CREATE EXTENSION." },
    { name: "Hook-chaining extension conflicts", symptom: "Enabling two hook-based extensions causes crashes or missing instrumentation.", cause: "An extension installed its hook without preserving and calling the previous one, breaking the chain.", fix: "Use well-maintained extensions; load order in shared_preload_libraries can matter for cooperation." },
  ],
  observe: [
    { note: "Top queries by total execution time (needs the extension):", sql: "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;\nSELECT query, calls, total_exec_time\nFROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;" },
    { note: "What extensions are available vs installed:", sql: "SELECT name, default_version, installed_version\nFROM pg_available_extensions WHERE installed_version IS NOT NULL;" },
    { note: "Install an extension:", sql: "CREATE EXTENSION IF NOT EXISTS pg_trgm;" },
  ],
  mental: "The extension system is a workshop with labeled wall sockets: the building supplies the power and the standard outlets (hooks and index interfaces), and any tool that's wired to the standard plug just works \u2014 several can run off the same circuit at once.",
},
];

/* ============================================================
   The interactive shell: sidebar, search, progress, content.
   ============================================================ */

const hex8 = (hex, alpha) => hex + alpha; // append 2-digit alpha to a #rrggbb

function PartPill({ part }) {
  const p = PARTS[part];
  return (
    <span style={{
      display: "inline-block",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.3,
      color: p.color,
      background: hex8(p.color, "1a"),
      padding: "4px 11px",
      borderRadius: 999,
    }}>
      {PART_LABEL[part]}
    </span>
  );
}

function CalloutCore({ text }) {
  return (
    <div style={{
      margin: "18px 0 26px",
      padding: "13px 16px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#94a3b8", marginBottom: 5 }}>
        CORE MECHANISM
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.6, color: "#0f172a" }}>{text}</div>
    </div>
  );
}

function FailureCard({ failures }) {
  return (
    <div style={{
      margin: "30px 0",
      background: "#fef2f2",
      borderLeft: "3px solid #ef4444",
      borderRadius: "0 10px 10px 0",
      padding: "18px 20px",
    }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 17, color: "#991b1b" }}>Production Failure Modes</h3>
      {failures.map((f, i) => (
        <div key={i} style={{ marginBottom: i === failures.length - 1 ? 0 : 16 }}>
          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14.5 }}>{f.name}</div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: "#334155", marginTop: 3 }}>
            <b style={{ color: "#b91c1c" }}>Symptom:</b> {f.symptom}{" "}
            <b style={{ color: "#b91c1c" }}>Cause:</b> {f.cause}{" "}
            <b style={{ color: "#b91c1c" }}>Fix:</b> {f.fix}
          </div>
        </div>
      ))}
    </div>
  );
}

function ObserveCard({ observe }) {
  return (
    <div style={{
      margin: "30px 0",
      background: "#eff6ff",
      borderLeft: "3px solid #3b82f6",
      borderRadius: "0 10px 10px 0",
      padding: "18px 20px",
    }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 17, color: "#1e40af" }}>Observe it live</h3>
      {observe.map((o, i) => (
        <div key={i} style={{ marginTop: i === 0 ? 6 : 16 }}>
          <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>{o.note}</div>
          <CodeBlock>{o.sql}</CodeBlock>
        </div>
      ))}
    </div>
  );
}

function Chapter({ ch }) {
  const p = PARTS[ch.part];
  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "44px 28px 120px" }}>
      <div style={{ position: "relative" }}>
        <div aria-hidden style={{
          position: "absolute", top: -34, left: -4, fontSize: 80, fontWeight: 800,
          color: "#0f172a", opacity: 0.05, lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}>
          {String(ch.id).padStart(2, "0")}
        </div>
        <PartPill part={ch.part} />
        <h1 style={{ fontSize: 32, lineHeight: 1.2, margin: "12px 0 0", color: "#0f172a", letterSpacing: -0.5 }}>
          {ch.title}
        </h1>
      </div>

      <CalloutCore text={ch.core} />

      <div style={{ fontSize: 16, lineHeight: 1.8, color: "#1e293b" }}>{ch.explanation}</div>

      <div style={{
        margin: "28px 0 8px",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "18px 18px 10px",
        background: "#fff",
      }}>
        {ch.svg}
      </div>
      <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 6, fontStyle: "italic" }}>
        {ch.caption}
      </div>

      <FailureCard failures={ch.failures} />
      <ObserveCard observe={ch.observe} />

      <blockquote style={{
        margin: "34px 0 0",
        borderLeft: `4px solid ${p.color}`,
        padding: "6px 0 6px 22px",
        fontSize: 20,
        lineHeight: 1.55,
        fontStyle: "italic",
        color: "#0f172a",
      }}>
        {ch.mental}
      </blockquote>
    </article>
  );
}

export default function App() {
  const [selected, setSelected] = useState(1);
  const [mastered, setMastered] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(() => new Set());
  const contentRef = useRef(null);

  const goTo = (id) => {
    if (id === selected) return;
    setMastered((prev) => {
      const next = new Set(prev);
      next.add(selected);
      return next;
    });
    setSelected(id);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const togglePart = (pid) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid); else next.add(pid);
      return next;
    });
  };

  const q = search.trim().toLowerCase();
  const matches = (ch) => q === "" || ch.title.toLowerCase().includes(q);
  const searching = q !== "";

  const current = CHAPTERS.find((c) => c.id === selected) || CHAPTERS[0];
  const prevCh = CHAPTERS.find((c) => c.id === selected - 1);
  const nextCh = CHAPTERS.find((c) => c.id === selected + 1);

  const masteredCount = mastered.size;
  const pct = Math.round((masteredCount / CHAPTERS.length) * 100);

  const baseFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#fff",
      fontFamily: baseFont,
      fontSize: 15,
      color: "#0f172a",
    }}>
      {/* header */}
      <header style={{
        borderBottom: "1px solid #e2e8f0",
        padding: "12px 22px",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>
            Database Internals <span style={{ color: "#94a3b8", fontWeight: 600 }}>· How Postgres Actually Works</span>
          </div>
          <div style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>
            {masteredCount} / {CHAPTERS.length} chapters mastered
          </div>
        </div>
        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 999, marginTop: 9, overflow: "hidden" }}>
          <div style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg,#6366f1,#0ea5e9)",
            borderRadius: 999,
            transition: "width 0.3s ease",
          }} />
        </div>
      </header>

      {/* body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* sidebar */}
        <aside style={{
          width: 260,
          flexShrink: 0,
          borderRight: "1px solid #e2e8f0",
          overflowY: "auto",
          background: "#fcfcfd",
        }}>
          <div style={{ padding: 14, position: "sticky", top: 0, background: "#fcfcfd", borderBottom: "1px solid #f1f5f9" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chapters…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 11px",
                fontSize: 13.5,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                outline: "none",
                fontFamily: baseFont,
              }}
            />
          </div>

          <nav style={{ padding: "6px 8px 30px" }}>
            {PARTS.map((part) => {
              const chs = CHAPTERS.filter((c) => c.part === part.id && matches(c));
              if (searching && chs.length === 0) return null;
              const isCollapsed = !searching && collapsed.has(part.id);
              return (
                <div key={part.id} style={{ marginBottom: 4 }}>
                  <button
                    onClick={() => togglePart(part.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px 8px",
                      textAlign: "left",
                      fontFamily: baseFont,
                    }}
                  >
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: part.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", flex: 1 }}>
                      {part.name}
                    </span>
                    <span style={{ fontSize: 10, color: "#94a3b8", transform: isCollapsed ? "rotate(-90deg)" : "none", transition: "transform .15s" }}>
                      ▼
                    </span>
                  </button>
                  {!isCollapsed && chs.map((c) => {
                    const active = c.id === selected;
                    const done = mastered.has(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => goTo(c.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          textAlign: "left",
                          background: active ? hex8(part.color, "14") : "transparent",
                          borderLeft: active ? `3px solid ${part.color}` : "3px solid transparent",
                          borderTop: "none", borderRight: "none", borderBottom: "none",
                          cursor: "pointer",
                          padding: "7px 8px 7px 18px",
                          borderRadius: "0 6px 6px 0",
                          fontFamily: baseFont,
                        }}
                      >
                        <span style={{
                          fontSize: 10.5,
                          fontFamily: MONO,
                          color: active ? part.color : "#94a3b8",
                          width: 16,
                          flexShrink: 0,
                          fontWeight: 700,
                        }}>
                          {String(c.id).padStart(2, "0")}
                        </span>
                        <span style={{
                          fontSize: 13,
                          color: active ? "#0f172a" : "#475569",
                          fontWeight: active ? 700 : 500,
                          flex: 1,
                          lineHeight: 1.3,
                        }}>
                          {c.title}
                        </span>
                        {done && <span style={{ color: "#10b981", fontSize: 12, flexShrink: 0 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {searching && CHAPTERS.filter(matches).length === 0 && (
              <div style={{ padding: "12px 14px", fontSize: 13, color: "#94a3b8" }}>
                No chapters match “{search}”.
              </div>
            )}
          </nav>
        </aside>

        {/* main content */}
        <main ref={contentRef} style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          <Chapter ch={current} />

          {/* prev / next */}
          <div style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "0 28px 70px",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}>
            <button
              onClick={() => prevCh && goTo(prevCh.id)}
              disabled={!prevCh}
              style={navBtn(!prevCh)}
            >
              {prevCh ? `← ${String(prevCh.id).padStart(2, "0")} · ${prevCh.title}` : ""}
            </button>
            <button
              onClick={() => nextCh && goTo(nextCh.id)}
              disabled={!nextCh}
              style={{ ...navBtn(!nextCh), textAlign: "right" }}
            >
              {nextCh ? `${String(nextCh.id).padStart(2, "0")} · ${nextCh.title} →` : ""}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function navBtn(disabled) {
  return {
    flex: 1,
    maxWidth: "48%",
    padding: "12px 16px",
    fontSize: 13,
    fontWeight: 600,
    color: disabled ? "transparent" : "#334155",
    background: disabled ? "transparent" : "#f8fafc",
    border: disabled ? "1px solid transparent" : "1px solid #e2e8f0",
    borderRadius: 10,
    cursor: disabled ? "default" : "pointer",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.4,
  };
}
