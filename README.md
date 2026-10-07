# University Library Management System

A quiet, editorial, university library web application built with **React.js (Vite, React Router, Tailwind CSS)** and a **Node.js + Express REST API** with SQLite database, JWT authentication, and bcrypt password hashing.

---

## 🏛️ Design System & Direction

Designed with an academic, archival, "university library" atmosphere rather than a generic SaaS dashboard:

- **Color Tokens**:
  - Warm off-white background: `#FAF8F4`
  - Deep green primary: `#1F4D3A`
  - Muted gold accent: `#B8893B`
  - Slate body typography: `#2B2F33`
  - Overdue brick red: `#A83232`
  - Subtle hairline borders: `#E5DFD5`
  - **Zero purple/blue gradients.**
- **Typography Scale**:
  - Headings: `Fraunces` (serif, academic editorial)
  - Body: `DM Sans` (legible, restrained)
  - Scale: 12px (`text-xs`), 14px (`text-sm`), 16px (`text-base`), 20px (`text-xl`), 28px (`text-2xl`), 40px (`text-4xl`)
- **Refactored Reusable Components**:
  - `Button`: Variants (`primary`, `secondary`, `accent`, `ghost`, `danger`, `outline-danger`), sizes (`sm`, `md`, `lg`), max 6px radius.
  - `Badge`: Variants (`available`, `issued`, `overdue`, `department`, `role-*`), dot indicator, no emojis.
  - `DataTable`: Dense tabular ledger, sticky header, subtle dividers, hover highlight, skeleton loader, empty state, and row actions menu.
  - `Modal`: Fraunces serif headings, max 6px radius, full keyboard accessibility (Escape / click-outside).
  - `PageHeader`: Academic section header with title, subtitle, and action buttons.
- **Micro-details**:
  - 8px spacing scale, 6px radius maximum (`rounded-[6px]`), minimal shadows, visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#1F4D3A]`).
  - No emojis anywhere in the user interface.

---

## 🔑 Demo Access Credentials (1-Click Fill on Login Screen)

The login screen features a split layout with a deep green university side panel and 1-click credential buttons:

| Access Tier | Scholar / Staff Name | Institutional Email | Passcode | Department |
|---|---|---|---|---|
| **Admin** | Prof. Rajeshwari Sen | `admin@library.com` | `admin123` | University Administration / Library Director |
| **Librarian** | Dr. Savitri Venkataraman | `savitri.librarian@library.com` | `lib123` | Chief Librarian (Circulation & Reference) |
| **Librarian** | Karthik Ramanathan | `karthik.librarian@library.com` | `lib123` | Reference Librarian |
| **Scholar (CS)** | Aarav Sharma | `aarav.sharma@university.edu` | `student123` | Computer Science |
| **Scholar (EE)** | Priya Patel | `priya.patel@university.edu` | `student123` | Electrical & Electronics |
| **Scholar (ME)** | Rohan Iyer | `rohan.iyer@university.edu` | `student123` | Mechanical Engineering |
| **Scholar (Econ)** | Ananya Deshmukh | `ananya.deshmukh@university.edu` | `student123` | Economics & Management |
| **Scholar (Math)** | Aditya Verma | `aditya.verma@university.edu` | `student123` | Mathematics & Computing |

---

## 📚 General Stacks & Departmental Holdings

Holdings include classical university textbooks and monographs:
- **Computer Science**: Cormen CLRS *Algorithms (4th Ed)*, Arpaci-Dusseau *Operating Systems: Three Easy Pieces*, Aho *Compilers (Dragon Book)*, Silberschatz *Database System Concepts*
- **Electrical & Electronics**: Oppenheim *Signals & Systems*, Ogata *Modern Control Engineering*, Sedra & Smith *Microelectronic Circuits*
- **Mechanical Engineering**: Meriam & Kraige *Engineering Mechanics*, Van Wylen *Classical Thermodynamics*, Shigley *Theory of Machines*
- **Civil Engineering**: Punmia *Soil Mechanics & Foundations*, Subramanian *Design of Reinforced Concrete*
- **Economics & Management**: Mankiw *Principles of Economics*, Prasanna Chandra *Financial Management*
- **Mathematics & Computing**: B.S. Grewal *Higher Engineering Mathematics*, Strang *Linear Algebra*, Bartle *Real Analysis*
- **Literature & Philosophy**: Nehru *The Discovery of India*, Chatterjee & Datta *Indian Philosophy*, R.K. Narayan *Malgudi Days*

---

## 🚀 Local Development

```bash
# Backend (Port 5000)
cd backend
npm install
node server.js

# Frontend (Port 5173)
cd frontend
npm install
npm run dev
```
Navigate to **http://localhost:5173** to view the application.
