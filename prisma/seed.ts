import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.intervention.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.academicRecord.deleteMany({});
  await prisma.student.deleteMany({});

  console.log('Seeding database with 15 students...');

  const studentsData = [
    { name: 'Alice Johnson',    email: 'alice.j@edu.com',    grade: 10, ses: 'Middle', risk: 0.12, gpa: 3.8, att: 98 },
    { name: 'Bob Smith',        email: 'bob.s@edu.com',      grade: 10, ses: 'Low',    risk: 0.88, gpa: 1.9, att: 72 },
    { name: 'Charlie Davis',    email: 'charlie.d@edu.com',  grade: 11, ses: 'Middle', risk: 0.45, gpa: 2.7, att: 85 },
    { name: 'Diana Prince',     email: 'diana.p@edu.com',    grade: 12, ses: 'High',   risk: 0.05, gpa: 4.0, att: 100 },
    { name: 'Evan Wright',      email: 'evan.w@edu.com',     grade: 9,  ses: 'Low',    risk: 0.76, gpa: 2.2, att: 78 },
    { name: 'Fiona Gallagher',  email: 'fiona.g@edu.com',    grade: 11, ses: 'Low',    risk: 0.62, gpa: 2.4, att: 81 },
    { name: 'George Miller',    email: 'george.m@edu.com',   grade: 10, ses: 'Middle', risk: 0.38, gpa: 2.9, att: 88 },
    { name: 'Hannah Abbott',    email: 'hannah.a@edu.com',   grade: 9,  ses: 'Middle', risk: 0.15, gpa: 3.4, att: 94 },
    { name: 'Ian Malcolm',      email: 'ian.m@edu.com',      grade: 12, ses: 'High',   risk: 0.82, gpa: 2.1, att: 75 },
    { name: 'Julia Roberts',    email: 'julia.r@edu.com',    grade: 11, ses: 'Middle', risk: 0.28, gpa: 3.1, att: 91 },
    { name: 'Kevin Hart',       email: 'kevin.h@edu.com',    grade: 10, ses: 'Low',    risk: 0.94, gpa: 1.5, att: 65 },
    { name: 'Laura Dern',       email: 'laura.d@edu.com',    grade: 12, ses: 'High',   risk: 0.18, gpa: 3.5, att: 93 },
    { name: 'Marcus Brown',     email: 'marcus.b@edu.com',   grade: 9,  ses: 'Low',    risk: 0.71, gpa: 2.0, att: 76 },
    { name: 'Nina Patel',       email: 'nina.p@edu.com',     grade: 11, ses: 'Middle', risk: 0.33, gpa: 3.2, att: 89 },
    { name: 'Oscar Williams',   email: 'oscar.w@edu.com',    grade: 12, ses: 'Low',    risk: 0.79, gpa: 1.8, att: 70 },
  ];

  for (const s of studentsData) {
    const getInterventions = () => {
      if (s.risk > 0.7) {
        return {
          create: [
            { type: 'Counseling Session',  notes: 'AI Model flagged for immediate counselor intervention.', status: 'recommended' },
            { type: 'Intensive Tutoring',  notes: 'Flagged due to low GPA indicators.', status: 'in_progress' },
          ]
        };
      } else if (s.risk > 0.4) {
        return {
          create: [
            { type: 'Peer Tutoring', notes: 'Academic monitoring recommended.', status: 'recommended' },
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
        enrollmentDate: new Date('2022-09-01'),
        gradeLevel: s.grade,
        socioEconomicStatus: s.ses,
        riskScore: s.risk,
        academicRecords: {
          create: [
            {
              term: 'Fall 2022',
              gpa: parseFloat((s.gpa - 0.2).toFixed(1)),
              creditsEarned: 14,
              mathGrade: parseFloat((s.gpa - 0.3).toFixed(1)),
              englishGrade: parseFloat((s.gpa - 0.1).toFixed(1)),
            },
            {
              term: 'Spring 2023',
              gpa: parseFloat((s.gpa - 0.1).toFixed(1)),
              creditsEarned: 15,
              mathGrade: parseFloat((s.gpa - 0.2).toFixed(1)),
              englishGrade: s.gpa,
            },
            {
              term: 'Current',
              gpa: s.gpa,
              creditsEarned: 15,
              mathGrade: parseFloat((s.gpa - 0.1).toFixed(1)),
              englishGrade: s.gpa,
            },
          ],
        },
        attendanceRecords: {
          create: [
            {
              term: 'Fall 2022',
              totalDays: 90,
              daysAttended: Math.round(90 * (s.att / 100)),
              daysAbsent: 90 - Math.round(90 * (s.att / 100)),
            },
            {
              term: 'Spring 2023',
              totalDays: 90,
              daysAttended: Math.round(90 * ((s.att - 2) / 100)),
              daysAbsent: 90 - Math.round(90 * ((s.att - 2) / 100)),
            },
            {
              term: 'Current',
              totalDays: 100,
              daysAttended: s.att,
              daysAbsent: 100 - s.att,
            },
          ],
        },
        ...(interventionsPayload ? { interventions: interventionsPayload } : {}),
      },
    });

    console.log(`✅ Created: ${student.name} (Risk: ${Math.round(s.risk * 100)}%)`);
  }

  console.log('\n🎉 Seeding completed! 15 students added to database.');
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
