"use client";

import Image from "next/image";
import { useState } from "react";
import { FlowerIcon } from "@/components/icons";

export function ResilientProductImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="product-image-fallback" role="img" aria-label={`Imagem de ${alt} indisponível`}><FlowerIcon width={32} height={32} /></span>;
  return <Image src={src} alt={alt} fill sizes={sizes} onError={() => setFailed(true)} />;
}
