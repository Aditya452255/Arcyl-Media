"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react";
import { navLinks, siteConfig } from "@/lib/constants";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="relative border-t border-glass-border bg-dark-50/80 backdrop-blur-xl overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
        <div className="w-full h-full rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="section-container pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-glass-border">
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-6 md:col-span-2">
            <Link href="/" className="flex items-center group" aria-label="Arcyl Media Home">
              <div className="relative h-10 w-auto min-w-[160px] sm:min-w-[180px] flex items-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo-a.png"
                  alt="Arcyl Media Logo"
                  width={200}
                  height={45}
                  className="w-full h-full object-contain filter brightness-0 invert drop-shadow-[0_0_12px_rgba(124,92,252,0.6)]"
                />
              </div>
            </Link>
            <p className="text-muted max-w-sm text-base leading-relaxed">
              {siteConfig.description}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-dark-200 border border-glass-border flex items-center justify-center text-muted hover:text-white hover:border-primary/50 hover:bg-primary/10 hover:shadow-glow transition-all duration-300 group"
                aria-label="Arcyl Media Instagram"
              >
                <Instagram size={20} className="group-hover:scale-110 transition-transform duration-300 text-primary" />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-dark-200 border border-glass-border flex items-center justify-center text-muted hover:text-white hover:border-primary/50 hover:bg-primary/10 hover:shadow-glow transition-all duration-300 group"
                aria-label="Arcyl Media LinkedIn"
              >
                <Linkedin size={20} className="group-hover:scale-110 transition-transform duration-300 text-primary" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-heading text-lg tracking-wide">Navigation</h4>
            <nav className="flex flex-col gap-3 text-base text-muted">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-primary transition-colors duration-300 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3: Contact Info */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-heading text-lg tracking-wide">Contact Us</h4>
            <div className="flex flex-col gap-4 text-base text-muted">
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-3 hover:text-primary transition-colors duration-300 group"
              >
                <div className="w-9 h-9 rounded-lg bg-dark-200 border border-glass-border flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                  <Phone size={16} className="text-primary" />
                </div>
                <span>{siteConfig.phone}</span>
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-3 hover:text-primary transition-colors duration-300 group"
              >
                <div className="w-9 h-9 rounded-lg bg-dark-200 border border-glass-border flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                  <Mail size={16} className="text-primary" />
                </div>
                <span>{siteConfig.email}</span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-dark-200 border border-glass-border flex items-center justify-center">
                  <MapPin size={16} className="text-primary" />
                </div>
                <span>{siteConfig.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 text-sm text-muted">
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors duration-300">
              Privacy Policy
            </Link>
            <span className="text-glass-border">|</span>
            <Link href="/terms" className="hover:text-white transition-colors duration-300">
              Terms & Conditions
            </Link>
          </div>
          <p className="text-sm text-muted">
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
