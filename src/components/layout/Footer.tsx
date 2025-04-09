export default function Footer() {
  return (
    <footer className="bg-white py-4 border-t mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Joatra. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  );
}
