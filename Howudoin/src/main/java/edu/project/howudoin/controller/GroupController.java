package edu.project.howudoin.controller;

import edu.project.howudoin.model.Group;
import edu.project.howudoin.model.Message;
import edu.project.howudoin.service.GroupService;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class GroupController {
    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    // POST /groups/create: Creates a new group with a given name and members.
    @PostMapping("/groups/create")
    public void createGroup(@RequestBody Group group)
    {
        int id = groupService.generateGroupId();
        group.setId(id);
        group.getMembers().add(group.getCreatorName());
        groupService.saveGroup(group);
    }

    // POST /groups/:groupId/add-member: Adds a new member to an existing group.
    @PostMapping("/groups/{groupId}/add-member")
    public void addMemberToGroup(@PathVariable("groupId") int groupId,
                                 @RequestParam("memberName") String memberName)
    {
        boolean check = userService.userCheck(memberName);
        if (check){
            Group group = groupService.getGroup(groupId);
            groupService.addMember(group, memberName);
        }
        else {
            System.out.println("There is no such user named " + memberName);
        }
    }

    // POST /groups/:groupId/send: Sends a message to all members of the specified group.
    @PostMapping("/groups/{groupId}/send")
    public void sendMessageToGroup(@PathVariable("groupId") int groupId,
                                   @RequestBody Message message)
    {
        message.setReceiver(groupService.getGroup(groupId).getGroupName());
        Group group = groupService.getGroup(groupId);
        groupService.sendMessage(group, message);
    }

    // GET /groups/:groupId/messages: Retrieves the message history for the specified group.
    @GetMapping("/groups/{groupId}/messages")
    public void getMessagesOfGroup(@PathVariable("groupId") int groupId)
    {
        Group group = groupService.getGroup(groupId);
        List<Message> messages = group.getMessages();
        for (Message message : messages){
            System.out.println(message.getSender()+": "+message.getContent());
        }
    }

    // GET /groups/:groupId/members: Retrieves the list of members for the specified group.
    @GetMapping("/groups/{groupId}/members")
    public void getMembersOfGroup(@PathVariable("groupId") int groupId)
    {
        Group group = groupService.getGroup(groupId);
        List<String> members = group.getMembers();
        for (String member : members){
            System.out.println(member);
        }
    }
}
