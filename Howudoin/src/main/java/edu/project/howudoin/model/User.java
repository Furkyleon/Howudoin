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
    private int id;
    private String nickname;
    private String name;
    private String lastname;
    private String email;
    private String password;
    private List<Integer> friendsId = new ArrayList<>();
}
