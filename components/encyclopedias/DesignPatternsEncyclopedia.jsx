import React, { useState, useEffect, useRef } from "react";

/* ============================================================
   Design Patterns Encyclopedia — all 23 Gang of Four patterns
   Pure React + inline styles. No external libraries.
   ============================================================ */

/* ---------- TypeScript syntax highlighter (VS Code "Dark+" palette) ---------- */
const TS_KEYWORDS = new Set([
  "abstract", "class", "interface", "extends", "implements", "const", "let", "var",
  "return", "new", "public", "private", "protected", "readonly", "static", "function",
  "this", "if", "else", "for", "while", "of", "in", "typeof", "instanceof", "import",
  "export", "default", "from", "get", "set", "enum", "type", "as", "super", "async",
  "await", "throw", "try", "catch", "switch", "case", "break", "continue", "do",
  "yield", "true", "false", "null", "undefined",
]);
const TS_PRIMITIVES = new Set([
  "string", "number", "boolean", "void", "any", "never", "unknown", "object",
  "symbol", "bigint",
]);

function highlight(code) {
  const lines = code.replace(/\t/g, "  ").split("\n");
  return lines.map((line, li) => {
    const parts = [];
    let i = 0;
    let key = 0;
    const push = (text, color) => {
      if (text === "") return;
      parts.push(
        <span key={key++} style={color ? { color } : undefined}>
          {text}
        </span>
      );
    };
    while (i < line.length) {
      // line comment -> rest of line
      if (line[i] === "/" && line[i + 1] === "/") {
        push(line.slice(i), "#6a9955");
        i = line.length;
        break;
      }
      const ch = line[i];
      // string literal (', ", `)
      if (ch === '"' || ch === "'" || ch === "`") {
        let j = i + 1;
        while (j < line.length && line[j] !== ch) {
          if (line[j] === "\\") j++;
          j++;
        }
        j = Math.min(j + 1, line.length);
        push(line.slice(i, j), "#ce9178");
        i = j;
        continue;
      }
      // identifier / word
      if (/[A-Za-z_$]/.test(ch)) {
        let j = i + 1;
        while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
        const word = line.slice(i, j);
        let color;
        if (TS_KEYWORDS.has(word)) color = "#569cd6";
        else if (TS_PRIMITIVES.has(word)) color = "#4ec9b0";
        else if (/^[A-Z]/.test(word)) color = "#4ec9b0";
        push(word, color);
        i = j;
        continue;
      }
      // run of punctuation / whitespace / digits -> plain
      let j = i + 1;
      while (
        j < line.length &&
        !/[A-Za-z_$"'`]/.test(line[j]) &&
        !(line[j] === "/" && line[j + 1] === "/")
      ) {
        j++;
      }
      push(line.slice(i, j));
      i = j;
    }
    return (
      <div key={li} style={{ minHeight: "1.5em", whiteSpace: "pre" }}>
        {parts.length ? parts : "\u00A0"}
      </div>
    );
  });
}

/* ---------- Copy-to-clipboard button ---------- */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch (e) {
        return false;
      }
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallback();
      }
    } catch (e) {
      fallback();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      onClick={doCopy}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        background: copied ? "#16a34a" : "#2d2d2d",
        color: copied ? "#fff" : "#cccccc",
        border: "1px solid " + (copied ? "#16a34a" : "#3d3d3d"),
        borderRadius: 6,
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ============================================================
   Reusable SVG primitives for the UML diagrams
   - viewBox 0 0 640 320, width 100%
   - color coding: interface=purple, abstract=blue,
     concrete=white, client=gray
   ============================================================ */
const BOX_FILL = {
  interface: "#ede9fe",
  abstract: "#dbeafe",
  concrete: "#ffffff",
  client: "#f1f5f9",
};
const BOX_STROKE = {
  interface: "#8b5cf6",
  abstract: "#3b82f6",
  concrete: "#cbd5e1",
  client: "#94a3b8",
};

// height helper so callers can place arrows precisely
function boxHeight(stereotype, methods) {
  const head = stereotype ? 30 : 20;
  const body = methods && methods.length ? methods.length * 15 + 6 : 8;
  return head + body;
}

function ClassBox({ x, y, w = 150, kind = "concrete", stereotype, title, italic, methods = [] }) {
  const headH = stereotype ? 30 : 20;
  const h = boxHeight(stereotype, methods);
  const cx = x + w / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={5}
        fill={BOX_FILL[kind]}
        stroke={BOX_STROKE[kind]}
        strokeWidth={1.4}
      />
      {stereotype && (
        <text x={cx} y={y + 12} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#64748b">
          {stereotype}
        </text>
      )}
      <text
        x={cx}
        y={y + (stereotype ? 25 : 14)}
        textAnchor="middle"
        fontSize={13}
        fontWeight="bold"
        fontStyle={italic ? "italic" : "normal"}
        fill="#1e293b"
      >
        {title}
      </text>
      <line x1={x} y1={y + headH} x2={x + w} y2={y + headH} stroke={BOX_STROKE[kind]} strokeWidth={1} />
      {methods.map((m, i) => (
        <text key={i} x={x + 8} y={y + headH + 13 + i * 15} fontSize={11} fill="#334155">
          {m}
        </text>
      ))}
    </g>
  );
}

function Defs() {
  return (
    <defs>
      {/* hollow triangle: inheritance / realization */}
      <marker id="tri" markerWidth="13" markerHeight="13" refX="11" refY="5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1,1 L11,5 L1,9 Z" fill="#ffffff" stroke="#475569" strokeWidth="1.1" />
      </marker>
      {/* open arrow: dependency / navigability */}
      <marker id="arr" markerWidth="12" markerHeight="12" refX="8.5" refY="4" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1,1 L8.5,4 L1,7" fill="none" stroke="#475569" strokeWidth="1.3" />
      </marker>
      {/* filled diamond: composition */}
      <marker id="dia" markerWidth="18" markerHeight="12" refX="2" refY="5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M2,5 L8,1.5 L14,5 L8,8.5 Z" fill="#475569" stroke="#475569" strokeWidth="1" />
      </marker>
      {/* hollow diamond: aggregation */}
      <marker id="diao" markerWidth="18" markerHeight="12" refX="2" refY="5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M2,5 L8,1.5 L14,5 L8,8.5 Z" fill="#ffffff" stroke="#475569" strokeWidth="1.1" />
      </marker>
    </defs>
  );
}

function Edge({ x1, y1, x2, y2, kind = "association", label, lx, ly }) {
  const map = {
    implements: { dash: "6,4", start: null, end: "url(#tri)" },
    extends: { dash: null, start: null, end: "url(#tri)" },
    depends: { dash: "4,3", start: null, end: "url(#arr)" },
    composition: { dash: null, start: "url(#dia)", end: "url(#arr)" },
    aggregation: { dash: null, start: "url(#diao)", end: "url(#arr)" },
    association: { dash: null, start: null, end: "url(#arr)" },
  };
  const s = map[kind] || map.association;
  const mx = lx != null ? lx : (x1 + x2) / 2;
  const my = ly != null ? ly : (y1 + y2) / 2;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#475569"
        strokeWidth="1.4"
        strokeDasharray={s.dash || undefined}
        markerStart={s.start || undefined}
        markerEnd={s.end || undefined}
      />
      {label && (
        <text
          x={mx}
          y={my}
          textAnchor="middle"
          fontSize="10"
          fill="#64748b"
          stroke="#ffffff"
          strokeWidth="3"
          style={{ paintOrder: "stroke" }}
        >
          {label}
        </text>
      )}
    </g>
  );
}

