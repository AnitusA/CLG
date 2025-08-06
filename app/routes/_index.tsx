import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "CSEB Portal" },
    { name: "description", content: "Computer Science and Engineering Department Portal" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to <span className="sr-only">CSEB Portal</span>
          </h1>
          <div className="h-[144px] w-[434px] flex items-center justify-center">
            <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CSEB
            </div>
          </div>
        </header>
        <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 shadow-xl">
          <p className="leading-6 text-gray-700 dark:text-gray-200 text-center">
            Computer Science and Engineering Department Portal
          </p>
          <div className="flex gap-4">
            <a
              href="/login"
              className="group flex items-center gap-3 self-stretch px-6 py-3 leading-normal text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Login to Your Account
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
