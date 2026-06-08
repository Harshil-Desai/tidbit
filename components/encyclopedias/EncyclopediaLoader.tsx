export default function EncyclopediaLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-700" />
      <p className="text-sm text-gray-400">Loading encyclopedia…</p>
    </div>
  );
}
