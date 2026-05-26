import React from 'react';
import { PageTransition } from '../components/ui/PageTransition';
import { TextReveal } from '../components/ui/TextReveal';
import { Clock, Map, Target, ShieldCheck } from 'lucide-react';

export function DFRPage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="hero-fullscreen bg-ink relative border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(129,140,248,0.15),transparent_60%)] z-0" />
        
        <div className="hero-fullscreen-content max-w-5xl px-6 w-full flex flex-col items-center">
          <div className="chip chip-indigo mb-6 opacity-0 translate-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Transforming 911 Response
          </div>
          
          <TextReveal 
            text="Drone as First Responder" 
            type="words" 
            className="text-[4rem] sm:text-[6rem] md:text-[8rem] font-black tracking-tighter text-primary leading-none mb-6 text-center"
            delay={0.3}
          />
          
          <TextReveal 
            text="Arrive on scene in seconds, not minutes. Provide command with real-time aerial intelligence before officers even step out of their vehicles."
            type="words"
            className="text-lg md:text-xl text-secondary max-w-2xl text-center leading-relaxed mb-10"
            delay={1.2}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-void relative">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 glass rounded-2xl border-indigo/20 cursor-interactive">
              <div className="text-indigo font-mono text-5xl md:text-7xl font-black mb-4">70<span className="text-3xl">%</span></div>
              <h4 className="text-lg font-bold mb-2">Faster Response</h4>
              <p className="text-sm text-secondary">Average reduction in time to get eyes on scene compared to traditional patrols.</p>
            </div>
            <div className="text-center p-8 glass rounded-2xl border-indigo/20 cursor-interactive">
              <div className="text-indigo font-mono text-5xl md:text-7xl font-black mb-4">25<span className="text-3xl">%</span></div>
              <h4 className="text-lg font-bold mb-2">Call Resolution</h4>
              <p className="text-sm text-secondary">Of 911 calls can be cleared by DFR without requiring an officer dispatch.</p>
            </div>
            <div className="text-center p-8 glass rounded-2xl border-indigo/20 cursor-interactive">
              <div className="text-indigo font-mono text-5xl md:text-7xl font-black mb-4">0</div>
              <h4 className="text-lg font-bold mb-2">Blind Spots</h4>
              <p className="text-sm text-secondary">Complete aerial overwatch providing absolute situational awareness.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Timeline */}
      <section className="py-32 bg-ink">
        <div className="section-container max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-black mb-16 text-center">How DFR Works</h2>
          
          <div className="space-y-12 relative">
            {/* Timeline line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo via-indigo/30 to-transparent md:left-1/2 md:-translate-x-1/2" />
            
            {/* Step 1 */}
            <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="absolute left-0 w-14 h-14 bg-ink border-2 border-indigo rounded-full flex items-center justify-center text-indigo font-bold z-10 md:left-1/2 md:-translate-x-1/2">
                1
              </div>
              <div className="pl-20 md:pl-0 md:w-1/2 md:pr-16 md:text-right cursor-interactive">
                <h3 className="text-2xl font-bold mb-3">911 Call Received</h3>
                <p className="text-secondary">Dispatch receives a priority call and instantly triggers the nearest DFR node via the LiveOps platform.</p>
              </div>
              <div className="hidden md:block w-1/2" />
            </div>
            
            {/* Step 2 */}
            <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="absolute left-0 w-14 h-14 bg-ink border-2 border-indigo/50 rounded-full flex items-center justify-center text-indigo z-10 md:left-1/2 md:-translate-x-1/2">
                2
              </div>
              <div className="hidden md:block w-1/2" />
              <div className="pl-20 md:pl-0 md:w-1/2 md:pl-16 cursor-interactive">
                <h3 className="text-2xl font-bold mb-3">Autonomous Launch</h3>
                <p className="text-secondary">Guardian Station opens automatically and the aircraft takes off, calculating the fastest route to the coordinate.</p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="absolute left-0 w-14 h-14 bg-ink border-2 border-indigo/30 rounded-full flex items-center justify-center text-indigo z-10 md:left-1/2 md:-translate-x-1/2">
                3
              </div>
              <div className="pl-20 md:pl-0 md:w-1/2 md:pr-16 md:text-right cursor-interactive">
                <h3 className="text-2xl font-bold mb-3">Eyes on Scene</h3>
                <p className="text-secondary">Arriving in &lt; 90 seconds, the drone begins streaming 4K and thermal video directly to command and responding units' MDTs.</p>
              </div>
              <div className="hidden md:block w-1/2" />
            </div>
          </div>
        </div>
      </section>
      
    </PageTransition>
  );
}
