import { loadEnvConfig } from '@next/env';
import { Resend } from 'resend';
import { emailTemplates, variablesForTemplate } from '../emails/resend/templates.mjs';

loadEnvConfig(process.cwd());

const shouldSync = process.argv.includes('--sync-drafts') || process.argv.includes('--publish');
const shouldPublish = process.argv.includes('--publish');

if (!shouldSync) {
  console.log('Preview only. Add --sync-drafts to create/update Resend drafts.');
  console.log('Add --publish only after reviewing all drafts and approving publication.');
  process.exit(0);
}

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL;
if (!apiKey || apiKey === 'your_resend_api_key' || !from) {
  console.error('Set RESEND_API_KEY and RESEND_FROM_EMAIL before syncing templates.');
  process.exit(1);
}

const resend = new Resend(apiKey);
const existing = new Map();
let after;

do {
  const page = await resend.templates.list({ limit: 100, ...(after ? { after } : {}) });
  if (page.error) {
    console.error(`Could not list Resend templates (${page.error.name || 'API error'}).`);
    process.exit(1);
  }
  for (const template of page.data?.data || []) existing.set(template.alias, template);
  const rows = page.data?.data || [];
  after = page.data?.has_more && rows.length ? rows.at(-1).id : undefined;
} while (after);

for (const template of emailTemplates) {
  const payload = {
    name: template.name,
    alias: template.alias,
    from,
    subject: template.subject,
    html: template.html,
    variables: variablesForTemplate(template),
  };
  const current = existing.get(template.alias);
  let templateId;

  if (current) {
    const updated = await resend.templates.update(current.id, payload);
    if (updated.error) {
      console.error(`${template.alias}: update failed (${updated.error.name || 'API error'}).`);
      process.exitCode = 1;
      continue;
    }
    templateId = updated.data?.id || current.id;
  } else {
    const created = await resend.templates.create(payload);
    if (created.error) {
      console.error(`${template.alias}: create failed (${created.error.name || 'API error'}).`);
      process.exitCode = 1;
      continue;
    }
    templateId = created.data?.id;
  }

  if (shouldPublish && templateId) {
    const published = await resend.templates.publish(templateId);
    if (published.error) {
      console.error(`${template.alias}: draft synced, publish failed (${published.error.name || 'API error'}).`);
      process.exitCode = 1;
      continue;
    }
    console.log(`${template.alias}: published`);
  } else {
    console.log(`${template.alias}: draft synced`);
  }
}
