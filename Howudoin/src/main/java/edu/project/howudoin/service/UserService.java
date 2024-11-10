package edu.project.howudoin.service;
import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.model.User;
import edu.project.howudoin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public void deleteUser(int id) {
        User user = userRepository.findById(id).get();
        userRepository.delete(user);
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public void addFriend(FriendRequest request){
        int senderId = request.getSenderId();
        int receiverId = request.getReceiverId();
        User sender = userRepository.findById(senderId).get();
        User receiver = userRepository.findById(receiverId).get();
        sender.getFriendsId().add(receiverId);
        receiver.getFriendsId().add(senderId);
        userRepository.save(sender);
        userRepository.save(receiver);
    }
}
