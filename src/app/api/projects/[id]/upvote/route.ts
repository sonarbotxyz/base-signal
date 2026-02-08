import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { validateApiKey } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate API key
    const authedHandle = await validateApiKey(request);
    if (!authedHandle) {
      return NextResponse.json(
        { error: 'Valid API key required. Register at POST /api/register.' },
        { status: 401 }
      );
    }

    const supabase = getSupabase();
    const { id: projectId } = await params;
    const twitterHandle = authedHandle;

    // Check if project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, upvotes')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if already upvoted
    const { data: existingUpvote } = await supabase
      .from('project_upvotes')
      .select('id')
      .eq('project_id', projectId)
      .eq('twitter_handle', twitterHandle)
      .single();

    if (existingUpvote) {
      // Remove upvote (toggle)
      await supabase
        .from('project_upvotes')
        .delete()
        .eq('project_id', projectId)
        .eq('twitter_handle', twitterHandle);

      // Decrement upvote count
      await supabase
        .from('projects')
        .update({ upvotes: Math.max(0, project.upvotes - 1) })
        .eq('id', projectId);

      return NextResponse.json({
        success: true,
        action: 'removed',
        upvotes: project.upvotes - 1
      });
    }

    // Add upvote
    const { error: upvoteError } = await supabase
      .from('project_upvotes')
      .insert({
        project_id: projectId,
        twitter_handle: twitterHandle
      });

    if (upvoteError) {
      console.error('Upvote error:', upvoteError);
      return NextResponse.json(
        { error: 'Failed to upvote' },
        { status: 500 }
      );
    }

    // Increment upvote count
    await supabase
      .from('projects')
      .update({ upvotes: project.upvotes + 1 })
      .eq('id', projectId);

    return NextResponse.json({
      success: true,
      action: 'added',
      upvotes: project.upvotes + 1
    });
  } catch (error) {
    console.error('Error processing upvote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
