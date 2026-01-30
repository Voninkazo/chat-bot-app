import React from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header>
      <nav>
        <ul className="flex space-x-6">
          <li>
            <Link
              to="/admin"
              className="transition-colors duration-300 hover:text-yellow-300"
            >
              Admin
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="transition-colors duration-300 hover:text-yellow-300"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/chat"
              className="transition-colors duration-300 hover:text-yellow-300"
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="transition-colors duration-300 hover:text-yellow-300"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};
