# 🦷 Cabinet Dentaire - Electron Desktop Application

A fully responsive dental practice management application built with React, Electron, and Tailwind CSS.

## ✨ Features

- ✅ **Fully Responsive** - Works on desktop, tablet, and mobile windows
- ✅ **Real-time Sync** - Data synchronizes across all connected clients
- ✅ **Multi-role Support** - Doctor, Receptionist, Patient interfaces
- ✅ **Appointment Management** - Schedule and manage patient appointments
- ✅ **Patient Database** - Complete patient information management
- ✅ **Document Generation** - Create prescriptions, certificates, invoices, quotes
- ✅ **Notifications** - Real-time notifications for staff
- ✅ **Pharmacy Locator** - Find nearby pharmacies on interactive maps
- ✅ **Dark Mode Ready** - Professional UI with customizable themes

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ (with npm/pnpm)
- **PHP 8.0+** (for backend)
- **MySQL 5.7+** (for database)
- **XAMPP** (recommended for local development)

### Option 1: Using Batch Script (Windows)
```bash
cd c:\xampp\htdocs\Dental_App\app
./START_ELECTRON.bat
```

### Option 2: Using PowerShell Script (Windows)
```powershell
cd c:\xampp\htdocs\Dental_App\app
powershell -ExecutionPolicy Bypass -File .\START_ELECTRON.ps1
```

### Option 3: Manual Start
```bash
# Terminal 1: Start Backend
cd c:\xampp\htdocs\Dental_App\dental-backend
php artisan serve --host=localhost --port=8000

# Terminal 2: Start Frontend (in app folder)
cd c:\xampp\htdocs\Dental_App\app
pnpm install
pnpm run dev:electron
```

## 📱 Responsive Breakpoints

The application is built with mobile-first responsive design:

| Breakpoint | Width | Device |
|-----------|-------|--------|
| sm | 640px | Mobile |
| md | 768px | Tablet |
| lg | 1024px | Laptop |
| xl | 1280px | Desktop |
| 2xl | 1536px | Large Desktop |

**Electron Window:**
- Default: 1400×900px
- Minimum: 800×600px
- Resizable: ✅ Yes

## 📂 Project Structure

```
Dental_App/
├── app/                      # Electron + React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (Dashboard, Appointments, etc)
│   │   ├── services/         # API services
│   │   ├── context/          # React context (DataSyncContext)
│   │   ├── lib/              # Utilities and validators
│   │   └── types/            # TypeScript types
│   ├── main.cjs              # Electron main process
│   ├── preload.cjs           # Electron preload script
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS config
│   └── index.html            # Entry HTML file
│
└── dental-backend/           # Laravel Backend API
    ├── app/
    │   ├── Models/           # Database models
    │   ├── Http/
    │   │   ├── Controllers/  # API controllers
    │   │   └── Requests/     # Request validation
    │   └── Providers/        # Service providers
    ├── database/
    │   ├── migrations/       # Database schema
    │   └── seeders/          # Database seeding
    ├── routes/
    │   └── api.php           # API routes
    └── .env                  # Environment configuration
```

## 🔧 Development

### Install Dependencies
```bash
cd app
pnpm install
```

### Development Mode
```bash
pnpm run dev:electron
```

### Build for Production
```bash
pnpm run build
```

### Code Quality
```bash
# Lint code
pnpm run lint

# Format code
pnpm run format
```

## 🎨 Responsive Design Implementation

### CSS Grid Examples
```tsx
// Adapts from 1 column on mobile to 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Flexbox Examples
```tsx
// Stack vertically on mobile, horizontal on larger screens
<div className="flex flex-col md:flex-row gap-4">
```

### Sidebar Toggle (Built-in)
- Sidebar is always visible on desktop
- Mobile view uses hamburger menu (expandable)
- Touch-friendly navigation buttons

## 🔐 Security Features

- ✅ Context isolation enabled in Electron
- ✅ Node integration disabled
- ✅ Preload script for secure API exposure
- ✅ CORS headers configured
- ✅ Laravel request validation
- ✅ Input sanitization
- ✅ SQL injection prevention

## 📊 API Integration

Backend API running on `http://localhost:8000/api`

### Main Endpoints
- `/api/patients` - Patient management
- `/api/rendez_vous` - Appointments
- `/api/traitements` - Treatments/Services
- `/api/documents` - Medical documents
- `/api/notifications` - Real-time notifications
- `/api/dentistes` - Dentist profiles
- `/api/secretaires` - Receptionist profiles

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 5173
Get-Process | Where-Object {$_.Name -eq 'node'} | Stop-Process -Force
```

### Module Not Found
```bash
pnpm install
pnpm run build
```

### Backend Connection Failed
- Verify backend is running: `php artisan serve --host=localhost --port=8000`
- Check `.env` file for correct API_URL
- Verify MySQL database is running

### Electron Window Won't Open
- Check if port 5173 is accessible
- Look for errors in the browser console (F12)
- Try clearing pnpm cache: `pnpm store prune`

## 📚 Documentation Files

- [ELECTRON_SETUP.md](./ELECTRON_SETUP.md) - Detailed Electron configuration
- [SECURITY.md](../SECURITY.md) - Security implementation details
- [PASSWORD_RESET_FEATURE.md](../PASSWORD_RESET_FEATURE.md) - Password reset flow

## 🌐 Browser Support

- ✅ Electron (all versions 33+)
- ✅ Chrome/Chromium-based browsers
- ✅ Edge
- ✅ Modern Firefox

## 📝 Environment Variables

### Frontend (.env in app folder)
```env
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env in dental-backend folder)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=dental_db
DB_USERNAME=root
DB_PASSWORD=

APP_URL=http://localhost:8000
```

## 🎓 Development Tips

1. **Hot Module Replacement (HMR)**: Changes are reflected instantly in Electron
2. **DevTools**: Access via F12 or Ctrl+Shift+I
3. **Inspector**: Built-in React DevTools extension support
4. **Responsiveness**: Resize the Electron window to test different breakpoints

## 📦 Build & Deployment

### Development Build
```bash
pnpm run build
```

### Production Build with Electron Packager
```bash
pnpm run build
electron-builder
```

## 💡 Tips for Best Performance

- Build with `pnpm run build` before testing production
- Use the responsive design menu in DevTools to test all breakpoints
- Clear cache if CSS changes don't appear: `Ctrl+Shift+R`
- Test on actual devices/window sizes for best validation

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console (F12)
3. Check backend logs: `storage/logs/laravel.log`
4. Verify all services are running

---

**Last Updated**: March 28, 2026  
**Version**: 1.0.0  
**License**: MIT
