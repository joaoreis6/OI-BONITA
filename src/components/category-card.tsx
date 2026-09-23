import Link from "next/link";
import type { Category } from "@/schemas/catalog";
import { ArrowRightIcon } from "@/components/icons";

export function CategoryCard({ category, index }: { category: Category; index: number }) {
  return (
    <Link className="category-card" href={`/categoria/${category.slug}`}>
      <span className="category-index">0{index + 1} / CATEGORIA</span>
      <span className="category-card-bottom">
        <h3>{category.name}</h3>
        <span className="round-arrow"><ArrowRightIcon width={17} height={17} /></span>
      </span>
    </Link>
  );
}
