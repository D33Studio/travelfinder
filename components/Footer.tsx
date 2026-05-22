export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✈️</span>
              <span className="text-white font-bold text-lg">TravelFinder</span>
            </div>
            <p className="text-sm leading-relaxed">
              Discover the world with our curated travel guides, destination insights, and best-price deals.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Destinations</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Flights</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Hotels</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Experiences</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Cookie Settings</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {new Date().getFullYear()} TravelFinder. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/" className="hover:text-white transition-colors">Twitter</a>
            <a href="/" className="hover:text-white transition-colors">Instagram</a>
            <a href="/" className="hover:text-white transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
