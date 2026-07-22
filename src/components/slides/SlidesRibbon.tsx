import { useState, useEffect } from 'react';
import { Slide, SlideElement, TransitionType, AnimationType } from '../../types/slides';
import EffectPreviewBox from './EffectPreviewBox';
import {
  Play, Square, Circle, Triangle, Star, ArrowRight, Type,
  Image as ImageIcon, Table as TableIcon, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Globe, Trash2, Layers,
  Grid, Eye, Download, Sparkles, Sliders, Zap, Lock, Unlock, Palette,
  BarChart2, Network, Wand2
} from 'lucide-react';

interface SlidesRibbonProps {
  activeSlide: Slide;
  aspectRatio: '16:9' | '4:3';
  selectedElement: SlideElement | null;
  showGridlines: boolean;
  showGuides: boolean;
  viewMode: 'normal' | 'sorter';
  isAnimPaneOpen: boolean;
  onAddElement: (element: Partial<SlideElement>) => void;
  onUpdateElement: (elementId: string, updates: Partial<SlideElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onUpdateSlideBackground: (bg: string) => void;
  onUpdateSlideTransition: (transition: TransitionType) => void;
  onAddElementAnimation: (elementId: string, anim: AnimationType) => void;
  onSetAspectRatio: (ratio: '16:9' | '4:3') => void;
  onToggleGridlines: () => void;
  onToggleGuides: () => void;
  onSetViewMode: (mode: 'normal' | 'sorter') => void;
  onToggleAnimPane: () => void;
  onStartPresentation: (fromBeginning: boolean) => void;
  onExportPDF: () => void;
  onOpenSmartArtModal?: () => void;
  onOpenChartModal?: () => void;
  onTriggerAIDesignIdeas?: () => void;
  lang: 'vi' | 'en';
  setLang: (l: 'vi' | 'en') => void;
}

type RibbonTab = 'home' | 'insert' | 'design' | 'format' | 'transitions' | 'animations' | 'slideshow' | 'view';

interface TransitionCardMeta {
  id: TransitionType;
  name: string;
  desc: string;
}

interface AnimationCardMeta {
  id: AnimationType;
  name: string;
  desc: string;
}

export default function SlidesRibbon({
  activeSlide,
  aspectRatio,
  selectedElement,
  showGridlines,
  showGuides,
  viewMode,
  isAnimPaneOpen,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onUpdateSlideBackground,
  onUpdateSlideTransition,
  onAddElementAnimation,
  onSetAspectRatio,
  onToggleGridlines,
  onToggleGuides,
  onSetViewMode,
  onToggleAnimPane,
  onStartPresentation,
  onExportPDF,
  onOpenSmartArtModal,
  onOpenChartModal,
  onTriggerAIDesignIdeas,
  lang,
  setLang,
}: SlidesRibbonProps) {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [hoveredEffect, setHoveredEffect] = useState<{ name: string; desc: string } | null>(null);

  const isVi = lang === 'vi';

  // Automatically switch to 'format' tab when an element is selected (PowerPoint behavior)
  useEffect(() => {
    if (selectedElement) {
      setActiveTab('format');
    }
  }, [selectedElement?.id]);

  const baseTabs: { id: RibbonTab; label: string }[] = [
    { id: 'home', label: isVi ? 'Trang chủ' : 'Home' },
    { id: 'insert', label: isVi ? 'Chèn' : 'Insert' },
    { id: 'design', label: isVi ? 'Thiết kế' : 'Design' },
    { id: 'transitions', label: isVi ? 'Chuyển cảnh' : 'Transitions' },
    { id: 'animations', label: isVi ? 'Hiệu ứng' : 'Animations' },
    { id: 'slideshow', label: isVi ? 'Trình chiếu' : 'Slide Show' },
    { id: 'view', label: isVi ? 'Hiển thị & Xuất' : 'View & Export' },
  ];

  const tabs = selectedElement
    ? [
        ...baseTabs.slice(0, 3),
        { id: 'format' as RibbonTab, label: isVi ? '✨ Định dạng Đối tượng' : '✨ Shape Format' },
        ...baseTabs.slice(3),
      ]
    : baseTabs;

  const bgColors = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#1e293b', '#0f172a',
    'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #831843 0%, #ec4899 100%)',
    'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
  ];

