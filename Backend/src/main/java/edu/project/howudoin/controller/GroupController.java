package edu.project.howudoin.controller;

import edu.project.howudoin.model.Group;
import edu.project.howudoin.model.Message;
import edu.project.howudoin.security.JwtUtil;
import edu.project.howudoin.service.GroupService;
import edu.project.howudoin.service.UserService;
import edu.project.howudoin.utils.APIResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // GET /groups: Retrieve group list
    @GetMapping("/groups")
    public ResponseEntity<APIResponse<List<Map<String, Object>>>> getAllGroups(@RequestHeader("Authorization") String token,
                                                                               @RequestParam("nickname") String nickname) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        List<Integer> groupIds = groupService.getGroups(nickname);
        List<String> groupNames = groupService.getGroupNames(nickname);
        List<Map<String, Object>> groups = new ArrayList<>();

        for (int i = 0; i < groupIds.size(); i++) {
            Map<String, Object> group = new HashMap<>();
            group.put("id", groupIds.get(i));
            group.put("name", groupNames.get(i));
            groups.add(group);
        }

        return ResponseEntity.ok(new APIResponse<>(1, "Groups retrieved successfully!", groups));
    }

    // GET /groups/{groupId}/details: Retrieving group details
    @GetMapping("/groups/{groupId}/details")
    public ResponseEntity<APIResponse<Map<String, Object>>> getGroupDetails(@RequestHeader("Authorization") String token,
                                                                            @PathVariable("groupId") int groupId) {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new APIResponse<>(0, "Invalid Token", null));
        }

        Group group = groupService.getGroup(groupId);
        if (group == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new APIResponse<>(0, "Group not found", null));
        }

        Map<String, Object> groupDetails = new HashMap<>();
        groupDetails.put("id", group.getId());
        groupDetails.put("name", group.getGroupName());
        groupDetails.put("createdTime", group.getCreatedTime());
        groupDetails.put("members", group.getMembers());

        return ResponseEntity.ok(new APIResponse<>(1, "Group details retrieved successfully!", groupDetails));
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
        group.setCreatedTime(LocalDateTime.now());

        for (String member : group.getMembers()) {
            userService.addToGroups(member, group.getId());
        }

        groupService.saveGroup(group);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new APIResponse<>(1, "Group is created.", null));
    }

    // POST /groups/{groupId}/add-member: Adds a new member to an existing group
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
        userService.addToGroups(memberName, group.getId());
        groupService.addMember(group, memberName);

        return ResponseEntity.ok(new APIResponse<>(1, "Member is added to the group.", null));
    }

    // POST /groups/{groupId}/send: Sends a message to all members of the specified group
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

    // GET /groups/{groupId}/messages: Retrieves the message history for the group
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
        List<Message> groupMessages = group.getMessages();

        return ResponseEntity.ok(new APIResponse<>(1, "Messages are retrieved successfully!", groupMessages));
    }

    // GET /groups/{groupId}/members: Retrieves the list of members for the group
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
