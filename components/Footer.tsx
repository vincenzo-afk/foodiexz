import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-6 h-6" fill="currentColor">
                  <path
                    d="M25 30v40c0 5 3 8 6 8h2v10h4v-10h6v10h4v-10h2c3 0 6-3 6-8V30M33 30v6M39 30v6M45 30v6"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M60 25c8 0 12 6 12 12s-4 12-12 12v20h4v10h-8v-10h4v-20c-8 0-12-6-12-12s4-12 12-12z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="font-bold">FoodiezX</span>
            </div>
            <p className="text-muted-foreground mb-4">Your favorite food delivered hot & fresh to your doorstep.</p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-muted-foreground hover:text-primary transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/partner" className="text-muted-foreground hover:text-primary transition-colors">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 FoodiezX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
