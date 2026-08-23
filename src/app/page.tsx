import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <div className="bg-[#1e293b] text-white pb-24 pt-12 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <span className="text-red-400">🩸</span>
                Blood Donor Finder
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                Connecting patients in need with verified blood donors — fast, safe, and free.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link
            href="/search"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-sm"
          >
            Find a Donor
          </Link>
          <Link
            href="/requests"
            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-sm"
          >
            Request Blood
          </Link>
          <Link
            href="/requests/board"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-sm"
          >
            View Request Board
          </Link>
        </div>
      </main>
    </>
  );
}
