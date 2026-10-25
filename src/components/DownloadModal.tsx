import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEngine } from '../audio/soundEngine';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  Apple,
  FileCode,
  CheckCircle2,
  Sparkles,
  WifiOff,
  ExternalLink,
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeGuide, setActiveGuide] = useState<'android' | 'ios' | 'pc'>('android');
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    soundEngine.playSound('coin');
    const success = await install();
    if (success) {
      soundEngine.playSound('victory');
    }
  };

  const handleDownloadHtml = () => {
    soundEngine.playSound('coin');
    setDownloadStarted(true);

    // Direct link to the standalone HTML asset
    const link = document.createElement('a');
    link.href = '/assets/aistudio/ARCADE_MARTIN_-_Gold_Games3.0_3f1a94e6.html';
    link.download = 'Arcade_Martin_Gold_Games.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadStarted(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#111322] border border-amber-500/50 rounded-2xl p-5 md:p-6 shadow-2xl relative text-slate-200 font-mono max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-400 text-2xl shadow-lg shadow-amber-500/10">
            <Download size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wider text-white flex items-center gap-2">
              <span>DESCARGAR & JUGAR OFFLINE</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                GRATIS
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instala la aplicación en tu móvil/PC o descarga el archivo autónomo .HTML
            </p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Option 1: PWA Native App Install */}
          <div className="bg-[#15192c] border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone size={15} />
                  <span>Opción 1: Instalar como App</span>
                </span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                  Recomendado
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Instala el juego directamente en la pantalla de inicio de tu teléfono o escritorio. Se abre sin barras de navegador y funciona sin internet.
              </p>

              <div className="space-y-1.5 text-[11px] text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Icono propio en pantalla de inicio</span>
                </div>
                <div className="flex items-center gap-2">
                  <WifiOff size={13} className="text-emerald-400 shrink-0" />
                  <span>Juega sin conexión en cualquier lugar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-emerald-400 shrink-0" />
                  <span>Guarda monedas, mejoras y logros</span>
                </div>
              </div>
            </div>

            {/* Install Button or status */}
            {isInstalled ? (
              <div className="py-2.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>¡APLICACIÓN YA INSTALADA!</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <Download size={15} />
                <span>INSTALAR AHORA EN DISPOSITIVO</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 text-center py-2 bg-slate-900/60 rounded-lg border border-slate-800">
                Sigue las instrucciones abajo según tu móvil
              </div>
            )}
          </div>

          {/* Option 2: Standalone .HTML File */}
          <div className="bg-[#15192c] border border-slate-700 hover:border-slate-600 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode size={15} className="text-cyan-400" />
                  <span>Opción 2: Archivo .HTML</span>
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                  Autónomo
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Descarga un archivo único <code>.html</code> con el juego completo integrado. Solo haz doble clic para jugar en cualquier navegador (PC, Mac, Android o pendrive).
              </p>

              <div className="space-y-1.5 text-[11px] text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                  <span>No requiere servidor ni instalación</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                  <span>Pesa menos de 25 KB</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                  <span>Compártelo por WhatsApp o correo</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadHtml}
              className="w-full py-2.5 px-4 rounded-lg bg-[#222744] hover:bg-[#2c3358] text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-600 active:scale-98 transition-all cursor-pointer"
            >
              <Download size={15} className="text-amber-400" />
              <span>{downloadStarted ? '¡DESCARGANDO...!' : 'DESCARGAR ARCHIVO .HTML'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Installation Guides */}
        <div className="bg-[#0e101c] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Guía paso a paso para añadir al inicio:
            </h3>

            {/* Platform Selector */}
            <div className="flex items-center gap-1 bg-[#15192c] p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveGuide('android')}
                className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
                  activeGuide === 'android'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone size={12} />
                <span>Android</span>
              </button>
              <button
                onClick={() => setActiveGuide('ios')}
                className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
                  activeGuide === 'ios'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Apple size={12} />
                <span>iPhone / iPad</span>
              </button>
              <button
                onClick={() => setActiveGuide('pc')}
                className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
                  activeGuide === 'pc'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop size={12} />
                <span>PC / Mac</span>
              </button>
            </div>
          </div>

          {/* Guide Content */}
          {activeGuide === 'android' && (
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <p>
                  Abre la página en <strong>Google Chrome</strong> en tu móvil Android.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </span>
                <p>
                  Toca los <strong>tres puntos verticales (⋮)</strong> en la esquina superior derecha del navegador.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </span>
                <p>
                  Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>. ¡Listo! El icono aparecerá junto a tus juegos.
                </p>
              </div>
            </div>
          )}

          {activeGuide === 'ios' && (
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <p>
                  Abre este juego en el navegador <strong>Safari</strong> de tu iPhone o iPad.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </span>
                <p>
                  Toca el botón <strong>Compartir</strong> (el icono de un cuadrado con una flecha hacia arriba en la barra inferior).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </span>
                <p>
                  Baja y pulsa en <strong>"Añadir a pantalla de inicio"</strong> y luego en "Añadir". Se abrirá a pantalla completa como una app nativa.
                </p>
              </div>
            </div>
          )}

          {activeGuide === 'pc' && (
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <p>
                  En <strong>Google Chrome, Microsoft Edge o Brave</strong>, fíjate en el extremo derecho de la barra de direcciones URL.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </span>
                <p>
                  Haz clic en el icono pequeño de <strong>Instalar</strong> (un ordenador con una flecha hacia abajo).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </span>
                <p>
                  Confirma <strong>"Instalar"</strong>. Se creará un acceso directo en tu escritorio para abrirlo instantáneamente en su propia ventana.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
