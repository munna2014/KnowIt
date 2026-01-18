import Navbar from "../Navbar";
import BlogSection from "../blog/BlogSection";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[-18%] h-[22rem] w-[40rem] rounded-full bg-blue-800/20 blur-[160px]" />
        <div className="absolute top-20 right-[-16%] h-[18rem] w-[34rem] rounded-full bg-blue-700/20 blur-[150px]" />
        <div className="absolute bottom-[-18%] left-[-5%] h-[20rem] w-[36rem] rounded-full bg-blue-900/25 blur-[170px]" />
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
