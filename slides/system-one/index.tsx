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

const Code = ({ code, size = 29, hl = [] }: { code: string; size?: number; hl?: number[] }) => (
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
      .map((ln, i) => {
        const k = ln.indexOf('#');
        const body = k >= 0 ? ln.slice(0, k) : ln;
        const com = k >= 0 ? ln.slice(k) : '';
        return (
          <div key={i} style={{ background: hl.includes(i) ? '#fbe9e4' : 'transparent', margin: '0 -12px', padding: '0 12px' }}>
            {body || (com ? '' : ' ')}
            <span style={{ color: C.muted }}>{com}</span>
          </div>
        );
      })}
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
    how="Two multiplication problems, Kahneman’s two systems, and then the kinds of questions ordinary programs ask."
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
  <Frame part={1} title="Kahneman’s two systems" line="Daniel Kahneman named these two modes System 1 and System 2. We use System 1 for most of what we do in a day.">
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

const Call = ({ q, a }: { q: string; a: string }) => (
  <Card style={{ padding: '24px 30px' }}>
    <div style={{ fontSize: 34, fontWeight: 600 }}>{q}</div>
    <div style={{ fontFamily: mono, fontSize: 28, color: C.s1, marginTop: 10 }}>{a}</div>
  </Card>
);

const SoftwareCalls: Page = () => (
  <Frame
    part={1}
    title="Most questions that software asks are quick decisions"
    line="Each question has a short list of possible answers, and the software asks it thousands of times a day."
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 34, marginTop: 30 }}>
      <Call q="Is this message spam?" a="yes · no" />
      <Call q="Which team gets this ticket?" a="billing · technical · sales" />
      <Call q="Is this prompt a jailbreak?" a="yes · no" />
      <Call q="How positive is this review?" a="1 · 2 · 3 · 4 · 5" />
      <Call q="Does this log line need a person?" a="yes · no" />
      <Call q="Which language is this?" a="hi · gu · en · ta · …" />
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
            <SmCell w={340} color={C.soft}>7.39</SmCell>
            <SmCell w={340} color={C.soft}>2.72</SmCell>
            <SmCell w={340} color={C.soft}>1.11</SmCell>
            <div style={{ height: 70, fontFamily: mono, fontSize: 34, color: C.soft, textAlign: 'center', borderTop: `3px solid ${C.rule}`, paddingTop: 12 }}>
              total 11.21
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

