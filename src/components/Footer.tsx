export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto px-4 sm:px-6 py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-4 md:gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-stone-800">Aerohorse</span>
            </div>
            <p className="mt-4 max-w-sm text-stone-500 leading-relaxed">
              Last-mile delivery, reimagined. Drones, smart pods, and local riders—faster, cleaner, and built to scale.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-stone-800">Explore</h4>
            <ul className="mt-4 space-y-3">
              {['The journey', 'How it works', 'Technology', 'Pricing'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-stone-500 transition-colors hover:text-stone-900" data-cursor-hover>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-stone-800">Company</h4>
            <ul className="mt-4 space-y-3">
              {['About us', 'Careers', 'Blog', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-stone-500 transition-colors hover:text-stone-900" data-cursor-hover>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-10 sm:mt-12 md:mt-16 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-6 md:pt-8 md:flex-row text-center md:text-left">
          <p className="text-sm text-stone-400">© 2026 Aerohorse. All rights reserved.</p>
          <div className="flex gap-6">
            {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
              <a key={social} href="#" className="text-sm text-stone-500 transition-colors hover:text-stone-900" data-cursor-hover>
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
