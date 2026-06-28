"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { portfolioProjects, portfolioCategories } from "../../lib/constants";
import CTA from "../../components/sections/CTA";

export default function PortfolioPageClient({ portfolio, settings }) {
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const projectsInView = useInView(projectsRef, { once: true, margin: "-50px" });
  const [activeFilter, setActiveFilter] = useState("All");

  const projectList = portfolio && portfolio.length > 0 ? portfolio.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    image: item.image,
    category: item.category || "Development",
    link: item.ctaLink || "#",
    challenges: "Accelerating visual loads and optimizing SEO.",
    solutions: "Next.js 15 Server-Side Rendering and caching.",
    results: "Lighthouse audit score improved to 99.",
    technologies: ["Next.js", "Prisma", "PostgreSQL", "Tailwind CSS"]
  })) : portfolioProjects;

  const categories = portfolio && portfolio.length > 0
    ? ["All", ...new Set(portfolio.map(p => p.category).filter(Boolean))]
    : portfolioCategories;

  const filteredProjects =
    activeFilter === "All"
      ? projectList
      : projectList.filter((p) => p.category === activeFilter);

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

        <div className="section-container relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-6 tracking-tight"
          >
            Showcasing Excellence
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            Explore a selection of projects that represent the very best of our work. Each project is a testament to AI innovation, engineering precision, and creative excellence.
          </motion.p>
        </div>
      </section>

      {/* Filter + Projects */}
      <section ref={projectsRef} className="section-spacing relative pt-8">
        <div className="section-container relative z-10">
          {/* Filter pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={projectsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`filter-pill ${
                  activeFilter === cat ? "active" : ""
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Projects list */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * i }}
                  className="glass-card overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-glow"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Project Image Area */}
                    <div className="lg:w-[50%] relative overflow-hidden bg-dark-200 min-h-[320px] lg:min-h-[420px] flex items-center justify-center">
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-[0.9] group-hover:saturate-100"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark-200 to-accent-blue/10 flex items-center justify-center">
                          <div className="grid grid-cols-3 gap-3 p-8 opacity-60 group-hover:opacity-80 transition-opacity duration-500">
                            {Array.from({ length: 6 }).map((_, idx) => (
                              <div
                                key={idx}
                                className="w-16 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-accent-blue/20 border border-glass-border"
                                style={{
                                  transform: `rotate(${(idx - 2) * 5}deg) translateY(${idx % 2 === 0 ? -5 : 5}px)`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-100/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-dark-100/90 pointer-events-none" />
                    </div>

                    {/* Project Content Area */}
                    <div className="lg:w-[50%] p-8 lg:p-12 flex flex-col justify-between z-10 bg-dark-100/50 lg:bg-transparent">
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <span className="text-xs font-medium text-primary uppercase tracking-widest block mb-2">
                              {project.category}
                            </span>
                            <h3 className="text-white text-2xl lg:text-3xl font-semibold font-body mb-3 group-hover:text-primary transition-colors duration-300">
                              {project.title}
                            </h3>
                            <p className="text-muted text-base leading-relaxed">
                              {project.description}
                            </p>
                          </div>
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 ml-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-glow"
                          >
                            <span>Open Demo</span> <ExternalLink size={14} />
                          </a>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-glass-border">
                          <div>
                            <h4 className="text-muted text-xs uppercase tracking-wider mb-2 font-medium">Challenges</h4>
                            <p className="text-white/80 text-sm leading-relaxed">{project.challenges}</p>
                          </div>
                          <div>
                            <h4 className="text-muted text-xs uppercase tracking-wider mb-2 font-medium">Solutions</h4>
                            <p className="text-white/80 text-sm leading-relaxed">{project.solutions}</p>
                          </div>
                          <div>
                            <h4 className="text-muted text-xs uppercase tracking-wider mb-2 font-medium">Results</h4>
                            <p className="text-white/80 text-sm leading-relaxed">{project.results}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-glass-border">
                        <h4 className="text-muted text-xs uppercase tracking-wider mb-3 font-medium">Technologies Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <span key={tech} className="tech-badge text-xs px-3 py-1.5 rounded-full bg-dark-200 border border-glass-border text-white/90">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <CTA settings={settings} />
    </>
  );
}
