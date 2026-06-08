import React, { useState, useRef, useEffect } from "react";

/* ============================================================
   PRODUCTION AI AGENTS — THE ENGINEERING PROBLEMS NOBODY TALKS ABOUT
   A fully self-contained interactive encyclopedia.
   No API calls. No external data. No CSS libraries.
   Pure React + inline styles. All 13 chapters hardcoded.
   ============================================================ */

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

const PARTS = [
  {
    id: 0,
    label: "Part 0",
    name: "Why Agents Are a Different Beast",
    color: "#475569", // slate
    tint: "#f1f5f9",
    chapters: [1, 2, 3],
  },
  {
    id: 1,
    label: "Part 1",
    name: "The 7 Hard Problems",
    color: "#ea580c", // red/orange — danger zone
    tint: "#fff7ed",
    chapters: [4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 2,
    label: "Part 2",
    name: "Putting It Together",
    color: "#16a34a", // green — solutions
    tint: "#f0fdf4",
    chapters: [11, 12, 13],
  },
];

/* Small helpers for the SVGs */
const C = {
  flow: "#0ea5e9", // teal — normal/healthy
  flowDark: "#0369a1",
  fail: "#ef4444", // red/coral — failure
  failDark: "#b91c1c",
  queue: "#f59e0b", // amber — queues/buffers
  queueDark: "#b45309",
  llm: "#8b5cf6", // purple — LLM calls
  llmDark: "#6d28d9",
  tool: "#3b82f6", // blue — tools/external
  toolDark: "#1d4ed8",
  mem: "#10b981", // green — state/memory
  memDark: "#047857",
  ink: "#0f172a",
  faint: "#94a3b8",
};

function Arrowhead({ id, color }) {
  return (
    <marker
      id={id}
      markerWidth="9"
      markerHeight="9"
      refX="7"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M0,0 L7,3 L0,6 Z" fill={color} />
    </marker>
  );
}

/* ============================================================
   CHAPTER DATA
   ============================================================ */

const CHAPTERS = [
  /* ---------------- PART 0 ---------------- */
  {
    id: 1,
    part: 0,
    title: "What Makes Agentic Systems Uniquely Hard",
    insight:
      "An agent run is not a function call — it is a long-lived, stateful, side-effecting workflow, and that single fact invalidates almost every reliability assumption you brought from web services.",
    problem: [
      "A traditional REST endpoint is a contract you can reason about: a request arrives, you do a bounded amount of work, you return a response, and the whole interaction is over in milliseconds. It is atomic, it is (mostly) deterministic, and if it fails you simply call it again. An AI agent breaks every one of those properties at once.",
      "An agent is long-running — a single task can span minutes or hours across dozens of LLM calls and tool invocations. It is non-deterministic — the same prompt can produce a different plan on every run. And it is stateful — it accumulates context, makes branching decisions, and fires real-world side effects as it goes. The consequence is a blast radius that has no analogue in request/response systems: by the time an agent errors out it may have already sent emails, written to three databases, spent forty thousand tokens, and completed half of an irreversible workflow. You cannot simply retry it the way you retry an HTTP 500, because here 'retry' might mean charging the customer's card a second time.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Traditional request/response versus an agent loop">
        <defs>
          <Arrowhead id="ah1a" color={C.flow} />
          <Arrowhead id="ah1b" color={C.llm} />
          <Arrowhead id="ah1c" color={C.fail} />
        </defs>
        {/* divider */}
        <line x1="320" y1="20" x2="320" y2="280" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

        {/* LEFT: traditional */}
        <text x="160" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>Traditional API call</text>
        <rect x="36" y="110" width="70" height="46" rx="8" fill="#fff" stroke={C.flowDark} strokeWidth="1.5" />
        <text x="71" y="138" textAnchor="middle" fontSize="12" fill={C.flowDark} fontFamily={FONT}>Client</text>
        <rect x="206" y="110" width="70" height="46" rx="8" fill="#e0f2fe" stroke={C.flowDark} strokeWidth="1.5" />
        <text x="241" y="138" textAnchor="middle" fontSize="12" fill={C.flowDark} fontFamily={FONT}>Server</text>
        <line x1="108" y1="124" x2="202" y2="124" stroke={C.flow} strokeWidth="2" markerEnd="url(#ah1a)" />
        <text x="155" y="117" textAnchor="middle" fontSize="10.5" fill={C.flowDark} fontFamily={FONT}>request</text>
        <line x1="204" y1="146" x2="110" y2="146" stroke={C.flow} strokeWidth="2" markerEnd="url(#ah1a)" />
        <text x="155" y="162" textAnchor="middle" fontSize="10.5" fill={C.flowDark} fontFamily={FONT}>response · 180ms</text>
        <text x="160" y="214" textAnchor="middle" fontSize="11" fill={C.flow} fontFamily={MONO}>atomic · deterministic</text>
        <text x="160" y="232" textAnchor="middle" fontSize="11" fill={C.flow} fontFamily={MONO}>↺ retry = safe</text>

        {/* RIGHT: agent loop */}
        <text x="480" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>AI agent run</text>
        {/* loop nodes */}
        <circle cx="468" cy="78" r="22" fill="#ede9fe" stroke={C.llmDark} strokeWidth="1.5" />
        <text x="468" y="82" textAnchor="middle" fontSize="10.5" fill={C.llmDark} fontFamily={FONT}>Think</text>
        <circle cx="556" cy="118" r="22" fill="#dbeafe" stroke={C.toolDark} strokeWidth="1.5" />
        <text x="556" y="122" textAnchor="middle" fontSize="10.5" fill={C.toolDark} fontFamily={FONT}>Act</text>
        <circle cx="468" cy="158" r="22" fill="#e0f2fe" stroke={C.flowDark} strokeWidth="1.5" />
        <text x="468" y="156" textAnchor="middle" fontSize="9.5" fill={C.flowDark} fontFamily={FONT}>Observe</text>
        <circle cx="396" cy="118" r="18" fill="#ede9fe" stroke={C.llmDark} strokeWidth="1.5" />
        <text x="396" y="122" textAnchor="middle" fontSize="9" fill={C.llmDark} fontFamily={FONT}>Think</text>
        {/* loop arrows */}
        <path d="M488,86 Q524,92 540,104" fill="none" stroke={C.llm} strokeWidth="2" markerEnd="url(#ah1b)" />
        <path d="M548,138 Q520,156 490,156" fill="none" stroke={C.flow} strokeWidth="2" markerEnd="url(#ah1a)" />
        <path d="M448,150 Q420,142 410,132" fill="none" stroke={C.llm} strokeWidth="2" markerEnd="url(#ah1b)" />
        <path d="M404,101 Q430,84 448,80" fill="none" stroke={C.llm} strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#ah1b)" />
        {/* side effects fired */}
        <rect x="556" y="60" width="64" height="22" rx="5" fill="#fef2f2" stroke={C.fail} strokeWidth="1.2" />
        <text x="588" y="75" textAnchor="middle" fontSize="9.5" fill={C.failDark} fontFamily={FONT}>✉ email sent</text>
        <rect x="556" y="158" width="64" height="22" rx="5" fill="#fef2f2" stroke={C.fail} strokeWidth="1.2" />
        <text x="588" y="173" textAnchor="middle" fontSize="9.5" fill={C.failDark} fontFamily={FONT}>DB write ✓</text>
        <line x1="572" y1="100" x2="586" y2="84" stroke={C.fail} strokeWidth="1.2" strokeDasharray="2 2" />
        <line x1="572" y1="136" x2="586" y2="156" stroke={C.fail} strokeWidth="1.2" strokeDasharray="2 2" />
        {/* counters + annotation */}
        <text x="372" y="206" fontSize="10.5" fill={C.faint} fontFamily={MONO}>tokens 41,920 · elapsed 6m 12s</text>
        <text x="480" y="232" textAnchor="middle" fontSize="12" fill={C.fail} fontFamily={FONT}>side effects already fired — you cannot just retry</text>
      </svg>
    ),
    svgCaption:
      "Left: a request/response call is atomic and safely repeatable. Right: an agent run branches, accumulates state, and fires irreversible side effects mid-flight — so a naive restart re-executes them.",
    breaks: {
      scenario:
        "A fintech ran a nightly agent that processed a queue of customer refunds: read the ticket, decide eligibility, call the payments tool, post a confirmation. One night a transient 503 came back from the LLM provider on refund #41 of 80.",
      symptom:
        "The orchestrator caught the error and did what it did for any failed job — it restarted the run from the top. The agent re-read the queue, re-decided the first 40 refunds, and issued every one of them a second time. 40 customers were double-refunded before anyone noticed.",
      cause:
        "The team modeled the agent run as a single stateless, idempotent unit of work, exactly like an HTTP handler. But the run had already committed 40 irreversible side effects. There was no record of which work was done, and the refund tool had no idempotency key.",
      fix:
        "They added a checkpoint after each refund (persisting the ticket ID and outcome) so a restart resumes at #41, and an idempotency key per refund so a duplicate call is a no-op at the payments provider. The run became resumable instead of replayable.",
    },
    patterns: [
      { name: "Checkpointing", desc: "Persist progress after each completed step so a restart resumes where it stopped instead of replaying finished work." },
      { name: "Idempotency keys", desc: "Tag every side-effecting tool call with a stable key so the downstream system treats a duplicate as a no-op." },
      { name: "Saga modeling", desc: "Treat the run as a sequence of individually compensable steps, not one atomic transaction." },
      { name: "Bounded blast radius", desc: "Gate irreversible actions behind explicit confirmation, dry-run, or a spend cap so a runaway agent can only do so much damage." },
    ],
    keyInsight:
      "Stop thinking 'API call you can retry' and start thinking 'distributed transaction you must checkpoint and make idempotent.' Every reliability decision flows from that shift.",
  },

  {
    id: 2,
    part: 0,
    title: "The Anatomy of an Agent Loop",
    insight:
      "An agent is a loop, and every single arrow in that loop is a place the system can break — there are no safe edges.",
    problem: [
      "Strip away the framework branding and almost every agent is the same primitive: a ReAct-style loop. The model Thinks (produces reasoning and a proposed action), the runtime Acts (executes a tool), the runtime Observes (feeds the tool's result back in), and then the model Thinks again with the new information. The loop repeats until the model decides it is done — or until something stops it.",
      "What makes this deceptively dangerous is that the loop looks simple but is built entirely out of failure-prone edges. The 'Think' step can hallucinate a tool that does not exist or emit malformed JSON. The 'Act' step can time out, throw, or silently return garbage. The 'Observe' step can fail to parse. And the loop-back edge — the one with no explicit guard — can simply never terminate, because nothing forces the model to ever say 'done.' A backend engineer should read this diagram the way they read a sequence diagram for a distributed call: as a list of things that will eventually go wrong.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="The ReAct agent loop with failure points labeled on every edge">
        <defs>
          <Arrowhead id="ah2" color={C.flow} />
          <Arrowhead id="ah2f" color={C.fail} />
        </defs>
        <text x="320" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>The ReAct loop · every edge is a failure point</text>

        {/* nodes */}
        <circle cx="320" cy="92" r="34" fill="#ede9fe" stroke={C.llmDark} strokeWidth="1.6" />
        <text x="320" y="89" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.llmDark} fontFamily={FONT}>Think</text>
        <text x="320" y="103" textAnchor="middle" fontSize="9" fill={C.llmDark} fontFamily={FONT}>(LLM)</text>

        <circle cx="486" cy="178" r="34" fill="#dbeafe" stroke={C.toolDark} strokeWidth="1.6" />
        <text x="486" y="175" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.toolDark} fontFamily={FONT}>Act</text>
        <text x="486" y="189" textAnchor="middle" fontSize="9" fill={C.toolDark} fontFamily={FONT}>(tool)</text>

        <circle cx="154" cy="178" r="34" fill="#e0f2fe" stroke={C.flowDark} strokeWidth="1.6" />
        <text x="154" y="175" textAnchor="middle" fontSize="11.5" fontWeight="600" fill={C.flowDark} fontFamily={FONT}>Observe</text>
        <text x="154" y="189" textAnchor="middle" fontSize="9" fill={C.flowDark} fontFamily={FONT}>(parse)</text>

        {/* edges */}
        {/* Think -> Act */}
        <path d="M348,114 Q420,140 460,158" fill="none" stroke={C.flow} strokeWidth="2.2" markerEnd="url(#ah2)" />
        <text x="430" y="120" textAnchor="middle" fontSize="11" fill={C.fail} fontFamily={FONT}>may hallucinate a</text>
        <text x="430" y="133" textAnchor="middle" fontSize="11" fill={C.fail} fontFamily={FONT}>tool that doesn't exist</text>

        {/* Act -> Observe */}
        <path d="M452,178 L188,178" fill="none" stroke={C.flow} strokeWidth="2.2" markerEnd="url(#ah2)" />
        <text x="320" y="170" textAnchor="middle" fontSize="11" fill={C.fail} fontFamily={FONT}>tool may time out / throw</text>
        <text x="320" y="200" textAnchor="middle" fontSize="11" fill={C.fail} fontFamily={FONT}>result may be unparseable</text>

        {/* Observe -> Think */}
        <path d="M170,148 Q230,98 286,90" fill="none" stroke={C.flow} strokeWidth="2.2" markerEnd="url(#ah2)" />
        <text x="208" y="120" textAnchor="middle" fontSize="11" fill={C.fail} fontFamily={FONT}>context may overflow</text>

        {/* loop-never-terminate self ref */}
        <path d="M352,78 Q420,52 470,70" fill="none" stroke={C.fail} strokeWidth="1.8" strokeDasharray="4 3" markerEnd="url(#ah2f)" />
        <text x="500" y="58" fontSize="11" fill={C.fail} fontFamily={FONT}>loop may</text>
        <text x="500" y="71" fontSize="11" fill={C.fail} fontFamily={FONT}>never end</text>

        {/* done exit */}
        <path d="M300,124 Q250,250 320,270" fill="none" stroke={C.mem} strokeWidth="2" markerEnd="url(#ah2)" />
        <rect x="288" y="262" width="64" height="22" rx="11" fill="#ecfdf5" stroke={C.memDark} strokeWidth="1.3" />
        <text x="320" y="277" textAnchor="middle" fontSize="10" fill={C.memDark} fontFamily={FONT}>done?</text>
      </svg>
    ),
    svgCaption:
      "The loop has only four edges, and every one of them is a documented production failure mode. The dashed red edge — the loop-back with no guarantee of termination — is the one teams forget to bound.",
    breaks: {
      scenario:
        "A research agent was asked to 'find the company's three biggest competitors and summarize each.' Its prompt rewarded thoroughness. After it had summarized three competitors, the model decided three more would be even better, then kept finding 'one more relevant company.'",
      symptom:
        "The loop ran for 90 minutes and 600+ LLM calls. It never produced a final answer — every iteration ended with another tool call rather than a completion, because nothing in the loop forced termination. The bill for that one task was larger than a week of normal traffic.",
      cause:
        "The loop had no termination condition other than the model's own judgment. There was no max-step cap, no token budget, and no explicit 'finish' contract. The dashed edge in the diagram had no guard.",
      fix:
        "They added a hard max-iteration cap, a per-run token budget that aborts when exceeded, and a structured 'final_answer' tool the model must call to exit — turning a vibe-based stop condition into an enforced one.",
    },
    patterns: [
      { name: "Max-iteration cap", desc: "Refuse to run the loop more than N times, regardless of what the model wants." },
      { name: "Explicit finish contract", desc: "Force the model to call a dedicated final_answer / terminate tool to exit, instead of inferring completion." },
      { name: "Per-edge guards", desc: "Validate output at Think, wrap Act in try/catch and timeout, schema-check at Observe — defend every arrow, not just the call site." },
      { name: "Step budget", desc: "Allocate a finite token/time budget per run and abort the loop the moment it's exhausted." },
    ],
    keyInsight:
      "Read an agent loop the way you read a distributed sequence diagram: assume every arrow fails, and notice that the loop-back edge is the one with no natural stopping point.",
  },

  {
    id: 3,
    part: 0,
    title: "Why Classic Software Engineering Still Wins",
    insight:
      "Agents did not invent new problems — they resurrected every distributed-systems problem we thought we'd solved in the 2000s, and made them urgent again.",
    problem: [
      "There is a temptation to treat agent engineering as a brand-new discipline that requires brand-new ideas. It mostly doesn't. The hard parts of running agents at scale — unbounded fan-out, cascading failures, duplicate side effects, hung workers holding resources, blind debugging — are the exact problems that distributed systems engineers spent the 2000s solving with message queues, circuit breakers, idempotency keys, bulkheads, timeouts, and tracing.",
      "What changed is the urgency and the surface area. A microservice fans out in ways you designed; an agent fans out in ways the model improvised at runtime. A microservice's failure modes are finite and known; an agent invents new ones each run. So the patterns are not new, but the discipline of applying them is no longer optional. The engineers with a real advantage in building reliable agents are not the ones who know the most about prompting — they are the ones who already know what a dead-letter queue, a token bucket, and a saga are, and who reach for them by reflex.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Map of solved distributed-systems patterns onto agent problems">
        <defs>
          <Arrowhead id="ah3" color={C.flow} />
        </defs>
        <text x="160" y="30" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.ink} fontFamily={FONT}>"Solved" in the 2000s</text>
        <text x="480" y="30" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.ink} fontFamily={FONT}>Back, urgent, in agents</text>

        {[
          { y: 70, left: "Message queues", right: "Backpressure & fan-out control" },
          { y: 122, left: "Circuit breakers", right: "Stop cascading tool failures" },
          { y: 174, left: "Idempotency keys", right: "Safe retries of side effects" },
          { y: 226, left: "Bulkheads", right: "Isolate one agent's blast radius" },
        ].map((r, i) => (
          <g key={i}>
            <rect x="24" y={r.y - 18} width="226" height="36" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <text x="137" y={r.y + 5} textAnchor="middle" fontSize="12" fill={C.ink} fontFamily={FONT}>{r.left}</text>
            <line x1="252" y1={r.y} x2="386" y2={r.y} stroke={C.flow} strokeWidth="2" markerEnd="url(#ah3)" />
            <rect x="390" y={r.y - 18} width="226" height="36" rx="8" fill="#e0f2fe" stroke={C.flowDark} strokeWidth="1.2" />
            <text x="503" y={r.y + 5} textAnchor="middle" fontSize="11.5" fill={C.flowDark} fontFamily={FONT}>{r.right}</text>
          </g>
        ))}
      </svg>
    ),
    svgCaption:
      "Each row is a pattern the industry considered settled two decades ago, mapped to the agent problem it directly solves today. Nothing on the right column is novel — it is the left column under new pressure.",
    breaks: {
      scenario:
        "An ML-heavy startup built an impressive agent platform with zero infrastructure borrowed from classic backend work: no queue, no circuit breaker, direct synchronous tool calls. It demoed beautifully. Then a downstream vendor API started returning slow 500s under load.",
      symptom:
        "Every agent that touched that tool blocked on the slow call, threads piled up, the thread pool exhausted, and the entire platform — including agents that never used the failing tool — became unresponsive. A single weak dependency took down everything.",
      cause:
        "There was no circuit breaker to stop calling the failing dependency, and no bulkhead to isolate it. This is the textbook 'cascading failure' that Hystrix-style libraries were built to prevent in 2011 — reintroduced because the team assumed agents needed new playbooks.",
      fix:
        "They wrapped each external tool in a circuit breaker (open after N failures, fail fast while open) and gave each tool its own bounded resource pool (a bulkhead) so one slow dependency could not consume all capacity.",
    },
    patterns: [
      { name: "Circuit breaker", desc: "Trip open after repeated failures and fail fast instead of piling requests onto a dying dependency." },
      { name: "Bulkhead", desc: "Give each tool / agent class its own isolated resource pool so one failure can't drain shared capacity." },
      { name: "Dead-letter queue", desc: "Route work that fails repeatedly to a side channel for inspection instead of retrying it forever." },
      { name: "Message queue decoupling", desc: "Put a queue between agents and downstream systems so producers and consumers fail independently." },
    ],
    keyInsight:
      "If you've built reliable microservices, you already know how to build reliable agents — the names you learned (saga, bulkhead, token bucket) are exactly the tools the next seven chapters need.",
  },

  /* ---------------- PART 1 ---------------- */
  {
    id: 4,
    part: 1,
    title: "Memory Management",
    insight:
      "An agent's context window is a fixed-size buffer, and like any fixed-size buffer it overflows — the only question is what you let it drop, and whether 'the goal' is in it.",
    problem: [
      "Agents accumulate context as they run. Every tool result, every reasoning step, every observation gets appended to the working context that the model sees on the next turn. Because the context window is finite, a long run inevitably hits the ceiling, and something has to be evicted. There are three tiers of memory at play: in-context (the working window the model actually reads), external (a vector DB or key-value store you retrieve from), and parametric (knowledge baked into the weights).",
      "The failure modes are subtle. Context overflow drops information mid-task. Stale memory feeds the model facts that are no longer true. And memory poisoning is the nastiest: one bad retrieval — a wrong document pulled into context — corrupts the model's reasoning for the rest of the run, because it now treats that falsehood as established. Worst of all is the eviction policy nobody designed: when the window fills, naive truncation often drops the oldest tokens first, which is exactly where the original instructions and the goal live. The agent doesn't crash. It just quietly forgets why it was running.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Context window as a filling container with eviction, summarization and offload">
        <defs>
          <Arrowhead id="ah4" color={C.mem} />
          <Arrowhead id="ah4f" color={C.fail} />
        </defs>
        <text x="150" y="26" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.ink} fontFamily={FONT}>Context window (finite)</text>

        {/* container */}
        <rect x="70" y="40" width="160" height="232" rx="8" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* fill blocks bottom-up */}
        <rect x="74" y="244" width="152" height="24" fill="#fee2e2" />
        <text x="150" y="260" textAnchor="middle" fontSize="9.5" fill={C.failDark} fontFamily={FONT}>system prompt + goal</text>
        <rect x="74" y="216" width="152" height="24" fill="#fef3c7" />
        <text x="150" y="232" textAnchor="middle" fontSize="9.5" fill={C.queueDark} fontFamily={FONT}>tool result #1</text>
        <rect x="74" y="188" width="152" height="24" fill="#fef3c7" />
        <text x="150" y="204" textAnchor="middle" fontSize="9.5" fill={C.queueDark} fontFamily={FONT}>tool result #2</text>
        <rect x="74" y="160" width="152" height="24" fill="#fef3c7" />
        <text x="150" y="176" textAnchor="middle" fontSize="9.5" fill={C.queueDark} fontFamily={FONT}>reasoning #18</text>
        <rect x="74" y="132" width="152" height="24" fill="#fef3c7" />
        <text x="150" y="148" textAnchor="middle" fontSize="9.5" fill={C.queueDark} fontFamily={FONT}>tool result #19</text>
        <rect x="74" y="104" width="152" height="24" fill="#fef3c7" />
        <text x="150" y="120" textAnchor="middle" fontSize="9.5" fill={C.queueDark} fontFamily={FONT}>tool result #20</text>
        {/* overflow line */}
        <line x1="70" y1="44" x2="230" y2="44" stroke={C.fail} strokeWidth="2" strokeDasharray="3 3" />
        <text x="150" y="56" textAnchor="middle" fontSize="9" fill={C.fail} fontFamily={MONO}>ceiling</text>

        {/* eviction of goal */}
        <path d="M74,256 L36,256" stroke={C.fail} strokeWidth="2" markerEnd="url(#ah4f)" />
        <text x="36" y="276" textAnchor="end" fontSize="10.5" fill={C.fail} fontFamily={FONT}>goal evicted</text>

        {/* summarize */}
        <path d="M230,128 L300,128" stroke={C.mem} strokeWidth="2" markerEnd="url(#ah4)" />
        <rect x="302" y="110" width="96" height="36" rx="6" fill="#ecfdf5" stroke={C.memDark} strokeWidth="1.2" />
        <text x="350" y="125" textAnchor="middle" fontSize="9.5" fill={C.memDark} fontFamily={FONT}>summarize →</text>
        <text x="350" y="138" textAnchor="middle" fontSize="9.5" fill={C.memDark} fontFamily={FONT}>1 compact block</text>

        {/* offload to external store */}
        <path d="M230,196 L300,196" stroke={C.mem} strokeWidth="2" markerEnd="url(#ah4)" />
        <g>
          <ellipse cx="370" cy="200" rx="58" ry="12" fill="#d1fae5" stroke={C.memDark} strokeWidth="1.2" />
          <rect x="312" y="200" width="116" height="46" fill="#d1fae5" stroke="none" />
          <ellipse cx="370" cy="246" rx="58" ry="12" fill="#a7f3d0" stroke={C.memDark} strokeWidth="1.2" />
          <line x1="312" y1="200" x2="312" y2="246" stroke={C.memDark} strokeWidth="1.2" />
          <line x1="428" y1="200" x2="428" y2="246" stroke={C.memDark} strokeWidth="1.2" />
          <text x="370" y="226" textAnchor="middle" fontSize="10" fill={C.memDark} fontFamily={FONT}>Vector DB / KV</text>
        </g>
        {/* retrieval back in */}
        <path d="M450,222 Q540,190 540,150 Q540,96 232,96" fill="none" stroke={C.mem} strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#ah4)" />
        <text x="556" y="150" fontSize="10.5" fill={C.memDark} fontFamily={FONT}>selective</text>
        <text x="556" y="164" fontSize="10.5" fill={C.memDark} fontFamily={FONT}>retrieval</text>
      </svg>
    ),
    svgCaption:
      "As the window fills toward the ceiling, you choose a policy: evict (and risk dropping the goal at the bottom), summarize into a compact block, or offload to an external store and retrieve selectively. Naive eviction drops the goal first.",
    breaks: {
      scenario:
        "A long-running coding agent was assigned to migrate a service across roughly 50 files. The instructions, acceptance criteria, and 'do not touch the auth module' constraint were all in the original system message. The agent worked file by file, each edit adding tool output to the context.",
      symptom:
        "Around the 50th tool call the agent started making changes that contradicted the original spec, including edits to the auth module it had been told to avoid. It wasn't confused in an obvious way — it confidently pursued a subtly wrong objective.",
      cause:
        "The runtime used oldest-first truncation. By call 50 the original instructions had been evicted to make room. The agent was now reasoning purely from recent tool outputs, with no memory of the actual goal or its constraints.",
      fix:
        "They pinned the goal and hard constraints as immovable system context, summarized completed work into a rolling digest, and offloaded full file contents to an external store retrieved on demand — so the working window always contained the goal plus only what the current step needed.",
    },
    patterns: [
      { name: "Sliding window", desc: "Keep the most recent N turns verbatim and let older turns fall out of the working context." },
      { name: "Recursive summarization", desc: "Compress finished work into a running digest so its meaning survives even when its tokens don't." },
      { name: "Memory tiering", desc: "Pin goal + constraints, keep recent steps in-context, and push bulk detail to an external store." },
      { name: "Selective retrieval (RAG)", desc: "Fetch only the few records relevant to the current step instead of carrying everything inline." },
      { name: "Pinned goal anchor", desc: "Mark the objective and hard constraints as never-evictable so they can't be truncated away." },
    ],
    keyInsight:
      "The context window is a fixed-size buffer with an eviction policy — design that policy deliberately, or it will silently throw away the one thing the agent can't run without: its goal.",
  },

  {
    id: 5,
    part: 1,
    title: "Concurrency",
    insight:
      "Running one agent is a prompt-engineering problem. Running a thousand at once is a distributed-systems problem, and the model is now an unreliable, improvising source of load.",
    problem: [
      "A single agent in isolation is easy to reason about. The trouble starts the moment you run many of them concurrently against shared resources and rate-limited providers. Now you have classic concurrency hazards with an extra twist: the workload is generated by a non-deterministic model that can decide, at runtime, to do far more than you expected.",
      "The specific failures are familiar to anyone who has run a worker fleet. Shared tool access means two agents can write the same file or the same database row and clobber each other. Race conditions appear on any external state read-modify-written without a lock. And fan-out explosions are the agent-specific nightmare: one agent decides to spawn ten sub-agents, each of which spawns ten more, and your '5 tasks' becomes 10,000 LLM calls in two seconds — at which point you hit the provider's rate limit wall instantly and everything 429s. The hard part is that the model controls the fan-out, so the concurrency is emergent, not designed.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Uncontrolled agent fan-out hitting a rate limit versus a bounded worker pool">
        <defs>
          <Arrowhead id="ah5" color={C.tool} />
          <Arrowhead id="ah5q" color={C.queue} />
        </defs>
        <line x1="318" y1="22" x2="318" y2="282" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        <text x="158" y="26" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.fail} fontFamily={FONT}>Uncontrolled fan-out</text>
        <text x="480" y="26" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.flowDark} fontFamily={FONT}>Bounded worker pool</text>

        {/* LEFT tree */}
        <circle cx="158" cy="58" r="16" fill="#ede9fe" stroke={C.llmDark} strokeWidth="1.4" />
        <text x="158" y="62" textAnchor="middle" fontSize="9" fill={C.llmDark} fontFamily={FONT}>root</text>
        {[-70, -23, 24, 71].map((dx, i) => (
          <g key={i}>
            <line x1="158" y1="74" x2={158 + dx} y2="104" stroke={C.llm} strokeWidth="1.3" />
            <circle cx={158 + dx} cy="112" r="11" fill="#ede9fe" stroke={C.llmDark} strokeWidth="1.1" />
          </g>
        ))}
        {[-92, -70, -48, -26, -4, 18, 40, 62, 84].map((dx, i) => (
          <g key={i}>
            <line x1={158 + (dx < 0 ? -40 : 50)} y1="123" x2={158 + dx} y2="150" stroke={C.llm} strokeWidth="0.8" opacity="0.7" />
            <circle cx={158 + dx} cy="156" r="6" fill="#ddd6fe" stroke={C.llmDark} strokeWidth="0.8" />
          </g>
        ))}
        {/* rate limit wall */}
        <rect x="40" y="186" width="236" height="30" rx="6" fill="#fef2f2" stroke={C.fail} strokeWidth="1.6" />
        <text x="158" y="205" textAnchor="middle" fontSize="11.5" fontWeight="600" fill={C.failDark} fontFamily={FONT}>RATE LIMIT WALL · 429</text>
        {[-92, -48, -4, 40, 84].map((dx, i) => (
          <line key={i} x1={158 + dx} y1="162" x2={158 + dx} y2="186" stroke={C.fail} strokeWidth="1.2" strokeDasharray="2 2" />
        ))}
        <text x="158" y="240" textAnchor="middle" fontSize="11" fill={C.fail} fontFamily={FONT}>10,000 calls in 2s →</text>
        <text x="158" y="255" textAnchor="middle" fontSize="11" fill={C.fail} fontFamily={FONT}>everything throttled</text>

        {/* RIGHT pool */}
        <rect x="360" y="46" width="120" height="44" rx="8" fill="#fef3c7" stroke={C.queueDark} strokeWidth="1.4" />
        <text x="420" y="64" textAnchor="middle" fontSize="10.5" fill={C.queueDark} fontFamily={FONT}>task queue</text>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={372 + i * 24} y="74" width="18" height="10" rx="2" fill="#fbbf24" stroke={C.queueDark} strokeWidth="0.6" />
        ))}
        <text x="556" y="72" fontSize="10" fill={C.queueDark} fontFamily={MONO}>bounded</text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <line x1="420" y1="90" x2={400 + i * 40} y2="128" stroke={C.flow} strokeWidth="1.6" markerEnd="url(#ah5)" />
            <circle cx={400 + i * 40} cy="142" r="15" fill="#e0f2fe" stroke={C.flowDark} strokeWidth="1.3" />
            <text x={400 + i * 40} y="146" textAnchor="middle" fontSize="9" fill={C.flowDark} fontFamily={FONT}>w{i + 1}</text>
          </g>
        ))}
        <text x="480" y="186" textAnchor="middle" fontSize="11" fill={C.flowDark} fontFamily={FONT}>fixed N workers pull work</text>
        <text x="480" y="202" textAnchor="middle" fontSize="11" fill={C.flowDark} fontFamily={FONT}>at a rate the API can serve</text>
        {/* backpressure */}
        <path d="M400,128 Q420,108 420,92" fill="none" stroke={C.queue} strokeWidth="1.6" strokeDasharray="3 2" markerEnd="url(#ah5q)" />
        <text x="480" y="240" textAnchor="middle" fontSize="11" fill={C.queueDark} fontFamily={FONT}>queue full → producers wait</text>
        <text x="480" y="255" textAnchor="middle" fontSize="11" fill={C.queueDark} fontFamily={FONT}>no 429, no clobbering</text>
      </svg>
    ),
    svgCaption:
      "Left: model-driven recursive fan-out detonates into thousands of concurrent calls and slams the provider's rate limit. Right: a queue plus a fixed worker pool converts that burst into a steady, serviceable stream.",
    breaks: {
      scenario:
        "A 'deep research' agent was designed to break a question into subtopics and dispatch a sub-agent per subtopic. Subtopics were allowed to spawn their own sub-agents for follow-up questions. For most queries this fanned out two levels and finished fine.",
      symptom:
        "One broad query fanned out three levels deep. The recursion produced over 9,000 concurrent LLM requests within seconds. The provider returned 429s en masse, in-flight agents failed, retries piled on, and the account was briefly rate-limited across all products — including unrelated production traffic.",
      cause:
        "Fan-out depth and breadth were controlled by the model with no global ceiling. There was no concurrency limiter and no shared budget across the whole agent tree, so the tree could grow without bound.",
      fix:
        "They added a global concurrency semaphore (at most K outstanding LLM calls account-wide), a max fan-out depth and breadth per node, and a shared task queue so excess work waited instead of launching. The tree could still be wide, but never explosive.",
    },
    patterns: [
      { name: "Worker pool", desc: "Process tasks with a fixed number of workers so total concurrency is a constant you chose, not one the model improvised." },
      { name: "Task queue", desc: "Buffer pending work in a queue and let workers pull at a sustainable rate." },
      { name: "Distributed lock / mutex", desc: "Serialize writes to a shared resource so two agents can't clobber the same row or file." },
      { name: "Concurrency limiter (semaphore)", desc: "Cap the number of simultaneous LLM/tool calls across the entire agent tree, not per agent." },
      { name: "Bounded fan-out", desc: "Hard-limit how many sub-agents any node may spawn and how deep recursion may go." },
    ],
    keyInsight:
      "The model is now a source of load that can decide to do 100× more work at runtime — so the only safe concurrency is the kind you bound externally, never the kind the agent grants itself.",
  },

  {
    id: 6,
    part: 1,
    title: "Backpressure",
    insight:
      "When a producer outruns its consumers, an unbounded queue doesn't absorb the difference — it converts it into a slow-motion out-of-memory crash.",
    problem: [
      "Backpressure is the mechanism by which a slow consumer tells a fast producer to slow down. Streaming and messaging systems have dealt with this for years, and it applies to agents with almost no translation. An agent can generate downstream work — URLs to scrape, records to write, sub-tasks to enqueue — far faster than the systems consuming that work can keep up.",
      "Without backpressure, the queue between producer and consumer becomes the failure point. An unbounded queue simply grows: it accepts everything the agent produces, memory climbs, and eventually the process is OOM-killed. Even before that, the downstream tool API gets overwhelmed, database writes amplify, and a slow consumer triggers a cascade backward through the system. The fix is not 'a bigger queue' — that only delays the crash. The fix is to make the queue bounded and to propagate a signal backward so the producer feels the pressure and slows down, or so excess work is shed deliberately rather than accumulated silently.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Producer agent, bounded queue, consumer workers with a backpressure signal flowing backward">
        <defs>
          <Arrowhead id="ah6" color={C.flow} />
          <Arrowhead id="ah6b" color={C.fail} />
        </defs>
        <text x="320" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>Bounded queue with backpressure</text>

        {/* producer */}
        <circle cx="78" cy="130" r="34" fill="#ede9fe" stroke={C.llmDark} strokeWidth="1.6" />
        <text x="78" y="127" textAnchor="middle" fontSize="11" fill={C.llmDark} fontFamily={FONT}>producer</text>
        <text x="78" y="140" textAnchor="middle" fontSize="9" fill={C.llmDark} fontFamily={FONT}>agent</text>
        <text x="78" y="184" textAnchor="middle" fontSize="10" fill={C.fail} fontFamily={FONT}>fast ⚡</text>

        {/* queue (bounded) */}
        <line x1="114" y1="130" x2="226" y2="130" stroke={C.flow} strokeWidth="2.2" markerEnd="url(#ah6)" />
        <rect x="232" y="96" width="176" height="68" rx="8" fill="#fffbeb" stroke={C.queueDark} strokeWidth="1.6" />
        <text x="320" y="88" textAnchor="middle" fontSize="10.5" fill={C.queueDark} fontFamily={MONO}>capacity 1000 · 980 used</text>
        {/* fill cells - nearly full */}
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={i} x={240 + i * 15} y="106" width="11" height="48" rx="2" fill={i < 10 ? "#fbbf24" : "#fde68a"} stroke={C.queueDark} strokeWidth="0.5" />
        ))}
        <text x="320" y="178" textAnchor="middle" fontSize="10" fill={C.queueDark} fontFamily={FONT}>near high-watermark</text>

        {/* consumers */}
        <line x1="408" y1="130" x2="520" y2="130" stroke={C.flow} strokeWidth="2.2" markerEnd="url(#ah6)" />
        {[100, 130, 160].map((cy, i) => (
          <g key={i}>
            <rect x="528" y={cy - 11} width="84" height="22" rx="5" fill="#e0f2fe" stroke={C.flowDark} strokeWidth="1.2" />
            <text x="570" y={cy + 4} textAnchor="middle" fontSize="9.5" fill={C.flowDark} fontFamily={FONT}>worker {i + 1}</text>
          </g>
        ))}
        <text x="570" y="186" textAnchor="middle" fontSize="10" fill={C.flowDark} fontFamily={FONT}>slow 🐢</text>

        {/* backpressure signal backward */}
        <path d="M320,212 L320,250 L78,250 L78,168" fill="none" stroke={C.fail} strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#ah6b)" />
        <text x="320" y="232" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.fail} fontFamily={FONT}>backpressure: "slow down / shed load"</text>
        <text x="200" y="268" textAnchor="middle" fontSize="10.5" fill={C.fail} fontFamily={FONT}>producer throttles before the queue overflows</text>
      </svg>
    ),
    svgCaption:
      "The queue is bounded and watched. As it nears its high-watermark, a backpressure signal travels backward to the producer, which throttles (or sheds load) — so the system slows gracefully instead of exhausting memory.",
    breaks: {
      scenario:
        "A web-research agent crawled a site by extracting links from each page and queueing them for a content-summarization worker. The crawl logic had no depth limit, and the queue was a plain in-memory list with no maximum size.",
      symptom:
        "On a large site the agent enqueued links faster than the summarizer could drain them. The queue grew to hundreds of thousands of pending URLs, memory climbed steadily for twenty minutes, and the process was OOM-killed — losing all in-flight work with no record of what had or hadn't been processed.",
      cause:
        "The producer (crawler) had no awareness of the consumer's (summarizer's) throughput. With an unbounded queue, the rate mismatch was stored as memory growth until the process died.",
      fix:
        "They switched to a bounded queue: enqueue blocks (or sheds) when full, which naturally throttles the crawler to the summarizer's pace. They added a token-bucket limit on outbound fetches and a crawl-depth cap so the workload was bounded at the source too.",
    },
    patterns: [
      { name: "Bounded queue", desc: "Cap queue size so enqueue blocks or rejects when full, turning a memory leak into honest backpressure." },
      { name: "Token bucket rate limiting", desc: "Allow work only as fast as tokens refill, smoothing bursts to a sustainable rate." },
      { name: "Load shedding", desc: "Deliberately drop or defer excess work when overloaded instead of accepting it and crashing." },
      { name: "High/low watermarks", desc: "Signal the producer to pause at a high fill level and resume at a low one, avoiding oscillation." },
      { name: "Pull-based demand", desc: "Let consumers request work when ready (reactive streams) rather than letting producers push unconditionally." },
    ],
    keyInsight:
      "A bigger queue is not backpressure — it's a longer fuse. Real backpressure makes the producer feel the consumer's pain and slow down before anything breaks.",
  },

  {
    id: 7,
    part: 1,
    title: "Retries",
    insight:
      "Naive retries don't recover from failure — they amplify it, and against non-idempotent tools they turn one mistake into N real-world side effects.",
    problem: [
      "Agents fail constantly: LLM provider errors, tool timeouts, transient network blips, malformed outputs. Retrying is the obvious response, and for transient, idempotent failures it's the right one. The danger is applying retries reflexively, everywhere, without thinking about what each retry actually does.",
      "Three things make agent retries uniquely hazardous. First, non-idempotent tools: retrying a 'send email' or 'charge card' call that actually succeeded — but whose confirmation got lost — repeats the side effect. Second, retry storms at scale: when a shared dependency degrades, thousands of agents retry in lockstep and convert a partial outage into a total one. Third, retrying the wrong layer: an inner retry plus an outer retry multiply, so '3 retries' quietly becomes 27 attempts. Effective retries require classifying failures (retryable vs not), backing off with jitter, enforcing a budget, attaching idempotency keys, and resuming from a checkpoint rather than restarting the whole run.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Retry decision tree and exponential backoff with jitter">
        <defs>
          <Arrowhead id="ah7" color={C.flow} />
          <Arrowhead id="ah7f" color={C.fail} />
        </defs>
        <text x="320" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>Should this failure be retried?</text>

        {/* start */}
        <rect x="20" y="60" width="92" height="34" rx="6" fill="#fef2f2" stroke={C.fail} strokeWidth="1.4" />
        <text x="66" y="81" textAnchor="middle" fontSize="11" fill={C.failDark} fontFamily={FONT}>tool error</text>

        {/* diamond 1 retryable */}
        <path d="M170,77 L210,55 L250,77 L210,99 Z" fill="#fff" stroke={C.ink} strokeWidth="1.3" />
        <text x="210" y="80" textAnchor="middle" fontSize="9.5" fill={C.ink} fontFamily={FONT}>retryable?</text>
        <line x1="112" y1="77" x2="168" y2="77" stroke={C.flow} strokeWidth="1.8" markerEnd="url(#ah7)" />
        {/* no -> fail fast */}
        <line x1="210" y1="99" x2="210" y2="128" stroke={C.fail} strokeWidth="1.6" markerEnd="url(#ah7f)" />
        <text x="222" y="118" fontSize="9.5" fill={C.fail} fontFamily={FONT}>no</text>
        <rect x="164" y="130" width="92" height="28" rx="6" fill="#fef2f2" stroke={C.fail} strokeWidth="1.3" />
        <text x="210" y="148" textAnchor="middle" fontSize="10" fill={C.failDark} fontFamily={FONT}>fail fast</text>

        {/* diamond 2 budget */}
        <path d="M300,77 L342,55 L384,77 L342,99 Z" fill="#fff" stroke={C.ink} strokeWidth="1.3" />
        <text x="342" y="80" textAnchor="middle" fontSize="9.5" fill={C.ink} fontFamily={FONT}>budget left?</text>
        <line x1="250" y1="77" x2="298" y2="77" stroke={C.flow} strokeWidth="1.8" markerEnd="url(#ah7)" />
        <text x="274" y="70" textAnchor="middle" fontSize="9" fill={C.flowDark} fontFamily={FONT}>yes</text>
        <line x1="342" y1="99" x2="342" y2="128" stroke={C.fail} strokeWidth="1.6" markerEnd="url(#ah7f)" />
        <text x="354" y="118" fontSize="9.5" fill={C.fail} fontFamily={FONT}>no</text>
        <rect x="296" y="130" width="92" height="28" rx="6" fill="#fef2f2" stroke={C.fail} strokeWidth="1.3" />
        <text x="342" y="148" textAnchor="middle" fontSize="10" fill={C.failDark} fontFamily={FONT}>give up → DLQ</text>

        {/* diamond 3 idempotent */}
        <path d="M432,77 L476,55 L520,77 L476,99 Z" fill="#fff" stroke={C.ink} strokeWidth="1.3" />
        <text x="476" y="80" textAnchor="middle" fontSize="9" fill={C.ink} fontFamily={FONT}>idempotent?</text>
        <line x1="384" y1="77" x2="430" y2="77" stroke={C.flow} strokeWidth="1.8" markerEnd="url(#ah7)" />
        <text x="407" y="70" textAnchor="middle" fontSize="9" fill={C.flowDark} fontFamily={FONT}>yes</text>
        {/* no -> attach key */}
        <line x1="476" y1="99" x2="476" y2="120" stroke={C.queueDark} strokeWidth="1.6" markerEnd="url(#ah7)" />
        <rect x="426" y="122" width="100" height="26" rx="6" fill="#fffbeb" stroke={C.queueDark} strokeWidth="1.2" />
        <text x="476" y="139" textAnchor="middle" fontSize="9" fill={C.queueDark} fontFamily={FONT}>attach idem-key</text>
        {/* yes -> retry */}
        <line x1="520" y1="77" x2="566" y2="77" stroke={C.flow} strokeWidth="1.8" markerEnd="url(#ah7)" />
        <rect x="568" y="62" width="60" height="30" rx="6" fill="#ecfdf5" stroke={C.memDark} strokeWidth="1.3" />
        <text x="598" y="81" textAnchor="middle" fontSize="9.5" fill={C.memDark} fontFamily={FONT}>retry</text>
        <line x1="476" y1="148" x2="476" y2="160" stroke={C.queueDark} strokeWidth="1.2" />
        <path d="M476,160 Q540,160 580,94" fill="none" stroke={C.memDark} strokeWidth="1.2" strokeDasharray="3 2" markerEnd="url(#ah7)" />

        {/* backoff timeline */}
        <text x="40" y="196" fontSize="11" fontWeight="600" fill={C.ink} fontFamily={FONT}>Exponential backoff + jitter</text>
        <line x1="40" y1="252" x2="600" y2="252" stroke="#cbd5e1" strokeWidth="1.2" />
        {[
          { x: 80, base: 1, label: "1s" },
          { x: 180, base: 2, label: "2s" },
          { x: 320, base: 4, label: "4s" },
          { x: 520, base: 8, label: "8s" },
        ].map((b, i) => (
          <g key={i}>
            <line x1={b.x} y1="252" x2={b.x} y2="244" stroke="#94a3b8" strokeWidth="1" />
            <rect x={b.x - 8} y="220" width="16" height="32" rx="3" fill="#c7d2fe" stroke={C.llmDark} strokeWidth="1" />
            {/* jitter band */}
            <line x1={b.x - 14} y1="234" x2={b.x + 14} y2="234" stroke={C.llmDark} strokeWidth="1" strokeDasharray="2 2" />
            <circle cx={b.x + (i % 2 === 0 ? 6 : -7)} cy="234" r="2.5" fill={C.llmDark} />
            <text x={b.x} y="266" textAnchor="middle" fontSize="9.5" fill={C.llmDark} fontFamily={MONO}>{b.label}</text>
          </g>
        ))}
        <text x="488" y="282" textAnchor="middle" fontSize="10" fill={C.faint} fontFamily={FONT}>jitter spreads retries so they don't sync up</text>
      </svg>
    ),
    svgCaption:
      "Every failure runs the gauntlet: is it retryable, is there budget, is the tool idempotent? Only then retry — with exponentially growing delays and random jitter so a fleet of agents doesn't retry in a synchronized thundering herd.",
    breaks: {
      scenario:
        "A support agent ended each resolved ticket by calling a send_email tool to notify the customer. The tool returned a confirmation the agent parsed to decide success. One day the email service was slow: the email actually sent, but the confirmation timed out before arriving.",
      symptom:
        "The agent interpreted the timeout as failure and retried. The email service, still slow, kept sending the email and timing out on the confirmation. Five retries later, the customer had received the same resolution email five times.",
      cause:
        "The send_email tool was non-idempotent and had no idempotency key, while the retry logic couldn't distinguish 'the action failed' from 'the action succeeded but I didn't hear back.' Retrying an at-least-once operation produced duplicates.",
      fix:
        "They added an idempotency key per outbound email so the service de-duplicates repeats, capped retries with a budget, and treated confirmation timeouts as 'unknown' (verify before re-sending) rather than 'failed.'",
    },
    patterns: [
      { name: "Exponential backoff + jitter", desc: "Grow the delay between attempts and randomize it so retries don't synchronize into a thundering herd." },
      { name: "Idempotency keys", desc: "Stamp side-effecting calls with a stable key so a retried operation is de-duplicated downstream." },
      { name: "Retry budget", desc: "Cap total retries per run (and per dependency) so failures can't burn unbounded tokens or hammer an API." },
      { name: "Failure classification", desc: "Retry only transient/retryable errors; fail fast on permanent ones like 400s or schema violations." },
      { name: "Checkpoint-based resume", desc: "On retry, resume from the last good checkpoint instead of re-running already-completed steps." },
    ],
    keyInsight:
      "Before you retry anything, ask 'is this safe to do twice?' — if the answer is no, you need an idempotency key, not another attempt.",
  },

  {
    id: 8,
    part: 1,
    title: "Timeouts",
    insight:
      "An agent has no natural end. If you don't impose a deadline at every layer, 'still working' and 'permanently stuck' look identical — and the stuck one holds your resources hostage.",
    problem: [
      "Unlike a request handler, an agent has no built-in completion boundary. It runs until it decides it's done, and a model can decide that never. That makes timeouts not a nicety but the primary safety mechanism preventing a hung agent from holding expensive resources indefinitely.",
      "The subtlety is that one timeout is not enough — every layer needs its own. You need an LLM-call timeout, a tool-execution timeout, a single-step timeout, a total-run timeout, and a sub-agent timeout. Get the values wrong and you trade one failure for another: too short and you get false failures and wasteful retries; too long and a stuck agent holds a GPU, a DB connection, and a queue slot for hours; none at all and you get true infinite hangs. Worse, naive nesting causes cascading timeouts — an inner timeout fires, the outer layer interprets it as a failure and retries the whole thing, multiplying the work. The professional answer is layered budgets plus deadline propagation: compute a total deadline once and pass the remaining time down the call stack, so inner layers never promise more time than the outer layer has left.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Concentric timeout budgets with deadline propagation flowing inward">
        <defs>
          <Arrowhead id="ah8" color={C.flowDark} />
        </defs>
        <text x="320" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>Layered timeout budgets · deadline propagation</text>

        {/* concentric rings */}
        <circle cx="250" cy="168" r="118" fill="#f0f9ff" stroke={C.flowDark} strokeWidth="1.6" />
        <circle cx="250" cy="168" r="88" fill="#e0f2fe" stroke={C.flowDark} strokeWidth="1.4" />
        <circle cx="250" cy="168" r="58" fill="#bae6fd" stroke={C.flowDark} strokeWidth="1.3" />
        <circle cx="250" cy="168" r="30" fill="#7dd3fc" stroke={C.flowDark} strokeWidth="1.2" />

        <text x="250" y="64" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={C.flowDark} fontFamily={MONO}>total run ≤ 10m</text>
        <text x="250" y="94" textAnchor="middle" fontSize="10" fontWeight="600" fill={C.flowDark} fontFamily={MONO}>step ≤ 2m</text>
        <text x="250" y="123" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={C.flowDark} fontFamily={MONO}>tool ≤ 30s</text>
        <text x="250" y="172" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily={MONO}>LLM ≤ 10s</text>

        {/* propagation arrows inward (right side) */}
        <path d="M250,56 L250,80" stroke={C.flowDark} strokeWidth="1.4" markerEnd="url(#ah8)" />
        <path d="M250,86 L250,108" stroke={C.flowDark} strokeWidth="1.4" markerEnd="url(#ah8)" />
        <path d="M250,116 L250,136" stroke={C.flowDark} strokeWidth="1.4" markerEnd="url(#ah8)" />

        {/* remaining-budget callouts on the right */}
        <text x="392" y="100" fontSize="10.5" fill={C.ink} fontFamily={FONT}>pass remaining</text>
        <text x="392" y="115" fontSize="10.5" fill={C.ink} fontFamily={FONT}>budget down ↓</text>
        <g fontFamily={MONO} fontSize="10" fill={C.flowDark}>
          <text x="392" y="148">enter run: 600s left</text>
          <text x="392" y="170">→ this step: min(120s, 600s)</text>
          <text x="392" y="192">→ this tool: min(30s, 118s)</text>
          <text x="392" y="214">→ this LLM call: min(10s, 30s)</text>
        </g>
        <text x="392" y="244" fontSize="11" fill={C.fail} fontFamily={FONT}>no inner layer may</text>
        <text x="392" y="259" fontSize="11" fill={C.fail} fontFamily={FONT}>outlive the outer deadline</text>

        <text x="250" y="304" textAnchor="middle" fontSize="0" fill="#fff" />
      </svg>
    ),
    svgCaption:
      "Each layer gets its own ceiling, and the remaining wall-clock budget propagates inward. An inner call always takes the minimum of its own limit and whatever time the outer layer has left — so a hang at any layer is bounded by the layer above it.",
    breaks: {
      scenario:
        "A data-enrichment agent called an external geocoding tool. Normally the tool replied in under a second. Configuration drift left that specific tool call with no client-side timeout, on the assumption that 'the API is fast.'",
      symptom:
        "One night the geocoding provider had a partial outage and held connections open without ever responding. The agent's worker blocked on that read forever. It held a GPU-backed inference slot, an open database connection, and its queue slot for six hours until someone noticed throughput had quietly dropped and killed the worker.",
      cause:
        "There was no tool-execution timeout and no total-run deadline, so a non-responding dependency produced an indefinite hang rather than a bounded failure. 'Stuck' was indistinguishable from 'busy.'",
      fix:
        "They set a tool timeout (with a small grace), a total-run deadline, and deadline propagation so no call can exceed the remaining run budget. On timeout the agent now releases resources and returns a graceful partial result instead of holding everything hostage.",
    },
    patterns: [
      { name: "Layered timeout budgets", desc: "Independent ceilings at the LLM-call, tool, step, sub-agent, and total-run levels." },
      { name: "Deadline propagation", desc: "Compute the total deadline once and pass the remaining time down the stack so inner calls can't overrun it." },
      { name: "Graceful partial completion", desc: "On timeout, return whatever useful work is done and release resources rather than failing hard." },
      { name: "Watchdog / heartbeat", desc: "Have a supervisor track liveness and forcibly reclaim a worker that stops making progress." },
    ],
    keyInsight:
      "Put a deadline on every layer and propagate the remaining budget inward — because the only difference between a working agent and a hung one is whether something is counting down the clock.",
  },

  {
    id: 9,
    part: 1,
    title: "Failure Handling",
    insight:
      "Agents fail in five fundamentally different ways, and four of them never throw an exception — the dangerous failures are the silent ones your try/catch will never see.",
    problem: [
      "Normal software mostly fails loudly: an exception is raised, a non-2xx is returned, a process crashes. Agents do that too, but those hard errors are the easy case. The failures that actually hurt are the ones that look like success.",
      "There are five categories worth distinguishing. (1) Hard errors — a tool throws; easy to catch. (2) Soft errors — a tool returns plausible but wrong data; the agent has no reason to doubt it. (3) LLM errors — the model hallucinates a tool that doesn't exist or invents an argument. (4) Logical errors — the agent pursues a wrong subgoal correctly for twenty steps. (5) Partial completion — half the task succeeds, then the run dies. Only the first throws. The other four require active detection: validating structured output, asserting invariants on tool results, tripping a circuit breaker on repeated failures, and — critically — checkpointing so that when something does crash, you don't redo (and re-fire the side effects of) everything that already succeeded.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Five-category failure taxonomy and a saga rollback with compensating actions">
        <defs>
          <Arrowhead id="ah9" color={C.flow} />
          <Arrowhead id="ah9c" color={C.fail} />
        </defs>
        <line x1="300" y1="20" x2="300" y2="280" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

        {/* LEFT: taxonomy */}
        <text x="150" y="26" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.ink} fontFamily={FONT}>Failure taxonomy</text>
        <rect x="96" y="40" width="108" height="28" rx="6" fill="#0f172a" />
        <text x="150" y="58" textAnchor="middle" fontSize="10.5" fill="#fff" fontFamily={FONT}>agent failures</text>
        {[
          { y: 92, t: "1 · Hard error", s: "tool throws — caught", c: C.flowDark, bg: "#e0f2fe", thrown: true },
          { y: 128, t: "2 · Soft error", s: "wrong data, looks right", c: C.queueDark, bg: "#fef3c7", thrown: false },
          { y: 164, t: "3 · LLM error", s: "phantom tool call", c: C.llmDark, bg: "#ede9fe", thrown: false },
          { y: 200, t: "4 · Logical error", s: "wrong subgoal, 20 steps", c: C.failDark, bg: "#fee2e2", thrown: false },
          { y: 236, t: "5 · Partial", s: "half done, then crash", c: C.failDark, bg: "#fee2e2", thrown: false },
        ].map((r, i) => (
          <g key={i}>
            <line x1="150" y1="68" x2="40" y2={r.y + 13} stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="36" y={r.y} width="168" height="30" rx="6" fill={r.bg} stroke={r.c} strokeWidth="1.2" />
            <text x="46" y={r.y + 13} fontSize="10" fontWeight="600" fill={r.c} fontFamily={FONT}>{r.t}</text>
            <text x="46" y={r.y + 25} fontSize="8.5" fill={r.c} fontFamily={FONT}>{r.s}</text>
            <text x="196" y={r.y + 19} textAnchor="end" fontSize="13" fill={r.thrown ? C.flowDark : C.fail} fontFamily={FONT}>{r.thrown ? "✓" : "✕"}</text>
          </g>
        ))}
        <text x="150" y="278" textAnchor="middle" fontSize="9" fill={C.fail} fontFamily={FONT}>✕ = never throws an exception</text>

        {/* RIGHT: saga rollback */}
        <text x="470" y="26" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.ink} fontFamily={FONT}>Saga: compensating rollback</text>
        {/* forward steps */}
        {[
          { x: 332, label: "S1", sub: "book" },
          { x: 412, label: "S2", sub: "charge" },
          { x: 492, label: "S3", sub: "email" },
          { x: 572, label: "S4", sub: "ship" },
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x - 24} y="58" width="48" height="34" rx="6" fill={i < 3 ? "#ecfdf5" : "#fef2f2"} stroke={i < 3 ? C.memDark : C.fail} strokeWidth="1.3" />
            <text x={s.x} y="74" textAnchor="middle" fontSize="10" fontWeight="600" fill={i < 3 ? C.memDark : C.failDark} fontFamily={FONT}>{s.label}</text>
            <text x={s.x} y="86" textAnchor="middle" fontSize="8" fill={i < 3 ? C.memDark : C.failDark} fontFamily={FONT}>{s.sub}</text>
            {i < 3 && <line x1={s.x + 24} y1="75" x2={s.x + 32} y2="75" stroke={C.flow} strokeWidth="1.6" markerEnd="url(#ah9)" />}
          </g>
        ))}
        <text x="572" y="108" textAnchor="middle" fontSize="9" fill={C.fail} fontFamily={FONT}>S4 fails ✕</text>

        {/* compensations backward */}
        {[
          { x: 332, label: "C1", sub: "refund-?" },
          { x: 412, label: "C2", sub: "void" },
          { x: 492, label: "C3", sub: "retract" },
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x - 24} y="170" width="48" height="34" rx="6" fill="#fff7ed" stroke={C.queueDark} strokeWidth="1.3" />
            <text x={s.x} y="186" textAnchor="middle" fontSize="10" fontWeight="600" fill={C.queueDark} fontFamily={FONT}>{s.label}</text>
            <text x={s.x} y="198" textAnchor="middle" fontSize="7.5" fill={C.queueDark} fontFamily={FONT}>{s.sub}</text>
            {/* link compensation up to its step */}
            <line x1={s.x} y1="92" x2={s.x} y2="170" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2 2" />
          </g>
        ))}
        {/* backward arrows */}
        <line x1="492" y1="225" x2="436" y2="225" stroke={C.fail} strokeWidth="1.6" markerEnd="url(#ah9c)" />
        <line x1="412" y1="225" x2="356" y2="225" stroke={C.fail} strokeWidth="1.6" markerEnd="url(#ah9c)" />
        <text x="572" y="190" textAnchor="middle" fontSize="9" fill={C.queueDark} fontFamily={FONT}>undo in</text>
        <text x="572" y="201" textAnchor="middle" fontSize="9" fill={C.queueDark} fontFamily={FONT}>reverse</text>
        <text x="470" y="248" textAnchor="middle" fontSize="10" fill={C.queueDark} fontFamily={FONT}>each completed step has a compensating action</text>
        <text x="470" y="266" textAnchor="middle" fontSize="10" fill={C.fail} fontFamily={FONT}>but if no checkpoint, you can't tell what to undo</text>
      </svg>
    ),
    svgCaption:
      "Left: only the hard error throws — the other four failure types pass silently and must be actively detected. Right: a saga gives every committed step a compensating action, rolling the world back in reverse when a later step fails.",
    breaks: {
      scenario:
        "A document-processing agent ran a 20-step pipeline per file: parse, extract, transform, write to three systems, notify owners. Each step had real side effects. The pipeline ran as one long function with no intermediate state persisted.",
      symptom:
        "At step 19 of 20, on a particularly large file, the worker hit an out-of-memory error and crashed. The orchestrator restarted the job from step 1 — re-parsing, re-extracting, and re-writing to all three downstream systems, duplicating records and re-notifying owners who'd already been emailed.",
      cause:
        "There were no checkpoints, so the only recovery option was a full restart. And because the steps weren't idempotent and had no saga compensations, the restart re-executed 18 already-successful side effects.",
      fix:
        "They checkpointed state after each step (so a restart resumes at 19), made downstream writes idempotent, and added a saga so a mid-pipeline failure can compensate completed steps in reverse instead of blindly replaying them.",
    },
    patterns: [
      { name: "Structured output validation", desc: "Force tool calls and final answers through a schema; reject anything that doesn't conform before acting on it." },
      { name: "Output assertions", desc: "Check invariants on tool results (ranges, non-empty, expected shape) to catch soft errors that don't throw." },
      { name: "Circuit breaker", desc: "After repeated failures from a tool or step, stop calling it and fail fast instead of looping on a known-bad path." },
      { name: "Saga / compensating transactions", desc: "Pair each committed step with an undo so a later failure can roll the world back safely." },
      { name: "Checkpointing", desc: "Persist state after each step so a crash resumes from the last good point instead of replaying everything." },
    ],
    keyInsight:
      "The exception is the easy failure. Engineer hardest against the four that never throw — wrong data, phantom tools, wrong goals, and half-finished runs — because nothing will alert you unless you build the detector yourself.",
  },

  {
    id: 10,
    part: 1,
    title: "Observability",
    insight:
      "An agent doing 50 tool calls in ten minutes is a black box. Without logs, metrics, and traces, 'why did it do that?' has no answer — and after an incident, that's the only question that matters.",
    problem: [
      "When an agent misbehaves, the questions are specific and unforgiving: what was it reasoning about at step 23? Why did it pick that tool? What exactly did the LLM receive as input there? How long did each step take, and where did the run actually go wrong? If you can't answer those, you can't fix the agent — you can only guess and hope.",
      "The three pillars of observability translate cleanly to agents. Logs: capture every LLM call with its full prompt, full response, latency, and token counts, plus structured records of each reasoning and tool step. Metrics: track step latency at p50/p95/p99, success rate per tool, tokens per run, steps per run, and completion rate, so you can see degradation in aggregate. Traces: represent an entire agent run as one parent span with a child span per step, so the whole decision sequence is reconstructable as a waterfall. The connective tissue is a trace ID propagated through every tool call, so a single run is stitched together end-to-end even when it spans sub-agents and external services.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="An agent run as a distributed trace waterfall with spans, latencies, tokens and an error span">
        <defs>
          <Arrowhead id="ah10" color={C.flow} />
        </defs>
        <text x="320" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>Agent run as a trace waterfall · trace_id 9f3a…</text>

        {/* time axis */}
        <line x1="150" y1="44" x2="610" y2="44" stroke="#e2e8f0" strokeWidth="1" />
        {["0s", "10s", "20s", "30s", "40s", "47s"].map((t, i) => (
          <text key={i} x={150 + i * 90} y="38" textAnchor="middle" fontSize="8.5" fill={C.faint} fontFamily={MONO}>{t}</text>
        ))}

        {/* parent span */}
        <text x="12" y="62" fontSize="9.5" fill={C.ink} fontFamily={MONO}>agent.run</text>
        <rect x="150" y="52" width="455" height="16" rx="3" fill="#cbd5e1" />
        <text x="612" y="64" fontSize="8.5" fill={C.faint} fontFamily={MONO}>47s</text>

        {/* child spans */}
        {[
          { y: 76, label: "llm.plan", x: 150, w: 70, color: "#ddd6fe", stroke: C.llmDark, meta: "1.9s · 1.2k tok" },
          { y: 98, label: "tool.search", x: 222, w: 95, color: "#dbeafe", stroke: C.toolDark, meta: "4.4s" },
          { y: 120, label: "llm.reason", x: 320, w: 60, color: "#ddd6fe", stroke: C.llmDark, meta: "1.4s · 0.9k tok" },
          { y: 142, label: "tool.db_read", x: 382, w: 55, color: "#dbeafe", stroke: C.toolDark, meta: "1.1s" },
          { y: 164, label: "llm.reason", x: 440, w: 58, color: "#ddd6fe", stroke: C.llmDark, meta: "1.3s · 1.0k tok" },
          { y: 186, label: "tool.send_email", x: 500, w: 70, color: "#fee2e2", stroke: C.fail, meta: "TIMEOUT ✕", err: true },
        ].map((s, i) => (
          <g key={i}>
            <text x="12" y={s.y + 12} fontSize="9" fill={s.err ? C.failDark : C.ink} fontFamily={MONO}>{s.label}</text>
            <rect x={s.x} y={s.y} width={s.w} height="15" rx="3" fill={s.color} stroke={s.stroke} strokeWidth="1.1" />
            <text x={s.x + s.w + 6} y={s.y + 12} fontSize="8" fill={s.err ? C.failDark : C.faint} fontFamily={MONO}>{s.meta}</text>
          </g>
        ))}
        {/* error marker */}
        <text x="500" y="218" fontSize="10.5" fill={C.fail} fontFamily={FONT}>← root cause visible: the email tool hung</text>

        {/* pillars legend */}
        <rect x="14" y="232" width="180" height="56" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        <text x="24" y="248" fontSize="9.5" fontWeight="700" fill={C.ink} fontFamily={FONT}>LOGS</text>
        <text x="24" y="262" fontSize="8.5" fill={C.faint} fontFamily={FONT}>prompt · response · tokens · latency</text>
        <text x="24" y="280" fontSize="8.5" fill={C.faint} fontFamily={FONT}>per step, structured</text>

        <rect x="206" y="232" width="190" height="56" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        <text x="216" y="248" fontSize="9.5" fontWeight="700" fill={C.ink} fontFamily={FONT}>METRICS</text>
        <text x="216" y="262" fontSize="8.5" fill={C.faint} fontFamily={FONT}>p50/p95/p99 latency · tool success</text>
        <text x="216" y="280" fontSize="8.5" fill={C.faint} fontFamily={FONT}>tokens/run · steps/run · completion</text>

        <rect x="408" y="232" width="218" height="56" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        <text x="418" y="248" fontSize="9.5" fontWeight="700" fill={C.ink} fontFamily={FONT}>TRACES</text>
        <text x="418" y="262" fontSize="8.5" fill={C.faint} fontFamily={FONT}>one parent span, child span per step</text>
        <text x="418" y="280" fontSize="8.5" fill={C.faint} fontFamily={FONT}>trace_id propagated through every tool</text>
      </svg>
    ),
    svgCaption:
      "The whole run is one parent span with a child span per LLM call and tool call. Latencies, token counts, and the red timed-out span make the root cause legible at a glance — exactly what you can't get from scattered print statements.",
    breaks: {
      scenario:
        "An autonomous agent with write access to a CRM ran unattended overnight. In the morning, support discovered it had bulk-updated hundreds of records with a clearly wrong field value. Leadership wanted to know what happened and why.",
      symptom:
        "The team had nothing to reconstruct the decision with — no per-step logs of the prompts and responses, no trace tying the run together, no metrics showing when behavior diverged. They could see the damaged records but not the reasoning, the inputs, or the sequence of choices that produced them.",
      cause:
        "Observability was an afterthought: a few unstructured log lines and no trace IDs. With 50+ steps per run and no span-per-step tracing, the agent was a literal black box during the one moment it mattered.",
      fix:
        "They instrumented every LLM call (full prompt, response, tokens, latency) and every tool call as child spans under a per-run trace ID, added metrics with alerting on anomalous run length and tool-failure rate, and built dashboards to replay any run step by step.",
    },
    patterns: [
      { name: "Trace-ID propagation", desc: "Generate one ID per run and thread it through every LLM and tool call (and sub-agent) for end-to-end reconstruction." },
      { name: "Structured reasoning logs", desc: "Log each step as structured data — prompt, response, chosen tool, args, tokens, latency — not free-text prints." },
      { name: "RED/USE metrics", desc: "Track rate, errors, and duration per tool and per step (and resource saturation) to spot degradation early." },
      { name: "Token-budget metrics", desc: "Treat tokens-per-run as a first-class metric so cost and runaway loops surface as graphs, not surprises." },
      { name: "Run-length anomaly detection", desc: "Alert when steps-per-run or tokens-per-run drift outside the normal band — an early signal of loops or confusion." },
    ],
    keyInsight:
      "Instrument the agent as if a post-mortem is inevitable — because when it does something harmful, the only thing standing between you and 'we have no idea why' is the trace you remembered to capture.",
  },

  /* ---------------- PART 2 ---------------- */
  {
    id: 11,
    part: 2,
    title: "The Reliable Agent Stack",
    insight:
      "A production agent system is not one clever loop — it's a stack of boring, battle-tested infrastructure layers, each one owning exactly one of the seven hard problems.",
    problem: [
      "Once you accept that each of the seven problems is real, the architecture writes itself: every problem maps to a dedicated layer, and the reliable agent is the composition of those layers around the model. The model does the thinking; the stack keeps it from hurting anyone.",
      "Reading bottom to top by responsibility: a task queue absorbs bursts and provides backpressure; a worker pool bounds concurrency; a checkpoint store enables recovery and resumable retries; a timeout manager enforces deadlines at every layer; a tool registry with idempotency keys makes retries safe; a memory manager keeps the goal in context and offloads the rest; a trace collector makes every run observable; and a circuit breaker stops cascading failures. None of these components is exotic — they're the same primitives that make microservice fleets reliable. The skill is not inventing them; it's wiring them around a non-deterministic core and resisting the urge to skip 'just one.'",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Architecture of a production agent system with each component color-coded by the problem it solves">
        <defs>
          <Arrowhead id="ah11" color={C.flow} />
        </defs>
        <text x="320" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>Production agent stack · colored by problem solved</text>

        {/* incoming */}
        <rect x="18" y="60" width="74" height="34" rx="6" fill="#fff" stroke="#94a3b8" strokeWidth="1.2" />
        <text x="55" y="81" textAnchor="middle" fontSize="10" fill={C.ink} fontFamily={FONT}>tasks in</text>
        <line x1="92" y1="77" x2="116" y2="77" stroke={C.flow} strokeWidth="1.8" markerEnd="url(#ah11)" />

        {/* task queue (amber - backpressure/concurrency) */}
        <rect x="118" y="58" width="96" height="38" rx="6" fill="#fef3c7" stroke={C.queueDark} strokeWidth="1.4" />
        <text x="166" y="74" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={C.queueDark} fontFamily={FONT}>Task Queue</text>
        <text x="166" y="87" textAnchor="middle" fontSize="7.5" fill={C.queueDark} fontFamily={FONT}>backpressure</text>
        <line x1="214" y1="77" x2="238" y2="77" stroke={C.flow} strokeWidth="1.8" markerEnd="url(#ah11)" />

        {/* worker pool (teal - concurrency) */}
        <rect x="240" y="58" width="96" height="38" rx="6" fill="#e0f2fe" stroke={C.flowDark} strokeWidth="1.4" />
        <text x="288" y="74" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={C.flowDark} fontFamily={FONT}>Worker Pool</text>
        <text x="288" y="87" textAnchor="middle" fontSize="7.5" fill={C.flowDark} fontFamily={FONT}>concurrency</text>
        <line x1="336" y1="77" x2="360" y2="77" stroke={C.flow} strokeWidth="1.8" markerEnd="url(#ah11)" />

        {/* agent core (the loop) */}
        <rect x="362" y="50" width="120" height="54" rx="8" fill="#ede9fe" stroke={C.llmDark} strokeWidth="1.6" />
        <text x="422" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.llmDark} fontFamily={FONT}>Agent Loop</text>
        <text x="422" y="88" textAnchor="middle" fontSize="8" fill={C.llmDark} fontFamily={FONT}>Think · Act · Observe</text>

        {/* circuit breaker wrapping outputs (red) */}
        <rect x="500" y="58" width="118" height="38" rx="6" fill="#fef2f2" stroke={C.fail} strokeWidth="1.4" />
        <text x="559" y="74" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={C.failDark} fontFamily={FONT}>Circuit Breaker</text>
        <text x="559" y="87" textAnchor="middle" fontSize="7.5" fill={C.failDark} fontFamily={FONT}>failure handling</text>
        <line x1="482" y1="77" x2="498" y2="77" stroke={C.flow} strokeWidth="1.8" markerEnd="url(#ah11)" />

        {/* support layers below the agent core */}
        {/* timeout manager */}
        <rect x="120" y="138" width="118" height="40" rx="6" fill="#bae6fd" stroke={C.flowDark} strokeWidth="1.3" />
        <text x="179" y="155" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={C.flowDark} fontFamily={FONT}>Timeout Manager</text>
        <text x="179" y="169" textAnchor="middle" fontSize="7.5" fill={C.flowDark} fontFamily={FONT}>timeouts</text>

        {/* tool registry idem */}
        <rect x="252" y="138" width="118" height="40" rx="6" fill="#dbeafe" stroke={C.toolDark} strokeWidth="1.3" />
        <text x="311" y="152" textAnchor="middle" fontSize="9" fontWeight="600" fill={C.toolDark} fontFamily={FONT}>Tool Registry</text>
        <text x="311" y="164" textAnchor="middle" fontSize="7.5" fill={C.toolDark} fontFamily={FONT}>idempotency → retries</text>

        {/* memory manager */}
        <rect x="384" y="138" width="118" height="40" rx="6" fill="#d1fae5" stroke={C.memDark} strokeWidth="1.3" />
        <text x="443" y="155" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={C.memDark} fontFamily={FONT}>Memory Manager</text>
        <text x="443" y="169" textAnchor="middle" fontSize="7.5" fill={C.memDark} fontFamily={FONT}>memory</text>

        {/* connectors from agent core down to support layers */}
        {[179, 311, 443].map((x, i) => (
          <line key={i} x1="422" y1="104" x2={x} y2="136" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 2" />
        ))}

        {/* bottom layer: checkpoint store + trace collector spanning */}
        <rect x="120" y="206" width="238" height="40" rx="6" fill="#ecfdf5" stroke={C.memDark} strokeWidth="1.3" />
        <text x="239" y="223" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={C.memDark} fontFamily={FONT}>Checkpoint Store</text>
        <text x="239" y="237" textAnchor="middle" fontSize="7.5" fill={C.memDark} fontFamily={FONT}>failure recovery + resumable retry</text>

        <rect x="370" y="206" width="248" height="40" rx="6" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.3" />
        <text x="494" y="223" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#334155" fontFamily={FONT}>Trace Collector</text>
        <text x="494" y="237" textAnchor="middle" fontSize="7.5" fill="#475569" fontFamily={FONT}>observability across every step</text>

        {/* connect support to bottom */}
        <line x1="179" y1="178" x2="220" y2="204" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="443" y1="178" x2="470" y2="204" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 2" />

        {/* legend */}
        <g fontFamily={FONT} fontSize="8.5">
          <rect x="18" y="266" width="10" height="10" fill="#fef3c7" stroke={C.queueDark} /><text x="32" y="275" fill={C.queueDark}>backpressure</text>
          <rect x="118" y="266" width="10" height="10" fill="#e0f2fe" stroke={C.flowDark} /><text x="132" y="275" fill={C.flowDark}>concurrency/timeouts</text>
          <rect x="262" y="266" width="10" height="10" fill="#dbeafe" stroke={C.toolDark} /><text x="276" y="275" fill={C.toolDark}>retries</text>
          <rect x="330" y="266" width="10" height="10" fill="#d1fae5" stroke={C.memDark} /><text x="344" y="275" fill={C.memDark}>memory/recovery</text>
          <rect x="452" y="266" width="10" height="10" fill="#fef2f2" stroke={C.fail} /><text x="466" y="275" fill={C.failDark}>failure handling</text>
          <rect x="540" y="266" width="10" height="10" fill="#f1f5f9" stroke="#64748b" /><text x="554" y="275" fill="#475569">observability</text>
        </g>
      </svg>
    ),
    svgCaption:
      "The model sits in the middle; everything around it is conventional infrastructure. Each box is colored by the hard problem it owns — and removing any single box reintroduces exactly that chapter's failure mode.",
    breaks: {
      scenario:
        "A team shipped an agent product with a great loop and a memory manager, but deferred 'the infra stuff' — queue, timeouts, checkpoints, tracing — to a later milestone. It worked in the demo and the early beta.",
      symptom:
        "Under real traffic it failed in waves, one chapter at a time: first runaway concurrency (no pool), then OOM from an unbounded queue (no backpressure), then duplicate side effects on restart (no checkpoints), then a multi-hour debugging session with no traces. Each incident matched a missing layer precisely.",
      cause:
        "The stack was incomplete. Every omitted layer was a latent production incident waiting for the load that would trigger its corresponding failure mode.",
      fix:
        "They built out the full stack incrementally, prioritized by which failure was hurting most: bounded queue and worker pool first, then checkpoints and idempotent tools, then layered timeouts, then end-to-end tracing and circuit breakers. The waves stopped as each layer landed.",
    },
    patterns: [
      { name: "Task queue layer", desc: "Owns backpressure and absorbs bursts so producers and the agent fleet decouple." },
      { name: "Worker pool + concurrency limiter", desc: "Owns concurrency: a fixed, bounded number of agents and outstanding calls." },
      { name: "Checkpoint store", desc: "Owns recovery and resumable retries so crashes don't replay completed side effects." },
      { name: "Timeout manager + tool registry", desc: "Owns timeouts (deadlines everywhere) and safe retries (idempotency keys per tool)." },
      { name: "Trace collector + circuit breaker", desc: "Owns observability (span per step) and failure containment (trip open on repeated faults)." },
    ],
    keyInsight:
      "There's no clever shortcut around the stack — each layer is a tax you pay once or an incident you pay for repeatedly, and the model in the middle is the easy part.",
  },

  {
    id: 12,
    part: 2,
    title: "Failure Mode Catalog",
    insight:
      "Ten failure modes account for the overwhelming majority of production agent incidents — and every one of them has a name, a trigger, and a known fix from the preceding chapters.",
    problem: [
      "After enough incidents, the same shapes recur. Cataloging them turns firefighting into pattern-matching: when an agent misbehaves, you recognize the mode, recall the trigger, and reach for the established fix instead of debugging from zero. The ten below are the ones that show up again and again.",
      "They are: (1) the Infinite Loop — no termination condition; (2) the Context Flood — the window fills and the goal is evicted; (3) the Retry Storm — a failed tool retried in lockstep by thousands of agents; (4) the Phantom Tool Call — the model invokes a tool that doesn't exist; (5) the Side Effect Replay — a non-idempotent tool repeated on retry; (6) the Silent Corruption — a tool returns wrong data and the agent trusts it; (7) the Runaway Fan-out — sub-agents spawning sub-agents without bound; (8) the Hung Worker — no timeout, resources held indefinitely; (9) the Missing Checkpoint — a crash near the end forces a full restart; and (10) the Blind Failure — something breaks and there's no log, trace, or metric to explain it. Each maps directly to one of the seven problems, and the 2×2 map below sorts them by how often they bite and how badly.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="A 2x2 map of ten failure modes by frequency and severity">
        <text x="320" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>Failure mode map · frequency × severity</text>

        {/* axes */}
        <line x1="80" y1="250" x2="600" y2="250" stroke="#94a3b8" strokeWidth="1.4" />
        <line x1="80" y1="40" x2="80" y2="250" stroke="#94a3b8" strokeWidth="1.4" />
        <text x="340" y="276" textAnchor="middle" fontSize="10.5" fill={C.ink} fontFamily={FONT}>frequency in production →</text>
        <text x="30" y="148" textAnchor="middle" fontSize="10.5" fill={C.ink} fontFamily={FONT} transform="rotate(-90 30 148)">severity of impact →</text>

        {/* quadrant guides */}
        <line x1="340" y1="40" x2="340" y2="250" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="80" y1="145" x2="600" y2="145" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        <text x="206" y="56" textAnchor="middle" fontSize="8.5" fill={C.faint} fontFamily={FONT}>rare · severe</text>
        <text x="470" y="56" textAnchor="middle" fontSize="8.5" fill={C.faint} fontFamily={FONT}>common · severe</text>
        <text x="206" y="240" textAnchor="middle" fontSize="8.5" fill={C.faint} fontFamily={FONT}>rare · mild</text>
        <text x="470" y="240" textAnchor="middle" fontSize="8.5" fill={C.faint} fontFamily={FONT}>common · mild</text>

        {/* dots: x in [90..595], y in [50..245]; higher severity = smaller y */}
        {[
          { x: 540, y: 70, n: "1", label: "Infinite Loop", c: C.fail },
          { x: 470, y: 95, n: "2", label: "Context Flood", c: C.queueDark },
          { x: 420, y: 78, n: "3", label: "Retry Storm", c: C.fail },
          { x: 500, y: 150, n: "4", label: "Phantom Tool", c: C.llmDark },
          { x: 300, y: 85, n: "5", label: "Side Effect Replay", c: C.fail },
          { x: 250, y: 120, n: "6", label: "Silent Corruption", c: C.queueDark },
          { x: 175, y: 80, n: "7", label: "Runaway Fan-out", c: C.fail },
          { x: 360, y: 165, n: "8", label: "Hung Worker", c: C.flowDark },
          { x: 215, y: 105, n: "9", label: "Missing Checkpoint", c: C.memDark },
          { x: 430, y: 110, n: "10", label: "Blind Failure", c: "#334155" },
        ].map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="9" fill={d.c} opacity="0.9" />
            <text x={d.x} y={d.y + 3.2} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fff" fontFamily={FONT}>{d.n}</text>
            <text x={d.x + 13} y={d.y + 3.5} fontSize="8.5" fill={d.c} fontFamily={FONT}>{d.label}</text>
          </g>
        ))}
      </svg>
    ),
    svgCaption:
      "Ten named failures plotted by how often they occur and how much damage they do. The upper-right cluster (Infinite Loop, Retry Storm, Side Effect Replay, Blind Failure) is where to invest defenses first — frequent and severe.",
    breaks: {
      scenario:
        "An on-call engineer was paged for an agent platform behaving erratically: cost spiking, some runs never finishing, duplicate notifications going out. With no catalog, they treated it as one mysterious mega-bug and burned hours chasing a single root cause.",
      symptom:
        "It was actually three distinct, well-known failure modes happening at once — an Infinite Loop (runs never finishing), a Retry Storm (cost spike), and a Side Effect Replay (duplicate notifications). Conflating them made each impossible to fix.",
      cause:
        "Without a shared vocabulary of failure modes, the team couldn't decompose the incident. Every symptom looked novel, so triage had no structure.",
      fix:
        "They adopted this catalog as a triage checklist. Each symptom now maps to a named mode with a known trigger and fix (loop → max-iteration cap; cost spike → backoff + retry budget; duplicates → idempotency keys). Mean-time-to-diagnose dropped sharply.",
    },
    patterns: [
      { name: "Failure-mode triage checklist", desc: "Match each symptom to a named mode (1–10) so incidents decompose into known problems with known fixes." },
      { name: "Frequency × severity prioritization", desc: "Invest defenses in the upper-right quadrant first — the modes that are both common and damaging." },
      { name: "Guardrail-per-mode", desc: "Ship a specific control for each mode: caps for loops, budgets for storms, keys for replays, traces for blind failures." },
      { name: "Pre-mortem mapping", desc: "Before launch, walk the catalog and confirm each mode already has a mitigation in the stack." },
    ],
    keyInsight:
      "Name your failures. An unnamed incident is a research project; a named one is a checklist item with a fix you already wrote three chapters ago.",
  },

  {
    id: 13,
    part: 2,
    title: "Engineering Principles That Never Go Away",
    insight:
      "Frameworks, models, and tools will churn every few months — but the eight principles that make distributed systems reliable are exactly the eight that make agents reliable, and they don't expire.",
    problem: [
      "It's tempting to chase the newest agent framework or model and assume reliability will come with it. It won't. Reliability comes from principles that long predate agents and will outlast whatever you're using today. The seven hard problems are specific; these eight principles are the general stance that prevents them.",
      "They are: (1) Design for failure — assume every step will fail and build the recovery first. (2) Idempotency — every tool call must be safe to replay. (3) Timeouts everywhere — nothing waits forever. (4) Bounded queues — never allow unbounded growth. (5) Backpressure — slow the producer, don't just buffer for the consumer. (6) Observe everything — if you can't measure it, you can't fix it. (7) Fail fast — detect and surface errors at the earliest possible point. (8) Graceful degradation — partial success beats total failure. These aren't a checklist you complete once; they're a posture. Internalize them and the seven problems become things you prevent by reflex rather than discover in an incident channel.",
    ],
    svg: (
      <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="The agent reliability wheel of eight interconnected principles">
        <text x="320" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>The agent reliability wheel</text>

        {/* hub */}
        <circle cx="320" cy="165" r="40" fill="#0f172a" />
        <text x="320" y="161" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff" fontFamily={FONT}>Reliable</text>
        <text x="320" y="175" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff" fontFamily={FONT}>Agent</text>

        {/* 8 segments as labeled nodes around the hub */}
        {(() => {
          const cx = 320, cy = 165, R = 108;
          const items = [
            { t: "Design for failure", c: C.fail },
            { t: "Idempotency", c: C.tool },
            { t: "Timeouts everywhere", c: C.flowDark },
            { t: "Bounded queues", c: C.queueDark },
            { t: "Backpressure", c: C.queueDark },
            { t: "Observe everything", c: "#334155" },
            { t: "Fail fast", c: C.fail },
            { t: "Graceful degradation", c: C.memDark },
          ];
          return items.map((it, i) => {
            const ang = (-90 + i * 45) * (Math.PI / 180);
            const x = cx + R * Math.cos(ang);
            const y = cy + R * Math.sin(ang);
            const anchor = Math.abs(Math.cos(ang)) < 0.3 ? "middle" : x > cx ? "start" : "end";
            // ring-connector line
            return (
              <g key={i}>
                <line x1={cx + 40 * Math.cos(ang)} y1={cy + 40 * Math.sin(ang)} x2={cx + 70 * Math.cos(ang)} y2={cy + 70 * Math.sin(ang)} stroke="#cbd5e1" strokeWidth="1.2" />
                <circle cx={x} cy={y} r="6" fill={it.c} />
                <text x={x + (anchor === "start" ? 10 : anchor === "end" ? -10 : 0)} y={y + (Math.sin(ang) > 0.5 ? 16 : Math.sin(ang) < -0.5 ? -8 : 3.5)} textAnchor={anchor} fontSize="9.5" fontWeight="600" fill={it.c} fontFamily={FONT}>{i + 1} · {it.t}</text>
              </g>
            );
          });
        })()}

        {/* interconnection ring (dashed circle through nodes) */}
        <circle cx="320" cy="165" r="108" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 4" />
      </svg>
    ),
    svgCaption:
      "Eight principles ring a single hub. They reinforce one another — backpressure needs bounded queues, recovery needs observability, graceful degradation needs fail-fast detection — which is why adopting them as a set, not à la carte, is what produces reliability.",
    breaks: {
      scenario:
        "Over two years, one company rewrote its agent platform three times — chasing a new framework each time in the belief that the next one would finally be reliable. Each rewrite reset the infrastructure and re-litigated the same architectural decisions.",
      symptom:
        "Reliability never improved across rewrites. The same incidents recurred on every framework: loops, replays, hangs, blind failures. The tools changed; the failures didn't. Enormous effort produced no durable gain.",
      cause:
        "They treated reliability as a property of the framework rather than of their engineering principles. Because the eight principles were never internalized, every new tool reproduced the same gaps.",
      fix:
        "They froze the framework and instead codified the eight principles as non-negotiable platform invariants — enforced in code review, scaffolding, and shared libraries. Reliability finally improved, and it carried forward intact when they later did change frameworks.",
    },
    patterns: [
      { name: "Principles as invariants", desc: "Encode the eight principles into shared libraries, scaffolds, and review checklists so they hold regardless of framework." },
      { name: "Recovery-first design", desc: "Write the checkpoint, timeout, and rollback path before the happy path — assume every step fails." },
      { name: "Idempotent-by-default tools", desc: "Make 'safe to replay' a requirement for adding any tool, not an afterthought." },
      { name: "Degrade, don't collapse", desc: "Design every operation to return a useful partial result on failure instead of an all-or-nothing crash." },
    ],
    keyInsight:
      "Bet on principles, not frameworks. The model and the tooling will be obsolete in a year; design-for-failure, idempotency, timeouts, and observability will still be exactly what separates a reliable agent from an incident.",
  },
];

