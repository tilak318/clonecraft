import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaSpider, FaGithub } from 'react-icons/fa';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  
  &:hover {
    color: #f0f0f0;
  }
`;

const LogoIcon = styled(FaSpider)`
  font-size: 2rem;
  color: #ffd700;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const GitHubLink = styled.a`
  color: white;
  font-size: 1.5rem;
  padding: 0.5rem;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <LogoIcon />
          Web Scraper
        </Logo>
        <Nav>
          <NavLink to="/">Dashboard</NavLink>
          <GitHubLink 
            href="https://github.com/yourusername/web-scraper-app" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <FaGithub />
          </GitHubLink>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header; 