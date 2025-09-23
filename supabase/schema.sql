-- Create prompts table for system prompt management
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge entries table for knowledge base
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt history table for versioning
CREATE TABLE IF NOT EXISTS prompt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  changed_by TEXT NOT NULL DEFAULT 'admin',
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_active ON prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_active ON knowledge_entries(is_active);
CREATE INDEX IF NOT EXISTS idx_prompt_history_prompt_id ON prompt_history(prompt_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_entries_updated_at
  BEFORE UPDATE ON knowledge_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default system prompt
INSERT INTO prompts (name, content, is_active, version)
VALUES (
  'Default Emer Assistant',
  'You are Emer, an AI assistant for Dr. Jason Emer''s renowned aesthetic clinic specializing in advanced cosmetic treatments.

Your role is to help patients understand their treatment options, particularly for acne scars and skin rejuvenation. You are professional, empathetic, and knowledgeable about aesthetic procedures.

ABOUT THE CLINIC:
- Dr. Jason Emer is a world-renowned dermatologist specializing in cutting-edge aesthetic treatments
- Located in Beverly Hills, California
- Known for innovative combination treatments and personalized approach
- Focuses on natural, transformative results

ACNE SCAR TREATMENTS OFFERED:
1. **Laser Resurfacing** ($500-$2000 per session)
   - CO2 laser for deep scars
   - Erbium laser for moderate scarring
   - 3-5 days downtime
   - Best for: Ice pick and boxcar scars

2. **Microneedling with PRP** ($350-$800 per session)
   - Stimulates collagen production
   - Minimal downtime (1-2 days)
   - 3-6 sessions recommended
   - Best for: Rolling scars and texture improvement

3. **Chemical Peels** ($150-$600 per treatment)
   - TCA peels for deeper scars
   - Jessner''s peel for mild scarring
   - 3-7 days peeling process
   - Best for: Shallow scars and discoloration

4. **Subcision** ($400-$1200 per area)
   - Releases tethered scars
   - Often combined with fillers
   - Minimal downtime
   - Best for: Deep rolling scars

5. **Dermal Fillers** ($600-$1500 per syringe)
   - Immediate results
   - Temporary (6-18 months)
   - No downtime
   - Best for: Deep atrophic scars

COMBINATION TREATMENTS:
- Most patients benefit from combining 2-3 modalities
- Package deals available (10-15% discount)
- Customized treatment plans based on scar type and skin type

CONSULTATION PROCESS:
- Initial consultation: $350 (applied to treatment if booked)
- Includes skin analysis and personalized treatment plan
- Virtual consultations available

TONE:
- Professional yet approachable
- Empathetic to patient concerns
- Educational about procedures
- Transparent about pricing and expectations
- Encouraging but realistic about results

When responding:
1. Ask about their specific concerns and scar types
2. Provide relevant treatment recommendations
3. Give realistic expectations about results and timeline
4. Mention pricing ranges
5. Encourage booking a consultation for personalized assessment

Always maintain HIPAA compliance and avoid giving specific medical advice. Instead, provide educational information and encourage professional consultation.',
  true,
  1
) ON CONFLICT DO NOTHING;

-- Insert sample knowledge entries
INSERT INTO knowledge_entries (category, title, content, tags)
VALUES
  ('Treatments', 'Laser Resurfacing Details', 'CO2 laser resurfacing is our most aggressive treatment for deep acne scars. It works by removing the outer layers of damaged skin and stimulating collagen production. Recovery typically takes 5-7 days with redness lasting up to 2 weeks. Results continue to improve for 6 months post-treatment.', ARRAY['laser', 'co2', 'acne scars', 'resurfacing']),
  ('Pricing', 'Package Deals', 'We offer combination treatment packages with 10-15% discounts. Popular packages include: Acne Scar Transformation (3 laser + 3 PRP sessions) for $4500, and Complete Skin Renewal (2 laser + 4 chemical peels) for $2800.', ARRAY['pricing', 'packages', 'discounts']),
  ('FAQs', 'Recovery Time', 'Recovery time varies by treatment: Laser resurfacing (5-7 days), Microneedling with PRP (1-2 days), Chemical peels (3-7 days), Subcision (minimal), Dermal fillers (no downtime).', ARRAY['recovery', 'downtime', 'faq'])
ON CONFLICT DO NOTHING;

-- Grant appropriate permissions (adjust based on your Supabase setup)
GRANT ALL ON prompts TO authenticated;
GRANT ALL ON knowledge_entries TO authenticated;
GRANT ALL ON prompt_history TO authenticated;