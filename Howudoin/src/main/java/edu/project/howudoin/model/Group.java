package edu.project.howudoin.model;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Group {
    private int id;
    private String groupName;
    private String creatorName;
    private List<String> members =  new ArrayList<>();
    private List<Message> messages = new ArrayList<>();
}
