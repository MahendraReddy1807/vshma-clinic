-- ====================================================================
-- VSHMA CLINIC CRM DATABASE MIGRATION - 20261120110000
-- Module: Conversations, Messages & Provider-Independent Omnichannel Inbox
--
-- Strict Constraints:
-- 1. Decoupled Architecture: Provider type ('meta' | 'green_api') stored alongside
--    provider_message_id, but neither is a primary identifier.
-- 2. Idempotent Deduplication: Unique index on provider_message_id prevents duplicate
--    inbound messages on webhook retries.
-- 3. RLS & Fail-Closed Security: Read/write access strictly limited to authenticated admins.
--
-- DO NOT EXECUTE ON LIVE PRODUCTION WITHOUT EXPLICIT APPROVAL
-- ====================================================================

-- 1. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email')),
  external_chat_id TEXT NOT NULL, -- Normalized E.164 phone or email
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_message_direction TEXT NOT NULL CHECK (last_message_direction IN ('inbound', 'outbound')),
  unread_count INT DEFAULT 0 NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'assigned')),
  assigned_to UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  customer_service_window_expires_at TIMESTAMPTZ, -- Meta 24-hour window tracker
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(patient_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_conversations_patient ON public.conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_chat_id ON public.conversations(external_chat_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_unread ON public.conversations(unread_count);

-- 2. Conversation Messages Table
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_phone TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'staff', 'system')),
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'template', 'quick_reply', 'system')),
  template_name TEXT,
  
  -- Provider-Agnostic External Linkage
  provider_type TEXT NOT NULL DEFAULT 'meta' CHECK (provider_type IN ('meta', 'green_api', 'resend')),
  provider_message_id TEXT, -- e.g. wamid.HBg... or GreenAPI message ID
  idempotency_key TEXT,
  
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- Idempotency and Webhook deduplication indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_messages_provider_id 
  ON public.conversation_messages(provider_message_id) 
  WHERE provider_message_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_messages_idempotency
  ON public.conversation_messages(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversation_messages_thread 
  ON public.conversation_messages(conversation_id, created_at ASC);

-- 3. Row Level Security Policies
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can insert conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can update conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can view messages"
  ON public.conversation_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can insert messages"
  ON public.conversation_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins can update messages"
  ON public.conversation_messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

REVOKE ALL ON public.conversations FROM anon;
REVOKE ALL ON public.conversation_messages FROM anon;

-- 4. Triggers for automated updated_at
DROP TRIGGER IF EXISTS on_conversation_updated ON public.conversations;
CREATE TRIGGER on_conversation_updated
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
