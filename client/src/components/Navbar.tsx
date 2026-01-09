import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { navlinks } from "../data/navlinks";
import type { INavLink } from "../types";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <>
      <motion.nav
        className="fixed top-0 z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
      >
        <Link to="/">
          <img src="logo.svg" alt="" className="h-8.5 w-auto" />
        </Link>

        {/* Desktop links (onClick removed) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium transition-all duration-500">
          <Link
            to="/"
            className="transition-colors duration-300 hover:text-pink-300"
          >
            Home
          </Link>

          <Link
            to="/generate"
            className="transition-colors duration-300 hover:text-pink-300"
          >
            Generate
          </Link>

          <Link
            to="/my-generation"
            className="transition-colors duration-300 hover:text-pink-300"
          >
            My Generations
          </Link>

          <Link
            to="/#contact"
            className="transition-colors duration-300 hover:text-pink-300"
          >
            Contact
          </Link>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="hidden md:block px-6 py-2.5 bg-pink-600 hover:bg-pink-700 active:scale-95 transition-all rounded-full"
        >
          Get Started
        </button>

        <button onClick={() => setIsOpen(true)} className="md:hidden">
          <MenuIcon size={26} className="active:scale-90 transition" />
        </button>
      </motion.nav>

      {/* Mobile menu (onClick added to ALL options) */}
      <div
        className={`fixed inset-0 z-100 bg-black/40 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-400 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="hover:text-pink-300 transition"
        >
          Home
        </Link>

        <Link
          to="/generate"
          onClick={() => setIsOpen(false)}
          className="hover:text-pink-300 transition"
        >
          Generate
        </Link>

        <Link
          to="/my-generation"
          onClick={() => setIsOpen(false)}
          className="hover:text-pink-300 transition"
        >
          My Generations
        </Link>

        <Link
          to="/#"
          onClick={() => setIsOpen(false)}
          className="hover:text-pink-300 transition"
        >
          Contact
        </Link>

        <Link
          to="/login"
          onClick={() => setIsOpen(false)}
          className="transition-colors duration-300 hover:text-pink-300"
        >
          Login
        </Link>

        <button
          onClick={() => setIsOpen(false)}
          className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-pink-600 hover:bg-pink-700 transition text-white rounded-md flex"
        >
          <XIcon />
        </button>
      </div>
    </>
  );
}
