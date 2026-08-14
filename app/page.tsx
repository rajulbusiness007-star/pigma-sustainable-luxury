"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Compass,
  ShieldCheck,
  Award,
  Sparkles,
  Clock,
  Star,
  User,
  Mail,
  Phone,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
  Send,
  Leaf,
  Sun,
  Wind,
  CheckCircle2,
  Droplet,
  Zap,
  Sparkle,
  Calendar,
  Building,
  HelpCircle,
  Shield,
  Crown,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
} from "lucide-react";
import { properties, reviews, Property } from "@/lib/properties";

export default function Home() {
  // Navigation & Menu States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  // Property Catalog Filtering States
  const [filterLocation, setFilterLocation] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterPrice, setFilterPrice] = useState<string>("All");
  const [filterBeds, setFilterBeds] = useState<string>("All");
  const [searchLocation, setSearchLocation] = useState("");

  // Filtered Properties List
  const [filteredProps, setFilteredProps] = useState<Property[]>(properties);

  // Active Selected Property (for Deep-Dive Drawer Modal)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Interactive Locations Map Pin Selection State
  const [activeMapProp, setActiveMapProp] = useState<Property>(properties[0]);

  // AI Chat Concierge States
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Welcome to Pigma Estates. I am your AI Concierge. How may I assist your search for sustainable tropical luxury in Phuket or Koh Samui today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatPreferences, setChatPreferences] = useState({
    budget: "",
    location: "Phuket",
    beds: "",
  });
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Contact / Enquiry Form States
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDealType, setFormDealType] = useState("Buy");
  const [formPropType, setFormPropType] = useState("Villa");
  const [formLocation, setFormLocation] = useState("Phuket");
  const [formBudget, setFormBudget] = useState("");
  const [formMessage, setFormMessage] = useState("");
  
  // Submission Status
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);
  const [savedInquiries, setSavedInquiries] = useState<any[]>([]);

  // Load inquiries from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pigma_inquiries");
      if (stored) {
        setSavedInquiries(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Localstorage load failed", e);
    }
  }, []);

  // Handle Header Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto scroll AI chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Handle Live Catalog Filter Trigger
  const handleSearchTrigger = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let result = properties;

    if (filterLocation !== "All") {
      result = result.filter((p) => p.city === filterLocation);
    }

    if (filterType !== "All") {
      result = result.filter((p) => p.type === filterType);
    }

    if (filterPrice !== "All") {
      if (filterPrice === "Under 2M") {
        result = result.filter((p) => p.price < 2000000);
      } else if (filterPrice === "2M - 3M") {
        result = result.filter((p) => p.price >= 2000000 && p.price <= 3000000);
      } else if (filterPrice === "Above 3M") {
        result = result.filter((p) => p.price > 3000000);
      }
    }

    if (filterBeds !== "All") {
      const bedCount = parseInt(filterBeds);
      result = result.filter((p) => p.beds === bedCount);
    }

    if (searchLocation.trim().length > 0) {
      result = result.filter(
        (p) =>
          p.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
          p.name.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    setFilteredProps(result);
  };

  const handleResetFilters = () => {
    setFilterLocation("All");
    setFilterType("All");
    setFilterPrice("All");
    setFilterBeds("All");
    setSearchLocation("");
    setFilteredProps(properties);
  };

  // Chat Submission Handler
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    const updatedMessages = [...chatMessages, { role: "user" as const, content: userMsg }];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          preferences: chatPreferences.budget ? chatPreferences : null,
        }),
      });

      const data = await response.json();
      if (response.ok && data.content) {
        setChatMessages([...updatedMessages, { role: "assistant", content: data.content }]);
      } else {
        throw new Error(data.error || "Concierge connection failed");
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "I apologize, but my satellite link to Phuket is temporarily experiencing delays. Please reach out to our senior partner directly using our Contact Form below.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleQuickChatForProperty = (propName: string) => {
    const section = document.getElementById("ai-concierge-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setChatInput(`Could you tell me more about the sustainable features of ${propName}?`);
    }
  };

  // Contact Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);
    setIsSubmitting(true);

    if (!formName.trim() || formName.trim().length < 3) {
      setFormErrors("Please enter your full name (at least 3 characters).");
      setIsSubmitting(false);
      return;
    }
    if (!formEmail.trim() || !formEmail.includes("@")) {
      setFormErrors("Please enter a valid electronic mail address.");
      setIsSubmitting(false);
      return;
    }
    if (!formPhone.trim() || formPhone.trim().length < 6) {
      setFormErrors("Please enter a valid contact phone number.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          email: formEmail,
          dealType: formDealType,
          propertyType: formPropType,
          preferredLocation: formLocation,
          budget: formBudget,
          message: formMessage,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSubmissionSuccess(data);
        const newInquiry = {
          id: data.referenceCode,
          timestamp: data.timestamp,
          name: formName,
          preferredLocation: formLocation,
          budget: formBudget,
          propertyType: formPropType,
          message: formMessage || "General Consultation Request",
        };
        const updatedHistory = [newInquiry, ...savedInquiries];
        setSavedInquiries(updatedHistory);
        localStorage.setItem("pigma_inquiries", JSON.stringify(updatedHistory));

        setFormName("");
        setFormPhone("");
        setFormEmail("");
        setFormMessage("");
        setFormBudget("");
      } else {
        setFormErrors(data.error || "Unable to register your inquiry. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setFormErrors("Connection issues prevented submission. Please contact our partners via phone/WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrepopulateInquiry = (prop: Property) => {
    setFormPropType(prop.type);
    setFormLocation(prop.city);
    setFormBudget(`$${prop.price.toLocaleString()}`);
    setFormMessage(`I am highly interested in scheduling a private tour or obtaining additional documentation for ${prop.name} at ${prop.location}. Please contact me.`);
    setSelectedProperty(null);

    const formSec = document.getElementById("contact-section");
    if (formSec) {
      formSec.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line;
      const isBullet = line.trim().startsWith("-") || line.trim().startsWith("*");
      if (isBullet) {
        content = line.replace(/^[-*]\s+/, "");
      }

      const parts = [];
      let lastIndex = 0;
      const regex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-semibold text-brand-gold-400">
            {match[1]}
          </strong>
        );
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-brand-cream-200 leading-relaxed py-0.5">
            {parts.length > 0 ? parts : content}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-brand-cream-200 leading-relaxed min-h-[1rem] mb-1.5">
          {parts.length > 0 ? parts : content}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-brand-cream-50 text-brand-olive-900 selection:bg-brand-olive-200 selection:text-brand-olive-900 relative overflow-x-hidden font-sans">
      
      {/* Hidden SVG for Wavy Organic Clipping Mask */}
      <svg className="absolute w-0 h-0" width="0" height="0">
        <defs>
          <clipPath id="organic-wave-svg-path" clipPathUnits="objectBoundingBox">
            <path d="M 0.05,0.12 
                     C 0.15,0.06 0.35,0.22 0.5,0.15 
                     C 0.65,0.08 0.85,0.04 0.95,0.12 
                     C 1.02,0.28 0.98,0.72 0.95,0.88 
                     C 0.85,0.96 0.65,0.88 0.5,0.92 
                     C 0.35,0.96 0.15,0.86 0.05,0.88 
                     C -0.02,0.72 0.01,0.28 0.05,0.12 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* STICKY HEADER (LIGHT WARM CREAM BACKGROUND - FULL WIDTH) */}
      <header
        id="navbar"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isHeaderScrolled
            ? "bg-brand-cream-50/95 backdrop-blur-md shadow-sm border-b border-brand-cream-300 py-3.5"
            : "bg-brand-cream-50/90 backdrop-blur-sm py-5 border-b border-brand-cream-300/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Brand */}
          <a href="#" className="flex items-center gap-2 group" id="pigma-logo">
            <div className="w-8 h-8 rounded-lg bg-brand-olive-850 border border-brand-olive-700 flex items-center justify-center text-brand-gold-400 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 fill-current stroke-[1.5]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif text-xl font-bold tracking-wider text-brand-olive-900 uppercase leading-none">
                Pigma
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-brand-olive-500 font-sans mt-0.5">
                Luxury Estates
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8" id="desktop-menu">
            <a href="#" className="text-xs font-semibold uppercase tracking-widest text-brand-olive-900 hover:text-brand-olive-600 transition-colors">Home</a>
            <a href="#featured-section" className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700 hover:text-brand-olive-900 transition-colors">Featured</a>
            <a href="#why-choose-section" className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700 hover:text-brand-olive-900 transition-colors">Standards</a>
            <a href="#locations-section" className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700 hover:text-brand-olive-900 transition-colors">Locations</a>
            <a href="#properties-section" className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700 hover:text-brand-olive-900 transition-colors">Catalog</a>
            <a href="#about-section" className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700 hover:text-brand-olive-900 transition-colors">Heritage</a>
            <a href="#services-section" className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700 hover:text-brand-olive-900 transition-colors">Services</a>
            <a href="#reviews-section" className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700 hover:text-brand-olive-900 transition-colors">Reviews</a>
          </nav>

          {/* Right Header CTA Button */}
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="#contact-section"
              className="px-5 py-2.5 bg-brand-olive-850 hover:bg-brand-olive-950 text-brand-cream-50 font-sans font-semibold text-xs tracking-widest uppercase rounded-lg transition-all duration-300 shadow-sm"
              id="header-cta"
            >
              Request Quote
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-brand-olive-900 hover:bg-brand-cream-200 rounded-lg lg:hidden focus:outline-none"
            aria-label="Toggle navigation menu"
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[70px] bg-brand-cream-50 border-b border-brand-cream-300 shadow-2xl z-40 p-6 flex flex-col gap-4 lg:hidden text-left"
            id="mobile-drawer"
          >
            <div className="flex flex-col gap-3 font-sans text-xs font-semibold uppercase tracking-wider text-brand-olive-900">
              <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-brand-cream-200 hover:text-brand-olive-600">Home</a>
              <a href="#featured-section" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-brand-cream-200 hover:text-brand-olive-600">Featured</a>
              <a href="#why-choose-section" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-brand-cream-200 hover:text-brand-olive-600">Standards</a>
              <a href="#locations-section" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-brand-cream-200 hover:text-brand-olive-600">Locations</a>
              <a href="#properties-section" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-brand-cream-200 hover:text-brand-olive-600">Catalog</a>
              <a href="#about-section" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-brand-cream-200 hover:text-brand-olive-600">Heritage</a>
              <a href="#services-section" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-brand-cream-200 hover:text-brand-olive-600">Services</a>
              <a href="#reviews-section" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-brand-cream-200 hover:text-brand-olive-600">Reviews</a>
            </div>

            <div className="pt-2">
              <a
                href="#contact-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full py-3 bg-brand-olive-850 text-brand-cream-50 font-bold text-xs uppercase tracking-widest text-center rounded-lg shadow-sm"
              >
                Request Quote
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: HERO SECTION — LIGHT (FULL WIDTH) */}
      <section className="w-full relative pt-32 pb-24 bg-brand-cream-50 text-brand-olive-900 border-b border-brand-cream-300 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-cream-200/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-3"
          >
            <span className="text-xs font-semibold tracking-[0.25em] text-brand-gold-400 uppercase">
              Ecological Masterpiece
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-brand-olive-900 tracking-tight leading-[1.05] max-w-5xl mx-auto uppercase mb-8"
            id="hero-main-title"
          >
            Sustainable Luxury <br />
            <span className="text-brand-olive-600 italic font-light tracking-normal lowercase font-serif">in</span> Thailand
          </motion.h1>

          <div className="relative z-10 -mb-8">
            <motion.a
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
              href="#contact-section"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-olive-850 hover:bg-brand-olive-950 text-brand-cream-50 font-serif font-medium tracking-widest text-xs uppercase rounded-full transition-all duration-300 shadow-xl border border-brand-olive-700 hover:-translate-y-0.5 cursor-pointer"
              id="hero-brochure-button"
            >
              <Sparkles className="w-4 h-4 text-brand-gold-400 animate-pulse" />
              Request Brochure
            </motion.a>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full aspect-[16/10] md:aspect-[16/8] max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl relative organic-wave-clip group cursor-pointer border border-brand-cream-300"
            onClick={() => {
              const section = document.getElementById("featured-section");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
            id="hero-wavy-image-container"
          >
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-all duration-500 z-10" />

            <Image
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85"
              alt="Pigma Luxury Sustainable Villa in Phuket Thailand"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-1000"
              priority
              referrerPolicy="no-referrer"
            />

            <div className="absolute bottom-16 left-12 md:left-20 z-20 flex flex-col text-left text-white max-w-sm">
              <span className="text-[10px] uppercase tracking-widest text-brand-cream-200 mb-1">
                Active Community
              </span>
              <span className="font-serif text-xl md:text-2xl font-bold tracking-wide">
                Kamala Hills, Phuket
              </span>
              <span className="text-xs text-brand-cream-100 font-sans mt-1">
                Passive oceanfront solar villas utilizing custom bamboo engineering.
              </span>
            </div>

            <div className="absolute bottom-16 right-12 md:right-20 z-20 flex items-center gap-2 px-4 py-2 bg-brand-olive-950/80 backdrop-blur-md rounded-full text-white text-xs font-sans tracking-wider border border-brand-olive-700">
              <Compass className="w-3.5 h-3.5 text-brand-gold-400 animate-spin-slow" />
              Explore Coordinates
            </div>
          </motion.div>

          <div className="mt-12 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-brand-olive-500 font-semibold">
              Scroll to discover properties
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 rounded-full bg-brand-olive-850"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: SEARCH / FILTER BAR — DARK OVERLAY CONTAINER */}
      <section className="w-full px-6 lg:px-8 -mt-6 relative z-30 max-w-5xl mx-auto" id="property-search-section">
        <div className="bg-brand-olive-900 text-brand-cream-50 rounded-2xl p-6 md:p-8 shadow-xl border border-brand-olive-800">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-gold-400" />
              <h3 className="font-serif text-lg font-bold text-brand-cream-50">
                Refine Your Tropical Search
              </h3>
            </div>

            <form onSubmit={handleSearchTrigger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-brand-gold-400 font-bold">
                  Region
                </label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="bg-brand-olive-950 border border-brand-olive-700 rounded-lg px-3 py-2 text-xs text-brand-cream-50 focus:outline-none focus:border-brand-gold-400 transition-colors"
                >
                  <option value="All">All Regions</option>
                  <option value="Phuket">Phuket</option>
                  <option value="Koh Samui">Koh Samui</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-brand-gold-400 font-bold">
                  Residence Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-brand-olive-950 border border-brand-olive-700 rounded-lg px-3 py-2 text-xs text-brand-cream-50 focus:outline-none focus:border-brand-gold-400 transition-colors"
                >
                  <option value="All">All Types</option>
                  <option value="Villa">Villa</option>
                  <option value="Estate">Estate</option>
                  <option value="Sanctuary">Sanctuary</option>
                  <option value="Residence">Residence</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-brand-gold-400 font-bold">
                  Price Limit
                </label>
                <select
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className="bg-brand-olive-950 border border-brand-olive-700 rounded-lg px-3 py-2 text-xs text-brand-cream-50 focus:outline-none focus:border-brand-gold-400 transition-colors"
                >
                  <option value="All">Any Price</option>
                  <option value="Under 2M">Under $2,000,000</option>
                  <option value="2M - 3M">$2,000,000 - $3,000,000</option>
                  <option value="Above 3M">Above $3,000,000</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-brand-gold-400 font-bold">
                  Bedrooms
                </label>
                <select
                  value={filterBeds}
                  onChange={(e) => setFilterBeds(e.target.value)}
                  className="bg-brand-olive-950 border border-brand-olive-700 rounded-lg px-3 py-2 text-xs text-brand-cream-50 focus:outline-none focus:border-brand-gold-400 transition-colors"
                >
                  <option value="All">Any Bedrooms</option>
                  <option value="3">3 Beds</option>
                  <option value="4">4 Beds</option>
                  <option value="5">5 Beds</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-cream-100 hover:bg-brand-cream-200 text-brand-olive-900 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-sm active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-olive-800 pt-4 text-xs">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-brand-cream-200/70 font-medium text-[11px]">Text Search:</span>
                <input
                  type="text"
                  placeholder="e.g. Bangtao Beach, Chaweng..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="bg-transparent border-b border-brand-olive-700 text-brand-cream-50 placeholder-brand-olive-400 focus:outline-none focus:border-brand-gold-400 px-1 py-0.5 w-48 font-medium text-xs"
                />
                <button
                  onClick={() => handleSearchTrigger()}
                  className="text-brand-gold-400 hover:text-white font-semibold underline text-xs"
                >
                  Apply
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-brand-cream-200/80 font-medium text-xs">
                  Showing <strong className="text-brand-cream-50">{filteredProps.length}</strong> luxurious residences
                </span>
                {(filterLocation !== "All" || filterType !== "All" || filterPrice !== "All" || filterBeds !== "All" || searchLocation) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-brand-gold-400 hover:text-white underline uppercase tracking-wider font-bold text-[10px]"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURED PROPERTIES — DARK SECTION (FULL WIDTH) */}
      <section className="w-full py-24 bg-brand-olive-900 text-brand-cream-50 border-b border-brand-olive-800" id="featured-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-brand-gold-400 font-bold mb-1 block">
                Featured Properties
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-cream-50 uppercase tracking-tight">
                Signature Residences <br />
                Curated for You
              </h2>
            </div>
            <a
              href="#properties-section"
              className="mt-4 md:mt-0 text-xs font-bold uppercase tracking-widest text-brand-gold-400 hover:text-brand-cream-50 flex items-center gap-1.5 border-b border-brand-gold-400 pb-1 w-fit"
            >
              View All Properties <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Card 1 */}
            <div className="bg-brand-cream-100 rounded-3xl overflow-hidden border border-brand-cream-300 shadow-md flex flex-col group text-brand-olive-900">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream-200">
                <Image
                  src={properties[0].image}
                  alt={properties[0].name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-brand-olive-850 text-brand-cream-50 px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                  Featured
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-brand-olive-900 mb-1">
                    {properties[0].name}
                  </h3>
                  <span className="text-xs text-brand-olive-600 font-medium block mb-4">
                    {properties[0].location}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-brand-olive-700 font-medium mb-6">
                    <span>🛏 {properties[0].beds} Beds</span>
                    <span>•</span>
                    <span>🚿 {properties[0].baths} Baths</span>
                    <span>•</span>
                    <span>📐 {properties[0].size} sqm</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-brand-cream-300 pt-4 mt-auto">
                  <span className="font-serif text-lg font-bold text-brand-olive-950">
                    $2,850,000 USD
                  </span>
                  <button
                    onClick={() => setSelectedProperty(properties[0])}
                    className="px-4 py-2 bg-brand-olive-850 hover:bg-brand-olive-950 text-brand-cream-50 rounded-lg text-xs font-semibold uppercase tracking-wider"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-brand-cream-100 rounded-3xl overflow-hidden border border-brand-cream-300 shadow-md flex flex-col group text-brand-olive-900">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream-200">
                <Image
                  src={properties[2].image}
                  alt={properties[2].name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-brand-olive-850 text-brand-cream-50 px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                  Featured
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-brand-olive-900 mb-1">
                    Ocean Vista Sanctuary
                  </h3>
                  <span className="text-xs text-brand-olive-600 font-medium block mb-4">
                    Chaweng Noi, Koh Samui
                  </span>
                  <div className="flex items-center gap-3 text-xs text-brand-olive-700 font-medium mb-6">
                    <span>🛏 4 Beds</span>
                    <span>•</span>
                    <span>🚿 5 Baths</span>
                    <span>•</span>
                    <span>📐 540 sqm</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-brand-cream-300 pt-4 mt-auto">
                  <span className="font-serif text-lg font-bold text-brand-olive-950">
                    $3,450,000 USD
                  </span>
                  <button
                    onClick={() => setSelectedProperty(properties[2])}
                    className="px-4 py-2 bg-brand-olive-850 hover:bg-brand-olive-950 text-brand-cream-50 rounded-lg text-xs font-semibold uppercase tracking-wider"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-brand-cream-100 rounded-3xl overflow-hidden border border-brand-cream-300 shadow-md flex flex-col group text-brand-olive-900">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream-200">
                <Image
                  src={properties[1].image}
                  alt="The Horizon Reserve"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-brand-olive-850 text-brand-cream-50 px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider">
                  New Release
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-brand-olive-900 mb-1">
                    The Horizon Reserve
                  </h3>
                  <span className="text-xs text-brand-olive-600 font-medium block mb-4">
                    Layan Beach, Phuket
                  </span>
                  <div className="flex items-center gap-3 text-xs text-brand-olive-700 font-medium mb-6">
                    <span>🛏 5 Beds</span>
                    <span>•</span>
                    <span>🚿 6 Baths</span>
                    <span>•</span>
                    <span>📐 650 sqm</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-brand-cream-300 pt-4 mt-auto">
                  <span className="font-serif text-lg font-bold text-brand-olive-950">
                    $2,250,000 USD
                  </span>
                  <button
                    onClick={() => setSelectedProperty(properties[1])}
                    className="px-4 py-2 bg-brand-olive-850 hover:bg-brand-olive-950 text-brand-cream-50 rounded-lg text-xs font-semibold uppercase tracking-wider"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY CHOOSE US — LIGHT SECTION (FULL WIDTH) */}
      <section className="w-full py-24 bg-brand-cream-50 text-brand-olive-900 border-y border-brand-cream-300" id="why-choose-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-brand-olive-500 font-bold mb-2 block">
            The Pigma Standard
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight text-brand-olive-900 mb-4">
            Built Different. <br />
            Built for Future.
          </h2>
          <p className="text-xs md:text-sm text-brand-olive-600 max-w-xl mx-auto leading-relaxed mb-16 font-medium">
            Every Pigma residence is crafted with precision, sustainability, and timeless tropical elegance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex gap-4">
              <div className="p-3 bg-brand-olive-950 rounded-xl h-fit text-brand-gold-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-brand-cream-50 mb-2">Trusted Local Experts</h4>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed">
                  Decades of elite local development advisory in Phuket & Samui. Completely licensed and validated transaction processes.
                </p>
              </div>
            </div>

            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex gap-4">
              <div className="p-3 bg-brand-olive-950 rounded-xl h-fit text-brand-gold-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-brand-cream-50 mb-2">100% Verified Properties</h4>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed">
                  Each villa undergoes rigorous independent structural, hydrological, and carbon assessments prior to being published.
                </p>
              </div>
            </div>

            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex gap-4">
              <div className="p-3 bg-brand-olive-950 rounded-xl h-fit text-brand-gold-400">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-brand-cream-50 mb-2">Autonomous Carbon-Negativity</h4>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed">
                  Properties designed to actively balance carbon footprints, offering real-time solar sharing arrays and local bio-farming.
                </p>
              </div>
            </div>

            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex gap-4">
              <div className="p-3 bg-brand-olive-950 rounded-xl h-fit text-brand-gold-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-brand-cream-50 mb-2">Fast Direct Response</h4>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed">
                  Private liaison consultants respond within 15 minutes of catalog queries to coordinate on-site or remote tours.
                </p>
              </div>
            </div>

            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex gap-4">
              <div className="p-3 bg-brand-olive-950 rounded-xl h-fit text-brand-gold-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-brand-cream-50 mb-2">Unmatched Client Discretion</h4>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed">
                  Private viewing itineraries arranged via helicopter transfers or corporate luxury yachts. Absolute confidentiality guaranteed.
                </p>
              </div>
            </div>

            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex gap-4">
              <div className="p-3 bg-brand-olive-950 rounded-xl h-fit text-brand-gold-400">
                <Sparkle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-brand-cream-50 mb-2">Flexible Smart Investments</h4>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed">
                  Excellent rental yields managed securely by our corporate partner offices while you are abroad, fully integrated with local laws.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: LOCATIONS — DARK SECTION (FULL WIDTH & AUTHENTIC SATELLITE HUD MAP) */}
      <section className="w-full py-24 bg-brand-olive-900 text-brand-cream-50 border-b border-brand-olive-800" id="locations-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-brand-gold-400 font-bold mb-2 block">
                Exclusive Geography
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-cream-50 uppercase tracking-tight">
                Our Locations
              </h2>
            </div>
            <p className="text-xs md:text-sm text-brand-cream-200/80 max-w-md leading-relaxed mt-4 md:mt-0">
              Explore our master-planned ecological developments across Thailand&apos;s two premier island sanctuaries: Phuket & Koh Samui.
            </p>
          </div>

          {/* Region Selection Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 mb-8 text-left">
            <button
              onClick={() => {
                setFilterLocation("All");
                setActiveMapProp(properties[0]);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                filterLocation === "All"
                  ? "bg-brand-gold-400 text-brand-olive-950 border-brand-gold-400 shadow-sm"
                  : "bg-brand-olive-850 text-brand-cream-200 border-brand-olive-700 hover:border-brand-gold-400"
              }`}
            >
              All Sanctuaries ({properties.length})
            </button>
            <button
              onClick={() => {
                setFilterLocation("Phuket");
                const phuketFirst = properties.find((p) => p.city === "Phuket");
                if (phuketFirst) setActiveMapProp(phuketFirst);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                filterLocation === "Phuket"
                  ? "bg-brand-gold-400 text-brand-olive-950 border-brand-gold-400 shadow-sm"
                  : "bg-brand-olive-850 text-brand-cream-200 border-brand-olive-700 hover:border-brand-gold-400"
              }`}
            >
              Phuket Belt (4)
            </button>
            <button
              onClick={() => {
                setFilterLocation("Koh Samui");
                const samuiFirst = properties.find((p) => p.city === "Koh Samui");
                if (samuiFirst) setActiveMapProp(samuiFirst);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                filterLocation === "Koh Samui"
                  ? "bg-brand-gold-400 text-brand-olive-950 border-brand-gold-400 shadow-sm"
                  : "bg-brand-olive-850 text-brand-cream-200 border-brand-olive-700 hover:border-brand-gold-400"
              }`}
            >
              Koh Samui Belt (2)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Side: Authentic High-Resolution Satellite Map HUD Container */}
            <div className="lg:col-span-7 bg-brand-olive-850 rounded-3xl p-6 lg:p-8 border border-brand-olive-700 relative flex flex-col justify-between shadow-xl min-h-[520px] overflow-hidden group">
              
              {/* High-Resolution Satellite Map Background Layer */}
              <div className="absolute inset-0 bg-brand-olive-950/70 z-0 pointer-events-none">
                <Image
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
                  alt="Phuket & Koh Samui Satellite Topographical Map View"
                  fill
                  className="object-cover opacity-25 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Architectural Grid Overlay Lines */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0" />

              {/* Top HUD Display Header */}
              <div className="flex items-center justify-between z-10 bg-brand-olive-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-brand-olive-700 text-left mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-cream-50 font-mono">
                    LIVE SATELLITE HUD • LAT 7.9514° N
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-400 font-mono hidden sm:inline">
                  ANDAMAN & GULF ZONES
                </span>
              </div>

              {/* Map Interactive Canvas */}
              <div className="relative w-full flex-1 my-2 rounded-2xl overflow-hidden bg-brand-olive-950/60 border border-brand-olive-800 backdrop-blur-sm flex items-center justify-center min-h-[300px]">
                
                {/* Vector Island Outlines Layer */}
                <svg className="absolute inset-0 w-full h-full text-brand-olive-700/50 stroke-brand-olive-600/70" fill="currentColor" strokeWidth="1.5" viewBox="0 0 100 60">
                  {/* Phuket Island Outline */}
                  <path d="M 18,10 C 22,8 24,12 26,15 C 28,18 25,25 24,30 C 22,35 24,40 22,45 C 20,48 18,46 16,42 C 14,38 15,30 14,25 C 13,20 18,12 18,10 Z" />
                  {/* Koh Samui Island Outline */}
                  <path d="M 72,25 C 76,22 80,24 82,28 C 84,32 81,38 80,42 C 77,45 73,44 70,40 C 67,36 68,28 72,25 Z" />
                </svg>

                {/* Regional Labels inside Map */}
                <div className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-mono text-brand-gold-400 font-bold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md border border-brand-olive-700">
                  Phuket Belt
                </div>
                <div className="absolute top-4 right-4 text-[9px] uppercase tracking-widest font-mono text-brand-gold-400 font-bold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md border border-brand-olive-700">
                  Koh Samui Belt
                </div>

                {/* Map Pins with Pulse Effect */}
                {properties
                  .filter((p) => filterLocation === "All" || p.city === filterLocation)
                  .map((p) => {
                    const isActive = activeMapProp.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                        style={{ left: `${p.coordinates.x}%`, top: `${p.coordinates.y}%` }}
                      >
                        {/* Pulse Ring for Active Pin */}
                        {isActive && (
                          <div className="absolute -inset-3 rounded-full bg-brand-gold-400/30 animate-ping pointer-events-none" />
                        )}

                        <button
                          onClick={() => setActiveMapProp(p)}
                          className={`relative group/pin transition-all duration-300 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg border ${
                            isActive
                              ? "bg-brand-gold-400 text-brand-olive-950 border-white scale-110 z-30"
                              : "bg-brand-olive-900/90 text-brand-cream-50 border-brand-olive-700 hover:bg-brand-olive-800 hover:scale-105"
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[10px] font-bold tracking-wider uppercase font-mono whitespace-nowrap">
                            ${(p.price / 1000000).toFixed(2)}M
                          </span>

                          {/* Hover Tooltip Card */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-brand-olive-950 text-brand-cream-50 rounded-xl p-3 shadow-2xl border border-brand-olive-700 opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-50 text-left">
                            <span className="text-[8px] font-mono text-brand-gold-400 uppercase font-bold block mb-0.5">
                              {p.city} • {p.type}
                            </span>
                            <h5 className="font-serif text-xs font-bold leading-tight mb-1 text-white">
                              {p.name}
                            </h5>
                            <span className="text-[9px] text-brand-cream-200/80 block">
                              {p.beds} Beds • {p.size} sqm
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Selected Location Bar */}
              <div className="bg-brand-cream-100 rounded-2xl p-4 border border-brand-cream-300 shadow-md flex items-center justify-between text-left text-brand-olive-900 z-10 mt-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-olive-500 font-mono">
                      ACTIVE SATELLITE TARGET
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-brand-olive-900 mt-0.5">
                    {activeMapProp.name}
                  </h4>
                  <p className="text-[11px] text-brand-olive-600">
                    {activeMapProp.location} • <span className="font-bold text-brand-olive-900">${activeMapProp.price.toLocaleString()} USD</span>
                  </p>
                </div>
                <div className="text-[10px] bg-brand-olive-850 text-brand-cream-50 font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider font-mono">
                  GPS VERIFIED
                </div>
              </div>
            </div>

            {/* Right Side: Selected Property Specs Card */}
            <div className="lg:col-span-5 bg-brand-cream-100 text-brand-olive-900 rounded-3xl p-6 lg:p-8 border border-brand-cream-300 shadow-xl text-left flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-brand-olive-500 font-bold block">
                    {activeMapProp.city} Sanctuary
                  </span>
                  <span className="px-2.5 py-0.5 bg-brand-olive-850 text-brand-cream-50 text-[9px] font-bold uppercase rounded-md">
                    {activeMapProp.type}
                  </span>
                </div>

                <h3 className="font-serif text-2xl md:text-3xl font-bold text-brand-olive-900 leading-tight mb-4">
                  {activeMapProp.name}
                </h3>

                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-5 bg-brand-cream-200 shadow-inner group">
                  <Image
                    src={activeMapProp.image}
                    alt={activeMapProp.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold font-mono">
                    +{activeMapProp.sustainabilityIndex}% Sustainability
                  </div>
                </div>

                <p className="text-xs text-brand-olive-600 leading-relaxed mb-6">
                  {activeMapProp.description}
                </p>

                {/* 2x2 Property Details Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-brand-cream-300 text-xs mb-6">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-olive-500 font-bold block mb-0.5">Location</span>
                    <span className="font-semibold text-brand-olive-900">{activeMapProp.location}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-olive-500 font-bold block mb-0.5">Specifications</span>
                    <span className="font-semibold text-brand-olive-900">{activeMapProp.beds} Beds • {activeMapProp.baths} Baths</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-olive-500 font-bold block mb-0.5">Area Space</span>
                    <span className="font-semibold text-brand-olive-900">{activeMapProp.size} sqm</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-olive-500 font-bold block mb-0.5">Asking Price</span>
                    <span className="font-bold text-brand-olive-950 font-serif text-sm">${activeMapProp.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setSelectedProperty(activeMapProp)}
                  className="flex-1 py-3 bg-brand-cream-200 hover:bg-brand-cream-300 text-brand-olive-900 font-semibold text-xs uppercase tracking-widest rounded-xl transition-all text-center"
                >
                  Specifications
                </button>
                <button
                  onClick={() => handlePrepopulateInquiry(activeMapProp)}
                  className="flex-1 py-3 bg-brand-olive-850 hover:bg-brand-olive-950 text-brand-cream-50 font-semibold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm text-center"
                >
                  Book Viewing
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: PROPERTY SHOWCASE / BENTO GRID — LIGHT SECTION (FULL WIDTH) */}
      <section className="w-full py-24 bg-brand-cream-50 text-brand-olive-900 border-y border-brand-cream-300" id="properties-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16 text-left">
            <div className="lg:col-span-6">
              <span className="text-xs uppercase tracking-[0.25em] text-brand-olive-500 font-bold mb-2 block">
                Direct Developer Catalog
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight text-brand-olive-900">
                Our Properties
              </h2>
            </div>
            <div className="lg:col-span-6 lg:text-right text-left flex flex-col lg:items-end justify-center">
              <p className="text-xs md:text-sm text-brand-olive-600 max-w-md leading-relaxed">
                An award-winning ecological project design of ultra-luxury boutique properties in tropical beachfront sanctuaries. Fully certified carbon offset ratios.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="properties-grid">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-brand-cream-200/70 rounded-3xl p-8 border border-brand-cream-300 flex flex-col justify-between aspect-square text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-brand-cream-400/40 pointer-events-none">
                <Sun className="w-24 h-24 stroke-[0.5]" />
              </div>
              
              <div className="flex flex-col gap-2 z-10">
                <span className="text-xs uppercase tracking-widest text-brand-olive-500 font-bold">
                  Performance Metric
                </span>
                <p className="text-xs text-brand-olive-600 max-w-[200px] leading-relaxed">
                  Localized passive louvres reducing HVAC refrigeration requirements.
                </p>
              </div>

              <div className="flex flex-col gap-1 z-10 mt-auto">
                <span className="font-serif text-5xl md:text-6xl font-semibold tracking-tight text-brand-olive-900">
                  60%
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700">
                  Sustainability Index
                </span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-brand-olive-850 rounded-3xl overflow-hidden border border-brand-olive-700 shadow-md flex flex-col group relative text-brand-cream-50"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-olive-950">
                <Image
                  src={properties[0].image}
                  alt={properties[0].name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-brand-cream-100 text-brand-olive-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {properties[0].city}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow text-left">
                <span className="text-xs text-brand-gold-400 uppercase tracking-widest font-semibold mb-1">
                  {properties[0].type} • {properties[0].size} sqm
                </span>
                <h3 className="font-serif text-lg font-bold text-brand-cream-50 leading-tight mb-2">
                  {properties[0].name}
                </h3>
                <p className="text-xs text-brand-cream-200/70 line-clamp-2 leading-relaxed mb-4">
                  {properties[0].description}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-brand-olive-700 pt-4">
                  <span className="font-serif text-md font-bold text-brand-cream-50">
                    ${properties[0].price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelectedProperty(properties[0])}
                    className="text-xs font-bold text-brand-gold-400 hover:text-white underline flex items-center gap-1"
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-brand-cream-200/70 rounded-3xl p-8 border border-brand-cream-300 flex flex-col justify-between aspect-square text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-brand-cream-400/40 pointer-events-none">
                <Leaf className="w-24 h-24 stroke-[0.5]" />
              </div>

              <div className="flex flex-col gap-2 z-10">
                <span className="text-xs uppercase tracking-widest text-brand-olive-500 font-bold">
                  Performance Metric
                </span>
                <p className="text-xs text-brand-olive-600 max-w-[200px] leading-relaxed">
                  Engineered timber structural frameworks locking away raw atmospheric carbon.
                </p>
              </div>

              <div className="flex flex-col gap-1 z-10 mt-auto">
                <span className="font-serif text-5xl md:text-6xl font-semibold tracking-tight text-brand-olive-900">
                  210%
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700">
                  Carbon Offset Ratio
                </span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-brand-olive-850 rounded-3xl overflow-hidden border border-brand-olive-700 shadow-md flex flex-col group relative text-brand-cream-50"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-olive-950">
                <Image
                  src={properties[1].image}
                  alt={properties[1].name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-brand-cream-100 text-brand-olive-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {properties[1].city}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow text-left">
                <span className="text-xs text-brand-gold-400 uppercase tracking-widest font-semibold mb-1">
                  {properties[1].type} • {properties[1].size} sqm
                </span>
                <h3 className="font-serif text-lg font-bold text-brand-cream-50 leading-tight mb-2">
                  {properties[1].name}
                </h3>
                <p className="text-xs text-brand-cream-200/70 line-clamp-2 leading-relaxed mb-4">
                  {properties[1].description}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-brand-olive-700 pt-4">
                  <span className="font-serif text-md font-bold text-brand-cream-50">
                    ${properties[1].price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelectedProperty(properties[1])}
                    className="text-xs font-bold text-brand-gold-400 hover:text-white underline flex items-center gap-1"
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-brand-olive-850 rounded-3xl overflow-hidden border border-brand-olive-700 shadow-md flex flex-col group relative text-brand-cream-50"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-olive-950">
                <Image
                  src={properties[2].image}
                  alt={properties[2].name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-brand-cream-100 text-brand-olive-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {properties[2].city}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow text-left">
                <span className="text-xs text-brand-gold-400 uppercase tracking-widest font-semibold mb-1">
                  {properties[2].type} • {properties[2].size} sqm
                </span>
                <h3 className="font-serif text-lg font-bold text-brand-cream-50 leading-tight mb-2">
                  {properties[2].name}
                </h3>
                <p className="text-xs text-brand-cream-200/70 line-clamp-2 leading-relaxed mb-4">
                  {properties[2].description}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-brand-olive-700 pt-4">
                  <span className="font-serif text-md font-bold text-brand-cream-50">
                    ${properties[2].price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelectedProperty(properties[2])}
                    className="text-xs font-bold text-brand-gold-400 hover:text-white underline flex items-center gap-1"
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-brand-cream-200/70 rounded-3xl p-8 border border-brand-cream-300 flex flex-col justify-between aspect-square text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-brand-cream-400/40 pointer-events-none">
                <Droplet className="w-24 h-24 stroke-[0.5]" />
              </div>

              <div className="flex flex-col gap-2 z-10">
                <span className="text-xs uppercase tracking-widest text-brand-olive-500 font-bold">
                  Performance Metric
                </span>
                <p className="text-xs text-brand-olive-600 max-w-[200px] leading-relaxed">
                  Self-replenishing deep aquifer recycling loop keeping structures entirely water-independent.
                </p>
              </div>

              <div className="flex flex-col gap-1 z-10 mt-auto">
                <span className="font-serif text-5xl md:text-6xl font-semibold tracking-tight text-brand-olive-900">
                  310%
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700">
                  Water Self-Sufficiency
                </span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-brand-olive-850 rounded-3xl overflow-hidden border border-brand-olive-700 shadow-md flex flex-col group relative text-brand-cream-50"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-olive-950">
                <Image
                  src={properties[4].image}
                  alt={properties[4].name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-brand-cream-100 text-brand-olive-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {properties[4].city}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow text-left">
                <span className="text-xs text-brand-gold-400 uppercase tracking-widest font-semibold mb-1">
                  {properties[4].type} • {properties[4].size} sqm
                </span>
                <h3 className="font-serif text-lg font-bold text-brand-cream-50 leading-tight mb-2">
                  {properties[4].name}
                </h3>
                <p className="text-xs text-brand-cream-200/70 line-clamp-2 leading-relaxed mb-4">
                  {properties[4].description}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-brand-olive-700 pt-4">
                  <span className="font-serif text-md font-bold text-brand-cream-50">
                    ${properties[4].price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelectedProperty(properties[4])}
                    className="text-xs font-bold text-brand-gold-400 hover:text-white underline flex items-center gap-1"
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-brand-cream-200/70 rounded-3xl p-8 border border-brand-cream-300 flex flex-col justify-between aspect-square text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-brand-cream-400/40 pointer-events-none">
                <Zap className="w-24 h-24 stroke-[0.5]" />
              </div>

              <div className="flex flex-col gap-2 z-10">
                <span className="text-xs uppercase tracking-widest text-brand-olive-500 font-bold">
                  Performance Metric
                </span>
                <p className="text-xs text-brand-olive-600 max-w-[200px] leading-relaxed">
                  Smart solar battery systems storing solar fuel to power local community grids.
                </p>
              </div>

              <div className="flex flex-col gap-1 z-10 mt-auto">
                <span className="font-serif text-5xl md:text-6xl font-semibold tracking-tight text-brand-olive-900">
                  510%
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-olive-700">
                  Battery Storage Yield
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 7: ABOUT / STORY — DARK SECTION (FULL WIDTH) */}
      <section className="w-full py-24 bg-brand-olive-900 text-brand-cream-50 border-y border-brand-olive-800" id="about-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 text-left">
            <span className="text-xs uppercase tracking-widest text-brand-gold-400 font-bold mb-2 block">
              Our Visionary Heritage
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-brand-cream-50 uppercase tracking-tight mb-6 font-bold">
              Bespoke Beachfront <br />
              Sanctuaries
            </h2>
            <p className="text-sm text-brand-cream-200/90 leading-relaxed mb-6 font-medium">
              Pigma was established with a singular, uncompromised intent: to construct architectural masterpieces that actively replenish the tropical ecosystems they inhabit.
            </p>
            <p className="text-xs text-brand-cream-200/70 leading-relaxed mb-8">
              We operate exclusively in Thailand&apos;s pristine waters of Phuket and Koh Samui, sourcing ancient reclaimed teak, using volcanic rock isolation, and building passive micro-wind generators. Pigma estates require zero public utility dependencies while providing the absolute highest standard of private island luxury.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-brand-olive-800">
              <div className="flex flex-col">
                <span className="font-serif text-3xl md:text-4xl font-bold text-brand-cream-50">
                  100+
                </span>
                <span className="text-[10px] uppercase tracking-wider text-brand-gold-400 font-bold mt-1">
                  Properties Sold
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-3xl md:text-4xl font-bold text-brand-cream-50">
                  500+
                </span>
                <span className="text-[10px] uppercase tracking-wider text-brand-gold-400 font-bold mt-1">
                  Happy Clients
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-3xl md:text-4xl font-bold text-brand-cream-50">
                  10+
                </span>
                <span className="text-[10px] uppercase tracking-wider text-brand-gold-400 font-bold mt-1">
                  Years Experience
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-brand-olive-800">
              <Image
                src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
                alt="Pigma Luxury Interior Design Masterpiece"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-brand-cream-100 text-brand-olive-900 p-6 rounded-2xl shadow-xl max-w-xs text-left border border-brand-cream-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-brand-olive-850">
                  <Image
                    src="https://picsum.photos/seed/consultant/100/100"
                    alt="Senior Developer Representative"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h5 className="font-serif text-sm font-bold">Chatchai Prasert</h5>
                  <span className="text-[10px] uppercase tracking-wider text-brand-olive-600 block font-semibold">
                    Chief Managing Partner
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-brand-olive-800 leading-relaxed italic">
                &ldquo;Our client families expect flawless spatial flow combined with absolute ecological accountability. Pigma delivers exactly both.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: SERVICES — LIGHT SECTION (FULL WIDTH) */}
      <section className="w-full py-24 bg-brand-cream-50 text-brand-olive-900 border-y border-brand-cream-300" id="services-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-brand-olive-500 font-bold mb-2 block">
            Elite Concierge Offerings
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight text-brand-olive-900 mb-16">
            Our Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-brand-olive-950 rounded-xl flex items-center justify-center text-brand-gold-400 mb-6">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-cream-50 mb-3">Property Buying</h3>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed mb-6">
                  Bespoke brokerage finding exclusive off-market sustainable luxury villas and cliffside estates. Complete support for foreign ownership laws in Thailand.
                </p>
              </div>
              <a href="#contact-section" className="text-xs font-bold text-brand-gold-400 hover:text-white flex items-center gap-1 group">
                Enquire Now <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-brand-olive-950 rounded-xl flex items-center justify-center text-brand-gold-400 mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-cream-50 mb-3">Property Selling</h3>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed mb-6">
                  Elite marketing strategies utilizing localized targeting and cinematic video showcase reaching premium ecological buyers globally.
                </p>
              </div>
              <a href="#contact-section" className="text-xs font-bold text-brand-gold-400 hover:text-white flex items-center gap-1 group">
                Request Valuation <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-brand-olive-950 rounded-xl flex items-center justify-center text-brand-gold-400 mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-cream-50 mb-3">Luxury Renting</h3>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed mb-6">
                  Short-term or seasonal private rentals of certified sustainable retreats. Full butler, yacht, and organic private chef staffing arranged.
                </p>
              </div>
              <a href="#contact-section" className="text-xs font-bold text-brand-gold-400 hover:text-white flex items-center gap-1 group">
                View Rental Catalog <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-brand-olive-950 rounded-xl flex items-center justify-center text-brand-gold-400 mb-6">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-cream-50 mb-3">Property Management</h3>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed mb-6">
                  Complete on-site property engineering, solar-panel maintenance, seawater pool filtration, organic agricultural gardening, and estate security.
                </p>
              </div>
              <a href="#contact-section" className="text-xs font-bold text-brand-gold-400 hover:text-white flex items-center gap-1 group">
                Learn More <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-brand-olive-950 rounded-xl flex items-center justify-center text-brand-gold-400 mb-6">
                  <Sun className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-cream-50 mb-3">Property Valuation</h3>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed mb-6">
                  Precise ecological and physical property valuations factoring in solar storage output, structural carbon retention, and local oceanfront supply index.
                </p>
              </div>
              <a href="#contact-section" className="text-xs font-bold text-brand-gold-400 hover:text-white flex items-center gap-1 group">
                Book Appointment <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            <div className="bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-8 border border-brand-olive-700 shadow-md text-left flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-brand-olive-950 rounded-xl flex items-center justify-center text-brand-gold-400 mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-cream-50 mb-3">Investment Assistance</h3>
                <p className="text-xs text-brand-cream-200/80 leading-relaxed mb-6">
                  Tailored portfolio analysis of beachfront investments in SE Asia. Helping funds and families identify high-yield, low-footprint residential complexes.
                </p>
              </div>
              <a href="#contact-section" className="text-xs font-bold text-brand-gold-400 hover:text-white flex items-center gap-1 group">
                Consult Our Partner <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: GOOGLE REVIEWS — DARK SECTION (FULL WIDTH) */}
      <section className="w-full py-24 bg-brand-olive-900 text-brand-cream-50 border-y border-brand-olive-800" id="reviews-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-left mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-brand-gold-400 font-bold mb-1 block">
              Google Reviews
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-cream-50 uppercase tracking-tight">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left">
            <div className="lg:col-span-3 bg-brand-cream-100 text-brand-olive-900 rounded-2xl p-6 border border-brand-cream-300 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex text-brand-gold-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-brand-olive-600 leading-relaxed mb-6">
                  &ldquo;Pigma made our dream home in Phuket a reality. The design, privacy, and sustainability are unmatched.&rdquo;
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-olive-900">James T.</h4>
                <span className="text-[10px] text-brand-olive-500 font-medium">United Kingdom</span>
              </div>
            </div>

            <div className="lg:col-span-3 bg-brand-cream-100 text-brand-olive-900 rounded-2xl p-6 border border-brand-cream-300 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex text-brand-gold-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-brand-olive-600 leading-relaxed mb-6">
                  &ldquo;The team is incredibly professional and responsive. A seamless experience from start to finish.&rdquo;
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-olive-900">Sophie L.</h4>
                <span className="text-[10px] text-brand-olive-500 font-medium">Australia</span>
              </div>
            </div>

            <div className="lg:col-span-3 bg-brand-cream-100 text-brand-olive-900 rounded-2xl p-6 border border-brand-cream-300 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex text-brand-gold-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-brand-olive-600 leading-relaxed mb-6">
                  &ldquo;Best investment decision we&apos;ve made. High quality, high returns, and a brand we truly trust.&rdquo;
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-olive-900">Michael R.</h4>
                <span className="text-[10px] text-brand-olive-500 font-medium">Singapore</span>
              </div>
            </div>

            <div className="lg:col-span-3 bg-brand-olive-850 text-brand-cream-50 rounded-2xl p-6 border border-brand-olive-700 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 text-brand-olive-700/30 pointer-events-none p-4">
                <Leaf className="w-36 h-36 stroke-[0.3]" />
              </div>

              <div>
                <span className="font-serif text-5xl md:text-6xl font-bold text-brand-cream-50">
                  4.9
                </span>
                <h4 className="font-serif text-sm font-bold text-brand-cream-50 mt-1">
                  Average Rating
                </h4>
                <span className="text-[10px] text-brand-gold-400 block mt-0.5 font-medium">
                  Based on 120+ reviews
                </span>
              </div>

              <button
                onClick={() => window.open("https://google.com", "_blank")}
                className="w-full py-3 bg-brand-cream-100 hover:bg-brand-cream-200 text-brand-olive-900 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm z-10"
              >
                View All Reviews
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: AI CONCIERGE — LIGHT SECTION (FULL WIDTH) */}
      <section className="w-full py-24 bg-brand-cream-50 text-brand-olive-900 border-y border-brand-cream-300" id="ai-concierge-section">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-brand-olive-850 text-brand-cream-50 text-[9px] font-bold uppercase rounded-full tracking-wider">
                    Powered by AI
                  </span>
                  <span className="text-xs text-brand-olive-500 font-semibold uppercase tracking-wider">
                    Smart Matchmaker
                  </span>
                </div>

                <h3 className="font-serif text-3xl md:text-4xl font-bold text-brand-olive-900 uppercase tracking-tight leading-none mb-4">
                  Bespoke AI <br />
                  Concierge
                </h3>
                
                <p className="text-xs text-brand-olive-600 leading-relaxed mb-8">
                  Tell us your preferences and our AI Concierge will instantly match you with the perfect sustainable luxury properties.
                </p>

                <div className="flex flex-col gap-4 bg-brand-cream-200/60 p-5 rounded-2xl border border-brand-cream-300">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-brand-olive-500 font-bold">
                      Preferred Location
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={() => setChatPreferences({ ...chatPreferences, location: "Phuket" })}
                        className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                          chatPreferences.location === "Phuket"
                            ? "bg-brand-olive-850 text-brand-cream-50"
                            : "bg-white text-brand-olive-900 border border-brand-cream-300"
                        }`}
                      >
                        Phuket
                      </button>
                      <button
                        onClick={() => setChatPreferences({ ...chatPreferences, location: "Koh Samui" })}
                        className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                          chatPreferences.location === "Koh Samui"
                            ? "bg-brand-olive-850 text-brand-cream-50"
                            : "bg-white text-brand-olive-900 border border-brand-cream-300"
                        }`}
                      >
                        Koh Samui
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-brand-olive-500 font-bold">
                      Maximum Budget
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $2,500,000"
                      value={chatPreferences.budget}
                      onChange={(e) => setChatPreferences({ ...chatPreferences, budget: e.target.value })}
                      className="bg-white border border-brand-cream-300 rounded-lg px-3.5 py-2 text-xs text-brand-olive-900 placeholder-brand-olive-400 focus:outline-none focus:border-brand-olive-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 text-xs text-brand-olive-500">
                Our AI Concierge evaluates certified carbon and structural metrics in real-time.
              </div>
            </div>

            <div className="lg:col-span-7 bg-brand-olive-900 text-brand-cream-50 rounded-2xl border border-brand-olive-800 flex flex-col justify-between overflow-hidden shadow-md min-h-[420px]">
              <div className="px-5 py-3.5 bg-brand-olive-950 border-b border-brand-olive-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-serif text-xs font-bold text-brand-cream-50">
                    Pigma AI Concierge Active
                  </span>
                </div>
                <button
                  onClick={() => {
                    setChatMessages([
                      {
                        role: "assistant",
                        content: "Welcome to Pigma Estates. I am your AI Concierge. How may I assist your search for sustainable tropical luxury in Phuket or Koh Samui today?",
                      },
                    ]);
                  }}
                  className="text-[9px] uppercase tracking-wider text-brand-gold-400 hover:text-white font-bold underline"
                >
                  Reset Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left custom-scrollbar">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs shadow-sm ${
                        m.role === "user"
                          ? "bg-brand-cream-100 text-brand-olive-900 rounded-tr-none"
                          : "bg-brand-olive-850 text-brand-cream-50 border border-brand-olive-700 rounded-tl-none"
                      }`}
                    >
                      {m.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-1.5 text-[9px] uppercase tracking-widest text-brand-gold-400 font-bold border-b border-brand-olive-700 pb-1">
                          <Sparkle className="w-2.5 h-2.5 text-brand-gold-400" />
                          Senior AI Liaison
                        </div>
                      )}
                      <div>{renderMessageContent(m.content)}</div>
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-brand-olive-850 border border-brand-olive-700 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                      <span className="text-xs text-brand-cream-200/70 italic">Evaluating certified carbon metrics...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="p-3 bg-brand-olive-950 border-t border-brand-olive-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about freehold laws, rainwater loops, or request a Samui matching..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-brand-olive-900 border border-brand-olive-700 rounded-xl px-4 py-2.5 text-xs text-brand-cream-50 placeholder-brand-olive-400 focus:outline-none focus:border-brand-gold-400"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  className="p-2.5 bg-brand-cream-100 hover:bg-brand-cream-200 text-brand-olive-900 rounded-xl disabled:bg-brand-olive-800 transition-colors"
                  disabled={isChatLoading || !chatInput.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 11: REQUEST A QUOTE — DARK SECTION (FULL WIDTH) */}
      <section className="w-full py-24 bg-brand-olive-900 text-brand-cream-50 border-y border-brand-olive-800" id="contact-section">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-brand-cream-100 text-brand-olive-900 rounded-3xl p-8 md:p-12 border border-brand-cream-300 shadow-xl text-center">
            
            <span className="text-xs uppercase tracking-[0.2em] text-brand-olive-500 font-bold mb-2 block">
              Acquire Bespoke Property Documents
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-olive-900 uppercase tracking-tight mb-4">
              Request a Bespoke Quote
            </h2>
            <p className="text-xs text-brand-olive-600 max-w-lg mx-auto leading-relaxed mb-10">
              Please register your coordinates and preferences below. A designated senior partner of Pigma Luxury Estates will compile a detailed physical binder and contact you within 15 minutes.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
              {formErrors && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-xs text-red-700 font-medium">
                  {formErrors}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-brand-olive-500 font-bold">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-olive-400" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-white border border-brand-cream-300 rounded-xl pl-10 pr-4 py-3 text-xs text-brand-olive-900 placeholder-brand-olive-400 focus:outline-none focus:border-brand-olive-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-brand-olive-500 font-bold">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-olive-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. client@domain.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-white border border-brand-cream-300 rounded-xl pl-10 pr-4 py-3 text-xs text-brand-olive-900 placeholder-brand-olive-400 focus:outline-none focus:border-brand-olive-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-brand-olive-500 font-bold">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-olive-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +66 81 234 5678"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-white border border-brand-cream-300 rounded-xl pl-10 pr-4 py-3 text-xs text-brand-olive-900 placeholder-brand-olive-400 focus:outline-none focus:border-brand-olive-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-brand-olive-500 font-bold">Preference</label>
                  <select
                    value={formDealType}
                    onChange={(e) => setFormDealType(e.target.value)}
                    className="w-full bg-white border border-brand-cream-300 rounded-xl px-4 py-3 text-xs text-brand-olive-900 focus:outline-none focus:border-brand-olive-600"
                  >
                    <option value="Buy">Bespoke Buying / Freehold Acquisition</option>
                    <option value="Rent">Seasonal Rental Accommodation</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-brand-olive-500 font-bold">Property Type</label>
                  <select
                    value={formPropType}
                    onChange={(e) => setFormPropType(e.target.value)}
                    className="w-full bg-white border border-brand-cream-300 rounded-xl px-4 py-3 text-xs text-brand-olive-900 focus:outline-none focus:border-brand-olive-600"
                  >
                    <option value="Sustainable Villa">Sustainable Villa</option>
                    <option value="Estate">Cliffside Oceanfront Estate</option>
                    <option value="Sanctuary">Teakwood Sanctuary</option>
                    <option value="Residence">Atrium Residence</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-brand-olive-500 font-bold">Preferred Location Zone</label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-white border border-brand-cream-300 rounded-xl px-4 py-3 text-xs text-brand-olive-900 focus:outline-none focus:border-brand-olive-600"
                  >
                    <option value="Phuket">Phuket (Andaman Sea Zone)</option>
                    <option value="Koh Samui">Koh Samui (Gulf of Thailand Zone)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-brand-olive-500 font-bold">Target Budget Index</label>
                  <input
                    type="text"
                    placeholder="e.g. $2,000,000 - $3,500,000"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full bg-white border border-brand-cream-300 rounded-xl px-4 py-3 text-xs text-brand-olive-900 placeholder-brand-olive-400 focus:outline-none focus:border-brand-olive-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-brand-olive-500 font-bold">Bespoke Inquiries / Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your architectural, solar, or landscaping requirements..."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full bg-white border border-brand-cream-300 rounded-xl px-4 py-3 text-xs text-brand-olive-900 placeholder-brand-olive-400 focus:outline-none focus:border-brand-olive-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-olive-850 hover:bg-brand-olive-950 disabled:bg-brand-olive-400 text-brand-cream-50 font-semibold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-md relative"
                id="submit-enquiry-button"
              >
                {isSubmitting ? "Compiling secure booking reference..." : "Submit Request"}
              </button>
            </form>

            {savedInquiries.length > 0 && (
              <div className="mt-12 border-t border-brand-cream-300 pt-8 text-left">
                <h4 className="font-serif text-lg font-bold text-brand-olive-900 mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-brand-olive-700" />
                  Your Registered Bespoke Inquiries ({savedInquiries.length})
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {savedInquiries.map((inq) => (
                    <div key={inq.id} className="bg-white rounded-xl p-4 border border-brand-cream-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-brand-olive-900 font-bold bg-brand-cream-200 px-1.5 py-0.5 rounded">
                            {inq.id}
                          </span>
                          <span className="text-[10px] bg-brand-olive-850 text-brand-cream-50 px-2 py-0.5 rounded font-bold uppercase">
                            Partner Queue
                          </span>
                        </div>
                        <p className="text-brand-olive-700 mt-1.5">
                          Requested consultation for a <span className="font-bold text-brand-olive-900">{inq.propertyType}</span> in <span className="font-bold text-brand-olive-900">{inq.preferredLocation}</span> with target budget of <span className="font-semibold text-brand-olive-900">{inq.budget || "Unspecified"}</span>.
                        </p>
                      </div>
                      <div className="text-right text-[10px] text-brand-olive-500">
                        {new Date(inq.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* SECTION 12: FINAL CTA — LIGHT SECTION (FULL WIDTH) */}
      <section className="w-full py-24 bg-brand-cream-50 text-brand-olive-900 border-y border-brand-cream-300 relative overflow-hidden" id="final-cta-section">
        <div className="absolute -bottom-20 -right-20 text-brand-cream-300/40 pointer-events-none">
          <Leaf className="w-80 h-80 stroke-[0.3]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <span className="text-xs uppercase tracking-[0.25em] text-brand-olive-500 font-bold mb-3 block">
            Limited Opportunity
          </span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold uppercase tracking-tight text-brand-olive-900 mb-6">
            Your Sustainable <br />
            Legacy Awaits
          </h2>
          <p className="text-xs md:text-sm text-brand-olive-600 max-w-xl mx-auto leading-relaxed mb-10 font-medium">
            Let us help you own a piece of paradise, designed for generations to come. Secure a certified carbon-negative beachfront sanctuary.
          </p>

          <a
            href="#contact-section"
            className="inline-block px-8 py-4 bg-brand-olive-850 hover:bg-brand-olive-950 text-brand-cream-50 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-lg mb-16"
          >
            Schedule Private Consultation
          </a>

          <div className="grid grid-cols-3 gap-6 border-t border-brand-cream-300 pt-8 max-w-2xl mx-auto text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Shield className="w-5 h-5 text-brand-olive-700 mb-1" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-brand-olive-900">Confidential</span>
              <span className="text-[9px] text-brand-olive-500">Secure & Private</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Compass className="w-5 h-5 text-brand-olive-700 mb-1" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-brand-olive-900">Expert Advice</span>
              <span className="text-[9px] text-brand-olive-500">Local Knowledge</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Crown className="w-5 h-5 text-brand-olive-700 mb-1" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-brand-olive-900">VIP Service</span>
              <span className="text-[9px] text-brand-olive-500">Tailored for You</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13: FOOTER — DEEPEST DARK (FULL WIDTH) */}
      <footer className="w-full bg-brand-olive-950 text-brand-cream-200 py-16 border-t border-brand-olive-900 text-left">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 border-b border-brand-olive-900 pb-12 mb-12">
            
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-brand-gold-400" />
                <span className="font-serif text-xl font-bold tracking-wider text-brand-cream-50 uppercase">
                  Pigma
                </span>
              </div>
              <p className="text-xs text-brand-cream-200/70 leading-relaxed max-w-sm">
                Pigma Luxury Estates specializes in sustainable, high-end real estate in Phuket and Koh Samui.
              </p>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-sans text-xs font-bold text-brand-cream-50 uppercase tracking-widest mb-4">
                Quick Links
              </h4>
              <div className="flex flex-col gap-2.5 text-xs text-brand-cream-200/70">
                <a href="#" className="hover:text-white transition-colors">Home</a>
                <a href="#featured-section" className="hover:text-white transition-colors">Featured</a>
                <a href="#locations-section" className="hover:text-white transition-colors">Locations</a>
                <a href="#services-section" className="hover:text-white transition-colors">Services</a>
                <a href="#about-section" className="hover:text-white transition-colors">About Us</a>
                <a href="#contact-section" className="hover:text-white transition-colors">Contact Us</a>
              </div>
            </div>

            <div className="lg:col-span-3">
              <h4 className="font-sans text-xs font-bold text-brand-cream-50 uppercase tracking-widest mb-4">
                Locations
              </h4>
              <div className="flex flex-col gap-2 text-xs text-brand-cream-200/70">
                <span>Phuket (Andaman Sea Zone)</span>
                <span>Koh Samui (Gulf of Thailand)</span>
              </div>
            </div>

            <div className="lg:col-span-3">
              <h4 className="font-sans text-xs font-bold text-brand-cream-50 uppercase tracking-widest mb-4">
                Contact
              </h4>
              <div className="flex flex-col gap-2 text-xs text-brand-cream-200/70">
                <span>+66 81 234 5678</span>
                <span>hello@pigmaluxuryestates.com</span>
                <span>Bangtao Beach, Phuket Thailand</span>
              </div>
              
              <div className="flex items-center gap-3 mt-6">
                <a href="#" className="w-8 h-8 rounded-full bg-brand-olive-900 border border-brand-olive-800 flex items-center justify-center text-brand-cream-200 hover:text-white hover:border-brand-cream-100 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-brand-olive-900 border border-brand-olive-800 flex items-center justify-center text-brand-cream-200 hover:text-white hover:border-brand-cream-100 transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-brand-olive-900 border border-brand-olive-800 flex items-center justify-center text-brand-cream-200 hover:text-white hover:border-brand-cream-100 transition-all">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-brand-olive-900 border border-brand-olive-800 flex items-center justify-center text-brand-cream-200 hover:text-white hover:border-brand-cream-100 transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-brand-cream-200/60">
            <span>© 2026 Pigma Luxury Estates. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING MODAL & ACTIONS */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" id="detail-drawer">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-brand-cream-300 shadow-2xl text-left max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col"
            >
              <div className="flex justify-between items-start border-b border-brand-cream-200 pb-4 mb-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-brand-olive-500 font-bold">
                    {selectedProperty.city} Sanctuary Belt
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-brand-olive-900 mt-1">
                    {selectedProperty.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-1.5 text-brand-olive-500 hover:bg-brand-cream-100 rounded-full"
                  aria-label="Close details"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-6 bg-brand-cream-300 shadow-sm border border-brand-cream-200">
                <Image
                  src={selectedProperty.image}
                  alt={selectedProperty.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-brand-cream-50 p-4 rounded-2xl border border-brand-cream-300 mb-6 text-xs text-brand-olive-900 text-center">
                <div className="border-r border-brand-cream-200 sm:border-r">
                  <span className="text-brand-olive-500 block uppercase font-bold text-[9px] mb-0.5">Price</span>
                  <span className="font-bold text-brand-olive-900 text-sm font-serif">${selectedProperty.price.toLocaleString()}</span>
                </div>
                <div className="sm:border-r border-brand-cream-200">
                  <span className="text-brand-olive-500 block uppercase font-bold text-[9px] mb-0.5">Area Space</span>
                  <span className="font-bold text-brand-olive-900 text-sm">{selectedProperty.size} sqm</span>
                </div>
                <div className="border-r border-brand-cream-200">
                  <span className="text-brand-olive-500 block uppercase font-bold text-[9px] mb-0.5">Beds / Baths</span>
                  <span className="font-bold text-brand-olive-900 text-sm">{selectedProperty.beds} Beds • {selectedProperty.baths} Baths</span>
                </div>
                <div>
                  <span className="text-brand-olive-500 block uppercase font-bold text-[9px] mb-0.5">Eco Metric</span>
                  <span className="font-bold text-brand-olive-900 text-sm font-serif">+{selectedProperty.sustainabilityIndex}% Impact</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="font-serif text-lg font-bold text-brand-olive-900">Residency Overview</h4>
                <p className="text-xs text-brand-olive-600 leading-relaxed">
                  {selectedProperty.description} This estate stands as a flawless marriage between traditional Southeast Asian open-atrium space flow and highly complex German energy-engineering standards.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <h4 className="font-serif text-sm font-bold text-brand-olive-900 uppercase tracking-wider">Certified Sustainable Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProperty.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-brand-olive-800 bg-brand-cream-50 p-2.5 rounded-xl border border-brand-cream-300">
                      <CheckCircle2 className="w-4 h-4 text-brand-olive-600 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <button
                  onClick={() => handleQuickChatForProperty(selectedProperty.name)}
                  className="flex-1 py-3 bg-brand-cream-200 hover:bg-brand-cream-300 text-brand-olive-900 font-bold text-xs uppercase tracking-widest rounded-xl text-center"
                >
                  Consult AI about Site
                </button>
                <button
                  onClick={() => handlePrepopulateInquiry(selectedProperty)}
                  className="flex-1 py-3 bg-brand-olive-850 hover:bg-brand-olive-950 text-brand-cream-50 font-bold text-xs uppercase tracking-widest rounded-xl text-center shadow-md"
                >
                  Acquire Quotation Sheets
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PERSISTENT FLOATING PHONE ACTION */}
      <div className="fixed bottom-6 left-6 z-40">
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="tel:+66812345678"
          className="flex items-center justify-center w-12 h-12 bg-brand-olive-850 text-brand-cream-50 hover:bg-brand-olive-950 rounded-full shadow-xl border border-brand-olive-700"
          title="Phone Consultation"
        >
          <Phone className="w-5 h-5" />
        </motion.a>
      </div>

      {/* PERSISTENT FLOATING WHATSAPP ACTION */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://wa.me/66812345678"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 bg-green-600 text-white hover:bg-green-700 rounded-full shadow-xl border border-green-500"
          title="WhatsApp Inquiry"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.832 0c3.15 0 6.112 1.226 8.341 3.456 2.228 2.229 3.45 5.19 3.447 8.34-.006 6.515-5.33 11.84-11.835 11.84-1.996-.001-3.956-.508-5.7-1.472L0 24zm6.59-4.846c1.62.962 3.208 1.47 4.783 1.47 5.396 0 9.786-4.391 9.79-9.788.002-2.614-1.012-5.071-2.855-6.914C16.48 2.079 14.027 1.06 11.415 1.06c-5.396 0-9.786 4.39-9.79 9.787-.001 1.702.46 3.362 1.332 4.821l-.995 3.633 3.73-1.01L6.647 19.15z" />
          </svg>
        </motion.a>
      </div>

    </div>
  );
}
