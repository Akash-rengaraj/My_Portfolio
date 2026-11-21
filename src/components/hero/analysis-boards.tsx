import type { ReactNode } from "react";

import {
  BOARDS,
  BRIEF,
  JOURNEY,
  OPTIONS,
  SWOT,
  WHY_LAYOUT,
  WHYS,
  boardRect,
  type BoardId,
  type SwotKey,
} from "./analysis-layout";
import { PALETTE } from "./scene-layout";
import { Glass, HIDDEN, MONO_FONT, SANS_FONT, TitleBar, type Ids } from "./svg-parts";

/** Approximate rendered width of mono text (for chips and rings). */
const monoWidth = (text: string, fontSize: number) => text.length * fontSize * 0.6;

interface Chip {
  label: string;
  x: number;
  width: number;
}

/** Lay pill chips out left to right with a fixed gap. */
export function layoutChips(
  labels: readonly string[],
  fontSize: number,
  startX: number,
  padding: number,
): Chip[] {
  return labels.reduce<Chip[]>((chips, label) => {
    const last = chips.at(-1);
    const x = last ? last.x + last.width + 10 : startX;
    return [...chips, { label, x, width: monoWidth(label, fontSize) + padding }];
  }, []);
}

const BRIEF_CHIPS = layoutChips(BRIEF.affected, 14, 28, 30);

const SWOT_TONE: Record<SwotKey, string> = {
  S: PALETTE.ok,
  W: PALETTE.accent,
  O: PALETTE.cool,
  T: PALETTE.warn,
};

const LABEL_PROPS = {
  fontSize: 12,
  letterSpacing: 2,
  fill: PALETTE.uiMuted,
  style: MONO_FONT,
} as const;

/** Board chrome; children are drawn in board-relative coordinates. */
function BoardFrame({ id, ids, children }: { id: BoardId; ids: Ids; children: ReactNode }) {
  const board = BOARDS[id];
  const rect = boardRect(board);
  return (
    <g data-hero={`board-${id}`} style={HIDDEN}>
      <g transform={`translate(${rect.x} ${rect.y})`}>
        <g filter={`url(#${ids("panel-shadow")})`}>
          <Glass x={0} y={0} width={board.width} height={board.height} ids={ids} />
        </g>
        <TitleBar width={board.width} file={board.file} step={board.step} />
        {children}
      </g>
    </g>
  );
}

/** 03 — problem.md: symptoms, who is affected, impact, definition of done. */
function BriefBoard({ ids }: { ids: Ids }) {
  return (
    <BoardFrame id="brief" ids={ids}>
      <text x={28} y={78} {...LABEL_PROPS}>
        SYMPTOMS
      </text>
      {BRIEF.symptoms.map((symptom, i) => {
        const y = BRIEF.symptomTop + i * BRIEF.rowHeight;
        return (
          <g key={symptom} data-hero={`brief-symptom-${i}`} data-hero-item="" style={HIDDEN}>
            <circle cx={34} cy={y - 5} r={3.5} fill={PALETTE.accent} />
            <text x={48} y={y} fontSize={17} fill={PALETTE.uiText} style={SANS_FONT}>
              {symptom}
            </text>
          </g>
        );
      })}
      <text x={28} y={218} {...LABEL_PROPS}>
        AFFECTED
      </text>
      {BRIEF_CHIPS.map((chip, i) => (
        <g key={chip.label} data-hero={`brief-chip-${i}`} data-hero-item="" style={HIDDEN}>
          <rect
            x={chip.x}
            y={232}
            width={chip.width}
            height={30}
            rx={15}
            fill={PALETTE.panelBorder}
          />
          <text x={chip.x + 15} y={252} fontSize={14} fill={PALETTE.uiText} style={MONO_FONT}>
            {chip.label}
          </text>
        </g>
      ))}
      <text x={28} y={298} {...LABEL_PROPS}>
        IMPACT
      </text>
      {BRIEF.impact.map((stat, i) => {
        const x = 28 + i * 186;
        return (
          <g key={stat.label} data-hero={`brief-impact-${i}`} data-hero-item="" style={HIDDEN}>
            <rect
              x={x}
              y={310}
              width={172}
              height={76}
              rx={10}
              fill={PALETTE.tint}
              stroke={PALETTE.panelBorder}
            />
            <text
              x={x + 16}
              y={351}
              fontSize={32}
              fontWeight={700}
              fill={PALETTE.accent}
              style={SANS_FONT}
            >
              {stat.value}
            </text>
            <text x={x + 16} y={374} fontSize={12} fill={PALETTE.uiMuted} style={MONO_FONT}>
              {stat.label}
            </text>
          </g>
        );
      })}
      <g data-hero="brief-done" data-hero-item="" style={HIDDEN}>
        <text x={28} y={418} fontSize={14} style={MONO_FONT}>
          <tspan fill={PALETTE.uiMuted}>done when → </tspan>
          <tspan fill={PALETTE.ok}>{BRIEF.doneWhen}</tspan>
        </text>
      </g>
    </BoardFrame>
  );
}

