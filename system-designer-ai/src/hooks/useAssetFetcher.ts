import { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { fetchAssetsByIds } from '@/lib/asset/asset-service.client';

/**
 * Hook that monitors messages for pending assets and fetches them
 */
export function useAssetFetcher() {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    const currentProjectId = state.currentProjectId;
    if (!currentProjectId) return;

    // Get all messages from all conversations
    const allMessages = Array.from(state.messages.values()).flat();
    
    // Find messages with pending assets
    const messagesWithPendingAssets = allMessages.filter(
      message => message.metadata?.pendingAssetIds && message.metadata.pendingAssetIds.length > 0
    );

    if (messagesWithPendingAssets.length === 0) return;

    // Process each message with pending assets
    messagesWithPendingAssets.forEach(message => {
      const pendingAssetIds = message.metadata?.pendingAssetIds || [];
      
      // Fetch the assets
      fetchAssetsByIds(pendingAssetIds, currentProjectId)
        .then(assets => {
          // Filter out any failed fetches
          const validAssets = assets.filter(asset => asset !== null);
          console.log(`[useAssetFetcher] Successfully processed ${validAssets.length} assets for message ${message.id}`);
          
          // Update the message with the fetched assets
          dispatch({
            type: 'UPDATE_MESSAGE_ASSETS',
            payload: { 
              messageId: message.id, 
              assetIds: validAssets.map(asset => asset.id) 
            }
          });
        })
        .catch(error => {
          console.error(`[useAssetFetcher] Error processing assets for message ${message.id}:`, error);
        });
    });
  }, [state.messages, state.currentProjectId, dispatch]);
} 