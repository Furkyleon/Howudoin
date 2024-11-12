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
    public User getUser(int id) {
        return userRepository.findById(id).get();
    }

    // getting users function
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    /*
        FriendRequestController
    */

    // adding friend function (for /friends/accept)
    public void addFriend(FriendRequest request){
        int senderId = request.getSenderId();
        int receiverId = request.getReceiverId();

        User sender;
        User receiver;

        if (userRepository.existsById(senderId) && userRepository.existsById(receiverId)) {
            System.out.println("Both sender and receiver exist.");
            sender = userRepository.findById(senderId).get();
            receiver = userRepository.findById(receiverId).get();

            sender.getFriends().add(receiverId);
            userRepository.save(sender);

            receiver.getFriends().add(senderId);
            userRepository.save(receiver);

            System.out.println("Request is accepted.");
        }
        else {
            System.out.println("There is no such sender or receiver.");
        }
    }

    // getting friends function (for /friends)
    public List<User> getFriends(int userId){
        User user = userRepository.findById(userId).get();
        List<Integer> friendsId = user.getFriends();
        List<User> friends = new ArrayList<>();
        User friendUser;
        for (Integer friend : friendsId) {
            friendUser = userRepository.findById(friend).get();
            friends.add(friendUser);
        }
        return friends;
    }

    /*
        MessageController
    */

    // saving message function (for /message/send)
    public void saveMessage(Message message){
        String content = message.getContent();
        int senderId =  message.getSenderId();
        int receiverId = message.getReceiverId();

        User sender = userRepository.findById(senderId).get();
        sender.getMessages().add(content);
        User receiver = userRepository.findById(receiverId).get();
        receiver.getMessages().add(content);

        userRepository.save(sender);
        userRepository.save(receiver);
    }
}
