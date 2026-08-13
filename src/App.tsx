import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CategoryNav } from './components/CategoryNav';
import { ToolCard } from './components/ToolCard';
import { Breadcrumbs } from './components/Breadcrumbs';
import { PrivacyBanner } from './components/PrivacyBanner';
import { SeoArticleSection } from './components/SeoArticleSection';
import { SearchModal } from './components/SearchModal';
import { Toast, ToastMessage } from './components/Toast';
import { AdContainer } from './components/AdContainer';

import { TOOL_CATEGORIES, TOOLS_DATA } from './data/toolsData';
import { ThemeMode, ToolMeta } from './types';

// Tool Components
import { CompressorTool } from './components/tools/CompressorTool';
import { ResizerTool } from './components/tools/ResizerTool';
import { CropperTool } from './components/tools/CropperTool';
import { GenericBatchTool } from './components/tools/GenericBatchTool';
import { PassportPhotoTool } from './components/tools/PassportPhotoTool';
import { SignatureMakerTool } from './components/tools/SignatureMakerTool';
import { FaviconGeneratorTool } from './components/tools/FaviconGeneratorTool';
import { MemeGeneratorTool } from './components/tools/MemeGeneratorTool';
import { CollageMakerTool } from './components/tools/CollageMakerTool';
import { ImageSplitterTool } from './components/tools/ImageSplitterTool';
import { SocialResizerTool } from './components/tools/SocialResizerTool';
import { MetadataInspectorTool } from './components/tools/MetadataInspectorTool';
import { ColorPickerTool } from './components/tools/ColorPickerTool';
import { DimensionsCheckerTool } from './components/tools/DimensionsCheckerTool';
import { Base64ConverterTool } from './components/tools/Base64ConverterTool';
import { RotateTool } from './components/tools/RotateTool';
import { WatermarkTool } from './components/tools/WatermarkTool';
import { TextOverlayTool } from './components/tools/TextOverlayTool';
import { BlurPixelateTool } from './components/tools/BlurPixelateTool';
import { PdfConverterTool } from './components/tools/PdfConverterTool';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedToolSlug, setSelectedToolSlug] = useState<string | null>(null);
  const [activeStaticPage, setActiveStaticPage] = useState<'privacy' | 'terms' | 'sitemap' | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pixelcraft_favorites');
      return saved ? JSON.parse(saved) : ['image-compressor', 'image-resizer', 'passport-photo-maker'];
    } catch {
      return ['image-compressor', 'image-resizer', 'passport-photo-maker'];
    }
  });

  const [recentSlugs, setRecentSlugs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pixelcraft_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Apply Theme Mode class to HTML document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Keyboard shortcut for Cmd/Ctrl + K search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ id: Math.random().toString(), text, type });
  };

  const handleToggleFavorite = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem('pixelcraft_favorites', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const handleSelectTool = (slug: string) => {
    setSelectedToolSlug(slug);
    setActiveStaticPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track recently used
    setRecentSlugs((prev) => {
      const updated = [slug, ...prev.filter((s) => s !== slug)].slice(0, 10);
      try {
        localStorage.setItem('pixelcraft_recent', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const handleNavigateHome = () => {
    setSelectedToolSlug(null);
    setActiveCategory('all');
    setActiveStaticPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    setSelectedToolSlug(null);
    setActiveStaticPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find active tool metadata
  const activeTool = TOOLS_DATA.find((t) => t.slug === selectedToolSlug);
  const activeCategoryMeta = TOOL_CATEGORIES.find((c) => c.id === activeCategory);

  // Filter tools for grid view
  const displayTools = TOOLS_DATA.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  // Render Tool Component mapping
  const renderToolComponent = (tool: ToolMeta) => {
    switch (tool.id) {
      case 'image-compressor':
      case 'jpg-compressor':
      case 'png-compressor':
      case 'webp-compressor':
      case 'image-optimizer':
        return <CompressorTool onShowToast={showToast} />;

      case 'image-resizer':
        return <ResizerTool onShowToast={showToast} />;

      case 'image-cropper':
        return <CropperTool onShowToast={showToast} />;

      case 'passport-photo-maker':
        return <PassportPhotoTool onShowToast={showToast} />;

      case 'social-media-resizer':
        return <SocialResizerTool onShowToast={showToast} />;

      case 'jpg-to-png':
      case 'png-to-jpg':
      case 'jpg-to-webp':
      case 'png-to-webp':
      case 'webp-to-jpg':
      case 'webp-to-png':
      case 'image-converter':
        return <GenericBatchTool onShowToast={showToast} targetToolId={tool.id} />;

      case 'image-rotator':
        return <RotateTool onShowToast={showToast} />;

      case 'watermark-image':
        return <WatermarkTool onShowToast={showToast} />;

      case 'add-text-to-image':
        return <TextOverlayTool onShowToast={showToast} />;

      case 'image-blur-pixelate':
        return <BlurPixelateTool onShowToast={showToast} />;

      case 'signature-maker':
        return <SignatureMakerTool onShowToast={showToast} />;

      case 'favicon-generator':
        return <FaviconGeneratorTool onShowToast={showToast} />;

      case 'meme-generator':
        return <MemeGeneratorTool onShowToast={showToast} />;

      case 'collage-maker':
        return <CollageMakerTool onShowToast={showToast} />;

      case 'image-splitter':
        return <ImageSplitterTool onShowToast={showToast} />;

      case 'image-to-pdf':
        return <PdfConverterTool onShowToast={showToast} />;

      case 'image-metadata-viewer':
        return <MetadataInspectorTool onShowToast={showToast} />;

      case 'color-picker-tool':
        return <ColorPickerTool onShowToast={showToast} />;

      case 'image-dimensions-checker':
        return <DimensionsCheckerTool onShowToast={showToast} />;

      case 'base64-converter':
        return <Base64ConverterTool onShowToast={showToast} />;

      default:
        return <CompressorTool onShowToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Navigation Header */}
      <Header
        currentTheme={theme}
        onThemeChange={setTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateHome={handleNavigateHome}
        onSelectCategory={handleSelectCategory}
        onSelectTool={handleSelectTool}
        favoritesCount={favorites.length}
      />

      {/* Main Page Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Ad Banner */}
        <AdContainer type="top-banner" />

        {/* Static Page View (Privacy / Terms / Sitemap) */}
        {activeStaticPage ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
            <Breadcrumbs
              toolName={activeStaticPage.toUpperCase()}
              onNavigateHome={handleNavigateHome}
            />

            {activeStaticPage === 'privacy' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-black">Privacy Policy</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  PixelCraft is committed to 100% data privacy. All image operations (compression, resizing, converting, watermarking, background edits) are performed locally in your browser using Client-Side HTML5 Canvas & WebAssembly capabilities.
                </p>
                <h3 className="font-bold text-base mt-4">Zero Server Storage</h3>
                <p className="text-xs text-slate-500">
                  Your uploaded photos, passports, signatures, or documents are never transmitted to external cloud servers, databases, or analytics engines.
                </p>
              </div>
            )}

            {activeStaticPage === 'terms' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-black">Terms of Service</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  PixelCraft provides free online image tools for personal and commercial usage without watermarks or forced registrations.
                </p>
              </div>
            )}

            {activeStaticPage === 'sitemap' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-black">HTML Directory Sitemap</h1>
                <p className="text-xs text-slate-500">Explore all 30+ browser-based image utilities:</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {TOOL_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 border-b pb-1">
                        {cat.name}
                      </h4>
                      <ul className="space-y-1 text-xs">
                        {TOOLS_DATA.filter((t) => t.category === cat.id).map((t) => (
                          <li key={t.id}>
                            <button
                              onClick={() => handleSelectTool(t.slug)}
                              className="hover:underline text-slate-700 dark:text-slate-300"
                            >
                              {t.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTool ? (
          /* SINGLE TOOL VIEW */
          <div className="space-y-6 animate-fade-in">
            {/* Breadcrumb Navigation */}
            <Breadcrumbs
              toolName={activeTool.name}
              categoryName={activeCategoryMeta?.name || activeTool.category.toUpperCase()}
              onNavigateHome={handleNavigateHome}
              onNavigateCategory={() => handleSelectCategory(activeTool.category)}
            />

            {/* Tool Header Title & Description */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {activeTool.category}
                    </span>
                    {activeTool.popular && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        Popular Tool
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {activeTool.h1Title || activeTool.name}
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                    {activeTool.shortDesc}
                  </p>
                </div>

                <button
                  onClick={(e) => handleToggleFavorite(activeTool.slug, e)}
                  className={`self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                    favorites.includes(activeTool.slug)
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  ★ {favorites.includes(activeTool.slug) ? 'Saved in Favorites' : 'Add to Favorites'}
                </button>
              </div>

              {/* Active Interactive Tool Engine */}
              {renderToolComponent(activeTool)}
            </div>

            {/* Privacy Guarantee Banner */}
            <PrivacyBanner />

            {/* SEO Articles, How-to Steps, FAQs, and Related Tools */}
            <SeoArticleSection tool={activeTool} onSelectTool={handleSelectTool} />
          </div>
        ) : (
          /* HOMEPAGE / CATEGORY DASHBOARD VIEW */
          <div className="space-y-8 animate-fade-in">
            {/* Hero Banner Section */}
            <div className="relative rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-indigo-500/20">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                  ⚡ PixelCraft Free Online Image Studio
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Professional Image Tools. <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
                    100% Client-Side & Free.
                  </span>
                </h1>
                <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
                  Compress, resize, crop, convert formats, generate passport photos, create signatures, and optimize graphics directly inside your browser with maximum speed and complete privacy.
                </p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeCategory === 'all'
                    ? 'Explore Image Tools (30+)'
                    : activeCategoryMeta?.name}
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  Showing {displayTools.length} Tools
                </span>
              </div>

              <CategoryNav
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={handleSelectTool}
                  isFavorite={favorites.includes(tool.slug)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {/* Privacy Guarantee Banner */}
            <PrivacyBanner />
          </div>
        )}

        {/* In-Content Banner Ad */}
        <AdContainer type="in-content" />
      </main>

      {/* Footer Directory */}
      <Footer
        onNavigateHome={handleNavigateHome}
        onSelectTool={handleSelectTool}
        onSelectCategory={handleSelectCategory}
        onNavigatePage={(page) => setActiveStaticPage(page)}
      />

      {/* Global Modals & Notifications */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={handleSelectTool}
        favorites={favorites}
        recentSlugs={recentSlugs}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
