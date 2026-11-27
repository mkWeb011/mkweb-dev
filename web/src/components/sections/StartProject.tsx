'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { site } from '@/content/site';
import { INQUIRY_FORM_NAME, inquirySteps as steps } from '@/content/inquiry';
import {
  emptyValues,
  encodeInquiry,
  firstInvalidStep,
  summarizeInquiry,
  validateStep,
  type InquiryErrors,
  type InquiryField,
  type InquiryValues,
} from '@/lib/inquiry';
import { SectionHead } from '@/components/ui/SectionHead';
import { AvailablePill } from '@/components/ui/AvailablePill';
import styles from './StartProject.module.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** Nothing to subscribe to: the value only changes from server to client. */
const noopSubscribe = () => () => {};

/**
 * "Start a project" — a multi-step brief for people who are not ready for a call.
 *
 * Progressive enhancement:
 *  - Server HTML (no JS): every step is visible, native `required` checks,
 *    the browser POSTs to the Worker, which answers with a redirect to /thanks/.
 *  - After hydration (`enhanced`): one step at a time, our own validation,
 *    fetch() to the same endpoint asking for JSON, success screen in place.
 * `enhanced` comes from useSyncExternalStore: false on the server and during
 * hydration, true right after, so server and first
 * client render are identical — no hydration mismatch.
 */
