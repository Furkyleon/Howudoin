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

    @PostMapping("/friends/add")
    public void sendRequest(@RequestHeader("Authorization") String token,
                            @RequestParam("senderNickname") String senderNickname,
                            @RequestParam("receiverNickname") String receiverNickname) {
        String jwt = extractJwt(token);

        String email = jwtUtil.extractEmail(jwt);
        if (jwtUtil.validateToken(jwt, email)) {
            friendRequestService.sendRequest(new FriendRequest(0, senderNickname, receiverNickname, false));
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }

    @PostMapping("/friends/accept")
    public void acceptRequest(@RequestHeader("Authorization") String token,
                              @RequestParam("senderNickname") String senderNickname,
                              @RequestParam("receiverNickname") String receiverNickname) {
        String jwt = extractJwt(token);

        String email = jwtUtil.extractEmail(jwt);
        if (jwtUtil.validateToken(jwt, email)) {
            friendRequestService.acceptRequest(senderNickname, receiverNickname);
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }

    @GetMapping("/friends")
    public List<String> getFriends(@RequestHeader("Authorization") String token,
                                   @RequestParam String nickname) {
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





/*
@RestController
public class FriendRequestController {
    @Autowired
    private FriendRequestService friendRequestService;

    @Autowired
    private UserService userService;

    // POST /friends/add: Send a friend request
    @PostMapping("/friends/add")
    public void sendRequest(@RequestParam("senderNickname") String senderNickname,
                            @RequestParam("receiverNickname") String receiverNickname)
    {
        int id = friendRequestService.generateRequestId();
        FriendRequest request = new FriendRequest(id, senderNickname, receiverNickname, false);
        friendRequestService.sendRequest(request);
    }

    // POST /friends/accept: Accept a friend request (If there is a friend request)
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
*/