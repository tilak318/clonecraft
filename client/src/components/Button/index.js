import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transition};
  position: relative;
  overflow: hidden;
  background-color: ${props => {
    switch (props.color) {
      case 'primary':
        return props.theme.primaryColor;
      case 'secondary':
        return props.theme.secondaryColor;
      case 'success':
        return props.theme.successColor;
      case 'danger':
        return props.theme.dangerColor;
      case 'warning':
        return props.theme.warningColor;
      case 'info':
        return props.theme.infoColor;
      default:
        return props.theme.primaryColor;
    }
  }};
  color: white;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ProgressBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.progress}%;
  background-color: rgba(0, 0, 0, 0.2);
  transition: width 0.2s linear;
  z-index: 1;
`;

const ButtonContent = styled.span`
  position: relative;
  z-index: 2;
  display: contents;
`;

const Button = ({ children, color = 'primary', disabled = false, onClick, progress, ...props }) => {
  return (
    <StyledButton
      color={color}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {progress > 0 && <ProgressBackground progress={progress} />}
      <ButtonContent>{children}</ButtonContent>
    </StyledButton>
  );
};

export default Button; 