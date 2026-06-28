"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { testimonials } from "@/lib/constants";

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-spacing relative">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-glass-border to-transparent" />

      <div className="section-container relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <span className="tech-badge">
            <Star size={14} className="text-primary fill-primary" />
            Client Success Stories
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            What Our Clients Say
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-base leading-relaxed">
            Don't just take our word for it. Here's what our clients have to say about their experience scaling with us.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i }}
              className="glass-card p-8 relative group hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Quote icon */}
                <div className="absolute top-6 right-6 text-primary/20 group-hover:text-primary/40 transition-colors duration-300">
                  <Quote size={32} />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={14}
                      className="text-primary fill-primary"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted text-base leading-relaxed mb-8">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-glass-border">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent-blue/20 flex items-center justify-center border border-glass-border shadow-glow">
                  <span className="text-white text-base font-semibold">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="text-white text-base font-medium group-hover:text-primary transition-colors duration-300">
                    {testimonial.name}
                  </p>
                  <p className="text-muted text-xs uppercase tracking-wider mt-0.5">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
