"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Instagram } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export default function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-spacing relative" id="cta">
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-cta-gradient" />
          <div className="absolute inset-0 border border-glass-border-light rounded-3xl" />

          {/* Glow orbs */}
          <div className="glow-orb w-[400px] h-[400px] bg-primary/20 top-[-50%] left-[20%]" />
          <div className="glow-orb w-[300px] h-[300px] bg-accent-blue/15 bottom-[-30%] right-[20%]" />

          <div className="relative z-10 text-center py-20 px-6 sm:px-12 max-w-4xl mx-auto">
            {/* Social links - Exclusively Instagram */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <motion.a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Arcyl Media Instagram"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-2xl bg-dark-100/80 border border-glass-border-light flex items-center justify-center text-white hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 shadow-glow"
              >
                <Instagram size={24} className="text-primary" />
              </motion.a>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-6 tracking-tight"
            >
              Let's Collaborate
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-muted max-w-xl mx-auto text-lg mb-10 leading-relaxed"
            >
              Ready to start your web project or have questions? We're just a message away. Let's discuss your ideas and bring them to life. Reach out for a free consultation.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary px-10 py-4 text-lg font-medium shadow-glow"
                >
                  <span>Contact Us</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
