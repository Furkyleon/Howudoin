package edu.project.howudoin.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequest {
    private int id;
    private String sender;
    private String receiver;
    private boolean isAccepted;
}
