package edu.project.howudoin.controller;

import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.service.FriendRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FriendRequestController {
    @Autowired
    private FriendRequestService friendRequestService;

    @PutMapping("/add/{id}/{senderId}/{receiverId}")
    public void sendRequest(@PathVariable("id") int id,
                            @PathVariable("senderId") int senderId,
                            @PathVariable("receiverId") int receiverId)
    {
        FriendRequest friendRequest = new FriendRequest(id, senderId, receiverId, false);
        friendRequestService.sendRequest(friendRequest);
    }

    @PostMapping("/accept/{id}")
    public void acceptRequest(@PathVariable("id") int id)
    {
        FriendRequest request = friendRequestService.getRequest(id);
        friendRequestService.acceptRequest(request);
    }

    @GetMapping("/getrequests")
    public List<FriendRequest> getRequests(@RequestParam int userId) {
        return friendRequestService.getRequests(userId);
    }
}
