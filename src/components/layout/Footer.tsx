export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 text-center py-6 mt-auto text-sm border-t border-gray-200">
      <p>© {new Date().getFullYear()} Blood Donor Finder. All rights reserved.</p>
      <p className="mt-1">Built with ❤️ to save lives.</p>
    </footer>
  );
}
