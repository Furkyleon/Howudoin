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

    // generating id
    public int generateUserId(){
        return (int) userRepository.count();
    }

    // saving user to database
    public void saveUser(User user) {
        userRepository.save(user);
    }

    // login function (not complete)
    public void login(String email, String password) {
        boolean check = userRepository.existsByEmail(email);
        if (check){
            User user = userRepository.findByEmail(email).get();
            if (user.getPassword().equals(password)) {
                System.out.println("Succesfully logined");
            }
            else {
                System.out.println("Incorrect password!");
            }
        }
        else {
            System.out.println("Incorrect email!");
        }

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

    // user check
    public boolean userCheck(String nickname){
        return userRepository.existsByNickname(nickname);
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
        String senderNickname =  message.getSenderNickname();
        String receiverNickname = message.getReceiverNickname();

        User sender = userRepository.findByNickname(senderNickname).get();
        userRepository.delete(sender);
        sender.getMessages().add(message);
        userRepository.save(sender);

        User receiver = userRepository.findByNickname(receiverNickname).get();
        userRepository.delete(receiver);
        receiver.getMessages().add(message);
        userRepository.save(receiver);
    }
}
