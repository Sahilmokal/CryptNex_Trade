package com.sahil.Controller;

import com.sahil.Service.ChatBotService;
import com.sahil.dto.PromptBody;
import com.sahil.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/ai/chat")
public class ChatbotController {

    private final ChatBotService chatBotService;

    public ChatbotController(ChatBotService chatBotService) {
        this.chatBotService = chatBotService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> getCoinDetails(@RequestBody PromptBody prompt)
            throws Exception {

        return ResponseEntity.ok(
                chatBotService.getCoinDetails(prompt.getPrompt())
        );
    }

    @PostMapping("/simple")
    public ResponseEntity<String> simpleChatHandler(
            @RequestBody PromptBody prompt) {

        return ResponseEntity.ok(
                chatBotService.simpleChat(prompt.getPrompt())
        );
    }
}
