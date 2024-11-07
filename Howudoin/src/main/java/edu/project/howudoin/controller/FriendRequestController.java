package edu.project.howudoin.controller;

import edu.project.howudoin.model.User;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

public class FriendRequestController {
    @Autowired
    private FriendRequestService friendRequestService;

    @PostMapping("/add")
    public FriendRequest sendRequest(@RequestBody FriendRequest request) {
        return friendRequestService.sendRequest(request);
    }

    @PostMapping("/accept")
    public FriendRequest acceptRequest(@RequestBody FriendRequest request) {
        return friendRequestService.acceptRequest(request);
    }

    @GetMapping
    public List<FriendRequest> getFriends(@RequestParam String userId) {
        return friendRequestService.getFriends(userId);
    }
}
