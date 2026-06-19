import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function TopNav() {
  return (
    <header className="top-nav">
      <Logo />
      <nav className="desktop-nav">
        <a href="#workouts">Workouts</a>
        <a href="#coaches">Coaches</a>
        <a href="#pricing">Pricing</a>
        <a href="#stories">Stories</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="desktop-actions">
        <Link to="/login">Log in</Link>
        <Link to="/register" className="nav-cta">Build Your Plan</Link>
      </div>
      <button className="hamburger" type="button" aria-label="menu"><Menu /></button>
    </header>
  );
}
