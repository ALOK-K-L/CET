'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Type for the chart data coming from the client
type ChartData = Record<number, Record<string, {
  pocket_depth?: number;
  recession?: number;
  bleeding?: boolean;
  is_missing?: boolean;
  is_correction?: boolean;
}>>;

type MissingTeeth = number[];

export async function saveExamination(chartData: ChartData, missingTeeth: MissingTeeth, patientId: string) {
  const patient = await db.patient.findUnique({
    where: { id: patientId }
  });

  if (!patient) {
    throw new Error('Selected patient not found');
  }

  // Create a new examination
  const examination = await db.examination.create({
    data: {
      patientId: patient.id,
      provider: 'Dr. Voice AI',
      status: 'completed',
    }
  });

  // Build measurement records from chart data
  const measurements: {
    examinationId: string;
    toothNumber: number;
    site: string;
    pocketDepth: number | null;
    recession: number | null;
    bleeding: boolean;
    isMissing: boolean;
    isCorrection: boolean;
  }[] = [];

  // Insert site-level measurements
  for (const [toothNumStr, sites] of Object.entries(chartData)) {
    const toothNumber = Number(toothNumStr);
    for (const [site, data] of Object.entries(sites)) {
      measurements.push({
        examinationId: examination.id,
        toothNumber,
        site,
        pocketDepth: data.pocket_depth ?? null,
        recession: data.recession ?? null,
        bleeding: data.bleeding ?? false,
        isMissing: false,
        isCorrection: data.is_correction ?? false,
      });
    }
  }

  // Insert missing teeth (no site data, just the flag)
  for (const toothNumber of missingTeeth) {
    // Only add if not already covered by a site measurement
    const alreadyCovered = measurements.some(m => m.toothNumber === toothNumber);
    if (!alreadyCovered) {
      measurements.push({
        examinationId: examination.id,
        toothNumber,
        site: 'facial', // default site for missing flag
        pocketDepth: null,
        recession: null,
        bleeding: false,
        isMissing: true,
        isCorrection: false,
      });
    }
  }

  // Bulk create all measurements
  if (measurements.length > 0) {
    await db.measurement.createMany({ data: measurements });
  }

  // Return the saved examination with counts
  const savedExam = await db.examination.findUnique({
    where: { id: examination.id },
    include: {
      _count: { select: { measurements: true } },
      patient: true,
    }
  });

  revalidatePath('/');

  return {
    examinationId: savedExam!.id,
    patientName: `${savedExam!.patient.firstName} ${savedExam!.patient.lastName}`,
    measurementCount: savedExam!._count.measurements,
    date: savedExam!.date.toISOString(),
  };
}

export async function getRecentExaminations() {
  return db.examination.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      patient: true,
      _count: { select: { measurements: true } },
    }
  });
}

export async function getExaminationById(id: string) {
  return db.examination.findUnique({
    where: { id },
    include: {
      patient: true,
      measurements: true,
    }
  });
}

// ── Patient Records Actions ──────────────────────────────────────────

