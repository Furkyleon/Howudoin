package edu.project.howudoin.service;
import edu.project.howudoin.model.User;
import edu.project.howudoin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public void deleteUser(int id) {
        User user = userRepository.findById(id).get();
        userRepository.delete(user);
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }
}
