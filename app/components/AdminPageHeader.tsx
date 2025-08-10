import { Link } from '@remix-run/react';

interface AdminPageHeaderProps {
  title: string;
  icon: React.ReactNode;
  onAddNew?: () => void;
  addNewLabel?: string;
  showAddButton?: boolean;
}

export function AdminPageHeader({ 
  title, 
  icon, 
  onAddNew, 
  addNewLabel = "Add New", 
  showAddButton = true 
}: AdminPageHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-800/95 via-slate-900/95 to-blue-900/95 backdrop-blur-lg shadow-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* Back Arrow */}
            <Link 
              to="/admin" 
              className="flex items-center text-slate-300 hover:text-white transition-colors group p-2 rounded-lg hover:bg-slate-700/50"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium hidden sm:inline">Back</span>
            </Link>
            
            {/* Divider */}
            <div className="h-6 w-px bg-slate-600"></div>
            
            {/* Page Title */}
            <div className="flex items-center">
              <div className="text-blue-400 mr-2 sm:mr-3 p-1.5 sm:p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
                {icon}
              </div>
              <div>
                <h1 className="text-sm sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">Admin Management</p>
              </div>
            </div>
          </div>
          
          {/* Add New Button */}
          {showAddButton && onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 group"
              title={addNewLabel}
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
