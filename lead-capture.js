(function () {
  // --- Config — (The configuration for that particular customer)
  const WEBHOOK_URL = (window.LEAD_CAPTURE_WEBHOOK || "").trim();
  const CUSTOMER_ID = (window.LEAD_CAPTURE_CUSTOMER || "unknown").trim();
  const MAPPINGS = window.LEAD_CAPTURE_MAPPINGS || {};

  if (!WEBHOOK_URL) {
    console.warn("[LeadCapture] Missing window.LEAD_CAPTURE_WEBHOOK. Payloads will not be sent.");
  }

  // --- Helpers — for timestamp and field extraction fn
  const nowIso = () => new Date().toISOString();

  function normalizeField(name, value) {
    const lower = name.toLowerCase();

    // 1. Explicit customer mappings - if manual fields wanted and mapping provided
    if (MAPPINGS[name]) {
      return { key: MAPPINGS[name], value };
    }

    // 2. Heuristics for target fields - if manually no mapping fed
    if (lower.includes("name") && !lower.includes("customer")) {
      return { key: "Name", value };
    }
    if (lower.includes("customer")) {
      return { key: "CustomerName", value };
    }
    if (lower.includes("phone") || lower.includes("tel") || lower.includes("mobile")) {
      return { key: "PhoneNumber", value };
    }
    if (lower.includes("mail") || lower.includes("email")) {
      return { key: "EmailAddress", value };
    }
    if (lower.includes("message") || lower.includes("comment") || lower.includes("detail") || lower.includes("lead")) {
      return { key: "LeadDetails", value };
    }
    if (lower.includes("status")) {
      return { key: "Status", value };
    }
    if (lower.includes("url") || lower.includes("link")) {
      return { key: "SubmissionURL", value };
    }
    if (lower.includes("source")) {
      return { key: "LeadSource", value };
    }
    if (lower.includes("created")) {
      return { key: "CreatedAt", value };
    }
    if (lower.includes("updated")) {
      return { key: "UpdatedAt", value };
    }

    // 3. Preserve everything else - every other data fields that the form had and was not categorized or wanted in the o/p


    return { key: `extra_${name}`, value };
  }

  function buildPayload(form) {
    const formData = new FormData(form);
    const fields = {};
    for (const [name, value] of formData.entries()) {
      const { key, value: normalizedValue } = normalizeField(name, value);
      fields[key] = normalizedValue;
    }

    return {
      sourceUrl: window.location.href,
      timestamp: nowIso(),
      customerId: CUSTOMER_ID,
      fields
    };
  }

  async function sendPayload(payload) {
    if (!WEBHOOK_URL) return;
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch (err) {
      console.error("[LeadCapture] Error sending payload:", err);
    }
  }

  // Attach to all forms as asked
  function attach() {
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      if (form.dataset.leadCaptureBound === "true") return;
      form.dataset.leadCaptureBound = "true";

      form.addEventListener("submit", (event) => {
        try {
          const payload = buildPayload(form);
          sendPayload(payload);
        } catch (err) {
          console.error("[LeadCapture] Prepare/send error:", err);
        }
      });
    });
  }

  // Observe dynamically injected forms (SPAs, CMS)
  const observer = new MutationObserver(() => attach());

  document.addEventListener("DOMContentLoaded", () => {
    attach();
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
