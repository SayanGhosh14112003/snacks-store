import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[rgb(250,129,47)] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-6 items-start">
        {/* Brand */}
        <div>
          <h1 className="text-2xl font-bold mb-2">DEVI SNACKS</h1>
          <p className="text-sm">
            Delicious snacks delivered to your doorstep. Taste the magic of flavor!
          </p>
        </div>

        {/* Reach Out */}
        <div>
          <h2 className="font-semibold mb-2 text-sm">Reach Out to Us</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 cursor-pointer">
              <Mail className="text-[rgb(221,3,3)] w-5 h-5" />
              <a href="mailto:shreedevisnacks@gmail.com">shreedevisnacks@gmail.com</a>
            </li>
            <li className="flex items-center gap-2 cursor-pointer">
              <Phone className="text-[rgb(221,3,3)] w-5 h-5" />
              <a href="tel:+919038568722">+91 9038568722</a>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h2 className="font-semibold mb-2 text-sm">Follow Us</h2>
          <div className="flex space-x-4 mt-1">
            <Facebook className="w-6 h-6 hover:text-[rgb(221,3,3)] cursor-pointer" />
            <Twitter className="w-6 h-6 hover:text-[rgb(221,3,3)] cursor-pointer" />
            <Instagram className="w-6 h-6 hover:text-[rgb(221,3,3)] cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[rgb(221,3,3)] text-center py-3 text-sm">
        &copy; {new Date().getFullYear()} DEVI SNACKS. All rights reserved.
      </div>
    </footer>
  );
}
