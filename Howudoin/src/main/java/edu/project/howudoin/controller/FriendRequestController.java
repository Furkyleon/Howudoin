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
    public void sendRequest(@RequestParam("senderNickname") String senderNickname,
                            @RequestParam("receiverNickname") String receiverNickname)
    {
        int id = friendRequestService.generateRequestId();
        FriendRequest request = new FriendRequest(id, senderNickname, receiverNickname, false);
        friendRequestService.sendRequest(request);
    }

    // POST /friends/accept: Accept a friend request (If there is a friend request)
    // maybe receiver can accept request by using sender username (?)
    @PostMapping("/friends/accept")
    public void acceptRequest(@RequestParam("senderNickname") String senderNickname,
                              @RequestParam("receiverNickname") String receiverNickname)
    {
        friendRequestService.acceptRequest(senderNickname, receiverNickname);
    }

    // GET /friends: Retrieve friend list
    @GetMapping("/friends")
    public List<String> getFriends(@RequestParam String nickname)
    {
        return friendRequestService.getFriends(nickname);
    }
}
