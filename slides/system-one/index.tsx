import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  Step,
  Steps,
  useSlidePageNumber,
} from '@open-slide/core';
import { type CSSProperties, type ReactNode, useState } from 'react';
import sci from './assets/science.json';
import kahnemanPhoto from './assets/kahneman.jpg';
import bookCover from './assets/thinking-fast-and-slow.jpg';

export const design: DesignSystem = {
  palette: { bg: '#faf7f2', text: '#1f1b16', accent: '#c44536' },
  fonts: {
    display: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
    body: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", system-ui, sans-serif',
  },
  typeScale: { hero: 128, body: 36 },
  radius: 14,
};

// Colours with one meaning each, used the same way on every page.
const C = {
  ink: '#1f1b16',
  soft: '#57504a',
  muted: '#8a8179',
  rule: '#ded6c9',
  panel: '#f1ece3',
  white: '#fffdf9',
  s1: '#b45309', // System 1: fast, read the answer
  s2: '#1d4ed8', // System 2: slow, write the answer
  pred: '#6d28d9', // what the model says (probability, confidence)
  truth: '#0f766e', // what really happened (correct answer, accuracy)
  loss: '#be123c', // the gap between the two
};
const mono = '"SF Mono", ui-monospace, Menlo, Consolas, monospace';
const serif = 'var(--osd-font-display)';
const PARTS = [
  'Two ways of thinking',
  'How an LLM answers',
  'Read, don’t write',
  'Calibration',
  'Training for calibration',
  'Putting it to work',
];

const f2 = (x: number) => x.toFixed(2);
const pct = (x: number) => `${Math.round(100 * x)}%`;

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  fontFamily: 'var(--osd-font-body)',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  position: 'relative',
};

// ---------------------------------------------------------------- page chrome

const PageNo = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', right: 110, bottom: 40, fontSize: 22, color: C.muted }}>
      {current} / {total}
    </div>
  );
};

const RouteDot = ({ on }: { on: boolean }) => (
  <div style={{ width: 54, height: 8, borderRadius: 4, background: on ? 'var(--osd-accent)' : C.rule }} />
);

const Route = ({ part }: { part: number }) => (
  <div style={{ position: 'absolute', right: 110, top: 74, display: 'flex', gap: 10 }}>
    <RouteDot on={part === 1} />
    <RouteDot on={part === 2} />
    <RouteDot on={part === 3} />
    <RouteDot on={part === 4} />
    <RouteDot on={part === 5} />
    <RouteDot on={part === 6} />
  </div>
);

const Frame = ({
  part,
  title,
  line,
  children,
}: {
  part: number;
  title: ReactNode;
  line?: ReactNode;
  children?: ReactNode;
}) => (
  <div style={fill}>
    <div
      style={{
        position: 'absolute',
        left: 110,
        top: 62,
        fontSize: 24,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--osd-accent)',
        fontWeight: 600,
      }}
    >
      {part === 0 ? 'System 1 models' : `Part ${part} · ${PARTS[part - 1]}`}
    </div>
    {part > 0 && <Route part={part} />}
    <h2
      style={{
        position: 'absolute',
        left: 110,
        right: 110,
        top: 100,
        margin: 0,
        fontFamily: serif,
        fontSize: 60,
        lineHeight: 1.15,
        fontWeight: 700,
      }}
    >
      {title}
    </h2>
    <div data-body="" style={{ position: 'absolute', left: 110, right: 110, top: 215, bottom: 165 }}>{children}</div>
    {line && (
      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 260,
          bottom: 56,
          minHeight: 84,
          display: 'flex',
          alignItems: 'center',
          borderLeft: '6px solid var(--osd-accent)',
          paddingLeft: 26,
          fontSize: 31,
          lineHeight: 1.35,
          color: C.soft,
        }}
      >
        <span>{line}</span>
      </div>
    )}
    <PageNo />
  </div>
);

const PartRow = ({ n, label, state }: { n: number; label: string; state: 'done' | 'now' | 'next' }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      fontSize: state === 'now' ? 38 : 30,
      fontWeight: state === 'now' ? 700 : 400,
      color: state === 'now' ? C.ink : C.muted,
      height: 58,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        background: state === 'now' ? 'var(--osd-accent)' : state === 'done' ? C.muted : 'transparent',
        border: `2px solid ${state === 'now' ? 'var(--osd-accent)' : C.muted}`,
        color: state === 'next' ? C.muted : C.white,
        fontSize: 22,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {n}
    </div>
    {label}
  </div>
);

const st = (n: number, now: number) => (n < now ? 'done' : n === now ? 'now' : 'next');

const SectionPage = ({ n, goal, how }: { n: number; goal: string; how: string }) => (
  <div style={fill}>
    <div style={{ position: 'absolute', left: 110, top: 150, width: 980 }}>
      <div style={{ fontSize: 28, letterSpacing: '0.16em', color: 'var(--osd-accent)', fontWeight: 600 }}>
        PART {n}
      </div>
      <h1 style={{ fontFamily: serif, fontSize: 104, lineHeight: 1.08, margin: '22px 0 56px', fontWeight: 700 }}>
        {PARTS[n - 1]}
      </h1>
      <div style={{ fontSize: 26, letterSpacing: '0.12em', color: C.muted, fontWeight: 600 }}>THE QUESTION</div>
      <p style={{ fontSize: 40, lineHeight: 1.35, margin: '10px 0 40px' }}>{goal}</p>
      <div style={{ fontSize: 26, letterSpacing: '0.12em', color: C.muted, fontWeight: 600 }}>HOW WE ANSWER IT</div>
      <p style={{ fontSize: 40, lineHeight: 1.35, margin: '10px 0 0', color: C.soft }}>{how}</p>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 1230,
        top: 300,
        width: 580,
        padding: '34px 40px',
        background: C.panel,
        borderRadius: 'var(--osd-radius)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <PartRow n={1} label={PARTS[0]} state={st(1, n)} />
      <PartRow n={2} label={PARTS[1]} state={st(2, n)} />
      <PartRow n={3} label={PARTS[2]} state={st(3, n)} />
      <PartRow n={4} label={PARTS[3]} state={st(4, n)} />
      <PartRow n={5} label={PARTS[4]} state={st(5, n)} />
      <PartRow n={6} label={PARTS[5]} state={st(6, n)} />
    </div>
    <PageNo />
  </div>
);

// ---------------------------------------------------------------- small pieces

const Card = ({
  children,
  color = C.rule,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) => (
  <div
    style={{
      background: C.white,
      border: `2px solid ${color}`,
      borderRadius: 'var(--osd-radius)',
      padding: '30px 36px',
      ...style,
    }}
  >
    {children}
  </div>
);

const Label = ({ children, color = C.muted }: { children: ReactNode; color?: string }) => (
  <div style={{ fontSize: 24, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, color }}>
    {children}
  </div>
);

const Tok = ({ t, id, color = C.ink, bg = C.white }: { t: string; id?: number; color?: string; bg?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
    <div
      style={{
        fontFamily: mono,
        fontSize: 34,
        padding: '12px 16px',
        background: bg,
        border: `2px solid ${color === C.ink ? C.rule : color}`,
        color,
        borderRadius: 10,
        whiteSpace: 'pre',
      }}
    >
      {t.replace(/ /g, '␣')}
    </div>
    {id !== undefined && <div style={{ fontFamily: mono, fontSize: 24, color: C.muted }}>{id}</div>}
  </div>
);

const SYN = { com: '#8a8179', str: '#3f7d20', key: '#1d4ed8', kw: '#a626a4', num: '#b45309', fn: '#0b6e99' };
const TOKEN =
  /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(def|return|for|in|while|if|else|elif|import|from|as|with|break|not|and|or|lambda|class|try|except|pass|True|False|None|true|false|null)\b|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\()/g;

// Colours one line of Python or JSON. Strings are matched before comments, so a "#" inside a string stays a string.
const paint = (ln: string): ReactNode[] => {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of ln.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(ln.slice(last, i));
    const isKey = m[2] !== undefined && /^\s*:/.test(ln.slice(i + m[0].length));
    const color = m[1] ? SYN.com : m[2] ? (isKey ? SYN.key : SYN.str) : m[3] ? SYN.kw : m[4] ? SYN.num : SYN.fn;
    out.push(
      <span key={i} style={{ color, fontStyle: m[1] ? 'italic' : 'normal' }}>
        {m[0]}
      </span>,
    );
    last = i + m[0].length;
  }
  if (last < ln.length) out.push(ln.slice(last));
  return out;
};

const Code = ({ code, size = 29, hl = [], plain }: { code: string; size?: number; hl?: number[]; plain?: boolean }) => (
  <pre
    style={{
      margin: 0,
      padding: '26px 32px',
      background: '#fffdf9',
      border: `2px solid ${C.rule}`,
      borderRadius: 'var(--osd-radius)',
      fontFamily: mono,
      fontSize: size,
      lineHeight: 1.5,
      color: C.ink,
      whiteSpace: 'pre',
    }}
  >
    {code
      .trim()
      .split('\n')
      .map((ln, i) => (
        <div key={i} style={{ background: hl.includes(i) ? '#fbe9e4' : 'transparent', margin: '0 -12px', padding: '0 12px' }}>
          {ln === '' ? ' ' : plain ? ln : paint(ln)}
        </div>
      ))}
  </pre>
);

const Bar = ({
  label,
  p,
  color = C.pred,
  max = 1,
  width = 760,
  mono: isMono = false,
  dim = false,
}: {
  label: string;
  p: number;
  color?: string;
  max?: number;
  width?: number;
  mono?: boolean;
  dim?: boolean;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, height: 62, opacity: dim ? 0.3 : 1 }}>
    <div style={{ width: 300, textAlign: 'right', fontSize: 32, fontFamily: isMono ? mono : 'inherit' }}>{label}</div>
    <div style={{ width, height: 40, background: C.panel, borderRadius: 6 }}>
      <div style={{ width: Math.max(3, (width * p) / max), height: 40, background: color, borderRadius: 6 }} />
    </div>
    <div style={{ fontSize: 32, fontFamily: mono, color }}>{f2(p)}</div>
  </div>
);

const Frac = ({ top, bot }: { top: ReactNode; bot: ReactNode }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 10px' }}>
    <span style={{ padding: '0 14px 6px' }}>{top}</span>
    <span style={{ borderTop: `3px solid ${C.ink}`, padding: '6px 14px 0' }}>{bot}</span>
  </span>
);

const Eq = ({ children, size = 52 }: { children: ReactNode; size?: number }) => (
  <div style={{ fontFamily: serif, fontSize: size, textAlign: 'center', lineHeight: 1.3 }}>{children}</div>
);

const I = ({ children, color }: { children: ReactNode; color?: string }) => (
  <span style={{ fontStyle: 'italic', color }}>{children}</span>
);

const Big = ({ value, label, color }: { value: string; label: string; color: string }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontFamily: serif, fontSize: 190, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 34, color: C.soft, marginTop: 18 }}>{label}</div>
  </div>
);

const Arrows = () => (
  <defs>
    <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={C.soft} />
    </marker>
    <marker id="ahr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={C.loss} />
    </marker>
  </defs>
);

const Box = ({
  x,
  y,
  w,
  h,
  text,
  sub,
  color = C.ink,
  fillc = C.white,
  size = 30,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  sub?: string;
  color?: string;
  fillc?: string;
  size?: number;
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={12} fill={fillc} stroke={color} strokeWidth={3} />
    <text x={x + w / 2} y={y + h / 2 + (sub ? -6 : size * 0.35)} textAnchor="middle" fontSize={size} fill={color} fontWeight={600}>
      {text}
    </text>
    {sub && (
      <text x={x + w / 2} y={y + h / 2 + 30} textAnchor="middle" fontSize={24} fill={C.soft}>
        {sub}
      </text>
    )}
  </g>
);

const Arr = ({ x1, y1, x2, y2, color = C.soft }: { x1: number; y1: number; x2: number; y2: number; color?: string }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} markerEnd={color === C.loss ? 'url(#ahr)' : 'url(#ah)'} />
);

const col: CSSProperties = { display: 'flex', flexDirection: 'column' };
const row: CSSProperties = { display: 'flex', flexDirection: 'row' };
const EMAIL = sci.email;

const EmailCard = ({ width = 760 }: { width?: number }) => (
  <div style={{ width, background: C.white, border: `2px solid ${C.rule}`, borderRadius: 'var(--osd-radius)', overflow: 'hidden' }}>
    <div style={{ background: C.panel, padding: '16px 30px', fontSize: 26, color: C.soft, ...row, justifyContent: 'space-between' }}>
      <span>To: support</span>
      <span>09:12</span>
    </div>
    <div style={{ padding: '34px 30px', fontFamily: serif, fontSize: 44, lineHeight: 1.3 }}>“{EMAIL}”</div>
  </div>
);

// ---------------------------------------------------------------- opening

const Cover: Page = () => (
  <div style={fill}>
    <div style={{ position: 'absolute', left: 110, top: 190, width: 1250 }}>
      <div style={{ fontSize: 28, letterSpacing: '0.16em', color: 'var(--osd-accent)', fontWeight: 600 }}>
        SYSTEM 1 MODELS
      </div>
      <h1 style={{ fontFamily: serif, fontSize: 'var(--osd-size-hero)', lineHeight: 1.05, margin: '30px 0 40px', fontWeight: 700 }}>
        Deciding without writing
      </h1>
      <p style={{ fontSize: 42, lineHeight: 1.4, color: C.soft, margin: 0 }}>
        How an LLM writes an answer, and how decision models such as Jev skip the writing and return calibrated
        probabilities in one forward pass.
      </p>
    </div>
    <svg style={{ position: 'absolute', right: 110, top: 250 }} width={420} height={560} viewBox="0 0 420 560">
      <rect x={20} y={20} width={380} height={150} rx={14} fill={C.white} stroke={C.rule} strokeWidth={3} />
      <text x={210} y={108} textAnchor="middle" fontSize={34} fill={C.ink}>one email</text>
      <line x1={210} y1={170} x2={210} y2={240} stroke={C.soft} strokeWidth={3} />
      <rect x={90} y={240} width={240} height={90} rx={14} fill={C.s1} />
      <text x={210} y={297} textAnchor="middle" fontSize={34} fill={C.white} fontWeight={700}>one pass</text>
      <line x1={210} y1={330} x2={210} y2={400} stroke={C.soft} strokeWidth={3} />
      <rect x={20} y={400} width={380} height={140} rx={14} fill={C.white} stroke={C.pred} strokeWidth={3} />
      <text x={50} y={455} fontSize={30} fill={C.ink}>billing</text>
      <rect x={170} y={432} width={170} height={28} rx={5} fill={C.pred} />
      <text x={50} y={510} fontSize={30} fill={C.ink}>technical</text>
      <rect x={200} y={487} width={40} height={28} rx={5} fill={C.pred} opacity={0.5} />
    </svg>
    <div style={{ position: 'absolute', left: 110, bottom: 90, fontSize: 30, color: C.muted }}>
      Nipun Batra · IIT Gandhinagar
    </div>
  </div>
);

const QCard = ({ q, type, opts }: { q: string; type: string; opts: string }) => (
  <Card style={{ padding: '22px 32px' }}>
    <div style={{ ...row, justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontSize: 36, fontWeight: 600 }}>{q}</div>
      <div style={{ fontSize: 24, color: C.muted }}>{type}</div>
    </div>
    <div style={{ fontFamily: mono, fontSize: 30, color: C.soft, marginTop: 10 }}>{opts}</div>
  </Card>
);

