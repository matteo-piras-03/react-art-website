import {Link, NavLink} from "react-router-dom";
import { useState } from "react";
import "../assets/scss/navbar.scss"

function getInitialTheme() {
  const darkModeMediaQuery = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  const userPrefTheme = (darkModeMediaQuery && darkModeMediaQuery.matches) ? "dark" : "light";
  const savedTheme = localStorage.getItem("theme");
  return savedTheme ? savedTheme : userPrefTheme;
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function ImageDisplay({mode}){
  return (
    <div>
      <img id="dark" src="../../assets/svg/moon-stars-svgrepo-com.svg" className={mode === 'dark' ? '' : 'hidden'} />
      <img id="light" src="../../assets/svg/sun-svgrepo-com.svg" className={mode === 'light' ? '' : 'hidden'} />
    </div>
  );
}

function Header() {
  const initialTheme = getInitialTheme();
  setTheme(initialTheme);

  const [theme, setThemeState] = useState(initialTheme);

  return (
    <header id="nav">
      <div id="nav-container">
        <div id="nav_left">
          <NavLink to="/">pirAs03</NavLink>
        </div>
        <div id="nav_right">
          <NavLink to="/art">Art</NavLink>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/warmups">Warmups</NavLink>
          <button id="toggledarkmode" onClick={() => setThemeState(() => {
            const nextTheme = theme === 'dark' ? 'light' : 'dark';
            setTheme(nextTheme);
            return nextTheme;
          })}>
            <ImageDisplay mode={theme} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;