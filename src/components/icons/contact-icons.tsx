import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

const base = { viewBox: "0 0 24 24", "aria-hidden": true, focusable: false } as const;

/** WhatsApp glyph (filled), from the original contact rail. */
export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"
      />
    </svg>
  );
}

/** Speech-bubble WhatsApp variant used by the phone quick-contact bar. */
export function ChatIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <path d="M4 12a8 8 0 1 1 3.3 6.5L4 20l1.2-3.4A8 8 0 0 1 4 12Z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

const SOCIAL_PATHS = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </>
  ),
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" />,
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 11v5M8 8v.01M12 16v-5m0 2a2 2 0 0 1 4 0v3" />
    </>
  ),
  x: <path d="M5 5l14 14M19 5 5 19" />,
} as const;

export function SocialIcon({
  network,
  ...props
}: IconProps & { network: keyof typeof SOCIAL_PATHS }) {
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      {SOCIAL_PATHS[network]}
    </svg>
  );
}
