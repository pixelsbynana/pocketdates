import Image from "next/image";

export function PhoneFrame({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full max-w-57.5 rounded-[2.25rem] border-8 border-white bg-white shadow-2xl ${className ?? ""}`}
    >
      <div className="relative aspect-1320/2868 w-full overflow-hidden rounded-[1.65rem] bg-muted">
        <Image src={src} alt={alt} fill sizes="230px" className="object-cover object-top" />
      </div>
    </div>
  );
}

export function BrowserFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border-8 border-white bg-white shadow-2xl">
      <div className="flex items-center gap-1.5 bg-beige px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose" />
        <span className="h-2.5 w-2.5 rounded-full bg-brown/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-sage" />
      </div>
      <div className="relative aspect-3020/1620 w-full overflow-hidden bg-muted">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 900px, 100vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
