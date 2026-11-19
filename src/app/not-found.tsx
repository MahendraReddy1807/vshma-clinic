import Link from 'next/link';
import { Leaf, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-mint text-forest flex items-center justify-center mb-6 shadow-sm">
        <Leaf className="w-8 h-8" />
      </div>

      <span className="text-xs uppercase tracking-widest text-gold font-bold">
        Error 404
      </span>
      <h1 className="font-heading text-4xl sm:text-5xl font-bold text-forest mt-2 mb-4">
        Page Not Found
      </h1>
      <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base mb-8 leading-relaxed">
        The page you are looking for doesn&apos;t exist or might have been relocated. Return to the home page or book a consultation directly.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Link href="/">
          <Button variant="primary" size="md">
            <Home className="w-4 h-4 mr-2" />
            <span>Back to Home</span>
          </Button>
        </Link>
        <Link href="/book">
          <Button variant="secondary" size="md">
            <span>Book Consultation</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
