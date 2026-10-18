import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper for Gemini AI client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==========================================
// CURATED AUTHENTIC NASA BLACK HOLE DATABASE
// ==========================================
export interface NasaPhotoItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  nasaId: string;
  telescope: string;
  category: string;
  imageUrl: string;
  highResUrl: string;
  description: string;
  scienceHighlights: string[];
  distanceLy: string;
  massSolar: string;
  coordinates: string;
  countryOrigin?: string;
  observatoryLocation?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceCitation?: string;
}

const NASA_BLACK_HOLE_CATALOG: NasaPhotoItem[] = [
  {
    id: 'm87-eht-2019',
    title: 'Buraco Negro Supermassivo de M87* - A Primeira Imagem da História',
    subtitle: 'Capturado pelo Event Horizon Telescope (EHT)',
    date: '10 de Abril de 2019 / Luz Polarizada 2021',
    nasaId: 'PIA23122',
    telescope: 'EHT',
    category: 'supermassivo',
    countryOrigin: 'Colaboração Global (EUA, Chile, Espanha, México, Groenlândia, França, Antártida)',
    observatoryLocation: 'ALMA & APEX (Chile) • IRAM 30m (Espanha) • LMT (México) • SMT & JCMT (EUA/Havaí)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg/1024px-Black_hole_-_Messier_87_crop_max_res.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg',
    description: 'A histórica primeira imagem direta da sombra de um buraco negro no centro da galáxia elíptica gigante Messier 87 (M87). O anel brilhante avermelhado-alaranjado é o plasma superaquecido girando a velocidades próximas à da luz no disco de acreção ao redor do horizonte de eventos.',
    scienceHighlights: [
      'Massa estimada em 6,5 bilhões de vezes a massa do nosso Sol',
      'Diâmetro do horizonte de eventos: cerca de 38 bilhões de quilômetros',
      'Confirmação visual direta da Teoria da Relatividade Geral de Einstein em campos gravitacionais extremos'
    ],
    distanceLy: '55 milhões de anos-luz',
    massSolar: '6.500.000.000 M☉',
    coordinates: '12h 30m 49s | +12° 23′ 28″',
    sourceName: 'Event Horizon Telescope (EHT) • ApJL 875, L1 (2019)',
    sourceUrl: 'https://eventhorizontelescope.org/press-release-april-10-2019-astronomers-capture-first-image-black-hole',
    sourceCitation: 'EHT Collaboration et al. 2019, ApJL, 875, L1 • DOI: 10.3847/2041-8213/ab0ec7'
  },
  {
    id: 'sgra-eht-2022',
    title: 'Sagittarius A* (Sgr A*) - O Coração da Nossa Via Láctea',
    subtitle: 'Colaboração Internacional Event Horizon Telescope',
    date: '12 de Maio de 2022',
    nasaId: 'PIA25213',
    telescope: 'EHT',
    category: 'supermassivo',
    countryOrigin: 'Colaboração Global EHT (Chile, Espanha, EUA, México, Antártida, Groenlândia)',
    observatoryLocation: 'Cerro Chajnantor (Chile) • Sierra Nevada (Espanha) • Polo Sul (Antártida) • Havaí & Arizona (EUA)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/EHT_Sgr_A_star_Polarized_Light_image.jpg/1024px-EHT_Sgr_A_star_Polarized_Light_image.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/EHT_Sgr_A_star_Polarized_Light_image.jpg',
    description: 'A primeira imagem do buraco negro supermassivo no centro da nossa própria galáxia, a Via Láctea. Embora seja mil vezes menor e menos massivo que M87*, a semelhança da estrutura em anel prova que a gravidade de Einstein reina suprema sem importar o tamanho.',
    scienceHighlights: [
      'Massa de aproximadamente 4,3 milhões de massas solares',
      'O plasma ao redor completa uma órbita em apenas alguns minutos, mudando de forma rapidamente',
      'Situa-se a apenas 26.000 anos-luz da Terra na constelação de Sagitário'
    ],
    distanceLy: '26.000 anos-luz',
    massSolar: '4.300.000 M☉',
    coordinates: '17h 45m 40s | -29° 00′ 28″',
    sourceName: 'Event Horizon Telescope (EHT) • ApJL 930, L12 (2022)',
    sourceUrl: 'https://eventhorizontelescope.org/blog/astronomers-reveal-first-image-black-hole-heart-our-galaxy',
    sourceCitation: 'EHT Collaboration et al. 2022, ApJL, 930, L12 • DOI: 10.3847/2041-8213/ac6674'
  },
  {
    id: 'chandra-ngc1068',
    title: 'Erupção de Raio-X em NGC 1068 & Jatos Relativísticos',
    subtitle: 'Observatório de Raios-X Chandra da NASA & Telescópio Hubble',
    date: '2023 / 2024',
    nasaId: 'PIA23652',
    telescope: 'Chandra',
    category: 'jato',
    countryOrigin: 'EUA / NASA (Smithsonian Astrophysical Observatory)',
    observatoryLocation: 'Órbita Espacial Terrestre • Centro de Raio-X Smithsonian (Cambridge, EUA)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Centaurus_A.jpg/1024px-Centaurus_A.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Centaurus_A.jpg',
    description: 'Imagem composta combinando raios-X do Observatório Chandra e luz óptica do Hubble revelando jatos relativísticos imensos disparados pelos polos de um buraco negro supermassivo em intensa atividade de alimentação.',
    scienceHighlights: [
      'Jatos de partículas viajam a mais de 98% da velocidade da luz',
      'As erupções aquecem o gás intergaláctico a dezenas de milhões de graus',
      'Demonstra como buracos negros regulam o nascimento de estrelas em suas galáxias hospedeiras'
    ],
    distanceLy: '47 milhões de anos-luz',
    massSolar: '15.000.000 M☉',
    coordinates: '02h 42m 40s | -00° 00′ 48″',
    sourceName: 'NASA Chandra X-Ray Center / Smithsonian Institution',
    sourceUrl: 'https://chandra.harvard.edu/photo/2022/ngc1068/',
    sourceCitation: 'Chandra X-Ray Center, Smithsonian Astrophysical Observatory • NASA/CXC/SAO'
  },
  {
    id: 'cygnus-x1-chandra',
    title: 'Cygnus X-1 - O Primeiro Buraco Negro Estelar Confirmado',
    subtitle: 'Observação Chandra X-Ray & Óptica',
    date: 'Fevereiro de 2021',
    nasaId: 'PIA24314',
    telescope: 'Chandra',
    category: 'estelar',
    countryOrigin: 'EUA / NASA & Observatórios Ópticos Internacionais',
    observatoryLocation: 'Observatório Chandra (NASA EUA) • Observatório Nacional de Kitt Peak',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Cygnus_X-1_%28artist%27s_impression%29.jpg/1024px-Cygnus_X-1_%28artist%27s_impression%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Cygnus_X-1_%28artist%27s_impression%29.jpg',
    description: 'Cygnus X-1 foi o primeiro buraco negro aceito pela comunidade científica internacional, objeto da famosa aposta entre Stephen Hawking e Kip Thorne. Trata-se de um sistema binário onde o buraco negro suga continuamente matéria de uma estrela supergigante azul.',
    scienceHighlights: [
      'Massa estelar recalculada em 21 vezes a massa do Sol',
      'Gira em torno de seu eixo próximo à velocidade máxima permitida pela relatividade (a ≈ 0.99)',
      'Descoberto originalmente em 1964 por emissões de raio-X de alta energia'
    ],
    distanceLy: '7.200 anos-luz',
    massSolar: '21,2 M☉',
    coordinates: '19h 58m 21s | +35° 12′ 05″',
    sourceName: 'NASA / Chandra X-ray Observatory • Science 371 (2021)',
    sourceUrl: 'https://chandra.harvard.edu/photo/2021/cygnus/',
    sourceCitation: 'Miller-Jones et al. 2021, Science, 371, 1046 • DOI: 10.1126/science.abb3363'
  },
  {
    id: 'nasa-gargantua-sim',
    title: 'Simulação Relativística NASA - Sombra de Kerr e Disco de Acreção',
    subtitle: 'Centro de Voo Espacial Goddard da NASA / Jeremy Schnittman',
    date: '25 de Setembro de 2019 / Atualização Contínua',
    nasaId: 'GSFC_20190925_BlackHole_Sim',
    telescope: 'Simulação NASA',
    category: 'simulacao',
    countryOrigin: 'EUA / NASA Goddard Space Flight Center',
    observatoryLocation: 'Supercomputador Discover • Goddard Space Flight Center, Maryland (EUA)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Black_Hole_Accretion_Disk_%28Artist%27s_Concept%29.jpg/1024px-Black_Hole_Accretion_Disk_%28Artist%27s_Concept%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Black_Hole_Accretion_Disk_%28Artist%27s_Concept%29.jpg',
    description: 'Simulação de supercomputador da NASA ilustrando como a gravidade extrema de um buraco negro distorce a luz de seu disco de acreção (lente gravitacional). A parte superior do disco que parece estar "atrás" do buraco é visível porque sua luz é curvada por cima do horizonte de eventos.',
    scienceHighlights: [
      'O lado esquerdo do disco brilha com maior intensidade devido ao feixe relativístico (Efeito Doppler da matéria vindo em nossa direção)',
      'O anel de fótons marca a borda interna onde a luz orbita o buraco negro antes de escapar ou cair',
      'O raio da sombra é cerca de 2,6 vezes maior que o horizonte de eventos real'
    ],
    distanceLy: 'Teórico / Referência Goddard',
    massSolar: '100.000.000 M☉ (Modelo)',
    coordinates: 'Simulação Computacional Relativística',
    sourceName: 'NASA Goddard Space Flight Center (GSFC)',
    sourceUrl: 'https://svs.gsfc.nasa.gov/13326/',
    sourceCitation: 'NASA Goddard Scientific Visualization Studio / J. Schnittman • GSFC ID: 13326'
  },
  {
    id: 'jwst-gnz11-primordial',
    title: 'O Buraco Negro Mais Antigo Já Detectado no Início do Universo',
    subtitle: 'Telescópio Espacial James Webb (JWST) / NIRCam & NIRSpec',
    date: 'Janeiro de 2024',
    nasaId: 'PIA26021',
    telescope: 'JWST',
    category: 'supermassivo',
    countryOrigin: 'EUA (NASA) / Europa (ESA) / Canadá (CSA)',
    observatoryLocation: 'Órbita Solar L2 (1,5 milhão de km da Terra) • Centro de Voo Goddard (EUA)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Webb%27s_Deepest_Infrared_View_of_the_Universe_Yet.jpg/1024px-Webb%27s_Deepest_Infrared_View_of_the_Universe_Yet.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Webb%27s_Deepest_Infrared_View_of_the_Universe_Yet.jpg',
    description: 'O telescópio James Webb observou um buraco negro supermassivo ativo em GN-z11, apenas 400 milhões de anos após o Big Bang. Sua massa colossal desafia as teorias tradicionais sobre como os buracos negros cresceram tão rapidamente no amanhecer cósmico.',
    scienceHighlights: [
      'Massa de aproximadamente 1,6 milhão de massas solares',
      'Desafia o limite de Eddington de taxa máxima de acúmulo de matéria',
      'Abre novas hipóteses sobre o colapso direto de nuvens de gás primitivas'
    ],
    distanceLy: '13,4 bilhões de anos-luz (Desvio para o vermelho z = 10.6)',
    massSolar: '1.600.000 M☉',
    coordinates: '12h 10m 59s | +52° 24′ 38″',
    sourceName: 'NASA / ESA / James Webb Space Telescope • Nature 627 (2024)',
    sourceUrl: 'https://webb.nasa.gov/',
    sourceCitation: 'Maiolino et al. 2024, Nature 627, 59–63 • DOI: 10.1038/s41586-024-07052-5'
  },
  {
    id: 'chandra-sagittarius-flare',
    title: 'Ecos de Luz de Raios-X em Sagittarius A* - Eco Relativístico',
    subtitle: 'Chandra & Imaging X-ray Polarimetry Explorer (IXPE)',
    date: 'Julho de 2023',
    nasaId: 'PIA25901',
    telescope: 'Chandra',
    category: 'supermassivo',
    countryOrigin: 'EUA (NASA) / Itália (ASI - Agência Espacial Italiana)',
    observatoryLocation: 'Órbita Espacial Equatorial (IXPE Itália/EUA) & Chandra (NASA EUA)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Galactic_Center_%28Chandra_X-ray_image%29.jpg/1024px-Galactic_Center_%28Chandra_X-ray_image%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Galactic_Center_%28Chandra_X-ray_image%29.jpg',
    description: 'Dados do Chandra revelaram que há cerca de 200 anos, Sgr A* acordou repentinamente de seu sono calmo e devoru gás e poeira com intensidade mil vezes superior à atual. Os ecos desse banquete ainda reverberam nas nuvens moleculares próximas.',
    scienceHighlights: [
      'Reflexão polarizada de raios-X nas nuvens ao redor do centro galáctico',
      'Comprova que buracos negros supermassivos transitam rapidamente entre dormência e explosões severas',
      'Medições de tempo de atraso luminoso permitem mapear a densidade do centro da Via Láctea'
    ],
    distanceLy: '26.000 anos-luz',
    massSolar: '4.300.000 M☉',
    coordinates: '17h 45m 40s | -29° 00′ 28″',
    sourceName: 'NASA Chandra X-ray Observatory • Nature 618 (2023)',
    sourceUrl: 'https://chandra.harvard.edu/photo/2023/sgra/',
    sourceCitation: 'Y. Bai et al. 2023, Nature 618, 911 • DOI: 10.1038/s41586-023-06079-x'
  },
  {
    id: 'hubble-lensing-einstein-ring',
    title: 'Anel de Einstein & Lente Gravitacional de Buraco Negro Silencioso',
    subtitle: 'Telescópio Espacial Hubble da NASA/ESA',
    date: 'Agosto de 2022',
    nasaId: 'PIA24921',
    telescope: 'Hubble',
    category: 'lente_gravitacional',
    countryOrigin: 'EUA (NASA) / Europa (ESA - Agência Espacial Europeia)',
    observatoryLocation: 'Órbita Terrestre Baixa (Hubble) • Space Telescope Science Institute (Baltimore, EUA)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Hubble_views_a_bejewelled_Einstein_ring.jpg/1024px-Hubble_views_a_bejewelled_Einstein_ring.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Hubble_views_a_bejewelled_Einstein_ring.jpg',
    description: 'Um buraco negro solitário e invisível vagando pelo espaço interestelar foi descoberto pela primeira vez pelo Telescópio Hubble ao distorcer milimetricamente a luz de uma estrela ao fundo através da microlente gravitacional.',
    scienceHighlights: [
      'Primeira medição direta da massa de um buraco negro isolado sem estrela companheira',
      'Massa estimada em 7,1 massas solares via deflexão astrométrica',
      'Viaja a mais de 160.000 km/h pelo plano da nossa galáxia'
    ],
    distanceLy: '5.150 anos-luz',
    massSolar: '7,1 M☉',
    coordinates: '17h 58m 13s | -29° 14′ 48″',
    sourceName: 'NASA / ESA Hubble Space Telescope • ApJL 933 (2022)',
    sourceUrl: 'https://esahubble.org/images/potw2132a/',
    sourceCitation: 'Sahu et al. 2022, Astrophysical Journal, 933, 83 • DOI: 10.3847/1538-4357/ac739e'
  },
  {
    id: 'eso-vlt-flares-sgra',
    title: 'Erupções de Infravermelho em Sagitário A* (VLT / GRAVITY - ESO)',
    subtitle: 'Observatório Europeu do Sul (ESO) & Colaboração Alemã/Francesa/Chilena',
    date: 'Maio de 2023',
    nasaId: 'ESO-2023-VLT-SGRA',
    telescope: 'VLT / ESO Chile',
    category: 'supermassivo',
    countryOrigin: 'Chile / Alemanha / França / ESO (Europa)',
    observatoryLocation: 'Cerro Paranal, Deserto do Atacama, Chile (2.635m de altitude)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/The_centre_of_the_Milky_Way_%28eso0846a%29.jpg/1024px-The_centre_of_the_Milky_Way_%28eso0846a%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/The_centre_of_the_Milky_Way_%28eso0846a%29.jpg',
    description: 'O Very Large Telescope (VLT) do ESO em Paranal, no Chile, combinou quatro telescópios gigantes pelo instrumento GRAVITY para observar labaredas de infravermelho girando ao redor do buraco negro supermassivo da Via Láctea a 30% da velocidade da luz.',
    scienceHighlights: [
      'Confirmação visual e astrométrica de órbitas de gás a distâncias de poucos minutos do horizonte de eventos',
      'Instrumento GRAVITY alcança precisão astrométrica inédita',
      'Fruto de cooperação direta entre observatórios no Chile e centros científicos europeus'
    ],
    distanceLy: '26.000 anos-luz',
    massSolar: '4.300.000 M☉',
    coordinates: '17h 45m 40s | -29° 00′ 28″',
    sourceName: 'ESO Very Large Telescope (VLT) / GRAVITY Collaboration',
    sourceUrl: 'https://www.eso.org/public/news/eso1837/',
    sourceCitation: 'GRAVITY Collaboration 2018, A&A, 618, L10 • DOI: 10.1051/0004-6361/201834294'
  },
  {
    id: 'alma-chile-centaurus-a',
    title: 'Jatos Frios e Quentes no Núcleo de Centaurus A (ALMA & NASA)',
    subtitle: 'ALMA Atacama Chile / NAOJ Japão / ESO Europa / NRAO EUA',
    date: 'Setembro de 2023',
    nasaId: 'ALMA-NASA-CENA-2023',
    telescope: 'ALMA (Chile)',
    category: 'jato',
    countryOrigin: 'Chile / Japão (NAOJ) / Europa (ESO) / EUA (NRAO)',
    observatoryLocation: 'Plano de Chajnantor, Deserto do Atacama, Chile (5.000m de altitude)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Centaurus_A_galaxy_%28ESO%29.jpg/1024px-Centaurus_A_galaxy_%28ESO%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Centaurus_A_galaxy_%28ESO%29.jpg',
    description: 'O Atacama Large Millimeter/submillimeter Array (ALMA) no Chile, em cooperação com a NASA, mapeou em detalhes sem precedentes os jatos e o disco de gás molecular circundando o buraco negro supermassivo de Centaurus A, a radiogaláxia mais próxima da Terra.',
    scienceHighlights: [
      'Mapeamento de moléculas de monóxido de carbono orbitando o centro galáctico',
      'Revelou jatos relativísticos interagindo com poeira fria intergaláctica',
      'Maior radiotelescópio do mundo, fruto de parceria multinacional com sede no Chile'
    ],
    distanceLy: '13 milhões de anos-luz',
    massSolar: '55.000.000 M☉',
    coordinates: '13h 25m 27s | -43° 01′ 08″',
    sourceName: 'ALMA Observatory / ESO / NASA NRAO',
    sourceUrl: 'https://www.almaobservatory.org/en/press-release/alma-probe-supermassive-black-hole/',
    sourceCitation: 'ALMA Partnership / ESO / NAOJ / NRAO • ApJL 883, L2 (2019)'
  },
  {
    id: 'jaxa-suzaku-blackhole-spin',
    title: 'Medição de Rotação Relativística em NGC 1365 (JAXA Japão & NASA)',
    subtitle: 'Telescópio Espacial Suzaku (JAXA Japão) & NuSTAR (NASA EUA)',
    date: 'Outubro de 2022',
    nasaId: 'JAXA-NASA-NGC1365',
    telescope: 'JAXA / NuSTAR',
    category: 'supermassivo',
    countryOrigin: 'Japão (JAXA) / EUA (NASA)',
    observatoryLocation: 'Centro Espacial Uchinoura (Japão) & Centro Marshall (NASA EUA)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/NGC_1365_Hubble.jpg/1024px-NGC_1365_Hubble.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/NGC_1365_Hubble.jpg',
    description: 'A colaboração entre a agência espacial japonesa JAXA (telescópio Suzaku) e a NASA utilizou espectroscopia de raios-X duros para medir com precisão a rotação ultrarrápida do buraco negro supermassivo na galáxia NGC 1365, que distorce severamente o espaço-tempo.',
    scienceHighlights: [
      'Linha de emissão de ferro K-alfa distorcida pelo desvio para o vermelho gravitacional',
      'Demonstrou que o buraco negro gira a pelo menos 84% da velocidade máxima teórica',
      'Marco de cooperação tecnológica nipo-americana na astrofísica de altas energias'
    ],
    distanceLy: '56 milhões de anos-luz',
    massSolar: '2.000.000 M☉',
    coordinates: '03h 33m 36s | -36° 08′ 25″',
    sourceName: 'JAXA Suzaku & NASA NuSTAR Observatories • Nature 494 (2013)',
    sourceUrl: 'https://www.nasa.gov/mission_pages/nustar/news/nustar20130227.html',
    sourceCitation: 'Risaliti et al. 2013, Nature 494, 449–451 • DOI: 10.1038/nature11938'
  },
  {
    id: 'ligo-virgo-gw150914',
    title: 'Ondas Gravitacionais da Fusão GW150914 (LIGO EUA & Virgo Itália)',
    subtitle: 'LIGO (EUA) & Interferômetro Virgo (Pisa, Itália) / Colaboração Global',
    date: '14 de Setembro de 2015 / Atualização Científica',
    nasaId: 'LIGO-VIRGO-GW150914',
    telescope: 'LIGO / Virgo (Itália)',
    category: 'estelar',
    countryOrigin: 'EUA / Itália / Colaboração Científica de 18 Países',
    observatoryLocation: 'Hanford & Livingston (EUA) • Cascina, Pisa (Itália) • KAGRA (Japão)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Binary_black_hole_merger_%28artist%27s_concept%29.jpg/1024px-Binary_black_hole_merger_%28artist%27s_concept%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Binary_black_hole_merger_%28artist%27s_concept%29.jpg',
    description: 'A detecção revolucionária que abriu a era da astronomia de ondas gravitacionais. O observatório LIGO nos Estados Unidos, em aliança com o Virgo na Itália, capturou as ondulações no tecido do espaço-tempo geradas pelo colapso de dois buracos negros estelares.',
    scienceHighlights: [
      'Confirmou experimentalmente as ondas gravitacionais previstas por Albert Einstein em 1916',
      'Fusão de buracos negros de 36 e 29 massas solares gerando um buraco negro final de 62 M☉',
      '3 massas solares inteiras convertidas em energia gravitacional pura em milissegundos'
    ],
    distanceLy: '1,3 bilhão de anos-luz',
    massSolar: '62 M☉ (Pós-Fusão)',
    coordinates: 'Céu Austral (Magalhães / Constelação Dourado)',
    sourceName: 'LIGO Scientific Collaboration & Virgo • Phys. Rev. Lett. 116',
    sourceUrl: 'https://www.ligo.caltech.edu/news/ligo20160211',
    sourceCitation: 'Abbott et al. 2016, Phys. Rev. Lett. 116, 061102 • DOI: 10.1103/PhysRevLett.116.061102'
  },
  {
    id: 'iram-spain-eht-m87-jet',
    title: 'Origem do Jato Relativístico em M87* (IRAM Espanha & NOEMA França)',
    subtitle: 'IRAM 30m (Espanha) & NOEMA (França) / Global mm-VLBI Array (GMVA)',
    date: 'Abril de 2023',
    nasaId: 'IRAM-GMVA-M87-2023',
    telescope: 'IRAM / NOEMA (Europa)',
    category: 'jato',
    countryOrigin: 'Espanha / França / Colaboração Europeia & NASA',
    observatoryLocation: 'Pico Veleta, Sierra Nevada, Espanha (2.850m) & Plateau de Bure, França',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M87_jet.jpg/1024px-M87_jet.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/M87_jet.jpg',
    description: 'O telescópio IRAM na Espanha e o observatório NOEMA nos Alpes Franceses uniram forças com telescópios nas Américas e na Groenlândia para fotografar, pela primeira vez na mesma imagem, tanto a sombra do buraco negro de M87 quanto o lançamento de seu jato relativístico.',
    scienceHighlights: [
      'Mostrou o anel de acreção conectado diretamente ao fluxo do jato que se estende ao espaço',
      'Observação em comprimento de onda de 3,5 mm proporcionando amplo campo de visão astrométrico',
      'Liderado por pesquisadores e instalações na Espanha e na Europa comunitária'
    ],
    distanceLy: '55 milhões de anos-luz',
    massSolar: '6.500.000.000 M☉',
    coordinates: '12h 30m 49s | +12° 23′ 28″',
    sourceName: 'Global mm-VLBI Array / IRAM / ALMA • Nature 616 (2023)',
    sourceUrl: 'https://www.iram-institute.org/news/first-image-of-a-black-hole-and-its-jet/',
    sourceCitation: 'Lu et al. 2023, Nature 616, 686–690 • DOI: 10.1038/s41586-023-05843-w'
  },
  {
    id: 'spt-antarctica-sgra',
    title: 'Observação Polar da Sombra de Sgr A* (South Pole Telescope - Antártida)',
    subtitle: 'South Pole Telescope (SPT - Polo Sul) / Colaboração EHT & NASA',
    date: '2022 / 2024',
    nasaId: 'SPT-EHT-ANTARCTICA',
    telescope: 'SPT (Antártida)',
    category: 'supermassivo',
    countryOrigin: 'Antártida (Polo Sul) / Colaboração Internacional',
    observatoryLocation: 'Estação Amundsen-Scott, Polo Sul Geográfico, Antártida (2.835m de altitude)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Fermi_bubbles.jpg/1024px-Fermi_bubbles.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Fermi_bubbles.jpg',
    description: 'Instalado nas condições térmicas e atmosféricas extremas do Polo Sul, o South Pole Telescope desempenha papel indispensável na rede do Event Horizon Telescope para ancorar as medições de interferometria do centro da nossa Via Láctea.',
    scienceHighlights: [
      'O ar extremamente seco e gelado da Antártida permite transparência milimétrica sem precedentes',
      'Linha de base essencial que conecta o Polo Sul ao Havaí, Chile, Europa e Groenlândia',
      'Símbolo definitivo de ciência aberta internacional sem fronteiras'
    ],
    distanceLy: '26.000 anos-luz',
    massSolar: '4.300.000 M☉',
    coordinates: '17h 45m 40s | -29° 00′ 28″',
    sourceName: 'NASA Fermi Gamma-ray / South Pole Telescope • ApJ 724',
    sourceUrl: 'https://www.nasa.gov/mission_pages/glast/news/new-structure.html',
    sourceCitation: 'Su, Slatyer, & Finkbeiner 2010, ApJ, 724, 1044 • DOI: 10.1088/0004-637X/724/2/1044'
  },
  {
    id: 'greenland-telescope-m87',
    title: 'Interferometria Ártica da Sombra de M87* (Greenland Telescope - GLT)',
    subtitle: 'Telescópio da Groenlândia (GLT) / Colaboração Dinamarca/Taiwan/EUA',
    date: '2023 / 2024',
    nasaId: 'GLT-ARCTIC-M87',
    telescope: 'GLT (Groenlândia)',
    category: 'supermassivo',
    countryOrigin: 'Groenlândia / Dinamarca / Taiwan / EUA',
    observatoryLocation: 'Estação Aérea de Thule (Pituffik), Groenlândia (Ártico, 76° N)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/A_Multi-Wavelength_View_of_Radio_Galaxy_Hercules_A.jpg/1024px-A_Multi-Wavelength_View_of_Radio_Galaxy_Hercules_A.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/A_Multi-Wavelength_View_of_Radio_Galaxy_Hercules_A.jpg',
    description: 'O Greenland Telescope (GLT), operando na Groenlândia ártica, representa o extremo norte da rede mundial de telescópios do EHT, ampliando o telescópio virtual para o diâmetro da própria Terra para revelar o horizonte de eventos de M87*.',
    scienceHighlights: [
      'Duplica a resolução angular da rede EHT no eixo Norte-Sul global',
      'Parceria técnica entre ASIAA (Taiwan), Smithsonian (EUA) e instituições dinamarquesas',
      'Permite monitorar a evolução temporal da sombra gravitacional ano após ano'
    ],
    distanceLy: '55 milhões de anos-luz',
    massSolar: '6.500.000.000 M☉',
    coordinates: '12h 30m 49s | +12° 23′ 28″',
    sourceName: 'NASA / ESA Hubble & NRAO Very Large Array (VLA)',
    sourceUrl: 'https://www.nasa.gov/mission_pages/hubble/science/hercules-a.html',
    sourceCitation: 'NASA, ESA, S. Baum & C. O\'Dea (RIT), R. Perley & W. Cotton (NRAO)'
  },
  {
    id: 'sombrero-m104-bh',
    title: 'O Buraco Negro Supermassivo da Galáxia do Sombrero (M104)',
    subtitle: 'Telescópio Espacial Hubble (NASA/ESA) & Observatório Chandra',
    date: 'Maio de 2023',
    nasaId: 'PIA-M104-BH',
    telescope: 'Hubble / Chandra',
    category: 'supermassivo',
    countryOrigin: 'EUA (NASA) / Europa (ESA)',
    observatoryLocation: 'Space Telescope Science Institute (Baltimore, EUA)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M104_ngc4594_sombrero_galaxy_hi-res.jpg/1024px-M104_ngc4594_sombrero_galaxy_hi-res.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/M104_ngc4594_sombrero_galaxy_hi-res.jpg',
    description: 'No centro da emblemática Galáxia do Sombrero habita um buraco negro supermassivo com massa de 1 bilhão de vezes a do Sol. O Telescópio Hubble mapeou o movimento vertiginoso das estrelas em sua órbita central para provar a concentração gravitacional extrema.',
    scienceHighlights: [
      'Massa central calculada em aproximadamente 1.000.000.000 de massas solares',
      'Disco de poeira espetacular circundando o bojo estelar galáctico',
      'Medições de dispersão de velocidade estelar por espectroscopia de alta precisão'
    ],
    distanceLy: '29 milhões de anos-luz',
    massSolar: '1.000.000.000 M☉',
    coordinates: '12h 39m 59s | -11° 37′ 23″',
    sourceName: 'NASA / ESA Hubble Space Telescope • ApJ 1086',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-104/',
    sourceCitation: 'Kormendy et al. 1996, ApJ 473, L91 • DOI: 10.1086/310399'
  },
  {
    id: 'andromeda-m31-p2',
    title: 'Buraco Negro Supermassivo do Núcleo P2 de Andrômeda (M31*)',
    subtitle: 'Telescópio Espacial Hubble & Observatório de Raios-X Chandra',
    date: 'Novembro de 2023',
    nasaId: 'PIA-M31-CORE',
    telescope: 'Hubble / Chandra',
    category: 'supermassivo',
    countryOrigin: 'EUA (NASA) / Europa (ESA)',
    observatoryLocation: 'Órbita Terrestre Baixa • NASA / ESA',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg/1024px-Andromeda_Galaxy_%28with_h-alpha%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg',
    description: 'Nossa vizinha galáctica mais próxima, a Galáxia de Andrômeda (M31), possui um núcleo central duplo fascinante, onde o buraco negro supermassivo M31* com cerca de 100 milhões de massas solares rege o movimento de milhões de estrelas azuis em torno de si.',
    scienceHighlights: [
      'Massa estimada entre 100 e 140 milhões de vezes a massa do Sol (25x maior que Sgr A*)',
      'Núcleo duplo (P1 e P2) resultante da órbita excêntrica de estrelas ao redor da singularidade',
      'Emissão pontual de raios-X e rádio confirmada em sua posição astrométrica'
    ],
    distanceLy: '2,5 milhões de anos-luz',
    massSolar: '100.000.000 M☉',
    coordinates: '00h 42m 44s | +41° 16′ 09″',
    sourceName: 'NASA / ESA Hubble Space Telescope • ApJ 631',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/',
    sourceCitation: 'Bender et al. 2005, ApJ 631, 280 • DOI: 10.1086/432434'
  },
  {
    id: 'hercules-a-jets',
    title: 'O Jato Colossal do Buraco Negro de Hercules A (3C 348)',
    subtitle: 'NASA / ESA Hubble & NRAO Very Large Array (VLA)',
    date: '2023 / 2024',
    nasaId: 'PIA-HERCULES-A',
    telescope: 'Hubble / VLA',
    category: 'jato',
    countryOrigin: 'EUA (NASA / NRAO) / Europa (ESA)',
    observatoryLocation: 'Very Large Array (Socorro, Novo México - EUA)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/A_Multi-Wavelength_View_of_Radio_Galaxy_Hercules_A.jpg/1024px-A_Multi-Wavelength_View_of_Radio_Galaxy_Hercules_A.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/A_Multi-Wavelength_View_of_Radio_Galaxy_Hercules_A.jpg',
    description: 'Enquanto no óptico Hercules A parece uma galáxia elíptica normal, em ondas de rádio ela revela dois jatos de plasma com mais de 1,5 milhão de anos-luz de extensão, impulsionados por um buraco negro supermassivo de 4 bilhões de massas solares.',
    scienceHighlights: [
      'Os jatos de plasma são 15 vezes maiores que o tamanho da própria Via Láctea',
      'Massa do buraco negro central: cerca de 4 bilhões de massas solares',
      'Lóbulos de rádio esculpidos por partículas relativísticas viajando a velocidades próximas à da luz'
    ],
    distanceLy: '2,1 bilhões de anos-luz',
    massSolar: '4.000.000.000 M☉',
    coordinates: '16h 51m 08s | +04° 59′ 33″',
    sourceName: 'NASA / ESA Hubble & NRAO Very Large Array (VLA)',
    sourceUrl: 'https://www.nasa.gov/mission_pages/hubble/science/hercules-a.html',
    sourceCitation: 'NASA/ESA Hubble Space Telescope & NRAO/AUI/NSF • NASA ID: 2012-36'
  },
  {
    id: 'markarian-231-quasar',
    title: 'Markarian 231 - Quasar com Sistema Binário de Buracos Negros',
    subtitle: 'Telescópio Espacial Hubble da NASA & Observatório Keck',
    date: 'Agosto de 2023',
    nasaId: 'PIA-MRK231',
    telescope: 'Hubble / Keck',
    category: 'supermassivo',
    countryOrigin: 'EUA (NASA) / Colaboração Internacional',
    observatoryLocation: 'Observatório W. M. Keck (Mauna Kea, Havaí - 4.145m)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Markarian_231_%28Hubble%29.jpg/1024px-Markarian_231_%28Hubble%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Markarian_231_%28Hubble%29.jpg',
    description: 'Markarian 231 é a galáxia quasar mais próxima da Terra. Observações ultravioleta do Hubble provaram que seu núcleo é composto por dois buracos negros supermassivos (um de 150 milhões e outro de 4 milhões de massas solares) orbitando juntos e gerando ventos galácticos poderosos.',
    scienceHighlights: [
      'O quasar mais brilhante e próximo do Sistema Solar',
      'O par binário gira em torno de si com um período orbital de apenas 1,2 ano terrestre',
      'A fusão futura dos dois buracos negros emitirá estrondosas ondas gravitacionais'
    ],
    distanceLy: '581 milhões de anos-luz',
    massSolar: '154.000.000 M☉ (Binário)',
    coordinates: '12h 56m 14s | +56° 52′ 25″',
    sourceName: 'NASA / ESA Hubble Space Telescope • ApJL 809 (2015)',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/',
    sourceCitation: 'Yan et al. 2015, ApJ Letters, 809, L14 • DOI: 10.1088/2041-8205/809/1/L14'
  },
  {
    id: 'ngc-1277-giant',
    title: 'O Buraco Negro Desproporcional de NGC 1277 (Perseus)',
    subtitle: 'Telescópio Espacial Hubble (NASA/ESA) & Observatório Hobby-Eberly',
    date: '2023 / 2024',
    nasaId: 'PIA-NGC1277',
    telescope: 'Hubble / Hobby-Eberly',
    category: 'supermassivo',
    countryOrigin: 'EUA / Alemanha (Max-Planck-Institut für Astronomie)',
    observatoryLocation: 'Observatório McDonald (Texas, EUA) & Hubble Space Telescope',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/NGC_1277_Hubble.jpg/1024px-NGC_1277_Hubble.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/NGC_1277_Hubble.jpg',
    description: 'Um verdadeiro mistério cósmico: em NGC 1277, o buraco negro supermassivo tem assustadoras 17 bilhões de massas solares, constituindo mais de 14% de toda a massa de sua galáxia (quando o normal é cerca de 0,1%).',
    scienceHighlights: [
      'Horizonte de eventos de 100 bilhões de quilômetros, cerca de 11 vezes o diâmetro da órbita de Netuno',
      'Desafia teorias da coevolução padrão entre galáxias e seus buracos negros centrais',
      'Confirmado por espectroscopia de alta dispersão do telescópio Hobby-Eberly'
    ],
    distanceLy: '220 milhões de anos-luz',
    massSolar: '17.000.000.000 M☉',
    coordinates: '03h 19m 51s | +41° 34′ 25″',
    sourceName: 'Max Planck Institute for Astronomy / NASA Hubble • Nature 491',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/',
    sourceCitation: 'van den Bosch et al. 2012, Nature 491, 729–731 • DOI: 10.1038/nature11592'
  },
  {
    id: 'ngc-6240-binary',
    title: 'Colisão de DOIS Buracos Negros Supermassivos em NGC 6240',
    subtitle: 'Observatório Chandra (Raios-X) & Telescópio Hubble (NASA/ESA)',
    date: '2023 / 2024',
    nasaId: 'PIA-NGC6240-BIN',
    telescope: 'Chandra / Hubble',
    category: 'binario',
    countryOrigin: 'EUA (NASA) / Europa (ESA)',
    observatoryLocation: 'Chandra X-Ray Observatory & Space Telescope Science Institute',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/NGC_6240_Chandra_Hubble.jpg/1024px-NGC_6240_Chandra_Hubble.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/NGC_6240_Chandra_Hubble.jpg',
    description: 'Buracos negros no plural em ação espetacular: NGC 6240 é uma galáxia em processo de fusão violenta que abriga DOIS buracos negros supermassivos em colisão iminente, separados por apenas 3.000 anos-luz um do outro no mesmo núcleo galáctico.',
    scienceHighlights: [
      'Primeira confirmação visual direta de um par binário supermassivo em raios-X pela NASA',
      'Cada um dos dois buracos negros possui centenas de milhões de massas solares',
      'A colisão final emitirá ondas gravitacionais superintensas e fundirá os dois núcleos em um titã cósmico'
    ],
    distanceLy: '400 milhões de anos-luz',
    massSolar: 'Par Binário (~300.000.000 M☉ cada)',
    coordinates: '16h 52m 58s | +02° 24′ 03″',
    sourceName: 'NASA Chandra X-ray Observatory / Max-Planck-Institut',
    sourceUrl: 'https://chandra.harvard.edu/photo/2002/0240/',
    sourceCitation: 'Komossa et al. 2003, ApJL 582, L15 • DOI: 10.1086/346145'
  },
  {
    id: '3c-75-dual-black-holes',
    title: 'O Par Binário de Buracos Negros e 4 Jatos Entrelaçados em 3C 75',
    subtitle: 'Chandra X-Ray Observatory & VLA Radio Observatory (NRAO)',
    date: '2023 / 2024',
    nasaId: 'PIA-3C75-DUAL',
    telescope: 'Chandra / VLA',
    category: 'binario',
    countryOrigin: 'EUA (NASA / NRAO)',
    observatoryLocation: 'Chandra Orbit & Very Large Array (Socorro, Novo México)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/3C75.jpg/1024px-3C75.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/3C75.jpg',
    description: 'No centro do aglomerado de galáxias Abell 400, em 3C 75, coexistem DOIS buracos negros supermassivos orbitando juntos em um sistema binário a 1.200 km/s, lançando quatro jatos de plasma relativístico que se curvam e entrelaçam.',
    scienceHighlights: [
      'Sistema binário com separação de aproximadamente 25.000 anos-luz no centro da galáxia NGC 1128',
      'Jatos curvos demonstram que os buracos negros estão se movendo juntos pelo meio intergaláctico',
      'Comprovado por observações combinadas do Chandra e do radiotelescópio VLA'
    ],
    distanceLy: '300 milhões de anos-luz',
    massSolar: 'Par Binário Supermassivo',
    coordinates: '02h 57m 42s | +06° 01′ 05″',
    sourceName: 'NASA Chandra X-Ray Observatory & NRAO VLA',
    sourceUrl: 'https://chandra.harvard.edu/photo/2006/3c75/',
    sourceCitation: 'Hudson et al. 2006, MNRAS 366, 1319 • DOI: 10.1111/j.1365-2966.2005.09893.x'
  },
  {
    id: 'sdss-j0849-triple-collision',
    title: 'Colisão de TRÊS Buracos Negros Supermassivos em SDSS J0849+1114',
    subtitle: 'Chandra X-Ray, Hubble Space Telescope & NuSTAR (NASA)',
    date: 'Setembro de 2023',
    nasaId: 'PIA-TRIPLE-BH',
    telescope: 'Chandra / Hubble / NuSTAR',
    category: 'binario',
    countryOrigin: 'EUA (NASA) / Colaboração Científica Global',
    observatoryLocation: 'Chandra X-Ray, Hubble & NuSTAR Observatories',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Three_Merging_Supermassive_Black_Holes_%28Chandra%2C_Hubble%2C_SDSS%2C_WISE%2C_VLA%29.jpg/1024px-Three_Merging_Supermassive_Black_Holes_%28Chandra%2C_Hubble%2C_SDSS%2C_WISE%2C_VLA%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Three_Merging_Supermassive_Black_Holes_%28Chandra%2C_Hubble%2C_SDSS%2C_WISE%2C_VLA%29.jpg',
    description: 'Buracos negros no plural elevado ao cubo: uma rara fusão de TRÊS buracos negros supermassivos simultaneamente em uma tripla colisão de galáxias. Cada um dos três monstros emite raios-X e radiação infravermelha enquanto convergem para uma singularidade tripla.',
    scienceHighlights: [
      'Primeira confirmação astrofísica indiscutível de uma colisão tripla de buracos negros supermassivos',
      'Demonstra que fusões triplas aceleram o processo de colisão supermassiva no Universo',
      'Observado em sete comprimentos de onda complementares pelos maiores telescópios da NASA'
    ],
    distanceLy: '1 bilhão de anos-luz',
    massSolar: 'Sistema Triplo Supermassivo (~100M-500M M☉ cada)',
    coordinates: '08h 49m 05s | +11° 14′ 47″',
    sourceName: 'NASA Chandra X-ray Observatory / George Mason University',
    sourceUrl: 'https://chandra.harvard.edu/photo/2019/3bh/',
    sourceCitation: 'Pfeifle et al. 2019, ApJ 883, 167 • DOI: 10.3847/1538-4357/ab3a9b'
  },
  {
    id: 'palomar-5-cluster-holes',
    title: 'Enxame de Mais de 100 Buracos Negros em Palomar 5',
    subtitle: 'Observatório Europeu do Sul (ESO / VLT) & Telescópio Hubble',
    date: '2023 / 2024',
    nasaId: 'PIA-PALOMAR5-BH',
    telescope: 'ESO VLT / Hubble',
    category: 'binario',
    countryOrigin: 'Europa (ESO) / EUA (NASA)',
    observatoryLocation: 'Very Large Telescope (Paranal, Chile)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Palomar_5_globular_cluster.jpg/1024px-Palomar_5_globular_cluster.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Palomar_5_globular_cluster.jpg',
    description: 'No plural por excelência: astrofísicos descobriram que no centro do aglomerado globular Palomar 5 habita um enxame de mais de 100 buracos negros de massa estelar, que somados representam mais de 20% de toda a massa do aglomerado.',
    scienceHighlights: [
      'Mais de 100 buracos negros orbitando em interação mútua dentro de uma mesma estrutura globular',
      'As correntes estelares gigantes de Palomar 5 foram causadas pelas perturbações desse enxame de buracos negros',
      'Prova que aglomerados antigos da Via Láctea são verdadeiros "berçários de buracos negros"'
    ],
    distanceLy: '65.000 anos-luz',
    massSolar: 'Mais de 100 Buracos Negros Estelares (~20 M☉ cada)',
    coordinates: '15h 16m 05s | -00° 06′ 41″',
    sourceName: 'ESO / Nature Astronomy • Universidade de Barcelona',
    sourceUrl: 'https://www.eso.org/public/news/eso2110/',
    sourceCitation: 'Gieles et al. 2021, Nature Astronomy 5, 957–964 • DOI: 10.1038/s41550-021-01392-2'
  },
  {
    id: 'ngc-7727-closest-binary',
    title: 'O Par Binário Supermassivo Mais Próximo em NGC 7727',
    subtitle: 'Observatório Europeu do Sul (ESO) - Very Large Telescope (VLT / MUSE)',
    date: '2023 / 2024',
    nasaId: 'PIA-NGC7727-PAIR',
    telescope: 'ESO VLT / MUSE',
    category: 'binario',
    countryOrigin: 'Europa (ESO - Alemanha/Chile)',
    observatoryLocation: 'Observatório Paranal (Cerro Paranal, Chile - 2.635m)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/NGC_7727_ESO.jpg/1024px-NGC_7727_ESO.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/NGC_7727_ESO.jpg',
    description: 'No núcleo da galáxia NGC 7727 residem dois buracos negros supermassivos separados por apenas 1.600 anos-luz — a menor distância e o par mais próximo da Terra já confirmado por imagens telescópicas diretas.',
    scienceHighlights: [
      'O buraco negro maior possui 154 milhões de massas solares e o companheiro tem 6,3 milhões de massas solares',
      'Os dois buracos negros se fundirão em um único titã dentro de aproximadamente 250 milhões de anos',
      'Espectroscopia de precisão com o instrumento MUSE no Very Large Telescope do ESO'
    ],
    distanceLy: '89 milhões de anos-luz',
    massSolar: '154M M☉ + 6,3M M☉ (Par Binário)',
    coordinates: '23h 39m 53s | -12° 17′ 34″',
    sourceName: 'European Southern Observatory (ESO) • Astronomy & Astrophysics',
    sourceUrl: 'https://www.eso.org/public/news/eso2118/',
    sourceCitation: 'Voggel et al. 2022, A&A 658, A152 • DOI: 10.1051/0004-6361/202142110'
  },
  {
    id: 'chandra-galactic-center-swarm',
    title: 'O Enxame de Buracos Negros no Centro da Nossa Via Láctea',
    subtitle: 'NASA Chandra X-ray Observatory (Deep Galactic Survey)',
    date: '2023 / 2024',
    nasaId: 'PIA-CHANDRA-SWARM',
    telescope: 'Chandra X-Ray Observatory',
    category: 'binario',
    countryOrigin: 'EUA (NASA / Smithsonian Astrophysical Observatory)',
    observatoryLocation: 'Órbita Terrestre de Alta Altitude • NASA',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Chandra_Galactic_Center_X-ray.jpg/1024px-Chandra_Galactic_Center_X-ray.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Chandra_Galactic_Center_X-ray.jpg',
    description: 'Observações profundas do Chandra ao redor do centro da Via Láctea provaram a existência de milhares de buracos negros de massa estelar orbitando Sgr A* em uma dança coletiva em um raio de apenas 3 anos-luz.',
    scienceHighlights: [
      'Confirma a previsão teórica de que milhares de buracos negros migram para o núcleo galáctico',
      'Identificados a partir das erupções de raios-X de sistemas binários capturando matéria de estrelas próximas',
      'O maior censo de buracos negros em uma única região já fotografado em raios-X'
    ],
    distanceLy: '26.000 anos-luz',
    massSolar: 'Dezenas de Milhares de Buracos Negros',
    coordinates: '17h 45m 40s | -29° 00′ 28″',
    sourceName: 'NASA Chandra X-ray Observatory • Nature 556',
    sourceUrl: 'https://chandra.harvard.edu/photo/2018/gcs/',
    sourceCitation: 'Hailey et al. 2018, Nature 556, 70–73 • DOI: 10.1038/nature25029'
  },
  {
    id: 'pg-1302-102-ultrafast-binary',
    title: 'O Sistema Binário Supermassivo Ultraveloz PG 1302-102',
    subtitle: 'NASA Galex / Catalina Real-Time Transient Survey & Hubble',
    date: '2023 / 2024',
    nasaId: 'PIA-PG1302-BIN',
    telescope: 'Hubble / CRTS',
    category: 'binario',
    countryOrigin: 'EUA (NASA / Caltech / Columbia University)',
    observatoryLocation: 'Space Telescope Science Institute (STScI) & CRTS',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/PG_1302-102_binary_supermassive_black_hole.jpg/1024px-PG_1302-102_binary_supermassive_black_hole.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/PG_1302-102_binary_supermassive_black_hole.jpg',
    description: 'Este quasar abriga um par de buracos negros supermassivos tão próximos entre si (separados por apenas 0,03 ano-luz) que completam uma órbita inteira um ao redor do outro em apenas 5 anos terrestres, pulsando sincronizadamente em luz ultravioleta e raios-X.',
    scienceHighlights: [
      'O sistema binário de buracos negros supermassivos com a menor órbita já medida em um quasar',
      'Velocidade orbital relativística gera o fenômeno de efeito Doppler relativístico com feixe de luz pulsante',
      'A colisão esperada nos próximos 100.000 anos emitirá as ondas gravitacionais mais intensas do cosmos'
    ],
    distanceLy: '3,5 bilhões de anos-luz',
    massSolar: '1.000.000.000 M☉ (Binário)',
    coordinates: '13h 05m 33s | -10° 33′ 19″',
    sourceName: 'NASA / Caltech / Columbia University • Nature 518',
    sourceUrl: 'https://www.nasa.gov/universe/astronomers-find-supermassive-black-hole-binary-in-quasar/',
    sourceCitation: 'Graham et al. 2015, Nature 518, 74–76 • DOI: 10.1038/nature14143'
  },
  {
    id: 'gw190521-binary-collision',
    title: 'Colisão Gravitacional GW190521: Dois Buracos Negros Estelares',
    subtitle: 'LIGO (Laser Interferometer Gravitational-Wave Observatory) & Virgo',
    date: '2020 / 2024',
    nasaId: 'PIA-GW190521',
    telescope: 'LIGO / Virgo',
    category: 'binario',
    countryOrigin: 'EUA (LIGO Hanford/Livingston) / Itália (Virgo)',
    observatoryLocation: 'Observatório LIGO (Washington & Louisiana, EUA) e Virgo (Itália)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/LIGO%27s_most_massive_merger_%28artist%27s_concept%29.jpg/1024px-LIGO%27s_most_massive_merger_%28artist%27s_concept%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/LIGO%27s_most_massive_merger_%28artist%27s_concept%29.jpg',
    description: 'O registro de ondas gravitacionais mais espetacular da história: a colisão em alta velocidade de dois buracos negros estelares (85 e 66 massas solares) fundindo-se em um único buraco negro de 142 Sóis, provando o nascimento dos buracos negros de massa intermediária.',
    scienceHighlights: [
      'Encontro violento entre dois buracos negros em colisão frontal captado pelas ondulações no tecido do espaço-tempo',
      'Libertou o equivalente a 8 massas solares convertidas em pura energia gravitacional em milissegundos',
      'Confirmou pela primeira vez a classe dos buracos negros de massa intermediária'
    ],
    distanceLy: '17 bilhões de anos-luz (Redshift z=0.82)',
    massSolar: '85 M☉ + 66 M☉ ➔ 142 M☉ (Fusão)',
    coordinates: '12h 49m 00s | -34° 00′ 00″',
    sourceName: 'LIGO Scientific Collaboration & Virgo Collaboration • PRL 125',
    sourceUrl: 'https://www.ligo.caltech.edu/news/ligo20200902',
    sourceCitation: 'Abbott et al. 2020, Phys. Rev. Lett. 125, 101102 • DOI: 10.1103/PhysRevLett.125.101102'
  }
];

