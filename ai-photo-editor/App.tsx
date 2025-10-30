
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { EditorPage } from './features/EditorPage';
import { GeneratorPage } from './features/GeneratorPage';
import { AnalyzerPage } from './features/AnalyzerPage';
import { ChatPage } from './features/ChatPage';

export type Page = 'edit' | 'generate' | 'analyze' | 'chat';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('edit');

  const renderPage = () => {
    switch (activePage) {
      case 'edit':
        return <EditorPage />;
      case 'generate':
        return <GeneratorPage />;
      case 'analyze':
        return <AnalyzerPage />;
      case 'chat':
        return <ChatPage />;
      default:
        return <EditorPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main className="container mx-auto p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
