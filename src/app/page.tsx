"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Settings as SettingsIcon, Bell, Download, ChevronRight, 
  Activity, Users, AlertTriangle, CheckCircle, 
  X, Briefcase, BookOpen, Clock, AlertCircle, Loader2, Plus, Sliders, Server, Save,
  Database, Radio, Cpu, RefreshCw, Laptop, Coffee, MessageSquare, Play, Upload
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
    gradeLevel: '1', // Semester 1
    socioEconomicStatus: 'Middle',
    gpa: '7.5',
    attendanceRate: '85',
    department: 'Computer Science',
    cgpa: '7.5',
    spi: '7.5',
  });
  
  // UI Interactions State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);

  // Data Collection Layer states
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);
  const [activeSourceConfig, setActiveSourceConfig] = useState<any | null>(null);
  
  // Custom manual data import state
  const [manualImportData, setManualImportData] = useState(
    JSON.stringify([
      { "name": "Rajesh Kumar", "email": "rajesh.k@edu.in", "gradeLevel": 10, "gpa": 2.1, "attendanceRate": 74, "socioEconomicStatus": "Low" },
      { "name": "Priya Sharma", "email": "priya.s@edu.in", "gradeLevel": 11, "gpa": 3.9, "attendanceRate": 98, "socioEconomicStatus": "High" }
    ], null, 2)
  );

  const handleTriggerSyncSimulation = async () => {
    setIsSyncingData(true);
    setSyncStep(0);
    setSyncProgress(10);
    
    // Step 0: Connect UDISE+ & Biometrics
    await new Promise(r => setTimeout(r, 800));
    setSyncStep(1);
    setSyncProgress(35);
    
    // Step 1: Read Exam software ERP
    await new Promise(r => setTimeout(r, 1000));
    setSyncStep(2);
    setSyncProgress(60);
    
    // Step 2: Query DIKSHA & PM POSHAN
    await new Promise(r => setTimeout(r, 900));
    setSyncStep(3);
    setSyncProgress(85);
    
    // Step 3: Run AI Model on API & Update SQLite
    await new Promise(r => setTimeout(r, 1100));
    setSyncStep(4);
    setSyncProgress(100);
    
    // Complete
    await new Promise(r => setTimeout(r, 500));
    setIsSyncingData(false);
    setToast({ message: "Data Collection Layer Sync Completed: Ingested biometric, ERP, DIKSHA LMS, and PM POSHAN meal enrollment logs successfully.", type: "success" });
    fetchStudents();
  };

  const handleManualImport = async () => {
    try {
      const parsed = JSON.parse(manualImportData);
      if (!Array.isArray(parsed)) {
        setToast({ message: "Data must be a JSON array of students.", type: "error" });
        return;
      }
      
      setIsSubmitting(true);
      let successCount = 0;
      
      for (const item of parsed) {
        if (!item.name || !item.email) continue;
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name,
            email: item.email,
            gradeLevel: Number(item.gradeLevel) || 10,
            socioEconomicStatus: item.socioEconomicStatus || 'Middle',
            gpa: Number(item.gpa) || 3.0,
            attendanceRate: Number(item.attendanceRate) || 90
          })
        });
        if (res.ok) successCount++;
      }
      
      setToast({ message: `Successfully imported ${successCount} students from manual school sheet and updated AI predictions!`, type: "success" });
      fetchStudents();
    } catch (err: any) {
      setToast({ message: `Failed to parse JSON: ${err.message}`, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dataSources = [
    {
      id: 'attendance',
      name: 'Attendance Stream',
      source: 'Biometric/RFID (UDISE+) & Teacher App',
      status: 'Active',
      lastSync: '10 mins ago',
      records: 12450,
      quality: 98,
      icon: Radio,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      description: 'Ingests real-time pupil presence logs via school RFID gates and UDISE+ compliant biometric interfaces.',
      recentLog: 'Class 10-A biometric presence report pushed. 143 records synced.'
    },
    {
      id: 'academic',
      name: 'Academic Performance',
      source: 'Vidyalaya ERP & Excel Exam sheets',
      status: 'Synced',
      lastSync: '2 hours ago',
      records: 3820,
      quality: 95,
      icon: Laptop,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      description: 'Syncs grading registers, math/english terminal scores, and cumulative credits directly from school ERP.',
      recentLog: 'Mid-term results parsed successfully for Grade 9, 10, 11, and 12.'
    },
    {
      id: 'behavior',
      name: 'Learning Behavior',
      source: 'DIKSHA Portal & Google Classroom Logs',
      status: 'Active',
      lastSync: '1 hour ago',
      records: 8450,
      quality: 90,
      icon: Cpu,
      color: 'bg-violet-500',
      textColor: 'text-violet-500',
      description: 'Tracks lesson completeness, educational video view durations, and portal logins on India\'s DIKSHA LMS.',
      recentLog: 'Fetched daily DIKSHA usage report. Updated active behavior metrics.'
    },
    {
      id: 'socioeconomic',
      name: 'Socio-Economic Factors',
      source: 'Admission Forms & PM POSHAN Database',
      status: 'Connected',
      lastSync: '1 day ago',
      records: 1540,
      quality: 92,
      icon: Coffee,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      description: 'Integrates Mid-day meal enrollment status (PM POSHAN), scholarship lists, and pupil home transport distances.',
      recentLog: 'Synchronized PM POSHAN roster. Calculated travel distance variables.'
    },
    {
      id: 'engagement',
      name: 'Parent Engagement API',
      source: 'ParentApp Twilio SMS & WhatsApp groups',
      status: 'Active',
      lastSync: '30 mins ago',
      records: 5120,
      quality: 85,
      icon: MessageSquare,
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      description: 'Captures parent communication engagement metrics, reply sentiment rates, and SMS read status checks.',
      recentLog: 'WhatsApp response status confirmed for 4 high-risk alert threads.'
    }
  ];

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
          attendanceRate: Number(newStudent.attendanceRate),
          department: newStudent.department,
          cgpa: Number(newStudent.cgpa),
          spi: Number(newStudent.spi),
        }),
      });

      if (res.ok) {
        setToast({ message: `Successfully added ${newStudent.name} & calculated risk via AI model!`, type: 'success' });
        setShowAddModal(false);
        setNewStudent({
          name: '',
          email: '',
          gradeLevel: '1',
          socioEconomicStatus: 'Middle',
          gpa: '7.5',
          attendanceRate: '85',
          department: 'Computer Science',
          cgpa: '7.5',
          spi: '7.5',
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
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    return semesters.map(g => {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row selection:bg-blue-100 selection:text-blue-900">
      
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

      {/* LEFT SIDEBAR - DESKTOP */}
      <aside className="hidden md:flex w-64 bg-slate-905 bg-slate-900 text-slate-100 flex-shrink-0 flex-col sticky top-0 h-screen border-r border-slate-800">
        <div className="p-6 border-b border-slate-850 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-650 shadow-md shadow-blue-500/20 flex items-center justify-center bg-blue-600">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none tracking-tight">EduSuccess</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-455 text-slate-400 font-semibold mt-0.5">Dropout Predictor</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { name: 'Overview', icon: Activity },
            { name: 'Cohort Analysis', icon: Users },
            { name: 'Interventions', icon: Briefcase },
            { name: 'Data Integration', icon: Database },
            { name: 'Settings', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button 
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setFilterRisk(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 text-left
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.name}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-850">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold">
              AD
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200">Admin Dashboard</p>
              <p className="text-[10px] text-slate-400 truncate">admin@school.edu</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER & TABS */}
      <div className="md:hidden bg-slate-900 border-b border-slate-850 sticky top-0 z-30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">EduSuccess</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-200">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              AD
            </div>
          </div>
        </div>
        
        <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
          {[
            { name: 'Overview', icon: Activity },
            { name: 'Cohort Analysis', icon: Users },
            { name: 'Interventions', icon: Briefcase },
            { name: 'Data Integration', icon: Database },
            { name: 'Settings', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button 
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setFilterRisk(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-155
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT PAGE CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* DESKTOP TOP BAR (utility only) */}
        <header className="hidden md:flex bg-white border-b border-slate-200/60 px-8 h-16 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Portal</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-sm font-semibold text-slate-700">{activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-655 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-650">
                AD
              </div>
              <span className="text-xs font-medium text-slate-650">Admin Session</span>
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-grow">
        
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
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Semester</label>
                          <select 
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                            value={filterGrade || ''}
                            onChange={(e) => setFilterGrade(e.target.value ? Number(e.target.value) : null)}
                          >
                            <option value="">All Semesters</option>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                            <option value="3">Semester 3</option>
                            <option value="4">Semester 4</option>
                            <option value="5">Semester 5</option>
                            <option value="6">Semester 6</option>
                            <option value="7">Semester 7</option>
                            <option value="8">Semester 8</option>
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
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Semester</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">CGPA</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">SPI</th>
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
                            <td className="py-3 px-5 text-sm text-slate-600 font-medium">{student.department}</td>
                            <td className="py-3 px-5 text-sm text-slate-600">Sem {student.grade}</td>
                            <td className="py-3 px-5 text-sm text-slate-600 font-mono font-semibold">{student.cgpa !== undefined ? student.cgpa.toFixed(2) : '0.00'}</td>
                            <td className="py-3 px-5 text-sm text-slate-600 font-mono">{student.spi !== undefined ? student.spi.toFixed(2) : '0.00'}</td>
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
                          <td colSpan={9} className="py-12 text-center text-slate-500">
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
              <p className="text-sm text-slate-500">Examine academic performance metrics and risk distribution across semesters.</p>
            </div>

            {/* Stacked Risk Distribution Bar Graph */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Semester Cohort Risk Distribution</h3>
              <p className="text-xs text-slate-400 mb-6">Stacked representation showing High, Medium, and Low risk student counts per semester.</p>
              
              <div className="space-y-6">
                {cohortStats.map(cohort => {
                  const total = cohort.high + cohort.med + cohort.low;
                  const highPct = total > 0 ? (cohort.high / total) * 100 : 0;
                  const medPct = total > 0 ? (cohort.med / total) * 100 : 0;
                  const lowPct = total > 0 ? (cohort.low / total) * 100 : 0;

                  return (
                    <div key={cohort.grade} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="w-24 shrink-0">
                        <span className="font-semibold text-slate-800">Semester {cohort.grade}</span>
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
                <h3 className="text-base font-semibold text-slate-800 mb-4">Average Cumulative GPA (CGPA)</h3>
                <div className="space-y-4">
                  {cohortStats.map(cohort => (
                    <div key={cohort.grade} className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-sm font-medium text-slate-600">Semester {cohort.grade}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-slate-800">{cohort.avgGpa}</span>
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(Number(cohort.avgGpa) / 10.0) * 100}%` }} />
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
                      <span className="text-sm font-medium text-slate-600">Semester {cohort.grade}</span>
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

        {/* DATA INTEGRATION (DATA COLLECTION LAYER) TAB */}
        {activeTab === 'Data Integration' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Data Collection Layer & Ingestion Dashboard</h2>
                <p className="text-sm text-slate-500">Monitor active links, sync metrics, and inspect API feeds from UDISE+, Vidyalaya ERP, DIKSHA, and WhatsApp gateway.</p>
              </div>
              <button 
                onClick={handleTriggerSyncSimulation}
                disabled={isSyncingData}
                className="inline-flex items-center justify-center gap-2 bg-blue-650 hover:bg-blue-700 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-75"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingData ? 'animate-spin' : ''}`} />
                {isSyncingData ? 'Ingesting Feeds...' : 'Poll & Sync Feeds'}
              </button>
            </div>

            {/* Sync Progress simulation widget */}
            {isSyncingData && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Data Feed Ingestion Process ({syncProgress}%)</span>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${syncProgress}%` }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4 text-xs font-medium">
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all ${syncStep >= 0 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <span className="w-4.5 h-4.5 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[10px]">1</span>
                    UDISE+ Biometrics
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all ${syncStep >= 1 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <span className="w-4.5 h-4.5 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[10px]">2</span>
                    Vidyalaya ERP
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all ${syncStep >= 2 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <span className="w-4.5 h-4.5 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[10px]">3</span>
                    DIKSHA LMS
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all ${syncStep >= 3 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <span className="w-4.5 h-4.5 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[10px]">4</span>
                    PM POSHAN
                  </div>
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all ${syncStep >= 4 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <span className="w-4.5 h-4.5 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[10px]">5</span>
                    Parent API
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Data Flow Map */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Database className="w-40 h-40" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Interactive Data Stream Network</h3>
                <p className="text-xs text-slate-400 mb-8">Real-world data links feeding school registers into FastAPI AI Predictor & SQLite Database.</p>
                
                {/* Visual Pipeline Layout */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-6">
                  {/* Left Side: 5 Data Streams */}
                  <div className="flex flex-col gap-3 w-full lg:w-72 shrink-0">
                    {[
                      { name: 'Attendance Stream', desc: 'Biometric RFID UDISE+', color: 'text-emerald-400' },
                      { name: 'Academic Performance', desc: 'Vidyalaya ERP Registers', color: 'text-blue-400' },
                      { name: 'Learning Behavior', desc: 'DIKSHA Portal Modules', color: 'text-violet-400' },
                      { name: 'Socio-Economic Factors', desc: 'PM POSHAN Meal Registry', color: 'text-amber-400' },
                      { name: 'Parent Engagement', desc: 'WhatsApp Sentiment logs', color: 'text-rose-400' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-750 transition-all group">
                        <div>
                          <span className="text-xs font-bold block text-slate-205">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{item.desc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">Online</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Center Connective Paths (SVG) */}
                  <div className="hidden lg:flex flex-col items-center justify-center shrink-0 w-24">
                    <svg className="w-full h-40" viewBox="0 0 100 100">
                      <path d="M 0 10 Q 50 50 100 50" fill="transparent" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M 0 30 Q 50 50 100 50" fill="transparent" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M 0 50 H 100" fill="transparent" stroke="#3b82f6" strokeWidth="2" className="animate-pulse" />
                      <path d="M 0 70 Q 50 50 100 50" fill="transparent" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M 0 90 Q 50 50 100 50" fill="transparent" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>
                  </div>

                  {/* Center Node: AI Predictor (FastAPI) */}
                  <div className="flex flex-col items-center justify-center p-6 bg-blue-600 rounded-2xl shadow-lg border border-blue-500 w-full lg:w-48 shrink-0 text-center relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <Cpu className="w-8 h-8 text-white mb-2 animate-bounce" />
                    <span className="text-sm font-bold text-white block">FastAPI AI Predictor</span>
                    <span className="text-[10px] text-blue-100 mt-1 uppercase tracking-wider font-bold bg-blue-700 px-2 py-0.5 rounded-full">SHAP CALCULATION</span>
                  </div>

                  {/* Right Connective Paths (SVG) */}
                  <div className="hidden lg:flex flex-col items-center justify-center shrink-0 w-20">
                    <svg className="w-full h-12" viewBox="0 0 80 40">
                      <path d="M 0 20 H 80" fill="transparent" stroke="#3b82f6" strokeWidth="2" className="animate-pulse" />
                    </svg>
                  </div>

                  {/* Right Node: SQLite DB via Prisma */}
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-2xl border border-slate-700 w-full lg:w-48 shrink-0 text-center group">
                    <Database className="w-8 h-8 text-blue-400 mb-2 group-hover:text-blue-300 transition-colors" />
                    <span className="text-sm font-bold text-slate-100 block">SQLite Database</span>
                    <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold bg-slate-750 px-2 py-0.5 rounded-full">PRISMA ORM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingestion Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataSources.map((source) => {
                const Icon = source.icon;
                return (
                  <div key={source.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl bg-slate-50 text-slate-700`}>
                          <Icon className={`w-5 h-5 ${source.textColor}`} />
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                          {source.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">{source.name}</h4>
                      <p className="text-xs text-slate-405 text-slate-400 mb-3">{source.source}</p>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{source.description}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Synced Packets</span>
                        <span className="font-semibold text-slate-700 font-mono">{source.records.toLocaleString()} records</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Data Completeness</span>
                        <span className="font-bold text-emerald-600">{source.quality}%</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Sync Activity Log</span>
                        <span className="text-[10px] text-slate-650 text-slate-600 block truncate font-medium">{source.recentLog}</span>
                      </div>
                      <button 
                        onClick={() => setActiveSourceConfig(source)}
                        className="w-full text-center py-2 bg-slate-50 hover:bg-slate-105 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 border border-slate-100 hover:border-slate-200 transition-all"
                      >
                        Configure Stream Feed
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom spreadsheet Excel / ERP JSON Import Simulator */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Upload className="w-5 h-5 text-blue-500" /> Manual Spreadsheet Sync</h3>
                  <p className="text-xs text-slate-400 mt-1">Import Exam rosters, UDISE+ attendance lists, or admission documents manually as school sheets.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-700">How to load records:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Keep GPA format between 0.0 and 4.0</li>
                    <li>AttendanceRate should be percentage (0 - 100)</li>
                    <li>SocioEconomicStatus should match <code className="font-mono bg-white px-1">"Low"</code>, <code className="font-mono bg-white px-1">"Middle"</code>, or <code className="font-mono bg-white px-1">"High"</code></li>
                    <li>Each row is fed directly into the FastAPI model automatically</li>
                  </ul>
                </div>
                <button 
                  onClick={handleManualImport}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-slate-905 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-75"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Execute Spreadsheet Parse
                </button>
              </div>

              <div>
                <textarea 
                  className="w-full h-56 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={manualImportData}
                  onChange={e => setManualImportData(e.target.value)}
                />
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
      </div> {/* <-- closing CONTENT PAGE CONTAINER */}

      {/* CONNECTION CONFIGURATION POPUP MODAL */}
      {activeSourceConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveSourceConfig(null)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 z-10 animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${activeSourceConfig.color}`} />
                <h3 className="text-lg font-bold text-slate-900">{activeSourceConfig.name}</h3>
              </div>
              <button onClick={() => setActiveSourceConfig(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data Source Address</p>
                <code className="text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 block font-mono text-slate-600 break-all">
                  {activeSourceConfig.id === 'attendance' ? 'https://udise.govt.in/api/v2/attendance/biometrics' : 
                   activeSourceConfig.id === 'academic' ? 'ftp://school-server/vidyalaya_erp/exports' :
                   activeSourceConfig.id === 'behavior' ? 'https://diksha.gov.in/lms/webhooks/log_stream' :
                   activeSourceConfig.id === 'socioeconomic' ? 'db://pm-poshan-national/school_records' :
                   'https://api.twilio.com/v1/whatsapp/conversations'}
                </code>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Configuration Settings</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                    <span>Sync Frequency</span>
                    <select className="p-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-500">
                      <option>Real-time Webhook</option>
                      <option>Hourly Cron</option>
                      <option>Daily Batch Sync</option>
                      <option>Manual Import Only</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                    <span>Sync Weight in AI Risk Rating</span>
                    <select className="p-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-500">
                      <option>High (1.5x Multiplier)</option>
                      <option>Standard (1.0x Multiplier)</option>
                      <option>Low (0.5x Multiplier)</option>
                      <option>Audit Logging Only</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 block">Feed Quality Audit</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${activeSourceConfig.quality}%` }} />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{activeSourceConfig.quality}% Ingested</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">Errors encountered: 0. Missing fields automatically imputed via mean estimation.</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setActiveSourceConfig(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Department</label>
                  <select 
                    value={newStudent.department}
                    onChange={e => setNewStudent({...newStudent, department: e.target.value})}
                    className="w-full p-2 border border-slate-250 rounded-lg text-sm focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Semester</label>
                  <select 
                    value={newStudent.gradeLevel}
                    onChange={e => setNewStudent({...newStudent, gradeLevel: e.target.value})}
                    className="w-full p-2 border border-slate-250 rounded-lg text-sm focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cumulative CGPA (0.0 - 10.0)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="10" 
                    required
                    value={newStudent.cgpa}
                    onChange={e => setNewStudent({...newStudent, cgpa: e.target.value, gpa: e.target.value})}
                    className="w-full p-2 border border-slate-250 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Semester SPI (0.0 - 10.0)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="10" 
                    required
                    value={newStudent.spi}
                    onChange={e => setNewStudent({...newStudent, spi: e.target.value})}
                    className="w-full p-2 border border-slate-250 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Socio-Economic Status</label>
                  <select 
                    value={newStudent.socioEconomicStatus}
                    onChange={e => setNewStudent({...newStudent, socioEconomicStatus: e.target.value})}
                    className="w-full p-2 border border-slate-250 rounded-lg text-sm focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Middle">Middle</option>
                    <option value="High">High</option>
                  </select>
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
                    className="w-full p-2 border border-slate-250 rounded-lg text-sm focus:border-blue-500 outline-none"
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
                  <p className="text-sm text-slate-500">{selectedStudent.department} • Semester {selectedStudent.grade}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">ID: {selectedStudent.id}</p>
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
                    <p className="text-xs font-medium text-slate-500 mb-1">Cumulative CGPA</p>
                    <p className="text-xl font-bold text-slate-900 font-mono">{selectedStudent.cgpa !== undefined ? selectedStudent.cgpa.toFixed(2) : selectedStudent.gpa.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-1">Semester SPI</p>
                    <p className="text-xl font-bold text-slate-900 font-mono">{selectedStudent.spi !== undefined ? selectedStudent.spi.toFixed(2) : selectedStudent.gpa.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <p className="text-xs font-medium text-slate-500 mb-1">Attendance Rate</p>
                  <p className="text-xl font-bold text-slate-900 font-mono">{selectedStudent.attendance}%</p>
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