  const fillColors = [
    '#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444',
    '#1e293b', '#ffffff', 'transparent'
  ];

  const transitionCards: TransitionCardMeta[] = [
    { id: 'none', name: isVi ? 'Không' : 'None', desc: 'Không sử dụng hiệu ứng chuyển slide' },
    { id: 'fade', name: isVi ? 'Mờ dần' : 'Fade', desc: 'Slide mờ dần mịn màng mượt mà 60fps' },
    { id: 'push', name: isVi ? 'Đẩy' : 'Push', desc: 'Slide mới đẩy slide cũ từ dưới lên trên' },
    { id: 'wipe', name: isVi ? 'Lướt' : 'Wipe', desc: 'Quét màng lướt ngang tinh tế' },
    { id: 'split', name: isVi ? 'Tách' : 'Split', desc: 'Slide mở ra từ trung tâm 2 bên' },
    { id: 'zoom', name: isVi ? 'Phóng' : 'Zoom', desc: 'Slide mới thu phóng từ xa vào tâm' },
    { id: 'flip', name: isVi ? 'Lật 3D' : '3D Flip', desc: 'Lật thẻ slide trong không gian 3D' },
    { id: 'dissolve', name: isVi ? 'Hòa tan' : 'Dissolve', desc: 'Điểm ảnh hòa tan mịn như pha lê' },
    { id: 'morph', name: isVi ? 'Morph' : 'Morph', desc: 'Tự động biến đổi mượt các đối tượng trùng khớp' },
  ];

  const animationCards: AnimationCardMeta[] = [
    { id: 'none', name: isVi ? 'Không' : 'None', desc: 'Gỡ bỏ hiệu ứng đối tượng' },
    { id: 'fade-in', name: isVi ? 'Mờ vào' : 'Fade In', desc: 'Đối tượng xuất hiện mờ dần' },
    { id: 'fly-in', name: isVi ? 'Bay vào' : 'Fly In', desc: 'Đối tượng bay từ dưới vào canvas' },
    { id: 'zoom-in', name: isVi ? 'Phóng to' : 'Zoom In', desc: 'Phóng từ nhỏ thành to chính xác' },
    { id: 'bounce-in', name: isVi ? 'Nảy vào' : 'Bounce', desc: 'Hiệu ứng nảy vật lý sinh động' },
    { id: 'pulse', name: isVi ? 'Nhịp đập' : 'Pulse', desc: 'Nhấn mạnh đối tượng bằng nhịp đập nhẹ' },
    { id: 'spin', name: isVi ? 'Xoay tròn' : 'Spin', desc: 'Đối tượng xoay 360 độ nhấn mạnh' },
    { id: 'color-flash', name: isVi ? 'Đổi màu' : 'Flash', desc: 'Đổi màu biến đổi liên tục' },
    { id: 'fly-out', name: isVi ? 'Bay ra' : 'Fly Out', desc: 'Biến mất bằng cách bay ra ngoài màn hình' },
  ];

