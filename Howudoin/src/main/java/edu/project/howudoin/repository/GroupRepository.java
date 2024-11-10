package edu.project.howudoin.repository;
import edu.project.howudoin.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface GroupRepository extends MongoRepository<Group, Integer> {}