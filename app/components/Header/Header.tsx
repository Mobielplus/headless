// app/components/Header/Header.tsx
import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import styles from "./Header.css?url";

const INFO_ITEMS = [
  {
    icon: <i className="Truck-icon"></i>,
    text: "Gratis verzending"
  },
  {
    icon: (
      <div className="stars">
        <i className="Star-icon"></i>
        <i className="Star-icon"></i>
        <i className="Star-icon"></i>
        <i className="Star-icon"></i>
        <i className="Star-icon"></i>
      </div>
    ),
    text: "4.9 klantbeoordelingen"
  },
  {
    icon: <img src="/Icons/tweakers.svg" alt="" aria-hidden="true" width="18" height="18" />,
    text: "Tweakers Pricewatch"
  },
  {
    icon: <img src="/Icons/thuiswinkel.svg" alt="" aria-hidden="true" width="18" height="18" />,
    text: "Thuiswinkel Waarborg"
  }
];

// InfoBar Component - handles both desktop and mobile views
const InfoBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % INFO_ITEMS.length);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="info-bar">
      <div className="info-container">
        <div 
          className="info-items"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {INFO_ITEMS.map((item, index) => (
            <div 
              key={index}
              className={`info-item ${index === currentIndex ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const links = () => [{ rel: "stylesheet", href: styles }];

export function Header() {
  return (
    <>
      <header className="site-header" role="banner">
        <div className="header-main">
          <div className="top-nav-container">
            <nav className="main-navigation" aria-label="Main navigation">
              {/* Logo and Menu Container */}
              <div className="logo-menu-container">
                <button className="mobile-menu-button" aria-label="Open menu">
                  <i className="Burger-menu-icon"></i>
                </button>
                <Link to="/" className="logo" aria-label="MobielPlus homepage">
                  <img src="/Logo/Logo.svg" alt="MobielPlus logo" width="150" height="40" />
                </Link>
              </div>

              {/* Search Form */}
              <form role="search" className="search-form" aria-label="Site search">
                <input
                  type="search"
                  placeholder="Waar ben je naar op zoek?"
                  aria-label="Search products"
                  className="search-input"
                />
                <button type="submit" aria-label="Submit search">
                  <i className="Search-icon"></i>
                </button>
              </form>

              {/* User Controls */}
              <div className="user-controls">
                <div className="language-selector">
                  <button type="button" aria-label="Select language" aria-expanded="false">
                    <img src="/Icons/nl-flag.svg" alt="" aria-hidden="true" />
                    <span>NL</span>
                  </button>
                </div>

                <Link to="/account" className="account-link" aria-label="Your account">
                  <i className="Account-icon"></i>
                </Link>

                <Link to="/cart" className="cart-link" aria-label="Shopping cart">
                  <i className="Cart-icon"></i>
                </Link>
              </div>
            </nav>
          </div>

          {/* Category Navigation */}
          <nav className="category-navigation" aria-label="Product categories">
            <ul>
              <li>
                <Link to="/bestsellers" className="category-link">
                  <span className="category-icon" aria-hidden="true">
                    <i className="Stars-icon"></i>
                  </span>
                  Bestsellers
                </Link>
              </li>
              <li><Link to="/opladers" className="category-link">Opladers</Link></li>
              <li><Link to="/audio" className="category-link">Audio</Link></li>
              <li><Link to="/hoesjes" className="category-link">Hoesjes</Link></li>
              <li><Link to="/smartwatches" className="category-link">Smartwatches</Link></li>
              <li><Link to="/trackers" className="category-link">Trackers</Link></li>
              <li><Link to="/opslag" className="category-link">Opslag</Link></li>
              <li><Link to="/pencils" className="category-link">Pencils</Link></li>
              <li><Link to="/meer" className="category-link">Meer</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Unified InfoBar Component */}
      <InfoBar />
    </>
  );
}