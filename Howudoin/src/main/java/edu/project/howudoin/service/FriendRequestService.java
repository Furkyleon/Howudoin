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

    public void sendRequest(FriendRequest request){
        friendRequestRepository.save(request);
    }

    public void acceptRequest(FriendRequest request){
        request.setAccepted(true);
        friendRequestRepository.save(request);
        userService.addFriend(request);
    }

    public List<User> getFriends(int userId) {
        return userService.getFriends(userId);
    }

    public FriendRequest getRequest(int id){
        FriendRequest request = friendRequestRepository.findById(id).get();
        return request;
    }

    public List<FriendRequest> getRequests(Integer userId){
        return friendRequestRepository.findAll();
    }
}
