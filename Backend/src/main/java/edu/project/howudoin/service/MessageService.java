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

    // getting messages function
    public List<Message> getMessages(User user) {
        String nickname = user.getNickname();
        user = userService.getUser(nickname);
        return user.getMessages();
    }
}
