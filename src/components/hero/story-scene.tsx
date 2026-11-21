import { useId, type CSSProperties } from "react";

import { createRandom, localToWorld, type Point } from "./geometry";
import {
  ANALYSED_LINES,
  BALL_CREASES,
  BUILD_LINES,
  CURSOR_PATH,
  DASHBOARD,
  DEV_CURSOR,
  EDITOR,
  EDITOR_BOX,
  HANDWRITING,
  PALETTE,
  PAPER_OUTLINES,
  PAPER_STAGES,
  PROBLEM_LINES,
  SHEET,
  SHEET_CREASES,
  SPEC_LINES,
  TERMINAL_LINES,
  TOKEN_LABELS,
  USERS,
  type CodeLine,
  type CodeTone,
} from "./scene-layout";
import { AnalysisBoards, JourneyThreads } from "./analysis-boards";
import { createRig, frameViewBox, frameViewport, rigTransforms } from "./story-rig";
import { Glass, HAND_FONT, HIDDEN, MONO_FONT, SANS_FONT, type Ids } from "./svg-parts";

const TONE_COLOR: Record<CodeTone, string> = {
  plain: PALETTE.uiText,
  muted: PALETTE.uiMuted,
  accent: PALETTE.accent,
  cool: PALETTE.cool,
  ok: PALETTE.ok,
};

/** Frame the server renders before the stage is measured. */
const SSR_PIXELS = { width: 1600, height: 900 } as const;

/** Ghost copies of the ball drawn behind it in flight. */
export const GHOST_COUNT = 5;

/** Vertical offset of the issue tag above the flying ball. */
export const TAG_OFFSET = 130;

const toPolyline = (points: Point[]) => points.map((p) => `${p.x},${p.y}`).join(" ");
const baseline = (line: number) => HANDWRITING.firstBaseline + line * HANDWRITING.lineHeight;

interface CursorProps {
  label: string;
  color: string;
  labelColor: string;
}

/** Multiplayer-style cursor with a name tag; its tip sits at the group origin. */
function Cursor({ label, color, labelColor }: CursorProps) {
  const labelWidth = label.length * 10.5 + 26;
  return (
    <>
      <path
        d={CURSOR_PATH}
        fill={color}
        stroke={PALETTE.stage}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <rect x={22} y={40} width={labelWidth} height={30} rx={8} fill={color} />
      <text x={35} y={60} fontSize={16} fontWeight={600} fill={labelColor} style={MONO_FONT}>
        {label}
      </text>
    </>
  );
}

interface CodeBlockProps {
  lines: readonly CodeLine[];
  clipPrefix: string;
  revealName: string;
}

/** Code lines, each wrapped in a clip rect the timeline widens to "type" it. */
function CodeBlock({ lines, clipPrefix, revealName }: CodeBlockProps) {
  return (
    <>
      <defs>
        {lines.map((_, i) => (
          <clipPath key={i} id={`${clipPrefix}-${i}`}>
            <rect
              data-hero={`${revealName}-${i}`}
              x={EDITOR_BOX.codeX - 4}
              y={EDITOR_BOX.codeTop + i * EDITOR_BOX.codeLineHeight - 22}
              width={0}
              height={EDITOR_BOX.codeLineHeight}
            />
          </clipPath>
        ))}
      </defs>
      {lines.map((line, i) => (
        <g key={i}>
          <text
            x={EDITOR_BOX.x + 22}
            y={EDITOR_BOX.codeTop + i * EDITOR_BOX.codeLineHeight}
            fontSize={15}
            fill={PALETTE.panelBorder}
            style={MONO_FONT}
          >
            {i + 1}
          </text>
          <text
            x={EDITOR_BOX.codeX}
            y={EDITOR_BOX.codeTop + i * EDITOR_BOX.codeLineHeight}
            fontSize={17}
            clipPath={`url(#${clipPrefix}-${i})`}
            style={MONO_FONT}
            xmlSpace="preserve"
          >
            {line.segments.map((segment, j) => (
              <tspan key={j} fill={TONE_COLOR[segment.tone]}>
                {segment.text}
              </tspan>
            ))}
          </text>
        </g>
      ))}
    </>
  );
}

