import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database tables...');
  await prisma.intervention.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.academicRecord.deleteMany({});
  await prisma.student.deleteMany({});

  console.log('Seeding database with 15 College Department Students...');

  const collegeStudents = [
    { name: 'Amit Sharma',       email: 'amit.sharma@college.edu',   sem: 6, dept: 'Computer Science',       cgpa: 8.7, spi: 8.9, att: 92, ses: 'Middle', risk: 0.12 },
    { name: 'Rahul Verma',       email: 'rahul.verma@college.edu',   sem: 4, dept: 'Mechanical Engineering',  cgpa: 5.4, spi: 4.8, att: 62, ses: 'Low',    risk: 0.88 },
    { name: 'Sneha Patel',       email: 'sneha.patel@college.edu',   sem: 8, dept: 'Information Technology',  cgpa: 7.2, spi: 7.5, att: 81, ses: 'Middle', risk: 0.35 },
    { name: 'Priya Nair',        email: 'priya.nair@college.edu',    sem: 2, dept: 'Electronics & Comm',      cgpa: 9.4, spi: 9.6, att: 98, ses: 'High',   risk: 0.05 },
    { name: 'Vikram Singh',      email: 'vikram.singh@college.edu',  sem: 6, dept: 'Civil Engineering',       cgpa: 5.8, spi: 5.2, att: 70, ses: 'Low',    risk: 0.74 },
    { name: 'Ananya Roy',        email: 'ananya.roy@college.edu',    sem: 4, dept: 'Computer Science',       cgpa: 6.2, spi: 6.0, att: 75, ses: 'Low',    risk: 0.60 },
    { name: 'Deepak Gupta',      email: 'deepak.gupta@college.edu',  sem: 6, dept: 'Electrical Engineering',  cgpa: 7.8, spi: 7.4, att: 85, ses: 'Middle', risk: 0.28 },
    { name: 'Meera Krishnan',    email: 'meera.k@college.edu',       sem: 2, dept: 'Business Administration',cgpa: 8.2, spi: 8.5, att: 90, ses: 'Middle', risk: 0.15 },
    { name: 'Aditya Sen',        email: 'aditya.sen@college.edu',    sem: 8, dept: 'Mechanical Engineering',  cgpa: 4.9, spi: 4.5, att: 58, ses: 'High',   risk: 0.85 },
    { name: 'Karan Malhotra',    email: 'karan.m@college.edu',       sem: 4, dept: 'Information Technology',  cgpa: 7.0, spi: 7.1, att: 88, ses: 'Middle', risk: 0.25 },
    { name: 'Sanjay Dutt',       email: 'sanjay.dutt@college.edu',   sem: 6, dept: 'Chemical Engineering',    cgpa: 4.5, spi: 4.1, att: 50, ses: 'Low',    risk: 0.94 },
    { name: 'Divya Joshi',       email: 'divya.joshi@college.edu',   sem: 8, dept: 'Electronics & Comm',      cgpa: 8.0, spi: 8.2, att: 91, ses: 'High',   risk: 0.18 },
    { name: 'Rohan Mehra',       email: 'rohan.mehra@college.edu',   sem: 2, dept: 'Civil Engineering',       cgpa: 5.9, spi: 5.5, att: 68, ses: 'Low',    risk: 0.72 },
    { name: 'Neha Gupta',        email: 'neha.gupta@college.edu',    sem: 6, dept: 'Computer Science',       cgpa: 7.5, spi: 7.8, att: 89, ses: 'Middle', risk: 0.22 },
    { name: 'Arjun Reddy',       email: 'arjun.reddy@college.edu',   sem: 8, dept: 'Chemical Engineering',    cgpa: 5.2, spi: 4.9, att: 65, ses: 'Low',    risk: 0.79 },
  ];

  for (const s of collegeStudents) {
    const getInterventions = () => {
      if (s.risk > 0.7) {
        return {
          create: [
            { type: 'Academic Probation Support', notes: 'AI Model flagged for intensive tutoring & make-up classes due to CGPA < 6.0.', status: 'recommended' },
            { type: 'Counseling Session', notes: 'Attendance is below 75% threshold. Session scheduled with Department Head.', status: 'in_progress' }
          ]
        };
      } else if (s.risk > 0.4) {
        return {
          create: [
            { type: 'Peer Mentoring', notes: 'Academic monitoring and study group recommended.', status: 'recommended' }
          ]
        };
      }
      return undefined;
    };

    const interventionsPayload = getInterventions();

    const student = await prisma.student.create({
      data: {
        name: s.name,
        email: s.email,
        enrollmentDate: new Date('2022-08-15'),
        gradeLevel: s.sem,
        department: s.dept,
        cgpa: s.cgpa,
        spi: s.spi,
        socioEconomicStatus: s.ses,
        riskScore: s.risk,
        academicRecords: {
          create: [
            {
              term: `Semester ${s.sem - 2}`,
              gpa: parseFloat((s.cgpa - 0.3).toFixed(1)),
              creditsEarned: 22,
            },
            {
              term: `Semester ${s.sem - 1}`,
              gpa: parseFloat((s.cgpa - 0.1).toFixed(1)),
              creditsEarned: 22,
            },
            {
              term: 'Current',
              gpa: s.cgpa,
              creditsEarned: 22,
            }
          ]
        },
        attendanceRecords: {
          create: [
            {
              term: `Semester ${s.sem - 2}`,
              totalDays: 90,
              daysAttended: Math.round(90 * (s.att / 100)),
              daysAbsent: 90 - Math.round(90 * (s.att / 100)),
            },
            {
              term: `Semester ${s.sem - 1}`,
              totalDays: 90,
              daysAttended: Math.round(90 * ((s.att - 2) / 100)),
              daysAbsent: 90 - Math.round(90 * ((s.att - 2) / 100)),
            },
            {
              term: 'Current',
              totalDays: 100,
              daysAttended: s.att,
              daysAbsent: 100 - s.att,
            }
          ]
        },
        ...(interventionsPayload ? { interventions: interventionsPayload } : {})
      }
    });

    console.log(`✅ Seeded: [${student.department}] ${student.name} (Sem: ${student.gradeLevel}, CGPA: ${student.cgpa}, SPI: ${student.spi}, Attendance: ${s.att}%, Risk: ${Math.round(student.riskScore! * 100)}%)`);
  }

  console.log('\n🎉 Successfully seeded 15 College Department students!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
