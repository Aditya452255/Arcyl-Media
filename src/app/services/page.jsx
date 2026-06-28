"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Cpu,
  MessageCircle,
  FileText,
  Palette,
  Award,
  TrendingUp,
  Code,
  Zap,
  CheckCircle,
  ArrowRight,
  Shield,
} from "lucide-react";
import {
  serviceDetails,
  serviceProcessSteps,
  whyChooseUs,
} from "@/lib/constants";
import Testimonials from "@/components/sections/Testimonials";
import CTA from "@/components/sections/CTA";

const iconMap = {
  Cpu,
  MessageCircle,
  FileText,
  Palette,
  Award,
  TrendingUp,
  Code,
  Zap,
};

export default function ServicesPage() {
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const processRef = useRef(null);
  const whyRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const servicesInView = useInView(servicesRef, { once: true, margin: "-100px" });
  const processInView = useInView(processRef, { once: true, margin: "-100px" });
  const whyInView = useInView(whyRef, { once: true, margin: "-100px" });

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

        <div className="section-container relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-6 tracking-tight"
          >
            Discover Your Digital Solutions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            Comprehensive digital marketing, website design, and AI automation services designed to transform your online presence and drive measurable business results. We combine strategic innovation with elite technical execution.
          </motion.p>
        </div>
      </section>

      {/* Elevate Your Digital Presence - Service Details */}
      <section ref={servicesRef} className="section-spacing relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-glass-border to-transparent" />

        <div className="section-container relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <span className="tech-badge">
              <Zap size={14} className="text-primary" />
              Service Detail
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
              Elevate Your Digital Presence
            </h2>
            <p className="text-muted max-w-2xl mx-auto text-base leading-relaxed">
              From initial architecture to full-scale deployment, we offer a complete suite of advanced digital services to elevate your brand and accelerate growth.
            </p>
          </motion.div>

          {/* Service detail cards */}
          <div className="space-y-8">
            {serviceDetails.map((service, i) => {
              const IconComponent = iconMap[service.icon];
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * i }}
                  className="glass-card p-8 sm:p-10 group hover:border-primary/40 transition-all duration-300 shadow-glow"
                >
                  <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left: Icon + Title + Description */}
                    <div className="lg:w-[45%]">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-glow">
                          {IconComponent && (
                            <IconComponent
                              size={26}
                              className="text-primary"
                            />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white text-2xl font-semibold font-body group-hover:text-primary transition-colors duration-300">
                            {service.title}
                          </h3>
                          <p className="text-muted text-xs uppercase tracking-widest mt-1">
                            {service.subtitle}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted text-base leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Right: Features */}
                    <div className="lg:w-[55%] flex flex-col justify-center">
                      <h4 className="text-xs uppercase tracking-wider text-muted mb-4 font-semibold">Core Capabilities</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {service.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-3 text-base"
                          >
                            <CheckCircle
                              size={18}
                              className="text-primary flex-shrink-0"
                            />
                            <span className="text-white/90 font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section ref={processRef} className="section-spacing relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-glass-border to-transparent" />

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={processInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="tech-badge mb-4 inline-flex">
              <ArrowRight size={14} className="text-primary" />
              Our Process
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4 mt-4">
              How We Work
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceProcessSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={processInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 * i }}
                className="glass-card p-8 text-center group relative overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-glow"
              >
                {/* Step number */}
                <div className="absolute top-4 right-5 text-5xl font-heading text-primary/10 group-hover:text-primary/20 transition-colors duration-300">
                  {step.number}
                </div>

                <div className="relative z-10">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300 shadow-glow">
                    <span className="text-primary font-heading text-xl font-bold">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-white text-xl font-semibold mb-3 font-body group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section ref={whyRef} className="section-spacing relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-glass-border to-transparent" />

        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={whyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="tech-badge mb-4 inline-flex">
              <Shield size={14} className="text-primary" />
              Advantages
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4 mt-4">
              Why Choose Us?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, i) => {
              const IconComponent = iconMap[item.icon];
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={whyInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * i }}
                  className="glass-card p-8 text-center group hover:border-primary/40 transition-all duration-300 shadow-glow"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-glow">
                    {IconComponent && (
                      <IconComponent size={26} className="text-primary" />
                    )}
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-3 font-body group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Testimonials />
      <CTA />
    </>
  );
}
