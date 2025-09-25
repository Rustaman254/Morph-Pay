import Image from "next/image";

export default function Footer() {
  return (
    <footer className="hidden sm:flex fixed bottom-0 left-0 w-full items-center justify-center gap-5 py-6 text-sm text-gray-400 z-50">
      <div className="flex items-center gap-2">
        <Image
          aria-hidden
          src="/morphpay-logo-footer.svg"
          alt=""
          width={20}
          height={20}
        />
        <span className="font-semibold text-[#96a954]">Morph Pay</span>
      </div>
      <span className="mx-2">|</span>
      <a
        href="https://morphpay.com/features"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-[#96a954] transition"
      >
        Features
      </a>
      <a
        href="https://morphpay.com/support"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-[#96a954] transition"
      >
        Support
      </a>
      <a
        href="https://morphpay.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-[#96a954] transition"
      >
        Privacy
      </a>
      <span className="mx-2">|</span>
      <span>© {new Date().getFullYear()} Morph Pay</span>
    </footer>
  );
}
