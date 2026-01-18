import Navbar from "../Navbar";
import BlogSection from "./BlogSection";

export default function BlogPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[-10%] h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative w-full pb-10 sm:pb-14">
        <Navbar />

        <div className="mx-auto mt-24 w-full max-w-6xl px-6">
          <BlogSection />
        </div>
      </div>
    </div>
  );
}