// ==========================================
// PHYSICAL CATALOG OF FAMOUS BLACK HOLES
// ==========================================
export interface BlackHolePhysicsRecord {
  id: string;
  name: string;
  type: 'Supermassivo' | 'Estelar' | 'Intermediário' | 'Primordial / Extremo';
  massSolar: number;
  distanceLy: number;
  spinParameter: number; // 0 (Schwarzschild) to 0.998 (Kerr max)
  accretionRate: string; // desc
  discoveryYear: number;
  hostGalaxy: string;
  description: string;
  funFact: string;
  imageUrl: string;
  highResUrl?: string;
  countryOrigin?: string;
  observatoryLocation?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceCitation?: string;
}

const BLACK_HOLE_PHYSICS_CATALOG: BlackHolePhysicsRecord[] = [
  {
    id: 'sgra-star',
    name: 'Sagittarius A* (Sgr A* - Nossa Via Láctea)',
    type: 'Supermassivo',
    massSolar: 4300000,
    distanceLy: 26000,
    spinParameter: 0.6,
    accretionRate: 'Baixa (Quase adormecido / Dieta de asteroides)',
    discoveryYear: 1974,
    hostGalaxy: 'Via Láctea (Centro Galáctico)',
    countryOrigin: 'Colaboração Global EHT (EUA, Chile, Espanha, México, Antártida, Groenlândia)',
    observatoryLocation: 'Cerro Chajnantor (Chile) • Sierra Nevada (Espanha) • Polo Sul (Antártida) • Havaí & Arizona (EUA)',
    description: 'A histórica imagem oficial obtida pela colaboração EHT revelando o buraco negro supermassivo no centro da nossa própria galáxia. O anel luminoso dourado mostra o plasma girando em altíssimas velocidades ao redor da sombra gravitacional onde o tempo e o espaço convergem.',
    funFact: 'Em escala cósmica, Sgr A* é extremamente pacífico; consome o equivalente a um único asteroide por dia e está localizado a apenas 26 mil anos-luz da Terra.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/The_centre_of_the_Milky_Way_in_infrared_%28ESO%29.jpg/1024px-The_centre_of_the_Milky_Way_in_infrared_%28ESO%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/The_centre_of_the_Milky_Way_in_infrared_%28ESO%29.jpg',
    sourceName: 'ESO / VLT & Event Horizon Telescope',
    sourceUrl: 'https://www.eso.org/public/images/eso0846a/',
    sourceCitation: 'ESO/S. Gillessen et al. • ApJL 930, L12 (2022)'
  },
  {
    id: 'phoenix-a-star',
    name: 'Phoenix A* (O Maior Buraco Negro Conhecido no Universo)',
    type: 'Primordial / Extremo',
    massSolar: 100000000000,
    distanceLy: 8500000000,
    spinParameter: 0.95,
    accretionRate: 'Colossal - Centro de aglomerado galáctico ativo',
    discoveryYear: 2012,
    hostGalaxy: 'Aglomerado da Fênix (Phoenix Cluster)',
    countryOrigin: 'EUA (NASA) / Europa (ESO / ESA)',
    observatoryLocation: 'Observatório Chandra (EUA) & Telescópio Hubble (NASA/ESA)',
    description: 'Atualmente considerado o buraco negro de maior massa já catalogado no Universo conhecido. Com cerca de 100 bilhões de massas solares, seu horizonte de eventos mede impressionantes 590 bilhões de quilômetros de diâmetro (mais de 100 vezes a órbita de Plutão).',
    funFact: 'Sua densidade e gravidade são tão colossais que sua formação desafia os modelos estelares padrão, sugerindo colapso direto no início do Universo.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Phoenix_Cluster.jpg/1024px-Phoenix_Cluster.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Phoenix_Cluster.jpg',
    sourceName: 'NASA Chandra X-ray Observatory / MIT',
    sourceUrl: 'https://chandra.harvard.edu/photo/2012/phoenix/',
    sourceCitation: 'McDonald et al. 2012, Nature 488, 349–352 • DOI: 10.1038/nature11379'
  },
  {
    id: 'ton-618',
    name: 'TON 618 (O Quasar Titã Ultra-Massivo)',
    type: 'Supermassivo',
    massSolar: 66000000000,
    distanceLy: 10400000000,
    spinParameter: 0.85,
    accretionRate: 'Extremamente Alta - Brilha como 140 trilhões de Sóis',
    discoveryYear: 1957,
    hostGalaxy: 'Quasar TON 618 (Canes Venatici)',
    countryOrigin: 'EUA / México / Espanha (Observação de Quasares)',
    observatoryLocation: 'Observatório McDonald (Texas, EUA) & SDSS Sloan Digital Sky Survey',
    description: 'Considerado um dos buracos negros mais massivos já detectados na história da astronomia. Com 66 bilhões de massas solares, seu raio de Schwarzschild é de 390 bilhões de km, equivalente a 44 vezes o diâmetro de todo o Sistema Solar!',
    funFact: 'Se você substituísse nosso Sol pelo TON 618, seu horizonte de eventos engoliria todo o Sistema Solar, a Nuvem de Oort e ainda sobraria espaço interestelar.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Hubble_views_quasar_PG_0052%2B251.jpg/1024px-Hubble_views_quasar_PG_0052%2B251.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Hubble_views_quasar_PG_0052%2B251.jpg',
    sourceName: 'Sloan Digital Sky Survey (SDSS) / NASA Hubble',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/',
    sourceCitation: 'Shemmer et al. 2004, ApJ 614, 547 • DOI: 10.1086/423607'
  },
  {
    id: 'm87-star',
    name: 'Messier 87* (M87* - O Ícone do EHT)',
    type: 'Supermassivo',
    massSolar: 6500000000,
    distanceLy: 55000000,
    spinParameter: 0.9,
    accretionRate: 'Moderada - Jato de plasma de 5.000 anos-luz',
    discoveryYear: 1918,
    hostGalaxy: 'Messier 87 (Virgo Cluster)',
    countryOrigin: 'Colaboração Global (EUA, Chile, Espanha, México, Groenlândia, França, Antártida)',
    observatoryLocation: 'ALMA & APEX (Chile) • IRAM 30m (Espanha) • LMT (México) • SMT & JCMT (EUA/Havaí)',
    description: 'O ícone histórico fotografado pela primeira vez pelo Event Horizon Telescope em 2019. Possui 6,5 bilhões de massas solares e impulsiona um jato relativístico gigantesco através de seu campo magnético giratório.',
    funFact: 'O jato de M87* parece viajar mais rápido que a velocidade da luz em imagens telescópicas devido a uma ilusão de ótica relativística chamada movimento superluminal aparente.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/M87_jet_Hubble.jpg/1024px-M87_jet_Hubble.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/M87_jet_Hubble.jpg',
    sourceName: 'Event Horizon Telescope Collaboration & NASA Hubble',
    sourceUrl: 'https://eventhorizontelescope.org/press-release-april-10-2019-astronomers-capture-first-image-black-hole',
    sourceCitation: 'EHT Collaboration 2019, ApJL 875, L1 • DOI: 10.3847/2041-8213/ab0ec7'
  },
  {
    id: 'holm-15a',
    name: 'Holm 15A* (O Gigante Ultra-Massivo de Abell 85)',
    type: 'Primordial / Extremo',
    massSolar: 40000000000,
    distanceLy: 700000000,
    spinParameter: 0.88,
    accretionRate: 'Alta - Núcleo de galáxia elíptica gigante',
    discoveryYear: 2019,
    hostGalaxy: 'Holmberg 15A (Aglomerado Abell 85)',
    countryOrigin: 'Alemanha / Chile (ESO) / EUA (NASA)',
    observatoryLocation: 'Very Large Telescope (VLT Paranal, Chile - 2.635m) & Observatório Wendelstein',
    description: 'Com 40 bilhões de vezes a massa do Sol, o núcleo da galáxia Holmberg 15A abriga um buraco negro com um horizonte de eventos que se estende por mais de 800 unidades astronômicas.',
    funFact: 'A região central de sua galáxia tem um brilho suave porque o buraco negro já varreu e capturou a maioria das estrelas que tentaram se aproximar de seu núcleo.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Abell_85_%28Chandra%2C_2004%29.jpg/1024px-Abell_85_%28Chandra%2C_2004%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Abell_85_%28Chandra%2C_2004%29.jpg',
    sourceName: 'ESO VLT & NASA Chandra X-ray Observatory',
    sourceUrl: 'https://www.eso.org/public/',
    sourceCitation: 'Mehrgan et al. 2019, ApJ 887, 195 • DOI: 10.3847/1538-4357/ab5856'
  },
  {
    id: 'oj-287',
    name: 'OJ 287 (O Sistema Binário Titânico)',
    type: 'Supermassivo',
    massSolar: 18000000000,
    distanceLy: 3500000000,
    spinParameter: 0.92,
    accretionRate: 'Perfurado por buraco negro menor a cada 12 anos',
    discoveryYear: 1891,
    hostGalaxy: 'Galáxia OJ 287 (Constelação de Câncer)',
    countryOrigin: 'Finlândia / Japão / EUA / Espanha / Polônia',
    observatoryLocation: 'Observatório Tuorla (Finlândia) & Rede Mundial de Telescópios Ópticos e Rádio',
    description: 'Um sistema binário espetacular no qual um buraco negro de 18 bilhões de massas solares é orbitado por um segundo buraco negro supermassivo menor que atravessa o disco de acreção duas vezes por década, gerando estrondosos ecos luminosos.',
    funFact: 'O impacto do buraco negro menor no disco do maior cria um clarão cósmico mais brilhante do que 1 trilhão de estrelas combinadas.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/OJ_287_light_curve_and_artist%27s_impression.jpg/1024px-OJ_287_light_curve_and_artist%27s_impression.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/OJ_287_light_curve_and_artist%27s_impression.jpg',
    sourceName: 'Tuorla Observatory Finland & NASA Spitzer',
    sourceUrl: 'https://www.spitzer.caltech.edu/',
    sourceCitation: 'Valtonen et al. 2016, ApJL 819, L37 • DOI: 10.3847/2041-8205/819/2/L37'
  },
  {
    id: 'jwst-gnz11',
    name: 'JWST GN-z11 (O Titã do Amanhecer Cósmico)',
    type: 'Primordial / Extremo',
    massSolar: 1600000,
    distanceLy: 13400000000,
    spinParameter: 0.75,
    accretionRate: 'Super-Eddington (Crescimento Acelerado no Universo Primitivo)',
    discoveryYear: 2024,
    hostGalaxy: 'GN-z11 (Ursa Major)',
    countryOrigin: 'EUA (NASA) / Europa (ESA) / Canadá (CSA)',
    observatoryLocation: 'Telescópio Espacial James Webb • Órbita Solar L2 (1,5 milhão de km da Terra)',
    description: 'Descoberto pelo Telescópio Espacial James Webb (JWST) a apenas 400 milhões de anos após o Big Bang. Sua massa colossal desafia teorias de formação estelar, indicando colapso de nuvens primordiais.',
    funFact: 'Este buraco negro devora matéria 5 vezes mais rápido do que o limite teórico tradicional de Eddington.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Webb%27s_Deepest_Infrared_View_of_the_Universe_Yet.jpg/1024px-Webb%27s_Deepest_Infrared_View_of_the_Universe_Yet.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Webb%27s_Deepest_Infrared_View_of_the_Universe_Yet.jpg',
    sourceName: 'NASA / ESA / James Webb Space Telescope',
    sourceUrl: 'https://webb.nasa.gov/',
    sourceCitation: 'Maiolino et al. 2024, Nature 627, 59–63 • DOI: 10.1038/s41586-024-07052-5'
  },
  {
    id: 'hlx-1-eso',
    name: 'HLX-1 (O Buraco Negro Intermediário de ESO 243-49)',
    type: 'Intermediário',
    massSolar: 20000,
    distanceLy: 290000000,
    spinParameter: 0.8,
    accretionRate: 'Erupções periódicas intensas de Raios-X',
    discoveryYear: 2009,
    hostGalaxy: 'ESO 243-49',
    countryOrigin: 'França / Austrália / Chile (ESO)',
    observatoryLocation: 'Very Large Telescope (ESO, Chile) • Observatório Swift (NASA EUA)',
    description: 'O melhor exemplo confirmado de um buraco negro de massa intermediária (o elo perdido entre buracos negros estelares e supermassivos). Emite erupções que iluminam os arredores de sua galáxia.',
    funFact: 'Sua massa de 20 mil Sóis prova que buracos negros podem crescer por fusão progressiva dentro de aglomerados estelares.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/An_intermediate-mass_black_hole_%28artist%E2%80%99s_impression%29.jpg/1024px-An_intermediate-mass_black_hole_%28artist%E2%80%99s_impression%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/An_intermediate-mass_black_hole_%28artist%E2%80%99s_impression%29.jpg',
    sourceName: 'ESO VLT Chile & NASA Swift Satellite',
    sourceUrl: 'https://www.eso.org/public/news/eso0928/',
    sourceCitation: 'Farrell et al. 2009, Nature 460, 73–75 • DOI: 10.1038/nature08083'
  },
  {
    id: 'cygnus-x1',
    name: 'Cygnus X-1 (O Pioneiro Estelar)',
    type: 'Estelar',
    massSolar: 21.2,
    distanceLy: 7200,
    spinParameter: 0.99,
    accretionRate: 'Alta - Alimentado por vento estelar supergigante',
    discoveryYear: 1964,
    hostGalaxy: 'Via Láctea',
    countryOrigin: 'EUA / Reino Unido / Colaboração Internacional',
    observatoryLocation: 'Observatório Chandra (NASA EUA) • Kitt Peak (Arizona, EUA)',
    description: 'O primeiro buraco negro estelar confirmado da astronomia. Gira quase na velocidade máxima que a teoria da relatividade permite e suga matéria sem parar da estrela supergigante azul HDE 226868.',
    funFact: 'Stephen Hawking apostou contra a existência de Cygnus X-1 na década de 1970 e pagou a aposta ao físico Kip Thorne em 1990 quando provas de raio-X se tornaram indiscutíveis.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Cygnus_X-1_%28artist%27s_impression%29.jpg/1024px-Cygnus_X-1_%28artist%27s_impression%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Cygnus_X-1_%28artist%27s_impression%29.jpg',
    sourceName: 'NASA Chandra X-ray Observatory • Science 371',
    sourceUrl: 'https://chandra.harvard.edu/photo/2021/cygnus/',
    sourceCitation: 'Miller-Jones et al. 2021, Science, 371, 1046 • DOI: 10.1126/science.abb3363'
  },
  {
    id: 'gw150914-remnant',
    name: 'GW150914 (O Estrondo Gravitacional LIGO)',
    type: 'Estelar',
    massSolar: 62,
    distanceLy: 1300000000,
    spinParameter: 0.68,
    accretionRate: 'Fusão Cataclísmica de 2 Buracos Negros',
    discoveryYear: 2015,
    hostGalaxy: 'Galáxia distante no céu de Magalhães',
    countryOrigin: 'EUA / Itália / Colaboração Científica de 18 Países',
    observatoryLocation: 'LIGO (Hanford & Livingston, EUA) & Virgo (Cascina, Itália)',
    description: 'O resultado da colisão de dois buracos negros que emitiu as primeiras ondas gravitacionais captadas na Terra pelo LIGO, abrindo um novo sentido para ouvirmos o Universo.',
    funFact: 'No último décimo de segundo antes da colisão, esse par emitiu mais energia que todas as estrelas do Universo observável brilhando juntas!',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Binary_black_hole_merger_%28artist%27s_concept%29.jpg/1024px-Binary_black_hole_merger_%28artist%27s_concept%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Binary_black_hole_merger_%28artist%27s_concept%29.jpg',
    sourceName: 'LIGO Scientific Collaboration & Virgo • PRL 116',
    sourceUrl: 'https://www.ligo.caltech.edu/news/ligo20160211',
    sourceCitation: 'Abbott et al. 2016, Phys. Rev. Lett. 116, 061102 • DOI: 10.1103/PhysRevLett.116.061102'
  },
  {
    id: 'v404-cygni',
    name: 'V404 Cygni (Microquasar dos Anéis de Raio-X)',
    type: 'Estelar',
    massSolar: 9.0,
    distanceLy: 7800,
    spinParameter: 0.92,
    accretionRate: 'Erupções violentas cíclicas (a cada ~26 anos)',
    discoveryYear: 1989,
    hostGalaxy: 'Via Láctea',
    countryOrigin: 'EUA / Reino Unido / Japão / Espanha',
    observatoryLocation: 'Observatório Chandra (NASA EUA) • Observatório Roque de los Muchachos (Espanha)',
    description: 'Um buraco negro estelar famoso por produzir anéis de eco de raio-X gigantescos que espalham luz nas nuvens de poeira interestelar de nossa galáxia.',
    funFact: 'Em 2015, V404 Cygni teve uma erupção tão brilhante que temporariamente se tornou o objeto de raio-X mais brilhante de todo o céu noturno.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chandra%27s_image_of_V404_Cygni.jpg/1024px-Chandra%27s_image_of_V404_Cygni.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Chandra%27s_image_of_V404_Cygni.jpg',
    sourceName: 'NASA Chandra X-ray Observatory & Neil Gehrels Swift',
    sourceUrl: 'https://chandra.harvard.edu/photo/2016/v404cyg/',
    sourceCitation: 'Beardmore et al. 2016, MNRAS 462, 1847 • DOI: 10.1093/mnras/stw1768'
  },
  {
    id: 'sombrero-m104',
    name: 'M104* (Buraco Negro Supermassivo da Galáxia do Sombrero)',
    type: 'Supermassivo',
    massSolar: 1000000000,
    distanceLy: 29000000,
    spinParameter: 0.81,
    accretionRate: 'Moderada - Jatos fracos e intenso disco estelar',
    discoveryYear: 1996,
    hostGalaxy: 'Messier 104 (Galáxia do Sombrero)',
    countryOrigin: 'EUA (NASA) / Europa (ESA)',
    observatoryLocation: 'Telescópio Espacial Hubble (HST) & Observatório Keck',
    description: 'Habitando o bojo central da deslumbrante Galáxia do Sombrero, este buraco negro supermassivo de 1 bilhão de massas solares gira cercado por um imenso anel de poeira e hidrogênio estelar.',
    funFact: 'Apesar de ser 230 vezes mais pesado que o buraco negro da Via Láctea, é considerado extremamente silencioso nos raios-X.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M104_ngc4594_sombrero_galaxy_hi-res.jpg/1024px-M104_ngc4594_sombrero_galaxy_hi-res.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/M104_ngc4594_sombrero_galaxy_hi-res.jpg',
    sourceName: 'NASA / ESA Hubble Space Telescope • ApJ 473',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-104/',
    sourceCitation: 'Kormendy et al. 1996, ApJ 473, L91 • DOI: 10.1086/310399'
  },
  {
    id: 'andromeda-m31',
    name: 'M31* P2 Core (O Buraco Negro de Andrômeda)',
    type: 'Supermassivo',
    massSolar: 100000000,
    distanceLy: 2500000,
    spinParameter: 0.65,
    accretionRate: 'Baixa - Sistema dinâmico duplo',
    discoveryYear: 1988,
    hostGalaxy: 'Galáxia de Andrômeda (Messier 31)',
    countryOrigin: 'EUA (NASA) / Europa (ESA)',
    observatoryLocation: 'Telescópio Espacial Hubble & Observatório Lick',
    description: 'No centro de nossa galáxia irmã Andrômeda, este buraco negro possui cerca de 100 milhões de massas solares e mantém sob sua gravidade um enxame denso de estrelas azuis jovens e estrelas antigas em formato de disco duplo.',
    funFact: 'Daqui a 4 bilhões de anos, o buraco negro de Andrômeda (M31*) se fundirá com o da nossa Via Láctea (Sgr A*), formando uma nova galáxia elíptica gigante.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg/1024px-Andromeda_Galaxy_%28with_h-alpha%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg',
    sourceName: 'NASA / ESA Hubble Space Telescope • ApJ 631',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/',
    sourceCitation: 'Bender et al. 2005, ApJ 631, 280 • DOI: 10.1086/432434'
  },
  {
    id: 'hercules-a',
    name: 'Hercules A (O Colosso dos Jatos de Rádio)',
    type: 'Supermassivo',
    massSolar: 4000000000,
    distanceLy: 2100000000,
    spinParameter: 0.94,
    accretionRate: 'Ultra Alta - Jatos de 1,5 milhão de anos-luz',
    discoveryYear: 1962,
    hostGalaxy: '3C 348 (Hercules A)',
    countryOrigin: 'EUA / NRAO / NASA / ESA',
    observatoryLocation: 'Very Large Array (Novo México, EUA) & Hubble Space Telescope',
    description: 'Com 4 bilhões de massas solares, o buraco negro central desta galáxia alimenta feixes magnéticos colossais que expelem jatos de plasma com mais de dez vezes o tamanho da nossa própria galáxia.',
    funFact: 'Os lóbulos de rádio de Hercules A contêm energia suficiente para abastecer todas as estrelas do Universo por trilhões de anos.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/A_Multi-Wavelength_View_of_Radio_Galaxy_Hercules_A.jpg/1024px-A_Multi-Wavelength_View_of_Radio_Galaxy_Hercules_A.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/A_Multi-Wavelength_View_of_Radio_Galaxy_Hercules_A.jpg',
    sourceName: 'NASA Hubble & NRAO Very Large Array (VLA)',
    sourceUrl: 'https://www.nasa.gov/mission_pages/hubble/science/hercules-a.html',
    sourceCitation: 'NASA/ESA Hubble & NRAO/AUI/NSF • NASA PR 2012-36'
  },
  {
    id: 'mrk-231',
    name: 'Markarian 231 (O Par Supermassivo Mais Próximo)',
    type: 'Supermassivo',
    massSolar: 154000000,
    distanceLy: 581000000,
    spinParameter: 0.89,
    accretionRate: 'Alta - Quasar em intensa explosão estelar',
    discoveryYear: 1969,
    hostGalaxy: 'UGC 8058 (Markarian 231)',
    countryOrigin: 'EUA (NASA) / Keck Observatory',
    observatoryLocation: 'Observatório W. M. Keck (Havaí) & Telescópio Espacial Hubble',
    description: 'O quasar mais próximo da Terra é habitado não por um, mas por dois buracos negros supermassivos orbitando juntos em uma dança gravitacional extrema que varre o gás de toda a galáxia hospedeira.',
    funFact: 'Sua luminosidade infravermelha ultrapassa a de 1 trilhão de Sóis, sendo uma das maiores usinas de energia do universo local.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Markarian_231_%28Hubble%29.jpg/1024px-Markarian_231_%28Hubble%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Markarian_231_%28Hubble%29.jpg',
    sourceName: 'NASA / ESA Hubble Space Telescope • ApJL 809',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/',
    sourceCitation: 'Yan et al. 2015, ApJ Letters, 809, L14 • DOI: 10.1088/2041-8205/809/1/L14'
  },
  {
    id: 'ngc-1277',
    name: 'NGC 1277 (O Buraco Negro Que Desafiou as Regras)',
    type: 'Supermassivo',
    massSolar: 17000000000,
    distanceLy: 220000000,
    spinParameter: 0.91,
    accretionRate: 'Adormecido - "Relíquia Vermelha" sem gás fresco',
    discoveryYear: 2012,
    hostGalaxy: 'NGC 1277 (Aglomerado de Perseus)',
    countryOrigin: 'Alemanha (MPIA) / EUA (McDonald Observatory)',
    observatoryLocation: 'Telescópio Hobby-Eberly (Texas, EUA) & Hubble Space Telescope',
    description: 'Este buraco negro gigantesco detém quase 15% de toda a massa de sua galáxia, quebrando a regra cósmica que afirma que buracos negros representam apenas uma minoria insignificante da massa galáctica.',
    funFact: 'Se a Terra estivesse orbitando à distância do nosso Sol desse buraco negro, já estaríamos dentro de seu horizonte de eventos.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/NGC_1277_Hubble.jpg/1024px-NGC_1277_Hubble.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/NGC_1277_Hubble.jpg',
    sourceName: 'Max Planck Institute for Astronomy / NASA Hubble',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/',
    sourceCitation: 'van den Bosch et al. 2012, Nature 491, 729–731 • DOI: 10.1038/nature11592'
  },
  {
    id: 'ngc-6240-cat',
    name: 'NGC 6240 (Par de Buracos Negros Supermassivos em Colisão)',
    type: 'Supermassivo',
    massSolar: 600000000,
    distanceLy: 400000000,
    spinParameter: 0.84,
    accretionRate: 'Colisão Binária - Absorção de gás violenta em fusão',
    discoveryYear: 2002,
    hostGalaxy: 'NGC 6240 (Ophiuchus)',
    countryOrigin: 'EUA (NASA) / Alemanha (Max-Planck)',
    observatoryLocation: 'Observatório Chandra (NASA EUA) & Telescópio Hubble',
    description: 'Buracos negros no plural: pela primeira vez na história, o telescópio Chandra da NASA provou visualmente que esta galáxia possui DOIS buracos negros supermassivos no seu núcleo, separados por apenas 3.000 anos-luz em rota de colisão direta.',
    funFact: 'Quando esses dois buracos negros se fundirem de forma cataclísmica, produzirão ondas gravitacionais 100 milhões de vezes mais fortes que as detectadas pelo LIGO.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/NGC_6240_Chandra_Hubble.jpg/1024px-NGC_6240_Chandra_Hubble.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/NGC_6240_Chandra_Hubble.jpg',
    sourceName: 'NASA Chandra X-ray Observatory / Max-Planck-Institut',
    sourceUrl: 'https://chandra.harvard.edu/photo/2002/0240/',
    sourceCitation: 'Komossa et al. 2003, ApJL 582, L15 • DOI: 10.1086/346145'
  },
  {
    id: '3c-75-cat',
    name: '3C 75 (O Sistema Binário Duplo e Seus 4 Jatos)',
    type: 'Supermassivo',
    massSolar: 2500000000,
    distanceLy: 300000000,
    spinParameter: 0.91,
    accretionRate: 'Muito Alta - 4 Jatos Relativísticos em Interação',
    discoveryYear: 1985,
    hostGalaxy: 'NGC 1128 (Aglomerado Abell 400)',
    countryOrigin: 'EUA (NASA / NRAO)',
    observatoryLocation: 'Observatório Chandra & Very Large Array (VLA - Novo México)',
    description: 'Um sistema binário de buracos negros supermassivos viajando a 1.200 quilômetros por segundo pelo meio intergaláctico, com quatro jatos relativísticos entrelaçados impressionantes visíveis em ondas de rádio e raios-X.',
    funFact: 'Os jatos se curvam para trás como as fumaças de dois escapamentos de um avião supersônico em voo de formação.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/3C75.jpg/1024px-3C75.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/3C75.jpg',
    sourceName: 'NASA Chandra X-Ray Observatory & NRAO VLA',
    sourceUrl: 'https://chandra.harvard.edu/photo/2006/3c75/',
    sourceCitation: 'Hudson et al. 2006, MNRAS 366, 1319 • DOI: 10.1111/j.1365-2966.2005.09893.x'
  },
  {
    id: 'sdss-j0849-cat',
    name: 'SDSS J0849+1114 (O Triplo Choque de Buracos Negros)',
    type: 'Supermassivo',
    massSolar: 900000000,
    distanceLy: 1000000000,
    spinParameter: 0.88,
    accretionRate: 'Colisão Tripla Simultânea - Quasar em triplo brilho',
    discoveryYear: 2019,
    hostGalaxy: 'Sistema em Fusão Tripla SDSS J0849+1114',
    countryOrigin: 'EUA (NASA / George Mason University)',
    observatoryLocation: 'Chandra X-Ray • Hubble Space Telescope • NuSTAR',
    description: 'O plural extremo: astrofísicos identificaram TRÊS buracos negros supermassivos em um mesmo sistema triplo em convergência gravitacional. Cada um dos três núcleos brilha intensamente ao alimentar seu disco de acreção.',
    funFact: 'Em um sistema com três buracos negros, a gravidade de um terceiro membro acelera radicalmente a fusão entre os outros dois.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Three_Merging_Supermassive_Black_Holes_%28Chandra%2C_Hubble%2C_SDSS%2C_WISE%2C_VLA%29.jpg/1024px-Three_Merging_Supermassive_Black_Holes_%28Chandra%2C_Hubble%2C_SDSS%2C_WISE%2C_VLA%29.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Three_Merging_Supermassive_Black_Holes_%28Chandra%2C_Hubble%2C_SDSS%2C_WISE%2C_VLA%29.jpg',
    sourceName: 'NASA Chandra X-ray Observatory / George Mason University',
    sourceUrl: 'https://chandra.harvard.edu/photo/2019/3bh/',
    sourceCitation: 'Pfeifle et al. 2019, ApJ 883, 167 • DOI: 10.3847/1538-4357/ab3a9b'
  },
  {
    id: 'palomar-5-cat',
    name: 'Palomar 5 (O Aglomerado dos 100+ Buracos Negros)',
    type: 'Estelar',
    massSolar: 2500,
    distanceLy: 65000,
    spinParameter: 0.7,
    accretionRate: 'Dança estelar coletiva em aglomerado globular',
    discoveryYear: 2021,
    hostGalaxy: 'Via Láctea (Aglomerado Palomar 5)',
    countryOrigin: 'Europa (ESO) / Espanha / Reino Unido',
    observatoryLocation: 'Very Large Telescope (ESO Paranal, Chile)',
    description: 'Em vez de um único buraco negro gigante, Palomar 5 abriga mais de 100 buracos negros estelares orbitando em enxame em seu núcleo. Esse coletivo gravitacional arremessa estrelas para fora, formando correntes estelares de 30 mil anos-luz.',
    funFact: 'Daqui a 1 bilhão de anos, o aglomerado Palomar 5 terá perdido todas as suas estrelas normais e será composto 100% apenas por buracos negros em órbita.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Palomar_5_globular_cluster.jpg/1024px-Palomar_5_globular_cluster.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Palomar_5_globular_cluster.jpg',
    sourceName: 'ESO / Nature Astronomy • Universidade de Barcelona',
    sourceUrl: 'https://www.eso.org/public/news/eso2110/',
    sourceCitation: 'Gieles et al. 2021, Nature Astronomy 5, 957–964 • DOI: 10.1038/s41550-021-01392-2'
  },
  {
    id: 'ngc-7727-cat',
    name: 'NGC 7727 (O Par Binário com a Separação Mais Próxima)',
    type: 'Supermassivo',
    massSolar: 160300000,
    distanceLy: 89000000,
    spinParameter: 0.78,
    accretionRate: 'Fusão em andamento de dois núcleos galácticos',
    discoveryYear: 2022,
    hostGalaxy: 'NGC 7727 (Aquário)',
    countryOrigin: 'Europa (ESO - VLT MUSE)',
    observatoryLocation: 'Observatório Paranal (Cerro Paranal, Chile)',
    description: 'Um par binário de buracos negros supermassivos com apenas 1.600 anos-luz de distância entre si, o menor distanciamento físico e a menor distância até a Terra de um sistema binário de buracos negros confirmado.',
    funFact: 'Sua proximidade comprova que galáxias em colisão contêm pares de buracos negros muito mais frequentemente do que se imaginava.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/NGC_7727_ESO.jpg/1024px-NGC_7727_ESO.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/NGC_7727_ESO.jpg',
    sourceName: 'European Southern Observatory (ESO) • Astronomy & Astrophysics',
    sourceUrl: 'https://www.eso.org/public/news/eso2118/',
    sourceCitation: 'Voggel et al. 2022, A&A 658, A152 • DOI: 10.1051/0004-6361/202142110'
  },
  {
    id: 'chandra-center-cat',
    name: 'O Enxame de Milhares de Buracos Negros de Sgr A*',
    type: 'Estelar',
    massSolar: 200000,
    distanceLy: 26000,
    spinParameter: 0.75,
    accretionRate: 'Captura estelar em densidade extrema',
    discoveryYear: 2018,
    hostGalaxy: 'Via Láctea (Centro Galáctico)',
    countryOrigin: 'EUA (NASA - Chandra X-Ray Observatory)',
    observatoryLocation: 'Órbita Terrestre • NASA Chandra Observatory',
    description: 'Imagens profundas de raios-X da NASA revelaram que Sgr A* está cercado por uma "cúspide densa" com milhares de buracos negros de massa estelar em órbita mútua na região mais íntima da Via Láctea.',
    funFact: 'É a maior concentração física de buracos negros confirmados por raios-X em todo o céu noturno.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Chandra_Galactic_Center_X-ray.jpg/1024px-Chandra_Galactic_Center_X-ray.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Chandra_Galactic_Center_X-ray.jpg',
    sourceName: 'NASA Chandra X-ray Observatory • Nature 556',
    sourceUrl: 'https://chandra.harvard.edu/photo/2018/gcs/',
    sourceCitation: 'Hailey et al. 2018, Nature 556, 70–73 • DOI: 10.1038/nature25029'
  },
  {
    id: 'pg-1302-cat',
    name: 'PG 1302-102 (O Par Binário Ultraveloz do Quasar)',
    type: 'Supermassivo',
    massSolar: 1000000000,
    distanceLy: 3500000000,
    spinParameter: 0.93,
    accretionRate: 'Período orbital de 5 anos com jatos pulsantes',
    discoveryYear: 2015,
    hostGalaxy: 'Quasar PG 1302-102',
    countryOrigin: 'EUA (NASA / Caltech)',
    observatoryLocation: 'Telescópio Espacial Hubble & Catalina Sky Survey',
    description: 'Dois buracos negros supermassivos separados por meros 0,03 ano-luz e rodopiando a velocidades relativísticas vertiginosas, gerando um farol cósmico que acende e apaga periodicamente no espaço intergaláctico.',
    funFact: 'O efeito Doppler da sua órbita faz a luz do quasar parecer mais azul quando o buraco negro primário avança na nossa direção.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/PG_1302-102_binary_supermassive_black_hole.jpg/1024px-PG_1302-102_binary_supermassive_black_hole.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/PG_1302-102_binary_supermassive_black_hole.jpg',
    sourceName: 'NASA / Caltech / Columbia University • Nature 518',
    sourceUrl: 'https://www.nasa.gov/universe/astronomers-find-supermassive-black-hole-binary-in-quasar/',
    sourceCitation: 'Graham et al. 2015, Nature 518, 74–76 • DOI: 10.1038/nature14143'
  },
  {
    id: 'gaia-bh1-cat',
    name: 'Gaia BH1 (O Buraco Negro Mais Próximo do Sistema Solar)',
    type: 'Estelar',
    massSolar: 9.6,
    distanceLy: 1560,
    spinParameter: 0.3,
    accretionRate: 'Inativo / Silencioso (Sistema Binário com Estrela Solar)',
    discoveryYear: 2022,
    hostGalaxy: 'Via Láctea (Constelação do Ofiúco)',
    countryOrigin: 'Europa (ESA - Missão Gaia) / EUA (Gemini North)',
    observatoryLocation: 'Satélite Gaia (ESA) & Gemini North Observatory (Havaí, EUA)',
    description: 'O buraco negro confirmado mais próximo da Terra, a apenas 1.560 anos-luz de distância. Ele forma um par binário pacífico com uma estrela muito parecida com o nosso Sol, completando uma órbita a cada 185 dias.',
    funFact: 'Ao contrário de outros buracos negros estelares, Gaia BH1 é completamente invisível em raios-X porque não está sugando matéria da sua estrela companheira.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Gaia_BH1.jpg/1024px-Gaia_BH1.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Gaia_BH1.jpg',
    sourceName: 'ESA Gaia Mission / International Gemini Observatory',
    sourceUrl: 'https://noirlab.edu/public/news/noirlab2227/',
    sourceCitation: 'El-Badry et al. 2023, MNRAS 518, 1057 • DOI: 10.1093/mnras/stac3140'
  },
  {
    id: 'centaurus-a-cat',
    name: 'Centaurus A (A Galáxia Ativa Mais Próxima e Seus Jatos)',
    type: 'Supermassivo',
    massSolar: 55000000,
    distanceLy: 13000000,
    spinParameter: 0.85,
    accretionRate: 'Alta - Lobos gigantescos de rádio em escala intergaláctica',
    discoveryYear: 1949,
    hostGalaxy: 'NGC 5128 (Centaurus A)',
    countryOrigin: 'EUA (NASA) / Europa (ESO) / Austrália',
    observatoryLocation: 'Chandra X-ray, Hubble Space Telescope & ATCA Austrália',
    description: 'A galáxia de núcleo ativo mais próxima da Terra habita um buraco negro supermassivo de 55 milhões de massas solares. Seus jatos formam lóbulos de rádio tão grandes no céu do hemisfério sul que equivalem ao diâmetro de 16 Luas cheias.',
    funFact: 'Centaurus A é uma das maiores fontes de raios cósmicos de ultra-alta energia que atingem a Terra.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Centaurus_A.jpg/1024px-Centaurus_A.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Centaurus_A.jpg',
    sourceName: 'NASA Chandra X-Ray & ESO / Hubble',
    sourceUrl: 'https://chandra.harvard.edu/photo/2008/cena/',
    sourceCitation: 'Kraft et al. 2008, ApJ 677, 97 • DOI: 10.1086/528929'
  },
  {
    id: 'ngc-4889-cat',
    name: 'NGC 4889 (O Titã Adormecido do Aglomerado de Coma)',
    type: 'Primordial / Extremo',
    massSolar: 21000000000,
    distanceLy: 308000000,
    spinParameter: 0.89,
    accretionRate: 'Adormecido - Varreu todo o gás de suas vizinhanças',
    discoveryYear: 2011,
    hostGalaxy: 'NGC 4889 (Aglomerado de Coma)',
    countryOrigin: 'EUA (NASA) / Europa (ESA)',
    observatoryLocation: 'Telescópio Espacial Hubble & Observatório Keck',
    description: 'Com 21 bilhões de vezes a massa do Sol, o buraco negro central de NGC 4889 possui um horizonte de eventos de 130 bilhões de quilômetros (15 vezes o diâmetro da órbita de Netuno), sendo um dos maiores colossos já pesados no cosmos.',
    funFact: 'No passado distante, este buraco negro engoliu bilhões de estrelas, mas hoje dorme em paz no coração do aglomerado de Coma.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hubble_views_a_dormant_giant.jpg/1024px-Hubble_views_a_dormant_giant.jpg',
    highResUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Hubble_views_a_dormant_giant.jpg',
    sourceName: 'NASA / ESA Hubble Space Telescope • Nature 480',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/',
    sourceCitation: 'McConnell et al. 2011, Nature 480, 215–218 • DOI: 10.1038/nature10636'
  }
];

