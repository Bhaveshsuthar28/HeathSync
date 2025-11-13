// src/components/DoctorCardSkeleton.jsx
import Skeleton from "./Loading.component.jsx";

export default function DoctorCardSkeleton() {
  return (
    <div className="w-64 min-w-[16rem] bg-white rounded-lg shadow-md p-4 flex flex-col gap-3">
      
      {/* Profile Row */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-14 h-14 rounded-md" />
        
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>

      <Skeleton className="w-full h-3" />
      <Skeleton className="w-3/4 h-3" />

      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="w-10 h-3" />
          <Skeleton className="w-14 h-4" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton className="w-10 h-3" />
          <Skeleton className="w-14 h-4" />
        </div>
      </div>

      <Skeleton className="w-full h-9 mt-2 rounded-md" />
    </div>
  );
}
