package edu.project.howudoin.controller;

import edu.project.howudoin.model.Message;
import edu.project.howudoin.model.User;
import edu.project.howudoin.service.MessageService;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import edu.project.howudoin.security.JwtUtil;

import java.util.List;

@RestController
public class MessageController {
    @Autowired
    private MessageService messageService;
    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;

    // POST /messages/send: Send a message to a friend
    @PostMapping("/messages/send")
    public String sendMessage(@RequestHeader("Authorization") String token,
                              @RequestBody Message message)
    {
        String jwt = token.substring(7);
        String email = jwtUtil.extractEmail(jwt);

        if (jwtUtil.validateToken(jwt, email)) {
            int id = messageService.generateMessageId();
            message.setId(id);
            return messageService.sendMessage(message);
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }

    // GET /messages: Retrieve conversation history
    @GetMapping("/messages")
    public List<Message> getMessages(@RequestHeader("Authorization") String token,
                                     @RequestParam("nickname") String nickname)
    {
        String jwt = token.substring(7);
        String email = jwtUtil.extractEmail(jwt);

        if (jwtUtil.validateToken(jwt, email)) {
            User user = userService.getUser(nickname);
            return messageService.getMessages(user);
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }
}
