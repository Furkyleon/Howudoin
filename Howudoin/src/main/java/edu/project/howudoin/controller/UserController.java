package edu.project.howudoin.controller;

import edu.project.howudoin.model.User;
import edu.project.howudoin.security.JwtUtil;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;


@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public void register(@RequestBody User user) {
        int id = userService.generateUserId();
        user.setId(id);
        user.setFriends(new ArrayList<>());
        user.setMessages(new ArrayList<>());
        userService.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        userService.login(user.getEmail(), user.getPassword());
        return jwtUtil.generateToken(user.getEmail());
    }
}

/*@RestController
public class UserController {
    @Autowired
    private UserService userService;

    // POST /register: Register a new user (with name, last name, email, password)
    @PostMapping("/register")
    public void register(@RequestBody User user) {
        int id = userService.generateUserId();
        user.setId(id);
        user.setFriends(new ArrayList<>());
        user.setMessages(new ArrayList<>());
        userService.register(user);
    }

    // POST /login: Authenticate and login a user (with email and password)
    // JWT is not done.
    @PostMapping("/login")
    public void login(@RequestBody User user)
    {
        userService.login(user.getEmail(), user.getPassword());
    }


    // not mentioned in project file
    @DeleteMapping("/deleteuser/{id}")
    public void deleteUser(@PathVariable("id") int id)
    {
        userService.deleteUser(id);
    }

    // not mentioned in project file
    @GetMapping("/getusers")
    public List<User> getUsers(){
        return userService.getUsers();
    }

    @PostMapping("/register/{nickname}/{name}/{lastname}/{email}/{password}")
    public void register(@PathVariable("nickname") String nickname,
                         @PathVariable("name") String name,
                         @PathVariable("lastname") String lastname,
                         @PathVariable("email") String email,
                         @PathVariable("password") String password)
    {
        int id = userService.generateUserId();
        List<Integer> emptyFriends = new ArrayList<>();
        List<String> emptyMessages = new ArrayList<>();
        User user = new User(id, nickname, name, lastname, email, password, emptyFriends, emptyMessages);
        userService.saveUser(user);
    }

}
*/