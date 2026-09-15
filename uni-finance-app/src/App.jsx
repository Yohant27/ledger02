import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Home as HomeIcon, CalendarDays } from "lucide-react";
import { db } from "./db.js";
import { COLORS, FONT_VOICE, FONT_UI } from "./theme.js";
import { getTodaySpending, getSavedSoFar, todayStr } from "./logic.js";
import { DAILY_TARGET } from "./config.js";
import DailyBar from "./components/DailyBar.jsx";
import SavedSoFar from "./components/SavedSoFar.jsx";
import TransactionEntry from "./components/TransactionEntry.jsx";
import TodayList from "./components/TodayList.jsx";
import CalendarView from "./components/CalendarView.jsx";

export default function App() {
  const [tab, setTab] = useState("home");

  const transactions = useLiveQuery(() => db.transactions.toArray(), []) || [];
  const daySettingsRows = useLiveQuery(() => db.daySettings.toArray(), []) || [];

  const daySettingsMap = useMemo(() => {
    const map = {};
    for (const row of daySettingsRows) map[row.date] = row;
    return map;
  }, [daySettingsRows]);

  const today = todayStr();
  const todaySpent = useMemo(() => getTodaySpending(transactions, today), [transactions, today]);
  const todaysTransactions = useMemo(
    () => transactions.filter((t) => t.date === today).sort((a, b) => b.createdAt - a.createdAt),
    [transactions, today]
  );
  const savedData = useMemo(
    () => getSavedSoFar(transactions, daySettingsMap, DAILY_TARGET, today),
    [transactions, daySettingsMap, today]
  );

  async function addTransaction(entry) {
    await db.transactions.add({ ...entry, createdAt: Date.now() });
  }

  async function deleteTransaction(id) {
    await db.transactions.delete(id);
  }

  async function toggleDay(dateStr, included) {
    await db.daySettings.put({ date: dateStr, included, source: "manual" });
  }

  async function setRangeDay(dates, preset) {
    if (preset === "weekdays") {
      await db.daySettings.bulkDelete(dates);
    } else {
      const included = preset === "all";
      await db.daySettings.bulkPut(dates.map((date) => ({ date, included, source: "manual" })));
    }
  }

  const dateHeader = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  }).toUpperCase();

  return (
    <div style={{ fontFamily: FONT_UI, background: COLORS.ink, minHeight: "100vh", padding: "28px 14px 90px", display: "flex", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .uf-card { width: 100%; max-width: 420px; }
        input::placeholder { color: rgba(22,33,58,0.4); }
      `}</style>

      <div className="uf-card">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ fontFamily: FONT_VOICE, fontSize: 15, color: COLORS.paper, letterSpacing: "0.02em" }}>
            Uni Finance
          </span>
          <span style={{ fontFamily: FONT_UI, fontSize: 12, color: "rgba(237,239,231,0.5)" }}>{dateHeader}</span>
        </div>

        <div
          style={{
            background: COLORS.paper,
            borderRadius: 6,
            border: "1px solid rgba(22,33,58,0.5)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
            overflow: "hidden",
          }}
        >
          {tab === "home" ? (
            <>
              <div style={{ padding: "22px 22px 18px", borderBottom: `1px solid ${COLORS.line}` }}>
                <TransactionEntry onAdd={addTransaction} />
              </div>

              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.line}` }}>
                <DailyBar todaySpent={todaySpent} />
              </div>

              <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.line}` }}>
                <SavedSoFar data={savedData} />
              </div>

              <div style={{ padding: "14px 22px", maxHeight: 260, overflowY: "auto" }}>
                <div style={{ fontSize: 11, color: "rgba(22,33,58,0.5)", marginBottom: 4, fontFamily: FONT_UI }}>
                  Today's entries
                </div>
                <TodayList transactions={todaysTransactions} onDelete={deleteTransaction} />
              </div>
            </>
          ) : (
            <div style={{ padding: "20px 22px" }}>
              <CalendarView daySettingsMap={daySettingsMap} onToggleDay={toggleDay} onSetRange={setRangeDay} />
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <NavButton active={tab === "home"} onClick={() => setTab("home")} icon={HomeIcon} label="Home" />
          <NavButton active={tab === "calendar"} onClick={() => setTab("calendar")} icon={CalendarDays} label="Days" />
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "10px 0",
        borderRadius: 6,
        border: `1px solid ${active ? "rgba(201,138,62,0.5)" : "rgba(237,239,231,0.15)"}`,
        background: active ? "rgba(201,138,62,0.12)" : "transparent",
        color: active ? "#EFC988" : "rgba(237,239,231,0.5)",
        fontFamily: FONT_UI,
        fontSize: 12.5,
        cursor: "pointer",
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
