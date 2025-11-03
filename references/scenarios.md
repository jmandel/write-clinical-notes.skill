# FHIR Write Clinical Notes — Connectathon Scenarios

## Test Scenarios

### **Scenario 1: Basic Document Creation (Open or SMART-Protected)**

**Objective:** Test basic DocumentReference creation and content retrieval

**Steps:**

1. **Authorization** (if required):  
   * Perform SMART App Launch to obtain access token with appropriate scope. Minimally:  
     * Provider app: `patient/DocumentReference.c?category=clinical-note` or `user/DocumentReference.c?category=clinical-note`  
     * Patient app: `patient/DocumentReference.c?category=clinical-note`  
2. **Create note** with `POST /DocumentReference`:  
   * Include a simple progress note with base64-encoded content (text/plain or PDF)  
   * Include required elements: status, type, category, subject, content  
   * For patient-facing apps: include `meta.security` with `PATAST` code (if patient-asserted)  
3. **Verify creation response:**  
   * Check for `201 Created` (direct write) or `202 Accepted` (mediated submission)  
   * Capture returned `Location` header or resource `id`  
4. **Retrieve the document:**  
   * Perform `GET /DocumentReference/{id}`  
   * Verify all Must Support elements round-trip correctly  
5. **Verify content retrieval:**  
   * Extract `content.attachment.data` (base64) or `content.attachment.url`  
   * Decode and verify content matches original submission  
   * Confirm `content.attachment.contentType` is preserved

**Success Criteria:**

* Server accepts and persists the note  
* All Must Support elements round-trip correctly  
* Document content is retrievable and matches original  
* Patient-asserted notes (with `PATAST`) are handled per server's documented policy

---

### **Scenario 2: Conditional Create (Idempotency)**

**Objective:** Test duplicate prevention using identifiers

**Steps:**

1. Create a DocumentReference with a stable `identifier`  
2. Note the returned resource `id` and `Location`  
3. Submit the **same DocumentReference** again using conditional create with header `If-None-Exist: identifier=https://myapp.example.org/notes|note-123`  
4. Verify response indicates existing resource  
5. Confirm no duplicate was created via search

**Success Criteria:**

* Server prevents duplicate creation  
* Returns reference to existing resource  
* Search confirms only one resource exists with that identifier

---

### **Scenario 3: Status Correction (Entered-in-Error)**

**Objective:** Test error correction workflow

**Steps:**

1. Create a DocumentReference (using Scenario 1)  
2. Submit partial `PUT /DocumentReference/{id}` with only: resourceType, id, status (entered-in-error), and subject reference  
3. Verify server accepts the update  
4. Retrieve the document and confirm `status` is now `entered-in-error`  
5. Test search behavior per server's documented policy

**Success Criteria:**

* Server accepts partial update without requiring full content  
* Status transitions to `entered-in-error`  
* Document remains readable via direct ID lookup (if authorized)

---

### **Scenario 4: Document Replacement (Supersession)**

**Objective:** Test document versioning using `relatesTo`

**Steps:**

1. Create an initial DocumentReference (version 1)  
2. Create a revised version via `POST /DocumentReference` with a `relatesTo` element containing code "replaces" pointing to the original DocumentReference ID  
3. Include updated content in the new DocumentReference  
4. Verify both documents exist and `relatesTo` is preserved

**Success Criteria:**

* Server accepts and persists `relatesTo` linkage  
* Both documents remain accessible via direct ID lookup  
* `relatesTo` round-trips on read

---

## Pre-Connectathon Checklist

### **For Server Developers**

1. Review the FHIR Write Clinical Notes specification  
2. Implement write support for `DocumentReference` (create, and optionally update)  
3. Set up test patient accounts with known IDs  
4. Verify your server's authorization model is working (open or SMART)  
5. **Add a row to the Server Registration table on the Confluence page**  
6. Share connection details and test credentials via Zulip  
7. Be available for debugging during testing period

### **For Client Developers**

1. Review the FHIR Write Clinical Notes specification  
2. Implement DocumentReference creation with required elements  
3. Determine which servers you'll test against  
4. Verify your SMART launch flow (if applicable)  
5. **Add a row to the Client Registration table on the Confluence page**  
6. Prepare test credentials or access instructions  
7. Be available for debugging during testing period
