package edu.project.howudoin.controller;

import edu.project.howudoin.model.Group;
import edu.project.howudoin.model.Message;
import edu.project.howudoin.service.GroupService;
import edu.project.howudoin.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class GroupController {
    @Autowired
    private GroupService groupService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/groups/create")
    public void createGroup(@RequestHeader("Authorization") String token, @RequestBody Group group) {
        String jwt = extractJwt(token);

        String email = jwtUtil.extractEmail(jwt);
        if (jwtUtil.validateToken(jwt, email)) {
            int id = groupService.generateGroupId();
            group.setId(id);
            group.getMembers().add(group.getCreatorName());
            groupService.saveGroup(group);
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }

    @PostMapping("/groups/{groupId}/add-member")
    public void addMemberToGroup(@RequestHeader("Authorization") String token,
                                 @PathVariable("groupId") int groupId,
                                 @RequestParam("memberName") String memberName) {
        String jwt = extractJwt(token);

        String email = jwtUtil.extractEmail(jwt);
        if (jwtUtil.validateToken(jwt, email)) {
            groupService.addMember(groupService.getGroup(groupId), memberName);
        } else {
            throw new RuntimeException("Invalid Token");
        }
    }

    @PostMapping("/groups/{groupId}/send")
    public void sendMessageToGroup(@RequestHeader("Authorization") String token,
                                   @PathVariable("groupId") int groupId,
                                   @RequestBody Message message) {
        String jwt = extractJwt(token);

        String email = jwtUtil.extractEmail(jwt);
        if (jwtUtil.validateToken(jwt, email)) {
            message.setReceiver(groupService.getGroup(groupId).getGroupName());
            Group group = groupService.getGroup(groupId);
            groupService.sendMessage(group, message);
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
