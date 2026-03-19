"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { questions, formConfig, type Question } from "@/data/questions";
import Image from "next/image";

type Answers = Record<number, string | string[]>;

export default function FormSurvey() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [dir, setDir] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const justSelected = useRef(false);

  const total = questions.length;
  const progress = step < 0 ? 0 : ((step + 1) / total) * 100;
  const q: Question | null =
    step >= 0 && step < total ? questions[step] : null;

  const answered = useCallback(() => {
    if (!q) return false;
    if (q.type === "email") {
      const val = answers[q.id] as string;
      return !!val && val.includes("@");
    }
    const a = answers[q.id];
    if (!a) return false;
    return Array.isArray(a) ? a.length > 0 : a.length > 0;
  }, [q, answers]);

  const canGo = useCallback(() => {
    if (!q) return true;
    if (!q.required) return true;
    return answered();
  }, [q, answered]);

  const next = useCallback(() => {
    if (step < total - 1 && canGo()) {
      setDir(1);
      setStep((s) => s + 1);
    }
  }, [step, total, canGo]);

  const prev = useCallback(() => {
    if (step > -1) {
      setDir(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const select = useCallback(
    (qid: number, opt: string, type: Question["type"]) => {
      justSelected.current = true;
      setAnswers((p) => {
        if (type === "single" || type === "scale")
          return { ...p, [qid]: opt };
        const cur = (p[qid] as string[]) || [];
        return {
          ...p,
          [qid]: cur.includes(opt)
            ? cur.filter((o) => o !== opt)
            : [...cur, opt],
        };
      });
    },
    []
  );

  const submit = useCallback(async () => {
    if (!canGo()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Erro ao enviar");
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Erro ao enviar resposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }, [answers, canGo]);

  // Auto-advance on single/scale select (only when user just clicked)
  useEffect(() => {
    if (!q || submitted) return;
    if (!justSelected.current) return;
    if ((q.type === "single" || q.type === "scale") && answers[q.id]) {
      const t = setTimeout(() => {
        justSelected.current = false;
        if (step < total - 1) {
          setDir(1);
          setStep((s) => s + 1);
        }
      }, 400);
      return () => clearTimeout(t);
    }
  }, [answers, q, step, total, submitted]);

  // Focus email input
  useEffect(() => {
    if (q?.type === "email") {
      setTimeout(() => emailRef.current?.focus(), 300);
    }
  }, [q]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (submitted) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (step === -1) {
          setDir(1);
          setStep(0);
        } else if (canGo()) {
          step === total - 1 ? submit() : next();
        }
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (q && q.type !== "email" && e.key >= "1" && e.key <= "9") {
        const i = parseInt(e.key) - 1;
        if (i < q.options.length) select(q.id, q.options[i], q.type);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, canGo, next, prev, submit, q, select, submitted, total]);

  const slideVar = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="bg-atmosphere" />
      <div className="bg-grid" />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-5 md:px-8 h-14 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <Image
            src="/harpia-logo.svg"
            alt="Harpia"
            width={86}
            height={86}
            className="rounded-md"
          />
          <div className="w-px h-4 bg-[var(--border-subtle)]" />
          <span className="text-[10px] sm:text-[14px] text-[var(--text-tertiary)] font-medium tracking-wide lowercase">
            powered by
          </span>
          <Image
            src="/raposa_tipografia.svg"
            alt="Raposa"
            width={80}
            height={30}
            className="opacity-90"
          />
        </div>

        {step >= 0 && !submitted && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[12px] text-[var(--text-tertiary)] font-mono tabular-nums tracking-tight"
          >
            {step + 1}
            <span className="opacity-40"> / {total}</span>
          </motion.span>
        )}
      </header>

      {/* ── Progress ── */}
      {step >= 0 && !submitted && (
        <div className="relative z-10 h-[1.5px] bg-[var(--border-subtle)]">
          <motion.div
            className="h-full bg-[var(--accent)] progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      )}

      {/* ── Content ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-5 py-12 sm:py-16 md:py-0">
        <AnimatePresence mode="wait" custom={dir}>
          {/* ── Intro ── */}
          {step === -1 && !submitted && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-xl mx-auto text-center"
            >
              {/* Hero glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.04] blur-[100px] pointer-events-none" />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, ...spring }}
                className="mb-5 flex justify-center"
              >
                <Image
                  src="/harpia-logo.svg"
                  alt="Harpia"
                  width={280}
                  height={280}
                  className="rounded-2xl float"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]"
              >
                <span className="w-[5px] h-[5px] rounded-full bg-[var(--success)] pulse-dot" />
                <span className="text-[11px] text-[var(--text-secondary)] font-medium tracking-wide uppercase">
                  Pesquisa ativa
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2

, duration: 0.5 }}
                className="text-[26px] sm:text-[32px] md:text-[40px] lg:text-[48px] font-bold tracking-[-0.035em] leading-[1.08] mb-4 whitespace-pre-line"
              >
                {formConfig.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-[14px] sm:text-[15px] text-[var(--text-secondary)] leading-[1.6] max-w-md mx-auto mb-8 px-2 sm:px-0"
              >
                {formConfig.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-3"
              >
                <button
                  onClick={() => {
                    setDir(1);
                    setStep(0);
                  }}
                  className="btn-primary text-[15px] px-8 py-3"
                >
                  Começar pesquisa
                </button>
                <span className="text-[12px] text-[var(--text-tertiary)] flex items-center gap-1.5">
                  ou pressione <span className="kbd">Enter ↵</span>
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-10 flex flex-wrap items-center justify-center gap-5 text-[11px] text-[var(--text-tertiary)]"
              >
                <span className="flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  ~2 min
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Anônimo
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                  {total} perguntas
                </span>
              </motion.div>
            </motion.div>
          )}

          {/* ── Question ── */}
          {q && !submitted && (
            <motion.div
              key={`q-${q.id}`}
              custom={dir}
              variants={slideVar}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-xl mx-auto"
            >
              {/* Section + number */}
              <div className="flex items-center gap-3 mb-5">
                {q.section && (
                  <span className="section-chip">{q.section}</span>
                )}
                <span className="text-[12px] font-mono text-[var(--text-tertiary)] ml-auto tabular-nums">
                  {String(q.id).padStart(2, "0")}
                </span>
              </div>

              {/* Question */}
              <h2 className="text-[18px] sm:text-[22px] md:text-[26px] font-semibold tracking-[-0.025em] leading-[1.25] mb-2 text-[var(--text-primary)]">
                {q.text}
              </h2>

              {q.description && (
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-6">
                  {q.description}
                </p>
              )}
              {!q.description && <div className="mb-6" />}

              {/* ── Scale type ── */}
              {q.type === "scale" && (
                <div>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
                    {q.options.map((opt, i) => {
                      const sel = answers[q.id] === opt;
                      return (
                        <motion.button
                          key={opt}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.25 }}
                          onClick={() => select(q.id, opt, q.type)}
                          className={`scale-option ${sel ? "selected" : ""}`}
                        >
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                  {q.scaleLabels && (
                    <div className="flex justify-between mt-2.5 px-1">
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {q.scaleLabels.low}
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {q.scaleLabels.high}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Email type ── */}
              {q.type === "email" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <input
                    ref={emailRef}
                    type="email"
                    placeholder="seu@email.com"
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) =>
                      setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                    }
                    className="email-input"
                    autoComplete="email"
                  />
                </motion.div>
              )}

              {/* ── Single / Multiple ── */}
              {(q.type === "single" || q.type === "multiple") && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const sel =
                      q.type === "single"
                        ? answers[q.id] === opt
                        : ((answers[q.id] as string[]) || []).includes(opt);

                    return (
                      <motion.div
                        key={opt}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => select(q.id, opt, q.type)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              select(q.id, opt, q.type);
                            }
                          }}
                          className={`option-card flex items-center gap-3.5 group ${sel ? "selected" : ""}`}
                        >
                          {/* Radio / Checkbox */}
                          <div
                            className={`w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center border transition-all duration-150 ${
                              q.type === "single" ? "rounded-full" : "rounded-[4px]"
                            } ${
                              sel
                                ? "border-[var(--accent)] bg-[var(--accent)]"
                                : "border-[var(--border-default)] group-hover:border-[var(--text-tertiary)]"
                            }`}
                          >
                            {sel && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                width="10" height="10" viewBox="0 0 24 24"
                                fill="none" stroke="white" strokeWidth="3"
                                strokeLinecap="round" strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </motion.svg>
                            )}
                          </div>

                    <span className="text-[13px] sm:text-[14px] text-[var(--text-primary)] flex-1 leading-snug">
                            {opt}
                          </span>

                          <span className="kbd opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            {i + 1}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* ── Navigation ── */}
              <div className="flex items-center justify-between mt-8">
                <button onClick={prev} className="btn-ghost py-2 px-4">
                  <span className="flex items-center gap-1.5 text-[13px]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Voltar
                  </span>
                </button>

                {step === total - 1 ? (
                  <button
                    onClick={submit}
                    disabled={!canGo() || submitting}
                    className="btn-primary py-2.5 px-5"
                  >
                    <span className="flex items-center gap-2 text-[13px]">
                      {submitting ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full"
                          />
                          Enviando…
                        </>
                      ) : (
                        <>
                          Enviar
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={next}
                    disabled={!canGo()}
                    className="btn-primary py-2.5 px-5"
                  >
                    <span className="flex items-center gap-1.5 text-[13px]">
                      Próxima
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-4 flex justify-center">
                <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1.5">
                  <span className="kbd">↵</span> continuar
                  {q.type === "multiple" && (
                    <span className="ml-1 opacity-60">· múltipla escolha</span>
                  )}
                  {!q.required && (
                    <span className="ml-1 opacity-60">· opcional</span>
                  )}
                </span>
              </div>
            </motion.div>
          )}

          {/* ── Success ── */}
          {submitted && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-md mx-auto text-center"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[var(--success)] opacity-[0.04] blur-[80px] pointer-events-none" />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
                className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--success-muted)] border border-[rgba(69,212,131,0.15)]"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-[28px] font-bold tracking-[-0.03em] mb-3"
              >
                {formConfig.successTitle}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-[14px] text-[var(--text-secondary)] leading-relaxed"
              >
                {formConfig.successMessage}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <button
                  onClick={() => {
                    setStep(-1);
                    setAnswers({});
                    setSubmitted(false);
                  }}
                  className="btn-ghost"
                >
                  Responder novamente
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-3 px-4 sm:px-5 md:px-8 border-t border-[var(--border-subtle)]">
        <div className="flex flex-col items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <Image
              src="/harpia-logo.svg"
              alt="Harpia"
              width={60}
              height={60}
              className="rounded-sm"
            />
            <span className="text-[10px] sm:text-[11px] font-medium tracking-wide lowercase">
              powered by
            </span>
            <Image
              src="/raposa_tipografia.svg"
              alt="Raposa"
              width={60}
              height={17}
              className="opacity-70"
            />
          </div>
          {!submitted && step >= 0 && (
            <div className="hidden sm:flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="kbd">↑</span>
                <span className="kbd">↓</span>
                <span className="ml-0.5">navegar</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="kbd">1</span>–<span className="kbd">9</span>
                <span className="ml-0.5">selecionar</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="kbd">↵</span>
                <span className="ml-0.5">confirmar</span>
              </span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
