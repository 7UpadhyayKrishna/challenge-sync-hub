-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  category TEXT,
  difficulty TEXT DEFAULT 'Beginner',
  daily_tasks JSONB NOT NULL DEFAULT '[]',
  reference_photo_url TEXT,
  photo_visibility TEXT DEFAULT 'private' CHECK (photo_visibility IN ('public', 'private')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_challenges_creator FOREIGN KEY (creator_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  daily_progress JSONB NOT NULL DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_participants_challenge FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE,
  CONSTRAINT fk_participants_user FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_participant_challenge UNIQUE(challenge_id, user_id)
);

-- Create daily progress photos table
CREATE TABLE public.daily_progress_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_progress_photos_participant FOREIGN KEY (participant_id) REFERENCES public.challenge_participants(id) ON DELETE CASCADE,
  CONSTRAINT unique_daily_photo UNIQUE(participant_id, day_number)
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress_photos ENABLE ROW LEVEL SECURITY;

-- Challenges policies
CREATE POLICY "Anyone can view active challenges" 
ON public.challenges 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create their own challenges" 
ON public.challenges 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own challenges" 
ON public.challenges 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- Participants policies
CREATE POLICY "Anyone can view challenge participants" 
ON public.challenge_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join challenges" 
ON public.challenge_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
ON public.challenge_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Daily progress photos policies
CREATE POLICY "Users can view public progress photos and their own" 
ON public.daily_progress_photos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participants cp
    JOIN public.challenges c ON cp.challenge_id = c.id
    WHERE cp.id = participant_id 
    AND (c.photo_visibility = 'public' OR cp.user_id = auth.uid())
  )
);

CREATE POLICY "Users can upload their own progress photos" 
ON public.daily_progress_photos 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.challenge_participants cp
    WHERE cp.id = participant_id AND cp.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for challenge photos
INSERT INTO storage.buckets (id, name, public) VALUES ('challenge-photos', 'challenge-photos', true);

-- Storage policies for challenge photos
CREATE POLICY "Anyone can view challenge photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'challenge-photos');

CREATE POLICY "Authenticated users can upload challenge photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'challenge-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'challenge-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for live updates
ALTER TABLE public.challenges REPLICA IDENTITY FULL;
ALTER TABLE public.challenge_participants REPLICA IDENTITY FULL;
ALTER TABLE public.daily_progress_photos REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_progress_photos;