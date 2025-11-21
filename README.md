# SkillSwap

A full-stack skill exchange platform where users can offer skills they have and request skills they want to learn from other users.

## Features

- 🔐 User authentication (sign up, login)
- 👤 Profile management
- 🎯 Skill listing and management
- 🛒 Skill marketplace
- 🔄 Exchange proposal system
- ✅ Request management (accept/reject)

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Supabase  
**Backend:** Node.js, Express, TypeScript, Supabase  
**Database:** PostgreSQL (Supabase)

## Local Development

### Prerequisites
- Node.js 18+
- Supabase account

### Setup

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/skillswap.git
cd skillswap
```

2. Install dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Configure environment variables

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend** (`backend/.env`):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_key
WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=http://localhost:5173
```

4. Set up database

Run the SQL script in your Supabase SQL editor:
```bash
# See database_setup.sql in the project root
```

5. Run development servers

```bash
# Frontend (in frontend directory)
npm run dev

# Backend (in backend directory)
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000

## Deployment

See [deployment_guide.md](./deployment_guide.md) for detailed Vercel deployment instructions.

## License

MIT
