package edu.project.howudoin.controller;


import edu.project.howudoin.model.User;
import edu.project.howudoin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserController {


    @Autowired
    private UserService userService;

    @PutMapping("/createuser/{id}/{name}/{lastname}/{email}/{password}")
    public void createStudent(@PathVariable("id") int id,
                                @PathVariable("name")String name,
                                @PathVariable("lastname")String surname,
                                @PathVariable("email")String email,
                                @PathVariable("password")String password)
        {
        User user = new User(id, name, surname, email, password);
        userService.saveUser(user);
        }

    @GetMapping("/listusers")
    public List<User> getUsers(){
        return userService.getUsers();
    }


}
