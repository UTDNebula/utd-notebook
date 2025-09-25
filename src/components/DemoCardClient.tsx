"use client";

import React from 'react';
import DemoCard from '@src/components/DemoCard';

export default function DemoCardClient() {
  const handlePress = () => {
    alert('WOAH DEMO COMPONENT WORKS!');
  };

  return <DemoCard onPress={handlePress} />;
}
