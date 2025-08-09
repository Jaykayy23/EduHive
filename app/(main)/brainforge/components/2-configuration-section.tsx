// brainforge/components/2-configuration-section.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ConfigurationSectionProps {
  totalQuestions: number;
  setTotalQuestions: (value: number) => void;
  mcqPercentage: number;
  trueFalsePercentage: number;
  fillInPercentage: number;
  handlePercentageChange: (
    type: "mcq" | "trueFalse" | "fillIn",
    value: number,
  ) => void;
}

export function ConfigurationSection({
  totalQuestions,
  setTotalQuestions,
  mcqPercentage,
  trueFalsePercentage,
  fillInPercentage,
  handlePercentageChange,
}: ConfigurationSectionProps) {
  const totalPercentage =
    mcqPercentage + trueFalsePercentage + fillInPercentage;

  return (
    <Card className="rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Total Questions</Label>
          <div className="mt-2">
            <Slider
              value={[totalQuestions]}
              onValueChange={(value) => setTotalQuestions(value[0])}
              max={50}
              min={5}
              step={1}
              className="w-full"
            />
            <div className="text-muted-foreground mt-1 flex justify-between text-sm">
              <span>5</span>
              <span className="font-medium">{totalQuestions}</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-base font-medium">Question Distribution</Label>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm">Multiple Choice</span>
              <Badge className="bg-blue-100 text-blue-800">
                {mcqPercentage}%
              </Badge>
            </div>
            <Slider
              value={[mcqPercentage]}
              onValueChange={(v) => handlePercentageChange("mcq", v[0])}
              max={100}
              min={0}
              step={5}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm">True/False</span>
              <Badge className="bg-green-100 text-green-800">
                {trueFalsePercentage}%
              </Badge>
            </div>
            <Slider
              value={[trueFalsePercentage]}
              onValueChange={(v) => handlePercentageChange("trueFalse", v[0])}
              max={100}
              min={0}
              step={5}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm">Fill in the Blank</span>
              <Badge className="bg-purple-100 text-purple-800">
                {fillInPercentage}%
              </Badge>
            </div>
            <Slider
              value={[fillInPercentage]}
              onValueChange={(v) => handlePercentageChange("fillIn", v[0])}
              max={100}
              min={0}
              step={5}
            />
          </div>
          <div className="text-muted-foreground text-center text-xs">
            Total: {totalPercentage > 100 ? 100 : totalPercentage}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