/** The shipped product, revealed by the deploy wipe. */
function Dashboard() {
  const left = EDITOR_BOX.x;
  const top = EDITOR_BOX.y;
  const cardW = 196;
  const chartBottom = top + EDITOR.height - 40;
  const maxBar = 170;

  return (
    <g>
      <rect
        x={left}
        y={top}
        width={EDITOR.width}
        height={EDITOR.height}
        rx={14}
        fill={PALETTE.paper}
      />
      <text
        x={left + 32}
        y={top + 50}
        fontSize={24}
        fontWeight={700}
        fill={PALETTE.ink}
        style={SANS_FONT}
      >
        {DASHBOARD.name}
      </text>
      <rect x={left + 170} y={top + 31} width={64} height={26} rx={13} fill="#16a34a22" />
      <circle cx={left + 186} cy={top + 44} r={5} fill="#16a34a" />
      <text
        x={left + 197}
        y={top + 49}
        fontSize={13}
        fontWeight={600}
        fill="#15803d"
        style={MONO_FONT}
      >
        live
      </text>
      <text
        x={left + EDITOR.width - 32}
        y={top + 49}
        fontSize={13}
        textAnchor="end"
        fill={PALETTE.inkSoft}
        style={MONO_FONT}
      >
        synced 2s ago
      </text>
      <text
        x={left + EDITOR.width - 32}
        y={top + 216}
        fontSize={12}
        textAnchor="end"
        fill={PALETTE.inkSoft}
        style={MONO_FONT}
      >
        illustrative example
      </text>
      {DASHBOARD.stats.map((stat, i) => {
        const x = left + 32 + i * (cardW + 14);
        return (
          <g key={stat.label}>
            <rect
              x={x}
              y={top + 80}
              width={cardW}
              height={96}
              rx={10}
              fill="#ffffff"
              stroke="#00000014"
            />
            <text
              x={x + 18}
              y={top + 132}
              fontSize={36}
              fontWeight={700}
              fill={i === 0 ? PALETTE.accent : PALETTE.ink}
              style={SANS_FONT}
            >
              {stat.value}
            </text>
            <text x={x + 18} y={top + 158} fontSize={13} fill={PALETTE.inkSoft} style={MONO_FONT}>
              {stat.label}
            </text>
          </g>
        );
      })}
      <text x={left + 32} y={top + 216} fontSize={13} fill={PALETTE.inkSoft} style={MONO_FONT}>
        orders reconciled / day
      </text>
      <line
        x1={left + 32}
        x2={left + EDITOR.width - 32}
        y1={chartBottom}
        y2={chartBottom}
        stroke="#00000022"
      />
      {DASHBOARD.bars.map((fraction, i) => {
        const height = Math.round(fraction * maxBar);
        const last = i === DASHBOARD.bars.length - 1;
        return (
          <rect
            key={i}
            data-hero-bar={height}
            data-hero-bottom={chartBottom}
            x={left + 40 + i * 90}
            y={chartBottom - height}
            width={58}
            height={height}
            rx={6}
            fill={last ? PALETTE.accent : PALETTE.ink}
            opacity={last ? 1 : 0.82}
          />
        );
      })}
    </g>
  );
}

/** Far layer: dot grid and large out-of-focus light (moves least). */
function FarLayer({ ids, transform }: { ids: Ids; transform: string }) {
  const bokeh = [
    { x: 420, y: 160, r: 380, color: PALETTE.accent, opacity: 0.16 },
    { x: 1300, y: 660, r: 300, color: PALETTE.cool, opacity: 0.1 },
    { x: 2050, y: 120, r: 420, color: PALETTE.accent, opacity: 0.12 },
  ];
  return (
    <g data-hero="layer-far" transform={transform}>
      <rect x={-2400} y={-1800} width={7200} height={4200} fill={`url(#${ids("grid")})`} />
      {bokeh.map((b, i) => (
        <circle
          key={i}
          cx={b.x}
          cy={b.y}
          r={b.r}
          fill={`url(#${ids("bokeh")})`}
          style={{ color: b.color }}
          opacity={b.opacity * 4}
        />
      ))}
    </g>
  );
}

