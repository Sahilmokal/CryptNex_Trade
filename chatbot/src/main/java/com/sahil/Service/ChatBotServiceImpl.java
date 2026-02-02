package com.sahil.Service;

import com.sahil.dto.CoinDto;
import com.sahil.response.ApiResponse;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatBotServiceImpl implements ChatBotService {

    @Value("${gemini.api.key}")
    private String GEMINI_API_KEY;

    private final RestTemplate restTemplate = new RestTemplate();

    // Cache to reduce Gemini calls
    private final Map<String, JSONObject> intentCache = new ConcurrentHashMap<>();

    /* -------------------- UTIL -------------------- */

    private double toDouble(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Integer) return ((Integer) val).doubleValue();
        if (val instanceof Long) return ((Long) val).doubleValue();
        if (val instanceof Double) return (Double) val;
        return 0.0;
    }

    /* -------------------- LOCAL FALLBACK (IMPORTANT) -------------------- */

    private JSONObject localIntentFallback(String prompt) {

        prompt = prompt.toLowerCase();

        String coinId = "bitcoin"; // default only if nothing found
        String field = "price";

        if (prompt.contains("ethereum") || prompt.contains("eth")) coinId = "ethereum";
        else if (prompt.contains("bitcoin") || prompt.contains("btc")) coinId = "bitcoin";
        else if (prompt.contains("solana") || prompt.contains("sol")) coinId = "solana";
        else if (prompt.contains("bnb")) coinId = "binancecoin";
        else if (prompt.contains("matic") || prompt.contains("polygon")) coinId = "matic-network";
        else if (prompt.contains("doge")) coinId = "dogecoin";

        if (prompt.contains("market cap")) field = "market_cap";
        else if (prompt.contains("high")) field = "high_24h";
        else if (prompt.contains("low")) field = "low_24h";
        else if (prompt.contains("change")) field = "change_24h";
        else if (prompt.contains("supply")) field = "supply";

        JSONObject fallback = new JSONObject();
        fallback.put("coin_id", coinId);
        fallback.put("field", field);

        return fallback;
    }

    /* -------------------- GEMINI → INTENT -------------------- */

    private JSONObject extractCoinIntentWithGemini(String prompt) {

    if (intentCache.containsKey(prompt)) {
        return intentCache.get(prompt);
    }

    String url =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                    + GEMINI_API_KEY;

    String systemPrompt =
            "You are a JSON API. " +
            "Return ONLY valid JSON. " +
            "No text, no explanation, no markdown. " +
            "Format: { \"coin_id\": \"<coingecko_id>\", " +
            "\"field\": \"price | market_cap | change_24h | high_24h | low_24h | supply | full\" }. " +
            "User question: " + prompt;

    JSONObject body = new JSONObject()
            .put("contents", new JSONArray()
                    .put(new JSONObject()
                            .put("parts", new JSONArray()
                                    .put(new JSONObject().put("text", systemPrompt)))));

    try {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(url, request, String.class);

        String rawText = new JSONObject(response.getBody())
                .getJSONArray("candidates")
                .getJSONObject(0)
                .getJSONObject("content")
                .getJSONArray("parts")
                .getJSONObject(0)
                .getString("text");

        int start = rawText.indexOf("{");
        int end = rawText.lastIndexOf("}");

        if (start == -1 || end == -1) {
            return localIntentFallback(prompt);
        }

        String jsonOnly = rawText.substring(start, end + 1);
        JSONObject intent = new JSONObject(jsonOnly);

        intentCache.put(prompt, intent);
        return intent;

    } catch (Exception e) {
        return localIntentFallback(prompt);
    }
}

    /* -------------------- COINGECKO -------------------- */

    private CoinDto fetchCoinData(String coinId) {

        String url = "https://api.coingecko.com/api/v3/coins/" + coinId;
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

        Map<String, Object> body = response.getBody();
        Map<String, Object> market = (Map<String, Object>) body.get("market_data");
        Map<String, Object> image = (Map<String, Object>) body.get("image");

        CoinDto dto = new CoinDto();
        dto.setId((String) body.get("id"));
        dto.setName((String) body.get("name"));
        dto.setSymbol((String) body.get("symbol"));
        dto.setImage((String) image.get("large"));

        dto.setCurrentPrice(toDouble(((Map<?, ?>) market.get("current_price")).get("usd")));
        dto.setMarketCap(toDouble(((Map<?, ?>) market.get("market_cap")).get("usd")));
        dto.setHigh24h(toDouble(((Map<?, ?>) market.get("high_24h")).get("usd")));
        dto.setLow24h(toDouble(((Map<?, ?>) market.get("low_24h")).get("usd")));
        dto.setPriceChangePercentage24h(toDouble(market.get("price_change_percentage_24h")));
        dto.setCirculationSupply(toDouble(market.get("circulating_supply")));
        dto.setLastUpdated(new Date());

        return dto;
    }

    /* -------------------- API -------------------- */

    @Override
    public ApiResponse getCoinDetails(String prompt) {

        JSONObject intent = extractCoinIntentWithGemini(prompt);

        String coinId = intent.getString("coin_id");
        String field = intent.getString("field");

        CoinDto coin = fetchCoinData(coinId);
        ApiResponse response = new ApiResponse();

        switch (field) {
            case "market_cap" ->
                    response.setMessage("Market cap of " + coin.getName() + " is $" + coin.getMarketCap());
            case "change_24h" ->
                    response.setMessage(coin.getName() + " changed " + coin.getPriceChangePercentage24h() + "% in 24h");
            case "high_24h" ->
                    response.setMessage("24h high of " + coin.getName() + " is $" + coin.getHigh24h());
            case "low_24h" ->
                    response.setMessage("24h low of " + coin.getName() + " is $" + coin.getLow24h());
            case "supply" ->
                    response.setMessage("Circulating supply of " + coin.getName() + " is " + coin.getCirculationSupply());
            default ->
                    response.setMessage("Current price of " + coin.getName() + " is $" + coin.getCurrentPrice());
        }

        return response;
    }
public String simpleChat(String prompt) {

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                        + GEMINI_API_KEY;

        JSONObject body = new JSONObject()
                .put("contents", new JSONArray()
                        .put(new JSONObject()
                                .put("parts", new JSONArray()
                                        .put(new JSONObject().put("text", prompt)))));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(url, request, String.class);

        return response.getBody();
    }

}
