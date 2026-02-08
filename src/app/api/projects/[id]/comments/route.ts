import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await query(
      `SELECT * FROM project_comments 
       WHERE project_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );
    
    return NextResponse.json({ comments: result.rows });
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
    const projectCheck = await query(
      'SELECT id FROM projects WHERE id = $1',
      [id]
    );
    
    if (projectCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Insert comment
    const result = await query(
      `INSERT INTO project_comments (project_id, twitter_handle, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, twitter_handle.replace('@', ''), content.trim()]
    );
    
    return NextResponse.json({ 
      success: true,
      comment: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to add comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
