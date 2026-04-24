'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerCalendarProps {
  value: string;
  onChange: (date: string) => void;
  maxDate?: string;
  label?: string;
}

export default function DatePickerCalendar({
  value,
  onChange,
  maxDate,
  label = 'Select Date',
}: DatePickerCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(() => {
    if (value) {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth());
    }
    return new Date();
  });

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const maxDateObj = maxDate ? new Date(maxDate) : today;

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthName = displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedDate = value ? new Date(value) : null;

  const handlePrevMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1));
  };

  const handleSelectDate = (day: number) => {
    const selected = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    const dateString = selected.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(displayMonth);
    const firstDay = firstDayOfMonth(displayMonth);

    // Empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const isSelected = selectedDate && dateString === value;
      const isToday = dateString === today.toISOString().split('T')[0];
      const isDisabled = date > maxDateObj;
      const isFuture = date > today;

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleSelectDate(day)}
          disabled={isDisabled}
          className={`p-2 text-sm font-medium rounded-lg transition-all ${
            isSelected
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold shadow-md'
              : isToday
              ? 'bg-blue-500 text-white font-bold'
              : isDisabled
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : isFuture
              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : label;

  return (
    <>
      <div className="relative">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
          {label}
        </label>

        {/* Input Display */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium px-3.5 flex items-center justify-between hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus:outline-none focus:border-gray-900 dark:focus:border-white"
        >
          <span>{displayValue}</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        {/* Calendar Dropdown */}
        {isOpen && (
          <div
            className="absolute top-full left-0 z-[100] mt-2 w-80 max-w-[calc(100vw-1rem)] rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:left-auto sm:right-0"
          >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{monthName}</h3>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">{renderCalendar()}</div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {value && (
              <button
                onClick={handleClear}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
          </div>
        )}
      </div>

      {/* Overlay to close calendar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/0"
          aria-hidden
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
