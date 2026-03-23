import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
  const scrollToWaitlist = () => {
    const el = document.getElementById("waitlist");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Prodizzy" className="w-6 h-6 object-contain" />
          <span className="font-display font-bold text-lg tracking-tight">Prodizzy</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: 'smooth'})} className="hover:text-foreground transition-colors">Features</button>
          <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: 'smooth'})} className="hover:text-foreground transition-colors">How it Works</button>
        </nav>

        <Button 
          onClick={scrollToWaitlist}
          variant="secondary" 
          size="sm"
          className="font-medium bg-white/5 hover:bg-white/10 text-white border border-white/5"
        >
          Join Waitlist
        </Button>
      </div>
    </motion.header>
  );
}
