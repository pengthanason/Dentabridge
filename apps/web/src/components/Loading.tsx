export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-mint-soft border-t-petrol animate-spin" />
        <p className="text-xs text-gray-400">กำลังโหลด...</p>
      </div>
    </div>
  );
}
