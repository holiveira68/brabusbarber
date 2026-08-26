// Popula o banco com dados de exemplo para facilitar a demonstração do projeto.
// Rode com: npm run prisma:seed

import { PrismaClient, Role, Service } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const senhaPadrao = await bcrypt.hash('123456', 10);

  // --- Admin ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brabusbarber.com' },
    update: {},
    create: {
      name: 'Helder Oliveira',
      email: 'admin@brabusbarber.com',
      password: senhaPadrao,
      role: Role.ADMIN,
      phone: '(12) 99999-0001',
    },
  });

  // --- Barbeiros ---
  const barbeiro1User = await prisma.user.upsert({
    where: { email: 'marcello@brabusbarber.com' },
    update: {},
    create: {
      name: 'Marcello Gomes',
      email: 'marcello@brabusbarber.com',
      password: senhaPadrao,
      role: Role.BARBEIRO,
      phone: '(12) 99999-0002',
    },
  });

  const barbeiro2User = await prisma.user.upsert({
    where: { email: 'larissa@brabusbarber.com' },
    update: {},
    create: {
      name: 'Larissa Procopio',
      email: 'larissa@brabusbarber.com',
      password: senhaPadrao,
      role: Role.BARBEIRO,
      phone: '(12) 99999-0003',
    },
  });

  const barbeiro1 = await prisma.barberProfile.upsert({
    where: { userId: barbeiro1User.id },
    update: {},
    create: {
      userId: barbeiro1User.id,
      bio: 'Especialista em cortes degradê e navalhado, 8 anos de experiência.',
      specialties: 'Corte, Degradê, Barba',
    },
  });

  const barbeiro2 = await prisma.barberProfile.upsert({
    where: { userId: barbeiro2User.id },
    update: {},
    create: {
      userId: barbeiro2User.id,
      bio: 'Referência em barboterapia e desenhos personalizados.',
      specialties: 'Barba, Sobrancelha, Barboterapia',
    },
  });

  // --- Cliente de teste ---
  await prisma.user.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      name: 'João Cliente',
      email: 'cliente@teste.com',
      password: senhaPadrao,
      role: Role.CLIENTE,
      phone: '(12) 99999-0004',
    },
  });

  // --- Serviços ---
  const servicosData = [
    { name: 'Corte Masculino', description: 'Corte tradicional ou degradê', price: 45, durationMinutes: 40 },
    { name: 'Barba', description: 'Aparar e desenhar a barba com navalha', price: 35, durationMinutes: 30 },
    { name: 'Combo Corte + Barba', description: 'Corte completo + barba', price: 70, durationMinutes: 60 },
    { name: 'Sobrancelha', description: 'Design de sobrancelha na navalha', price: 15, durationMinutes: 15 },
    { name: 'Barboterapia', description: 'Hidratação e massagem facial', price: 50, durationMinutes: 45 },
  ];

  const servicosCriados: Service[] = [];
  for (const s of servicosData) {
    const service = await prisma.service.upsert({
      where: { id: servicosData.indexOf(s) + 1 },
      update: {},
      create: s,
    });
    servicosCriados.push(service);
  }

  // --- Vincula serviços aos barbeiros ---
  for (const service of servicosCriados) {
    await prisma.serviceOnBarber.upsert({
      where: { barberId_serviceId: { barberId: barbeiro1.id, serviceId: service.id } },
      update: {},
      create: { barberId: barbeiro1.id, serviceId: service.id },
    });
    await prisma.serviceOnBarber.upsert({
      where: { barberId_serviceId: { barberId: barbeiro2.id, serviceId: service.id } },
      update: {},
      create: { barberId: barbeiro2.id, serviceId: service.id },
    });
  }

  // --- Horários de trabalho: terça a sábado, 09:00 às 19:00 ---
  for (const barber of [barbeiro1, barbeiro2]) {
    for (const weekday of [2, 3, 4, 5, 6]) {
      await prisma.workingHour.upsert({
        where: { barberId_weekday: { barberId: barber.id, weekday } },
        update: {},
        create: { barberId: barber.id, weekday, startTime: '09:00', endTime: '19:00' },
      });
    }
  }

  console.log('✅ Seed concluído!');
  console.log('   Admin:    admin@brabusbarber.com / 123456');
  console.log('   Barbeiro: lucas@brabusbarber.com / 123456');
  console.log('   Cliente:  cliente@teste.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
