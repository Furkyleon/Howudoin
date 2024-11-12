package edu.project.howudoin.repository;
import edu.project.howudoin.model.FriendRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface FriendRequestRepository extends MongoRepository<FriendRequest, Integer> {

    boolean existsBySenderNicknameAndReceiverNickname(String senderNickname, String receiverNickname);

    Optional<FriendRequest> findBySenderNicknameAndReceiverNickname(String senderNickname, String receiverNickname);
}
