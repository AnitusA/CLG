import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { requireStudent } from '~/lib/session.server';
import { supabase } from '~/lib/supabase.server';

export const meta: MetaFunction = () => [{ title: 'Birthdays - Student Portal' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireStudent(request);

  const { data: birthdays, error } = await supabase
    .from('birthdays')
    .select('*')
    .order('birth_date', { ascending: true });

  if (error) {
    console.error('Error fetching birthdays:', error);
  }

  return json({ 
    user,
    birthdays: birthdays || []
  });
};

export default function StudentBirthdays() {
  const { birthdays } = useLoaderData<typeof loader>();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  };

  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const isBirthdayToday = (birthDate: string) => {
    const birth = new Date(birthDate);
    return birth.getMonth() === currentMonth && birth.getDate() === currentDate;
  };

  const isBirthdayThisWeek = (birthDate: string) => {
    const birth = new Date(birthDate);
    const birthThisYear = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    const timeDiff = birthThisYear.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff >= 0 && daysDiff <= 7;
  };

  const isBirthdayThisMonth = (birthDate: string) => {
    const birth = new Date(birthDate);
    return birth.getMonth() === currentMonth;
  };

  const todaysBirthdays = birthdays.filter(birthday => isBirthdayToday(birthday.birth_date));
  const thisWeeksBirthdays = birthdays.filter(birthday => isBirthdayThisWeek(birthday.birth_date) && !isBirthdayToday(birthday.birth_date));
  const thisMonthsBirthdays = birthdays.filter(birthday => isBirthdayThisMonth(birthday.birth_date) && !isBirthdayThisWeek(birthday.birth_date));
  const upcomingBirthdays = birthdays.filter(birthday => !isBirthdayThisMonth(birthday.birth_date));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Group upcoming birthdays by month
  const groupedUpcoming = upcomingBirthdays.reduce((groups: Record<number, any[]>, birthday) => {
    const month = new Date(birthday.birth_date).getMonth();
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(birthday);
    return groups;
  }, {});

  const getBirthdayEmoji = () => {
    const emojis = ['🎂', '🎉', '🎈', '🎊', '🍰', '🎁'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎂 Student Birthdays</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Celebrate together - never miss a classmate's special day!
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-pink-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{todaysBirthdays.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{thisWeeksBirthdays.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{thisMonthsBirthdays.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{birthdays.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Birthdays */}
      {todaysBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl shadow-lg border border-pink-200/50 dark:border-pink-700/50 p-6">
          <h2 className="text-xl font-semibold text-pink-900 dark:text-pink-300 mb-4">🎉 Happy Birthday Today!</h2>
          <div className="grid gap-4">
            {todaysBirthdays.map((birthday) => (
              <div key={birthday.id} className="bg-white/70 dark:bg-slate-700/70 rounded-lg p-6 border border-pink-200/50 dark:border-pink-700/50 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                      {getBirthdayEmoji()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{birthday.student_name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Turning {getAge(birthday.birth_date)} today!
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl">🎂</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(birthday.birth_date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* This Week's Birthdays */}
      {thisWeeksBirthdays.length > 0 && (
        <div className="bg-blue-50/70 backdrop-blur-lg dark:bg-blue-900/20 rounded-xl shadow-lg border border-blue-200/50 dark:border-blue-700/50 p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-300 mb-4">📅 This Week's Birthdays</h2>
          <div className="grid gap-4">
            {thisWeeksBirthdays.map((birthday) => (
              <div key={birthday.id} className="bg-white/70 dark:bg-slate-700/70 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      🎈
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{birthday.student_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {birthday.class && `Class: ${birthday.class}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(birthday.birth_date)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Age: {getAge(birthday.birth_date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* This Month's Birthdays */}
      {thisMonthsBirthdays.length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🗓️ Rest of {monthNames[currentMonth]}</h2>
          <div className="grid gap-3">
            {thisMonthsBirthdays.map((birthday) => (
              <div key={birthday.id} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                      🎊
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{birthday.student_name}</h3>
                      {birthday.class && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">Class: {birthday.class}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(birthday.birth_date)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Age: {getAge(birthday.birth_date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Birthdays by Month */}
      {Object.keys(groupedUpcoming).length > 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📆 Upcoming Birthdays</h2>
          <div className="space-y-6">
            {Object.entries(groupedUpcoming)
              .sort(([a], [b]) => {
                const monthA = parseInt(a);
                const monthB = parseInt(b);
                // Sort months starting from next month
                const nextMonth = (currentMonth + 1) % 12;
                const adjustedA = monthA >= nextMonth ? monthA : monthA + 12;
                const adjustedB = monthB >= nextMonth ? monthB : monthB + 12;
                return adjustedA - adjustedB;
              })
              .map(([month, monthBirthdays]) => (
                <div key={month} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {monthNames[parseInt(month)]} ({monthBirthdays.length} birthdays)
                  </h3>
                  <div className="grid gap-2">
                    {monthBirthdays.map((birthday) => (
                      <div key={birthday.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs mr-2">
                            🎁
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{birthday.student_name}</span>
                          {birthday.class && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({birthday.class})</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(birthday.birth_date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* No Birthdays */}
      {birthdays.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg dark:bg-slate-800/70 rounded-xl shadow-lg border border-white/20 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No birthdays recorded</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Student birthday information has not been added yet. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}
