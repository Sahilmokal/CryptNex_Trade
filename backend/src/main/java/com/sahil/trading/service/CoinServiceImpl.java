package com.sahil.trading.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sahil.trading.entity.Coin;
import com.sahil.trading.repository.CoinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CoinServiceImpl implements CoinService {

    @Autowired
    private CoinRepository coinRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final RestTemplate restTemplate = new RestTemplate();

    // ================= CACHE =================
    private static final long CACHE_TTL = 60_000; // 60 seconds
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    static class CacheEntry {
        String data;
        long time;

        CacheEntry(String data) {
            this.data = data;
            this.time = System.currentTimeMillis();
        }

        boolean expired() {
            return System.currentTimeMillis() - time > CACHE_TTL;
        }
    }

    private String getCached(String key) {
        CacheEntry e = cache.get(key);
        return (e != null && !e.expired()) ? e.data : null;
    }

    private void putCache(String key, String data) {
        cache.put(key, new CacheEntry(data));
    }

    // ================= API =================

    @Override
    public List<Coin> getCoinList(int page) throws Exception {

        String cacheKey = "coinList_" + page;
        String cached = getCached(cacheKey);
        if (cached != null) {
            return objectMapper.readValue(cached, new TypeReference<>() {});
        }

        String url =
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=10&page=" + page;

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            putCache(cacheKey, response.getBody());

            return objectMapper.readValue(response.getBody(), new TypeReference<>() {});
        } catch (HttpClientErrorException.TooManyRequests e) {
            return Collections.emptyList();
        }
    }

    @Override
    public String getMarketChart(String coinId, int days) throws Exception {

        String cacheKey = "chart_" + coinId + "_" + days;
        String cached = getCached(cacheKey);
        if (cached != null) return cached;

        String url =
                "https://api.coingecko.com/api/v3/coins/" + coinId +
                        "/market_chart?vs_currency=usd&days=" + days;

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            putCache(cacheKey, response.getBody());
            return response.getBody();
        } catch (HttpClientErrorException.TooManyRequests e) {
            return cached != null ? cached : "{}";
        }
    }

    @Override
    public String getCoinDetails(String coinId) throws Exception {

        String cacheKey = "details_" + coinId;
        String cached = getCached(cacheKey);
        if (cached != null) return cached;

        String url = "https://api.coingecko.com/api/v3/coins/" + coinId;

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            putCache(cacheKey, response.getBody());

            JsonNode node = objectMapper.readTree(response.getBody());
            Coin coin = new Coin();

            coin.setId(node.path("id").asText());
            coin.setName(node.path("name").asText());
            coin.setSymbol(node.path("symbol").asText());
            coin.setImage(node.path("image").path("large").asText());

            JsonNode m = node.path("market_data");
            coin.setCurrentPrice(m.path("current_price").path("usd").asDouble());
            coin.setPriceChangePercentage24h(m.path("price_change_percentage_24h").asDouble());

            coinRepository.save(coin);
            return response.getBody();

        } catch (HttpClientErrorException.TooManyRequests e) {
            return cached != null ? cached : "{}";
        }
    }

    @Override
    public String searchCoin(String keyword) throws Exception {

        String cacheKey = "search_" + keyword;
        String cached = getCached(cacheKey);
        if (cached != null) return cached;

        String url =
                "https://api.coingecko.com/api/v3/search?query=" + keyword;

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        putCache(cacheKey, response.getBody());
        return response.getBody();
    }

    @Override
    public String getTop50CoinsByMarketCapRank() throws Exception {

        String cacheKey = "top50";
        String cached = getCached(cacheKey);
        if (cached != null) return cached;

        String url =
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=50&page=1";

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        putCache(cacheKey, response.getBody());
        return response.getBody();
    }

    @Override
    public String getTradingCoins() throws Exception {

        String cacheKey = "trending";
        String cached = getCached(cacheKey);
        if (cached != null) return cached;

        String url = "https://api.coingecko.com/api/v3/search/trending";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        putCache(cacheKey, response.getBody());
        return response.getBody();
    }
    @Override
    public String getTopGainers() throws Exception {
        String url =
                "https://api.coingecko.com/api/v3/coins/markets" +
                        "?vs_currency=usd&order=market_cap_desc&per_page=50&page=1";

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        JsonNode node = objectMapper.readTree(response.getBody());

        List<JsonNode> coins = new ArrayList<>();
        node.forEach(coins::add);

        coins.sort((a, b) ->
                Double.compare(
                        b.path("price_change_percentage_24h").asDouble(),
                        a.path("price_change_percentage_24h").asDouble()
                )
        );

        return objectMapper.writeValueAsString(coins.subList(0, 10));
    }
    @Override
    public List<JsonNode> getTopLosers() throws Exception {

        String url =
                "https://api.coingecko.com/api/v3/coins/markets" +
                        "?vs_currency=usd&order=market_cap_desc&per_page=50&page=1";

        ResponseEntity<String> response =
                restTemplate.getForEntity(url, String.class);

        JsonNode node = objectMapper.readTree(response.getBody());

        List<JsonNode> coins = new ArrayList<>();

        for (JsonNode c : node) {
            if (c.hasNonNull("price_change_percentage_24h")) {
                coins.add(c);
            }
        }

        coins.sort(Comparator.comparingDouble(
                c -> c.get("price_change_percentage_24h").asDouble()
        ));

        return coins.subList(0, Math.min(10, coins.size()));
    }



    @Override
    public Coin findById(String coinId) throws Exception {
        return coinRepository.findById(coinId)
                .orElseThrow(() -> new Exception("Coin not found"));
    }
}