  return (
    <div className="ribbon-bar" style={{ backgroundColor: 'var(--do-color-surface)', borderBottom: '1px solid var(--do-color-border)' }}>
      {/* Ribbon Tabs Bar */}
      <div className="ribbon-tabs" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--do-color-border)', padding: '0 1rem', gap: '4px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`ribbon-tab ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: tab.id === 'format' ? 'var(--do-color-primary)' : activeTab === tab.id ? 'var(--do-color-primary)' : 'var(--do-color-text)',
              backgroundColor: tab.id === 'format' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid var(--do-color-primary)' : '2px solid transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
            }}
          >
            {tab.label}
          </button>
        ))}

        {/* Play Presentation & Language Toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onStartPresentation(true)}
            className="do-btn"
            style={{ backgroundColor: 'var(--do-color-primary)', color: '#fff', border: 'none', gap: '6px', borderRadius: '10px' }}
            title={isVi ? "Trình chiếu từ đầu (F5)" : "Start Presentation (F5)"}
          >
            <Play size={14} fill="#fff" />
            {isVi ? 'Trình chiếu (F5)' : 'Slide Show'}
          </button>
          <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="do-btn-icon" style={{ borderRadius: '10px' }} title="Toggle Language">
            <Globe size={16} />
            <span style={{ fontSize: '11px', fontWeight: 600, marginLeft: '3px' }}>{lang.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="ribbon-panel" style={{ display: 'flex', alignItems: 'center', padding: '10px 1rem', gap: '16px', minHeight: '74px', overflowX: 'auto', position: 'relative' }}>
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => onAddElement({ type: 'text', content: isVi ? 'Tiêu đề mới' : 'New Title', fontSize: 44, bold: true, width: 800, height: 120, x: 560, y: 300 })}
                className="do-btn"
                style={{ borderRadius: '10px' }}
              >
                <Type size={15} /> {isVi ? 'Thêm Văn bản' : 'Add Text'}
              </button>
              <button
                onClick={() => onTriggerAIDesignIdeas && onTriggerAIDesignIdeas()}
                className="do-btn"
                style={{ borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#ffffff', border: 'none' }}
                title={isVi ? "Gợi ý bố cục AI Designer" : "AI Design Ideas"}
              >
                <Wand2 size={15} /> {isVi ? 'Ý Tưởng AI' : 'AI Ideas'}
              </button>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            {/* Character Formatting */}
            <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                disabled={!selectedElement || (selectedElement.type !== 'text' && selectedElement.type !== 'wordart')}
                onClick={() => selectedElement && onUpdateElement(selectedElement.id, { bold: !selectedElement.bold })}
                className={`do-btn-icon ${selectedElement?.bold ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
                title="Bold"
              >
                <Bold size={15} />
              </button>
              <button
                disabled={!selectedElement || (selectedElement.type !== 'text' && selectedElement.type !== 'wordart')}
                onClick={() => selectedElement && onUpdateElement(selectedElement.id, { italic: !selectedElement.italic })}
                className={`do-btn-icon ${selectedElement?.italic ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
                title="Italic"
              >
                <Italic size={15} />
              </button>
              <button
                disabled={!selectedElement || (selectedElement.type !== 'text' && selectedElement.type !== 'wordart')}
                onClick={() => selectedElement && onUpdateElement(selectedElement.id, { underline: !selectedElement.underline })}
                className={`do-btn-icon ${selectedElement?.underline ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
                title="Underline"
              >
                <Underline size={15} />
              </button>
              <button
                disabled={!selectedElement || (selectedElement.type !== 'text' && selectedElement.type !== 'wordart')}
                onClick={() => selectedElement && onUpdateElement(selectedElement.id, { strikethrough: !selectedElement.strikethrough })}
                className={`do-btn-icon ${selectedElement?.strikethrough ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
                title="Strikethrough"
              >
                <Strikethrough size={15} />
              </button>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            {/* Alignment */}
            <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                disabled={!selectedElement}
                onClick={() => selectedElement && onUpdateElement(selectedElement.id, { textAlign: 'left' })}
                className={`do-btn-icon ${selectedElement?.textAlign === 'left' ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
                title="Align Left"
              >
                <AlignLeft size={15} />
              </button>
              <button
                disabled={!selectedElement}
                onClick={() => selectedElement && onUpdateElement(selectedElement.id, { textAlign: 'center' })}
                className={`do-btn-icon ${selectedElement?.textAlign === 'center' ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
                title="Align Center"
              >
                <AlignCenter size={15} />
              </button>
              <button
                disabled={!selectedElement}
                onClick={() => selectedElement && onUpdateElement(selectedElement.id, { textAlign: 'right' })}
                className={`do-btn-icon ${selectedElement?.textAlign === 'right' ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
                title="Align Right"
              >
                <AlignRight size={15} />
              </button>
              <button
                disabled={!selectedElement}
                onClick={() => selectedElement && onUpdateElement(selectedElement.id, { textAlign: 'justify' })}
                className={`do-btn-icon ${selectedElement?.textAlign === 'justify' ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
                title="Justify"
              >
                <AlignJustify size={15} />
              </button>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            {/* Layering & Actions */}
            <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                disabled={!selectedElement}
                onClick={() => selectedElement && onUpdateElement(selectedElement.id, { zIndex: selectedElement.zIndex + 1 })}
                className="do-btn"
                style={{ borderRadius: '10px' }}
                title="Bring Forward"
              >
                <Layers size={14} /> {isVi ? 'Lên trên' : 'Bring Forward'}
              </button>
              <button
                disabled={!selectedElement}
                onClick={() => selectedElement && onUpdateElement(selectedElement.id, { locked: !selectedElement.locked })}
                className={`do-btn ${selectedElement?.locked ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
                title={selectedElement?.locked ? "Unlock Object" : "Lock Object"}
              >
                {selectedElement?.locked ? <Lock size={14} /> : <Unlock size={14} />}
                {selectedElement?.locked ? (isVi ? 'Đã khóa' : 'Locked') : (isVi ? 'Khóa' : 'Lock')}
              </button>
              <button
                disabled={!selectedElement}
                onClick={() => selectedElement && onDeleteElement(selectedElement.id)}
                className="do-btn-icon"
                style={{ color: '#ef4444', borderRadius: '10px' }}
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </>
        )}

        {/* CONTEXTUAL FORMAT TAB FOR SELECTED OBJECT (POWERPOINT FORMAT TAB) */}
        {activeTab === 'format' && selectedElement && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--do-color-primary)' }}>
                <Palette size={14} style={{ marginRight: '4px' }} />
                {isVi ? 'Màu nền Fill:' : 'Shape Fill:'}
              </span>
              {fillColors.map((col, i) => (
                <div
                  key={i}
                  onClick={() => onUpdateElement(selectedElement.id, { fillColor: col })}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: col,
                    border: '1.5px solid var(--do-color-border)',
                    cursor: 'pointer',
                    boxShadow: selectedElement.fillColor === col ? '0 0 0 2px var(--do-color-primary)' : 'none',
                  }}
                  title={col}
                />
              ))}
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => onUpdateElement(selectedElement.id, { wordartGlow: !selectedElement.wordartGlow })}
                className={`do-btn ${selectedElement.wordartGlow ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
              >
                <Sparkles size={14} style={{ marginRight: '4px' }} /> {isVi ? 'Hiệu ứng 3D Glow' : '3D Glow Effect'}
              </button>
              <button
                onClick={() => onUpdateElement(selectedElement.id, { shadow: !selectedElement.shadow })}
                className={`do-btn ${selectedElement.shadow ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
              >
                {isVi ? 'Đổ bóng (Shadow)' : 'Drop Shadow'}
              </button>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => onUpdateElement(selectedElement.id, { zIndex: selectedElement.zIndex + 1 })}
                className="do-btn"
                style={{ borderRadius: '10px' }}
              >
                <Layers size={14} style={{ marginRight: '4px' }} /> {isVi ? 'Chuyển lên trước' : 'Bring Forward'}
              </button>
              <button
                onClick={() => onDeleteElement(selectedElement.id)}
                className="do-btn"
                style={{ color: '#ef4444', borderRadius: '10px' }}
              >
                <Trash2 size={14} style={{ marginRight: '4px' }} /> {isVi ? 'Xóa' : 'Delete'}
              </button>
            </div>
          </>
        )}

        {/* INSERT TAB */}
        {activeTab === 'insert' && (
          <>
            <button
              onClick={() => onAddElement({ type: 'text', content: isVi ? 'Khung văn bản' : 'Text Box', fontSize: 24, width: 600, height: 100, x: 660, y: 400 })}
              className="do-btn"
              style={{ borderRadius: '10px' }}
            >
              <Type size={15} /> {isVi ? 'Hộp văn bản' : 'Text Box'}
            </button>
            <button
              onClick={() => onAddElement({ type: 'wordart', content: 'DAWN WORDART 3D', fontSize: 40, bold: true, wordartGlow: true, width: 700, height: 120, x: 610, y: 350 })}
              className="do-btn"
              style={{ borderRadius: '10px' }}
            >
              <Sparkles size={15} /> {isVi ? 'WordArt 3D' : 'WordArt'}
            </button>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            {/* Vector Shapes Library */}
            <button
              onClick={() => onAddElement({ type: 'shape', shapeKind: 'rectangle', content: 'Rectangle', fillColor: 'var(--do-color-primary)', width: 300, height: 180, x: 800, y: 400 })}
              className="do-btn-icon"
              style={{ borderRadius: '10px' }}
              title="Rectangle"
            >
              <Square size={16} />
            </button>
            <button
              onClick={() => onAddElement({ type: 'shape', shapeKind: 'circle', content: 'Circle', fillColor: '#ec4899', width: 200, height: 200, x: 860, y: 400 })}
              className="do-btn-icon"
              style={{ borderRadius: '10px' }}
              title="Circle"
            >
              <Circle size={16} />
            </button>
            <button
              onClick={() => onAddElement({ type: 'shape', shapeKind: 'triangle', content: 'Triangle', fillColor: '#10b981', width: 220, height: 200, x: 850, y: 400 })}
              className="do-btn-icon"
              style={{ borderRadius: '10px' }}
              title="Triangle"
            >
              <Triangle size={16} />
            </button>
            <button
              onClick={() => onAddElement({ type: 'shape', shapeKind: 'star', content: 'Star', fillColor: '#f59e0b', width: 200, height: 200, x: 860, y: 400 })}
              className="do-btn-icon"
              style={{ borderRadius: '10px' }}
              title="Star"
            >
              <Star size={16} />
            </button>
            <button
              onClick={() => onAddElement({ type: 'shape', shapeKind: 'arrow-right', content: 'Arrow', fillColor: '#8b5cf6', width: 280, height: 140, x: 820, y: 430 })}
              className="do-btn-icon"
              style={{ borderRadius: '10px' }}
              title="Arrow"
            >
              <ArrowRight size={16} />
            </button>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            <button
              onClick={() => onAddElement({ type: 'image', content: 'https://picsum.photos/600/400', width: 600, height: 400, x: 660, y: 300 })}
              className="do-btn"
              style={{ borderRadius: '10px' }}
            >
              <ImageIcon size={15} /> {isVi ? 'Hình ảnh' : 'Image'}
            </button>
            <button
              onClick={() => onAddElement({ type: 'table', tableData: [['Cột 1', 'Cột 2', 'Cột 3'], ['Dữ liệu 1', 'Dữ liệu 2', 'Dữ liệu 3']], width: 700, height: 200, x: 610, y: 400 })}
              className="do-btn"
              style={{ borderRadius: '10px' }}
            >
              <TableIcon size={15} /> {isVi ? 'Bảng biểu' : 'Table'}
            </button>
            <button
              onClick={() => onOpenSmartArtModal && onOpenSmartArtModal()}
              className="do-btn"
              style={{ borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--do-color-primary)' }}
            >
              <Network size={15} /> {isVi ? 'SmartArt' : 'SmartArt'}
            </button>
            <button
              onClick={() => onOpenChartModal && onOpenChartModal()}
              className="do-btn"
              style={{ borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
            >
              <BarChart2 size={15} /> {isVi ? 'Biểu đồ' : 'Chart'}
            </button>
          </>
        )}

        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{isVi ? 'Tỷ lệ Slide:' : 'Aspect Ratio:'}</span>
              <button
                onClick={() => onSetAspectRatio('16:9')}
                className={`do-btn ${aspectRatio === '16:9' ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
              >
                16:9 (Widescreen)
              </button>
              <button
                onClick={() => onSetAspectRatio('4:3')}
                className={`do-btn ${aspectRatio === '4:3' ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
              >
                4:3 (Standard)
              </button>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{isVi ? 'Màu nền Slide:' : 'Background:'}</span>
              {bgColors.map((color, i) => (
                <div
                  key={i}
                  onClick={() => onUpdateSlideBackground(color)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    background: color,
                    border: '1px solid var(--do-color-border)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* TRANSITIONS TAB — LIVE ANIMATED PREVIEW BOXES */}
        {activeTab === 'transitions' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {transitionCards.map(tc => {
              const isSelected = activeSlide.transition === tc.id;
              return (
                <div
                  key={tc.id}
                  onClick={() => onUpdateSlideTransition(tc.id)}
                  onMouseEnter={() => setHoveredEffect({ name: tc.name, desc: tc.desc })}
                  onMouseLeave={() => setHoveredEffect(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'var(--do-color-bg)',
                    color: isSelected ? 'var(--do-color-primary)' : 'var(--do-color-text)',
                    border: `1.5px solid ${isSelected ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
                    cursor: 'pointer',
                    minWidth: '76px',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.25)' : 'none',
                  }}
                >
                  <EffectPreviewBox type="transition" effectId={tc.id} isSelected={isSelected} />
                  <div style={{ fontSize: '11px', fontWeight: 600, borderTop: '1px solid var(--do-color-border)', width: '100%', textAlign: 'center', paddingTop: '3px' }}>
                    {tc.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ANIMATIONS TAB — LIVE ANIMATED PREVIEW BOXES */}
        {activeTab === 'animations' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onToggleAnimPane}
              className={`do-btn ${isAnimPaneOpen ? 'active' : ''}`}
              style={{ borderRadius: '10px', backgroundColor: 'var(--do-color-primary)', color: '#fff', border: 'none' }}
            >
              <Zap size={14} style={{ marginRight: '4px' }} />
              {isVi ? 'Bảng Hiệu ứng' : 'Animation Pane'}
            </button>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            {animationCards.map(ac => (
              <div
                key={ac.id}
                onClick={() => selectedElement && onAddElementAnimation(selectedElement.id, ac.id)}
                onMouseEnter={() => setHoveredEffect({ name: ac.name, desc: ac.desc })}
                onMouseLeave={() => setHoveredEffect(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--do-color-bg)',
                  color: 'var(--do-color-text)',
                  border: '1.5px solid var(--do-color-border)',
                  cursor: selectedElement ? 'pointer' : 'not-allowed',
                  opacity: selectedElement ? 1 : 0.5,
                  minWidth: '76px',
                  transition: 'all 0.18s ease',
                }}
              >
                <EffectPreviewBox type="animation" effectId={ac.id} />
                <div style={{ fontSize: '11px', fontWeight: 600, borderTop: '1px solid var(--do-color-border)', width: '100%', textAlign: 'center', paddingTop: '3px' }}>
                  {ac.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SLIDE SHOW TAB */}
        {activeTab === 'slideshow' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => onStartPresentation(true)} className="do-btn" style={{ backgroundColor: 'var(--do-color-primary)', color: '#fff', borderRadius: '10px' }}>
              <Play size={15} style={{ marginRight: '6px' }} /> {isVi ? 'Từ đầu (F5)' : 'From Beginning (F5)'}
            </button>
            <button onClick={() => onStartPresentation(false)} className="do-btn" style={{ borderRadius: '10px' }}>
              <Play size={15} style={{ marginRight: '6px' }} /> {isVi ? 'Từ slide hiện tại (Shift+F5)' : 'From Current Slide'}
            </button>
          </div>
        )}

        {/* VIEW & EXPORT TAB */}
        {activeTab === 'view' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{isVi ? 'Chế độ xem:' : 'View Mode:'}</span>
              <button
                onClick={() => onSetViewMode('normal')}
                className={`do-btn ${viewMode === 'normal' ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
              >
                <Eye size={14} style={{ marginRight: '4px' }} /> {isVi ? 'Thường' : 'Normal'}
              </button>
              <button
                onClick={() => onSetViewMode('sorter')}
                className={`do-btn ${viewMode === 'sorter' ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
              >
                <Grid size={14} style={{ marginRight: '4px' }} /> {isVi ? 'Lưới Slide Sorter' : 'Slide Sorter'}
              </button>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onToggleGridlines}
                className={`do-btn ${showGridlines ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
              >
                <Grid size={14} style={{ marginRight: '4px' }} /> {isVi ? 'Lưới tọa độ' : 'Gridlines'}
              </button>
              <button
                onClick={onToggleGuides}
                className={`do-btn ${showGuides ? 'active' : ''}`}
                style={{ borderRadius: '10px' }}
              >
                <Sliders size={14} style={{ marginRight: '4px' }} /> {isVi ? 'Đường gióng' : 'Guides'}
              </button>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            <button onClick={onExportPDF} className="do-btn" style={{ color: 'var(--do-color-primary)', borderRadius: '10px' }}>
              <Download size={14} style={{ marginRight: '4px' }} /> {isVi ? 'Xuất PDF / In' : 'Export PDF'}
            </button>
          </>
        )}
      </div>

      {/* Interactive Tooltip Card Preview when Hovering over Effects */}
      {hoveredEffect && (
        <div
          style={{
            position: 'absolute',
            bottom: '-48px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--do-color-surface)',
            border: '1px solid var(--do-color-primary)',
            boxShadow: 'var(--do-shadow-lg)',
            borderRadius: '12px',
            padding: '8px 16px',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <Sparkles size={16} color="var(--do-color-primary)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--do-color-primary)' }}>{hoveredEffect.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--do-color-text-muted)' }}>{hoveredEffect.desc}</div>
          </div>
        </div>
      )}
    </div>
  );
}