export function StartProject() {
  // false on the server and during hydration, true right after it.
  const enhanced = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [current, setCurrent] = useState(0);
  const [values, setValues] = useState<InquiryValues>(() => emptyValues(steps));
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [botField, setBotField] = useState('');

  const formId = useId();
  const stepHeadings = useRef<(HTMLLegendElement | null)[]>([]);
  const doneHeading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false); // skip focusing on the very first render

  // Move focus to the new step's heading so keyboard and screen-reader
  // users continue from the right place (not from the "Next" button).
  useEffect(() => {
    if (!moved.current) return;
    stepHeadings.current[current]?.focus({ preventScroll: false });
  }, [current]);

  useEffect(() => {
    if (status === 'sent') doneHeading.current?.focus();
  }, [status]);

  const step = steps[current]!;
  const isLast = current === steps.length - 1;

  function update(name: string, value: string | string[]) {
    setValues((v) => ({ ...v, [name]: value }));
    // Clear the error as soon as the user fixes the field.
    if (errors[name]) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest[name];
        return rest;
      });
    }
  }

  function toggle(name: string, option: string) {
    const list = (values[name] as string[]) ?? [];
    update(name, list.includes(option) ? list.filter((o) => o !== option) : [...list, option]);
  }

  function focusFirstError(found: InquiryErrors) {
    const first = Object.keys(found)[0];
    if (!first) return;
    // requestAnimationFrame: wait until React has rendered the error state.
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-field="${formId}-${first}"]`)?.focus();
    });
  }

  function goTo(index: number) {
    moved.current = true;
    setCurrent(index);
  }

  function next() {
    const found = validateStep(step, values);
    setErrors(found);
    if (Object.keys(found).length) return focusFirstError(found);
    goTo(current + 1);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    if (!enhanced) return; // no JS → let the browser do a normal POST
    event.preventDefault();
    if (!isLast) return next(); // Enter key on an earlier step = "Next"

    const invalid = firstInvalidStep(steps, values);
    if (invalid !== -1) {
      const found = validateStep(steps[invalid]!, values);
      setErrors(found);
      if (invalid !== current) goTo(invalid);
      return focusFirstError(found);
    }

    setStatus('sending');
    try {
      const res = await fetch(site.inquiryEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Tells the Worker to answer with JSON instead of a redirect.
          Accept: 'application/json',
        },
        body: encodeInquiry(INQUIRY_FORM_NAME, values, { 'bot-field': botField }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('sent');
    } catch (error) {
      console.warn('[inquiry] send failed:', error);
      setStatus('error');
    }
  }

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent('Project inquiry')}&body=${encodeURIComponent(
    summarizeInquiry(steps, values),
  )}`;

  return (
    <section className={styles.start} id="start" aria-labelledby="start-h">
      <SectionHead
        index="08 / Start a project"
        title="Tell me about the"
        accent="build"
        aside="Not ready for a call? · ~3 min"
        id="start-h"
      />

      <div className={styles.layout}>
        {/* ---- Left: progress rail ---------------------------------------- */}
        <aside className={styles.rail} aria-label="Form progress">
          <p className={styles.lead}>
            A short brief instead of a long email. You get a reply with questions, a rough approach and the next step —
            no sales sequence.
          </p>
          {enhanced && status !== 'sent' && (
            <ol className={styles.steps}>
              {steps.map((s, i) => (
                <li key={s.id} className={styles.stepItem} data-state={i < current ? 'done' : i === current ? 'now' : 'next'}>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.label}</span>
                  {i === current && <span className="sr-only">(current step)</span>}
                </li>
              ))}
            </ol>
          )}
          <PreferToTalk />
        </aside>

        {/* ---- Right: the form -------------------------------------------- */}
        {status === 'sent' ? (
          <div className={styles.done} role="status">
            <h3 ref={doneHeading} tabIndex={-1}>
              Thanks{typeof values.name === 'string' && values.name.trim() ? `, ${values.name.trim().split(' ')[0]}` : ''}.{' '}
              <span className="serif">Brief received.</span>
            </h3>
            <p>I&apos;ll read it properly and reply by email with questions and a suggested next step.</p>
            <dl className={styles.summary}>
              {steps.flatMap((s) =>
                s.fields
                  .filter((f) => f.name !== 'message')
                  .map((f) => {
                    const v = values[f.name];
                    const text = Array.isArray(v) ? v.join(', ') : (v ?? '');
                    return text ? (
                      <div key={f.name}>
                        <dt className="mono">{f.label}</dt>
                        <dd>{text}</dd>
                      </div>
                    ) : null;
                  }),
              )}
            </dl>
          </div>
        ) : (
          <form
            className={styles.form}
            name={INQUIRY_FORM_NAME}
            method="POST"
            action={site.inquiryEndpoint}
            noValidate={enhanced}
            onSubmit={submit}
            aria-describedby={enhanced ? `${formId}-progress` : undefined}
          >
            <input type="hidden" name="form-name" value={INQUIRY_FORM_NAME} />
            {/* Honeypot: hidden from people, irresistible to bots. */}
            <p className={styles.honey} aria-hidden="true">
              <label>
                Leave empty
                <input name="bot-field" tabIndex={-1} autoComplete="off" value={botField} onChange={(e) => setBotField(e.target.value)} />
              </label>
            </p>

            {enhanced && (
              <div className={styles.progress} aria-hidden="true">
                <i style={{ transform: `scaleX(${(current + 1) / steps.length})` }} />
              </div>
            )}
            <p id={`${formId}-progress`} className="sr-only" aria-live="polite">
              {enhanced ? `Step ${current + 1} of ${steps.length}: ${step.label}` : ''}
            </p>

            {steps.map((s, i) => (
              <fieldset
                key={s.id}
                className={styles.step}
                hidden={enhanced && i !== current}
                data-active={enhanced && i === current ? '' : undefined}
              >
                <legend
                  className={styles.legend}
                  tabIndex={-1}
                  ref={(el) => {
                    stepHeadings.current[i] = el;
                  }}
                >
                  <span className="mono muted">
                    Step {i + 1} / {steps.length}
                  </span>
                  <span className={styles.stepTitle}>
                    {s.title} <span className="serif">{s.accent}</span>
                  </span>
                </legend>
                {s.fields.map((field) => (
                  <Field
                    key={field.name}
                    field={field}
                    id={`${formId}-${field.name}`}
                    value={values[field.name]}
                    error={errors[field.name]}
                    native={!enhanced}
                    onText={(v) => update(field.name, v)}
                    onToggle={(o) => toggle(field.name, o)}
                  />
                ))}
              </fieldset>
            ))}

            <div className={styles.actions}>
              {enhanced && current > 0 && (
                <button type="button" className="pill" onClick={() => goTo(current - 1)}>
                  ← Back
                </button>
              )}
              {/*
                Different `key`s force React to create a NEW <button> instead of
                turning the clicked type="button" into type="submit" mid-click —
                otherwise the browser would submit the form on the last "Next".
              */}
              {enhanced && !isLast ? (
                <button key="next" type="button" className={styles.primary} onClick={next}>
                  Next: {steps[current + 1]!.label} <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button key="submit" type="submit" className={styles.primary} disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send the brief'} <span aria-hidden="true">→</span>
                </button>
              )}
            </div>

            {status === 'error' && (
              <p className={styles.error} role="alert">
                The brief didn&apos;t send — my fault, not yours. <a href={mailto}>Send it by email instead</a> (your
                answers are already filled in).
              </p>
            )}
          </form>
        )}

        {/* Phones: the call option comes AFTER the form, not between stepper and questions. */}
        <PreferToTalk mobile />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function PreferToTalk({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? styles.altMobile : styles.alt}>
      <span className="mono muted">Prefer to talk?</span>
      <AvailablePill />
    </div>
  );
}

