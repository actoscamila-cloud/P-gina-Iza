-- Database Schema for Vertus University

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Hashed password
    role VARCHAR(50) NOT NULL DEFAULT 'CONSULTOR',
    points INTEGER DEFAULT 0,
    progress FLOAT DEFAULT 0,
    avatar TEXT,
    clinic_id VARCHAR(100),
    phone VARCHAR(50),
    bio TEXT,
    theme VARCHAR(50),
    streak INTEGER DEFAULT 0,
    last_login_date TIMESTAMP WITH TIME ZONE,
    theme_mode VARCHAR(10) DEFAULT 'dark',
    level INTEGER DEFAULT 1,
    prestige VARCHAR(100),
    weekly_points JSONB DEFAULT '[]'::jsonb,
    completed_module_ids JSONB DEFAULT '[]'::jsonb,
    badges JSONB DEFAULT '[]'::jsonb,
    certificates JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tracks Table
CREATE TABLE IF NOT EXISTS tracks (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail TEXT,
    icon VARCHAR(50),
    type VARCHAR(50) DEFAULT 'TRACK',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Modules Table
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(100) PRIMARY KEY,
    track_id VARCHAR(100) REFERENCES tracks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    thumbnail TEXT,
    video_url TEXT,
    video_data TEXT,
    points INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(100) PRIMARY KEY,
    module_id VARCHAR(100) REFERENCES modules(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_option_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Objections Table
CREATE TABLE IF NOT EXISTS objections (
    id VARCHAR(100) PRIMARY KEY,
    trigger VARCHAR(255) NOT NULL,
    reason TEXT,
    expert_view TEXT,
    rapport_response TEXT,
    consultative_response TEXT,
    authority_response TEXT,
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_avatar TEXT,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(100) PRIMARY KEY,
    session_id VARCHAR(100) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL, -- 'user' or 'ai'
    text TEXT NOT NULL,
    image TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Badges Table
CREATE TABLE IF NOT EXISTS badges (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL
);

-- User Badges Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_badges (
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    badge_id VARCHAR(100) REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(100) PRIMARY KEY,
    track_id VARCHAR(100) REFERENCES tracks(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    points_threshold INTEGER,
    code VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Certificates Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_certificates (
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    certificate_id VARCHAR(100) REFERENCES certificates(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, certificate_id)
);

-- User Completed Modules Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_completed_modules (
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    module_id VARCHAR(100) REFERENCES modules(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, module_id)
);

-- Daily Challenges Table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id VARCHAR(100) PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    points INTEGER DEFAULT 50,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- App Config Table (Singleton-ish)
CREATE TABLE IF NOT EXISTS app_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    ai_prompt TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
