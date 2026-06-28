"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { navLinks, siteConfig } from "@/lib/constants";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass-nav py-3 shadow-lg shadow-black/20 backdrop-blur-md border-b border-glass-border"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="section-container flex items-center justify-between">
          {/* Logo */}
          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label="Arcyl Media Home">
            <div className="relative h-8 w-auto min-w-[140px] sm:min-w-[160px] flex items-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo-a.png"
                alt="Arcyl Media Logo"
                width={180}
                height={40}
                className="w-full h-full object-contain filter brightness-0 invert drop-shadow-[0_0_10px_rgba(124,92,252,0.5)]"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center">
            <div className="glass-nav rounded-full px-2 py-1.5 flex items-center gap-1 border border-glass-border">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    pathname === link.href
                      ? "text-white"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {pathname === link.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-dark-300 rounded-full border border-glass-border"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 rounded-full border border-glass-border hover:border-primary/50 bg-dark-200/50 hover:bg-primary/10 text-white text-sm font-medium transition-all duration-300 flex items-center gap-2 group shadow-glow"
              >
                <span>Let's Talk</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300 text-primary" />
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-white"
            aria-label="Toggle mobile menu"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-[280px] bg-dark-50 border-l border-glass-border p-6 pt-24 md:hidden flex flex-col justify-between"
            >
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                        pathname === link.href
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted hover:text-white hover:bg-dark-200"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-4"
                >
                  <Link href="/contact" className="block">
                    <button className="btn-primary w-full flex items-center justify-center gap-2">
                      <span>Let's Talk</span>
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                </motion.div>
              </nav>

              {/* Mobile Contact & Social */}
              <div className="pt-6 border-t border-glass-border flex flex-col gap-4 text-sm text-muted">
                <div>
                  <p className="text-xs text-muted-dark uppercase tracking-wider mb-1">Call Us</p>
                  <a href={`tel:${siteConfig.phone}`} className="text-white hover:text-primary transition-colors">
                    {siteConfig.phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-muted-dark uppercase tracking-wider mb-1">Email Us</p>
                  <a href={`mailto:${siteConfig.email}`} className="text-white hover:text-primary transition-colors">
                    {siteConfig.email}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
