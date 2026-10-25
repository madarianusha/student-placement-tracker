import React from 'react';
import ResourcePage from '../components/ResourcePage.jsx';

// The Offers page has its own URL and React component.
export default function OffersPage(props) {
  return <ResourcePage {...props} resource="offers" />;
}
