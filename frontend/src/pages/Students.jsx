import React from 'react';
import ResourcePage from '../components/ResourcePage.jsx';

// The Students page has its own URL and React component.
export default function StudentsPage(props) {
  return <ResourcePage {...props} resource="students" />;
}
