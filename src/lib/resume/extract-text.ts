import 'server-only';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

// Deterministic text extraction — no AI involved. AI only runs on the text
// this produces (see lib/ai/prompts.ts resumeExtractionPrompt).
export async function extractResumeText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (type === 'text/plain' || name.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }

  throw new Error('Unsupported resume file type. Please upload a PDF, DOCX, or TXT file.');
}
