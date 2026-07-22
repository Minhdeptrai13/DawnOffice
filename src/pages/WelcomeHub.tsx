import { useState } from 'react';
import DawnLogoAnimated from '../components/DawnLogoAnimated';
import { ModuleType } from '../components/Sidebar';
import {
  FileText, Table, Presentation, Search, Sparkles,
  ArrowRight, Clock, Layout
} from 'lucide-react';

interface WelcomeHubProps {
  onSelectModule: (module: ModuleType) => void;
  lang?: 'vi' | 'en';
}

interface TemplateItem {
  id: string;
  module: ModuleType;
  title: string;
  desc: string;
  category: string;
  color: string;
  badge?: string;
}

export default function WelcomeHub({ onSelectModule, lang = 'vi' }: WelcomeHubProps) {
  const isVi = lang === 'vi';
  const [searchQuery, setSearchQuery] = useState('');

  const templates: TemplateItem[] = [
    {
      id: 'tpl-1',
      module: 'document',
      title: isVi ? 'Sơ Yếu Lý Lịch & CV Chuyên Nghiệp' : 'Professional CV & Resume',
      desc: isVi ? 'Mẫu CV chuẩn ấn tượng cho công việc mới' : 'Modern CV layout for job applications',
      category: isVi ? 'Văn bản' : 'Document',
      color: '#2563eb',
      badge: 'HOT',
    },
    {
      id: 'tpl-2',
      module: 'spreadsheet',
      title: isVi ? 'Báo Cáo Tài Chính & Doanh Thu Q4' : 'Q4 Financial & Revenue Sheet',
      desc: isVi ? 'Bảng tính tích hợp sẵn công thức SUM, AVERAGE, Chart' : 'Pre-built formula spreadsheet with charts',
      category: isVi ? 'Bảng tính' : 'Spreadsheet',
      color: '#10b981',
      badge: 'PRO',
    },
    {
      id: 'tpl-3',
      module: 'presentation',
      title: isVi ? 'Slide Thuyết Trình Gọi Vốn PitchDeck' : 'Pitch Deck Presentation',
      desc: isVi ? 'Bộ slide 10 trang thiết kế chuẩn startup' : '10-page startup pitch deck template',
      category: isVi ? 'Trình chiếu' : 'Presentation',
      color: '#f59e0b',
      badge: 'NEW',
    },
    {
      id: 'tpl-4',
      module: 'document',
      title: isVi ? 'Báo Cáo Kế Hoạch Dự Án' : 'Project Plan Report',
      desc: isVi ? 'Bản thảo kế hoạch công việc và lộ trình' : 'Project roadmap and document template',
      category: isVi ? 'Văn bản' : 'Document',
      color: '#8b5cf6',
    },
  ];

  const recentFiles = [
    { id: 'rf-1', name: isVi ? 'Báo cáo doanh thu tháng 7.xlsx' : 'July Sales Report.xlsx', module: 'spreadsheet' as ModuleType, time: isVi ? '10 phút trước' : '10 mins ago', size: '1.2 MB' },
    { id: 'rf-2', name: isVi ? 'Slide ra mắt sản phẩm v2.pptx' : 'Product Launch Slide.pptx', module: 'presentation' as ModuleType, time: isVi ? '2 giờ trước' : '2 hours ago', size: '4.5 MB' },
    { id: 'rf-3', name: isVi ? 'Hợp đồng kinh tế DawnOffice.docx' : 'DawnOffice Contract.docx', module: 'document' as ModuleType, time: isVi ? 'Hôm qua' : 'Yesterday', size: '640 KB' },
  ];

  const filteredTemplates = templates.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'var(--do-color-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Aurora Glassmorphism Hero Section */}
      <div
        style={{
          position: 'relative',
          padding: '2.5rem 3rem 2rem 3rem',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(236, 72, 153, 0.08) 100%)',
          borderBottom: '1px solid var(--do-color-border)',
          overflow: 'hidden',
        }}
      >
        {/* Glow Spheres Backdrop */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '10%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none',
            filter: 'blur(40px)',
          }}
        />

        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Header Title & Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
            <DawnLogoAnimated size={54} showWordmark={false} replayOnHover />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, color: 'var(--do-color-text)', letterSpacing: '-0.5px' }}>
                  DawnOffice
                </h1>
                <span
                  style={{
                    backgroundColor: 'var(--do-color-primary)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  v2.5 PRO
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '1rem', color: 'var(--do-color-text-muted)', fontWeight: 500 }}>
                {isVi ? 'Siêu ứng dụng Văn phòng Thế hệ Mới — Nhanh mượt, Thông minh & Đột phá' : 'Next-Generation Office Suite — Ultra Fast, Intelligent & Powerful'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div
            style={{
              position: 'relative',
              maxWidth: '640px',
              marginTop: '1.5rem',
            }}
          >
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--do-color-text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isVi ? 'Tìm kiếm mẫu thiết kế, tệp gần đây hoặc từ khóa...' : 'Search templates, recent files or keywords...'}
              style={{
                width: '100%',
                padding: '12px 16px 12px 46px',
                borderRadius: '14px',
                border: '1px solid var(--do-color-border)',
                backgroundColor: 'var(--do-color-surface)',
                boxShadow: 'var(--do-shadow-md)',
                fontSize: '0.95rem',
                outline: 'none',
                color: 'var(--do-color-text)',
                transition: 'all 0.2s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ flex: 1, padding: '2rem 3rem', maxWidth: '1100px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* 1. Quick Launch Cards (Tạo mới nhanh) */}
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--do-color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--do-color-primary)" />
            {isVi ? 'Khởi Tạo Nhanh Bài Làm Việc' : 'Quick Start Workspaces'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {/* DawnDocument Card */}
            <div
              onClick={() => onSelectModule('document')}
              style={{
                backgroundColor: 'var(--do-color-surface)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid var(--do-color-border)',
                boxShadow: 'var(--do-shadow-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '90px', height: '90px', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <FileText size={24} color="#2563eb" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--do-color-text)' }}>
                  DawnDocument
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--do-color-text-muted)', lineHeight: 1.4 }}>
                  {isVi ? 'Soạn thảo văn bản Word, tài liệu hợp đồng, báo cáo chuyên nghiệp' : 'Word processor for documents, contracts and reports'}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>
                <span>+ {isVi ? 'Tạo Văn Bản Mới' : 'New Document'}</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* DawnSheets Card */}
            <div
              onClick={() => onSelectModule('spreadsheet')}
              style={{
                backgroundColor: 'var(--do-color-surface)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid var(--do-color-border)',
                boxShadow: 'var(--do-shadow-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '90px', height: '90px', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Table size={24} color="#10b981" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--do-color-text)' }}>
                  DawnSheets
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--do-color-text-muted)', lineHeight: 1.4 }}>
                  {isVi ? 'Bảng tính Excel với 50+ công thức, Pivot Table & AutoFilter' : 'Excel spreadsheet with 50+ formulas & Pivot Table'}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
                <span>+ {isVi ? 'Tạo Bảng Tính Mới' : 'New Spreadsheet'}</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* DawnSlides Card */}
            <div
              onClick={() => onSelectModule('presentation')}
              style={{
                backgroundColor: 'var(--do-color-surface)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid var(--do-color-border)',
                boxShadow: 'var(--do-shadow-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '90px', height: '90px', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Presentation size={24} color="#f59e0b" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--do-color-text)' }}>
                  DawnSlides
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--do-color-text-muted)', lineHeight: 1.4 }}>
                  {isVi ? 'Trình chiếu PowerPoint với SmartArt, Smart Guides & AI Ideas' : 'PowerPoint presentation with SmartArt & Smart Guides'}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>
                <span>+ {isVi ? 'Tạo Slide Mới' : 'New Presentation'}</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Templates Gallery (Thư viện mẫu) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--do-color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layout size={18} color="#8b5cf6" />
              {isVi ? 'Thư Viện Mẫu Thiết Kế Sẵn' : 'Template Gallery'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--do-color-primary)', fontWeight: 600, cursor: 'pointer' }}>
              {isVi ? 'Xem tất cả' : 'View all'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {filteredTemplates.map(tpl => (
              <div
                key={tpl.id}
                onClick={() => onSelectModule(tpl.module)}
                style={{
                  backgroundColor: 'var(--do-color-surface)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid var(--do-color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = tpl.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--do-color-border)')}
              >
                {tpl.badge && (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: tpl.color, color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>
                    {tpl.badge}
                  </span>
                )}
                <div style={{ fontSize: '11px', fontWeight: 700, color: tpl.color, textTransform: 'uppercase' }}>
                  {tpl.category}
                </div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--do-color-text)', lineHeight: 1.3 }}>
                  {tpl.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--do-color-text-muted)', lineHeight: 1.3 }}>
                  {tpl.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Recent Files List (Tệp gần đây) */}
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--do-color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--do-color-text-muted)" />
            {isVi ? 'Tệp Gần Đây' : 'Recent Files'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentFiles.map(file => (
              <div
                key={file.id}
                onClick={() => onSelectModule(file.module)}
                style={{
                  backgroundColor: 'var(--do-color-surface)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--do-color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--do-color-surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--do-color-surface)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {file.module === 'document' && <FileText size={18} color="#2563eb" />}
                  {file.module === 'spreadsheet' && <Table size={18} color="#10b981" />}
                  {file.module === 'presentation' && <Presentation size={18} color="#f59e0b" />}
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--do-color-text)' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--do-color-text-muted)' }}>
                      {file.time} • {file.size}
                    </div>
                  </div>
                </div>

                <button className="do-btn" style={{ borderRadius: '6px', fontSize: '0.8rem' }}>
                  {isVi ? 'Mở' : 'Open'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
