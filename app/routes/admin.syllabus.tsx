import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';

import { requireAdmin } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Syllabus Management - Admin Dashboard' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);

  const { data: syllabus, error } = await supabase
    .from('syllabus')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching syllabus:', error);
  }

  return json({ syllabus: syllabus || [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create') {
    const subject = formData.get('subject') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const academicYear = formData.get('academicYear') as string;
    const semester = formData.get('semester') as string;

    const { error } = await supabase
      .from('syllabus')
      .insert({
        subject,
        title,
        content,
        academic_year: academicYear,
        semester,
        status: 'active',
        created_at: new Date().toISOString()
      });

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/syllabus');
  }

  if (intent === 'delete') {
    const syllabusId = formData.get('syllabusId') as string;
    
    const { error } = await supabase
      .from('syllabus')
      .delete()
      .eq('id', syllabusId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect('/admin/syllabus');
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function SyllabusManagement() {
  const { syllabus } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');

  const isSubmitting = navigation.state === 'submitting';

  const getUniqueSubjects = () => {
    return [...new Set(syllabus.map(s => s.subject))];
  };

  const getFilteredSyllabus = () => {
    if (selectedSubject === 'all') return syllabus;
    return syllabus.filter(s => s.subject === selectedSubject);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-teal-900/20 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin" 
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                📖 Syllabus Management
              </h1>
            </div>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Syllabus
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Create Syllabus Form */}
        {showForm && (
          <div className="mb-8 bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add New Syllabus</h2>
            
            <Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="create" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="English">English</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Syllabus Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="Enter syllabus title..."
                  />
                </div>

                <div>
                  <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    id="academicYear"
                    name="academicYear"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                    placeholder="e.g., 2024-2025"
                  />
                </div>

                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Syllabus Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={12}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
                  placeholder="Enter detailed syllabus content including:
- Course objectives
- Topics and chapters
- Learning outcomes
- Assessment methods
- Reference books
- Course timeline"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Syllabus'}
                </button>
              </div>
            </Form>

            {actionData?.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{actionData.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Syllabus List */}
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Course Syllabus</h2>
            <div className="flex items-center space-x-4">
              <label htmlFor="subjectFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by subject:
              </label>
              <select
                id="subjectFilter"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white"
              >
                <option value="all">All Subjects</option>
                {getUniqueSubjects().map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          {syllabus.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No syllabus added yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first course syllabus.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                Create First Syllabus
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredSyllabus().map((item) => (
                <div key={item.id} className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400">
                          {item.subject}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          Semester {item.semester}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          {item.academic_year}
                        </span>
                      </div>
                      
                      <div className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        <p className="line-clamp-6">{item.content}</p>
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <button className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="syllabusId" value={item.id} />
                        <button 
                          type="submit"
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to delete this syllabus?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </Form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
