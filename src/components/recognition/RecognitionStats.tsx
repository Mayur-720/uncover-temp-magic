
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, BarChart3 } from "lucide-react";

interface RecognitionStatsProps {
  totalRecognized: number;
  totalRecognizers: number;
  recognitionRate: number;
  successfulRecognitions: number;
  recognitionAttempts: number;
}

const RecognitionStats = ({ 
  totalRecognized, 
  totalRecognizers, 
  recognitionRate, 
  successfulRecognitions, 
  recognitionAttempts 
}: RecognitionStatsProps) => {
  return (
    <div className="mt-4 space-y-4">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <BarChart3 size={16} className="text-muted-foreground" />
        Recognition Stats
      </h3>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 border border-undercover-purple/20 rounded-md bg-undercover-dark/10">
          <div className="flex justify-center mb-1">
            <Eye size={16} className="text-undercover-purple" />
          </div>
          <p className="font-bold">{totalRecognizers}</p>
          <p className="text-xs text-muted-foreground">Recognized you</p>
        </div>
        
        <div className="text-center p-2 border border-undercover-purple/20 rounded-md bg-undercover-dark/10">
          <div className="flex justify-center mb-1">
            <EyeOff size={16} className="text-undercover-purple" />
          </div>
          <p className="font-bold">{totalRecognized}</p>
          <p className="text-xs text-muted-foreground">You recognized</p>
        </div>
        
        <div className="text-center p-2 border border-undercover-purple/20 rounded-md bg-undercover-dark/10">
          <div className="flex justify-center mb-1">
            <BarChart3 size={16} className="text-undercover-purple" />
          </div>
          <p className="font-bold">{recognitionRate}%</p>
          <p className="text-xs text-muted-foreground">Recognition rate</p>
        </div>
      </div>
      
      <div className="text-center p-2 border border-undercover-purple/20 rounded-md bg-undercover-dark/10">
        <p className="text-sm text-muted-foreground">
          {successfulRecognitions}/{recognitionAttempts} successful recognitions
        </p>
      </div>
    </div>
  );
};

export default RecognitionStats;
