import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return json({ error: 'Missing Supabase environment variables' }, 500)
  }

  const authorization = request.headers.get('Authorization')
  if (!authorization) {
    return json({ error: 'Missing authorization header' }, 401)
  }

  let confirmation = ''
  try {
    const body = await request.json()
    confirmation = String(body.confirmation ?? '')
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  if (confirmation !== 'ELIMINAR MI CUENTA') {
    return json({ error: 'Invalid confirmation text' }, 400)
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  })

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser()

  if (userError || !user) {
    return json({ error: 'Invalid or expired session' }, 401)
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return json({ error: deleteError.message }, 500)
  }

  return json({ ok: true })
})
