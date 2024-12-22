package edu.project.howudoin.service;

import edu.project.howudoin.model.Group;
import edu.project.howudoin.model.Message;
import edu.project.howudoin.repository.GroupRepository;
import edu.project.howudoin.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GroupService {
    @Autowired
    private UserService userService;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private MessageRepository messageRepository;

    // generating id
    public int generateGroupId(){
        return (int) groupRepository.count();
    }

    // generating message id
    public int generateMessageId(){
        return (int) messageRepository.count();
    }

    // saving group to database
    public void saveGroup(Group group) {
        groupRepository.save(group);
    }

    // getting group by id
    public Group getGroup(int groupId) {
        return groupRepository.findById(groupId).get();
    }

    // adding member to group
    public void addMember(Group group, String memberName) {
        groupRepository.delete(group);
        group.getMembers().add(memberName);
        groupRepository.save(group);
    }

    // sending message to group
    public void sendMessage(Group group, Message message) {
        groupRepository.delete(group);
        group.getMessages().add(message);
        groupRepository.save(group);
        messageRepository.save(message);
    }

    // checking if a member is in a group or not
    public boolean memberCheck(int groupId, String memberName) {
        Group group = groupRepository.findById(groupId).get();
        return group.getMembers().contains(memberName);
    }

    // getting groups of a user
    public List<Integer> getGroups(String nickname) {
        return userService.getGroups(nickname);
    }

    // getting group names of a user
    public List<String> getGroupNames(String nickname) {
        List<Integer> groupIds = getGroups(nickname);
        List<String> groupNames = new ArrayList<>();
        for (Integer groupId : groupIds) {
            Group group = groupRepository.findById(groupId).get();
            groupNames.add(group.getGroupName());
        }
        return groupNames;
    }
}
