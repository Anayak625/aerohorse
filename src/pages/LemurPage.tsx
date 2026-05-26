import React from 'react';
import { PageTransition } from '../components/ui/PageTransition';
import { TextReveal } from '../components/ui/TextReveal';
import { Shield, Radio, Volume2, Video } from 'lucide-react';

export function LemurPage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="hero-fullscreen bg-void relative border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(251,113,133,0.15),transparent_50%)] z-0" />
        
        <div className="hero-fullscreen-content max-w-5xl px-6 w-full flex flex-col items-center">
          <div className="chip chip-rose mb-6 opacity-0 translate-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Tactical Indoor Operations
          </div>
          
          <TextReveal 
            text="Lemur 2" 
            type="chars" 
            className="text-[5rem] sm:text-[8rem] md:text-[10rem] font-black tracking-tighter text-primary leading-none mb-6"
            delay={0.3}
          />
          
          <TextReveal 
            text="Gain Intel. Communicate. De-escalate. Purpose-built for SWAT and tactical teams to clear rooms and negotiate safely."
            type="words"
            className="text-lg md:text-xl text-secondary max-w-2xl text-center leading-relaxed mb-10"
            delay={1.2}
          />
        </div>
      </section>

      {/* Video Intro / Swiper Section Simulation */}
      <section className="py-32 bg-ink relative">
        <div className="section-container">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6">The ultimate tool designed for:</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
            {/* Left side - "Reel" of use cases */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
               <div className="glass p-6 rounded-2xl border-rose/30 cursor-interactive text-center">
                 <h3 className="text-xl font-bold text-rose">Barricades</h3>
               </div>
               <div className="glass p-6 rounded-2xl opacity-60 hover:opacity-100 transition-opacity cursor-interactive text-center">
                 <h3 className="text-xl font-bold">Hostage Rescue</h3>
               </div>
               <div className="glass p-6 rounded-2xl opacity-60 hover:opacity-100 transition-opacity cursor-interactive text-center">
                 <h3 className="text-xl font-bold">HazMat Response</h3>
               </div>
            </div>
            
            {/* Right side - Visual */}
            <div className="w-full md:w-2/3 h-[500px] rounded-2xl glass border-rose/20 relative overflow-hidden cursor-interactive" data-cursor="View">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2008&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
               <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-transparent" />
               <div className="absolute bottom-8 left-8">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="live-dot" />
                   <span className="text-xs font-mono text-sage tracking-widest uppercase">Live Feed</span>
                 </div>
                 <h3 className="text-2xl font-bold">Tactical Entry Simulation</h3>
               </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-24 bg-void">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-2xl border-border/50 hover:border-rose/30 transition-colors cursor-interactive">
              <Shield className="w-8 h-8 text-rose mb-6" />
              <h3 className="text-2xl font-bold mb-4">Glass Breaker</h3>
              <p className="text-secondary">Integrated tungsten carbide tip spins at 30,000 RPM to shatter tempered glass, creating safe entry points for teams.</p>
            </div>
            <div className="glass p-8 rounded-2xl border-border/50 hover:border-gold/30 transition-colors cursor-interactive">
              <Volume2 className="w-8 h-8 text-gold mb-6" />
              <h3 className="text-2xl font-bold mb-4">2-Way Audio</h3>
              <p className="text-secondary">Built-in speaker and microphone allow negotiators to communicate directly with suspects through the drone.</p>
            </div>
            <div className="glass p-8 rounded-2xl border-border/50 hover:border-indigo/30 transition-colors cursor-interactive">
              <Radio className="w-8 h-8 text-indigo mb-6" />
              <h3 className="text-2xl font-bold mb-4">Mesh Networking</h3>
              <p className="text-secondary">Deploy multiple Lemur nodes to extend signal through thick concrete walls and subterranean structures.</p>
            </div>
            <div className="glass p-8 rounded-2xl border-border/50 hover:border-sage/30 transition-colors cursor-interactive">
              <Video className="w-8 h-8 text-sage mb-6" />
              <h3 className="text-2xl font-bold mb-4">No-Light Vision</h3>
              <p className="text-secondary">IR illuminators and thermal imaging provide perfect visibility in zero-light environments.</p>
            </div>
          </div>
        </div>
      </section>
      
    </PageTransition>
  );
}
