import { useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { fetchAssetsByIds } from '@/lib/asset/asset-service.client';

/**
 * Hook that monitors messages for pending assets and fetches them
 */
export function useAssetFetcher() {
  const { state, dispatch } = useAppContext();
  // Keep track of messages that have already been processed
  const processedMessagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentProjectId = state.currentProjectId;
    if (!currentProjectId) return;

    // Get all messages from all conversations
    const allMessages = Array.from(state.messages.values()).flat();

    // Find messages with pending assets that haven't been processed yet
    const messagesWithPendingAssets = allMessages.filter((message) => {
      const pendingAssetIds = message.metadata?.pendingAssetIds;
      return (
        Array.isArray(pendingAssetIds) &&
        pendingAssetIds.length > 0 &&
        !processedMessagesRef.current.has(message.id)
      );
    });

    if (messagesWithPendingAssets.length === 0) return;

    // Process each message with pending assets
    messagesWithPendingAssets.forEach(message => {
      const pendingAssetIds = Array.isArray(message.metadata?.pendingAssetIds)
        ? message.metadata.pendingAssetIds
        : [];

      // Mark this message as being processed
      processedMessagesRef.current.add(message.id);

      // Fetch the assets
      fetchAssetsByIds(pendingAssetIds, currentProjectId)
        .then(assets => {
          // Filter out any failed fetches
          const validAssets = assets.filter(asset => asset !== null);
          console.log(`[useAssetFetcher] Successfully processed ${validAssets.length} assets for message ${message.id}`);

          // Update the global assets state
          validAssets.forEach(asset => {
            dispatch({
              type: 'UPDATE_ASSET_SUCCESS',
              payload: { asset }
            });
          });

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
