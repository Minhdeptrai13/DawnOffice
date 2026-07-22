import { ModuleType } from './Sidebar';
import { X, FilePlus, FolderOpen, FileText, Table, Presentation, Sparkles, ArrowRight } from 'lucide-react';
import { open as openFileDialog } from '@tauri-apps/plugin-dialog';

interface ModuleLaunchModalProps {
  isOpen: boolean;
  module: ModuleType | null;
  onClose: () => void;
  onCreateNew: () => void;
  onOpenFile: (filePath?: string) => void;
  lang?: 'vi' | 'en';
}

export default function ModuleLaunchModal({
  isOpen,
  module,
  onClose,
  onCreateNew,
  onOpenFile,
  lang = 'vi',
}: ModuleLaunchModalProps) {
  if (!isOpen || !module || module === 'welcome' || module === 'settings') return null;

  const isVi = lang === 'vi';

  // Handle Real Native Windows Explorer File Picker
  const handleRealNativeFilePicker = async () => {
    try {
      let extensions: string[] = [];
      let name = 'Document';

      if (module === 'document') {
        extensions = ['docx', 'doc', 'txt', 'md'];
        name = 'Word Document';
      } else if (module === 'spreadsheet') {
        extensions = ['xlsx', 'xls', 'csv'];
        name = 'Excel Spreadsheet';
      } else if (module === 'presentation') {
        extensions = ['pptx', 'ppt'];
        name = 'PowerPoint Presentation';
      }

      // Call Native Windows Explorer Open Dialog
      const selected = await openFileDialog({
        multiple: false,
        filters: [{ name, extensions }],
      });

      if (selected && typeof selected === 'string') {
        onOpenFile(selected);
      } else {
        onOpenFile();
      }
    } catch (err) {
      console.log('Native file dialog fallback:', err);
      onOpenFile();
    }
    onClose();
  };

  const getModuleInfo = () => {
    switch (module) {
      case 'document':
        return {
          title: 'DawnDocument',
          subtitle: isVi ? 'Trình Soạn Thảo Văn Bản Cao Cấp' : 'Advanced Word Processor',
          icon: <FileText size={32} color="#2563eb" />,
          bgColor: 'rgba(37, 99, 235, 0.1)',
          borderColor: '#2563eb',
          desc: isVi ? 'Soạn thảo văn bản Word, tài liệu hợp đồng, báo cáo chuẩn định dạng DOCX' : 'Create Word documents, contracts, and DOCX reports',
          features: [isVi ? 'Định dạng văn bản chuẩn Microsoft Word' : 'Standard MS Word formatting', isVi ? 'Xuất bản PDF & DOCX nguyên bản' : 'Export native PDF & DOCX', isVi ? 'Tích hợp Trợ lý AI sửa lỗi văn bản' : 'Integrated AI proofreading'],
        };
      case 'spreadsheet':
        return {
          title: 'DawnSheets',
          subtitle: isVi ? 'Trình Bảng Tính Dữ Liệu Thông Minh' : 'Smart Data Spreadsheet',
          icon: <Table size={32} color="#10b981" />,
          bgColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10b981',
          desc: isVi ? 'Bảng tính Excel với 50+ công thức, Pivot Table, AutoFilter & Sparklines' : 'Excel spreadsheet with 50+ formulas, Pivot Table & AutoFilter',
          features: [isVi ? 'Engine tính toán 50+ hàm chuẩn Excel' : '50+ standard Excel functions', isVi ? 'Bảng tổng hợp thông minh Pivot Table' : 'Smart Pivot Tables', isVi ? 'Định dạng điều kiện & Data Validation' : 'Conditional Formatting & Validation'],
        };
      case 'presentation':
        return {
          title: 'DawnSlides',
          subtitle: isVi ? 'Trình Thuyết Trình Slide Chuyên Nghiệp' : 'Professional Slide Presenter',
          icon: <Presentation size={32} color="#f59e0b" />,
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: '#f59e0b',
          desc: isVi ? 'Trình chiếu PowerPoint với SmartArt, Smart Alignment Guides & AI Ideas' : 'PowerPoint presentation with SmartArt & AI Design Ideas',
          features: [isVi ? 'Đường gióng canh chỉnh Smart Alignment Guides' : 'Smart Alignment Guides', isVi ? 'Sơ đồ tư duy SmartArt & Biểu đồ Chart' : 'SmartArt diagrams & Data Charts', isVi ? 'Ý tưởng thiết kế AI Ideas tự động' : 'Automatic AI Design Ideas'],
        };
      default:
        return null;
    }
  };

  const info = getModuleInfo();
  if (!info) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          width: '580px',
          backgroundColor: 'var(--do-color-surface)',
          borderRadius: '20px',
          boxShadow: 'var(--do-shadow-lg)',
          border: '1px solid var(--do-color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header Preview Banner */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            background: `linear-gradient(135deg, ${info.bgColor} 0%, rgba(255,255,255,0) 100%)`,
            borderBottom: '1px solid var(--do-color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: info.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {info.icon}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
                {info.title}
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.88rem', color: 'var(--do-color-text-muted)', fontWeight: 500 }}>
                {info.subtitle}
              </p>
            </div>
          </div>

          <button className="do-btn-icon" onClick={onClose} style={{ borderRadius: '10px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--do-color-text)', lineHeight: 1.5 }}>
            {info.desc}
          </p>

          {/* Features Check List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'var(--do-color-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--do-color-border)' }}>
            {info.features.map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--do-color-text-muted)' }}>
                <Sparkles size={13} color={info.borderColor} />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* 2 Main Action Cards: Create Blank vs Open Native File */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            {/* Card 1: Create Blank */}
            <div
              onClick={() => {
                onCreateNew();
                onClose();
              }}
              style={{
                backgroundColor: 'var(--do-color-bg)',
                borderRadius: '14px',
                padding: '1.25rem',
                border: `2px solid ${info.borderColor}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: info.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FilePlus size={20} color={info.borderColor} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--do-color-text)' }}>
                {isVi ? 'Tạo Mới Bản Trống' : 'Create Blank'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--do-color-text-muted)', lineHeight: 1.3 }}>
                {isVi ? 'Bắt đầu làm việc với một tệp hoàn toàn mới' : 'Start working with a brand new empty file'}
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: info.borderColor }}>
                <span>{isVi ? 'Bắt đầu ngay' : 'Start now'}</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 2: Open Native Windows File Dialog */}
            <div
              onClick={handleRealNativeFilePicker}
              style={{
                backgroundColor: 'var(--do-color-bg)',
                borderRadius: '14px',
                padding: '1.25rem',
                border: '1px solid var(--do-color-border)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = info.borderColor)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--do-color-border)')}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--do-color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--do-color-border)' }}>
                <FolderOpen size={20} color="var(--do-color-text)" />
              </div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--do-color-text)' }}>
                {isVi ? 'Mở Thư Mục Windows' : 'Open Windows Folder'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--do-color-text-muted)', lineHeight: 1.3 }}>
                {isVi ? 'Bật hộp thoại Windows Explorer để chọn tệp thực tế' : 'Open Native Windows Explorer File Picker'}
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--do-color-text)' }}>
                <span>{isVi ? 'Bật Explorer' : 'Launch Explorer'}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
