
import React from 'react';
import { Page } from '../App';

interface TabButtonProps {
  name: Page;
  activePage: Page;
  setActivePage: (page: Page) => void;
  children: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ name, activePage, setActivePage, children }) => {
  const isActive = name === activePage;
  return (
    <button
      onClick={() => setActivePage(name)}
      className={`px-3 py-2 text-sm sm:text-base font-medium rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
};
