package edu.project.howudoin.repository;
import edu.project.howudoin.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, Integer> {
    boolean existsByNickname(String nickname);

    Optional<User> findByNickname(String nickname);
}