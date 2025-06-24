import React from 'react';
import styled from 'styled-components';
import { FaBolt, FaFolder, FaMagic, FaCode } from 'react-icons/fa';

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