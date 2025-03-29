import { NextRequest, NextResponse } from 'next/server';
import { AssetService } from '@/lib/asset/asset-service';

const assetService = new AssetService();

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; assetId: string } }
) {
  try {
    const asset = await assetService.getAssetById(params.assetId);
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Verify the asset belongs to the project
    if (asset.project_id !== params.projectId) {
      return NextResponse.json(
        { error: 'Asset not found in project' },
        { status: 404 }
      );
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; assetId: string } }
) {
  try {
    const body = await request.json();
    const { content, message_id } = body;

    if (!content || !message_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const version = await assetService.createAssetVersion(
      params.assetId,
      content,
      message_id
    );

    return NextResponse.json(version);
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; assetId: string } }
) {
  try {
    const asset = await assetService.getAssetById(params.assetId);
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Verify the asset belongs to the project
    if (asset.project_id !== params.projectId) {
      return NextResponse.json(
        { error: 'Asset not found in project' },
        { status: 404 }
      );
    }

    // Delete the asset and all its versions
    const { error } = await assetService.supabase
      .from('assets')
      .delete()
      .eq('id', params.assetId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
} 