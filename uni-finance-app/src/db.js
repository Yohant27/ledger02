import Dexie from "dexie";

export const db = new Dexie("UniFinanceDB");

// transactions: every recorded expense/income
// daySettings: ONLY stores manual overrides. If a date has no row here,
// its included/excluded state falls back to the weekday/weekend default.
db.version(1).stores({
  transactions: "++id, type, category, date, createdAt",
  daySettings: "date", // date: 'YYYY-MM-DD', included: boolean, source: 'manual'
});

export default db;
