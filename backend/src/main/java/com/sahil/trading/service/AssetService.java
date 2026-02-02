package com.sahil.trading.service;

import com.sahil.trading.entity.Asset;
import com.sahil.trading.entity.Coin;
import com.sahil.trading.entity.User;

import java.math.BigDecimal;
import java.util.List;

public interface AssetService {
    // Create asset with explicit per-unit buyPrice
    Asset createAsset(User user, Coin coin, double quantity, double buyPrice);

    // Backwards-compatible: older signature retained (calls new createAsset with coin current price)
    Asset createAsset(User user, Coin coin, double quantity);

    Asset getAssetById(Long assetId) throws Exception;

    Asset getAssetByUserIdAndId(Long userId, Long AssetId);

    List<Asset> getUserAssets(Long userId);

    /**
     * Update asset by deltaQuantity:
     * - deltaQuantity > 0 : buying more (buyPrice used to compute weighted average)
     * - deltaQuantity < 0 : selling (buyPrice ignored)
     *
     * buyPrice is BigDecimal and only used for buys.
     */
    Asset updateAsset(Long assetId, double deltaQuantity, double buyPrice) throws Exception;

    // Backwards-compatible: old signature that replaces quantity (kept but delegates to updateAsset)
    Asset updateAsset(Long assetId, double quantity) throws Exception;

    Asset findAssetByUserIdAndCoinId(Long userId, String coinId);

    void deleteAsset(Long assetId);
}
