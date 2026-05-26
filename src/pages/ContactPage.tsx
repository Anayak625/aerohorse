import React from 'react';
import { PageTransition } from '../components/ui/PageTransition';
import { Send, MapPin, Mail, Phone } from 'lucide-react';

export function ContactPage() {
  return (
    <PageTransition>
      <section className="pt-32 pb-24 bg-void min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        <div className="section-container relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 animate-fade-up">
              <h1 className="text-4xl md:text-6xl font-black mb-6">Request a Demo</h1>
              <p className="text-secondary text-lg max-w-2xl mx-auto">Experience the future of public safety. See our systems in action and learn how AeroHorse can integrate with your agency's operations.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 glass p-8 md:p-12 rounded-2xl border-gold/20 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary">First Name *</label>
                      <input type="text" className="field" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary">Last Name *</label>
                      <input type="text" className="field" placeholder="Doe" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Work Email *</label>
                    <input type="email" className="field" placeholder="j.doe@agency.gov" required />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Agency / Organization *</label>
                    <input type="text" className="field" placeholder="Metropolitan Police Dept" required />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Products of Interest</label>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer hover:text-primary transition-colors">
                        <input type="checkbox" className="rounded border-border bg-transparent text-gold focus:ring-gold/20" />
                        Guardian / DFR
                      </label>
                      <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer hover:text-primary transition-colors">
                        <input type="checkbox" className="rounded border-border bg-transparent text-rose focus:ring-rose/20" />
                        Lemur 2
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Additional Information</label>
                    <textarea className="field min-h-[120px] resize-y" placeholder="Tell us about your current drone program or specific challenges..."></textarea>
                  </div>
                  
                  <button type="submit" className="btn-primary w-full justify-center mt-8 cursor-interactive" data-cursor="Submit">
                    Submit Request
                    <Send className="w-4 h-4 ml-2" />
                  </button>
                </form>
              </div>
              
              <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <div className="glass p-8 rounded-2xl border-border/50 cursor-interactive">
                  <MapPin className="w-6 h-6 text-gold mb-4" />
                  <h3 className="font-bold mb-2">Headquarters</h3>
                  <p className="text-sm text-secondary">123 Aviation Blvd.<br/>Seattle, WA 98108<br/>United States</p>
                </div>
                
                <div className="glass p-8 rounded-2xl border-border/50 cursor-interactive">
                  <Mail className="w-6 h-6 text-rose mb-4" />
                  <h3 className="font-bold mb-2">Email</h3>
                  <p className="text-sm text-secondary">sales@aerohorse.com<br/>support@aerohorse.com</p>
                </div>
                
                <div className="glass p-8 rounded-2xl border-border/50 cursor-interactive">
                  <Phone className="w-6 h-6 text-indigo mb-4" />
                  <h3 className="font-bold mb-2">Phone</h3>
                  <p className="text-sm text-secondary">+1 (800) 555-0199</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