/** Near layer: drifting dust and two blurred foreground shapes (moves most). */
function NearLayer({ ids, transform }: { ids: Ids; transform: string }) {
  const random = createRandom(99);
  const specks = Array.from({ length: 30 }, (_, i) => ({
    key: i,
    x: random() * 5200 - 100,
    y: random() * 1500 - 200,
    r: 1.2 + random() * 2.6,
    opacity: 0.15 + random() * 0.35,
    duration: 7 + random() * 8,
    delay: -random() * 10,
    dx: (random() - 0.5) * 60,
    dy: -20 - random() * 50,
  }));
  return (
    <g data-hero="layer-near" transform={transform}>
      <rect
        x={40}
        y={980}
        width={560}
        height={260}
        rx={40}
        fill={PALETTE.blob}
        filter={`url(#${ids("defocus")})`}
      />
      <circle
        cx={4980}
        cy={140}
        r={170}
        fill={PALETTE.accent}
        opacity={0.1}
        filter={`url(#${ids("defocus")})`}
      />
      {specks.map((s) => (
        <circle
          key={s.key}
          data-hero-speck=""
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={PALETTE.uiText}
          opacity={s.opacity}
          style={
            {
              "--dx": `${s.dx.toFixed(1)}px`,
              "--dy": `${s.dy.toFixed(1)}px`,
              animation: `hero-drift ${s.duration.toFixed(1)}s ease-in-out ${s.delay.toFixed(1)}s infinite alternate`,
            } as CSSProperties
          }
        />
      ))}
    </g>
  );
}

/** The crumpled-ball outline, used for the flight ghosts. */
function GhostTrail() {
  return (
    <g data-hero="trail-ghosts">
      {Array.from({ length: GHOST_COUNT }, (_, i) => (
        <g key={i} data-hero-ghost="" style={HIDDEN}>
          <polygon points={PAPER_OUTLINES.ball} fill={PALETTE.paper} />
        </g>
      ))}
    </g>
  );
}

