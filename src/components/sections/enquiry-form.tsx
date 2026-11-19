"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, type SubmitEvent, useId, useState } from "react";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { useToast } from "@/components/overlays/toast";
import { useShell } from "@/components/shell/shell-provider";
import { SERVICE_OPTIONS } from "@/content/services";
import { trackLead } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { rememberLead, submitLead } from "@/lib/leads/client";
import {
  formDataToLead,
  type LeadField,
  type LeadFieldErrors,
  leadFieldErrors,
  leadSchema,
} from "@/lib/leads/schema";
import { routes } from "@/lib/routes";

import {
  collectExtra,
  type EnquirySelectField,
  type EnquiryServiceField,
  extraFieldName,
  halfFieldCount,
} from "./enquiry-fields";

export type { EnquirySelectField, EnquiryServiceField } from "./enquiry-fields";

/** Per-page configuration of the inline enquiry form (plain data: will come from Laravel). */
export type EnquiryFormConfig = {
  readonly service: EnquiryServiceField;
  /** 0–3 page-specific selects (original `.f.half.sel`). */
  readonly extraFields?: readonly EnquirySelectField[];
  /** Small print under the button. */
  readonly note?: string;
};

type EnquiryFormProps = EnquiryFormConfig & { readonly className?: string };

/** Field order decides which invalid field receives focus first. */
const FIELD_ORDER: readonly LeadField[] = ["name", "email", "phone", "service"];

const DEFAULT_NOTE = "We typically reply within one business day.";

/** Visitor's own service choice, remembered against the contact request it was made under. */
type ServiceChoice = { readonly value: string; readonly requestId: number | undefined };

/**
 * Inline enquiry form of the contact sections (`.contact .form`). Two columns on the canvas, one on
 * phones; colours follow the section tone. Validation is the shared lead schema with inline errors
 * (KI-F03) and labelled fields (KI-A03). Submits to /api/leads and continues to /thank-you.
 */