/** " *" for required fields (hidden from screen readers — inputs carry `required`
 *  or the error text), "optional" spelled out for the rest. */
function RequiredMark({ required }: { required?: boolean }) {
  return required ? <span aria-hidden="true"> *</span> : <span className={styles.optional}> — optional</span>;
}

interface FieldProps {
  field: InquiryField;
  id: string;
  value: string | string[] | undefined;
  error: string | undefined;
  /** No JS yet → rely on native `required` validation. */
  native: boolean;
  onText: (value: string) => void;
  onToggle: (option: string) => void;
}

/** One question. Option groups are a fieldset of real radios/checkboxes. */
function Field({ field, id, value, error, native, onText, onToggle }: FieldProps) {
  const hintId = field.hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  if (field.kind === 'single' || field.kind === 'multi') {
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    const type = field.kind === 'single' ? 'radio' : 'checkbox';
    return (
      <fieldset className={styles.group} aria-describedby={describedBy}>
        <legend className={styles.label}>
          {field.label}
          <RequiredMark required={field.required} />
        </legend>
        {field.hint && (
          <p id={hintId} className={styles.hint}>
            {field.hint}
          </p>
        )}
        <div className={styles.options} data-many={field.options.length > 5 ? '' : undefined}>
          {field.options.map((option, i) => {
            const checked = selected.includes(option.value);
            return (
              <label key={option.value} className={styles.option} data-checked={checked ? '' : undefined}>
                <input
                  type={type}
                  name={field.name}
                  value={option.value}
                  checked={checked}
                  // Native fallback: one required radio is enough for the group.
                  required={native && field.required && type === 'radio' && i === 0}
                  data-field={i === 0 ? id : undefined}
                  onChange={() => (type === 'radio' ? onText(option.value) : onToggle(option.value))}
                />
                <span className={styles.optionText}>
                  <span>{option.value}</span>
                  {option.note && <span className={styles.note}>{option.note}</span>}
                </span>
                <span className={styles.tick} aria-hidden="true" />
              </label>
            );
          })}
        </div>
        {error && (
          <p id={errorId} className={styles.fieldError}>
            {error}
          </p>
        )}
      </fieldset>
    );
  }

  const common = {
    id,
    name: field.name,
    value: typeof value === 'string' ? value : '',
    required: native && field.required,
    autoComplete: 'autoComplete' in field ? field.autoComplete : undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'data-field': id,
    className: styles.input,
  } as const;

  return (
    <div className={styles.textField}>
      <label htmlFor={id} className={styles.label}>
        {field.label}
        <RequiredMark required={field.required} />
      </label>
      {field.hint && (
        <p id={hintId} className={styles.hint}>
          {field.hint}
        </p>
      )}
      {field.kind === 'textarea' ? (
        <textarea {...common} rows={6} onChange={(e) => onText(e.target.value)} />
      ) : (
        <input
          {...common}
          type={field.kind === 'url' ? 'text' : field.kind}
          inputMode={field.kind === 'url' ? 'url' : undefined}
          onChange={(e) => onText(e.target.value)}
        />
      )}
      {error && (
        <p id={errorId} className={styles.fieldError}>
          {error}
        </p>
      )}
    </div>
  );
}