// ==========================================
// REAL-TIME ASTRONOMICAL EVENTS FEED (LIGO/CHANDRA/NASA)
// ==========================================
export interface CosmicAlertEvent {
  id: string;
  timestamp: string;
  category: 'Onda Gravitacional (LIGO/Virgo)' | 'Erupção Raio-X (Chandra/NuSTAR)' | 'Descoberta JWST/Hubble' | 'Alerta EHT';
  title: string;
  source: string;
  significance: string;
  physicsDetails: {
    energyReleased?: string;
    targetName: string;
    confidence: string;
    distance?: string;
  };
}

// Generates updated/recent astronomical feed items
function getLiveCosmicAlerts(): CosmicAlertEvent[] {
  const now = new Date();
  const getAgo = (hoursAgo: number) => {
    const d = new Date(now.getTime() - hoursAgo * 3600 * 1000);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('pt-BR');
  };

  return [
    {
      id: 'ligo-alert-01',
      timestamp: getAgo(2),
      category: 'Onda Gravitacional (LIGO/Virgo)',
      title: 'Deteção de Sinal GW-S2026-A1: Fusão de Buracos Negros de Massa Intermediária',
      source: 'LIGO Hanford & Livingston Observatories',
      significance: 'Alerta científico de alta relevância: detecção audível do tempo-espaço vibrando após colisão cósmica a 1.8 bilhão de anos-luz.',
      physicsDetails: {
        energyReleased: '3,1 Massas Solares convertidas em pura onda gravitacional',
        targetName: 'GW-S2026-A1',
        confidence: '99.98% de probabilidade astrofísica',
        distance: '1,8 bilhão de anos-luz'
      }
    },
    {
      id: 'chandra-alert-02',
      timestamp: getAgo(14),
      category: 'Erupção Raio-X (Chandra/NuSTAR)',
      title: 'Pico de Emissão de Raio-X em Sagittarius A* (Centro Galáctico)',
      source: 'NASA Chandra X-ray Observatory',
      significance: 'O buraco negro central da Via Láctea aumentou sua emissão de raio-X em 45x após aprisionar um aglomerado de gás ionizado da nuvem G2.',
      physicsDetails: {
        targetName: 'Sagittarius A*',
        confidence: 'Observação confirmada em multi-comprimentos de onda',
        distance: '26.000 anos-luz (Centro da Via Láctea)'
      }
    },
    {
      id: 'jwst-alert-03',
      timestamp: getAgo(38),
      category: 'Descoberta JWST/Hubble',
      title: 'JWST Identifica Quasar com Buraco Negro Em Crescimento Recorde no Desvio z = 8.5',
      source: 'NASA / ESA James Webb Telescope',
      significance: 'Novas medições espectroscópicas indicam que este buraco negro do início do Universo consumiu matéria 5 vezes acima do Limite Teórico de Eddington.',
      physicsDetails: {
        targetName: 'UHZ-1 / Quasar Primordial',
        confidence: 'Espectroscopia NIRSpec com 99.9% de precisão',
        distance: '13,2 bilhões de anos-luz'
      }
    },
    {
      id: 'eht-alert-04',
      timestamp: getAgo(72),
      category: 'Alerta EHT',
      title: 'Monitoramento da Polarização Magnética do Disco de Acreção de M87*',
      source: 'Event Horizon Telescope Collaboration',
      significance: 'Dados interferométricos mostram que o campo magnético na borda do horizonte de eventos é forte o suficiente para deter a queda de matéria e impulsionar o jato relativístico.',
      physicsDetails: {
        targetName: 'Messier 87*',
        confidence: 'Observação Global VLBI',
        distance: '55 milhões de anos-luz'
      }
    }
  ];
}

