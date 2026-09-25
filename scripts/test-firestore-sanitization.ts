import { removeUndefinedFields } from '../src/utils/firestoreUtils';
import { n8nService } from '../src/services/n8nService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

console.log('--- RUNNING FIRESTORE UNDEFINED-VALUE HANDLING TESTS ---');

// Test 1: Normal AI response (no structured data)
{
  const n8nNormalRaw = {
    output: "Hello! I am BizMate AI, ready to assist your business."
  };
  const parsed = n8nService.parseN8nResponse(n8nNormalRaw);
  assert(parsed.text.includes("Hello"), "Normal AI response text extracted");
  assert(parsed.structuredData === undefined, "Normal AI response has no structuredData (undefined)");

  // Prepare Firestore message payload
  const firestorePayload = removeUndefinedFields({
    role: 'assistant',
    content: parsed.text,
    status: 'delivered',
    ...(parsed.structuredData !== undefined ? { structuredData: parsed.structuredData } : {})
  });

  assert(!('structuredData' in firestorePayload), "structuredData field is completely omitted from Firestore payload");
  assert(firestorePayload.role === 'assistant', "role is preserved");
  assert(firestorePayload.status === 'delivered', "status is preserved");
}

// Test 2: Gmail response (structured data)
{
  const n8nGmailRaw = {
    output: "Email sent successfully to client.",
    type: "gmail",
    data: {
      messageId: "msg_12345",
      to: "john@example.com",
      subject: "Meeting Tomorrow",
      snippet: undefined // contains undefined!
    }
  };
  const parsed = n8nService.parseN8nResponse(n8nGmailRaw);
  assert(parsed.structuredData !== undefined, "Gmail response has structuredData");
  assert(parsed.structuredData?.type === "gmail", "Gmail type is gmail");

  const firestorePayload = removeUndefinedFields({
    role: 'assistant',
    content: parsed.text,
    status: 'delivered',
    ...(parsed.structuredData !== undefined ? { structuredData: parsed.structuredData } : {})
  });

  assert('structuredData' in firestorePayload, "structuredData is included for Gmail");
  assert((firestorePayload as any).structuredData.gmailSent.to === "john@example.com", "to recipient saved");
  assert(!('snippet' in (firestorePayload as any).structuredData.gmailSent), "undefined snippet is removed from nested object");
}

// Test 3: Google Calendar response (structured data)
{
  const n8nCalRaw = {
    output: "Calendar event scheduled for tomorrow at 3 PM.",
    type: "calendar",
    calendarEvent: {
      eventId: "cal_999",
      title: "Strategy Meeting",
      date: "Tomorrow",
      time: "3:00 PM",
      meetingLink: undefined // undefined link
    }
  };
  const parsed = n8nService.parseN8nResponse(n8nCalRaw);
  assert(parsed.structuredData !== undefined, "Calendar response has structuredData");
  assert(parsed.structuredData?.type === "calendar", "Calendar type is calendar");

  const firestorePayload = removeUndefinedFields({
    role: 'assistant',
    content: parsed.text,
    status: 'delivered',
    ...(parsed.structuredData !== undefined ? { structuredData: parsed.structuredData } : {})
  });

  assert('structuredData' in firestorePayload, "structuredData included for Calendar");
  assert((firestorePayload as any).structuredData.calendarEvent.title === "Strategy Meeting", "Event title saved");
  assert(!('meetingLink' in (firestorePayload as any).structuredData.calendarEvent), "undefined meetingLink omitted");
}

// Test 4: Google Sheets response (structured data)
{
  const n8nSheetsRaw = {
    output: "Found 2 matching records in Google Sheets.",
    type: "sheets",
    data: {
      sheetName: "Invoices",
      headers: ["Invoice ID", "Amount", "Status"],
      rows: [["INV-001", "$500", "Pending"]],
      unneededNote: undefined
    }
  };
  const parsed = n8nService.parseN8nResponse(n8nSheetsRaw);
  assert(parsed.structuredData !== undefined, "Sheets response has structuredData");
  assert(parsed.structuredData?.type === "sheets", "Sheets type is sheets");

  const firestorePayload = removeUndefinedFields({
    role: 'assistant',
    content: parsed.text,
    status: 'delivered',
    ...(parsed.structuredData !== undefined ? { structuredData: parsed.structuredData } : {})
  });

  assert('structuredData' in firestorePayload, "structuredData included for Sheets");
  assert((firestorePayload as any).structuredData.googleSheets.totalRows === 1, "Total rows saved");
  assert(!('unneededNote' in (firestorePayload as any).structuredData.googleSheets), "undefined unneededNote omitted");
}

// Test 5: Response with no structuredData
{
  const rawNoStructured = "Plain text answer from LLM with no tools";
  const parsed = n8nService.parseN8nResponse(rawNoStructured);
  assert(parsed.structuredData === undefined, "Structured data is undefined");

  const firestorePayload = removeUndefinedFields({
    role: 'assistant',
    content: parsed.text,
    status: 'delivered',
    ...(parsed.structuredData !== undefined ? { structuredData: parsed.structuredData } : {})
  });

  const keys = Object.keys(firestorePayload);
  assert(!keys.includes('structuredData'), "Keys must NOT contain structuredData");
  assert(keys.includes('role') && keys.includes('content') && keys.includes('status'), "Core fields present");
}

// Test 6: Response with structuredData (explicit user test object)
{
  const explicitTest = {
    role: "assistant",
    content: "Calendar event created",
    structuredData: {
      type: "calendar",
      success: true,
      optionalNote: undefined
    }
  };

  const firestorePayload = removeUndefinedFields({
    role: explicitTest.role,
    content: explicitTest.content,
    status: 'delivered',
    ...(explicitTest.structuredData !== undefined ? { structuredData: explicitTest.structuredData } : {})
  });

  assert('structuredData' in firestorePayload, "structuredData is included");
  assert((firestorePayload as any).structuredData.success === true, "success boolean preserved");
  assert(!('optionalNote' in (firestorePayload as any).structuredData), "undefined optionalNote omitted");
}

// Test 7: Preserving 0, false, empty string, and null
{
  const edgeCaseObj = {
    count: 0,
    isActive: false,
    emptyText: "",
    nullValue: null,
    undefinedVal: undefined,
    nested: {
      zero: 0,
      badVal: undefined
    }
  };

  const cleaned = removeUndefinedFields(edgeCaseObj);
  assert(cleaned.count === 0, "0 preserved");
  assert(cleaned.isActive === false, "false preserved");
  assert(cleaned.emptyText === "", "empty string preserved");
  assert(cleaned.nullValue === null, "null preserved");
  assert(!('undefinedVal' in cleaned), "undefinedVal removed");
  assert(cleaned.nested.zero === 0, "nested 0 preserved");
  assert(!('badVal' in cleaned.nested), "nested badVal removed");
}

console.log('ALL 7 TEST SUITES PASSED CLEANLY!');
