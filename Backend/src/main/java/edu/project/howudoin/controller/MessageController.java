package edu.project.howudoin.controller;

import edu.project.howudoin.model.Message;
import edu.project.howudoin.model.User;
import edu.project.howudoin.security.JwtUtil;
import edu.project.howudoin.service.MessageService;
import edu.project.howudoin.service.UserService;
import edu.project.howudoin.utils.APIResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // GET /messages: Retrieve conversation history
    @GetMapping("/messages")
    public ResponseEntity<APIResponse<List<Message>>> getMessages(@RequestHeader("Authorization") String token) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        User user = userService.getUserByEmail(email);
        List<Message> messages = messageService.getMessages(user);

        if (messages.isEmpty()) {
            return ResponseEntity.ok(new APIResponse<>(0, "No messages.", messages));
        }

        return ResponseEntity.ok(new APIResponse<>(1, "Messages are retrieved successfully!", messages));
    }

    @GetMapping("/messagesbetween")
    public ResponseEntity<APIResponse<List<Message>>> getMessagesBetweenTwoUsers(@RequestHeader("Authorization") String token,
                                                                                 @RequestParam("nickname") String nickname,
                                                                                 @RequestParam("friend") String friend) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        try {
            User user = userService.getUser(nickname);
            User friendUser = userService.getUser(friend);

            if (user == null || friendUser == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new APIResponse<>(0, "User or friend not found.", null));
            }

            List<Message> messages = messageService.getMessagesBetween(user, friendUser);

            if (messages == null || messages.isEmpty()) {
                return ResponseEntity.ok(new APIResponse<>(0, "No messages.", messages));
            }

            return ResponseEntity.ok(new APIResponse<>(1, "Messages retrieved successfully!", messages));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(0, "An error occurred while retrieving messages.", null));
        }
    }

    // POST /messages/send: Send a message to a friend
    @PostMapping("/messages/send")
    public ResponseEntity<APIResponse<String>> sendMessage(@RequestHeader("Authorization") String token,
                                                           @RequestBody Message message) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        int id = messageService.generateMessageId();
        message.setId(id);
        String result = messageService.sendMessage(message);

        return ResponseEntity.ok(new APIResponse<>(1, result, null));
    }

    private String extractJwt(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header must start with 'Bearer '");
        }
        return token.substring(7);
    }

}
