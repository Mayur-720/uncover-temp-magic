
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { Eye, Users, Star, Trophy, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getRecognitions } from "@/lib/api";
import RecognitionModal from "@/components/recognition/RecognitionModal";
import { toast } from "@/hooks/use-toast";
import RecognitionStats from "@/components/recognition/RecognitionStats";

const RecognitionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: recognitionData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recognitions"],
    queryFn: () => getRecognitions(),
  });

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load recognition data",
    });
  }

  // Fallbacks for stats
  const stats = recognitionData?.stats || {};
  const totalRecognized = stats.totalRecognized ?? 0;
  const totalRecognizers = stats.totalRecognizers ?? 0;
  const recognitionRate = stats.recognitionRate ?? 0;
  const successfulRecognitions = stats.successfulRecognitions ?? 0;
  const recognitionAttempts = stats.recognitionAttempts ?? 0;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Recognition Center</h1>
        <p className="text-muted-foreground">
          Track your identity recognition achievements and see who's figured out who you are!
        </p>
      </div>

      <div className="grid gap-6">
        {/* Main Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                People I've Recognized
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalRecognized}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Identities successfully revealed
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                People Who Recognized Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalRecognizers}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Times my identity was revealed
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                Recognition Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{recognitionRate}%</div>
              <p className="text-sm text-muted-foreground mt-1">
                Success rate of your guesses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recognition Stats Component */}
        <RecognitionStats
          totalRecognized={totalRecognized}
          totalRecognizers={totalRecognizers}
          recognitionRate={recognitionRate}
          successfulRecognitions={successfulRecognitions}
          recognitionAttempts={recognitionAttempts}
        />

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-600" />
                Achievement Unlocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {totalRecognized >= 5 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    🕵️ Detective - Recognized 5+ people
                  </Badge>
                )}
                {totalRecognizers >= 5 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    🎭 Famous - Recognized by 5+ people
                  </Badge>
                )}
                {recognitionRate >= 80 && recognitionAttempts >= 5 && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    🎯 Sharpshooter - 80%+ accuracy
                  </Badge>
                )}
                {totalRecognized === 0 && totalRecognizers === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Start recognizing people to unlock achievements!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "View Detailed Summary"}
                </Button>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <RecognitionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default RecognitionsPage;
