package edu.project.howudoin.repository;
import edu.project.howudoin.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, Integer> {

}