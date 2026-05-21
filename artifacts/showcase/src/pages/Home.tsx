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
      masterGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 6);
      masterGain.connect(ctx.destination);

      const droneFreqs = [55, 110, 164.81, 220];
      droneFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        osc.type = "sine";
        osc.frequency.value = freq + i * 0.1;
        filt.type = "lowpass";
        filt.frequency.value = 350;
        filt.Q.value = 0.6;
        g.gain.value = 0.2 / (i + 1);
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
        filt.frequency.value = 750;
        g.gain.value = 0.01;

        lfo.frequency.value = 0.06 + i * 0.04;
        lfoGain.gain.value = 0.006;
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
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden bg-black" data-testid="section-hero">
      <motion.div style={{ y }} className="absolute inset-0 w-full h-full">
        <img
          src={`${base}/IMG-20241118-WA0001.jpg`}
          alt="Melody"
          className="w-full h-full object-cover object-center"
          data-testid="img-hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90" />
      </motion.div>

      <motion.div
        style={{ opacity: nameOpacity }}
        className="absolute bottom-20 left-0 right-0 flex flex-col items-center z-10 px-6"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.4em" }}
          animate={{ opacity: 0.45, letterSpacing: "0.9em" }}
          transition={{ duration: 3, delay: 0.4, ease: "easeOut" }}
          className="text-white/45 text-[0.65rem] tracking-[0.9em] uppercase font-light mb-8"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 200 }}
        >
          a celebration of
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-white text-6xl md:text-8xl lg:text-[12rem] font-serif italic font-light text-center leading-none"
          style={{ textShadow: "0 0 150px rgba(0,0,0,0.95)" }}
          data-testid="text-name"
        >
          Melody
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.35 }}
          transition={{ duration: 3, delay: 2 }}
          className="h-px w-40 bg-white/40 mt-10 origin-center"
        />
      </motion.div>

      <motion.div
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 3.5, duration: 2.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="w-px h-14 bg-white/20"
        />
      </motion.div>
    </section>
  );
}

function QuoteSection({ text, sub, delay = 0 }: { text: string; sub?: string; delay?: number }) {
  return (
    <section className="relative min-h-[65vh] flex flex-col items-center justify-center px-6 md:px-8 py-28 bg-black" data-testid="section-quote">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 2.2, delay, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-4xl"
      >
        <p
          className="text-white/85 text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-serif italic leading-tight tracking-tight"
          data-testid="text-quote"
        >
          {text}
        </p>
        {sub && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.38 }}
            viewport={{ once: true }}
            transition={{ duration: 2.4, delay: delay + 0.8 }}
            className="text-white/38 text-xs md:text-sm tracking-[0.6em] uppercase mt-12 font-light"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 200 }}
          >
            {sub}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}

function FullScreenPhoto({ src, alt, height = "100vh", dim = 0.2 }: { src: string; alt: string; height?: string; dim?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-black"
      style={{ height }}
      data-testid="section-photo"
    >
      <motion.div style={{ y }} className="absolute inset-[-8%] w-[116%] h-[116%]">
        <img src={src} alt={alt} className="w-full h-full object-cover" data-testid={`img-${alt.toLowerCase().replace(/\s+/g, "-")}`} />
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${dim})` }} />
      </motion.div>
    </section>
  );
}

function PremiumGallery() {
  return (
    <section className="relative min-h-screen bg-black flex flex-col items-center justify-center px-6 py-32" data-testid="section-gallery">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-150px" }}
        transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-20"
      >
        <h2 className="text-white/88 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif italic font-light mb-6">
          Timeless Moments
        </h2>
        <div className="h-px w-20 bg-white/35 mx-auto" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-xl aspect-[3/4] group shadow-2xl"
        >
          <img
            src={`${base}/IMG-20241118-WA0001.jpg`}
            alt="Gallery 1"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-xl aspect-[3/4] group shadow-2xl"
        >
          <img
            src={`${base}/IMG-20241201-WA0007.jpg`}
            alt="Gallery 2"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-xl aspect-[3/4] group shadow-2xl md:col-span-2 md:w-1/2 md:mx-auto"
        >
          <img
            src={`${base}/IMG-20250101-WA0006.jpg`}
            alt="Gallery 3"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
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
        viewport={{ once: true, margin: "-180px" }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="flex flex-col items-center text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 2.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-white text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif italic font-light leading-tight"
          data-testid="text-happy-birthday"
        >
          Happy Birthday.
        </motion.p>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 0.25 }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, delay: 2 }}
          className="h-px w-28 bg-white my-14 origin-center"
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ duration: 3.2, delay: 2.8 }}
          className="text-white/50 text-base md:text-lg font-light tracking-[0.4em] uppercase"
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
        transition={{ duration: 3.5, delay: 4.5 }}
        className="absolute bottom-14 left-0 right-0 flex justify-center"
      >
        <p
          className="text-white/18 text-xs tracking-[0.7em] uppercase"
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

    setTimeout(() => setPhase("content"), 7800);
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
            transition={{ duration: 2.4, ease: "easeInOut" }}
            data-testid="screen-tap"
          >
            <motion.p
              animate={{ opacity: [0.12, 0.28, 0.12] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="text-white text-xs tracking-[0.7em] uppercase font-light"
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
            transition={{ duration: 2.4, ease: "easeInOut", delay: 0.5 }}
            data-testid="screen-intro"
          >
            <div className="text-center max-w-2xl">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2.6, delay: 0.8, ease: "easeInOut" }}
                className="text-white/82 text-2xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed"
              >
                There are people you meet…
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2.6, delay: 2.2, ease: "easeInOut" }}
                className="text-white/82 text-2xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed mt-3"
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
          transition={{ duration: 3, ease: "easeInOut" }}
        >
          <HeroSection />

          <QuoteSection text="You made ordinary moments feel rare." delay={0} />

          <FullScreenPhoto src={`${base}/IMG-20241118-WA0001.jpg`} alt="Portrait 1" height="85vh" dim={0.15} />

          <QuoteSection text="Some energy doesn't disappear." sub="it becomes part of things" delay={0.1} />

          <FullScreenPhoto src={`${base}/IMG-20241201-WA0007.jpg`} alt="Portrait 2" height="85vh" dim={0.15} />

          <QuoteSection text="You are the kind of person people talk about long after." delay={0.2} />

          <FullScreenPhoto src={`${base}/IMG-20250101-WA0006.jpg`} alt="Portrait 3" height="85vh" dim={0.15} />

          <QuoteSection text="26 looks exactly like you." sub="which means it looks good" delay={0.3} />

          <PremiumGallery />

          <FinalSection />
        </motion.div>
      )}
    </div>
  );
}
