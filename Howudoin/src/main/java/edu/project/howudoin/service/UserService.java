package edu.project.howudoin.service;
import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.model.Message;
import edu.project.howudoin.model.User;
import edu.project.howudoin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    /*
        UserController
    */

    // register function (saves user)
    public void saveUser(User user) {
        userRepository.save(user);
    }

    public int generateUserId(){
        return (int) userRepository.count();
    }

    // login function (not complete)
    public void login(String email, String password) {
        // login authentication
        System.out.println("Succesfully logined");
    }

    //
    // deleting function (but not mentioned in file)
    public void deleteUser(int id) {
        User user = userRepository.findById(id).get();
        // when user is deleted, remove from groups, other users' friends and friend requests
        userRepository.delete(user);
    }

    // getting user function
    public User getUser(String nickname) {
        return userRepository.findByNickname(nickname).get();
    }

    // getting users function
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    /*
        FriendRequestController
    */

    // adding friend function (for /friends/accept)
    public void addFriend(FriendRequest request) {
        String senderNickname = request.getSenderNickname();
        String receiverNickname = request.getReceiverNickname();

        User sender;
        User receiver;

        if (userRepository.existsByNickname(senderNickname) && userRepository.existsByNickname(receiverNickname)) {
            System.out.println("Both sender and receiver exist.");
            sender = userRepository.findByNickname(senderNickname).get();
            receiver = userRepository.findByNickname(receiverNickname).get();

            // burdaki sıkıntıyı çözemedik. niye silip tekrar kaydetmek gerekiyor?
            // (önceden save diyince öncekinin üstüne geçiyodu)
            userRepository.delete(sender);
            sender.getFriends().add(receiverNickname);
            userRepository.save(sender);

            userRepository.delete(receiver);
            receiver.getFriends().add(senderNickname);
            userRepository.save(receiver);

            System.out.println("Request is accepted.");
        } else {
            System.out.println("There is no such sender or receiver.");
        }
    }

    // getting friends function (for /friends)
    public List<String> getFriends(String nickname){
        User user = userRepository.findByNickname(nickname).get();
        return user.getFriends();
    }

    /*
        MessageController
    */

    // saving message function (for /message/send)
    public void saveMessage (Message message){
        String content = message.getContent();
        String senderNickname =  message.getSenderNickname();
        String receiverNickname = message.getReceiverNickname();

        User sender = userRepository.findByNickname(senderNickname).get();
        userRepository.delete(sender);
        sender.getMessages().add(content);
        userRepository.save(sender);

        User receiver = userRepository.findByNickname(receiverNickname).get();
        userRepository.delete(receiver);
        receiver.getMessages().add(content);
        userRepository.save(receiver);
    }
}
