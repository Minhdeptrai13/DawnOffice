import { useState, useCallback, useEffect } from 'react';
import DawnDocument from './DawnDocument';
import { Plus, X } from 'lucide-react';

interface Tab {
  id: string;
  filePath: string | null;
  title: string;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function DocumentWorkspace({ immersiveMode, onImmersiveModeChange }: { immersiveMode: boolean, onImmersiveModeChange: (enabled: boolean) => void }) {
  const [tabs, setTabs] = useState<Tab[]>([{ id: generateId(), filePath: null, title: 'Untitled Document' }]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

  const handleAddTab = useCallback(() => {
    const newTab = { id: generateId(), filePath: null, title: 'Untitled Document' };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const handleCloseTab = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(prev => {
      if (prev.length === 1) return prev; // Don't close the last tab
      const idx = prev.findIndex(t => t.id === id);
      const newTabs = prev.filter(t => t.id !== id);
      if (activeTabId === id) {
        // Switch to the adjacent tab
        const nextActive = newTabs[Math.min(idx, newTabs.length - 1)];
        setActiveTabId(nextActive.id);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const updateTabInfo = useCallback((id: string, filePath: string | null, title: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, filePath, title } : t));
  }, []);

  // Keyboard shortcut for New Tab (Ctrl+T) and Close Tab (Ctrl+W)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        handleAddTab();
      } else if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (tabs.length > 1) {
          setTabs(prev => {
            if (prev.length === 1) return prev;
            const idx = prev.findIndex(t => t.id === activeTabId);
            const newTabs = prev.filter(t => t.id !== activeTabId);
            const nextActive = newTabs[Math.min(idx, newTabs.length - 1)];
            setActiveTabId(nextActive.id);
            return newTabs;
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddTab, tabs.length, activeTabId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--do-color-surface)' }}>
      {/* Tab Bar */}
      {!immersiveMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--do-color-bg)',
          padding: '6px 8px 0 8px',
          gap: '4px',
          borderBottom: '1px solid var(--do-color-border)'
        }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px',
                backgroundColor: activeTabId === tab.id ? 'var(--do-color-surface)' : 'transparent',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                border: '1px solid',
                borderColor: activeTabId === tab.id ? 'var(--do-color-border)' : 'transparent',
                borderBottom: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                color: activeTabId === tab.id ? 'var(--do-color-text)' : 'var(--do-color-text-muted)',
                minWidth: '120px',
                maxWidth: '200px',
                boxShadow: activeTabId === tab.id ? '0 -2px 5px rgba(0,0,0,0.02)' : 'none',
                position: 'relative',
                zIndex: activeTabId === tab.id ? 2 : 1,
                marginBottom: '-1px' // Cover the border-bottom
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {tab.title}
              </span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    marginLeft: '6px',
                    color: 'var(--do-color-text-muted)',
                    borderRadius: '50%',
                    display: 'flex'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--do-color-border)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddTab}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              color: 'var(--do-color-text-muted)',
              borderRadius: '6px',
              display: 'flex',
              marginLeft: '4px',
              marginBottom: '2px'
            }}
            title="New Tab (Ctrl+T)"
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--do-color-border)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {/* Workspace Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: activeTabId === tab.id ? 'block' : 'none'
            }}
          >
            <DawnDocument
              immersiveMode={immersiveMode}
              onImmersiveModeChange={onImmersiveModeChange}
              onFileInfoChange={(filePath, title) => updateTabInfo(tab.id, filePath, title)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
