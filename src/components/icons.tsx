import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function HeartIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" {...props}><path d="M20.8 8.8c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.8 2.2Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ShoppingBagIcon(props: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M5 8h14l1 13H4L5 8Z" strokeLinejoin="round" /><path d="M9 9V6a3 3 0 0 1 6 0v3" strokeLinecap="round" /></svg>;
}

export function ArrowRightIcon(props: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><path d="M4 12h15M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function MenuIcon(props: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" /></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>;
}

export function TruckIcon(props: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" strokeLinejoin="round" /><circle cx="7.5" cy="18" r="1.8" /><circle cx="17.5" cy="18" r="1.8" /></svg>;
}

export function ChatIcon(props: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}><path d="M20 11.5a7.5 7.5 0 0 1-11.8 6.15L4 19l1.35-3.38A7.5 7.5 0 1 1 20 11.5Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function SparkleIcon(props: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}><path d="m12 2 1.7 7.3L21 12l-7.3 1.7L12 21l-1.7-7.3L3 12l7.3-2.7L12 2Z" strokeLinejoin="round" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" strokeLinejoin="round" /></svg>;
}

export function InstagramIcon(props: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.7" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>;
}

export function SearchIcon(props: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" strokeLinecap="round" /></svg>;
}

export function FlowerIcon(props: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}><path d="M12 12c-3-4 1-8 3-5 2 2-1 4-3 5Zm0 0c5-2 8 2 5 4-2 1-4-2-5-4Zm0 0c2 5-2 8-4 5-1-2 2-4 4-5Zm0 0c-5 2-8-2-5-4 2-1 4 2 5 4Z" strokeLinejoin="round" /><circle cx="12" cy="12" r="1.2" /></svg>;
}