export function EnquiryForm({
  service: serviceField,
  extraFields = [],
  note = DEFAULT_NOTE,
  className,
}: EnquiryFormProps) {
  const { contact } = useShell();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const baseId = useId();
  const [errors, setErrors] = useState<LeadFieldErrors>({});
  const [choice, setChoice] = useState<ServiceChoice>();
  const [submitting, setSubmitting] = useState(false);

  // A "go to contact" request for this page preselects its service, overriding an earlier choice;
  // until then the visitor's choice wins over the page's default.
  const request = contact.request?.path === pathname ? contact.request : undefined;
  const selectedService =
    choice && choice.requestId === request?.id
      ? choice.value
      : (request?.service ??
        (serviceField.mode === "select" ? (serviceField.defaultService ?? "") : ""));

  // KI-L22: with an odd number of half-width fields the last one spans both columns.
  const halves = halfFieldCount(serviceField, extraFields.length);
  const lastHalfIsWide = halves % 2 === 1;
  const isLastHalf = (position: number) => lastHalfIsWide && position === halves;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const extra = collectExtra(data, extraFields);
    const candidate = {
      ...formDataToLead(data, {
        form: "contact",
        path: window.location.pathname,
        title: document.title,
      }),
      ...(extra ? { extra } : {}),
    };
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
    rememberLead({
      name: lead.name,
      service: lead.service,
      sourceTitle: lead.source.title,
      sourcePath: lead.source.path,
      status: response.ok ? "sent" : "unsent",
      form: lead.source.form,
      ...(lead.details ? { details: lead.details } : {}),
      ...(lead.extra ? { extra: lead.extra } : {}),
    });
    if (response.ok) trackLead({ service: lead.service, source: lead.source.path });
    form.reset();
    setChoice(undefined);
    router.push(routes.thankYou);
  }

  const ids = (name: string) => ({ id: `${baseId}-${name}`, errorId: `${baseId}-${name}-error` });

  const fieldProps = (name: LeadField) => ({
    name,
    id: `${baseId}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${baseId}-${name}-error` : undefined,
    onInput: () => {
      if (errors[name]) setErrors(({ [name]: _cleared, ...rest }) => rest);
    },
  });

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
      className={cn(
        "relative mt-24 grid grid-cols-2 gap-x-16 gap-y-14 max-lg:mt-40 max-lg:gap-x-18 max-lg:gap-y-20 max-md:grid-cols-1",
        className,
      )}
    >
      <Field label="Full Name" error={errors.name} {...ids("name")}>
        <input
          {...fieldProps("name")}
          autoComplete="name"
          placeholder="Jane Doe"
          required
          aria-required
          className={inputClass}
        />
      </Field>
      <Field label="Email" error={errors.email} {...ids("email")}>
        <input
          {...fieldProps("email")}
          type="email"
          autoComplete="email"
          placeholder="jane@email.com"
          required
          aria-required
          className={inputClass}
        />
      </Field>
      <Field label="Phone" wide={isLastHalf(3)} error={errors.phone} {...ids("phone")}>
        <input
          {...fieldProps("phone")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+1 (000) 000-0000"
          className={inputClass}
        />
      </Field>

      {serviceField.mode === "select" ? (
        <Field
          label="Service Needed"
          wide={isLastHalf(4)}
          error={errors.service}
          {...ids("service")}
        >
          <select
            {...fieldProps("service")}
            required
            aria-required
            value={selectedService}
            onChange={(event) => setChoice({ value: event.target.value, requestId: request?.id })}
            className={selectClass}
          >
            <option value="">Choose a service</option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
      ) : (
        // Hidden-service mode (Factory): leads are filed under the page's service (KI-F01).
        <input type="hidden" name="service" value={serviceField.service} />
      )}

      {extraFields.map((field, index) => {
        const position = halfFieldCount(serviceField, index + 1);
        return (
          <Field
            key={field.name}
            label={field.label}
            wide={isLastHalf(position)}
            {...ids(`extra-${field.name}`)}
          >
            <select
              name={extraFieldName(field.name)}
              id={`${baseId}-extra-${field.name}`}
              defaultValue=""
              className={selectClass}
            >
              <option value="">Select</option>
              {field.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Field>
        );
      })}

      <Field label="Project Details" wide error={errors.details} {...ids("details")}>
        <textarea
          {...fieldProps("details")}
          placeholder="Tell us about your site, timeline, and budget range."
          className={cn(inputClass, "h-76 resize-y py-14 align-baseline max-lg:h-108")}
        />
      </Field>

      {/* Honeypot (hidden from people and assistive tech). */}
      <div aria-hidden className="absolute -left-[9999px] size-1 overflow-hidden">
        <label>
          Company website
          <input name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting || undefined}
        className="col-span-full mt-4 flex h-50 cursor-pointer items-center justify-center gap-12 bg-brand font-display text-[14px] font-semibold text-mist transition-colors duration-200 hover:bg-[#f07040] disabled:opacity-70 in-data-[tone=dark]:text-ink-2"
      >
        {submitting ? "Sending…" : "Send Enquiry"}
        <ArrowIcon direction="up-right" width={10} height={10} className="flex-none" />
      </button>
      <p className="col-span-full -mt-6 font-display text-[10.5px] text-[#333] in-data-[tone=dark]:text-[#ccc]">
        {note}
      </p>
    </form>
  );
}

const inputClass =
  "h-42 w-full rounded-none border border-[#dcdcdc] bg-[#f5f5f5] px-16 font-display text-[14px] text-ink-2 transition-[border-color] duration-200 placeholder:text-[#666] aria-invalid:border-brand in-data-[tone=dark]:border-white in-data-[tone=dark]:bg-[#f8f7f3] max-lg:h-46 max-md:text-[16px]";

const selectClass = cn(inputClass, "cursor-pointer select-chevron pr-40 font-medium");

function Field({
  id,
  errorId,
  label,
  wide = false,
  error,
  children,
}: {
  id: string;
  errorId: string;
  label: string;
  wide?: boolean;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className={cn("relative", wide && "col-span-full")}>
      <label
        htmlFor={id}
        className="mb-6 block font-display text-[12px] font-medium text-[#444] in-data-[tone=dark]:text-mist max-lg:mb-9"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={errorId}
          className="mt-6 font-display text-[12px] text-brand-text in-data-[tone=dark]:text-brand"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