/** The single sheet of paper that carries the whole story. */
function Paper({
  ids,
  transforms,
}: {
  ids: Ids;
  transforms: { paper: string; paperInner: string };
}) {
  return (
    <g data-hero="paper" transform={transforms.paper}>
      <g filter={`url(#${ids("paper-shadow")})`}>
        <g data-hero="paper-inner" transform={transforms.paperInner}>
          <polygon
            data-hero="sheet-shadow"
            points={PAPER_OUTLINES.sheet}
            fill={PALETTE.paperShade}
            transform="translate(3 4)"
          />
          <polygon
            data-hero="sheet"
            points={PAPER_OUTLINES.sheet}
            fill={`url(#${ids("sheet-fill")})`}
          />
          <g data-hero="creases-sheet" style={HIDDEN}>
            {SHEET_CREASES.map((crease, i) => (
              <g key={i}>
                <polyline
                  points={toPolyline(crease)}
                  stroke={PALETTE.ink}
                  strokeOpacity={0.12}
                  strokeWidth={2}
                  fill="none"
                />
                <polyline
                  points={toPolyline(crease)}
                  stroke="#ffffff"
                  strokeOpacity={0.55}
                  strokeWidth={1.2}
                  fill="none"
                  transform="translate(1.5 1.5)"
                />
              </g>
            ))}
          </g>
          <g data-hero="creases-ball" style={HIDDEN}>
            <polygon points={PAPER_OUTLINES.ball} fill={`url(#${ids("ball-fill")})`} />
            {BALL_CREASES.map((crease, i) => (
              <polyline
                key={i}
                points={toPolyline(crease)}
                stroke={PALETTE.ink}
                strokeOpacity={0.3}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
              />
            ))}
            <polyline
              points="-30,-44 -8,-40 12,-50"
              stroke="#ffffff"
              strokeOpacity={0.7}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          </g>
          <g data-hero="sheet-content">
            <text
              x={HANDWRITING.x}
              y={-SHEET.height / 2 + 62}
              fontSize={14}
              letterSpacing={3}
              fill={PALETTE.inkSoft}
              style={MONO_FONT}
            >
              PROBLEM
            </text>
            <text
              x={SHEET.width / 2 - 36}
              y={-SHEET.height / 2 + 62}
              fontSize={14}
              textAnchor="end"
              fill={PALETTE.inkSoft}
              style={MONO_FONT}
            >
              #001
            </text>
            {Array.from({ length: 7 }, (_, i) => {
              const y = baseline(i - 1) + 10;
              return (
                <line
                  key={i}
                  x1={-SHEET.width / 2}
                  x2={SHEET.width / 2}
                  y1={y}
                  y2={y}
                  stroke={PALETTE.rule}
                  strokeWidth={1.5}
                />
              );
            })}
            <line
              x1={HANDWRITING.x - 22}
              x2={HANDWRITING.x - 22}
              y1={-SHEET.height / 2}
              y2={SHEET.height / 2}
              stroke={PALETTE.margin}
              strokeWidth={1.5}
            />
            {ANALYSED_LINES.map((line) => (
              <rect
                key={line}
                data-hero={`highlight-${line}`}
                x={HANDWRITING.x - 8}
                y={baseline(line) - 30}
                width={0}
                height={40}
                rx={4}
                fill={PALETTE.highlight}
              />
            ))}
            {PROBLEM_LINES.map((text, i) => (
              <text
                key={text}
                data-hero={`line-${i}`}
                x={HANDWRITING.x}
                y={baseline(i)}
                fontSize={HANDWRITING.fontSize}
                fontWeight={600}
                fill={PALETTE.ink}
                clipPath={`url(#${ids(`write-${i}`)})`}
                style={HAND_FONT}
              >
                {text}
              </text>
            ))}
            <path
              data-hero="scribble"
              d="M-175 20 L170 -12 L-160 58 L178 34 L-150 110 L186 82 L-120 160 L150 150"
              stroke={PALETTE.ink}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              strokeDashoffset={1}
              pathLength={1}
              fill="none"
              opacity={0.8}
            />
          </g>
        </g>
      </g>
    </g>
  );
}

