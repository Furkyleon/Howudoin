package edu.project.howudoin.service;

import edu.project.howudoin.model.Group;
import edu.project.howudoin.model.Message;
import edu.project.howudoin.model.User;
import edu.project.howudoin.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupService {
    @Autowired
    private GroupRepository groupRepository;

    // generating id
    public int generateGroupId(){
        return (int) groupRepository.count();
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
    }
}
