import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, RefreshCw, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { DailyCosmicEnigma } from '../types';

interface QuizSectionProps {
  currentEnigmaIndex: number;
  dailyEnigma: DailyCosmicEnigma | null;
  onSolved: (xpReward: number, title: string) => void;
  onNextEnigma: () => void;
  isSolvedToday: boolean;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  currentEnigmaIndex,
  dailyEnigma,
  onSolved,
  onNextEnigma,
  isSolvedToday
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  useEffect(() => {
    // Reset internal question selection state whenever a new enigma is loaded
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(false);
  }, [dailyEnigma?.dayId]);

  const handleSelectOption = (idx: number) => {
    if (submitted && isCorrect) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !dailyEnigma) return;
    const correct = selectedOption === dailyEnigma.correctOptionIndex;
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct && !isSolvedToday) {
      onSolved(dailyEnigma.xpReward, dailyEnigma.curiosityTitle);
    }
  };

  const handleResetForNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(false);
    onNextEnigma();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Quiz & Desafios Opcionais de Astrofísica
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Esta seção é dedicada exclusivamente a quem deseja testar seus conhecimentos teóricos sobre buracos negros e relatividade geral.
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Body Card */}
      {!dailyEnigma ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <p className="text-sm text-slate-400 animate-pulse">Carregando pergunta científica do arquivo...</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12 rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 sm:p-8 shadow-lg shadow-cyan-500/10">
          {/* Scientific Context & Curiosity Column */}
          <div className="lg:col-span-6 space-y-4 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 border border-slate-700">
                <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                Contexto Científico #{dailyEnigma.curiosityFactNumber}
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                +{dailyEnigma.xpReward} XP
              </span>
            </div>

            <h3 className="text-xl font-bold text-white leading-snug">
              {dailyEnigma.curiosityTitle}
            </h3>

            <p className="text-sm leading-relaxed text-slate-300">
              {dailyEnigma.curiosityBody}
            </p>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={handleResetForNext}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Carregar Outra Pergunta
              </button>
              <span className="text-xs text-slate-500">
                Arquivo EHT & Relatividade
              </span>
            </div>
          </div>

          {/* Question & Options Column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pergunta Teórica
              </span>
              {isSolvedToday && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Concluído
                </span>
              )}
            </div>

            <p className="text-base font-semibold text-white">
              {dailyEnigma.question}
            </p>

            <div className="space-y-2.5">
              {dailyEnigma.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === dailyEnigma.correctOptionIndex;

                let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-300';
                if (isSelected && !submitted) {
                  borderStyle = 'border-cyan-500 bg-cyan-500/10 text-white shadow-sm';
                } else if (submitted && isCorrectOption) {
                  borderStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-200';
                } else if (submitted && isSelected && !isCorrectOption) {
                  borderStyle = 'border-rose-500 bg-rose-500/10 text-rose-200';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={submitted && isCorrect}
                    className={`w-full text-left rounded-xl border p-3.5 text-sm font-medium transition-all flex items-center justify-between ${borderStyle}`}
                  >
                    <span>{opt}</span>
                    {submitted && isCorrectOption && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                    {submitted && isSelected && !isCorrectOption && (
                      <XCircle className="h-4 w-4 text-rose-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback / Submit button */}
            {!submitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-teal-600 disabled:opacity-40"
              >
                Verificar Resposta
              </button>
            ) : (
              <div
                className={`rounded-xl border p-4 text-sm ${
                  isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {isCorrect
                        ? 'Correto! Excelente raciocínio astrofísico.'
                        : 'Incorreto. Revise a explicação científica abaixo:'}
                    </p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {dailyEnigma.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
