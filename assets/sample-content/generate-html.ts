import { writeFileSync } from 'fs';

/**
 * Generate a simple HTML-formatted progress note with rich text formatting.
 * This demonstrates using text/html; charset=utf-8 content type.
 */
function generateHTML() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Progress Note</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 25px;
            border-left: 4px solid #3498db;
            padding-left: 10px;
        }
        .metadata {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .metadata p {
            margin: 5px 0;
        }
        strong {
            color: #2c3e50;
        }
        ul, ol {
            padding-left: 25px;
        }
        li {
            margin: 8px 0;
        }
        .highlight {
            background-color: #fff3cd;
            padding: 2px 4px;
            border-radius: 3px;
        }
        .vitals {
            background-color: #e7f3ff;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .assessment {
            background-color: #f0f8f0;
            padding: 15px;
            border-left: 4px solid #28a745;
            margin: 15px 0;
        }
        .plan {
            background-color: #fff8e6;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <h1>Progress Note</h1>

    <div class="metadata">
        <p><strong>Date:</strong> {{CURRENT_DATE}}</p>
        <p><strong>Time:</strong> {{CURRENT_TIME}}</p>
        <p><strong>Patient:</strong> {{PATIENT_NAME}}</p>
        <p><strong>Provider:</strong> {{AUTHOR_NAME}}</p>
        <p><strong>Location:</strong> Cardiology Ward, Room 312</p>
    </div>

    <h2>Subjective</h2>
    <p>
        Patient reports <em>feeling much better today</em>. Chest pain has completely resolved
        since yesterday evening. Patient slept well overnight without any shortness of breath.
        No complaints at this time.
    </p>
    <p>
        Patient states: <span class="highlight">"I feel like I'm ready to go home."</span>
    </p>

    <h2>Objective</h2>

    <div class="vitals">
        <strong>Vital Signs:</strong>
        <ul>
            <li>Blood Pressure: 128/76 mmHg</li>
            <li>Heart Rate: 68 bpm (regular rhythm)</li>
            <li>Respiratory Rate: 16 breaths/min</li>
            <li>Temperature: 98.4°F (36.9°C)</li>
            <li>O₂ Saturation: 98% on room air</li>
        </ul>
    </div>

    <p><strong>Physical Examination:</strong></p>
    <ul>
        <li><strong>General:</strong> Alert, oriented × 3, appears comfortable, no acute distress</li>
        <li><strong>Cardiovascular:</strong> Regular rate and rhythm, S1 and S2 normal, no murmurs, rubs, or gallops</li>
        <li><strong>Respiratory:</strong> Clear to auscultation bilaterally, no wheezes, rales, or rhonchi</li>
        <li><strong>Extremities:</strong> No edema, pulses 2+ bilaterally</li>
    </ul>

    <p><strong>Laboratory Results:</strong></p>
    <ul>
        <li>Troponin: &lt;0.01 ng/mL (normal)</li>
        <li>BNP: 95 pg/mL (normal)</li>
        <li>Complete Blood Count: Within normal limits</li>
        <li>Basic Metabolic Panel: Within normal limits</li>
    </ul>

    <h2>Assessment</h2>

    <div class="assessment">
        <ol>
            <li>
                <strong>Chest pain, resolved</strong>
                <ul>
                    <li>Likely musculoskeletal in origin</li>
                    <li>Cardiac workup negative (EKG, troponins)</li>
                    <li>No evidence of acute coronary syndrome</li>
                </ul>
            </li>
            <li>
                <strong>Hypertension, stable</strong>
                <ul>
                    <li>Blood pressure well-controlled on current regimen</li>
                </ul>
            </li>
            <li>
                <strong>Type 2 Diabetes Mellitus, stable</strong>
                <ul>
                    <li>Blood glucose levels within acceptable range</li>
                </ul>
            </li>
        </ol>
    </div>

    <h2>Plan</h2>

    <div class="plan">
        <ol>
            <li>
                <strong>Discharge planning:</strong>
                <ul>
                    <li>Patient medically stable for discharge</li>
                    <li>Arrange discharge for this afternoon</li>
                    <li>Provide discharge instructions and medications</li>
                </ul>
            </li>
            <li>
                <strong>Medications:</strong>
                <ul>
                    <li>Continue current home medications</li>
                    <li>Add ibuprofen 400mg PRN for musculoskeletal pain</li>
                </ul>
            </li>
            <li>
                <strong>Follow-up:</strong>
                <ul>
                    <li>Schedule appointment with primary care physician within 1 week</li>
                    <li>Return to ED if chest pain recurs or worsens</li>
                    <li>Call 911 for severe chest pain, shortness of breath, or loss of consciousness</li>
                </ul>
            </li>
            <li>
                <strong>Patient education:</strong>
                <ul>
                    <li>Discussed warning signs of cardiac events</li>
                    <li>Reviewed importance of medication compliance</li>
                    <li>Advised on lifestyle modifications (diet, exercise, smoking cessation)</li>
                </ul>
            </li>
        </ol>
    </div>

    <hr>

    <p>
        <strong>Electronically signed by:</strong> {{AUTHOR_NAME}}<br>
        <strong>Date/Time:</strong> {{CURRENT_TIMESTAMP}}<br>
        <strong>Department:</strong> Internal Medicine
    </p>
</body>
</html>`;

  writeFileSync('progress-note.html', html);
  console.log('✓ Generated progress-note.html');
}

generateHTML();
