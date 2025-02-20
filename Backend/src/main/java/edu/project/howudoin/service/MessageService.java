package edu.project.howudoin.service;

import edu.project.howudoin.model.Message;
import edu.project.howudoin.model.User;
import edu.project.howudoin.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    // getting messages of a user
    public List<Message> getMessages(User user) {
        return user.getMessages();
    }

    // getting messages between two users
    public List<Message> getMessagesBetween(User user1, User user2) {
        List<Message> messages = getMessages(user1);
        List<Message> filteredMessages = new ArrayList<>();

        for (Message message : messages) {
            if ((message.getSender().equals(user1.getNickname()) && message.getReceiver().equals(user2.getNickname())) ||
                    (message.getSender().equals(user2.getNickname()) && message.getReceiver().equals(user1.getNickname()))) {
                filteredMessages.add(message);
            }
        }
        return filteredMessages;
    }

    // sending message
    public String sendMessage(Message message) {
        String sender = message.getSender();
        String receiver = message.getReceiver();
        boolean receiverCheck = userService.userCheck(receiver);

        if (!receiverCheck) {
            return "There is no user that named " + receiver + ".";
        }
        else {
            User senderUser = userService.getUser(sender);
            User receiverUser = userService.getUser(receiver);

            if (senderUser.getFriends().contains(receiver) && receiverUser.getFriends().contains(sender)) {
                System.out.println("Message sent.");
                messageRepository.save(message);
                userService.saveMessage(message);
                return "Message is sent.";
            }
            else {
                return "Message could not be sent. You are not friend with this receiver.";
            }
        }
    }
}
