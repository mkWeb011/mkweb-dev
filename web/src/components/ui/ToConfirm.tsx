/**
 * Visible marker for content that is not verified yet.
 * Policy of this site: never invent facts — show the gap instead.
 */
export function ToConfirm({ label = 'To be confirmed' }: { label?: string }) {
  return <span className="tbv">{label}</span>;
}
