"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Cpu,
  MessageCircle,
  Palette,
  Code,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  heroStats,
  collaborativeExpertise,
  siteConfig,
} from "../../lib/constants";
import Testimonials from "../../components/sections/Testimonials";
import CTA from "../../components/sections/CTA";

const iconMap = {
  Cpu,
  MessageCircle,
  Palette,
  Code,
  TrendingUp,
  Zap,
};

export default function AboutPageClient({ about, tech, settings }) {
  const heroRef = useRef(null);
  const expertiseRef = useRef(null);
  const techRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const expertiseInView = useInView(expertiseRef, { once: true, margin: "-100px" });
  const techInView = useInView(techRef, { once: true, margin: "-100px" });

  // Map CMS data or fallback to defaults
  const aboutList = about && about.length > 0 ? about : collaborativeExpertise;
  const companyDesc = settings?.metaDescription || siteConfig.description;

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="glow-orb w-[500px] h-[500px] bg-primary/10 top-[10%] right-[-10%] blur-[120px] pointer-events-none" />

        <div className="section-container relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="tech-badge">
              <span className="text-base">👋</span>
              About {settings?.companyName || "Arcyl Media"}
            </span>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
            {/* Left: Content */}
            <div className="lg:w-[55%]">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-6 tracking-tight"
              >
                Hello <span className="inline-block animate-float">👋</span>, We&apos;re{" "}
                <span className="text-gradient font-bold">{settings?.companyName || "Arcyl Media"}</span>.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-muted text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
              >
                {companyDesc} We combine elite digital marketing and premium web engineering with advanced AI automation to deliver growth solutions that make a lasting impact.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6"
              >
                {heroStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    className="glass-card p-4 text-center hover:border-primary/40 transition-all duration-300 shadow-glow"
                  >
                    <div className="stat-number text-gradient font-bold text-3xl mb-1">
                      {stat.number}
                    </div>
                    <div className="stat-label text-xs uppercase tracking-wider text-muted">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: Profile visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:w-[45%]"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden glass-card shadow-glow">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark-200 to-accent-blue/10">
                  {/* Abstract team visual */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Main circle */}
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-accent-blue/20 border border-glass-border-light flex items-center justify-center shadow-glow">
                        <span className="font-heading text-4xl text-white font-bold tracking-wider">
                          {settings?.companyName ? settings.companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "AM"}
                        </span>
                      </div>
                      {/* Orbiting elements */}
                      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                        const rad = (angle * Math.PI) / 180;
                        const radius = 110;
                        return (
                          <div
                            key={i}
                            className="absolute w-8 h-8 rounded-xl bg-primary/20 border border-glass-border shadow-glow animate-pulse"
                            style={{
                              left: `${70 + radius * Math.cos(rad)}px`,
                              top: `${70 + radius * Math.sin(rad)}px`,
                              animationDelay: `${i * 0.5}s`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Collaborative Expertise */}
      <section ref={expertiseRef} className="section-spacing relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-glass-border to-transparent" />

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={expertiseInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
              Collaborative Expertise
            </h2>
            <p className="text-muted max-w-2xl mx-auto text-base leading-relaxed">
              Our multidisciplinary team brings together elite skills to deliver comprehensive AI and digital growth solutions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aboutList.map((item, i) => {
              const IconComponent = iconMap[item.image || item.icon] || Cpu;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={expertiseInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * i }}
                  className="glass-card p-8 group hover:border-primary/40 transition-all duration-300 flex gap-6"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-glow">
                    {IconComponent && (
                      <IconComponent size={24} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-semibold mb-3 font-body group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-muted text-base leading-relaxed">
                      {item.content || item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      {tech && tech.length > 0 && (
        <section ref={techRef} className="section-spacing relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-glass-border to-transparent" />

          <div className="section-container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={techInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
                Our Tech Stack and Expertise
              </h2>
              <p className="text-muted max-w-2xl mx-auto text-base leading-relaxed">
                Our tech stack includes the latest and most powerful tools to build scalable and performant AI and digital solutions.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {tech.slice(0, 12).map((techItem, i) => (
                <motion.div
                  key={techItem.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={techInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  className="glass-card p-6 text-center group hover:border-primary/30 transition-all duration-300 shadow-glow"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {techItem.logo || "🛠️"}
                  </div>
                  <p className="text-white text-sm font-medium">{techItem.name}</p>
                  <p className="text-muted text-xs mt-1">{techItem.category || "General"}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Testimonials />
      <CTA settings={settings} />
    </>
  );
}
