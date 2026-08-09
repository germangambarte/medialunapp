export function formatMoney(amount: number) {
  return `$${amount.toLocaleString("es-AR")}`;
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(isoDate: string) {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
