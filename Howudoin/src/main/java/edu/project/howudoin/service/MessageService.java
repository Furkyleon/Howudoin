package edu.project.howudoin.service;

import edu.project.howudoin.model.Message;
import edu.project.howudoin.model.User;
import edu.project.howudoin.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserService userService;

    // sending message function
    public void sendMessage(Message message) {
        int senderId = message.getSenderId();
        int receiverId = message.getReceiverId();

        User sender = userService.getUser(senderId);
        User receiver = userService.getUser(receiverId);

        if (sender.getFriends().contains(receiverId) && receiver.getFriends().contains(senderId)) {
            System.out.println("Message sent.");
            messageRepository.save(message);
            userService.saveMessage(message);
        }
        else {
            System.out.println("Message not sent. They are not friend.");
        }
    }

    // getting messages function
    public List<String> getMessages(User user) {
        int userId = user.getId();
        user = userService.getUser(userId);
        return user.getMessages();
    }
}
