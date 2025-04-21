
import { Skeleton } from "@/components/ui/skeleton";

const ProcessListSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-28" />
      </div>
      
      <Skeleton className="h-[120px] w-full mb-6" />
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-full" />
        </div>
        
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-2">
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessListSkeleton;
