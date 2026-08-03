# Scenario: E-Signature

Sends the generated offer PDF for real signature via DocuSign or Dropbox Sign, and reports back to the app when the candidate signs. This is Make.com's job because it needs a real e-signature provider account — a credential only you can grant.

**Not required for the demo to work.** The dashboard already has a "Mark as signed (simulate e-signature)" button on a sent offer (`/offers/[id]`) that runs the exact same cascade (`offer_accepted` → `hired` → `onboarding` tasks created) this scenario's webhook would trigger. Build this scenario only if you want a real signing flow.

## Part A — Send the offer for signature

Trigger this from the app when HR clicks "Send offer" — the app already POSTs an application-status-changed event to your Candidate Communications webhook (`MAKE_APPLICATION_WEBHOOK_URL`) when `applications.status` becomes `offer_sent`. Add a branch to that *same* scenario (or a new one watching the same webhook):

**1. Router branch:** filter `record.status equals offer_sent`.

**2. Supabase — Get a Row:** `offers` where `application_id = record.id`, to get `pdf_url` and `salary`/`joining_date` etc.

**3. Supabase — Get a Row:** `candidates` by `record.candidate_id`, for the signer's name/email.

**4. Download the PDF:** the offer PDF lives in a private Supabase Storage bucket (`offer-letters`). Use an **HTTP — Make a Request** module to call `{{APP_URL}}/api/offers/signed-url?path={{offers.pdf_url}}` — but that endpoint requires a dashboard session, so for Make you'll want a small service-role variant, or simpler: use Make's Supabase app's storage download action directly against the `offer-letters` bucket with the service role key already in your Supabase connection.

**5. DocuSign / Dropbox Sign — Send a document for signature:** attach the downloaded PDF, set the signer to the candidate's email, add a signature field near the "Candidate Signature" line at the bottom of the letter.

**6. Supabase — Update a Row:** `offers` → set `esignature_provider` (`"docusign"` or `"dropbox_sign"`) and `esignature_envelope_id` to the envelope/request ID the provider returns.

## Part B — Receive the completed signature

DocuSign and Dropbox Sign both support outbound webhooks ("Connect" for DocuSign, "webhooks" for Dropbox Sign) that fire when a document is fully signed.

**1.** In your DocuSign/Dropbox Sign account, configure their webhook to point at a Make.com Custom Webhook (a new trigger, separate from the application-events one).

**2. Filter:** only proceed when the provider's payload indicates `completed`/`signed` status.

**3. Supabase — Get a Row:** `offers` by `esignature_envelope_id` (matching the ID from Part A step 6) to get the internal `offers.id`.

**4. HTTP — Make a Request:**
```
POST {{APP_URL}}/api/webhooks/esignature
Headers: Content-Type: application/json, X-Webhook-Secret: <MAKE_WEBHOOK_SECRET from .env.local>
Body: { "offer_id": "{{offers.id}}" }
```

That's it — the app's webhook handler does the rest (marks the offer signed, moves the application to `offer_accepted` then `onboarding`, creates the onboarding checklist, logs every step to `automation_logs`). No need to replicate that cascade logic in Make.

## Setup checklist for you

1. Create a free DocuSign or Dropbox Sign developer account.
2. Build Part A (send for signature) as a branch on your existing Candidate Communications scenario.
3. Configure the provider's outbound webhook and build Part B pointing at `/api/webhooks/esignature`.
4. Send a real test offer, sign it yourself, confirm the application ends up at `onboarding` with tasks created.
