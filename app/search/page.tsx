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
  const sp = await searchParams;
  const params = parseSearchParams(sp);
  /* A bare /search (sidebar "Explore", "Browse popular destinations") carries no
     search of its own; the client then reopens the traveller's remembered dates
     and party rather than treating the defaults as a new search. */
  const explicit = ["q", "from", "to", "adults", "children"].some((k) => sp[k] !== undefined);

  return (
    <>
      <Sidebar />
      <div className="main">
        {/* Keyed on the URL so the form re-initialises whenever the search changes. */}
        <SearchBar key={serializeSearchParams(params)} mode="compact" initial={params} />
        <SearchResults params={params} explicit={explicit} />
      </div>
    </>
  );
}
