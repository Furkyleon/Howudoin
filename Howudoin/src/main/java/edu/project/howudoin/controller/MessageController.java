package edu.project.howudoin.controller;

import edu.project.howudoin.model.Message;
import edu.project.howudoin.model.User;
import edu.project.howudoin.service.MessageService;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    // POST /messages/send: Send a message to a friend
    @PostMapping("/send")
    public void sendMessage(@RequestParam int senderId,
                            @RequestParam int receiverId,
                            @RequestParam String content)
    {
        User sender = userService.getUser(senderId);
        User receiver = userService.getUser(receiverId);
        Message message = new Message(sender, receiver, content);
        messageService.sendMessage(message);
    }

    // GET /messages: Retrieve conversation history
    @GetMapping("/{id}")
    public List<Message> getMessages(@PathVariable int id)
    {
        User user = userService.getUser(id);
        return messageService.getMessages(user);
    }
}

