"use client";

import { useRouter } from "next/navigation";
import { type SubmitEvent, useEffect, useId, useRef, useState } from "react";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { ServiceIcon } from "@/components/icons/service-icon";
import { useToast } from "@/components/overlays/toast";
import { useShell } from "@/components/shell/shell-provider";
import { Kicker } from "@/components/ui/kicker";
import { SERVICE_NOT_SURE, SERVICE_OPTIONS } from "@/content/services";
import { SITE } from "@/content/site";
import { trackLead } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { rememberLead, submitLead, toLastLead } from "@/lib/leads/client";
import {
  BUDGETS,
  formDataToLead,
  LEAD_LOCATIONS,
  type LeadField,
  type LeadFieldErrors,
  leadFieldErrors,
  leadSchema,
  PROJECT_TYPES,
  TIMELINES,
} from "@/lib/leads/schema";
import { routes } from "@/lib/routes";

const POINTS = [
  "One team for design, interiors and construction",
  "Clear scope, budget and programme from day one",
  "Studios in Kochi and Dubai",
];

/** Field order decides which invalid field receives focus first. */
const FIELD_ORDER: readonly LeadField[] = ["name", "email", "phone", "service"];

/**
 * "Start a Project" enquiry popup (`.kpop`). A native modal <dialog>: the browser provides the
 * focus trap, Escape handling and inert background. Rendered outside the zoomed canvas.
 */
