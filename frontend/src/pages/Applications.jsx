import React from 'react';
import ResourcePage from '../components/ResourcePage.jsx';

// The Applications page has its own URL and React component.
export default function ApplicationsPage(props) {
  return <ResourcePage {...props} resource="applications" />;
}
