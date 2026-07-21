// โครงโหลด (ใช้แทน spinner เพื่อให้รู้สึกเร็ว + คงเลย์เอาต์)
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

// การ์ดสินค้าตอนโหลด
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <Skeleton className="h-28 rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-4 w-20 mt-1" />
      </div>
    </div>
  );
}
