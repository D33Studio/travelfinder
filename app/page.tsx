import Sidebar from "@/components/Sidebar";
import PropertyGrid from "@/components/PropertyGrid";

export default function Home() {
  return (
    <>
      <Sidebar />
      <div className="main">
        <PropertyGrid />
      </div>
    </>
  );
}
