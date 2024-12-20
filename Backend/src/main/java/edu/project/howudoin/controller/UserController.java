package edu.project.howudoin.controller;

import edu.project.howudoin.model.User;
import edu.project.howudoin.repository.UserRepository;
import edu.project.howudoin.security.JwtUtil;
import edu.project.howudoin.service.UserService;
import edu.project.howudoin.utils.APIResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Optional;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // POST /register: Register a new user
    @PostMapping("/register")
    public ResponseEntity<APIResponse<String>> register(@RequestBody User user) {
        int id = userService.generateUserId();
        user.setId(id);
        user.setFriends(new ArrayList<>());
        user.setMessages(new ArrayList<>());

        String email = user.getEmail();
        String nickname = user.getNickname();
        boolean emailExists = userRepository.existsByEmail(email);
        boolean nicknameExists = userRepository.existsByNickname(nickname);

        if (emailExists && nicknameExists) {
            return ResponseEntity.ok(new APIResponse<>(0, "Both email and nickname are already registered.", null));
        } else if (emailExists) {
            return ResponseEntity.ok(new APIResponse<>(0, "Email already registered.", null));
        } else if (nicknameExists) {
            return ResponseEntity.ok(new APIResponse<>(0, "Nickname already registered.", null));
        } else {
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new APIResponse<>(1, "User is registered successfully.", null));
        }
    }

    // POST /login: Authenticate and login a user
    @PostMapping("/login")
    public ResponseEntity<APIResponse<String>> login(@RequestBody User userBody) {
        String email = userBody.getEmail();
        String nickname = userBody.getNickname();
        String password = userBody.getPassword();

        if (!userRepository.existsByEmail(email)) {
            return ResponseEntity.ok(new APIResponse<>(0, "Incorrect email!", null));
        }
        else if (!userRepository.existsByNickname(nickname)) {
            return ResponseEntity.ok(new APIResponse<>(0, "Incorrect nickname!", null));
        }

        Optional<User> optionalUser1 = userRepository.findByEmail(email);
        Optional<User> optionalUser2 = userRepository.findByNickname(nickname);
        if (optionalUser1.equals(optionalUser2)) {
            if (optionalUser1.isPresent()) {
                User user = optionalUser1.get();
                if (user.getPassword().equals(password)) {
                    String token = jwtUtil.generateToken(user.getEmail());
                    return ResponseEntity.ok(new APIResponse<>(1, "Successfully logged in!", token));
                } else {
                    return ResponseEntity.ok(new APIResponse<>(0, "Incorrect password!", null));
                }
            } else {
                // Should not reach here if existsByEmail is true, but just in case:
                return ResponseEntity.ok(new APIResponse<>(0, "User not found.", null));
            }
        }
        else {
            return ResponseEntity.ok(new APIResponse<>(0, "Email and nickname are not matched.!", null));
        }

    }
}
