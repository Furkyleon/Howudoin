package edu.project.howudoin.controller;

import edu.project.howudoin.model.Message;
import edu.project.howudoin.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public Message sendMessage(@RequestParam int senderId, @RequestParam int receiverId, @RequestParam String content) {
        return messageService.sendMessage(senderId, receiverId, content);
    }

    @GetMapping("/conversation")
    public List<Message> getConversation(@RequestParam int userId1, @RequestParam int userId2) {
        return messageService.getConversation(userId1, userId2);
    }
}

