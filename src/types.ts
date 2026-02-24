export interface CardData {
  title: string; // 2-6 chars
  desc: string; // HTML string with <strong> and <code> allowed
  icon: string; // Material icon name
}

export interface GeneratedContent {
  mainTitle: string;
  cards: CardData[];
}

export const THEMES = [
  { name: 'sky',     text: 'text-sky-300',     shadow: '#7dd3fc' },
  { name: 'pink',    text: 'text-pink-300',    shadow: '#f9a8d4' },
  { name: 'lime',    text: 'text-lime-300',    shadow: '#bef264' },
  { name: 'blue',    text: 'text-blue-300',    shadow: '#93c5fd' },
  { name: 'emerald', text: 'text-emerald-300', shadow: '#6ee7b7' },
  { name: 'rose',    text: 'text-rose-300',    shadow: '#fda4af' },
  { name: 'amber',   text: 'text-amber-300',   shadow: '#fcd34d' }
];
