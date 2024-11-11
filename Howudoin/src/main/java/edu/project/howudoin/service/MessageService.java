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

    public void sendMessage(Message message) {

        User sender = message.getSender();
        User receiver = message.getReceiver();

        if (sender.getFriends().contains(receiver) && receiver.getFriends().contains(sender)) {
            messageRepository.save(message);
        }
    }

    public List<Message> getMessages(User user) {
        List<Message> message = new ArrayList<>();
        for (Message m : messageRepository.findAll()) {
            if (m.getSender().equals(user) || m.getReceiver().equals(user)) {
                message.add(m);
            }
        }
        return message;
    }
}
