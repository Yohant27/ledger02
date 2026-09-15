import { COLORS, FONT_MONO, FONT_UI, fmt } from "../theme.js";
import { CURRENCY, DAILY_TARGET, WARNING_THRESHOLD } from "../config.js";
import { getDailyState } from "../logic.js";

export default function DailyBar({ todaySpent }) {
  const state = getDailyState(todaySpent, DAILY_TARGET, WARNING_THRESHOLD);
  const barColor = state === "over" ? COLORS.brick : state === "warning" ? COLORS.gold : COLORS.teal;
  const pct = Math.min((todaySpent / DAILY_TARGET) * 100, 100);
  const markerPct = (WARNING_THRESHOLD / DAILY_TARGET) * 100;
  const over = todaySpent > DAILY_TARGET ? todaySpent - DAILY_TARGET : 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "rgba(22,33,58,0.55)", fontFamily: FONT_UI }}>Today</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.ink }}>
          {CURRENCY} {fmt(todaySpent)} <span style={{ color: "rgba(22,33,58,0.4)" }}>/ {CURRENCY} {fmt(DAILY_TARGET)}</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 10, background: COLORS.lineSoft, borderRadius: 5, overflow: "visible" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: barColor,
            borderRadius: 5,
            transition: "width 200ms ease, background 200ms ease",
          }}
        />
        <div
          title={`${CURRENCY}${WARNING_THRESHOLD} warning line`}
          style={{
            position: "absolute",
            left: `${markerPct}%`,
            top: -3,
            bottom: -3,
            width: 2,
            background: "rgba(22,33,58,0.35)",
          }}
        />
      </div>
      {over > 0 && (
        <div style={{ marginTop: 6, fontSize: 11.5, color: COLORS.brick, fontFamily: FONT_UI }}>
          {CURRENCY} {fmt(over)} over target
        </div>
      )}
    </div>
  );
}
