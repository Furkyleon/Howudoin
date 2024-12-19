package edu.project.howudoin.controller;

import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.security.JwtUtil;
import edu.project.howudoin.service.FriendRequestService;
import edu.project.howudoin.utils.APIResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
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

    // POST /friends/accept: Accept a friend request
    @PostMapping("/friends/accept")
    public ResponseEntity<String> acceptRequest(@RequestHeader("Authorization") String token,
                                                @RequestParam("senderNickname") String senderNickname,
                                                @RequestParam("receiverNickname") String receiverNickname) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Token");
        }

        if (!friendRequestService.checkExist(senderNickname, receiverNickname)) {
            return ResponseEntity.ok("There is no such request.");
        }

        boolean pending = friendRequestService.checkRequest(senderNickname, receiverNickname);
        if (!pending) {
            return ResponseEntity.ok("You are already friends with " + receiverNickname + ".");
        }

        String result = friendRequestService.acceptRequest(senderNickname, receiverNickname);
        return ResponseEntity.ok(result);
    }

    // GET /friends: Retrieve friend list
    @GetMapping("/friends")
    public ResponseEntity<?> getFriends(@RequestHeader("Authorization") String token,
                                        @RequestParam String nickname) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Token");
        }

        List<String> friends = friendRequestService.getFriends(nickname);
        // If you want a structured response like APIResponse, you could do:
        // return ResponseEntity.ok(new APIResponse<>(1, "SUCCESS", friends));
        // But to mirror the product controller style (which returns raw lists), we can do:
        return ResponseEntity.ok(friends);
    }

    private String extractJwt(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header must start with 'Bearer '");
        }
        return token.substring(7);
    }
}
