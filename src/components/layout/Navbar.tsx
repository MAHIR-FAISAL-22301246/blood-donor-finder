import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link href="/" className="text-xl font-bold tracking-tight">
        🩸 Blood Donor Finder
      </Link>
      <div className="flex gap-6 text-sm font-medium">
        <Link href="/donors" className="hover:text-red-200 transition-colors">Find Donors</Link>
        <Link href="/requests" className="hover:text-red-200 transition-colors">Requests</Link>
        <Link href="/admin" className="hover:text-red-200 transition-colors">Admin</Link>
        <Link href="/login" className="hover:text-red-200 transition-colors">Login</Link>
      </div>
    </nav>
  );
}