export async function getPatientRecords(patientId: string) {
  return db.patientRecord.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createPatientRecord(patientId: string, name: string, type: string, content: string) {
  const record = await db.patientRecord.create({
    data: {
      patientId,
      name,
      type,
      content,
    }
  });
  
  revalidatePath('/patient/upload');
  revalidatePath('/patient');
  return record;
}

export async function deletePatientRecord(recordId: string) {
  await db.patientRecord.delete({
    where: { id: recordId }
  });
  revalidatePath('/patient/upload');
  revalidatePath('/patient');
  return true;
}

// ── File Sharing Actions ──────────────────────────────────

export async function grantDoctorAccess(patientId: string, doctorPin: string, accessType: 'ongoing' | 'snapshot' = 'ongoing') {
  // Find doctor by checking if their ID starts with the PIN (case-insensitive not easily supported without raw query, so we enforce lowercase PIN)
  const doctors = await db.doctor.findMany();
  const doctor = doctors.find(d => d.id.startsWith(doctorPin.toLowerCase()));

  if (!doctor) {
    throw new Error('Invalid Doctor PIN. No matching doctor found.');
  }

  // Check if access already granted
  const existingLog = await db.patientRecord.findFirst({
    where: {
      patientId,
      type: { in: ['access_log', 'access_log_snapshot'] },
      content: doctor.id
    }
  });

  if (existingLog) {
    throw new Error('Access has already been granted to this doctor.');
  }

  // Create the persistent access log
  await db.patientRecord.create({
    data: {
      patientId: patientId,
      type: accessType === 'snapshot' ? 'access_log_snapshot' : 'access_log',
      name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      content: doctor.id,
    }
  });

  return doctor.id;
}

export async function getDoctorPatients(doctorId: string) {
  // Find all access logs for this doctor
  const logs = await db.patientRecord.findMany({
    where: {
      type: { in: ['access_log', 'access_log_snapshot'] },
      content: doctorId,
    },
    include: {
      patient: true,
    }
  });

  if (logs.length === 0) return [];

  // Get unique patient details and access info
  const patientMap = new Map();
  for (const log of logs) {
    if (log.patient) {
      patientMap.set(log.patientId, {
        ...log.patient,
        accessedAt: log.createdAt,
        accessType: log.type === 'access_log_snapshot' ? 'snapshot' : 'ongoing',
      });
    }
  }

  return Array.from(patientMap.values());
}

export async function revokeDoctorAccess(patientId: string, doctorId: string) {
  // Find the access log that links this doctor to this patient
  const record = await db.patientRecord.findFirst({
    where: {
      patientId,
      type: { in: ['access_log', 'access_log_snapshot'] },
      content: doctorId
    }
  });

  if (!record) {
    throw new Error('Access record not found.');
  }

  await db.patientRecord.delete({
    where: { id: record.id }
  });

  return true;
}

export async function getPatientAccessHistory(patientId: string) {
  const logs = await db.patientRecord.findMany({
    where: {
      patientId,
      type: { in: ['access_log', 'access_log_snapshot'] }
    },
    orderBy: { createdAt: 'desc' }
  });
  return logs;
}

// ── Auth Actions ──────────────────────────────────────────

export async function authenticateUser(role: 'doctor' | 'patient', email: string, password: string) {
  if (role === 'patient') {
    const patient = await db.patient.findUnique({ where: { email } });
    if (!patient || patient.password !== password) {
      throw new Error('Invalid credentials');
    }
    return { role: 'patient', patientId: patient.id };
  } else if (role === 'doctor') {
    const doctor = await db.doctor.findUnique({ where: { email } });
    if (!doctor || doctor.password !== password) {
      throw new Error('Invalid credentials');
    }
    return { role: 'doctor', doctorId: doctor.id };
  }
  throw new Error('Invalid role');
}

export async function signupUser(role: 'doctor' | 'patient', firstName: string, lastName: string, email: string, password: string) {
  if (role === 'patient') {
    const existing = await db.patient.findUnique({ where: { email } });
    if (existing) throw new Error('Email already in use');
    
    const patient = await db.patient.create({
      data: { firstName, lastName, email, password }
    });
    return { role: 'patient', patientId: patient.id };
  } else if (role === 'doctor') {
    const existing = await db.doctor.findUnique({ where: { email } });
    if (existing) throw new Error('Email already in use');
    
    const doctor = await db.doctor.create({
      data: { firstName, lastName, email, password }
    });
    return { role: 'doctor', doctorId: doctor.id };
  }
  throw new Error('Invalid role');
}

export async function getAllPatients() {
  return db.patient.findMany({
    orderBy: { lastName: 'asc' },
    select: { id: true, firstName: true, lastName: true, email: true }
  });
}

export async function createPatientQuick(firstName: string, lastName: string) {
  const patient = await db.patient.create({
    data: { firstName, lastName }
  });
  revalidatePath('/doctor/charting');
  return patient;
}

export async function updatePatient(patientId: string, data: { firstName?: string; lastName?: string; email?: string }) {
  const updated = await db.patient.update({
    where: { id: patientId },
    data
  });
  revalidatePath('/doctor/patients');
  revalidatePath('/doctor/charting');
  return updated;
}
