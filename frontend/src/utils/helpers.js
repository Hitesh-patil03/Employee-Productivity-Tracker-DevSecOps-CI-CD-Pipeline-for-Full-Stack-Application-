// ── Format HH:MM:SS ──
export const fmtTime = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

// ── Format date ──
export const fmtDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Initials from name ──
export const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

// ── Score → color ──
export const scoreColor = (score) =>
  score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';

// ── Score → label ──
export const scoreLabel = (score) =>
  score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';

// ── Priority color ──
export const priColor = (p) =>
  p === 'high' ? '#f87171' : p === 'med' ? '#fbbf24' : '#34d399';

// ── Avatar bg/color ──
const AVATAR_COLORS = [
  { bg: 'rgba(79,156,249,0.18)', fg: '#4f9cf9' },
  { bg: 'rgba(167,139,250,0.18)', fg: '#a78bfa' },
  { bg: 'rgba(245,158,11,0.18)', fg: '#f59e0b' },
  { bg: 'rgba(52,211,153,0.18)', fg: '#34d399' },
  { bg: 'rgba(79,209,197,0.18)', fg: '#4fd1c5' },
  { bg: 'rgba(248,113,113,0.18)', fg: '#f87171' },
];
export const avatarColor = (index) => AVATAR_COLORS[index % AVATAR_COLORS.length];

// ── Status badge class ──
export const statusClass = (s) => `badge badge-${s}`;

// ── Status label ──
export const statusLabel = (s) => ({
  pending: 'Pending',
  inprogress: 'In Progress',
  done: 'Done',
  overdue: 'Overdue',
}[s] || s);

// ── Dept colors ──
export const DEPT_COLORS = ['#4f9cf9', '#a78bfa', '#fbbf24', '#34d399', '#4fd1c5'];
export const DEPTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'];

// ── Copy to clipboard ──
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ── Generate random int ──
export const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
