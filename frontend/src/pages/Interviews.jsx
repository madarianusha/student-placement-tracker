import React from 'react';
import ResourcePage from '../components/ResourcePage.jsx';

// The Interviews page has its own URL and React component.
export default function InterviewsPage(props) {
  return <ResourcePage {...props} resource="interviews" />;
}
