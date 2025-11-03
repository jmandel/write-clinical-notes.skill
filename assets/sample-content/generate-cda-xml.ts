import { writeFileSync } from 'fs';

/**
 * Generate a proper C-CDA (Consolidated CDA) XML document.
 * This is a minimal but valid CDA R2 document with structured body.
 */
function generateCDAXML() {
  const cdaXML = `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:sdtc="urn:hl7-org:sdtc">
  <!--
  ********************************************************
  CDA Header
  ********************************************************
  -->
  <realmCode code="US"/>
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <!-- US Realm Header Template ID -->
  <templateId root="2.16.840.1.113883.10.20.22.1.1" extension="2015-08-01"/>
  <!-- C-CDA Discharge Summary Template ID -->
  <templateId root="2.16.840.1.113883.10.20.22.1.8" extension="2015-08-01"/>
  <id root="2.16.840.1.113883.19.5.99999.1" extension="TT988"/>
  <code code="18842-5" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Discharge Summary"/>
  <title>Discharge Summary</title>
  <effectiveTime value="20250115090000-0500"/>
  <confidentialityCode code="N" codeSystem="2.16.840.1.113883.5.25"/>
  <languageCode code="en-US"/>

  <!-- Patient -->
  <recordTarget>
    <patientRole>
      <id root="2.16.840.1.113883.19.5.99999.2" extension="{{PATIENT_ID}}"/>
      <addr use="HP">
        <streetAddressLine>1357 Amber Drive</streetAddressLine>
        <city>Portland</city>
        <state>OR</state>
        <postalCode>97266</postalCode>
        <country>US</country>
      </addr>
      <telecom value="tel:+1(555)555-1000" use="HP"/>
      <patient>
        <name use="L">
          <given>{{PATIENT_GIVEN_NAME}}</given>
          <family>{{PATIENT_FAMILY_NAME}}</family>
        </name>
        <administrativeGenderCode code="M" codeSystem="2.16.840.1.113883.5.1" displayName="Male"/>
        <birthTime value="19800801"/>
        <raceCode code="2106-3" codeSystem="2.16.840.1.113883.6.238" displayName="White"/>
        <ethnicGroupCode code="2186-5" codeSystem="2.16.840.1.113883.6.238" displayName="Not Hispanic or Latino"/>
      </patient>
    </patientRole>
  </recordTarget>

  <!-- Author -->
  <author>
    <time value="{{CURRENT_TIMESTAMP_CDA}}"/>
    <assignedAuthor>
      <id root="2.16.840.1.113883.19.5.99999.456" extension="5555555555"/>
      <addr use="WP">
        <streetAddressLine>1003 Healthcare Drive</streetAddressLine>
        <city>Portland</city>
        <state>OR</state>
        <postalCode>97266</postalCode>
        <country>US</country>
      </addr>
      <telecom value="tel:+1(555)555-1003" use="WP"/>
      <assignedPerson>
        <name>
          <given>{{AUTHOR_GIVEN_NAME}}</given>
          <family>{{AUTHOR_FAMILY_NAME}}</family>
          <suffix>{{AUTHOR_SUFFIX}}</suffix>
        </name>
      </assignedPerson>
    </assignedAuthor>
  </author>

  <!-- Custodian -->
  <custodian>
    <assignedCustodian>
      <representedCustodianOrganization>
        <id root="2.16.840.1.113883.19.5.99999.1"/>
        <name>Community Health and Hospitals</name>
        <telecom value="tel:+1(555)555-1003" use="WP"/>
        <addr use="WP">
          <streetAddressLine>1003 Healthcare Drive</streetAddressLine>
          <city>Portland</city>
          <state>OR</state>
          <postalCode>97266</postalCode>
          <country>US</country>
        </addr>
      </representedCustodianOrganization>
    </assignedCustodian>
  </custodian>

  <!-- Encounter -->
  <componentOf>
    <encompassingEncounter>
      <id root="2.16.840.1.113883.19.5.99999.1" extension="9937012"/>
      <code code="IMP" codeSystem="2.16.840.1.113883.5.4" displayName="inpatient encounter"/>
      <effectiveTime>
        <low value="20250110080000-0500"/>
        <high value="20250115090000-0500"/>
      </effectiveTime>
    </encompassingEncounter>
  </componentOf>

  <!--
  ********************************************************
  CDA Body - Structured
  ********************************************************
  -->
  <component>
    <structuredBody>
      <!-- Discharge Diagnosis Section -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.24" extension="2015-08-01"/>
          <code code="11535-2" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Hospital Discharge Diagnosis"/>
          <title>Hospital Discharge Diagnosis</title>
          <text>
            <list>
              <item>Acute exacerbation of COPD, resolved</item>
              <item>Type 2 Diabetes Mellitus, stable</item>
              <item>Hypertension, controlled</item>
            </list>
          </text>
          <entry>
            <act classCode="ACT" moodCode="EVN">
              <templateId root="2.16.840.1.113883.10.20.22.4.80" extension="2015-08-01"/>
              <code code="29308-4" codeSystem="2.16.840.1.113883.6.1" displayName="Diagnosis"/>
              <statusCode code="active"/>
              <effectiveTime>
                <low value="20250110"/>
              </effectiveTime>
              <entryRelationship typeCode="SUBJ">
                <observation classCode="OBS" moodCode="EVN">
                  <templateId root="2.16.840.1.113883.10.20.22.4.4" extension="2015-08-01"/>
                  <id root="2.16.840.1.113883.19.5.99999.1" extension="DX123"/>
                  <code code="29308-4" codeSystem="2.16.840.1.113883.6.1" displayName="Diagnosis"/>
                  <statusCode code="completed"/>
                  <effectiveTime>
                    <low value="20250110"/>
                  </effectiveTime>
                  <value xsi:type="CD" code="J44.1" codeSystem="2.16.840.1.113883.6.90" displayName="COPD with acute exacerbation"/>
                </observation>
              </entryRelationship>
            </act>
          </entry>
        </section>
      </component>

      <!-- Hospital Course Section -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.12"/>
          <code code="8648-8" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Hospital Course"/>
          <title>Hospital Course</title>
          <text>
            <paragraph>The patient was admitted through the emergency department with shortness of breath and increased sputum production. Initial chest X-ray showed hyperinflation consistent with COPD but no acute infiltrate. The patient was started on supplemental oxygen, bronchodilators, and a steroid taper.</paragraph>
            <paragraph>By hospital day 3, the patient showed significant improvement in respiratory status with decreased oxygen requirement. Patient was able to ambulate without dyspnea and oxygen saturation remained above 92% on room air.</paragraph>
          </text>
        </section>
      </component>

      <!-- Discharge Medications Section -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.11" extension="2015-08-01"/>
          <code code="10183-2" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Hospital Discharge Medications"/>
          <title>Discharge Medications</title>
          <text>
            <table border="1">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dose</th>
                  <th>Frequency</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Albuterol Inhaler</td>
                  <td>90 mcg</td>
                  <td>2 puffs every 4-6 hours</td>
                  <td>As needed for shortness of breath</td>
                </tr>
                <tr>
                  <td>Tiotropium</td>
                  <td>18 mcg</td>
                  <td>Once daily</td>
                  <td>Use in the morning</td>
                </tr>
                <tr>
                  <td>Prednisone</td>
                  <td>40 mg</td>
                  <td>Once daily</td>
                  <td>Taper over 5 days as directed</td>
                </tr>
              </tbody>
            </table>
          </text>
        </section>
      </component>

      <!-- Plan of Treatment Section -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.10" extension="2014-06-09"/>
          <code code="18776-5" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Plan of Treatment"/>
          <title>Plan of Treatment</title>
          <text>
            <list>
              <item>Continue all medications as prescribed</item>
              <item>Use incentive spirometry 10 times every hour while awake</item>
              <item>Avoid smoking and secondhand smoke exposure</item>
              <item>Follow up with primary care physician within 1 week</item>
              <item>Follow up with pulmonologist within 2 weeks</item>
              <item>Return to emergency department if experiencing worsening shortness of breath, chest pain, or fever greater than 101°F</item>
            </list>
          </text>
        </section>
      </component>
    </structuredBody>
  </component>
</ClinicalDocument>`;

  writeFileSync('discharge-summary.cda.xml', cdaXML);
  console.log('✓ Generated discharge-summary.cda.xml (proper C-CDA XML)');
}

generateCDAXML();
