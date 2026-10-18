import React, { useState, useEffect } from 'react';
import { Radio, Volume2, Sparkles, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { CosmicAlertEvent } from '../types';
import { cosmicSound } from '../lib/sound';

interface LiveAlertsSectionProps {
  onAskGeminiAboutEvent: (eventTitle: string, details: string) => void;
}

export const LiveAlertsSection: React.FC<LiveAlertsSectionProps> = ({
  onAskGeminiAboutEvent
}) => {
  const [alerts, setAlerts] = useState<CosmicAlertEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchLiveAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blackholes/live-events');
      const json = await res.json();
      if (json.success) {
        setAlerts(json.data);
        setLastUpdated(json.updatedAt);
      }
    } catch (err) {
      console.error('Erro ao buscar alertas LIGO/NASA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAlerts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white">
              Monitor de Alertas em Tempo Real (LIGO / Chandra / JWST)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rede contínua de detecção de ondas gravitacionais e erupções de raio-X em buracos negros.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              cosmicSound.playLigoChirp();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
          >
            <Volume2 className="h-4 w-4 text-emerald-400" />
            <span>Ouvir Som da Onda Gravitacional (LIGO Chirp)</span>
          </button>
        </div>
      </div>

      {/* Network Status Badge */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <div>
            <p className="text-xs font-bold text-emerald-200">
              REDE DE INTERFERÔMETROS & TELESCÓPIOS ESPACIAIS ONLINE
            </p>
            <p className="text-[11px] text-emerald-300/80">
              Sinais sincronizados entre LIGO Hanford, Virgo Itália e Observatório Chandra da NASA.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Última verificação: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString('pt-BR') : 'Agorinha'}
        </div>
      </div>

      {/* Alert Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-xl border border-slate-800 bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:border-slate-700 hover:shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-orange-300">
                      {alert.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {alert.timestamp}
                    </span>
                    <span className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                      {alert.physicsDetails.confidence}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alert.significance}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                    <div>
                      <span className="font-semibold text-slate-300">Fonte:</span> {alert.source}
                    </div>
                    {alert.physicsDetails.energyReleased && (
                      <div>
                        <span className="font-semibold text-amber-300">Energia Liberada:</span> {alert.physicsDetails.energyReleased}
                      </div>
                    )}
                    {alert.physicsDetails.distance && (
                      <div>
                        <span className="font-semibold text-slate-300">Distância:</span> {alert.physicsDetails.distance}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() =>
                      onAskGeminiAboutEvent(
                        alert.title,
                        `Categoria: ${alert.category} | Fonte: ${alert.source} | Significado: ${alert.significance} | Confiança: ${alert.physicsDetails.confidence}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-700"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Perguntar Física (Gemini)</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
