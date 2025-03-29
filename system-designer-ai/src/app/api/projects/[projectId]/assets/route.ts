import { NextRequest, NextResponse } from 'next/server';
import { AssetService } from '@/lib/asset/asset-service';
import { AssetType } from '@/types/asset';

const assetService = new AssetService();

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as AssetType | null;

    let assets;
    if (type) {
      assets = await assetService.getAssetsByType(params.projectId, type);
    } else {
      assets = await assetService.getAssetsByProject(params.projectId);
    }

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    const asset = await assetService.storeAsset({
      ...body,
      project_id: params.projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
} 