export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-center py-6 mt-auto text-sm">
      <p>© {new Date().getFullYear()} Blood Donor Finder. All rights reserved.</p>
      <p className="mt-1">Built with ❤️ to save lives.</p>
    </footer>
  );
}
