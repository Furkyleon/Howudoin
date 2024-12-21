package edu.project.howudoin.controller;

import edu.project.howudoin.model.Group;
import edu.project.howudoin.model.Message;
import edu.project.howudoin.security.JwtUtil;
import edu.project.howudoin.service.GroupService;
import edu.project.howudoin.service.MessageService;
import edu.project.howudoin.service.UserService;
import edu.project.howudoin.utils.APIResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
public class GroupController {

    @Autowired
    private GroupService groupService;
    @Autowired
    private UserService userService;
    @Autowired
    private MessageService messageService;
    @Autowired
    private JwtUtil jwtUtil;

    // GET /groups: Retrieve group list
    @GetMapping("/groups")
    public ResponseEntity<APIResponse<List<String>>> getAllGroups(@RequestHeader("Authorization") String token,
                                                                 @RequestParam("nickname") String nickname ) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        List<String> groups = groupService.getGroups(nickname);
        return ResponseEntity.ok(new APIResponse<>(1, "Groups are retrieved successfully!", groups));
    }

    // POST /groups/create: Creates a new group
    @PostMapping("/groups/create")
    public ResponseEntity<APIResponse<String>> createGroup(@RequestHeader("Authorization") String token,
                                                           @RequestBody Group group) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        List<String> invalidMembers = new ArrayList<>();
        for (String member : group.getMembers()) {
            if (!userService.userCheck(member)) {
                invalidMembers.add(member);
            }
        }

        if (!invalidMembers.isEmpty()) {
            return ResponseEntity.ok(new APIResponse<>(0, "These member(s) are not valid users: " + invalidMembers, null));
        }

        int id = groupService.generateGroupId();
        group.setId(id);
        group.getMembers().add(group.getCreatorName());

        for (String member : group.getMembers()) {
            userService.addToGroups(member, group.getGroupName());
        }

        groupService.saveGroup(group);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new APIResponse<>(1, "Group is created.", null));
    }

    // POST /groups/{groupId}/add-member: Adds a new member to an existing group.
    @PostMapping("/groups/{groupId}/add-member")
    public ResponseEntity<APIResponse<String>> addMemberToGroup(@RequestHeader("Authorization") String token,
                                                                @PathVariable("groupId") int groupId,
                                                                @RequestParam("memberName") String memberName) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        boolean userExists = userService.userCheck(memberName);
        boolean memberAlreadyInGroup = groupService.memberCheck(groupId, memberName);

        if (memberAlreadyInGroup) {
            return ResponseEntity.ok(new APIResponse<>(0, "Invalid Token", null));
        } else if (!userExists) {
            return ResponseEntity.ok(new APIResponse<>(0, "There is no such user named " + memberName + ".", null));
        }

        Group group = groupService.getGroup(groupId);
        userService.addToGroups(memberName, group.getGroupName());
        groupService.addMember(group, memberName);
        return ResponseEntity.ok(new APIResponse<>(1, "Member is added to the group.", null));
    }

    // POST /groups/{groupId}/send: Sends a message to all members of the specified group.
    @PostMapping("/groups/{groupId}/send")
    public ResponseEntity<APIResponse<String>> sendMessageToGroup(@RequestHeader("Authorization") String token,
                                                                  @PathVariable("groupId") int groupId,
                                                                  @RequestBody Message message) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        int id = groupService.generateMessageId();
        message.setId(id);
        message.setReceiver(groupService.getGroup(groupId).getGroupName());
        Group group = groupService.getGroup(groupId);
        groupService.sendMessage(group, message);

        return ResponseEntity.ok(new APIResponse<>(1, "Message is sent to the group.", null));
    }

    // GET /groups/{groupId}/messages: Retrieves the message history for the group.
    @GetMapping("/groups/{groupId}/messages")
    public ResponseEntity<APIResponse<List<Message>>> getMessagesOfGroup(@RequestHeader("Authorization") String token,
                                                                         @PathVariable("groupId") int groupId) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        Group group = groupService.getGroup(groupId);
        return ResponseEntity.ok(new APIResponse<>(1, "Messages are retrieved successfully!", group.getMessages()));
    }

    // GET /groups/{groupId}/members: Retrieves the list of members for the group.
    @GetMapping("/groups/{groupId}/members")
    public ResponseEntity<APIResponse<List<String>>> getMembersOfGroup(@RequestHeader("Authorization") String token,
                                                                       @PathVariable("groupId") int groupId) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        Group group = groupService.getGroup(groupId);
        return ResponseEntity.ok(new APIResponse<>(1, "Members are retrieved successfully!", group.getMembers()));
    }

    private String extractJwt(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header must start with 'Bearer '");
        }
        return token.substring(7);
    }
}
