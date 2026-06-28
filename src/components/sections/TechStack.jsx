"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { techStack } from "@/lib/constants";

export default function TechStack({ data }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  let groupedTech = [];
  if (data && data.length > 0) {
    const categoriesSet = new Set(data.map((t) => t.category || "General").filter(Boolean));
    groupedTech = Array.from(categoriesSet).map((catName) => ({
      category: catName,
      techs: data
        .filter((t) => (t.category || "General") === catName)
        .map((t) => ({
          name: t.name,
          icon: t.logo || "🛠️",
        })),
    }));
  }

  const stack = groupedTech.length > 0 ? groupedTech : techStack;

  const [activeCategory, setActiveCategory] = useState(null);
  const currentCategory = activeCategory || stack[0]?.category || "";

  const activeTechs =
    stack.find((c) => c.category === currentCategory)?.techs || [];

  return (
    <section ref={ref} className="section-spacing relative" id="tech">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-glass-border to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-section-gradient pointer-events-none" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Tools & Technologies We Use
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-base leading-relaxed">
            Our tech stack includes the latest and most powerful tools to build scalable, performant AI and digital growth solutions.
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-3 mb-12 flex-wrap"
        >
          {stack.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`filter-pill ${
                currentCategory === cat.category ? "active" : ""
              }`}
            >
              {cat.category}
            </button>
          ))}
        </motion.div>

        {/* Tech grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {activeTechs.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="glass-card p-6 text-center group hover:border-primary/30 transition-all duration-300 cursor-default shadow-glow"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {tech.icon}
              </div>
              <p className="text-white text-sm font-medium">{tech.name}</p>
              <p className="text-muted text-xs mt-1">
                Expert Level
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
