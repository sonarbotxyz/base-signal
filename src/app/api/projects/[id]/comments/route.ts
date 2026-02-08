import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('project_comments')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { twitter_handle, content } = body;
    const supabase = getSupabase();
    
    if (!twitter_handle || !content) {
      return NextResponse.json(
        { error: 'twitter_handle and content are required' },
        { status: 400 }
      );
    }
    
    // Validate content length
    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment too long (max 2000 characters)' },
        { status: 400 }
      );
    }
    
    // Check project exists
    const { data: project, error: projectErr } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (projectErr || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Insert comment
    const { data, error } = await supabase
      .from('project_comments')
      .insert({
        project_id: id,
        twitter_handle: twitter_handle.replace('@', ''),
        content: content.trim()
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    return NextResponse.json({ 
      success: true,
      comment: data
    });
  } catch (error) {
    console.error('Failed to add comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
