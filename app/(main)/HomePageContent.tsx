"use client"

import { useState } from "react"
import ForYouFeed from "./ForYouFeed"
import FollowingFeed from "./FollowingFeed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SubjectFilter from "@/components/SubjectFilter"
import type { ACADEMIC_SUBJECTS } from "@/lib/types"

// Define the type locally to avoid potential import issues
type SubjectFilterType = (typeof ACADEMIC_SUBJECTS)[number]["id"]

export default function HomePageContent() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilterType>("all")

  return (
    <Tabs defaultValue="for-you" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="for-you" className="flex-1">
          Explore
        </TabsTrigger>
        <TabsTrigger value="following" className="flex-1">
          Following
        </TabsTrigger>
      </TabsList>

      <TabsContent value="for-you" className="space-y-0">
        <SubjectFilter selectedSubject={selectedSubject} onSubjectChange={setSelectedSubject} className="mb-5" />
        <ForYouFeed selectedSubject={selectedSubject} />
      </TabsContent>

      <TabsContent value="following">
        <FollowingFeed />
      </TabsContent>
    </Tabs>
  )
}
