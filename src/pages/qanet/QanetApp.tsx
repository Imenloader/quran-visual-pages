import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QanetProvider, useQanet } from './QanetContext';

const QanetOnboarding = lazy(() => import('./QanetOnboarding'));
const QanetDashboard = lazy(() => import('./QanetDashboard'));

const QanetMain = () => {
  const { hasCompletedOnboarding } = useQanet();
  
  if (!hasCompletedOnboarding) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">...</div>}>
        <QanetOnboarding />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">...</div>}>
      <QanetDashboard />
    </Suspense>
  );
};

export default function QanetApp() {
  return (
    <QanetProvider>
      <QanetMain />
    </QanetProvider>
  );
}
