import { Hash, UsersRound } from "lucide-react";
import { Suspense } from "react";

import TrendingTopics from "@/components/TrendingTopics";
import { BookLoader } from "@/components/ui/book-loader";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PeopleDiscovery from "./PeopleDiscovery";

export const metadata = {
  title: "Discover",
};

export default function PeoplePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            <h1>Discover</h1>
          </CardTitle>
          <CardDescription>
            Find people to follow and see what the community is discussing.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="people" className="gap-4">
        <TabsList
          aria-label="Discover people and topics"
          className="grid grid-cols-2"
        >
          <TabsTrigger value="people">
            <UsersRound aria-hidden="true" />
            People
          </TabsTrigger>
          <TabsTrigger value="topics">
            <Hash aria-hidden="true" />
            Topics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          <PeopleDiscovery />
        </TabsContent>
        <TabsContent value="topics">
          <Suspense
            fallback={<BookLoader className="mx-auto my-10" size="2.5rem" />}
          >
            <TrendingTopics />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
