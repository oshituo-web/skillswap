-- Create exchange_milestones table
CREATE TABLE IF NOT EXISTS exchange_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE exchange_milestones ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view milestones if they are part of the exchange
CREATE POLICY "Users can view milestones for their exchanges"
ON exchange_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM exchanges
    WHERE exchanges.id = exchange_milestones.exchange_id
    AND (exchanges.proposer_id = auth.uid() OR exchanges.receiver_id = auth.uid())
  )
);

-- Policy: Users can create milestones if they are part of the exchange
CREATE POLICY "Users can create milestones for their exchanges"
ON exchange_milestones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exchanges
    WHERE exchanges.id = exchange_milestones.exchange_id
    AND (exchanges.proposer_id = auth.uid() OR exchanges.receiver_id = auth.uid())
  )
);

-- Policy: Users can update milestones if they are part of the exchange
CREATE POLICY "Users can update milestones for their exchanges"
ON exchange_milestones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM exchanges
    WHERE exchanges.id = exchange_milestones.exchange_id
    AND (exchanges.proposer_id = auth.uid() OR exchanges.receiver_id = auth.uid())
  )
);

-- Policy: Users can delete milestones if they are part of the exchange
CREATE POLICY "Users can delete milestones for their exchanges"
ON exchange_milestones FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM exchanges
    WHERE exchanges.id = exchange_milestones.exchange_id
    AND (exchanges.proposer_id = auth.uid() OR exchanges.receiver_id = auth.uid())
  )
);
