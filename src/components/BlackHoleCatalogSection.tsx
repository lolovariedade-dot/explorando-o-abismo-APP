import React, { useState, useEffect, useMemo } from 'react';
import { Award, Orbit, Sparkles, Search, Filter, ArrowUpDown, ExternalLink, X, Globe, Eye, ShieldCheck } from 'lucide-react';
import { BlackHolePhysicsRecord } from '../types';

const HAS_REAL_PHOTO_IDS = new Set([
  'm87-star',
  'sgra-star',
  'm87-eht-2019',
  'sgra-eht-2022',
  'ngc-6240-binary',
  'ngc-6240-cat',
  '3c-75-dual-black-holes',
  '3c-75-cat',
  'sdss-j0849-triple-collision',
  'sdss-j0849-cat',
  'ngc-7727-closest-binary',
  'ngc-7727-cat',
  'chandra-galactic-center-swarm',
  'chandra-center-cat',
  'pg-1302-102-ultrafast-binary',
  'pg-1302-cat',
  'palomar-5-cluster-holes',
  'palomar-5-cat',
  'centaurus-a-cat',
  'ngc-4889-cat'
]);

export function hasDirectPhoto(id: string): boolean {
  return HAS_REAL_PHOTO_IDS.has(id);
}

interface BlackHoleCatalogSectionProps {
  onSelectForSimulation: (id: string) => void;
  onAskGeminiAboutTitan: (titanName: string, details: string) => void;
}

