package edu.project.howudoin.controller;

import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.service.FriendRequestService;
import edu.project.howudoin.model.User;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FriendRequestController {
    @Autowired
    private FriendRequestService friendRequestService;

    @Autowired
    private UserService userService;

    // POST /friends/add: Send a friend request
    // if there is request from sender to receiver, receiver cannot send friend request.
    // receiver should accept the request that sender sent (?).
    @PostMapping("/friends/add")
    public void sendRequest(@RequestParam("id") int id,
                            @RequestParam("senderId") int senderId,
                            @RequestParam("receiverId") int receiverId)
    {
        FriendRequest request = new FriendRequest(id, senderId, receiverId, false);
        friendRequestService.sendRequest(request);
    }

    // POST /friends/accept: Accept a friend request (If there is a friend request)
    // maybe receiver can accept request by using sender username (?)
    @PostMapping("/friends/accept")
    public void acceptRequest(@RequestParam("requestId") int requestId)
    {
        System.out.println("First");
        friendRequestService.acceptRequest(requestId);
    }

    // GET /friends: Retrieve friend list
    @GetMapping("/friends")
    public List<User> getFriends(@RequestParam int userId)
    {
        return friendRequestService.getFriends(userId);
    }
}
