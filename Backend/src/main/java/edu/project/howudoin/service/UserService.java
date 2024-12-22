package edu.project.howudoin.service;
import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.model.Message;
import edu.project.howudoin.model.User;
import edu.project.howudoin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    // UserController

    // generating id
    public int generateUserId(){
        return (int) userRepository.count();
    }

    // getting user by nickname function
    public User getUser(String nickname) {
        return userRepository.findByNickname(nickname).get();
    }

    // getting user by email function
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).get();
    }

    // checking if user exists or not
    public boolean userCheck(String nickname){
        return userRepository.existsByNickname(nickname);
    }

    // Friend Request Controller

    // adding friend function (for /friends/accept)
    public String addFriend(FriendRequest request) {
        String senderNickname = request.getSender();
        String receiverNickname = request.getReceiver();

        User sender;
        User receiver;

        if (userRepository.existsByNickname(senderNickname) && userRepository.existsByNickname(receiverNickname)) {
            sender = userRepository.findByNickname(senderNickname).get();
            receiver = userRepository.findByNickname(receiverNickname).get();

            userRepository.delete(sender);
            sender.getFriends().add(receiverNickname);
            userRepository.save(sender);

            userRepository.delete(receiver);
            receiver.getFriends().add(senderNickname);
            userRepository.save(receiver);

            return "Request is accepted.";
        } else {
            return "There is no such sender or receiver.";
        }
    }

    // getting friends function (for /friends)
    public List<String> getFriends(String nickname) {
        User user = getUser(nickname);
        return user.getFriends();
    }

    // Message Controller

    // saving message function (for /message/send)
    public void saveMessage (Message message){
        String sender =  message.getSender();
        String receiver = message.getReceiver();

        User senderUser = userRepository.findByNickname(sender).get();
        userRepository.delete(senderUser);
        senderUser.getMessages().add(message);
        userRepository.save(senderUser);

        User receiverUser = userRepository.findByNickname(receiver).get();
        userRepository.delete(receiverUser);
        receiverUser.getMessages().add(message);
        userRepository.save(receiverUser);
    }

    // Group Controller

    // adding group to user
    public void addToGroups(String nickname, Integer groupId) {
        User user = getUser(nickname);
        userRepository.delete(user);
        user.getGroups().add(groupId);
        userRepository.save(user);
    }

    // getting groups function (for /groups)
    public List<Integer> getGroups(String nickname) {
        User user = getUser(nickname);
        return user.getGroups();
    }

}