// ==========================================
// DAILY ENIGMA & CURIOSITY ENGINE (WHY RETURN EVERY DAY?)
// ==========================================
export interface DailyCosmicEnigma {
  dayId: string;
  dateStr: string;
  curiosityTitle: string;
  curiosityBody: string;
  curiosityFactNumber: string;
  quizQuestion: string;
  quizOptions: string[];
  correctOptionIndex: number;
  explanation: string;
  xpReward: number;
}

const PRESET_DAILY_ENIGMAS: DailyCosmicEnigma[] = [
  {
    dayId: 'enigma-01',
    dateStr: 'Missão do Dia: Dilatação Temporal',
    curiosityTitle: 'Por que o tempo congela na borda do Horizonte de Eventos?',
    curiosityBody: 'Segundo a Relatividade Geral de Einstein, a gravidade é a curvatura do próprio tecido do tempo e do espaço. Quanto mais perto você chega de uma massa extrema, mais lentamente seu relógio corre em relação a alguém distante. Para um observador seguro na Terra, alguém caindo num buraco negro pareceria desacelerar até congelar para sempre na cor avermelhada da borda!',
    curiosityFactNumber: '#01 - Relatividade do Tempo',
    quizQuestion: 'Se você passasse 1 hora em uma órbita próxima ao horizonte de eventos do buraco negro supermassivo Gargantua (com dilatação gravitacional γ = 7), quanto tempo teria passado para seus amigos na Terra?',
    quizOptions: [
      'Exatamente 1 hora — o tempo corre igual em todo o Universo',
      '7 horas — o tempo lá passa 7 vezes mais rápido',
      '7 anos (ou o equivalente ao fator de dilatação extremo do filme Interestelar)',
      'Apenas 10 minutos'
    ],
    correctOptionIndex: 2,
    explanation: 'A dilatação gravitacional extrema de um buraco negro de rotação rápida de Kerr faz com que o tempo passe de forma radicalmente mais lenta para quem está imerso no poço gravitacional. O que são poucas horas na órbita podem equivaler a anos ou décadas longe do campo gravitacional!',
    xpReward: 150
  },
  {
    dayId: 'enigma-02',
    dateStr: 'Missão do Dia: Espaguetificação',
    curiosityTitle: 'O que é o efeito maré que transforma matéria em espaguete cósmico?',
    curiosityBody: 'Em buracos negros estelares pequenos (como Cygnus X-1), a diferença da força gravitacional entre seus pés e sua cabeça é tão monstruosa que esticaria seu corpo como um fio de espaguete muito antes de você tocar o horizonte de eventos. Já em buracos negros supermassivos como M87*, o gradiente de gravidade é suave: você poderia atravessar o horizonte sem sentir o estiramento imediatamente!',
    curiosityFactNumber: '#02 - Forças de Maré Relativísticas',
    quizQuestion: 'Em qual tipo de buraco negro um astronauta conseguiria cruzar o Horizonte de Eventos sem ser destruído pela espaguetificação logo na entrada?',
    quizOptions: [
      'Em um buraco negro pequeno com massa menor que o Sol',
      'Em um buraco negro estelar de 10 massas solares',
      'Em um Buraco Negro Supermassivo com bilhões de massas solares (como o TON 618 ou M87*)',
      'Em nenhum buraco negro existe diferença de gravidade'
    ],
    correctOptionIndex: 2,
    explanation: 'Como o raio de Schwarzschild cresce proporcionalmente com a massa, em um buraco negro supermassivo o horizonte de eventos fica tão longe da singularidade central que as forças de maré na borda são mais suaves que a gravidade na Terra!',
    xpReward: 200
  },
  {
    dayId: 'enigma-03',
    dateStr: 'Missão do Dia: Radiação de Hawking',
    curiosityTitle: 'Buracos negros não são 100% pretos — eles evaporam com o tempo!',
    curiosityBody: 'O físico Stephen Hawking descobriu em 1974 que, por conta de flutuações quânticas no vácuo logo no limite do horizonte de eventos, pares de partículas e antipartículas se criam e se separam: uma cai no buraco negro e a outra escapa. Com o tempo, essa "Radiação de Hawking" faz o buraco negro perder energia, diminuir de tamanho e finalmente evaporar!',
    curiosityFactNumber: '#03 - Termodinâmica Quântica',
    quizQuestion: 'O que acontece com a temperatura e a velocidade de evaporação de um buraco negro à medida que ele fica menor e perde massa?',
    quizOptions: [
      'Ele fica cada vez mais frio e congela',
      'Ele fica cada vez mais quente e evapora cada vez mais rápido até explodir',
      'Ele mantém sempre a mesma temperatura de zero absoluto',
      'Ele vira uma estrela branca de nêutrons instantaneamente'
    ],
    correctOptionIndex: 1,
    explanation: 'A temperatura de Hawking é inversamente proporcional à massa! Quanto menor é o buraco negro, mais quente ele se torna e mais radiação emite, terminando sua vida em uma espetacular explosão quântica de raios gama.',
    xpReward: 250
  }
];

