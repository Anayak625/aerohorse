import { PageTransition } from '../components/ui/PageTransition';
import { TextReveal } from '../components/ui/TextReveal';
import { Flame, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SolutionsPage() {
  return (
    <PageTransition>
      <section className="pt-32 pb-24 bg-void border-b border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_70%)] z-0" />
        
        <div className="section-container relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <TextReveal 
              text="Solutions" 
              type="chars" 
              className="text-[4rem] md:text-[6rem] font-black tracking-tighter text-primary mb-6"
            />
            <TextReveal 
              text="Purpose-built drone ecosystems for public safety agencies. We provide the hardware and software to fundamentally change how you respond to emergencies."
              type="words"
              className="text-lg md:text-xl text-secondary leading-relaxed"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-ink">
        <div className="section-container">
          <div className="space-y-16">
            
            {/* Law Enforcement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="h-[400px] rounded-2xl overflow-hidden relative cursor-interactive" data-cursor="View">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588656606086-fb15bb03d980?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-luminosity hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                <Shield className="absolute bottom-6 left-6 w-10 h-10 text-gold" />
              </div>
              <div className="animate-fade-up">
                <h2 className="text-3xl md:text-4xl font-black mb-4">Law Enforcement</h2>
                <p className="text-secondary text-lg mb-8">From active shooter situations to barricaded suspects and warrant executions, AeroHorse drones provide crucial intelligence that saves lives and de-escalates dangerous situations.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 border-l-2 border-gold/50 pl-4 py-1">
                    <span className="font-bold">Recommended:</span>
                    <Link to="/lemur" className="text-gold hover:underline">Lemur 2 for indoor clearance</Link>
                  </div>
                  <div className="flex items-center gap-3 border-l-2 border-indigo/50 pl-4 py-1">
                    <span className="font-bold">Recommended:</span>
                    <Link to="/dfr" className="text-indigo hover:underline">DFR for patrol support</Link>
                  </div>
                </div>
                <Link to="/contact" className="btn-outline">Discuss your agency's needs</Link>
              </div>
            </div>

            {/* Firefighting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 animate-fade-up">
                <h2 className="text-3xl md:text-4xl font-black mb-4">Fire & Rescue</h2>
                <p className="text-secondary text-lg mb-8">Identify hotspots through thick smoke with thermal imaging, assess structural integrity before sending crews in, and locate victims faster during critical moments.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 border-l-2 border-gold/50 pl-4 py-1">
                    <span className="font-bold">Recommended:</span>
                    <Link to="/guardian" className="text-gold hover:underline">Guardian for overwatch</Link>
                  </div>
                </div>
                <Link to="/contact" className="btn-outline">Discuss your agency's needs</Link>
              </div>
              <div className="order-1 md:order-2 h-[400px] rounded-2xl overflow-hidden relative cursor-interactive" data-cursor="View">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1484837562475-40b904e5d4cb?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-luminosity hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                <Flame className="absolute bottom-6 left-6 w-10 h-10 text-rose" />
              </div>
            </div>

          </div>
        </div>
      </section>
    </PageTransition>
  );
}
