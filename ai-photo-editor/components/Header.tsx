
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { Page } from '../App';
import { TabButton } from './TabButton';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <SparklesIcon className="w-8 h-8 text-indigo-400" />
            <h1 className="ml-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              AI Creative Suite
            </h1>
          </div>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <TabButton name="edit" activePage={activePage} setActivePage={setActivePage}>Edit</TabButton>
            <TabButton name="generate" activePage={activePage} setActivePage={setActivePage}>Generate</TabButton>
            <TabButton name="analyze" activePage={activePage} setActivePage={setActivePage}>Analyze</TabButton>
            <TabButton name="chat" activePage={activePage} setActivePage={setActivePage}>Chat</TabButton>
          </nav>
        </div>
      </div>
    </header>
  );
};
