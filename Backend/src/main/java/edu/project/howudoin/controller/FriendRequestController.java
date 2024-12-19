package edu.project.howudoin.controller;

import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.security.JwtUtil;
import edu.project.howudoin.service.FriendRequestService;
import edu.project.howudoin.utils.APIResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FriendRequestController {

    @Autowired
    private FriendRequestService friendRequestService;

    @Autowired
    private JwtUtil jwtUtil;

    // POST /friends/add: Send a friend request
    @PostMapping("/friends/add")
    public APIResponse<String> sendRequest(@RequestHeader("Authorization") String token,
                                           @RequestBody FriendRequest friendRequest) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return new APIResponse<>(0, "ERROR", "Invalid Token");
        }

        int id = friendRequestService.generateRequestId();
        String senderNickname = friendRequest.getSender();
        String receiverNickname = friendRequest.getReceiver();
        FriendRequest request = new FriendRequest(id, senderNickname, receiverNickname, false);
        String resultMessage = friendRequestService.sendRequest(request);

        return new APIResponse<>(1, resultMessage, null);
    }

    // GET /friends/requests: Retrieve pending friend requests
    @GetMapping("/friends/requests")
    public ResponseEntity<APIResponse<List<FriendRequest>>> getFriendRequests(
            @RequestHeader("Authorization") String token,
            @RequestParam("receiverNickname") String receiverNickname) {

        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        List<FriendRequest> friendRequests = friendRequestService.getPendingRequests(receiverNickname);

        if (friendRequests.isEmpty()) {
            return ResponseEntity.ok(new APIResponse<>(1, "No pending friend requests.", friendRequests));
        }

        return ResponseEntity.ok(new APIResponse<>(1, "Friend requests retrieved successfully.", friendRequests));
    }

    // POST /friends/accept: Accept a friend request
    @PostMapping("/friends/accept")
    public ResponseEntity<APIResponse<String>> acceptRequest(@RequestHeader("Authorization") String token,
                                                             @RequestParam("senderNickname") String senderNickname,
                                                             @RequestParam("receiverNickname") String receiverNickname) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new APIResponse<>(0, "Invalid Token", null));
        }

        if (!friendRequestService.checkExist(senderNickname, receiverNickname)) {
            return ResponseEntity.ok(new APIResponse<>(0, "There is no such request.", null));
        }

        boolean pending = friendRequestService.checkRequest(senderNickname, receiverNickname);
        if (!pending) {
            return ResponseEntity.ok(new APIResponse<>(0, "You are already friends with " + receiverNickname + ".", null));
        }

        String result = friendRequestService.acceptRequest(senderNickname, receiverNickname);
        return ResponseEntity.ok(new APIResponse<>(1, "Friend request accepted successfully.", result));
    }


    // GET /friends: Retrieve friend list
    @GetMapping("/friends")
    public ResponseEntity<APIResponse<List<String>>> getFriends(@RequestHeader("Authorization") String token,
                                        @RequestParam String nickname) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new APIResponse<>(0, "Invalid token!", null));
        }

        List<String> friends = friendRequestService.getFriends(nickname);
        return ResponseEntity.ok(new APIResponse<>(1, "Friends retrieved successfully!", friends));
    }

    private String extractJwt(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header must start with 'Bearer '");
        }
        return token.substring(7);
    }
}
