import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function useAmbientAudio() {
  const startedRef = useRef(false);

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 5);
      masterGain.connect(ctx.destination);

      const droneFreqs = [55, 110, 164.81, 220];
      droneFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        osc.type = "sine";
        osc.frequency.value = freq + i * 0.15;
        filt.type = "lowpass";
        filt.frequency.value = 400;
        filt.Q.value = 0.8;
        g.gain.value = 0.25 / (i + 1);
        osc.connect(filt);
        filt.connect(g);
        g.connect(masterGain);
        osc.start();
      });

      const padFreqs = [329.63, 392, 523.25];
      padFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const filt = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.value = freq;
        filt.type = "lowpass";
        filt.frequency.value = 800;
        g.gain.value = 0.012;

        lfo.frequency.value = 0.08 + i * 0.05;
        lfoGain.gain.value = 0.008;
        lfo.connect(lfoGain);
        lfoGain.connect(g.gain);
        lfo.start();

        osc.connect(filt);
        filt.connect(g);
        g.connect(masterGain);
        osc.start();
      });
    } catch {
      // Audio unavailable — continue silently
    }
  };

  return { start };
}

function FilmGrain() {
  return <div className="film-grain" aria-hidden="true" />;
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden" data-testid="section-hero">
      <motion.div style={{ y }} className="absolute inset-0 w-full h-full">
        <img
          src={`${base}/2024092018415868-COLLAGE.jpg`}
          alt="Melody"
          className="w-full h-full object-cover object-center"
          data-testid="img-hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
      </motion.div>

      <motion.div
        style={{ opacity: nameOpacity }}
        className="absolute bottom-16 left-0 right-0 flex flex-col items-center z-10 px-6"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 0.4, letterSpacing: "0.8em" }}
          transition={{ duration: 2.8, delay: 0.3, ease: "easeOut" }}
          className="text-white/40 text-xs tracking-[0.8em] uppercase font-light mb-6"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 200 }}
        >
          celebrating
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-white text-7xl md:text-9xl lg:text-[11rem] font-serif italic font-light text-center leading-none"
          style={{ textShadow: "0 0 120px rgba(0,0,0,0.9)" }}
          data-testid="text-name"
        >
          Melody
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.3 }}
          transition={{ duration: 2.8, delay: 1.6 }}
          className="h-px w-32 bg-white/50 mt-8 origin-center"
        />
      </motion.div>

      <motion.div
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 3.2, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-px h-12 bg-white/25"
        />
      </motion.div>
    </section>
  );
}

function QuoteSection({ text, sub, bgColor = "bg-black" }: { text: string; sub?: string; bgColor?: string }) {
  return (
    <section className={`relative min-h-[60vh] flex flex-col items-center justify-center px-8 py-24 ${bgColor}`} data-testid="section-quote">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl"
      >
        <p
          className="text-white/80 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif italic leading-relaxed tracking-tight"
          data-testid="text-quote"
        >
          {text}
        </p>
        {sub && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            viewport={{ once: true }}
            transition={{ duration: 2.2, delay: 0.8 }}
            className="text-white/35 text-xs md:text-sm tracking-[0.5em] uppercase mt-10 font-light"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 200 }}
          >
            {sub}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}

