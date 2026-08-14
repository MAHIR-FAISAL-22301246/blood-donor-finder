import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-oxblood text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link href="/" className="text-xl font-bold tracking-tight">
        🩸 Blood Donor Finder
      </Link>
      <div className="flex gap-6 text-sm font-medium">
        <Link href="/search" className="hover:text-red-200 transition-colors">Find Donors</Link>
        <Link href="/selected-donors" className="hover:text-red-200 transition-colors">Selected Donors</Link>
      </div>
    </nav>
  );
}