const SVG_PROPS = {
  viewBox: "0 0 640 320",
  width: "100%",
  xmlns: "http://www.w3.org/2000/svg",
  style: { display: "block", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
};

/* ---------- per-category color system ---------- */
const CAT = {
  Creational: { tint: "#ede9fe", ink: "#6d28d9", strong: "#7c3aed", soft: "#faf5ff" },
  Structural: { tint: "#cffafe", ink: "#0e7490", strong: "#0891b2", soft: "#ecfeff" },
  Behavioral: { tint: "#fef3c7", ink: "#b45309", strong: "#d97706", soft: "#fffbeb" },
};
const CATEGORY_ORDER = ["Creational", "Structural", "Behavioral"];

/* ============================================================
   PATTERNS DATA — every field hardcoded, no placeholders
   ============================================================ */
const PATTERNS = [
  /* ===================== CREATIONAL ===================== */
  {
    name: "Abstract Factory",
    category: "Creational",
    intent:
      "Provides an interface for creating families of related objects without specifying their concrete classes.",
    aka: ["Kit"],
    useWhen: [
      "Your code must work with several families of related products (e.g. UI widgets for different operating systems).",
      "You want to guarantee that products from the same family are always used together.",
      "You want to hide concrete product classes and swap an entire family in one place.",
    ],
    explanation:
      "An abstract factory declares one creation method per kind of product in a family. Each concrete factory implements those methods to produce a single consistent variant. Client code talks only to the abstract factory and product interfaces, so it never depends on which family is active. Switching the whole family is as simple as supplying a different concrete factory.",
    analogy:
      "Think of a furniture showroom that sells matching sets by style. Ask the 'Modern' department and you get a modern chair, sofa, and table; ask 'Victorian' and every piece matches that style instead — you never end up with a modern chair beside a Victorian sofa.",
    pros: [
      "Guarantees that products from one family are compatible with each other.",
      "Isolates concrete classes — clients depend only on interfaces.",
      "Swapping the entire product family happens in a single line.",
    ],
    cons: [
      "Adding a brand-new kind of product forces a change to every factory.",
      "The web of interfaces and classes can be hard to follow at first.",
    ],
    related: ["Factory Method", "Builder", "Singleton"],
    code: `// Each factory produces a matching family of UI widgets
interface Button { render(): void; }

interface GUIFactory {
  createButton(): Button; // creation method for the family
}

class WinButton implements Button {
  render() { console.log("Render a Windows button"); }
}
class MacButton implements Button {
  render() { console.log("Render a macOS button"); }
}

// Concrete factories each build one specific variant
class WinFactory implements GUIFactory {
  createButton(): Button { return new WinButton(); }
}
class MacFactory implements GUIFactory {
  createButton(): Button { return new MacButton(); }
}

// Client depends only on the abstract types
function renderUI(factory: GUIFactory) {
  factory.createButton().render();
}

const os = "mac";
// Choose the family once; the rest of the code never changes
renderUI(os === "mac" ? new MacFactory() : new WinFactory());`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={20} y={132} w={150} kind="client" title="Client" methods={["buildUI()"]} />
        <ClassBox x={235} y={18} w={170} kind="interface" stereotype="«interface»" title="GUIFactory" methods={["createButton()", "createCheckbox()"]} />
        <ClassBox x={455} y={18} w={165} kind="interface" stereotype="«interface»" title="Button" methods={["render()"]} />
        <ClassBox x={205} y={150} w={155} kind="concrete" title="WinFactory" methods={["createButton()"]} />
        <ClassBox x={205} y={240} w={155} kind="concrete" title="MacFactory" methods={["createButton()"]} />
        <ClassBox x={455} y={170} w={165} kind="concrete" title="WinButton" methods={["render()"]} />
        <Edge x1={170} y1={146} x2={235} y2={55} kind="depends" label="uses" lx={196} ly={92} />
        <Edge x1={282} y1={150} x2={300} y2={84} kind="implements" label="implements" lx={232} ly={120} />
        <Edge x1={300} y1={240} x2={328} y2={84} kind="implements" />
        <Edge x1={537} y1={170} x2={537} y2={69} kind="implements" label="implements" lx={578} ly={120} />
        <Edge x1={360} y1={178} x2={455} y2={188} kind="depends" label="creates" lx={407} ly={170} />
      </svg>
    ),
  },
  {
    name: "Builder",
    category: "Creational",
    intent:
      "Separates the construction of a complex object from its representation so the same process can build different representations.",
    aka: [],
    useWhen: [
      "An object needs many optional parts and a single giant constructor would be unwieldy.",
      "You want to produce different representations of an object using the same building steps.",
      "Construction must happen in a controlled, step-by-step sequence.",
    ],
    explanation:
      "A builder exposes one method per configurable part of a product, then a final build() returns the finished object. Different concrete builders can assemble different representations while following the same steps. An optional director can encapsulate a reusable build sequence. This keeps messy assembly logic out of the product and avoids telescoping constructors.",
    analogy:
      "It's like ordering a custom sandwich at a deli counter. You call out each step — choose the bread, add cheese, pick the fillings, decide on sauces — and only at the end do you receive the assembled sandwich. The same ordering process can yield wildly different sandwiches.",
    pros: [
      "Lets you construct objects step by step and reuse construction code.",
      "Isolates complex assembly from the product's business logic.",
      "Produces different representations with the same building process.",
    ],
    cons: [
      "Requires a separate builder class per product, adding code volume.",
      "Overkill for objects that only have a couple of fields.",
    ],
    related: ["Abstract Factory", "Composite", "Factory Method"],
    code: `// The complex product we assemble piece by piece
class House {
  walls = 0;
  doors = 0;
  hasGarage = false;
}

// Builder exposes one method per configurable part
class HouseBuilder {
  private house = new House();
  setWalls(n: number): this { this.house.walls = n; return this; }
  setDoors(n: number): this { this.house.doors = n; return this; }
  addGarage(): this { this.house.hasGarage = true; return this; }
  build(): House { return this.house; } // hand back the result
}

// Client chains the steps in whatever order it likes
const house = new HouseBuilder()
  .setWalls(4)
  .setDoors(2)
  .addGarage()
  .build();

console.log(house); // House { walls: 4, doors: 2, hasGarage: true }`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={55} w={150} kind="concrete" title="Director" methods={["construct()"]} />
        <ClassBox x={250} y={18} w={185} kind="interface" stereotype="«interface»" title="Builder" methods={["setWalls()", "build()"]} />
        <ClassBox x={250} y={175} w={185} kind="concrete" title="HouseBuilder" methods={["setWalls()", "build()"]} />
        <ClassBox x={480} y={183} w={135} kind="concrete" title="House" methods={[]} />
        <Edge x1={180} y1={72} x2={250} y2={55} kind="depends" label="directs" lx={213} ly={52} />
        <Edge x1={342} y1={175} x2={342} y2={84} kind="implements" label="implements" lx={385} ly={132} />
        <Edge x1={435} y1={200} x2={480} y2={197} kind="depends" label="builds" lx={457} ly={188} />
      </svg>
    ),
  },
  {
    name: "Factory Method",
    category: "Creational",
    intent:
      "Defines an interface for creating an object but lets subclasses decide which concrete class to instantiate.",
    aka: ["Virtual Constructor"],
    useWhen: [
      "A class can't anticipate the exact type of objects it must create.",
      "You want subclasses to specify the objects that get created.",
      "You want to localize creation logic so new products don't touch existing code.",
    ],
    explanation:
      "A creator class declares an abstract factory method that returns a product interface and uses that product in its other logic. Subclasses override the factory method to return their own concrete product. The creator never references concrete products directly, only the interface. New product types arrive by adding a subclass rather than editing existing code.",
    analogy:
      "Picture a logistics company whose planning routine never changes. The road division's factory method produces a Truck, while the sea division's produces a Ship. 'Plan a delivery' stays identical; only the vehicle each branch creates differs.",
    pros: [
      "Removes tight coupling between the creator and concrete products.",
      "Honors the Open/Closed Principle — add products via new subclasses.",
      "Centralizes product creation in a single overridable method.",
    ],
    cons: [
      "Can require many subclasses just to vary the created product.",
      "Adds a layer of indirection that simple cases may not need.",
    ],
    related: ["Abstract Factory", "Template Method", "Prototype"],
    code: `// Product interface returned by the factory method
interface Transport { deliver(): void; }

class Truck implements Transport {
  deliver() { console.log("Deliver by land in a box"); }
}
class Ship implements Transport {
  deliver() { console.log("Deliver by sea in a container"); }
}

// Creator declares the factory method and uses the product
abstract class Logistics {
  abstract createTransport(): Transport; // the factory method
  planDelivery() {
    const t = this.createTransport(); // subclass picks the type
    t.deliver();
  }
}

// Subclasses choose which concrete product to build
class RoadLogistics extends Logistics {
  createTransport(): Transport { return new Truck(); }
}
class SeaLogistics extends Logistics {
  createTransport(): Transport { return new Ship(); }
}

new RoadLogistics().planDelivery(); // Deliver by land in a box
new SeaLogistics().planDelivery();  // Deliver by sea in a container`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={40} y={30} w={185} kind="abstract" italic title="Logistics" methods={["createTransport()", "planDelivery()"]} />
        <ClassBox x={40} y={195} w={185} kind="concrete" title="RoadLogistics" methods={["createTransport()"]} />
        <ClassBox x={420} y={30} w={180} kind="interface" stereotype="«interface»" title="Transport" methods={["deliver()"]} />
        <ClassBox x={420} y={195} w={180} kind="concrete" title="Truck" methods={["deliver()"]} />
        <Edge x1={132} y1={195} x2={132} y2={86} kind="extends" label="extends" lx={165} ly={142} />
        <Edge x1={510} y1={195} x2={510} y2={81} kind="implements" label="implements" lx={552} ly={142} />
        <Edge x1={225} y1={58} x2={420} y2={55} kind="depends" label="creates" lx={322} ly={48} />
      </svg>
    ),
  },
  {
    name: "Prototype",
    category: "Creational",
    intent:
      "Creates new objects by cloning an existing instance instead of constructing them from scratch.",
    aka: ["Clone"],
    useWhen: [
      "Creating an object is far more expensive than copying an existing one.",
      "You want to avoid a factory hierarchy that mirrors your product classes.",
      "Objects have a few known configurations and copying a prepared instance beats rebuilding it.",
    ],
    explanation:
      "Each prototype knows how to produce a copy of itself through a clone() method. Clients ask an existing instance to clone rather than calling a constructor and re-running expensive setup. Concrete prototypes copy their own fields, including nested state when needed. This decouples client code from the concrete classes it duplicates.",
    analogy:
      "It's like photocopying a filled-in form instead of writing a fresh one by hand each time. You keep one carefully prepared original and run off identical copies, changing only the few fields that differ.",
    pros: [
      "Clones objects without coupling to their concrete classes.",
      "Skips costly initialization by copying a ready-made instance.",
      "Lets you produce complex pre-configured objects with ease.",
    ],
    cons: [
      "Cloning objects with circular references can be tricky.",
      "Deciding between deep and shallow copies adds subtle complexity.",
    ],
    related: ["Abstract Factory", "Composite", "Memento"],
    code: `// Prototype interface: every type knows how to copy itself
interface Shape {
  clone(): Shape;
  describe(): string;
}

class Circle implements Shape {
  constructor(public radius: number, public color: string) {}
  // Return a new instance carrying the same field values
  clone(): Shape { return new Circle(this.radius, this.color); }
  describe(): string { return this.color + " circle r=" + this.radius; }
}

// Prepare an original, then stamp out copies
const original = new Circle(10, "red");
const copy = original.clone() as Circle;
copy.color = "blue"; // tweak only what differs

console.log(original.describe()); // red circle r=10
console.log(copy.describe());     // blue circle r=10`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={35} w={145} kind="client" title="Client" methods={["operation()"]} />
        <ClassBox x={240} y={30} w={180} kind="interface" stereotype="«interface»" title="Shape" methods={["clone()"]} />
        <ClassBox x={150} y={195} w={150} kind="concrete" title="Circle" methods={["clone()"]} />
        <ClassBox x={360} y={195} w={150} kind="concrete" title="Square" methods={["clone()"]} />
        <Edge x1={175} y1={55} x2={240} y2={55} kind="depends" label="clones" lx={207} ly={46} />
        <Edge x1={225} y1={195} x2={300} y2={81} kind="implements" label="implements" lx={208} ly={150} />
        <Edge x1={435} y1={195} x2={360} y2={81} kind="implements" />
      </svg>
    ),
  },
  {
    name: "Singleton",
    category: "Creational",
    intent:
      "Ensures a class has only one instance and provides a single global point of access to it.",
    aka: [],
    useWhen: [
      "Exactly one instance of a class must coordinate actions across the system (e.g. a config or connection pool).",
      "You need stricter control over a global than a plain global variable provides.",
      "The single instance should be created lazily, on first use.",
    ],
    explanation:
      "The class hides its constructor and exposes a static accessor that creates the instance on first call and returns the same one thereafter. The single instance is stored in a static field. Because access funnels through one method, the class controls its own lifecycle. Callers everywhere share identical state.",
    analogy:
      "It's like a country's government: no matter which citizen or office you ask, there is one official government in charge. You don't spin up a second one — everyone refers to the same single authority.",
    pros: [
      "Guarantees a single instance with one well-known access point.",
      "Creates the instance lazily, only when first needed.",
      "Centralizes shared state and its initialization logic.",
    ],
    cons: [
      "Acts as hidden global state, which makes unit testing harder.",
      "Can mask poor design and tight coupling between modules.",
      "Needs care to stay safe under concurrent access.",
    ],
    related: ["Abstract Factory", "Facade", "Prototype"],
    code: `class Database {
  // Hold the one and only instance
  private static instance: Database | null = null;
  public data: string[] = [];

  // Hide the constructor so no one can call "new" directly
  private constructor() {}

  // The single global access point
  static getInstance(): Database {
    if (Database.instance === null) {
      Database.instance = new Database(); // created lazily, once
    }
    return Database.instance;
  }
}

const a = Database.getInstance();
const b = Database.getInstance();
a.data.push("row-1");

console.log(a === b);        // true  -> same object
console.log(b.data.length);  // 1     -> shared state`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={50} y={120} w={170} kind="client" title="Client" methods={["useDb()"]} />
        <ClassBox
          x={330}
          y={70}
          w={245}
          kind="concrete"
          title="Database"
          methods={["- static instance: Database", "- constructor()", "+ static getInstance()"]}
        />
        <Edge x1={220} y1={138} x2={330} y2={120} kind="depends" label="getInstance()" lx={278} ly={118} />
        {/* self reference: returns the single instance */}
        <path d="M575,95 C615,95 615,150 560,150" fill="none" stroke="#475569" strokeWidth="1.4" strokeDasharray="4,3" markerEnd="url(#arr)" />
        <text x={618} y={126} textAnchor="middle" fontSize="10" fill="#64748b" stroke="#ffffff" strokeWidth="3" style={{ paintOrder: "stroke" }}>
          returns
        </text>
        <text x={618} y={138} textAnchor="middle" fontSize="10" fill="#64748b" stroke="#ffffff" strokeWidth="3" style={{ paintOrder: "stroke" }}>
          self
        </text>
      </svg>
    ),
  },

  /* ===================== STRUCTURAL ===================== */
  {
    name: "Adapter",
    category: "Structural",
    intent:
      "Converts the interface of a class into another interface clients expect, letting incompatible types work together.",
    aka: ["Wrapper"],
    useWhen: [
      "You want to use an existing class but its interface doesn't match what your code needs.",
      "You must integrate a third-party or legacy class you cannot modify.",
      "You want to reuse several existing subclasses that lack a common interface.",
    ],
    explanation:
      "An adapter implements the interface the client expects and wraps an instance of the incompatible adaptee. Calls made through the target interface are translated into calls the adaptee understands. The client stays completely unaware that any conversion is happening. This lets otherwise incompatible classes collaborate without changing their source code.",
    analogy:
      "It's like a travel power-plug adapter. Your laptop's plug doesn't fit a foreign wall socket, so you slot an adapter between them — it accepts your plug on one side and fits the socket on the other, translating the shape without rewiring either device.",
    pros: [
      "Lets incompatible classes work together without touching their code.",
      "Separates interface-conversion code from business logic.",
      "You can introduce new adapters without breaking existing clients.",
    ],
    cons: [
      "Adds an extra layer of indirection and a new class to maintain.",
      "Sometimes changing the service to match is simpler than adapting it.",
    ],
    related: ["Bridge", "Decorator", "Facade"],
    code: `// The interface the client already speaks
interface JsonLogger { log(message: string): void; }

// A legacy class we cannot change, with an awkward interface
class XmlService {
  writeXml(xml: string) { console.log("<log>" + xml + "</log>"); }
}

// Adapter implements the target and wraps the adaptee
class XmlLoggerAdapter implements JsonLogger {
  constructor(private service: XmlService) {}
  log(message: string): void {
    // translate the call into what the adaptee understands
    this.service.writeXml(message);
  }
}

// Client only ever knows the JsonLogger interface
function run(logger: JsonLogger) { logger.log("hello"); }

run(new XmlLoggerAdapter(new XmlService())); // <log>hello</log>`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={125} w={140} kind="client" title="Client" methods={[]} />
        <ClassBox x={230} y={30} w={180} kind="interface" stereotype="«interface»" title="JsonLogger" methods={["log()"]} />
        <ClassBox x={230} y={195} w={180} kind="concrete" title="XmlLoggerAdapter" methods={["log()"]} />
        <ClassBox x={460} y={195} w={160} kind="concrete" title="XmlService" methods={["writeXml()"]} />
        <Edge x1={170} y1={139} x2={230} y2={60} kind="depends" label="uses" lx={196} ly={92} />
        <Edge x1={320} y1={195} x2={320} y2={81} kind="implements" label="implements" lx={362} ly={140} />
        <Edge x1={410} y1={215} x2={460} y2={215} kind="composition" label="wraps" lx={435} ly={205} />
      </svg>
    ),
  },
  {
    name: "Bridge",
    category: "Structural",
    intent:
      "Decouples an abstraction from its implementation so that the two can vary independently.",
    aka: ["Handle/Body"],
    useWhen: [
      "You want to avoid a combinatorial explosion of subclasses when two dimensions vary (e.g. device × remote).",
      "Both the abstraction and its implementation should be extensible by subclassing independently.",
      "You want to switch implementations at runtime.",
    ],
    explanation:
      "An abstraction holds a reference to an implementor interface and delegates the real work to it. Refined abstractions extend the abstraction side while concrete implementors extend the implementation side, and the two hierarchies grow separately. Client code combines any abstraction with any implementor. This replaces a tangle of multiplied subclasses with two clean hierarchies joined by composition.",
    analogy:
      "Think of a TV remote and the TVs it controls. The remote (abstraction) offers buttons like power and volume; each TV brand (implementation) does the actual work. Any remote can drive any compatible TV, so the two evolve independently rather than needing a custom remote per brand.",
    pros: [
      "Lets abstraction and implementation vary and grow independently.",
      "Replaces a subclass explosion with two smaller hierarchies.",
      "You can swap the implementation at runtime.",
    ],
    cons: [
      "Adds upfront complexity and indirection.",
      "Can be hard to apply to a cohesive class with one obvious dimension.",
    ],
    related: ["Adapter", "Abstract Factory", "Strategy"],
    code: `// Implementation side: the "how"
interface Device { setVolume(percent: number): void; }

class TV implements Device {
  setVolume(p: number) { console.log("TV volume -> " + p); }
}
class Radio implements Device {
  setVolume(p: number) { console.log("Radio volume -> " + p); }
}

// Abstraction side: the "what", delegating to a Device
class Remote {
  constructor(protected device: Device) {}
  volumeUp() { this.device.setVolume(60); }
}
// Refined abstraction adds behaviour, reuses any Device
class AdvancedRemote extends Remote {
  mute() { this.device.setVolume(0); }
}

// Mix and match any abstraction with any implementation
new Remote(new TV()).volumeUp();        // TV volume -> 60
new AdvancedRemote(new Radio()).mute(); // Radio volume -> 0`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={40} w={175} kind="concrete" title="Remote" methods={["volumeUp()"]} />
        <ClassBox x={30} y={200} w={175} kind="concrete" title="AdvancedRemote" methods={["mute()"]} />
        <ClassBox x={370} y={40} w={185} kind="interface" stereotype="«interface»" title="Device" methods={["setVolume()"]} />
        <ClassBox x={300} y={215} w={145} kind="concrete" title="TV" methods={["setVolume()"]} />
        <ClassBox x={470} y={215} w={145} kind="concrete" title="Radio" methods={["setVolume()"]} />
        <Edge x1={205} y1={60} x2={370} y2={60} kind="aggregation" label="bridge" lx={287} ly={52} />
        <Edge x1={117} y1={200} x2={117} y2={81} kind="extends" label="extends" lx={150} ly={150} />
        <Edge x1={372} y1={215} x2={420} y2={91} kind="implements" label="implements" lx={362} ly={170} />
        <Edge x1={542} y1={215} x2={500} y2={91} kind="implements" />
      </svg>
    ),
  },
  {
    name: "Composite",
    category: "Structural",
    intent:
      "Composes objects into tree structures and lets clients treat individual objects and compositions uniformly.",
    aka: ["Object Tree"],
    useWhen: [
      "You need to represent a part-whole hierarchy as a tree (files/folders, UI elements, org charts).",
      "You want client code to treat single objects and groups of objects the same way.",
      "Operations should recurse naturally through the whole structure.",
    ],
    explanation:
      "A common component interface declares operations shared by both leaves and containers. Leaf objects implement the operation directly, while composite objects store children and implement it by delegating to each child and combining the results. Because both share one interface, client code can ignore whether it holds a single leaf or a whole subtree. Recursion through the tree then comes for free.",
    analogy:
      "It's like folders and files on your computer. A folder can contain files and other folders, yet 'calculate total size' works the same whether you ask a single file or a deeply nested folder — the folder just sums up everything inside it.",
    pros: [
      "Lets clients treat individual and composite objects uniformly.",
      "Makes it easy to add new component types via the shared interface.",
      "Recursive tree operations become natural and concise.",
    ],
    cons: [
      "An overly general interface can make some component types awkward.",
      "Type safety suffers when leaves and composites must behave differently.",
    ],
    related: ["Decorator", "Iterator", "Visitor"],
    code: `// Shared interface for both files and folders
interface FsNode { size(): number; }

class File implements FsNode {
  constructor(private bytes: number) {}
  size(): number { return this.bytes; } // leaf: direct answer
}

class Folder implements FsNode {
  private children: FsNode[] = [];
  add(node: FsNode) { this.children.push(node); }
  // composite: delegate to children and combine results
  size(): number {
    return this.children.reduce((sum, c) => sum + c.size(), 0);
  }
}

const root = new Folder();
root.add(new File(100));
const sub = new Folder();
sub.add(new File(40));
root.add(sub);

console.log(root.size()); // 140 -> recurses through the tree`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={40} w={140} kind="client" title="Client" methods={[]} />
        <ClassBox x={235} y={30} w={190} kind="interface" stereotype="«interface»" title="FsNode" methods={["size()"]} />
        <ClassBox x={120} y={205} w={150} kind="concrete" title="File" methods={["size()"]} />
        <ClassBox x={350} y={205} w={175} kind="concrete" title="Folder" methods={["add(c)", "size()"]} />
        <Edge x1={170} y1={54} x2={235} y2={54} kind="depends" label="uses" lx={202} ly={46} />
        <Edge x1={195} y1={205} x2={300} y2={81} kind="implements" label="implements" lx={205} ly={160} />
        <Edge x1={420} y1={205} x2={365} y2={81} kind="implements" />
        <path d="M515,205 C575,170 540,72 423,68" fill="none" stroke="#475569" strokeWidth="1.4" markerStart="url(#dia)" markerEnd="url(#arr)" />
        <text x={560} y={135} textAnchor="middle" fontSize="10" fill="#64748b" stroke="#ffffff" strokeWidth="3" style={{ paintOrder: "stroke" }}>children *</text>
      </svg>
    ),
  },
  {
    name: "Decorator",
    category: "Structural",
    intent:
      "Attaches additional responsibilities to an object dynamically by wrapping it in decorator objects.",
    aka: ["Wrapper"],
    useWhen: [
      "You need to add responsibilities to individual objects at runtime without affecting others.",
      "Subclassing to extend behaviour would cause an explosion of combinations.",
      "You want to add or remove features by stacking wrappers in any order.",
    ],
    explanation:
      "A decorator implements the same interface as the object it wraps and holds a reference to that object. It forwards calls to the wrapped object and layers its own behaviour before or after. Because decorators share the component interface, they can be stacked freely to combine features. The client treats a fully decorated object exactly like an undecorated one.",
    analogy:
      "It's like adding toppings to a plain pizza. The base pizza is fully usable on its own, but you can wrap it with extra cheese, then mushrooms, then olives — each layer adds cost and flavour while the thing in your hands is still 'a pizza' you can order.",
    pros: [
      "Adds or removes responsibilities at runtime, not just at compile time.",
      "Avoids a feature-combination subclass explosion by stacking wrappers.",
      "Each decorator keeps a single, focused responsibility.",
    ],
    cons: [
      "Many small wrapper objects can be hard to debug and configure.",
      "Behaviour can depend on the order decorators are applied.",
    ],
    related: ["Adapter", "Composite", "Strategy"],
    code: `// Component interface
interface Coffee { cost(): number; }

// Concrete component: plain coffee
class Espresso implements Coffee {
  cost(): number { return 2; }
}

// Base decorator wraps another Coffee
abstract class CoffeeDecorator implements Coffee {
  constructor(protected inner: Coffee) {}
  abstract cost(): number;
}

// Concrete decorators add their own cost on top
class Milk extends CoffeeDecorator {
  cost(): number { return this.inner.cost() + 0.5; }
}
class Sugar extends CoffeeDecorator {
  cost(): number { return this.inner.cost() + 0.2; }
}

// Stack wrappers in any order you like
let drink: Coffee = new Espresso();
drink = new Milk(drink);
drink = new Sugar(drink);

console.log(drink.cost()); // 2.7`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={210} y={18} w={185} kind="interface" stereotype="«interface»" title="Coffee" methods={["cost()"]} />
        <ClassBox x={40} y={210} w={150} kind="concrete" title="Espresso" methods={["cost()"]} />
        <ClassBox x={350} y={150} w={210} kind="abstract" italic title="CoffeeDecorator" methods={["cost()"]} />
        <ClassBox x={375} y={255} w={160} kind="concrete" title="Milk" methods={["cost()"]} />
        <Edge x1={115} y1={210} x2={270} y2={69} kind="implements" label="implements" lx={165} ly={155} />
        <Edge x1={430} y1={150} x2={360} y2={69} kind="implements" />
        <Edge x1={455} y1={255} x2={455} y2={191} kind="extends" label="extends" lx={490} ly={225} />
        <path d="M560,158 C622,118 560,52 398,52" fill="none" stroke="#475569" strokeWidth="1.4" markerStart="url(#diao)" markerEnd="url(#arr)" />
        <text x={604} y={96} textAnchor="middle" fontSize="10" fill="#64748b" stroke="#ffffff" strokeWidth="3" style={{ paintOrder: "stroke" }}>wraps</text>
      </svg>
    ),
  },
  {
    name: "Facade",
    category: "Structural",
    intent: "Provides a simplified, unified interface to a complex subsystem of classes.",
    aka: [],
    useWhen: [
      "You want a simple entry point into a large, complex subsystem.",
      "There are many dependencies between clients and a subsystem's implementation classes.",
      "You want to layer your subsystems and reduce coupling between them.",
    ],
    explanation:
      "A facade class offers a few high-level methods that internally orchestrate calls across many subsystem classes. Clients talk to the facade instead of wiring the subsystem together themselves. The subsystem classes stay fully usable directly for advanced needs. This shrinks the surface area clients must learn and loosens their coupling to the internals.",
    analogy:
      "It's like a hotel concierge. Instead of separately phoning housekeeping, the restaurant, and a taxi company, you make one request to the concierge, who coordinates all the back-office departments on your behalf.",
    pros: [
      "Shields clients from a subsystem's complexity behind a small interface.",
      "Reduces coupling between client code and many subsystem classes.",
      "Offers a convenient default path while leaving advanced access open.",
    ],
    cons: [
      "The facade can grow into a 'god object' coupled to everything.",
      "It may hide functionality that clients sometimes genuinely need.",
    ],
    related: ["Adapter", "Mediator", "Singleton"],
    code: `// Complex subsystem made of several independent classes
class VideoFile { constructor(public name: string) {} }
class Codec { read(f: VideoFile) { return "raw:" + f.name; } }
class Compressor { compress(raw: string) { return "mp4:" + raw; } }

// Facade exposes one simple method over the subsystem
class VideoConverter {
  private codec = new Codec();
  private compressor = new Compressor();

  // Orchestrates the whole subsystem behind a single call
  convert(filename: string): string {
    const file = new VideoFile(filename);
    const raw = this.codec.read(file);
    return this.compressor.compress(raw);
  }
}

// Client never touches Codec or Compressor directly
const converter = new VideoConverter();
console.log(converter.convert("clip.avi")); // mp4:raw:clip.avi`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={128} w={140} kind="client" title="Client" methods={[]} />
        <ClassBox x={220} y={120} w={180} kind="concrete" title="VideoConverter" methods={["convert()"]} />
        <ClassBox x={470} y={30} w={150} kind="concrete" title="Codec" methods={["read()"]} />
        <ClassBox x={470} y={128} w={150} kind="concrete" title="Compressor" methods={["compress()"]} />
        <ClassBox x={470} y={226} w={150} kind="concrete" title="VideoFile" methods={[]} />
        <Edge x1={170} y1={142} x2={220} y2={140} kind="depends" label="uses" lx={195} ly={132} />
        <Edge x1={400} y1={132} x2={470} y2={55} kind="depends" label="delegates" lx={447} ly={86} />
        <Edge x1={400} y1={142} x2={470} y2={148} kind="depends" />
        <Edge x1={400} y1={150} x2={470} y2={235} kind="depends" />
      </svg>
    ),
  },
  {
    name: "Flyweight",
    category: "Structural",
    intent:
      "Minimizes memory use by sharing as much state as possible across many fine-grained objects.",
    aka: ["Cache"],
    useWhen: [
      "An application must spawn a huge number of similar objects and memory is tight.",
      "Most of an object's state can be made extrinsic (passed in) rather than stored.",
      "Many objects can be replaced by a few shared ones once extrinsic state is externalized.",
    ],
    explanation:
      "A flyweight stores only intrinsic state — the parts that are shared and unchanging across many objects. Extrinsic state that varies is passed in by the client on each call. A factory caches and reuses flyweights so identical ones are never duplicated. The result is a few shared objects standing in for millions of conceptual ones.",
    analogy:
      "Think of a forest in a video game with millions of trees. Each tree's mesh, texture, and colour are identical, so the engine stores that data once and reuses it for every tree; only each tree's position — the part that varies — is kept per instance.",
    pros: [
      "Drastically cuts memory use when many objects share state.",
      "Centralizes shared state, often improving cache locality.",
      "A factory ensures identical flyweights are reused, never recreated.",
    ],
    cons: [
      "Trades memory for CPU time spent recomputing extrinsic state.",
      "Splitting intrinsic and extrinsic state makes the code more complex.",
    ],
    related: ["Composite", "Singleton", "Factory Method"],
    code: `// Flyweight stores only shared (intrinsic) state
class TreeType {
  constructor(public name: string, public texture: string) {}
  draw(x: number, y: number) { // extrinsic state passed in
    console.log(this.name + " at (" + x + "," + y + ")");
  }
}

// Factory caches and reuses flyweights
class TreeFactory {
  private types: Record<string, TreeType> = {};
  get(name: string, texture: string): TreeType {
    const key = name + texture;
    if (!this.types[key]) this.types[key] = new TreeType(name, texture);
    return this.types[key]; // share the same instance
  }
}

const factory = new TreeFactory();
const a = factory.get("Oak", "oak.png");
const b = factory.get("Oak", "oak.png");
a.draw(10, 20); // Oak at (10,20)

console.log(a === b); // true -> one shared flyweight`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={40} w={120} kind="client" title="Client" methods={[]} />
        <ClassBox x={185} y={118} w={190} kind="concrete" title="TreeFactory" methods={["get(name)"]} />
        <ClassBox x={420} y={25} w={185} kind="interface" stereotype="«interface»" title="Tree" methods={["draw(x, y)"]} />
        <ClassBox x={420} y={195} w={185} kind="concrete" title="TreeType" methods={["draw(x, y)"]} />
        <Edge x1={150} y1={54} x2={200} y2={118} kind="depends" label="requests" lx={163} ly={82} />
        <Edge x1={375} y1={135} x2={420} y2={70} kind="aggregation" label="caches" lx={402} ly={98} />
        <Edge x1={512} y1={195} x2={512} y2={76} kind="implements" label="implements" lx={554} ly={140} />
      </svg>
    ),
  },
  {
    name: "Proxy",
    category: "Structural",
    intent: "Provides a surrogate or placeholder for another object to control access to it.",
    aka: ["Surrogate"],
    useWhen: [
      "You need lazy initialization of a heavyweight object (a virtual proxy).",
      "You need access control or permission checks before reaching the real object.",
      "You want to add logging, caching, or remote access transparently around an object.",
    ],
    explanation:
      "A proxy implements the same interface as the real subject and holds a reference to it. Clients call the proxy as if it were the real object; the proxy decides when and how to forward the call — creating the subject lazily, checking permissions, caching, or logging first. Because both share the interface, the proxy is interchangeable with the real subject. The extra control stays invisible to the client.",
    analogy:
      "A credit card is a proxy for your bank account. It presents the same 'pay for things' interface as cash but stands in front of the account — verifying limits and recording each transaction — without the merchant ever touching your actual balance.",
    pros: [
      "Controls access to the real object transparently to clients.",
      "Enables lazy creation of expensive objects (load on demand).",
      "Lets you add caching, logging, or security without changing the subject.",
    ],
    cons: [
      "Adds another layer that can slow down the response.",
      "Increases the number of classes and the overall complexity.",
    ],
    related: ["Adapter", "Decorator", "Facade"],
    code: `// Shared interface for the real object and its proxy
interface Image { display(): void; }

// Heavyweight real subject, loaded from disk
class RealImage implements Image {
  constructor(private file: string) {
    console.log("Loading " + file); // expensive work
  }
  display() { console.log("Showing " + this.file); }
}

// Virtual proxy delays creation until first use
class ImageProxy implements Image {
  private real: RealImage | null = null;
  constructor(private file: string) {}
  display() {
    if (!this.real) this.real = new RealImage(this.file); // lazy load
    this.real.display();
  }
}

const img: Image = new ImageProxy("photo.jpg"); // nothing loaded yet
img.display(); // Loading photo.jpg  /  Showing photo.jpg
img.display(); // Showing photo.jpg (already loaded)`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={40} w={120} kind="client" title="Client" methods={[]} />
        <ClassBox x={230} y={30} w={185} kind="interface" stereotype="«interface»" title="Image" methods={["display()"]} />
        <ClassBox x={110} y={200} w={185} kind="concrete" title="ImageProxy" methods={["display()"]} />
        <ClassBox x={420} y={200} w={185} kind="concrete" title="RealImage" methods={["display()"]} />
        <Edge x1={150} y1={54} x2={230} y2={55} kind="depends" label="uses" lx={190} ly={46} />
        <Edge x1={240} y1={200} x2={300} y2={81} kind="implements" label="implements" lx={232} ly={155} />
        <Edge x1={480} y1={200} x2={360} y2={81} kind="implements" />
        <Edge x1={295} y1={215} x2={420} y2={215} kind="aggregation" label="controls" lx={357} ly={205} />
      </svg>
    ),
  },

  /* ===================== BEHAVIORAL ===================== */
  {
    name: "Chain of Responsibility",
    category: "Behavioral",
    intent: "Passes a request along a chain of handlers until one of them handles it.",
    aka: ["Chain of Command"],
    useWhen: [
      "More than one object may handle a request and the handler isn't known in advance.",
      "You want to issue a request to one of several objects without coupling sender to receiver.",
      "The set of handlers and their order should be configurable at runtime.",
    ],
    explanation:
      "Each handler holds a reference to the next handler in the chain and decides whether to process a request or pass it along. The sender simply hands the request to the head of the chain. Handlers can be reordered or inserted without touching the sender. A request travels down the chain until some handler deals with it or it falls off the end.",
    analogy:
      "It's like a customer-support escalation. Your question first reaches a front-line agent; if they can't resolve it, they pass it to a specialist, who may escalate to a manager. Each tier either handles your issue or forwards it up the line.",
    pros: [
      "Decouples the sender of a request from its receivers.",
      "Lets you add or reorder handlers without changing client code.",
      "Each handler keeps a single, focused responsibility.",
    ],
    cons: [
      "A request can fall off the end of the chain unhandled.",
      "Debugging is harder when it's unclear which handler responded.",
    ],
    related: ["Command", "Composite", "Decorator"],
    code: `// Base handler keeps a link to the next handler
abstract class Approver {
  protected next: Approver | null = null;
  setNext(a: Approver): Approver { this.next = a; return a; }
  handle(amount: number): void {
    if (this.next) this.next.handle(amount); // pass it along
  }
}

// Concrete handlers decide whether to act or forward
class Manager extends Approver {
  handle(amount: number) {
    if (amount <= 1000) console.log("Manager approved " + amount);
    else super.handle(amount);
  }
}
class Director extends Approver {
  handle(amount: number) {
    if (amount <= 10000) console.log("Director approved " + amount);
    else super.handle(amount);
  }
}

const chain = new Manager();
chain.setNext(new Director());
chain.handle(500);  // Manager approved 500
chain.handle(8000); // Director approved 8000`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={40} w={120} kind="client" title="Client" methods={[]} />
        <ClassBox x={230} y={30} w={200} kind="abstract" italic title="Approver" methods={["setNext(h)", "handle()"]} />
        <ClassBox x={130} y={210} w={160} kind="concrete" title="Manager" methods={["handle()"]} />
        <ClassBox x={360} y={210} w={160} kind="concrete" title="Director" methods={["handle()"]} />
        <Edge x1={150} y1={54} x2={230} y2={58} kind="depends" label="request" lx={190} ly={46} />
        <Edge x1={210} y1={210} x2={290} y2={86} kind="extends" label="extends" lx={215} ly={160} />
        <Edge x1={440} y1={210} x2={380} y2={86} kind="extends" />
        <path d="M430,50 C500,38 498,6 384,24" fill="none" stroke="#475569" strokeWidth="1.4" markerStart="url(#diao)" markerEnd="url(#arr)" />
        <text x={486} y={22} textAnchor="middle" fontSize="10" fill="#64748b" stroke="#ffffff" strokeWidth="3" style={{ paintOrder: "stroke" }}>next</text>
      </svg>
    ),
  },
  {
    name: "Command",
    category: "Behavioral",
    intent:
      "Encapsulates a request as a standalone object, letting you parameterize, queue, log, and undo operations.",
    aka: ["Action", "Transaction"],
    useWhen: [
      "You want to parameterize objects with operations, or queue and schedule requests.",
      "You need to support undo/redo or logging of operations.",
      "You want to decouple the object that invokes an operation from the one that performs it.",
    ],
    explanation:
      "A command object wraps a receiver plus the parameters of a request behind a single execute() method. An invoker triggers the command without knowing what it does, and concrete commands call the appropriate operations on their receiver. Because requests are now objects, they can be stored, queued, logged, or reversed. This fully decouples the invoker from the receiver.",
    analogy:
      "It's like a restaurant order ticket. The waiter writes your order on a slip — a command — which is queued on the rail; the cook later executes whatever the slip says without knowing who ordered it. The slip can be stacked, re-ordered, or voided.",
    pros: [
      "Decouples the invoker from the object that performs the work.",
      "Lets you queue, log, schedule, and undo/redo operations.",
      "New commands can be added without changing existing code.",
    ],
    cons: [
      "Introduces a small command class for every distinct action.",
      "Can be overkill when a simple direct call would do.",
    ],
    related: ["Chain of Responsibility", "Memento", "Strategy"],
    code: `// Command interface: every request becomes an object
interface Command { execute(): void; }

// Receiver knows how to perform the real work
class Light {
  on() { console.log("Light is on"); }
  off() { console.log("Light is off"); }
}

// Concrete command binds a receiver to an action
class TurnOn implements Command {
  constructor(private light: Light) {}
  execute() { this.light.on(); }
}

// Invoker triggers commands without knowing the details
class Remote {
  private queue: Command[] = [];
  submit(cmd: Command) { this.queue.push(cmd); }
  run() { this.queue.forEach((c) => c.execute()); }
}

const remote = new Remote();
remote.submit(new TurnOn(new Light()));
remote.run(); // Light is on`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={120} w={170} kind="concrete" title="Remote" methods={["submit(c)", "run()"]} />
        <ClassBox x={250} y={30} w={180} kind="interface" stereotype="«interface»" title="Command" methods={["execute()"]} />
        <ClassBox x={250} y={200} w={180} kind="concrete" title="TurnOn" methods={["execute()"]} />
        <ClassBox x={460} y={200} w={160} kind="concrete" title="Light" methods={["on()", "off()"]} />
        <Edge x1={200} y1={140} x2={250} y2={70} kind="aggregation" label="holds" lx={222} ly={98} />
        <Edge x1={340} y1={200} x2={340} y2={81} kind="implements" label="implements" lx={382} ly={150} />
        <Edge x1={430} y1={220} x2={460} y2={222} kind="association" label="calls" lx={445} ly={212} />
      </svg>
    ),
  },
  {
    name: "Interpreter",
    category: "Behavioral",
    intent:
      "Defines a representation for a language's grammar along with an interpreter that evaluates sentences in it.",
    aka: [],
    useWhen: [
      "You have a simple, well-defined language or notation to evaluate (math, rules, queries).",
      "The grammar is small and stable enough to map each rule to a class.",
      "Clarity of the grammar matters more than raw execution speed.",
    ],
    explanation:
      "Each grammar rule is represented by a class with an interpret() method that operates on a shared context. Terminal expressions handle atomic symbols, while non-terminal expressions combine their sub-expressions. A sentence is parsed into a tree of these expression objects, and interpreting the root recursively interprets the whole. Adding a new rule means adding a new expression class.",
    analogy:
      "It's like reading sheet music. Each symbol — a note, a rest, a sharp — has a fixed meaning, and the musician interprets them one after another, combining individual symbols into the full piece exactly as written.",
    pros: [
      "Each grammar rule maps cleanly to its own class.",
      "Easy to extend the language by adding new expression classes.",
      "The grammar's structure is made explicit in the code.",
    ],
    cons: [
      "Grows unwieldy for languages with many grammar rules.",
      "Usually slower and clunkier than a real parser or compiler.",
    ],
    related: ["Composite", "Iterator", "Visitor"],
    code: `// Shared context for interpreting an expression tree
type Context = Record<string, number>;

interface Expression { interpret(ctx: Context): number; }

// Terminal expression: a variable lookup
class Variable implements Expression {
  constructor(private name: string) {}
  interpret(ctx: Context): number { return ctx[this.name]; }
}

// Non-terminal expression: combines sub-expressions
class Add implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(ctx: Context): number {
    return this.left.interpret(ctx) + this.right.interpret(ctx);
  }
}

// "x + y" becomes a tree of expression objects
const expr = new Add(new Variable("x"), new Variable("y"));
console.log(expr.interpret({ x: 3, y: 5 })); // 8`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={40} w={120} kind="client" title="Client" methods={[]} />
        <ClassBox x={30} y={150} w={120} kind="concrete" title="Context" methods={[]} />
        <ClassBox x={250} y={30} w={200} kind="interface" stereotype="«interface»" title="Expression" methods={["interpret(ctx)"]} />
        <ClassBox x={140} y={205} w={160} kind="concrete" title="Variable" methods={["interpret()"]} />
        <ClassBox x={370} y={205} w={160} kind="concrete" title="Add" methods={["interpret()"]} />
        <Edge x1={150} y1={54} x2={250} y2={55} kind="depends" label="evaluates" lx={203} ly={46} />
        <Edge x1={250} y1={72} x2={152} y2={158} kind="depends" label="reads" lx={188} ly={108} />
        <Edge x1={220} y1={205} x2={310} y2={81} kind="implements" label="implements" lx={222} ly={160} />
        <Edge x1={450} y1={205} x2={380} y2={81} kind="implements" />
        <path d="M530,215 C595,180 560,72 452,68" fill="none" stroke="#475569" strokeWidth="1.4" markerStart="url(#diao)" markerEnd="url(#arr)" />
        <text x={576} y={135} textAnchor="middle" fontSize="10" fill="#64748b" stroke="#ffffff" strokeWidth="3" style={{ paintOrder: "stroke" }}>operands</text>
      </svg>
    ),
  },
  {
    name: "Iterator",
    category: "Behavioral",
    intent:
      "Provides a way to access the elements of a collection sequentially without exposing its underlying representation.",
    aka: ["Cursor"],
    useWhen: [
      "You want to traverse a collection without exposing its internal structure.",
      "You need multiple or simultaneous traversals over the same collection.",
      "You want a uniform traversal interface across different collection types.",
    ],
    explanation:
      "An iterator object encapsulates the position and logic for stepping through a collection, exposing methods like hasNext() and next(). The collection provides a factory method to create a fresh iterator. Clients traverse purely through the iterator interface, unaware of whether the data is an array, tree, or linked list. Multiple iterators can walk the same collection independently.",
    analogy:
      "It's like a music playlist's next and previous buttons. You step through the songs one at a time without caring whether they're stored in an array, a shuffled queue, or a linked list — the controls give you sequential access regardless.",
    pros: [
      "Lets you traverse a collection without exposing its internals.",
      "Supports several independent traversals at the same time.",
      "Gives a uniform interface across different collection types.",
    ],
    cons: [
      "Overkill for simple collections you could just loop over directly.",
      "An extra object per traversal adds a little overhead.",
    ],
    related: ["Composite", "Factory Method", "Visitor"],
    code: `// Iterator interface: sequential access
interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
}

// Aggregate exposes a factory for its iterator
class NameList {
  private names: string[] = [];
  add(name: string) { this.names.push(name); }
  createIterator(): Iterator<string> {
    let index = 0;
    const names = this.names;
    return {
      hasNext: () => index < names.length,
      next: () => names[index++],
    };
  }
}

const list = new NameList();
list.add("Ann");
list.add("Bob");
const it = list.createIterator();
while (it.hasNext()) console.log(it.next()); // Ann, Bob`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={40} y={30} w={190} kind="interface" stereotype="«interface»" title="Collection" methods={["createIterator()"]} />
        <ClassBox x={40} y={205} w={190} kind="concrete" title="NameList" methods={["createIterator()"]} />
        <ClassBox x={400} y={30} w={200} kind="interface" stereotype="«interface»" title="Iterator" methods={["hasNext()", "next()"]} />
        <ClassBox x={400} y={205} w={200} kind="concrete" title="ListIterator" methods={["hasNext()", "next()"]} />
        <Edge x1={135} y1={205} x2={135} y2={81} kind="implements" label="implements" lx={172} ly={150} />
        <Edge x1={500} y1={205} x2={500} y2={86} kind="implements" label="implements" lx={538} ly={150} />
        <Edge x1={230} y1={55} x2={400} y2={58} kind="depends" label="returns" lx={315} ly={47} />
        <Edge x1={230} y1={222} x2={400} y2={224} kind="depends" label="creates" lx={315} ly={214} />
      </svg>
    ),
  },
  {
    name: "Mediator",
    category: "Behavioral",
    intent:
      "Encapsulates how a set of objects interact, keeping them from referring to each other directly to promote loose coupling.",
    aka: ["Intermediary"],
    useWhen: [
      "A set of objects communicate in complex, tangled ways that are hard to follow.",
      "Reusing a component is hard because it depends on many others.",
      "You want to centralize control logic that's currently spread across several classes.",
    ],
    explanation:
      "A mediator object becomes the single hub through which components communicate. Instead of referencing each other, components notify the mediator of events, and the mediator coordinates the appropriate responses. This turns a many-to-many web of dependencies into a star around the mediator. Components become reusable because they only know the mediator interface.",
    analogy:
      "It's like an air-traffic-control tower. Pilots don't negotiate runway use with each other directly; they all talk to the tower, which coordinates every takeoff and landing. The tower is the mediator that keeps the planes decoupled.",
    pros: [
      "Reduces a tangle of many-to-many dependencies to a hub and spokes.",
      "Centralizes interaction logic in a single place.",
      "Makes the individual components easier to reuse.",
    ],
    cons: [
      "The mediator can grow into a complex 'god object'.",
      "Centralizing too much logic can turn it into a bottleneck.",
    ],
    related: ["Facade", "Observer", "Command"],
    code: `// Mediator coordinates communication between components
interface Mediator { notify(sender: string, event: string): void; }

// Components talk to the mediator, never to each other
class Button {
  constructor(private mediator: Mediator) {}
  click() { this.mediator.notify("button", "click"); }
}
class TextBox {
  enabled = false;
  enable() { this.enabled = true; console.log("TextBox enabled"); }
}

// Concrete mediator wires the components together
class Dialog implements Mediator {
  constructor(private box: TextBox) {}
  notify(sender: string, event: string) {
    if (sender === "button" && event === "click") this.box.enable();
  }
}

const box = new TextBox();
const dialog = new Dialog(box);
new Button(dialog).click(); // TextBox enabled`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={235} y={25} w={190} kind="interface" stereotype="«interface»" title="Mediator" methods={["notify()"]} />
        <ClassBox x={235} y={210} w={190} kind="concrete" title="Dialog" methods={["notify()"]} />
        <ClassBox x={30} y={120} w={150} kind="concrete" title="Button" methods={["click()"]} />
        <ClassBox x={470} y={120} w={150} kind="concrete" title="TextBox" methods={["enable()"]} />
        <Edge x1={180} y1={135} x2={235} y2={60} kind="association" label="notifies" lx={198} ly={92} />
        <Edge x1={470} y1={135} x2={425} y2={60} kind="association" label="notifies" lx={455} ly={92} />
        <Edge x1={330} y1={210} x2={330} y2={76} kind="implements" label="implements" lx={368} ly={145} />
      </svg>
    ),
  },
  {
    name: "Memento",
    category: "Behavioral",
    intent:
      "Captures and externalizes an object's internal state so it can be restored later, without violating encapsulation.",
    aka: ["Snapshot", "Token"],
    useWhen: [
      "You need to capture snapshots of an object's state to support undo or rollback.",
      "Direct access to the object's fields would break its encapsulation.",
      "You want to save and restore state without exposing implementation details.",
    ],
    explanation:
      "The originator creates a memento capturing its current state and can restore itself from one later. The memento stores the state but keeps it opaque to everyone except the originator. A caretaker holds mementos — for example an undo history — without ever inspecting their contents. This enables snapshots and rollback while preserving encapsulation.",
    analogy:
      "It's like a save point in a video game. The game writes your current progress to a save slot; later you can reload that slot to return to exactly where you were, without ever needing to know how the save file is structured internally.",
    pros: [
      "Captures and restores state without breaking encapsulation.",
      "Simplifies the originator by offloading state history to a caretaker.",
      "Provides a clean foundation for undo and redo.",
    ],
    cons: [
      "Storing many mementos can consume a lot of memory.",
      "Caretakers must manage the lifecycle of the stored mementos.",
    ],
    related: ["Command", "Prototype", "State"],
    code: `// Memento stores a snapshot, opaque to outsiders
class Memento {
  constructor(public readonly state: string) {}
}

// Originator creates and restores from mementos
class Editor {
  private content = "";
  type(text: string) { this.content += text; }
  save(): Memento { return new Memento(this.content); }
  restore(m: Memento) { this.content = m.state; }
  toString() { return this.content; }
}

// Caretaker keeps a history but never reads the state
class History {
  private stack: Memento[] = [];
  push(m: Memento) { this.stack.push(m); }
  pop(): Memento { return this.stack.pop()!; }
}

const editor = new Editor();
const history = new History();
editor.type("hello");
history.push(editor.save()); // checkpoint
editor.type(" world");
editor.restore(history.pop());
console.log(editor.toString()); // hello`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={120} w={185} kind="concrete" title="Editor" methods={["save()", "restore(m)"]} />
        <ClassBox x={265} y={120} w={170} kind="concrete" title="Memento" methods={["getState()"]} />
        <ClassBox x={470} y={120} w={150} kind="concrete" title="History" methods={["push(m)", "pop()"]} />
        <text x={122} y={95} textAnchor="middle" fontSize="10" fontStyle="italic" fill="#64748b">originator</text>
        <text x={545} y={95} textAnchor="middle" fontSize="10" fontStyle="italic" fill="#64748b">caretaker</text>
        <Edge x1={215} y1={140} x2={265} y2={138} kind="depends" label="creates" lx={240} ly={130} />
        <Edge x1={470} y1={140} x2={435} y2={140} kind="aggregation" label="stores" lx={452} ly={130} />
      </svg>
    ),
  },
  {
    name: "Observer",
    category: "Behavioral",
    intent:
      "Defines a one-to-many dependency so that when one object changes state, all its dependents are notified automatically.",
    aka: ["Publish-Subscribe", "Dependents"],
    useWhen: [
      "A change to one object requires changing others, and you don't know how many.",
      "An object should notify other objects without assuming who they are.",
      "You want loose coupling between a subject and its dependents.",
    ],
    explanation:
      "A subject maintains a list of observer objects and notifies them whenever its state changes by calling a common update() method. Observers register and unregister themselves at runtime. The subject knows only the observer interface, not concrete observer classes. This lets the set of listeners grow and shrink freely without changing the subject.",
    analogy:
      "It's like subscribing to a magazine. Once you're on the subscriber list, every new issue is delivered to you automatically; the publisher doesn't need to know who you are personally, and you can cancel anytime to stop receiving them.",
    pros: [
      "Loosely couples the subject from its observers.",
      "You can add or remove observers at runtime.",
      "Supports broadcast communication to many listeners at once.",
    ],
    cons: [
      "Observers are notified in an unpredictable order.",
      "Careless subscriptions can cause memory leaks or update storms.",
    ],
    related: ["Mediator", "Command", "Chain of Responsibility"],
    code: `// Observer interface: receives updates
interface Observer { update(temp: number): void; }

// Subject keeps a list of observers and notifies them
class WeatherStation {
  private observers: Observer[] = [];
  subscribe(o: Observer) { this.observers.push(o); }
  setTemperature(t: number) {
    this.observers.forEach((o) => o.update(t)); // broadcast
  }
}

// Concrete observers react to the notification
class PhoneDisplay implements Observer {
  update(temp: number) { console.log("Phone shows " + temp); }
}
class WindowDisplay implements Observer {
  update(temp: number) { console.log("Window shows " + temp); }
}

const station = new WeatherStation();
station.subscribe(new PhoneDisplay());
station.subscribe(new WindowDisplay());
station.setTemperature(22); // Phone shows 22 / Window shows 22`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={120} w={205} kind="concrete" title="WeatherStation" methods={["subscribe(o)", "notify()"]} />
        <ClassBox x={330} y={30} w={195} kind="interface" stereotype="«interface»" title="Observer" methods={["update()"]} />
        <ClassBox x={300} y={215} w={165} kind="concrete" title="PhoneDisplay" methods={["update()"]} />
        <ClassBox x={480} y={215} w={150} kind="concrete" title="WindowDisplay" methods={["update()"]} />
        <Edge x1={235} y1={140} x2={330} y2={60} kind="aggregation" label="observers *" lx={278} ly={92} />
        <Edge x1={382} y1={215} x2={410} y2={81} kind="implements" label="implements" lx={372} ly={165} />
        <Edge x1={555} y1={215} x2={470} y2={81} kind="implements" />
      </svg>
    ),
  },
  {
    name: "State",
    category: "Behavioral",
    intent:
      "Lets an object alter its behaviour when its internal state changes, so it appears to change its class.",
    aka: ["Objects for States"],
    useWhen: [
      "An object's behaviour depends on its state and must change at runtime.",
      "Operations have large multipart conditionals that depend on the object's state.",
      "State transitions should be explicit and localized rather than scattered.",
    ],
    explanation:
      "The context delegates state-specific behaviour to a current state object that implements a common state interface. Each concrete state implements the behaviour for one state and decides which state to transition to next. Switching the context's state object changes its behaviour without conditionals. This replaces sprawling if/switch logic with a set of focused state classes.",
    analogy:
      "It's like a traffic light. In the 'red' state it tells cars to stop and then switches to green; in 'green' it lets them go and switches to yellow. The same light behaves completely differently depending on which state it is currently in.",
    pros: [
      "Localizes state-specific behaviour in dedicated classes.",
      "Makes state transitions explicit and easy to follow.",
      "Removes large conditional statements from the context.",
    ],
    cons: [
      "Adds a class per state, which can be excessive for just a few states.",
      "State objects often need references to each other to transition.",
    ],
    related: ["Strategy", "Memento", "Singleton"],
    code: `// State interface: behaviour for one mode
interface State { handle(light: TrafficLight): void; }

// Context delegates to its current state
class TrafficLight {
  constructor(public state: State) {}
  change() { this.state.handle(this); } // behaviour varies by state
}

// Each concrete state acts and picks the next state
class Red implements State {
  handle(light: TrafficLight) {
    console.log("Stop");
    light.state = new Green();
  }
}
class Green implements State {
  handle(light: TrafficLight) {
    console.log("Go");
    light.state = new Red();
  }
}

const light = new TrafficLight(new Red());
light.change(); // Stop  (now Green)
light.change(); // Go    (now Red)`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={120} w={190} kind="concrete" title="TrafficLight" methods={["change()"]} />
        <ClassBox x={330} y={30} w={185} kind="interface" stereotype="«interface»" title="State" methods={["handle(ctx)"]} />
        <ClassBox x={300} y={215} w={150} kind="concrete" title="Red" methods={["handle()"]} />
        <ClassBox x={470} y={215} w={150} kind="concrete" title="Green" methods={["handle()"]} />
        <Edge x1={220} y1={140} x2={330} y2={60} kind="aggregation" label="state" lx={270} ly={92} />
        <Edge x1={375} y1={215} x2={405} y2={81} kind="implements" label="implements" lx={365} ly={165} />
        <Edge x1={545} y1={215} x2={465} y2={81} kind="implements" />
      </svg>
    ),
  },
  {
    name: "Strategy",
    category: "Behavioral",
    intent:
      "Defines a family of interchangeable algorithms and lets the algorithm vary independently from the clients that use it.",
    aka: ["Policy"],
    useWhen: [
      "You have several variants of an algorithm and want to switch between them.",
      "You want to avoid exposing complex, algorithm-specific data structures.",
      "A class has many behaviours selected by conditionals that you want to remove.",
    ],
    explanation:
      "A strategy interface declares a method that every concrete algorithm implements. The context holds a reference to a strategy and delegates the work to it, without knowing the concrete algorithm. Swapping the strategy object changes the behaviour at runtime. This isolates each algorithm and removes branching from the context.",
    analogy:
      "It's like choosing a payment method at checkout. The store's checkout flow stays the same, but you can pay by credit card, PayPal, or crypto — each is an interchangeable strategy that produces the same outcome of completing the purchase.",
    pros: [
      "Swaps algorithms at runtime through a common interface.",
      "Isolates each algorithm's code and data from the others.",
      "Replaces conditional logic with interchangeable objects.",
    ],
    cons: [
      "Clients must understand the differences to choose a strategy.",
      "Adds objects and indirection for what may be simple variations.",
    ],
    related: ["State", "Bridge", "Template Method"],
    code: `// Strategy interface: one interchangeable algorithm
interface PayStrategy { pay(amount: number): void; }

class CreditCard implements PayStrategy {
  pay(a: number) { console.log("Paid " + a + " by credit card"); }
}
class PayPal implements PayStrategy {
  pay(a: number) { console.log("Paid " + a + " via PayPal"); }
}

// Context delegates the work to whatever strategy it holds
class Checkout {
  constructor(private strategy: PayStrategy) {}
  setStrategy(s: PayStrategy) { this.strategy = s; }
  confirm(amount: number) { this.strategy.pay(amount); }
}

const checkout = new Checkout(new CreditCard());
checkout.confirm(50);               // Paid 50 by credit card
checkout.setStrategy(new PayPal());
checkout.confirm(20);               // Paid 20 via PayPal`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={120} w={185} kind="concrete" title="Checkout" methods={["confirm()"]} />
        <ClassBox x={330} y={30} w={195} kind="interface" stereotype="«interface»" title="PayStrategy" methods={["pay()"]} />
        <ClassBox x={295} y={215} w={165} kind="concrete" title="CreditCard" methods={["pay()"]} />
        <ClassBox x={480} y={215} w={150} kind="concrete" title="PayPal" methods={["pay()"]} />
        <Edge x1={215} y1={140} x2={330} y2={60} kind="aggregation" label="strategy" lx={268} ly={92} />
        <Edge x1={377} y1={215} x2={407} y2={81} kind="implements" label="implements" lx={367} ly={165} />
        <Edge x1={555} y1={215} x2={470} y2={81} kind="implements" />
      </svg>
    ),
  },
  {
    name: "Template Method",
    category: "Behavioral",
    intent:
      "Defines the skeleton of an algorithm in a base class and lets subclasses override specific steps without changing its structure.",
    aka: [],
    useWhen: [
      "Several classes share an algorithm that differs only in certain steps.",
      "You want to localize common behaviour and let subclasses fill in the variations.",
      "You want to control which parts of an algorithm subclasses may extend.",
    ],
    explanation:
      "An abstract base class defines a template method that lays out the algorithm as a fixed sequence of steps. Some steps are implemented in the base class, while the variable ones are abstract for subclasses to fill in. The template method itself is not overridden, so the overall structure stays constant. Subclasses customize behaviour only at the designated points.",
    analogy:
      "It's like a recipe for a hot beverage. Boil the water, brew the main ingredient, pour into a cup, add condiments — the steps are fixed, but 'brew' means steeping tea for one drink and dripping coffee for another.",
    pros: [
      "Removes duplication by hoisting shared steps into the base class.",
      "Lets subclasses customize only the parts that genuinely vary.",
      "Keeps the overall algorithm structure fixed and consistent.",
    ],
    cons: [
      "The fixed skeleton can feel restrictive for unusual cases.",
      "Changes to the base algorithm can ripple into every subclass.",
    ],
    related: ["Factory Method", "Strategy", "Bridge"],
    code: `// Base class defines the fixed algorithm skeleton
abstract class Beverage {
  // Template method: the steps never change order
  prepare(): void {
    this.boilWater();
    this.brew();       // step varies by subclass
    this.pourInCup();
  }
  private boilWater() { console.log("Boiling water"); }
  private pourInCup() { console.log("Pouring into cup"); }
  protected abstract brew(): void; // subclasses fill this in
}

class Tea extends Beverage {
  protected brew() { console.log("Steeping the tea"); }
}
class Coffee extends Beverage {
  protected brew() { console.log("Dripping the coffee"); }
}

new Tea().prepare();    // Boiling water / Steeping tea / Pouring
new Coffee().prepare(); // Boiling water / Dripping coffee / Pouring`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={215} y={30} w={215} kind="abstract" italic title="Beverage" methods={["prepare()", "brew() : abstract"]} />
        <ClassBox x={110} y={215} w={160} kind="concrete" title="Tea" methods={["brew()"]} />
        <ClassBox x={370} y={215} w={160} kind="concrete" title="Coffee" methods={["brew()"]} />
        <text x={322} y={120} textAnchor="middle" fontSize="10" fontStyle="italic" fill="#64748b">prepare() calls brew()</text>
        <Edge x1={190} y1={215} x2={290} y2={86} kind="extends" label="extends" lx={205} ly={165} />
        <Edge x1={450} y1={215} x2={370} y2={86} kind="extends" />
      </svg>
    ),
  },
  {
    name: "Visitor",
    category: "Behavioral",
    intent:
      "Lets you define new operations on a set of objects without changing the classes of those objects.",
    aka: [],
    useWhen: [
      "You need to perform many unrelated operations across an object structure.",
      "The object classes are stable but the operations on them change often.",
      "You want to keep related operations together rather than spread across classes.",
    ],
    explanation:
      "Each element exposes an accept(visitor) method that calls back the visitor method matching its type — a technique called double dispatch. A visitor groups one operation's logic for every element type in a single class. New operations are added by writing a new visitor, without touching the element classes. The trade-off is that adding a new element type forces updating every visitor.",
    analogy:
      "It's like an auditor visiting a company's departments. The departments stay the same, but the auditor performs department-specific checks at each stop; send a different auditor — say for safety instead of finance — and you get an entirely new operation over the same departments.",
    pros: [
      "Adds new operations without modifying the element classes.",
      "Groups related behaviour for all element types in one visitor.",
      "Can accumulate state across the elements it visits.",
    ],
    cons: [
      "Adding a new element type forces a change to every visitor.",
      "Visitors may need access to elements' internals, weakening encapsulation.",
    ],
    related: ["Composite", "Iterator", "Interpreter"],
    code: `// Visitor declares a visit method per element type
interface Visitor {
  visitBook(b: Book): void;
  visitFood(f: Food): void;
}

// Elements accept a visitor and dispatch to the right method
interface Item { accept(v: Visitor): void; }

class Book implements Item {
  price = 20;
  accept(v: Visitor) { v.visitBook(this); } // double dispatch
}
class Food implements Item {
  price = 8;
  accept(v: Visitor) { v.visitFood(this); }
}

// A new operation = a new visitor; elements stay untouched
class TaxVisitor implements Visitor {
  visitBook(b: Book) { console.log("Book tax: " + b.price * 0); }
  visitFood(f: Food) { console.log("Food tax: " + f.price * 0.1); }
}

const items: Item[] = [new Book(), new Food()];
const tax = new TaxVisitor();
items.forEach((i) => i.accept(tax)); // Book tax: 0 / Food tax: 0.8`,
    svg: (
      <svg {...SVG_PROPS}>
        <Defs />
        <ClassBox x={30} y={30} w={200} kind="interface" stereotype="«interface»" title="Visitor" methods={["visitBook()", "visitFood()"]} />
        <ClassBox x={30} y={210} w={200} kind="concrete" title="TaxVisitor" methods={["visitBook()", "visitFood()"]} />
        <ClassBox x={405} y={30} w={195} kind="interface" stereotype="«interface»" title="Item" methods={["accept(v)"]} />
        <ClassBox x={350} y={215} w={140} kind="concrete" title="Book" methods={["accept()"]} />
        <ClassBox x={500} y={215} w={120} kind="concrete" title="Food" methods={["accept()"]} />
        <Edge x1={130} y1={210} x2={130} y2={86} kind="implements" label="implements" lx={165} ly={150} />
        <Edge x1={420} y1={215} x2={470} y2={81} kind="implements" label="implements" lx={415} ly={168} />
        <Edge x1={560} y1={215} x2={520} y2={81} kind="implements" />
        <Edge x1={405} y1={55} x2={230} y2={58} kind="depends" label="accepts" lx={317} ly={47} />
      </svg>
    ),
  },
];

