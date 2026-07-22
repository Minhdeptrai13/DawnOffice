import { useState } from 'react';
import { ChartKind, ChartData } from '../../types/slides';
import { X, BarChart2, TrendingUp, PieChart, BarChart3 } from 'lucide-react';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (chartData: ChartData) => void;
  lang: 'vi' | 'en';
}

export default function ChartModal({ isOpen, onClose, onInsert, lang }: ChartModalProps) {
  const isVi = lang === 'vi';

  const [kind, setKind] = useState<ChartKind>('column');
  const [title, setTitle] = useState(isVi ? 'Biểu đồ Doanh Thu Q1-Q4' : 'Q1-Q4 Revenue Chart');
  const [labelsStr, setLabelsStr] = useState('Q1, Q2, Q3, Q4');
  const [valStr, setValStr] = useState('120, 190, 300, 250');
  const [seriesName, setSeriesName] = useState(isVi ? 'Doanh Thu ($K)' : 'Revenue ($K)');
  const [color, setColor] = useState('#2563eb');

  if (!isOpen) return null;

  const handleInsert = () => {
    const labels = labelsStr.split(',').map(s => s.trim()).filter(Boolean);
    const values = valStr.split(',').map(s => parseFloat(s.trim()) || 0);

    const chartData: ChartData = {
      kind,
      title,
      labels: labels.length > 0 ? labels : ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: seriesName,
          values: values.length > 0 ? values : [100, 200, 150, 300],
          color,
        },
      ],
    };

    onInsert(chartData);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '580px',
          backgroundColor: 'var(--do-color-surface)',
          borderRadius: '16px',
          boxShadow: 'var(--do-shadow-lg)',
          border: '1px solid var(--do-color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--do-color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--do-color-text)' }}>
            📊 {isVi ? 'Chèn Biểu Đồ Dữ Liệu' : 'Insert Data Chart'}
          </h3>
          <button className="do-btn-icon" onClick={onClose} style={{ borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Chart Kind */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--do-color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              {isVi ? 'Loại Biểu Đồ:' : 'Chart Type:'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <button
                onClick={() => setKind('column')}
                className={`do-btn ${kind === 'column' ? 'active' : ''}`}
                style={{ flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '6px', borderRadius: '10px', border: kind === 'column' ? '2px solid var(--do-color-primary)' : '1px solid var(--do-color-border)' }}
              >
                <BarChart3 size={20} color="var(--do-color-primary)" />
                <span style={{ fontSize: '0.8rem' }}>{isVi ? 'Cột' : 'Column'}</span>
              </button>
              <button
                onClick={() => setKind('bar')}
                className={`do-btn ${kind === 'bar' ? 'active' : ''}`}
                style={{ flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '6px', borderRadius: '10px', border: kind === 'bar' ? '2px solid var(--do-color-primary)' : '1px solid var(--do-color-border)' }}
              >
                <BarChart2 size={20} color="#10b981" />
                <span style={{ fontSize: '0.8rem' }}>{isVi ? 'Thanh' : 'Bar'}</span>
              </button>
              <button
                onClick={() => setKind('line')}
                className={`do-btn ${kind === 'line' ? 'active' : ''}`}
                style={{ flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '6px', borderRadius: '10px', border: kind === 'line' ? '2px solid var(--do-color-primary)' : '1px solid var(--do-color-border)' }}
              >
                <TrendingUp size={20} color="#f59e0b" />
                <span style={{ fontSize: '0.8rem' }}>{isVi ? 'Đường' : 'Line'}</span>
              </button>
              <button
                onClick={() => setKind('pie')}
                className={`do-btn ${kind === 'pie' ? 'active' : ''}`}
                style={{ flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '6px', borderRadius: '10px', border: kind === 'pie' ? '2px solid var(--do-color-primary)' : '1px solid var(--do-color-border)' }}
              >
                <PieChart size={20} color="#ec4899" />
                <span style={{ fontSize: '0.8rem' }}>{isVi ? 'Tròn' : 'Pie'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                {isVi ? 'Tiêu đề Biểu đồ:' : 'Chart Title:'}
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                {isVi ? 'Các Nhãn Trục X (cách nhau bởi dấu phẩy):' : 'X-Axis Labels (comma separated):'}
              </label>
              <input
                type="text"
                value={labelsStr}
                onChange={e => setLabelsStr(e.target.value)}
                placeholder="Q1, Q2, Q3, Q4"
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                {isVi ? 'Các Giá trị Tương ứng (cách nhau bởi dấu phẩy):' : 'Corresponding Values (comma separated):'}
              </label>
              <input
                type="text"
                value={valStr}
                onChange={e => setValStr(e.target.value)}
                placeholder="100, 200, 150, 300"
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                  {isVi ? 'Tên Chuỗi Dữ liệu:' : 'Series Name:'}
                </label>
                <input
                  type="text"
                  value={seriesName}
                  onChange={e => setSeriesName(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)', display: 'block' }}>
                  {isVi ? 'Màu Chủ Đạo:' : 'Primary Color:'}
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '4px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--do-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="do-btn" onClick={onClose} style={{ borderRadius: '8px' }}>
            {isVi ? 'Hủy' : 'Cancel'}
          </button>
          <button className="do-btn" onClick={handleInsert} style={{ borderRadius: '8px', backgroundColor: 'var(--do-color-primary)', color: '#fff' }}>
            {isVi ? 'Chèn vào Slide' : 'Insert to Slide'}
          </button>
        </div>
      </div>
    </div>
  );
}
