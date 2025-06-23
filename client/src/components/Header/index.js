import React from 'react';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 0;
  margin-bottom: 25px;
`;

const Logo = styled.h1`
  font-size: 28px;
  color: #ffffff;
  margin: 0;
  font-weight: 700;
  letter-spacing: 1px;
`;

const Header = () => {
  return (
    <HeaderWrapper>
      <Logo>CloneCraft</Logo>
    </HeaderWrapper>
  );
};

export default Header; 