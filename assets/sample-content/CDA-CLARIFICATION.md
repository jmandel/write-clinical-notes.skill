# CDA Content Type Clarification

## TL;DR

- **Proper CDA documents**: Use `application/cda+xml` (IANA registered 2021-12-15)
- **XHTML styled like CDA**: Use `application/xhtml+xml` (mentioned in FHIR spec)

## The Two Approaches

### 1. application/cda+xml - Proper C-CDA Documents

**Template:** `discharge-summary-cda-xml.json`  
**Generator:** `generate-cda-xml.ts`  
**Output:** `discharge-summary.cda.xml`

This is the **correct IANA-registered media type** for HL7 CDA R2 documents.

**Characteristics:**
- Full HL7 CDA R2 structure with proper namespaces
- Structured sections (Discharge Diagnosis, Hospital Course, Medications, etc.)
- Proper templating (C-CDA templateIds)
- Machine-parseable clinical data
- Human-readable narrative sections

**Example structure:**
```xml
<ClinicalDocument xmlns="urn:hl7-org:v3">
  <realmCode code="US"/>
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <templateId root="2.16.840.1.113883.10.20.22.1.8" extension="2015-08-01"/>
  ...
  <component>
    <structuredBody>
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.24"/>
          <code code="11535-2" codeSystem="2.16.840.1.113883.6.1"/>
          ...
        </section>
      </component>
    </structuredBody>
  </component>
</ClinicalDocument>
```

**Format code:** `urn:hl7-org:sdwg:ccda-structuredBody:2.1`

---

### 2. application/xhtml+xml - XHTML Rich Text

**Template:** `discharge-summary-xhtml.json`  
**Generator:** `generate-xhtml.ts`  
**Output:** `discharge-summary.xhtml`

This is what the FHIR spec mentions: "Servers SHOULD accept: `application/xhtml+xml` when paired with CDA `content.format` codes."

**Characteristics:**
- XHTML 1.0/1.1 structure
- HTML-like styling and formatting
- Human-readable only (not machine-parseable as CDA)
- Can be styled with CSS

**Example structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <style type="text/css">
        body { font-family: Arial, sans-serif; }
        h1 { color: #003366; }
    </style>
</head>
<body>
    <h1>Hospital Discharge Summary</h1>
    <div class="section">
        <h2>Patient Information</h2>
        ...
    </div>
</body>
</html>
```

**Format code:** `urn:ihe:iti:xds-sd:text:2008`

---

## What the FHIR Spec Says

From Writing Clinical Notes specification, section 4.9:

> Servers **SHALL** accept: `text/plain; charset=utf-8`, `application/pdf`.
> Servers **SHOULD** accept: `application/xhtml+xml` when paired with CDA `content.format` codes.

The spec mentions `application/xhtml+xml`, but it's important to note:

1. **The spec was written before** `application/cda+xml` was registered with IANA (2021-12-15)
2. **For actual CDA documents**, use `application/cda+xml` (the proper registered type)
3. **For XHTML-formatted** documents that look like CDA but aren't structured CDA, use `application/xhtml+xml`

---

## Which Should You Use?

### Use `application/cda+xml` when:
- You have a proper C-CDA document from an EHR
- You need machine-parseable structured clinical data
- You're implementing HL7 CDA R2 or C-CDA standards
- You need to comply with meaningful use or other regulatory requirements

### Use `application/xhtml+xml` when:
- You have an XHTML document styled to look like a clinical document
- You only need human-readable content
- You want to test servers that follow the FHIR spec literally

---

## Testing Both

The skill now includes **both templates** so you can test:

1. **C-CDA compliance** - Does the server accept proper CDA documents?
2. **FHIR spec compliance** - Does the server accept XHTML as the spec suggests?

Both are valid test cases for a comprehensive connectathon!

---

## References

- IANA Media Type Registration: https://www.iana.org/assignments/media-types/application/cda+xml
- HL7 CDA R2: http://www.hl7.org/implement/standards/product_brief.cfm?product_id=7
- FHIR Writing Clinical Notes: Section 4.9 (MIME support)
