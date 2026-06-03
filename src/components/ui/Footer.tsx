import { Link } from 'react-router-dom';
import { Globe, GitFork, Link2 } from 'lucide-react';
import { contact } from '../../lib/site';
import { solutionNavLinks } from '../../data/solutionsContent';

const links = {
  Products: [
    { label: 'Guardian', to: '/guardian' },
    { label: 'Lemur 2', to: '/lemur' },
    { label: 'All Drones', to: '/drones' },
  ],
  Solutions: solutionNavLinks.map(({ label, href }) => ({ label, to: href })),
  Company: [
    { label: 'Solutions', to: '/solutions' },
    { label: 'Request a Demo', to: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-ink relative overflow-hidden">
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      <div className="px-4 md:px-8 lg:px-10 xl:px-12 2xl:px-16  py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
          {/* Brand col */}
          <div className="col-span-2 flex flex-col gap-5">
            <Link to="/" className="flex items-center w-fit group cursor-interactive">
              <img
                src="/light_logo.png"
                alt="AeroHorse"
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-secondary leading-relaxed max-w-[210px]">
              Technology in the service of life. Autonomous drones built for public safety.
            </p>
            <a href={`mailto:${contact.email}`} className="text-sm text-secondary hover:text-gold transition-colors w-fit cursor-interactive">
              {contact.email}
            </a>
            <div className="flex items-center gap-2.5">
              {[Globe, GitFork, Link2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg glass border border-border/50 flex items-center justify-center text-tertiary hover:text-gold hover:border-gold/25 transition-all duration-200 cursor-interactive"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat} className="flex flex-col gap-4">
              <h4 className="text-xs font-semibold text-tertiary uppercase tracking-widest">{cat}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-secondary hover:text-primary transition-colors duration-150 cursor-interactive">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mb-8" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-tertiary font-mono">
            © {new Date().getFullYear()} AeroHorse Inc. · NDAA Compliant · USA Made · All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Security'].map((l) => (
              <a key={l} href="#" className="text-xs text-tertiary hover:text-secondary transition-colors cursor-interactive">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
