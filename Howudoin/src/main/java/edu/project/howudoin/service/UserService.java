package edu.project.howudoin.service;
import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.model.User;
import edu.project.howudoin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        // when user is deleted, remove from groups, other users' friends and friend requests
        userRepository.delete(user);
    }

    public User getUser(int id) {
        return userRepository.findById(id).get();
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public void addFriend(FriendRequest request){
        User sender = request.getSender();
        User receiver = request.getReceiver();

        sender.getFriends().add(receiver);
        receiver.getFriends().add(sender);

        userRepository.save(sender);
        userRepository.save(receiver);
    }

    public void login(String email, String password) {
        // login authentication
        System.out.println("Succesfully logined");
    }

    public List<User> getFriends(int userId){
        User user = userRepository.findById(userId).get();
        return user.getFriends();
    }
}
