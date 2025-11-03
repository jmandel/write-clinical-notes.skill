import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync } from 'fs';

const execAsync = promisify(exec);

/**
 * Generate a minimal PDF for testing.
 * Uses a simple PostScript-to-PDF approach.
 */
async function generatePDF() {
  const consultationText = `
CONSULTATION NOTE

Date: January 15, 2025
Patient: [Patient Name]
Provider: [Provider Name]

CHIEF COMPLAINT:
Patient presents with persistent headaches over the past 2 weeks.

HISTORY OF PRESENT ILLNESS:
The patient reports bilateral frontal headaches, worse in the morning.
No associated nausea, vomiting, or visual changes. Patient has tried
over-the-counter analgesics with minimal relief.

REVIEW OF SYSTEMS:
Constitutional: No fever, chills, or weight loss
Neurological: Headaches as above, no focal deficits
All other systems: Negative

PHYSICAL EXAMINATION:
Vital Signs: BP 128/78, HR 72, RR 16, Temp 98.6°F
General: Alert and oriented, no acute distress
HEENT: Normocephalic, atraumatic, PERRLA, EOMI
Neurological: CN II-XII intact, no focal deficits

ASSESSMENT AND PLAN:
1. Tension-type headache
   - Trial of prophylactic therapy
   - Stress reduction techniques
   - Follow-up in 2 weeks

2. Rule out secondary causes
   - Order brain MRI if symptoms persist
   - Monitor blood pressure

Provider Signature: [Electronic Signature]
Date: January 15, 2025
`;

  // Create a minimal valid PDF manually
  const minimalPDF = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >>
endobj
5 0 obj
<< /Length 800 >>
stream
BT
/F1 12 Tf
100 700 Td
(CONSULTATION NOTE) Tj
0 -20 Td
(Date: January 15, 2025) Tj
0 -30 Td
(CHIEF COMPLAINT:) Tj
0 -15 Td
(Patient presents with persistent headaches over the past 2 weeks.) Tj
0 -25 Td
(HISTORY OF PRESENT ILLNESS:) Tj
0 -15 Td
(The patient reports bilateral frontal headaches, worse in the morning.) Tj
0 -15 Td
(No associated nausea, vomiting, or visual changes. Patient has tried) Tj
0 -15 Td
(over-the-counter analgesics with minimal relief.) Tj
0 -25 Td
(REVIEW OF SYSTEMS:) Tj
0 -15 Td
(Constitutional: No fever, chills, or weight loss) Tj
0 -15 Td
(Neurological: Headaches as above, no focal deficits) Tj
0 -25 Td
(PHYSICAL EXAMINATION:) Tj
0 -15 Td
(Vital Signs: BP 128/78, HR 72, RR 16, Temp 98.6F) Tj
0 -15 Td
(General: Alert and oriented, no acute distress) Tj
0 -15 Td
(HEENT: Normocephalic, atraumatic, PERRLA, EOMI) Tj
0 -15 Td
(Neurological: CN II-XII intact, no focal deficits) Tj
0 -25 Td
(ASSESSMENT AND PLAN:) Tj
0 -15 Td
(1. Tension-type headache) Tj
0 -15 Td
(   - Trial of prophylactic therapy) Tj
0 -15 Td
(   - Stress reduction techniques) Tj
0 -15 Td
(   - Follow-up in 2 weeks) Tj
0 -20 Td
(2. Rule out secondary causes) Tj
0 -15 Td
(   - Order brain MRI if symptoms persist) Tj
0 -15 Td
(   - Monitor blood pressure) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000299 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1150
%%EOF
`;
  writeFileSync('consultation-note.pdf', minimalPDF);
  console.log('✓ Generated consultation-note.pdf');
}

generatePDF().catch(console.error);
