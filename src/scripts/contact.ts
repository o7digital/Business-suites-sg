import { contactCopy, type ContactLanguage } from '../data/contact';

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) {
  const language: ContactLanguage = form.dataset.language === 'zh' ? 'zh' : form.dataset.language === 'en' ? 'en' : 'es';
  const copy = contactCopy[language];
  const fields = form.querySelector<HTMLFieldSetElement>('[data-contact-fields]')!;
  const status = form.querySelector<HTMLElement>('[data-contact-status]')!;
  const label = form.querySelector<HTMLElement>('[data-contact-submit-label]')!;
  let sending = false;

  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach(field => {
    field.addEventListener('input', () => field.setCustomValidity(''));
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    for (const field of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="text"][required], textarea[required]')) {
      field.setCustomValidity(field.value.trim() ? '' : copy.required);
    }
    if (!form.reportValidity()) return;

    const payload = new FormData(form);
    for (const name of ['name', 'email', 'phone', 'message']) payload.set(name, String(payload.get(name) || '').trim());
    sending = true;
    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = '';
    delete status.dataset.state;
    label.textContent = copy.sending;
    let success = false;
    try {
      const response = await fetch(form.action, {
        method: 'POST', body: payload, headers: { Accept: 'application/json' },
        credentials: 'omit', signal: AbortSignal.timeout(25000),
      });
      if (response.status === 429) throw new Error('rate');
      const result = await response.json();
      if (!response.ok || result?.ok !== true) {
        if (Array.isArray(result?.errors)) {
          for (const error of result.errors) {
            if (typeof error?.field !== 'string') continue;
            const field = form.elements.namedItem(error.field);
            if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.setCustomValidity(copy.invalid);
          }
        }
        throw new Error('unconfirmed');
      }
      form.reset();
      status.dataset.state = 'success';
      status.textContent = copy.success;
      success = true;
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error instanceof Error && error.message === 'rate' ? copy.rate : copy.error;
    } finally {
      sending = false;
      fields.disabled = false;
      form.removeAttribute('aria-busy');
      label.textContent = copy.send;
      if (success) status.focus({ preventScroll: true });
      else if (form.checkValidity()) status.focus({ preventScroll: true });
      else form.reportValidity();
    }
  });
}
