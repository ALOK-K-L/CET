# LUMIERE: Hands-Free Periodontal Charting

### **DSOLVE 2026** · DRISHTI · College of Engineering Trivandrum (CET)

**BUILD. SOLVE. DEMONSTRATE.**

|                   |                                           |
| ----------------- | ----------------------------------------- |
| **Problem:**      | Periodontal Charting Automation           |
| **Team Name:**    | NORE                                      |
| **Team Members:** | ALOK K L · Ram Madhav M · Shreya Sunu · Divya S |
| **Institution:**  | College of Engineering Trivandrum (CET)   |
| **Live Demo:**    | [Demo link goes here]                     |
| **Pitch Video:**  | [Social media pitch video link]           |

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage / Demo Script](#usage--demo-script)
- [Limitations & Future Scope](#limitations--future-scope)
- [Team](#team)

---

## Problem Statement

> **7: Real-Time Clinical Measurement**
> Develop a real-time or near-real-time voice solution that enables dental professionals to capture and record clinical measurements with minimal delay.
> 
> The solution should process spoken measurements such as pocket depth, bleeding, recession, and other periodontal findings, converting them into structured data and reflecting them in the application almost instantly. It should explore ways to combine speech recognition, rule-based processing, and AI while handling corrections, repeated measurements, and natural variations in speech.
> 
> The goal is to reduce processing latency and manual data entry, creating a fast, seamless, hands-free clinical documentation experience.

### Why this matters

By automating the scribe process, dentists can perform comprehensive periodontal exams entirely hands-free and independently. This reduces costs, eliminates cross-contamination risks, and streamlines the workflow for faster patient throughput.

---

## Our Solution

LUMIERE is a fully hands-free AI scribe tailored for periodontal charting. It listens to the doctor's dictation in real-time using Google's Gemini Live API, interprets complex dental terminology, and instantly updates a visual Odontogram interface. 

What makes it different:
- **Resilient Parsing:** Handles rapid dictation, homophones (e.g., "tooth for" = Tooth 4), and speech-to-text mishearings.
- **Smart Corrections:** Doctors can verbally correct mistakes ("Tooth 4 is not bleeding"), and the system instantly updates the state.
- **Batch Commands:** Capable of filling out remaining healthy teeth instantly.
- **Audio Feedback:** The AI provides immediate verbal confirmation of recorded measurements.
- **QR Code Handoff:** Patients can easily share their prior medical records via a secure QR code scan.

---

## Key Features

- **🎙️ Real-time Audio Streaming:** Uses Web Audio API and Gemini Live for continuous zero-latency dictation.
- **🦷 Interactive Odontogram:** Live visualization of bleeding, deep pockets, and missing teeth.
- **🧠 Clinical Scribe AI:** Maps conversational speech to structured dental data using function calling.
- **🔊 Voice Confirmations:** Audible feedback generated directly by Gemini to confirm data entry.
- **📱 Patient Portal:** Patients can upload their records (PDFs/Images) and grant access to the doctor via QR Code.
- **💾 Database Integration:** Saves charting sessions to PostgreSQL, allowing doctors to print or download reports later.

---

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Next.js App Router (Server Actions)
- **Database:** PostgreSQL with Prisma ORM
- **AI Integration:** Google Gemini 2.5 Flash Native Audio (Live API via WebSockets)
- **UI Components:** Lucide React, react-odontogram

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ALOK-K-L/CET.git
   cd CET/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables (`.env`):
   ```env
   DATABASE_URL="your_postgresql_url"
   NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key"
   ```

4. Run Database Migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the Development Server:
   ```bash
   npm run dev
   ```

---

## Usage / Demo Script

1. **Patient Sharing:** Open the Patient App, upload a sample record, and generate the QR code.
2. **Doctor Setup:** Open the Doctor App, click "Scan QR", and simulate the data transfer.
3. **Voice Charting:** Click "Start Exam" in the Charting Dashboard.
4. **Dictate:** Say *"Tooth 4 facial bleeding"* or *"Tooth 8 deep pocket 5 millimeters"*.
5. **Corrections:** Say *"Actually, tooth 4 is not bleeding"*.
6. **Batch Fill:** Click the "Fill Remaining Normal" button to complete the exam.
7. **Save & Review:** Click "Save to DB", then view the final report in the Database section.

---

## Limitations & Future Scope

- **Background Noise:** In a loud clinical environment, the browser's speech recognition can struggle. Future versions will bypass the browser entirely and send raw audio bytes straight to Gemini for transcription.
- **Complex Notations:** Currently handles basic Perio measurements. Future scope includes Restorative charting (fillings, crowns, bridges).
- **EHR Integration:** Plan to support HL7 FHIR standards for exporting data directly to Dentrix or Epic.

---

## Team

- **ALOK K L** - Team Lead
- **Ram Madhav M**
- **Shreya Sunu**
- **Divya S**
