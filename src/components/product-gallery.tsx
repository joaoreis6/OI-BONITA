"use client";

import Image from "next/image";
import { useState } from "react";
import { FlowerIcon } from "@/components/icons";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [selected, setSelected] = useState(0);
  const [failedImages, setFailedImages] = useState<number[]>([]);
  const image = images[selected];
  const mainImageFailed = failedImages.includes(selected);
  return (
    <div>
      <div className="product-detail-image">
        {image && !mainImageFailed ? <Image src={image} alt={name} fill sizes="(max-width: 760px) 100vw, 52vw" priority onError={() => setFailedImages((current) => current.includes(selected) ? current : [...current, selected])} /> : <div className="product-image-fallback" role="img" aria-label={`Imagem de ${name} indisponível`}><FlowerIcon width={48} height={48} /><span>Imagem indisponível</span></div>}
      </div>
      {images.length > 1 && <div className="product-gallery-thumbnails" aria-label="Galeria de imagens">
        {images.map((url, index) => <button key={`${url}-${index}`} type="button" aria-label={`Ver imagem ${index + 1} de ${images.length} de ${name}`} aria-pressed={selected === index} onClick={() => setSelected(index)}>
          {failedImages.includes(index) ? <FlowerIcon width={24} height={24} aria-hidden="true" /> : <Image src={url} alt="" fill sizes="76px" onError={() => setFailedImages((current) => current.includes(index) ? current : [...current, index])} />}
        </button>)}
      </div>}
    </div>
  );
}
