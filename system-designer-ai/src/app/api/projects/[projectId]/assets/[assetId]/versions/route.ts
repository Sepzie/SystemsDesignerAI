import { NextRequest, NextResponse } from 'next/server';
import { AssetService } from '@/lib/asset/asset-service.server';

const assetService = new AssetService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; assetId: string }> }
) {
  try {
    const { projectId, assetId } = await params;
    const asset = await assetService.getAssetById(assetId);
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Verify the asset belongs to the project
    if (asset.project_id !== projectId) {
      return NextResponse.json(
        { error: 'Asset not found in project' },
        { status: 404 }
      );
    }

    const versions = await assetService.getAssetVersions(assetId);
    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching asset versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset versions' },
      { status: 500 }
    );
  }
} 