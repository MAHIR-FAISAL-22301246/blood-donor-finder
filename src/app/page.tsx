import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white p-8 text-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-extrabold text-red-600 mb-4">🩸 Blood Donor Finder</h1>
          <p className="text-xl text-gray-600 mb-10">
            Connecting patients in need with verified blood donors — fast, safe, and free.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/search"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full text-lg transition-all shadow-md"
            >
              Find a Donor
            </Link>
            <Link
              href="/requests"
              className="bg-white hover:bg-red-50 text-red-600 border-2 border-red-600 font-bold px-8 py-4 rounded-full text-lg transition-all shadow-md"
            >
              Request Blood
            </Link>
            <Link
              href="/requests/board"
              className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 font-bold px-8 py-4 rounded-full text-lg transition-all shadow-md"
            >
              View Request Board
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
