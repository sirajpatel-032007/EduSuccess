import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a student
  const student1 = await prisma.student.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice.j@example.com',
      enrollmentDate: new Date('2022-09-01'),
      gradeLevel: 10,
      socioEconomicStatus: 'Middle',
      riskScore: 0.2, // Low risk
      academicRecords: {
        create: [
          {
            term: 'Fall 2022',
            gpa: 3.5,
            creditsEarned: 15,
            mathGrade: 3.0,
            englishGrade: 3.8,
          },
          {
            term: 'Spring 2023',
            gpa: 3.6,
            creditsEarned: 15,
            mathGrade: 3.2,
            englishGrade: 3.9,
          }
        ]
      },
      attendanceRecords: {
        create: [
          {
            term: 'Fall 2022',
            totalDays: 90,
            daysAttended: 88,
            daysAbsent: 2,
          },
          {
            term: 'Spring 2023',
            totalDays: 90,
            daysAttended: 89,
            daysAbsent: 1,
          }
        ]
      }
    }
  });

  // Create an at-risk student
  const student2 = await prisma.student.create({
    data: {
      name: 'Bob Smith',
      email: 'bob.smith@example.com',
      enrollmentDate: new Date('2022-09-01'),
      gradeLevel: 10,
      socioEconomicStatus: 'Low',
      riskScore: 0.85, // High risk
      academicRecords: {
        create: [
          {
            term: 'Fall 2022',
            gpa: 2.1,
            creditsEarned: 12,
            mathGrade: 1.5,
            englishGrade: 2.5,
          },
          {
            term: 'Spring 2023',
            gpa: 1.8,
            creditsEarned: 9,
            mathGrade: 1.0,
            englishGrade: 2.2,
          }
        ]
      },
      attendanceRecords: {
        create: [
          {
            term: 'Fall 2022',
            totalDays: 90,
            daysAttended: 75,
            daysAbsent: 15,
          },
          {
            term: 'Spring 2023',
            totalDays: 90,
            daysAttended: 70,
            daysAbsent: 20,
          }
        ]
      },
      interventions: {
        create: [
          {
            type: 'counseling',
            notes: 'Student showing frequent absences and declining math scores.',
            status: 'recommended'
          }
        ]
      }
    }
  });

  console.log({ student1, student2 });
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
