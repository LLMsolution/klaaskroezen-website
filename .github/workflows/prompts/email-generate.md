# Email HTML Generator — Klaas Kroezen

## Context
- Repository: $REPOSITORY
- Session ID: $SESSION_ID
- Mode: $MODE (new | edit)
- Language: $LANG (nl | en)

## User's request
$USER_PROMPT

## Uploaded image URLs (use these in the email)
$IMAGE_URLS

## Existing email HTML (only if mode=edit)
$EXISTING_HTML

## Your task
Generate email **body content HTML** (NOT a full document — no `<!DOCTYPE>`, no `<html>`, no `<head>`, no `<body>` tags). The body will be wrapped in the Klaas Kroezen email layout automatically.

## Design system
- **Heading**: `<h1 style="margin: 0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 900; line-height: 1.1; color: #0E0C0A;">...</h1>`
- **Subheading**: `<h2 style="margin: 24px 0 12px; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; line-height: 1.2; color: #0E0C0A;">...</h2>`
- **Paragraph**: `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.75; color: #444;">...</p>`
- **CTA button**: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;"><tr><td style="background-color: #B5622A; border-radius: 2px;"><a href="URL" style="display: inline-block; padding: 14px 28px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #ffffff; text-decoration: none;">TEKST</a></td></tr></table>`
- **Divider**: `<hr style="border: none; border-top: 1px solid #EDE9E2; margin: 24px 0;" />`
- **Quote**: `<blockquote style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid #B5622A; background-color: #faf8f5; font-size: 15px; line-height: 1.75; color: #555; font-style: italic;">...</blockquote>`
- **Signature**: `<p style="margin: 24px 0 0; font-size: 15px; line-height: 1.75; color: #444;">Met vriendelijke groet,<br /><strong style="color: #0E0C0A;">Klaas Kroezen</strong></p>`
- **Image**: `<img src="URL" alt="..." width="520" style="display: block; max-width: 100%; height: auto; border-radius: 2px; margin: 16px 0;" />`
- **Video thumbnail**: `<a href="VIDEO_URL" style="display: block; position: relative; margin: 16px 0;"><img src="THUMBNAIL_URL" alt="..." width="520" style="display: block; max-width: 100%; height: auto; border-radius: 2px;" /></a>`
- **Feature list with checkmarks**: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 16px 0;"><tr><td style="padding: 4px 12px 4px 0; vertical-align: top; color: #B5622A; font-size: 14px;">&check;</td><td style="padding: 4px 0; font-size: 14px; line-height: 1.6; color: #555;">Item text</td></tr></table>`

## Colors
- Copper (accent/CTA): #B5622A
- Ink (text): #0E0C0A
- Warm (borders/backgrounds): #EDE9E2

## Tone of voice
- Warm, persoonlijk, professioneel
- Spreek de lezer direct aan (je/jouw)
- Geen hype, geen druk, oprecht en ontspannen
- Kort en bondig — geen lange lappen tekst

## Rules
- ALL styling must be inline (no CSS classes — email clients strip `<style>` in body)
- Use `<table>` for layout (not flexbox/grid)
- Images: always include `width`, `alt`, and `style="display: block; max-width: 100%; height: auto;"`
- Max content width is 520px (the layout adds 40px padding on each side of the 600px card)
- If images were provided, use them prominently
- End with a signature unless the user says otherwise
- Output ONLY the body HTML — no explanation, no markdown code fences

## Output
Write the body HTML to a file called `/tmp/email-output.html`. Nothing else.
