"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";
import aboutData      from "../config/about.yaml";
import skillsData     from "../config/skills.yaml";
import meData         from "../config/me.yaml";
import contactData    from "../config/contact.yaml";

// ── typed data ─────────────────────────────────────────────

const { paragraphs, facts, interests } = aboutData as {
  paragraphs: string[];
  facts: { label: string; value: string }[];
  interests: string[];
};

const { skills } = skillsData as {
  skills: { label: string; category: string }[];
};

const { firstName, lastName, roles: rolesRaw } = meData as {
  firstName: string;
  lastName: string;
  roles: { label: string }[];
};

const { links: contactLinks } = contactData as {
  links: { label: string; value: string }[];
};

// ── derived ────────────────────────────────────────────────

const skillsByCategory = skills.reduce<Record<string, string[]>>((acc, s) => {
  if (!acc[s.category]) acc[s.category] = [];
  acc[s.category].push(s.label);
  return acc;
}, {});

const catOrder = ["language", "ml", "bio", "db", "cloud", "graph", "tools"];
const getLink  = (label: string) => contactLinks.find(l => l.label === label)?.value ?? "";

// ── token types ────────────────────────────────────────────

type Token    = { text: string; color?: string };
type CodeLine = Token[];
type ObjProp  = { key: string; tokens: Token[] };

const C = {
  kw:   "var(--cyan)",
  str:  "var(--amber)",
  prop: "#a78bfa",
  fn:   "#34d399",
  dim:  "rgba(203,213,225,0.28)",
} as const;

const kw    = (t: string): Token => ({ text: t,        color: C.kw });
const str   = (t: string): Token => ({ text: `"${t}"`, color: C.str });
const prop  = (t: string): Token => ({ text: t,        color: C.prop });
const fn    = (t: string): Token => ({ text: t,        color: C.fn });
const dim   = (t: string): Token => ({ text: t,        color: C.dim });
const plain = (t: string): Token => ({ text: t });
const tab   = (n: number): Token => plain("\t".repeat(n));

const inlineStrArr = (items: string[]): Token[] => [
  dim("["),
  ...items.flatMap((s, i): Token[] => i > 0 ? [dim(", "), str(s)] : [str(s)]),
  dim("]"),
];

// ── line builder ───────────────────────────────────────────

function buildLines(data: {
  fullName: string;
  className: string;
  location: string;
  degree: string;
  focus: string;
  roles: string[];
  email: string;
  github: string;
  linkedin: string;
  orcid: string;
  skillsByCategory: Record<string, string[]>;
  catOrder: string[];
  interests: string[];
}): CodeLine[] {
  const lines: CodeLine[] = [];
  const add   = (...tokens: Token[]) => lines.push(tokens);
  const blank = () => lines.push([]);

  // ── class header ──
  add(kw("class"), plain(` ${data.className} `), dim("{"));
  blank();

  // ── constructor ──
  add(tab(1), kw("constructor"), plain("() "), dim("{"));

  const ctorProps: ObjProp[] = [
    { key: "this.name",      tokens: [str(data.fullName)] },
    { key: "this.location",  tokens: [str(data.location)] },
    { key: "this.degree",    tokens: [str(data.degree)] },
    { key: "this.focus",     tokens: [str(data.focus)] },
    { key: "this.roles",     tokens: inlineStrArr(data.roles) },
    { key: "this.email",     tokens: [str(data.email)] },
    { key: "this.github",    tokens: [str(data.github)] },
    { key: "this.linkedin",  tokens: [str(data.linkedin)] },
    { key: "this.orcid",     tokens: [str(data.orcid)] },
  ];

  const maxPropLen = Math.max(...ctorProps.map(p => p.key.length));
  for (const { key, tokens } of ctorProps) {
    const pad = " ".repeat(maxPropLen - key.length + 1);
    add(tab(2), prop(key), plain(`${pad}= `), ...tokens, dim(";"));
  }

  add(tab(1), dim("}"));
  blank();

  // ── skills() ──
  add(tab(1), fn("skills"), plain("() "), dim("{"));
  add(tab(2), kw("return"), plain(" "), dim("{"));

  const maxCatLen = Math.max(...data.catOrder.map(c => c.length));
  for (const cat of data.catOrder) {
    const items = data.skillsByCategory[cat] ?? [];
    const pad = " ".repeat(maxCatLen - cat.length + 1);
    const itemTokens: Token[] = items.flatMap((s, i): Token[] =>
      i > 0 ? [dim(", "), str(s)] : [str(s)]
    );
    add(tab(3), prop(cat), dim(":"), plain(pad), dim("["), ...itemTokens, dim("],"));
  }

  add(tab(2), dim("};"));
  add(tab(1), dim("}"));
  blank();

  // ── interests() ──
  add(tab(1), fn("interests"), plain("() "), dim("{"));
  add(tab(2), kw("return"), plain(" "), ...inlineStrArr(data.interests), dim(";"));
  add(tab(1), dim("}"));

  // ── class footer ──
  add(dim("}"));

  return lines;
}

