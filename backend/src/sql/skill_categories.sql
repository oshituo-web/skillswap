-- =====================================================
-- SKILL CATEGORIES
-- Add categories for better skill organization
-- =====================================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add category_id to skills table
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Add proficiency_level to skills table
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced'));

-- Seed categories
INSERT INTO categories (name, description, icon) VALUES
    ('technology', 'Technology & Programming', '💻'),
    ('languages', 'Languages', '🗣️'),
    ('arts', 'Arts & Crafts', '🎨'),
    ('music', 'Music & Performance', '🎵'),
    ('sports', 'Sports & Fitness', '⚽'),
    ('business', 'Business & Finance', '💼'),
    ('cooking', 'Cooking & Culinary', '🍳'),
    ('other', 'Other', '📚')
ON CONFLICT (name) DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_level ON skills(proficiency_level);
