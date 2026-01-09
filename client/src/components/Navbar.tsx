import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
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
          <img src="logo.svg" alt="logo" className="h-8.5 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-pink-300 transition-colors">
            Home
          </Link>

          <Link
            to="/generate"
            className="hover:text-pink-300 transition-colors"
          >
            Generate
          </Link>

          {isLoggedIn ? (
            <Link
              to="/my-generation"
              className="hover:text-pink-300 transition-colors"
            >
              My Generations
            </Link>
          ) : (
            <Link to="/#" className="hover:text-pink-300 transition-colors">
              About
            </Link>
          )}

          <Link
            to="/#contact"
            className="hover:text-pink-300 transition-colors"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="relative group">
              <button className="rounded-full size-8 bg-white/20 border-2 border-white/10">
                {user?.name?.charAt(0)?.toUpperCase()}
              </button>

              <div className="absolute hidden group-hover:block top-6 right-0">
                <button
                  className="bg-white/20 border-2 border-white/10 px-5 py-1.5 rounded"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hidden md:block px-6 py-2.5 bg-pink-600 hover:bg-pink-700 transition-all rounded-full"
            >
              Get Started
            </button>
          )}
          <button onClick={() => setIsOpen(true)} className="md:hidden">
            <MenuIcon size={26} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link to="/" onClick={() => setIsOpen(false)}>
          Home
        </Link>

        <Link to="/generate" onClick={() => setIsOpen(false)}>
          Generate
        </Link>

        {isLoggedIn ? (
          <Link to="/my-generation" onClick={() => setIsOpen(false)}>
            My Generations
          </Link>
        ) : (
          <Link to="/#" onClick={() => setIsOpen(false)}>
            About
          </Link>
        )}

        {isLoggedIn ? (
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
          >
            Logout
          </button>
        ) : (
          <Link to="/login" onClick={() => setIsOpen(false)}>
            Login
          </Link>
        )}

        <button
          onClick={() => setIsOpen(false)}
          className="size-10 bg-pink-600 hover:bg-pink-700 rounded-md flex items-center justify-center"
        >
          <XIcon />
        </button>
      </div>
    </>
  );
}
