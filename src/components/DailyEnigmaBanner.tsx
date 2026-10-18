import React, { useState } from 'react';
import { Sparkles, HelpCircle, CheckCircle2, XCircle, Award, ArrowRight, RefreshCw } from 'lucide-react';
import { DailyCosmicEnigma } from '../types';

interface DailyEnigmaBannerProps {
  enigma: DailyCosmicEnigma;
  onSolved: (xpReward: number, title: string) => void;
  onNextEnigma: () => void;
  isSolvedToday: boolean;
}

export const DailyEnigmaBanner: React.FC<DailyEnigmaBannerProps> = ({
  enigma,
  onSolved,
  onNextEnigma,
  isSolvedToday
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const handleSelectOption = (idx: number) => {
    if (submitted && isCorrect) return; // already solved
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === enigma.correctOptionIndex;
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct && !isSolvedToday) {
      onSolved(enigma.xpReward, enigma.curiosityTitle);
    }
  };

  const handleResetForNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(false);
    onNextEnigma();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900/90 to-[#022c36]/40 p-4 sm:p-6 shadow-xl shadow-cyan-500/10">
      {/* Background glowing bioluminescent rings */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Daily NASA Curiosity & Hook */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              {enigma.dateStr}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              {enigma.curiosityFactNumber}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              +{enigma.xpReward} XP ASTROFÍSICA
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {enigma.curiosityTitle}
          </h2>

          <p className="text-sm leading-relaxed text-slate-300">
            {enigma.curiosityBody}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleResetForNext}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Outra Curiosidade & Enigma
            </button>
            <span className="text-xs text-slate-400 italic">
              "Novas perguntas geradas para aprofundar seu conhecimento a cada visita"
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Daily Cosmic Challenge */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Desafio Diário de Conhecimento
              </span>
            </div>
            {isSolvedToday && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Desafio Respondido e XP Conquistado!
              </span>
            )}
          </div>

          <p className="text-sm font-semibold text-white mb-4">
            {enigma.quizQuestion}
          </p>

          <div className="space-y-2 mb-4">
            {enigma.quizOptions.map((option, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800';

              if (isSelected && !submitted) {
                btnClass = 'border-cyan-500 bg-cyan-500/10 text-cyan-200 font-medium shadow-sm';
              } else if (submitted) {
                if (idx === enigma.correctOptionIndex) {
                  btnClass = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'border-red-500 bg-red-500/20 text-red-300';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-xs transition-all flex items-center justify-between ${btnClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-[10px] font-bold text-slate-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {submitted && idx === enigma.correctOptionIndex && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                  {submitted && isSelected && !isCorrect && idx !== enigma.correctOptionIndex && (
                    <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {!submitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className={`w-full rounded-lg px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedOption !== null
                  ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 text-white shadow-md shadow-cyan-500/20 hover:from-cyan-600 hover:to-teal-600'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Verificar Resposta Cósmica</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className={`rounded-lg p-3 text-xs border ${
              isCorrect
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-red-500/30 bg-red-500/10 text-red-200'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {isCorrect ? (
                  <>
                    <Award className="h-4 w-4 text-emerald-400" />
                    <span>Incrível! Resposta Exata! (+{enigma.xpReward} XP)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span>Quase lá! Veja a explicação da física:</span>
                  </>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {enigma.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