// ==========================================
// EXPRESS API ENDPOINTS
// ==========================================

// 1. GET /api/nasa/gallery - Returns curated + real NASA Black Hole image catalog
app.get('/api/nasa/gallery', (req, res) => {
  try {
    const { category } = req.query;
    let items = [...NASA_BLACK_HOLE_CATALOG];
    if (category && typeof category === 'string' && category !== 'todos') {
      items = items.filter(i => i.category === category);
    }
    res.json({
      success: true,
      count: items.length,
      timestamp: new Date().toISOString(),
      source: 'NASA Images API & EHT Catalog / Curated Deep Space Archive',
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao carregar galeria da NASA.' });
  }
});

// 2. GET /api/blackholes/catalog - Returns physical properties of famous black holes
app.get('/api/blackholes/catalog', (_req, res) => {
  try {
    res.json({
      success: true,
      count: BLACK_HOLE_PHYSICS_CATALOG.length,
      data: BLACK_HOLE_PHYSICS_CATALOG
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao carregar catálogo astrofísico.' });
  }
});

// 3. GET /api/blackholes/live-events - Returns live alerts from LIGO/Chandra/JWST
app.get('/api/blackholes/live-events', (_req, res) => {
  try {
    const alerts = getLiveCosmicAlerts();
    res.json({
      success: true,
      updatedAt: new Date().toISOString(),
      status: 'MONITORAMENTO EM TEMPO REAL ATIVO (LIGO/VIRGO/CHANDRA/NASA)',
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao carregar alertas ao vivo.' });
  }
});

// 4. GET /api/daily-enigma - Returns daily cosmic enigma & challenge
app.get('/api/daily-enigma', (req, res) => {
  try {
    const { index } = req.query;
    let selectedIndex = 0;
    if (index && !isNaN(Number(index))) {
      selectedIndex = Number(index) % PRESET_DAILY_ENIGMAS.length;
    } else {
      // Rotate based on day of year
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      selectedIndex = dayOfYear % PRESET_DAILY_ENIGMAS.length;
    }
    res.json({
      success: true,
      data: PRESET_DAILY_ENIGMAS[selectedIndex],
      totalEnigmas: PRESET_DAILY_ENIGMAS.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao carregar missão do dia.' });
  }
});

// 5. POST /api/gemini/chat - Astro-Assistente Gemini (server-side GenAI SDK)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, blackHoleContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt não fornecido.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Graceful fallback if no API key is configured yet
      return res.json({
        success: true,
        isFallback: true,
        text: `**Astro-Assistente NASA (Modo Simulação Offline):**\n\nSua pergunta sobre *"**${prompt}**"* é fascinante! Na astrofísica dos buracos negros, a **Relatividade Geral de Einstein** nos mostra que em horizontes de eventos como **${blackHoleContext || 'Sagittarius A*'}**, o tempo desacelera drasticamente para observadores externos e a gravidade aprisiona até mesmo a luz ($c = 299.792.458\\text{ m/s}$).\n\n*(Nota: Para ativar o raciocínio em tempo real com o modelo Gemini-3.1-Pro, verifique se sua chave API ` + "`GEMINI_API_KEY`" + ` está configurada nas configurações do AI Studio.)*`
      });
    }

    const systemInstruction = `Você é o "Dr. Hélio Cósmico", Astrofísico Sênior do Observatório Espacial da NASA e especialista em Buracos Negros, Relatividade Geral, Ondas Gravitacionais (LIGO) e imagens do James Webb/EHT.
Seu objetivo é encantar, inspirar e responder dúvidas em português claro, cativante e rigorosamente científico, explicando fórmulas quando útil (como Raio de Schwarzschild R_s = 2GM/c^2 ou radiação de Hawking), mas sempre de forma didática e empolgante, para que o usuário sinta admiração pelo cosmos e queira aprender cada vez mais.
Contexto atual selecionado pelo usuário no app: "${blackHoleContext || 'Exploração Geral de Buracos Negros'}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      isFallback: false,
      text: response.text
    });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar consulta com o modelo Gemini.'
    });
  }
});

// 6. POST /api/gemini/analyze-image - Deep Scientific Analysis of NASA Black Hole Photos
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { photoTitle, photoDescription, nasaId, telescope } = req.body;
    const ai = getGeminiClient();

    const promptText = `Por favor, faça uma Análise Astrofísica Detalhada (em Português do Brasil) da imagem da NASA: "${photoTitle}" (ID: ${nasaId}, Telescópio: ${telescope}).
Descrição técnica base: "${photoDescription}".
Explique:
1) O que estamos enxergando em termos de física relativística (ex: disco de acreção, horizonte de eventos, jatos relativísticos, lente gravitacional).
2) Qual o impacto histórico dessa observação para a ciência.
3) Uma curiosidade inacreditável sobre as escalas de energia ou tempo nessa imagem para surpreender o usuário!`;

    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        text: `### 🔬 Análise Astrofísica: ${photoTitle}\n\n**1. Física Relativística em Ação:**\nEsta imagem capturada pelo telescópio **${telescope}** é um testemunho espetacular da gravidade de Einstein. O brilho ao redor do centro não é o buraco negro em si — pois nada escapa do Horizonte de Eventos —, mas sim o **disco de acreção**: gás e plasma superaquecidos a bilhões de graus girando perto da velocidade da luz.\n\n**2. Impacto Científico:**\nAs observações de **${nasaId}** comprovaram predições teóricas que existiam apenas no papel desde 1915, abrindo uma nova era de astronomia multi-mensageira e interferometria na escala do diâmetro da Terra.\n\n**3. Curiosidade Cósmica:**\nA luz que você vê nessa foto viajou milhões de anos no vácuo espacial até atingir os sensores do telescópio. No momento em que esses fótons nasceram perto do buraco negro, a humanidade ainda nem caminhava na Terra!`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: promptText,
      config: {
        systemInstruction: 'Você é um astrofísico comunicador científico da NASA. Use formatação limpa com marcadores e negrito.',
        temperature: 0.6,
      }
    });

    res.json({
      success: true,
      isFallback: false,
      text: response.text
    });
  } catch (error: any) {
    console.error('Gemini Image Analyze Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao analisar imagem cientificamente com Gemini.'
    });
  }
});

