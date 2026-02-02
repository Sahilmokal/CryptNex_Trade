package com.sahil.trading.service;

import com.sahil.trading.entity.Asset;
import com.sahil.trading.entity.Coin;
import com.sahil.trading.entity.User;
import com.sahil.trading.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetServiceImpl implements AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Override
    public Asset createAsset(User user, Coin coin, double quantity) {
        Asset asset = new Asset();
        asset.setUser(user);
        asset.setCoin(coin);
        asset.setQuantity(quantity);
        asset.setBuyPrice(coin.getCurrentPrice());  // double
        return assetRepository.save(asset);
    }

    @Override
    public Asset createAsset(User user, Coin coin, double quantity, double buyPrice) {
        Asset asset = new Asset();
        asset.setUser(user);
        asset.setCoin(coin);
        asset.setQuantity(quantity);
        asset.setBuyPrice(buyPrice);   // double
        return assetRepository.save(asset);
    }

    @Override
    public Asset getAssetById(Long assetId) throws Exception {
        return assetRepository.findById(assetId)
                .orElseThrow(() -> new Exception("Asset not found"));
    }

    @Override
    public Asset getAssetByUserIdAndId(Long userId, Long assetId) {
        return null;
    }

    @Override
    public List<Asset> getUserAssets(Long userId) {
        return assetRepository.findByUserId(userId);
    }

    /**
     * Update asset with deltaQuantity.
     * BUY -> delta > 0  -> weighted average buy price
     * SELL -> delta < 0 -> reduce quantity
     */
    @Override
    public Asset updateAsset(Long assetId, double deltaQuantity) throws Exception {

        Asset oldAsset = getAssetById(assetId);

        double oldQty = oldAsset.getQuantity();
        double oldBuyPrice = oldAsset.getBuyPrice(); // primitive double, safe

        double newQty = oldQty + deltaQuantity;

        // SELL CASE
        if (deltaQuantity < 0) {
            if (newQty <= 0) {
                assetRepository.deleteById(assetId);
                return null;
            }
            oldAsset.setQuantity(newQty);
            return assetRepository.save(oldAsset);
        }

        // BUY CASE (weighted avg)
        double currentPrice = oldAsset.getCoin().getCurrentPrice();

        double totalCostOld = oldBuyPrice * oldQty;
        double totalCostNew = currentPrice * deltaQuantity;
        double totalQty = oldQty + deltaQuantity;

        double newBuyPrice = totalQty > 0
                ? (totalCostOld + totalCostNew) / totalQty
                : currentPrice;

        oldAsset.setBuyPrice(newBuyPrice);
        oldAsset.setQuantity(totalQty);

        return assetRepository.save(oldAsset);
    }

    @Override
    public Asset updateAsset(Long assetId, double quantity, double buyPrice) throws Exception {
        Asset asset = getAssetById(assetId);
        asset.setQuantity(quantity);
        asset.setBuyPrice(buyPrice);
        return assetRepository.save(asset);
    }

    @Override
    public Asset findAssetByUserIdAndCoinId(Long userId, String coinId) {
        return assetRepository.findByUserIdAndCoinId(userId, coinId);
    }

    @Override
    public void deleteAsset(Long assetId) {
        assetRepository.deleteById(assetId);
    }
}
