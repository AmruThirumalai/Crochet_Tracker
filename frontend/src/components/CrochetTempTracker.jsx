import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const CrochetTempTracker = () => {
  const [year, setYear] = useState(2025);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherLoaded, setWeatherLoaded] = useState(false);

  // API endpoint - update this to match your backend URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Color mapping function - matches backend logic
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

  // Initialize days for the year
  useEffect(() => {
    const initDays = async () => {
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
      
      // Load saved completion data from localStorage
      try {
        const savedData = localStorage.getItem('blanket-completion-2025');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          const mergedDays = daysInYear.map(day => {
            const saved = parsed.find(d => d.date === day.date);
            return saved ? { ...day, completed: saved.completed } : day;
          });
          setDays(mergedDays);
        } else {
          setDays(daysInYear);
        }
      } catch (err) {
        console.error('Error loading saved data:', err);
        setDays(daysInYear);
      }
    };
    
    initDays();
  }, [year]);

  // Save completion data whenever it changes
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

  // Load weather data from backend API
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
      
      // Update days with weather data from backend
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
    } catch (err) {
      setError(err.message || 'Unable to load weather data. Make sure the backend server is running.');
      console.error('Error loading weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = (dateStr) => {
    setDays(days.map(day => 
      day.date === dateStr ? { ...day, completed: !day.completed } : day
    ));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Temperature Blanket Tracker
          </h1>
          <p className="text-slate-600 mb-4">
            Track your daily crochet progress for {year}
          </p>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>{completedCount} of {days.length} rows completed</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Load Weather Button */}
          {!weatherLoaded && (
            <button
              onClick={loadWeatherData}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Loading Weather Data...' : 'Load Weather Data'}
            </button>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

          {/* Color legend */}
          <div className='big-white rounded-2xl shadow-sm p-6 mb-6'>
            <h2 className='text-xl font-semibold text-slate-800 mb-4'>Yarn Color Guide</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0' style={{ backgroundColor: '#9CA3AF' }} />
                <div>
                  <div className='font-medium text-slate-800'>Gray</div>
                  <div className='text-sm text-slate-600'>&lt; 20°F</div>
                </div>
            </div>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0' style={{ backgroundColor: '#2563EB' }} />
                <div>
                  <div className='font-medium text-slate-800'>Royal Blue</div>
                  <div className='text-sm text-slate-600'>20°F - 29°F</div>
                </div>
            </div>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0' style={{ backgroundColor: '#7DD3FC' }} />
                <div>
                  <div className='font-medium text-slate-800'>Skylight</div>
                  <div className='text-sm text-slate-600'>30°F - 39°F</div>
                </div>
            </div>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0' style={{ backgroundColor: '#86EFAC' }} />
                <div>
                  <div className='font-medium text-slate-800'>Sage</div>
                  <div className='text-sm text-slate-600'>40°F - 49°F</div>
                </div>
            </div>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0' style={{ backgroundColor: '#FDE047' }} />
                <div>
                  <div className='font-medium text-slate-800'>Butter</div>
                  <div className='text-sm text-slate-600'>50°F - 59°F</div>
                </div>
            </div>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0' style={{ backgroundColor: '#FBBF24' }} />
                <div>
                  <div className='font-medium text-slate-800'>Gold</div>
                  <div className='text-sm text-slate-600'>60°F - 69°F</div>
                </div>
            </div>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0' style={{ backgroundColor: '#FB923C' }} />
                <div>
                  <div className='font-medium text-slate-800'>Pumpkin</div>
                  <div className='text-sm text-slate-600'>70°F - 79°F</div>
                </div>
            </div>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0' style={{ backgroundColor: '#B45309' }} />
                <div>
                  <div className='font-medium text-slate-800'>Clay</div>
                  <div className='text-sm text-slate-600'>80°F - 89°F</div>
                </div>
            </div>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0' style={{ backgroundColor: '#DC2626' }} />
                <div>
                  <div className='font-medium text-slate-800'>Red</div>
                  <div className='text-sm text-slate-600'>&ge; 90°F</div>
                </div>
            </div>
            </div>
          </div>

        {/* Days List */}
        <div className="space-y-2 pb-8">
          {days.map((day, index) => (
            <React.Fragment key={day.date}>
              {isFirstDayOfMonth(index) && (
                <div className="pt-4 pb-2">
                  <h2 className="text-lg font-semibold text-slate-700 px-2">
                    {getMonthName(day.date)}
                  </h2>
                </div>
              )}
              
              <div
                onClick={() => setSelectedDay(day)}
                className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all ${
                  day.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Color Swatch */}
                  <div 
                    className="w-16 h-16 rounded-lg flex-shrink-0 border-2 border-slate-200"
                    style={{ 
                      backgroundColor: day.color ? day.color.hex : '#f1f5f9'
                    }}
                  />
                  
                  {/* Day Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-slate-800 ${day.completed ? 'line-through' : ''}`}>
                      {formatDate(day.date)}
                    </div>
                    {day.color && (
                      <div className="text-sm text-slate-600">
                        {day.temp}°F • {day.color.name}
                      </div>
                    )}
                    {!day.color && (
                      <div className="text-sm text-slate-400">
                        No data yet
                      </div>
                    )}
                  </div>
                  
                  {/* Completion Check */}
                  {day.completed && (
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {formatFullDate(selectedDay.date)}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-slate-400 hover:text-slate-600"
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
                  <div className="flex justify-between">
                    <span className="text-slate-600">Temperature:</span>
                    <span className="font-semibold text-slate-800">{selectedDay.temp}°F</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Yarn Color:</span>
                    <span className="font-semibold text-slate-800">{selectedDay.color.name}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleComplete(selectedDay.date);
                    setSelectedDay({ ...selectedDay, completed: !selectedDay.completed });
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedDay.completed
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {selectedDay.completed ? 'Mark as Not Done' : 'Mark as Done'}
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
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