const Written: Page = () => (
  <Frame
    part={2}
    title="Our model writes its answer to the email"
    line={`The ${sci.n_generated} tokens of JSON needed ${sci.passes} forward passes. The extra pass is the one where the model picks its end token.`}
  >
    <div style={{ ...row, gap: 70, alignItems: 'center', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <Label>Asked for JSON with team, refund, urgency</Label>
        <div style={{ height: 18 }} />
        <Code size={40} code={sci.generated} />
      </div>
      <Steps>
        <Step>
          <div style={{ ...row, gap: 70 }}>
            <Big value={String(sci.passes)} label="forward passes" color={C.s2} />
            <Big value={`${sci.ms_generate}`} label="milliseconds" color={C.s2} />
          </div>
          <div style={{ fontSize: 26, color: C.muted, textAlign: 'center', marginTop: 30 }}>
            {sci.model.split('/')[1]} on a MacBook GPU
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

const RCell = ({ children, w, color = C.ink }: { children: ReactNode; w: number; color?: string }) => (
  <div style={{ width: w, height: 80, fontFamily: mono, fontSize: 36, color, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </div>
);

const Readout: Page = () => (
  <Frame
    part={3}
    title="Keep the option letters, renormalise"
    line="This is the same softmax, applied to three logits. Subtracting the largest logit first does not change the result and keeps the numbers small."
  >
    <div style={{ ...row, gap: 20, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={col}>
        <SmHead w={330}>option</SmHead>
        <RCell w={330}>A billing</RCell>
        <RCell w={330}>B technical</RCell>
        <RCell w={330}>C sales</RCell>
      </div>
      <div style={col}>
        <SmHead w={220}>logit</SmHead>
        <RCell w={220}>{sci.letter_logits[0].toFixed(2)}</RCell>
        <RCell w={220}>{sci.letter_logits[1].toFixed(2)}</RCell>
        <RCell w={220}>{sci.letter_logits[2].toFixed(2)}</RCell>
      </div>
      <Steps>
        <Step>
          <div style={col}>
            <SmHead w={300}>minus {sci.letter_logits[1].toFixed(2)}</SmHead>
            <RCell w={300} color={C.soft}>−0.07</RCell>
            <RCell w={300} color={C.soft}>0.00</RCell>
            <RCell w={300} color={C.soft}>−3.93</RCell>
          </div>
        </Step>
        <Step>
          <div style={col}>
            <SmHead w={260}>e to that power</SmHead>
            <RCell w={260} color={C.soft}>0.94</RCell>
            <RCell w={260} color={C.soft}>1.00</RCell>
            <RCell w={260} color={C.soft}>0.02</RCell>
          </div>
        </Step>
        <Step>
          <div style={col}>
            <SmHead w={470}>divide by the total 1.96</SmHead>
            <RCell w={470} color={C.pred}>0.94 / 1.96 = {f2(sci.p_team[0])}</RCell>
            <RCell w={470} color={C.pred}>1.00 / 1.96 = {f2(sci.p_team[1])}</RCell>
            <RCell w={470} color={C.pred}>0.02 / 1.96 = {f2(sci.p_team[2])}</RCell>
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
      <div style={{ fontSize: 26, color: C.muted, marginTop: 20 }}>
        median of 5 runs · {sci.model.split('/')[1]} on a MacBook GPU · notebook 1 reproduces this
      </div>
    </div>
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

const Fact = ({ k, v }: { k: string; v: string }) => (
  <div style={{ ...row, gap: 30, fontSize: 32, lineHeight: 1.4, padding: '11px 0', borderBottom: `2px solid ${C.rule}` }}>
    <div style={{ width: 250, color: C.muted, flexShrink: 0 }}>{k}</div>
    <div style={{ flex: 1 }}>{v}</div>
  </div>
);

const Jev: Page = () => (
  <Frame
    part={3}
    title="Jev: what is public and what is not"
    line="We read letter logits because the method is simple and works on any open model. TypeSafe has not published how Jev computes its probabilities."
  >
    <div style={{ ...row, gap: 60, marginTop: 10 }}>
      <div style={{ flex: 1 }}>
        <Label color={C.truth}>Public</Label>
        <Fact k="Who, when" v="TypeSafe AI, early access from 15 Sep 2026" />
        <Fact k="Output" v="probabilities for choice, score, noul; no text" />
        <Fact k="Price" v="$0.042 per million input tokens, output free" />
        <Fact k="Speed (vendor)" v="70 to 500 ms per request" />
      </div>
      <Steps>
        <Step>
          <div style={{ width: 620 }}>
            <Label color={C.loss}>Not published</Label>
            <Fact k="Architecture" v="“transformer-based”" />
            <Fact k="Size" v="unknown" />
            <Fact k="Training data" v="described as synthetic" />
            <Fact k="Training method" v="named RLCD; Part 5" />
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
    how="A weather forecaster first, then ten predictions binned by hand, the reliability diagram, ECE, and finally our own model."
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

const BinCard = ({ range, children, conf, acc, gap }: { range: string; children: ReactNode; conf: string; acc: string; gap: string }) => (
  <Card style={{ padding: '22px 22px', flex: 1 }}>
    <div style={{ fontFamily: mono, fontSize: 30, color: C.soft }}>{range}</div>
    <div style={{ ...row, justifyContent: 'center', margin: '18px 0 20px' }}>{children}</div>
    <div style={{ fontFamily: mono, fontSize: 31, lineHeight: 1.7, whiteSpace: 'nowrap' }}>
      <div style={{ color: C.pred }}>confidence {conf}</div>
      <div style={{ color: C.truth }}>accuracy {acc}</div>
      <div style={{ color: C.loss }}>gap {gap}</div>
    </div>
  </Card>
);

const ToyBins: Page = () => (
  <Frame
    part={4}
    title="Group them by confidence, then compare"
    line="For each bin we compare the average confidence (the sum divided by the count) with the fraction the model got right."
  >
    <div style={{ ...row, gap: 26, alignItems: 'flex-start', marginTop: 60 }}>
      <BinCard range="0.4 to 0.6" conf="1.00 / 2 = 0.50" acc="1 / 2 = 0.50" gap="0.00">
        <ToyCell i={8} w={110} /><ToyCell i={9} w={110} />
      </BinCard>
      <Steps>
        <Step>
          <BinCard range="0.6 to 0.8" conf="2.10 / 3 = 0.70" acc="2 / 3 = 0.67" gap="0.03">
            <ToyCell i={5} w={110} /><ToyCell i={6} w={110} /><ToyCell i={7} w={110} />
          </BinCard>
        </Step>
        <Step>
          <BinCard range="0.8 to 1.0" conf="4.50 / 5 = 0.90" acc="3 / 5 = 0.60" gap="0.30">
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

const EceFormula: Page = () => (
  <Frame
    part={4}
    title="One number: expected calibration error"
    line="ECE is the average gap, with each bin weighted by its share of the predictions. A perfectly calibrated model scores 0."
  >
    <div style={{ ...col, gap: 56, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Eq size={60}>
        ECE = Σ<sub style={{ fontSize: 30 }}>bins</sub>
        <Frac top={<span>predictions in bin</span>} bot={<span>all predictions</span>} />×{' '}
        <span style={{ color: C.loss }}>
          | <span style={{ color: C.truth }}>accuracy</span> − <span style={{ color: C.pred }}>confidence</span> |
        </span>
      </Eq>
      <Steps>
        <Step>
          <div style={{ fontFamily: mono, fontSize: 44, textAlign: 'center' }}>
            <Frac top="2" bot="10" />× <span style={{ color: C.loss }}>0.00</span> + <Frac top="3" bot="10" />×{' '}
            <span style={{ color: C.loss }}>0.03</span> + <Frac top="5" bot="10" />× <span style={{ color: C.loss }}>0.30</span>
          </div>
        </Step>
        <Step>
          <div style={{ fontFamily: mono, fontSize: 44, textAlign: 'center' }}>
            = 0 + 0.01 + 0.15 = <b style={{ color: C.loss }}>0.16</b>
          </div>
        </Step>
      </Steps>
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
  const X = (v: number) => 60 + v * 440;
  const Y = (v: number) => 20 + (1 - v) * 440;
  const f = (v: number) => (over ? 0.35 + 0.45 * (v - 0.4) / 0.6 + 0.0 : Math.min(1, 0.62 + 0.38 * (v - 0.4) / 0.45));
  const xs = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  return (
    <svg width={540} height={500} viewBox="0 0 540 500">
      <rect x={X(0)} y={Y(1)} width={440} height={440} fill={C.white} stroke={C.rule} strokeWidth={3} />
      <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke={C.muted} strokeWidth={3} strokeDasharray="10 8" />
      <polyline points={xs.map((v) => `${X(v)},${Y(f(v))}`).join(' ')} fill="none" stroke={C.ink} strokeWidth={5} />
      <text x={X(0.5)} y={Y(0) + 34} textAnchor="middle" fontSize={24} fill={C.pred}>confidence</text>
      <text transform={`translate(34 ${Y(0.5)}) rotate(-90)`} textAnchor="middle" fontSize={24} fill={C.truth}>accuracy</text>
    </svg>
  );
};

const Shapes: Page = () => (
  <Frame
    part={4}
    title="Overconfident and underconfident models"
    line="These curves are illustrative. Below the line the model’s confidence is higher than its accuracy, and above the line it is lower."
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

const RealNumbers: Page = () => (
  <Frame
    part={4}
    title="Our model on 1,000 news items"
    line={`Four topics, one forward pass per item, probabilities read from the letter logits. The model is right ${pct(sci.zs.accuracy)} of the time, but its average confidence is ${pct(sci.zs.mean_conf)}.`}
  >
    <div style={{ ...row, gap: 160, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Big value={f2(sci.zs.accuracy)} label="accuracy" color={C.truth} />
      <Steps>
        <Step>
          <Big value={f2(sci.zs.mean_conf)} label="mean confidence" color={C.pred} />
        </Step>
      </Steps>
    </div>
  </Frame>
);

const RealBefore: Page = () => (
  <Frame
    part={4}
    title="The reliability diagram for our model"
    line={`${sci.zs.bins[9].n} of the 1,000 answers come with confidence above 0.9, and only ${pct(sci.zs.bins[9].acc as number)} of those are right. ECE is ${f2(sci.zs.ece)}.`}
  >
    <div style={{ ...row, gap: 90, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Reliability bins={sci.zs.bins} size={480} counts />
      <div style={{ ...col, gap: 30 }}>
        <Big value={f2(sci.zs.ece)} label="ECE" color={C.loss} />
        <div style={{ fontSize: 26, color: C.muted, width: 420, textAlign: 'center' }}>
          numbers beside the dots count the predictions in each bin
        </div>
      </div>
    </div>
  </Frame>
);

const softmaxT = (z: number[], T: number) => {
  const e = z.map((v) => Math.exp(v / T));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
};

const Temperature: Page = () => {
  const [T, setT] = useState(1);
  const p = softmaxT([2.0, 1.0, 0.1], T);
  return (
    <Frame
      part={4}
      title="Temperature scaling: a fix with one parameter"
      line="Divide every logit by T before the softmax. T above 1 flattens the distribution; the order of the options never changes."
    >
      <div style={{ ...row, gap: 70, alignItems: 'center', height: '100%' }}>
        <div style={{ width: 560 }}>
          <Eq size={54}>
            <I color={C.pred}>p</I> = softmax(<I>z</I> / <I color={C.loss}>T</I>)
          </Eq>
          <div style={{ marginTop: 60, textAlign: 'center' }}>
            <div style={{ fontFamily: mono, fontSize: 56, color: C.loss }}>T = {T.toFixed(1)}</div>
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.1}
              value={T}
              onChange={(e) => setT(Number(e.target.value))}
              onKeyDown={(e) => e.stopPropagation()}
              style={{ width: 480, marginTop: 24, accentColor: C.loss }}
            />
            <div style={{ fontSize: 26, color: C.muted, marginTop: 14 }}>drag me</div>
          </div>
        </div>
        <div style={col}>
          <div style={{ fontSize: 28, color: C.muted, marginLeft: 320, marginBottom: 10 }}>logits 2.0, 1.0, 0.1 from the softmax slide</div>
          <Bar label="z = 2.0" p={p[0]} width={620} mono />
          <Bar label="z = 1.0" p={p[1]} width={620} mono />
          <Bar label="z = 0.1" p={p[2]} width={620} mono />
        </div>
      </div>
    </Frame>
  );
};

const RealAfter: Page = () => (
  <Frame
    part={4}
    title={`Fit T on 500 held-out items: T = ${sci.zs.T.toFixed(1)}`}
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
    how="How chat models are trained, what each reward measures, a loss that rewards correct probabilities, and a head we train ourselves."
  />
);

const TrainPipeline: Page = () => (
  <Frame
    part={5}
    title="How a chat model is trained"
    line="Pre-training teaches the model language. Post-training shapes its behaviour with reinforcement learning: the model answers, gets a reward, and is updated."
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <Box x={60} y={200} w={520} h={170} text="Pre-training" sub="predict the next token on a huge pile of text" color={C.s2} size={40} />
      <Arr x1={580} y1={285} x2={720} y2={285} />
      <Box x={730} y={200} w={520} h={170} text="Post-training" sub="reinforcement learning on tasks" color={C.s1} size={40} />
      <Arr x1={1250} y1={285} x2={1390} y2={285} />
      <Box x={1400} y={200} w={260} h={170} text="chatbot" size={36} />
      <text x={990} y={470} textAnchor="middle" fontSize={34} fill={C.soft}>The question for this part: what does the reward measure?</text>
    </svg>
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
    title="Two rewards used today"
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

const HonestyQ: Page = () => (
  <Frame
    part={5}
    title="A model is right 70% of the time. What should it report?"
    line="If the reward only checks the answer, reporting 0.7 and reporting 0.99 earn the same, so training never moves the model towards 0.7."
  >
    <div style={{ ...row, gap: 60, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <div style={{ fontFamily: mono, fontSize: 84, color: C.pred }}>0.70</div>
        <div style={{ fontSize: 30, color: C.soft }}>the correct report</div>
      </Card>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <div style={{ fontFamily: mono, fontSize: 84, color: C.pred }}>0.99</div>
        <div style={{ fontSize: 30, color: C.soft }}>sounding sure</div>
      </Card>
      <Steps>
        <Step>
          <div style={{ width: 640, fontSize: 32, lineHeight: 1.6, whiteSpace: 'nowrap' }}>
            <Label>Reward = 1 if the answer is right</Label>
            <div style={{ fontFamily: mono, marginTop: 16 }}>say 0.70 → average reward 0.7</div>
            <div style={{ fontFamily: mono }}>say 0.99 → average reward 0.7</div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const BrierOne: Page = () => (
  <Frame
    part={5}
    title="The Brier score penalises the stated probability"
    line="Here y is 1 if the answer was right and 0 if not, and lower is better. A wrong answer at 0.9 costs 81 times more than a right answer at 0.9."
  >
    <div style={{ ...col, gap: 60, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Eq size={76}>
        <span style={{ color: C.loss }}>loss</span> = ( <I color={C.pred}>p</I> − <I color={C.truth}>y</I> )<sup style={{ fontSize: 44 }}>2</sup>
      </Eq>
      <div style={{ ...row, gap: 60 }}>
        <Steps>
          <Step>
            <Card style={{ width: 660, textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: C.soft }}>
                says <span style={{ color: C.pred }}>0.9</span>, and is <span style={{ color: C.truth }}>right (y = 1)</span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 48, marginTop: 16 }}>
                (0.9 − 1)² = <span style={{ color: C.loss }}>0.01</span>
              </div>
            </Card>
          </Step>
          <Step>
            <Card style={{ width: 660, textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: C.soft }}>
                says <span style={{ color: C.pred }}>0.9</span>, and is <span style={{ color: C.truth }}>wrong (y = 0)</span>
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
    <div style={{ width: 640, color: C.soft }}>{calc}</div>
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
      <text x={X(0.25)} y={Y(0.5)} fontSize={26} fill={C.loss}>expected loss</text>
    </svg>
  );
};

const BrierExpected: Page = () => (
  <Frame
    part={5}
    title="The Brier score is lowest at the true probability"
    line="Expected loss = 0.7 × (loss if right) + 0.3 × (loss if wrong). A loss that is lowest at the true probability is called a proper scoring rule."
  >
    <div style={{ ...row, gap: 30, alignItems: 'center', height: '100%' }}>
      <div style={col}>
        <EB say="0.5" calc="0.7 × 0.25 + 0.3 × 0.25" val="0.25" />
        <Steps>
          <Step>
            <EB say="0.9" calc="0.7 × 0.01 + 0.3 × 0.81" val="0.25" />
          </Step>
          <Step>
            <EB say="1.0" calc="0.7 × 0.00 + 0.3 × 1.00" val="0.30" />
          </Step>
          <Step>
            <EB say="0.7" calc="0.7 × 0.09 + 0.3 × 0.49" val="0.21" best />
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
    title="You already use a proper scoring rule"
    line="Cross-entropy, the usual classification loss, is the log score. A classifier head trained with it is rewarded for reporting correct probabilities."
  >
    <div style={{ ...col, gap: 60, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Eq size={76}>
        <span style={{ color: C.loss }}>loss</span> = − log <I color={C.pred}>p</I>
        <sub style={{ fontSize: 40, color: C.truth }}>correct option</sub>
      </Eq>
      <Steps>
        <Step>
          <div style={{ fontFamily: mono, fontSize: 40, lineHeight: 1.7, textAlign: 'center' }}>
            <div>
              gave the right option <span style={{ color: C.pred }}>0.9</span> → −log 0.9 = <span style={{ color: C.loss }}>0.11</span>
            </div>
            <div>
              gave the right option <span style={{ color: C.pred }}>0.1</span> → −log 0.1 = <span style={{ color: C.loss }}>2.30</span>
            </div>
          </div>
        </Step>
      </Steps>
    </div>
  </Frame>
);

const HeadFigure: Page = () => (
  <Frame
    part={5}
    title="Train a small head on a frozen LLM"
    line={`The LLM’s own output layer scores all ${sci.vocab.toLocaleString('en-US')} tokens. We add a head with ${sci.head.params.toLocaleString('en-US')} parameters that scores only our four topics, and train just that.`}
  >
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <Box x={20} y={250} w={300} h={130} text="news + question" sub="one prompt" />
      <Arr x1={320} y1={315} x2={400} y2={315} />
      <Box x={410} y={250} w={300} h={130} text="LLM, frozen" sub={`${sci.params_M} M parameters`} color={C.s2} />
      <Arr x1={710} y1={315} x2={790} y2={315} />
      <Box x={800} y={250} w={300} h={130} text="last vector" sub={`${sci.hidden} numbers`} color={C.pred} />
      <Arr x1={1100} y1={290} x2={1230} y2={150} />
      <Arr x1={1100} y1={340} x2={1230} y2={480} />
      <Box x={1240} y={80} w={430} h={130} text="LLM output layer" sub={`${sci.vocab.toLocaleString('en-US')} scores · Part 3 read 4 of them`} color={C.muted} />
      <Box x={1240} y={420} w={430} h={130} text="decision head" sub={`4 scores · ${sci.head.params.toLocaleString('en-US')} parameters · trained`} color={C.s1} />
      <text x={1455} y={600} textAnchor="middle" fontSize={28} fill={C.soft}>{sci.hidden} × 4 weights + 4 biases = {sci.head.params.toLocaleString('en-US')}</text>
    </svg>
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
    goal="We have a fast answer and a probability we can trust. How does software use them, and where does this break?"
    how="Thresholds on the refund question, a live threshold on our trained head, a pipeline with an LLM, then the limits."
  />
);

const Thresholds: Page = () => (
  <Frame
    part={6}
    title="Thresholds turn a probability into an action"
    line="We choose the 0.9 and the 0.1. If a wrong automatic action is costly, we set them further apart."
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
      line="Our trained head on the 1,000 test items. A higher threshold sends more items to a person and makes the automatic path safer."
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
              <div style={{ fontSize: 30, color: C.soft }}>of those are wrong ({wrong})</div>
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
    title="A decision model and an LLM in one pipeline"
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
    title="Limits: an independent benchmark of Jev"
    line="Deußer et al., 2026, tested Jev zero-shot on 37 datasets. It beat a 27-billion-parameter open LLM on 27 of them, and the paper reports these limits."
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 10 }}>
      <Limit head="Default thresholds can fail" body="Prompt-injection detection had perfect precision but 50% recall until the threshold was tuned." />
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
    <div style={{ ...row, gap: 60, alignItems: 'center', height: '100%' }}>
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
  </Frame>
);

const Summary: Page = () => (
  <Frame part={0} title="Summary of the lecture">
    <svg width={1700} height={690} viewBox="0 0 1700 690">
      <Arrows />
      <Box x={20} y={30} w={300} h={130} text="state + questions" sub="email, 3 questions" />
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
      <Src>Martin Keen, “What Is Jev? The AI Model That Doesn’t Generate Text”, IBM Technology, 2026 (the email example, RLHF / RLVR / RLCD framing)</Src>
      <Src>Daniel Kahneman, Thinking, Fast and Slow, 2011</Src>
      <Src>Deußer, Ramamurthy, Sparrenberg, Sifa, “Evaluating and Benchmarking the System One Model Jev”, arXiv 2609.37647</Src>
      <Src>Unsloth, “Train your own Decision Model with Unsloth”, docs and notebook, 2026</Src>
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
  [TwoSystems, 'Kahneman, Thinking, Fast and Slow. Credit the IBM video for using this framing for AI models.'],
  [SoftwareCalls, 'Ask for more examples from their own projects.'],
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
  [ThreeCosts, 'A number the model writes as text, such as "confidence": 0.9, is just more generated tokens.'],
  [Recap2, ''],
  [S3, ''],
  [LookAgain, 'Same chart as before, with the non-option tokens dimmed. "billing" as a word also appears: the model could have answered in words.'],
  [Readout, 'Subtracting the largest logit is the standard trick to avoid huge exponentials. A real case of softmax over three numbers.'],
  [DecideCode, 'Notebook 1, section 4. Mention that option order can shift the numbers; it is an exercise in the notebook.'],
  [Timing, 'The comparison is for one question. A decision model answers all questions in the same pass.'],
  [Honest, 'The small model is undecided between billing and technical, and its written JSON picked billing. An untrained model; the point is that the doubt is now visible.'],
  [Types, 'noul is the yes/no type name in Jev’s API. Its origin is not explained in the public material.'],
  [ScoreCalc, 'The model is confidently wrong about urgency. Keep this in mind for calibration.'],
  [Request, 'Field names follow the Jev and Unsloth request format: state, questions, type, instructions, criteria.'],
  [Jev, 'Facts as of November 2026 from Wikipedia and the benchmark paper. Speed and price are vendor numbers.'],
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
  [RealNumbers, 'AG News, 4 topics, 1,000 test items, Qwen2.5-0.5B-Instruct read from letter logits.'],
  [RealBefore, 'Almost everything sits in the top bin. This is typical of an LLM read zero-shot.'],
  [Temperature, 'Drag the slider. At T = 1 we get 0.66, 0.24, 0.10 as before.'],
  [RealAfter, 'T is chosen to minimise the log loss on 500 held-out items, never on the test items.'],
  [NotAccuracy, ''],
  [Recap4, ''],
  [S5, ''],
  [TrainPipeline, ''],
  [RLTwo, 'This framing follows the IBM video.'],
  [RLCD, 'Be clear that what follows is our construction with the same goal, not Jev’s method. Wikipedia notes it may be ordinary supervised learning with calibration terms in the loss.'],
  [HonestyQ, 'Any stated probability above 0.5 picks the same answer, so the accuracy reward cannot tell them apart.'],
  [BrierOne, '0.81 / 0.01 = 81.'],
  [BrierExpected, 'Ask the class to guess the best report before revealing the last row.'],
  [LogScore, 'So ordinary supervised training with cross-entropy already rewards correct probabilities, at least on the training distribution.'],
  [HeadFigure, 'Recall the encoder slide: we are using a decoder’s last vector the way an encoder model uses its output vector.'],
  [HeadCode, 'Notebook 2. Features are standardised first. Training takes a few seconds.'],
  [HeadResults, '2,000 training items. The Brier-trained head gives nearly the same numbers; it is in the notebook.'],
  [UnslothRow, 'The example row is from Unsloth’s guide.'],
  [UnslothCode, 'API as in Unsloth’s official notebook. I have not run notebook 3 myself; run it once before class.'],
  [UnslothNumbers, 'Numbers from Unsloth’s documentation.'],
  [Recap5, ''],
  [S6, ''],
  [Thresholds, 'From the IBM video’s refund example.'],
  [ThresholdLive, 'Drag to 0.9 and to 0.5. Ask which threshold a bank would choose and which a news app would.'],
  [Pipeline, 'Kahneman’s picture again: fast most of the time, slow when needed.'],
  [Limits, 'The benchmark also reports that binary probabilities need tuned thresholds: micro-F1 on UNFAIR-ToS rises from 0.50 to 0.75.'],
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
