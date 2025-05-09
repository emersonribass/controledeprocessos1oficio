
import { Card, CardContent } from "@/components/ui/card";

const ProcessDetailsSkeleton = () => {
  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    </div>
  );
};

export default ProcessDetailsSkeleton;
