import { writeFileSync } from 'fs';

/**
 * Generate a large text file (~5 MiB) for testing server size limits.
 * This tests the requirement that servers SHALL accept at least 5 MiB inline content.
 */
function generateLargeFile() {
  const TARGET_SIZE = 5 * 1024 * 1024; // 5 MiB in bytes

  const sampleParagraph = `This is a sample clinical note paragraph that will be repeated many times to create a large file for testing purposes. The FHIR Writing Clinical Notes specification requires that servers SHALL accept inline attachments up to at least 5 MiB. This generated file helps verify compliance with that requirement. `;

  let content = `LARGE CLINICAL NOTE - SIZE LIMIT TEST

This document is generated to test the 5 MiB inline content requirement.

Date: ${new Date().toISOString()}
Purpose: Verify server accepts attachments >= 5 MiB as required by spec section 4.10

CONTENT:
`;

  // Calculate how many paragraphs we need
  const currentSize = Buffer.byteLength(content, 'utf8');
  const paragraphSize = Buffer.byteLength(sampleParagraph, 'utf8');
  const paragraphsNeeded = Math.ceil((TARGET_SIZE - currentSize) / paragraphSize);

  // Add repeated content
  for (let i = 0; i < paragraphsNeeded; i++) {
    content += `\nParagraph ${i + 1}:\n${sampleParagraph}`;
  }

  content += `\n\nEND OF DOCUMENT\nFinal size: ${Buffer.byteLength(content, 'utf8')} bytes`;

  writeFileSync('large-note.txt', content);

  const finalSize = Buffer.byteLength(content, 'utf8');
  const sizeMB = (finalSize / (1024 * 1024)).toFixed(2);
  console.log(`✓ Generated large-note.txt (${sizeMB} MiB, ${finalSize} bytes)`);
}

generateLargeFile();
