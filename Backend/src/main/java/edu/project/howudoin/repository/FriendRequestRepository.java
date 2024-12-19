package edu.project.howudoin.repository;
import edu.project.howudoin.model.FriendRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends MongoRepository<FriendRequest, Integer> {

    boolean existsBySenderAndReceiver(String sender, String receiver);

    Optional<FriendRequest> findBySenderAndReceiver(String sender, String receiver);
    Optional<List<FriendRequest>> findByReceiver(String receiver);
}
