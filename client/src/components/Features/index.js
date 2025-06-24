import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaBolt, FaFolder, FaMagic, FaCode, FaCog, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../Button';
import axios from 'axios';
import { axiosConfig } from '../../config/api';

const FeaturesContainer = styled.div`
  background: ${props => props.theme.backgroundColor};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid ${props => props.theme.borderColor};
  box-shadow: ${props => props.theme.boxShadow};
  padding: 25px;
  height: 100%;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.textColor};
  margin: 0 0 20px 0;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  padding-bottom: 20px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 25px;
  &:last-child {
      margin-bottom: 0;
  }
`;

const FeatureIcon = styled.div`
  color: ${props => props.theme.primaryColor};
  font-size: 20px;
  margin-top: 3px;
`;

const FeatureText = styled.div``;

const FeatureTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: ${props => props.theme.textColor};
`;

const FeatureDescription = styled.p`
  font-size: 14px;
  color: ${props => props.theme.secondaryColor};
  margin: 0;
  line-height: 1.5;
`;

const Card = styled.div`
  margin-top: 30px;
  padding: 25px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const ButtonGroup = styled.div`
  margin-bottom: 15px;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${props => props.theme.borderColor};
  border-top: 2px solid ${props => props.theme.primaryColor};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Features = () => {
    const features = [
        {
            icon: <FaBolt />,
            title: "Lightning-Fast Scraping",
            description: "Utilizes a powerful backend to quickly scrape and capture all resources from any website."
        },
        {
            icon: <FaFolder />,
            title: "Original Folder Structure",
            description: "Maintains the original folder structure of the website for easy navigation and use."
        },
        {
            icon: <FaMagic />,
            title: "Resource Beautification",
            description: "Optionally beautify HTML, CSS, JS, and JSON files for enhanced readability and cleaner code."
        },
        {
            icon: <FaCode />,
            title: "For Developers & Designers",
            description: "A perfect tool for archiving websites, offline viewing, or analyzing a site's structure and assets."
        },
    ];

    return (
      <FeaturesContainer>
        <Title>Why Use CloneCraft?</Title>
        <FeatureList>
            {features.map(feature => (
                <FeatureItem key={feature.title}>
                    <FeatureIcon>{feature.icon}</FeatureIcon>
                    <FeatureText>
                        <FeatureTitle>{feature.title}</FeatureTitle>
                        <FeatureDescription>{feature.description}</FeatureDescription>
                    </FeatureText>
                </FeatureItem>
            ))}
        </FeatureList>
      </FeaturesContainer>
    );
};

export default Features; 