export const BlackHoleCatalogSection: React.FC<BlackHoleCatalogSectionProps> = ({
  onSelectForSimulation,
  onAskGeminiAboutTitan
}) => {
  const [catalog, setCatalog] = useState<BlackHolePhysicsRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'massa' | 'distancia' | 'spin' | 'ano'>('massa');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<BlackHolePhysicsRecord | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blackholes/catalog');
      const json = await res.json();
      if (json.success) {
        setCatalog(json.data);
      }
    } catch (err) {
      console.error('Erro ao buscar catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const sgrAStar = useMemo(() => {
    return catalog.find(t => t.id === 'sgra-star') || null;
  }, [catalog]);

  const filteredAndSorted = useMemo(() => {
    return catalog
      .filter(item => {
        if (selectedType === 'Com Foto Real') {
          if (!hasDirectPhoto(item.id)) return false;
        } else if (selectedType === 'Sem Foto (Apenas Nome e Dados)') {
          if (hasDirectPhoto(item.id)) return false;
        } else if (selectedType !== 'Todos' && item.type !== selectedType) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            item.hostGalaxy.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'massa') return b.massSolar - a.massSolar;
        if (sortBy === 'distancia') return a.distanceLy - b.distanceLy;
        if (sortBy === 'spin') return b.spinParameter - a.spinParameter;
        if (sortBy === 'ano') return b.discoveryYear - a.discoveryYear;
        return 0;
      });
  }, [catalog, selectedType, searchQuery, sortBy]);

  const handleQuickJump = (id: string) => {
    const el = document.getElementById(`titan-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-amber-400');
      setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400'), 2000);
    } else {
      // Clear filters if hidden
      setSelectedType('Todos');
      setSearchQuery('');
      setTimeout(() => {
        const elRetry = document.getElementById(`titan-card-${id}`);
        if (elRetry) {
          elRetry.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  };

  const currentTitanPhotoIndex = selectedPhotoModal
    ? filteredAndSorted.findIndex((item) => item.id === selectedPhotoModal.id)
    : -1;

  const handlePrevTitanPhoto = () => {
    if (currentTitanPhotoIndex > 0) {
      setSelectedPhotoModal(filteredAndSorted[currentTitanPhotoIndex - 1]);
    } else if (filteredAndSorted.length > 0) {
      setSelectedPhotoModal(filteredAndSorted[filteredAndSorted.length - 1]);
    }
  };

  const handleNextTitanPhoto = () => {
    if (currentTitanPhotoIndex < filteredAndSorted.length - 1) {
      setSelectedPhotoModal(filteredAndSorted[currentTitanPhotoIndex + 1]);
    } else if (filteredAndSorted.length > 0) {
      setSelectedPhotoModal(filteredAndSorted[0]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Catálogo de Titãs: Os Buracos Negros Mais Extremos do Mundo & do Universo
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Fotos reais, nomes completos e explicações científicas detalhadas dos maiores monstros gravitacionais já descobertos.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (filteredAndSorted.length > 0) {
              setSelectedPhotoModal(filteredAndSorted[0]);
            }
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition-all"
        >
          <Eye className="h-4 w-4" />
          <span>★ Ver Todas as Fotos de Buracos Negros ({filteredAndSorted.length})</span>
        </button>
      </div>

      {/* Special Feature Banner: SAGITTARIUS A* (Sagitário A*) */}
      {sgrAStar && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-xs font-extrabold text-amber-300 shadow-sm">
              <Globe className="h-3.5 w-3.5" />
              Destaque Especial: Nosso Centro Galáctico
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-center">
            {/* Real EHT Photo of Sagittarius A* */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => setSelectedPhotoModal(sgrAStar)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-amber-500/30 bg-black aspect-video sm:aspect-4/3 shadow-xl"
              >
                <img
                  src={sgrAStar.imageUrl}
                  alt={sgrAStar.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-semibold bg-black/70 px-2.5 py-1 rounded-lg border border-slate-700">
                    Foto Real EHT • Sagitário A*
                  </span>
                  <span className="inline-flex items-center gap-1 bg-amber-500/80 px-2 py-1 rounded-lg text-black font-bold">
                    <Eye className="h-3.5 w-3.5" />
                    Ampliar
                  </span>
                </div>
              </div>
            </div>

            {/* Name, Explanation & Scientific Context */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  O Coração da Via Láctea • Sagitário A*
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {sgrAStar.name}
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Galáxia: {sgrAStar.hostGalaxy} • Distância: {sgrAStar.distanceLy.toLocaleString('pt-BR')} anos-luz
                </p>
              </div>

              <p className="text-sm leading-relaxed text-slate-200">
                {sgrAStar.description}
              </p>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-200">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Explicação & Curiosidade Relativística:</span>
                </div>
                <p className="italic text-slate-300">
                  "{sgrAStar.funFact}"
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onSelectForSimulation(sgrAStar.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                >
                  <Orbit className="h-4 w-4" />
                  Testar Sagitário A* no Simulador
                </button>
                <button
                  onClick={() =>
                    onAskGeminiAboutTitan(
                      sgrAStar.name,
                      `Tipo: ${sgrAStar.type} | Massa: ${sgrAStar.massSolar} M☉ | Distância: ${sgrAStar.distanceLy} AL | Spin: ${sgrAStar.spinParameter} | Descrição: ${sgrAStar.description}`
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition hover:bg-slate-800"
                >
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Perguntar ao IA sobre Sagitário A*
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rich Navigation Options Toolbar (Mais opções para a pessoa conseguir navegar) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Mais Opções para Navegar Pelos Buracos Negros
          </span>
          <span className="text-xs font-mono text-cyan-400">
            {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'titã catalogado' : 'titãs catalogados'}
          </span>
        </div>

        {/* Quick Jump Badges */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 mr-1">
            Salto Rápido:
          </span>
          {catalog.map((titan) => (
            <button
              key={titan.id}
              onClick={() => handleQuickJump(titan.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white transition-all"
            >
              <span>{titan.name.split('(')[0].trim()}</span>
            </button>
          ))}
        </div>

        {/* Search, Filter by Type and Sorting Controls */}
        <div className="grid gap-4 md:grid-cols-12 items-center">
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por buraco negro, galáxia..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs font-medium text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-1.5">
            {[
              'Todos',
              'Com Foto Real',
              'Sem Foto (Apenas Nome e Dados)',
              'Supermassivo',
              'Primordial / Extremo',
              'Intermediário',
              'Estelar'
            ].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedType === type
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Sort By Selector */}
          <div className="md:col-span-3 flex items-center justify-end gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="massa">Mais Massivos (Massa M☉)</option>
              <option value="distancia">Mais Próximos (Anos-luz)</option>
              <option value="spin">Maior Rotação (Spin)</option>
              <option value="ano">Ano de Descoberta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Cards Grid (Fotos + Nomes + Explicação Juntos) */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 rounded-3xl border border-slate-800 bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-3">
          <p className="text-base font-semibold text-white">Nenhum buraco negro encontrado com os filtros atuais.</p>
          <button
            onClick={() => {
              setSelectedType('Todos');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
          >
            Limpar Filtros e Exibir Todos
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredAndSorted.map((titan) => (
            <div
              key={titan.id}
              id={`titan-card-${titan.id}`}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5"
            >
              <div className="space-y-4">
                {/* PHOTO CONTAINER OR NO-PHOTO BANNER */}
                {hasDirectPhoto(titan.id) ? (
                  <div
                    onClick={() => setSelectedPhotoModal(titan)}
                    className="relative aspect-video w-full cursor-pointer overflow-hidden bg-black border-b border-slate-800"
                  >
                    <img
                      src={titan.imageUrl}
                      alt={titan.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/80 bg-black/80 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                        📸 FOTO REAL
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-black/70 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                        {titan.type} • {titan.discoveryYear}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold text-white truncate max-w-[70%]">
                        Galáxia: {titan.hostGalaxy}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition-colors">
                        <Eye className="h-3 w-3" />
                        Ver Foto
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video w-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center border-b border-slate-800">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-300">
                      <X className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      <span>Ninguém conseguiu tirar foto direta deste buraco negro</span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 max-w-[95%] leading-relaxed">
                      Sem foto direta disponível: apresentando apenas o Nome e os Dados Científicos abaixo (sem fotos repetidas de galáxia).
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-amber-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span>Tipo: {titan.type}</span>
                      <span>•</span>
                      <span>Descoberto em: {titan.discoveryYear}</span>
                    </div>
                  </div>
                )}

                {/* NAME AND EXPLANATION TOGETHER */}
                <div className="p-5 pt-1 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {titan.name}
                    </h3>
                    <span className="text-xs font-mono font-bold text-orange-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                      Spin: {titan.spinParameter}
                    </span>
                  </div>

                  {/* Scientific Explanation */}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {titan.description}
                  </p>

                  {/* Curiosity / Fun Fact Box */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Explicação & Curiosidade do Titã:</span>
                    </div>
                    <p className="text-slate-300 italic leading-relaxed">
                      "{titan.funFact}"
                    </p>
                  </div>

                  {/* Physical Specs Bar */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/60">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Massa Solar</span>
                      <span className="font-mono font-bold text-white">
                        {titan.massSolar >= 1000000000
                          ? `${(titan.massSolar / 1000000000).toLocaleString('pt-BR')} Bilhões M☉`
                          : titan.massSolar >= 1000000
                          ? `${(titan.massSolar / 1000000).toLocaleString('pt-BR')} Milhões M☉`
                          : `${titan.massSolar.toLocaleString('pt-BR')} M☉`}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/60">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Distância da Terra</span>
                      <span className="font-mono font-bold text-white">
                        {titan.distanceLy >= 1000000000
                          ? `${(titan.distanceLy / 1000000000).toLocaleString('pt-BR')} Bilhões anos-luz`
                          : `${titan.distanceLy.toLocaleString('pt-BR')} anos-luz`}
                      </span>
                    </div>
                  </div>

                  {titan.sourceName && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-950 border border-emerald-500/30 p-2.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-medium truncate max-w-[70%]">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate" title={titan.sourceCitation || titan.sourceName}>
                          Fonte: {titan.sourceName}
                        </span>
                      </div>
                      {titan.sourceUrl && (
                        <a
                          href={titan.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 underline shrink-0"
                        >
                          <span>Ver Oficial</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-800/60">
                <button
                  onClick={() => onSelectForSimulation(titan.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                >
                  <Orbit className="h-3.5 w-3.5 text-amber-400" />
                  <span>Testar no Simulador</span>
                </button>

                <button
                  onClick={() =>
                    onAskGeminiAboutTitan(
                      titan.name,
                      `Tipo: ${titan.type} | Massa: ${titan.massSolar} M☉ | Distância: ${titan.distanceLy} AL | Spin: ${titan.spinParameter} | Curiosidade: ${titan.funFact}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>IA Astrofísico</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL HIGH RESOLUTION PHOTO MODAL */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 p-4 gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
                  {selectedPhotoModal.type}
                </span>
                {currentTitanPhotoIndex >= 0 && (
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300">
                    Foto {currentTitanPhotoIndex + 1} de {filteredAndSorted.length}
                  </span>
                )}
                <h3 className="text-lg font-bold text-white">
                  {selectedPhotoModal.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handlePrevTitanPhoto}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                >
                  ← Anterior
                </button>
                <button
                  onClick={handleNextTitanPhoto}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                >
                  Próxima →
                </button>
                <button
                  onClick={() => setSelectedPhotoModal(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white ml-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-auto bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              {hasDirectPhoto(selectedPhotoModal.id) ? (
                <img
                  src={selectedPhotoModal.highResUrl || selectedPhotoModal.imageUrl}
                  alt={selectedPhotoModal.name}
                  referrerPolicy="no-referrer"
                  className="max-h-[65vh] w-auto rounded-xl object-contain shadow-2xl"
                />
              ) : (
                <div className="max-w-xl space-y-4 rounded-3xl border border-rose-500/30 bg-slate-900/90 p-8 shadow-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 border border-rose-500/40 px-4 py-1.5 text-xs font-bold text-rose-300">
                    <X className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>Sem Foto Direta do Buraco Negro</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    {selectedPhotoModal.name}
                  </h4>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    Ninguém conseguiu tirar foto direta deste buraco negro ainda. Por respeito ao rigor científico e para não apresentar fotos repetidas de galáxias, exibimos abaixo apenas os dados científicos, nome completo e referências oficiais verificadas.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 p-5 bg-slate-950/90 space-y-3 text-xs sm:text-sm">
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-amber-300 font-bold">Explicação Científica: </strong>
                {selectedPhotoModal.description}
              </p>
              <p className="text-slate-400 italic">
                <strong className="text-amber-400 font-bold">Curiosidade: </strong>
                {selectedPhotoModal.funFact}
              </p>

              {selectedPhotoModal.sourceName && (
                <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Fonte Científica Confiável (Oficial)</span>
                    </div>
                    {selectedPhotoModal.sourceUrl && (
                      <a
                        href={selectedPhotoModal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300 transition"
                      >
                        <span>Artigo / Mídia Oficial</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    {selectedPhotoModal.sourceName}
                  </p>
                  {selectedPhotoModal.sourceCitation && (
                    <p className="text-[11px] font-mono text-slate-400">
                      Citação / Referência: <span className="text-emerald-300">{selectedPhotoModal.sourceCitation}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

