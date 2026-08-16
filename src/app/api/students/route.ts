import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        academicRecords: true,
        attendanceRecords: true,
        interventions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format for frontend
    const formatted = students.map(student => {
      const latestAttendance = student.attendanceRecords[student.attendanceRecords.length - 1] || { totalDays: 1, daysAttended: 1 };
      
      const attendanceRate = Math.round((latestAttendance.daysAttended / (latestAttendance.totalDays || 1)) * 100);
      
      // Determine status based on riskScore
      let status = 'On Track';
      let riskLevel = 'Low';
      const riskScore = student.riskScore ? Math.round(student.riskScore * 100) : 0;
      
      if (riskScore > 70) {
        status = 'At Risk';
        riskLevel = 'High';
      } else if (riskScore > 40) {
        status = 'Monitoring';
        riskLevel = 'Medium';
      }

      // Collect risk factors based on college standards
      const riskFactors: string[] = [];
      if (student.cgpa < 6.0) riskFactors.push('Low CGPA (< 6.0)');
      if (student.spi < 6.0) riskFactors.push('Low Semester SPI (< 6.0)');
      if (attendanceRate < 75) riskFactors.push('Low Attendance (< 75%)');
      if (student.socioEconomicStatus === 'Low') riskFactors.push('Socio-Economic Stress');

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.gradeLevel, // semester maps to grade for UI compatibility
        department: student.department,
        cgpa: student.cgpa,
        spi: student.spi,
        gpa: student.cgpa, // GPA fallback mapping
        attendance: attendanceRate,
        riskScore,
        riskLevel,
        riskFactors,
        status,
        socioEconomicStatus: student.socioEconomicStatus,
        interventions: student.interventions,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, gradeLevel, socioEconomicStatus, gpa, attendanceRate, department, cgpa, spi } = body;

    if (!name || !email || !gradeLevel || !socioEconomicStatus || attendanceRate === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call FastAPI prediction model
    let riskScore = 0.2;
    let riskLevel = 'Low';
    let recommendedInterventions: string[] = [];

    // Parse CGPA and SPI (10.0 scale)
    const studentCgpa = cgpa !== undefined ? Number(cgpa) : (gpa !== undefined ? Number(gpa) : 7.0);
    const studentSpi = spi !== undefined ? Number(spi) : (gpa !== undefined ? Number(gpa) : 7.0);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiResponse = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: email,
          gpa: studentCgpa,
          attendance_rate: Number(attendanceRate) / 100,
          credits_earned: 22,
          socio_economic_status: socioEconomicStatus,
        }),
      });

      if (apiResponse.ok) {
        const prediction = await apiResponse.json();
        riskScore = prediction.risk_score;
        riskLevel = prediction.risk_level;
        recommendedInterventions = prediction.recommended_interventions;
      }
    } catch (apiErr) {
      console.error('FastAPI fetch failed, falling back to local calculation:', apiErr);
      // Fallback local calculations
      riskScore = 0.1;
      if (studentCgpa < 6.0) riskScore += 0.45;
      if (studentSpi < 6.0) riskScore += 0.20;
      if (Number(attendanceRate) < 75) riskScore += 0.35;
      if (socioEconomicStatus === 'Low') riskScore += 0.1;
      riskLevel = riskScore > 0.7 ? 'High' : riskScore > 0.4 ? 'Medium' : 'Low';
      recommendedInterventions = riskLevel === 'High' 
        ? ['Schedule counselor review session', 'Academic probation mentoring'] 
        : ['Continue current trajectory'];
    }

    // Save to Database
    const student = await prisma.student.create({
      data: {
        name,
        email,
        enrollmentDate: new Date(),
        gradeLevel: Number(gradeLevel),
        department: department || 'Computer Science',
        cgpa: studentCgpa,
        spi: studentSpi,
        socioEconomicStatus,
        riskScore,
        academicRecords: {
          create: {
            term: 'Current',
            gpa: studentCgpa,
            creditsEarned: 22,
          }
        },
        attendanceRecords: {
          create: {
            term: 'Current',
            totalDays: 100,
            daysAttended: Number(attendanceRate),
            daysAbsent: 100 - Number(attendanceRate),
          }
        },
        interventions: {
          create: recommendedInterventions.map(type => ({
            type,
            notes: 'Auto-recommended by predictive model',
            status: 'recommended',
          }))
        }
      },
      include: {
        academicRecords: true,
        attendanceRecords: true,
        interventions: true,
      }
    });

    return NextResponse.json(student);
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
