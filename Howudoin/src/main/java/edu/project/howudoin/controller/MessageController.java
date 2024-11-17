package edu.project.howudoin.controller;

import edu.project.howudoin.model.Message;
import edu.project.howudoin.model.User;
import edu.project.howudoin.service.MessageService;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MessageController {
    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    // POST /messages/send: Send a message to a friend
    // instead of requestparam, use requestbody (easier)
    @PostMapping("/messages/send")
    public void sendMessage(@RequestBody Message message)
    {
        int id = messageService.generateMessageId();
        message.setId(id);
        messageService.sendMessage(message);
    }

    // GET /messages: Retrieve conversation history
    // it can be enhanced ("sender->receiver: content")
    @GetMapping("/messages")
    public List<Message> getMessages(@RequestParam("nickname") String nickname)
    {
        User user = userService.getUser(nickname);
        return messageService.getMessages(user);
    }
}