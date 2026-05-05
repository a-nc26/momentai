import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';

// POST /api/enterprise/auth/setup
// Body: { email, password, fullName, companyName, companyDomain }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, companyName, companyDomain } = body as {
      email: string;
      password: string;
      fullName: string;
      companyName: string;
      companyDomain: string;
    };

    if (!email || !password || !fullName || !companyName || !companyDomain) {
      return Response.json(
        { error: 'email, password, fullName, companyName, and companyDomain are required' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 1. Create Supabase auth user
    const authClient = createClient(url, anonKey);
    const { data: signUpData, error: signUpError } = await authClient.auth.signUp({
      email,
      password,
    });

    if (signUpError || !signUpData.user) {
      return Response.json(
        { error: signUpError?.message ?? 'Failed to create auth user' },
        { status: 400 }
      );
    }

    const authUserId = signUpData.user.id;
    const supabase = getSupabase();

    // 2. Upsert company by domain
    const { data: existingCompany } = await supabase
      .from('enterprise_companies')
      .select('*')
      .eq('domain', companyDomain)
      .single();

    let company = existingCompany;

    if (!company) {
      const { data: newCompany, error: companyError } = await supabase
        .from('enterprise_companies')
        .insert({ name: companyName, domain: companyDomain })
        .select()
        .single();

      if (companyError || !newCompany) {
        return Response.json(
          { error: companyError?.message ?? 'Failed to create company' },
          { status: 500 }
        );
      }
      company = newCompany;
    }

    // 3. Create enterprise_users row with role='admin'
    const { data: enterpriseUser, error: userError } = await supabase
      .from('enterprise_users')
      .insert({
        auth_user_id: authUserId,
        company_id: company.id,
        email,
        full_name: fullName,
        role: 'admin',
      })
      .select()
      .single();

    if (userError || !enterpriseUser) {
      return Response.json(
        { error: userError?.message ?? 'Failed to create enterprise user' },
        { status: 500 }
      );
    }

    return Response.json({ user: enterpriseUser, company });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
