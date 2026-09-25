import { N8N_WEBHOOK_URL, N8N_CHAT_URL, N8N_CONFIG, getEffectiveN8nUrl } from '../config/n8nConfig';
import { N8NRequestPayload, N8NResponseResult, StructuredN8NData, N8NFieldMapping } from '../types';
import { removeUndefinedFields } from '../utils/firestoreUtils';
import { detectTextLanguage } from '../i18n/detector';

export const n8nService = {
  /**
   * Intelligently parses various possible response formats returned by n8n AI Agent Chat Trigger
   */
  parseN8nResponse(data: any): N8NResponseResult {
    // If string
    if (typeof data === 'string') {
      const trimmed = data.trim();
      // Try to parse if it's stringified JSON
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          return this.parseN8nResponse(parsed);
        } catch {
          // It's plain text
        }
      }
      return {
        text: data,
        structuredData: this.extractStructuredDataFromText(data),
        rawResponse: data,
      };
    }

    // If Array (e.g. n8n returns [{ output: "..." }] or [{ json: { ... } }])
    if (Array.isArray(data)) {
      if (data.length > 0) {
        const first = data[0];
        if (first && typeof first === 'object' && 'json' in first) {
          return this.parseN8nResponse(first.json);
        }
        return this.parseN8nResponse(first);
      }
      return { text: 'Empty response received from n8n workflow.' };
    }

    // Check common n8n AI Chat response keys
    const textOutput = 
      data.output || 
      data.response || 
      data.text || 
      data.message || 
      data.answer || 
      data.content || 
      data.reply ||
      '';

    let structured: StructuredN8NData | undefined;

    // Check for explicit structured payload returned by tools
    if (data.type === 'calendar' || data.data?.eventId || data.eventTitle || data.calendarEvent) {
      const cal = data.calendarEvent || data.data || data;
      structured = {
        type: 'calendar',
        calendarEvent: {
          eventId: cal.eventId || cal.id || `evt_${Date.now()}`,
          title: cal.title || cal.summary || 'Scheduled Event',
          date: cal.date || 'Scheduled Date',
          time: cal.time || 'Scheduled Time',
          attendees: cal.attendees || ['team@example.com'],
          meetingLink: cal.meetingLink || cal.htmlLink,
          status: 'Successfully Created',
        },
      };
    } else if (data.type === 'gmail' || data.emailSent || data.gmailSent || data.emailId) {
      const em = data.gmailSent || data.data || data;
      structured = {
        type: 'gmail',
        gmailSent: {
          messageId: em.messageId || em.id || `msg_${Date.now()}`,
          to: em.to || em.recipient || 'recipient@example.com',
          subject: em.subject || 'Email Dispatch',
          status: 'Successfully Sent',
          snippet: em.snippet || em.body,
        },
      };
    } else if (data.type === 'sheets' || data.googleSheets || Array.isArray(data.rows) || Array.isArray(data.sheetData)) {
      const sh = data.googleSheets || data.data || data;
      structured = {
        type: 'sheets',
        googleSheets: {
          sheetName: sh.sheetName || 'Google Sheets Records',
          headers: sh.headers || ['Column 1', 'Column 2', 'Status'],
          rows: sh.rows || [],
          totalRows: sh.totalRows || (sh.rows ? sh.rows.length : 0),
        },
      };
    }

    if (typeof textOutput === 'string' && textOutput.length > 0 && !structured) {
      structured = this.extractStructuredDataFromText(textOutput);
    }

    if (structured) {
      structured = removeUndefinedFields(structured);
    }

    const finalText = typeof textOutput === 'string' 
      ? textOutput 
      : (textOutput ? JSON.stringify(textOutput, null, 2) : (data ? JSON.stringify(data, null, 2) : ''));

    return {
      text: finalText,
      structuredData: structured,
      rawResponse: data,
    };
  },

  /**
   * Detects if the markdown/text returned by the AI mentions Calendar/Gmail/Sheets actions
   * and builds interactive cards for richer display without replacing the real AI text.
   */
  extractStructuredDataFromText(text: string): StructuredN8NData | undefined {
    // Check for Markdown table (commonly produced by Google Sheets tool)
    const rawLines = text.split('\n').map(l => l.trim());
    const tableLines = rawLines.filter(l => l.startsWith('|') && l.endsWith('|'));
    if (tableLines.length >= 2) {
      const parseRow = (line: string) =>
        line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      const headerCells = parseRow(tableLines[0]);
      const dataRows: string[][] = [];
      for (let i = 1; i < tableLines.length; i++) {
        const line = tableLines[i];
        if (line.replace(/[\s|:-]/g, '').length === 0) continue; // divider line
        const cells = parseRow(line);
        if (cells.length > 0) {
          dataRows.push(cells);
        }
      }
      if (headerCells.length > 0 && dataRows.length > 0) {
        return {
          type: 'sheets',
          googleSheets: {
            sheetName: 'Google Sheets Query Results',
            headers: headerCells,
            rows: dataRows,
            totalRows: dataRows.length,
          },
        };
      }
    }

    return undefined;
  },

  /**
   * Dispatches the chat message to the n8n AI Agent Chat Trigger endpoint via HTTP POST.
   * Supports streaming if configured on the n8n Chat Trigger.
   */
  async sendMessage(
    payload: N8NRequestPayload,
    customUrl?: string,
    customMapping?: N8NFieldMapping,
    onStreamChunk?: (partialText: string, fullAccumulated: string) => void
  ): Promise<N8NResponseResult> {
    const url = getEffectiveN8nUrl(customUrl) || N8N_WEBHOOK_URL;

    // Construct customizable request payload adhering to n8n Webhook / Chat Trigger API
    const messageKey = customMapping?.messageField?.trim() || N8N_CONFIG.messageField;
    const sessionKey = customMapping?.sessionField?.trim() || N8N_CONFIG.sessionField;
    const userIdKey = customMapping?.userIdField?.trim() || N8N_CONFIG.userIdField;
    const userEmailKey = customMapping?.userEmailField?.trim() || N8N_CONFIG.userEmailField;
    const userNameKey = customMapping?.userNameField?.trim() || N8N_CONFIG.userNameField;

    // Detect language of the original user message
    const detectedLang = payload.language || detectTextLanguage(payload.chatInput);

    const requestBody: Record<string, any> = {
      action: 'sendMessage',
      [messageKey]: payload.chatInput,
      message: payload.chatInput,
      query: payload.chatInput,
      text: payload.chatInput,
      prompt: payload.chatInput,
      [sessionKey]: payload.sessionId,
      [userIdKey]: payload.userId,
      [userEmailKey]: payload.userEmail,
      [userNameKey]: payload.userName,
      language: detectedLang,
      detectedLanguage: detectedLang,
      userLocale: payload.userLocale || detectedLang,
      languageInstruction: "Respond in the same language as the user's latest message unless the user explicitly requests another language.",
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream, text/plain, */*',
    };

    const auth = customMapping?.authHeader?.trim() || N8N_CONFIG.authHeader;
    if (auth) {
      headers['Authorization'] = auth;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), N8N_CONFIG.timeoutMs);

    try {
      const response = await fetch(url, {
        method: N8N_CONFIG.method,
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('n8n Chat Trigger endpoint not found (404). Please ensure your n8n workflow is active.');
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Authentication error (${response.status}) connecting to n8n. Please check credentials.`);
        }
        if (response.status === 500) {
          throw new Error('n8n workflow error (500). Please check your n8n execution log for node failures.');
        }
        if (response.status >= 502 && response.status <= 504) {
          throw new Error(`n8n automation server is unavailable (${response.status}). Please verify that your n8n server is running.`);
        }
        throw new Error(`n8n server returned status ${response.status} (${response.statusText}).`);
      }

      const contentType = response.headers.get('content-type') || '';

      // Handle streaming responses (text/event-stream or chunked text)
      if (response.body && (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson'))) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('data:')) {
              const dataStr = trimmed.slice(5).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                const chunkContent = parsed.content || parsed.text || parsed.item?.content || parsed.output || '';
                accumulatedText += chunkContent;
                if (onStreamChunk) {
                  onStreamChunk(chunkContent, accumulatedText);
                }
              } catch {
                accumulatedText += dataStr;
                if (onStreamChunk) {
                  onStreamChunk(dataStr, accumulatedText);
                }
              }
            } else {
              try {
                const parsed = JSON.parse(trimmed);
                const chunkContent = parsed.content || parsed.text || parsed.output || '';
                accumulatedText += chunkContent;
                if (onStreamChunk) {
                  onStreamChunk(chunkContent, accumulatedText);
                }
              } catch {
                accumulatedText += trimmed;
                if (onStreamChunk) {
                  onStreamChunk(trimmed, accumulatedText);
                }
              }
            }
          }
        }

        if (accumulatedText.trim().length > 0) {
          return this.parseN8nResponse(accumulatedText);
        }
      }

      // Standard JSON or text response
      let data: any;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        try {
          data = JSON.parse(textData);
        } catch {
          data = textData;
        }
      }

      if (!data && data !== 0) {
        throw new Error('Empty response received from n8n AI Agent.');
      }

      return this.parseN8nResponse(data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. The n8n AI Agent took longer than 60s to execute.');
      }

      // Detect CORS error or network failure
      const isFailedFetch = err.message && (
        err.message.includes('Failed to fetch') || 
        err.message.includes('NetworkError') || 
        err.message.includes('Load failed')
      );

      if (isFailedFetch) {
        const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'your web app domain';
        throw new Error(
          `CORS or Network Connection Error: Unable to communicate with n8n endpoint. If your n8n server is online, ensure that "${appOrigin}" is added to the "Allowed Origins (CORS)" in your n8n Chat Trigger node settings.`
        );
      }

      throw err;
    }
  },

  /**
   * Test the connection to the configured n8n Chat Trigger endpoint
   */
  async testConnection(
    customUrl?: string,
    customMapping?: N8NFieldMapping
  ): Promise<{ success: boolean; message: string; latencyMs?: number; isCorsError?: boolean }> {
    const url = getEffectiveN8nUrl(customUrl) || N8N_WEBHOOK_URL;
    if (!url) {
      return {
        success: false,
        message: 'No n8n Webhook URL configured.',
      };
    }

    const messageKey = customMapping?.messageField?.trim() || N8N_CONFIG.messageField;
    const sessionKey = customMapping?.sessionField?.trim() || N8N_CONFIG.sessionField;
    const userIdKey = customMapping?.userIdField?.trim() || N8N_CONFIG.userIdField;
    const userEmailKey = customMapping?.userEmailField?.trim() || N8N_CONFIG.userEmailField;
    const userNameKey = customMapping?.userNameField?.trim() || N8N_CONFIG.userNameField;

    const requestBody: Record<string, any> = {
      action: 'ping',
      [messageKey]: 'ping_test_connection',
      message: 'ping_test_connection',
      query: 'ping_test_connection',
      [sessionKey]: 'test_connection_ping',
      [userIdKey]: 'ping_tester',
      [userEmailKey]: 'ping@bizmate.ai',
      [userNameKey]: 'Connection Ping Tester',
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
    };

    const auth = customMapping?.authHeader?.trim() || N8N_CONFIG.authHeader;
    if (auth) {
      headers['Authorization'] = auth;
    }

    const start = Date.now();
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
      const latencyMs = Date.now() - start;

      if (resp.ok) {
        return {
          success: true,
          message: `Connected successfully to n8n AI Agent (${latencyMs}ms).`,
          latencyMs,
        };
      }

      if (resp.status === 404) {
        return {
          success: false,
          message: `n8n endpoint returned 404 Not Found. Please ensure the workflow is active.`,
          latencyMs,
        };
      }

      return {
        success: false,
        message: `n8n responded with status ${resp.status} (${resp.statusText}).`,
        latencyMs,
      };
    } catch (err: any) {
      const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'this domain';
      const isCors = err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'));
      return {
        success: false,
        message: isCors
          ? `CORS / Network Error: Please ensure "${appOrigin}" is added to Allowed Origins (CORS) in the n8n Webhook node.`
          : (err.message || 'Unable to reach n8n Webhook.'),
        isCorsError: Boolean(isCors),
      };
    }
  },
};
