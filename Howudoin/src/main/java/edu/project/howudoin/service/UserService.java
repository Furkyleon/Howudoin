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

    // register function
    public void register(User user) {
        String email = user.getEmail();
        String nickname = user.getNickname();
        boolean check1 = userRepository.existsByEmail(email);
        boolean check2 = userRepository.existsByEmail(nickname);

        if (check1 && check2) {
            System.out.println("Both email and nickname are already registered.");
        }
        else if (check1) {
            System.out.println("Email already registered.");
        }
        else if (check2) {
            System.out.println("Nickname already registered.");
        }
        else {
            userRepository.save(user);
        }
    }

    // login function
    public void login(String email, String password) {
        boolean check = userRepository.existsByEmail(email);
        if (check){
            User user = userRepository.findByEmail(email).get();
            if (user.getPassword().equals(password)) {
                System.out.println("Successfully login!");
            }
            else {
                System.out.println("Incorrect password!");
            }
        }
        else {
            System.out.println("Incorrect email!");
        }
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
        String senderNickname = request.getSender();
        String receiverNickname = request.getReceiver();

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
    public List<String> getFriends(String nickname) {
        User user = userRepository.findByNickname(nickname).get();
        return user.getFriends();
    }

    /*
        MessageController
    */

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

    /*/
    / deleting function (but not mentioned in file)
    public void deleteUser(int id) {
        User user = userRepository.findById(id).get();
        // when user is deleted, remove from groups, other users' friends and friend requests
        userRepository.delete(user);
    }
    */
}
