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

    @PutMapping("/createuser/{id}/{nickname}/{name}/{lastname}/{email}/{password}")
    public void createUser(@PathVariable("id") int id,
                           @PathVariable("nickname") String nickname,
                           @PathVariable("name") String name,
                           @PathVariable("lastname") String surname,
                           @PathVariable("email") String email,
                           @PathVariable("password") String password)
    {
        List<Integer> emptyArray = new ArrayList<>();
        User user = new User(id, nickname, name, surname, email, password, emptyArray);
        userService.saveUser(user);
    }

    @DeleteMapping("/deleteuser/{id}")
    public void deleteUser(@PathVariable("id") int id)
    {
        userService.deleteUser(id);
    }

    @GetMapping("/getusers")
    public List<User> getUsers(){
        return userService.getUsers();
    }
}
