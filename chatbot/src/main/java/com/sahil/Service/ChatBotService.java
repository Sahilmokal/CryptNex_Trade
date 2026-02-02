package com.sahil.Service;

import com.sahil.response.ApiResponse;

public interface ChatBotService {
    ApiResponse getCoinDetails(String prompt) throws Exception;

    String simpleChat(String prompt);
}
