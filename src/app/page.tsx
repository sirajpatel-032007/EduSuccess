"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Settings as SettingsIcon, Bell, Download, ChevronRight, 
  Activity, Users, AlertTriangle, CheckCircle, 
  X, Briefcase, BookOpen, Clock, AlertCircle, Loader2, Plus, Sliders, Server, Save
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Database state
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string | null>(null);
  const [filterGrade, setFilterGrade] = useState<number | null>(null);
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  // System Settings State
  const [highRiskThreshold, setHighRiskThreshold] = useState(70);
  const [mediumRiskThreshold, setMediumRiskThreshold] = useState(40);
  const [modelType, setModelType] = useState('Random Forest (Ensemble)');
  const [enableAlerts, setEnableAlerts] = useState(true);

  // Drawer & Modal State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    gradeLevel: '10',
    socioEconomicStatus: 'Middle',
    gpa: '3.0',
    attendanceRate: '95',
  });
  
  // UI Interactions State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);

  // Fetch Students
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        // Dynamically adjust risk levels based on settings thresholds
        const adjustedData = data.map((student: any) => {
          let level = 'Low';
          let status = 'On Track';
          if (student.riskScore > highRiskThreshold) {
            level = 'High';
            status = 'At Risk';
          } else if (student.riskScore > mediumRiskThreshold) {
            level = 'Medium';
            status = 'Monitoring';
          }
          return {
            ...student,
            riskLevel: level,
            status,
          };
        });
        setStudents(adjustedData);
      } else {
        setToast({ message: 'Failed to load students from database', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error connecting to database', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [highRiskThreshold, mediumRiskThreshold]);

  // Memoized Filtered Data
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = filterRisk ? student.riskLevel === filterRisk : true;
      const matchesGrade = filterGrade ? student.grade === filterGrade : true;
      return matchesSearch && matchesRisk && matchesGrade;
    });
  }, [students, searchQuery, filterRisk, filterGrade]);

  // Handlers
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await fetchStudents();
      setToast({ message: "Deep analysis completed. Model accuracy calibrated with database.", type: "success" });
    } catch (err) {
      setToast({ message: "Analysis run failed.", type: "error" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStudent.name,
          email: newStudent.email,
          gradeLevel: Number(newStudent.gradeLevel),
          socioEconomicStatus: newStudent.socioEconomicStatus,
          gpa: Number(newStudent.gpa),
          attendanceRate: Number(newStudent.attendanceRate),
        }),
      });

      if (res.ok) {
        setToast({ message: `Successfully added ${newStudent.name} & calculated risk via AI model!`, type: 'success' });
        setShowAddModal(false);
        setNewStudent({
          name: '',
          email: '',
          gradeLevel: '10',
          socioEconomicStatus: 'Middle',
          gpa: '3.0',
          attendanceRate: '95',
        });
        fetchStudents();
      } else {
        const errData = await res.json();
        setToast({ message: errData.error || 'Failed to add student', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error submitting student', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerIntervention = async (action: string) => {
    if (!selectedStudent) return;
    try {
      const res = await fetch('/api/interventions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          type: action,
          notes: 'Triggered via Admin Dashboard Review Drawer',
        }),
      });

      if (res.ok) {
        setToast({ message: `Assigned: "${action}" to ${selectedStudent.name}`, type: 'success' });
        setSelectedStudent(null);
        fetchStudents();
      } else {
        setToast({ message: 'Failed to record intervention in database', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error saving intervention', type: 'error' });
    }
  };

  const handleUpdateInterventionStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/interventions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setToast({ message: `Intervention status updated to ${newStatus}`, type: 'success' });
        fetchStudents();
      } else {
        setToast({ message: 'Failed to update intervention status', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error updating status', type: 'error' });
    }
  };

  const handleToggleRiskFilter = (level: string) => {
    if (filterRisk === level) {
      setFilterRisk(null); // Deselect
    } else {
      setFilterRisk(level); // Filter to this level
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Derived metrics
  const totalMonitored = students.length;
  const criticalRiskCount = students.filter(s => s.riskLevel === 'High').length;
  const monitoringCount = students.filter(s => s.riskLevel === 'Medium').length;
  const lowRiskCount = students.filter(s => s.riskLevel === 'Low').length;
  const averageGpa = totalMonitored > 0 
    ? (students.reduce((acc, s) => acc + s.gpa, 0) / totalMonitored).toFixed(2)
    : '0.00';

  // Cohort Stats
  const cohortStats = useMemo(() => {
    const grades = [9, 10, 11, 12];
    return grades.map(g => {
      const gradeStudents = students.filter(s => s.grade === g);
      const avgGpa = gradeStudents.length > 0 
        ? gradeStudents.reduce((acc, s) => acc + s.gpa, 0) / gradeStudents.length 
        : 0;
      const avgAtt = gradeStudents.length > 0 
        ? gradeStudents.reduce((acc, s) => acc + s.attendance, 0) / gradeStudents.length 
        : 0;
      
      const high = gradeStudents.filter(s => s.riskLevel === 'High').length;
      const med = gradeStudents.filter(s => s.riskLevel === 'Medium').length;
      const low = gradeStudents.filter(s => s.riskLevel === 'Low').length;

      return {
        grade: g,
        count: gradeStudents.length,
        avgGpa: avgGpa.toFixed(2),
        avgAttendance: Math.round(avgAtt),
        high,
        med,
        low,
      };
    });
  }, [students]);

  // Interventions List
  const allInterventions = useMemo(() => {
    const list: any[] = [];
    students.forEach(student => {
      if (student.interventions) {
        student.interventions.forEach((int: any) => {
          list.push({
            ...int,
            studentName: student.name,
            studentEmail: student.email,
            studentId: student.id,
            riskLevel: student.riskLevel,
          });
        });
      }
    });
    return list;
  }, [students]);

  // Safe percentage calculator
  const highPercentage = totalMonitored > 0 ? Math.round((criticalRiskCount / totalMonitored) * 100) : 0;
  const mediumPercentage = totalMonitored > 0 ? Math.round((monitoringCount / totalMonitored) * 100) : 0;
  const lowPercentage = totalMonitored > 0 ? Math.round((lowRiskCount / totalMonitored) * 100) : 0;

  // SVG parameters
  const strokeCircumference = 408.4;
  const highStrokeLength = totalMonitored > 0 ? (criticalRiskCount / totalMonitored) * strokeCircumference : 0;
  const medStrokeLength = totalMonitored > 0 ? (monitoringCount / totalMonitored) * strokeCircumference : 0;
  const lowStrokeLength = totalMonitored > 0 ? (lowRiskCount / totalMonitored) * strokeCircumference : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 bg-white
            ${toast.type === 'error' ? 'border-rose-100 text-rose-800' : 'border-slate-100 text-slate-700'}
          `}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">EduSuccess Dashboard</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">District Analytics</p>
          </div>
        </div>

        <nav className="hidden md:flex h-full">
          {['Overview', 'Cohort Analysis', 'Interventions', 'Settings'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 h-full text-sm font-medium transition-colors duration-200
                ${activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}
              `}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 cursor-pointer hover:border-slate-300 transition-colors">
            AD
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {activeTab === 'Overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-1">District Overview</h2>
                <p className="text-sm text-slate-500">Real-time analysis of student engagement, grades, and dropout indicators.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Student
                </button>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                  {isAnalyzing ? "Analyzing..." : "Run Deep Analysis"}
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {[
                { label: 'Total Monitored', value: totalMonitored, icon: Users, desc: 'Active database records' },
                { label: 'Critical Risk', value: criticalRiskCount, icon: AlertTriangle, desc: 'AI calculated High Risk' },
                { label: 'Medium Risk', value: monitoringCount, icon: Clock, desc: 'Needs active support' },
                { label: 'Average GPA', value: averageGpa, icon: CheckCircle, desc: 'Across graduating cohorts' },
              ].map((metric, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                    <metric.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">{metric.value}</p>
                  <div className="text-xs text-slate-400">{metric.desc}</div>
                </div>
              ))}
            </div>

            {/* Visual Risk Distribution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm lg:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 font-sans">Risk Levels Chart Representation (Click slices to Filter table)</h3>
                  <p className="text-xs text-slate-400 mb-6">Distribution of overall student predictive classifications</p>
                </div>
                
                {/* SVG Graph for Risk levels */}
                <div className="flex flex-col sm:flex-row items-center gap-8 justify-around">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    {totalMonitored > 0 ? (
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background grey ring */}
                        <circle cx="80" cy="80" r="65" stroke="#f1f5f9" strokeWidth="18" fill="transparent" />
                        
                        {/* High risk stroke (Red) */}
                        <circle 
                          cx="80" cy="80" r="65" 
                          stroke="#f43f5e" strokeWidth="18" fill="transparent" 
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                          onClick={() => handleToggleRiskFilter('High')}
                          strokeDasharray={`${highStrokeLength} ${strokeCircumference}`}
                          strokeDashoffset={0}
                        />
                        
                        {/* Med risk stroke (Yellow/Amber) */}
                        <circle 
                          cx="80" cy="80" r="65" 
                          stroke="#f59e0b" strokeWidth="18" fill="transparent" 
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                          onClick={() => handleToggleRiskFilter('Medium')}
                          strokeDasharray={`${medStrokeLength} ${strokeCircumference}`}
                          strokeDashoffset={-highStrokeLength}
                        />
                        
                        {/* Low risk stroke (Green) */}
                        <circle 
                          cx="80" cy="80" r="65" 
                          stroke="#10b981" strokeWidth="18" fill="transparent" 
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                          onClick={() => handleToggleRiskFilter('Low')}
                          strokeDasharray={`${lowStrokeLength} ${strokeCircumference}`}
                          strokeDashoffset={-(highStrokeLength + medStrokeLength)}
                        />
                      </svg>
                    ) : (
                      <div className="text-slate-300">No Data</div>
                    )}
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-slate-900">{totalMonitored}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Students</span>
                    </div>
                  </div>

                  <div className="space-y-4 w-full max-w-[240px]">
                    <div 
                      onClick={() => handleToggleRiskFilter('High')}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border
                        ${filterRisk === 'High' ? 'bg-rose-50 border-rose-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded bg-rose-500 animate-pulse" />
                        <span className="text-sm font-semibold text-slate-700">High Risk</span>
                      </div>
                      <span className="font-semibold text-slate-900">{criticalRiskCount} ({highPercentage}%)</span>
                    </div>
                    
                    <div 
                      onClick={() => handleToggleRiskFilter('Medium')}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border
                        ${filterRisk === 'Medium' ? 'bg-amber-50 border-amber-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded bg-amber-500" />
                        <span className="text-sm font-semibold text-slate-700">Medium Risk</span>
                      </div>
                      <span className="font-semibold text-slate-900 text-amber-600">{monitoringCount} ({mediumPercentage}%)</span>
                    </div>
                    
                    <div 
                      onClick={() => handleToggleRiskFilter('Low')}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border
                        ${filterRisk === 'Low' ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded bg-emerald-500" />
                        <span className="text-sm font-semibold text-slate-700">Low Risk (Green Theme)</span>
                      </div>
                      <span className="font-semibold text-slate-900 text-emerald-600">{lowRiskCount} ({lowPercentage}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Automated Calibration</h3>
                  <p className="text-xs text-indigo-200">The prediction model calibrates automatically against new attendance drops, GPA edits, and socio-economic updates.</p>
                </div>
                <div className="space-y-4 my-6">
                  <div className="flex justify-between border-b border-indigo-800/40 pb-2">
                    <span className="text-xs text-indigo-300">Model Engine</span>
                    <span className="text-xs font-semibold">{modelType}</span>
                  </div>
                  <div className="flex justify-between border-b border-indigo-800/40 pb-2">
                    <span className="text-xs text-indigo-300">API Gateway</span>
                    <span className="text-xs font-semibold text-emerald-400">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-indigo-300">Auto Alert Trigger</span>
                    <span className="text-xs font-semibold">{enableAlerts ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('Settings')}
                  className="w-full text-center py-2 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all duration-200"
                >
                  Adjust Thresholds & Model
                </button>
              </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">Priority Watchlist</h3>
                  {filterRisk && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 animate-in fade-in slide-in-from-left-2">
                      Filtering by {filterRisk} Risk
                      <button onClick={() => setFilterRisk(null)} className="hover:text-blue-900 ml-1 font-bold">×</button>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Filter Popover */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowFilterPopover(!showFilterPopover)}
                      className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200
                        ${(filterRisk || filterGrade) 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>

                    {showFilterPopover && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Level</label>
                          <select 
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                            value={filterRisk || ''}
                            onChange={(e) => setFilterRisk(e.target.value || null)}
                          >
                            <option value="">All</option>
                            <option value="High">High Risk</option>
                            <option value="Medium">Medium Risk</option>
                            <option value="Low">Low Risk</option>
                          </select>
                        </div>
                        <div className="mb-4">
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Grade</label>
                          <select 
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                            value={filterGrade || ''}
                            onChange={(e) => setFilterGrade(e.target.value ? Number(e.target.value) : null)}
                          >
                            <option value="">All Grades</option>
                            <option value="9">Grade 9</option>
                            <option value="10">Grade 10</option>
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                          </select>
                        </div>
                        <button 
                          onClick={() => { setFilterRisk(null); setFilterGrade(null); setShowFilterPopover(false); }}
                          className="w-full py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm">Fetching student profiles from database...</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Student</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">GPA</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Index</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                  {student.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                  <span className="font-medium text-slate-900 block">{student.name}</span>
                                  <span className="text-xs text-slate-400">{student.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-5 text-sm text-slate-600">{student.grade}</td>
                            <td className="py-3 px-5 text-sm text-slate-600 font-mono">{student.gpa.toFixed(2)}</td>
                            <td className="py-3 px-5 text-sm text-slate-600 font-mono">{student.attendance}%</td>
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3 w-32">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-700 ease-out
                                      ${student.riskScore > highRiskThreshold ? 'bg-rose-500' : student.riskScore > mediumRiskThreshold ? 'bg-amber-500' : 'bg-emerald-500'}
                                    `}
                                    style={{ width: `${student.riskScore}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-slate-700 w-6 text-right font-mono">{student.riskScore}</span>
                              </div>
                            </td>
                            <td className="py-3 px-5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                ${student.riskLevel === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200/60' : 
                                  student.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 
                                  'bg-emerald-50 text-emerald-700 border-emerald-200/60'}
                              `}>
                                {student.status}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-right">
                              <button 
                                onClick={() => setSelectedStudent(student)}
                                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              >
                                Review <ChevronRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            <Search className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                            <p>No students found matching current filters.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* COHORT ANALYSIS TAB */}
        {activeTab === 'Cohort Analysis' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Cohort Performance & Risk Breakdown</h2>
              <p className="text-sm text-slate-500">Examine academic performance metrics and risk distribution across grading cohorts.</p>
            </div>

            {/* Stacked Risk Distribution Bar Graph */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Grade Cohort Risk Distribution</h3>
              <p className="text-xs text-slate-400 mb-6">Stacked representation showing High, Medium, and Low risk student counts per grade level.</p>
              
              <div className="space-y-6">
                {cohortStats.map(cohort => {
                  const total = cohort.high + cohort.med + cohort.low;
                  const highPct = total > 0 ? (cohort.high / total) * 100 : 0;
                  const medPct = total > 0 ? (cohort.med / total) * 100 : 0;
                  const lowPct = total > 0 ? (cohort.low / total) * 100 : 0;

                  return (
                    <div key={cohort.grade} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="w-24 shrink-0">
                        <span className="font-semibold text-slate-800">Grade {cohort.grade}</span>
                        <span className="text-xs text-slate-400 block">{cohort.count} Monitored</span>
                      </div>
                      
                      {/* Stacked Bar Graph */}
                      <div className="flex-1 h-8 rounded-lg overflow-hidden bg-slate-100 flex shadow-inner">
                        {cohort.count > 0 ? (
                          <>
                            {cohort.high > 0 && (
                              <div 
                                className="h-full bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-90 cursor-pointer"
                                style={{ width: `${highPct}%` }}
                                title={`High Risk: ${cohort.high} students`}
                              >
                                {cohort.high} High
                              </div>
                            )}
                            {cohort.med > 0 && (
                              <div 
                                className="h-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-90 cursor-pointer"
                                style={{ width: `${medPct}%` }}
                                title={`Medium Risk: ${cohort.med} students`}
                              >
                                {cohort.med} Med
                              </div>
                            )}
                            {cohort.low > 0 && (
                              <div 
                                className="h-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-90 cursor-pointer"
                                style={{ width: `${lowPct}%` }}
                                title={`Low Risk: ${cohort.low} students`}
                              >
                                {cohort.low} Low
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium">No Students Active</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Average Grade Point Averages</h3>
                <div className="space-y-4">
                  {cohortStats.map(cohort => (
                    <div key={cohort.grade} className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-sm font-medium text-slate-600">Grade {cohort.grade}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-slate-800">{cohort.avgGpa}</span>
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(Number(cohort.avgGpa) / 4.0) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Average Attendance Rate</h3>
                <div className="space-y-4">
                  {cohortStats.map(cohort => (
                    <div key={cohort.grade} className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-sm font-medium text-slate-600">Grade {cohort.grade}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-slate-800">{cohort.avgAttendance}%</span>
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${cohort.avgAttendance < 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${cohort.avgAttendance}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INTERVENTIONS TAB */}
        {activeTab === 'Interventions' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Active Interventions Dashboard</h2>
                <p className="text-sm text-slate-500">Track and manage counselor schedules, tutoring pipelines, and support grants.</p>
              </div>
            </div>

            {/* List of Interventions */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Database Action Items</h3>
                <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full">{allInterventions.length} Tasks Pending</span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {allInterventions.length > 0 ? (
                  allInterventions.map((int: any) => (
                    <div key={int.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{int.type}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border uppercase tracking-wider
                            ${int.riskLevel === 'High' ? 'bg-rose-50 border-rose-100 text-rose-700' : 
                              int.riskLevel === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-700' : 
                              'bg-emerald-50 border-emerald-100 text-emerald-700'}
                          `}>
                            {int.studentName}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{int.notes}</p>
                        <span className="text-xs text-slate-400 block">Assigned student: {int.studentEmail}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Status badge */}
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border
                          ${int.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            int.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'}
                        `}>
                          {int.status}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          {int.status !== 'in_progress' && int.status !== 'completed' && (
                            <button 
                              onClick={() => handleUpdateInterventionStatus(int.id, 'in_progress')}
                              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {int.status !== 'completed' && (
                            <button 
                              onClick={() => handleUpdateInterventionStatus(int.id, 'completed')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-slate-500">
                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-3" />
                    <p>All students are currently classified low-risk. No active interventions required!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'Settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">System Configuration</h2>
              <p className="text-sm text-slate-500">Tune predictive models, alert priorities, and database calibration rates.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Threshold adjustments */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm lg:col-span-2 space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-500" /> AI Score Thresholds
                </h3>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-slate-700">Critical (High) Risk Threshold</label>
                      <span className="text-sm font-bold text-rose-600">{highRiskThreshold}%</span>
                    </div>
                    <input 
                      type="range" min="50" max="95" step="5"
                      value={highRiskThreshold}
                      onChange={e => setHighRiskThreshold(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">Scores above this percentage will trigger immediate interventions automatically.</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-slate-700">Medium Risk Monitoring Threshold</label>
                      <span className="text-sm font-bold text-amber-500">{mediumRiskThreshold}%</span>
                    </div>
                    <input 
                      type="range" min="20" max="45" step="5"
                      value={mediumRiskThreshold}
                      onChange={e => setMediumRiskThreshold(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">Scores above this are placed on the warnings priority watchlist.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => {
                      setToast({ message: "System thresholds updated and applied to database dashboard.", type: "success" });
                      fetchStudents();
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Save Threshold Configurations
                  </button>
                </div>
              </div>

              {/* Model Info */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-500" /> Prediction Model
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Classifier Algorithm</label>
                    <select 
                      value={modelType}
                      onChange={e => setModelType(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                    >
                      <option value="Random Forest (Ensemble)">Random Forest (Ensemble)</option>
                      <option value="XGBoost Classifier">XGBoost Classifier</option>
                      <option value="Logistic Regression">Logistic Regression (Linear)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Auto-Alert System</span>
                      <span className="text-[10px] text-slate-400">Send alerts to class counselors</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={enableAlerts}
                      onChange={e => setEnableAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900">Add New Student Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newStudent.name}
                    onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={newStudent.email}
                    onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                    placeholder="john.doe@school.edu"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Grade Level</label>
                  <select 
                    value={newStudent.gradeLevel}
                    onChange={e => setNewStudent({...newStudent, gradeLevel: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Socio-Economic Status</label>
                  <select 
                    value={newStudent.socioEconomicStatus}
                    onChange={e => setNewStudent({...newStudent, socioEconomicStatus: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Middle">Middle</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current GPA</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="4" 
                    required
                    value={newStudent.gpa}
                    onChange={e => setNewStudent({...newStudent, gpa: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Attendance rate (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    required
                    value={newStudent.attendanceRate}
                    onChange={e => setNewStudent({...newStudent, attendanceRate: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm disabled:opacity-75"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Adding..." : "Add & Predict Risk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT REVIEW DRAWER */}
      {selectedStudent && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={() => setSelectedStudent(null)}
          />
          
          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 sm:border-l border-slate-200">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                  {selectedStudent.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedStudent.name}</h2>
                  <p className="text-sm text-slate-500">Grade {selectedStudent.grade} • ID: {selectedStudent.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Risk Summary */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> AI Risk Analysis
                </h3>
                
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-600">Overall Dropout Risk</span>
                    <span className={`text-2xl font-bold tracking-tight
                      ${selectedStudent.riskScore > highRiskThreshold ? 'text-rose-600' : selectedStudent.riskScore > mediumRiskThreshold ? 'text-amber-600' : 'text-emerald-600'}
                    `}>
                      {selectedStudent.riskScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full rounded-full ${selectedStudent.riskScore > highRiskThreshold ? 'bg-rose-500' : selectedStudent.riskScore > mediumRiskThreshold ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${selectedStudent.riskScore}%` }}
                    />
                  </div>
                  
                  {/* Primary Risk Factors */}
                  {selectedStudent.riskFactors.length > 0 ? (
                    <div className="mt-4 pt-4 border-t border-slate-200/60">
                      <p className="text-xs font-semibold text-slate-500 mb-3">KEY DRIVERS (SHAP VALUES)</p>
                      <div className="space-y-3">
                        {selectedStudent.riskFactors.map((factor: string, idx: number) => (
                          <div key={idx} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-700">{factor}</span>
                              <span className="text-rose-500 font-medium font-mono">High Impact</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full">
                              <div className="h-full bg-rose-400 rounded-full" style={{ width: '80%' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <CheckCircle className="w-4 h-4" /> No critical risk factors identified.
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Trends */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" /> Academic & Engagement
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-1">Cumulative GPA</p>
                    <p className="text-xl font-bold text-slate-900 font-mono">{selectedStudent.gpa.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-1">Attendance Rate</p>
                    <p className="text-xl font-bold text-slate-900 font-mono">{selectedStudent.attendance}%</p>
                  </div>
                </div>
              </div>

              {/* Active Interventions */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Database Registered Interventions</h3>
                {selectedStudent.interventions && selectedStudent.interventions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.interventions.map((item: any) => (
                      <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                        <div className="flex justify-between font-semibold text-slate-700 mb-1">
                          <span>{item.type}</span>
                          <span className="text-blue-600">{item.status}</span>
                        </div>
                        <p className="text-slate-500">{item.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No interventions registered yet.</p>
                )}
              </div>

            </div>

            {/* Drawer Footer / Actions */}
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Deploy Database Intervention</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => triggerIntervention("Assign Peer Mentor")}
                  className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                >
                  <span className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400 group-hover:text-blue-500" /> Assign Peer Mentor</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
                <button 
                  onClick={() => triggerIntervention("Schedule Counselor Call")}
                  className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                >
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400 group-hover:text-blue-500" /> Schedule Counselor Call</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
                <button 
                  onClick={() => triggerIntervention("Financial Aid Review")}
                  className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                >
                  <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-slate-400 group-hover:text-blue-500" /> Financial Aid Review</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
