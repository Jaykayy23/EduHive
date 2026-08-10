"use client";

import SubjectFilter from "@/components/SubjectFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ACADEMIC_SUBJECTS } from "@/lib/types";
import { useState } from "react";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";

type SubjectFilterType = (typeof ACADEMIC_SUBJECTS)[number]["id"];

export default function HomePageContent() {
  const [selectedSubject, setSelectedSubject] =
    useState<SubjectFilterType>("all");

  return (
    <Tabs defaultValue="for-you" className="flex w-full flex-col gap-4">
      <TabsList className="border-border/70 bg-card/90 w-full border p-1 shadow-xs sm:w-fit">
        <TabsTrigger value="for-you" className="flex-1 sm:flex-none">
          Explore
        </TabsTrigger>
        <TabsTrigger value="following" className="flex-1 sm:flex-none">
          Following
        </TabsTrigger>
      </TabsList>

      <TabsContent value="for-you" className="flex flex-col gap-4">
        <SubjectFilter
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
        />
        <ForYouFeed selectedSubject={selectedSubject} />
      </TabsContent>

      <TabsContent value="following">
        <FollowingFeed />
      </TabsContent>
    </Tabs>
  );
}
