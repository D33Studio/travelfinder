import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { parseSearchParams, serializeSearchParams } from "@/lib/search";

export const metadata: Metadata = { title: "Search stays — Journey" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseSearchParams(await searchParams);

  return (
    <>
      <Sidebar />
      <div className="main">
        {/* Keyed on the URL so the form re-initialises whenever the search changes. */}
        <SearchBar key={serializeSearchParams(params)} mode="compact" initial={params} />
        <SearchResults params={params} />
      </div>
    </>
  );
}
