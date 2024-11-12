package edu.project.howudoin.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GroupController {

    // POST /groups/create: Creates a new group with a given name and members.
    @PostMapping("/groups/create")
    public void createGroup(){

    }

    // POST /groups/:groupId/add-member: Adds a new member to an existing group.
    @PostMapping("/groups/{groupId}/add-member")
    public void addMemberToGroup(@PathVariable("groupId") int groupId){

    }

    // POST /groups/:groupId/send: Sends a message to all members of the specified group.
    @PostMapping("/groups/{groupId}/send")
    public void sendMessageToGroup(@PathVariable("groupId") int groupId){

    }

    // GET /groups/:groupId/messages: Retrieves the message history for the specified group.
    @GetMapping("/groups/{groupId}/messages")
    public void getMessagesOfGroup(@PathVariable("groupId") int groupId){

    }

    // GET /groups/:groupId/members: Retrieves the list of members for the specified group.
    @GetMapping("/groups/{groupId}/members")
    public void getMembersOfGroup(@PathVariable("groupId") int groupId){

    }
}