// ── component ──────────────────────────────────────────────

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [view, setView] = useState<"prose" | "code">("prose");

  const location = facts.find(f => f.label === "Location")?.value ?? "";
  const degree   = facts.find(f => f.label === "Degree")?.value ?? "";
  const focus    = facts.find(f => f.label === "Focus")?.value ?? "";

  const lines = buildLines({
    fullName:        `${firstName} ${lastName}`,
    className:       `${firstName}${lastName}`,
    location,
    degree,
    focus,
    roles:           rolesRaw.map(r => r.label),
    email:           getLink("Email"),
    github:          getLink("GitHub"),
    linkedin:        getLink("LinkedIn"),
    orcid:           getLink("ORCID"),
    skillsByCategory,
    catOrder,
    interests,
  });

  const gutterW = lines.length >= 100 ? "3.75rem" : "3rem";

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto" ref={ref}>

        {/* header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="section-label mb-3"
            >
              About
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-3xl sm:text-4xl font-bold"
            >
              Who I Am
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex p-1 rounded-lg gap-1"
            style={{ border: "1px solid var(--border)", background: "var(--surface2)" }}
          >
            {(["prose", "code"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 text-xs"
                style={{
                  fontFamily: '"DM Mono", "Fira Code", monospace',
                  letterSpacing: "0.05em",
                  position: "relative",
                  background: "transparent",
                  color: view === v ? "#000" : "var(--muted)",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 6,
                  transition: "color 0.15s",
                }}
              >
                {view === v && (
                  <motion.div
                    layoutId="about-pill"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 6,
                      background: "var(--cyan)",
                      zIndex: 0,
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>
                  {v === "prose" ? "¶" : "</>"}
                </span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* views */}
        <AnimatePresence mode="wait">
          {view === "prose" ? (

            <motion.div
              key="prose"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div>
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className={`text-base leading-relaxed${i < paragraphs.length - 1 ? " mb-5" : ""}`}
                    style={{ color: "var(--muted)" }}
                  >
                    {p}
                  </p>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {facts.map((f) => (
                  <div key={f.label} className="card px-5 py-4">
                    <span className="section-label text-xs block mb-1">{f.label}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

          ) : (

            <motion.div
              key="code"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              {/* tab bar */}
              <div
                className="flex items-end px-4 pt-2.5"
                style={{ background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-t-md text-xs"
                  style={{
                    background: "var(--surface)",
                    borderTop: "1px solid var(--cyan)",
                    fontFamily: '"DM Mono", "Fira Code", monospace',
                    color: "var(--muted)",
                  }}
                >
                  <span style={{ color: "var(--amber)", fontSize: "0.6rem", letterSpacing: "0.08em", fontWeight: 600 }}>
                    JS
                  </span>
                  <span>{firstName}{lastName}.js</span>
                </div>
              </div>

              {/* line-numbered code */}
              <div className="overflow-x-auto py-3" style={{ background: "var(--surface)" }}>
                <table style={{ borderCollapse: "collapse", minWidth: "100%" }}>
                  <tbody>
                    {lines.map((tokens, i) => (
                      <tr
                        key={i}
                        className="hover:bg-white/[0.025] transition-colors duration-75"
                        style={{ lineHeight: "1.75rem" }}
                      >
                        {/* gutter */}
                        <td
                          className="select-none text-right align-middle"
                          style={{
                            width: gutterW,
                            minWidth: gutterW,
                            paddingRight: "1.1rem",
                            paddingLeft: "1rem",
                            color: "var(--muted)",
                            opacity: 0.28,
                            fontSize: "0.7rem",
                            fontFamily: '"DM Mono", "Fira Code", monospace',
                            borderRight: "1px solid var(--border)",
                            userSelect: "none",
                          }}
                        >
                          {i + 1}
                        </td>
                        {/* code */}
                        <td
                          style={{
                            paddingLeft: "1.25rem",
                            paddingRight: "2rem",
                            fontSize: "0.875rem",
                            fontFamily: '"DM Mono", "Fira Code", monospace',
                            whiteSpace: "pre",
                            tabSize: 2,
                          }}
                        >
                          {tokens.length > 0
                            ? tokens.map((t, j) => (
                                <span key={j} style={{ color: t.color ?? "var(--text)" }}>{t.text}</span>
                              ))
                            : " "}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
