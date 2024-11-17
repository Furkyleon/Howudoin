package edu.project.howudoin.service;

import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.repository.FriendRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FriendRequestService {
    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private UserService userService;

    // generating id
    public int generateRequestId(){
        return (int) friendRequestRepository.count();
    }

    // sending request function
    public void sendRequest(FriendRequest request){
        String sender = request.getSender();
        String receiver = request.getReceiver();

        boolean check1 = friendRequestRepository.existsBySenderAndReceiver(sender, receiver);
        boolean check2 = friendRequestRepository.existsBySenderAndReceiver(receiver, sender);

        if (check1){
            System.out.println("You have already sent an request to receiver.");
        }
        else if (check2){
            System.out.println("The receiver already sent an request to you. You can accept the request.");
        }
        else {
            friendRequestRepository.save(request);
        }
    }

    // accepting request function
    public void acceptRequest(String senderNickname, String receiverNickname){
        FriendRequest request;
        if (friendRequestRepository.existsBySenderAndReceiver(senderNickname, receiverNickname)) {
            request = friendRequestRepository.findBySenderAndReceiver(senderNickname, receiverNickname).get();

            friendRequestRepository.delete(request);
            request.setAccepted(true);
            friendRequestRepository.save(request);

            userService.addFriend(request);
        }
        else {
            System.out.println("There is no such request.");
        }
    }

    // getting friends function
    public List<String> getFriends(String nickname) {
        return userService.getFriends(nickname);
    }
}
