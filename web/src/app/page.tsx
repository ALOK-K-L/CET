'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, 
  ArrowRight, 
  Activity, 
  Mic, 
  Droplet, 
  Check, 
  LayoutGrid, 
  FolderOpen, 
  Brain, 
  Folder,
  CheckCircle2,
  ArrowUp,
  FileText,
  Layers
} from 'lucide-react';
import ThreeJSTooth from '@/components/ThreeJSTooth';

export default function Home() {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll(".reveal-up, .reveal-fade").forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="selection:bg-brand-ice selection:text-brand-blue relative font-sans">
      
      {/* Dynamic Ambient Background */}
      <div className="ambient-bg"></div>

      {/* ========================================================================= */}
      {/* NAVBAR                                                                    */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tight text-brand-navy">LUMIERE</span>
            <span className="text-brand-muted/40 hidden sm:block">|</span>
            <span className="text-[13px] font-medium text-brand-muted hidden sm:block mt-0.5">Dental Intelligence</span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-brand-muted">
            <a href="#platform" className="hover:text-brand-navy transition-colors">Platform</a>
            <a href="#workflow" className="hover:text-brand-navy transition-colors">Workflow</a>
            <a href="#about" className="hover:text-brand-navy transition-colors">About</a>
          </nav>

          {/* Action CTAs (Interesting Button Layout) */}
          <div className="flex items-center gap-4">
            <Link href="/doctor" className="text-sm font-medium text-brand-muted hover:text-brand-navy transition-colors hidden sm:block">Clinician Portal</Link>
            <a href="#demo" className="group relative flex items-center gap-3 rounded-full bg-brand-navy pl-4 pr-1.5 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-deep hover:shadow-lg hover:-translate-y-0.5">
              <span>View Demo</span>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Play className="w-3.5 h-3.5 fill-white" />
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION                                                              */}
      {/* ========================================================================= */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left: Copy and CTAs */}
            <div className="space-y-8 text-left reveal-up">
              <div className="inline-flex items-center px-4 py-2 rounded-full glass-panel shadow-sm border border-white/80">
                <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse mr-2.5"></div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-brand-navy uppercase">Dental intelligence platform</span>
              </div>

              <div className="space-y-5">
                <h1 className="text-5xl lg:text-6xl font-extrabold text-brand-deep tracking-tight leading-[1.05]">
                  Dental intelligence, built around your workflow.
                </h1>
                <p className="text-[16px] text-brand-muted max-w-lg font-medium leading-relaxed">
                  Capture clinical findings, organize patient information, and support better decisions through one connected workspace.
                </p>
              </div>

              {/* Eye-defining buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#platform" className="group flex items-center gap-4 rounded-full bg-brand-blue pl-6 pr-2 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 transition-all hover:bg-blue-600 hover:-translate-y-0.5">
                  <span>Explore Platform</span>
                  <div className="w-8 h-8 rounded-full bg-white text-brand-blue flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </a>
                <a href="#workflow" className="group flex items-center gap-3 rounded-full glass-panel pl-6 pr-4 py-3 text-sm font-semibold text-brand-navy shadow-sm transition-all hover:bg-white border border-white/80 hover:-translate-y-0.5">
                  <Activity className="w-4 h-4 text-brand-muted group-hover:text-brand-blue transition-colors" />
                  <span>View clinical workflow</span>
                </a>
              </div>

              <div className="pt-6 border-t border-brand-navy/5">
                <p className="text-[13px] font-medium text-brand-muted">
                  Built for clearer documentation, calmer workflows and better clinical visibility.
                </p>
              </div>
            </div>

            {/* Right: 3D WebGL Tooth Visual Container */}
            <div className="relative flex items-center justify-center min-h-[500px] reveal-up delay-200">
              
              {/* Interactive Three.js Canvas Container */}
              <div className="relative w-full aspect-square max-w-[500px] cursor-grab active:cursor-grabbing flex items-center justify-center z-10">
                
                <ThreeJSTooth />

                {/* Premium Floating Cards (Interesting asymmetric layout) */}
                <div className="absolute top-10 -left-4 z-20 glass-panel px-4 py-3 rounded-2xl shadow-glass border border-white/80 flex items-center gap-3 transform hover:scale-105 transition-transform cursor-default">
                  <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-semibold text-brand-muted uppercase tracking-wider">Status</p>
                    <p className="text-xs font-bold text-brand-navy">Voice charting active</p>
                  </div>
                </div>

                <div className="absolute top-32 -right-8 z-20 glass-panel px-5 py-3.5 rounded-2xl shadow-glass border border-white/80 text-left transform hover:scale-105 transition-transform cursor-default">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-amberText"></span>
                    <span className="text-[11px] font-mono font-semibold text-brand-muted uppercase tracking-wider">Tooth 36</span>
                  </div>
                  <span className="text-sm font-bold text-brand-navy">Pocket depth 4 mm</span>
                </div>

                <div className="absolute bottom-32 -left-8 z-20 glass-panel px-4 py-3 rounded-2xl shadow-glass border border-white/80 flex items-center gap-3 transform hover:scale-105 transition-transform cursor-default">
                  <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-brand-redText fill-brand-redText" />
                  </div>
                  <span className="text-xs font-bold text-brand-navy">Bleeding detected</span>
                </div>

                <div className="absolute bottom-10 right-0 z-20 bg-brand-navy px-4 py-3 rounded-2xl shadow-glass border border-brand-navy flex items-center gap-3 transform hover:scale-105 transition-transform cursor-default">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-white">Record updated</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PLATFORM OVERVIEW (BENTO BOX LAYOUT)                                      */}
      {/* ========================================================================= */}
      <section id="platform" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="mb-14 reveal-up">
            <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">
              Everything your clinical workflow needs.
            </h2>
          </div>

          {/* Interesting Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            
            {/* Feature 1 (Wide) */}
            <div className="md:col-span-2 glass-panel rounded-[32px] p-8 md:p-10 shadow-card border border-white/80 flex flex-col justify-between reveal-up group hover:shadow-floating transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border text-brand-blue flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-navy mb-2">Voice Periodontal Charting</h3>
                <p className="text-[15px] text-brand-muted leading-relaxed font-medium max-w-md">
                  Capture pocket depth, bleeding, recession and other measurements naturally through speech, instantly structuring your data.
                </p>
              </div>
            </div>

            {/* Feature 2 (Square) */}
            <div className="md:col-span-1 glass-panel rounded-[32px] p-8 md:p-10 shadow-card border border-white/80 flex flex-col justify-between reveal-up delay-100 group hover:shadow-floating transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border text-brand-blue flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">Smart Dental Chart</h3>
                <p className="text-sm text-brand-muted leading-relaxed font-medium">
                  Visualize tooth conditions, measurements, and clinical notes in one glance.
                </p>
              </div>
            </div>

            {/* Feature 3 (Square) */}
            <div className="md:col-span-1 glass-panel rounded-[32px] p-8 md:p-10 shadow-card border border-white/80 flex flex-col justify-between reveal-up group hover:shadow-floating transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border text-brand-blue flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">Patient Records</h3>
                <p className="text-sm text-brand-muted leading-relaxed font-medium">
                  Keep history, allergies, medications, imaging, and notes linked together.
                </p>
              </div>
            </div>

            {/* Feature 4 (Wide) */}
            <div className="md:col-span-2 glass-panel rounded-[32px] p-8 md:p-10 shadow-card border border-white/80 flex flex-col justify-between reveal-up delay-100 group hover:shadow-floating transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border text-brand-blue flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-navy mb-2">Clinical Assistant</h3>
                <p className="text-[15px] text-brand-muted leading-relaxed font-medium max-w-md">
                  Support clinicians with organized information and review-ready insights directly within the patient context.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CLINICAL WORKFLOW (MEGA DASHBOARD)                                        */}
      {/* ========================================================================= */}
      <section id="workflow" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="mb-14 reveal-up">
            <h2 className="text-4xl font-bold text-brand-navy tracking-tight leading-tight">
              From spoken findings<br/>to structured records.
            </h2>
            <p className="text-[16px] text-brand-muted max-w-xl mt-4 font-medium leading-relaxed">
              Lumiere helps clinicians capture information naturally and review it in one highly organized, calming workspace.
            </p>
          </div>

          {/* Eye-defining Premium Application Mockup */}
          <div className="glass-panel rounded-[32px] border border-white/80 shadow-glass overflow-hidden flex flex-col md:flex-row min-h-[700px] reveal-up delay-100">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 bg-white/40 border-r border-white/50 p-6 flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center text-white">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-bold text-brand-navy">Lumiere OS</span>
              </div>
              
              <span className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider mb-2 px-2">Workspace</span>
              <a href="#" className="px-4 py-2.5 rounded-xl bg-white border border-white/80 text-brand-navy text-[13px] font-bold flex items-center gap-3 shadow-sm">
                <Mic className="w-4 h-4 text-brand-blue" /> Voice Charting
              </a>
              <a href="#" className="px-4 py-2.5 rounded-xl text-brand-muted hover:text-brand-navy hover:bg-white/60 text-[13px] font-semibold flex items-center gap-3 transition-colors">
                <LayoutGrid className="w-4 h-4" /> Odontogram
              </a>
              <a href="#" className="px-4 py-2.5 rounded-xl text-brand-muted hover:text-brand-navy hover:bg-white/60 text-[13px] font-semibold flex items-center gap-3 transition-colors">
                <Folder className="w-4 h-4" /> Patient Records
              </a>
              <a href="#" className="px-4 py-2.5 rounded-xl text-brand-muted hover:text-brand-navy hover:bg-white/60 text-[13px] font-semibold flex items-center gap-3 transition-colors">
                <Brain className="w-4 h-4" /> Clinical Assistant
              </a>
            </div>

            {/* Main Dashboard Area */}
            <div className="flex-1 flex flex-col bg-white/60">
              
              {/* Patient Context Header */}
              <div className="px-8 py-6 border-b border-white/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-lavender text-brand-blue flex items-center justify-center text-sm font-bold shadow-inner">
                    JH
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-navy leading-tight mb-0.5">Julian Hayes</h3>
                    <p className="text-[11px] font-mono text-brand-muted font-medium">Male, 42y · ID: #PT-8832</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-brand-red text-brand-redText text-[11px] font-mono font-bold border border-brand-red">Allergy: Latex</span>
                  <span className="px-3 py-1.5 rounded-lg bg-white text-brand-navy text-[11px] font-mono font-bold border border-brand-border">Hypertension</span>
                </div>
              </div>

              {/* Interactive Content Grid */}
              <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto">
                
                {/* Voice Capture & Parsed Data (Left) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Clean Voice Panel */}
                  <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                          <Mic className="w-4 h-4 text-brand-blue" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-brand-navy uppercase tracking-wider">Voice Capture</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
                        <span className="text-[10px] font-mono text-brand-blue font-bold">Recording</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1.5 h-8 mb-6">
                      <div className="w-1 bg-brand-muted/40 rounded-full wave-bar"></div>
                      <div className="w-1 bg-brand-blue rounded-full wave-bar"></div>
                      <div className="w-1 bg-brand-navy rounded-full wave-bar"></div>
                      <div className="w-1 bg-brand-blue rounded-full wave-bar"></div>
                      <div className="w-1 bg-brand-muted/40 rounded-full wave-bar"></div>
                    </div>
                    
                    <p className="text-[14px] font-medium text-brand-navy italic text-center">
                      "Tooth 36, pocket depth 4 millimeters, bleeding present, recession 1 millimeter."
                    </p>
                  </div>

                  {/* Extracted Findings */}
                  <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-mono font-bold text-brand-muted uppercase tracking-wider">Extracted Findings</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-brand-bg">
                        <span className="text-[13px] text-brand-muted font-medium">Tooth</span>
                        <span className="text-[13px] font-bold text-brand-navy">36</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-brand-bg">
                        <span className="text-[13px] text-brand-muted font-medium">Pocket depth</span>
                        <span className="text-[13px] font-bold text-brand-navy">4 mm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-brand-red/50">
                        <span className="text-[13px] text-brand-redText font-medium">Bleeding (BOP)</span>
                        <span className="text-[11px] font-bold text-brand-redText bg-brand-red px-2 py-0.5 rounded-full border border-red-200">Present</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-brand-bg">
                        <span className="text-[13px] text-brand-muted font-medium">Recession</span>
                        <span className="text-[13px] font-bold text-brand-navy">1 mm</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <button className="flex-1 py-2.5 bg-brand-navy text-white text-[13px] font-semibold rounded-xl hover:bg-brand-deep transition-colors shadow-sm">Confirm entry</button>
                      <button className="px-4 py-2.5 border border-brand-border text-brand-navy text-[13px] font-semibold rounded-xl hover:bg-brand-bg transition-colors">Edit</button>
                    </div>
                  </div>
                </div>

                {/* Dental Chart & Clinical Notes (Right) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  
                  {/* Clean Odontogram */}
                  <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-brand-border pb-4">
                      <h3 className="text-[14px] font-bold text-brand-navy">Periodontal Chart</h3>
                      <div className="flex gap-4 text-[11px] font-mono text-brand-muted font-medium">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-mint"></span> Normal</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-amber"></span> Review</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-redText"></span> Attention</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Upper Arch */}
                      <div>
                        <div className="text-[10px] font-mono text-brand-muted mb-2 uppercase tracking-wider text-center font-bold">Upper Arch</div>
                        <div className="grid grid-cols-8 gap-2 text-center">
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">18<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">2 2 3</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">17<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">3 2 3</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">16<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">2 1 2</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">15<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">2 2 2</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">14<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">1 2 2</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">13<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">2 1 2</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">12<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">2 2 2</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">11<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">2 1 2</div></div>
                        </div>
                      </div>

                      {/* Lower Arch */}
                      <div>
                        <div className="text-[10px] font-mono text-brand-muted mb-2 uppercase tracking-wider text-center font-bold">Lower Arch</div>
                        <div className="grid grid-cols-8 gap-2 text-center">
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">48<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">3 2 3</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">47<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">2 2 2</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">46<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">3 2 3</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">45<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">2 1 2</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">44<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">2 2 2</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">43<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">1 2 1</div></div>
                          <div className="p-2 border border-brand-border rounded-xl bg-brand-mint/50 text-[13px] font-bold text-brand-navy">42<div className="text-[10px] mt-1 text-brand-muted font-mono font-medium">2 2 2</div></div>
                          
                          {/* Active/Selected Tooth */}
                          <div className="p-2 border border-brand-blue rounded-xl bg-brand-blue/5 text-[13px] font-bold text-brand-navy relative shadow-sm ring-2 ring-brand-blue/20">
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-redText border-2 border-white"></span>
                            36<div className="text-[10px] mt-1 text-brand-blue font-mono font-bold">4 3 2</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Notes & AI Triage */}
                  <div className="bg-white rounded-2xl border border-brand-border p-6 flex-1 flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-brand-border pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-brand-blue" />
                        <span className="text-[13px] font-bold text-brand-navy">Clinical Assistant Insights</span>
                      </div>
                      <span className="text-[10px] font-mono font-medium text-brand-muted bg-brand-bg px-2 py-1 rounded">Professional review required</span>
                    </div>
                    
                    <div className="flex-1 text-[13px] text-brand-navy space-y-3">
                      <div className="bg-brand-bg p-4 rounded-xl border border-brand-border w-fit max-w-[95%]">
                        <p className="font-bold text-brand-navy text-[11px] mb-1.5 uppercase tracking-wide">Observation Logged</p>
                        <p className="leading-relaxed">Pocket depth on tooth 36 increased from 2mm (last visit) to 4mm. Bleeding on probing is now present.</p>
                      </div>
                      <div className="bg-brand-ice/50 p-4 rounded-xl border border-brand-blue/20 w-fit max-w-[95%] ml-auto">
                        <p className="leading-relaxed text-brand-blue">Drafting follow-up note for review. Would you like to append hygiene instructions?</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 relative">
                      <input type="text" placeholder="Type instructions..." className="w-full text-[13px] font-medium px-4 py-3 rounded-xl border border-brand-border bg-white outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all shadow-sm" />
                      <button className="absolute right-2 top-2 bottom-2 w-8 bg-brand-navy text-white rounded-lg flex items-center justify-center hover:bg-brand-deep transition-colors">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* PRODUCT BENEFITS (COMPACT)                                                */}
      {/* ========================================================================= */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left reveal-up">
            
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border flex items-center justify-center text-brand-navy mx-auto md:mx-0 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-bold text-brand-navy">Less manual documentation</h3>
              <p className="text-[14px] text-brand-muted leading-relaxed font-medium">
                Real-time voice capture transforms spoken findings directly into structured clinical data, keeping hands free and focus on the patient.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border flex items-center justify-center text-brand-navy mx-auto md:mx-0 shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-bold text-brand-navy">More organized information</h3>
              <p className="text-[14px] text-brand-muted leading-relaxed font-medium">
                Designed for secure workflows. All charting, imaging, medical history, and notes live in one clean, unified workspace.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-brand-border flex items-center justify-center text-brand-navy mx-auto md:mx-0 shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-bold text-brand-navy">Better continuity</h3>
              <p className="text-[14px] text-brand-muted leading-relaxed font-medium">
                Supports clinical decision-making by tracking historical changes across visits and organizing relevant context for easy review.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CTA                                                                 */}
      {/* ========================================================================= */}
      <section className="py-32 relative text-center border-t border-white">
        <div className="max-w-3xl mx-auto px-6 space-y-8 reveal-up">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-brand-deep tracking-tight">
            Bring clarity to every clinical workflow.
          </h2>
          <p className="text-[16px] text-brand-muted font-medium max-w-xl mx-auto">
            Explore a more organized way to capture and review dental information.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="#demo" className="px-8 py-3.5 rounded-full bg-brand-navy text-white text-[14px] font-semibold hover:bg-brand-deep transition-all shadow-lg hover:-translate-y-0.5">
              View Demo
            </a>
            <a href="#platform" className="px-8 py-3.5 rounded-full glass-panel text-brand-navy border border-white text-[14px] font-semibold hover:bg-white transition-all shadow-sm hover:-translate-y-0.5">
              Explore Platform
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER                                                                    */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-brand-border py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-brand-navy tracking-tight">LUMIERE</span>
            <span className="text-brand-border">|</span>
            <span className="text-[12px] font-medium text-brand-muted mt-0.5">Dental Intelligence</span>
          </div>

          <div className="flex gap-8 text-[13px] font-semibold text-brand-muted">
            <a href="#platform" className="hover:text-brand-navy transition-colors">Platform</a>
            <a href="#about" className="hover:text-brand-navy transition-colors">About</a>
            <a href="#contact" className="hover:text-brand-navy transition-colors">Contact</a>
          </div>

          <p className="text-[11px] font-mono text-brand-muted/70 font-medium">
            &copy; 2026 Lumiere. All rights reserved.
          </p>
          
        </div>
      </footer>
    </div>
  );
}
