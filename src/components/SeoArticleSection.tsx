import React, { useEffect } from 'react';
import { ToolMeta } from '../types';
import { HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';

interface SeoArticleSectionProps {
  tool: ToolMeta;
  onSelectTool: (slug: string) => void;
}

export const SeoArticleSection: React.FC<SeoArticleSectionProps> = ({
  tool,
  onSelectTool,
}) => {
  // Inject Schema.org JSON-LD structured data dynamically
  useEffect(() => {
    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.name,
      description: tool.seoDescription,
      url: window.location.href,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'tool-jsonld';
    script.text = JSON.stringify(jsonLdData);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('tool-jsonld');
      if (existing) existing.remove();
    };
  }, [tool]);

  const relatedTools = TOOLS_DATA.filter((t) => tool.relatedToolIds.includes(t.id));

  return (
    <div className="w-full mt-12 space-y-12 border-t border-slate-200 dark:border-slate-800 pt-10 text-slate-700 dark:text-slate-300">
      {/* About Section */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          About {tool.name}
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {tool.aboutText}
        </p>
      </section>

      {/* How to Use Steps */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          How to Use {tool.name} (Step-by-Step)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tool.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                {index + 1}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Benefits */}
      <section className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Why Choose PixelCraft {tool.name}?
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <strong>Privacy First:</strong> Browser client-side rendering with zero uploads.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <strong>No Watermarks:</strong> Export clean graphics without branding.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <strong>Batch Ready:</strong> Process multiple files in a single pass.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <strong>Cross-Device:</strong> Works smoothly on Mobile, iPad, Mac & PC.
          </li>
        </ul>
      </section>

      {/* Frequently Asked Questions */}
      {tool.faqs.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            Frequently Asked Questions (FAQ)
          </h3>
          <div className="space-y-3">
            {tool.faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 font-medium transition cursor-pointer"
              >
                <summary className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white list-none flex justify-between items-center">
                  <span>{faq.question}</span>
                  <span className="text-indigo-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Related Image Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedTools.map((relTool) => (
              <button
                key={relTool.id}
                onClick={() => onSelectTool(relTool.slug)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-indigo-500 text-left transition group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {relTool.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {relTool.shortDesc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
