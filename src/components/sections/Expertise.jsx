"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Cpu,
  TrendingUp,
  Palette,
  Code,
  Server,
  Zap,
  MessageCircle,
} from "lucide-react";
import { expertiseAreas } from "@/lib/constants";

const iconMap = {
  Cpu,
  TrendingUp,
  Palette,
  Code,
  Server,
  Zap,
  MessageCircle,
};

export default function Expertise({ data }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const areasList = data && data.length > 0 ? data.map(item => ({
    title: item.title,
    description: item.content,
    icon: item.image || "Cpu"
  })) : expertiseAreas;

  return (
    <section ref={ref} className="section-spacing relative" id="expertise">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-glass-border to-transparent" />

      <div className="section-container relative z-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Our Expertise
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-base leading-relaxed">
            Deep specialization across AI automation, performance growth, and full-spectrum digital product development.
          </p>
        </motion.div>

        {/* Expertise cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {areasList.map((area, i) => {
            const IconComponent = iconMap[area.icon] || Cpu;
            return (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.15 * i,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <div className="glass-card p-8 h-full group hover:border-primary/40 transition-all duration-300 flex gap-6">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-110 transition-all duration-300 shadow-glow">
                    {IconComponent && (
                      <IconComponent size={24} className="text-primary" />
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-white text-xl font-semibold mb-3 font-body group-hover:text-primary transition-colors duration-300">
                      {area.title}
                    </h3>
                    <p className="text-muted text-base leading-relaxed">
                      {area.description}
                    </p>
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
