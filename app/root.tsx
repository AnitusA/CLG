import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useEffect, useState } from "react";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// Route transition wrapper component
function RouteTransition({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (navigation.state === "loading") {
      setTransitionStage("fadeOut");
      setLoadingStartTime(Date.now());
      setShowLoader(true);
    }
  }, [navigation.state]);

  useEffect(() => {
    if (navigation.state === "idle" && loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, 2000 - elapsedTime); // Ensure 2 seconds minimum
      
      setTimeout(() => {
        setTransitionStage("fadeIn");
        setDisplayLocation(location);
        setShowLoader(false);
        setLoadingStartTime(null);
      }, remainingTime);
    }
  }, [navigation.state, location, loadingStartTime]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dark Blue Theme Loading Animation */}
      {showLoader && (
        <>
          {/* Dark blue gradient background with depth */}
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
            {/* Animated grid pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px'
              }}></div>
            </div>
            
            {/* Floating dark blue elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-12 h-12 border-2 border-blue-400/40 rounded-full animate-float-minimal"></div>
              <div className="absolute top-3/4 right-1/3 w-8 h-20 bg-gradient-to-b from-blue-500/30 to-indigo-600/30 rounded-full animate-float-delayed-minimal"></div>
              <div className="absolute bottom-1/4 left-2/3 w-16 h-16 border-2 border-indigo-400/40 rotate-45 animate-float-minimal"></div>
              <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-blue-400/40 rounded-sm animate-float-slow-minimal"></div>
              <div className="absolute top-1/3 left-1/2 w-4 h-12 bg-gradient-to-t from-slate-600/30 to-blue-600/30 animate-float-slow-minimal"></div>
            </div>
            
            {/* Subtle light rays */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-pulse-gentle"></div>
              <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-indigo-400/20 to-transparent animate-pulse-gentle delay-1000"></div>
            </div>
          </div>
          
          {/* Elegant dark loading content */}
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
            {/* Sophisticated spinner with dark blue theme */}
            <div className="relative mb-12">
              {/* Outer ring with blue gradient */}
              <div className="w-28 h-28 border-4 border-slate-700/50 rounded-full relative">
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 border-r-indigo-500 rounded-full animate-spin-smooth"></div>
              </div>
              
              {/* Middle ring */}
              <div className="absolute top-2 left-2 w-24 h-24 border-3 border-slate-600/30 rounded-full">
                <div className="absolute inset-0 border-3 border-transparent border-b-blue-500 border-l-sky-400 rounded-full animate-spin-reverse-smooth"></div>
              </div>
              
              {/* Inner ring */}
              <div className="absolute top-4 left-4 w-20 h-20 border-2 border-slate-500/20 rounded-full">
                <div className="absolute inset-0 border-2 border-transparent border-t-indigo-400 border-r-blue-600 rounded-full animate-spin-smooth"></div>
              </div>
              
              {/* Center core with glow */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full animate-pulse-minimal shadow-lg shadow-blue-500/50"></div>
                <div className="absolute inset-0 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              </div>
              
              {/* Corner accent dots with blue theme */}
              <div className="absolute -top-3 -left-3 w-3 h-3 bg-blue-400 rounded-full animate-pulse-offset shadow-sm shadow-blue-400/50"></div>
              <div className="absolute -top-3 -right-3 w-3 h-3 bg-sky-400 rounded-full animate-pulse-offset delay-500 shadow-sm shadow-sky-400/50"></div>
              <div className="absolute -bottom-3 -left-3 w-3 h-3 bg-indigo-400 rounded-full animate-pulse-offset delay-1000 shadow-sm shadow-indigo-400/50"></div>
              <div className="absolute -bottom-3 -right-3 w-3 h-3 bg-blue-600 rounded-full animate-pulse-offset delay-1500 shadow-sm shadow-blue-600/50"></div>
              
              {/* Orbiting particles */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-36 h-36 relative animate-spin-slow">
                  <div className="absolute -top-1 left-1/2 w-2 h-2 bg-blue-300 rounded-full transform -translate-x-1/2 shadow-sm shadow-blue-300/50"></div>
                  <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-indigo-300 rounded-full transform -translate-x-1/2 shadow-sm shadow-indigo-300/50"></div>
                </div>
              </div>
            </div>
            
            {/* Dark themed typography */}
            <div className="text-center space-y-6">
              <div className="relative">
                <h3 className="text-3xl font-light text-blue-100 tracking-wide">
                  <span className="animate-fade-text">Loading</span>
                </h3>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 w-20 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 animate-expand-bar"></div>
              </div>
              
              {/* Progress indicators with blue theme */}
              <div className="flex justify-center space-x-3 mt-8">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce-minimal shadow-sm shadow-blue-400/50"></div>
                <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce-minimal delay-200 shadow-sm shadow-sky-400/50"></div>
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce-minimal delay-400 shadow-sm shadow-indigo-400/50"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce-minimal delay-600 shadow-sm shadow-blue-600/50"></div>
              </div>
              
              {/* Status message */}
              <p className="text-sm text-blue-200/80 font-light animate-pulse-text">
                Preparing your experience...
              </p>
            </div>
          </div>
        </>
      )}

      {/* Page content with fade transition */}
      <div
        className={`
          transition-all duration-500 ease-in-out transform
          ${transitionStage === "fadeOut" 
            ? "opacity-0 scale-95 blur-sm" 
            : "opacity-100 scale-100 blur-0"
          }
        `}
      >
        {children}
      </div>

      {/* Floating background elements with dark blue theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-600/10 to-blue-800/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-gradient-to-r from-slate-600/10 to-blue-600/10 rounded-full blur-3xl animate-float-slow"></div>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <RouteTransition>
          {children}
        </RouteTransition>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
