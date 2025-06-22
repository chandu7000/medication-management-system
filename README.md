# MedsBuddy - Medication Management System

A comprehensive medication management application designed for both patients and caretakers to track medication schedules, monitor adherence, and manage healthcare routines effectively.

## Features

### Phase 1 (Implemented)
- **User Authentication**: Secure login and registration with SQLite database
- **Role-based Dashboards**: Separate interfaces for patients and caretakers
- **Medication Management**: Complete CRUD operations for medications
- **Adherence Tracking**: Real-time adherence rate calculations
- **Daily Medication Tracking**: Mark medications as taken with date tracking

### Core Functionality
- **Patient Dashboard**: 
  - View today's medications
  - Track adherence rates
  - Mark medications as taken
  - View all medications with status
- **Caretaker Dashboard**: 
  - Overview of patient statistics
  - Activity monitoring
  - Patient management interface (coming soon)

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Query** - Server state management and caching
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation

## Project Structure

```
medication-management-system/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── test/           # Test files
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── database/           # Database initialization
│   ├── middleware/         # Express middleware
│   ├── routes/            # API route handlers
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medication-management-system
   ```

2. **Install dependencies for all packages**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend development server on `http://localhost:5173`
   - Backend API server on `http://localhost:5000`

### Alternative: Start servers individually

**Frontend only:**
```bash
cd frontend
npm install
npm run dev
```

**Backend only:**
```bash
cd backend
npm install
npm run dev
```

## Running Tests

Run the frontend test suite:
```bash
cd frontend
npm run test
```

The test suite includes:
- Component rendering tests
- User interaction tests
- API service tests

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - 'patient' or 'caretaker'
- `created_at`, `updated_at` - Timestamps

### Medications Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Medication name
- `dosage` - Dosage information
- `frequency` - How often to take
- `instructions` - Optional instructions
- `created_at`, `updated_at` - Timestamps

### Medication Logs Table
- `id` - Primary key
- `medication_id` - Foreign key to medications
- `user_id` - Foreign key to users
- `taken_date` - Date medication was taken
- `taken_at` - Timestamp when marked as taken

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation with express-validator
- **SQL Injection Prevention**: Parameterized queries
- **Rate Limiting**: API rate limiting middleware
- **CORS Protection**: Configured CORS policies
- **Helmet Security**: Security headers middleware

## Design Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional interface with smooth animations
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Comprehensive loading and error state handling
- **Form Validation**: Real-time client-side validation with error messages

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Medications
- `GET /api/medications` - Get user's medications
- `POST /api/medications` - Create new medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication
- `POST /api/medications/:id/taken` - Mark as taken
- `GET /api/medications/adherence` - Get adherence stats

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activity` - Recent activity

## Future Enhancements (Phase 2 & 3)

### Phase 2
- Real-time updates with WebSockets
- Advanced adherence tracking and analytics
- Patient-caretaker relationship management

### Phase 3
- Photo upload for medication proof
- Push notifications
- Deployment to cloud platforms
- Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs
4. Provide system information (OS, Node.js version, etc.)

## Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icon set
- Express.js community for the robust backend framework