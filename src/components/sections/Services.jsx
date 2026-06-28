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
} from "lucide-react";
import { services } from "@/lib/constants";

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

export default function Services({ data }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const serviceList = data && data.length > 0 ? data : services;

  return (
    <section ref={ref} className="section-spacing relative" id="services">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Elevate Your Digital Presence
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-base leading-relaxed">
            Comprehensive digital solutions designed to transform your online presence and deliver measurable results.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceList.map((service, i) => {
            const IconComponent = iconMap[service.icon] || Cpu;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.05 * i,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <div className="glass-card p-8 h-full group hover:border-primary/40 transition-all duration-300 hover:shadow-card-hover flex flex-col justify-between cursor-default">
                  <div>
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-110 transition-all duration-300 shadow-glow">
                      {IconComponent && <IconComponent size={24} className="text-primary" />}
                    </div>

                    {/* Content */}
                    <h3 className="text-white text-xl font-semibold mb-3 font-body group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-glass-border flex items-center justify-between text-xs font-medium text-muted group-hover:text-white transition-colors">
                    <span>Explore Solution</span>
                    <span className="text-primary group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
