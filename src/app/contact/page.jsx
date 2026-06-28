"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Send,
} from "lucide-react";
import { siteConfig, projectTypes } from "@/lib/constants";

export default function ContactPage() {
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const formInView = useInView(formRef, { once: true, margin: "-50px" });

  const [selectedTypes, setSelectedTypes] = useState([
    "Digital Marketing",
  ]);
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    message: "",
  });

  const toggleProjectType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.firstName,
          email: formData.email,
          subject: selectedTypes.length > 0 ? `Goal: ${selectedTypes.join(", ")}` : "General Query",
          message: formData.message,
          phone: "",
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || "Failed to submit query.");
      }

      alert("Thank you for reaching out! We have received your query and it is now recorded in our admin panel.");
      setFormData({ firstName: "", email: "", message: "" });
      setSelectedTypes(["Digital Marketing"]);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-28 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

        <div className="section-container relative z-10">
          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl mb-16"
          >
            <div className="absolute inset-0 bg-cta-gradient" />
            <div className="absolute inset-0 border border-glass-border-light rounded-3xl" />
            <div className="glow-orb w-[400px] h-[400px] bg-primary/15 top-[-40%] left-[30%]" />
            <div className="glow-orb w-[300px] h-[300px] bg-accent-blue/10 bottom-[-30%] right-[25%]" />

            <div className="relative z-10 text-center py-16 sm:py-22 px-6 max-w-4xl mx-auto">
              {/* Social icons - Exclusively Instagram */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
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

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white mb-6 tracking-tight"
              >
                Let&apos;s Connect and Scale
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-muted max-w-xl mx-auto text-lg leading-relaxed"
              >
                Your digital growth deserves elite execution. Reach out to us to build custom AI workflows, launch high-ROI marketing campaigns, or engineer premium web platforms.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section ref={formRef} className="pb-24 relative">
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={formInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="glass-card p-8 sm:p-14 shadow-glow"
          >
            <div className="flex flex-col lg:flex-row gap-14">
              {/* Left: Form */}
              <div className="lg:w-[55%]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="form-label text-sm font-medium text-white/90 mb-2 block">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Enter First Name"
                      className="form-input w-full px-5 py-4 rounded-xl bg-dark-200 border border-glass-border text-white placeholder-muted focus:outline-none focus:border-primary/50 transition-colors"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="form-label text-sm font-medium text-white/90 mb-2 block">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter Email"
                      className="form-input w-full px-5 py-4 rounded-xl bg-dark-200 border border-glass-border text-white placeholder-muted focus:outline-none focus:border-primary/50 transition-colors"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="form-label text-sm font-medium text-white/90 mb-3 block">Primary Goal</label>
                    <div className="flex flex-wrap gap-3">
                      {projectTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleProjectType(type)}
                          className={`project-type-option px-4 py-2.5 rounded-full border text-sm font-medium flex items-center gap-2.5 transition-all duration-300 ${
                            selectedTypes.includes(type)
                              ? "bg-primary/20 border-primary text-white shadow-glow"
                              : "bg-dark-200 border-glass-border text-muted hover:text-white"
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full border ${
                              selectedTypes.includes(type)
                                ? "bg-primary border-primary"
                                : "border-muted"
                            } transition-all duration-300`}
                          />
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="form-label text-sm font-medium text-white/90 mb-2 block">
                      Message / Project Scope
                    </label>
                    <textarea
                      id="message"
                      placeholder="Tell us about your business goals and current bottlenecks"
                      rows={5}
                      className="form-input w-full px-5 py-4 rounded-xl bg-dark-200 border border-glass-border text-white placeholder-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-4 text-base font-medium flex items-center justify-center gap-3 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{submitting ? "Sending Query..." : "Send Your Message"}</span>
                    {!submitting && <Send size={18} className="relative z-10 text-white" />}
                  </motion.button>
                </form>
              </div>

              {/* Right: Contact info cards */}
              <div className="lg:w-[45%] space-y-6 flex flex-col justify-center">
                {/* Email card */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={formInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="glass-card p-8 group hover:border-primary/40 transition-all duration-300 shadow-glow"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-glow">
                      <Mail size={26} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                        Send Us an Email
                      </h3>
                      <p className="text-muted text-sm mb-4 leading-relaxed">
                        Feel free to reach out to us directly via email
                      </p>
                      <a href={`mailto:${siteConfig.email}`} className="inline-flex px-5 py-2.5 rounded-xl bg-dark-200 border border-glass-border text-sm text-white hover:border-primary/50 transition-colors shadow-glow">
                        {siteConfig.email}
                      </a>
                    </div>
                  </div>
                </motion.div>

                {/* Phone card */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={formInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="glass-card p-8 group hover:border-primary/40 transition-all duration-300 shadow-glow"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-glow">
                      <Phone size={26} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                        Give Us a Call
                      </h3>
                      <p className="text-muted text-sm mb-4 leading-relaxed">
                        Feel free to reach out to us at the number below
                      </p>
                      <a href={`tel:${siteConfig.phone}`} className="inline-flex px-5 py-2.5 rounded-xl bg-dark-200 border border-glass-border text-sm text-white hover:border-primary/50 transition-colors shadow-glow">
                        {siteConfig.phone}
                      </a>
                    </div>
                  </div>
                </motion.div>

                {/* Location card */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={formInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="glass-card p-8 group hover:border-primary/40 transition-all duration-300 shadow-glow"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-glow">
                      <MapPin size={26} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                        Location
                      </h3>
                      <p className="text-muted text-sm mb-4 leading-relaxed">
                        {siteConfig.location}
                      </p>
                      <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-200 border border-glass-border text-sm text-white hover:border-primary/50 transition-all duration-300 shadow-glow group/btn">
                        <span>Get Directions</span> <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform text-primary" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
