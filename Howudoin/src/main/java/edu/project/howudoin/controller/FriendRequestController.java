package edu.project.howudoin.controller;

import edu.project.howudoin.model.FriendRequest;
import edu.project.howudoin.service.FriendRequestService;
import edu.project.howudoin.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
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
    public String sendRequest(@RequestHeader("Authorization") String token,
                              @RequestParam("senderNickname") String senderNickname,
                              @RequestParam("receiverNickname") String receiverNickname)
    {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (jwtUtil.validateToken(jwt, email)) {
            int id = friendRequestService.generateRequestId();
            FriendRequest request = new FriendRequest(id, senderNickname, receiverNickname, false);
            return friendRequestService.sendRequest(request);
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }

    // POST /friends/accept: Accept a friend request (If there is a friend request)
    @PostMapping("/friends/accept")
    public String acceptRequest(@RequestHeader("Authorization") String token,
                                @RequestParam("senderNickname") String senderNickname,
                                @RequestParam("receiverNickname") String receiverNickname)
    {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (jwtUtil.validateToken(jwt, email)) {
            return friendRequestService.acceptRequest(senderNickname, receiverNickname);
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }

    // GET /friends: Retrieve friend list
    @GetMapping("/friends")
    public List<String> getFriends(@RequestHeader("Authorization") String token,
                                   @RequestParam String nickname)
    {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (jwtUtil.validateToken(jwt, email)) {
            return friendRequestService.getFriends(nickname);
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }

    private String extractJwt(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header must start with 'Bearer '");
        }
        return token.substring(7);
    }
}
