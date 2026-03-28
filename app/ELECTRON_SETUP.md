# Dental App - Electron Configuration Guide

## Setup Instructions for Electron Development

### 1. Install Dependencies (if not already done)
```bash
cd c:\xampp\htdocs\Dental_App\app
pnpm install
```

### 2. Start Backend Server (in a separate terminal)
```bash
cd c:\xampp\htdocs\Dental_App\dental-backend
php artisan serve --host=localhost --port=8000
```

### 3. Make sure database is migrated
```bash
cd c:\xampp\htdocs\Dental_App\dental-backend
php artisan migrate:fresh --seed
```

### 4. Run Electron Development Mode
```bash
cd c:\xampp\htdocs\Dental_App\app
pnpm run dev:electron
```

This command:
- Starts the Vite dev server on `http://localhost:5173`
- Launches the Electron application that loads the dev server
- Enables live hot module replacement (HMR)

### 5. Keyboard Shortcuts in Electron
- **Ctrl+Shift+I** - Toggle Developer Tools
- **F12** - Toggle Developer Tools

## Responsive Design Features

The application is fully responsive with:

### Breakpoints (from Tailwind CSS)
- **sm**: 640px
- **md**: 768px  
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Implemented Responsive Behavior
- Sidebar collapses on smaller screens (mobile-first)
- Grid layouts adapt: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Cards and components use flexible sizing
- Tables and lists are touch-friendly
- Navigation adapts for different screen sizes

## Window Configuration
- **Default Size**: 1400x900px
- **Minimum Size**: 800x600px
- **Resizable**: Yes
- The window size automatically adapts to user preferences

## Building for Production
```bash
cd c:\xampp\htdocs\Dental_App\app
pnpm run build
```

This creates an optimized build in the `dist` folder that Electron will load when packaged.

## Troubleshooting

### Port 5173 already in use
Kill the process using port 5173:
```bash
# Windows PowerShell
Get-Process | Where-Object {$_.Handles -eq "5173"} | Stop-Process -Force
```

### Module not found errors
Run:
```bash
pnpm install
pnpm run build
```

### Electron won't start
- Check if backend is running on port 8000
- Check if Vite dev server started on port 5173
- Try clearing cache: `pnpm install && pnpm run build`

### Responsive issues
- Press F12 to open DevTools
- Use Chrome DevTools responsive design mode
- Test different window sizes by resizing the window

## Features

✅ Fully responsive design  
✅ Mobile-first approach  
✅ Touch-friendly interface  
✅ Auto-scaling for any screen size  
✅ Integrated authentication  
✅ Real-time notifications  
✅ API integration with Laravel backend  
✅ Database persistence  
