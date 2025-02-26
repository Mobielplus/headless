// HomepageBanner.tsx
import React from 'react';
import styles from "./HomepageBanner.css?url";

export const links = () => [
  { rel: "stylesheet", href: styles }
];

const HomepageBanner: React.FC = () => {
  return (
    <div className="banners-wrapper">
      {/* Left Banner - Galaxy S25 Cases */}
      <div className="homepage-banner">
        <div className="banner-content">
          <div className="banner-text">
            <h2 className="banner-title">
              Nieuw binnen <i className="Stars-icon"></i>
            </h2>
            <h3 className="banner-subtitle">Galaxy S25 Cases</h3>
          </div>
          <button className="banner-button">
            Bekijk
          </button>
        </div>
        
        <div className="banner-image">
          <img src="/banner/S25 cases.webp" alt="Samsung Galaxy S25 Cases" />
        </div>
      </div>

      {/* Right Banner - Combo Deals */}
      <div className="homepage-banner">
        <div className="banner-content">
          <div className="banner-text">
            <h2 className="banner-title">
              Combo Deals
            </h2>
            <h3 className="banner-subtitle">De beste accessoires, samen nog voordeliger.</h3>
          </div>
          <button className="banner-button">
            Bekijk
          </button>
        </div>
        
        <div className="banner-image banner-combodeal">
          <img className='combodeal' src="/banner/combo-deals.webp" alt="Accessory combo deals" />
        </div>
      </div>
    </div>
  );
};

export default HomepageBanner;