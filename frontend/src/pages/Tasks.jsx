import React from 'react';
import ResourcePage from '../components/ResourcePage.jsx';

// The Tasks page has its own URL and React component.
export default function TasksPage(props) {
  return <ResourcePage {...props} resource="tasks" />;
}
