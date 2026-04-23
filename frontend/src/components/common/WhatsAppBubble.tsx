import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function WhatsAppBubble() {
  return (
    <Link
      href="https://wa.me/905433929230"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişim"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-300 transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </Link>
  );
}
