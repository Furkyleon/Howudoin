package edu.project.howudoin.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequest {
    private int id;
    private User sender;
    private User receiver;
    private boolean isAccepted;
}
