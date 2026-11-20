import { ContactFaq } from "@/components/sections/contact-faq";
import type { HomeContactContent } from "@/content/home/contact";

type HomeContactProps = {
  readonly content: HomeContactContent;
  readonly className?: string;
};

/**
 * Home contact + FAQ (original `section.contact.combo#start`): the shared `ContactFaq` with the
 * home type system (`typography="home"`: Jost 500 uppercase 40px headings, Jost FAQ) and the home
 * content (email and phone only, service select, six FAQs). White, with the home rhythm (104/36 at
 * every width) instead of the inner pages' 120/80. Home's heading style is the reference for the
 * other pages' contact headings (KI-L34).
 */
export function HomeContact({ content, className }: HomeContactProps) {
  return (
    <ContactFaq
      tone="light"
      id="start"
      typography="home"
      reveal
      {...content}
      {...(className ? { className } : {})}
    />
  );
}