/** Editor window: spec → code → terminal → deploy wipe into the product. */
function Editor({ ids }: { ids: Ids }) {
  const termTop = EDITOR_BOX.y + EDITOR.height - EDITOR_BOX.terminalHeight;
  return (
    <g data-hero="editor" style={HIDDEN}>
      <g filter={`url(#${ids("panel-shadow")})`}>
        <Glass
          x={EDITOR_BOX.x}
          y={EDITOR_BOX.y}
          width={EDITOR.width}
          height={EDITOR.height}
          ids={ids}
        />
      </g>
      <line
        x1={EDITOR_BOX.x}
        x2={EDITOR_BOX.x + EDITOR.width}
        y1={EDITOR_BOX.y + EDITOR_BOX.titleBar}
        y2={EDITOR_BOX.y + EDITOR_BOX.titleBar}
        stroke={PALETTE.panelBorder}
      />
      {["#ff5f57", "#febc2e", "#28c840"].map((color, i) => (
        <circle
          key={color}
          cx={EDITOR_BOX.x + 22 + i * 20}
          cy={EDITOR_BOX.y + 20}
          r={6}
          fill={color}
          opacity={0.75}
        />
      ))}
      <text
        data-hero="tab-spec"
        x={EDITOR.cx}
        y={EDITOR_BOX.y + 26}
        textAnchor="middle"
        fontSize={14}
        fill={PALETTE.uiMuted}
        style={MONO_FONT}
      >
        spec.ts
      </text>
      <text
        data-hero="tab-build"
        x={EDITOR.cx}
        y={EDITOR_BOX.y + 26}
        textAnchor="middle"
        fontSize={14}
        fill={PALETTE.uiMuted}
        style={{ ...MONO_FONT, ...HIDDEN }}
      >
        sync.ts
      </text>

      <g data-hero="spec">
        <CodeBlock lines={SPEC_LINES} clipPrefix={ids("spec")} revealName="spec-reveal" />
      </g>
      <g data-hero="build" style={HIDDEN}>
        <CodeBlock lines={BUILD_LINES} clipPrefix={ids("build")} revealName="build-reveal" />
      </g>

      <g data-hero="terminal" style={HIDDEN}>
        <rect
          x={EDITOR_BOX.x + 1}
          y={termTop}
          width={EDITOR.width - 2}
          height={EDITOR_BOX.terminalHeight - 1}
          fill={PALETTE.terminal}
          fillOpacity={0.9}
        />
        <line
          x1={EDITOR_BOX.x}
          x2={EDITOR_BOX.x + EDITOR.width}
          y1={termTop}
          y2={termTop}
          stroke={PALETTE.panelBorder}
        />
        {TERMINAL_LINES.map((line, i) => {
          const y = termTop + 32 + i * 26;
          return (
            <g key={line.command} data-hero={`term-${i}`} style={HIDDEN}>
              <text
                x={EDITOR_BOX.x + 24}
                y={y}
                fontSize={15}
                fill={PALETTE.uiMuted}
                style={MONO_FONT}
              >
                {line.command}
              </text>
              <text x={EDITOR_BOX.x + 220} y={y} fontSize={15} fill={PALETTE.ok} style={MONO_FONT}>
                {line.result}
              </text>
            </g>
          );
        })}
        <rect
          x={EDITOR_BOX.x + 24}
          y={EDITOR_BOX.y + EDITOR.height - 18}
          width={EDITOR.width - 48}
          height={4}
          rx={2}
          fill={PALETTE.panelBorder}
        />
        <rect
          data-hero="progress"
          x={EDITOR_BOX.x + 24}
          y={EDITOR_BOX.y + EDITOR.height - 18}
          width={0}
          height={4}
          rx={2}
          fill={PALETTE.accent}
        />
      </g>

      <g clipPath={`url(#${ids("wipe")})`}>
        <Dashboard />
      </g>
      <rect
        data-hero="scan"
        x={EDITOR_BOX.x - 20}
        y={EDITOR_BOX.y}
        width={EDITOR.width + 40}
        height={3}
        fill={PALETTE.accent}
        filter={`url(#${ids("glow-blur")})`}
        style={HIDDEN}
      />
    </g>
  );
}

/** Users the product ships to, connected back to the editor. */
function Users({ ids }: { ids: Ids }) {
  return (
    <g>
      {USERS.map((user, i) => (
        <path
          key={user.label}
          data-hero={`user-line-${i}`}
          d={`M${EDITOR.cx} ${EDITOR.cy} L${user.x.toFixed(1)} ${user.y.toFixed(1)}`}
          stroke={PALETTE.accent}
          strokeWidth={2}
          strokeDasharray="1"
          strokeDashoffset={1}
          pathLength={1}
          fill="none"
          opacity={0.55}
        />
      ))}
      {USERS.map((user, i) => (
        <g
          key={user.label}
          data-hero-user=""
          style={HIDDEN}
          transform={`translate(${user.x.toFixed(1)} ${user.y.toFixed(1)})`}
        >
          <circle r={64} fill={`url(#${ids("bokeh")})`} style={{ color: PALETTE.accent }} />
          <Glass x={-30} y={-30} width={60} height={60} radius={30} ids={ids} />
          <circle data-hero={`user-fill-${i}`} r={30} fill={PALETTE.accent} style={HIDDEN} />
          <circle cy={-7} r={8} fill={PALETTE.uiText} />
          <path d="M-14 16 a14 12 0 0 1 28 0 Z" fill={PALETTE.uiText} />
          <text y={58} textAnchor="middle" fontSize={17} fill={PALETTE.uiMuted} style={MONO_FONT}>
            {user.label}
          </text>
        </g>
      ))}
    </g>
  );
}

/**
 * The whole story as a layered SVG world (far / mid / near parallax layers)
 * plus the visitor's "you" cursor. Purely presentational: every moving part is
 * addressed by `data-hero` and animated by the story timeline.
 */
