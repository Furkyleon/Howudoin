package edu.project.howudoin.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer id;
    private String nickname;
    private String name;
    private String lastname;
    private String email;
    private String password;
    private List<User> friends = new ArrayList<>();
    private List<Message> messages = new ArrayList<>();
}