/** 04 — five whys, ending on the root cause. */
function WhysBoard({ ids }: { ids: Ids }) {
  const width = BOARDS.whys.width;
  const rootY = WHY_LAYOUT.top + (WHYS.length - 1) * WHY_LAYOUT.rowHeight;
  return (
    <BoardFrame id="whys" ids={ids}>
      {WHYS.map((why, i) => {
        const y = WHY_LAYOUT.top + i * WHY_LAYOUT.rowHeight;
        const last = i === WHYS.length - 1;
        return (
          <g key={why.question} data-hero={`why-${i}`} data-hero-item="" style={HIDDEN}>
            {why.root ? (
              <rect
                x={14}
                y={y - 4}
                width={width - 28}
                height={62}
                rx={10}
                fill={PALETTE.accentSoft}
                stroke={PALETTE.accent}
                strokeOpacity={0.6}
              />
            ) : null}
            <circle
              cx={40}
              cy={y + 22}
              r={14}
              fill="none"
              stroke={why.root ? PALETTE.accent : PALETTE.panelBorder}
              strokeWidth={2}
            />
            <text
              x={40}
              y={y + 27}
              fontSize={13}
              textAnchor="middle"
              fill={why.root ? PALETTE.accent : PALETTE.uiMuted}
              style={MONO_FONT}
            >
              {i + 1}
            </text>
            {last ? null : (
              <line
                x1={40}
                x2={40}
                y1={y + 38}
                y2={y + WHY_LAYOUT.rowHeight + 4}
                stroke={PALETTE.panelBorder}
                strokeWidth={2}
              />
            )}
            <text x={68} y={y + 16} fontSize={13} fill={PALETTE.uiMuted} style={MONO_FONT}>
              {why.question}
            </text>
            <text
              x={68}
              y={y + 42}
              fontSize={18}
              fontWeight={why.root ? 700 : 500}
              fill={why.root ? PALETTE.accent : PALETTE.uiText}
              style={SANS_FONT}
            >
              {why.answer}
            </text>
          </g>
        );
      })}
      <g data-hero="why-root" data-hero-item="" style={HIDDEN}>
        <rect x={width - 152} y={rootY + 4} width={126} height={26} rx={13} fill={PALETTE.accent} />
        <text
          x={width - 89}
          y={rootY + 22}
          fontSize={12}
          fontWeight={700}
          letterSpacing={1.5}
          textAnchor="middle"
          fill={PALETTE.stage}
          style={MONO_FONT}
        >
          ROOT CAUSE
        </text>
      </g>
    </BoardFrame>
  );
}

/** 05 — SWOT quadrants. */
function SwotBoard({ ids }: { ids: Ids }) {
  const cellW = 274;
  const cellH = 176;
  return (
    <BoardFrame id="swot" ids={ids}>
      {SWOT.map((quadrant, i) => {
        const x = 20 + (i % 2) * (cellW + 12);
        const y = 56 + Math.floor(i / 2) * (cellH + 12);
        const tone = SWOT_TONE[quadrant.key];
        return (
          <g key={quadrant.key} data-hero={`swot-${i}`} data-hero-item="" style={HIDDEN}>
            <rect
              x={x}
              y={y}
              width={cellW}
              height={cellH}
              rx={12}
              fill={tone}
              fillOpacity={0.07}
              stroke={tone}
              strokeOpacity={0.35}
            />
            <text
              x={x + cellW - 18}
              y={y + 54}
              fontSize={52}
              fontWeight={800}
              textAnchor="end"
              fill={tone}
              opacity={0.3}
              style={SANS_FONT}
            >
              {quadrant.key}
            </text>
            <text
              x={x + 18}
              y={y + 34}
              fontSize={13}
              fontWeight={700}
              letterSpacing={2}
              fill={tone}
              style={MONO_FONT}
            >
              {quadrant.title.toUpperCase()}
            </text>
            {quadrant.items.map((item, j) => (
              <text
                key={item}
                x={x + 18}
                y={y + 86 + j * 32}
                fontSize={15}
                fill={PALETTE.uiText}
                style={SANS_FONT}
              >
                · {item}
              </text>
            ))}
          </g>
        );
      })}
    </BoardFrame>
  );
}

const OPTION_COLUMNS_X = [300, 372, 444, 516] as const;
export const OPTION_BAR = { x: 590, maxWidth: 66 } as const;
const optionRowY = (i: number) => 104 + i * 64;

/** Colour for a decision-matrix cell. */
function cellTone(value: string): string {
  if (value === "high" || value === "$$$$") return PALETTE.accent;
  if (value === "low" || value === "$") return PALETTE.ok;
  return PALETTE.uiMuted;
}