export function StartProjectDialog() {
  const { enquiry } = useShell();
  const router = useRouter();
  const toast = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const [errors, setErrors] = useState<LeadFieldErrors>({});
  const [chosenService, setChosenService] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (enquiry.isOpen && !dialog.open) {
      dialog.showModal();
      // The original focuses the first field once the panel has settled.
      const field = formRef.current?.elements.namedItem("name");
      if (field instanceof HTMLInputElement) field.focus({ preventScroll: true });
    } else if (!enquiry.isOpen && dialog.open) {
      dialog.close();
    }
  }, [enquiry.isOpen]);

  // The visitor's choice wins; until they choose, preselect the page's service.
  const service = chosenService !== "" ? chosenService : (enquiry.service ?? "");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const candidate = formDataToLead(new FormData(form), {
      form: "popup",
      path: window.location.pathname,
      title: document.title,
    });
    const parsed = leadSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors = leadFieldErrors(parsed.error);
      setErrors(fieldErrors);
      const first = FIELD_ORDER.find((field) => fieldErrors[field]);
      const element = first ? form.elements.namedItem(first) : null;
      if (element instanceof HTMLElement) element.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    const response = await submitLead(parsed.data);
    setSubmitting(false);

    if (!response.ok && response.status === "invalid") {
      setErrors(response.errors);
      return;
    }
    if (!response.ok && response.status === "rate-limited") {
      toast("Too many enquiries from this connection. Please try again in a few minutes.");
      return;
    }

    const lead = parsed.data;
    rememberLead(toLastLead(lead, response.ok ? "sent" : "unsent"));
    if (response.ok) trackLead({ service: lead.service, source: lead.source.path });
    form.reset();
    setChosenService("");
    enquiry.close();
    router.push(routes.thankYou);
  }

  const fieldProps = (name: LeadField) => ({
    name,
    id: `${titleId}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${titleId}-${name}-error` : undefined,
    onInput: () => {
      if (errors[name]) setErrors(({ [name]: _cleared, ...rest }) => rest);
    },
  });

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-lock-scroll
      onClose={enquiry.close}
      className="group fixed inset-0 m-0 size-full max-h-none max-w-none items-center justify-center overflow-hidden border-0 bg-transparent p-40 text-ink-2 transition-[display,overlay] transition-discrete duration-450 backdrop:bg-transparent open:flex max-md:p-16"
    >
      {/* Backdrop: clicking it closes the popup. */}
      <div
        aria-hidden
        onClick={enquiry.close}
        className="absolute inset-0 bg-black/72 opacity-0 backdrop-blur-[4px] transition-opacity duration-350 group-open:opacity-100 starting:group-open:opacity-0"
      />

      <div className="relative grid max-h-[min(82vh,700px)] w-[min(880px,100%)] translate-y-26 scale-[.985] grid-cols-[290px_1fr] overflow-hidden bg-white opacity-0 transition-[opacity,transform] duration-[350ms,450ms] ease-out-k group-open:translate-y-0 group-open:scale-100 group-open:opacity-100 max-md:max-h-[min(80dvh,calc(100dvh_-_96px))] max-md:grid-cols-1 max-md:overflow-y-auto max-md:overscroll-contain max-md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] starting:group-open:translate-y-26 starting:group-open:scale-[.985] starting:group-open:opacity-0">
        <button
          type="button"
          aria-label="Close"
          onClick={enquiry.close}
          className="absolute top-10 right-10 z-2 grid size-36 place-items-center border border-[#e3e3e3] bg-white text-ink-2 transition-colors duration-200 hover:border-ink-2 hover:bg-ink-2 hover:text-white max-md:top-8 max-md:right-8 max-md:border-[#333] max-md:bg-black max-md:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable={false}>
            <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth={1.6} />
          </svg>
        </button>

        <div
          data-tone="dark"
          className="flex flex-col bg-black px-28 py-32 text-white max-md:px-20 max-md:pt-22 max-md:pb-18"
        >
          <Kicker font="home" className="max-md:text-[10px]">
            Start a Project
          </Kicker>
          <h2
            id={titleId}
            className="mt-14 font-display text-[28px] leading-[1.04] font-medium uppercase max-md:mt-10 max-md:text-[21px] max-md:leading-[1.1]"
          >
            Let’s build
            <br />
            something that
            <br />
            lasts.
          </h2>
          <p className="mt-12 font-display text-[13.5px] leading-[1.7] text-[#bbb] max-md:hidden">
            Share a few details about your site and plans. A KATIC lead will reply within one
            business day to set up a first conversation.
          </p>
          <ul className="mt-18 border-t border-[#222] max-md:hidden">
            {POINTS.map((point) => (
              <li
                key={point}
                className="flex items-start gap-14 border-b border-[#222] py-10 font-display text-[12.5px] leading-[1.5] text-[#ddd]"
              >
                <ServiceIcon name="check-circle" size={20} className="mt-1 flex-none text-brand" />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-8 pt-16 font-display text-[12px] text-[#999] max-md:hidden">
            Prefer to talk?
            <a href={SITE.phone.href} className="text-[13.5px] text-white hover:text-brand">
              {SITE.phone.display}
            </a>
            <a href={`mailto:${SITE.email}`} className="text-[13.5px] text-white hover:text-brand">
              {SITE.email}
            </a>
          </div>
        </div>

        <div className="overflow-y-auto overscroll-contain px-30 pt-28 pb-24 max-md:overflow-visible max-md:px-20 max-md:pt-18 max-md:pb-22">
          <h3 className="font-display text-[18px] font-medium tracking-[0.01em] uppercase max-md:text-[16px]">
            Tell us about your project
          </h3>
          <p className="mt-6 font-display text-[12.5px] text-[#666] max-md:text-[13.5px]">
            Fields marked <span className="text-brand">*</span> are required.
          </p>

          <form
            ref={formRef}
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
            className="mt-16 grid grid-cols-2 gap-x-14 gap-y-10 max-md:mt-14 max-md:grid-cols-1 max-md:gap-10"
          >
            <Field label="Full name" required error={errors.name} {...fieldIds(titleId, "name")}>
              <input
                {...fieldProps("name")}
                autoComplete="name"
                placeholder="Jane Doe"
                required
                className={inputClass}
              />
            </Field>
            <Field label="Email" required error={errors.email} {...fieldIds(titleId, "email")}>
              <input
                {...fieldProps("email")}
                type="email"
                autoComplete="email"
                placeholder="jane@email.com"
                required
                className={inputClass}
              />
            </Field>
            <Field label="Phone" {...fieldIds(titleId, "phone")}>
              <input
                {...fieldProps("phone")}
                type="tel"
                autoComplete="tel"
                placeholder="+91 00000 00000"
                className={inputClass}
              />
            </Field>
            <Field label="Project location" {...fieldIds(titleId, "location")}>
              <select {...fieldProps("location")} defaultValue="" className={selectClass}>
                <option value="">Select</option>
                {LEAD_LOCATIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Service needed"
              required
              wide
              error={errors.service}
              {...fieldIds(titleId, "service")}
            >
              <select
                {...fieldProps("service")}
                required
                value={service}
                onChange={(event) => setChosenService(event.target.value)}
                className={selectClass}
              >
                <option value="">Choose a service</option>
                {[...SERVICE_OPTIONS, SERVICE_NOT_SURE].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <fieldset className="col-span-full flex flex-col gap-6">
              <legend className={cn(labelClass, "mb-6")}>Project type</legend>
              <div className="flex flex-wrap gap-8">
                {PROJECT_TYPES.map((type) => (
                  <label
                    key={type}
                    className="inline-flex h-32 cursor-pointer items-center border border-[#dcdcdc] px-11 font-display text-[10.5px] font-medium tracking-[0.08em] text-[#333] uppercase transition-colors duration-200 hover:border-ink-2 has-checked:border-ink-2 has-checked:bg-ink-2 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand max-md:h-36 max-md:px-14 max-md:text-[11.5px]"
                  >
                    <input type="radio" name="projectType" value={type} className="sr-only" />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Timeline" {...fieldIds(titleId, "timeline")}>
              <select {...fieldProps("timeline")} defaultValue="" className={selectClass}>
                <option value="">Select</option>
                {TIMELINES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Budget range" {...fieldIds(titleId, "budget")}>
              <select {...fieldProps("budget")} defaultValue="" className={selectClass}>
                <option value="">Select</option>
                {BUDGETS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Project details" wide {...fieldIds(titleId, "details")}>
              <textarea
                {...fieldProps("details")}
                placeholder="Tell us about your site, what you want to build and anything we should know."
                className={cn(inputClass, "h-68 resize-y py-12 text-[14.5px] max-md:h-72")}
              />
            </Field>

            {/* Honeypot (hidden from people and assistive tech). */}
            <div aria-hidden className="absolute -left-[9999px] size-1 overflow-hidden">
              <label>
                Company website
                <input name="company_website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="col-span-full mt-6 flex items-center justify-between gap-16 max-md:flex-col-reverse max-md:items-stretch">
              <small className="font-display text-[12px] text-[#777]">
                We reply within one business day.
              </small>
              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting || undefined}
                className="inline-flex h-46 items-center gap-14 bg-brand-fill px-24 font-display text-[12.5px] font-medium tracking-[0.16em] text-white uppercase transition-colors duration-200 hover:bg-ink-2 disabled:opacity-70 max-md:h-52 max-md:justify-center max-md:px-30"
              >
                {submitting ? "Sending…" : "Send Enquiry"}
                <ArrowIcon width={12} height={12} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}

const labelClass = "font-display text-[11px] font-medium uppercase tracking-[0.12em] text-[#444]";

const inputClass =
  "h-40 w-full rounded-none border border-[#dcdcdc] bg-[#f6f6f6] px-14 font-display text-[14px] text-ink-2 transition-[border-color,background-color] duration-200 focus:border-ink-2 focus:bg-white aria-invalid:border-brand aria-invalid:bg-[#fff6f2] max-md:h-44 max-md:text-[16px]";

const selectClass = cn(inputClass, "select-chevron pr-36");

function fieldIds(prefix: string, name: LeadField) {
  return { id: `${prefix}-${name}`, errorId: `${prefix}-${name}-error` };
}

function Field({
  id,
  errorId,
  label,
  required = false,
  wide = false,
  error,
  children,
}: {
  id: string;
  errorId: string;
  label: string;
  required?: boolean;
  wide?: boolean;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-6", wide && "col-span-full")}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required ? <b className="font-medium text-brand"> *</b> : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="font-display text-[12px] text-brand-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}
