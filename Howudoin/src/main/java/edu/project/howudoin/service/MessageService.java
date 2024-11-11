package edu.project.howudoin.service;

import edu.project.howudoin.model.Message;
import edu.project.howudoin.repository.MessageRepository;
import edu.project.howudoin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    // Method to send a message from one user to another
    public Message sendMessage(int senderId, int receiverId, String content) {
        // Ensure both sender and receiver exist
        if (userRepository.existsById(senderId) && userRepository.existsById(receiverId)) {
            Message message = new Message();
            message.setSenderId(senderId);
            message.setReceiverId(receiverId);
            message.setContent(content);
            message.setTimestamp(System.currentTimeMillis());
            return messageRepository.save(message);
        } else {
            throw new IllegalArgumentException("Invalid sender or receiver ID.");
        }
    }
    public List<Message> getConversation(int userId1, int userId2) {
        // Call repository method to fetch messages in both directions
        return messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverId();
    }
}
