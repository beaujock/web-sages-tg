import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

//  Move the viewport configuration to its own export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}
