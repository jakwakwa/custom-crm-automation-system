import { PrismaClient, ProjectStatus, RelationshipType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (in order due to foreign keys)
  console.log('📝 Clearing existing data...')
  await prisma.message.deleteMany()
  await prisma.sequenceStep.deleteMany()
  await prisma.outreachSequence.deleteMany()
  await prisma.sequenceTemplateStep.deleteMany()
  await prisma.sequenceTemplate.deleteMany()
  await prisma.messageTemplate.deleteMany()
  await prisma.relationship.deleteMany()
  await prisma.project.deleteMany()
  await prisma.company.deleteMany()
  await prisma.person.deleteMany()

  // Create People
  console.log('👥 Creating people...')
  const people = await Promise.all([
    prisma.person.create({
      data: {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1-555-0101',
        whatsapp: '+1-555-0101',
      },
    }),
    prisma.person.create({
      data: {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@example.com',
        phone: '+1-555-0102',
        whatsapp: '+1-555-0102',
      },
    }),
    prisma.person.create({
      data: {
        firstName: 'Carol',
        lastName: 'Williams',
        email: 'carol.williams@example.com',
        phone: '+1-555-0103',
      },
    }),
    prisma.person.create({
      data: {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@example.com',
        phone: '+1-555-0104',
        whatsapp: '+1-555-0104',
      },
    }),
    prisma.person.create({
      data: {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@example.com',
        phone: '+1-555-0105',
      },
    }),
    prisma.person.create({
      data: {
        firstName: 'Frank',
        lastName: 'Miller',
        email: 'frank.miller@example.com',
        phone: '+1-555-0106',
        whatsapp: '+1-555-0106',
      },
    }),
    prisma.person.create({
      data: {
        firstName: 'Grace',
        lastName: 'Wilson',
        email: 'grace.wilson@example.com',
        phone: '+1-555-0107',
      },
    }),
    prisma.person.create({
      data: {
        firstName: 'Henry',
        lastName: 'Moore',
        email: 'henry.moore@example.com',
        phone: '+1-555-0108',
        whatsapp: '+1-555-0108',
      },
    }),
    prisma.person.create({
      data: {
        firstName: 'Isabella',
        lastName: 'Taylor',
        email: 'isabella.taylor@example.com',
        phone: '+1-555-0109',
      },
    }),
    prisma.person.create({
      data: {
        firstName: 'Jack',
        lastName: 'Anderson',
        email: 'jack.anderson@example.com',
        phone: '+1-555-0110',
        whatsapp: '+1-555-0110',
      },
    }),
  ])
  console.log(`✅ Created ${people.length} people`)

  // Create Companies
  console.log('🏢 Creating companies...')
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechCorp Industries',
        industry: 'Technology',
        website: 'https://techcorp.example.com',
        description:
          'Leading provider of enterprise software solutions and cloud infrastructure services.',
      },
    }),
    prisma.company.create({
      data: {
        name: 'FinanceFirst Group',
        industry: 'Finance',
        website: 'https://financefirst.example.com',
        description:
          'Global financial services firm specializing in investment banking and wealth management.',
      },
    }),
    prisma.company.create({
      data: {
        name: 'HealthCare Partners',
        industry: 'Healthcare',
        website: 'https://healthcarepartners.example.com',
        description:
          'Innovative healthcare provider focused on patient-centered care and medical technology.',
      },
    }),
    prisma.company.create({
      data: {
        name: 'EduTech Solutions',
        industry: 'Education',
        website: 'https://edutech.example.com',
        description:
          'Educational technology company creating digital learning platforms for schools and universities.',
      },
    }),
    prisma.company.create({
      data: {
        name: 'RetailMax Inc',
        industry: 'Retail',
        website: 'https://retailmax.example.com',
        description:
          'E-commerce and retail chain offering a wide range of consumer products.',
      },
    }),
    prisma.company.create({
      data: {
        name: 'GreenEnergy Corp',
        industry: 'Energy',
        website: 'https://greenenergy.example.com',
        description:
          'Renewable energy company focused on solar and wind power solutions.',
      },
    }),
    prisma.company.create({
      data: {
        name: 'MediaVision Studios',
        industry: 'Media & Entertainment',
        website: 'https://mediavision.example.com',
        description:
          'Creative media production company specializing in digital content and streaming services.',
      },
    }),
    prisma.company.create({
      data: {
        name: 'LogiTrans Global',
        industry: 'Logistics',
        website: 'https://logitrans.example.com',
        description:
          'International logistics and supply chain management company.',
      },
    }),
  ])
  console.log(`✅ Created ${companies.length} companies`)

  // Create Projects
  console.log('💼 Creating projects...')
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'Senior Backend Developer',
        description:
          'Looking for an experienced backend developer with expertise in Node.js and microservices architecture.',
        status: ProjectStatus.OPEN,
        companyId: companies[0].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Product Manager - AI',
        description:
          'Seeking a product manager to lead our AI initiatives and drive innovation.',
        status: ProjectStatus.IN_PROGRESS,
        companyId: companies[0].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Financial Analyst',
        description:
          'Join our team as a financial analyst focusing on investment strategies and market research.',
        status: ProjectStatus.OPEN,
        companyId: companies[1].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Investment Banking Associate',
        description:
          'Opportunity for an associate to work on M&A transactions and client advisory.',
        status: ProjectStatus.IN_PROGRESS,
        companyId: companies[1].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Registered Nurse - ICU',
        description:
          'Looking for a dedicated ICU nurse with critical care experience.',
        status: ProjectStatus.OPEN,
        companyId: companies[2].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Medical Director',
        description:
          'Leadership position for an experienced physician to oversee clinical operations.',
        status: ProjectStatus.CLOSED,
        companyId: companies[2].id,
        closedAt: new Date('2024-09-15'),
      },
    }),
    prisma.project.create({
      data: {
        title: 'Full Stack Developer',
        description:
          'Build cutting-edge educational platforms using React and Python.',
        status: ProjectStatus.OPEN,
        companyId: companies[3].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'UX Designer',
        description:
          'Create intuitive and engaging user experiences for our learning platform.',
        status: ProjectStatus.IN_PROGRESS,
        companyId: companies[3].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'E-commerce Manager',
        description:
          'Manage online sales channels and optimize customer experience.',
        status: ProjectStatus.OPEN,
        companyId: companies[4].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Supply Chain Analyst',
        description:
          'Analyze and optimize supply chain operations for better efficiency.',
        status: ProjectStatus.ON_HOLD,
        companyId: companies[4].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Solar Energy Engineer',
        description:
          'Design and implement solar power systems for commercial clients.',
        status: ProjectStatus.OPEN,
        companyId: companies[5].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Content Creator',
        description:
          'Create engaging video content for our digital platforms.',
        status: ProjectStatus.OPEN,
        companyId: companies[6].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Logistics Coordinator',
        description:
          'Coordinate international shipments and manage logistics operations.',
        status: ProjectStatus.IN_PROGRESS,
        companyId: companies[7].id,
      },
    }),
  ])
  console.log(`✅ Created ${projects.length} projects`)

  // Create Relationships
  console.log('🔗 Creating relationships...')
  const relationships = await Promise.all([
    // TechCorp relationships
    prisma.relationship.create({
      data: {
        personId: people[0].id,
        companyId: companies[0].id,
        projectId: projects[0].id,
        type: RelationshipType.CANDIDATE,
        notes: 'Strong candidate with 5 years of backend experience',
      },
    }),
    prisma.relationship.create({
      data: {
        personId: people[1].id,
        companyId: companies[0].id,
        projectId: projects[1].id,
        type: RelationshipType.CANDIDATE,
        notes: 'PM with AI/ML background',
      },
    }),
    prisma.relationship.create({
      data: {
        personId: people[9].id,
        companyId: companies[0].id,
        type: RelationshipType.CLIENT,
        notes: 'Primary contact at TechCorp',
      },
    }),

    // FinanceFirst relationships
    prisma.relationship.create({
      data: {
        personId: people[2].id,
        companyId: companies[1].id,
        projectId: projects[2].id,
        type: RelationshipType.CANDIDATE,
        notes: 'CFA level 2 candidate with strong analytical skills',
      },
    }),
    prisma.relationship.create({
      data: {
        personId: people[3].id,
        companyId: companies[1].id,
        projectId: projects[3].id,
        type: RelationshipType.CANDIDATE,
        notes: 'Investment banking experience from top tier firm',
      },
    }),

    // HealthCare Partners relationships
    prisma.relationship.create({
      data: {
        personId: people[4].id,
        companyId: companies[2].id,
        projectId: projects[4].id,
        type: RelationshipType.CANDIDATE,
        notes: '10 years ICU nursing experience',
      },
    }),
    prisma.relationship.create({
      data: {
        personId: people[8].id,
        companyId: companies[2].id,
        type: RelationshipType.CLIENT,
        notes: 'HR Director at HealthCare Partners',
      },
    }),

    // EduTech relationships
    prisma.relationship.create({
      data: {
        personId: people[5].id,
        companyId: companies[3].id,
        projectId: projects[6].id,
        type: RelationshipType.CANDIDATE,
        notes: 'Full stack developer with education tech passion',
      },
    }),
    prisma.relationship.create({
      data: {
        personId: people[6].id,
        companyId: companies[3].id,
        projectId: projects[7].id,
        type: RelationshipType.CANDIDATE,
        notes: 'UX designer with portfolio in EdTech',
      },
    }),

    // RetailMax relationships
    prisma.relationship.create({
      data: {
        personId: people[7].id,
        companyId: companies[4].id,
        projectId: projects[8].id,
        type: RelationshipType.CANDIDATE,
        notes: 'E-commerce expert with 7 years experience',
      },
    }),

    // BOTH type relationships
    prisma.relationship.create({
      data: {
        personId: people[0].id,
        companyId: companies[5].id,
        projectId: projects[10].id,
        type: RelationshipType.BOTH,
        notes: 'Both client contact and candidate for technical role',
      },
    }),
    prisma.relationship.create({
      data: {
        personId: people[1].id,
        companyId: companies[6].id,
        projectId: projects[11].id,
        type: RelationshipType.BOTH,
        notes: 'Client and potential hire for creative position',
      },
    }),

    // Additional candidate relationships
    prisma.relationship.create({
      data: {
        personId: people[3].id,
        companyId: companies[7].id,
        projectId: projects[12].id,
        type: RelationshipType.CANDIDATE,
        notes: 'Logistics background with international experience',
      },
    }),
  ])
  console.log(`✅ Created ${relationships.length} relationships`)

  // Create Message Templates
  console.log('📧 Creating message templates...')
  const emailIntro = await prisma.messageTemplate.create({
    data: {
      name: 'Email - Initial Outreach',
      description: 'First contact email for candidates',
      channel: 'EMAIL',
      subject: 'Exciting opportunity at {{companyName}}',
      body: `Hi {{firstName}},

I hope this message finds you well. I came across your profile and was impressed by your experience.

We're currently working with {{companyName}} who has an opening that might interest you. Would you be open to a brief conversation about this opportunity?

Best regards,
Recruitment Team`,
      category: 'Outreach',
      isActive: true,
    },
  })

  const whatsappFollowup = await prisma.messageTemplate.create({
    data: {
      name: 'WhatsApp - Quick Follow-up',
      description: 'Quick follow-up via WhatsApp',
      channel: 'WHATSAPP',
      body: `Hi {{firstName}}! 👋

Just following up on my previous email. Are you available for a quick chat about the opportunity I mentioned?`,
      category: 'Follow-up',
      isActive: true,
    },
  })

  const emailFinal = await prisma.messageTemplate.create({
    data: {
      name: 'Email - Final Check-in',
      description: 'Final attempt to connect',
      channel: 'EMAIL',
      subject: 'Last call: opportunity at {{companyName}}',
      body: `Hi {{firstName}},

I wanted to reach out one last time about the position at {{companyName}}. If you're not interested at this time, no worries at all!

If you'd like to stay in touch for future opportunities, feel free to let me know.

Best,
Recruitment Team`,
      category: 'Follow-up',
      isActive: true,
    },
  })

  console.log(`✅ Created 3 message templates`)

  // Create Sequence Templates
  console.log('🔄 Creating sequence templates...')
  const fourDaySequence = await prisma.sequenceTemplate.create({
    data: {
      name: '4-Day Candidate Outreach',
      description: 'Multi-channel outreach sequence over 4 days',
      isActive: true,
    },
  })

  const quickFollowup = await prisma.sequenceTemplate.create({
    data: {
      name: 'Quick Follow-up (2-Day)',
      description: 'Fast follow-up sequence for hot leads',
      isActive: true,
    },
  })

  console.log(`✅ Created 2 sequence templates`)

  // Create Sequence Template Steps
  console.log('📝 Creating sequence template steps...')
  // 4-Day Sequence
  await prisma.sequenceTemplateStep.create({
    data: {
      sequenceTemplateId: fourDaySequence.id,
      stepNumber: 1,
      channel: 'EMAIL',
      template: emailIntro.body,
      subject: emailIntro.subject,
      messageTemplateId: emailIntro.id,
      delayDays: 0, // Immediate
    },
  })

  await prisma.sequenceTemplateStep.create({
    data: {
      sequenceTemplateId: fourDaySequence.id,
      stepNumber: 2,
      channel: 'WHATSAPP',
      template: whatsappFollowup.body,
      messageTemplateId: whatsappFollowup.id,
      delayDays: 2, // 2 days after start
    },
  })

  await prisma.sequenceTemplateStep.create({
    data: {
      sequenceTemplateId: fourDaySequence.id,
      stepNumber: 3,
      channel: 'EMAIL',
      template: emailFinal.body,
      subject: emailFinal.subject,
      messageTemplateId: emailFinal.id,
      delayDays: 4, // 4 days after start
    },
  })

  // Quick Follow-up Sequence
  await prisma.sequenceTemplateStep.create({
    data: {
      sequenceTemplateId: quickFollowup.id,
      stepNumber: 1,
      channel: 'EMAIL',
      template: 'Hi {{firstName}}, Quick question about the role at {{companyName}}. Are you available for a chat this week?',
      subject: 'Quick question - {{companyName}}',
      delayDays: 0,
    },
  })

  await prisma.sequenceTemplateStep.create({
    data: {
      sequenceTemplateId: quickFollowup.id,
      stepNumber: 2,
      channel: 'WHATSAPP',
      template: 'Hi {{firstName}}! Did you get a chance to see my email? Would love to connect! 😊',
      delayDays: 1, // 1 day after start
    },
  })

  console.log(`✅ Created 5 sequence template steps`)

  console.log('✨ Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - ${people.length} people`)
  console.log(`   - ${companies.length} companies`)
  console.log(`   - ${projects.length} projects`)
  console.log(`   - ${relationships.length} relationships`)
  console.log(`   - 3 message templates`)
  console.log(`   - 2 sequence templates`)
  console.log(`   - 5 sequence template steps`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
