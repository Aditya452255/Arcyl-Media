"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { heroStats } from "@/lib/constants";
import { containerVariants, wordVariants } from "@/lib/animations";

// Pre-computed deterministic star positions to avoid hydration mismatch
const starPositions = Array.from({ length: 40 }).map((_, i) => ({
  left: (i * 37 + 13) % 100,
  top: (i * 53 + 7) % 100,
  delay: (i * 0.1) % 5,
  duration: 3 + (i % 4),
}));

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const headlineWords = ["Design.", "Brand.", "Grow."];

  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden pt-28 pb-16 bg-dark">
      {/* Ambient Lighting & Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[5%] w-[500px] h-[500px] bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {starPositions.map((star, i) => (
          <div
            key={i}
            className="absolute w-[1.5px] h-[1.5px] bg-white/40 rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animation: `pulse-glow ${star.duration}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Main Hero Content */}
      <div className="section-container relative z-10 my-auto">
        <div className="flex flex-col items-center text-center pt-8 pb-12 max-w-4xl mx-auto">
          
          {/* Immersive 3D Logo Centerpiece with Atmospheric Depth */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.2, 0.65, 0.3, 1] }}
            className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] flex items-center justify-center my-6"
          >
            {/* Layered Lighting & Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-accent-violet/20 to-accent-blue/20 rounded-full blur-[80px] animate-pulse-glow pointer-events-none" />
            
            {/* Subtle Atmospheric Depth Effect */}
            <div className="absolute -inset-8 bg-dark/40 backdrop-blur-[12px] rounded-full border border-white/5 pointer-events-none shadow-[0_0_50px_rgba(124,92,252,0.15)] z-0" />

            {/* Floating Logo Asset */}
            <div className="relative w-full h-full animate-float flex items-center justify-center z-10">
              <Image
                src="/logo-hero.png"
                alt="Arcyl Media Premium A Logo"
                width={500}
                height={500}
                priority
                className="w-full h-full object-contain filter brightness-0 invert drop-shadow-[0_20px_50px_rgba(124,92,252,0.6)]"
              />
            </div>

            {/* Soft Floor Reflection / Shadow */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-primary/20 rounded-full blur-xl animate-pulse pointer-events-none" />
          </motion.div>

          {/* Cinematic Headline */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="font-heading text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.1] mb-6 tracking-tight mt-6"
          >
            {headlineWords.map((word, index) => (
              <motion.span
                key={index}
                variants={wordVariants}
                className={`inline-block mr-3 ${
                  word === "Grow." ? "text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-violet to-accent-blue font-bold filter drop-shadow-[0_0_15px_rgba(124,92,252,0.4)]" : ""
                }`}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.2, 0.65, 0.3, 1] }}
            className="text-muted text-lg sm:text-xl leading-relaxed max-w-2xl mb-10"
          >
            Unlock sustainable growth with more visibility, more customers, and more revenue.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.2, 0.65, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto"
          >
            <Link href="/contact" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-dark font-medium text-base shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <span>Start Your Project</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300 text-dark" />
              </motion.button>
            </Link>

            <Link href="/portfolio" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto flex items-center justify-center gap-4 text-white hover:text-primary transition-colors duration-300 group py-2"
              >
                <div className="w-12 h-12 rounded-full bg-dark-200 border border-glass-border flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-300 shadow-glow">
                  <Play size={16} className="text-white group-hover:text-primary fill-current transition-colors" />
                </div>
                <span className="text-base font-medium">Watch Showreel</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Brand Logos Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="py-12 border-t border-glass-border overflow-hidden"
        >
          <div className="flex items-center gap-16 animate-ticker whitespace-nowrap">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex items-center gap-16">
                {[
                  { name: "Google", font: "font-body text-xl tracking-tight font-semibold" },
                  { name: "Microsoft", font: "font-body text-xl tracking-tight font-semibold flex items-center gap-2", icon: true },
                  { name: "amazon", font: "font-body text-2xl tracking-tighter font-bold lowercase" },
                  { name: "Meta", font: "font-body text-xl tracking-tight font-bold flex items-center gap-2", metaIcon: true },
                  { name: "Notion", font: "font-heading text-2xl tracking-tight flex items-center gap-2", notionIcon: true },
                  { name: "OpenAI", font: "font-body text-xl tracking-tight font-bold flex items-center gap-2", openAiIcon: true },
                ].map((brand) => (
                  <div
                    key={`${setIndex}-${brand.name}`}
                    className="flex items-center gap-2 text-muted-dark opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-default"
                  >
                    {brand.icon && <div className="w-4 h-4 grid grid-cols-2 gap-0.5 bg-muted-dark"><div className="bg-dark"/><div className="bg-dark"/><div className="bg-dark"/><div className="bg-dark"/></div>}
                    {brand.metaIcon && <span className="text-2xl">∞</span>}
                    {brand.notionIcon && <div className="w-6 h-6 rounded border border-muted-dark flex items-center justify-center text-xs font-bold">N</div>}
                    {brand.openAiIcon && <span className="text-xl">✺</span>}
                    <span className={brand.font}>{brand.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-glass-border text-center"
        >
          {heroStats.map((stat, i) => (
            <div key={stat.label} className="flex flex-col gap-2 relative group">
              <h3 className="font-heading text-4xl sm:text-5xl text-white group-hover:text-primary transition-colors duration-300">
                {stat.number}
              </h3>
              <p className="text-xs sm:text-sm text-muted uppercase tracking-wider">
                {stat.label}
              </p>
              {i < heroStats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-glass-border" />
              )}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
