import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

// Convert ArrayBuffer (from Tauri fs) to HTML string for TipTap with full image support
export async function convertDocxToHtml(arrayBuffer: ArrayBuffer): Promise<string> {
  const options = {
    convertImage: mammoth.images.imgElement((element) => {
      return element.read("base64").then((imageBuffer) => {
        return {
          src: `data:${element.contentType};base64,${imageBuffer}`
        };
      });
    })
  };
  const result = await mammoth.convertToHtml({ arrayBuffer }, options);
  return result.value;
}

// Very basic converter for Phase 1. 
// Ideally we would parse the DOM recursively, but for MVP we use a simple approach.
export async function convertHtmlToDocx(htmlContent: string): Promise<Blob> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const children = Array.from(doc.body.childNodes);
  
  const paragraphs: Paragraph[] = [];
  
  children.forEach(node => {
    if (node.nodeName === 'P') {
      const alignAttr = (node as HTMLElement).getAttribute?.('data-align') || (node as HTMLElement).style?.textAlign;
      let alignment = undefined;
      if (alignAttr === 'center') alignment = 'center';
      if (alignAttr === 'right') alignment = 'right';
      if (alignAttr === 'justify') alignment = 'both';

      const textRuns = Array.from(node.childNodes).map(child => {
        const text = child.textContent || '';
        const isBold = child.nodeName === 'STRONG' || child.nodeName === 'B';
        const isItalic = child.nodeName === 'EM' || child.nodeName === 'I';
        const isUnderline = child.nodeName === 'U';
        const isStrike = child.nodeName === 'S' || child.nodeName === 'STRIKE';
        const isSub = child.nodeName === 'SUB';
        const isSup = child.nodeName === 'SUP';
        return new TextRun({ text, bold: isBold, italics: isItalic, underline: isUnderline ? {} : undefined, strike: isStrike, subScript: isSub, superScript: isSup });
      });
      paragraphs.push(new Paragraph({ children: textRuns, alignment: alignment as any }));
    } else if (node.nodeName.startsWith('H')) {
      const levelStr = node.nodeName.replace('H', '');
      let headingLevel: any = HeadingLevel.HEADING_1;
      if (levelStr === '2') headingLevel = HeadingLevel.HEADING_2;
      if (levelStr === '3') headingLevel = HeadingLevel.HEADING_3;
      paragraphs.push(new Paragraph({ text: node.textContent || '', heading: headingLevel }));
    } else if (node.nodeName === 'UL' || node.nodeName === 'OL') {
      const listItems = Array.from(node.childNodes).filter(n => n.nodeName === 'LI');
      listItems.forEach(li => {
        paragraphs.push(new Paragraph({ text: li.textContent || '', bullet: { level: 0 } }));
      });
    }
  });

  const document = new Document({
    sections: [{
      children: paragraphs,
    }],
  });

  return Packer.toBlob(document);
}
