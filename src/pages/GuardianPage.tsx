import React, { useRef, useEffect } from 'react';
import { PageTransition } from '../components/ui/PageTransition';
import { TextReveal } from '../components/ui/TextReveal';
import { HorizontalScroll } from '../components/ui/HorizontalScroll';
import { ArrowRight, Thermometer, Camera, Battery, Wind, Radar } from 'lucide-react';

export function GuardianPage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="hero-fullscreen bg-ink relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_50%)] z-0" />
        
        <div className="hero-fullscreen-content max-w-5xl px-6 w-full flex flex-col items-center">
          <div className="chip chip-gold mb-6 opacity-0 translate-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Next-Gen Drone as First Responder
          </div>
          
          <TextReveal 
            text="Guardian" 
            type="chars" 
            className="text-[5rem] sm:text-[8rem] md:text-[10rem] font-black tracking-tighter text-primary leading-none mb-6"
            delay={0.3}
          />
          
          <TextReveal 
            text="Unmatched imaging. The ability to fly farther, faster, and longer. Advanced autonomy. Meet Guardian, the next era of Drone as First Responder."
            type="words"
            className="text-lg md:text-xl text-secondary max-w-2xl text-center leading-relaxed mb-10"
            delay={1.2}
          />
          
          <div className="flex gap-4 opacity-0 translate-y-4 animate-fade-up" style={{ animationDelay: '2s' }}>
            <a href="#features" className="btn-primary cursor-interactive" data-cursor="Explore">
              Explore Guardian
            </a>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center opacity-0 animate-fade-up" style={{ animationDelay: '2.5s' }}>
          <div className="w-px h-16 bg-gradient-to-b from-gold/50 to-transparent mx-auto mb-3" />
          <span className="text-[10px] uppercase tracking-widest text-tertiary">Scroll to discover</span>
        </div>
      </section>

      {/* Horizontal Scroll Features */}
      <HorizontalScroll className="bg-void">
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
               <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
               <span className="relative z-10 text-gold/50 font-mono tracking-widest">CAMERA PAYLOAD VISUALIZATION</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Performance */}
        <div className="horizontal-scroll-panel px-6 md:px-20 bg-ink">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
            <div className="panel-anim order-2 lg:order-1 h-[500px] rounded-2xl glass border-indigo/20 flex items-center justify-center overflow-hidden relative cursor-interactive" data-cursor="Drag">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity hover:scale-105 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
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

      {/* Specs Section */}
      <section className="py-32 bg-ink border-t border-border/40 relative">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">Technical Specifications</h2>
              <p className="text-secondary">Everything you need to know about the Guardian.</p>
            </div>
            
            <div className="glass rounded-2xl p-8 cursor-interactive" data-cursor="Scroll">
              <h3 className="text-xl font-bold mb-6 text-gold">Aircraft</h3>
              <div className="spec-row">
                <span className="text-secondary">Weight (with battery)</span>
                <span className="text-primary font-mono text-right">3.2 kg</span>
              </div>
              <div className="spec-row">
                <span className="text-secondary">Dimensions (folded)</span>
                <span className="text-primary font-mono text-right">250 × 200 × 150 mm</span>
              </div>
              <div className="spec-row">
                <span className="text-secondary">Max Flight Time</span>
                <span className="text-primary font-mono text-right">45 mins</span>
              </div>
              <div className="spec-row">
                <span className="text-secondary">IP Rating</span>
                <span className="text-primary font-mono text-right">IP55</span>
              </div>
              
              <h3 className="text-xl font-bold mt-12 mb-6 text-rose">Camera Payload</h3>
              <div className="spec-row">
                <span className="text-secondary">Wide Camera</span>
                <span className="text-primary font-mono text-right">4K / 60fps, 1/2" CMOS</span>
              </div>
              <div className="spec-row">
                <span className="text-secondary">Tele Camera</span>
                <span className="text-primary font-mono text-right">640x Hybrid Zoom</span>
              </div>
              <div className="spec-row">
                <span className="text-secondary">Thermal Camera</span>
                <span className="text-primary font-mono text-right">640×512, 30fps</span>
              </div>
              <div className="spec-row">
                <span className="text-secondary">Spotlight</span>
                <span className="text-primary font-mono text-right">2400 Lumens</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-32 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gold/5" />
        <div className="text-center relative z-10 px-6">
          <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to deploy?</h2>
          <p className="text-secondary text-lg mb-10 max-w-xl mx-auto">Connect with our team to see Guardian in action and learn how it integrates with your agency.</p>
          <a href="/contact" className="btn-primary text-lg px-8 py-4 cursor-interactive" data-cursor="Contact">
            Request Demo
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </PageTransition>
  );
}