/* ---------- small label used above each content section ---------- */
function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#94a3b8",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function DesignPatternsEncyclopedia() {
  const [selected, setSelected] = useState("Abstract Factory");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({
    Creational: true,
    Structural: true,
    Behavioral: true,
  });
  const mainRef = useRef(null);

  // smooth scroll back to top whenever the pattern changes
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [selected]);

  const FONT =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const MONO =
    "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace";

  const byName = {};
  PATTERNS.forEach((p) => {
    byName[p.name] = p;
  });
  const current = byName[selected] || PATTERNS[0];
  const cat = CAT[current.category];

  const q = query.trim().toLowerCase();
  const matches = (p) => p.name.toLowerCase().includes(q);
  const counts = {};
  CATEGORY_ORDER.forEach((c) => {
    counts[c] = PATTERNS.filter((p) => p.category === c).length;
  });

  const select = (name) => setSelected(name);
  const navigate = (name) => {
    setSelected(name);
    setQuery("");
  };
  const toggle = (c) => setExpanded((e) => ({ ...e, [c]: !e[c] }));

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        fontFamily: FONT,
        fontSize: 15,
        color: "#1e293b",
        background: "#ffffff",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        .dpe-row:hover { background: #f1f5f9; }
        .dpe-pill:hover { filter: brightness(0.96); }
        .dpe-mainscroll::-webkit-scrollbar, .dpe-side::-webkit-scrollbar { width: 10px; }
        .dpe-mainscroll::-webkit-scrollbar-thumb, .dpe-side::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 6px; }
        .dpe-mainscroll::-webkit-scrollbar-thumb:hover, .dpe-side::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @media (max-width: 760px) { .dpe-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ===================== SIDEBAR ===================== */}
      <aside
        className="dpe-side"
        style={{
          width: 260,
          flexShrink: 0,
          borderRight: "1px solid #e2e8f0",
          overflowY: "auto",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "#ffffff",
            padding: "16px 14px 12px",
            borderBottom: "1px solid #eef2f6",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 10, letterSpacing: "0.01em" }}>
            Design Patterns
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patterns…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 11px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 13,
              color: "#1e293b",
              outline: "none",
              fontFamily: FONT,
              background: "#f8fafc",
            }}
          />
        </div>

        <div style={{ padding: "8px 0 24px" }}>
          {CATEGORY_ORDER.map((c) => {
            const items = PATTERNS.filter((p) => p.category === c && matches(p));
            if (q && items.length === 0) return null;
            const open = q ? true : expanded[c];
            const cc = CAT[c];
            return (
              <div key={c} style={{ marginBottom: 4 }}>
                <button
                  onClick={() => toggle(c)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: FONT,
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 10, color: cc.strong, width: 10, flexShrink: 0 }}>
                    {open ? "▾" : "▸"}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: cc.ink, flex: 1 }}>
                    {c}
                  </span>
                  <span
                    style={{
                      background: cc.tint,
                      color: cc.ink,
                      borderRadius: 999,
                      padding: "1px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {counts[c]}
                  </span>
                </button>

                {open &&
                  items.map((p) => {
                    const active = p.name === selected;
                    return (
                      <div
                        key={p.name}
                        data-concept-id={p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                        className={active ? undefined : "dpe-row"}
                        onClick={() => select(p.name)}
                        style={{
                          cursor: "pointer",
                          fontSize: 13,
                          padding: "7px 16px 7px 31px",
                          borderLeft: active ? `3px solid ${cc.strong}` : "3px solid transparent",
                          background: active ? cc.soft : "transparent",
                          color: active ? cc.ink : "#475569",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {p.name}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ===================== MAIN ===================== */}
      <main ref={mainRef} className="dpe-mainscroll" style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "34px 44px 90px" }}>
          {/* (1) title + category pill + intent */}
          <span
            style={{
              display: "inline-block",
              background: cat.tint,
              color: cat.ink,
              borderRadius: 999,
              padding: "4px 13px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {current.category}
          </span>
          <h1 style={{ fontSize: 31, fontWeight: 800, color: "#0f172a", margin: "12px 0 10px", lineHeight: 1.15 }}>
            {current.name}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "#475569", margin: 0, maxWidth: 740 }}>
            {current.intent}
          </p>

          {/* (2) also known as */}
          {current.aka.length > 0 && (
            <div style={{ marginTop: 14, fontSize: 14, color: "#64748b" }}>
              <span style={{ fontWeight: 600, color: "#475569" }}>Also known as: </span>
              {current.aka.join("  ·  ")}
            </div>
          )}

          {/* (3) two-column: explanation+analogy | pros/cons */}
          <div className="dpe-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 26 }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, background: "#ffffff" }}>
              <SectionLabel>In plain English</SectionLabel>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#334155" }}>{current.explanation}</p>
              <div
                style={{
                  marginTop: 16,
                  borderLeft: `3px solid ${cat.strong}`,
                  background: cat.soft,
                  borderRadius: 8,
                  padding: "12px 15px",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: cat.ink, marginBottom: 5 }}>
                  Analogy
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.55, color: "#334155", fontStyle: "italic" }}>
                  {current.analogy}
                </div>
              </div>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, background: "#ffffff" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <span style={{ fontSize: 15 }}>✓</span> Pros
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {current.pros.map((p, i) => (
                  <li key={i} style={{ display: "flex", gap: 9, marginBottom: 9, fontSize: 14, lineHeight: 1.45, color: "#334155" }}>
                    <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", display: "flex", alignItems: "center", gap: 7, margin: "18px 0 12px" }}>
                <span style={{ fontSize: 15 }}>✗</span> Cons
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {current.cons.map((c, i) => (
                  <li key={i} style={{ display: "flex", gap: 9, marginBottom: 9, fontSize: 14, lineHeight: 1.45, color: "#334155" }}>
                    <span style={{ color: "#dc2626", fontWeight: 700, flexShrink: 0 }}>✗</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* (4) UML diagram */}
          <div style={{ marginTop: 24 }}>
            <SectionLabel>Structure</SectionLabel>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: "22px 22px 10px", background: "#fcfdfe" }}>
              <div style={{ maxWidth: 640, margin: "0 auto" }}>{current.svg}</div>
            </div>
          </div>

          {/* (5) use when */}
          <div style={{ marginTop: 26 }}>
            <SectionLabel>Use when</SectionLabel>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {current.useWhen.map((u, i) => (
                <li key={i} style={{ display: "flex", gap: 11, marginBottom: 9, fontSize: 15, lineHeight: 1.5, color: "#334155" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: cat.strong, flexShrink: 0, marginTop: 8 }} />
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* (6) code block with copy button */}
          <div style={{ marginTop: 26 }}>
            <SectionLabel>Example</SectionLabel>
            <div style={{ position: "relative", background: "#1e1e1e", borderRadius: 14, overflow: "hidden", border: "1px solid #2d2d2d" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 15px", borderBottom: "1px solid #2d2d2d" }}>
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f56", display: "inline-block" }} />
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#27c93f", display: "inline-block" }} />
                <span style={{ marginLeft: 8, fontSize: 12, color: "#858585", fontFamily: FONT }}>TypeScript</span>
              </div>
              <CopyButton text={current.code} />
              <div
                style={{
                  padding: "15px 18px 17px",
                  overflowX: "auto",
                  fontFamily: MONO,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "#d4d4d4",
                }}
              >
                {highlight(current.code)}
              </div>
            </div>
          </div>

          {/* (7) related patterns */}
          <div style={{ marginTop: 28 }}>
            <SectionLabel>Related patterns</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {current.related.map((name) => {
                const rp = byName[name];
                const rc = rp ? CAT[rp.category] : null;
                return (
                  <button
                    key={name}
                    className="dpe-pill"
                    onClick={() => rp && navigate(name)}
                    style={{
                      cursor: rp ? "pointer" : "default",
                      border: `1px solid ${rc ? rc.tint : "#e2e8f0"}`,
                      background: rc ? rc.soft : "#f8fafc",
                      color: rc ? rc.ink : "#334155",
                      borderRadius: 999,
                      padding: "6px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: FONT,
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