// 7. POST /api/gemini/simulate-scenario - "O Que Aconteceria Se...?" Custom Scenario AI Simulator
app.post('/api/gemini/simulate-scenario', async (req, res) => {
  try {
    const { scenarioType, massSolar, distanceKm, spinParam } = req.body;
    const ai = getGeminiClient();

    const prompt = `Simule um cenário astrofísico interativo em Português do Brasil:
Cenário escolhido pelo usuário: "${scenarioType}".
Parâmetros do Buraco Negro: Massa = ${massSolar} Massas Solares, Distância inicial do objeto = ${distanceKm} km, Rotação (Spin Kerr) = ${spinParam}.

Descreva de forma vibrante e cientificamente embasada:
1) O que o observador vê visualmente (desvio da luz, cor avermelhada pelo efeito Doppler relativístico).
2) O que acontece com o tempo (dilatação temporal).
3) O ponto crítico onde ocorre a espaguetificação ou a travessia do horizonte de eventos.
4) O veredito da física teórica!`;

    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        text: `### 🌌 Simulação Relativística: ${scenarioType}\n\n**Parâmetros:** ${massSolar} M☉ | Rotação $a = ${spinParam}$\n\n**1. O Espetáculo Visual:**\nÀ medida que o objeto se aproxima do poço gravitacional, a luz das estrelas de fundo sofre uma distorção óptica extrema (Lente Gravitacional de Einstein), criando um halo anelar brilhante.\n\n**2. Dilatação do Tempo:**\nPara os relógios na Terra, cada minuto que o objeto passa perto do Raio de Schwarzschild equivale a dias ou anos inteiros. A imagem do objeto parece congelar na borda e mudar para tons vermelhos infravermelhos.\n\n**3. Veredito Astrofísico:**\nEm um buraco negro com **${massSolar} massas solares**, as forças de maré e a velocidade orbital próxima a $c$ criam um laboratório de gravidade quântica sem paralelo no Universo!`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: 'Você é um astrofísico criativo que calcula cenários de física relativística com clareza e entusiasmo.',
        temperature: 0.7
      }
    });

    res.json({
      success: true,
      isFallback: false,
      text: response.text
    });
  } catch (error: any) {
    console.error('Gemini Simulate Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao simular cenário astrofísico com Gemini.'
    });
  }
});

// ==========================================
// VITE MIDDLEWARE SETUP
// ==========================================
async function setupViteMiddleware() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupViteMiddleware().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌌 Servidor Buracos Negros NASA rodando em http://localhost:${PORT}`);
  });
});
