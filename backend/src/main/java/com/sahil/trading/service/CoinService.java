package com.sahil.trading.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.sahil.trading.entity.Coin;

import java.util.List;

public interface CoinService {

    List<Coin> getCoinList(int page) throws Exception;
    String getMarketChart(String coinId, int days) throws Exception;
    String getCoinDetails(String coinId) throws Exception;
    Coin findById(String coinId) throws Exception;
    String searchCoin(String keyword) throws Exception;
    String getTop50CoinsByMarketCapRank() throws Exception;
    String getTradingCoins() throws Exception;
    String getTopGainers() throws Exception;
    List<JsonNode> getTopLosers() throws Exception;

}
