import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 1280,
  initialScale: 0.7,
  userScalable: true,
};

export default function ProjectIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