const Email: Page = () => (
  <Frame part={0} title="Running example: a support email" line="The support software has to answer three questions about this email before anyone replies.">
    <div style={{ ...row, gap: 90, alignItems: 'center', height: '100%' }}>
      <EmailCard />
      <div style={{ ...col, gap: 26, flex: 1 }}>
        <Steps>
          <Step>
            <QCard q="Is the customer asking for money back?" type="yes or no" opts="yes · no" />
          </Step>
          <Step>
            <QCard q="Which team should handle it?" type="one of a list" opts="billing · technical · sales" />
          </Step>
          <Step>
            <QCard q="How urgent is it?" type="a level" opts="not urgent · soon · today" />
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

const Needs: Page = () => (
  <Frame part={0} title="What the software needs from the model" line="It needs one answer from a fixed list, along with a probability that says how much to trust that answer.">
    <div style={{ ...row, gap: 60, height: '100%', alignItems: 'center' }}>
      <Card style={{ flex: 1 }} color={C.s2}>
        <Label color={C.s2}>A chatbot writes</Label>
        <p style={{ fontFamily: serif, fontSize: 36, lineHeight: 1.45, margin: '18px 0 0', color: C.soft }}>
          “It sounds like you may have been charged twice. I would suggest reaching out to the billing team, who
          should be able to look into this fairly quickly…”
        </p>
      </Card>
      <Steps>
        <Step>
          <Card style={{ width: 760 }} color={C.s1}>
            <Label color={C.s1}>The program needs</Label>
            <div style={{ ...col, gap: 4, marginTop: 20 }}>
              <Bar label="billing" p={0.85} width={280} />
              <Bar label="technical" p={0.12} width={280} />
              <Bar label="sales" p={0.03} width={280} />
            </div>
            <div style={{ fontSize: 26, color: C.muted, marginTop: 14 }}>made-up numbers, to show the shape of the answer</div>
          </Card>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const RouteItem = ({ n, title, what }: { n: number; title: string; what: string }) => (
  <div style={{ ...row, gap: 28, alignItems: 'center', height: 100 }}>
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        background: 'var(--osd-accent)',
        color: C.white,
        fontSize: 30,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {n}
    </div>
    <div style={{ width: 520, fontFamily: serif, fontSize: 42, fontWeight: 700 }}>{title}</div>
    <div style={{ fontSize: 32, color: C.soft }}>{what}</div>
  </div>
);

const RouteMap: Page = () => (
  <Frame part={0} title="Plan for today">
    <div style={{ ...col, gap: 8, marginTop: 10 }}>
      <RouteItem n={1} title={PARTS[0]} what="fast judgement and slow reasoning" />
      <RouteItem n={2} title={PARTS[1]} what="tokens, attention, logits, one token at a time" />
      <RouteItem n={3} title={PARTS[2]} what="getting the answer from one forward pass" />
      <RouteItem n={4} title={PARTS[3]} what="when can a probability be trusted?" />
      <RouteItem n={5} title={PARTS[4]} what="losses that reward correct probabilities" />
      <RouteItem n={6} title={PARTS[5]} what="thresholds, guardrails, pipelines, limits" />
    </div>
  </Frame>
);

// ---------------------------------------------------------------- part 1

const S1: Page = () => (
  <SectionPage
    n={1}
    goal="People answer some questions instantly and work through others. Which kind does software ask most often?"
    how="Two multiplication problems, Kahneman’s two systems, examples from machine learning, and the questions programs ask with their answer types."
  />
);

const Sum = ({ q, a, color, tag }: { q: string; a: string; color: string; tag: string }) => (
  <div style={{ textAlign: 'center', width: 800 }}>
    <div style={{ fontFamily: serif, fontSize: 140, fontWeight: 700, whiteSpace: 'nowrap' }}>{q}</div>
    <Steps>
      <Step>
        <div style={{ fontFamily: serif, fontSize: 150, fontWeight: 700, color, lineHeight: 1.1 }}>{a}</div>
        <div style={{ fontSize: 36, color, marginTop: 10 }}>{tag}</div>
      </Step>
    </Steps>
  </div>
);

const TwoSums: Page = () => (
  <Frame part={1} title="Answer these two as fast as you can" line="You knew the first answer without working it out. The second one needed a few steps.">
    <div style={{ ...row, justifyContent: 'space-around', alignItems: 'center', height: '100%' }}>
      <Sum q="2 × 2 =" a="4" color={C.s1} tag="you just knew" />
      <Sum q="17 × 24 =" a="408" color={C.s2} tag="17 × 20 + 17 × 4 = 340 + 68" />
    </div>
  </Frame>
);

const SysCard = ({ name, color, how, a, b, c }: { name: string; color: string; how: string; a: string; b: string; c: string }) => (
  <Card color={color} style={{ flex: 1, padding: '36px 44px' }}>
    <div style={{ fontFamily: serif, fontSize: 64, fontWeight: 700, color }}>{name}</div>
    <div style={{ fontSize: 38, margin: '8px 0 30px' }}>{how}</div>
    <div style={{ fontSize: 34, lineHeight: 1.75, color: C.soft }}>
      <div>{a}</div>
      <div>{b}</div>
      <div>{c}</div>
    </div>
  </Card>
);

const TwoSystems: Page = () => (
  <Frame part={1} title="The two systems in everyday tasks" line="We use System 1 for most of what we do in a day. System 2 takes over when a task needs steps.">
    <div style={{ ...row, gap: 60, height: '100%', alignItems: 'center' }}>
      <SysCard
        name="System 1"
        color={C.s1}
        how="fast and automatic"
        a="recognising a friend’s face"
        b="reading a signboard"
        c="2 × 2"
      />
      <SysCard
        name="System 2"
        color={C.s2}
        how="slow and deliberate"
        a="parking in a tight spot"
        b="filling a tax form"
        c="17 × 24"
      />
    </div>
  </Frame>
);

const IBM_VIDEO = 'https://www.youtube.com/watch?v=YGgNBcIgI4s';

const Kahneman: Page = () => (
  <Frame
    part={1}
    title="Kahneman’s two systems"
    line="Daniel Kahneman named the two modes System 1 and System 2. The IBM video linked here applies the idea to AI models."
  >
    <div style={{ ...row, gap: 70, alignItems: 'center', height: '100%' }}>
      <div style={{ ...col, gap: 12 }}>
        <div style={{ ...row, gap: 30, alignItems: 'flex-end' }}>
          <img src={kahnemanPhoto} alt="Daniel Kahneman" style={{ height: 440, borderRadius: 'var(--osd-radius)' }} />
          <img src={bookCover} alt="Cover of Thinking, Fast and Slow" style={{ height: 440, borderRadius: 6, border: `2px solid ${C.rule}` }} />
        </div>
        <div style={{ fontSize: 20, color: C.muted }}>
          Photo: nrkbeta, CC BY-SA 2.0, via Wikimedia Commons · Book cover © its publisher
        </div>
      </div>
      <div style={{ ...col, gap: 26, flex: 1 }}>
        <div>
          <div style={{ fontFamily: serif, fontSize: 50, fontWeight: 700 }}>Daniel Kahneman</div>
          <div style={{ fontSize: 30, color: C.soft, lineHeight: 1.4 }}>
            Psychologist, 1934 to 2024. Nobel Memorial Prize in Economic Sciences, 2002.
          </div>
        </div>
        <div style={{ fontSize: 34, lineHeight: 1.45 }}>
          His 2011 book <i>Thinking, Fast and Slow</i> describes two modes of thought.
        </div>
        <Steps>
          <Step>
            <div style={{ fontSize: 34, lineHeight: 1.6 }}>
              <div>
                <b style={{ color: C.s1 }}>System 1</b> is fast and automatic.
              </div>
              <div>
                <b style={{ color: C.s2 }}>System 2</b> is slow and deliberate.
              </div>
            </div>
          </Step>
          <Step>
            <a
              href={IBM_VIDEO}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'block', background: C.panel, borderRadius: 'var(--osd-radius)', padding: '18px 26px', textDecoration: 'none', color: C.ink }}
            >
              <div style={{ fontSize: 22, letterSpacing: '0.12em', fontWeight: 600, color: 'var(--osd-accent)' }}>WATCH · IBM TECHNOLOGY</div>
              <div style={{ fontSize: 28, marginTop: 6 }}>Martin Keen, “What Is Jev? The AI Model That Doesn’t Generate Text”</div>
              <div style={{ fontFamily: mono, fontSize: 24, color: C.s2, marginTop: 6 }}>youtube.com/watch?v=YGgNBcIgI4s</div>
            </a>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

const MLList = ({ name, how, color, items }: { name: string; how: string; color: string; items: string[] }) => (
  <Card color={color} style={{ flex: 1, padding: '30px 40px' }}>
    <div style={{ ...row, alignItems: 'baseline', gap: 24 }}>
      <div style={{ fontFamily: serif, fontSize: 52, fontWeight: 700, color }}>{name}</div>
      <div style={{ fontSize: 28, color: C.soft }}>{how}</div>
    </div>
    <div style={{ fontSize: 31, lineHeight: 1.3, marginTop: 20 }}>
      {items.map((t) => (
        <div key={t} style={{ padding: '13px 0', borderTop: `2px solid ${C.rule}` }}>
          {t}
        </div>
      ))}
    </div>
  </Card>
);

const MLExamples: Page = () => (
  <Frame
    part={1}
    title="The same split shows up in machine learning"
    line="A classifier answers the questions on the left in one pass. The questions on the right need a model that writes out its steps."
  >
    <div style={{ ...row, gap: 50, alignItems: 'stretch', marginTop: 10 }}>
      <MLList
        name="System 1"
        how="one look, answer from a fixed list"
        color={C.s1}
        items={[
          'Is this chest X-ray normal?',
          'Which digit is in this image?',
          'Is this transaction fraudulent?',
          'Does this passage answer the query?',
          'Should the agent call a tool now?',
        ]}
      />
      <Steps>
        <Step>
          <MLList
            name="System 2"
            how="several steps, written out"
            color={C.s2}
            items={[
              'Why did validation loss rise after epoch 12?',
              'Derive the gradient of this layer.',
              'Write a data loader for this file format.',
              'Plan an ablation study for this model.',
              'Prove that this loss is convex.',
            ]}
          />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const TypeChip = ({ t, small }: { t: string; small?: boolean }) => (
  <span
    style={{
      fontFamily: mono,
      fontSize: small ? 22 : 30,
      fontWeight: 700,
      color: C.white,
      background: C.s1,
      borderRadius: 8,
      padding: small ? '3px 12px' : '5px 18px',
      whiteSpace: 'nowrap',
    }}
  >
    {t}
  </span>
);

const ModIcon = ({ kind }: { kind: 'image' | 'audio' }) => (
  <svg width={34} height={26} viewBox="0 0 34 26" style={{ flexShrink: 0 }}>
    {kind === 'image' ? (
      <g fill="none" stroke={C.s2} strokeWidth={2.5}>
        <rect x={2} y={2} width={30} height={22} rx={3} />
        <path d="M4,21 L13,11 L19,17 L24,13 L31,21" />
        <circle cx={24} cy={8} r={2.2} fill={C.s2} stroke="none" />
      </g>
    ) : (
      <g stroke={C.truth} strokeWidth={3} strokeLinecap="round">
        <line x1={5} y1={10} x2={5} y2={16} />
        <line x1={11} y1={5} x2={11} y2={21} />
        <line x1={17} y1={9} x2={17} y2={17} />
        <line x1={23} y1={3} x2={23} y2={23} />
        <line x1={29} y1={10} x2={29} y2={16} />
      </g>
    )}
  </svg>
);

type QItem = { q: string; a?: string; kind?: 'image' | 'audio' };

const QCol = ({ type, means, items }: { type: string; means: string; items: QItem[] }) => (
  <div style={{ ...col, gap: 20, width: 546, flexShrink: 0 }}>
    <div style={{ ...row, gap: 18, alignItems: 'center', height: 60 }}>
      <TypeChip t={type} />
      <div style={{ fontSize: 27, color: C.soft }}>{means}</div>
    </div>
    {items.map((it) => (
      <Card key={it.q} style={{ padding: '20px 26px', height: 168 }}>
        <div style={{ ...row, gap: 14, alignItems: 'flex-start' }}>
          {it.kind && (
            <div style={{ marginTop: 7 }}>
              <ModIcon kind={it.kind} />
            </div>
          )}
          <div style={{ fontSize: 31, fontWeight: 600, lineHeight: 1.25 }}>{it.q}</div>
        </div>
        {it.a && <div style={{ fontFamily: mono, fontSize: 25, color: C.s1, marginTop: 10 }}>{it.a}</div>}
      </Card>
    ))}
  </div>
);

const SoftwareCalls: Page = () => (
  <Frame
    part={1}
    title="Quick decisions in software, by answer type"
    line="Three answer types cover these questions. noul is the name decision-model APIs use for a yes or no question."
  >
    <div style={{ ...row, gap: 30, alignItems: 'flex-start' }}>
      <QCol
        type="noul"
        means="yes or no"
        items={[
          { q: 'Is this message spam?' },
          { q: 'Is this prompt a jailbreak?' },
          { q: 'Does this log line need a person to look at it?' },
        ]}
      />
      <Steps>
        <Step>
          <QCol
            type="choice"
            means="one option from a list"
            items={[
              { q: 'Which team gets this ticket?', a: 'billing · technical · sales' },
              { q: 'Which language is this?', a: 'hi · gu · en · ta · …' },
              { q: 'Which tool should the agent call?', a: 'search · calculator · none' },
            ]}
          />
        </Step>
        <Step>
          <QCol
            type="score"
            means="a level on an ordered scale"
            items={[
              { q: 'How positive is this review?', a: '1 · 2 · 3 · 4 · 5' },
              { q: 'How urgent is this email?', a: 'not urgent · soon · today' },
              { q: 'How relevant is this passage to the query?', a: '0 · 1 · 2 · 3' },
            ]}
          />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const VisionCalls: Page = () => (
  <Frame
    part={1}
    title="The same three types on images and audio"
    line="Recent decision models, such as Liquid’s d1.2, accept images and audio along with text. The answer types do not change."
  >
    <div style={{ ...row, gap: 30, alignItems: 'flex-start' }}>
      <QCol
        type="noul"
        means="yes or no"
        items={[
          { q: 'Is there a brick kiln in this satellite tile?', kind: 'image' },
          { q: 'Does this circuit board have a visible defect?', kind: 'image' },
          { q: 'Is there a siren in the background?', kind: 'audio' },
        ]}
      />
      <Steps>
        <Step>
          <QCol
            type="choice"
            means="one option from a list"
            items={[
              { q: 'Which disease is on this leaf?', a: 'healthy · rust · blight', kind: 'image' },
              { q: 'What kind of document is this scan?', a: 'invoice · receipt · ID · other', kind: 'image' },
              { q: 'Which language does the caller speak?', a: 'hi · gu · en · ta · …', kind: 'audio' },
            ]}
          />
        </Step>
        <Step>
          <QCol
            type="score"
            means="a level on an ordered scale"
            items={[
              { q: 'How hazy is the sky in this photo?', a: 'clear · light · heavy', kind: 'image' },
              { q: 'How damaged is this road surface?', a: 'none · minor · major', kind: 'image' },
              { q: 'How clear is the speech in this clip?', a: 'poor · fair · good', kind: 'audio' },
            ]}
          />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const NewRow = ({ types, q, back }: { types: string[]; q: string; back: string }) => (
  <div style={{ ...row, gap: 22, alignItems: 'center', minHeight: 106, borderTop: `2px solid ${C.rule}` }}>
    <div style={{ width: 230, display: 'flex', flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
      {types.map((t) => (
        <TypeChip key={t} t={t} small />
      ))}
    </div>
    <div style={{ width: 440, fontSize: 29, fontWeight: 600, lineHeight: 1.25, flexShrink: 0 }}>{q}</div>
    <div style={{ flex: 1, fontSize: 29, lineHeight: 1.25, color: C.soft }}>{back}</div>
  </div>
);

const Person = ({ x, glasses }: { x: number; glasses?: boolean }) => (
  <g>
    <path d={`M${x - 85},390 C${x - 85},235 ${x + 85},235 ${x + 85},390 Z`} fill={C.rule} stroke={C.panel} strokeWidth={4} />
    <circle cx={x} cy={185} r={58} fill={C.rule} />
    {glasses && (
      <g fill="none" stroke={C.ink} strokeWidth={3}>
        <circle cx={x - 17} cy={176} r={12} />
        <circle cx={x + 17} cy={176} r={12} />
        <line x1={x - 5} y1={176} x2={x + 5} y2={176} />
      </g>
    )}
  </g>
);

const NewTypes: Page = () => (
  <Frame
    part={1}
    title="Newer models answer with more than a probability"
    line="Liquid’s d1.2 models (November 2026) add these answer types. Accuracy on the new types is reported only by the vendor so far."
  >
    <div style={{ ...row, gap: 40, alignItems: 'flex-start' }}>
      <div style={{ ...col, flex: 1 }}>
        <div style={{ ...row, gap: 22, fontSize: 22, letterSpacing: '0.1em', fontWeight: 600, color: C.muted, height: 44 }}>
          <div style={{ width: 230 }}>TYPE</div>
          <div style={{ width: 440 }}>EXAMPLE QUESTION</div>
          <div>WHAT COMES BACK</div>
        </div>
        <NewRow types={['text', 'number', 'date']} q="What is the invoice total?" back="the value, and the characters it was read from" />
        <NewRow types={['spans']} q="Find every phone number in this message." back="each passage with its position, and a count" />
        <NewRow types={['box', 'boxes']} q="Where is the person wearing round glasses?" back="a rectangle, as fractions of the picture" />
        <NewRow types={['number', 'range']} q="How many people are in this photo?" back="a median and a p10 to p90 interval" />
        <NewRow types={['choice', 'multiple']} q="Which of these topics does the ticket mention?" back="every option with probability of at least 0.5" />
        <div style={{ fontSize: 26, color: C.muted, borderTop: `2px solid ${C.rule}`, paddingTop: 16 }}>
          Value, span and box answers carry a “found” score. Below 0.5 the model answers “not found”.
        </div>
      </div>
      <Steps>
        <Step>
          <div style={{ width: 520 }}>
            <svg width={520} height={390} viewBox="0 0 520 390" style={{ borderRadius: 'var(--osd-radius)', background: C.panel, display: 'block' }}>
              <Person x={132} glasses />
              <Person x={262} />
              <Person x={392} />
              <rect x={110} y={147} width={44} height={57} fill="none" stroke={C.pred} strokeWidth={4} />
            </svg>
            <div style={{ fontFamily: mono, fontSize: 22, color: C.pred, marginTop: 12, lineHeight: 1.4 }}>
              box: top 0.378, bottom 0.522,
              <br />
              left 0.212, right 0.296 · found 0.939
            </div>
            <div style={{ fontSize: 21, color: C.muted, marginTop: 6 }}>
              numbers from the example in Liquid’s docs; the drawing is ours
            </div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

type Mark = { span: [number, number]; color: string };
// Shows a text with the character ranges the model pointed to, exactly as the response gives them.
const Marked = ({ text, marks, size = 30 }: { text: string; marks: Mark[]; size?: number }) => {
  const out: ReactNode[] = [];
  let last = 0;
  [...marks].sort((a, b) => a.span[0] - b.span[0]).forEach((m, i) => {
    out.push(text.slice(last, m.span[0]));
    out.push(
      <span key={i} style={{ background: `${m.color}26`, color: m.color, fontWeight: 700, borderRadius: 4, padding: '1px 3px', borderBottom: `3px solid ${m.color}` }}>
        {text.slice(m.span[0], m.span[1])}
      </span>,
    );
    last = m.span[1];
  });
  out.push(text.slice(last));
  return <div style={{ fontFamily: mono, fontSize: size, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{out}</div>;
};

const INVOICE = 'ACME SA\nInvoice 2026-117\nTotal due: 1 234,50 EUR\nPay before 03/04/2026 (day/month/year)';

const ValRow = ({ type, q, a, from, found, color }: { type: string; q: string; a: string; from: string; found: string; color: string }) => (
  <div style={{ ...row, gap: 20, alignItems: 'center', minHeight: 108, borderTop: `2px solid ${C.rule}` }}>
    <div style={{ width: 120, flexShrink: 0 }}>
      <TypeChip t={type} small />
    </div>
    <div style={{ width: 330, fontSize: 28, fontWeight: 600, lineHeight: 1.25, flexShrink: 0 }}>{q}</div>
    <div style={{ width: 330, flexShrink: 0 }}>
      <div style={{ fontFamily: mono, fontSize: 30, color, fontWeight: 700 }}>{a}</div>
      <div style={{ fontSize: 22, color: C.muted }}>{from}</div>
    </div>
    <div style={{ fontFamily: mono, fontSize: 28, color: C.soft }}>{found}</div>
  </div>
);

const ReadValues: Page = () => (
  <Frame
    part={1}
    title="Example: reading values from an invoice"
    line="Each answer comes with the characters it was read from, so a program can check it against the document. A question with no answer in the text returns “not found”."
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <div style={{ width: 680, flexShrink: 0 }}>
        <Label>The input, as plain text</Label>
        <Card style={{ marginTop: 10, padding: '22px 28px' }}>
          <Marked
            text={INVOICE}
            size={26}
            marks={[
              { span: [0, 7], color: C.s2 },
              { span: [36, 48], color: C.s1 },
              { span: [60, 70], color: C.truth },
            ]}
          />
        </Card>
        <div style={{ fontSize: 22, color: C.muted, marginTop: 10 }}>example from Liquid’s d1.2 documentation; highlights are the returned spans</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ ...row, gap: 20, fontSize: 21, letterSpacing: '0.08em', fontWeight: 600, color: C.muted, height: 40 }}>
          <div style={{ width: 120 }}>TYPE</div>
          <div style={{ width: 330 }}>QUESTION</div>
          <div style={{ width: 330 }}>ANSWER</div>
          <div>FOUND</div>
        </div>
        <ValRow type="text" q="Who issued the invoice?" a="ACME SA" from="characters 0 to 7" found="0.986" color={C.s2} />
        <Steps>
          <Step>
            <ValRow type="number" q="How much is due?" a="1234.5 EUR" from="read from “1 234,50 EUR”" found="1" color={C.s1} />
          </Step>
          <Step>
            <ValRow type="date" q="By when must it be paid?" a="2026-04-03" from="read from “03/04/2026”" found="1" color={C.truth} />
          </Step>
          <Step>
            <ValRow type="number" q="How much VAT is charged?" a="null" from="not in the document" found="0" color={C.loss} />
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

const PATIENT = 'Patient Rachel Kim (DOB 1984-02-11) called from 415-555-0142 about her refill. Email: rkim@example.com.';
const PII: [[number, number], number][] = [
  [[8, 18], 0.997],
  [[24, 34], 0.953],
  [[48, 60], 0.926],
  [[86, 102], 0.813],
];
const TOPICS_EX: [string, number][] = [
  ['billing', 0.968],
  ['delivery', 0.969],
  ['product', 0.0024],
  ['account', 0.0007],
];

const ExCard = ({ types, q, children }: { types: string[]; q: string; children: ReactNode }) => (
  <Card style={{ width: 544, padding: '22px 26px' }}>
    <div style={{ ...row, gap: 8 }}>
      {types.map((t) => (
        <TypeChip key={t} t={t} small />
      ))}
    </div>
    <div style={{ fontSize: 27, fontWeight: 600, lineHeight: 1.25, margin: '12px 0 14px', height: 68 }}>{q}</div>
    {children}
  </Card>
);

const MoreExamples: Page = () => (
  <Frame
    part={1}
    title="Examples: passages, several options, a count"
    line="All three are from Liquid’s d1.2 documentation. The third shows a count for a group photograph, given as a median with an interval that holds 80% of the probability."
  >
    <div style={{ ...row, gap: 34, alignItems: 'stretch' }}>
      <ExCard types={['spans']} q="Every piece of personal data.">
        <Marked text={PATIENT} size={23} marks={PII.map(([span]) => ({ span, color: C.s2 }))} />
        <div style={{ fontFamily: mono, fontSize: 22, color: C.soft, marginTop: 14, lineHeight: 1.5 }}>
          found: {PII.map(([, f]) => f.toFixed(3)).join(', ')}
          <br />
          count: 4
        </div>
      </ExCard>
      <Steps>
        <Step>
          <ExCard types={['choice', 'multiple']} q="Which topics does the message raise?">
            <div style={{ fontFamily: serif, fontSize: 26, lineHeight: 1.35, marginBottom: 14 }}>
              “My package arrived late and I was charged twice for it.”
            </div>
            {TOPICS_EX.map(([t, v]) => (
              <div key={t} style={{ ...row, alignItems: 'center', gap: 12, height: 46 }}>
                <div style={{ width: 120, fontSize: 26, textAlign: 'right' }}>{t}</div>
                <div style={{ width: 190, height: 26, background: C.panel, borderRadius: 5 }}>
                  <div style={{ width: Math.max(3, 190 * v), height: 26, background: v >= 0.5 ? C.pred : C.muted, borderRadius: 5 }} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 24, color: v >= 0.5 ? C.pred : C.muted }}>{v}</div>
              </div>
            ))}
            <div style={{ fontFamily: mono, fontSize: 22, color: C.pred, marginTop: 10 }}>choices: billing, delivery</div>
          </ExCard>
        </Step>
        <Step>
          <ExCard types={['number', 'range']} q="How many people are in the photo? Range 0 to 60, step 1.">
            <svg width={490} height={150} viewBox="0 0 490 150">
              <line x1={20} y1={80} x2={470} y2={80} stroke={C.rule} strokeWidth={6} strokeLinecap="round" />
              <line x1={20 + (23 / 60) * 450} y1={80} x2={20 + (30 / 60) * 450} y2={80} stroke={C.pred} strokeWidth={14} strokeLinecap="round" opacity={0.45} />
              <circle cx={20 + (26 / 60) * 450} cy={80} r={13} fill={C.pred} />
              <text x={20 + (26 / 60) * 450} y={44} textAnchor="middle" fontSize={34} fontFamily={mono} fontWeight={700} fill={C.pred}>26</text>
              {[0, 20, 40, 60].map((v) => (
                <text key={v} x={20 + (v / 60) * 450} y={126} textAnchor="middle" fontSize={22} fill={C.soft}>{v}</text>
              ))}
            </svg>
            <div style={{ fontFamily: mono, fontSize: 24, lineHeight: 1.5 }}>
              number: <b style={{ color: C.pred }}>26</b>
              <br />
              interval: [23, 30]
            </div>
            <div style={{ fontSize: 22, color: C.muted, marginTop: 8 }}>input: one group photograph</div>
          </ExCard>
        </Step>
      </Steps>
    </div>
  </Frame>
);

// ---------------------------------------------------------------- part 2

const S2: Page = () => (
  <SectionPage
    n={2}
    goal="Today most of these questions are sent to an LLM. How does it produce an answer, and what does that cost?"
    how="We follow the email through a small open model, from tokens to vectors to attention, and end with the generation loop."
  />
);

const Tokens: Page = () => (
  <Frame
    part={2}
    title="Step 1: text becomes tokens"
    line={`The model does not read letters. It gets ${sci.tokens.length} integers, each the id of a token in a vocabulary of ${sci.vocab.toLocaleString('en-US')} tokens.`}
  >
    <div style={{ ...col, gap: 60, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ fontFamily: serif, fontSize: 52 }}>“{EMAIL}”</div>
      <Steps>
        <Step>
          <div style={{ ...row, gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {sci.tokens.map((t, i) => (
              <Tok key={i} t={t} id={sci.token_ids[i]} />
            ))}
          </div>
        </Step>
      </Steps>
      <div style={{ fontSize: 28, color: C.muted }}>
        ␣ marks a space · tokenizer of {sci.model.split('/')[1]}, the {sci.params_M} M-parameter model we use throughout
      </div>
    </div>
  </Frame>
);

const Embed: Page = () => (
  <Frame
    part={2}
    title="Step 2: each token becomes a vector"
    line={`A token id picks one row of a learned table. From here on the model works with lists of ${sci.hidden} numbers.`}
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <text x={150} y={70} textAnchor="middle" fontSize={30} fill={C.soft}>token</text>
      <rect x={60} y={100} width={180} height={70} rx={10} fill={C.white} stroke={C.rule} strokeWidth={3} />
      <text x={150} y={147} textAnchor="middle" fontSize={34} fontFamily={mono}>␣charged</text>
      <text x={150} y={215} textAnchor="middle" fontSize={30} fontFamily={mono} fill={C.muted}>id {sci.token_ids[2]}</text>
      <Arr x1={250} y1={135} x2={470} y2={320} />
      <text x={830} y={70} textAnchor="middle" fontSize={30} fill={C.soft}>
        embedding table: {sci.vocab.toLocaleString('en-US')} rows × {sci.hidden} columns
      </text>
      <rect x={480} y={100} width={700} height={500} rx={12} fill={C.panel} stroke={C.rule} strokeWidth={3} />
      <rect x={480} y={300} width={700} height={44} fill={C.s2} opacity={0.18} />
      <rect x={480} y={300} width={700} height={44} fill="none" stroke={C.s2} strokeWidth={3} />
      <text x={830} y={220} textAnchor="middle" fontSize={40} fill={C.muted}>⋮</text>
      <text x={830} y={332} textAnchor="middle" fontSize={28} fontFamily={mono} fill={C.s2}>row {sci.token_ids[2]}</text>
      <text x={830} y={470} textAnchor="middle" fontSize={40} fill={C.muted}>⋮</text>
      <Arr x1={1190} y1={322} x2={1300} y2={322} />
      <rect x={1310} y={292} width={330} height={60} rx={10} fill={C.white} stroke={C.s2} strokeWidth={3} />
      <text x={1475} y={332} textAnchor="middle" fontSize={28} fontFamily={mono} fill={C.s2}>0.02 −0.11 … 0.07</text>
      <text x={1475} y={400} textAnchor="middle" fontSize={28} fill={C.soft}>{sci.hidden} numbers</text>
      <text x={1475} y={440} textAnchor="middle" fontSize={24} fill={C.muted}>values shown are illustrative</text>
      <text x={830} y={655} textAnchor="middle" fontSize={28} fill={C.soft}>
        {sci.vocab.toLocaleString('en-US')} × {sci.hidden} = {Math.round((sci.vocab * sci.hidden) / 1e6)} M numbers, about{' '}
        {Math.round((100 * sci.vocab * sci.hidden) / 1e6 / sci.params_M)}% of the model’s {sci.params_M} M parameters
      </text>
    </svg>
  </Frame>
);

const AttTok = ({ i, t, on }: { i: number; t: string; on?: boolean }) => (
  <g>
    <rect x={40 + i * 150} y={420} width={132} height={70} rx={10} fill={on ? C.s2 : C.white} stroke={on ? C.s2 : C.rule} strokeWidth={3} />
    <text x={106 + i * 150} y={466} textAnchor="middle" fontSize={30} fontFamily={mono} fill={on ? C.white : C.ink}>{t}</text>
  </g>
);
const AttArc = ({ from, to, w }: { from: number; to: number; w: number }) => {
  const x1 = 106 + from * 150;
  const x2 = 106 + to * 150;
  const h = 60 + (from - to) * 34;
  return (
    <g>
      <path d={`M${x1},414 C${x1},${414 - h} ${x2},${414 - h} ${x2},414`} fill="none" stroke={C.s2} strokeWidth={2 + 22 * w} opacity={0.25 + w} strokeLinecap="round" />
      <text x={x2} y={520 + 26} textAnchor="middle" fontSize={26} fill={C.s2}>{f2(w)}</text>
    </g>
  );
};

const Attention: Page = () => (
  <Frame
    part={2}
    title="Step 3: each token attends to the tokens before it"
    line="Self-attention replaces each token’s vector with a weighted mix of the earlier tokens. Here “it” takes most of its meaning from “charged twice”."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <text x={850} y={56} textAnchor="middle" fontSize={30} fill={C.s2}>
        new vector for “it” = 0.42 × v(charged) + 0.27 × v(twice) + 0.15 × v(fix) + 0.08 × v(month) + …
      </text>
      <AttArc from={9} to={2} w={0.42} />
      <AttArc from={9} to={3} w={0.27} />
      <AttArc from={9} to={5} w={0.08} />
      <AttArc from={9} to={8} w={0.15} />
      <AttTok i={0} t="I" />
      <AttTok i={1} t="was" />
      <AttTok i={2} t="charged" />
      <AttTok i={3} t="twice" />
      <AttTok i={4} t="this" />
      <AttTok i={5} t="month" />
      <AttTok i={6} t="," />
      <AttTok i={7} t="please" />
      <AttTok i={8} t="fix" />
      <AttTok i={9} t="it" on />
      <AttTok i={10} t="." />
      <text x={1456} y={600} textAnchor="middle" fontSize={26} fill={C.muted}>updating this token</text>
      <text x={850} y={650} textAnchor="middle" fontSize={26} fill={C.muted}>
        weights are illustrative; the remaining 0.08 is spread over the other tokens. Nothing to the right of “it” is visible.
      </text>
    </svg>
  </Frame>
);

const Stack: Page = () => (
  <Frame
    part={2}
    title={`Step 4: repeat ${sci.layers} times`}
    line="Each block is attention followed by a small network. For our purpose, the output that matters is the vector at the last position."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <Box x={20} y={270} w={250} h={110} text="tokens" sub={`${sci.prompt_tokens} ids`} />
      <Arr x1={270} y1={325} x2={340} y2={325} />
      <Box x={350} y={270} w={250} h={110} text="embed" sub={`${sci.prompt_tokens} × ${sci.hidden}`} />
      <Arr x1={600} y1={325} x2={670} y2={325} />
      <rect x={720} y={230} width={420} height={150} rx={12} fill={C.panel} stroke={C.rule} strokeWidth={3} />
      <rect x={700} y={250} width={420} height={150} rx={12} fill={C.panel} stroke={C.rule} strokeWidth={3} />
      <rect x={680} y={270} width={420} height={150} rx={12} fill={C.white} stroke={C.s2} strokeWidth={3} />
      <text x={890} y={335} textAnchor="middle" fontSize={32} fill={C.s2} fontWeight={600}>attention → small network</text>
      <text x={890} y={385} textAnchor="middle" fontSize={26} fill={C.soft}>one block</text>
      <text x={930} y={205} textAnchor="middle" fontSize={32} fill={C.soft}>× {sci.layers} blocks</text>
      <Arr x1={1150} y1={325} x2={1230} y2={325} />
      <Box x={1240} y={270} w={420} h={110} text="last-position vector" sub={`${sci.hidden} numbers`} color={C.pred} />
      <text x={850} y={560} textAnchor="middle" fontSize={30} fill={C.soft}>
        {sci.params_M} M parameters in total · the prompt asking “which team?” is {sci.prompt_tokens} tokens long
      </text>
    </svg>
  </Frame>
);

const EDTok = ({ x, y, t, on }: { x: number; y: number; t: string; on?: boolean }) => (
  <g>
    <rect x={x} y={y} width={130} height={60} rx={10} fill={on ? C.panel : C.white} stroke={on ? C.ink : C.rule} strokeWidth={3} />
    <text x={x + 65} y={y + 40} textAnchor="middle" fontSize={28} fontFamily={mono}>{t}</text>
  </g>
);
const EDArc = ({ x1, x2, y, color }: { x1: number; x2: number; y: number; color: string }) => (
  <path d={`M${x1},${y} C${x1},${y - 90} ${x2},${y - 90} ${x2},${y}`} fill="none" stroke={color} strokeWidth={4} markerEnd="url(#ah)" />
);

const EncDec: Page = () => (
  <Frame
    part={2}
    title="Encoders and decoders: what a token can see"
    line="Chat models are decoders, so their output is the next token. This is why they write text one token at a time."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <text x={400} y={50} textAnchor="middle" fontSize={44} fontFamily="Georgia, serif" fontWeight={700} fill={C.truth}>Encoder</text>
      <text x={400} y={100} textAnchor="middle" fontSize={30} fill={C.soft}>a token sees both sides</text>
      <EDArc x1={115} x2={380} y={300} color={C.truth} />
      <EDArc x1={265} x2={390} y={300} color={C.truth} />
      <EDArc x1={555} x2={410} y={300} color={C.truth} />
      <EDArc x1={705} x2={420} y={300} color={C.truth} />
      <EDTok x={50} y={305} t="I" />
      <EDTok x={200} y={305} t="was" />
      <EDTok x={350} y={305} t="charged" on />
      <EDTok x={500} y={305} t="twice" />
      <EDTok x={650} y={305} t="." />
      <text x={400} y={450} textAnchor="middle" fontSize={32}>output: one vector per token</text>
      <text x={400} y={500} textAnchor="middle" fontSize={30} fill={C.soft}>BERT · used for classifying and search</text>

      <line x1={850} y1={20} x2={850} y2={540} stroke={C.rule} strokeWidth={3} />

      <text x={1300} y={50} textAnchor="middle" fontSize={44} fontFamily="Georgia, serif" fontWeight={700} fill={C.s2}>Decoder</text>
      <text x={1300} y={100} textAnchor="middle" fontSize={30} fill={C.soft}>a token sees only its left</text>
      <EDArc x1={1015} x2={1295} y={300} color={C.s2} />
      <EDArc x1={1165} x2={1305} y={300} color={C.s2} />
      <EDTok x={950} y={305} t="I" />
      <EDTok x={1100} y={305} t="was" />
      <EDTok x={1250} y={305} t="charged" on />
      <EDTok x={1400} y={305} t="twice" />
      <EDTok x={1550} y={305} t="." />
      <rect x={1395} y={300} width={290} height={70} fill="var(--osd-bg)" opacity={0.75} />
      <text x={1300} y={450} textAnchor="middle" fontSize={32}>output: the next token</text>
      <text x={1300} y={500} textAnchor="middle" fontSize={30} fill={C.soft}>GPT · Claude · Gemini · Qwen · Llama</text>
      <text x={850} y={620} textAnchor="middle" fontSize={28} fill={C.muted}>
        The original Transformer and T5 use both: an encoder reads the input, a decoder writes the output.
      </text>
    </svg>
  </Frame>
);

const Logits: Page = () => (
  <Frame
    part={2}
    title="Step 5: one score for every token in the vocabulary"
    line={`These raw scores are called logits. There are ${sci.vocab.toLocaleString('en-US')} of them, and each can be any real number.`}
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <Box x={20} y={270} w={420} h={110} text="last-position vector" sub={`${sci.hidden} numbers`} color={C.pred} />
      <Arr x1={440} y1={325} x2={560} y2={325} />
      <Box x={570} y={270} w={330} h={110} text="output layer" sub={`${sci.hidden} → ${sci.vocab.toLocaleString('en-US')}`} />
      <Arr x1={900} y1={325} x2={1020} y2={325} />
      <rect x={1030} y={60} width={620} height={540} rx={12} fill={C.white} stroke={C.rule} strokeWidth={3} />
      <text x={1070} y={125} fontSize={30} fontFamily={mono} fill={C.muted}>token        logit</text>
      <text x={1070} y={190} fontSize={32} fontFamily={mono}>"B"          {sci.letter_logits[1].toFixed(2)}</text>
      <text x={1070} y={245} fontSize={32} fontFamily={mono}>"A"          {sci.letter_logits[0].toFixed(2)}</text>
      <text x={1070} y={300} fontSize={32} fontFamily={mono}>"C"          {sci.letter_logits[2].toFixed(2)}</text>
      <text x={1070} y={370} fontSize={32} fontFamily={mono} fill={C.muted}>⋮</text>
      <text x={1070} y={440} fontSize={32} fontFamily={mono} fill={C.muted}>"␣month"      …</text>
      <text x={1070} y={495} fontSize={32} fontFamily={mono} fill={C.muted}>"charged"     …</text>
      <text x={1070} y={560} fontSize={28} fill={C.muted}>real logits for our “which team?” prompt</text>
    </svg>
  </Frame>
);

const SmCell = ({ children, color = C.ink, w }: { children: ReactNode; color?: string; w: number }) => (
  <div style={{ width: w, height: 84, fontFamily: mono, fontSize: 44, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </div>
);
const SmHead = ({ children, w }: { children: ReactNode; w: number }) => (
  <div style={{ width: w, height: 56, fontSize: 28, color: C.muted, textAlign: 'center' }}>{children}</div>
);

const Softmax: Page = () => (
  <Frame
    part={2}
    title="Step 6: softmax turns scores into probabilities"
    line="Exponentiating makes every score positive, and dividing by the total makes them sum to 1. A larger logit gets a larger probability."
  >
    <div style={{ ...row, gap: 30, alignItems: 'center', height: '100%' }}>
      <div style={{ width: 420 }}>
        <Eq size={50}>
          <I color={C.pred}>p</I>
          <sub style={{ fontSize: 30 }}>i</sub> ={' '}
          <Frac
            top={
              <span>
                e<sup style={{ fontSize: 30 }}>z<sub>i</sub></sup>
              </span>
            }
            bot={
              <span>
                Σ<sub style={{ fontSize: 26 }}>j</sub> e<sup style={{ fontSize: 30 }}>z<sub>j</sub></sup>
              </span>
            }
          />
        </Eq>
      </div>
      <div style={col}>
        <SmHead w={260}>logit z</SmHead>
        <SmCell w={260}>2.0</SmCell>
        <SmCell w={260}>1.0</SmCell>
        <SmCell w={260}>0.1</SmCell>
        <div style={{ height: 70 }} />
      </div>
      <Steps>
        <Step>
          <div style={col}>
            <SmHead w={340}>e to the power z</SmHead>
            <SmCell w={340} color={C.soft}>e<sup style={{ fontSize: 26 }}>2.0</sup> = 7.39</SmCell>
            <SmCell w={340} color={C.soft}>e<sup style={{ fontSize: 26 }}>1.0</sup> = 2.72</SmCell>
            <SmCell w={340} color={C.soft}>e<sup style={{ fontSize: 26 }}>0.1</sup> = 1.11</SmCell>
            <div style={{ height: 70, fontFamily: mono, fontSize: 23, whiteSpace: 'nowrap', color: C.soft, textAlign: 'center', borderTop: `3px solid ${C.rule}`, paddingTop: 12 }}>
              7.39 + 2.72 + 1.11 ≈ 11.21
            </div>
          </div>
        </Step>
        <Step>
          <div style={col}>
            <SmHead w={600}>divide by the total</SmHead>
            <SmCell w={600} color={C.pred}>7.39 / 11.21 = 0.66</SmCell>
            <SmCell w={600} color={C.pred}>2.72 / 11.21 = 0.24</SmCell>
            <SmCell w={600} color={C.pred}>1.11 / 11.21 = 0.10</SmCell>
            <div style={{ height: 70, fontFamily: mono, fontSize: 34, color: C.pred, textAlign: 'center', borderTop: `3px solid ${C.rule}`, paddingTop: 12 }}>
              sum 1.00
            </div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const NT = ({ i, dim }: { i: number; dim?: boolean }) => (
  <Bar label={`"${sci.next_tokens[i][0]}"`} p={sci.next_tokens[i][1] as number} max={0.5} width={900} mono dim={dim} />
);

const NextToken: Page = () => (
  <Frame
    part={2}
    title="The model’s next-token distribution for our prompt"
    line="One forward pass over the “which team?” prompt gives this distribution. These are the six most likely next tokens."
  >
    <div style={{ ...col, gap: 12, justifyContent: 'center', height: '100%' }}>
      <NT i={0} />
      <NT i={1} />
      <NT i={2} />
      <NT i={3} />
      <NT i={4} />
      <NT i={5} />
      <div style={{ fontSize: 28, color: C.muted, marginLeft: 320, marginTop: 14 }}>
        options in the prompt: A. billing · B. technical · C. sales
      </div>
    </div>
  </Frame>
);

const Loop: Page = () => (
  <Frame
    part={2}
    title="Step 7: pick a token, append it, run everything again"
    line="To write a full answer the model runs this loop once per token, so ten output tokens need ten forward passes."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <Box x={40} y={230} w={330} h={120} text="tokens so far" sub="prompt + what was written" />
      <Arr x1={370} y1={290} x2={470} y2={290} />
      <Box x={480} y={230} w={330} h={120} text="LLM" sub="one forward pass" color={C.s2} />
      <Arr x1={810} y1={290} x2={910} y2={290} />
      <Box x={920} y={230} w={330} h={120} text="distribution" sub="over the next token" color={C.pred} />
      <Arr x1={1250} y1={290} x2={1350} y2={290} />
      <Box x={1360} y={230} w={300} h={120} text="pick one" sub="the top one, or a sample" />
      <path d="M1510,350 L1510,520 L205,520 L205,362" fill="none" stroke={C.soft} strokeWidth={3} markerEnd="url(#ah)" />
      <text x={857} y={500} textAnchor="middle" fontSize={32} fill={C.soft}>append the new token</text>
      <text x={857} y={590} textAnchor="middle" fontSize={30} fill={C.muted}>stop when the model picks its end-of-answer token</text>
    </svg>
  </Frame>
);

const LoopCode: Page = () => (
  <Frame part={2} title="The loop in code" line="Text generation is this loop. A chatbot wraps a chat template and a sampling rule around it.">
    <div style={{ ...col, justifyContent: 'center', height: '100%' }}>
      <Code
        size={32}
        code={`
ids = tok(prompt, return_tensors="pt")["input_ids"]
while True:
    logits = model(ids).logits[0, -1]     # one full forward pass
    nxt = logits.argmax()                 # take the most likely token
    if nxt == end_token:
        break
    ids = torch.cat([ids, nxt.view(1, 1)], dim=1)   # append, go again
print(tok.decode(ids[0]))
`}
      />
    </div>
  </Frame>
);

const GEN = sci.generated_tokens as string[];
const show = (t: string) => t.replace(/ /g, '␣').replace(/\n/g, '⏎');

const Written: Page = () => (
  <Frame
    part={2}
    title="Our model writes its answer to the email"
    line={`Each box is one forward pass. The ${sci.n_generated} tokens of JSON needed ${sci.passes} passes, because the last pass is the one where the model picks its end token.`}
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <div style={{ width: 560, flexShrink: 0 }}>
        <Label>Asked for JSON with team, refund, urgency</Label>
        <div style={{ height: 14 }} />
        <Code size={34} code={sci.generated} />
      </div>
      <Steps>
        <Step>
          <div style={{ width: 1080 }}>
            <Label color={C.s2}>The same answer, one token per pass</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
              {GEN.map((t, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: mono, fontSize: 26, border: `2px solid ${C.s2}`, borderRadius: 8, padding: '6px 10px', background: C.white, minWidth: 44 }}>{show(t)}</div>
                  <div style={{ fontSize: 18, color: C.muted }}>{i + 1}</div>
                </div>
              ))}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: mono, fontSize: 26, border: `2px solid ${C.loss}`, borderRadius: 8, padding: '6px 10px', color: C.loss, background: C.white }}>stop</div>
                <div style={{ fontSize: 18, color: C.muted }}>{sci.passes}</div>
              </div>
            </div>
            <div style={{ fontFamily: mono, fontSize: 30, marginTop: 26, color: C.s2 }}>
              {sci.n_generated} tokens + 1 stop = {sci.passes} passes
            </div>
            <div style={{ fontFamily: mono, fontSize: 30, color: C.s2 }}>
              {sci.ms_generate} ms / {sci.passes} passes ≈ {Math.round(sci.ms_generate / sci.passes)} ms per pass
            </div>
            <div style={{ fontSize: 23, color: C.muted, marginTop: 8 }}>␣ is a space, ⏎ a new line · {sci.model.split('/')[1]} on a MacBook GPU</div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Sq = ({ n, color }: { n: number; color: string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: 1120 }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ width: 22, height: 22, borderRadius: 4, background: color }} />
    ))}
  </div>
);

const CoT: Page = () => (
  <Frame
    part={2}
    title="Reasoning models write even more before they answer"
    line="Chain of thought is how an LLM does System 2 work. It reasons in steps, and every step is more tokens to generate."
  >
    <div style={{ ...col, gap: 50, justifyContent: 'center', height: '100%' }}>
      <div style={{ ...row, gap: 40, alignItems: 'center' }}>
        <div style={{ width: 400, fontSize: 34 }}>
          answer only
          <div style={{ fontSize: 26, color: C.muted }}>{sci.n_generated} tokens (measured)</div>
        </div>
        <Sq n={sci.n_generated} color={C.s2} />
      </div>
      <Steps>
        <Step>
          <div style={{ ...row, gap: 40, alignItems: 'center' }}>
            <div style={{ width: 400, fontSize: 34 }}>
              think, then answer
              <div style={{ fontSize: 26, color: C.muted }}>300 tokens (illustrative)</div>
            </div>
            <Sq n={300} color={C.s2} />
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Cost = ({ n, head, body }: { n: string; head: string; body: string }) => (
  <Card style={{ flex: 1, padding: '34px 38px' }}>
    <div style={{ fontFamily: serif, fontSize: 84, fontWeight: 700, color: C.s2, lineHeight: 1 }}>{n}</div>
    <div style={{ fontSize: 40, fontWeight: 600, margin: '18px 0 14px' }}>{head}</div>
    <div style={{ fontSize: 32, lineHeight: 1.45, color: C.soft }}>{body}</div>
  </Card>
);

const ThreeCosts: Page = () => (
  <Frame
    part={2}
    title="For a quick decision, writing text has three costs"
    line="These costs are small when the model writes one essay. They add up when the same question is asked for every row of a table."
  >
    <div style={{ ...row, gap: 40, alignItems: 'stretch', marginTop: 40 }}>
      <Steps>
        <Step>
          <Cost n="1" head="Time" body="One forward pass per output token, plus any thinking tokens." />
        </Step>
        <Step>
          <Cost n="2" head="Loose output" body="Free text can break the JSON or name a team that is not on the list." />
        </Step>
        <Step>
          <Cost n="3" head="No confidence" body="We get one answer and no number for how sure the model was." />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const W = sci.written as unknown as {
  n: number;
  kinds: [string, number][];
  examples: Record<string, string>;
  usable: number;
  accuracy: number;
  mean_stated: number;
  stated_counts: [number, number][];
};
const kindN = (k: string) => (W.kinds.find((r) => r[0] === k) ?? [k, 0])[1];
const VOTES = sci.votes as unknown as [string, number][];
const N_VOTES = VOTES.reduce((a, v) => a + v[1], 0);
const HOURS = Math.round((sci.ms_generate * 1e6) / 3.6e6);

const CalcRow = ({ what, calc, result, color = C.ink }: { what: string; calc: string; result: string; color?: string }) => (
  <div style={{ ...row, alignItems: 'baseline', gap: 30, padding: '26px 0', borderBottom: `2px solid ${C.rule}` }}>
    <div style={{ width: 520, fontSize: 36, fontWeight: 600 }}>{what}</div>
    <div style={{ flex: 1, fontFamily: mono, fontSize: 32, color: C.soft }}>{calc}</div>
    <div style={{ fontFamily: serif, fontSize: 56, fontWeight: 700, color, whiteSpace: 'nowrap' }}>{result}</div>
  </div>
);

const CostTime: Page = () => (
  <Frame
    part={2}
    title="Cost 1: the time adds up over many rows"
    line={`On this laptop, sorting a million emails by writing JSON takes about ${HOURS} hours. Every extra output token adds one more forward pass per email.`}
  >
    <div style={{ ...col, justifyContent: 'center', height: '100%' }}>
      <CalcRow what="One email" calc={`${sci.n_generated} tokens + 1 stop = ${sci.passes} passes`} result={`${sci.ms_generate} ms`} color={C.s2} />
      <Steps>
        <Step>
          <CalcRow
            what="One million emails"
            calc={`${sci.ms_generate} ms × 1,000,000 = ${(sci.ms_generate * 1000).toLocaleString('en-US')} s`}
            result={`${HOURS} hours`}
            color={C.s2}
          />
        </Step>
        <Step>
          <CalcRow
            what="With 300 thinking tokens first"
            calc={`(300 + ${sci.passes}) / ${sci.passes} passes`}
            result={`${((300 + sci.passes) / sci.passes).toFixed(1)} times more`}
            color={C.loss}
          />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Raw = ({ label, text, bad }: { label: string; text: string; bad?: boolean }) => (
  <div>
    <div style={{ fontSize: 23, fontWeight: 600, color: bad ? C.loss : C.s1, marginBottom: 6 }}>{label}</div>
    <pre
      style={{
        margin: 0,
        padding: '14px 20px',
        height: 272,
        overflow: 'hidden',
        background: C.white,
        border: `2px solid ${C.rule}`,
        borderRadius: 'var(--osd-radius)',
        fontFamily: mono,
        fontSize: 22,
        lineHeight: 1.38,
        whiteSpace: 'pre-wrap',
        color: C.ink,
      }}
    >
      {text}
    </pre>
  </div>
);

const KindRow = ({ k, color }: { k: string; color: string }) => (
  <div style={{ ...row, alignItems: 'center', gap: 18, height: 66 }}>
    <div style={{ width: 70, fontFamily: mono, fontSize: 36, fontWeight: 700, color, textAlign: 'right' }}>{kindN(k)}</div>
    <div style={{ width: Math.max(6, (300 * kindN(k)) / W.n), height: 30, background: color, borderRadius: 5 }} />
    <div style={{ fontSize: 28 }}>{k}</div>
  </div>
);

const LooseOutput: Page = () => (
  <Frame
    part={2}
    title="Cost 2: the text does not always parse"
    line={`We asked for JSON with a topic and a confidence for ${W.n} news items. ${kindN('clean JSON')} answers parsed as they were, ${kindN('JSON inside other text')} needed digging out, and ${W.n - W.usable} could not be used.`}
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <div style={{ width: 600, flexShrink: 0 }}>
        <KindRow k="clean JSON" color={C.truth} />
        <KindRow k="JSON inside other text" color={C.s1} />
        <KindRow k="no JSON at all" color={C.loss} />
        <KindRow k="confidence not between 0 and 1" color={C.loss} />
        <KindRow k="topic not on the list" color={C.loss} />
        <div style={{ fontSize: 24, color: C.muted, marginTop: 16 }}>real outputs of our model · notebook 1</div>
      </div>
      <Steps>
        <Step>
          <div style={{ display: 'grid', gridTemplateColumns: '495px 495px', gap: '16px 20px' }}>
            <Raw label="JSON inside other text" text={W.examples['JSON inside other text']} />
            <Raw label="no JSON at all" text={W.examples['no JSON at all']} bad />
            <Raw label="confidence not between 0 and 1" text={W.examples['confidence not between 0 and 1']} bad />
            <Raw label="topic not on the list" text={W.examples['topic not on the list']} bad />
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Repairs: Page = () => (
  <Frame
    part={2}
    title="Using written output takes a parser and a fallback"
    line="Each fix is more code or more forward passes. Constrained decoding does guarantee valid JSON, but it still gives no probability."
  >
    <div style={{ ...row, gap: 40, alignItems: 'center', height: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <Code
          size={24}
          code={`
def parse(text):
    try:
        return json.loads(text)             # clean JSON
    except Exception:
        pass
    m = re.search(r"\\{.*?\\}", text, re.S)   # dig {...} out of the text
    try:
        d = json.loads(m.group(0))
    except Exception:
        return None                         # nothing usable
    if d.get("topic") not in TOPICS:
        return None                         # a topic we never offered
    return d
`}
        />
      </div>
      <Steps>
        <Step>
          <div style={{ ...col, gap: 18 }}>
            <Label>When parse returns None</Label>
            {[
              ['Retry', 'call the model again'],
              ['Repair', 'a second LLM call rewrites the output'],
              ['Judge', 'another LLM reads the text and decides'],
              ['Constrain', 'allow only tokens that keep the JSON valid'],
            ].map(([k, v]) => (
              <div key={k} style={{ ...row, gap: 20, fontSize: 29, lineHeight: 1.3, padding: '12px 0', borderBottom: `2px solid ${C.rule}`, width: 560 }}>
                <div style={{ width: 150, fontWeight: 700, flexShrink: 0 }}>{k}</div>
                <div style={{ color: C.soft }}>{v}</div>
              </div>
            ))}
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const StatedConf: Page = () => {
  const max = Math.max(...W.stated_counts.map((r) => r[1]));
  return (
    <Frame
      part={2}
      title="Cost 3: ask the model to write its confidence?"
      line={`On the ${W.usable} usable answers it never wrote less than ${W.stated_counts[0][0]}, and it was right ${pct(W.accuracy)} of the time. A written confidence is just more generated text.`}
    >
      <div style={{ ...row, gap: 70, alignItems: 'center', height: '100%' }}>
        <div style={{ width: 760 }}>
          <Label color={C.pred}>The confidence values it wrote</Label>
          <div style={{ ...col, marginTop: 14 }}>
            {W.stated_counts.map(([v, n]) => (
              <div key={v} style={{ ...row, alignItems: 'center', gap: 18, height: 64 }}>
                <div style={{ width: 90, fontFamily: mono, fontSize: 32, textAlign: 'right' }}>{v.toFixed(2)}</div>
                <div style={{ width: Math.max(4, (460 * n) / max), height: 34, background: C.pred, borderRadius: 5 }} />
                <div style={{ fontFamily: mono, fontSize: 28, color: C.pred }}>{n}</div>
              </div>
            ))}
          </div>
        </div>
        <Steps>
          <Step>
            <div style={{ ...row, gap: 70 }}>
              <Big value={f2(W.mean_stated)} label="mean written confidence" color={C.pred} />
              <Big value={f2(W.accuracy)} label="accuracy" color={C.truth} />
            </div>
          </Step>
        </Steps>
      </div>
    </Frame>
  );
};

const Voting: Page = () => (
  <Frame
    part={2}
    title="Cost 3: or sample the answer many times?"
    line={`Counting votes gives a rough probability, ${VOTES[0][1]}/${N_VOTES} = ${f2(VOTES[0][1] / N_VOTES)} for ${VOTES[0][0]} here. It costs ${N_VOTES} generations for one question.`}
  >
    <div style={{ ...col, gap: 40, justifyContent: 'center', height: '100%' }}>
      <div style={{ fontSize: 32, color: C.soft }}>
        “Which team should handle this email? Answer with one word.” Sampled {N_VOTES} times:
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, width: 1500 }}>
        {VOTES.flatMap(([word, n], k) =>
          Array.from({ length: n }, (_, i) => (
            <div
              key={`${word}${i}`}
              style={{ width: 132, height: 70, borderRadius: 10, background: k === 0 ? C.s2 : C.panel, border: `2px solid ${k === 0 ? C.s2 : C.rule}`, color: k === 0 ? C.white : C.ink, fontFamily: mono, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {word}
            </div>
          )),
        )}
      </div>
      <Steps>
        <Step>
          <div style={{ ...row, gap: 60, fontFamily: mono, fontSize: 38 }}>
            {VOTES.map(([word, n]) => (
              <div key={word}>
                {word} {n}/{N_VOTES} = <span style={{ color: C.pred }}>{f2(n / N_VOTES)}</span>
              </div>
            ))}
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const RecapItem = ({ children }: { children: ReactNode }) => (
  <div style={{ ...row, gap: 24, alignItems: 'baseline', fontSize: 38, lineHeight: 1.4 }}>
    <div style={{ width: 16, height: 16, borderRadius: 8, background: 'var(--osd-accent)', flexShrink: 0 }} />
    <div>{children}</div>
  </div>
);

const Recap2: Page = () => (
  <Frame part={2} title="Where we are" line="Next: for a quick decision we can skip the loop.">
    <div style={{ ...col, gap: 34, marginTop: 50 }}>
      <RecapItem>Text becomes tokens, tokens become vectors, attention mixes them.</RecapItem>
      <RecapItem>One forward pass ends in one distribution over the next token.</RecapItem>
      <RecapItem>Writing an answer repeats that pass once per token.</RecapItem>
      <RecapItem>A written answer does not tell us how sure the model was.</RecapItem>
    </div>
  </Frame>
);

// ---------------------------------------------------------------- part 3

const S3: Page = () => (
  <SectionPage
    n={3}
    goal="If the question has a fixed list of answers, do we need the model to write anything at all?"
    how="Go back to the first distribution, keep only the options, and read the probabilities straight off it."
  />
);

const LookAgain: Page = () => (
  <Frame
    part={3}
    title="Look again at the first distribution"
    line="Before it wrote any token, the model had already given A and B nearly equal probability."
  >
    <div style={{ ...col, gap: 12, justifyContent: 'center', height: '100%' }}>
      <NT i={0} />
      <NT i={1} />
      <NT i={2} dim />
      <NT i={3} dim />
      <NT i={4} />
      <NT i={5} dim />
      <div style={{ fontSize: 28, color: C.muted, marginLeft: 320, marginTop: 14 }}>
        A. billing · B. technical · C. sales
      </div>
    </div>
  </Frame>
);

const RHead = ({ children, w, left }: { children: ReactNode; w: number; left?: boolean }) => (
  <div style={{ width: w, height: 64, padding: '0 30px', fontSize: 28, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: left ? 'flex-start' : 'flex-end', borderBottom: `3px solid ${C.rule}`, whiteSpace: 'nowrap' }}>
    {children}
  </div>
);
const RCell = ({ children, w, color = C.ink, left }: { children: ReactNode; w: number; color?: string; left?: boolean }) => (
  <div style={{ width: w, height: 92, padding: '0 30px', fontFamily: mono, fontSize: 38, color, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: left ? 'flex-start' : 'flex-end', borderBottom: `2px solid ${C.rule}` }}>
    {children}
  </div>
);

const Readout: Page = () => (
  <Frame
    part={3}
    title="Keep the option letters, renormalise"
    line="This is the same softmax, applied to three logits. Subtracting the largest logit first does not change the result and keeps the numbers small."
  >
    <div style={{ ...row, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={col}>
        <RHead w={360} left>option</RHead>
        <RCell w={360} left>A  billing</RCell>
        <RCell w={360} left>B  technical</RCell>
        <RCell w={360} left>C  sales</RCell>
      </div>
      <div style={col}>
        <RHead w={220}>logit</RHead>
        <RCell w={220}>{sci.letter_logits[0].toFixed(2)}</RCell>
        <RCell w={220}>{sci.letter_logits[1].toFixed(2)}</RCell>
        <RCell w={220}>{sci.letter_logits[2].toFixed(2)}</RCell>
      </div>
      <Steps>
        <Step>
          <div style={col}>
            <RHead w={270}>minus {sci.letter_logits[1].toFixed(2)}</RHead>
            <RCell w={270} color={C.soft}>−0.07</RCell>
            <RCell w={270} color={C.soft}>0.00</RCell>
            <RCell w={270} color={C.soft}>−3.93</RCell>
          </div>
        </Step>
        <Step>
          <div style={col}>
            <RHead w={290}>e to that power</RHead>
            <RCell w={290} color={C.soft}>0.94</RCell>
            <RCell w={290} color={C.soft}>1.00</RCell>
            <RCell w={290} color={C.soft}>0.02</RCell>
          </div>
        </Step>
        <Step>
          <div style={col}>
            <RHead w={500}>divide by the total, 1.96</RHead>
            <RCell w={500} color={C.pred}>0.94 / 1.96 = {f2(sci.p_team[0])}</RCell>
            <RCell w={500} color={C.pred}>1.00 / 1.96 = {f2(sci.p_team[1])}</RCell>
            <RCell w={500} color={C.pred}>0.02 / 1.96 = {f2(sci.p_team[2])}</RCell>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const DecideCode: Page = () => (
  <Frame
    part={3}
    title="Reading a decision, in code"
    line="The function has no loop and generates no text. One forward pass returns one probability per option."
  >
    <div style={{ ...col, justifyContent: 'center', height: '100%' }}>
      <Code
        size={31}
        hl={[4, 5]}
        code={`
letter_ids = [tok.encode(c)[0] for c in "ABCDEFGH"]   # one token per letter

def decide(state, question, options):
    x = tok(prompt(state, question, options), return_tensors="pt")
    logits = model(**x).logits[0, -1]                # one forward pass
    option_logits = logits[letter_ids[:len(options)]] # keep only the options
    return option_logits.softmax(-1)                 # renormalise

decide(email, "Which team should handle this email?", teams)
# tensor([${sci.p_team.map((v: number) => v.toFixed(2)).join(', ')}])
`}
      />
    </div>
  </Frame>
);

const TimeBar = ({ label, ms, passes, color }: { label: string; ms: number; passes: string; color: string }) => (
  <div style={{ ...row, alignItems: 'center', gap: 30, height: 130 }}>
    <div style={{ width: 360, fontSize: 40, fontWeight: 600, color }}>{label}</div>
    <div style={{ width: (780 * ms) / sci.ms_generate, height: 70, background: color, borderRadius: 8 }} />
    <div style={{ fontSize: 40, fontFamily: mono, color, whiteSpace: 'nowrap' }}>
      {ms} ms <span style={{ color: C.muted, fontSize: 30 }}>· {passes}</span>
    </div>
  </div>
);

const Timing: Page = () => (
  <Frame
    part={3}
    title="Writing versus reading on the same model"
    line={`Reading is about ${(sci.ms_generate / sci.ms_one_pass).toFixed(1)} times faster here, even with a tiny model and a short answer. Longer written answers widen the gap.`}
  >
    <div style={{ ...col, justifyContent: 'center', height: '100%' }}>
      <TimeBar label="write the JSON" ms={sci.ms_generate} passes={`${sci.passes} passes`} color={C.s2} />
      <Steps>
        <Step>
          <TimeBar label="read one answer" ms={sci.ms_one_pass} passes="1 pass" color={C.s1} />
        </Step>
      </Steps>
      <Steps>
        <Step>
          <div style={{ fontFamily: mono, fontSize: 36, marginTop: 20 }}>
            {sci.ms_generate} ms / {sci.ms_one_pass} ms = <b>{(sci.ms_generate / sci.ms_one_pass).toFixed(1)}</b> times faster
          </div>
        </Step>
      </Steps>
      <div style={{ fontSize: 26, color: C.muted, marginTop: 20 }}>
        median of 5 runs · {sci.model.split('/')[1]} on a MacBook GPU · notebook 1 reproduces this
      </div>
    </div>
  </Frame>
);

// One drawing used in Part 3 and again in Part 5, so the three designs always look the same.
type ArchProps = { opts: string[]; written: string; readout: string; head: string; dimFirst?: boolean; notes: [string, string][] };

const Strip = ({ x, y, keep, color }: { x: number; y: number; keep: number; color: string }) => {
  const n = 38;
  const w = 380 / n;
  // the kept cells are spread out, since the letter tokens sit at scattered places in the vocabulary
  const picks = Array.from({ length: keep }, (_, k) => Math.round(((k + 1) * n) / (keep + 1.4)));
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * w} y={y} width={w - 1.5} height={46} fill={picks.includes(i) ? color : C.rule} />
      ))}
    </g>
  );
};

const ArchOne = ({ x, kind, opts, top, sub, notes, dim }: { x: number; kind: 0 | 1 | 2; opts: string[]; top: string; sub: string; notes: [string, string]; dim?: boolean }) => {
  const color = [C.s2, C.s1, C.pred][kind];
  const name = ['Chat LLM', 'Letter readout', 'Decision model'][kind];
  const k = opts.length;
  return (
    <g transform={`translate(${x} 0)`} opacity={dim ? 0.35 : 1}>
      <text x={250} y={34} textAnchor="middle" fontSize={36} fontFamily="Georgia, serif" fontWeight={700} fill={color}>{name}</text>
      <Box x={60} y={54} w={380} h={92} text={top} sub={sub} color={color} size={27} />
      <Arr x1={250} y1={196} x2={250} y2={150} />
      {kind < 2 ? (
        <g>
          <Strip x={60} y={200} keep={kind === 1 ? k : 0} color={color} />
          <text x={250} y={274} textAnchor="middle" fontSize={23} fill={C.soft}>
            output layer: {sci.vocab.toLocaleString('en-US')} scores{kind === 1 ? `, ${k} kept` : ''}
          </text>
        </g>
      ) : (
        <g>
          {opts.map((o, i) => (
            <g key={o}>
              <rect x={250 - (k * 92) / 2 + i * 92} y={200} width={86} height={46} rx={6} fill={color} />
              <text x={250 - (k * 92) / 2 + i * 92 + 43} y={231} textAnchor="middle" fontSize={19} fill={C.white} fontWeight={600}>{o}</text>
            </g>
          ))}
          <text x={250} y={274} textAnchor="middle" fontSize={23} fill={color} fontWeight={600}>decision head: {k} scores, nothing else</text>
        </g>
      )}
      <Arr x1={250} y1={330} x2={250} y2={290} />
      <rect x={80} y={334} width={340} height={104} rx={12} fill={C.panel} stroke={C.ink} strokeWidth={3} />
      <text x={250} y={380} textAnchor="middle" fontSize={28} fontWeight={600} fill={C.ink}>transformer blocks</text>
      <text x={250} y={416} textAnchor="middle" fontSize={22} fill={C.soft}>{sci.layers} layers · the same in all three</text>
      <Arr x1={250} y1={482} x2={250} y2={442} />
      <Box x={110} y={486} w={280} h={56} text="input tokens" size={24} />
      {kind === 0 ? (
        <g>
          <path d="M440,100 L486,100 L486,514 L396,514" fill="none" stroke={C.loss} strokeWidth={4} markerEnd="url(#ah)" />
          <text transform="translate(512 300) rotate(90)" textAnchor="middle" fontSize={22} fill={C.loss}>append the token, run again</text>
        </g>
      ) : (
        <text x={468} y={306} textAnchor="middle" fontSize={22} fill={C.truth} fontWeight={600}>no loop</text>
      )}
      <text x={250} y={592} textAnchor="middle" fontSize={24} fontWeight={600} fill={color}>{notes[0]}</text>
      <text x={250} y={626} textAnchor="middle" fontSize={23} fill={C.soft}>{notes[1]}</text>
    </g>
  );
};

const ArchFig = ({ opts, written, readout, head, dimFirst, notes }: ArchProps) => (
  <svg width={1700} height={690} viewBox="0 0 1700 690">
    <Arrows />
    <ArchOne x={20} kind={0} opts={opts} top="writes text" sub={written} notes={notes[0]} dim={dimFirst} />
    <line x1={572} y1={10} x2={572} y2={650} stroke={C.rule} strokeWidth={3} />
    <ArchOne x={590} kind={1} opts={opts} top={`softmax over the ${opts.length} kept`} sub={readout} notes={notes[1]} />
    <line x1={1128} y1={10} x2={1128} y2={650} stroke={C.rule} strokeWidth={3} />
    <ArchOne x={1160} kind={2} opts={opts} top={`softmax over the ${opts.length}`} sub={head} notes={notes[2]} />
  </svg>
);

const ArchDiff: Page = () => (
  <Frame
    part={3}
    title="What changed inside the model"
    line={`All three share the transformer blocks. The readout keeps 3 of the output layer’s ${sci.vocab.toLocaleString('en-US')} scores and trains nothing. A decision model replaces that layer with a small trained head.`}
  >
    <ArchFig
      opts={['billing', 'technical', 'sales']}
      written={'"team": "billing"'}
      readout={`${f2(sci.p_team[0])} · ${f2(sci.p_team[1])} · ${f2(sci.p_team[2])}`}
      head="one probability per option"
      notes={[
        [`${sci.passes} passes for one answer`, 'trained to write the next token'],
        ['1 pass · nothing new is trained', 'we only choose which scores to read'],
        ['1 pass · the head is trained', 'built in Part 5'],
      ]}
    />
  </Frame>
);

const Honest: Page = () => (
  <Frame
    part={3}
    title="The probabilities show doubt that the text hid"
    line="The written answer looked certain, but the probabilities are almost equal for billing and technical. A program can see that and act on it."
  >
    <div style={{ ...row, gap: 70, alignItems: 'center', height: '100%' }}>
      <Card color={C.s2} style={{ width: 620 }}>
        <Label color={C.s2}>The model wrote</Label>
        <div style={{ fontFamily: mono, fontSize: 44, marginTop: 24 }}>"team": "billing"</div>
        <div style={{ fontSize: 30, color: C.soft, marginTop: 20 }}>no sign of doubt</div>
      </Card>
      <Steps>
        <Step>
          <Card color={C.s1} style={{ width: 1000 }}>
            <Label color={C.s1}>The model’s probabilities</Label>
            <div style={{ ...col, marginTop: 16 }}>
              <Bar label="billing" p={sci.p_team[0]} width={480} />
              <Bar label="technical" p={sci.p_team[1]} width={480} />
              <Bar label="sales" p={sci.p_team[2]} width={480} />
            </div>
          </Card>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const TypeCard = ({ name, what, children }: { name: string; what: string; children: ReactNode }) => (
  <Card style={{ flex: 1, padding: '28px 30px' }}>
    <div style={{ fontFamily: mono, fontSize: 44, fontWeight: 700, color: C.s1 }}>{name}</div>
    <div style={{ fontSize: 30, color: C.soft, margin: '8px 0 22px', height: 84 }}>{what}</div>
    {children}
  </Card>
);
const Mini = ({ label, p }: { label: string; p: number }) => (
  <div style={{ ...row, alignItems: 'center', gap: 14, height: 54 }}>
    <div style={{ width: 170, fontSize: 28, textAlign: 'right' }}>{label}</div>
    <div style={{ width: 200, height: 30, background: C.panel, borderRadius: 5 }}>
      <div style={{ width: Math.max(3, 200 * p), height: 30, background: C.pred, borderRadius: 5 }} />
    </div>
    <div style={{ fontSize: 28, fontFamily: mono, color: C.pred }}>{f2(p)}</div>
  </div>
);

const Types: Page = () => (
  <Frame
    part={3}
    title="Three question types, all read the same way"
    line="Jev and similar decision models support these three question types. The numbers are our small model’s answers for the email."
  >
    <div style={{ ...row, gap: 34, alignItems: 'stretch', marginTop: 20 }}>
      <TypeCard name="choice" what="one option from a list: a probability for each">
        <Mini label="billing" p={sci.p_team[0]} />
        <Mini label="technical" p={sci.p_team[1]} />
        <Mini label="sales" p={sci.p_team[2]} />
      </TypeCard>
      <Steps>
        <Step>
          <TypeCard name="noul" what="yes or no: the probability of yes">
            <Mini label="refund?" p={sci.p_refund_yes} />
            <div style={{ fontSize: 26, color: C.muted, marginTop: 16 }}>the type’s name in Jev’s API</div>
          </TypeCard>
        </Step>
        <Step>
          <TypeCard name="score" what="ordered levels: a probability for each level">
            <Mini label="not urgent" p={sci.p_urgency[0]} />
            <Mini label="soon" p={sci.p_urgency[1]} />
            <Mini label="today" p={sci.p_urgency[2]} />
          </TypeCard>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const ScoreCalc: Page = () => (
  <Frame
    part={3}
    title="A score is the probability-weighted level"
    line="The levels are numbered 0, 1 and 2. Our untrained model rates this email “not urgent”, which is a poor answer. Part 5 shows how training improves such answers."
  >
    <div style={{ ...col, gap: 50, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ fontFamily: mono, fontSize: 40, color: C.soft }}>
        not urgent = 0 · soon = 1 · today = 2
      </div>
      <Eq size={64}>
        0 × <span style={{ color: C.pred }}>{f2(sci.p_urgency[0])}</span> + 1 × <span style={{ color: C.pred }}>{f2(sci.p_urgency[1])}</span> + 2 ×{' '}
        <span style={{ color: C.pred }}>{f2(sci.p_urgency[2])}</span>
        <Steps>
          <Step>
            <div style={{ marginTop: 30 }}>
              = 0 + {f2(sci.p_urgency[1])} + {f2(2 * Number(f2(sci.p_urgency[2])))} = <b>{f2(sci.p_urgency[1] + 2 * sci.p_urgency[2])}</b>
            </div>
          </Step>
        </Steps>
      </Eq>
    </div>
  </Frame>
);

const Request: Page = () => (
  <Frame
    part={3}
    title="One request: a state and its questions"
    line="All the questions go in one request and all the answers come back in one response, since the model writes nothing in between."
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <Code
          size={27}
          code={`
{
  "state": "${EMAIL}",
  "questions": {
    "team":    {"type": "choice",
                "instructions": "Which team should handle this?",
                "criteria": {"billing": "...", "technical": "...", "sales": "..."}},
    "refund":  {"type": "noul",
                "instructions": "Does the customer ask for a refund?"},
    "urgency": {"type": "score",
                "instructions": "How urgent is this?",
                "criteria": ["not urgent", "soon", "today"]}
  }
}
`}
        />
      </div>
    </div>
  </Frame>
);

const Response: Page = () => (
  <Frame
    part={3}
    title="One response: an answer for every question"
    line="The response has no generated text. Each question gets its typed answer and the probabilities behind it, and the count of output tokens is zero."
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <Code
          size={27}
          code={`
{
  "answers": {
    "team":    {"choice": "technical",
                "probabilities": {"billing": ${f2(sci.p_team[0])}, "technical": ${f2(sci.p_team[1])},
                                  "sales": ${f2(sci.p_team[2])}}},
    "refund":  {"noul": ${f2(sci.p_refund_yes)}},
    "urgency": {"score": ${f2(sci.p_urgency[1] + 2 * sci.p_urgency[2])},
                "probabilities": {"0": ${f2(sci.p_urgency[0])}, "1": ${f2(sci.p_urgency[1])}, "2": ${f2(sci.p_urgency[2])}}}
  },
  "usage": {"output_tokens": 0}
}
`}
        />
      </div>
      <Steps>
        <Step>
          <div style={{ fontSize: 29, lineHeight: 1.45, color: C.soft }}>
            The numbers are our small model’s answers for the email, laid out in the response format that Jev and Liquid document.
            <div style={{ marginTop: 18, color: C.ink }}>A program reads <span style={{ fontFamily: mono }}>answers.refund.noul</span> and compares it with a threshold. It never parses a sentence.</div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Fact = ({ k, v }: { k: string; v: string }) => (
  <div style={{ ...row, gap: 30, fontSize: 32, lineHeight: 1.4, padding: '11px 0', borderBottom: `2px solid ${C.rule}` }}>
    <div style={{ width: 250, color: C.muted, flexShrink: 0 }}>{k}</div>
    <div style={{ flex: 1 }}>{v}</div>
  </div>
);

const MULTI = sci.multi as unknown as [string, number][];

const MoreTypes: Page = () => (
  <Frame
    part={3}
    title="The same readout covers some newer answer types"
    line={`Multi-select is one yes or no question per option. A number is a choice over candidate values. Our untrained model gets the count wrong: the email says twice.`}
  >
    <div style={{ ...row, gap: 34, alignItems: 'stretch', marginTop: 20 }}>
      <div style={{ width: 544, display: 'flex' }}>
        <TypeCard name="choice, multiple" what="a yes or no question per option; keep those at 0.5 or more">
          {MULTI.map(([label, v]) => (
            <div key={label} style={{ ...row, alignItems: 'center', gap: 14, height: 54 }}>
              <div style={{ width: 215, fontSize: 27, textAlign: 'right', whiteSpace: 'nowrap' }}>{label.replace(/^a /, '')}</div>
              <div style={{ width: 150, height: 30, background: C.panel, borderRadius: 5 }}>
                <div style={{ width: 150 * v, height: 30, background: C.pred, borderRadius: 5 }} />
              </div>
              <div style={{ fontSize: 28, fontFamily: mono, color: C.pred }}>{f2(v)}</div>
            </div>
          ))}
          <div style={{ fontSize: 24, color: C.muted, marginTop: 14 }}>these need not sum to 1</div>
        </TypeCard>
      </div>
      <Steps>
        <Step>
          <div style={{ width: 544, display: 'flex', height: '100%' }}>
          <TypeCard name="number, range" what="“How many times was the customer charged?” Options 0 to 5">
            <div style={{ ...row, alignItems: 'flex-end', gap: 14, height: 170, marginLeft: 10 }}>
              {sci.count.p.map((v: number, i: number) => (
                <div key={i} style={{ textAlign: 'center', width: 68 }}>
                  <div style={{ fontFamily: mono, fontSize: 20, color: C.pred }}>{f2(v)}</div>
                  <div style={{ height: Math.max(3, 110 * v), background: C.pred, borderRadius: 4, margin: '4px 6px' }} />
                  <div style={{ fontFamily: mono, fontSize: 26 }}>{sci.count.options[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 26, marginTop: 14 }}>
              median <b>{sci.count.median}</b>, 10% to 90% interval [{sci.count.interval[0]}, {sci.count.interval[1]}]
            </div>
          </TypeCard>
          </div>
        </Step>
        <Step>
          <div style={{ width: 544, display: 'flex', height: '100%' }}>
          <TypeCard name="text, spans, box" what="answers that point into the input">
            <div style={{ fontSize: 28, lineHeight: 1.45, color: C.soft }}>
              Option letters cannot give a position in a text or a rectangle in a picture. These types need a head trained to score
              positions, which we do not build in this lecture.
            </div>
          </TypeCard>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const ModelRow = ({ name, by, access, what }: { name: string; by: string; access: string; what: string }) => (
  <div style={{ ...row, gap: 24, fontSize: 29, lineHeight: 1.3, padding: '15px 0', borderBottom: `2px solid ${C.rule}`, alignItems: 'baseline' }}>
    <div style={{ width: 330, fontWeight: 700, flexShrink: 0 }}>{name}</div>
    <div style={{ width: 210, color: C.soft, flexShrink: 0 }}>{by}</div>
    <div style={{ width: 330, color: C.s1, flexShrink: 0 }}>{access}</div>
    <div style={{ flex: 1, color: C.soft }}>{what}</div>
  </div>
);

const Jev: Page = () => (
  <Frame
    part={3}
    title="Jev came first, and more decision models have followed"
    line="Jev’s architecture, size and training method are unpublished. We read letter logits from an open model so that every step can be inspected."
  >
    <div style={{ ...col, marginTop: 4 }}>
      <ModelRow name="Jev" by="TypeSafe AI" access="hosted · September 2026" what="noul, choice and score on text; $0.042 per million input tokens" />
      <Steps>
        <Step>
          <ModelRow name="d1.2 and d1.2-ultra" by="Liquid AI" access="hosted · November 2026" what="text, images and audio; five more answer types" />
          <ModelRow name="d1-2B and d1-omni" by="Liquid AI" access="open weights" what="the earlier d1 models, which can be run locally" />
        </Step>
        <Step>
          <ModelRow name="FastDecisionModel" by="Unsloth" access="train your own" what="LoRA and a decision head on an open LLM; Part 5 and notebook 3" />
        </Step>
        <Step>
          <div style={{ fontSize: 27, lineHeight: 1.45, color: C.soft, marginTop: 22 }}>
            Also named in November 2026 roundups, and not checked by us: Perplexity Decider, OpenAI’s Decisions API, Microsoft Decision-1,
            AWS Strands Decider and Cloudflare Clef. Artificial Analysis publishes a Decision Index that ranks these models.
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Recap3: Page = () => (
  <Frame part={3} title="Where we are" line="Next: we can use a probability only if it matches how often the model is right. How do we check that?">
    <div style={{ ...col, gap: 34, marginTop: 50 }}>
      <RecapItem>For a question with listed answers, one forward pass is enough.</RecapItem>
      <RecapItem>Keep the option logits, apply softmax, get a probability per option.</RecapItem>
      <RecapItem>Choice, noul and score questions are all read this way.</RecapItem>
      <RecapItem>Our model said technical with {f2(sci.p_team[1])}. Should a program believe that number?</RecapItem>
    </div>
  </Frame>
);

// ---------------------------------------------------------------- part 4

type Bin = { conf: number | null; acc: number | null; n: number };

const Reliability = ({
  bins,
  size = 560,
  gaps = true,
  title,
  counts = false,
}: {
  bins: Bin[];
  size?: number;
  gaps?: boolean;
  title?: string;
  counts?: boolean;
}) => {
  const m = 90;
  const X = (v: number) => m + v * size;
  const Y = (v: number) => 40 + (1 - v) * size;
  const pts = bins.filter((b) => b.n > 0 && b.conf !== null && b.acc !== null) as { conf: number; acc: number; n: number }[];
  const nmax = Math.max(...pts.map((b) => b.n));
  return (
    <svg width={size + m + 40} height={size + 180} viewBox={`0 0 ${size + m + 40} ${size + 180}`}>
      <rect x={X(0)} y={Y(1)} width={size} height={size} fill={C.white} stroke={C.rule} strokeWidth={3} />
      <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke={C.muted} strokeWidth={3} strokeDasharray="10 8" />
      {[0, 0.5, 1].map((v) => (
        <g key={v}>
          <text x={X(v)} y={Y(0) + 36} textAnchor="middle" fontSize={26} fill={C.soft}>{v.toFixed(1)}</text>
          <text x={X(0) - 16} y={Y(v) + 9} textAnchor="end" fontSize={26} fill={C.soft}>{v.toFixed(1)}</text>
        </g>
      ))}
      <text x={X(0.5)} y={Y(0) + 78} textAnchor="middle" fontSize={28} fill={C.pred}>confidence (what the model said)</text>
      <text transform={`translate(26 ${Y(0.5)}) rotate(-90)`} textAnchor="middle" fontSize={28} fill={C.truth}>accuracy (what happened)</text>
      {gaps &&
        pts.map((b, i) => (
          <line key={`g${i}`} x1={X(b.conf)} y1={Y(b.acc)} x2={X(b.conf)} y2={Y(b.conf)} stroke={C.loss} strokeWidth={7} />
        ))}
      <polyline points={pts.map((b) => `${X(b.conf)},${Y(b.acc)}`).join(' ')} fill="none" stroke={C.ink} strokeWidth={3} />
      {pts.map((b, i) => (
        <g key={`p${i}`}>
          <circle cx={X(b.conf)} cy={Y(b.acc)} r={8 + 14 * Math.sqrt(b.n / nmax)} fill={C.ink} />
          {counts && (
            <text x={X(b.conf) - 22} y={Y(b.acc) - 26} textAnchor="end" fontSize={24} fill={C.soft}>{b.n}</text>
          )}
        </g>
      ))}
      {title && (
        <text x={X(0.5)} y={Y(0) + 122} textAnchor="middle" fontSize={30} fontWeight={600} fill={C.ink}>{title}</text>
      )}
    </svg>
  );
};

const S4: Page = () => (
  <SectionPage
    n={4}
    goal="The model says 0.8. What would have to be true for us to act on that number?"
    how="A weather forecaster first, then ten predictions binned by hand, the reliability diagram and ECE. After that we test our own model and fix its confidence with one parameter."
  />
);

const Day = ({ i, rain }: { i: number; rain: boolean }) => (
  <g>
    <circle cx={110 + i * 165} cy={200} r={62} fill={rain ? C.truth : C.white} stroke={rain ? C.truth : C.rule} strokeWidth={4} />
    <text x={110 + i * 165} y={214} textAnchor="middle" fontSize={34} fill={rain ? C.white : C.muted} fontWeight={600}>
      {rain ? 'rain' : 'dry'}
    </text>
  </g>
);
const DaySaid = ({ i }: { i: number }) => (
  <text x={110 + i * 165} y={90} textAnchor="middle" fontSize={34} fill={C.pred} fontFamily={mono}>80%</text>
);

const Forecaster: Page = () => (
  <Frame
    part={4}
    title="A forecaster says “80% chance of rain” on ten days"
    line="It rained on 8 of the 10 days, which matches the 80% she said. A forecaster like this is called calibrated."
  >
    <div style={{ position: 'relative', width: 1700, height: 690 }}>
      <svg width={1700} height={690} viewBox="0 0 1700 690" style={{ position: 'absolute', inset: 0 }}>
        <DaySaid i={0} /><DaySaid i={1} /><DaySaid i={2} /><DaySaid i={3} /><DaySaid i={4} />
        <DaySaid i={5} /><DaySaid i={6} /><DaySaid i={7} /><DaySaid i={8} /><DaySaid i={9} />
        <text x={850} y={400} textAnchor="middle" fontSize={36} fill={C.soft}>What should happen on these ten days, if we are to trust her?</text>
      </svg>
      <Steps>
        <Step>
          <svg width={1700} height={690} viewBox="0 0 1700 690" style={{ position: 'absolute', inset: 0 }}>
            <Day i={0} rain /><Day i={1} rain /><Day i={2} rain={false} /><Day i={3} rain /><Day i={4} rain />
            <Day i={5} rain /><Day i={6} rain /><Day i={7} rain={false} /><Day i={8} rain /><Day i={9} rain />
            <text x={850} y={520} textAnchor="middle" fontSize={56} fontFamily="Georgia, serif">
              <tspan fill={C.truth}>8 of 10 = 0.8</tspan>
              <tspan fill={C.soft}> matches </tspan>
              <tspan fill={C.pred}>0.8</tspan>
            </text>
          </svg>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Definition: Page = () => (
  <Frame part={4} title="Calibration: the definition" line="The definition applies to a group of predictions. We cannot say whether a single prediction is calibrated.">
    <div style={{ ...col, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <p style={{ fontFamily: serif, fontSize: 68, lineHeight: 1.35, textAlign: 'center', maxWidth: 1500, margin: 0 }}>
        Among all the answers given with <span style={{ color: C.pred }}>probability p</span>, a{' '}
        <span style={{ color: C.truth }}>fraction p</span> are correct.
      </p>
      <Steps>
        <Step>
          <div style={{ fontFamily: mono, fontSize: 38, marginTop: 60, textAlign: 'center', lineHeight: 1.6 }}>
            <div style={{ fontFamily: 'var(--osd-font-body)', fontSize: 32, color: C.soft }}>Example: the model gives 200 answers with probability 0.8.</div>
            <span style={{ color: C.pred }}>0.8</span> × 200 = <span style={{ color: C.truth }}>160</span> of them should be correct
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const TOYC = [0.95, 0.9, 0.9, 0.9, 0.85, 0.75, 0.7, 0.65, 0.55, 0.45];
const TOYY = [1, 1, 1, 0, 0, 1, 1, 0, 1, 0];

const ToyCell = ({ i, w = 136 }: { i: number; w?: number }) => (
  <div style={{ width: w, ...col, alignItems: 'center', gap: 14 }}>
    <div style={{ fontFamily: mono, fontSize: w < 110 ? 31 : 38, color: C.pred }}>{TOYC[i].toFixed(2)}</div>
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        background: TOYY[i] ? C.truth : C.white,
        border: `4px solid ${TOYY[i] ? C.truth : C.muted}`,
        color: TOYY[i] ? C.white : C.muted,
        fontSize: 36,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {TOYY[i] ? '✓' : '✗'}
    </div>
  </div>
);

const ToyTable: Page = () => (
  <Frame
    part={4}
    title="Ten predictions from a model"
    line="These numbers are made up, and few enough to check by hand. Each prediction has a confidence and an outcome."
  >
    <div style={{ ...col, justifyContent: 'center', height: '100%', gap: 30 }}>
      <div style={{ ...row, alignItems: 'center' }}>
        <div style={{ width: 280, fontSize: 30, ...col, gap: 46 }}>
          <span style={{ color: C.pred }}>confidence</span>
          <span style={{ color: C.truth }}>was it right?</span>
        </div>
        <ToyCell i={0} /><ToyCell i={1} /><ToyCell i={2} /><ToyCell i={3} /><ToyCell i={4} />
        <ToyCell i={5} /><ToyCell i={6} /><ToyCell i={7} /><ToyCell i={8} /><ToyCell i={9} />
      </div>
    </div>
  </Frame>
);

const CalcLine = ({ label, calc, color }: { label: string; calc: string; color: string }) => (
  <div style={{ marginTop: 12 }}>
    <div style={{ fontSize: 22, color: C.muted }}>{label}</div>
    <div style={{ fontFamily: mono, fontSize: 24, color, whiteSpace: 'nowrap' }}>{calc}</div>
  </div>
);
const BinCard = ({ range, children, conf, acc, gap }: { range: string; children: ReactNode; conf: string; acc: string; gap: string }) => (
  <Card style={{ padding: '20px 22px', width: 548 }}>
    <div style={{ fontFamily: mono, fontSize: 30, color: C.soft }}>bin {range}</div>
    <div style={{ ...row, justifyContent: 'center', margin: '14px 0 8px' }}>{children}</div>
    <CalcLine label="mean confidence = sum of confidences / count" calc={conf} color={C.pred} />
    <CalcLine label="accuracy = number right / count" calc={acc} color={C.truth} />
    <CalcLine label="gap = | accuracy − mean confidence |" calc={gap} color={C.loss} />
  </Card>
);

const ToyBins: Page = () => (
  <Frame
    part={4}
    title="Group them by confidence, then compare"
    line="For each bin we compare the average confidence (the sum divided by the count) with the fraction the model got right."
  >
    <div style={{ ...row, gap: 28, alignItems: 'flex-start', marginTop: 20 }}>
      <BinCard range="0.4 to 0.6" conf="(0.55 + 0.45) / 2 = 0.50" acc="1 / 2 = 0.50" gap="| 0.50 − 0.50 | = 0.00">
        <ToyCell i={8} w={110} /><ToyCell i={9} w={110} />
      </BinCard>
      <Steps>
        <Step>
          <BinCard range="0.6 to 0.8" conf="(0.75 + 0.70 + 0.65) / 3 = 0.70" acc="2 / 3 = 0.67" gap="| 0.67 − 0.70 | = 0.03">
            <ToyCell i={5} w={110} /><ToyCell i={6} w={110} /><ToyCell i={7} w={110} />
          </BinCard>
        </Step>
        <Step>
          <BinCard range="0.8 to 1.0" conf="(.95+.90+.90+.90+.85) / 5 = 0.90" acc="3 / 5 = 0.60" gap="| 0.60 − 0.90 | = 0.30">
            <ToyCell i={0} w={98} /><ToyCell i={1} w={98} /><ToyCell i={2} w={98} /><ToyCell i={3} w={98} /><ToyCell i={4} w={98} />
          </BinCard>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const TOYBINS: Bin[] = [
  { conf: 0.5, acc: 0.5, n: 2 },
  { conf: 0.7, acc: 2 / 3, n: 3 },
  { conf: 0.9, acc: 0.6, n: 5 },
];

const ToyDiagram: Page = () => (
  <Frame
    part={4}
    title="The reliability diagram"
    line="Each dot is one bin, and a bigger dot means more predictions. A calibrated model sits on the dashed line. The red bars show the gap."
  >
    <div style={{ ...row, gap: 80, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Reliability bins={TOYBINS} size={480} />
      <div style={{ ...col, gap: 26, fontSize: 34, width: 620 }}>
        <div>
          <span style={{ fontFamily: mono, color: C.soft }}>(0.50, 0.50)</span> on the line
        </div>
        <div>
          <span style={{ fontFamily: mono, color: C.soft }}>(0.70, 0.67)</span> almost on it
        </div>
        <div>
          <span style={{ fontFamily: mono, color: C.soft }}>(0.90, 0.60)</span> far below: the model said 0.90 and was
          right 0.60 of the time
        </div>
      </div>
    </div>
  </Frame>
);

const EceRow = ({ range, n, acc, conf, gap, term }: { range: string; n: number; acc: string; conf: string; gap: string; term: string }) => (
  <div style={{ ...row, alignItems: 'center', fontFamily: mono, fontSize: 31, height: 76, borderTop: `2px solid ${C.rule}`, whiteSpace: 'nowrap' }}>
    <span style={{ width: 235, fontSize: 25, color: C.soft, flexShrink: 0 }}>{range}</span>
    <span style={{ color: C.s2, width: 86 }}>{n}/10</span>× |{' '}
    <span style={{ color: C.truth, margin: '0 10px' }}>{acc}</span>−<span style={{ color: C.pred, margin: '0 10px' }}>{conf}</span>| ={' '}
    <span style={{ color: C.s2, margin: '0 10px' }}>{(n / 10).toFixed(1)}</span>×<span style={{ color: C.loss, margin: '0 10px' }}>{gap}</span>={' '}
    <b style={{ marginLeft: 10 }}>{term}</b>
  </div>
);

const EceFormula: Page = () => (
  <Frame
    part={4}
    title="One number: expected calibration error"
    line="ECE is the average gap, with each bin weighted by its share of the predictions. A perfectly calibrated model scores 0."
  >
    <div style={{ ...row, gap: 30, alignItems: 'center', height: '100%' }}>
      <div style={{ flexShrink: 0, textAlign: 'center' }}>
        <Reliability bins={TOYBINS} size={380} />
        <div style={{ fontSize: 23, marginTop: -40 }}>
          <span style={{ color: C.s2 }}>dot size = share of predictions</span> · <span style={{ color: C.loss }}>red bar = gap</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Eq size={42}>
          ECE = Σ<sub style={{ fontSize: 24 }}>bins</sub>
          <span style={{ color: C.s2 }}>
            <Frac top={<span>predictions in bin</span>} bot={<span>all predictions</span>} />
          </span>
          ×{' '}
          <span style={{ color: C.loss }}>
            | <span style={{ color: C.truth }}>accuracy</span> − <span style={{ color: C.pred }}>confidence</span> |
          </span>
        </Eq>
        <div style={{ height: 26 }} />
        <Steps>
          <Step>
            <EceRow range="bin 0.4 to 0.6" n={2} acc="0.50" conf="0.50" gap="0.00" term="0.00" />
          </Step>
          <Step>
            <EceRow range="bin 0.6 to 0.8" n={3} acc="0.67" conf="0.70" gap="0.03" term="0.01" />
          </Step>
          <Step>
            <EceRow range="bin 0.8 to 1.0" n={5} acc="0.60" conf="0.90" gap="0.30" term="0.15" />
          </Step>
          <Step>
            <div style={{ fontFamily: mono, fontSize: 36, borderTop: `3px solid ${C.ink}`, paddingTop: 16, textAlign: 'right' }}>
              ECE = 0.00 + 0.01 + 0.15 = <b style={{ color: C.loss }}>0.16</b>
            </div>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

const EceCode: Page = () => (
  <Frame
    part={4}
    title="ECE in a few lines of Python"
    line="conf is each prediction’s top probability; correct is 1 or 0. On our ten predictions with these three bins it returns 0.16."
  >
    <div style={{ ...col, justifyContent: 'center', height: '100%' }}>
      <Code
        size={31}
        code={`
def ece(conf, correct, n_bins=10):
    edges = np.linspace(0, 1, n_bins + 1)
    total = 0.0
    for lo, hi in zip(edges[:-1], edges[1:]):
        in_bin = (conf > lo) & (conf <= hi)
        if in_bin.any():
            gap = abs(correct[in_bin].mean() - conf[in_bin].mean())
            total += in_bin.mean() * gap     # weight = share of predictions
    return total
`}
      />
    </div>
  </Frame>
);

const Shape = ({ over }: { over: boolean }) => {
  const X = (v: number) => 90 + v * 420;
  const Y = (v: number) => 20 + (1 - v) * 420;
  const f = (v: number) => (over ? 0.78 * v : v + (5 / 6) * v * (1 - v));
  const xs = Array.from({ length: 41 }, (_, i) => i / 40);
  const ex = over ? 0.9 : 0.6;
  return (
    <svg width={560} height={530} viewBox="0 0 560 530">
      <rect x={X(0)} y={Y(1)} width={420} height={420} fill={C.white} stroke={C.rule} strokeWidth={3} />
      <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke={C.muted} strokeWidth={3} strokeDasharray="10 8" />
      {[0, 0.5, 1].map((v) => (
        <g key={v}>
          <text x={X(v)} y={Y(0) + 32} textAnchor="middle" fontSize={24} fill={C.soft}>{v.toFixed(1)}</text>
          <text x={X(0) - 14} y={Y(v) + 8} textAnchor="end" fontSize={24} fill={C.soft}>{v.toFixed(1)}</text>
        </g>
      ))}
      <polyline points={xs.map((v) => `${X(v)},${Y(f(v))}`).join(' ')} fill="none" stroke={C.ink} strokeWidth={5} />
      <line x1={X(ex)} y1={Y(0)} x2={X(ex)} y2={Y(Math.min(ex, f(ex)))} stroke={C.pred} strokeWidth={2} strokeDasharray="6 6" />
      <line x1={X(0)} y1={Y(f(ex))} x2={X(ex)} y2={Y(f(ex))} stroke={C.truth} strokeWidth={2} strokeDasharray="6 6" />
      <line x1={X(ex)} y1={Y(f(ex))} x2={X(ex)} y2={Y(ex)} stroke={C.loss} strokeWidth={7} />
      <circle cx={X(ex)} cy={Y(f(ex))} r={11} fill={C.ink} />
      <text x={X(0.5)} y={Y(0) + 72} textAnchor="middle" fontSize={27} fill={C.pred}>confidence (what the model said)</text>
      <text transform={`translate(28 ${Y(0.5)}) rotate(-90)`} textAnchor="middle" fontSize={27} fill={C.truth}>accuracy (what happened)</text>
    </svg>
  );
};

const Shapes: Page = () => (
  <Frame
    part={4}
    title="Overconfident and underconfident models"
    line="These curves are illustrative. Below the dashed line the model’s confidence is higher than its accuracy. Above the line it is lower."
  >
    <div style={{ ...row, gap: 120, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <Shape over />
        <div style={{ fontFamily: serif, fontSize: 44, fontWeight: 700 }}>Overconfident</div>
        <div style={{ fontSize: 30, color: C.soft }}>says 0.9, right 0.7 of the time</div>
      </div>
      <Steps>
        <Step>
          <div style={{ textAlign: 'center' }}>
            <Shape over={false} />
            <div style={{ fontFamily: serif, fontSize: 44, fontWeight: 700 }}>Underconfident</div>
            <div style={{ fontSize: 30, color: C.soft }}>says 0.6, right 0.8 of the time</div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

type Ex = { text: string; label: string; pred: string; logits: number[]; probs: number[] };
const EXS = sci.zs.examples as unknown as Ex[];
const TOPIC4 = ['World', 'Sports', 'Business', 'Sci/Tech'];
const short = (t: string) => (t.startsWith('Science') ? 'Sci/Tech' : t);
const clean = (t: string) => t.replace(/ #39;/g, '’').replace(/\s+/g, ' ');
const ONE = EXS.find((e) => e.text.startsWith('Cassini')) ?? EXS[0];
const WRONG = EXS.find((e) => e.pred !== e.label) ?? EXS[1];
const top = (v: number[]) => Math.max(...v);

const Setup = ({ head, big, children }: { head: string; big: string; children: ReactNode }) => (
  <Card style={{ width: 540, padding: '34px 36px', minHeight: 430 }}>
    <Label>{head}</Label>
    <div style={{ fontFamily: serif, fontSize: 44, fontWeight: 700, margin: '12px 0 14px', lineHeight: 1.2 }}>{big}</div>
    <div style={{ fontSize: 32, lineHeight: 1.45, color: C.soft }}>{children}</div>
  </Card>
);

const RealSetup: Page = () => (
  <Frame
    part={4}
    title="Now a real test: the model, the data, the question"
    line="We use the same small model as in Parts 2 and 3, on a public dataset where every item has a known correct answer."
  >
    <div style={{ ...row, gap: 40, alignItems: 'stretch', marginTop: 20 }}>
      <Setup head="The model" big={sci.model.split('/')[1]}>
        {sci.params_M} M parameters. It is the model that read our email, and it has had no training for this task.
      </Setup>
      <Steps>
        <Step>
          <Setup head="The data" big="AG News">
            Short news items, each labelled with one of four topics: World, Sports, Business, Sci/Tech. We take {sci.zs.n.toLocaleString('en-US')}{' '}
            for testing and keep 500 others aside for later.
          </Setup>
        </Step>
        <Step>
          <Setup head="The question" big="A choice with four options">
            “Which topic is this news about?” with options A to D. One forward pass per item, and we read the four letter logits as in
            Part 3.
          </Setup>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const ONE_MAX = top(ONE.logits);
const ONE_E = ONE.logits.map((z) => Math.exp(z - ONE_MAX));
const ONE_TOT = ONE_E.reduce((a, b) => a + b, 0);

const RealOne: Page = () => (
  <Frame
    part={4}
    title="One prediction: from logits to answer and confidence"
    line={`The answer is the option with the largest probability. The confidence is that largest probability, here ${f2(top(ONE.probs))}. It is the model’s own estimate that its answer is right.`}
  >
    <div style={{ ...row, gap: 40, alignItems: 'center', height: '100%' }}>
      <div style={{ width: 430, flexShrink: 0 }}>
        <Label>News item</Label>
        <div style={{ fontFamily: serif, fontSize: 30, lineHeight: 1.35, margin: '10px 0 18px' }}>“{clean(ONE.text).slice(0, 86)}…”</div>
        <Label color={C.truth}>Correct topic</Label>
        <div style={{ fontSize: 32, color: C.truth, fontWeight: 600, marginTop: 6 }}>{short(ONE.label)}</div>
      </div>
      <div style={col}>
        <div style={row}>
          <div style={col}>
            <RHead w={270} left>option</RHead>
            {TOPIC4.map((t, i) => (
              <RCell key={t} w={270} left>{'ABCD'[i]}  {t}</RCell>
            ))}
          </div>
          <div style={col}>
            <RHead w={170}>logit</RHead>
            {ONE.logits.map((z, i) => (
              <RCell key={i} w={170}>{z.toFixed(2)}</RCell>
            ))}
          </div>
          <Steps>
            <Step>
              <div style={col}>
                <RHead w={230}>minus {ONE_MAX.toFixed(2)}</RHead>
                {ONE.logits.map((z, i) => (
                  <RCell key={i} w={230} color={C.soft}>{(z - ONE_MAX).toFixed(2).replace('-', '−')}</RCell>
                ))}
              </div>
            </Step>
            <Step>
              <div style={col}>
                <RHead w={230}>e to that power</RHead>
                {ONE_E.map((v, i) => (
                  <RCell key={i} w={230} color={C.soft}>{v.toFixed(4)}</RCell>
                ))}
              </div>
            </Step>
            <Step>
              <div style={col}>
                <RHead w={300}>÷ total {ONE_TOT.toFixed(4)}</RHead>
                {ONE.probs.map((v, i) => (
                  <RCell key={i} w={300} color={C.pred}>{v === top(ONE.probs) ? <b>{f2(v)}</b> : f2(v)}</RCell>
                ))}
              </div>
            </Step>
          </Steps>
        </div>
        <Steps>
          <Step>
            <div style={{ ...row, gap: 30, marginTop: 22, justifyContent: 'flex-end' }}>
              <div style={{ border: `3px solid ${C.ink}`, borderRadius: 10, padding: '10px 20px', fontSize: 27 }}>
                answer = option with the largest probability = <b>D, Sci/Tech</b>
              </div>
              <div style={{ border: `3px solid ${C.pred}`, borderRadius: 10, padding: '10px 20px', fontSize: 27, color: C.pred }}>
                confidence = that probability = <b>{f2(top(ONE.probs))}</b>
              </div>
            </div>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

const CC = sci.conf_compare as { n: number; read: { accuracy: number; mean_conf: number; ece: number }; written: { accuracy: number; mean_conf: number; ece: number } };
const LC = sci.letter_counts as number[];
const LN = LC.reduce((a, b) => a + b, 0);

const Way = ({ n, head, how, cost, gives, color }: { n: string; head: string; how: string; cost: string; gives: string; color: string }) => (
  <Card color={color} style={{ width: 544, padding: '24px 28px' }}>
    <div style={{ ...row, gap: 16, alignItems: 'baseline' }}>
      <div style={{ fontFamily: serif, fontSize: 56, fontWeight: 700, color, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 36, fontWeight: 700 }}>{head}</div>
    </div>
    <div style={{ fontSize: 28, lineHeight: 1.4, margin: '12px 0 14px', height: 160 }}>{how}</div>
    <div style={{ borderTop: `2px solid ${C.rule}`, padding: '10px 0', fontSize: 25 }}>
      <span style={{ color: C.muted }}>Cost </span>
      {cost}
    </div>
    <div style={{ borderTop: `2px solid ${C.rule}`, padding: '10px 0', fontSize: 25 }}>
      <span style={{ color: C.muted }}>Gives </span>
      {gives}
    </div>
  </Card>
);

const ConfWays: Page = () => (
  <Frame
    part={4}
    title="Where can a confidence come from?"
    line="We use the first: the largest softmax probability. It is the standard definition in calibration research, and the next slide compares it with the other two on our model."
  >
    <div style={{ ...row, gap: 34, alignItems: 'stretch' }}>
      <Way n="1" head="Read it" color={C.pred} how="Take the probabilities from the softmax. The largest one is the confidence in the answer." cost="one forward pass" gives="any value between 0 and 1" />
      <Steps>
        <Step>
          <Way n="2" head="Ask for it" color={C.s2} how="Have the model write a number with its answer, such as “confidence: 0.9”." cost="more output tokens" gives="a few round values, as text" />
        </Step>
        <Step>
          <Way n="3" head="Sample it" color={C.s1} how="Generate the answer many times and report the share of runs that agree." cost="one generation per sample" gives="a fraction such as 15/20" />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const CmpRow = ({ name, sub, a, c, e, color }: { name: string; sub: string; a: number; c: number; e: number; color: string }) => (
  <div style={{ ...row, alignItems: 'center', height: 104, borderTop: `2px solid ${C.rule}` }}>
    <div style={{ width: 520 }}>
      <div style={{ fontSize: 34, fontWeight: 700, color }}>{name}</div>
      <div style={{ fontSize: 23, color: C.muted }}>{sub}</div>
    </div>
    <div style={{ width: 250, fontFamily: mono, fontSize: 42, color: C.truth }}>{f2(a)}</div>
    <div style={{ width: 330, fontFamily: mono, fontSize: 42, color: C.pred }}>{f2(c)}</div>
    <div style={{ width: 380, fontFamily: mono, fontSize: 30, color: C.soft }}>
      {f2(c)} − {f2(a)} = <b style={{ color: C.loss }}>{f2(c - a)}</b>
    </div>
    <div style={{ fontFamily: mono, fontSize: 42, color: C.loss }}>{f2(e)}</div>
  </div>
);

const ConfCompare: Page = () => (
  <Frame
    part={4}
    title="The three sources, measured on our model"
    line={`On the same ${CC.n} news items, the written confidence is no better calibrated than the read one. Sampling a one-token answer estimates the read probability, at ${LN} times the cost here.`}
  >
    <div style={col}>
      <div style={{ ...row, fontSize: 22, letterSpacing: '0.08em', fontWeight: 600, color: C.muted, height: 44 }}>
        <div style={{ width: 520 }}>SOURCE OF THE CONFIDENCE</div>
        <div style={{ width: 250, color: C.truth }}>ACCURACY</div>
        <div style={{ width: 330, color: C.pred }}>MEAN CONFIDENCE</div>
        <div style={{ width: 380 }}>OVER-CONFIDENT BY</div>
        <div style={{ color: C.loss }}>ECE</div>
      </div>
      <CmpRow name="1. Read from the softmax" sub="largest of the four probabilities" a={CC.read.accuracy} c={CC.read.mean_conf} e={CC.read.ece} color={C.pred} />
      <Steps>
        <Step>
          <CmpRow name="2. Written by the model" sub="“confidence” field in its JSON answer" a={CC.written.accuracy} c={CC.written.mean_conf} e={CC.written.ece} color={C.s2} />
        </Step>
        <Step>
          <div style={{ borderTop: `2px solid ${C.rule}`, paddingTop: 20 }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: C.s1 }}>3. Sampled</div>
            <div style={{ fontFamily: mono, fontSize: 30, lineHeight: 1.6, marginTop: 6 }}>
              {LN} sampled answers for the email: A {LC[0]}, B {LC[1]}, C {LC[2]} → {f2(LC[0] / LN)}, {f2(LC[1] / LN)}, {f2(LC[2] / LN)}
              <br />
              <span style={{ color: C.pred }}>
                read once from the softmax: {f2(sci.p_team[0])}, {f2(sci.p_team[1])}, {f2(sci.p_team[2])}
              </span>
            </div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const RealSix: Page = () => (
  <Frame
    part={4}
    title="Six of the 1,000 predictions"
    line="A useful confidence would be lower on the two wrong rows. Here it is near 1 in every row, right or wrong. That is the model’s over-confidence, and the rest of this part measures and fixes it."
  >
    <div style={{ ...col, marginTop: 16 }}>
      <div style={{ ...row, fontSize: 21, letterSpacing: '0.06em', fontWeight: 600, color: C.muted, height: 62, alignItems: 'flex-end', paddingBottom: 8 }}>
        <div style={{ width: 500 }}>NEWS ITEM</div>
        <div style={{ width: 520, color: C.pred, textAlign: 'center' }}>
          <div>PROBABILITIES FROM THE SOFTMAX</div>
          <div style={{ ...row }}>
            {TOPIC4.map((t) => (
              <div key={t} style={{ width: 130, letterSpacing: 0, fontWeight: 400 }}>{t}</div>
            ))}
          </div>
        </div>
        <div style={{ width: 170, paddingLeft: 20 }}>ANSWER</div>
        <div style={{ width: 180, color: C.pred }}>CONFIDENCE</div>
        <div style={{ width: 170, color: C.truth }}>CORRECT</div>
        <div>RIGHT?</div>
      </div>
      {EXS.map((e) => (
        <div key={e.text} style={{ ...row, alignItems: 'center', fontSize: 26, height: 84, borderTop: `2px solid ${C.rule}` }}>
          <div style={{ width: 500, paddingRight: 24, lineHeight: 1.25, fontSize: 25 }}>{clean(e.text).slice(0, 58)}…</div>
          {e.probs.map((v, i) => (
            <div key={i} style={{ width: 130, textAlign: 'center', fontFamily: mono, fontSize: 24, color: v === top(e.probs) ? C.pred : C.muted, fontWeight: v === top(e.probs) ? 700 : 400, background: v === top(e.probs) ? `${C.pred}18` : 'transparent', borderRadius: 6, padding: '6px 0' }}>
              {v.toFixed(4)}
            </div>
          ))}
          <div style={{ width: 170, paddingLeft: 20 }}>{short(e.pred)}</div>
          <div style={{ width: 180, fontFamily: mono, color: C.pred, fontWeight: 700 }}>{top(e.probs).toFixed(4)}</div>
          <div style={{ width: 170, color: C.truth }}>{short(e.label)}</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: e.pred === e.label ? C.truth : C.loss }}>{e.pred === e.label ? '✓' : '✗'}</div>
        </div>
      ))}
    </div>
  </Frame>
);

const RealNumbers: Page = () => (
  <Frame
    part={4}
    title="All 1,000 predictions, in two numbers"
    line={`The model is right ${pct(sci.zs.accuracy)} of the time, but its average confidence is ${pct(sci.zs.mean_conf)}. A calibrated model would have these two numbers equal.`}
  >
    <div style={{ ...row, gap: 140, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <Big value={f2(sci.zs.accuracy)} label="accuracy" color={C.truth} />
        <div style={{ fontFamily: mono, fontSize: 30, color: C.truth, marginTop: 14 }}>
          {sci.zs.n_right} right / {sci.zs.n.toLocaleString('en-US')}
        </div>
      </div>
      <Steps>
        <Step>
          <div style={{ textAlign: 'center' }}>
            <Big value={f2(sci.zs.mean_conf)} label="mean confidence" color={C.pred} />
            <div style={{ fontFamily: mono, fontSize: 30, color: C.pred, marginTop: 14 }}>
              sum of 1,000 confidences / 1,000
            </div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const TOPBIN = sci.zs.bins[9] as { n: number; conf: number; acc: number };
const TOPTERM = (TOPBIN.n / sci.zs.n) * Math.abs(TOPBIN.acc - TOPBIN.conf);

const RealBefore: Page = () => (
  <Frame
    part={4}
    title="The reliability diagram for our model"
    line={`${TOPBIN.n} of the 1,000 answers come with confidence above 0.9, and only ${pct(TOPBIN.acc)} of those are right. That one bin accounts for most of the ECE.`}
  >
    <div style={{ ...row, gap: 60, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Reliability bins={sci.zs.bins} size={460} counts />
      <div style={{ ...col, gap: 18, width: 760 }}>
        <Label>ECE, bin by bin</Label>
        <Steps>
          <Step>
            <div style={{ fontFamily: mono, fontSize: 29, lineHeight: 1.7, whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 24, color: C.soft }}>bin 0.9 to 1.0</div>
              <span style={{ color: C.s2 }}>{TOPBIN.n}/1000</span> × | <span style={{ color: C.truth }}>{f2(TOPBIN.acc)}</span> −{' '}
              <span style={{ color: C.pred }}>{f2(TOPBIN.conf)}</span> | = <b>{f2(TOPTERM)}</b>
            </div>
          </Step>
          <Step>
            <div style={{ fontFamily: mono, fontSize: 29, lineHeight: 1.7, whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 24, color: C.soft }}>the other four bins, {sci.zs.n - TOPBIN.n} predictions</div>
              add <b>{f2(sci.zs.ece - TOPTERM)}</b>
            </div>
          </Step>
          <Step>
            <div style={{ fontFamily: mono, fontSize: 38, borderTop: `3px solid ${C.ink}`, paddingTop: 14 }}>
              ECE = {f2(TOPTERM)} + {f2(sci.zs.ece - TOPTERM)} = <b style={{ color: C.loss }}>{f2(sci.zs.ece)}</b>
            </div>
          </Step>
        </Steps>
        <div style={{ fontSize: 23, color: C.muted }}>numbers beside the dots count the predictions in each bin</div>
      </div>
    </div>
  </Frame>
);

const softmaxT = (z: number[], T: number) => {
  const e = z.map((v) => Math.exp(v / T));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
};

const WGAP = top(WRONG.logits) - [...WRONG.logits].sort((a, b) => b - a)[1];

const WhyExtreme: Page = () => (
  <Frame
    part={4}
    title="Why the confidence is so extreme"
    line={`Softmax turns a logit gap of ${WGAP.toFixed(1)} into odds of about ${(Math.round(Math.exp(WGAP) / 100) * 100).toLocaleString('en-US')} to 1. The order of the options is usually right. The gaps are too large.`}
  >
    <div style={{ ...row, gap: 60, alignItems: 'center', height: '100%' }}>
      <div style={{ width: 560, flexShrink: 0 }}>
        <Label>One of the wrong answers</Label>
        <div style={{ fontFamily: serif, fontSize: 32, lineHeight: 1.35, margin: '12px 0 20px' }}>“{clean(WRONG.text).slice(0, 84)}…”</div>
        <div style={{ fontSize: 30, lineHeight: 1.5 }}>
          model said <b>{short(WRONG.pred)}</b>
          <br />
          <span style={{ color: C.truth }}>correct topic: {short(WRONG.label)}</span>
        </div>
      </div>
      <div style={col}>
        <div style={row}>
          <RHead w={280} left>option</RHead>
          <RHead w={180}>logit</RHead>
          <RHead w={300}>gap to the top</RHead>
          <RHead w={240}>probability</RHead>
        </div>
        {TOPIC4.map((t, i) => (
          <div key={t} style={row}>
            <RCell w={280} left>{'ABCD'[i]}  {t}</RCell>
            <RCell w={180}>{WRONG.logits[i].toFixed(1)}</RCell>
            <RCell w={300} color={C.loss}>{(top(WRONG.logits) - WRONG.logits[i]).toFixed(1)}</RCell>
            <RCell w={240} color={C.pred}>{WRONG.probs[i].toFixed(4)}</RCell>
          </div>
        ))}
      </div>
    </div>
  </Frame>
);

const TRow = ({ z, T }: { z: number; T: number }) => (
  <div style={row}>
    <RCell w={170}>{z.toFixed(1)}</RCell>
    <RCell w={190} color={C.loss}>{(z / T).toFixed(2)}</RCell>
    <RCell w={270} color={C.soft}>{Math.exp(z / T).toFixed(2)}</RCell>
  </div>
);

const TempWorked: Page = () => {
  const z = [2.0, 1.0, 0.1];
  const e = z.map((v) => Math.exp(v / 2));
  const tot = e.reduce((a, b) => a + b, 0);
  const p1 = softmaxT(z, 1);
  return (
    <Frame
      part={4}
      title="Temperature: divide every logit by T, then softmax"
      line="With T = 2 the gaps between logits are halved. The top option falls from 0.66 to 0.50 and is still the top option."
    >
      <div style={{ ...row, gap: 30, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ width: 330, flexShrink: 0, whiteSpace: 'nowrap' }}>
          <Eq size={36}>
            <I color={C.pred}>p</I> = softmax(<I>z</I> / <I color={C.loss}>T</I>)
          </Eq>
          <div style={{ fontFamily: mono, fontSize: 44, color: C.loss, textAlign: 'center', marginTop: 24 }}>T = 2</div>
        </div>
        <div style={col}>
          <div style={row}>
            <RHead w={170}>logit z</RHead>
            <RHead w={190}>z / 2</RHead>
            <RHead w={270}>e to that power</RHead>
          </div>
          {z.map((v) => (
            <TRow key={v} z={v} T={2} />
          ))}
          <div style={{ ...row, justifyContent: 'flex-end', fontFamily: mono, fontSize: 30, color: C.soft, padding: '12px 30px 0' }}>total {tot.toFixed(2)}</div>
        </div>
        <Steps>
          <Step>
            <div style={col}>
              <RHead w={430}>divide by {tot.toFixed(2)}</RHead>
              {e.map((v, i) => (
                <RCell key={i} w={430} color={C.pred}>{v.toFixed(2)} / {tot.toFixed(2)} = {f2(v / tot)}</RCell>
              ))}
              <div style={{ height: 54 }} />
            </div>
          </Step>
          <Step>
            <div style={col}>
              <RHead w={180}>at T = 1</RHead>
              {p1.map((v, i) => (
                <RCell key={i} w={180} color={C.muted}>{f2(v)}</RCell>
              ))}
              <div style={{ height: 54 }} />
            </div>
          </Step>
        </Steps>
      </div>
    </Frame>
  );
};

const Temperature: Page = () => {
  const [T, setT] = useState(1);
  const z = [2.0, 1.0, 0.1];
  const p = softmaxT(z, T);
  const hint = T < 1 ? 'T below 1: gaps grow, the model looks more sure' : T === 1 ? 'T = 1: nothing changes' : 'T above 1: gaps shrink, the model looks less sure';
  return (
    <Frame
      part={4}
      title="Try other temperatures"
      line="Dividing by T above 1 flattens the distribution, and a very large T pushes every option towards 1/3. The order of the options never changes."
    >
      <div style={{ ...row, gap: 70, alignItems: 'center', height: '100%' }}>
        <div style={{ width: 600 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: mono, fontSize: 64, color: C.loss }}>T = {T.toFixed(1)}</div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.1}
              value={T}
              onChange={(e) => setT(Number(e.target.value))}
              onKeyDown={(e) => e.stopPropagation()}
              style={{ width: 520, marginTop: 24, accentColor: C.loss }}
            />
            <div style={{ fontSize: 26, color: C.muted, marginTop: 10 }}>drag the slider</div>
            <div style={{ fontSize: 30, color: C.loss, marginTop: 30, height: 80 }}>{hint}</div>
          </div>
        </div>
        <div style={col}>
          <div style={{ ...row, fontSize: 26, color: C.muted, marginBottom: 8 }}>
            <div style={{ width: 300, textAlign: 'right', paddingRight: 20 }}>z / T</div>
            <div>probability</div>
          </div>
          {z.map((v, i) => (
            <Bar key={v} label={`${v.toFixed(1)}/${T.toFixed(1)} = ${(v / T).toFixed(2)}`} p={p[i]} width={520} mono />
          ))}
        </div>
      </div>
    </Frame>
  );
};

const NLL = sci.zs.nll_curve as unknown as [number, number][];

const ChooseT: Page = () => {
  const X = (t: number) => 110 + ((t - 0.5) / 9.5) * 760;
  const Y = (v: number) => 30 + (1 - (v - 0.5) / 2.5) * 430;
  return (
    <Frame
      part={4}
      title="Choosing T: try many values on held-out items"
      line={`Log loss is the average of −log(probability given to the correct topic). On 500 held-out items it is lowest at T = ${sci.zs.T.toFixed(1)}. The 1,000 test items are never used to pick T.`}
    >
      <div style={{ ...row, gap: 50, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <svg width={920} height={560} viewBox="0 0 920 560">
          <rect x={X(0.5)} y={Y(3)} width={760} height={430} fill={C.white} stroke={C.rule} strokeWidth={3} />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
            <text key={t} x={X(t)} y={Y(0.5) + 34} textAnchor="middle" fontSize={24} fill={C.soft}>{t}</text>
          ))}
          {[1, 2, 3].map((v) => (
            <text key={v} x={X(0.5) - 14} y={Y(v) + 8} textAnchor="end" fontSize={24} fill={C.soft}>{v.toFixed(1)}</text>
          ))}
          <polyline points={NLL.map(([t, v]) => `${X(t)},${Y(v)}`).join(' ')} fill="none" stroke={C.ink} strokeWidth={5} />
          <circle cx={X(1)} cy={Y(sci.zs.nll_at_1)} r={11} fill={C.muted} />
          <text x={X(1) + 20} y={Y(sci.zs.nll_at_1) - 6} fontSize={26} fill={C.soft}>T = 1 · log loss {f2(sci.zs.nll_at_1)}</text>
          <line x1={X(sci.zs.T)} y1={Y(0.5)} x2={X(sci.zs.T)} y2={Y(sci.zs.nll_best)} stroke={C.loss} strokeWidth={3} strokeDasharray="8 6" />
          <circle cx={X(sci.zs.T)} cy={Y(sci.zs.nll_best)} r={13} fill={C.loss} />
          <text x={X(sci.zs.T) + 10} y={Y(sci.zs.nll_best) - 70} fontSize={28} fill={C.loss} fontWeight={600}>T = {sci.zs.T.toFixed(1)} · log loss {f2(sci.zs.nll_best)}</text>
          <text x={X(5.25)} y={Y(0.5) + 78} textAnchor="middle" fontSize={27} fill={C.loss}>temperature T</text>
          <text transform={`translate(30 ${Y(1.75)}) rotate(-90)`} textAnchor="middle" fontSize={27} fill={C.soft}>log loss on 500 held-out items</text>
        </svg>
        <div style={{ width: 560, fontSize: 30, lineHeight: 1.5 }}>
          <Steps>
            <Step>
              <div style={{ marginBottom: 22 }}>
                Log loss punishes a confident wrong answer heavily: −log(0.0001) = 9.2.
              </div>
            </Step>
            <Step>
              <div style={{ color: C.soft }}>
                Too small a T keeps those penalties. Too large a T throws away confidence the model has earned. The lowest point balances the two.
              </div>
            </Step>
          </Steps>
        </div>
      </div>
    </Frame>
  );
};

const SameItem: Page = () => {
  const after = softmaxT(WRONG.logits, sci.zs.T);
  return (
    <Frame
      part={4}
      title={`The same wrong answer, before and after T = ${sci.zs.T.toFixed(1)}`}
      line={`The model still says ${short(WRONG.pred)} and is still wrong. Its confidence falls from ${top(WRONG.probs).toFixed(4)} to ${f2(top(after))}, which is closer to how often such answers are right.`}
    >
      <div style={{ ...row, gap: 60, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={col}>
          <Label>As read, T = 1 · top {top(WRONG.probs).toFixed(4)}</Label>
          <div style={{ height: 12 }} />
          {TOPIC4.map((t, i) => (
            <Bar key={t} label={t} p={WRONG.probs[i]} width={330} />
          ))}
        </div>
        <Steps>
          <Step>
            <div style={col}>
              <Label color={C.loss}>Logits divided by {sci.zs.T.toFixed(1)}</Label>
              <div style={{ height: 12 }} />
              {TOPIC4.map((t, i) => (
                <Bar key={t} label={`${WRONG.logits[i].toFixed(1)} → ${(WRONG.logits[i] / sci.zs.T).toFixed(1)}`} p={after[i]} width={330} mono />
              ))}
            </div>
          </Step>
        </Steps>
      </div>
    </Frame>
  );
};

const RealAfter: Page = () => (
  <Frame
    part={4}
    title={`All 1,000 test items, before and after T = ${sci.zs.T.toFixed(1)}`}
    line={`ECE falls from ${f2(sci.zs.ece)} to ${f2(sci.zs.ece_T)}. Accuracy stays at ${f2(sci.zs.accuracy)}, because dividing by T never changes which option is on top.`}
  >
    <div style={{ ...row, gap: 60, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Reliability bins={sci.zs.bins} size={420} title={`before · ECE ${f2(sci.zs.ece)}`} />
      <Steps>
        <Step>
          <Reliability bins={sci.zs.bins_T} size={420} title={`after · ECE ${f2(sci.zs.ece_T)}`} />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const TCell = ({ children, w = 300, color = C.ink, head = false }: { children: ReactNode; w?: number; color?: string; head?: boolean }) => (
  <div style={{ width: w, height: 90, fontSize: head ? 28 : 40, color: head ? C.muted : color, fontFamily: head ? 'inherit' : mono, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </div>
);

const NotAccuracy: Page = () => (
  <Frame
    part={4}
    title="Calibration and accuracy are different things"
    line="Temperature scaling corrected the model’s confidence but left every wrong answer wrong. To get more answers right we have to train."
  >
    <div style={{ ...col, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={row}>
        <TCell w={420} head> </TCell>
        <TCell head>accuracy</TCell>
        <TCell head>mean confidence</TCell>
        <TCell head>ECE</TCell>
      </div>
      <div style={{ ...row, borderTop: `2px solid ${C.rule}` }}>
        <TCell w={420}><span style={{ fontFamily: 'var(--osd-font-body)' }}>as read</span></TCell>
        <TCell color={C.truth}>{f2(sci.zs.accuracy)}</TCell>
        <TCell color={C.pred}>{f2(sci.zs.mean_conf)}</TCell>
        <TCell color={C.loss}>{f2(sci.zs.ece)}</TCell>
      </div>
      <div style={{ ...row, borderTop: `2px solid ${C.rule}` }}>
        <TCell w={420}><span style={{ fontFamily: 'var(--osd-font-body)' }}>with T = {sci.zs.T.toFixed(1)}</span></TCell>
        <TCell color={C.truth}>{f2(sci.zs.accuracy)}</TCell>
        <TCell color={C.pred}>{f2(sci.zs.mean_conf_T)}</TCell>
        <TCell color={C.loss}>{f2(sci.zs.ece_T)}</TCell>
      </div>
    </div>
  </Frame>
);

const Recap4: Page = () => (
  <Frame part={4} title="Where we are" line="Next: can training give us a model that is both more accurate and calibrated?">
    <div style={{ ...col, gap: 34, marginTop: 50 }}>
      <RecapItem>Calibrated: among answers given with probability p, a fraction p are right.</RecapItem>
      <RecapItem>Reliability diagram: confidence against accuracy, bin by bin.</RecapItem>
      <RecapItem>ECE: the average gap, weighted by bin size.</RecapItem>
      <RecapItem>Temperature scaling fixes confidence after training and does not change accuracy.</RecapItem>
    </div>
  </Frame>
);

// ---------------------------------------------------------------- part 5

const S5: Page = () => (
  <SectionPage
    n={5}
    goal="How do we train a model so that its probabilities come out right, instead of repairing them afterwards?"
    how="The three stages of training a chat model with an example of each, what each reward measures, a loss that rewards correct probabilities, and a head we train ourselves."
  />
);

const Stage = ({ n, name, color, data, goal, scale }: { n: string; name: string; color: string; data: string; goal: string; scale: string }) => (
  <Card color={color} style={{ width: 540, padding: '26px 30px' }}>
    <div style={{ fontSize: 24, letterSpacing: '0.12em', fontWeight: 600, color }}>STAGE {n}</div>
    <div style={{ fontFamily: serif, fontSize: 42, fontWeight: 700, margin: '6px 0 16px', lineHeight: 1.15 }}>{name}</div>
    {[
      ['Data', data],
      ['Objective', goal],
      ['Typical scale', scale],
    ].map(([k, v]) => (
      <div key={k} style={{ borderTop: `2px solid ${C.rule}`, padding: '12px 0' }}>
        <div style={{ fontSize: 22, color: C.muted }}>{k}</div>
        <div style={{ fontSize: 27, lineHeight: 1.3 }}>{v}</div>
      </div>
    ))}
  </Card>
);

const TrainPipeline: Page = () => (
  <Frame
    part={5}
    title="A chat model is trained in three stages"
    line="Each stage uses less data than the one before and moves the model closer to the behaviour we want. The question for this part: what does each objective reward?"
  >
    <div style={{ ...row, gap: 40, alignItems: 'stretch' }}>
      <Stage n="1" name="Pre-training" color={C.s2} data="web pages, books, code" goal="predict the next token" scale="trillions of tokens" />
      <Steps>
        <Step>
          <Stage n="2" name="Supervised fine-tuning" color={C.truth} data="instruction and response pairs" goal="predict the next token of the response" scale="thousands to millions of pairs" />
        </Step>
        <Step>
          <Stage n="3" name="Reinforcement learning" color={C.s1} data="the model’s own answers, scored" goal="raise the expected reward" scale="tens of thousands of prompts" />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const NTRow = ({ ctx, next }: { ctx: string; next: string }) => (
  <div style={{ ...row, alignItems: 'center', gap: 16, height: 66, fontFamily: mono, fontSize: 30 }}>
    <div style={{ width: 700, textAlign: 'right', color: C.soft, whiteSpace: 'nowrap' }}>{ctx}</div>
    <div style={{ color: C.muted }}>→</div>
    <div style={{ background: C.truth, color: C.white, borderRadius: 8, padding: '4px 16px' }}>{next}</div>
  </div>
);

const PreTrain: Page = () => (
  <Frame
    part={5}
    title="Stage 1, pre-training: predict the next token"
    line="Every position in every document is a training example, and the text itself supplies the correct answer. No person labels anything."
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <div style={col}>
        <Label>One sentence gives five examples</Label>
        <div style={{ height: 10 }} />
        <NTRow ctx="The" next="capital" />
        <NTRow ctx="The capital" next="of" />
        <NTRow ctx="The capital of" next="Gujarat" />
        <NTRow ctx="The capital of Gujarat" next="is" />
        <NTRow ctx="The capital of Gujarat is" next="Gandhinagar" />
        <div style={{ fontSize: 23, color: C.muted, marginTop: 10, textAlign: 'right' }}>shown word by word; the model works on tokens</div>
      </div>
      <Steps>
        <Step>
          <div style={{ width: 620 }}>
            <Label color={C.loss}>Objective</Label>
            <div style={{ fontFamily: serif, fontSize: 38, margin: '8px 0 6px' }}>
              loss = −log <I color={C.pred}>p</I>(<span style={{ color: C.truth }}>correct next token</span>)
            </div>
            <div style={{ fontSize: 26, color: C.soft, marginBottom: 26 }}>averaged over every position: cross-entropy</div>
            <Label>Scale, as reported by the makers</Label>
            <Fact k="GPT-3 (2020)" v="about 300 billion tokens" />
            <Fact k="Llama 3 (2024)" v="over 15 trillion tokens" />
            <Fact k="Qwen2.5 (2024)" v="up to 18 trillion tokens" />
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Chat = ({ who, children, color }: { who: string; children: ReactNode; color: string }) => (
  <div style={{ borderLeft: `6px solid ${color}`, padding: '6px 0 6px 20px', marginBottom: 16 }}>
    <div style={{ fontSize: 22, letterSpacing: '0.1em', fontWeight: 600, color }}>{who}</div>
    <div style={{ fontSize: 28, lineHeight: 1.35 }}>{children}</div>
  </div>
);

const BaseModel: Page = () => (
  <Frame
    part={5}
    title="After stage 1 the model continues text"
    line="A pre-trained model has learned language and many facts. Given our email it writes more email, because that is what usually follows such text."
  >
    <div style={{ ...row, gap: 60, alignItems: 'center', height: '100%' }}>
      <Card style={{ width: 780 }} color={C.s2}>
        <Label color={C.s2}>Pre-trained model, given the email</Label>
        <div style={{ fontFamily: serif, fontSize: 36, lineHeight: 1.45, marginTop: 16 }}>
          “{EMAIL}
          <span style={{ color: C.s2 }}> I have attached both receipts. Please let me know when the extra amount will be returned. Regards, …</span>”
        </div>
        <div style={{ fontSize: 23, color: C.muted, marginTop: 14 }}>continuation in blue is illustrative</div>
      </Card>
      <Steps>
        <Step>
          <div style={{ width: 780 }}>
            <Label>What we wanted</Label>
            <div style={{ fontSize: 36, lineHeight: 1.45, marginTop: 12 }}>
              Read the email as a request, follow the instruction that comes with it, and stop when the answer is complete.
            </div>
            <div style={{ fontSize: 30, color: C.soft, marginTop: 22 }}>Stage 2 teaches this.</div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const SFT: Page = () => (
  <Frame
    part={5}
    title="Stage 2, supervised fine-tuning on instruction pairs"
    line="This stage is also called instruction tuning. The loss is the same next-token loss, counted only on the response, so the model learns to answer in the format shown."
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <Card style={{ width: 820, padding: '26px 30px' }}>
        <Label>One training example</Label>
        <div style={{ height: 14 }} />
        <Chat who="INSTRUCTION" color={C.soft}>
          Which team should handle this email: billing, technical or sales?
          <br />
          “{EMAIL}”
        </Chat>
        <Chat who="RESPONSE, WRITTEN BY A PERSON" color={C.truth}>
          billing
        </Chat>
        <div style={{ fontFamily: mono, fontSize: 21, color: C.muted, lineHeight: 1.5, marginTop: 6 }}>
          {'<|im_start|>user … <|im_end|>'}
          <br />
          {'<|im_start|>assistant billing<|im_end|>'}
        </div>
        <div style={{ fontSize: 22, color: C.muted, marginTop: 6 }}>the same pair in the chat template that Qwen models use</div>
      </Card>
      <Steps>
        <Step>
          <div style={{ width: 760 }}>
            <Label color={C.loss}>Objective</Label>
            <div style={{ fontFamily: serif, fontSize: 34, margin: '8px 0 24px' }}>
              loss = −log <I color={C.pred}>p</I>(<span style={{ color: C.truth }}>next response token</span>)
            </div>
            <Label>Public instruction datasets</Label>
            <Fact k="Dolly (2023)" v="15,000 pairs written by people" />
            <Fact k="Alpaca (2023)" v="52,000 pairs generated by an LLM" />
            <Fact k="FLAN (2022)" v="about 1,800 tasks turned into instructions" />
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Btn = ({ children, on }: { children: ReactNode; on?: boolean }) => (
  <div style={{ padding: '10px 26px', borderRadius: 10, fontSize: 26, fontWeight: 600, background: on ? C.truth : C.white, color: on ? C.white : C.soft, border: `2px solid ${on ? C.truth : C.rule}` }}>
    {children}
  </div>
);

const Window = ({ title, children, width }: { title: string; children: ReactNode; width: number }) => (
  <div style={{ width, background: C.white, border: `2px solid ${C.rule}`, borderRadius: 'var(--osd-radius)', overflow: 'hidden' }}>
    <div style={{ ...row, alignItems: 'center', gap: 10, background: C.panel, padding: '12px 20px' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: C.rule }} />
      ))}
      <div style={{ fontSize: 22, color: C.muted, marginLeft: 12 }}>{title}</div>
    </div>
    <div style={{ padding: '20px 26px' }}>{children}</div>
  </div>
);

const RLHFPage: Page = () => (
  <Frame
    part={5}
    title="RLHF: what the human rater sees"
    line="A rater reads one prompt and two answers from the model, and clicks the better one. Thousands of such clicks are the training data for this stage."
  >
    <div style={{ ...row, gap: 40, alignItems: 'center', height: '100%' }}>
      <Window title="rating task 214 of 500 · illustrative" width={1060}>
        <Label>Prompt</Label>
        <div style={{ fontSize: 27, margin: '6px 0 18px' }}>Which team should handle this email? “{EMAIL}”</div>
        <div style={{ ...row, gap: 20 }}>
          <div style={{ flex: 1, border: `2px solid ${C.truth}`, borderRadius: 10, padding: '14px 18px' }}>
            <Label color={C.truth}>Answer A</Label>
            <div style={{ fontSize: 25, lineHeight: 1.35, marginTop: 6 }}>
              This belongs with billing. You were charged twice, so they can refund the duplicate payment.
            </div>
          </div>
          <div style={{ flex: 1, border: `2px solid ${C.rule}`, borderRadius: 10, padding: '14px 18px' }}>
            <Label>Answer B</Label>
            <div style={{ fontSize: 25, lineHeight: 1.35, marginTop: 6, color: C.soft }}>
              It could be billing, or possibly a technical fault. I am not sure which team is right.
            </div>
          </div>
        </div>
        <div style={{ ...row, gap: 16, marginTop: 20 }}>
          <Btn on>A is better</Btn>
          <Btn>B is better</Btn>
          <Btn>about the same</Btn>
        </div>
      </Window>
      <Steps>
        <Step>
          <div style={{ width: 580, fontSize: 31, lineHeight: 1.45 }}>
            <div>The rater does not know the correct team. They pick the answer that reads as more helpful.</div>
            <div style={{ color: C.loss, marginTop: 22 }}>Answer B admits doubt, and it loses.</div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const RLHFLoop: Page = () => (
  <Frame
    part={5}
    title="RLHF: from clicks to an updated model"
    line="The objective in words: write answers that a model of human preference scores highly. InstructGPT (2022) used about 33,000 ranked prompts and the PPO algorithm."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <Box x={20} y={70} w={400} h={150} text="1. Comparisons" sub="A beats B, for thousands of pairs" />
      <Arr x1={420} y1={145} x2={540} y2={145} />
      <Box x={550} y={70} w={480} h={150} text="2. Reward model" sub="learns to give one score to any answer" color={C.s1} />
      <Arr x1={1030} y1={145} x2={1150} y2={145} />
      <Box x={1160} y={70} w={520} h={150} text="3. Update the LLM" sub="so its answers get higher scores" color={C.s2} />
      <text x={790} y={300} textAnchor="middle" fontSize={26} fill={C.muted}>the reward model on our two answers (scores illustrative)</text>
      <rect x={330} y={330} width={920} height={84} rx={10} fill={C.white} stroke={C.truth} strokeWidth={3} />
      <text x={356} y={382} fontSize={28} fill={C.ink}>“This belongs with billing. You were charged twice…”</text>
      <text x={1290} y={386} fontSize={44} fontFamily={mono} fill={C.truth} fontWeight={700}>0.82</text>
      <rect x={330} y={436} width={920} height={84} rx={10} fill={C.white} stroke={C.rule} strokeWidth={3} />
      <text x={356} y={488} fontSize={28} fill={C.soft}>“It could be billing, or possibly a technical fault…”</text>
      <text x={1290} y={492} fontSize={44} fontFamily={mono} fill={C.muted} fontWeight={700}>0.31</text>
      <text x={850} y={610} textAnchor="middle" fontSize={32} fill={C.loss}>The score is for how the answer reads. It is given before anyone checks which team was correct.</text>
    </svg>
  </Frame>
);

const RLVRPage: Page = () => (
  <Frame
    part={5}
    title="Stage 3, RLVR: the reward comes from a checker"
    line="When an answer can be verified by a program, no person is needed. The model writes its steps, a checker compares the final answer, and the reward is 1 or 0."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <Box x={20} y={90} w={330} h={130} text="17 × 24 = ?" sub="a task with a known answer" />
      <Arr x1={350} y1={155} x2={440} y2={155} />
      <rect x={450} y={40} width={640} height={230} rx={12} fill={C.white} stroke={C.s2} strokeWidth={3} />
      <text x={480} y={90} fontSize={26} fill={C.s2} fontWeight={600}>the model writes</text>
      <text x={480} y={140} fontSize={30} fontFamily={mono} fill={C.soft}>17 × 20 = 340</text>
      <text x={480} y={185} fontSize={30} fontFamily={mono} fill={C.soft}>17 × 4 = 68</text>
      <text x={480} y={232} fontSize={30} fontFamily={mono} fill={C.ink}>340 + 68 = 408</text>
      <Arr x1={1090} y1={155} x2={1180} y2={155} />
      <Box x={1190} y={90} w={300} h={130} text="checker" sub="is the final answer 408?" color={C.truth} />
      <Arr x1={1490} y1={155} x2={1560} y2={155} />
      <Box x={1570} y={90} w={110} h={130} text="1" color={C.truth} size={56} />
      <text x={850} y={380} textAnchor="middle" fontSize={32} fill={C.ink}>Other checkers: unit tests for code, an exact match for a proof step, a game that is won or lost.</text>
      <text x={850} y={450} textAnchor="middle" fontSize={30} fill={C.soft}>Reasoning models are trained this way on large sets of problems with checkable answers.</text>
      <text x={850} y={540} textAnchor="middle" fontSize={30} fill={C.loss}>The checker sees only the final answer. It never sees how sure the model was.</text>
    </svg>
  </Frame>
);

const RLVRCode: Page = () => (
  <Frame
    part={5}
    title="RLVR on code: the checker is a test suite"
    line="The objective in words: raise the share of tasks whose final answer passes the check. The reward is the same for a lucky guess and for a careful solution."
  >
    <div style={{ ...row, gap: 40, alignItems: 'center', height: '100%' }}>
      <div style={{ width: 800 }}>
        <Label>Task given to the model</Label>
        <div style={{ fontSize: 28, margin: '6px 0 14px' }}>Write a function that returns True when n is even.</div>
        <Label color={C.s2}>The model writes</Label>
        <div style={{ height: 8 }} />
        <Code
          size={28}
          code={`
def is_even(n):
    return n % 2 == 0
`}
        />
      </div>
      <Steps>
        <Step>
          <Window title="test runner" width={820}>
            <div style={{ fontFamily: mono, fontSize: 25, lineHeight: 1.6 }}>
              <div>
                is_even(4) == True <span style={{ color: C.truth, float: 'right' }}>passed</span>
              </div>
              <div>
                is_even(7) == False <span style={{ color: C.truth, float: 'right' }}>passed</span>
              </div>
              <div>
                is_even(0) == True <span style={{ color: C.truth, float: 'right' }}>passed</span>
              </div>
              <div style={{ borderTop: `2px solid ${C.rule}`, marginTop: 12, paddingTop: 12, fontSize: 30 }}>
                3 of 3 passed → reward <b style={{ color: C.truth }}>1</b>
              </div>
              <div style={{ fontSize: 24, color: C.muted, marginTop: 6 }}>any failed test → reward 0</div>
            </div>
          </Window>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const RLCard = ({ name, full, pays, side, color }: { name: string; full: string; pays: string; side: string; color: string }) => (
  <Card color={color} style={{ width: 825, padding: '32px 38px' }}>
    <div style={{ fontFamily: serif, fontSize: 68, fontWeight: 700, color }}>{name}</div>
    <div style={{ fontSize: 28, color: C.muted, marginBottom: 26 }}>{full}</div>
    <Label>The reward is given for</Label>
    <div style={{ fontSize: 34, lineHeight: 1.4, margin: '8px 0 24px' }}>{pays}</div>
    <Label color={C.loss}>What it ignores</Label>
    <div style={{ fontSize: 34, lineHeight: 1.4, marginTop: 8, color: C.soft }}>{side}</div>
  </Card>
);

const RLTwo: Page = () => (
  <Frame
    part={5}
    title="What the two rewards measure, and what they ignore"
    line="Neither reward looks at probabilities, so a model trained this way is never taught how sure it should be."
  >
    <div style={{ ...row, gap: 50, alignItems: 'stretch', marginTop: 16 }}>
      <RLCard
        name="RLHF"
        full="reinforcement learning from human feedback"
        pays="the answer people prefer out of two"
        side="doubt. People prefer confident answers, so the model learns to sound sure"
        color={C.s2}
      />
      <Steps>
        <Step>
          <RLCard
            name="RLVR"
            full="reinforcement learning with verifiable rewards"
            pays="a final answer that passes a check, such as unit tests"
            side="how likely the answer was to be right"
            color={C.s2}
          />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const RLCD: Page = () => (
  <Frame
    part={5}
    title="RLCD: reinforcement learning for calibrated decisions"
    line="RLCD is TypeSafe’s name for how Jev is trained. They have published only the goal, so in the next slides we build our own reward with the same goal."
  >
    <div style={{ ...row, gap: 60, alignItems: 'center', height: '100%' }}>
      <Card color={C.s1} style={{ flex: 1, padding: '36px 40px' }}>
        <Label color={C.s1}>The stated goal</Label>
        <div style={{ fontFamily: serif, fontSize: 50, lineHeight: 1.3, marginTop: 16 }}>
          Reward the model when its <span style={{ color: C.pred }}>probabilities</span> turn out to be{' '}
          <span style={{ color: C.truth }}>right</span>.
        </div>
      </Card>
      <Steps>
        <Step>
          <div style={{ width: 640 }}>
            <Label color={C.loss}>Not published</Label>
            <Fact k="Reward" v="unknown" />
            <Fact k="Training examples" v="unknown format; synthetic" />
            <Fact k="Loss" v="unknown" />
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Mail = ({ x, yes, known = true }: { x: number; yes: boolean; known?: boolean }) => {
  const fill = !known ? C.panel : yes ? C.truth : C.white;
  const edge = !known ? C.muted : yes ? C.truth : C.muted;
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={0} y={0} width={120} height={84} rx={8} fill={fill} stroke={edge} strokeWidth={3} />
      <path d="M6,8 L60,50 L114,8" fill="none" stroke={known && yes ? C.white : C.muted} strokeWidth={3} />
      <text x={60} y={124} textAnchor="middle" fontSize={26} fill={!known ? C.muted : yes ? C.truth : C.muted} fontWeight={600}>
        {!known ? '?' : yes ? 'yes' : 'no'}
      </text>
    </g>
  );
};

const TenMails = ({ known = true }: { known?: boolean }) => (
  <svg width={1500} height={140} viewBox="0 0 1500 140">
    {Array.from({ length: 10 }, (_, i) => (
      <Mail key={i} x={10 + i * 150} yes={i < 7} known={known} />
    ))}
  </svg>
);

const OneAmbiguous: Page = () => (
  <Frame
    part={5}
    title="Start with one email and one question"
    line="The email does not say what the customer wants done. From the text alone, the best possible answer is a probability, because the text does not settle the question."
  >
    <div style={{ ...row, gap: 60, alignItems: 'center', height: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <EmailCard width={700} />
        <div style={{ fontSize: 34, marginTop: 30 }}>
          Question: <b>Is the customer asking for a refund?</b>
        </div>
      </div>
      <Steps>
        <Step>
          <div style={{ ...col, gap: 22, width: 800 }}>
            <Card color={C.truth} style={{ padding: '20px 28px' }}>
              <Label color={C.truth}>The customer may mean</Label>
              <div style={{ fontSize: 31, marginTop: 6 }}>“Send the extra charge back to my card.” <b>Yes, a refund.</b></div>
            </Card>
            <Card style={{ padding: '20px 28px' }}>
              <Label>Or may mean</Label>
              <div style={{ fontSize: 31, marginTop: 6 }}>“Count it towards next month and stop charging twice.” <b>No refund.</b></div>
            </Card>
            <div style={{ fontSize: 30, color: C.pred }}>The model has to answer with one number, P(yes).</div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const TenAlike: Page = () => (
  <Frame
    part={5}
    title="Ten customers send almost the same email"
    line="A model gives the same output for the same input. These ten emails read the same, so all ten get the same P(yes), whatever number that is."
  >
    <div style={{ ...col, gap: 28, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ fontFamily: serif, fontSize: 38 }}>“{EMAIL}” × 10</div>
      <TenMails known={false} />
      <Steps>
        <Step>
          <div style={{ ...row, gap: 30, alignItems: 'center', fontFamily: mono, fontSize: 36 }}>
            <span style={{ color: C.soft }}>same text in</span>
            <span>→</span>
            <span style={{ border: `3px solid ${C.s2}`, borderRadius: 10, padding: '8px 22px', color: C.s2 }}>model</span>
            <span>→</span>
            <span style={{ color: C.pred }}>same P(yes) = p for all ten</span>
          </div>
        </Step>
        <Step>
          <div style={{ fontSize: 30, color: C.soft }}>At this point nobody knows which of the ten want a refund, including the model.</div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const TruthLater: Page = () => (
  <Frame
    part={5}
    title="Later, support staff resolve the ten tickets"
    line="Now we know the correct answer for each email: seven wanted a refund and three did not. These answers arrive after the model has spoken, and training uses them."
  >
    <div style={{ ...col, gap: 30, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ fontSize: 34 }}>
        The correct answer to <b>“Is the customer asking for a refund?”</b>
      </div>
      <TenMails />
      <Steps>
        <Step>
          <div style={{ ...row, gap: 70, fontFamily: mono, fontSize: 40, marginTop: 10 }}>
            <span style={{ color: C.truth }}>7 yes</span>
            <span style={{ color: C.muted }}>3 no</span>
            <span>
              <span style={{ color: C.truth }}>7</span> / 10 = <b style={{ color: C.truth }}>0.7</b> wanted a refund
            </span>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const HonestyQ: Page = () => (
  <Frame
    part={5}
    title="Which number should the model have said?"
    line="A calibrated model says 0.7 here, since 7 of the 10 emails it gave that number to were “yes”. The next two slides ask which reward pushes a model towards 0.7."
  >
    <div style={{ ...col, gap: 26, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ transform: 'scale(0.8)' }}>
        <TenMails />
      </div>
      <div style={{ ...row, gap: 40 }}>
        <Card style={{ width: 470, textAlign: 'center', padding: '18px 26px' }}>
          <div style={{ fontFamily: mono, fontSize: 72, color: C.pred }}>0.70</div>
          <div style={{ fontSize: 27, color: C.soft }}>matches what happened: 7 of 10</div>
        </Card>
        <Card style={{ width: 470, textAlign: 'center', padding: '18px 26px' }}>
          <div style={{ fontFamily: mono, fontSize: 72, color: C.pred }}>0.99</div>
          <div style={{ fontSize: 27, color: C.soft }}>sounds sure, and 3 of 10 were “no”</div>
        </Card>
      </div>
      <Steps>
        <Step>
          <div style={{ fontSize: 30, textAlign: 'center', lineHeight: 1.45 }}>
            Either way the model’s single best answer is “yes”, because P(yes) is above 0.5.
            <br />
            <span style={{ color: C.loss }}>The two models differ only in how sure they claim to be.</span>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const PRow = ({ say, a, b, c, best }: { say: string; a: string; b: string; c: string; best?: boolean }) => (
  <div style={{ ...row, alignItems: 'center', height: 92, fontFamily: mono, fontSize: 34, background: best ? '#e6f2ef' : 'transparent', borderRadius: 10, padding: '0 22px', borderTop: `2px solid ${C.rule}` }}>
    <div style={{ width: 340, color: C.pred, whiteSpace: 'nowrap' }}>P(yes) = {say}</div>
    <div style={{ width: 300, fontFamily: 'var(--osd-font-body)', fontSize: 30 }}>{a}</div>
    <div style={{ width: 590, color: C.soft, whiteSpace: 'nowrap' }}>{b}</div>
    <div style={{ fontWeight: 700 }}>{c}</div>
  </div>
);

const AccReward: Page = () => (
  <Frame
    part={5}
    title="Reward A: one point for each right answer"
    line="This reward looks only at the answer, and the answer is “yes” whenever P(yes) is above 0.5. Both models score 7 points, so this reward cannot teach a model to say 0.7."
  >
    <div style={{ ...col, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ transform: 'scale(0.8)', marginBottom: 10 }}>
        <TenMails />
      </div>
      <div>
        <div style={{ ...row, fontSize: 23, letterSpacing: '0.08em', fontWeight: 600, color: C.muted, padding: '0 22px', height: 44 }}>
          <div style={{ width: 340 }}>THE MODEL SAYS</div>
          <div style={{ width: 300 }}>SO IT ANSWERS</div>
          <div style={{ width: 590 }}>POINTS</div>
          <div>TOTAL</div>
        </div>
        <PRow say="0.70" a="yes, ten times" b="7 right × 1 + 3 wrong × 0" c="7" />
        <Steps>
          <Step>
            <PRow say="0.99" a="yes, ten times" b="7 right × 1 + 3 wrong × 0" c="7" />
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

const BrierOne: Page = () => (
  <Frame
    part={5}
    title="Reward B: a penalty that looks at the stated probability"
    line="This is the Brier score for one email. y is 1 if the customer did want a refund and 0 if not, and a lower penalty is better. Being sure and wrong costs 81 times more."
  >
    <div style={{ ...col, gap: 60, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Eq size={76}>
        <span style={{ color: C.loss }}>penalty</span> = ( <I color={C.pred}>p</I> − <I color={C.truth}>y</I> )<sup style={{ fontSize: 44 }}>2</sup>
      </Eq>
      <div style={{ ...row, gap: 60 }}>
        <Steps>
          <Step>
            <Card style={{ width: 660, textAlign: 'center' }}>
              <div style={{ fontSize: 27, color: C.soft, whiteSpace: 'nowrap' }}>
                says <span style={{ color: C.pred }}>P(yes) = 0.9</span>, and the truth is <span style={{ color: C.truth }}>yes (y = 1)</span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 48, marginTop: 16 }}>
                (0.9 − 1)² = <span style={{ color: C.loss }}>0.01</span>
              </div>
            </Card>
          </Step>
          <Step>
            <Card style={{ width: 660, textAlign: 'center' }}>
              <div style={{ fontSize: 27, color: C.soft, whiteSpace: 'nowrap' }}>
                says <span style={{ color: C.pred }}>P(yes) = 0.9</span>, and the truth is <span style={{ color: C.truth }}>no (y = 0)</span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 48, marginTop: 16 }}>
                (0.9 − 0)² = <span style={{ color: C.loss }}>0.81</span>
              </div>
            </Card>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

const EB = ({ say, calc, val, best }: { say: string; calc: string; val: string; best?: boolean }) => (
  <div style={{ ...row, alignItems: 'center', height: 86, fontFamily: mono, fontSize: 36, background: best ? '#e6f2ef' : 'transparent', borderRadius: 10, padding: '0 20px' }}>
    <div style={{ width: 190, color: C.pred }}>say {say}</div>
    <div style={{ width: 560, color: C.soft }}>{calc}</div>
    <div style={{ width: 150, color: C.loss, fontWeight: 700 }}>= {val}</div>
  </div>
);

const BrierCurve = () => {
  const X = (v: number) => 70 + v * 440;
  const Y = (v: number) => 30 + ((0.52 - v) / 0.34) * 400;
  const f = (q: number) => 0.7 * (1 - q) ** 2 + 0.3 * q ** 2;
  const xs = Array.from({ length: 41 }, (_, i) => 0.2 + i * 0.02);
  return (
    <svg width={560} height={520} viewBox="0 0 560 520">
      <line x1={X(0.2)} y1={Y(0.18)} x2={X(1)} y2={Y(0.18)} stroke={C.rule} strokeWidth={3} />
      <polyline points={xs.map((q) => `${X(q)},${Y(f(q))}`).join(' ')} fill="none" stroke={C.loss} strokeWidth={5} />
      <line x1={X(0.7)} y1={Y(0.21)} x2={X(0.7)} y2={Y(0.18)} stroke={C.truth} strokeWidth={3} strokeDasharray="8 6" />
      <circle cx={X(0.7)} cy={Y(0.21)} r={11} fill={C.truth} />
      <text x={X(0.7)} y={Y(0.335)} textAnchor="middle" fontSize={26} fill={C.truth}>lowest at 0.7</text>
      {[0.3, 0.5, 0.7, 0.9].map((v) => (
        <text key={v} x={X(v)} y={Y(0.18) + 34} textAnchor="middle" fontSize={24} fill={C.soft}>{v.toFixed(1)}</text>
      ))}
      <text x={X(0.6)} y={Y(0.18) + 74} textAnchor="middle" fontSize={26} fill={C.pred}>stated probability</text>
      <text x={X(0.25)} y={Y(0.5)} fontSize={26} fill={C.loss}>total penalty</text>
    </svg>
  );
};

const BrierExpected: Page = () => (
  <Frame
    part={5}
    title="Add the penalty over the ten emails"
    line="Seven emails are “yes” and three are “no”. The total penalty is lowest when the model says 0.7. A penalty with this property is called a proper scoring rule."
  >
    <div style={{ ...row, gap: 30, alignItems: 'center', height: '100%' }}>
      <div style={col}>
        <EB say="0.5" calc="7 × 0.25 + 3 × 0.25" val="2.50" />
        <Steps>
          <Step>
            <EB say="0.9" calc="7 × 0.01 + 3 × 0.81" val="2.50" />
          </Step>
          <Step>
            <EB say="1.0" calc="7 × 0.00 + 3 × 1.00" val="3.00" />
          </Step>
          <Step>
            <EB say="0.7" calc="7 × 0.09 + 3 × 0.49" val="2.10" best />
          </Step>
        </Steps>
      </div>
      <Steps>
        <Step>
          <BrierCurve />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const LogScore: Page = () => (
  <Frame
    part={5}
    title="Cross-entropy is also a proper scoring rule"
    line="Cross-entropy, the usual classification loss, is the log score. A classifier head trained with it is rewarded for reporting correct probabilities."
  >
    <div style={{ ...col, gap: 34, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Eq size={62}>
        <span style={{ color: C.loss }}>loss</span> = − log <I color={C.pred}>p</I>
        <sub style={{ fontSize: 34, color: C.truth }}>correct option</sub>
      </Eq>
      <Steps>
        <Step>
          <div style={{ fontFamily: mono, fontSize: 34, lineHeight: 1.6, textAlign: 'center' }}>
            <div>
              gave the correct option <span style={{ color: C.pred }}>0.9</span> → −log 0.9 = <span style={{ color: C.loss }}>0.11</span>
            </div>
            <div>
              gave the correct option <span style={{ color: C.pred }}>0.1</span> → −log 0.1 = <span style={{ color: C.loss }}>2.30</span>
            </div>
          </div>
        </Step>
        <Step>
          <div style={{ fontFamily: mono, fontSize: 32, lineHeight: 1.7, borderTop: `2px solid ${C.rule}`, paddingTop: 18 }}>
            <div style={{ fontFamily: 'var(--osd-font-body)', fontSize: 27, color: C.soft }}>
              On the ten emails: 7 “yes” emails get −log p, and 3 “no” emails get −log(1 − p)
            </div>
            <div>
              <span style={{ color: C.pred }}>say 0.70</span> → 7 × 0.357 + 3 × 1.204 = <b style={{ color: C.loss }}>6.11</b>
            </div>
            <div>
              <span style={{ color: C.pred }}>say 0.99</span> → 7 × 0.010 + 3 × 4.605 = <b style={{ color: C.loss }}>13.89</b>
            </div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Idea = ({ n, head, children }: { n: string; head: string; children: ReactNode }) => (
  <Card style={{ width: 540, padding: '26px 30px' }}>
    <div style={{ fontFamily: serif, fontSize: 64, fontWeight: 700, color: C.s1, lineHeight: 1 }}>{n}</div>
    <div style={{ fontSize: 34, fontWeight: 600, margin: '12px 0 10px', lineHeight: 1.2 }}>{head}</div>
    <div style={{ fontSize: 27, lineHeight: 1.4, color: C.soft }}>{children}</div>
  </Card>
);

const RLCDIdeas: Page = () => (
  <Frame
    part={5}
    title="How a reward for calibrated decisions can be built"
    line="This is our reading of what such training needs, and Unsloth’s trainer follows similar steps. Whether Jev’s RLCD works this way has not been published."
  >
    <div style={{ ...row, gap: 40, alignItems: 'stretch' }}>
      <Idea n="1" head="Questions with known answers">
        Many states, each with typed questions and the correct answer: “Refund?” yes. “Team?” billing. They can be labelled by people or
        generated.
      </Idea>
      <Steps>
        <Step>
          <Idea n="2" head="A proper scoring rule as the reward">
            The model reports probabilities. The reward is the negative Brier penalty or the log of the probability it gave the correct answer.
          </Idea>
        </Step>
        <Step>
          <Idea n="3" head="Calibration on held-out rows">
            Rows kept out of training are used to fit a temperature per question type, as we did with T = {sci.zs.T.toFixed(1)} in Part 4.
          </Idea>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ fontSize: 28, lineHeight: 1.4, color: C.ink, marginTop: 26, background: C.panel, borderRadius: 'var(--osd-radius)', padding: '16px 24px' }}>
          Is this reinforcement learning or supervised learning? When the correct answer is known and the reward is a proper scoring rule,
          raising the reward is the same as lowering a supervised loss. Nothing has to be sampled.
        </div>
      </Step>
    </Steps>
  </Frame>
);

const HeadWhy: Page = () => (
  <Frame
    part={5}
    title="Why add a head of our own"
    line="The LLM has already understood the news item. The weak step is the last one, where an output layer built for next-token prediction is asked a topic question through letters."
  >
    <div style={{ ...row, gap: 40, alignItems: 'stretch', marginTop: 10 }}>
      <Card style={{ width: 830, padding: '30px 34px' }} color={C.muted}>
        <Label>What Part 3 did</Label>
        <div style={{ fontSize: 32, lineHeight: 1.45, marginTop: 12 }}>
          Used the LLM’s own output layer. It gives {sci.vocab.toLocaleString('en-US')} scores, one per token, and we kept the four for A, B, C and D.
        </div>
        <div style={{ ...row, gap: 50, marginTop: 26, fontFamily: mono, fontSize: 34 }}>
          <span style={{ color: C.truth }}>accuracy {f2(sci.zs.accuracy)}</span>
          <span style={{ color: C.pred }}>confidence {f2(sci.zs.mean_conf)}</span>
        </div>
        <div style={{ fontSize: 25, color: C.muted, marginTop: 8 }}>on the 1,000 test items, before any temperature</div>
      </Card>
      <Steps>
        <Step>
          <Card style={{ width: 830, padding: '30px 34px' }} color={C.s1}>
            <Label color={C.s1}>The idea</Label>
            <div style={{ fontSize: 32, lineHeight: 1.45, marginTop: 12 }}>
              Keep everything the LLM computes up to its last step. Replace that last step with a small layer that has exactly four outputs, one per
              topic, and train only this layer on labelled news items.
            </div>
            <div style={{ fontSize: 28, color: C.soft, marginTop: 18 }}>This small layer is called a decision head.</div>
          </Card>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const HeadVector: Page = () => (
  <Frame
    part={5}
    title="What the head reads: the last vector"
    line={`After the ${sci.layers} blocks, every position holds a vector of ${sci.hidden} numbers. Attention has let the last position look at every token before it, so its vector summarises the whole prompt.`}
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <text x={60} y={36} fontSize={26} fill={C.muted}>the prompt, as tokens</text>
      {['News:', 'Sensex', 'closes', '…', 'Which', 'topic', '?', 'Answer', ':'].map((t, i) => (
        <g key={i}>
          <rect x={60 + i * 172} y={54} width={156} height={62} rx={10} fill={C.white} stroke={C.rule} strokeWidth={3} />
          <text x={138 + i * 172} y={95} textAnchor="middle" fontSize={26} fontFamily={mono}>{t}</text>
          <line x1={138 + i * 172} y1={116} x2={138 + i * 172} y2={176} stroke={C.soft} strokeWidth={2} />
          <line x1={138 + i * 172} y1={326} x2={138 + i * 172} y2={392} stroke={i === 8 ? C.pred : C.soft} strokeWidth={i === 8 ? 5 : 2} markerEnd={i === 8 ? undefined : undefined} />
          <rect x={98 + i * 172} y={392} width={80} height={150} rx={8} fill={i === 8 ? C.pred : C.panel} stroke={i === 8 ? C.pred : C.rule} strokeWidth={3} opacity={i === 8 ? 1 : 0.7} />
        </g>
      ))}
      <rect x={40} y={176} width={1580} height={150} rx={14} fill={C.white} stroke={C.s2} strokeWidth={4} />
      <text x={830} y={244} textAnchor="middle" fontSize={38} fontWeight={600} fill={C.s2}>{sci.layers} transformer blocks · frozen</text>
      <text x={830} y={292} textAnchor="middle" fontSize={27} fill={C.soft}>frozen means none of its {sci.params_M} M parameters change during our training</text>
      <text x={60} y={590} fontSize={26} fill={C.muted}>one vector of {sci.hidden} numbers per position</text>
      <text x={1560} y={590} textAnchor="end" fontSize={32} fontWeight={700} fill={C.pred}>last vector h</text>
      <text x={1560} y={630} textAnchor="end" fontSize={26} fill={C.pred}>{sci.hidden} numbers · the only thing the head sees</text>
    </svg>
  </Frame>
);

const HeadMath: Page = () => (
  <Frame
    part={5}
    title="What the head computes: one weighted sum per topic"
    line={`This toy uses 3 numbers in place of ${sci.hidden}. The real head has ${sci.hidden} weights and 1 bias for each of 4 topics: ${sci.hidden} × 4 + 4 = ${sci.head.params.toLocaleString('en-US')} parameters.`}
  >
    <div style={{ ...col, gap: 26, justifyContent: 'center', height: '100%' }}>
      <div style={{ ...row, gap: 60, alignItems: 'center' }}>
        <Eq size={46}>
          score<sub style={{ fontSize: 26 }}>topic</sub> = <span style={{ color: C.s1 }}>w</span>
          <sub style={{ fontSize: 26, color: C.s1 }}>topic</sub> · <span style={{ color: C.pred }}>h</span> + <span style={{ color: C.s1 }}>b</span>
          <sub style={{ fontSize: 26, color: C.s1 }}>topic</sub>
        </Eq>
        <div style={{ fontFamily: mono, fontSize: 34 }}>
          last vector <span style={{ color: C.pred }}>h = [0.5, −1.0, 2.0]</span> <span style={{ fontSize: 24, color: C.muted, fontFamily: 'var(--osd-font-body)' }}>illustrative</span>
        </div>
      </div>
      <Steps>
        <Step>
          <div style={{ fontFamily: mono, fontSize: 30, lineHeight: 1.7, borderTop: `2px solid ${C.rule}`, paddingTop: 16, whiteSpace: 'nowrap' }}>
            <div style={{ fontFamily: 'var(--osd-font-body)', fontWeight: 600 }}>
              Sports <span style={{ color: C.s1, fontFamily: mono, fontWeight: 400 }}>w = [1.0, 0.2, 0.5], b = 0.1</span>
            </div>
            <span style={{ color: C.s1 }}>1.0</span> × <span style={{ color: C.pred }}>0.5</span> + <span style={{ color: C.s1 }}>0.2</span> ×{' '}
            <span style={{ color: C.pred }}>(−1.0)</span> + <span style={{ color: C.s1 }}>0.5</span> × <span style={{ color: C.pred }}>2.0</span> +{' '}
            <span style={{ color: C.s1 }}>0.1</span> = 0.5 − 0.2 + 1.0 + 0.1 = <b>1.4</b>
          </div>
        </Step>
        <Step>
          <div style={{ fontFamily: mono, fontSize: 30, lineHeight: 1.7, borderTop: `2px solid ${C.rule}`, paddingTop: 16, whiteSpace: 'nowrap' }}>
            <div style={{ fontFamily: 'var(--osd-font-body)', fontWeight: 600 }}>
              Business <span style={{ color: C.s1, fontFamily: mono, fontWeight: 400 }}>w = [−0.4, 1.0, 0.3], b = 0.0</span>
            </div>
            <span style={{ color: C.s1 }}>−0.4</span> × <span style={{ color: C.pred }}>0.5</span> + <span style={{ color: C.s1 }}>1.0</span> ×{' '}
            <span style={{ color: C.pred }}>(−1.0)</span> + <span style={{ color: C.s1 }}>0.3</span> × <span style={{ color: C.pred }}>2.0</span> +{' '}
            <span style={{ color: C.s1 }}>0.0</span> = −0.2 − 1.0 + 0.6 + 0.0 = <b>−0.6</b>
          </div>
        </Step>
        <Step>
          <div style={{ fontSize: 30, color: C.soft, borderTop: `2px solid ${C.rule}`, paddingTop: 16 }}>
            The scores, one per topic, go through the same softmax as before to become probabilities. Training adjusts only the orange numbers.
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const HeadTwoPhases: Page = () => (
  <Frame
    part={5}
    title="Training happens in two phases"
    line={`The slow part runs once: ${sci.head.n_train.toLocaleString('en-US')} forward passes of the frozen LLM, with each last vector saved. After that the head trains on the saved vectors in seconds.`}
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <text x={20} y={50} fontSize={30} fontWeight={700} fill={C.s2}>Phase 1 · once</text>
      <Box x={20} y={80} w={360} h={130} text={`${sci.head.n_train.toLocaleString('en-US')} news items`} sub="each with its correct topic" />
      <Arr x1={380} y1={145} x2={470} y2={145} />
      <Box x={480} y={80} w={360} h={130} text="frozen LLM" sub="one forward pass per item" color={C.s2} />
      <Arr x1={840} y1={145} x2={930} y2={145} />
      <Box x={940} y={80} w={420} h={130} text="H: saved last vectors" sub={`${sci.head.n_train.toLocaleString('en-US')} rows × ${sci.hidden} numbers`} color={C.pred} />
      <Box x={1420} y={80} w={260} h={130} text="y: topics" sub={`${sci.head.n_train.toLocaleString('en-US')} labels`} color={C.truth} />
      <text x={20} y={340} fontSize={30} fontWeight={700} fill={C.s1}>Phase 2 · 300 steps, a few seconds</text>
      <Box x={20} y={370} w={360} h={130} text="H" sub="all saved vectors" color={C.pred} />
      <Arr x1={380} y1={435} x2={470} y2={435} />
      <Box x={480} y={370} w={360} h={130} text="decision head" sub="4 scores per row" color={C.s1} />
      <Arr x1={840} y1={435} x2={930} y2={435} />
      <Box x={940} y={370} w={420} h={130} text="cross-entropy with y" sub="the log score from the last slides" color={C.loss} />
      <path d="M1150,500 L1150,580 L660,580 L660,512" fill="none" stroke={C.loss} strokeWidth={4} markerEnd="url(#ah)" />
      <text x={905} y={620} textAnchor="middle" fontSize={28} fill={C.loss}>adjust the head’s {sci.head.params.toLocaleString('en-US')} numbers, then repeat</text>
    </svg>
  </Frame>
);

const DEMO = sci.head.demo as unknown as { text: string; probs: Record<string, number> }[];

const HeadDemo: Page = () => (
  <Frame
    part={5}
    title="The trained head on three new headlines"
    line="These headlines were written for this lecture and are in none of the datasets. Each prediction is one forward pass of the frozen LLM followed by the head."
  >
    <div style={{ ...row, gap: 34, alignItems: 'stretch', marginTop: 10 }}>
      {DEMO.map((d) => (
        <Card key={d.text} style={{ width: 544, padding: '24px 26px' }}>
          <div style={{ fontFamily: serif, fontSize: 29, lineHeight: 1.35, height: 160 }}>“{d.text}”</div>
          {Object.entries(d.probs).map(([t, v]) => {
            const best = v === Math.max(...Object.values(d.probs));
            return (
              <div key={t} style={{ ...row, alignItems: 'center', gap: 12, height: 50 }}>
                <div style={{ width: 130, fontSize: 26, textAlign: 'right', fontWeight: best ? 700 : 400 }}>{short(t)}</div>
                <div style={{ width: 240, height: 28, background: C.panel, borderRadius: 5 }}>
                  <div style={{ width: Math.max(3, 240 * v), height: 28, background: best ? C.pred : C.muted, borderRadius: 5 }} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 26, color: best ? C.pred : C.muted }}>{f2(v)}</div>
              </div>
            );
          })}
        </Card>
      ))}
    </div>
  </Frame>
);

const HeadFigure: Page = () => (
  <Frame
    part={5}
    title="The same three designs, now for the news question"
    line={`In Part 4 we used the middle design and got accuracy ${f2(sci.zs.accuracy)}. Now we build the right one: a head with 4 outputs and ${sci.head.params.toLocaleString('en-US')} parameters, the only part we train.`}
  >
    <ArchFig
      dimFirst
      opts={['World', 'Sports', 'Business', 'Sci/Tech']}
      written="the topic, as text"
      readout={`accuracy ${f2(sci.zs.accuracy)} · confidence ${f2(sci.zs.mean_conf)}`}
      head="one probability per topic"
      notes={[
        ['not used here', 'we do not need text'],
        ['Part 4 · nothing trained', `4 of ${sci.vocab.toLocaleString('en-US')} scores are read`],
        [`${sci.hidden} × 4 + 4 = ${sci.head.params.toLocaleString('en-US')} parameters`, 'trained on 2,000 labelled news items'],
      ]}
    />
  </Frame>
);

const HeadCode: Page = () => (
  <Frame
    part={5}
    title="The head and its training loop"
    line={`H holds one ${sci.hidden}-number vector per news item (${sci.head.n_train.toLocaleString('en-US')} items), y the correct topic. The LLM ran once per item and is not touched again.`}
  >
    <div style={{ ...col, justifyContent: 'center', height: '100%' }}>
      <Code
        size={32}
        hl={[5]}
        code={`
head = torch.nn.Linear(896, 4)            # 896 numbers in, 4 scores out
opt  = torch.optim.AdamW(head.parameters(), lr=1e-3, weight_decay=0.1)

for step in range(300):
    logits = head(H)                                  # scores for every item
    loss = F.cross_entropy(logits, y)                 # the log score
    opt.zero_grad(); loss.backward(); opt.step()
`}
      />
    </div>
  </Frame>
);

const ResRow = ({ name, acc, e, color = C.ink }: { name: string; acc: number; e: number; color?: string }) => (
  <div style={{ ...row, alignItems: 'center', height: 110, borderTop: `2px solid ${C.rule}` }}>
    <div style={{ width: 520, fontSize: 36, fontWeight: 600, color }}>{name}</div>
    <div style={{ width: 520, ...row, alignItems: 'center', gap: 18 }}>
      <div style={{ width: 380 * acc, height: 44, background: C.truth, borderRadius: 6 }} />
      <span style={{ fontFamily: mono, fontSize: 36, color: C.truth }}>{f2(acc)}</span>
    </div>
    <div style={{ width: 520, ...row, alignItems: 'center', gap: 18 }}>
      <div style={{ width: Math.max(4, 1500 * e), height: 44, background: C.loss, borderRadius: 6 }} />
      <span style={{ fontFamily: mono, fontSize: 36, color: C.loss }}>{f2(e)}</span>
    </div>
  </div>
);

const HeadResults: Page = () => (
  <Frame
    part={5}
    title="Results after training, on the same 1,000 test items"
    line={`The ${sci.head.params.toLocaleString('en-US')}-parameter head trains in a few seconds. It is more accurate and much better calibrated than reading the LLM’s letter logits.`}
  >
    <div style={{ ...col, justifyContent: 'center', height: '100%' }}>
      <div style={{ ...row, height: 60, fontSize: 28, color: C.muted }}>
        <div style={{ width: 520 }} />
        <div style={{ width: 520 }}>accuracy (higher is better)</div>
        <div style={{ width: 520 }}>ECE (lower is better)</div>
      </div>
      <ResRow name="LLM letters, as read" acc={sci.zs.accuracy} e={sci.zs.ece} color={C.soft} />
      <Steps>
        <Step>
          <ResRow name="trained head" acc={sci.head.raw.accuracy} e={sci.head.raw.ece} color={C.s1} />
        </Step>
        <Step>
          <ResRow name={`trained head, T = ${sci.head.T.toFixed(1)}`} acc={sci.head.cal.accuracy} e={sci.head.cal.ece} color={C.s1} />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const UnslothRow: Page = () => (
  <Frame
    part={5}
    title="The general version: Unsloth’s decision models"
    line="Unsloth applies the same idea to any list of questions per input. Each training row has a state, its questions and the correct answers."
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <Code
          size={28}
          code={`
{
  "state": "Hi, I was charged twice for invoice #4411.
            Please refund the duplicate today.",
  "questions": {
    "team":    {"type": "choice", "criteria": {"billing": ..., ...}},
    "refund":  {"type": "noul"},
    "urgency": {"type": "score",
                "criteria": ["not urgent", "soon", "today"]}
  },
  "gold": {"team": "billing", "refund": true, "urgency": 2}
}
`}
        />
      </div>
      <div style={{ width: 430, fontSize: 30, lineHeight: 1.5, color: C.soft }}>
        <Label color={C.truth}>gold</Label>
        the correct answer to each question. For a score it is the level’s index: 2 means “today”.
      </div>
    </div>
  </Frame>
);

const UnslothCode: Page = () => (
  <Frame
    part={5}
    title="Train, calibrate, decide"
    line="The model is an LLM with LoRA adapters and a decision head. As in our notebook, calibration uses rows held out of training. Notebook 3 runs this recipe."
  >
    <div style={{ ...col, justifyContent: 'center', height: '100%' }}>
      <Code
        size={28}
        code={`
model, tok = FastDecisionModel.from_pretrained("unsloth/Qwen3.5-0.8B", load_in_4bit=True)
model = FastDecisionModel.get_peft_model(model, r=16, lora_alpha=16)

items, _ = FastDecisionModel.build_dataset(dataset, tok, model)
train_items, eval_items = FastDecisionModel.split_holdout(items, seed=3407)

DecisionTrainer(model=model, processing_class=tok, train_dataset=train_items,
                eval_dataset=eval_items, args=TrainingArguments(...)).train()

FastDecisionModel.calibrate(model, tok, eval_items)      # held-out rows
FastDecisionModel.predict(model, tok, email, questions)  # probabilities
`}
      />
    </div>
  </Frame>
);

const UBar = ({ name, a, b }: { name: string; a: number; b: number }) => (
  <div style={{ ...row, alignItems: 'center', height: 120 }}>
    <div style={{ width: 380, fontSize: 36, fontWeight: 600 }}>{name}</div>
    <div style={col}>
      <div style={{ ...row, alignItems: 'center', gap: 16, height: 46 }}>
        <div style={{ width: 1000 * a, height: 30, background: C.muted, borderRadius: 5 }} />
        <span style={{ fontFamily: mono, fontSize: 30, color: C.muted }}>{pct(a)} before</span>
      </div>
      <div style={{ ...row, alignItems: 'center', gap: 16, height: 46 }}>
        <div style={{ width: 1000 * b, height: 30, background: C.truth, borderRadius: 5 }} />
        <span style={{ fontFamily: mono, fontSize: 30, color: C.truth }}>{pct(b)} after</span>
      </div>
    </div>
  </div>
);

const UnslothNumbers: Page = () => (
  <Frame
    part={5}
    title="Unsloth’s reported accuracy for Qwen3.5-0.8B"
    line="These are Unsloth’s numbers and we have not reproduced them. They report about 4 GB of GPU memory and 42 minutes. Before training, the new head is close to guessing."
  >
    <div style={{ ...col, justifyContent: 'center', height: '100%', gap: 20 }}>
      <UBar name="typed-decisions" a={0.36} b={0.73} />
      <UBar name="BANKING77" a={0.07} b={0.74} />
      <UBar name="CLINC150" a={0.19} b={0.76} />
    </div>
  </Frame>
);

const Recap5: Page = () => (
  <Frame part={5} title="Where we are" line="Next: how a program uses a probability it can trust.">
    <div style={{ ...col, gap: 34, marginTop: 50 }}>
      <RecapItem>RLHF and RLVR reward good answers. Neither rewards a correct estimate of confidence.</RecapItem>
      <RecapItem>A proper scoring rule is lowest when the stated probability is the true one.</RecapItem>
      <RecapItem>Cross-entropy and the Brier score are both proper.</RecapItem>
      <RecapItem>
        A trained head took us from {f2(sci.zs.accuracy)} to {f2(sci.head.raw.accuracy)} accuracy and from {f2(sci.zs.ece)} to{' '}
        {f2(sci.head.cal.ece)} ECE.
      </RecapItem>
    </div>
  </Frame>
);

// ---------------------------------------------------------------- part 6

const S6: Page = () => (
  <SectionPage
    n={6}
    goal="You have a new problem: some questions are yes or no, some are a choice, the input may be an image. How do you build it, and where does it break?"
    how="Whether a head is trained per question, a recipe for a new problem, and three applications. Then thresholds, a pipeline with an LLM, and the limits."
  />
);

const TwoWays = ({ color, head, sub, rows }: { color: string; head: string; sub: string; rows: [string, string][] }) => (
  <Card color={color} style={{ width: 830, padding: '28px 34px' }}>
    <div style={{ fontFamily: serif, fontSize: 44, fontWeight: 700, color }}>{head}</div>
    <div style={{ fontSize: 27, color: C.soft, marginBottom: 14 }}>{sub}</div>
    {rows.map(([k, v]) => (
      <div key={k} style={{ ...row, gap: 20, fontSize: 28, lineHeight: 1.3, padding: '11px 0', borderTop: `2px solid ${C.rule}` }}>
        <div style={{ width: 230, color: C.muted, flexShrink: 0 }}>{k}</div>
        <div>{v}</div>
      </div>
    ))}
  </Card>
);

const PerQuestion: Page = () => (
  <Frame
    part={6}
    title="Do we train a head for every question?"
    line="The head we built answers one question. General decision models put the question and its options into the input, so a new question needs new text and no new training."
  >
    <div style={{ ...row, gap: 40, alignItems: 'stretch', marginTop: 6 }}>
      <TwoWays
        color={C.s1}
        head="A head for one question"
        sub="what we trained in Part 5"
        rows={[
          ['Question', 'fixed: “which topic?”'],
          ['Outputs', 'exactly 4, one per topic'],
          ['New question', 'new labelled data and a new head'],
          ['Good for', 'one high-volume question you have labels for'],
        ]}
      />
      <Steps>
        <Step>
          <TwoWays
            color={C.pred}
            head="One model for any question"
            sub="Jev, Liquid d1, a model trained with Unsloth"
            rows={[
              ['Question', 'written in the prompt, with its options'],
              ['Outputs', 'one score for every option it is given'],
              ['New question', 'new text in the request'],
              ['Good for', 'many different questions, some not known yet'],
            ]}
          />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const OptScore = ({ x, y, label, p, top }: { x: number; y: number; label: string; p: string; top?: boolean }) => (
  <g>
    <rect x={x} y={y} width={250} height={56} rx={8} fill={C.white} stroke={top ? C.pred : C.rule} strokeWidth={3} />
    <text x={x + 16} y={y + 37} fontSize={26} fontFamily={mono} fill={C.ink}>{label}</text>
    <line x1={x + 250} y1={y + 28} x2={x + 330} y2={y + 28} stroke={C.soft} strokeWidth={2} markerEnd="url(#ah)" />
    <text x={x + 345} y={y + 38} fontSize={30} fontFamily={mono} fill={C.pred} fontWeight={top ? 700 : 400}>{p}</text>
  </g>
);

const OnePrompt: Page = () => (
  <Frame
    part={6}
    title="One prompt holds the state, the questions and the options"
    line="The LLM reads this once. A small shared head then gives a score to every option, and the scores are turned into probabilities within each question."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <rect x={20} y={20} width={620} height={640} rx={14} fill={C.panel} stroke={C.rule} strokeWidth={3} />
      <text x={44} y={62} fontSize={24} fill={C.muted} fontWeight={600}>ONE PROMPT</text>
      <text x={44} y={108} fontSize={26} fill={C.soft}>state</text>
      <text x={44} y={146} fontSize={26} fontFamily="Georgia, serif">“I was charged twice this month,</text>
      <text x={44} y={180} fontSize={26} fontFamily="Georgia, serif">please fix it.”</text>
      <text x={44} y={240} fontSize={26} fill={C.soft}>question 1 · choice</text>
      <text x={44} y={276} fontSize={26}>Which team should handle this?</text>
      <text x={44} y={400} fontSize={26} fill={C.soft}>question 2 · noul</text>
      <text x={44} y={436} fontSize={26}>Does the customer ask for a refund?</text>
      <text x={44} y={510} fontSize={26} fill={C.soft}>question 3 · score</text>
      <text x={44} y={546} fontSize={26}>How urgent is this?</text>
      <Arr x1={640} y1={340} x2={720} y2={340} />
      <Box x={730} y={250} w={250} h={180} text="LLM" sub="reads it once" color={C.s2} size={40} />
      <Arr x1={980} y1={340} x2={1050} y2={340} />
      <text x={1070} y={50} fontSize={24} fill={C.s1} fontWeight={600}>SHARED HEAD: A SCORE PER OPTION</text>
      <OptScore x={1070} y={70} label="billing" p={f2(sci.p_team[0])} />
      <OptScore x={1070} y={134} label="technical" p={f2(sci.p_team[1])} top />
      <OptScore x={1070} y={198} label="sales" p={f2(sci.p_team[2])} />
      <OptScore x={1070} y={312} label="yes" p={f2(sci.p_refund_yes)} top />
      <OptScore x={1070} y={426} label="not urgent" p={f2(sci.p_urgency[0])} top />
      <OptScore x={1070} y={490} label="soon" p={f2(sci.p_urgency[1])} />
      <OptScore x={1070} y={554} label="today" p={f2(sci.p_urgency[2])} />
      <text x={1070} y={650} fontSize={23} fill={C.muted}>numbers are our Part 3 readout for this email</text>
    </svg>
  </Frame>
);

const Phase = ({ when, what, detail, color }: { when: string; what: string; detail: string; color: string }) => (
  <div style={{ ...row, gap: 30, alignItems: 'center', padding: '20px 0', borderTop: `2px solid ${C.rule}` }}>
    <div style={{ width: 330, fontSize: 30, fontWeight: 700, color, flexShrink: 0 }}>{when}</div>
    <div style={{ width: 520, fontSize: 32, fontWeight: 600, flexShrink: 0 }}>{what}</div>
    <div style={{ fontSize: 27, lineHeight: 1.35, color: C.soft }}>{detail}</div>
  </div>
);

const TrainOnce: Page = () => (
  <Frame
    part={6}
    title="What gets trained, and how often"
    line="Training happens once, on a mix of many questions of every type. Unsloth reports that a new head starts near chance, 30 to 37%, and reaches 73% after that training."
  >
    <div style={{ ...col, marginTop: 10 }}>
      <Phase when="Once, by whoever builds the model" what="Train the head and LoRA adapters" detail="on a large mixed set: many states, many questions, all three types in the same rows" color={C.s2} />
      <Steps>
        <Step>
          <Phase when="For each new application" what="Write the questions" detail="type, instructions and criteria; no training" color={C.pred} />
        </Step>
        <Step>
          <Phase when="Always" what="Check on your own data" detail="accuracy, a reliability diagram, and thresholds fitted on held-out rows" color={C.truth} />
        </Step>
        <Step>
          <Phase when="Only if accuracy falls short" what="Fine-tune on your labelled rows" detail="more training of the same head and adapters, or a small head of your own as in Part 5" color={C.s1} />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const StepCard = ({ n, head, body }: { n: string; head: string; body: string }) => (
  <div style={{ ...row, gap: 24, alignItems: 'flex-start', padding: '14px 0', borderTop: `2px solid ${C.rule}` }}>
    <div style={{ width: 54, height: 54, borderRadius: 27, background: 'var(--osd-accent)', color: C.white, fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ width: 520, fontSize: 31, fontWeight: 600, lineHeight: 1.3, flexShrink: 0 }}>{head}</div>
    <div style={{ fontSize: 27, lineHeight: 1.35, color: C.soft }}>{body}</div>
  </div>
);

const Recipe: Page = () => (
  <Frame
    part={6}
    title="A recipe for your own problem"
    line="Steps 2 to 5 are our advice. The vendors’ pages say one thing on this: calibrate any decision threshold on data from your own use."
  >
    <div style={{ ...col, marginTop: 4 }}>
      <StepCard n="1" head="Write the state and the questions" body="For each question choose a type: noul, choice, score, or a newer one such as a box or a count." />
      <Steps>
        <Step>
          <StepCard n="2" head="Label a small test set yourself" body="One or two hundred real inputs with the correct answers. Without this nothing below can be measured." />
        </Step>
        <Step>
          <StepCard n="3" head="Try a general model with no training" body="Record accuracy and draw the reliability diagram for each question." />
        </Step>
        <Step>
          <StepCard n="4" head="If the confidence is off, calibrate" body="Fit a temperature or thresholds on half of your labels and check on the other half." />
        </Step>
        <Step>
          <StepCard n="5" head="If the accuracy is short, train" body="Fine-tune with Unsloth on your labelled rows, or train a head on frozen vectors as in notebook 2." />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const AppRow = ({ k, children }: { k: string; children: ReactNode }) => (
  <div style={{ ...row, gap: 20, fontSize: 27, lineHeight: 1.35, padding: '12px 0', borderTop: `2px solid ${C.rule}` }}>
    <div style={{ width: 210, color: C.muted, flexShrink: 0 }}>{k}</div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);
const Q = ({ t, children }: { t: string; children: ReactNode }) => (
  <div style={{ ...row, gap: 12, alignItems: 'center', marginBottom: 6 }}>
    <TypeChip t={t} small />
    <span>{children}</span>
  </div>
);

const AppEmail: Page = () => (
  <Frame
    part={6}
    title="Application 1: sorting support email"
    line="Text in, three typed answers out. A general decision model can be tried with no training, and the thresholds come from tickets that staff have already resolved."
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <EmailCard width={560} />
      </div>
      <div style={{ flex: 1 }}>
        <AppRow k="Input">the email as text</AppRow>
        <AppRow k="Questions">
          <Q t="choice">Which team? billing · technical · sales</Q>
          <Q t="noul">Is the customer asking for a refund?</Q>
          <Q t="score">How urgent? not urgent · soon · today</Q>
        </AppRow>
        <Steps>
          <Step>
            <AppRow k="Model and head">a general text decision model; its own shared head</AppRow>
            <AppRow k="Training">none to start. Fine-tune if routing accuracy on your tickets is short.</AppRow>
          </Step>
          <Step>
            <AppRow k="Calibration">a few hundred resolved tickets, to set the 0.9 and 0.1 thresholds</AppRow>
            <AppRow k="Action">route automatically above the threshold, otherwise ask a person</AppRow>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

const AppKiln: Page = () => (
  <Frame
    part={6}
    title="Application 2: brick kilns in satellite images"
    line="An image in, a yes or no and a location out. Satellite tiles look unlike everyday photos, so we expect this one to need training on labelled tiles; measure first."
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <svg width={470} height={470} viewBox="0 0 470 470" style={{ flexShrink: 0, borderRadius: 'var(--osd-radius)' }}>
        <rect width={470} height={470} fill="#d9d2bf" />
        <rect x={0} y={0} width={210} height={150} fill="#c3cfa6" />
        <rect x={230} y={0} width={240} height={190} fill="#cbd4ae" />
        <rect x={0} y={300} width={170} height={170} fill="#c9d3ac" />
        <rect x={300} y={330} width={170} height={140} fill="#bfcb9f" />
        <path d="M0,230 L470,200" stroke="#f3efe4" strokeWidth={10} />
        <ellipse cx={250} cy={290} rx={78} ry={34} fill="#b5654a" stroke="#8c4a35" strokeWidth={4} transform="rotate(-12 250 290)" />
        <ellipse cx={250} cy={290} rx={48} ry={14} fill="#d9d2bf" transform="rotate(-12 250 290)" />
        <circle cx={250} cy={290} r={6} fill="#5b4a40" />
        <rect x={160} y={238} width={182} height={104} fill="none" stroke={C.pred} strokeWidth={5} />
        <text x={160} y={228} fontSize={22} fontFamily={mono} fill={C.pred}>kiln · found 0.93</text>
        <text x={12} y={458} fontSize={18} fill={C.soft}>drawing, with an illustrative answer</text>
      </svg>
      <div style={{ flex: 1 }}>
        <AppRow k="Input">one satellite tile</AppRow>
        <AppRow k="Questions">
          <Q t="noul">Is there a brick kiln in this tile?</Q>
          <Q t="box">Where is the kiln?</Q>
          <Q t="choice">Which kind? zigzag · fixed chimney · other</Q>
        </AppRow>
        <Steps>
          <Step>
            <AppRow k="Model and head">a decision model that takes images, such as Liquid’s d1 family</AppRow>
            <AppRow k="Training">try with none; if short, train on labelled tiles, or put a head on an image encoder</AppRow>
          </Step>
          <Step>
            <AppRow k="Calibration">tiles from a district held out of training</AppRow>
            <AppRow k="Action">send tiles above the threshold to a person for confirmation</AppRow>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

const AppGame: Page = () => (
  <Frame
    part={6}
    title="Application 3: choosing a move in a game"
    line="The board is the state and the legal moves are the options, so one forward pass gives a probability for every move. When no move stands out, a slower search takes over."
  >
    <div style={{ ...row, gap: 50, alignItems: 'center', height: '100%' }}>
      <svg width={470} height={470} viewBox="0 0 470 470" style={{ flexShrink: 0 }}>
        <rect width={470} height={470} rx={14} fill={C.white} stroke={C.rule} strokeWidth={3} />
        {[1, 2].map((i) => (
          <g key={i}>
            <line x1={35 + i * 133} y1={35} x2={35 + i * 133} y2={435} stroke={C.ink} strokeWidth={5} />
            <line x1={35} y1={35 + i * 133} x2={435} y2={35 + i * 133} stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
        {[
          ['X', 0, 0], ['O', 1, 0], ['X', 0, 1], ['O', 1, 1],
        ].map(([m, c, r]) => (
          <text key={`${c}${r}`} x={101 + (c as number) * 133} y={128 + (r as number) * 133} textAnchor="middle" fontSize={96} fontFamily="Georgia, serif" fill={m === 'X' ? C.s2 : C.s1}>{m}</text>
        ))}
        <rect x={45} y={311} width={113} height={113} rx={10} fill={`${C.pred}22`} stroke={C.pred} strokeWidth={4} />
        <text x={101} y={380} textAnchor="middle" fontSize={34} fontFamily={mono} fill={C.pred} fontWeight={700}>0.81</text>
        <text x={234} y={380} textAnchor="middle" fontSize={28} fontFamily={mono} fill={C.muted}>0.09</text>
        <text x={367} y={380} textAnchor="middle" fontSize={28} fontFamily={mono} fill={C.muted}>0.03</text>
        <text x={367} y={114} textAnchor="middle" fontSize={28} fontFamily={mono} fill={C.muted}>0.04</text>
        <text x={367} y={247} textAnchor="middle" fontSize={28} fontFamily={mono} fill={C.muted}>0.03</text>
        <text x={235} y={462} textAnchor="middle" fontSize={18} fill={C.soft}>X to move · probabilities illustrative</text>
      </svg>
      <div style={{ flex: 1 }}>
        <AppRow k="Input">the board, as text or as a picture</AppRow>
        <AppRow k="Questions">
          <Q t="choice">Which move should X play? one option per empty square</Q>
          <Q t="score">How good is this position for X? losing · even · winning</Q>
        </AppRow>
        <Steps>
          <Step>
            <AppRow k="Model and head">a decision model as a fast policy: System 1 for the game</AppRow>
            <AppRow k="Training">needed. Labels come free from a solver or from who won, the same verified reward as RLVR.</AppRow>
          </Step>
          <Step>
            <AppRow k="Calibration">positions from games held out of training</AppRow>
            <AppRow k="Action">play the top move when it is clear; otherwise run a search, which is System 2</AppRow>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

const NotFit: Page = () => (
  <Frame
    part={6}
    title="Which approach fits which problem"
    line="A decision model fits when the answer comes from a list, a scale, or a place in the input. Liquid’s own pages send text generation, summaries, code and open questions to an LLM."
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 30, marginTop: 10 }}>
      <Card color={C.pred} style={{ padding: '26px 28px' }}>
        <Label color={C.pred}>General decision model</Label>
        <div style={{ fontSize: 28, lineHeight: 1.45, marginTop: 12 }}>Many different questions, some arriving later. Little or no labelled data. Text, images or audio.</div>
      </Card>
      <Card color={C.s1} style={{ padding: '26px 28px' }}>
        <Label color={C.s1}>Your own head or fine-tune</Label>
        <div style={{ fontSize: 28, lineHeight: 1.45, marginTop: 12 }}>One or a few fixed questions at high volume, with labels. Unusual inputs such as satellite tiles or game boards.</div>
      </Card>
      <Card color={C.s2} style={{ padding: '26px 28px' }}>
        <Label color={C.s2}>A generative LLM</Label>
        <div style={{ fontSize: 28, lineHeight: 1.45, marginTop: 12 }}>The output is free text: a reply, a summary, code, an explanation, a conversation. Also problems that need steps.</div>
      </Card>
    </div>
  </Frame>
);

type Band = { from: number; to: number; label: string; color: string };
const Scale = ({ app, q, bands, why }: { app: string; q: string; bands: Band[]; why: string }) => (
  <Card style={{ width: 544, padding: '22px 26px' }}>
    <div style={{ fontFamily: serif, fontSize: 36, fontWeight: 700 }}>{app}</div>
    <div style={{ fontSize: 24, color: C.pred, height: 64, lineHeight: 1.3 }}>{q}</div>
    <div style={{ ...row, gap: 16, height: 300 }}>
      <div style={{ ...col, justifyContent: 'space-between', fontFamily: mono, fontSize: 22, color: C.soft, textAlign: 'right', width: 44, flexShrink: 0 }}>
        <span>1.0</span>
        <span>0.0</span>
      </div>
      <div style={{ ...col, width: 46, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}>
        {bands.map((b) => (
          <div key={b.label} style={{ height: 300 * (b.to - b.from), background: b.color }} />
        ))}
      </div>
      <div style={{ ...col, flex: 1, minWidth: 0 }}>
        {bands.map((b) => (
          <div key={b.label} style={{ height: 300 * (b.to - b.from), display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: `2px dashed ${C.rule}` }}>
            <div style={{ fontSize: 23, fontWeight: 600, color: b.color === C.rule ? C.ink : b.color, lineHeight: 1.15, whiteSpace: 'nowrap' }}>
              {b.label}
              <span style={{ fontFamily: mono, fontSize: 19, color: C.muted, fontWeight: 400, marginLeft: 10 }}>
                {b.from.toFixed(1)} to {b.to.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ fontSize: 24, color: C.soft, lineHeight: 1.35, marginTop: 14 }}>{why}</div>
  </Card>
);

const ThreeThresholds: Page = () => (
  <Frame
    part={6}
    title="The costly mistake decides where the thresholds go"
    line="These threshold values are illustrative. In each application they are set on labelled data, by asking which wrong action costs more."
  >
    <div style={{ ...row, gap: 34, alignItems: 'stretch' }}>
      <Scale
        app="Support email"
        q="P(the customer is asking for a refund)"
        bands={[
          { from: 0.9, to: 1.0, label: 'automatic refund', color: C.truth },
          { from: 0.1, to: 0.9, label: 'a person looks at it', color: C.rule },
          { from: 0.0, to: 0.1, label: 'not a refund', color: C.muted },
        ]}
        why="A wrong automatic refund costs money, so the automatic band is narrow."
      />
      <Steps>
        <Step>
          <Scale
            app="Brick kilns"
            q="P(there is a kiln in this tile)"
            bands={[
              { from: 0.3, to: 1.0, label: 'a person confirms', color: C.s1 },
              { from: 0.0, to: 0.3, label: 'skip the tile', color: C.muted },
            ]}
            why="A missed kiln is the costly mistake and a person checks anyway, so the bar is low."
          />
        </Step>
        <Step>
          <Scale
            app="Game move"
            q="P(the top move is the best move)"
            bands={[
              { from: 0.7, to: 1.0, label: 'play it at once', color: C.s2 },
              { from: 0.0, to: 0.7, label: 'run a search first', color: C.rule },
            ]}
            why="A search costs time and a bad move can lose the game, so only clear moves skip the search."
          />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const PRowApp = ({ y, app, a, b, c }: { y: number; app: string; a: [string, string]; b: [string, string]; c: [string, string] }) => (
  <g>
    <text x={20} y={y + 62} fontSize={32} fontFamily="Georgia, serif" fontWeight={700} fill={C.ink}>{app}</text>
    <Box x={330} y={y} w={400} h={110} text={a[0]} sub={a[1]} color={C.s1} size={28} />
    <Arr x1={730} y1={y + 55} x2={800} y2={y + 55} />
    <Box x={810} y={y} w={400} h={110} text={b[0]} sub={b[1]} color={C.s2} size={28} />
    <Arr x1={1210} y1={y + 55} x2={1280} y2={y + 55} />
    <Box x={1290} y={y} w={390} h={110} text={c[0]} sub={c[1]} size={28} />
  </g>
);

const PipelineThree: Page = () => (
  <Frame
    part={6}
    title="The same pattern in all three applications"
    line="The decision model looks at every input because it is cheap. The slow and costly step, an LLM, a person or a search, runs only on the inputs it passes on."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <text x={530} y={36} textAnchor="middle" fontSize={24} fill={C.s1} fontWeight={600}>SYSTEM 1 · EVERY INPUT</text>
      <text x={1010} y={36} textAnchor="middle" fontSize={24} fill={C.s2} fontWeight={600}>SYSTEM 2 · ONLY WHERE NEEDED</text>
      <text x={1485} y={36} textAnchor="middle" fontSize={24} fill={C.muted} fontWeight={600}>RESULT</text>
      <PRowApp y={70} app="Support email" a={['decision model', 'team, refund, urgency']} b={['LLM', 'writes the reply']} c={['reply sent', 'after a decision-model check']} />
      <PRowApp y={270} app="Brick kilns" a={['decision model', 'kiln in this tile?']} b={['a person', 'confirms flagged tiles']} c={['a map of kilns', 'for the district']} />
      <PRowApp y={470} app="Game move" a={['decision model', 'a probability per move']} b={['search', 'when no move stands out']} c={['the move is played', 'within the time limit']} />
    </svg>
  </Frame>
);

const Watch = ({ app, items }: { app: string; items: string[] }) => (
  <Card style={{ width: 544, padding: '24px 28px' }}>
    <div style={{ fontFamily: serif, fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{app}</div>
    {items.map((t) => (
      <div key={t} style={{ fontSize: 26, lineHeight: 1.35, padding: '12px 0', borderTop: `2px solid ${C.rule}`, color: C.soft }}>
        {t}
      </div>
    ))}
  </Card>
);

const LimitsApps: Page = () => (
  <Frame
    part={6}
    title="What to keep checking in each application"
    line="Calibration is measured on past data. When the inputs change, the probabilities can stop matching what happens, so the check on fresh labelled data has to be repeated."
  >
    <div style={{ ...row, gap: 34, alignItems: 'stretch' }}>
      <Watch
        app="Support email"
        items={[
          'New products bring emails unlike last year’s tickets.',
          'Rewording a question or reordering its options can move the probabilities.',
          'The model gives no reason, so disputed cases still need a person.',
        ]}
      />
      <Steps>
        <Step>
          <Watch
            app="Brick kilns"
            items={[
              'A new region or season looks different from the training tiles.',
              'Accuracy of box answers is reported only by the vendor so far.',
              'Kilns are rare, so most flagged tiles may still be false alarms.',
            ]}
          />
        </Step>
        <Step>
          <Watch
            app="Game move"
            items={[
              'Positions unlike the training games get unreliable probabilities.',
              'Counting and calculation belong in code, here the search.',
              'A confident wrong move loses the game, so test the threshold in play.',
            ]}
          />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const Thresholds: Page = () => (
  <Frame
    part={6}
    title="Application 1: thresholds turn a probability into an action"
    line="We choose the 0.9 and the 0.1. If a wrong automatic action is costly, we set them further apart. Our email reads 0.74, so a person looks at it."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <text x={130} y={40} fontSize={30} fill={C.pred}>P(refund request)</text>
      <rect x={200} y={70} width={70} height={80} fill={C.truth} rx={8} />
      <rect x={200} y={150} width={70} height={420} fill={C.rule} />
      <rect x={200} y={570} width={70} height={60} fill={C.muted} rx={8} />
      <text x={180} y={84} textAnchor="end" fontSize={30} fontFamily={mono}>1.0</text>
      <text x={180} y={160} textAnchor="end" fontSize={30} fontFamily={mono}>0.9</text>
      <text x={180} y={580} textAnchor="end" fontSize={30} fontFamily={mono}>0.1</text>
      <text x={180} y={640} textAnchor="end" fontSize={30} fontFamily={mono}>0.0</text>
      <line x1={270} y1={150} x2={1500} y2={150} stroke={C.rule} strokeWidth={3} strokeDasharray="10 8" />
      <line x1={270} y1={570} x2={1500} y2={570} stroke={C.rule} strokeWidth={3} strokeDasharray="10 8" />
      <text x={340} y={124} fontSize={40} fontWeight={600} fill={C.truth}>refund queue, automatically</text>
      <text x={340} y={375} fontSize={40} fontWeight={600} fill={C.ink}>a person looks at it</text>
      <text x={340} y={425} fontSize={30} fill={C.soft}>or a slower, bigger model does</text>
      <text x={340} y={614} fontSize={40} fontWeight={600} fill={C.muted}>not a refund, carry on</text>
      <line x1={270} y1={150 + ((0.9 - sci.p_refund_yes) / 0.8) * 420} x2={330} y2={150 + ((0.9 - sci.p_refund_yes) / 0.8) * 420} stroke={C.pred} strokeWidth={4} />
      <circle cx={235} cy={150 + ((0.9 - sci.p_refund_yes) / 0.8) * 420} r={13} fill={C.pred} />
      <text x={340} y={160 + ((0.9 - sci.p_refund_yes) / 0.8) * 420} fontSize={30} fill={C.pred}>
        our email: P(refund) = {f2(sci.p_refund_yes)}, which is between 0.1 and 0.9
      </text>
    </svg>
  </Frame>
);

const ThresholdLive: Page = () => {
  const [tau, setTau] = useState(0.8);
  const conf = sci.head.conf as number[];
  const correct = sci.head.correct as number[];
  let auto = 0;
  let wrong = 0;
  for (let i = 0; i < conf.length; i++) {
    if (conf[i] >= tau) {
      auto++;
      if (!correct[i]) wrong++;
    }
  }
  const cov = auto / conf.length;
  const err = auto ? wrong / auto : 0;
  return (
    <Frame
      part={6}
      title="Choose the threshold, read off the error rate"
      line="This is the measurement the recipe asks for, done on our trained head and the 1,000 news items. A higher threshold sends more items to a person and makes the automatic path safer."
    >
      <div style={{ ...row, gap: 70, alignItems: 'center', height: '100%' }}>
        <div style={{ width: 520, textAlign: 'center' }}>
          <div style={{ fontSize: 30, color: C.soft }}>act automatically when confidence is at least</div>
          <div style={{ fontFamily: mono, fontSize: 96, color: C.pred }}>{tau.toFixed(2)}</div>
          <input
            type="range"
            min={0.3}
            max={0.99}
            step={0.01}
            value={tau}
            onChange={(e) => setTau(Number(e.target.value))}
            onKeyDown={(e) => e.stopPropagation()}
            style={{ width: 460, accentColor: C.pred }}
          />
          <div style={{ fontSize: 26, color: C.muted, marginTop: 12 }}>drag me</div>
        </div>
        <div style={{ ...col, gap: 30, flex: 1 }}>
          <div style={{ ...row, height: 70, borderRadius: 10, overflow: 'hidden', width: 1000 }}>
            <div style={{ width: 1000 * cov, background: C.s1 }} />
            <div style={{ flex: 1, background: C.rule }} />
          </div>
          <div style={{ ...row, gap: 40 }}>
            <div style={{ width: 320 }}>
              <div style={{ fontFamily: serif, fontSize: 96, fontWeight: 700, color: C.s1 }}>{auto}</div>
              <div style={{ fontSize: 30, color: C.soft }}>handled automatically</div>
            </div>
            <div style={{ width: 320 }}>
              <div style={{ fontFamily: serif, fontSize: 96, fontWeight: 700, color: C.loss }}>{(100 * err).toFixed(1)}%</div>
              <div style={{ fontSize: 30, color: C.soft }}>wrong: {wrong} / {auto}</div>
            </div>
            <div style={{ width: 320 }}>
              <div style={{ fontFamily: serif, fontSize: 96, fontWeight: 700, color: C.muted }}>{conf.length - auto}</div>
              <div style={{ fontSize: 30, color: C.soft }}>sent to a person</div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
};

const Pipeline: Page = () => (
  <Frame
    part={6}
    title="Application 1 as a pipeline: a decision model and an LLM"
    line="The decision model routes the email, the LLM writes the reply, and the decision model checks the reply. The LLM runs only for the step that needs writing."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <Box x={20} y={240} w={230} h={130} text="email" />
      <Arr x1={250} y1={305} x2={330} y2={305} />
      <Box x={340} y={240} w={330} h={130} text="decision model" sub="which team? urgent?" color={C.s1} />
      <Arr x1={670} y1={305} x2={750} y2={305} />
      <Box x={760} y={240} w={330} h={130} text="LLM" sub="writes the reply" color={C.s2} />
      <Arr x1={1090} y1={305} x2={1170} y2={305} />
      <Box x={1180} y={240} w={330} h={130} text="decision model" sub="safe to send? on topic?" color={C.s1} />
      <Arr x1={1510} y1={305} x2={1580} y2={305} />
      <Box x={1590} y={240} w={100} h={130} text="send" size={26} />
      <text x={505} y={440} textAnchor="middle" fontSize={30} fill={C.s1}>System 1</text>
      <text x={925} y={440} textAnchor="middle" fontSize={30} fill={C.s2}>System 2</text>
      <text x={1345} y={440} textAnchor="middle" fontSize={30} fill={C.s1}>System 1</text>
      <text x={850} y={560} textAnchor="middle" fontSize={30} fill={C.soft}>
        The same check on every incoming and outgoing chatbot message is a guardrail.
      </text>
    </svg>
  </Frame>
);

const Limit = ({ head, body }: { head: string; body: string }) => (
  <Card style={{ padding: '24px 30px' }}>
    <div style={{ fontSize: 34, fontWeight: 600 }}>{head}</div>
    <div style={{ fontSize: 28, lineHeight: 1.4, color: C.soft, marginTop: 8 }}>{body}</div>
  </Card>
);

const Limits: Page = () => (
  <Frame
    part={6}
    title="Limits reported by an independent benchmark of Jev"
    line="Deußer et al., 2026, tested Jev zero-shot on 37 datasets. It beat a 27-billion-parameter open LLM on 27 of them, and the paper reports these limits."
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 10 }}>
      <Limit head="Default thresholds can fail" body="Prompt-injection detection had perfect precision but 50% recall. On UNFAIR-ToS, tuning the thresholds raised micro-F1 from 0.50 to 0.75." />
      <Limit head="No reasons" body="It returns probabilities and never shows intermediate steps." />
      <Limit head="Arithmetic belongs in code" body="The vendor advises doing sums and counting outside the model." />
      <Limit head="Unknown training data" body="The authors cannot rule out that benchmark items were seen in training." />
    </div>
  </Frame>
);

const Jevons: Page = () => (
  <Frame
    part={6}
    title="Why the name: Jevons, 1865"
    line="When a decision costs almost nothing, people will use it in places where an LLM is too slow or too expensive today."
  >
    <div style={{ ...row, gap: 60, alignItems: 'center', marginTop: 30 }}>
      <Card style={{ flex: 1 }}>
        <Label>Steam engines</Label>
        <div style={{ fontFamily: serif, fontSize: 46, lineHeight: 1.35, marginTop: 14 }}>
          Engines burned less coal per unit of work. Britain burned <b>more</b> coal in total.
        </div>
      </Card>
      <Steps>
        <Step>
          <Card style={{ width: 800 }} color={C.s1}>
            <Label color={C.s1}>The bet behind Jev</Label>
            <div style={{ fontFamily: serif, fontSize: 46, lineHeight: 1.35, marginTop: 14 }}>
              Cheap decisions will be run on every row of a database and every line of a log.
            </div>
          </Card>
        </Step>
      </Steps>
    </div>
    <Steps>
      <Step>
        <div style={{ marginTop: 40, fontFamily: mono, fontSize: 32, lineHeight: 1.6, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--osd-font-body)', fontSize: 27, color: C.soft }}>At Jev’s listed price of $0.042 per million input tokens</div>
          1,000,000 emails × 100 tokens = 100 M tokens
          <br />
          100 × $0.042 = <b style={{ color: C.s1 }}>$4.20</b> for a million decisions
        </div>
      </Step>
    </Steps>
  </Frame>
);

const Summary: Page = () => (
  <Frame part={0} title="Summary of the lecture" line="The same picture covers the support email, the satellite tile and the game board. Only the state and the questions change.">
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <Box x={20} y={30} w={300} h={130} text="state + questions" sub="email, tile or board" />
      <Arr x1={320} y1={95} x2={400} y2={95} />
      <Box x={410} y={30} w={300} h={130} text="one forward pass" sub="tokens → attention → vector" color={C.s2} />
      <Arr x1={710} y1={95} x2={790} y2={95} />
      <Box x={800} y={30} w={300} h={130} text="option scores" sub="letter logits or a trained head" color={C.s1} />
      <Arr x1={1100} y1={95} x2={1180} y2={95} />
      <Box x={1190} y={30} w={220} h={130} text="softmax" sub="÷ T" color={C.pred} />
      <Arr x1={1410} y1={95} x2={1470} y2={95} />
      <Box x={1480} y={30} w={210} h={130} text="probabilities" color={C.pred} size={28} />
      <Arr x1={1585} y1={160} x2={1585} y2={250} />
      <Box x={1380} y={260} w={310} h={130} text="thresholds" sub="act · ask a person · skip" />
      <Box x={410} y={360} w={690} h={130} text="trained with a proper scoring rule" sub="log score or Brier: lowest at the true probability" color={C.loss} />
      <Arr x1={950} y1={360} x2={950} y2={170} color={C.loss} />
      <Box x={410} y={550} w={690} h={110} text="checked with a reliability diagram and ECE" color={C.truth} />
      <path d="M1100,605 L1585,605 L1585,402" fill="none" stroke={C.soft} strokeWidth={3} markerEnd="url(#ah)" />
    </svg>
  </Frame>
);

const NB = ({ n, name, what, where }: { n: string; name: string; what: string; where: string }) => (
  <Card style={{ flex: 1, padding: '30px 34px' }}>
    <div style={{ fontFamily: serif, fontSize: 80, fontWeight: 700, color: 'var(--osd-accent)', lineHeight: 1 }}>{n}</div>
    <div style={{ fontSize: 38, fontWeight: 600, margin: '16px 0 12px' }}>{name}</div>
    <div style={{ fontSize: 29, lineHeight: 1.45, color: C.soft, height: 210 }}>{what}</div>
    <div style={{ fontSize: 26, color: C.muted }}>{where}</div>
  </Card>
);

const Notebooks: Page = () => (
  <Frame part={0} title="Three notebooks" line="Open them from github.com/nipunbatra/system-one. Every measured number in these slides comes from notebooks 1 and 2.">
    <div style={{ ...row, gap: 34, alignItems: 'stretch', marginTop: 20 }}>
      <NB n="1" name="Read, don’t write" what="Tokens, the generation loop, reading option probabilities, ECE, temperature, thresholds." where="Colab, CPU or T4 · about 2 minutes on T4" />
      <NB n="2" name="Train a decision head" what="Proper scoring rules, a linear head on a frozen LLM, calibration on held-out rows." where="Colab, CPU or T4 · about 2 minutes on T4" />
      <NB n="3" name="Unsloth decision model" what="LoRA plus a head on Qwen3.5-0.8B for choice, noul and score questions." where="Colab T4 · start it before class" />
    </div>
  </Frame>
);

const Src = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 28, lineHeight: 1.4, padding: '9px 0', borderBottom: `2px solid ${C.rule}` }}>{children}</div>
);

const Sources: Page = () => (
  <Frame part={0} title="Sources">
    <div style={{ ...col, marginTop: 6 }}>
      <Src>Martin Keen, “What Is Jev? The AI Model That Doesn’t Generate Text”, IBM Technology, 2026 (the email example, RLHF / RLVR / RLCD framing) · <a href={IBM_VIDEO} target="_blank" rel="noreferrer" style={{ color: C.s2 }}>youtube.com/watch?v=YGgNBcIgI4s</a></Src>
      <Src>Daniel Kahneman, Thinking, Fast and Slow, 2011</Src>
      <Src>Deußer, Ramamurthy, Sparrenberg, Sifa, “Evaluating and Benchmarking the System One Model Jev”, arXiv 2609.37647</Src>
      <Src>Unsloth, “Train your own Decision Model with Unsloth”, docs and notebook, 2026</Src>
      <Src>Liquid AI, “d1.2: State-of-the-Art Omnimodal Decision Models”, blog and docs, November 2026 (answer types, image and audio input)</Src>
      <Src>Guo, Pleiss, Sun, Weinberger, “On Calibration of Modern Neural Networks”, ICML 2017 (ECE, temperature scaling)</Src>
      <Src>Brier, “Verification of forecasts expressed in terms of probability”, 1950</Src>
      <Src>Jev facts: Wikipedia “Jev (AI model)” and the benchmark paper, as of November 2026</Src>
    </div>
  </Frame>
);

// ---------------------------------------------------------------- order and speaker notes

const deck: [Page, string][] = [
  [Cover, 'About 60 to 80 minutes with the three notebooks. Ask who has called an LLM API to classify something.'],
  [Email, 'Read the email aloud. Ask the class what a support system must decide before anyone replies, then reveal the three questions.'],
  [Needs, 'The bar numbers here are made up to show the shape of the output. Real numbers come in Part 3.'],
  [RouteMap, 'Six parts. Parts 2 and 4 carry the most material.'],
  [S1, undefined as unknown as string],
  [TwoSums, 'Let the class shout the first. Wait on the second before revealing.'],
  [Kahneman, 'The link opens the IBM Technology video by Martin Keen, which this lecture follows for the framing and the email example.'],
  [TwoSystems, 'Ask the class for one more example of each.'],
  [MLExamples, 'Ask which column their last course project was in. Many pipelines send left-column questions to a chat LLM.'],
  [SoftwareCalls, 'Ask for more examples from their own projects, and which column each belongs in.'],
  [VisionCalls, 'Jev is documented for text. Liquid d1.2 documents image and audio input. The questions here are our own examples, apart from the circuit board, siren and caller-language ones, which are from Liquid’s pages.'],
  [NewTypes, 'From Liquid’s d1.2 docs and blog, 16 Nov 2026. A number question with a range returns a median and an interval and has no found score. Vendor-reported accuracy only; no public benchmark covers the new types yet.'],
  [ReadValues, 'Example copied from Liquid’s d1.2 docs. The span numbers count characters from 0, and the end is exclusive. The model normalises the number and the date and still reports the text as written.'],
  [MoreExamples, 'All three from Liquid’s docs. In the multi-select answer the probabilities do not sum to 1, because each option is its own yes or no. The docs describe the interval as p10 to p90.'],
  [S2, ''],
  [Tokens, 'These are the real tokens and ids from the Qwen2.5 tokenizer. Notice the leading spaces are part of the tokens.'],
  [Embed, 'The vector values drawn are illustrative; the table size is real.'],
  [Attention, 'Weights are illustrative. The point is the mechanism: a weighted mix of earlier tokens, and only earlier ones.'],
  [Stack, 'Do not go into the block internals. One output matters for us: the last-position vector.'],
  [EncDec, 'Encoders give one vector per token and suit classification. Decoders predict the next token. Keep this in mind for Part 5, where we put a classification head on a decoder.'],
  [Logits, 'Real logits from the which-team prompt. Logits are unnormalised scores.'],
  [Softmax, 'Work it on the board first. e squared is 7.39, e is 2.72, e to the 0.1 is 1.11.'],
  [NextToken, 'Real distribution. Ask: what do you notice about A and B? Do not answer yet; Part 3 returns to this.'],
  [Loop, 'Greedy picks the top token. Sampling picks at random according to the probabilities.'],
  [LoopCode, 'Run this cell in notebook 1.'],
  [Written, 'Measured with the usual key-value cache on a MacBook. The model wrote billing here.'],
  [CoT, 'The 300 is illustrative. Reasoning models often write far more.'],
  [ThreeCosts, 'Overview. The next five slides take the three costs one at a time, with outputs from our own model.'],
  [CostTime, 'Timing is from a MacBook GPU with a 0.5 B model. A hosted LLM is faster per token, and the count of passes is the same.'],
  [LooseOutput, 'All four examples are real outputs from notebook 1. The first one also ran out of its 48-token budget in the middle of a sentence.'],
  [Repairs, 'Constrained decoding means masking the logits so that only tokens allowed by a grammar or JSON schema can be picked.'],
  [StatedConf, 'Compare with Part 4, where the same model read from logits has accuracy 0.79 and mean confidence 0.97 on 1,000 items. Different prompt and subset, same pattern.'],
  [Voting, 'The sampled prompt asks for a word, so its split differs from the letter readout in Part 3. Self-consistency is the usual name for this.'],
  [Recap2, ''],
  [S3, ''],
  [LookAgain, 'Same chart as before, with the non-option tokens dimmed. "billing" as a word also appears: the model could have answered in words.'],
  [Readout, 'Subtracting the largest logit is the standard trick to avoid huge exponentials. A real case of softmax over three numbers.'],
  [DecideCode, 'Notebook 1, section 4. Mention that option order can shift the numbers; it is an exercise in the notebook.'],
  [Timing, 'The comparison is for one question. A decision model answers all questions in the same pass.'],
  [ArchDiff, 'The grey strip stands for the 151,936 scores; the coloured cells are the ones kept. We never removed the decoder: a decoder-only transformer is still the reader. What is gone is decoding into text. How Jev is built inside is not published.'],
  [Honest, 'The small model is undecided between billing and technical, and its written JSON picked billing. An untrained model; the point is that the doubt is now visible.'],
  [Types, 'noul is the yes/no type name in Jev’s API. Its origin is not explained in the public material.'],
  [ScoreCalc, 'The model is confidently wrong about urgency. Keep this in mind for calibration. Liquid’s pages define score in two ways, the weighted level and the median level; we use the weighted one.'],
  [MoreTypes, 'How Liquid computes its newer answer types is not published. The multi-select and number readouts here are our own construction on an untrained model.'],
  [Request, 'Field names follow the Jev and Unsloth request format: state, questions, type, instructions, criteria.'],
  [Response, 'Field names follow the Jev and Liquid docs: choice with probabilities, noul as one number, score with its probabilities. I left out the confidence field because its formula is not documented.'],
  [Jev, 'Jev facts are from Wikipedia and the benchmark paper, Liquid facts from its docs and blog. The last line lists models named in secondary roundups that I have not checked against vendor pages.'],
  [Recap3, ''],
  [S4, ''],
  [Forecaster, 'Ask before revealing: how many rainy days would make you trust her?'],
  [Definition, ''],
  [ToyTable, 'Made-up predictions. Ask the class whether this model looks trustworthy at the high end.'],
  [ToyBins, 'Go bin by bin. 2.10 is 0.75 + 0.70 + 0.65. 4.50 is 0.95 + 0.90 + 0.90 + 0.90 + 0.85.'],
  [ToyDiagram, ''],
  [EceFormula, '0.3 × 0.03 is 0.009, rounded to 0.01.'],
  [EceCode, 'Notebook 1, section 5. ECE depends on the number of bins; try 15.'],
  [Shapes, 'Curves are illustrative.'],
  [RealSetup, 'Same model as before. AG News is a standard four-topic news dataset. The 500 items kept aside are used later to choose the temperature.'],
  [RealOne, 'Reveal the probability column after the class has guessed the answer from the logits. Confidence means the largest of the four probabilities.'],
  [ConfWays, 'Guo et al., 2017, define confidence as the largest predicted probability, and ECE is built on it. Parts 2 and 3 already met the other two: the written confidence and the vote count.'],
  [ConfCompare, 'The written answers come from a different prompt, which is why accuracy differs between the rows. The sampled row draws 200 letters from the same distribution we read, so it can only agree up to sampling noise. Sampling tells you more when the answer is many tokens long.'],
  [RealSix, 'Ask whether the Microsoft item is really Sci/Tech or Business. Labels can be debatable, and the model gives 0.9997 either way.'],
  [RealNumbers, 'AG News, 4 topics, 1,000 test items, Qwen2.5-0.5B-Instruct read from letter logits.'],
  [RealBefore, 'Almost everything sits in the top bin. This is typical of an LLM read zero-shot.'],
  [WhyExtreme, 'e to the 9 is about 8,100. The model has the order mostly right; the size of the gaps is what is off.'],
  [TempWorked, 'Work the T = 2 column on the board. e to the 1 is 2.72, e to the 0.5 is 1.65, e to the 0.05 is 1.05.'],
  [Temperature, 'Drag to 2 to match the worked example, then to 0.5 and to 10. At T = 1 we get 0.66, 0.24, 0.10 as before.'],
  [ChooseT, 'One parameter, fitted by a simple search over 191 values. Log loss is the same loss used to train classifiers; Part 5 comes back to it.'],
  [SameItem, 'Temperature cannot fix this answer. It only makes the model less sure about it.'],
  [RealAfter, 'T is chosen to minimise the log loss on 500 held-out items, never on the test items.'],
  [NotAccuracy, ''],
  [Recap4, ''],
  [S5, ''],
  [TrainPipeline, 'The earlier version of this slide skipped supervised fine-tuning. Labs differ in the details and often repeat or mix stages 2 and 3; these three are the common core.'],
  [PreTrain, 'Token counts are the makers’ own figures: the GPT-3 paper, Meta’s Llama 3 announcement and the Qwen2.5 report. Our small Qwen model comes from that family.'],
  [BaseModel, 'The continuation is illustrative. A base model has no notion of a turn ending, so it also does not know when to stop.'],
  [SFT, 'Instruction tuning and SFT name the same stage. Dolly is from Databricks, Alpaca from Stanford, FLAN from Google. Check the counts against the dataset cards before quoting them.'],
  [RLHFPage, 'The window is a mock-up of a rating tool. Real tools differ, and some ask for a ranking of four or more answers. Note which answer wins.'],
  [RLHFLoop, 'InstructGPT is Ouyang et al., 2022. The two scores are illustrative. Newer methods such as DPO skip the separate reward model and train on the comparisons directly.'],
  [RLVRPage, 'RLVR means reinforcement learning with verifiable rewards. The same sum as in Part 1.'],
  [RLVRCode, 'A function that returned True for every input would fail the second test and get 0. The reward says nothing about which test failed.'],
  [RLTwo, 'This framing follows the IBM video.'],
  [RLCD, 'Be clear that what follows is our construction with the same goal, not Jev’s method. Wikipedia notes it may be ordinary supervised learning with calibration terms in the loss.'],
  [OneAmbiguous, 'Ask the class what they would answer. Most say probably yes, and that word probably is the point.'],
  [TenAlike, 'Same input, same output. The ten emails stand for every email on which the model has the same information.'],
  [TruthLater, 'In a real system these labels come from ticket outcomes, such as whether a refund was issued. The 7 and 3 are made up for the example.'],
  [HonestyQ, 'Ask the class to vote for 0.70 or 0.99 before moving on.'],
  [AccReward, 'Any stated probability above 0.5 gives the answer yes, so the accuracy reward cannot tell 0.70 from 0.99.'],
  [BrierOne, '0.81 / 0.01 = 81.'],
  [BrierExpected, 'Ask the class to guess the best report before revealing the last row. Dividing each total by 10 gives the average penalty per email.'],
  [LogScore, 'So ordinary supervised training with cross-entropy already rewards correct probabilities, at least on the training distribution.'],
  [RLCDIdeas, 'Unsloth exposes build_dataset, a trainer, split_holdout and calibrate. Its loss is not something I have verified. Wikipedia notes that RLCD may be ordinary supervised learning with calibration terms.'],
  [HeadWhy, 'The letter readout is zero-shot: nothing was trained for news topics. A head lets us use labelled data without touching the LLM.'],
  [HeadVector, 'This is the same last-position vector as in Part 2, step 4. In notebook 2 it is the final layer’s hidden state at the last token.'],
  [HeadMath, 'The three-number vector and the weights are made up so the sums can be done by hand. In code the head is torch.nn.Linear(896, 4).'],
  [HeadFigure, 'Same drawing as in Part 3, with four topics. The left design is dimmed because we are not writing text here.'],
  [HeadTwoPhases, 'Notebook 2 also standardises each of the 896 columns of H before training. 500 more items are held out to fit the temperature.'],
  [HeadCode, 'Notebook 2. Features are standardised first. Training takes a few seconds.'],
  [HeadResults, '2,000 training items. The Brier-trained head gives nearly the same numbers; it is in the notebook.'],
  [HeadDemo, 'Real outputs from notebook 2. Ask the class for a headline and run it live in the notebook.'],
  [UnslothRow, 'The example row is from Unsloth’s guide.'],
  [UnslothCode, 'API as in Unsloth’s official notebook. I have not run notebook 3 myself; run it once before class.'],
  [UnslothNumbers, 'Numbers from Unsloth’s documentation.'],
  [Recap5, ''],
  [S6, ''],
  [PerQuestion, 'This is the question students ask at this point. Our Part 5 head has four fixed outputs. General models take the question as input.'],
  [OnePrompt, 'Unsloth describes its head as one that “looks at the LLM’s output over each question and option and scores every option”. How the heads inside Jev and Liquid are built is not published.'],
  [TrainOnce, 'The 30 to 37% and 73% are Unsloth’s figures for Qwen3.5-0.8B on its typed-decisions set. The docs do not say when to fine-tune; the last two rows are our advice.'],
  [Recipe, 'The quoted advice is on Liquid’s model pages. The size of the test set in step 2 is our suggestion, not a documented rule.'],
  [AppEmail, 'The running example, now as a build plan. All three questions go in one request.'],
  [AppKiln, 'The drawing and the 0.93 are illustrative. Liquid documents image input and box answers; nobody has reported results on satellite tiles, so the training row is our expectation.'],
  [AppGame, 'The board probabilities are illustrative. Treating a policy as a choice question is our framing; the decision-model vendors do not discuss games.'],
  [NotFit, 'The list for generative LLMs follows Liquid’s documentation. The other two columns summarise this lecture.'],
  [Thresholds, 'From the IBM video’s refund example.'],
  [ThreeThresholds, 'All threshold values here are illustrative choices. Ask the class which mistake is worse in each case before revealing the bands.'],
  [ThresholdLive, 'Drag to 0.9 and to 0.5. Ask which threshold a bank would choose and which a news app would.'],
  [Pipeline, 'Kahneman’s picture again: fast most of the time, slow when needed.'],
  [PipelineThree, 'Kahneman again: System 1 for every input, System 2 where it is needed. In the kiln case System 2 is a person.'],
  [Limits, 'The benchmark also reports that binary probabilities need tuned thresholds: micro-F1 on UNFAIR-ToS rises from 0.50 to 0.75.'],
  [LimitsApps, 'These are our cautions for the three applications, drawn from the benchmark’s limits and from Part 4. The rare-event point is the base-rate effect.'],
  [Jevons, 'William Stanley Jevons, The Coal Question, 1865.'],
  [Summary, 'Walk the picture left to right, then the two boxes below.'],
  [Notebooks, 'Notebook 3 needs a GPU and takes much longer; show its saved outputs.'],
  [Sources, ''],
];

export const meta: SlideMeta = {
  title: 'System 1 models: deciding without writing',
  createdAt: '2026-11-20T12:01:48.553Z',
};

export const notes: (string | undefined)[] = deck.map((d) => d[1] || undefined);

export default deck.map((d) => d[0]) satisfies Page[];
