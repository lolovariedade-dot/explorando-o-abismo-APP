import React, { useState, useEffect } from 'react';
import { Sparkles, Camera, Eye, ExternalLink, Filter, Info, ShieldCheck, Search, Globe, MapPin } from 'lucide-react';
import { NasaPhotoItem } from '../types';

export const NasaGallerySection: React.FC = () => {
  const [items, setItems] = useState<NasaPhotoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedModalItem, setSelectedModalItem] = useState<NasaPhotoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchGallery = async (category: string) => {
    setLoading(true);
    try {
      const [nasaRes, catalogRes] = await Promise.all([
        fetch(`/api/nasa/gallery?category=${category}`),
        fetch('/api/blackholes/catalog')
      ]);
      const nasaJson = await nasaRes.json();
      const catalogJson = await catalogRes.json();

      let combined: NasaPhotoItem[] = [];
      if (nasaJson.success && Array.isArray(nasaJson.data)) {
        combined = [...nasaJson.data];
      }
      if (catalogJson.success && Array.isArray(catalogJson.data)) {
        const existingIds = new Set(combined.map(item => item.id));
        const existingTitles = new Set(combined.map(item => item.title.toLowerCase()));
        catalogJson.data.forEach((t: any) => {
          const mappedId = `catalog-${t.id}`;
          if (!existingIds.has(t.id) && !existingIds.has(mappedId) && !existingTitles.has(t.name.toLowerCase())) {
            combined.push({
              id: mappedId,
              title: `${t.name} (${t.hostGalaxy})`,
              subtitle: t.type,
              date: `${t.discoveryYear}`,
              nasaId: `TITAN-${t.id.toUpperCase()}`,
              telescope: 'Simulação NASA',
              category: t.type === 'Supermassivo' ? 'supermassivo' : t.type === 'Estelar' ? 'estelar' : 'simulacao',
              imageUrl: t.imageUrl,
              highResUrl: t.highResUrl || t.imageUrl,
              description: `${t.description} • Fato curioso: ${t.funFact}`,
              scienceHighlights: [
                `Massa: ${t.massSolar.toLocaleString('pt-BR')} massas solares`,
                `Distância: ${t.distanceLy.toLocaleString('pt-BR')} anos-luz`,
                `Taxa de Acreção: ${t.accretionRate}`,
                t.funFact
              ],
              distanceLy: `${t.distanceLy.toLocaleString('pt-BR')} anos-luz`,
              massSolar: `${t.massSolar.toLocaleString('pt-BR')} M☉`,
              coordinates: t.hostGalaxy,
              countryOrigin: t.countryOrigin || '🇺🇸 EUA / Colaboração Global',
              observatoryLocation: t.observatoryLocation || 'EHT / NASA / ESO / JAXA',
              sourceName: t.sourceName || 'NASA/ESO/JAXA Aberta',
              sourceUrl: t.sourceUrl || 'https://science.nasa.gov',
              sourceCitation: t.sourceCitation || 'Repositório Global de Acesso Livre'
            });
          }
        });
      }
      setItems(combined);
    } catch (err) {
      console.error('Erro ao buscar galeria NASA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery(selectedCategory);
  }, [selectedCategory]);

  const categories = [
    { id: 'todos', label: 'Todos os Arquivos NASA & Titãs' },
    { id: 'supermassivo', label: 'Supermassivos (EHT/JWST)' },
    { id: 'estelar', label: 'Estelares (Chandra)' },
    { id: 'jato', label: 'Jatos Relativísticos' },
    { id: 'lente_gravitacional', label: 'Lentes Gravitacionais' },
    { id: 'simulacao', label: 'Simulações Supercomputador' }
  ];

  const filteredItems = items.filter(i => {
    // 1. First check category if not 'todos'
    if (selectedCategory !== 'todos' && i.category !== selectedCategory) {
      return false;
    }
    // 2. Check searchQuery
    if (!searchQuery || searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase().trim();

    // Country & Observatory Synonym expansion for "Aberta Global Ciência Sem Fronteiras"
    const isEUA = q === 'eua' || q === 'estados unidos' || q === 'usa';
    const isChile = q === 'chile' || q === 'alma' || q === 'eso';
    const isJapao = q === 'japão' || q === 'japao' || q === 'jaxa';
    const isEspanha = q === 'espanha' || q === 'iram' || q === 'spain';
    const isItalia = q === 'itália' || q === 'italia' || q === 'virgo' || q === 'ligo';
    const isAntartida = q === 'antártida' || q === 'antartida' || q === 'polo sul';
    const isGroenlandia = q === 'groenlândia' || q === 'groenlandia' || q === 'glt';

    const fullText = [
      i.title,
      i.description,
      i.subtitle,
      i.telescope,
      i.nasaId,
      i.category,
      i.countryOrigin || '',
      i.observatoryLocation || '',
      i.sourceName || '',
      i.sourceCitation || '',
      i.coordinates || ''
    ].join(' ').toLowerCase();

    if (isEUA) return fullText.includes('eua') || fullText.includes('estados unidos') || fullText.includes('nasa') || fullText.includes('chandra') || fullText.includes('spitzer') || fullText.includes('hubble') || fullText.includes('jwst') || fullText.includes('eht');
    if (isChile) return fullText.includes('chile') || fullText.includes('alma') || fullText.includes('vlt') || fullText.includes('eso') || fullText.includes('sagitário a*') || fullText.includes('m87');
    if (isJapao) return fullText.includes('japão') || fullText.includes('japao') || fullText.includes('jaxa') || fullText.includes('subaru') || fullText.includes('alma') || fullText.includes('sagitário a*');
    if (isEspanha) return fullText.includes('espanha') || fullText.includes('iram') || fullText.includes('m87') || fullText.includes('eht');
    if (isItalia) return fullText.includes('itália') || fullText.includes('italia') || fullText.includes('virgo') || fullText.includes('ligo') || fullText.includes('gw150914');
    if (isAntartida) return fullText.includes('antártida') || fullText.includes('antartida') || fullText.includes('polo sul') || fullText.includes('spt') || fullText.includes('eht');
    if (isGroenlandia) return fullText.includes('groenlândia') || fullText.includes('groenlandia') || fullText.includes('glt') || fullText.includes('eht') || fullText.includes('m87');

    return fullText.includes(q);
  });

  const currentModalIndex = selectedModalItem
    ? filteredItems.findIndex(i => i.id === selectedModalItem.id)
    : -1;

  const handlePrevPhoto = () => {
    if (currentModalIndex > 0) {
      setSelectedModalItem(filteredItems[currentModalIndex - 1]);
    } else if (filteredItems.length > 0) {
      setSelectedModalItem(filteredItems[filteredItems.length - 1]);
    }
  };

  const handleNextPhoto = () => {
    if (currentModalIndex < filteredItems.length - 1) {
      setSelectedModalItem(filteredItems[currentModalIndex + 1]);
    } else if (filteredItems.length > 0) {
      setSelectedModalItem(filteredItems[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">
              CENTRO DO ABISMO — Galeria Oficial NASA, EHT & Titãs de Buracos Negros
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Imagens oficiais de buracos negros, interferometria EHT, observatórios espaciais e catálogo de titãs.
          </p>
        </div>

        {/* Fullscreen Button & Search Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {filteredItems.length > 0 && (
            <button
              onClick={() => setSelectedModalItem(filteredItems[0])}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-600 hover:to-teal-600 transition-all hover:scale-105"
            >
              <Eye className="h-4 w-4" />
              <span>🔭 ABRIR TELA CHEIA ({filteredItems.length} FOTOS)</span>
            </button>
          )}

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome (EHT, M87, TON 618)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Banner de Acesso Público & Colaboração Internacional NASA */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-slate-950 p-4.5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400 border border-emerald-500/30">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Acesso Aberto Global • Ciência Sem Fronteiras
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                15+ Observatórios em Múltiplos Países
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Arquivos Confidenciais da NASA, EHT, ESO & Observatórios Mundiais — Visíveis para Todos
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              <strong>Todas as imagens observadas e geradas por este aplicativo são 100% públicas e acessíveis a todos os usuários.</strong> Aqui você explora imagens autênticas de buracos negros capturadas por colaborações científicas de <strong>todos os continentes e países</strong> (EUA, Chile/ALMA, Japão/JAXA, Espanha, Itália/Virgo, Antártida, Groenlândia, Europa/ESO e África do Sul).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 self-stretch md:self-auto justify-end">
          {[
            { label: '★ Todos os Países', q: '' },
            { label: '🇺🇸 EUA (NASA/Chandra)', q: 'EUA' },
            { label: '🇨🇱 Chile (ALMA/ESO/VLT)', q: 'Chile' },
            { label: '🇯🇵 Japão (JAXA)', q: 'Japão' },
            { label: '🇪🇸 Espanha (IRAM)', q: 'Espanha' },
            { label: '🇮🇹 Itália (LIGO/Virgo)', q: 'Itália' },
            { label: '❄️ Antártida (Polo Sul)', q: 'Antártida' },
            { label: '🇬🇱 Groenlândia (GLT)', q: 'Groenlândia' }
          ].map(country => {
            const isActive = (country.q === '' && searchQuery === '' && selectedCategory === 'todos') || (country.q !== '' && searchQuery.toLowerCase() === country.q.toLowerCase());
            return (
              <button
                key={country.label}
                onClick={() => {
                  setSelectedCategory('todos');
                  setSearchQuery(country.q);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {country.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Referência por Nome: Achar Imagem em seu Devido Lugar & Ver Todas */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/95 p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Referência por Nome — Achar Imagem em Seu Devido Lugar
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition-all"
            >
              <span>★ Ver Todas as Fotos de Buracos Negros ({items.length})</span>
            </button>
            <button
              onClick={() => {
                if (filteredItems.length > 0) {
                  setSelectedModalItem(filteredItems[0]);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-1.5 text-xs font-bold text-cyan-300 transition-all"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Modo Slideshow (Ver Todas)</span>
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Clique no nome abaixo para encontrar e posicionar sua imagem oficial no devido lugar:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { name: 'Sagitário A* (Centro Via Láctea)', query: 'Sagitário A*' },
            { name: 'Messier 87* (M87 - 1ª Foto EHT)', query: 'M87' },
            { name: 'TON 618 (66 Bilhões M☉)', query: 'TON 618' },
            { name: 'Phoenix A* (100 Bilhões M☉)', query: 'Phoenix' },
            { name: 'Cygnus X-1 (Primeiro Comprovado)', query: 'Cygnus' },
            { name: 'Chandra (Jatos de Raio-X)', query: 'Chandra' },
            { name: 'JWST GN-z11 (Amanhecer Cósmico)', query: 'GN-z11' },
            { name: 'Simulação NASA (Disco de Acreção)', query: 'Simulação' },
            { name: 'Holmberg 15A', query: 'Holmberg' },
            { name: 'OJ 287 (Sistema Binário)', query: 'OJ 287' },
            { name: 'GW150914 (Colisão LIGO)', query: 'GW150914' },
            { name: 'V404 Cygni (Erupção X)', query: 'V404' },
            { name: 'HLX-1 ESO (Intermediário)', query: 'HLX-1' }
          ].map((ref) => {
            const isSelected = searchQuery.toLowerCase() === ref.query.toLowerCase();
            return (
              <button
                key={ref.name}
                onClick={() => {
                  setSelectedCategory('todos');
                  setSearchQuery(ref.query);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm font-bold'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                }`}
              >
                {ref.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              if (cat.id !== 'todos') setSearchQuery('');
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedCategory === cat.id && !searchQuery
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}

        <button
          onClick={() => {
            setSelectedCategory('todos');
            setSearchQuery('Sagitário A*');
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 px-3.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-sm ml-auto"
        >
          <span>★ Ver Foto Oficial de Sagitário A* (EHT)</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <p className="text-sm text-slate-400">Nenhum arquivo NASA encontrado para esta busca.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 transition-all hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10"
            >
              {/* Image Banner */}
              <div
                className="relative h-56 w-full overflow-hidden bg-slate-950 cursor-pointer"
                onClick={() => setSelectedModalItem(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== item.highResUrl && item.highResUrl) {
                      target.src = item.highResUrl;
                    } else {
                      target.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80';
                    }
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                {/* Telescope badge & Country Origin */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-[10px] font-bold text-orange-300 backdrop-blur-sm">
                    <ShieldCheck className="h-3 w-3 text-orange-400" />
                    {item.telescope}
                  </span>
                  {item.countryOrigin && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/90 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-sm shadow">
                      <Globe className="h-3 w-3 text-emerald-400" />
                      {item.countryOrigin}
                    </span>
                  )}
                </div>

                {/* NASA ID tag */}
                <div className="absolute bottom-3 left-3">
                  <span className="rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                    NASA ID: {item.nasaId}
                  </span>
                </div>
              </div>

              {/* Text & Content */}
              <div className="flex flex-col justify-between p-4 flex-1">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {item.subtitle} • {item.date}
                  </p>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Metrics Footer */}
                <div className="mt-4 border-t border-slate-800/80 pt-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">
                      <span className="block font-semibold text-slate-300">Massa: {item.massSolar}</span>
                      <span>Distância: {item.distanceLy}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedModalItem(item)}
                        title="Ver Imagem em Tela Cheia & Detalhes"
                        className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.sourceName && (
                    <div className="flex items-center justify-between rounded-lg bg-slate-950/80 border border-emerald-500/30 px-2.5 py-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-medium truncate max-w-[70%]">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate" title={item.sourceCitation || item.sourceName}>
                          Fonte: {item.sourceName}
                        </span>
                      </div>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 underline shrink-0"
                          title="Abrir página científica oficial da missão"
                        >
                          <span>Ver Oficial</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal View */}
      {selectedModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
          onClick={() => setSelectedModalItem(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
                    ARQUIVO OFICIAL NASA • {selectedModalItem.telescope}
                  </span>
                  {currentModalIndex >= 0 && (
                    <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                      Foto {currentModalIndex + 1} de {filteredItems.length}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white sm:text-xl">
                  {selectedModalItem.title}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={handlePrevPhoto}
                  title="Foto Anterior"
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                >
                  ← Anterior
                </button>
                <button
                  onClick={handleNextPhoto}
                  title="Próxima Foto"
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                >
                  Próxima →
                </button>
                <button
                  onClick={() => setSelectedModalItem(null)}
                  className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-7">
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                  <img
                    src={selectedModalItem.highResUrl}
                    alt={selectedModalItem.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== selectedModalItem.imageUrl && selectedModalItem.imageUrl) {
                        target.src = selectedModalItem.imageUrl;
                      } else {
                        target.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80';
                      }
                    }}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              <div className="md:col-span-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Descrição Científica
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {selectedModalItem.description}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Massa Estimada:</span>
                    <span className="font-semibold text-white">{selectedModalItem.massSolar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distância da Terra:</span>
                    <span className="font-semibold text-white">{selectedModalItem.distanceLy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordenadas Céu:</span>
                    <span className="font-mono text-cyan-300">{selectedModalItem.coordinates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ID Arquivo NASA:</span>
                    <span className="font-mono text-slate-300">{selectedModalItem.nasaId}</span>
                  </div>
                  {selectedModalItem.countryOrigin && (
                    <div className="flex justify-between items-center border-t border-slate-800/60 pt-2">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-emerald-400" />
                        País / Colaboração:
                      </span>
                      <span className="font-semibold text-emerald-300 text-right">{selectedModalItem.countryOrigin}</span>
                    </div>
                  )}
                  {selectedModalItem.observatoryLocation && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        Observatório / Local:
                      </span>
                      <span className="font-semibold text-slate-200 text-right">{selectedModalItem.observatoryLocation}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Destaques da Pesquisa
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedModalItem.scienceHighlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fonte Científica Oficial & Confiável */}
                {selectedModalItem.sourceName && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>Fonte Científica Confiável (Oficial)</span>
                      </div>
                      {selectedModalItem.sourceUrl && (
                        <a
                          href={selectedModalItem.sourceUrl}
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
                      {selectedModalItem.sourceName}
                    </p>
                    {selectedModalItem.sourceCitation && (
                      <p className="text-[11px] font-mono text-slate-400">
                        Citação / Referência: <span className="text-emerald-300">{selectedModalItem.sourceCitation}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
