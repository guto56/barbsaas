/// <reference lib="deno.ns" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, date, time, clientName } = await req.json()
    const barberEmail = 'nexitlag@gmail.com'

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Email para o cliente
    await supabaseClient.auth.admin.sendRawEmail({
      to: email,
      subject: 'Confirmação de Agendamento',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Confirmação de Agendamento</h2>
          <p>Olá,</p>
          <p>Seu agendamento foi confirmado com sucesso!</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Data:</strong> ${date}</p>
            <p><strong>Horário:</strong> ${time}</p>
          </div>
          <p>Se precisar cancelar ou alterar seu agendamento, entre em contato conosco.</p>
          <p>Atenciosamente,<br>Barbearia</p>
        </div>
      `
    })

    // Email para o barbeiro
    await supabaseClient.auth.admin.sendRawEmail({
      to: barberEmail,
      subject: 'Novo Agendamento',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Novo Agendamento Recebido</h2>
          <p>Olá,</p>
          <p>Você recebeu um novo agendamento!</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Data:</strong> ${date}</p>
            <p><strong>Horário:</strong> ${time}</p>
          </div>
        </div>
      `
    })

    return new Response(
      JSON.stringify({ message: 'Emails enviados com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 