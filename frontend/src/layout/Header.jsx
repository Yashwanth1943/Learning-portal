import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Sun, Moon } from "lucide-react";
import styles from "./Header.module.css";

const Header = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.accent}>GVCC</span>Academy
        </Link>
        <nav className={styles.nav}>
          {user && (
            <>
              <Link
                to="/"
                className={`${styles.navLink} ${
                  location.pathname === "/" ? styles.active : ""
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`${styles.navLink} ${
                  location.pathname === "/profile" ? styles.active : ""
                }`}
              >
                Profile
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className={`${styles.navLink} ${
                    location.pathname === "/admin" ? styles.active : ""
                  }`}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>
        <div className={styles.meta}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme mode"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <Sun size={18} className={styles.sunIcon} />
            ) : (
              <Moon size={18} className={styles.moonIcon} />
            )}
          </button>
          {user ? (
            <div className={styles.userProfileNode}>
              <span className={styles.userNameText}>Hi, {user.name.split(" ")[0]}</span>
              <button onClick={logout} className={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
