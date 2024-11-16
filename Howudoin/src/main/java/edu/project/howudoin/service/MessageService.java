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

    // generating id
    public int generateMessageId(){
        return (int) messageRepository.count();
    }

    // sending message function
    public void sendMessage(Message message) {
        String senderNickname = message.getSenderNickname();
        String receiverNickname = message.getReceiverNickname();

        User sender = userService.getUser(senderNickname);
        User receiver = userService.getUser(receiverNickname);

        if (sender.getFriends().contains(receiverNickname) && receiver.getFriends().contains(senderNickname)) {
            System.out.println("Message sent.");
            messageRepository.save(message);
            userService.saveMessage(message);
        }
        else {
            System.out.println("Message could not be sent. They are not friend.");
        }
    }

    // getting messages function
    public List<Message> getMessages(User user) {
        String nickname = user.getNickname();
        user = userService.getUser(nickname);
        return user.getMessages();
    }
}
