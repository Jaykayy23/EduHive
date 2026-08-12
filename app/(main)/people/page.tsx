import PeopleDiscovery from "./PeopleDiscovery";

export const metadata = {
  title: "Discover people",
};

export default function PeoplePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold">Discover people</h1>
        <p className="text-muted-foreground mt-1">
          Find new learners and creators to follow.
        </p>
      </header>
      <PeopleDiscovery />
    </main>
  );
}
