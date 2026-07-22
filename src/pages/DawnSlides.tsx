import { useState, useEffect } from 'react';
import { Presentation, Slide, SlideElement, SlideLayout, TransitionType, AnimationType, SlideAnimation } from '../types/slides';
import SlidesRibbon from '../components/slides/SlidesRibbon';
import SlideThumbnails from '../components/slides/SlideThumbnails';
import SlideCanvas from '../components/slides/SlideCanvas';
import SpeakerNotes from '../components/slides/SpeakerNotes';
import AnimationPane from '../components/slides/AnimationPane';
import PresenterModeModal from '../components/slides/PresenterModeModal';
import SmartArtModal from '../components/slides/SmartArtModal';
import ChartModal from '../components/slides/ChartModal';
import DawnLogoAnimated from '../components/DawnLogoAnimated';
import ZoomControls from '../components/ZoomControls';
import { Save, FolderOpen, FilePlus, Maximize2, Minimize2, Download } from 'lucide-react';
import { SmartArtData, ChartData } from '../types/slides';

interface DawnSlidesProps {
  immersiveMode?: boolean;
  onImmersiveModeChange?: (enabled: boolean) => void;
  lang?: 'vi' | 'en';
}

export default function DawnSlides({ immersiveMode = false, onImmersiveModeChange, lang = 'vi' }: DawnSlidesProps) {
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentFromBeginning, setPresentFromBeginning] = useState(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showGridlines, setShowGridlines] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [viewMode, setViewMode] = useState<'normal' | 'sorter'>('normal');
  const [isAnimPaneOpen, setIsAnimPaneOpen] = useState(false);
  const [isSmartArtModalOpen, setIsSmartArtModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Initial Presentation State
  const [presentation, setPresentation] = useState<Presentation>(() => ({
    id: 'pres-1',
    title: lang === 'vi' ? 'Bài trình chiếu chưa đặt tên' : 'Untitled Presentation',
    aspectRatio: '16:9',
    theme: 'modern',
    activeSlideId: 'slide-1',
    animations: [],
    slides: [
      {
        id: 'slide-1',
        title: lang === 'vi' ? 'Chào mừng đến với DawnSlides' : 'Welcome to DawnSlides',
        layout: 'title',
        backgroundFill: '#ffffff',
        transition: 'fade',
        transitionDurationMs: 500,
        speakerNotes: 'Ghi chú cho slide đầu tiên...',
        elements: [
          {
            id: 'title-elem',
            type: 'text',
            content: lang === 'vi' ? 'DawnSlides — Trình Chiếu Đỉnh Cao' : 'DawnSlides — Premium Presentation',
            x: 260,
            y: 260,
            width: 1400,
            height: 140,
            rotation: 0,
            zIndex: 1,
            fontSize: 56,
            bold: true,
            textAlign: 'center',
            textColor: '#1e293b',
          },
          {
            id: 'subtitle-elem',
            type: 'text',
            content: lang === 'vi' ? 'Được thiết kế cho DawnOffice • Trải nghiệm mượt mà 60fps' : 'Designed for DawnOffice • Smooth 60fps experience',
            x: 360,
            y: 440,
            width: 1200,
            height: 100,
            rotation: 0,
            zIndex: 2,
            fontSize: 28,
            textAlign: 'center',
            textColor: '#64748b',
          },
        ],
      },
    ],
  }));

  const activeSlideIndex = presentation.slides.findIndex(s => s.id === presentation.activeSlideId);
  const activeSlide = presentation.slides[activeSlideIndex >= 0 ? activeSlideIndex : 0];
  const selectedElement = activeSlide.elements.find(e => e.id === selectedElementId) || null;

  const startPresentation = (fromBeginning: boolean) => {
    setPresentFromBeginning(fromBeginning);
    setIsPresenting(true);
  };

  // Global PowerPoint Keybindings Engine
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isEditingText = document.activeElement && document.activeElement.getAttribute('contenteditable') === 'true';

      // F5: Start Presentation from Beginning (Slide 1)
      if (e.key === 'F5' && !e.shiftKey) {
        e.preventDefault();
        startPresentation(true);
        return;
      }

      // Shift + F5: Start Presentation from Current Active Slide
      if (e.key === 'F5' && e.shiftKey) {
        e.preventDefault();
        startPresentation(false);
        return;
      }

      // Ctrl + M: New Slide
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleAddSlide('title-content');
        return;
      }

      // Ctrl + D: Duplicate Slide / Selected Element
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedElementId) {
          const target = activeSlide.elements.find(el => el.id === selectedElementId);
          if (target) {
            handleAddElement({ ...target, x: target.x + 40, y: target.y + 40 });
          }
        } else {
          handleDuplicateSlide(presentation.activeSlideId);
        }
        return;
      }

      // Delete / Backspace (when not typing inside text box)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
        if (selectedElementId) {
          handleDeleteElement(selectedElementId);
        }
        return;
      }

      // Ctrl + S: Save
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        console.log('Saved Presentation');
        return;
      }

      // Ctrl + P: Export PDF / Print
      if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
        return;
      }

      // Arrow Nudge Keys for Selected Element
      if (selectedElementId && !isEditingText && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const target = activeSlide.elements.find(el => el.id === selectedElementId);
        if (target && !target.locked) {
          let dx = 0;
          let dy = 0;
          if (e.key === 'ArrowLeft') dx = -step;
          if (e.key === 'ArrowRight') dx = step;
          if (e.key === 'ArrowUp') dy = -step;
          if (e.key === 'ArrowDown') dy = step;
          handleUpdateElement(target.id, { x: target.x + dx, y: target.y + dy });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, presentation.activeSlideId, activeSlide]);

  // Slide Actions
  const handleSelectSlide = (id: string) => {
    setPresentation(prev => ({ ...prev, activeSlideId: id }));
    setSelectedElementId(null);
  };

  const handleAddSlide = (layout: SlideLayout) => {
    const newId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newId,
      title: lang === 'vi' ? `Slide Mới ${presentation.slides.length + 1}` : `New Slide ${presentation.slides.length + 1}`,
      layout,
      backgroundFill: '#ffffff',
      transition: 'none',
      transitionDurationMs: 300,
      speakerNotes: '',
      elements: [
        {
          id: `title-${Date.now()}`,
          type: 'text',
          content: lang === 'vi' ? 'Tiêu đề Slide Mới' : 'New Slide Title',
          x: 260,
          y: 200,
          width: 1400,
          height: 120,
          rotation: 0,
          zIndex: 1,
          fontSize: 44,
          bold: true,
          textAlign: 'center',
          textColor: '#1e293b',
        },
      ],
    };

    setPresentation(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide],
      activeSlideId: newId,
    }));
  };

  const handleDuplicateSlide = (id: string) => {
    const targetIndex = presentation.slides.findIndex(s => s.id === id);
    if (targetIndex < 0) return;
    const target = presentation.slides[targetIndex];
    const dupId = `slide-${Date.now()}`;
    const dupSlide: Slide = {
      ...target,
      id: dupId,
      title: `${target.title} (Bản sao)`,
      elements: target.elements.map(e => ({ ...e, id: `elem-${Math.random().toString(36).substring(2, 9)}` })),
    };

    const updatedSlides = [...presentation.slides];
    updatedSlides.splice(targetIndex + 1, 0, dupSlide);

    setPresentation(prev => ({
      ...prev,
      slides: updatedSlides,
      activeSlideId: dupId,
    }));
  };

  const handleDeleteSlide = (id: string) => {
    if (presentation.slides.length <= 1) return;
    const filtered = presentation.slides.filter(s => s.id !== id);
    setPresentation(prev => ({
      ...prev,
      slides: filtered,
      activeSlideId: filtered[0].id,
    }));
  };

  const handleToggleHideSlide = (id: string) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => (s.id === id ? { ...s, hidden: !s.hidden } : s)),
    }));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= presentation.slides.length) return;

    const newSlides = [...presentation.slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    setPresentation(prev => ({ ...prev, slides: newSlides }));
  };

  // Element Actions
  const handleAddElement = (elementData: Partial<SlideElement>) => {
    const elemId = `elem-${Date.now()}`;
    const newElement: SlideElement = {
      id: elemId,
      type: elementData.type || 'text',
      content: elementData.content || '',
      x: elementData.x || 600,
      y: elementData.y || 400,
      width: elementData.width || 400,
      height: elementData.height || 200,
      rotation: 0,
      zIndex: activeSlide.elements.length + 1,
      fontSize: elementData.fontSize || 24,
      textColor: elementData.textColor || '#000000',
      fillColor: elementData.fillColor,
      shapeKind: elementData.shapeKind,
      tableData: elementData.tableData,
      bold: elementData.bold,
      italic: elementData.italic,
      underline: elementData.underline,
      wordartGlow: elementData.wordartGlow,
    };

    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => (s.id === activeSlide.id ? { ...s, elements: [...s.elements, newElement] } : s)),
    }));
    setSelectedElementId(elemId);
  };

  const handleUpdateElement = (elementId: string, updates: Partial<SlideElement>) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s =>
        s.id === activeSlide.id
          ? {
              ...s,
              elements: s.elements.map(e => (e.id === elementId ? { ...e, ...updates } : e)),
            }
          : s
      ),
    }));
  };

  const handleDeleteElement = (elementId: string) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s =>
        s.id === activeSlide.id ? { ...s, elements: s.elements.filter(e => e.id !== elementId) } : s
      ),
    }));
    setSelectedElementId(null);
  };

  // Background & Transitions
  const handleUpdateSlideBackground = (bg: string) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => (s.id === activeSlide.id ? { ...s, backgroundFill: bg } : s)),
    }));
  };

  const handleUpdateSlideTransition = (transition: TransitionType) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => (s.id === activeSlide.id ? { ...s, transition } : s)),
    }));
  };

  const handleAddElementAnimation = (elementId: string, anim: AnimationType) => {
    const newAnim: SlideAnimation = {
      id: `anim-${Date.now()}`,
      elementId,
      type: anim,
      trigger: 'on-click',
      durationMs: 500,
      delayMs: 0,
    };
    setPresentation(prev => ({
      ...prev,
      animations: [...prev.animations, newAnim],
    }));
    setIsAnimPaneOpen(true);
  };

  const handleRemoveAnimation = (animId: string) => {
    setPresentation(prev => ({
      ...prev,
      animations: prev.animations.filter((a: SlideAnimation) => a.id !== animId),
    }));
  };

  const handleUpdateSlideTitle = (title: string) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => (s.id === activeSlide.id ? { ...s, title } : s)),
    }));
  };

  const handleUpdateNotes = (notes: string) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => (s.id === activeSlide.id ? { ...s, speakerNotes: notes } : s)),
    }));
  };

  const handleInsertSmartArt = (smartartData: SmartArtData) => {
    handleAddElement({
      type: 'smartart',
      smartartData,
      x: 360,
      y: 350,
      width: 1200,
      height: 380,
    });
  };

  const handleInsertChart = (chartData: ChartData) => {
    handleAddElement({
      type: 'chart',
      chartData,
      x: 460,
      y: 300,
      width: 1000,
      height: 480,
    });
  };

  const handleTriggerAIDesignIdeas = () => {
    // Apply a modern gradient background and reorganize active slide elements
    const gradientBgs = [
      'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
      'linear-gradient(135deg, #831843 0%, #ec4899 100%)',
    ];
    const randomBg = gradientBgs[Math.floor(Math.random() * gradientBgs.length)];
    handleUpdateSlideBackground(randomBg);

    // Apply dark mode text colors if background is dark gradient
    activeSlide.elements.forEach(el => {
      if (el.type === 'text' || el.type === 'wordart') {
        handleUpdateElement(el.id, { textColor: '#ffffff' });
      }
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  const isVi = lang === 'vi';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--do-color-surface)' }}>
      {/* Top File Bar */}
      <div className="toolbar" style={{ height: '40px', borderBottom: '1px solid var(--do-color-border)', gap: '8px', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: 12, borderRight: '1px solid var(--do-color-border)' }}>
          <DawnLogoAnimated size={26} showWordmark replayOnHover />
        </div>

        <div className="toolbar-group">
          <button className="do-btn" style={{ borderRadius: '10px' }} title="New"><FilePlus size={14} /> {isVi ? 'Mới' : 'New'}</button>
          <button className="do-btn" style={{ borderRadius: '10px' }} title="Open"><FolderOpen size={14} /> {isVi ? 'Mở' : 'Open'}</button>
          <button className="do-btn" style={{ borderRadius: '10px' }} title="Save (Ctrl+S)"><Save size={14} /> {isVi ? 'Lưu' : 'Save'}</button>
          <button className="do-btn" style={{ borderRadius: '10px' }} onClick={handleExportPDF} title="Export PDF (Ctrl+P)"><Download size={14} /> {isVi ? 'Xuất PDF' : 'Export'}</button>
        </div>

        <div style={{ marginLeft: '1rem', color: 'var(--do-color-text-muted)', fontSize: '0.85rem' }}>
          {presentation.title}
        </div>

        {onImmersiveModeChange && (
          <button className="do-btn-icon" style={{ marginLeft: 'auto', borderRadius: '10px' }} onClick={() => onImmersiveModeChange(!immersiveMode)}>
            {immersiveMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        )}
      </div>

      {/* Ribbon Bar */}
      <SlidesRibbon
        activeSlide={activeSlide}
        aspectRatio={presentation.aspectRatio}
        selectedElement={selectedElement}
        showGridlines={showGridlines}
        showGuides={showGuides}
        viewMode={viewMode}
        isAnimPaneOpen={isAnimPaneOpen}
        onAddElement={handleAddElement}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onUpdateSlideBackground={handleUpdateSlideBackground}
        onUpdateSlideTransition={handleUpdateSlideTransition}
        onAddElementAnimation={handleAddElementAnimation}
        onSetAspectRatio={ratio => setPresentation(prev => ({ ...prev, aspectRatio: ratio }))}
        onToggleGridlines={() => setShowGridlines(!showGridlines)}
        onToggleGuides={() => setShowGuides(!showGuides)}
        onSetViewMode={setViewMode}
        onToggleAnimPane={() => setIsAnimPaneOpen(!isAnimPaneOpen)}
        onStartPresentation={startPresentation}
        onExportPDF={handleExportPDF}
        onOpenSmartArtModal={() => setIsSmartArtModalOpen(true)}
        onOpenChartModal={() => setIsChartModalOpen(true)}
        onTriggerAIDesignIdeas={handleTriggerAIDesignIdeas}
        lang={lang}
        setLang={() => {}}
      />

      {/* Main Workspace Stage */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {viewMode === 'sorter' ? (
          /* Slide Sorter Grid View */
          <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', backgroundColor: 'var(--do-color-bg)' }}>
            {presentation.slides.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => { setPresentation(prev => ({ ...prev, activeSlideId: s.id })); setViewMode('normal'); }}
                style={{
                  backgroundColor: s.backgroundFill || '#fff',
                  aspectRatio: presentation.aspectRatio === '16:9' ? '16 / 9' : '4 / 3',
                  borderRadius: '12px',
                  border: `2px solid ${s.id === presentation.activeSlideId ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
                  boxShadow: 'var(--do-shadow-md)',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                  {idx + 1}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, textAlign: 'center', color: 'var(--do-color-text)' }}>
                  {s.title}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Normal Workspace: Left Sidebar Docked + Canvas + Right Animation Pane Drawer */
          <>
            <SlideThumbnails
              slides={presentation.slides}
              activeSlideId={presentation.activeSlideId}
              onSelectSlide={handleSelectSlide}
              onAddSlide={handleAddSlide}
              onDuplicateSlide={handleDuplicateSlide}
              onDeleteSlide={handleDeleteSlide}
              onToggleHideSlide={handleToggleHideSlide}
              onMoveSlide={handleMoveSlide}
              lang={lang}
            />

            <SlideCanvas
              slide={activeSlide}
              aspectRatio={presentation.aspectRatio}
              selectedElementId={selectedElementId}
              animations={presentation.animations}
              showGridlines={showGridlines}
              showGuides={showGuides}
              onSelectElement={setSelectedElementId}
              onUpdateElement={handleUpdateElement}
              onUpdateSlideTitle={handleUpdateSlideTitle}
              lang={lang}
            />

            <AnimationPane
              isOpen={isAnimPaneOpen}
              onClose={() => setIsAnimPaneOpen(false)}
              animations={presentation.animations}
              elements={activeSlide.elements}
              onRemoveAnimation={handleRemoveAnimation}
              onPreviewAnimations={() => console.log('Preview all animations')}
              lang={lang}
            />
          </>
        )}
      </div>

      {/* Collapsible Speaker Notes Panel */}
      {viewMode === 'normal' && (
        <SpeakerNotes
          notes={activeSlide.speakerNotes}
          onUpdateNotes={handleUpdateNotes}
          lang={lang}
        />
      )}

      {/* Bottom Status Bar */}
      <div
        style={{
          height: '26px',
          backgroundColor: 'var(--do-color-surface)',
          borderTop: '1px solid var(--do-color-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          fontSize: '11px',
          color: 'var(--do-color-text-muted)',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{isVi ? `Slide ${activeSlideIndex + 1} / ${presentation.slides.length}` : `Slide ${activeSlideIndex + 1} of ${presentation.slides.length}`}</span>
          <span>•</span>
          <span>{isVi ? `Bố cục: ${activeSlide.layout}` : `Layout: ${activeSlide.layout}`}</span>
          <span>•</span>
          <span>{isVi ? `Tỷ lệ: ${presentation.aspectRatio}` : `Ratio: ${presentation.aspectRatio}`}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Theme: {presentation.theme.toUpperCase()}</span>
          <ZoomControls zoom={zoom} onZoomChange={setZoom} lang={lang} />
        </div>
      </div>

      {/* Fullscreen Presentation Mode Modal */}
      {isPresenting && (
        <PresenterModeModal
          slides={presentation.slides.filter(s => !s.hidden)}
          initialSlideId={presentFromBeginning ? presentation.slides[0]?.id : presentation.activeSlideId}
          aspectRatio={presentation.aspectRatio}
          onClose={() => setIsPresenting(false)}
          lang={lang}
        />
      )}

      {/* SmartArt Graphic Insert Modal */}
      <SmartArtModal
        isOpen={isSmartArtModalOpen}
        onClose={() => setIsSmartArtModalOpen(false)}
        onInsert={handleInsertSmartArt}
        lang={lang}
      />

      {/* Data Chart Insert Modal */}
      <ChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        onInsert={handleInsertChart}
        lang={lang}
      />
    </div>
  );
}
