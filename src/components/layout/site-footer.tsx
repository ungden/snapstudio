import Link from "next/link";
import { Facebook, Users } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl font-bold gradient-text mb-4 inline-block">SnapStudio</Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Leading AI product image generation service.
              From 1 source photo, create 12 professional marketing images in 30 seconds.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/snapstudio" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook Page"
                className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a 
                href="https://www.facebook.com/groups/snapstudio" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook Community"
                className="w-10 h-10 bg-gray-700 hover:bg-blue-800 rounded-lg flex items-center justify-center transition-colors"
              >
                <Users className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/features" className="hover:text-white transition-colors">AI Image Generation</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors">Image Styles</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Batch Processing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Solo Mode</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Industries</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/food-beverage" className="hover:text-white transition-colors flex items-center gap-2">🍔 Food & Beverage</Link></li>
              <li><Link href="/beauty-personal-care" className="hover:text-white transition-colors flex items-center gap-2">💄 Beauty & Personal Care</Link></li>
              <li><Link href="/fashion-accessories" className="hover:text-white transition-colors flex items-center gap-2">👕 Fashion & Accessories</Link></li>
              <li><Link href="/mother-baby" className="hover:text-white transition-colors flex items-center gap-2">👶 Mother & Baby</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            © 2025 SnapStudio. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-gray-400">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <a href="mailto:contact@snapstudio.app" className="hover:text-white transition-colors">
              contact@snapstudio.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}