/** 06 — scored options and the efficiency win. */
function DecisionBoard({ ids }: { ids: Ids }) {
  const width = BOARDS.decision.width;
  const chosen = OPTIONS.rows.findIndex((r) => "chosen" in r && r.chosen);
  return (
    <BoardFrame id="decision" ids={ids}>
      <text x={28} y={80} {...LABEL_PROPS}>
        OPTION
      </text>
      {OPTIONS.columns.map((column, c) => (
        <text key={column} x={OPTION_COLUMNS_X[c]} y={80} {...LABEL_PROPS}>
          {column.toUpperCase()}
        </text>
      ))}
      <text x={OPTION_BAR.x} y={80} {...LABEL_PROPS}>
        SCORE
      </text>
      <g data-hero="option-pick" data-hero-item="" style={HIDDEN}>
        <rect
          x={14}
          y={optionRowY(chosen) - 6}
          width={width - 28}
          height={56}
          rx={10}
          fill={PALETTE.ok}
          fillOpacity={0.08}
          stroke={PALETTE.ok}
          strokeWidth={2}
        />
        <rect
          x={width - 132}
          y={optionRowY(chosen) - 30}
          width={112}
          height={24}
          rx={12}
          fill={PALETTE.ok}
        />
        <text
          x={width - 76}
          y={optionRowY(chosen) - 13}
          fontSize={12}
          fontWeight={700}
          textAnchor="middle"
          fill={PALETTE.stage}
          style={MONO_FONT}
        >
          ✓ OPTIMAL
        </text>
      </g>
      {OPTIONS.rows.map((row, i) => {
        const y = optionRowY(i);
        const isChosen = "chosen" in row && row.chosen;
        return (
          <g key={row.name}>
            <g data-hero={`option-${i}`} data-hero-item="" style={HIDDEN}>
              <text
                x={28}
                y={y + 24}
                fontSize={16}
                fontWeight={isChosen ? 700 : 500}
                fill={PALETTE.uiText}
                style={SANS_FONT}
              >
                {row.name}
              </text>
              {row.cells.map((cell, c) => (
                <text
                  key={OPTIONS.columns[c]}
                  x={OPTION_COLUMNS_X[c]}
                  y={y + 24}
                  fontSize={15}
                  fill={cellTone(cell)}
                  style={MONO_FONT}
                >
                  {cell}
                </text>
              ))}
              <text
                x={OPTION_BAR.x}
                y={y + 44}
                fontSize={12}
                fill={PALETTE.uiMuted}
                style={MONO_FONT}
              >
                {row.score.toFixed(1)} / 10
              </text>
            </g>
            <rect
              data-hero={`option-bar-${i}`}
              data-hero-score={row.score}
              x={OPTION_BAR.x}
              y={y + 10}
              width={0}
              height={16}
              rx={4}
              fill={isChosen ? PALETTE.ok : PALETTE.uiMuted}
              fillOpacity={isChosen ? 1 : 0.6}
            />
          </g>
        );
      })}
      <g data-hero="option-note" data-hero-item="" style={HIDDEN}>
        <line x1={28} x2={width - 28} y1={312} y2={312} stroke={PALETTE.panelBorder} />
        <text x={28} y={344} {...LABEL_PROPS}>
          EFFICIENCY
        </text>
        <text x={28} y={390} fontSize={30} fontWeight={700} fill={PALETTE.cool} style={MONO_FONT}>
          {OPTIONS.complexity}
        </text>
        <text x={28} y={426} fontSize={14} fill={PALETTE.uiMuted} style={MONO_FONT}>
          {OPTIONS.complexityNote}
        </text>
      </g>
    </BoardFrame>
  );
}

/** The investigation wall: every analysis board, initially hidden. */
export function AnalysisBoards({ ids }: { ids: Ids }) {
  return (
    <g>
      <BriefBoard ids={ids} />
      <WhysBoard ids={ids} />
      <SwotBoard ids={ids} />
      <DecisionBoard ids={ids} />
    </g>
  );
}

/** The thread of reasoning between consecutive stops of the journey. */
export function JourneyThreads() {
  return (
    <g>
      {JOURNEY.slice(1).map((to, i) => {
        const from = JOURNEY[i] ?? to;
        const midX = (from.x + to.x) / 2;
        const midY = Math.min(from.y, to.y) - 140;
        return (
          <path
            key={i}
            data-hero={`thread-${i}`}
            d={`M${from.x} ${from.y} Q${midX} ${midY} ${to.x} ${to.y}`}
            stroke={PALETTE.accent}
            strokeOpacity={0.45}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="1"
            strokeDashoffset={1}
            pathLength={1}
            fill="none"
          />
        );
      })}
    </g>
  );
}