function ParallaxPhoto({ src, alt, height = "100vh", dim = 0.25 }: { src: string; alt: string; height?: string; dim?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ height }}
      data-testid="section-photo"
    >
      <motion.div style={{ y }} className="absolute inset-[-10%] w-[120%] h-[120%]">
        <img src={src} alt={alt} className="w-full h-full object-cover" data-testid={`img-${alt.toLowerCase().replace(/\s+/g, "-")}`} />
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${dim})` }} />
      </motion.div>
    </section>
  );
}

function GallerySection() {
  return (
    <section className="relative min-h-screen bg-black flex flex-col items-center justify-center px-6 py-20" data-testid="section-gallery">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16"
      >
        <h2 className="text-white/90 text-3xl md:text-4xl lg:text-5xl font-serif italic font-light mb-4">
          Moments That Matter
        </h2>
        <div className="h-px w-16 bg-white/30 mx-auto" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.8, delay: 0.1 }}
          className="relative overflow-hidden rounded-lg aspect-[3/4] group"
        >
          <img
            src={`${base}/IMG-20241118-WA0001.jpg`}
            alt="Gallery 1"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.8, delay: 0.2 }}
          className="relative overflow-hidden rounded-lg aspect-[3/4] group"
        >
          <img
            src={`${base}/IMG-20241201-WA0007.jpg`}
            alt="Gallery 2"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.8, delay: 0.3 }}
          className="relative overflow-hidden rounded-lg aspect-[3/4] group md:col-span-2 md:w-1/2 md:mx-auto"
        >
          <img
            src={`${base}/IMG-20250101-WA0006.jpg`}
            alt="Gallery 3"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
      </div>
    </section>
  );
}

function FinalSection() {
  return (
    <section className="relative min-h-screen bg-black flex flex-col items-center justify-center px-8" data-testid="section-final">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-150px" }}
        transition={{ duration: 2.8, ease: "easeInOut" }}
        className="flex flex-col items-center text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-white text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif italic font-light leading-tight"
          data-testid="text-happy-birthday"
        >
          Happy Birthday.
        </motion.p>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, delay: 1.8 }}
          className="h-px w-24 bg-white my-12 origin-center"
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.45 }}
          viewport={{ once: true }}
          transition={{ duration: 3, delay: 2.4 }}
          className="text-white/45 text-base md:text-lg font-light tracking-[0.35em] uppercase"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 200 }}
          data-testid="text-closing"
        >
          Keep becoming who you are.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 3.2, delay: 4.2 }}
        className="absolute bottom-12 left-0 right-0 flex justify-center"
      >
        <p
          className="text-white/15 text-xs tracking-[0.6em] uppercase"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 200 }}
        >
          Melody · 26
        </p>
      </motion.div>
    </section>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<"tap" | "intro" | "content">("tap");
  const { start: startAudio } = useAmbientAudio();
  const hasInteracted = useRef(false);

  const handleInteraction = () => {
    if (hasInteracted.current) return;
    hasInteracted.current = true;
    startAudio();
    setPhase("intro");

    setTimeout(() => setPhase("content"), 7200);
  };

  useEffect(() => {
    const handler = () => handleInteraction();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="bg-black min-h-screen select-none"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      data-testid="page-home"
    >
      <FilmGrain />

      <AnimatePresence mode="wait">
        {phase === "tap" && (
          <motion.div
            key="tap-screen"
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            data-testid="screen-tap"
          >
            <motion.p
              animate={{ opacity: [0.15, 0.25, 0.15] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-white text-xs tracking-[0.6em] uppercase font-light"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 200 }}
            >
              tap anywhere
            </motion.p>
          </motion.div>
        )}

        {phase === "intro" && (
          <motion.div
            key="intro-screen"
            className="fixed inset-0 bg-black flex items-center justify-center z-50 px-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: "easeInOut", delay: 0.4 }}
            data-testid="screen-intro"
          >
            <div className="text-center max-w-2xl">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2.4, delay: 0.8, ease: "easeInOut" }}
                className="text-white/80 text-2xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed"
              >
                There are people you meet…
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2.4, delay: 2, ease: "easeInOut" }}
                className="text-white/80 text-2xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed mt-2"
              >
                and people you remember.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "content" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.8, ease: "easeInOut" }}
        >
          <HeroSection />

          <QuoteSection text="You made ordinary moments feel rare." />

          <ParallaxPhoto src={`${base}/IMG-20241118-WA0001.jpg`} alt="Portrait 1" height="80vh" dim={0.2} />

          <QuoteSection text="Some energy doesn't disappear." sub="it becomes part of things" />

          <ParallaxPhoto src={`${base}/IMG-20241201-WA0007.jpg`} alt="Portrait 2" height="80vh" dim={0.2} />

          <QuoteSection text="You are the kind of person people talk about long after." />

          <ParallaxPhoto src={`${base}/IMG-20250101-WA0006.jpg`} alt="Portrait 3" height="80vh" dim={0.2} />

          <QuoteSection text="26 looks exactly like you." sub="which means it looks good" />

          <GallerySection />

          <FinalSection />
        </motion.div>
      )}
    </div>
  );
}
