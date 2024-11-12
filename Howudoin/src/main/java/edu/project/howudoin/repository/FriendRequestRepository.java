package edu.project.howudoin.repository;
import edu.project.howudoin.model.FriendRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FriendRequestRepository extends MongoRepository<FriendRequest, Integer> {

}
