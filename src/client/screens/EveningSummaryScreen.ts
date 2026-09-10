export function eveningSummaryScreen(title: string, rows: string): string {
  return `<div class="closed-screen"><h2>${title}</h2><ul class="roster results-list">${rows}</ul></div>`;
}
