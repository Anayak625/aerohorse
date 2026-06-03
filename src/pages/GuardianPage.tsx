import { Link } from 'react-router-dom';
import { PageTransition } from '../components/ui/PageTransition';
import { TextReveal } from '../components/ui/TextReveal';
import { HorizontalScroll } from '../components/ui/HorizontalScroll';
import { TechnicalSpecsSection, guardianSpecs } from '../components/sections/TechnicalSpecsSection';
import { ArrowRight, Thermometer, Camera, Battery, Wind, Radar } from 'lucide-react';

export function GuardianPage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="hero-fullscreen bg-ink relative border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.08),transparent_50%)] z-0 pointer-events-none" />

        <div className="relative z-10 flex h-full w-full max-w-5xl mx-auto flex-col px-6 pb-8 pt-[6.5rem] md:pt-28">
          <div className="hero-fullscreen-content flex flex-1 flex-col items-center justify-center text-center">
            <div
              className="chip chip-gold mb-6 opacity-0 translate-y-4 animate-fade-up"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              Next-Gen Drone as First Responder
            </div>

            <TextReveal
              text="Guardian"
              type="chars"
              playOnMount
              className="block w-full text-[5rem] sm:text-[8rem] md:text-[10rem] font-black tracking-tighter text-primary leading-none mb-6"
              delay={0.3}
            />

            <TextReveal
              text="Unmatched imaging. The ability to fly farther, faster, and longer. Advanced autonomy. Meet Guardian, the next era of Drone as First Responder."
              type="words"
              playOnMount
              className="block w-full text-lg md:text-xl text-secondary max-w-2xl mx-auto text-center leading-relaxed mb-10"
              delay={0.9}
            />

            <div
              className="flex gap-4 opacity-0 translate-y-4 animate-fade-up"
              style={{ animationDelay: '1.6s', animationFillMode: 'forwards' }}
            >
              <a href="#features" className="btn-primary cursor-interactive" data-cursor="Explore">
                Explore Guardian
              </a>
            </div>
          </div>

          <div
            className="flex shrink-0 flex-col items-center gap-2 opacity-0 animate-fade-up pointer-events-none"
            style={{ animationDelay: '2s', animationFillMode: 'forwards' }}
          >
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-gold/35 to-gold/20" aria-hidden />
            <span className="text-[10px] uppercase tracking-[0.2em] text-tertiary">Scroll to discover</span>
          </div>
        </div>
      </section>

      {/* Horizontal Scroll Features */}
      <HorizontalScroll id="features" className="bg-void">
        {/* Panel 1: Camera */}
        <div className="horizontal-scroll-panel px-6 md:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
            <div className="panel-anim">
              <span className="text-gold font-mono text-sm tracking-widest mb-4 block">01 / IMAGING</span>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">See everything.<br/>Miss nothing.</h2>
              <p className="text-secondary text-lg mb-8 max-w-md">Dual HD thermal sensors, 640x optical zoom, and an integrated SkyBeam spotlight ensure complete situational awareness, day or night.</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="glass border border-gold/20 rounded-xl p-5 cursor-interactive" data-cursor="View Specs">
                  <Camera className="w-6 h-6 text-gold mb-3" />
                  <div className="metric text-3xl font-black text-primary mb-1">4K</div>
                  <div className="text-xs text-tertiary uppercase tracking-wider">Visual Resolution</div>
                </div>
                <div className="glass border border-rose/20 rounded-xl p-5 cursor-interactive" data-cursor="View Specs">
                  <Thermometer className="w-6 h-6 text-rose mb-3" />
                  <div className="metric text-3xl font-black text-primary mb-1">640p</div>
                  <div className="text-xs text-tertiary uppercase tracking-wider">Thermal IR</div>
                </div>
              </div>
            </div>
            <div className="panel-anim h-[500px] rounded-2xl glass-gold flex items-center justify-center overflow-hidden relative group cursor-interactive" data-cursor="Drag">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579820010410-c10411aaaa88?q=80&w=2097&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent" />
               <span className="relative z-10 text-gold/50 font-mono tracking-widest">CAMERA PAYLOAD VISUALIZATION</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Performance */}
        <div className="horizontal-scroll-panel px-6 md:px-20 bg-ink">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
            <div className="panel-anim order-2 lg:order-1 h-[500px] rounded-2xl glass border-indigo/20 flex items-center justify-center overflow-hidden relative cursor-interactive" data-cursor="Drag">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity hover:scale-105 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent" />
               <span className="relative z-10 text-indigo/50 font-mono tracking-widest">FLIGHT DYNAMICS</span>
            </div>
            <div className="panel-anim order-1 lg:order-2">
              <span className="text-indigo font-mono text-sm tracking-widest mb-4 block">02 / PERFORMANCE</span>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Built to brave<br/>the elements.</h2>
              <p className="text-secondary text-lg mb-8 max-w-md">IP55 weather resistance, 45-minute flight time, and a top speed of 55mph means Guardian gets on scene fast, no matter the conditions.</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="glass border border-indigo/20 rounded-xl p-5 cursor-interactive">
                  <Battery className="w-6 h-6 text-indigo mb-3" />
                  <div className="metric text-3xl font-black text-primary mb-1">45m</div>
                  <div className="text-xs text-tertiary uppercase tracking-wider">Flight Time</div>
                </div>
                <div className="glass border border-gold/20 rounded-xl p-5 cursor-interactive">
                  <Wind className="w-6 h-6 text-gold mb-3" />
                  <div className="metric text-3xl font-black text-primary mb-1">55mph</div>
                  <div className="text-xs text-tertiary uppercase tracking-wider">Top Speed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Autonomy */}
        <div className="horizontal-scroll-panel px-6 md:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
            <div className="panel-anim">
              <span className="text-sage font-mono text-sm tracking-widest mb-4 block">03 / AUTONOMY</span>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">It flies itself.<br/>Literally.</h2>
              <p className="text-secondary text-lg mb-8 max-w-md">360° obstacle avoidance, autonomous docking, and precision landing. Letting operators focus on the scene, not the sticks.</p>
              
              <div className="glass border border-sage/20 rounded-xl p-6 cursor-interactive">
                <div className="flex items-center gap-4 mb-4">
                  <Radar className="w-8 h-8 text-sage" />
                  <div>
                    <h4 className="text-lg font-bold">OAS Array</h4>
                    <p className="text-sm text-tertiary">Omnidirectional sensors</p>
                  </div>
                </div>
                <p className="text-sm text-secondary">Real-time 3D mapping prevents collisions in complex environments, ensuring safe automated routes.</p>
              </div>
            </div>
            <div className="panel-anim h-[500px] rounded-2xl glass border-sage/20 flex items-center justify-center relative overflow-hidden cursor-interactive">
               <div className="absolute inset-0 bg-grid opacity-50" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-sage/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-sage/50 rounded-full" />
               <span className="relative z-10 text-sage/70 font-mono tracking-widest">OAS VISUALIZATION</span>
            </div>
          </div>
        </div>
      </HorizontalScroll>

      <TechnicalSpecsSection
        productName="Guardian"
        description="Everything you need to know about Guardian — from airframe limits to payload capabilities."
        highlights={guardianSpecs.highlights}
        groups={guardianSpecs.groups}
      />
      
      {/* CTA */}
      <section className="py-32 relative overflow-hidden flex items-center justify-center">
        <div className="text-center relative z-10 px-6">
          <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to deploy?</h2>
          <p className="text-secondary text-lg mb-10 max-w-xl mx-auto">Connect with our team to see Guardian in action and learn how it integrates with your agency.</p>
          <Link to="/contact" className="btn-primary text-lg px-8 py-4 cursor-interactive" data-cursor="Contact">
            Request Demo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
