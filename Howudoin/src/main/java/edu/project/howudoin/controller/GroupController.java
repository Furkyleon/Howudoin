package edu.project.howudoin.controller;

import edu.project.howudoin.model.Group;
import edu.project.howudoin.model.Message;
import edu.project.howudoin.service.GroupService;
import edu.project.howudoin.security.JwtUtil;
import edu.project.howudoin.service.MessageService;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
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

    // POST /groups/create: Creates a new group with a given name and members.
    @PostMapping("/groups/create")
    public String createGroup(@RequestHeader("Authorization") String token,
                              @RequestBody Group group)
    {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        List<String> wrongMembers = new ArrayList<>();
        boolean checkMembers = true;
        for (int i=0; i<group.getMembers().size(); i++) {
            if (!userService.userCheck(group.getMembers().get(i))) {
                checkMembers = false;
                wrongMembers.add(group.getMembers().get(i));
            }
        }

        if (!checkMembers) {
            return "These member(s) are not a valid user: " + wrongMembers;
        }
        else {
            if (jwtUtil.validateToken(jwt, email)) {
                int id = groupService.generateGroupId();
                group.setId(id);
                group.getMembers().add(group.getCreatorName());

                for (int i=0; i<group.getMembers().size(); i++) {
                    userService.addToGroups(group.getMembers().get(i), group.getGroupName());
                }

                groupService.saveGroup(group);
                return "Group is created.";
            } else {
                throw new RuntimeException("Invalid Token");
            }
        }
    }

    // POST /groups/:groupId/add-member: Adds a new member to an existing group.
    @PostMapping("/groups/{groupId}/add-member")
    public String addMemberToGroup(@RequestHeader("Authorization") String token,
                                   @PathVariable("groupId") int groupId,
                                   @RequestParam("memberName") String memberName)
    {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (jwtUtil.validateToken(jwt, email)) {
            boolean check1 = userService.userCheck(memberName);
            boolean check2 = groupService.memberCheck(groupId, memberName);

            if (check2){
                return "This member is already in the group.";
            }
            else if (check1){
                Group group = groupService.getGroup(groupId);
                userService.addToGroups(memberName, group.getGroupName());
                groupService.addMember(group, memberName);
                return "Member is added to the group.";
            }
            else {
                return "There is no such user named " + memberName + ".";
            }
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }

    // POST /groups/:groupId/send: Sends a message to all members of the specified group.
    @PostMapping("/groups/{groupId}/send")
    public String sendMessageToGroup(@RequestHeader("Authorization") String token,
                                     @PathVariable("groupId") int groupId,
                                     @RequestBody Message message)
    {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (jwtUtil.validateToken(jwt, email)) {
            int id = groupService.generateMessageId();
            message.setId(id);
            message.setReceiver(groupService.getGroup(groupId).getGroupName());
            Group group = groupService.getGroup(groupId);
            groupService.sendMessage(group, message);
            return "Message is sent to the group.";
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }

    // GET /groups/:groupId/messages: Retrieves the message history for the specified group.
    @GetMapping("/groups/{groupId}/messages")
    public List<Message> getMessagesOfGroup(@RequestHeader("Authorization") String token,
                                            @PathVariable("groupId") int groupId)
    {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            throw new RuntimeException("Invalid Token");
        }

        Group group = groupService.getGroup(groupId);
        return group.getMessages();
    }

    // GET /groups/:groupId/members: Retrieves the list of members for the specified group.
    @GetMapping("/groups/{groupId}/members")
    public List<String> getMembersOfGroup(@RequestHeader("Authorization") String token,
                                          @PathVariable("groupId") int groupId)
    {
        String jwt = extractJwt(token);
        String email = jwtUtil.extractEmail(jwt);

        if (!jwtUtil.validateToken(jwt, email)) {
            throw new RuntimeException("Invalid Token");
        }

        Group group = groupService.getGroup(groupId);
        return group.getMembers();
    }

    private String extractJwt(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header must start with 'Bearer '");
        }
        return token.substring(7);
    }
}