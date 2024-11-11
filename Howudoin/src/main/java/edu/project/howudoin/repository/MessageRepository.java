package edu.project.howudoin.repository;
import edu.project.howudoin.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, Integer> {
    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(int userId1, int userId2, String userId11, String userId21);
}