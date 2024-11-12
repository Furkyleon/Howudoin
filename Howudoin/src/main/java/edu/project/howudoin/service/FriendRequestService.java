package edu.project.howudoin.service;

import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.model.User;
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

    // sending request function
    public void sendRequest(FriendRequest request){
        friendRequestRepository.save(request);
    }

    public int generateRequestId(){
        return (int)friendRequestRepository.count();
    }

    // accepting request function
    public void acceptRequest(String senderNickname, String receiverNickname){
        FriendRequest request;
        if (friendRequestRepository.existsBySenderNicknameAndReceiverNickname(senderNickname, receiverNickname)) {
            request = friendRequestRepository.findBySenderNicknameAndReceiverNickname(senderNickname, receiverNickname).get();

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