export function StoryScene({ devName }: { devName: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const ids: Ids = (name) => `${uid}-${name}`;
  const rig = createRig("wide");
  const frame = frameViewport(SSR_PIXELS, "wide");
  const t = rigTransforms(rig, frame);
  const unfolded = PAPER_STAGES.unfolded;
  const catchAt = PAPER_STAGES.catch;

  return (
    <>
      <svg
        data-hero="svg"
        viewBox={frameViewBox(frame)}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full transition-opacity duration-700"
        style={{ opacity: 0 }}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <pattern id={ids("grid")} width={40} height={40} patternUnits="userSpaceOnUse">
            <circle cx={1.5} cy={1.5} r={1.5} fill={PALETTE.grid} />
          </pattern>
          <radialGradient id={ids("bokeh")}>
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </radialGradient>
          <linearGradient id={ids("sheet-fill")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbf8f1" />
            <stop offset="60%" stopColor={PALETTE.paper} />
            <stop offset="100%" stopColor={PALETTE.paperEdge} />
          </linearGradient>
          <radialGradient id={ids("ball-fill")} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fffdf7" />
            <stop offset="55%" stopColor={PALETTE.paper} />
            <stop offset="100%" stopColor={PALETTE.paperShade} />
          </radialGradient>
          <linearGradient id={ids("glass-border")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.glassEdge} stopOpacity={0.22} />
            <stop offset="100%" stopColor={PALETTE.glassEdge} stopOpacity={0.06} />
          </linearGradient>
          <linearGradient id={ids("glass-top")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
            <stop offset="50%" stopColor="#ffffff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
          <radialGradient id={ids("vignette")} cx="50%" cy="50%" r="72%">
            <stop offset="55%" stopColor={PALETTE.stage} stopOpacity={0} />
            <stop offset="100%" stopColor={PALETTE.stage} stopOpacity={0.85} />
          </radialGradient>
          <radialGradient id={ids("spot")}>
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.07} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>
          <filter id={ids("paper-shadow")} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx={0}
              dy={22}
              stdDeviation={18}
              floodColor={PALETTE.paperShadow}
              floodOpacity={1}
            />
          </filter>
          <filter id={ids("panel-shadow")} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow
              dx={0}
              dy={30}
              stdDeviation={30}
              floodColor={PALETTE.panelShadow}
              floodOpacity={1}
            />
          </filter>
          <filter id={ids("motion-blur")} x="-60%" y="-30%" width="220%" height="160%">
            <feGaussianBlur data-hero="ball-blur" stdDeviation="0 0" />
          </filter>
          <filter id={ids("defocus")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={28} />
          </filter>
          <filter id={ids("glow-blur")} x="-10%" y="-400%" width="120%" height="900%">
            <feGaussianBlur stdDeviation={3} result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {PROBLEM_LINES.map((_, i) => (
            <clipPath key={i} id={ids(`write-${i}`)}>
              <rect
                data-hero={`reveal-${i}`}
                x={HANDWRITING.x - 6}
                y={baseline(i) - HANDWRITING.fontSize}
                width={0}
                height={HANDWRITING.fontSize * 1.5}
              />
            </clipPath>
          ))}
          <clipPath id={ids("wipe")}>
            <rect
              data-hero="wipe"
              x={EDITOR_BOX.x}
              y={EDITOR_BOX.y}
              width={EDITOR.width}
              height={0}
            />
          </clipPath>
        </defs>

        <FarLayer ids={ids} transform={t.far} />

        <g data-hero="layer-mid" transform={t.mid}>
          {/* Soft pools of light where the story happens */}
          <ellipse
            cx={PAPER_STAGES.desk.x}
            cy={PAPER_STAGES.desk.y + 40}
            rx={560}
            ry={420}
            fill={`url(#${ids("spot")})`}
          />
          <ellipse
            cx={EDITOR.cx - 300}
            cy={EDITOR.cy}
            rx={900}
            ry={560}
            fill={`url(#${ids("spot")})`}
          />

          <JourneyThreads />
          <AnalysisBoards ids={ids} />
          <Users ids={ids} />
          <Editor ids={ids} />

          {/* Phrases lifted off the paper into the spec */}
          {ANALYSED_LINES.map((line, i) => {
            const start = localToWorld(
              { x: HANDWRITING.x + 20, y: baseline(line) + 52 },
              unfolded,
              unfolded.rot,
            );
            return (
              <text
                key={line}
                data-hero={`token-${i}`}
                x={start.x}
                y={start.y}
                fontSize={18}
                fontWeight={600}
                fill={PALETTE.accent}
                style={{ ...MONO_FONT, ...HIDDEN }}
              >
                {TOKEN_LABELS[i]}
              </text>
            );
          })}

          {/* Catch effects */}
          <path
            data-hero="dev-trail"
            d={`M${DEV_CURSOR.enter.x} ${DEV_CURSOR.enter.y} Q ${DEV_CURSOR.catch.x + 420} ${DEV_CURSOR.catch.y + 340} ${DEV_CURSOR.catch.x} ${DEV_CURSOR.catch.y}`}
            stroke={PALETTE.accent}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="1"
            strokeDashoffset={1}
            pathLength={1}
            fill="none"
            opacity={0.6}
            filter={`url(#${ids("glow-blur")})`}
          />
          <circle
            data-hero="shock"
            cx={catchAt.x}
            cy={catchAt.y}
            r={20}
            fill="none"
            stroke={PALETTE.accent}
            strokeWidth={6}
            style={HIDDEN}
          />
          <g data-hero="caught" style={HIDDEN}>
            <text
              x={catchAt.x - 40}
              y={catchAt.y - 120}
              fontSize={26}
              fontWeight={600}
              fill={PALETTE.accent}
              style={MONO_FONT}
            >
              caught()
            </text>
            <text
              x={catchAt.x - 40}
              y={catchAt.y - 92}
              fontSize={16}
              fill={PALETTE.uiMuted}
              style={MONO_FONT}
            >
              {"// before it hit the floor"}
            </text>
          </g>

          <GhostTrail />
          <g data-hero="paper-motion">
            <Paper ids={ids} transforms={t} />
          </g>

          {/* Ticket tag riding along with the thrown ball */}
          <g
            data-hero="tag"
            transform={`translate(${rig.paper.x.toFixed(2)} ${(rig.paper.y - TAG_OFFSET).toFixed(2)})`}
            style={HIDDEN}
          >
            <Glass x={-112} y={-20} width={224} height={36} radius={18} ids={ids} />
            <circle cx={-90} cy={-2} r={5} fill={PALETTE.accent} />
            <text x={-76} y={4} fontSize={15} fill={PALETTE.uiText} style={MONO_FONT}>
              {"issue #001 · won't fix"}
            </text>
          </g>

          {/* People */}
          <g data-hero="client" transform={t.client}>
            <Cursor label="client" color={PALETTE.client} labelColor={PALETTE.stage} />
            <g data-hero="bubble" style={HIDDEN}>
              <rect x={30} y={-82} width={268} height={50} rx={14} fill={PALETTE.paper} />
              <text
                x={48}
                y={-50}
                fontSize={26}
                fontWeight={600}
                fill={PALETTE.ink}
                style={HAND_FONT}
              >
                finally. it just works ✓
              </text>
            </g>
          </g>
          <g data-hero="dev" transform={t.dev} style={HIDDEN}>
            <Cursor label={devName} color={PALETTE.accent} labelColor={PALETTE.stage} />
          </g>
        </g>

        <NearLayer ids={ids} transform={t.near} />

        <rect
          data-hero="vignette"
          x={0}
          y={0}
          width={frame.width}
          height={frame.height}
          fill={`url(#${ids("vignette")})`}
          pointerEvents="none"
        />
      </svg>

      {/* The visitor's own cursor; positioned in stage pixels by the catch hook */}
      <div
        data-hero="you"
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-30 will-change-transform"
        style={HIDDEN}
      >
        <svg width={86} height={74} viewBox="0 0 86 74" className="overflow-visible">
          <Cursor label="you" color={PALETTE.cool} labelColor={PALETTE.stage} />
        </svg>
      </div>
    </>
  );
}
