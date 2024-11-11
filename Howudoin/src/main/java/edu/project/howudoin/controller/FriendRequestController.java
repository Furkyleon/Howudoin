package edu.project.howudoin.controller;

import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.service.FriendRequestService;
import edu.project.howudoin.model.User;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendRequestController {
    @Autowired
    private FriendRequestService friendRequestService;

    @Autowired
    private UserService userService;

    // POST /friends/add: Send a friend request
    @PostMapping("/add")
    public void sendRequest(@RequestParam("id") int id,
                            @RequestParam("senderId") int senderId,
                            @RequestParam("receiverId") int receiverId)
    {
        User sender = userService.getUser(senderId);
        User receiver = userService.getUser(receiverId);
        FriendRequest friendRequest = new FriendRequest(id, sender, receiver, false);
        friendRequestService.sendRequest(friendRequest);
    }

    // it does not work!!!
    // POST /friends/accept: Accept a friend request (If there is a friend request)
    @PostMapping("/accept")
    public void acceptRequest(@RequestParam("id") int id)
    {
        FriendRequest request = friendRequestService.getRequest(id);
        friendRequestService.acceptRequest(request);
    }

    // I did not try
    // GET /friends: Retrieve friend list
    @GetMapping("/")
    public List<User> getFriends(@RequestParam int userId)
    {
        return friendRequestService.getFriends(userId);
    }

//    @GetMapping("/get-requests")
//    public List<FriendRequest> getRequests(@RequestParam int userId) {
//        return friendRequestService.getRequests(userId);
//    }
}
