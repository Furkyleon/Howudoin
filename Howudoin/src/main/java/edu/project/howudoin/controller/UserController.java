package edu.project.howudoin.controller;

import edu.project.howudoin.model.User;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public void register(@RequestBody User user)
    {
        userService.saveUser(user);
    }

    // it is not complete
    @PostMapping("/login")
    public void login(@RequestParam("email") String email,
                      @RequestParam("password") String password)
    {
        userService.login(email, password);
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
}
