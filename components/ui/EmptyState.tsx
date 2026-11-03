// <EmptyState message /> — (docs/CONTRACT.md section 4). Every page uses this
// instead of crashing on missing data (CLAUDE.md work rules).
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-gray-100/70 px-6 py-12 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

export default EmptyState;