/* ============================================================
   UI
   ============================================================ */

function partMeta(partId) {
  return PARTS.find((p) => p.id === partId);
}

export default function App() {
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [readChapters, setReadChapters] = useState(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedParts, setCollapsedParts] = useState(() => new Set());
  const mainRef = useRef(null);

  // scroll content to top whenever the chapter changes
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [selectedChapter]);

  const goTo = (id) => {
    if (id === selectedChapter) return;
    // mark the chapter we're leaving as read
    setReadChapters((prev) => {
      const next = new Set(prev);
      next.add(selectedChapter);
      return next;
    });
    setSelectedChapter(id);
  };

  const togglePart = (partId) => {
    setCollapsedParts((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) next.delete(partId);
      else next.add(partId);
      return next;
    });
  };

  const ch = CHAPTERS.find((c) => c.id === selectedChapter);
  const pm = partMeta(ch.part);

  const q = searchQuery.trim().toLowerCase();
  const isSearching = q.length > 0;
  const matches = (c) =>
    !isSearching || c.title.toLowerCase().includes(q);

  const flatVisible = CHAPTERS.filter(matches);
  const idx = CHAPTERS.findIndex((c) => c.id === selectedChapter);
  const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
  const next = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;

  /* ---------- styles ---------- */
  const sidebarStyle = {
    width: 260,
    minWidth: 260,
    height: "100vh",
    borderRight: "1px solid #e5e7eb",
    background: "#fafafa",
    display: "flex",
    flexDirection: "column",
    fontFamily: FONT,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#fff", color: C.ink, fontFamily: FONT }}>
      {/* ============ SIDEBAR ============ */}
      <aside style={sidebarStyle}>
        {/* header / progress */}
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#94a3b8", fontWeight: 700 }}>
            Field Manual
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.3, marginTop: 4, color: "#0f172a" }}>
            Production AI Agents
          </div>
          <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
            The Engineering Problems Nobody Talks About
          </div>

          {/* progress */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 5, fontWeight: 600 }}>
              <span>{readChapters.size} / {CHAPTERS.length} chapters read</span>
              <span>{Math.round((readChapters.size / CHAPTERS.length) * 100)}%</span>
            </div>
            <div style={{ height: 6, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(readChapters.size / CHAPTERS.length) * 100}%`,
                  background: "linear-gradient(90deg,#475569,#ea580c,#16a34a)",
                  borderRadius: 4,
                  transition: "width .3s ease",
                }}
              />
            </div>
          </div>

          {/* search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chapters…"
            style={{
              marginTop: 14,
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 10px",
              fontSize: 12.5,
              fontFamily: FONT,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              outline: "none",
              background: "#fff",
              color: "#0f172a",
            }}
          />
        </div>

        {/* nav list */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 10px 28px" }}>
          {PARTS.map((part) => {
            const partChapters = CHAPTERS.filter(
              (c) => c.part === part.id && matches(c)
            );
            if (isSearching && partChapters.length === 0) return null;
            const collapsed = !isSearching && collapsedParts.has(part.id);
            return (
              <div key={part.id} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => togglePart(part.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 8px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: 6,
                    fontFamily: FONT,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "#94a3b8",
                      transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                      transition: "transform .15s ease",
                      display: "inline-block",
                      width: 10,
                    }}
                  >
                    ▼
                  </span>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 3,
                      background: part.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", color: part.color, fontWeight: 700 }}>
                      {part.label}
                    </span>
                    <span style={{ fontSize: 11.5, color: "#334155", fontWeight: 600, lineHeight: 1.2 }}>
                      {part.name}
                    </span>
                  </span>
                </button>

                {!collapsed && (
                  <div style={{ marginTop: 2 }}>
                    {partChapters.map((c) => {
                      const active = c.id === selectedChapter;
                      const isRead = readChapters.has(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => goTo(c.id)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                            padding: "7px 8px 7px 26px",
                            marginTop: 1,
                            background: active ? part.tint : "transparent",
                            border: "none",
                            borderLeft: active ? `3px solid ${part.color}` : "3px solid transparent",
                            cursor: "pointer",
                            textAlign: "left",
                            borderRadius: "0 6px 6px 0",
                            fontFamily: FONT,
                            transition: "background .12s ease",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10.5,
                              fontFamily: MONO,
                              color: active ? part.color : "#94a3b8",
                              minWidth: 16,
                              fontWeight: 700,
                            }}
                          >
                            {String(c.id).padStart(2, "0")}
                          </span>
                          <span
                            style={{
                              fontSize: 12.5,
                              color: active ? "#0f172a" : "#475569",
                              fontWeight: active ? 700 : 500,
                              lineHeight: 1.3,
                              flex: 1,
                            }}
                          >
                            {c.title}
                          </span>
                          {isRead && (
                            <span style={{ fontSize: 11, color: "#22c55e", lineHeight: 1.4 }} title="read">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {isSearching && flatVisible.length === 0 && (
            <div style={{ padding: "12px 14px", fontSize: 12.5, color: "#94a3b8" }}>
              No chapters match “{searchQuery}”.
            </div>
          )}
        </nav>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main ref={mainRef} style={{ flex: 1, overflowY: "auto" }}>
        <article style={{ maxWidth: 740, margin: "0 auto", padding: "52px 36px 120px" }}>
          {/* part pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: pm.tint,
                color: pm.color,
                border: `1px solid ${pm.color}33`,
                borderRadius: 999,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 2, background: pm.color }} />
              {pm.label} · {pm.name}
            </span>
          </div>

          {/* title with faded number */}
          <div style={{ position: "relative", marginBottom: 18 }}>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -34,
                left: -6,
                fontSize: 80,
                fontWeight: 800,
                color: "#0f172a",
                opacity: 0.05,
                lineHeight: 1,
                zIndex: 0,
                userSelect: "none",
                fontFamily: FONT,
              }}
            >
              {String(ch.id).padStart(2, "0")}
            </span>
            <h1
              style={{
                position: "relative",
                zIndex: 1,
                fontSize: 30,
                lineHeight: 1.2,
                fontWeight: 800,
                margin: 0,
                letterSpacing: -0.5,
                color: "#0f172a",
              }}
            >
              {ch.title}
            </h1>
          </div>

          {/* the insight — subtle top callout */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 30,
              display: "flex",
              gap: 11,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: pm.color, letterSpacing: 0.6, textTransform: "uppercase", whiteSpace: "nowrap", paddingTop: 1 }}>
              The Insight
            </span>
            <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{ch.insight}</span>
          </div>

          {/* The Core Problem */}
          <SectionLabel text="The Core Problem" color={pm.color} />
          {ch.problem.map((para, i) => (
            <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: "#1e293b", margin: "0 0 16px" }}>
              {para}
            </p>
          ))}

          {/* SVG card */}
          <figure style={{ margin: "30px 0 8px" }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#fff",
                padding: "18px 18px 10px",
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              }}
            >
              {ch.svg}
            </div>
            <figcaption style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.6, marginTop: 10, paddingLeft: 2 }}>
              <span style={{ fontWeight: 700, color: "#475569" }}>Figure {ch.id}. </span>
              {ch.svgCaption}
            </figcaption>
          </figure>

          <Divider />

          {/* Production Failure (red card) */}
          <div
            style={{
              background: "#fef2f2",
              borderLeft: "4px solid #ef4444",
              borderRadius: "0 10px 10px 0",
              padding: "18px 20px",
              margin: "8px 0 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 15 }}>🔥</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "#b91c1c", letterSpacing: 0.5, textTransform: "uppercase" }}>
                Production Failure
              </span>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.75, color: "#7f1d1d", margin: "0 0 12px" }}>
              {ch.breaks.scenario}
            </p>
            <PostmortemRow label="Symptom" body={ch.breaks.symptom} />
            <PostmortemRow label="Root cause" body={ch.breaks.cause} />
            <PostmortemRow label="The fix" body={ch.breaks.fix} last />
          </div>

          {/* Engineering Patterns (green card) */}
          <div
            style={{
              background: "#f0fdf4",
              borderLeft: "4px solid #22c55e",
              borderRadius: "0 10px 10px 0",
              padding: "18px 20px",
              margin: "0 0 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 15 }}>🛠️</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "#15803d", letterSpacing: 0.5, textTransform: "uppercase" }}>
                Engineering Patterns
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {ch.patterns.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <span style={{ color: "#22c55e", fontSize: 13, lineHeight: 1.6, flexShrink: 0 }}>◆</span>
                  <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: "#14532d" }}>
                    <strong style={{ color: "#166534" }}>{p.name}</strong> — {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key insight blockquote */}
          <blockquote
            style={{
              borderLeft: `4px solid ${pm.color}`,
              margin: "8px 0 8px",
              padding: "6px 0 6px 22px",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: pm.color, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
              Key Insight
            </div>
            <p style={{ fontSize: 20, lineHeight: 1.5, fontStyle: "italic", color: "#0f172a", margin: 0, fontWeight: 500 }}>
              {ch.keyInsight}
            </p>
          </blockquote>

          {/* Prev / Next nav */}
          <div
            style={{
              marginTop: 48,
              paddingTop: 24,
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            <NavButton dir="prev" chapter={prev} onClick={goTo} />
            <NavButton dir="next" chapter={next} onClick={goTo} />
          </div>
        </article>
      </main>
    </div>
  );
}

/* ---------- small presentational components ---------- */

function SectionLabel({ text, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 14px" }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, color, letterSpacing: 0.7, textTransform: "uppercase" }}>{text}</span>
      <span style={{ flex: 1, height: 1, background: "#eef2f7" }} />
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#f1f5f9", margin: "26px 0" }} />;
}

function PostmortemRow({ label, body, last }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: last ? 0 : 8, alignItems: "baseline" }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#b91c1c",
          textTransform: "uppercase",
          letterSpacing: 0.3,
          minWidth: 78,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 14, lineHeight: 1.7, color: "#7f1d1d" }}>{body}</span>
    </div>
  );
}

function NavButton({ dir, chapter, onClick }) {
  if (!chapter) {
    // keep layout balanced with an empty slot
    return <span style={{ flex: 1 }} />;
  }
  const pm = partMeta(chapter.part);
  const isNext = dir === "next";
  return (
    <button
      onClick={() => onClick(chapter.id)}
      style={{
        flex: 1,
        textAlign: isNext ? "right" : "left",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "12px 16px",
        cursor: "pointer",
        fontFamily: FONT,
        transition: "border-color .15s ease, box-shadow .15s ease",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = pm.color;
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
        {isNext ? "Next →" : "← Previous"}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: pm.color, fontFamily: MONO }}>
        {String(chapter.id).padStart(2, "0")}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>
        {chapter.title}
      </span>
    </button>
  );
}
