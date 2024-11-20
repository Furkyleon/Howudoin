package edu.project.howudoin.controller;

import edu.project.howudoin.model.User;
import edu.project.howudoin.repository.UserRepository;
import edu.project.howudoin.security.JwtUtil;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;


@RestController
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;

    // POST /register: Register a new user (with name, last name, email, password)
    @PostMapping("/register")
    public String register(@RequestBody User user) {
        int id = userService.generateUserId();
        user.setId(id);
        user.setFriends(new ArrayList<>());
        user.setMessages(new ArrayList<>());

        String email = user.getEmail();
        String nickname = user.getNickname();
        boolean check1 = userRepository.existsByEmail(email);
        boolean check2 = userRepository.existsByEmail(nickname);

        if (check1 && check2) {
            return "Both email and nickname are already registered.";
        }
        else if (check1) {
            return "Email already registered.";
        }
        else if (check2) {
            return "Nickname already registered.";
        }
        else {
            userRepository.save(user);
            return "User is registered successfully.";
        }
    }

    // POST /login: Authenticate and login a user (with email and password)
    @PostMapping("/login")
    public String login(@RequestBody User userBody) {
        String email = userBody.getEmail();
        String password = userBody.getPassword();

        boolean check = userRepository.existsByEmail(email);
        if (check){
            User user = userRepository.findByEmail(email).get();
            if (user.getPassword().equals(password)) {
                return jwtUtil.generateToken(user.getEmail());
            }
            else {
                return "Incorrect password!";
            }
        }
        else {
            return "Incorrect email!";
        }
    }
}
