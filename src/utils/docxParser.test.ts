import { describe, it, expect } from 'vitest';
import { convertHtmlToDocx } from './docxParser';

// Mocking dependencies if necessary
describe('docxParser', () => {
  it('should parse basic HTML into a Docx Blob', async () => {
    const html = '<p>Hello <b>world</b></p>';
    const docxBlob = await convertHtmlToDocx(html);
    
    expect(docxBlob).toBeDefined();
    expect(docxBlob.type).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });

  it('should handle headers and lists without crashing', async () => {
    const html = '<h1>Title</h1><ul><li>Item 1</li><li>Item 2</li></ul><p>Content</p>';
    const docxBlob = await convertHtmlToDocx(html);
    
    expect(docxBlob).toBeDefined();
  });
});
