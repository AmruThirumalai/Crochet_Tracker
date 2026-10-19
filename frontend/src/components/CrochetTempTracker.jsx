import React, { useState, useEffect } from 'react';
import { Check, X, ChevronDown, ChevronUp, Printer, Moon, Sun, Settings } from 'lucide-react';

const CrochetTempTracker = () => {
  const [year, setYear] = useState(2025);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherLoaded, setWeatherLoaded] = useState(false);
  const [showColorLegend, setShowColorLegend] = useState(true);
  const [showColorTotals, setShowColorTotals] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('blanket-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [monthDividers, setMonthDividers] = useState(() => {
    const saved = localStorage.getItem('blanket-month-dividers');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('blanket-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('blanket-month-dividers', JSON.stringify(monthDividers));
  }, [monthDividers]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handlePrint = () => {
    window.print();
  };

  const getColorForTemp = (temp) => {
    if (temp < 20) return { name: 'Gray', hex: '#9CA3AF' };
    if (temp < 30) return { name: 'Royal Blue', hex: '#2563EB' };
    if (temp < 40) return { name: 'Skylight', hex: '#7DD3FC' };
    if (temp < 50) return { name: 'Sage', hex: '#86EFAC' };
    if (temp < 60) return { name: 'Butter', hex: '#FDE047' };
    if (temp < 70) return { name: 'Gold', hex: '#FBBF24' };
    if (temp < 80) return { name: 'Pumpkin', hex: '#FB923C' };
    if (temp < 90) return { name: 'Clay', hex: '#B45309' };
    return { name: 'Red', hex: '#DC2626' };
  };

  useEffect(() => {
    const initDays = () => {
      const daysInYear = [];
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateStr = date.toISOString().split('T')[0];
          daysInYear.push({
            date: dateStr,
            dateObj: date,
            temp: null,
            color: null,
            completed: false
          });
        }
      }
      
      try {
        const savedWeatherData = localStorage.getItem('blanket-weather-2025');
        const savedCompletionData = localStorage.getItem('blanket-completion-2025');
        
        let mergedDays = daysInYear;
        
        if (savedWeatherData) {
          const weatherParsed = JSON.parse(savedWeatherData);
          mergedDays = mergedDays.map(day => {
            const saved = weatherParsed.find(d => d.date === day.date);
            return saved ? { ...day, temp: saved.temp, color: saved.color } : day;
          });
          setWeatherLoaded(true);
        }
        
        if (savedCompletionData) {
          const completionParsed = JSON.parse(savedCompletionData);
          mergedDays = mergedDays.map(day => {
            const saved = completionParsed.find(d => d.date === day.date);
            return saved ? { ...day, completed: saved.completed } : day;
          });
        }
        
        setDays(mergedDays);
      } catch (err) {
        console.error('Error loading saved data:', err);
        setDays(daysInYear);
      }
    };
    
    initDays();
  }, [year]);

  useEffect(() => {
    if (days.length > 0) {
      try {
        const completionData = days.map(day => ({
          date: day.date,
          completed: day.completed
        }));
        localStorage.setItem('blanket-completion-2025', JSON.stringify(completionData));
      } catch (err) {
        console.error('Failed to save completion data:', err);
      }
    }
  }, [days]);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/weather/2025`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch weather data');
      }
      
      const result = await response.json();
      const weatherData = result.data;
      
      const updatedDays = days.map(day => {
        const weatherEntry = weatherData.find(w => w.date === day.date);
        if (weatherEntry) {
          const color = getColorForTemp(weatherEntry.temp_f);
          return {
            ...day,
            temp: weatherEntry.temp_f,
            color: color
          };
        }
        return day;
      });
      
      setDays(updatedDays);
      setWeatherLoaded(true);
      
      try {
        const weatherDataToSave = updatedDays
          .filter(d => d.temp !== null)
          .map(d => ({
            date: d.date,
            temp: d.temp,
            color: d.color
          }));
        localStorage.setItem('blanket-weather-2025', JSON.stringify(weatherDataToSave));
      } catch (saveErr) {
        console.error('Failed to save weather data to localStorage:', saveErr);
      }
      
    } catch (err) {
      setError(err.message || 'Unable to load weather data. Make sure the backend server is running.');
      console.error('Error loading weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = (dateStr) => {
    const day = displayDays.find(d => d.date === dateStr);
    
    if (day && day.isDivider) {
      const savedDividers = localStorage.getItem('blanket-dividers-2025');
      let dividers = savedDividers ? JSON.parse(savedDividers) : [];
      
      const existingIndex = dividers.findIndex(d => d.id === dateStr);
      if (existingIndex >= 0) {
        dividers[existingIndex].completed = !dividers[existingIndex].completed;
      } else {
        dividers.push({ id: dateStr, completed: true });
      }
      
      localStorage.setItem('blanket-dividers-2025', JSON.stringify(dividers));
      
      setDays([...days]);
    } else {
      setDays(prevDays => {
        const updatedDays = prevDays.map(day => 
          day.date === dateStr ? { ...day, completed: !day.completed } : day
        );
        return updatedDays;
      });
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFullDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMonthName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  const isFirstDayOfMonth = (index) => {
    if (index === 0) return true;
    const currentMonth = new Date(days[index].date + 'T00:00:00').getMonth();
    const prevMonth = new Date(days[index - 1].date + 'T00:00:00').getMonth();
    return currentMonth !== prevMonth;
  };

  const completedCount = days.filter(d => d.completed).length;
  const progressPercent = days.length > 0 ? Math.round((completedCount / days.length) * 100) : 0;

  const getDaysWithDividers = () => {
    if (!monthDividers) return days;
    
    const daysWithDividers = [];
    days.forEach((day, index) => {
      daysWithDividers.push(day);
      
      const nextDay = days[index + 1];
      if (nextDay) {
        const currentMonth = new Date(day.date + 'T00:00:00').getMonth();
        const nextMonth = new Date(nextDay.date + 'T00:00:00').getMonth();
        
        if (currentMonth !== nextMonth) {
          const dividerId = `${day.date}-divider`;
          const savedDividers = localStorage.getItem('blanket-dividers-2025');
          let dividerCompleted = false;
          
          if (savedDividers) {
            const parsed = JSON.parse(savedDividers);
            const saved = parsed.find(d => d.id === dividerId);
            if (saved) dividerCompleted = saved.completed;
          }
          
          daysWithDividers.push({
            date: dividerId,
            dateObj: new Date(day.date + 'T00:00:00'),
            temp: null,
            color: { name: 'White (Month Divider)', hex: '#FFFFFF' },
            completed: dividerCompleted,
            isDivider: true
          });
        }
      }
    });
    
    return daysWithDividers;
  };

  const displayDays = getDaysWithDividers();

  const filteredDays = displayDays.filter(day => {
    if (day.isDivider) return true;
    if (filter === 'completed') return day.completed;
    if (filter === 'incomplete') return !day.completed;
    return true;
  });

  const colorLegendItems = [
    { name: 'Gray', hex: '#9CA3AF', range: '< 20°F' },
    { name: 'Royal Blue', hex: '#2563EB', range: '20-29°F' },
    { name: 'Skylight', hex: '#7DD3FC', range: '30-39°F' },
    { name: 'Sage', hex: '#86EFAC', range: '40-49°F' },
    { name: 'Butter', hex: '#FDE047', range: '50-59°F' },
    { name: 'Gold', hex: '#FBBF24', range: '60-69°F' },
    { name: 'Pumpkin', hex: '#FB923C', range: '70-79°F' },
    { name: 'Clay', hex: '#B45309', range: '80-89°F' },
    { name: 'Red', hex: '#DC2626', range: '90°F+' }
  ];

  const monthlyColorTotals = Array.from({ length: 12 }, (_, monthIndex) => {
    const counts = Object.fromEntries(colorLegendItems.map(item => [item.name, 0]));

    days.forEach(day => {
      const date = new Date(day.date + 'T00:00:00');
      if (date.getMonth() === monthIndex && day.color?.name in counts) {
        counts[day.color.name] += 1;
      }
    });

    return {
      month: new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'short' }),
      counts,
      total: Object.values(counts).reduce((sum, count) => sum + count, 0)
    };
  });

  const overallColorTotals = colorLegendItems.reduce((totals, item) => {
    totals[item.name] = monthlyColorTotals.reduce(
      (sum, month) => sum + month.counts[item.name],
      0
    );
    return totals;
  }, {});
  const overallColorTotal = Object.values(overallColorTotals).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`min-h-screen p-4 transition-colors ${darkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto print-container">
        <div className={`rounded-2xl shadow-sm p-6 mb-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Temperature Blanket Tracker
            </h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`no-print p-2 rounded-lg transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
              title="Settings"
            >
              <Settings className={`w-5 h-5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`} />
            </button>
          </div>
          <p className={darkMode ? 'text-slate-300 mb-4' : 'text-slate-600 mb-4'}>
            Track your daily crochet progress for {year}
          </p>
          <div className="no-print">
            {!weatherLoaded && (
              <button
                onClick={loadWeatherData}
                disabled={loading}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white'
                }`}
              >
                {loading ? 'Loading Weather Data...' : 'Load Weather Data'}
              </button>
            )}
          
            {weatherLoaded && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                darkMode 
                  ? 'bg-green-900/30 border-green-700'
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Check className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Weather data loaded</span>
                </div>
                <button
                  onClick={loadWeatherData}
                  disabled={loading}
                  className={`text-sm underline ${darkMode ? 'text-green-300 hover:text-green-200' : 'text-green-700 hover:text-green-800'}`}
                >
                  Refresh
                </button>
              </div>
            )}
          
            {error && (
              <div className={`mt-4 p-3 rounded-lg border text-sm ${
                darkMode
                  ? 'bg-red-900/30 border-red-700 text-red-300'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}
          </div>
        </div>

        {showSettings && (
          <div className={`rounded-2xl shadow-sm p-6 mb-6 no-print ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Settings</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                  darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                  <div className="text-left">
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {darkMode ? 'Dark Mode' : 'Light Mode'}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
              </button>

              <button
                onClick={handlePrint}
                className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                  darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Printer className={`w-5 h-5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`} />
                  <div className="text-left">
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      Print View
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Print or export your blanket tracker
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
              </button>

              <button
                onClick={() => setMonthDividers(!monthDividers)}
                className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                  darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    monthDividers 
                      ? 'bg-blue-500 border-blue-500' 
                      : darkMode 
                        ? 'border-slate-500' 
                        : 'border-slate-400'
                  }`}>
                    {monthDividers && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="text-left">
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      Month Dividers
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Add white rows between months
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] gap-6 items-start">
          <aside className="space-y-6 lg:sticky lg:top-4">
            <div className={`rounded-2xl shadow-sm p-6 no-print ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Progress</h2>
              <div className={`flex justify-between text-sm mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <span>{completedCount} of {days.length} rows</span>
                <span>{progressPercent}%</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className={`rounded-2xl shadow-sm p-6 no-print ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Filter Days</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({days.length})
            </button>
            <button
              onClick={() => setFilter('incomplete')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === 'incomplete'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              To Do ({days.length - completedCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>
        </div>

        <div className={`rounded-2xl shadow-sm no-print ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <button
            onClick={() => setShowColorLegend(!showColorLegend)}
            className={`w-full flex items-center justify-between p-6 text-left transition-colors rounded-2xl ${
              darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
            }`}
          >
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Yarn Color Guide</h2>
            {showColorLegend ? (
              <ChevronUp className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            )}
          </button>
          
          {showColorLegend && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {colorLegendItems.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0" style={{ backgroundColor: item.hex }} />
                    <div>
                      <div className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</div>
                      <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.range}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`rounded-2xl shadow-sm no-print ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <button
            onClick={() => setShowColorTotals(!showColorTotals)}
            className={`w-full flex items-center justify-between p-6 text-left transition-colors rounded-2xl ${
              darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
            }`}
          >
            <div>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Monthly Color Totals
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {overallColorTotal} total color-assigned rows
              </p>
            </div>
            {showColorTotals ? (
              <ChevronUp className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            )}
          </button>

          {showColorTotals && <div className="p-6 pt-0">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Monthly Color Totals
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Number of rows assigned to each yarn color
                </p>
              </div>
              <div className={`rounded-lg px-3 py-2 text-right ${darkMode ? 'bg-slate-700' : 'bg-blue-50'}`}>
                <div className={`text-xs uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-blue-700'}`}>
                  Overall total
                </div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                  {overallColorTotal}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <th className={`px-3 py-3 text-left font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Month
                    </th>
                    {colorLegendItems.map(item => (
                      <th key={item.name} className={`px-2 py-3 text-center font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        <span className="inline-flex flex-col items-center gap-1">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300"
                            style={{ backgroundColor: item.hex }}
                            title={item.name}
                          />
                          <span>{item.name}</span>
                        </span>
                      </th>
                    ))}
                    <th className={`px-3 py-3 text-right font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyColorTotals.map(month => (
                    <tr key={month.month} className={`border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                      <th className={`px-3 py-3 text-left font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {month.month}
                      </th>
                      {colorLegendItems.map(item => (
                        <td key={item.name} className={`px-2 py-3 text-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {month.counts[item.name]}
                        </td>
                      ))}
                      <td className={`px-3 py-3 text-right font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {month.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={darkMode ? 'bg-slate-700/60' : 'bg-slate-50'}>
                    <th className={`px-3 py-3 text-left font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      Overall
                    </th>
                    {colorLegendItems.map(item => (
                      <td key={item.name} className={`px-2 py-3 text-center font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {overallColorTotals[item.name]}
                      </td>
                    ))}
                    <td className={`px-3 py-3 text-right font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {overallColorTotal}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>}
        </div>

          </aside>

          <section className="space-y-2 pb-8 min-w-0">
          {filteredDays.map((day) => {
            const originalIndex = days.findIndex(d => d.date === day.date);
            const isMonthDivider = day.isDivider;
            
            return (
              <React.Fragment key={day.date}>
                {!isMonthDivider && isFirstDayOfMonth(originalIndex) && (
                  <div className="pt-4 pb-2">
                    <h2 className={`text-lg font-semibold px-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {getMonthName(day.date)}
                    </h2>
                  </div>
                )}
              
                <div
                  onClick={() => setSelectedDay(day)}
                  className={`rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all ${
                    darkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white'
                  } ${day.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className={`w-16 h-16 rounded-lg flex-shrink-0 border-2 ${
                        isMonthDivider ? 'border-slate-300' : 'border-slate-200'
                      }`}
                      style={{ 
                        backgroundColor: day.color 
                          ? day.color.hex 
                          : (darkMode ? '#334155' : '#f1f5f9')
                      }}
                    />
                  
                    <div className="flex-1 min-w-0">
                      {isMonthDivider ? (
                        <>
                          <div className={`font-medium ${day.completed ? 'line-through' : ''} ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            Month Divider
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            White • Separator Row
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`font-medium ${day.completed ? 'line-through' : ''} ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            {formatDate(day.date)}
                          </div>
                          {day.color && (
                            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              {day.temp}°F • {day.color.name}
                            </div>
                          )}
                          {!day.color && (
                            <div className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                              No data yet
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  
                    {day.completed && (
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          </section>
      </div>
      </div>

      {selectedDay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {formatFullDate(selectedDay.date)}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className={darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedDay.color ? (
              <div className="space-y-4">
                <div 
                  className="w-full h-32 rounded-xl border-2 border-slate-200"
                  style={{ backgroundColor: selectedDay.color.hex }}
                />
                
                <div className="space-y-2">
                  {!selectedDay.isDivider && (
                    <>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Temperature:</span>
                        <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{selectedDay.temp}°F</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Yarn Color:</span>
                        <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{selectedDay.color.name}</span>
                      </div>
                    </>
                  )}
                  {selectedDay.isDivider && (
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Yarn Color:</span>
                      <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>White (Month Divider)</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    toggleComplete(selectedDay.date);
                    setSelectedDay({ ...selectedDay, completed: !selectedDay.completed });
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedDay.completed
                      ? darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {selectedDay.completed ? 'Mark as Not Done' : 'Mark as Done'}
                </button>
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <p>No weather data available for this day yet.</p>
                <p className="text-sm mt-2">Load weather data to see the color assignment.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrochetTempTracker;