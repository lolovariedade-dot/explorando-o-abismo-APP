import React, { useState, useEffect, useRef } from 'react';
import { Orbit, Sparkles, AlertTriangle, Cpu, Play, Volume2 } from 'lucide-react';
import { cosmicSound } from '../lib/sound';

interface EventHorizonSimulatorProps {
  onAskGeminiScenario: (scenarioType: string, massSolar: number, distanceRs: number, spin: number) => void;
}

export const EventHorizonSimulator: React.FC<EventHorizonSimulatorProps> = ({
  onAskGeminiScenario
}) => {
  // Preset Black Hole selector
  const [selectedPreset, setSelectedPreset] = useState<string>('sgra');
  const [massSolar, setMassSolar] = useState<number>(4300000); // 4.3 million (Sgr A*)
  const [spinParam, setSpinParam] = useState<number>(0.65); // 0 to 0.99
  const [probeDistanceRs, setProbeDistanceRs] = useState<number>(3.5); // Distance in Schwarzschild radii
  const [probeType, setProbeType] = useState<'sonda' | 'estrela' | 'planeta'>('sonda');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Apply presets
  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    if (preset === 'cygnus') {
      setMassSolar(21);
      setSpinParam(0.99);
      setProbeDistanceRs(2.2);
    } else if (preset === 'sgra') {
      setMassSolar(4300000);
      setSpinParam(0.65);
      setProbeDistanceRs(3.5);
    } else if (preset === 'm87') {
      setMassSolar(6500000000);
      setSpinParam(0.90);
      setProbeDistanceRs(4.0);
    } else if (preset === 'ton618') {
      setMassSolar(66000000000);
      setSpinParam(0.85);
      setProbeDistanceRs(5.0);
    }
  };

  // Physical calculations
  // R_s in kilometers: ~3 km per solar mass
  const schwarzschildRadiusKm = Math.round(massSolar * 2.95);

  // Time dilation factor gamma near R_s
  // gamma = 1 / sqrt(1 - R_s / R) for Schwarzschild approximation
  const calculateGamma = (r: number, a: number) => {
    // Modify slightly for spin effect near inner horizon
    const effectiveRs = 1 - 0.4 * a;
    if (r <= effectiveRs) return 999;
    const ratio = effectiveRs / r;
    const g = 1 / Math.sqrt(Math.max(0.001, 1 - ratio));
    return Math.min(g, 999);
  };

  const gamma = calculateGamma(probeDistanceRs, spinParam);

  // Orbital velocity around black hole (% of speed of light c)
  const orbitalSpeedPercent = Math.min(99.9, Math.round(Math.sqrt(1 / (2 * probeDistanceRs)) * 1000) / 10);

  // Spaghettification check
  // Tidal force scales as M / R^3. For stellar mass black holes, tidal forces at horizon are lethal.
  // For supermassive, horizon is gentle.
  const isSpaghettificationRisk = massSolar < 100000 && probeDistanceRs < 3.0;

  // Hawking temperature: T_H = 6e-8 / M_solar Kelvin
  const hawkingTempKelvin = (6e-8 / Math.max(1, massSolar)).toExponential(2);

  // Canvas rendering of Event Horizon, Accretion Disk & Gravitational Lensing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw starry background with subtle gravitational lensing curvature near center
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Draw background stars
      const numStars = 60;
      for (let i = 0; i < numStars; i++) {
        // pseudo deterministic star positions
        const sx = ((i * 137) % w);
        const sy = ((i * 281) % h);
        const distToCenter = Math.hypot(sx - cx, sy - cy);

        // Lensing warp position
        let renderX = sx;
        let renderY = sy;
        if (distToCenter < 140 && distToCenter > 30) {
          const warpFactor = 800 / (distToCenter + 10);
          const angle = Math.atan2(sy - cy, sx - cx);
          renderX += Math.cos(angle) * warpFactor;
          renderY += Math.sin(angle) * warpFactor;
        }

        ctx.fillStyle = i % 3 === 0 ? '#cbd5e1' : i % 3 === 1 ? '#93c5fd' : '#fde047';
        ctx.beginPath();
        ctx.arc(renderX, renderY, (i % 2) + 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Accretion Disk - Back/Top portion (behind horizon, lensed upwards by gravity)
      const baseRadius = 55 + spinParam * 12;
      const diskRadiusOuter = 160;
      const diskRadiusInner = baseRadius * 1.05;

      // Draw glowing lensed halo (Einstein ring glow)
      const haloGradient = ctx.createRadialGradient(cx, cy, baseRadius * 0.8, cx, cy, diskRadiusOuter * 1.2);
      haloGradient.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
      haloGradient.addColorStop(0.3, 'rgba(16, 185, 129, 0.45)');
      haloGradient.addColorStop(0.7, 'rgba(14, 116, 144, 0.15)');
      haloGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, diskRadiusOuter * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw Photon Ring (Anel de Fótons cinzelado)
      ctx.strokeStyle = 'rgba(167, 243, 208, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.02, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Accretion Disk ellipse with Doppler Boosting (brighter on left approaching side)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.18); // slight tilt
      ctx.scale(1, 0.38); // ellipse aspect

      for (let r = diskRadiusInner; r < diskRadiusOuter; r += 4) {
        const progress = (r - diskRadiusInner) / (diskRadiusOuter - diskRadiusInner);
        const alpha = Math.max(0, (1 - progress) * 0.7);

        // We create an angular gradient to simulate Doppler Beaming (approaching side is brighter cyan/emerald)
        const numSegments = 36;
        for (let s = 0; s < numSegments; s++) {
          const angleStart = (s / numSegments) * Math.PI * 2 + time * 0.8;
          const angleEnd = ((s + 1) / numSegments) * Math.PI * 2 + time * 0.8;
          const midAngle = (angleStart + angleEnd) / 2;

          // Doppler boost factor: left side (cos < 0) approaching us
          const doppler = 1 + Math.cos(midAngle) * 0.6;
          const red = Math.min(255, Math.floor((10 + progress * 20) * doppler));
          const green = Math.min(255, Math.floor((220 - progress * 70) * doppler));
          const blue = Math.min(255, Math.floor(255 * doppler));

          ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * doppler})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, r, angleStart, angleEnd);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 5. Event Horizon (Black Shadow at center)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle inner shadow stroke
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Draw Probe / Star in orbit at probeDistanceRs
      // Scale probeDistanceRs (1.0 to 15.0) to canvas radius
      const probeOrbitRadius = baseRadius * Math.min(3.2, Math.max(1.0, probeDistanceRs * 0.5));
      const probeAngle = time * (3 / Math.max(1, probeDistanceRs));
      const probeX = cx + Math.cos(probeAngle) * probeOrbitRadius;
      const probeY = cy + Math.sin(probeAngle) * probeOrbitRadius * 0.45;

      // Draw orbit path
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, probeOrbitRadius, probeOrbitRadius * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw probe icon / glow
      ctx.fillStyle = probeType === 'estrela' ? '#fde047' : probeType === 'planeta' ? '#38bdf8' : '#10b981';
      ctx.beginPath();
      ctx.arc(probeX, probeY, probeType === 'estrela' ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      // Glow around probe
      ctx.strokeStyle = probeType === 'estrela' ? 'rgba(253, 224, 71, 0.5)' : 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(probeX, probeY, 8, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [massSolar, spinParam, probeDistanceRs, probeType]);

  const handleSimulateWithAI = () => {
    const name = selectedPreset === 'cygnus' ? 'Cygnus X-1' :
                 selectedPreset === 'sgra' ? 'Sagittarius A* (Via Láctea)' :
                 selectedPreset === 'm87' ? 'Messier 87*' :
                 selectedPreset === 'ton618' ? 'TON 618' : 'Buraco Negro Customizado';
    onAskGeminiScenario(
      `Sonda explorando órbita de ${name} a ${probeDistanceRs} Raios de Schwarzschild (Massa = ${massSolar.toLocaleString('pt-BR')} M☉, Spin = ${spinParam})`,
      massSolar,
      probeDistanceRs,
      spinParam
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Orbit className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Simulador Interativo do Horizonte de Eventos
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore a Física Relativística de Einstein e Kerr em tempo real: dilatação temporal, Doppler e espaguetificação.
          </p>
        </div>

        {/* Black Hole Presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'cygnus', label: 'Cygnus X-1 (Estelar)' },
            { id: 'sgra', label: 'Sgr A* (Via Láctea)' },
            { id: 'm87', label: 'M87* (EHT)' },
            { id: 'ton618', label: 'TON 618 (Titã)' }
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                selectedPreset === preset.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Interactive Canvas Viewport */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2 shadow-inner">
            <canvas
              ref={canvasRef}
              width={520}
              height={380}
              className="max-w-full h-auto rounded-lg"
            />
            {/* Lensing overlay badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[10px] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Simulação Relativística: Disco de Acreção & Feixe Doppler</span>
            </div>
            {/* Audio warning button */}
            <button
              onClick={() => cosmicSound.playHorizonAlert()}
              className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:text-white"
            >
              <Volume2 className="h-3 w-3 text-cyan-400" />
              <span>Som do Horizonte</span>
            </button>
          </div>

          {/* Warning Banner if too close */}
          {isSpaghettificationRisk && (
            <div className="mt-3 w-full rounded-lg border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 animate-bounce" />
              <span>
                <strong>Alerta de Maré Gravitacional:</strong> Em {probeDistanceRs} $R_s$ num buraco negro estelar, a diferença da gravidade esticaria e destruiria a sonda por espaguetificação!
              </span>
            </div>
          )}
        </div>

        {/* Right: Physics Sliders & Calculated Relativistic Metrics */}
        <div className="lg:col-span-5 space-y-5">
          {/* Sliders */}
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">Massa do Buraco Negro ($M_\odot$)</span>
                <span className="text-cyan-400 font-mono">
                  {massSolar >= 1000000
                    ? `${(massSolar / 1000000).toLocaleString('pt-BR')} Milhões M☉`
                    : `${massSolar.toLocaleString('pt-BR')} M☉`}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100000000"
                step="1000"
                value={Math.min(massSolar, 100000000)}
                onChange={(e) => {
                  setMassSolar(Number(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">Rotação do Buraco Negro (Spin $a$)</span>
                <span className="text-cyan-400 font-mono">{spinParam.toFixed(2)} (Kerr)</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.99"
                step="0.01"
                value={spinParam}
                onChange={(e) => setSpinParam(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.0 (Schwarzschild Estático)</span>
                <span>0.99 (Velocidade Máxima)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">Distância da Sonda ($R$)</span>
                <span className="text-cyan-400 font-mono">{probeDistanceRs.toFixed(1)} $R_s$</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.1"
                value={probeDistanceRs}
                onChange={(e) => setProbeDistanceRs(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Real-time Calculated Physics Card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Raio de Schwarzschild
              </span>
              <p className="text-base font-bold font-mono text-white mt-1">
                {schwarzschildRadiusKm >= 1000000
                  ? `${(schwarzschildRadiusKm / 1000000).toFixed(1)}M km`
                  : `${schwarzschildRadiusKm.toLocaleString('pt-BR')} km`}
              </p>
              <span className="text-[10px] text-slate-500">
                Diâmetro do horizonte
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Dilatação do Tempo (Fator $\gamma$)
              </span>
              <p className="text-base font-bold font-mono text-cyan-400 mt-1">
                {gamma >= 999 ? '∞ (Congelado)' : `${gamma.toFixed(2)}x`}
              </p>
              <span className="text-[10px] text-slate-500">
                {gamma > 5 ? '1 hora = vários anos na Terra' : 'Desaceleração moderada'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Velocidade Orbital
              </span>
              <p className="text-base font-bold font-mono text-emerald-400 mt-1">
                {orbitalSpeedPercent}% de $c$
              </p>
              <span className="text-[10px] text-slate-500">
                {(orbitalSpeedPercent * 299792).toLocaleString('pt-BR')} km/s
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Temperatura de Hawking
              </span>
              <p className="text-sm font-bold font-mono text-cyan-300 mt-1">
                {hawkingTempKelvin} K
              </p>
              <span className="text-[10px] text-slate-500">
                Evaporação quântica
              </span>
            </div>
          </div>

          {/* AI Simulation Button */}
          <button
            onClick={handleSimulateWithAI}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-teal-600"
          >
            <Sparkles className="h-4 w-4" />
            <span>Simular este Cenário com o IA Astrofísico (Gemini)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
